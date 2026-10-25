'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { getTheme } from '@/lib/storeThemes'

type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[] }

function Gallery({ images, themeId, productId, storeSlug, ownerId, onProductView }: { images: string[]; themeId: string; productId?: string; storeSlug?: string; ownerId?: string; onProductView?: (id: string) => void }) {
  const [idx, setIdx] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const safe = Math.min(idx, images.length - 1)
  const isEditorial = themeId === 'sleek-editorial'
  const isDark = ['clothing-street','tech-electro','sleek-dark'].includes(themeId)

  // Premium hover: auto slide one by one when hovering
  useEffect(() => {
    if (!isHovering || images.length <= 1) return
    const interval = setInterval(() => {
      setIdx(prev => (prev + 1) % images.length)
    }, 650)
    return () => clearInterval(interval)
  }, [isHovering, images.length])
  
  useEffect(() => {
    if (productId && storeSlug && onProductView) {
      onProductView(productId)
    }
  }, [safe])

  return (
    <div className="relative group/gallery" onMouseEnter={()=>setIsHovering(true)} onMouseLeave={()=>{setIsHovering(false);}}>
      <div className={`overflow-hidden ${isEditorial ? 'rounded-[16px] aspect-[3/4]' : 'rounded-[14px] h-52'} bg-zinc-50 relative`}>
        <img src={images[safe]} className="w-full h-full object-cover transition-transform duration-700 group-hover/gallery:scale-[1.03]" alt="" />
        {images.length > 1 && isHovering && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        )}
      </div>
      {images.length > 1 && !isEditorial && (
        <>
          <button onClick={() => setIdx((safe - 1 + images.length) % images.length)} style={{borderRadius:999}} className={`absolute top-1/2 -translate-y-1/2 left-2 w-8 h-8 flex items-center justify-center text-[16px] shadow-lg border backdrop-blur-md transition-all ${isDark ? 'bg-[#222]/90 text-white border-white/10' : 'bg-white/90 text-black border-zinc-200'} opacity-0 group-hover/gallery:opacity-100`}>‹</button>
          <button onClick={() => setIdx((safe + 1) % images.length)} style={{borderRadius:999}} className={`absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8 flex items-center justify-center text-[16px] shadow-lg border backdrop-blur-md transition-all ${isDark ? 'bg-[#222]/90 text-white border-white/10' : 'bg-white/90 text-black border-zinc-200'} opacity-0 group-hover/gallery:opacity-100`}>›</button>
          <span style={{borderRadius:999}} className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md text-white text-[10px] px-2.5 py-1 font-bold tracking-widest flex items-center gap-1.5">
            {safe+1}/{images.length} {isHovering && <span className="w-1 h-1 bg-[#E8FF86] rounded-full animate-pulse" />}
          </span>
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-full">
            {images.map((_,i)=><div key={i} className={`h-1 rounded-full transition-all duration-500 ${i===safe ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`} />)}
          </div>
        </>
      )}
      {images.length > 1 && (
        <div className={`flex gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-hide ${isEditorial ? 'justify-center' : ''}`}>
          {images.map((u,i)=><button key={i} onClick={()=>setIdx(i)} style={{borderRadius: isEditorial ? 6 : 10}} className={`${isEditorial ? 'w-9 h-11' : 'w-12 h-12'} overflow-hidden border-2 flex-shrink-0 transition-all ${i===safe ? 'border-black scale-105' : 'border-zinc-200 opacity-70 hover:opacity-100'}`}><img src={u} className="w-full h-full object-cover" alt="" /></button>)}
        </div>
      )}
    </div>
  )
}

