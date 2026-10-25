'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getTheme } from '@/lib/storeThemes'

type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[] }

function Gallery({ images, themeId }: { images: string[]; themeId: string }) {
  const [idx, setIdx] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const safe = Math.min(Math.max(0, idx), images.length - 1)
  useEffect(() => {
    if (!isHovering || images.length <= 1) return
    const id = setInterval(() => setIdx(p => (p + 1) % images.length), 1800)
    return () => clearInterval(id)
  }, [isHovering, images.length])
  return (
    <div className="relative group" onMouseEnter={()=>setIsHovering(true)} onMouseLeave={()=>setIsHovering(false)}>
      <div className={`overflow-hidden ${themeId==='premium-trenzo'?'rounded- aspect-[3/4]':'rounded- h-52'} bg-zinc-50`}>
        <img src={images[safe]} className="w-full h-full object-cover" alt="" />
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/60 px-2 py-1 rounded-full">
        {images.map((_,i)=><div key={i} className={`h-1 rounded-full ${i===safe?'w-5 bg-white':'w-1.5 bg-white/40'}`} />)}
      </div>
    </div>
  )
}

export default function StorePage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const [profile, setProfile] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [showCart, setShowCart] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [qty, setQty] = useState(1)
  const [selSize, setSelSize] = useState('')
  const [rawSlug, setRawSlug] = useState('')

  useEffect(() => {
    const load = async (slugValue: string) => {
      const clean = slugValue.toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
      let prof = null
      for (const fn of [
        () => supabase.from('profiles').select('*').eq('store_slug', clean).maybeSingle(),
        () => supabase.from('profiles').select('*').eq('store_slug', slugValue).maybeSingle(),
        () => supabase.from('profiles').select('*').ilike('store_slug', `%${clean}%`).maybeSingle(),
      ]) { const { data } = await fn(); if (data) { prof = data; break } }
      if (!prof) { setLoading(false); return }
      setProfile(prof)
      const { data: prods } = await supabase.from('products').select('*').eq('user_id', prof.id).order('created_at', { ascending: false })
      if (prods) setProducts(prods)
      setLoading(false)
    }
    ;(async () => {
      const r = params instanceof Promise ? await params : params
      const s = (r as any)?.slug || ''
      setRawSlug(s)
      load(s)
    })()
  }, [params])

  const addToCart = (p: any, q = 1) => setCart([...cart, { ...p, qty: q, price: p.price * q }])
  const orderWhatsApp = () => {
    if (!customerName) return alert('Enter name')
    const total = cart.reduce((s,p)=>s+p.price,0)
    const items = cart.map((p,i)=>`${i+1}. ${p.name} - Rs. ${p.price}`).join('%0A')
    const msg = `Salam ${profile.business_name}! Order from /s/${profile.store_slug}%0A${items}%0ATotal Rs. ${total}%0AName: ${customerName}%0AAddr: ${customerAddress}`
    window.open(`https://wa.me/${profile.whatsapp_number}?text=${msg}`, '_blank')
    setCart([]); setShowCart(false)
  }

  if (loading) return <div className="p-10 text-center">Loading {rawSlug}...</div>
  if (!profile) return <div className="p-10 text-center">Store not found: {rawSlug}</div>

  const themeId = profile.store_theme || 'clothing-noor'
  const isDark = ['premium-trenzo','sleek-dark'].includes(themeId)
  const isSpike = themeId === 'premium-spike'
  const isTrenzo = themeId === 'premium-trenzo'
  const isApp = themeId === 'premium-minimal-app'

  return (
    <div className={`min-h-screen ${isDark?'bg-[#0A0A0A] text-white':'bg-[#F8F7F5]'}`}>
      <div className="flex justify-between p-4 max-w-7xl mx-auto border-b"><b>{profile.business_name} • /s/{profile.store_slug}</b><button onClick={()=>setShowCart(true)} className="bg-black text-white px-4 py-2 rounded-full">Cart {cart.length}</button></div>
      
      {isSpike && <div className="max-w-7xl mx-auto p-6 grid md:grid-cols-2 gap-10"><div><h1 className="text-5xl font-black">The journey begins with the perfect jora</h1></div><div className="bg-zinc-100 rounded- p-4"><img src={products[0]?.image_url} className="w-full h- object-cover rounded-" /></div></div>}
      {isTrenzo && <div className="max-w-7xl mx-auto p-6 grid md:grid-cols-2 gap-10"><div><h1 className="text-5xl font-serif">A reflection of personal styling</h1></div><div className="w-full aspect-[3/4] bg-zinc-800 rounded- overflow-hidden"><img src={products[0]?.image_url} className="w-full h-full object-cover" /></div></div>}

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map(p=>(
          <div key={p.id} onClick={()=>setSelectedProduct(p)} className={`border p-3 rounded- cursor-pointer ${isDark?'bg-[#181818] border-white/10':'bg-white'}`}>
            <Gallery images={p.image_urls?.length?p.image_urls:[p.image_url]} themeId={themeId} />
            <div className="mt-3"><div className="font-bold text-">{p.name}</div><div>Rs. {p.price}</div><button onClick={(e)=>{e.stopPropagation(); addToCart(p)}} className="mt-2 w-full bg-black text-white py-2 rounded-full text-xs">Add to Cart</button></div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white w-full max-w-2xl rounded- flex flex-col md:flex-row overflow-auto max-h-"><div className="flex-1 p-4"><img src={selectedProduct.image_url} className="w-full h-64 object-cover rounded-xl" /></div><div className="flex-1 p-6"><h2 className="font-black text-xl">{selectedProduct.name}</h2><div className="text-2xl font-black mt-2">Rs. {selectedProduct.price}</div><div className="flex gap-3 mt-6"><button onClick={()=>{addToCart(selectedProduct, qty); setSelectedProduct(null)}} className="flex-1 h-12 bg-black text-white rounded-full">Add {qty} to Cart</button><button onClick={()=>setSelectedProduct(null)} className="w-12 h-12 border rounded-full">✕</button></div></div></div></div>
      )}

      {showCart && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end"><div className="w-full max-w-sm h-full bg-white flex flex-col"><div className="p-6 border-b flex justify-between"><h3>Cart {cart.length}</h3><button onClick={()=>setShowCart(false)}>✕</button></div><div className="flex-1 overflow-auto p-6 space-y-3">{cart.map((p,i)=><div key={i} className="flex gap-3 bg-zinc-50 p-3 rounded-xl"><img src={p.image_url} className="w-14 h-14 rounded-lg" /><div><div className="text-sm">{p.name}</div><div className="font-bold">Rs. {p.price}</div></div><button onClick={()=>setCart(cart.filter((_,j)=>j!==i))} className="text-xs">Remove</button></div>)}</div><div className="p-6 border-t space-y-3"><input placeholder="Name *" value={customerName} onChange={e=>setCustomerName(e.target.value)} className="w-full h-11 border rounded-xl px-4" /><input placeholder="Address" value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} className="w-full h-11 border rounded-xl px-4" /><div className="flex justify-between font-bold"><span>Total</span><span>Rs. {cart.reduce((s,p)=>s+p.price,0)}</span></div><button onClick={orderWhatsApp} className="w-full h-11 bg-[#25D366] text-white rounded-xl font-bold">Order on WhatsApp</button></div></div></div>
      )}
    </div>
  )
}
