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
      <div className={`overflow-hidden ${isEditorial ? 'rounded-[16px] aspect-[3/4]' : 'rounded-[12px] h-48'} bg-zinc-50`}>
        <img src={images[safe]} className="w-full h-full object-cover" alt="" />
      </div>
      {images.length > 1 && !isEditorial && (
        <>
          <button onClick={() => setIdx((safe - 1 + images.length) % images.length)} style={{borderRadius:999}} className={`absolute top-1/2 -translate-y-1/2 left-2 w-7 h-7 flex items-center justify-center text-[14px] shadow border ${isDark ? 'bg-[#222] text-white border-white/10' : 'bg-white/90 text-black border-zinc-200'}`}>‹</button>
          <button onClick={() => setIdx((safe + 1) % images.length)} style={{borderRadius:999}} className={`absolute top-1/2 -translate-y-1/2 right-2 w-7 h-7 flex items-center justify-center text-[14px] shadow border ${isDark ? 'bg-[#222] text-white border-white/10' : 'bg-white/90 text-black border-zinc-200'}`}>›</button>
          <span style={{borderRadius:999}} className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 font-medium">{safe+1}/{images.length}</span>
        </>
      )}
      {images.length > 1 && (
        <div className={`flex gap-1.5 mt-2 overflow-x-auto pb-1 ${isEditorial ? 'justify-center' : ''}`}>
          {images.map((u,i)=><button key={i} onClick={()=>setIdx(i)} style={{borderRadius: isEditorial ? 6 : 10}} className={`${isEditorial ? 'w-8 h-10' : 'w-11 h-11'} overflow-hidden border-2 flex-shrink-0 ${i===safe ? 'border-black' : 'border-zinc-200'}`}><img src={u} className="w-full h-full object-cover" alt="" /></button>)}
        </div>
      )}
    </div>
  )
}

function ProductCard({ p, onAdd, themeId }: { p: Product; onAdd: (p: Product) => void; themeId: string }) {
  const theme = getTheme(themeId)
  const images = p.image_urls && p.image_urls.length>0 ? p.image_urls : [p.image_url].filter(Boolean)
  const isDark = ['clothing-street','tech-electro','sleek-dark'].includes(themeId)
  const isEditorial = themeId === 'sleek-editorial'
  const isSleekBeige = themeId === 'sleek-beige'
  const cardBase = isDark ? 'bg-[#181818] border-white/10 text-white' : isSleekBeige ? 'bg-white border-zinc-100' : 'bg-white border-zinc-200'
  const btnBg = themeId === 'food-spice' ? '#FF6B35' : themeId === 'food-organic' ? '#87A878' : themeId === 'clothing-street' ? '#CCFF00' : themeId === 'tech-electro' ? '#3B82F6' : themeId === 'shoes-street' ? '#FF1A1A' : themeId === 'sleek-dark' ? '#fff' : theme.colors.accent
  const btnColor = themeId === 'clothing-street' || themeId === 'sleek-dark' ? '#000' : '#fff'
  if (isEditorial) {
    return <div className="group bg-transparent flex flex-col"><Gallery images={images} themeId={themeId} /><div className="mt-4"><div className="font-serif text-[14px] tracking-wide">{p.name}</div><div className="text-[11px] tracking-[0.14em] text-zinc-500 mt-1">RS. {p.price.toLocaleString()}</div><button onClick={()=>onAdd(p)} className="mt-3 text-[11px] tracking-[0.14em] underline underline-offset-4 hover:text-black text-zinc-700">ADD TO CART —</button></div></div>
  }
  return <div style={{borderRadius: isSleekBeige || themeId.startsWith('sleek-') ? 16 : 20}} className={`border p-3 flex flex-col hover:shadow-lg ${cardBase}`}><Gallery images={images} themeId={themeId} /><div className="mt-3 flex-1"><div className={`font-medium text-[13px] truncate ${isDark?'text-white':'text-zinc-900'}`}>{p.name}</div><div className={`font-bold text-[14px] mt-1 ${isDark?'text-white':'text-zinc-900'}`}>Rs. {p.price.toLocaleString()}</div></div><button onClick={()=>onAdd(p)} style={{borderRadius: themeId.startsWith('sleek-')?10:12, background: btnBg, color: btnColor}} className="mt-3 w-full h-10 text-[13px] font-medium">Add — {theme.badge}</button></div>
}