function ProductCard({ p, onAdd, onOpen, themeId, storeSlug, ownerId, track }: { p: any; onAdd: (p: any, qty?: number) => void; onOpen: (p: any) => void; themeId: string; storeSlug?: string; ownerId?: string; track: (type: string, productId?: string) => void }) {
  const theme = getTheme(themeId)
  const images = p.image_urls && p.image_urls.length>0 ? p.image_urls : [p.image_url].filter(Boolean)
  const isDark = ['clothing-street','tech-electro','sleek-dark'].includes(themeId)
  const isEditorial = themeId === 'sleek-editorial'
  const isSleekBeige = themeId === 'sleek-beige'
  const cardBase = isDark ? 'bg-[#181818] border-white/10 text-white' : isSleekBeige ? 'bg-white border-zinc-100' : 'bg-white border-zinc-200'
  const btnBg = themeId === 'food-spice' ? '#FF6B35' : themeId === 'food-organic' ? '#87A878' : themeId === 'clothing-street' ? '#CCFF00' : themeId === 'tech-electro' ? '#3B82F6' : themeId === 'shoes-street' ? '#FF1A1A' : themeId === 'sleek-dark' ? '#fff' : theme.colors.accent
  const btnColor = themeId === 'clothing-street' || themeId === 'sleek-dark' ? '#000' : '#fff'
  
  const handleAdd = (e: any) => {
    e.stopPropagation()
    track('product_view', p.id)
    onAdd(p)
  }
  const handleCardClick = () => {
    onOpen(p)
  }

  if (isEditorial) {
    return <div onClick={handleCardClick} className="group bg-transparent flex flex-col cursor-pointer"><Gallery images={images} themeId={themeId} productId={p.id} storeSlug={storeSlug} ownerId={ownerId} onProductView={(id)=>track('product_view', id)} /><div className="mt-4"><div className="font-serif text-[14px] tracking-wide">{p.name}</div><div className="text-[11px] tracking-[0.14em] text-zinc-500 mt-1">RS. {p.price.toLocaleString()}</div><button onClick={handleAdd} className="mt-3 text-[11px] tracking-[0.14em] underline underline-offset-4 hover:text-black text-zinc-700">ADD TO CART —</button></div></div>
  }
  return <div onClick={handleCardClick} style={{borderRadius: isSleekBeige || themeId.startsWith('sleek-') ? 16 : 20}} className={`border p-3 flex flex-col hover:shadow-xl hover:border-black cursor-pointer group ${cardBase}`}><Gallery images={images} themeId={themeId} productId={p.id} storeSlug={storeSlug} ownerId={ownerId} onProductView={(id)=>track('product_view', id)} /><div className="mt-3 flex-1"><div className={`font-medium text-[13px] truncate ${isDark?'text-white':'text-zinc-900'}`}>{p.name}</div><div className={`font-bold text-[14px] mt-1 ${isDark?'text-white':'text-zinc-900'}`}>Rs. {p.price.toLocaleString()}</div>{p.original_price > p.price && <div className="text-[11px] line-through opacity-50">Rs. {p.original_price.toLocaleString()}</div>}</div><button onClick={handleAdd} style={{borderRadius: themeId.startsWith('sleek-')?10:12, background: btnBg, color: btnColor}} className="mt-3 w-full h-10 text-[13px] font-medium group-hover:scale-[1.02] transition-transform">Quick Add — {theme.badge}</button></div>
}

