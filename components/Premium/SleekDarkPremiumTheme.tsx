'use client'
import { useState } from 'react'

function SleekBase({ profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct, variant }: any) {
  const [localShowCart, setLocalShowCart] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [activeBrand, setActiveBrand] = useState('All')
  const [liked, setLiked] = useState<string[]>([])
  const [qty, setQty] = useState(1)
  const custom = profile?.premium_custom || {}
  const isBeige = variant==='beige'
  const isDark = variant==='dark'
  const isEditorial = variant==='editorial'

  const announcement = custom.announcement || (isBeige ? 'FREE SHIPPING • NEW DROP • COD • PREMIUM BEIGE COLLECTION • CONCIERGE' : isDark ? 'DARK MODE • LUXURY • FREE SHIPPING • COD • 24H DISPATCH • PREMIUM' : 'EDITORIAL • MINIMAL • LUXURY • FREE SHIPPING • COD • LESS BUT BETTER')
  const badge = custom.badge || custom.heroBadge || (isBeige ? 'EDITORIAL • BEIGE • 2024' : isDark ? 'NOIR • DARK • 2024' : 'EDITORIAL • MINIMAL • 2024')
  const heroTitle = custom.heroTitle || (isBeige ? 'Warm minimal\nluxury, everyday\nicon.' : isDark ? 'Noir luxury,\nmidnight\nicon.' : 'Cool and Aakif\nstyle — editorial\nminimal.')
  const heroSubtitle = custom.heroSubtitle || (isBeige ? 'Soft beige tones, natural texture, premium stitch. Curated for icons who value warmth and craft.' : isDark ? 'Deep black, subtle glow, premium finish. Designed for night, worn for power.' : 'Clean lines, intentional whitespace, premium finish. Less is luxury. Less but better.')
  const heroImage = custom.heroImage || products[0]?.image_url
  const ctaText = custom.ctaText || (isBeige ? 'Shop Beige →' : isDark ? 'Shop Dark →' : 'Shop Editorial →')
  const brands = custom.brands || custom.filters || custom.spikeBrands || ['All','Nike','Adidas','Puma','New Balance','New','Sale']
  const headerLabel = custom.headerLabel || (isBeige ? 'BEIGE • Studio' : isDark ? 'DARK • Studio' : 'EDITORIAL • Studio')
  const headerTopLabel = custom.headerTopLabel || 'PREMIUM • EDITORIAL'
  const featuredLabel = custom.featuredLabel || 'FEATURED • NEW'
  const freeShippingBadge = custom.freeShippingBadge || 'FREE SHIPPING'
  const hotBadge = custom.hotBadge || (isDark ? 'HOT' : 'NEW')
  const statsOrders = custom.statsOrders || '500+'
  const statsRating = custom.statsRating || '4.9★'
  const statsCod = custom.statsCod || 'COD'

  const cartCount = cart?.length || 0
  const cartTotal = cart?.reduce((s:any,p:any)=>s+p.price,0) || 0
  const openCart = () => { setLocalShowCart(true); if(setShowCart) setShowCart(true) }
  const closeCart = () => { setLocalShowCart(false); if(setShowCart) setShowCart(false) }
  const toggleLike = (id:string)=> setLiked(prev=> prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id])
  const filtered = activeBrand==='All' ? products : products.filter((p:any)=> (p.name+p.category||'').toLowerCase().includes(activeBrand.toLowerCase()))

  const orderWhatsApp = () => {
    if(!profile || cart.length===0) return
    if(!customerName.trim()){ alert('Enter name'); return }
    if(!customerAddress.trim()){ alert('Enter address'); return }
    cart.forEach((p:any)=>track?.('whatsapp_click',p.id))
    const lines = cart.map((p:any)=>`• ${p.name} - Rs. ${p.price}`).join('%0A')
    const msg = `Hi ${profile.business_name}!%0AOrder ${variant.toUpperCase()} PREMIUM STORE%0A${lines}%0ATotal: Rs. ${cartTotal}%0AName: ${customerName}%0AAddress: ${customerAddress}%0AStore: ${typeof window!=='undefined'? window.location.href:''}`
    window.open(`https://wa.me/${profile.whatsapp_number}?text=${msg}`,'_blank')
  }

  const bg = isDark ? 'bg-[#050505] text-white' : isBeige ? 'bg-[#F5F1EB] text-[#0A0A0A]' : 'bg-[#FCFBF9] text-[#0A0A0A]'
  const cardBg = isDark ? 'bg-[#141414] border-white/10' : 'bg-white border-black/[0.06]'
  const muted = isDark ? 'text-white/50' : 'text-black/50'

  return (
    <div className={`min-h-screen ${bg} antialiased selection:bg-black selection:text-white`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fragment+Mono:ital@0;1&family=Instrument+Serif:ital@0;1&display=swap');
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .font-serif{font-family:'Instrument Serif', serif}
        .font-mono{font-family:'Fragment Mono', monospace}
        .glass{backdrop-filter:blur(24px) saturate(1.2)}
      `}</style>

      <div className={`${isDark ? 'bg-[#E8FF86] text-black' : isBeige ? 'bg-black text-[#E8FF86]' : 'bg-[#0A0A0A] text-white'} h-7 md:h-8 flex items-center overflow-hidden border-b ${isDark ? 'border-black/10' : 'border-transparent'}`}>
        <div className="flex animate-[marquee_24s_linear_infinite] whitespace-nowrap gap-10 text-[10px] font-black tracking-[0.18em]">
          <span>{announcement}</span><span>{announcement}</span><span>{announcement}</span><span>{announcement}</span>
        </div>
      </div>

      <header className={`h-[56px] md:h-[64px] border-b sticky top-0 z-30 glass ${isDark ? 'bg-black/80 border-white/10' : isBeige ? 'bg-[#F5F1EB]/85 border-black/10' : 'bg-[#FCFBF9]/85 border-black/10'}`}>
        <div className="max-w-[1320px] mx-auto h-full px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="font-black text-[13px] md:text-[14px] tracking-[0.14em]">{custom.headerLabel || headerLabel}</div>
            {isEditorial && <div className="hidden md:flex h-6 px-3 bg-black text-white rounded-full text-[9px] font-bold tracking-widest items-center">{custom.headerTopLabel || headerTopLabel}</div>}
            <div className="hidden lg:flex items-center gap-2 ml-6">
              {brands.slice(0,4).map((b:string)=><button key={b} onClick={()=>setActiveBrand(b)} className={`h-7 px-3.5 rounded-full text-[11px] font-bold border transition-all ${activeBrand===b ? 'bg-black text-white border-black' : isDark ? 'bg-white/10 border-white/10 text-white/60 hover:text-white' : 'bg-white border-black/10 hover:border-black/20'}`}>{b}</button>)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-[10px] font-mono tracking-widest opacity-60"><span>✦</span><span>{products.length} PRODUCTS</span><span>•</span><span>COD</span></div>
            <button onClick={openCart} className={`h-9 md:h-10 px-4 md:px-5 rounded-full text-[12px] font-black flex items-center gap-2 transition-transform hover:scale-[1.02] ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>Cart <span className={`w-5 h-5 rounded-full grid place-items-center text-[10px] ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>{cartCount}</span></button>
          </div>
        </div>
      </header>

      <section className="max-w-[1320px] mx-auto px-4 md:px-6 py-8 md:py-14 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-12 items-start">
        <div className="lg:sticky lg:top-[104px]">
          <div className={`inline-flex h-7 px-3.5 rounded-full text-[10px] font-black tracking-[0.16em] items-center border ${isDark ? 'bg-white/10 border-white/15 text-white' : 'bg-white border-black/10 shadow-sm'}`}>{badge}</div>
          <h1 className="mt-5 md:mt-7 text-[38px] md:text-[68px] leading-[0.85] tracking-[-0.04em] font-[900] whitespace-pre-line font-serif">{heroTitle}</h1>
          <p className={`mt-4 md:mt-6 text-[13px] md:text-[14px] leading-[1.5] max-w-[420px] ${muted}`}>{heroSubtitle}</p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            <button onClick={()=>document.getElementById('collection')?.scrollIntoView({behavior:'smooth'})} className={`h-11 md:h-12 px-6 md:px-7 rounded-full text-[13px] font-black tracking-[-0.01em] transition-transform hover:scale-[1.02] ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>{ctaText}</button>
            <div className={`h-11 md:h-12 px-4 rounded-full border text-[11px] font-bold flex items-center gap-2 ${isDark ? 'border-white/15 bg-white/5' : 'border-black/10 bg-white'}`}>
              <span className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse" /> WhatsApp COD Available
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-1.5">
            {brands.map((b:string)=><button key={b} onClick={()=>setActiveBrand(b)} className={`h-8 px-4 rounded-full text-[12px] font-bold border transition-all ${activeBrand===b ? 'bg-black text-white border-black shadow-[0_4px_12px_rgba(0,0,0,0.15)]' : isDark ? 'bg-[#141414] border-white/10 text-white/60 hover:text-white hover:border-white/20' : 'bg-white border-black/10 hover:border-black/20'}`}>{b}</button>)}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2.5 max-w-[400px]">
            <div className={`${cardBg} border rounded-[14px] p-3.5`}><div className="font-black text-[16px]">{statsOrders}</div><div className="text-[10px] tracking-widest font-bold opacity-60 mt-1">ORDERS</div></div>
            <div className={`${cardBg} border rounded-[14px] p-3.5`}><div className="font-black text-[16px]">{statsRating}</div><div className="text-[10px] tracking-widest font-bold opacity-60 mt-1">RATING</div></div>
            <div className={`${cardBg} border rounded-[14px] p-3.5`}><div className="font-black text-[16px]">{statsCod}</div><div className="text-[10px] tracking-widest font-bold opacity-60 mt-1">AVAILABLE</div></div>
          </div>

          <div className="mt-6 flex items-center gap-3 text-[11px]">
            <div className="flex -space-x-1.5">{[0,1,2].map(i=><img key={i} src={products[i]?.image_url} className="w-7 h-7 rounded-full border-2 border-white object-cover" alt="" />)}</div>
            <div className={`${muted} font-medium`}>Trusted by {statsOrders} customers • 7-day return • Free shipping over 5000</div>
          </div>
        </div>

        <div className="relative">
          <div className={`relative w-full max-w-[440px] mx-auto aspect-[4/5.2] rounded-[32px] md:rounded-[40px] overflow-hidden border shadow-[0_32px_80px_-16px_rgba(0,0,0,0.18)] ${isDark ? 'bg-[#141414] border-white/10' : 'bg-white border-black/5'}`}>
            <img src={heroImage} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="h-7 px-3 bg-white text-black rounded-full text-[10px] font-black tracking-widest flex items-center shadow">{freeShippingBadge}</div>
              <div className="h-7 px-3 bg-black text-white rounded-full text-[10px] font-black tracking-widest flex items-center">{hotBadge}</div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex justify-between items-end text-white">
                <div><div className="text-[11px] font-bold tracking-widest opacity-80">{featuredLabel}</div><div className="mt-1 text-[14px] font-bold">{products[0]?.name}</div><div className="text-[12px] opacity-70">Rs. {products[0]?.price?.toLocaleString()}</div></div>
                <button onClick={()=>{ onOpen(products[0]); }} className="h-9 w-9 bg-white text-black rounded-full grid place-items-center font-black">↗</button>
              </div>
            </div>
            <div className="absolute -right-3 -top-3 w-20 h-20 rounded-full border grid place-items-center text-[10px] font-black tracking-widest backdrop-blur bg-white/90 text-black border-black/10 shadow-xl rotate-12">{isBeige ? 'BEIGE' : isDark ? 'NOIR' : 'EDIT'}</div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2.5 max-w-[440px] mx-auto">
            {products.slice(1,4).map((p:any)=><div key={p.id} onClick={()=>onOpen(p)} className={`${cardBg} border rounded-[16px] p-2 cursor-pointer hover:-translate-y-1 transition-transform`}><img src={p.image_url} className="w-full aspect-square object-cover rounded-[10px]" alt="" /><div className="mt-2 text-[11px] font-bold truncate">{p.name}</div><div className="text-[11px] font-black">Rs. {p.price}</div></div>)}
          </div>
        </div>
      </section>

      <main id="collection" className="max-w-[1320px] mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div><div className="text-[10px] font-black tracking-[0.18em] opacity-60">COLLECTION / {filtered.length}</div><h2 className="mt-2 text-[24px] md:text-[32px] font-black tracking-[-0.02em] leading-[0.9]">{activeBrand==='All' ? 'All Products' : activeBrand} — {isBeige ? 'Beige Studio' : isDark ? 'Dark Studio' : 'Editorial Studio'}</h2></div>
          <div className="hidden md:flex items-center gap-2 text-[11px] font-bold"><span className={muted}>Sort:</span><span className="h-8 px-4 bg-black text-white rounded-full grid place-items-center">Newest</span></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((p:any,i:number)=>(
            <div key={p.id} className={`group ${cardBg} border rounded-[20px] p-2.5 md:p-3 cursor-pointer hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all`}>
              <div className="relative aspect-square rounded-[14px] overflow-hidden bg-[#F5F4F1]">
                <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-[1.04] transition duration-700" alt="" />
                <div className="absolute top-2 left-2 flex gap-1.5">
                  {i<2 && <div className="h-6 px-2.5 bg-[#E8FF86] text-black border border-black rounded-full text-[9px] font-black grid place-items-center">{hotBadge}</div>}
                  {i===1 && <div className="h-6 px-2.5 bg-white text-black border rounded-full text-[9px] font-black grid place-items-center">{freeShippingBadge}</div>}
                </div>
                <button onClick={(e)=>{ e.stopPropagation(); toggleLike(p.id) }} className={`absolute top-2 right-2 w-7 h-7 rounded-full border grid place-items-center text-[12px] backdrop-blur ${liked.includes(p.id) ? 'bg-black text-white border-black' : 'bg-white/80 border-black/10'}`}>{liked.includes(p.id)?'♥':'♡'}</button>
                <div className="absolute bottom-2 left-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={(e)=>{ e.stopPropagation(); setQty(1); onOpen(p) }} className="flex-1 h-8 bg-white text-black rounded-full text-[11px] font-bold shadow">Quick View</button>
                  <button onClick={(e)=>{ e.stopPropagation(); onAdd(p); }} className="h-8 w-8 bg-black text-white rounded-full grid place-items-center font-bold">+</button>
                </div>
              </div>
              <div className="mt-3 px-1">
                <div className="flex justify-between gap-2"><div className="font-bold text-[12px] md:text-[13px] leading-[1.2] line-clamp-1">{p.name}</div><div className="font-black text-[12px] md:text-[13px] shrink-0">Rs. {p.price.toLocaleString()}</div></div>
                <div className={`mt-1 text-[11px] ${muted} line-clamp-1`}>Premium • COD • Free Shipping</div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <div className="flex gap-1">{[0,1,2].map(k=><div key={k} className="w-3 h-3 rounded-full border border-black/10" style={{background: ['#0A0A0A','#E8E6E1','#7C3AED'][k]}} />)}</div>
                  <div className="text-[10px] font-bold opacity-60">• EU 28-34 • 3 colors</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-12 md:mt-16 rounded-[24px] md:rounded-[32px] border p-6 md:p-10 grid md:grid-cols-2 gap-8 items-center ${isDark ? 'bg-[#0A0A0A] border-white/10' : isBeige ? 'bg-[#0A0A0A] text-[#F5F1EB] border-black' : 'bg-[#0A0A0A] text-white border-black'}`}>
          <div>
            <div className="text-[10px] font-black tracking-[0.2em] opacity-60">OUR STORY / {isBeige ? 'BEIGE' : isDark ? 'DARK' : 'EDITORIAL'}</div>
            <h3 className="mt-3 text-[28px] md:text-[40px] font-black leading-[0.9] tracking-[-0.02em] whitespace-pre-line font-serif">{heroTitle}</h3>
            <p className="mt-4 text-[13px] leading-[1.6] opacity-70 max-w-[420px]">{heroSubtitle} Curated for modern icons, built for everyday. Each piece tells a story of craftsmanship, minimalism, and intent.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { k: 'Craft', v: 'Hand-finished, 48h process' },
                { k: 'Return', v: '7 days, no questions' },
                { k: 'Shipping', v: 'Free over Rs. 5000 + COD' },
              ].map(s=><div key={s.k} className="h-10 px-4 rounded-full bg-white/10 border border-white/10 flex items-center gap-2 text-[11px]"><span className="font-black tracking-widest">{s.k.toUpperCase()}</span><span className="opacity-60">{s.v}</span></div>)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-3">
              <div className="aspect-[4/5] rounded-[20px] overflow-hidden bg-white/5 border border-white/10"><img src={products[1]?.image_url} className="w-full h-full object-cover" alt="" /></div>
              <div className="h-12 rounded-[14px] bg-[#E8FF86] text-black grid place-items-center font-black text-[11px] tracking-widest">{statsOrders} ORDERS • {statsRating} RATING</div>
            </div>
            <div className="space-y-3 pt-6">
              <div className="aspect-[4/5] rounded-[20px] overflow-hidden bg-white/5 border border-white/10"><img src={products[2]?.image_url || heroImage} className="w-full h-full object-cover" alt="" /></div>
              <div className="h-12 rounded-[14px] bg-white text-black grid place-items-center font-black text-[11px] tracking-widest">{freeShippingBadge} • {statsCod}</div>
            </div>
          </div>
        </div>
      </main>

      <footer className={`border-t mt-8 ${isDark ? 'border-white/10 bg-black' : 'border-black/10 bg-white/50'}`}>
        <div className="max-w-[1320px] mx-auto px-6 py-8 flex flex-wrap justify-between gap-4 text-[11px]">
          <div className="font-black tracking-widest">{custom.headerLabel || headerLabel} • {profile?.business_name} • {new Date().getFullYear()}</div>
          <div className="flex gap-4 opacity-60 font-medium"><span>Instagram</span><span>WhatsApp</span><span>Shipping</span><span>Returns</span></div>
        </div>
      </footer>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[8px] z-50 grid place-items-center p-3 md:p-4">
          <div className="bg-white text-black rounded-[24px] w-full max-w-[880px] grid md:grid-cols-[1.1fr_0.9fr] overflow-hidden max-h-[92vh] shadow-[0_32px_80px_rgba(0,0,0,0.4)]">
            <div className="relative bg-[#F5F4F1] p-3 md:p-4"><img src={selectedProduct.image_url} className="w-full aspect-square object-cover rounded-[16px]" alt="" /><div className="absolute top-6 left-6 h-7 px-3 bg-white rounded-full text-[10px] font-black grid place-items-center border shadow">{freeShippingBadge}</div><button onClick={()=>setSelectedProduct(null)} className="absolute top-6 right-6 w-8 h-8 bg-black text-white rounded-full grid place-items-center">✕</button></div>
            <div className="p-5 md:p-6 flex flex-col overflow-auto">
              <div className="flex justify-between items-start gap-3"><h2 className="font-black text-[20px] leading-[1.1]">{selectedProduct.name}</h2><div className="font-black text-[18px]">Rs. {selectedProduct.price.toLocaleString()}</div></div>
              <p className="mt-3 text-[12px] leading-[1.5] text-black/60">{selectedProduct.description || heroSubtitle}</p>
              <div className="mt-4 flex items-center justify-between"><div className="text-[10px] font-black">QTY</div><div className="flex items-center gap-2 bg-[#F5F1EB] rounded-full p-1 border"><button onClick={()=>setQty(Math.max(1,qty-1))} className="w-7 h-7 bg-white border rounded-full grid place-items-center font-bold">−</button><span className="w-7 text-center font-black">{qty}</span><button onClick={()=>setQty(qty+1)} className="w-7 h-7 bg-white border rounded-full grid place-items-center font-bold">+</button></div></div>
              <div className="mt-auto pt-6 grid grid-cols-[1fr_56px] gap-2"><button onClick={()=>{ for(let i=0;i<qty;i++) onAdd(selectedProduct); setSelectedProduct(null); setTimeout(()=>openCart(),300) }} className="h-12 bg-black text-white rounded-full font-black text-[13px]">Add to Cart — Rs. {(selectedProduct.price*qty).toLocaleString()}</button><button className="h-12 w-14 bg-[#E8FF86] text-black rounded-full grid place-items-center font-black text-[18px] border border-black">↗</button></div>
              <div className="mt-3 text-[10px] text-black/50 text-center">COD • Free Shipping over 5000 • 7 Days Return • WhatsApp Support</div>
            </div>
          </div>
        </div>
      )}

      <div className={`fixed inset-0 z-50 ${localShowCart ? '' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition ${localShowCart ? 'opacity-100' : 'opacity-0'}`} onClick={closeCart} />
        <div className={`absolute right-0 top-0 bottom-0 w-full max-w-[400px] bg-white text-black flex flex-col shadow-[-16px_0_64px_rgba(0,0,0,0.2)] transition-transform ${localShowCart ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-5 border-b flex justify-between items-center"><h3 className="font-black text-[14px] tracking-[-0.01em]">Cart ({cartCount}) — {custom.headerLabel || headerLabel}</h3><button onClick={closeCart} className="w-8 h-8 border rounded-full grid place-items-center">✕</button></div>
          <div className="flex-1 overflow-auto p-3 space-y-2.5">
            {cart.length===0 ? <div className="py-20 text-center"><div className="text-[14px] font-bold">Your cart is empty</div><div className="mt-2 text-[12px] text-black/50">Add some products from {custom.headerLabel || headerLabel}</div></div> : cart.map((p:any,i:number)=><div key={i} className="flex gap-3 p-3 bg-[#F5F1EB] rounded-[14px] border"><img src={p.image_url} className="w-14 h-14 rounded-[10px] object-cover" alt="" /><div className="flex-1"><div className="font-bold text-[12px]">{p.name}</div><div className="text-[11px] text-black/50">Rs. {p.price} • EU 31 • Black</div></div><div className="font-black text-[12px]">Rs. {p.price}</div></div>)}
          </div>
          {cartCount>0 && <div className="p-5 border-t space-y-3"><div className="flex justify-between font-black text-[13px]"><span>Total</span><span>Rs. {cartTotal.toLocaleString()}</span></div><input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Full Name" className="w-full h-11 px-4 border rounded-[12px] text-[13px] outline-none focus:border-black" /><input value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} placeholder="Full Address + City" className="w-full h-11 px-4 border rounded-[12px] text-[13px] outline-none focus:border-black" /><button onClick={orderWhatsApp} className="w-full h-12 bg-[#25D366] text-white rounded-full font-black text-[13px] flex items-center justify-center gap-2">Order on WhatsApp →</button><div className="text-[10px] text-center text-black/50">COD • Free Shipping • 7 Days Return • Premium Packaging</div></div>}
        </div>
      </div>
    </div>
  )
}




export function SleekDarkPremiumTheme(props:any){ return SleekBase({...props, variant:'dark'}) }
