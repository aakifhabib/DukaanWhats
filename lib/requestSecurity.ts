import { createHash } from 'node:crypto'

const windows = new Map<string, { count: number; resetAt: number }>()
const MAX_BUCKETS = 5000

/**
 * Derive an ephemeral rate-limit key. When available, use the right-most
 * x-forwarded-for entry (normally appended by the hosting proxy), never the
 * attacker-controlled left-most entry. The raw address is hashed and never
 * returned or persisted by this helper.
 */
export function clientRateLimitKey(request: Request, scope: string) {
  const forwarded = request.headers.get('x-forwarded-for')
    ?.split(',')
    .map(value => value.trim())
    .filter(Boolean)
    .at(-1)
  const realIp = request.headers.get('x-real-ip')?.trim()
  const address = (forwarded || realIp || 'unknown').slice(0, 128)
  return createHash('sha256').update(`${scope}:${address}`).digest('hex')
}

/** Best-effort per-instance throttle; durable authorization must remain server-side. */
export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  let bucket = windows.get(key)
  if (!bucket || now >= bucket.resetAt) {
    if (windows.size >= MAX_BUCKETS) {
      for (const [existingKey, value] of windows) {
        if (now >= value.resetAt) windows.delete(existingKey)
      }
      // Fail closed for new keys if a burst filled the bounded in-memory table.
      if (windows.size >= MAX_BUCKETS && !windows.has(key)) {
        return { limited: true, retryAfter: Math.max(1, Math.ceil(windowMs / 1000)) }
      }
    }
    bucket = { count: 0, resetAt: now + windowMs }
    windows.set(key, bucket)
  }
  bucket.count += 1
  return bucket.count > limit
    ? { limited: true, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) }
    : { limited: false, retryAfter: 0 }
}

export function requestBodyTooLarge(request: Request, maxBytes: number) {
  const declaredLength = Number(request.headers.get('content-length') || 0)
  return Number.isFinite(declaredLength) && declaredLength > maxBytes
}

export function textBodyTooLarge(body: string, maxBytes: number) {
  return Buffer.byteLength(body, 'utf8') > maxBytes
}
