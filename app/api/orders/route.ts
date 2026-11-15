import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, clientRateLimitKey, requestBodyTooLarge, textBodyTooLarge } from '@/lib/requestSecurity'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MAX_BODY_BYTES = 16_384
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 5 * 60 * 1000

const json = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) => NextResponse.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store', ...extraHeaders },
})

export async function POST(request: Request) {
  if (requestBodyTooLarge(request, MAX_BODY_BYTES)) return json({ error: 'Order details are too large.' }, 413)

  const rateLimit = checkRateLimit(clientRateLimitKey(request, 'orders'), RATE_LIMIT, RATE_WINDOW_MS)
  if (rateLimit.limited) {
    return json({ error: 'Too many order attempts. Please wait a few minutes and try again.' }, 429, {
      'Retry-After': String(rateLimit.retryAfter),
    })
  }

  // Browser-originated checkout must be same-origin. Missing Origin remains
  // allowed for non-browser clients; the database function still validates all order data.
  const origin = request.headers.get('origin')
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) return json({ error: 'Order request origin is not allowed.' }, 403)
    } catch { return json({ error: 'Order request origin is not allowed.' }, 403) }
  }
  if (request.headers.get('sec-fetch-site') === 'cross-site') return json({ error: 'Order request origin is not allowed.' }, 403)

  try {
    const rawBody = await request.text()
    if (textBodyTooLarge(rawBody, MAX_BODY_BYTES)) return json({ error: 'Order details are too large.' }, 413)
    let body: any
    try { body = JSON.parse(rawBody || 'null') } catch { return json({ error: 'Invalid order details.' }, 400) }

    const slug = typeof body?.storeSlug === 'string' ? body.storeSlug.trim() : ''
    const customerName = typeof body?.customerName === 'string' ? body.customerName.trim() : ''
    const customerPhone = typeof body?.customerPhone === 'string' ? body.customerPhone.trim() : ''
    const deliveryMethod = body?.deliveryMethod
    const deliveryArea = typeof body?.deliveryArea === 'string' ? body.deliveryArea.trim() : null
    const deliveryAddress = typeof body?.deliveryAddress === 'string' ? body.deliveryAddress.trim() : null
    const notes = typeof body?.notes === 'string' ? body.notes : null
    const items = body?.items
    const language = body?.language
    const paymentMethod = body?.paymentMethod

    if (!/^[a-z0-9-]{3,63}$/.test(slug)
      || customerName.length < 1 || customerName.length > 100
      || customerPhone.length < 7 || customerPhone.length > 20
      || !['delivery', 'pickup'].includes(deliveryMethod)
      || !Array.isArray(items) || items.length < 1 || items.length > 20
      || !['en', 'ur'].includes(language)
      || !['cod', 'other'].includes(paymentMethod)
      || (deliveryArea !== null && deliveryArea.length > 80)
      || (deliveryAddress !== null && deliveryAddress.length > 300)
      || (notes !== null && notes.length > 500)) {
      return json({ error: 'Check the order details and try again.' }, 400)
    }
    for (const item of items) {
      if (!item || typeof item.product_id !== 'string' || item.product_id.length > 64
        || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99
        || (item.size != null && (typeof item.size !== 'string' || item.size.length > 80))
        || (item.color != null && (typeof item.color !== 'string' || item.color.length > 80))) {
        return json({ error: 'One or more items in your cart are invalid.' }, 400)
      }
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) return json({ error: 'Checkout is temporarily unavailable.' }, 503)
    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
    const { data, error } = await admin.rpc('create_store_order', {
      p_store_slug: slug,
      p_customer_name: customerName,
      p_customer_phone: customerPhone,
      p_delivery_method: deliveryMethod,
      p_delivery_area: deliveryArea,
      p_delivery_address: deliveryAddress,
      p_notes: notes,
      p_items: items,
      p_language: language,
      p_payment_method: paymentMethod,
    })
    if (error) {
      if (['22023', 'P0002', '42501'].includes(error.code || '')) {
        return json({ error: error.message || 'This order cannot be submitted.' }, 400)
      }
      console.error('Order creation failed:', error.code || 'unknown')
      return json({ error: 'The order could not be submitted. Please try again.' }, 500)
    }
    if (!data || typeof data !== 'object' || !('id' in data)) return json({ error: 'The order could not be confirmed.' }, 500)
    return json({ order: data }, 201)
  } catch {
    return json({ error: 'The order could not be submitted. Please try again.' }, 500)
  }
}
