'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getTheme } from '@/lib/storeThemes'

type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[] }

function ProductCard({ p, onAdd, themeId }: { p: Product, onAdd: (p: Product) => void, themeId: string }) {
  const theme = getTheme(themeId)
  const images = p.image_urls && p.image_urls.length > 0 ? p.image_urls : [p.image_url].filter(Boolean)
  const [idx, setIdx] = useState(0)
  const safeIdx = Math.min(idx, images.length - 1)
  const isDark = ['clothing-street','tech-electro'].includes(themeId)
  const cardStyle = isDark ? { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)' } as any : {}
  const textColor = isDark ? '#fff' : theme.colors.text
  const subColor = isDark ? 'rgba(255,255,255,0.6)' : theme.colors.sub

  return (
    <div style={{borderRadius:20, ...cardStyle}} className="bg-white border p-3 flex flex-col transition-all hover:scale-[1.01] hover:shadow-lg">
      <div className="relative">
        <img src={images[safeIdx]} style={{borderRadius:12}} className="w-full h-48 object-cover bg-zinc-50" />
        {images.length > 1 && (
          <>
            <button onClick={() => setIdx((safeIdx - 1 + images.length) % images.length)} style={{borderRadius:999}} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 backdrop-blur border flex items-center justify-center text-[14px] shadow">‹</button>
            <button onClick={() => setIdx((safeIdx + 1) % images.length)} style={{borderRadius:999}} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 backdrop-blur border flex items-center justify-center text-[14px] shadow">›</button>
            <span style={{borderRadius:999}} className="absolute top-2 left-2 bg-black/70 text-white text-[11px] px-2 py-0.5">{safeIdx+1}/{images.length}</span>
          </>
        )}
        {themeId.startsWith('food') && <span style={{borderRadius:999, background: theme.colors.accent, color: '#fff'}} className="absolute top-2 right-2 text-[10px] px-2 py-1 font-bold uppercase">{themeId.includes('spice') ? '🔥 Spicy' : '🌿 Organic'}</span>}
        {themeId.startsWith('tech') && <span style={{borderRadius:6, background: 'rgba(0,0,0,0.7)', color: '#fff'}} className="absolute bottom-2 left-2 text-[10px] px-2 py-1 font-mono">⚡ In Stock</span>}
        {themeId.startsWith('shoes') && <span style={{borderRadius:999, background: theme.colors.accent}} className="absolute bottom-2 right-2 text-white text-[10px] px-2 py-1 font-bold">{themeId.includes('street') ? 'NEW DROP' : 'HANDMADE'}</span>}
      </div>
      {images.length > 1 && (
        <div className="flex gap-1.5 mt-2 overflow-x-auto scrollbar-none pb-1">
          {images.map((u, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{borderRadius:10}} className={`w-11 h-11 overflow-hidden border-2 flex-shrink-0 ${i===safeIdx ? 'border-black' : 'border-zinc-200'}`}>
              <img src={u} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="mt-3 font-medium text-[13px] truncate" style={{color: textColor}}>{p.name}</div>
      <div className="font-bold text-[14px] mt-1" style={{color: textColor}}>Rs. {p.price}</div>
      <button onClick={() => onAdd(p)} style={{borderRadius:10, background: themeId === 'food-spice' ? '#FF6B35' : themeId === 'shoes-street' ? '#FF1A1A' : themeId.includes('tech') ? theme.colors.accent : '#0d0f14'}} className="mt-3 w-full h-10 text-white text-[13px] font-medium hover:opacity-90">Add to Cart</button>
    </div>
  )
}

export default function StorePage({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug).toLowerCase().trim()
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
        const { data } = await supabase.from('profiles').select('*').eq('store_slug', slug.replace(/\s+/g, '-')).single()
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
    const items = cart.map(p => `- ${p.name} - Rs. ${p.price}`).join('\\n')
    const msg = `Assalam-o-Alaikum! New Order from ${profile.business_name}\\n\\n${items}\\n\\nTotal: Rs. ${total}\\n\\nName: ${customerName}\\nAddress: ${customerAddress}`
    const wa = profile.whatsapp_number.replace(/[^0-9]/g, '')
    window.location.href = `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`
  }

  if (loading) return <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center">Loading...</div>
  if (!profile) return <div className="min-h-screen flex items-center justify-center p-8">Store not found: {slug}</div>

  const themeId = profile.store_theme || 'clothing-noor'
  const theme = getTheme(themeId)
  const isDark = ['clothing-street','tech-electro'].includes(themeId)

  return (
    <div style={{minHeight:'100vh', background: theme.colors.bg}} className={`${isDark ? 'text-white' : 'text-zinc-900'}`}>
      <header style={{background: isDark ? 'rgba(13,15,20,0.8)' : '#fff'}} className="border-b sticky top-0 z-10 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{borderRadius:10, background: theme.colors.accent, color: '#000'}} className="w-9 h-9 flex items-center justify-center font-bold">{theme.badge}</div>
            <div><div className="font-semibold text-[15px]">{profile.business_name}</div><div className="text-[11px] opacity-60">/s/{profile.store_slug} • {theme.name}</div></div>
          </div>
          <button onClick={() => setShowCart(true)} style={{borderRadius:10, background: isDark ? '#fff' : '#000', color: isDark ? '#000' : '#fff'}} className="h-10 px-5 text-[13px] font-medium">Cart ({cart.length})</button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div style={{borderRadius:20, background: isDark ? 'rgba(255,255,255,0.04)' : '#fff'}} className="border p-6 mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><span>{theme.badge}</span>{profile.business_name}</h1>
          <p className="text-sm opacity-60 mt-1">{theme.tagline} • Order on WhatsApp</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} p={p} onAdd={addToCart} themeId={themeId} />)}
        </div>
      </main>
      {showCart && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-sm h-full flex flex-col text-zinc-900">
            <div className="p-6 border-b flex justify-between"><h3 className="font-semibold">Cart ({cart.length})</h3><button onClick={()=>setShowCart(false)} className="w-8 h-8 border rounded-[10px]">✕</button></div>
            <div className="flex-1 overflow-auto p-6 space-y-3">
              {cart.map((p,i)=><div key={i} className="flex gap-3 bg-zinc-50 rounded-[12px] p-3"><img src={p.image_url} className="w-12 h-12 rounded-[8px] object-cover" /><div className="flex-1"><div className="text-[13px] font-medium truncate">{p.name}</div><div className="text-[13px] font-bold">Rs. {p.price}</div></div></div>)}
              {cart.length===0 && <div className="text-sm text-zinc-500">Empty</div>}
            </div>
            <div className="p-6 border-t space-y-3">
              <input placeholder="Name" value={customerName} onChange={e=>setCustomerName(e.target.value)} className="w-full h-11 px-4 rounded-[12px] border text-[14px]" />
              <input placeholder="Address" value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} className="w-full h-11 px-4 rounded-[12px] border text-[14px]" />
              <div className="font-bold">Total: Rs. {cart.reduce((s,p)=>s+p.price,0)}</div>
              <button onClick={orderWhatsApp} style={{borderRadius:12, background: theme.colors.accent}} className="w-full h-11 font-medium text-[14px]">Order on WhatsApp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
