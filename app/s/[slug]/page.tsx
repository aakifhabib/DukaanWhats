'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Product = { id: string; name: string; price: number; image_url: string }

export default function StorePage({ params }: { params: { slug: string } }) {
  const rawSlug = params.slug
  const slug = decodeURIComponent(rawSlug).toLowerCase().trim()
  const [profile, setProfile] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<Product[]>([])
  const [showCart, setShowCart] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')

  useEffect(() => {
    const load = async () => {
      let { data: prof } = await supabase.from('profiles').select('*').eq('store_slug', slug).single()
      if (!prof) {
        const alt = slug.replace(/\s+/g, '-')
        const { data } = await supabase.from('profiles').select('*').eq('store_slug', alt).single()
        prof = data
      }
      if (!prof) {
        const { data } = await supabase.from('profiles').select('*').ilike('store_slug', slug).single()
        prof = data
      }
      if (prof) {
        setProfile(prof)
        const { data: prods } = await supabase.from('products').select('*').eq('user_id', prof.id)
        if (prods) setProducts(prods)
      }
      setLoading(false)
    }
    load()
  }, [slug])

  const addToCart = (p: Product) => setCart([...cart, p])

  const orderWhatsApp = () => {
    if (!profile || cart.length === 0) return
    const total = cart.reduce((s, p) => s + p.price, 0)
    const items = cart.map(p => `- ${p.name} - Rs. ${p.price}`).join('\n')
    const msg = `Assalam-o-Alaikum! New Order from ${profile.business_name}\n\n${items}\n\nTotal: Rs. ${total}\n\nName: ${customerName}\nAddress: ${customerAddress}`
    const waNumber = profile.whatsapp_number.replace(/[^0-9]/g, '')
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`
    window.location.href = url
  }

  if (loading) return <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center">Loading...</div>

  if (!profile) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8 text-center">
      <div>
        <div className="text-lg font-medium">Store not found: {slug}</div>
        <div className="text-sm text-zinc-500 mt-2">In dashboard, save slug as premium-store (no spaces)</div>
        <a href="/dashboard" className="mt-4 inline-block h-10 px-5 rounded-lg bg-black text-white text-sm leading-10">Go to Dashboard</a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8F7F5]">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-semibold">{profile.business_name}</div>
          <button onClick={() => setShowCart(true)} className="h-10 px-5 rounded-lg bg-black text-white text-sm relative">Cart ({cart.length})</button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border p-6 mb-6">
          <h1 className="text-2xl font-bold">{profile.business_name}</h1>
          <p className="text-sm text-zinc-500 mt-1">Order directly on WhatsApp</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border p-3">
              <img src={p.image_url} className="w-full h-40 object-cover rounded-xl" />
              <div className="mt-3 font-medium text-sm">{p.name}</div>
              <div className="font-bold text-sm mt-1">Rs. {p.price}</div>
              <button onClick={() => addToCart(p)} className="mt-3 w-full h-10 rounded-lg bg-black text-white text-sm font-medium">Add to Cart</button>
            </div>
          ))}
        </div>
      </main>
      {showCart && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-sm h-full flex flex-col">
            <div className="p-6 border-b flex items-center justify-between"><h3 className="font-semibold">Cart ({cart.length})</h3><button onClick={() => setShowCart(false)} className="w-8 h-8 rounded-lg border">X</button></div>
            <div className="flex-1 overflow-auto p-6 space-y-3">
              {cart.map((p, i) => <div key={i} className="flex justify-between bg-zinc-50 rounded-xl p-3"><span className="text-sm">{p.name}</span><span className="text-sm font-bold">Rs. {p.price}</span></div>)}
              {cart.length === 0 && <div className="text-sm text-zinc-500">Cart empty</div>}
            </div>
            <div className="p-6 border-t space-y-3">
              <input placeholder="Your name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full h-11 px-4 rounded-xl border" />
              <input placeholder="Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full h-11 px-4 rounded-xl border" />
              <div className="font-bold">Total: Rs. {cart.reduce((s, p) => s + p.price, 0)}</div>
              <button onClick={orderWhatsApp} className="w-full h-11 rounded-xl bg-[#25D366] text-white font-medium">Order on WhatsApp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
