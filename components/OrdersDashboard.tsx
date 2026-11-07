'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type OrderStatus = 'new' | 'confirmed' | 'completed' | 'cancelled'
type StoreOrder = {
  id: string; customer_name: string; customer_phone: string; delivery_method: 'delivery' | 'pickup'; delivery_area: string | null;
  delivery_address: string | null; notes: string | null; items: { name: string; quantity: number; unit_price: number; size?: string | null; color?: string | null }[];
  subtotal: number; delivery_fee: number; payment_method: 'cod' | 'other'; total: number; status: OrderStatus; created_at: string;
}

const statuses: OrderStatus[] = ['new', 'confirmed', 'completed', 'cancelled']
const formatDate = (value: string) => new Date(value).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })
const whatsappLinkNumber = (value: string) => {
  const digits = value.replace(/\D/g, '')
  return digits.startsWith('00') ? digits.slice(2) : digits.startsWith('0') ? `92${digits.slice(1)}` : digits
}

export function OrdersDashboard({ userId, isAdvanced }: { userId: string; isAdvanced: boolean }) {
  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | OrderStatus>('all')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const { data, error: queryError } = await supabase.from('store_orders').select('*').eq('store_owner_id', userId).order('created_at', { ascending: false }).limit(100)
    if (queryError) {
      setError('Orders could not be loaded. Apply the store growth migration and confirm your Supabase policies, then retry.')
      setOrders([])
    } else setOrders((data || []) as StoreOrder[])
    setLoading(false)
  }, [userId])

  useEffect(() => { void load() }, [load])

  const updateStatus = async (order: StoreOrder, status: OrderStatus) => {
    setSavingId(order.id)
    setError('')
    const { data, error: updateError } = await supabase.from('store_orders').update({ status }).eq('id', order.id).eq('store_owner_id', userId).select('id,status').maybeSingle()
    if (updateError || !data) setError('Order status could not be updated. Please retry.')
    else setOrders(current => current.map(item => item.id === order.id ? { ...item, status } : item))
    setSavingId('')
  }

  const visible = filter === 'all' ? orders : orders.filter(order => order.status === filter)
  const newCount = orders.filter(order => order.status === 'new').length
  const money = (value: number) => `Rs. ${Number(value || 0).toLocaleString('en-PK')}`

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-zinc-400">Store operations</p><h2 className="mt-1 text-2xl font-black tracking-tight">Order inbox</h2><p className="mt-1 text-sm text-zinc-500">Order requests are confirmed with customers on WhatsApp.</p></div>
        <button type="button" onClick={() => void load()} disabled={loading} className="h-10 rounded-full border border-zinc-200 bg-white px-4 text-sm font-semibold transition hover:bg-zinc-50 disabled:opacity-50">{loading ? 'Refreshing…' : 'Refresh'}</button>
      </header>
      {!isAdvanced && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">Online order requests are included with Advanced and Premium. Basic customers can continue ordering directly through WhatsApp.</div>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border bg-white p-4"><p className="text-xs text-zinc-500">Total requests</p><strong className="mt-1 block text-2xl">{orders.length}</strong></div>
        <div className="rounded-2xl border bg-white p-4"><p className="text-xs text-zinc-500">New</p><strong className="mt-1 block text-2xl">{newCount}</strong></div>
        <div className="rounded-2xl border bg-white p-4"><p className="text-xs text-zinc-500">Confirmed</p><strong className="mt-1 block text-2xl">{orders.filter(order => order.status === 'confirmed').length}</strong></div>
        <div className="rounded-2xl border bg-white p-4"><p className="text-xs text-zinc-500">Completed</p><strong className="mt-1 block text-2xl">{orders.filter(order => order.status === 'completed').length}</strong></div>
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Filter orders">
        {(['all', ...statuses] as const).map(status => <button type="button" key={status} aria-pressed={filter === status} onClick={() => setFilter(status)} className={`rounded-full border px-4 py-2 text-xs font-bold capitalize transition ${filter === status ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-500'}`}>{status}</button>)}
      </div>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {loading ? <div className="rounded-2xl border bg-white p-10 text-center text-sm text-zinc-500">Loading order requests…</div> : visible.length ? <div className="space-y-3">
        {visible.map(order => <article key={order.id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><div className="font-bold">{order.customer_name}</div><a href={`https://wa.me/${whatsappLinkNumber(order.customer_phone)}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm text-emerald-700 underline">{order.customer_phone} · WhatsApp</a><p className="mt-1 text-xs text-zinc-400">#{order.id.slice(0, 8).toUpperCase()} · {formatDate(order.created_at)}</p></div>
            <select aria-label={`Update order ${order.id} status`} disabled={!isAdvanced || savingId === order.id} value={order.status} onChange={event => void updateStatus(order, event.target.value as OrderStatus)} className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold capitalize disabled:opacity-60">{statuses.map(status => <option key={status} value={status}>{status}</option>)}</select>
          </div>
          <div className="mt-4 divide-y divide-zinc-100 rounded-xl bg-zinc-50 px-3">
            {order.items.map((item, index) => <div key={`${order.id}-${index}`} className="flex justify-between gap-3 py-2.5 text-sm"><span>{item.name}{item.size ? ` · ${item.size}` : ''}{item.color ? ` · ${item.color}` : ''} × {item.quantity}</span><strong className="shrink-0">{money(item.unit_price * item.quantity)}</strong></div>)}
          </div>
          <div className="mt-3 grid gap-2 text-xs text-zinc-600 sm:grid-cols-2"><p><b>{order.delivery_method === 'delivery' ? 'Delivery' : 'Pickup'}:</b> {[order.delivery_area, order.delivery_address].filter(Boolean).join(' · ') || 'No address provided'}</p><p><b>Payment:</b> {order.payment_method === 'cod' ? 'Cash on delivery' : 'Confirm with seller'}</p>{order.notes && <p><b>Notes:</b> {order.notes}</p>}</div>
          <div className="mt-4 flex justify-end border-t border-zinc-100 pt-3 text-sm"><span className="mr-auto text-zinc-500">Subtotal {money(order.subtotal)}{order.delivery_fee ? ` · Delivery ${money(order.delivery_fee)}` : ''}</span><strong>Total {money(order.total)}</strong></div>
        </article>)}
      </div> : <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center"><h3 className="font-bold">{filter === 'all' ? 'No order requests yet' : `No ${filter} orders`}</h3><p className="mt-2 text-sm text-zinc-500">Share your store link to start receiving order requests.</p></div>}
    </section>
  )
}
