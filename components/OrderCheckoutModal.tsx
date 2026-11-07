'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useStoreLocale } from '@/lib/storeLocale'

type CartProduct = { id: string; name: string; price: number; selectedSize?: string; selectedColor?: string }

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

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="order-checkout-title" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose() }}>
      <section className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-white text-zinc-950 shadow-2xl">
        <header className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 sm:px-6">
          <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-zinc-400">{profile.business_name}</p><h2 id="order-checkout-title" className="mt-1 text-xl font-black">{order ? t('orderSaved') : t('placeOrder')}</h2></div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full border border-zinc-200 text-xl transition hover:bg-zinc-50">×</button>
        </header>

        {order ? <div className="p-6">
          <div className="rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">{t('orderNext')} <span className="font-mono font-bold">#{String(order.id).slice(0, 8).toUpperCase()}</span></div>
          <p className="mt-4 text-sm text-zinc-600">{t('total')}: <strong>Rs. {Number(order.total).toLocaleString('en-PK')}</strong></p>
          <button type="button" onClick={openWhatsApp} disabled={!whatsapp} className="mt-5 h-12 w-full rounded-xl bg-[#111] px-5 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:opacity-50">{whatsapp ? t('openWhatsApp') : t('whatsappUnavailable')}</button>
          <button type="button" onClick={onClose} className="mt-3 h-11 w-full rounded-xl border border-zinc-200 text-sm font-semibold">Close</button>
        </div> : <form onSubmit={submit} className="max-h-[75dvh] space-y-4 overflow-y-auto p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-2">
            {canDeliver && <button type="button" onClick={() => setMethod('delivery')} aria-pressed={method === 'delivery'} className={`rounded-xl border px-3 py-3 text-sm font-bold ${method === 'delivery' ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200'}`}>{t('delivery')}</button>}
            {canPickup && <button type="button" onClick={() => setMethod('pickup')} aria-pressed={method === 'pickup'} className={`rounded-xl border px-3 py-3 text-sm font-bold ${method === 'pickup' ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200'}`}>{t('pickup')}</button>}
          </div>
          <label className="block text-xs font-semibold text-zinc-600">{t('customerName')}<input required maxLength={100} value={name} onChange={event => setName(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-500" /></label>
          <label className="block text-xs font-semibold text-zinc-600">{t('phone')}<input required inputMode="tel" maxLength={20} value={phone} onChange={event => setPhone(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-500" /></label>
          <fieldset><legend className="text-xs font-semibold text-zinc-600">Payment</legend><div className="mt-1.5 grid grid-cols-2 gap-2">
            {profile.cod_enabled !== false && <button type="button" onClick={() => setPaymentMethod('cod')} aria-pressed={paymentMethod === 'cod'} className={`rounded-xl border px-3 py-3 text-sm font-bold ${paymentMethod === 'cod' ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200'}`}>Cash on delivery</button>}
            <button type="button" onClick={() => setPaymentMethod('other')} aria-pressed={paymentMethod === 'other'} className={`rounded-xl border px-3 py-3 text-sm font-bold ${paymentMethod === 'other' ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200'}`}>Confirm with seller</button>
          </div>{paymentMethod === 'cod' && profile.cod_details && <p className="mt-2 text-xs leading-5 text-zinc-500">{profile.cod_details}</p>}</fieldset>
          {method === 'delivery' && <>
            <label className="block text-xs font-semibold text-zinc-600">{t('deliveryArea')}{deliveryAreas.length ? <select required value={area} onChange={event => setArea(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">{deliveryAreas.map((option: string) => <option key={option}>{option}</option>)}</select> : <input required maxLength={80} value={area} onChange={event => setArea(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm" />}</label>
            <label className="block text-xs font-semibold text-zinc-600">{t('address')}<textarea required minLength={5} maxLength={300} value={address} onChange={event => setAddress(event.target.value)} className="mt-1.5 min-h-20 w-full rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-zinc-500" /></label>
          </>}
          <label className="block text-xs font-semibold text-zinc-600">{t('notes')}<textarea maxLength={500} value={notes} onChange={event => setNotes(event.target.value)} className="mt-1.5 min-h-16 w-full rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-zinc-500" /></label>
          <div className="rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600">{items.length} product line(s) · {t('deliveryFee')}: Rs. {method === 'delivery' ? Number(profile.delivery_fee || 0).toLocaleString('en-PK') : '0'}. Final details are confirmed with the seller on WhatsApp.</div>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          {!whatsapp && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">This store has not added a WhatsApp number, so the order cannot be sent for confirmation.</p>}
          <button type="submit" disabled={busy || !items.length || !whatsapp} className="h-12 w-full rounded-xl bg-[#111] px-5 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-60">{busy ? t('submitting') : t('placeOrder')}</button>
        </form>}
      </section>
    </div>
  )
}