// FIXED: Next.js 14 async params + robust slug lookup = no more 404
export default function StorePage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const [rawSlug, setRawSlug] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Product[]>([])
  const [showCart, setShowCart] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const resolveParams = async () => {
      // Handle both Promise (Next 14) and object (Next 13) params
      const resolved = params instanceof Promise ? await params : params
      const slugValue = (resolved as any)?.slug || ''
      setRawSlug(slugValue)
      return slugValue
    }
    const load = async (slugValue: string) => {
      if (!slugValue) { setLoading(false); return }
      const clean = decodeURIComponent(slugValue).toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
      let prof = null
      // Try exact match first, then case-insensitive, then partial
      const attempts = [
        () => supabase.from('profiles').select('*').eq('store_slug', clean).maybeSingle(),
        () => supabase.from('profiles').select('*').eq('store_slug', slugValue).maybeSingle(),
        () => supabase.from('profiles').select('*').eq('store_slug', slugValue.toLowerCase()).maybeSingle(),
        () => supabase.from('profiles').select('*').ilike('store_slug', `%${clean}%`).maybeSingle(),
        () => supabase.from('profiles').select('*').ilike('business_name', `%${clean.replace(/-/g,' ')}%`).maybeSingle(),
      ]
      for (const fn of attempts) {
        const { data } = await fn()
        if (data) { prof = data; break }
      }
      if (!prof) { setLoading(false); return }
      setProfile(prof)
      const { data: prods } = await supabase.from('products').select('*').eq('user_id', prof.id).order('created_at', { ascending: false })
      if (prods) setProducts(prods)
      setLoading(false)
    }
    resolveParams().then(load)
  }, [params])

  const addToCart = (p: Product) => { setCart([...cart, p]); setShowCart(true) }
  const removeFromCart = (i: number) => setCart(cart.filter((_, idx) => idx !== i))
  const orderWhatsApp = () => {
    if (!profile) return
    const total = cart.reduce((s,p)=>s+p.price,0)
    const lines = cart.map(p=>`• ${p.name} - Rs. ${p.price}`).join('%0A')
    const msg = `Hi ${profile.business_name}!%0A%0AOrder:%0A${lines}%0A%0ATotal: Rs. ${total}%0AName: ${customerName}%0AAddress: ${customerAddress}`
    window.open(`https://wa.me/${profile.whatsapp_number}?text=${msg}`, '_blank')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm bg-[#F8F7F5]">Loading store {rawSlug}...</div>
  if (!profile) return <div className="min-h-screen flex items-center justify-center bg-[#F8F7F5]"><div className="text-center"><div className="text-2xl mb-2">Store "{rawSlug}" not found</div><div className="text-[13px] text-zinc-500 mt-2">Check slug in dashboard: /s/your-slug must match</div><a href="/" className="text-sm underline mt-6 inline-block bg-black text-white px-5 py-2.5 rounded-full">Go Home</a></div></div>

  const themeId = profile.store_theme || 'clothing-noor'
  const theme = getTheme(themeId)
  const isDark = ['clothing-street','tech-electro','sleek-dark'].includes(themeId)
  const isEditorial = themeId === 'sleek-editorial'
  const isSleek = themeId.startsWith('sleek-')

  return (
    <div style={{background: theme.colors.bg, color: theme.colors.text}} className="min-h-screen">
      <header style={{background: isDark ? '#0A0A0A' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}} className="sticky top-0 z-20 border-b">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3"><div style={{borderRadius: isSleek ? 10 : 12}} className="w-9 h-9 border flex items-center justify-center text-[16px]">{theme.badge}</div><span className={`${isEditorial ? 'font-serif' : 'font-bold'} text-[15px]`}>{profile.business_name}</span></div>
          <button onClick={()=>setShowCart(true)} style={{borderRadius:10}} className={`h-9 px-4 text-[13px] border ${isDark ? 'border-white/20 bg-white/5 text-white' : 'border-zinc-200 bg-white'}`}>Cart ({cart.length})</button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div style={{borderRadius: isSleek ? 16 : 20}} className={`border p-6 mb-6 flex items-center justify-between ${isDark ? 'bg-white/[0.04] border-white/10' : 'bg-white border-zinc-200'}`}><div className="flex items-center gap-4"><div style={{borderRadius:12}} className="w-14 h-14 flex items-center justify-center text-[22px] border">{theme.badge}</div><div><h1 className="text-[20px] font-bold">{profile.business_name}</h1><p className="text-[13px] opacity-60 mt-1">{theme.tagline} • {products.length} items • /s/{profile.store_slug}</p></div></div></div>
        <div className={isEditorial ? 'grid grid-cols-1 md:grid-cols-3 gap-12' : 'grid grid-cols-2 md:grid-cols-4 gap-4'}>{products.map(p=> <ProductCard key={p.id} p={p} onAdd={addToCart} themeId={themeId} />)}</div>
        {products.length === 0 && <div className="py-20 text-center"><div className="text-[40px] mb-4">{theme.badge}</div><div>No products yet</div><div className="text-[12px] opacity-50 mt-2">Add products from dashboard</div></div>}
      </main>
      {showCart && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end"><div className={`w-full max-w-sm h-full flex flex-col ${isDark ? 'bg-[#141414] text-white' : 'bg-white'}`}><div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-zinc-200'}`}><h3 className="font-semibold text-[15px]">Cart ({cart.length})</h3><button onClick={()=>setShowCart(false)} style={{borderRadius:10}} className="w-8 h-8 border flex items-center justify-center">✕</button></div><div className="flex-1 overflow-auto p-6 space-y-3">{cart.map((p,i)=><div key={i} className={`flex gap-3 p-3 rounded-[12px] ${isDark ? 'bg-white/5' : 'bg-zinc-50'}`}><img src={p.image_url} className="w-14 h-14 rounded-[8px] object-cover" alt="" /><div className="flex-1"><div className="text-[13px] font-medium">{p.name}</div><div className="text-[13px] font-bold">Rs. {p.price}</div></div><button onClick={()=>removeFromCart(i)} className="text-[11px] opacity-60">Remove</button></div>)}{cart.length===0 && <div className="text-[13px] opacity-60 py-10 text-center">Cart empty</div>}</div><div className={`p-6 border-t space-y-3 ${isDark ? 'border-white/10' : 'border-zinc-200'}`}><input placeholder="Your name" value={customerName} onChange={e=>setCustomerName(e.target.value)} style={{borderRadius:12}} className={`w-full h-11 px-4 border text-[14px] ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-zinc-200'}`} /><input placeholder="Full address" value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} style={{borderRadius:12}} className={`w-full h-11 px-4 border text-[14px] ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-zinc-200'}`} /><div className="flex justify-between font-bold text-[14px]"><span>Total</span><span>Rs. {cart.reduce((s,p)=>s+p.price,0)}</span></div><button onClick={orderWhatsApp} style={{borderRadius:12, background: theme.colors.accent, color: themeId === 'clothing-street' || themeId === 'sleek-dark' ? '#000' : '#fff'}} className="w-full h-11 font-medium text-[14px]">Order on WhatsApp</button></div></div></div>
      )}
    </div>
  )
}
