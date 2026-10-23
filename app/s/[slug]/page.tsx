'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getTheme } from '@/lib/storeThemes'

type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[] }

function Gallery({ images, themeId }: { images: string[]; themeId: string }) {
  const [idx, setIdx] = useState(0)
  const safe = Math.min(idx, images.length - 1)
  const isEditorial = themeId === 'sleek-editorial'
  const isDark = ['clothing-street','tech-electro','sleek-dark'].includes(themeId)
  return (
    <div className="relative">
      <div className={`overflow-hidden ${isEditorial ? 'rounded- aspect-[3/4]' : 'rounded- h-48'} bg-zinc-50`}>
        <img src={images[safe]} className="w-full h-full object-cover" alt="" />
      </div>
      {images.length > 1 && !isEditorial && (
        <>
          <button onClick={() => setIdx((safe - 1 + images.length) % images.length)} style={{borderRadius:999} as any} className={`absolute top-1/2 -translate-y-1/2 left-2 w-7 h-7 flex items-center justify-center text- shadow border ${isDark ? 'bg-[#222] text-white border-white/10' : 'bg-white/90 text-black border-zinc-200'}`}>‹</button>
          <button onClick={() => setIdx((safe + 1) % images.length)} style={{borderRadius:999} as any} className={`absolute top-1/2 -translate-y-1/2 right-2 w-7 h-7 flex items-center justify-center text- shadow border ${isDark ? 'bg-[#222] text-white border-white/10' : 'bg-white/90 text-black border-zinc-200'}`}>›</button>
          <span style={{borderRadius:999} as any} className="absolute top-2 left-2 bg-black/70 text-white text- px-2 py-0.5 font-medium">{safe+1}/{images.length}</span>
        </>
      )}
      {images.length > 1 && (
        <div className={`flex gap-1.5 mt-2 overflow-x-auto pb-1 ${isEditorial ? 'justify-center' : ''}`}>
          {images.map((u,i)=>(
            <button key={i} onClick={()=>setIdx(i)} style={{borderRadius: isEditorial ? 6 : 10} as any} className={`${isEditorial ? 'w-8 h-10' : 'w-11 h-11'} overflow-hidden border-2 flex-shrink-0 ${i===safe ? 'border-black' : 'border-zinc-200'}`}>
              <img src={u} className="w-full h-full object-cover" alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ProductCard({ p, onAdd, themeId }: { p: Product; onAdd: (p: Product) => void; themeId: string }) {
  const theme = getTheme(themeId)
  const images = p.image_urls && p.image_urls.length > 0 ? p.image_urls : [p.image_url].filter(Boolean)
  const isDark = ['clothing-street','tech-electro','sleek-dark'].includes(themeId)
  const isEditorial = themeId === 'sleek-editorial'
  const isSleekBeige = themeId === 'sleek-beige'
  const isShoes = themeId.startsWith('shoes-')
  const isFood = themeId.startsWith('food-')
  if (isEditorial) {
    return (
      <div className="group bg-transparent flex flex-col">
        <Gallery images={images} themeId={themeId} />
        <div className="mt-4">
          <div className="font-serif text- tracking-wide">{p.name}</div>
          <div className="text- tracking-[0.14em] text-zinc-500 mt-1">RS. {p.price.toLocaleString()}</div>
          <button onClick={()=>onAdd(p)} className="mt-3 text- tracking-[0.14em] underline underline-offset-4 hover:text-black text-zinc-700">ADD TO CART —</button>
        </div>
      </div>
    )
  }
  const cardBase = isDark ? 'bg-[#181818] border-white/10 text-white' : isSleekBeige ? 'bg-white border-zinc-100' : 'bg-white border-zinc-200'
  const btnBg = themeId === 'food-spice' ? '#FF6B35' : themeId === 'food-organic' ? '#87A878' : themeId === 'clothing-street' ? '#CCFF00' : themeId === 'tech-electro' ? '#3B82F6' : themeId === 'shoes-street' ? '#FF1A1A' : themeId === 'sleek-dark' ? '#fff' : theme.colors.accent
  const btnColor = themeId === 'clothing-street' || themeId === 'sleek-dark' ? '#000' : '#fff'
  return (
    <div style={{borderRadius: isSleekBeige || themeId.startsWith('sleek-') ? 16 : 20} as any} className={`border p-3 flex flex-col hover:shadow-lg ${cardBase}`}>
      <div className="relative">
        <Gallery images={images} themeId={themeId} />
        {isFood && themeId === 'food-spice' && <span style={{borderRadius:999, background:'#FF6B35'} as any} className="absolute top-2 right-2 text-white text- px-2 py-1 font-bold">SPICY</span>}
        {isFood && themeId === 'food-organic' && <span style={{borderRadius:999, background:'#87A878'} as any} className="absolute top-2 right-2 text-white text- px-2 py-1 font-bold">ORGANIC</span>}
        {isShoes && themeId === 'shoes-street' && <span style={{borderRadius:6, background:'#FF1A1A'} as any} className="absolute bottom-2 right-2 text-white text- px-2 py-1 font-bold">NEW DROP</span>}
        {themeId.startsWith('tech-') && <span style={{borderRadius:6, background:'rgba(0,0,0,0.7)'} as any} className="absolute bottom-2 left-2 text-white text- px-2 py-1 font-mono">IN STOCK</span>}
      </div>
      <div className="mt-3 flex-1">
        <div className={`font-medium text- truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{p.name}</div>
        <div className={`font-bold text- mt-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Rs. {p.price.toLocaleString()}</div>
      </div>
      <button onClick={()=>onAdd(p)} style={{borderRadius: themeId.startsWith('sleek-') ? 10 : 12, background: btnBg, color: btnColor} as any} className="mt-3 w-full h-10 text- font-medium">Add — {theme.badge}</button>
    </div>
  )
}

export default function StorePage({ params }: { params: { slug: string } }) {
  const rawSlug = params.slug
  const [profile, setProfile] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Product[]>([])
  const [showCart, setShowCart] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const clean = decodeURIComponent(rawSlug).toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
      let prof = null
      const tries = [clean, rawSlug, rawSlug.toLowerCase(), clean.replace(/-/g,' ')]
      for (const s of tries) {
        const { data } = await supabase.from('profiles').select('*').eq('store_slug', s).maybeSingle()
        if (data) { prof = data; break }
      }
      if (!prof) {
        const { data } = await supabase.from('profiles').select('*').ilike('store_slug', `%${clean}%`).maybeSingle()
        if (data) prof = data
      }
      if (!prof) { setLoading(false); return }
      setProfile(prof)
      const { data: prods } = await supabase.from('products').select('*').eq('user_id', prof.id)
      if (prods) setProducts(prods)
      setLoading(false)
    }
    load()
  }, [rawSlug])

  const addToCart = (p: Product) => { setCart([...cart, p]); setShowCart(true) }
  const removeFromCart = (i: number) => setCart(cart.filter((_, idx) => idx !== i))
  const orderWhatsApp = () => {
    if (!profile) return
    const total = cart.reduce((s,p)=>s+p.price,0)
    const lines = cart.map(p=>`• ${p.name} - Rs. ${p.price}`).join('%0A')
    const msg = `Hi ${profile.business_name}!%0A%0AOrder:%0A${lines}%0A%0ATotal: Rs. ${total}%0AName: ${customerName}%0AAddress: ${customerAddress}`
    window.open(`https://wa.me/${profile.whatsapp_number}?text=${msg}`, '_blank')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm">Loading {rawSlug}...</div>
  if (!profile) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="text-2xl mb-2">Store not found</div><a href="/" className="text-sm underline mt-4 inline-block">Go Home</a></div></div>

  const themeId = profile.store_theme || 'clothing-noor'
  const theme = getTheme(themeId)
  const isDark = ['clothing-street','tech-electro','sleek-dark'].includes(themeId)

  return (
    <div style={{background: theme.colors.bg, color: theme.colors.text} as any} className="min-h-screen">
      <header style={{background: isDark ? '#0A0A0A' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'} as any} className="sticky top-0 z-20 border-b">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{borderRadius:10} as any} className="w-9 h-9 border flex items-center justify-center text-">{theme.badge}</div>
            <span className="font-bold text-">{profile.business_name}</span>
            <span style={{borderRadius:999} as any} className={`text- px-2 py-0.5 ${isDark ? 'bg-white/10 text-white/60' : 'bg-zinc-100 text-zinc-500'}`}>{themeId}</span>
          </div>
          <button onClick={()=>setShowCart(true)} style={{borderRadius:10} as any} className={`h-9 px-4 text- border ${isDark ? 'border-white/20 bg-white/5 text-white' : 'border-zinc-200 bg-white'}`}>Cart ({cart.length})</button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div style={{borderRadius:16} as any} className={`border p-6 mb-6 flex items-center gap-4 ${isDark ? 'bg-white/[0.04] border-white/10' : 'bg-white border-zinc-200'}`}>
          <div style={{borderRadius:12} as any} className="w-14 h-14 flex items-center justify-center text- border">{theme.badge}</div>
          <div><h1 className="text- font-bold">{profile.business_name}</h1><p className="text- opacity-60 mt-1">{theme.tagline} • {products.length} items</p></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(p=> <ProductCard key={p.id} p={p} onAdd={addToCart} themeId={themeId} />)}
        </div>
        {products.length === 0 && <div className="py-20 text-center"><div className="text- mb-4">{theme.badge}</div><div>No products yet — {theme.name}</div></div>}
      </main>
      {showCart && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
          <div className={`w-full max-w-sm h-full flex flex-col ${isDark ? 'bg-[#141414] text-white' : 'bg-white'}`}>
            <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-zinc-200'}`}>
              <h3 className="font-semibold text-">Cart ({cart.length})</h3>
              <button onClick={()=>setShowCart(false)} style={{borderRadius:10} as any} className="w-8 h-8 border flex items-center justify-center">✕</button>
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-3">
              {cart.map((p,i)=><div key={i} className={`flex gap-3 p-3 rounded- ${isDark ? 'bg-white/5' : 'bg-zinc-50'}`}><img src={p.image_url} className="w-14 h-14 rounded- object-cover" alt="" /><div className="flex-1"><div className="text- font-medium">{p.name}</div><div className="text- font-bold">Rs. {p.price}</div></div><button onClick={()=>removeFromCart(i)} className="text- opacity-60">Remove</button></div>)}
              {cart.length===0 && <div className="text- opacity-60 py-10 text-center">Cart empty</div>}
            </div>
            <div className={`p-6 border-t space-y-3 ${isDark ? 'border-white/10' : 'border-zinc-200'}`}>
              <input placeholder="Your name" value={customerName} onChange={e=>setCustomerName(e.target.value)} style={{borderRadius:12} as any} className={`w-full h-11 px-4 border text- ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-zinc-200'}`} />
              <input placeholder="Full address" value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} style={{borderRadius:12} as any} className={`w-full h-11 px-4 border text- ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-zinc-200'}`} />
              <div className="flex justify-between font-bold text-"><span>Total</span><span>Rs. {cart.reduce((s,p)=>s+p.price,0)}</span></div>
              <button onClick={orderWhatsApp} style={{borderRadius:12, background: theme.colors.accent, color: themeId === 'clothing-street' || themeId === 'sleek-dark' ? '#000' : '#fff'} as any} className="w-full h-11 font-medium text-">Order on WhatsApp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
