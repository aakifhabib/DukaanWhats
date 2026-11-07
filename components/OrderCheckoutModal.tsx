'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useStoreLocale } from '@/lib/storeLocale'
import { getTheme } from '@/lib/storeThemes'

type CartProduct = { id: string; name: string; price: number; selectedSize?: string; selectedColor?: string }

const isHexColor = (value: unknown): value is string => typeof value === 'string' && /^#[\da-f]{6}$/i.test(value)
const readableText = (hex: string) => {
  const values = hex.slice(1).match(/.{2}/g)?.map(value => parseInt(value, 16) / 255) || [0, 0, 0]
  const linear = values.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2] > 0.45 ? '#111111' : '#ffffff'
}

export function OrderCheckoutModal({ profile, cart, onClose, onSuccess, track }: {
  profile: any
  cart: CartProduct[]
  onClose: () => void
  onSuccess: () => void
  track?: (eventType: string, productId?: string) => Promise<void>
}) {
  const { language, t } = useStoreLocale()
  const deliveryAreas = Array.isArray(profile.delivery_areas) ? profile.delivery_areas as string[] : []
  const canDeliver = Boolean(profile.delivery_enabled)
  const canPickup = profile.pickup_enabled !== false
  const [method, setMethod] = useState<'delivery' | 'pickup'>(canDeliver ? 'delivery' : 'pickup')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'other'>(profile.cod_enabled === false ? 'other' : 'cod')
  const [area, setArea] = useState(deliveryAreas[0] || '')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<any>(null)

  const items = useMemo(() => {
    const grouped = new Map<string, { product_id: string; quantity: number; size: string; color: string }>()
    cart.forEach(product => {
      const size = product.selectedSize || ''
      const color = product.selectedColor || ''
      const key = `${product.id}|${size}|${color}`
      const previous = grouped.get(key)
      grouped.set(key, { product_id: product.id, quantity: (previous?.quantity || 0) + 1, size, color })
    })
    return [...grouped.values()]
  }, [cart])

  const subtotal = cart.reduce((sum, product) => sum + (Number(product.price) || 0), 0)
  const deliveryFee = method === 'delivery' ? Math.max(0, Number(profile.delivery_fee) || 0) : 0
  const total = subtotal + deliveryFee
  const theme = getTheme(profile.store_theme || 'clothing-noor')
  const customTheme = profile.premium_custom?.themes?.[profile.store_theme] || profile.premium_custom || {}
  const accent = isHexColor(customTheme.accent) ? customTheme.accent : theme.colors.accent
  const accentText = readableText(accent)
  const isDark = readableText(theme.colors.bg) === '#ffffff'
  const panel = theme.colors.card
  const pageText = theme.colors.text
  const border = theme.colors.border
  const muted = isDark ? 'rgba(255,255,255,.64)' : 'rgba(20,20,20,.58)'
  const fieldBg = isDark ? '#191919' : '#ffffff'
  const fieldStyle = { backgroundColor: fieldBg, color: pageText, borderColor: border }
  const labelStyle = { color: muted }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const { data, error: rpcError } = await supabase.rpc('create_store_order', {
        p_store_slug: profile.store_slug,
        p_customer_name: name.trim(),
        p_customer_phone: phone.trim(),
        p_delivery_method: method,
        p_delivery_area: method === 'delivery' ? area.trim() : null,
        p_delivery_address: method === 'delivery' ? address.trim() : null,
        p_notes: notes.trim() || null,
        p_items: items,
        p_language: language,
        p_payment_method: paymentMethod,
      })
      if (rpcError) throw rpcError
      if (!data?.id) throw new Error('The order request could not be confirmed. Please try again.')
      setOrder(data)
      onSuccess()
    } catch (reason: any) {
      setError(reason?.message || 'Could not send your order. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const rawWhatsApp = String(profile.whatsapp_number || '').replace(/\D/g, '')
  const whatsapp = rawWhatsApp.startsWith('00') ? rawWhatsApp.slice(2) : rawWhatsApp.startsWith('0') ? `92${rawWhatsApp.slice(1)}` : rawWhatsApp
  const openWhatsApp = async () => {
    if (!order || !whatsapp) return
    const orderLines = (order.items || []).map((item: any) => `• ${item.name}${item.size ? ` · ${item.size}` : ''}${item.color ? ` · ${item.color}` : ''} × ${item.quantity} — Rs. ${Number(item.unit_price * item.quantity).toLocaleString('en-PK')}`)
    const fulfillment = order.delivery_method === 'pickup' ? 'Pickup' : `Delivery${order.delivery_area ? ` to ${order.delivery_area}` : ''}${order.delivery_address ? ` at ${order.delivery_address}` : ''}`
    const payment = order.payment_method === 'cod' ? `Cash on delivery — ${profile.cod_details || ''}` : 'Payment method to be confirmed on WhatsApp'
    const message = `Hi ${profile.business_name || 'there'}! I submitted order ${String(order.id).slice(0, 8).toUpperCase()}.\n\n${orderLines.join('\n')}\n\n${fulfillment}\n${payment}\n${order.notes ? `Notes: ${order.notes}\n` : ''}${t('total')}: Rs. ${Number(order.total).toLocaleString('en-PK')}`
    await Promise.all(cart.map(item => track ? track('whatsapp_click', item.id).catch(() => {}) : Promise.resolve()))
    window.location.assign(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`)
  }

  const money = (value: number) => `Rs. ${Number(value || 0).toLocaleString('en-PK')}`
  const activeChoice = { backgroundColor: accent, color: accentText, borderColor: accent }
  const inactiveChoice = { backgroundColor: panel, color: pageText, borderColor: border }

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center overflow-y-auto bg-black/60 p-2 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true" aria-labelledby="order-checkout-title" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose() }}>
      <section className="relative flex max-h-[calc(100dvh-1rem)] w-full max-w-xl flex-col overflow-hidden rounded-[28px] border shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-[32px]" style={{ backgroundColor: panel, color: pageText, borderColor: border }}>
        <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: accent }} />
        <header className="flex shrink-0 items-center justify-between gap-4 border-b px-5 py-4 sm:px-7 sm:py-5" style={{ borderColor: border }}>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold uppercase tracking-[.2em]" style={{ color: accent }}>{profile.business_name}</p>
            <h2 id="order-checkout-title" className="mt-1 text-xl font-black tracking-tight sm:text-2xl">{order ? t('orderSaved') : t('placeOrder')}</h2>
            {!order && <p className="mt-1 text-xs" style={{ color: muted }}>Review your items and delivery details</p>}
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close checkout" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border text-xl transition hover:opacity-75 disabled:opacity-40" style={{ borderColor: border, color: pageText }}>×</button>
        </header>

        {order ? <div className="overflow-y-auto p-5 sm:p-7">
          <div className="rounded-2xl p-4 text-sm leading-6" style={{ backgroundColor: `${accent}22`, color: pageText }}>
            <span className="font-semibold">{t('orderNext')}</span> <span className="font-mono font-bold">#{String(order.id).slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: border }}><span className="text-sm" style={{ color: muted }}>{t('total')}</span><strong className="text-lg">{money(Number(order.total))}</strong></div>
          <button type="button" onClick={openWhatsApp} disabled={!whatsapp} className="mt-5 h-12 w-full rounded-2xl px-5 text-sm font-bold transition hover:brightness-95 disabled:opacity-50" style={{ backgroundColor: accent, color: accentText }}>{whatsapp ? t('openWhatsApp') : t('whatsappUnavailable')}</button>
          <button type="button" onClick={onClose} className="mt-3 h-11 w-full rounded-2xl border text-sm font-semibold" style={{ borderColor: border, color: pageText }}>Close</button>
        </div> : <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:space-y-5 sm:px-7 sm:py-5">
            {canDeliver && canPickup ? <fieldset>
              <legend className="mb-2 text-xs font-bold uppercase tracking-wide" style={labelStyle}>How would you like to receive your order?</legend>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setMethod('delivery')} aria-pressed={method === 'delivery'} className="rounded-2xl border px-3 py-3 text-sm font-bold transition" style={method === 'delivery' ? activeChoice : inactiveChoice}>{t('delivery')}<span className="mt-1 block text-[11px] font-medium opacity-75">{money(Number(profile.delivery_fee) || 0)} fee</span></button>
                <button type="button" onClick={() => setMethod('pickup')} aria-pressed={method === 'pickup'} className="rounded-2xl border px-3 py-3 text-sm font-bold transition" style={method === 'pickup' ? activeChoice : inactiveChoice}>{t('pickup')}<span className="mt-1 block text-[11px] font-medium opacity-75">No delivery fee</span></button>
              </div>
            </fieldset> : <div className="flex items-start gap-3 rounded-2xl border p-3.5 text-sm" style={{ borderColor: border, backgroundColor: fieldBg }}>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-lg" style={{ backgroundColor: accent, color: accentText }}>⌖</span>
              <span><strong className="block">Pickup only</strong><span className="mt-1 block text-xs leading-5" style={{ color: muted }}>This store hasn’t enabled delivery, so a delivery address isn’t needed. The seller can turn on delivery in Store settings.</span></span>
            </div>}

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-semibold" style={labelStyle}>{t('customerName')}<input name="name" autoComplete="name" required maxLength={100} value={name} onChange={event => setName(event.target.value)} className="mt-1.5 h-12 w-full rounded-xl border px-3.5 text-sm outline-none transition focus:ring-2" style={fieldStyle} /></label>
              <label className="block text-xs font-semibold" style={labelStyle}>{t('phone')}<input name="tel" autoComplete="tel" required inputMode="tel" maxLength={20} value={phone} onChange={event => setPhone(event.target.value)} className="mt-1.5 h-12 w-full rounded-xl border px-3.5 text-sm outline-none transition focus:ring-2" style={fieldStyle} /></label>
            </div>

            {method === 'delivery' && <div className="space-y-3 rounded-2xl border p-4" style={{ borderColor: border, backgroundColor: fieldBg }}>
              <div><h3 className="text-sm font-bold">Delivery address</h3><p className="mt-1 text-xs leading-5" style={{ color: muted }}>Your address is only requested for delivery.</p></div>
              <label className="block text-xs font-semibold" style={labelStyle}>{t('deliveryArea')}{deliveryAreas.length ? <select required value={area} onChange={event => setArea(event.target.value)} className="mt-1.5 h-12 w-full rounded-xl border px-3.5 text-sm outline-none" style={fieldStyle}><option value="" disabled>Choose your area</option>{deliveryAreas.map((option: string) => <option key={option} value={option}>{option}</option>)}</select> : <input required maxLength={80} autoComplete="address-level2" placeholder="e.g. Islamabad" value={area} onChange={event => setArea(event.target.value)} className="mt-1.5 h-12 w-full rounded-xl border px-3.5 text-sm outline-none" style={fieldStyle} />}</label>
              <label className="block text-xs font-semibold" style={labelStyle}>{t('address')}<textarea name="street-address" autoComplete="street-address" required minLength={5} maxLength={300} rows={3} placeholder="House or flat number, street, sector, and nearby landmark" value={address} onChange={event => setAddress(event.target.value)} className="mt-1.5 min-h-24 w-full resize-y rounded-xl border px-3.5 py-3 text-sm outline-none transition focus:ring-2" style={fieldStyle} /></label>
            </div>}

            <fieldset>
              <legend className="text-xs font-bold uppercase tracking-wide" style={labelStyle}>Payment</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {profile.cod_enabled !== false && <button type="button" onClick={() => setPaymentMethod('cod')} aria-pressed={paymentMethod === 'cod'} className="min-h-12 rounded-2xl border px-3 py-2 text-sm font-bold transition" style={paymentMethod === 'cod' ? activeChoice : inactiveChoice}>Cash on delivery</button>}
                <button type="button" onClick={() => setPaymentMethod('other')} aria-pressed={paymentMethod === 'other'} className="min-h-12 rounded-2xl border px-3 py-2 text-sm font-bold transition" style={paymentMethod === 'other' ? activeChoice : inactiveChoice}>Confirm with seller</button>
              </div>
              {paymentMethod === 'cod' && profile.cod_details && <p className="mt-2 text-xs leading-5" style={{ color: muted }}>{profile.cod_details}</p>}
            </fieldset>

            <label className="block text-xs font-semibold" style={labelStyle}>{t('notes')}<textarea maxLength={500} rows={2} value={notes} onChange={event => setNotes(event.target.value)} placeholder="Anything else the seller should know?" className="mt-1.5 min-h-16 w-full resize-y rounded-xl border px-3.5 py-3 text-sm outline-none" style={fieldStyle} /></label>

            <section aria-label="Order summary" className="rounded-2xl border p-4" style={{ borderColor: border, backgroundColor: fieldBg }}>
              <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold">Order summary</h3><span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ backgroundColor: `${accent}28`, color: pageText }}>{items.length} line{items.length === 1 ? '' : 's'}</span></div>
              <ul className="space-y-2.5">
                {items.map(item => {
                  const product = cart.find(entry => entry.id === item.product_id)
                  const lineTotal = (Number(product?.price) || 0) * item.quantity
                  return <li key={`${item.product_id}|${item.size}|${item.color}`} className="flex items-start justify-between gap-4 text-xs">
                    <span className="min-w-0"><strong className="block truncate">{product?.name || 'Product'} × {item.quantity}</strong><span className="mt-0.5 block" style={{ color: muted }}>{[item.size, item.color].filter(Boolean).join(' · ')}</span></span><span className="shrink-0 font-semibold">{money(lineTotal)}</span>
                  </li>
                })}
              </ul>
              <div className="mt-3 space-y-1.5 border-t pt-3 text-xs" style={{ borderColor: border }}>
                <div className="flex justify-between"><span style={{ color: muted }}>Subtotal</span><span>{money(subtotal)}</span></div>
                <div className="flex justify-between"><span style={{ color: muted }}>{t('deliveryFee')}</span><span>{money(deliveryFee)}</span></div>
                <div className="flex justify-between pt-1 text-sm font-bold"><span>Total</span><span>{money(total)}</span></div>
              </div>
            </section>

            {error && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            {!whatsapp && <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">This store has not added a WhatsApp number, so the order cannot be sent for confirmation.</p>}
          </div>
          <footer className="shrink-0 border-t px-5 py-3.5 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] sm:px-7" style={{ borderColor: border, backgroundColor: panel }}>
            <div className="mb-2 flex items-center justify-between text-xs"><span style={{ color: muted }}>Total</span><strong className="text-base">{money(total)}</strong></div>
            <button type="submit" disabled={busy || !items.length || !whatsapp} className="h-12 w-full rounded-2xl px-5 text-sm font-bold transition hover:brightness-95 disabled:cursor-wait disabled:opacity-60" style={{ backgroundColor: accent, color: accentText }}>{busy ? t('submitting') : t('placeOrder')}</button>
          </footer>
        </form>}
      </section>
    </div>
  )
}
