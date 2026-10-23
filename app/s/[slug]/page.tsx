'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[] }

function ProductCard({ p, onAdd }: { p: Product, onAdd: (p: Product) => void }) {
  const images = p.image_urls && p.image_urls.length > 0 ? p.image_urls : [p.image_url].filter(Boolean)
  const [idx, setIdx] = useState(0)
  const safeIdx = Math.min(idx, images.length - 1)

  return (
    <div style={{borderRadius:20}} className="bg-white border p-3 flex flex-col">
      <div className="relative">
        <img src={images[safeIdx]} style={{borderRadius:12}} className="w-full h-40 object-cover bg-zinc-50" />
        {images.length > 1 && (
          <>
            <button onClick={() => setIdx((safeIdx - 1 + images.length) % images.length)} style={{borderRadius:999}} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 backdrop-blur border flex items-center justify-center text- shadow">‹</button>
            <button onClick={() => setIdx((safeIdx + 1) % images.length)} style={{borderRadius:999}} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 backdrop-blur border flex items-center justify-center text- shadow">›</button>
            <span style={{borderRadius:999}} className="absolute top-2 left-2 bg-black/70 text-white text- px-2 py-0.5">{safeIdx+1}/{images.length}</span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-1.5 mt-2 overflow-x-auto scrollbar-none pb-1">
          {images.map((u, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{borderRadius:10}} className={`w-11 h-11 overflow-hidden border-2 flex-shrink-0 ${i===safeIdx?'border-black':'border-zinc-200'}`}>
              <img src={u} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="mt-3 font-medium text- truncate">{p.name}</div>
      <div className="font-bold text- mt-1">Rs. {p.price}</div>
      <button onClick={() => onAdd(p)} style={{borderRadius:10}} className="mt-3 w-full h-10 bg-black text-white text- font-medium hover:bg-zinc-800">Add to Cart</button>
    </div>
  )
}

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
    window.location.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`
  }

  if (loading) return <div style={{minHeight:'100vh',background:'#F8F7F5',display:'flex',alignItems:'center',justifyContent:'center'}} className="text-">Loading store...</div>

  if (!profile) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8 text-center">
      <div>
        <div className="text-lg font-medium">Store not found: {slug}</div>
        <div className="text- text-zinc-500 mt-2">In dashboard, save slug as premium-store (no spaces)</div>
        <a href="/dashboard" style={{borderRadius:10}} className="mt-4 inline-flex h-10 px-5 bg-black text-white text- font-medium items-center justify-center">Go to Dashboard</a>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#F8F7F5'}} className="text-zinc-900">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-semibold text-">{profile.business_name}</div>
          <button onClick={() => setShowCart(true)} style={{borderRadius:10}} className="h-10 px-5 bg-black text-white text- font-medium relative">Cart ({cart.length})</button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div style={{borderRadius:20}} className="bg-white border p-6 mb-6">
          <h1 className="text-2xl font-bold tracking-tight">{profile.business_name}</h1>
          <p className="text- text-zinc-500 mt-1">Order directly on WhatsApp • Swipe to see all photos</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} p={p} onAdd={addToCart} />)}
        </div>
        {products.length === 0 && <div className="text-center text- text-zinc-500 mt-12">No products yet</div>}
      </main>
      {showCart && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-sm h-full flex flex-col">
            <div className="p-6 border-b flex items-center justify-between"><h3 className="font-semibold text-">Cart ({cart.length})</h3><button onClick={() => setShowCart(false)} style={{borderRadius:10}} className="w-8 h-8 border text-">✕</button></div>
            <div className="flex-1 overflow-auto p-6 space-y-3">
              {cart.map((p, i) => (
                <div key={i} style={{borderRadius:12}} className="flex gap-3 bg-zinc-50 p-3">
                  <img src={p.image_url} style={{borderRadius:8}} className="w-12 h-12 object-cover" />
                  <div className="flex-1"><div className="text- font-medium truncate">{p.name}</div><div className="text- font-bold">Rs. {p.price}</div></div>
                </div>
              ))}
              {cart.length === 0 && <div className="text- text-zinc-500">Cart empty</div>}
            </div>
            <div className="p-6 border-t space-y-3">
              <input placeholder="Your name" value={customerName} onChange={e => setCustomerName(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border text-" />
              <input placeholder="Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border text-" />
              <div className="font-bold text-">Total: Rs. {cart.reduce((s, p) => s + p.price, 0)}</div>
              <button onClick={orderWhatsApp} style={{borderRadius:12}} className="w-full h-11 bg-[#25D366] text-white font-medium text-">Order on WhatsApp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