export default function StorePage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const [rawSlug, setRawSlug] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Product[]>([])
  const [showCart, setShowCart] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [qty, setQty] = useState(1)
  const [selSize, setSelSize] = useState('')
  const [selColor, setSelColor] = useState('')

  const track = async (event_type: string, product_id?: string) => {
    try {
      if (!profile?.store_slug) return
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_slug: profile.store_slug,
          store_owner_id: profile.id,
          event_type,
          product_id: product_id || null
        })
      })
    } catch (e) {}
  }

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
      
      // REAL TRACKING: Store view
      setTimeout(() => {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            store_slug: prof.store_slug,
            store_owner_id: prof.id,
            event_type: 'store_view'
          })
        }).catch(()=>{})
      }, 500)
    }
    resolveParams().then(load)
  }, [params])

  const addToCart = (p: any, quantity: any = 1, size?: string, color?: string) => {
    const qtyNum = typeof quantity === 'number' ? quantity : 1
 
    track('product_view', p.id)
    const cartItem = { ...p, cartQty: qtyNum, selectedSize: size, selectedColor: color }
    const items = Array(qtyNum).fill(0).map(()=>cartItem)
    setCart([...cart, ...items]); 
    setShowCart(true)
    setSelectedProduct(null)
  }
  const openProductDetail = (p: any) => {
    setSelectedProduct(p)
    setQty(1)
    setSelSize(p.sizes && p.sizes[0] ? p.sizes[0] : '')
    setSelColor(p.colors && p.colors[0] ? p.colors[0] : '')
    track('product_view', p.id)
  }
  const removeFromCart = (i: number) => setCart(cart.filter((_, idx) => idx !== i))
  
  const orderWhatsApp = () => {
    if (!profile) return
    // Track WhatsApp click - REAL LEAD
    cart.forEach(p => track('whatsapp_click', p.id))
    if (cart.length === 0) track('whatsapp_click')
    
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
        <div className={isEditorial ? 'grid grid-cols-1 md:grid-cols-3 gap-12' : 'grid grid-cols-2 md:grid-cols-4 gap-4'}>{products.map(p=> <ProductCard key={p.id} p={p} onAdd={addToCart} onOpen={openProductDetail} themeId={themeId} storeSlug={profile.store_slug} ownerId={profile.id} track={track} />)}</div>
        {products.length === 0 && <div className="py-20 text-center"><div className="text-[40px] mb-4">{theme.badge}</div><div>No products yet</div><div className="text-[12px] opacity-50 mt-2">Add products from dashboard</div></div>}
      </main>
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-3 md:p-6">
          <div className="bg-white rounded-[24px] w-full max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-[52%] p-4 bg-[#F8F7F5]">
              <Gallery images={selectedProduct.image_urls && selectedProduct.image_urls.length ? selectedProduct.image_urls : [selectedProduct.image_url]} themeId={themeId} productId={selectedProduct.id} storeSlug={profile.store_slug} ownerId={profile.id} onProductView={(id)=>track('product_view', id)} />
            </div>
            <div className="flex-1 p-6 flex flex-col overflow-auto">
              <div className="flex justify-between items-start gap-3">
                <div><h2 className="font-black text-[20px] tracking-tight">{selectedProduct.name}</h2><p className="text-[11px] tracking-widest uppercase text-zinc-500 mt-1">{selectedProduct.category || 'General'} • SKU {selectedProduct.sku || selectedProduct.id.slice(0,6).toUpperCase()}</p></div>
                <button onClick={()=>setSelectedProduct(null)} className="w-8 h-8 border rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors">✕</button>
              </div>
              
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-[24px] font-black">Rs. {selectedProduct.price.toLocaleString()}</span>
                {selectedProduct.original_price > selectedProduct.price && <span className="text-[14px] line-through text-zinc-400">Rs. {selectedProduct.original_price.toLocaleString()}</span>}
                {selectedProduct.original_price > selectedProduct.price && <span className="text-[11px] bg-[#E8FF86] text-black px-2 py-1 rounded-full font-bold">{Math.round((1-selectedProduct.price/selectedProduct.original_price)*100)}% OFF</span>}
              </div>

              {selectedProduct.description && <p className="mt-4 text-[13px] leading-[1.6] text-zinc-600">{selectedProduct.description}</p>}

              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div className="mt-6">
                  <div className="text-[11px] font-bold tracking-widest uppercase text-zinc-500">Select Size</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedProduct.sizes.map((s:string)=><button key={s} onClick={()=>setSelSize(s)} className={`h-9 px-4 rounded-full border text-[13px] font-medium ${selSize===s ? 'bg-black text-white border-black' : 'bg-white hover:border-black'}`}>{s}</button>)}
                  </div>
                </div>
              )}

              {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                <div className="mt-4">
                  <div className="text-[11px] font-bold tracking-widest uppercase text-zinc-500">Select Color</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedProduct.colors.map((c:string)=><button key={c} onClick={()=>setSelColor(c)} className={`h-9 px-4 rounded-full border text-[13px] font-medium ${selColor===c ? 'bg-black text-white border-black' : 'bg-white hover:border-black'}`}>{c}</button>)}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <div className="text-[11px] font-bold tracking-widest uppercase text-zinc-500">Quantity</div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center border rounded-full h-11 bg-white">
                    <button onClick={()=>setQty(Math.max(1, qty-1))} className="w-11 h-11 flex items-center justify-center text-[18px] hover:bg-zinc-50 rounded-l-full">−</button>
                    <span className="w-12 text-center font-black text-[14px]">{qty}</span>
                    <button onClick={()=>setQty(Math.min(selectedProduct.stock || 100, qty+1))} className="w-11 h-11 flex items-center justify-center text-[18px] hover:bg-zinc-50 rounded-r-full">+</button>
                  </div>
                  <span className="text-[11px] text-zinc-500">{selectedProduct.stock || 100} in stock • {qty} selected</span>
                </div>
              </div>

              <div className="mt-auto pt-6 flex gap-3">
                <button onClick={()=>addToCart(selectedProduct, qty, selSize, selColor)} className="flex-1 h-12 bg-black text-white rounded-full font-bold text-[14px] hover:bg-zinc-900">Add {qty} to Cart — Rs. {(selectedProduct.price*qty).toLocaleString()}</button>
                <button onClick={()=>{addToCart(selectedProduct, qty, selSize, selColor); setShowCart(true)}} className="h-12 px-6 border rounded-full font-bold text-[13px]">Buy Now</button>
              </div>

              <div className="mt-4 flex items-center gap-2 text-[11px] text-zinc-500"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />Premium hover works • {selectedProduct.image_urls?.length || 1} images • Auto slides on hover</div>
            </div>
          </div>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end"><div className={`w-full max-w-sm h-full flex flex-col ${isDark ? 'bg-[#141414] text-white' : 'bg-white'}`}><div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-zinc-200'}`}><h3 className="font-semibold text-[15px]">Cart ({cart.length})</h3><button onClick={()=>setShowCart(false)} style={{borderRadius:10}} className="w-8 h-8 border flex items-center justify-center">✕</button></div><div className="flex-1 overflow-auto p-6 space-y-3">{cart.map((p,i)=><div key={i} className={`flex gap-3 p-3 rounded-[12px] ${isDark ? 'bg-white/5' : 'bg-zinc-50'}`}><img src={p.image_url} className="w-14 h-14 rounded-[8px] object-cover" alt="" /><div className="flex-1"><div className="text-[13px] font-medium">{p.name}</div><div className="text-[13px] font-bold">Rs. {p.price}</div></div><button onClick={()=>removeFromCart(i)} className="text-[11px] opacity-60">Remove</button></div>)}{cart.length===0 && <div className="text-[13px] opacity-60 py-10 text-center">Cart empty</div>}</div><div className={`p-6 border-t space-y-3 ${isDark ? 'border-white/10' : 'border-zinc-200'}`}><input placeholder="Your name" value={customerName} onChange={e=>setCustomerName(e.target.value)} style={{borderRadius:12}} className={`w-full h-11 px-4 border text-[14px] ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-zinc-200'}`} /><input placeholder="Full address" value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} style={{borderRadius:12}} className={`w-full h-11 px-4 border text-[14px] ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-zinc-200'}`} /><div className="flex justify-between font-bold text-[14px]"><span>Total</span><span>Rs. {cart.reduce((s,p)=>s+p.price,0)}</span></div><button onClick={orderWhatsApp} style={{borderRadius:12, background: theme.colors.accent, color: themeId === 'clothing-street' || themeId === 'sleek-dark' ? '#000' : '#fff'}} className="w-full h-11 font-medium text-[14px]">Order on WhatsApp</button></div></div></div>
      )}
    </div>
  )
}
