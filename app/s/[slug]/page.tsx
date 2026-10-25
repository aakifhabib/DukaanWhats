'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getTheme } from '@/lib/storeThemes'

type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[] }

function Gallery({ images, themeId }: { images: string[]; themeId: string }) {
  const [idx, setIdx] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const safe = Math.min(Math.max(0, idx), images.length - 1)
  const isTrenzo = themeId === 'premium-trenzo'
  
  useEffect(() => {
    if (!isHovering || images.length <= 1) return
    const interval = setInterval(() => setIdx(prev => (prev + 1) % images.length), isTrenzo ? 2500 : 1800)
    return () => clearInterval(interval)
  }, [isHovering, images.length, isTrenzo])

  return (
    <div className="relative group/gallery" onMouseEnter={()=>setIsHovering(true)} onMouseLeave={()=>setIsHovering(false)}>
      <div className={`overflow-hidden ${themeId === 'premium-trenzo' ? 'rounded- aspect-[3/4]' : 'rounded- h-52'} bg-zinc-50 relative`}>
        <img src={images[safe]} className="w-full h-full object-cover transition-all duration-700 group-hover/gallery:scale-[1.03]" alt="" />
      </div>
      {images.length > 1 && (
        <>
          <button onClick={() => setIdx((safe - 1 + images.length) % images.length)} className="absolute top-1/2 -translate-y-1/2 left-2 w-8 h-8 bg-white/90 rounded-full">‹</button>
          <button onClick={() => setIdx((safe + 1) % images.length)} className="absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8 bg-white/90 rounded-full">›</button>
          <span className="absolute top-2.5 left-2.5 bg-black/75 text-white text- px-2.5 py-1 rounded-full">{safe+1}/{images.length}</span>
        </>
      )}
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
    const resolveParams = async () => {
      const resolved = params instanceof Promise ? await params : params
      const slugValue = (resolved as any)?.slug || ''
      setRawSlug(slugValue)
      return slugValue
    }
    const load = async (slugValue: string) => {
      if (!slugValue) { setLoading(false); return }
      const clean = decodeURIComponent(slugValue).toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
      let prof = null
      const attempts = [
        () => supabase.from('profiles').select('*').eq('store_slug', clean).maybeSingle(),
        () => supabase.from('profiles').select('*').eq('store_slug', slugValue).maybeSingle(),
        () => supabase.from('profiles').select('*').ilike('store_slug', `%${clean}%`).maybeSingle(),
      ]
      for (const fn of attempts) { const { data } = await fn(); if (data) { prof = data; break } }
      if (!prof) { setLoading(false); return }
      setProfile(prof)
      const { data: prods } = await supabase.from('products').select('*').eq('user_id', prof.id).order('created_at', { ascending: false })
      if (prods) setProducts(prods)
      setLoading(false)
    }
    resolveParams().then(load)
  }, [params])

  const addToCart = (p: any, q = 1, size = '') => { setCart([...cart, { ...p, qty: q, selSize: size, price: p.price * q }]) }
  const removeFromCart = (idx: number) => setCart(cart.filter((_, i) => i !== idx))
  
  const orderWhatsApp = () => {
    if (!customerName) { alert('Enter name'); return }
    const total = cart.reduce((s, p) => s + p.price, 0)
    const itemsText = cart.map((p, i) => `${i+1}. ${p.name} ${p.selSize ? `(Size ${p.selSize})` : ''} - Rs. ${p.price}`).join('%0A')
    const msg = `Salam ${profile.business_name}! New order from /s/${profile.store_slug}%0ACustomer: ${customerName}%0AAddress: ${customerAddress}%0A%0A${itemsText}%0A%0ATotal: Rs. ${total}%0ATheme: ${profile.store_theme}`
    window.open(`https://wa.me/${profile.whatsapp_number}?text=${msg}`, '_blank')
    setCart([]); setShowCart(false)
  }

  if (loading) return <div className="p-10 text-center">Loading {rawSlug}...</div>
  if (!profile) return <div className="p-10 text-center">Store not found: {rawSlug}</div>

  const themeId = profile.store_theme || 'clothing-noor'
  const theme = getTheme(themeId)
  const isDark = ['premium-trenzo','sleek-dark','clothing-street'].includes(themeId)
  const isSpike = themeId === 'premium-spike'
  const isTrenzo = themeId === 'premium-trenzo'
  const isApp = themeId === 'premium-minimal-app'

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-[#F8F7F5]'}`}>
      <div className="border-b p-4 flex justify-between max-w-7xl mx-auto">
        <div className="font-black">{profile.business_name} • /s/{profile.store_slug}</div>
        <button onClick={()=>setShowCart(true)} className="bg-black text-white px-4 py-2 rounded-full text-sm">Cart {cart.length}</button>
      </div>

      {isSpike && (
        <div className="max-w-7xl mx-auto p-6 grid md:grid-cols-2 gap-10">
          <div><h1 className="text-5xl font-black leading-[0.85]">The journey begins with the perfect jora</h1><p className="mt-4 text-zinc-500">Premium lawn suits</p></div>
          <div className="relative"><div className="text- font-black text-zinc-100 absolute -top-10 right-0">LAWN</div><div className="relative z-10 bg-zinc-100 rounded- p-4 mt-20"><img src={products[0]?.image_url} className="w-full h- object-cover rounded-" /></div></div>
        </div>
      )}

      {isTrenzo && (
        <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-10">
          <div><h1 className="text-5xl font-serif">A reflection of personal styling</h1><p className="mt-6 text-zinc-400">{profile.business_name}</p></div>
          <div className="w-full aspect-[3/4] bg-zinc-800 rounded- overflow-hidden"><img src={products[0]?.image_url} className="w-full h-full object-cover" /></div>
        </div>
      )}

      <div className={`max-w-7xl mx-auto p-6 grid ${isApp ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'} gap-4`}>
        {products.map(p => (
          <div key={p.id} onClick={()=>setSelectedProduct(p)} className={`border p-3 rounded- cursor-pointer ${isDark ? 'bg-[#181818] border-white/10' : 'bg-white'}`}>
            <Gallery images={p.image_urls?.length ? p.image_urls : [p.image_url]} themeId={themeId} />
            <div className="mt-3"><div className="font-bold text-">{p.name}</div><div className="font-black">Rs. {p.price}</div>
            <button onClick={(e)=>{e.stopPropagation(); addToCart(p)}} className="mt-2 w-full bg-black text-white py-2 rounded-full text-xs">Add to Cart</button></div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded- flex flex-col md:flex-row max-h- overflow-auto">
            <div className="flex-1 p-4"><Gallery images={selectedProduct.image_urls?.length ? selectedProduct.image_urls : [selectedProduct.image_url]} themeId={themeId} /></div>
            <div className="flex-1 p-6"><div className="flex justify-between"><h2 className="font-black text-xl">{selectedProduct.name}</h2><button onClick={()=>setSelectedProduct(null)} className="w-8 h-8 border rounded-full">✕</button></div>
              <div className="mt-3 text-2xl font-black">Rs. {selectedProduct.price}</div>
              <div className="mt-6 flex items-center gap-3"><button onClick={()=>setQty(Math.max(1, qty-1))} className="w-11 h-11 border rounded-full">−</button><span className="w-12 text-center font-black">{qty}</span><button onClick={()=>setQty(qty+1)} className="w-11 h-11 border rounded-full">+</button></div>
              <div className="mt-6 flex gap-3"><button onClick={()=>{addToCart(selectedProduct, qty); setSelectedProduct(null)}} className="flex-1 h-12 bg-black text-white rounded-full font-bold">Add {qty} to Cart</button><button onClick={()=>{addToCart(selectedProduct, qty); setShowCart(true); setSelectedProduct(null)}} className="h-12 px-6 border rounded-full">Buy Now</button></div>
            </div>
          </div>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end"><div className="w-full max-w-sm h-full bg-white flex flex-col"><div className="p-6 border-b flex justify-between"><h3>Cart ({cart.length})</h3><button onClick={()=>setShowCart(false)}>✕</button></div><div className="flex-1 overflow-auto p-6 space-y-3">{cart.map((p,i)=><div key={i} className="flex gap-3 bg-zinc-50 p-3 rounded-xl"><img src={p.image_url} className="w-14 h-14 rounded-lg" /><div className="flex-1"><div className="text-sm">{p.name}</div><div className="font-bold">Rs. {p.price}</div></div><button onClick={()=>removeFromCart(i)} className="text-xs">Remove</button></div>)}</div><div className="p-6 border-t space-y-3"><input placeholder="Your name *" value={customerName} onChange={e=>setCustomerName(e.target.value)} className="w-full h-11 px-4 border rounded-xl" /><input placeholder="Address" value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} className="w-full h-11 px-4 border rounded-xl" /><div className="flex justify-between font-bold"><span>Total</span><span>Rs. {cart.reduce((s,p)=>s+p.price,0)}</span></div><button onClick={orderWhatsApp} className="w-full h-11 bg-[#25D366] text-white rounded-xl font-bold">Order on WhatsApp</button></div></div></div>
      )}
    </div>
  )
}
