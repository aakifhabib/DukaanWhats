import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, clientRateLimitKey, requestBodyTooLarge, textBodyTooLarge } from '@/lib/requestSecurity'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
const MAX_BODY_BYTES = 8_192
const RATE_LIMIT = 120
const RATE_WINDOW_MS = 60_000
const ALLOWED_EVENTS = new Set(['store_view', 'product_view', 'add_to_cart', 'whatsapp_click'])

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(clientRateLimitKey(request, 'analytics'), RATE_LIMIT, RATE_WINDOW_MS)
  if (rateLimit.limited) {
    return NextResponse.json({ error: 'Too many analytics events. Please try again later.' }, {
      status: 429,
      headers: { 'Cache-Control': 'no-store', 'Retry-After': String(rateLimit.retryAfter) },
    })
  }
  if (requestBodyTooLarge(request, MAX_BODY_BYTES)) {
    return NextResponse.json({ error: 'Analytics event is too large.' }, { status: 413, headers: { 'Cache-Control': 'no-store' } })
  }

  try {
    const rawBody = await request.text()
    if (textBodyTooLarge(rawBody, MAX_BODY_BYTES)) {
      return NextResponse.json({ error: 'Analytics event is too large.' }, { status: 413, headers: { 'Cache-Control': 'no-store' } })
    }
    let body: any = null
    try { body = JSON.parse(rawBody || 'null') } catch {
      return NextResponse.json({ error: 'Invalid analytics event.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
    }
    const storeSlug = typeof body?.store_slug === 'string' ? body.store_slug.trim() : ''
    const eventType = typeof body?.event_type === 'string' ? body.event_type : ''
    const productId = typeof body?.product_id === 'string' ? body.product_id : null
    const needsProduct = ['product_view', 'add_to_cart', 'whatsapp_click'].includes(eventType)
    if (!/^[a-z0-9-]{1,63}$/i.test(storeSlug) || !ALLOWED_EVENTS.has(eventType) || (needsProduct && !productId) || (productId && productId.length > 64)) {
      return NextResponse.json({ error: 'Invalid store or analytics event.' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) return NextResponse.json({ error: 'Analytics is not configured.' }, { status: 503 })
    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })

    // Never trust a client-supplied owner ID: resolve the store owner on the server.
    const { data: profile, error: profileError } = await admin.from('profiles').select('id').eq('store_slug', storeSlug).maybeSingle()
    if (profileError) throw profileError
    if (!profile) return NextResponse.json({ error: 'Store not found.' }, { status: 404 })

    let validatedProductId: string | null = null
    if (productId) {
      const { data: product, error: productError } = await admin.from('products').select('id').eq('id', productId).eq('user_id', profile.id).maybeSingle()
      if (productError) throw productError
      if (!product) return NextResponse.json({ error: 'Product does not belong to this store.' }, { status: 400 })
      validatedProductId = product.id
    }

    const forwardedIp = request.headers.get('x-forwarded-for')?.split(',').map(value => value.trim()).filter(Boolean).at(-1)
    const ip = forwardedIp || request.headers.get('x-real-ip')?.trim() || null
    const userAgent = request.headers.get('user-agent')?.slice(0, 512) || null
    const rawReferrer = request.headers.get('referer')
    let referrer: string | null = null
    if (rawReferrer) {
      try {
        const parsed = new URL(rawReferrer)
        if (parsed.protocol === 'https:' || parsed.protocol === 'http:') referrer = `${parsed.origin}${parsed.pathname}`.slice(0, 2048)
      } catch { /* Ignore malformed referrer values and never retain query parameters. */ }
    }
    const { error: insertError } = await admin.from('store_analytics').insert({
      store_slug: storeSlug,
      event_type: eventType,
      product_id: validatedProductId,
      store_owner_id: profile.id,
      visitor_ip: ip,
      user_agent: userAgent,
      referrer,
    })
    if (insertError) throw insertError
    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error: any) {
    console.error('Analytics event insert failed:', error)
    return NextResponse.json({ error: 'Analytics event could not be recorded.' }, { status: 500 })
  }
}
