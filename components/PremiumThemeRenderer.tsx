
'use client'
import { useState, useEffect } from 'react'

type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; description?: string }

function Gallery({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0)
  const [hover, setHover] = useState(false)
  useEffect(()=>{ if(!hover || images.length<=1) return; const iv=setInterval(()=>setIdx(p=>(p+1)%images.length),2000); return()=>clearInterval(iv)},[hover, images.length])
  return (
    <div className="relative group" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
      <div className="overflow-hidden rounded-[18px] aspect-[4/3] bg-[#F5F4F1] border border-black/[0.06]"><img src={images[idx]} className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-700" alt="" /><div className="absolute top-2.5 left-2.5 bg-black text-white text-[9px] px-2 h-5 rounded-full font-bold grid place-items-center">{idx+1}/{images.length}</div></div>
      <div className="flex gap-1.5 mt-2.5 overflow-x-auto no-scrollbar">{images.map((u,i)=><button key={i} onClick={()=>setIdx(i)} className={`w-[52px] h-[52px] rounded-[10px] overflow-hidden border-2 shrink-0 ${i===idx?'border-black':'border-transparent opacity-60'}`}><img src={u} className="w-full h-full object-cover" alt=""/></button>)}</div>
    </div>
  )
}

export function SpikePremiumTheme({ profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }: any) {
  const [activeBrand, setActiveBrand] = useState('All')
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [qty, setQty] = useState(1)
  const [localShowCart, setLocalShowCart] = useState(false)
  const custom = profile?.premium_custom || {}
  const heroTitle = custom.heroTitle || custom.spikeTitle || 'The journey begins with the perfect pair'
  const heroSub = custom.heroSubtitle || custom.spikeSub || 'Dive into unparalleled comfort with unmatched style. Find your perfect stride.'
  const brandList = custom.brands || custom.spikeBrands || ['All','Nike','Adidas','Puma','New Balance']
  const announcement = custom.announcement || 'FREE SHIPPING OVER RS. 5000 • NEW DROP LIVE • COD AVAILABLE'
  const heroImage = custom.heroImage || products[0]?.image_url
  const headerLabel = custom.headerLabel || `${custom.headerPrefix || 'SPIKE'} • ${profile?.business_name || ''}`
  const heroBadge = custom.heroBadge || custom.badge || 'New Drop • Live • COD'
  const ctaText = custom.ctaText || 'Shop Now →'
  const freeShippingBadge = custom.freeShippingBadge || 'FREE SHIPPING'
  const hotBadge = custom.hotBadge || 'HOT'
  const statsOrders = custom.statsOrders || '500+'
  const statsOrdersLabel = custom.statsOrdersLabel || 'Orders'
  const statsRating = custom.statsRating || '4.9★'
  const statsRatingLabel = custom.statsRatingLabel || 'Rating'
  const statsCod = custom.statsCod || 'COD'
  const statsCodLabel = custom.statsCodLabel || 'Available'
  const cartCount = cart?.length || 0
  const cartTotal = cart?.reduce((s:any,p:any)=>s+p.price,0) || 0
  const openCart = () => { setLocalShowCart(true); if(setShowCart) setShowCart(true) }
  const closeCart = () => { setLocalShowCart(false); if(setShowCart) setShowCart(false) }
  const filtered = activeBrand==='All' ? products : products.filter((p:any)=> (p.name+p.category||'').toLowerCase().includes(activeBrand.toLowerCase()))
  const orderWhatsApp = () => {
    if(!profile || cart.length===0) return
    if(!customerName.trim()){ alert('Please enter your name'); return }
    if(!customerAddress.trim()){ alert('Please enter your address'); return }
    cart.forEach((p:any)=>track?.('whatsapp_click',p.id))
    const lines = cart.map((p:any)=>`• ${p.name} - Rs. ${p.price}`).join('%0A')
    const msg = `Hi ${profile.business_name}!%0ASPIKE PREMIUM ORDER%0A${lines}%0ATotal: Rs. ${cartTotal}%0AName: ${customerName}%0AAddress: ${customerAddress}`
    window.open(`https://wa.me/${profile.whatsapp_number}?text=${msg}`,'_blank')
  }
  const handleAdd = (p:any, direct=false) => { const prod = {...p, selectedSize}; onAdd(prod, qty); setSelectedProduct(null); setQty(1); if(direct) setTimeout(()=>openCart(),300) }
  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#0A0A0A]">
      <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      <div className="bg-black text-white text-[10px] tracking-widest h-8 flex items-center overflow-hidden"><div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap gap-8"><span>{announcement}</span><span>{announcement}</span><span>{announcement}</span></div></div>
      <header className="sticky top-0 z-20 bg-[#FCFBF9]/80 backdrop-blur border-b border-black/10"><div className="max-w-[1320px] mx-auto px-4 h-[56px] flex items-center justify-between"><div className="font-black text-[15px]">{headerLabel}</div><button onClick={openCart} className="h-8 px-3.5 bg-black text-white rounded-full text-[11px] font-bold">Cart ({cartCount})</button></div></header>
      <section className="max-w-[1320px] mx-auto px-4 py-6 md:py-10 grid md:grid-cols-2 gap-6">
        <div>
          <div className="inline-flex border rounded-full px-2.5 h-6 text-[10px] uppercase font-bold tracking-widest">{heroBadge}</div>
          <h1 className="mt-4 md:mt-6 text-[32px] md:text-[56px] font-[800] leading-[0.88] tracking-[-0.04em] whitespace-pre-line">{heroTitle}</h1>
          <p className="mt-3 md:mt-4 text-[12px] md:text-[13px] text-black/50 max-w-[340px] leading-[1.4]">{heroSub}</p>
          <div className="mt-5 flex gap-2"><button onClick={()=>document.getElementById('coll')?.scrollIntoView({behavior:'smooth'})} className="h-10 md:h-11 px-5 md:px-6 bg-black text-white rounded-full text-[12px] md:text-[13px] font-bold">{ctaText}</button></div>
          <div className="mt-6 flex flex-wrap gap-1.5">{brandList.map((b:any)=><button key={b} onClick={()=>setActiveBrand(b)} className={`h-7 px-3.5 rounded-full text-[11px] font-bold border ${activeBrand===b?'bg-black text-white':'bg-white hover:border-black/20'}`}>{b}</button>)}</div>
          <div className="mt-6 grid grid-cols-3 gap-2 text-[10px] mono"><div className="bg-white border rounded-[10px] p-2.5"><div className="font-black">{statsOrders}</div><div className="text-black/40">{statsOrdersLabel}</div></div><div className="bg-white border rounded-[10px] p-2.5"><div className="font-black">{statsRating}</div><div className="text-black/40">{statsRatingLabel}</div></div><div className="bg-white border rounded-[10px] p-2.5"><div className="font-black">{statsCod}</div><div className="text-black/40">{statsCodLabel}</div></div></div>
        </div>
        <div className="relative bg-white rounded-[20px] md:rounded-[28px] p-3 md:p-4 border shadow-[0_24px_64px_-20px_rgba(0,0,0,0.18)] h-fit"><img src={heroImage} className="w-full aspect-square object-cover rounded-[14px] md:rounded-[18px]" alt=""/><div className="absolute top-5 right-5 bg-white border rounded-full px-2.5 h-6 text-[10px] font-bold grid place-items-center">{freeShippingBadge}</div></div>
      </section>
      <section id="coll" className="max-w-[1320px] mx-auto px-4 py-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{filtered.map((p:any)=><div key={p.id} onClick={()=>{ setSelectedSize(''); setQty(1); onOpen(p)}} className="bg-white border rounded-[16px] p-2.5 cursor-pointer"><div className="relative"><img src={p.image_url} className="w-full aspect-square object-cover rounded-[10px]" alt=""/><div className="absolute top-2 left-2 h-5 px-2 bg-[#E8FF86] border border-black rounded-full text-[8px] font-black grid place-items-center">{hotBadge}</div></div><div className="mt-2 text-[12px] font-bold truncate">{p.name}</div><div className="text-[13px] font-black">Rs. {p.price}</div></div>)}</div></section>
      {selectedProduct && <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-3"><div className="bg-white rounded-[20px] w-full max-w-[960px] max-h-[90vh] overflow-auto grid md:grid-cols-2"><div className="p-4 bg-[#F6F5F2]"><Gallery images={selectedProduct.image_urls?.length? selectedProduct.image_urls : [selectedProduct.image_url]} /></div><div className="p-5 flex flex-col"><div className="flex justify-between"><h2 className="text-[20px] font-bold">{selectedProduct.name}</h2><button onClick={()=>setSelectedProduct(null)} className="w-8 h-8 border rounded-full">✕</button></div><div className="mt-3 text-[20px] font-black">Rs. {selectedProduct.price}</div><div className="mt-4"><div className="text-[10px] font-black">SIZE</div><div className="mt-2 flex flex-wrap gap-1.5">{(selectedProduct.sizes || custom.sizes || ['40','41','42']).map((s:string)=><button key={s} onClick={()=>setSelectedSize(s)} className={`h-8 px-3.5 border rounded-full text-[11px] font-bold ${selectedSize===s?'bg-black text-white':'bg-white'}`}>{s}</button>)}</div></div><div className="mt-auto pt-5 grid grid-cols-2 gap-2"><button onClick={()=>handleAdd(selectedProduct,false)} className="h-10 bg-black text-white rounded-full font-bold text-[12px]">Add to Cart</button><button onClick={()=>handleAdd(selectedProduct,true)} className="h-10 bg-[#25D366] text-white rounded-full font-bold text-[12px]">WhatsApp</button></div></div></div></div>}
      <div className={`fixed inset-0 z-[110] ${localShowCart ? '' : 'pointer-events-none'}`}><div className={`absolute inset-0 bg-black/40 ${localShowCart ? 'opacity-100' : 'opacity-0'}`} onClick={closeCart}></div><div className={`absolute right-0 top-0 bottom-0 w-full max-w-[360px] bg-white flex flex-col ${localShowCart ? 'translate-x-0' : 'translate-x-full'} transition-transform`}><div className="p-4 border-b flex justify-between"><h3 className="font-bold text-[13px]">Cart ({cartCount})</h3><button onClick={closeCart}>✕</button></div><div className="flex-1 overflow-auto p-3 space-y-2">{cart.map((p:any,i:number)=><div key={i} className="flex gap-2.5 p-2.5 bg-zinc-50 rounded-[10px]"><img src={p.image_url} className="w-11 h-11 rounded object-cover"/><div className="text-[11px] font-bold">{p.name}</div></div>)}</div>{cartCount>0 && <div className="p-4 border-t space-y-2"><input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Name" className="w-full h-10 px-3 border rounded text-[12px]"/><input value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} placeholder="Address" className="w-full h-10 px-3 border rounded text-[12px]"/><button onClick={orderWhatsApp} className="w-full h-10 bg-[#25D366] text-white rounded-full font-bold text-[12px]">Order WhatsApp</button></div>}</div></div>
    </div>
  )
}

function ShoeAppPremiumTheme({ profile, products, cart, setShowCart, onAdd, onOpen, track }: any) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [activeSize, setActiveSize] = useState(31)
  const [activeColor, setActiveColor] = useState(0)
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [localShowCart, setLocalShowCart] = useState(false)
  const [qty, setQty] = useState(1)
  const [selectedShoe, setSelectedShoe] = useState<any>(null)
  const custom = profile?.premium_custom || {}
  const newDropLabel = custom.newDropLabel || custom.heroBadge || `NEW DROP • ${new Date().getFullYear()}`
  const promoBadge = custom.promoBadge || 'BLACK FRIDAY'
  const promoTitle = (custom.promoTitle || 'GET UP TO\n50% OFF').replace(/\n/g, '\n')
  const promoCta = custom.promoCta || 'Shop Sale →'
  const filterOptions = custom.filters || custom.brands || ['All','Nike','Adidas','New','Sale']
  const memberTitle = custom.memberPerksTitle || 'Free Shipping\n+ 7 Days Return'
  const memberDesc = custom.memberPerksDesc || 'Early access to drops, COD & priority.'
  const memberCta = custom.memberCta || 'Join Premium — Free'
  const announcement = custom.announcement || `${profile?.business_name?.toUpperCase()} • LIVE • COD`
  const headerLabel = custom.headerLabel || 'S • Shoe App'
  const cartCount = cart?.length || 0
  const cartTotal = cart?.reduce((s:any,p:any)=>s+p.price,0) || 0
  const openCart = () => { setLocalShowCart(true); if(setShowCart) setShowCart(true) }
  const closeCart = () => { setLocalShowCart(false); if(setShowCart) setShowCart(false) }
  const colors = custom.colors || [
    { name: 'Violet', bg: '#7C3AED' },
    { name: 'Midnight', bg: '#0A0A0A' },
    { name: 'Cloud', bg: '#E8E8F0' },
    { name: 'Coral', bg: '#FF5A5A' },
    { name: 'Lime', bg: '#E8FF86' },
  ]
  const sizes = custom.sizes || [28,29,30,31,32,33,34]
  useEffect(()=>{ if(products[0] && !selectedShoe) setSelectedShoe(products[0]) },[products])
  const filtered = activeFilter==='All' ? products : products.filter((p:any)=> (p.name+p.category||'').toLowerCase().includes(activeFilter.toLowerCase()))
  const orderWhatsApp = ()=>{
    if(!profile || cart.length===0) return
    if(!customerName.trim()){ alert('Please enter your name'); return }
    if(!customerAddress.trim()){ alert('Please enter your address'); return }
    const lines=cart.map((p:any)=>`• ${p.name} - Rs. ${p.price} (Sz ${activeSize})`).join('%0A')
    const msg=`Hi ${profile.business_name}!%0A%0A🟣 SHOE APP PREMIUM ORDER%0A${lines}%0ATotal: Rs. ${cartTotal.toLocaleString()}%0AName: ${customerName}%0AAddress: ${customerAddress}`
    window.open(`https://wa.me/${profile.whatsapp_number}?text=${msg}`,'_blank')
  }
  const handleAddToCart = (p:any)=>{ const prod={...p,selectedSize:activeSize,selectedColor:colors[activeColor]?.name}; for(let i=0;i<qty;i++) onAdd(prod); setTimeout(()=>openCart(),250) }
  return (
    <div className="min-h-screen bg-[#F2F0FF] text-[#0A0A0A]">
      <style>{`@keyframes floatShoe{0%,100%{transform:rotate(-12deg) translateY(0)}50%{transform:rotate(-12deg) translateY(-8px)}} .no-scrollbar::-webkit-scrollbar{display:none} .shoe-shadow{filter:drop-shadow(0 20px 24px rgba(124,58,237,0.22))}`}</style>
      <div className="max-w-[1440px] mx-auto px-3 md:px-6 py-3 md:py-4">
        <div className="h-[56px] md:h-[64px] bg-white/90 border border-black/[0.06] rounded-[20px] flex items-center justify-between px-5 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-6">
            <div className="w-9 h-9 rounded-[12px] bg-[#0A0A0A] text-white grid place-items-center font-black text-[13px]">{custom.logoLetter || 'S'}</div>
            <div className="hidden md:flex items-center gap-1 bg-[#F2F0FF] rounded-full p-1 border">{filterOptions.map((f:string)=><button key={f} onClick={()=>setActiveFilter(f)} className={`h-7 px-4 rounded-full text-[12px] font-bold ${activeFilter===f?'bg-black text-white shadow':'text-black/60'}`}>{f}</button>)}</div>
            <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold tracking-widest text-black/40">{announcement}</div>
          </div>
          <button onClick={openCart} className="h-9 pl-2 pr-1 bg-black text-white rounded-full flex items-center gap-2 text-[12px] font-bold"><span className="px-2 hidden md:inline">Cart</span><span className="w-7 h-7 bg-white text-black rounded-full grid place-items-center text-[11px] font-black">{cartCount}</span></button>
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto px-3 md:px-6 pb-20 grid lg:grid-cols-[320px_1fr_340px] gap-4">
        <div className="bg-white border rounded-[28px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] overflow-hidden">
          {selectedShoe ? (<><div className="relative bg-[#F8F7FF] h-[260px] p-5 flex items-center justify-center"><div className="absolute top-3 left-3 h-6 px-2.5 bg-white border rounded-full text-[9px] font-black grid place-items-center">{newDropLabel}</div><img src={selectedShoe.image_url} alt="" className="w-[68%] max-h-[180px] object-contain shoe-shadow" /></div><div className="p-4"><h2 className="text-[16px] font-[800]">{selectedShoe.name}</h2><div className="mt-3 grid grid-cols-7 gap-[5px]">{sizes.map((s:any)=><button key={s} onClick={()=>setActiveSize(Number(s))} className={`h-[32px] rounded-[10px] border text-[11px] font-bold ${activeSize==s?'bg-black text-white':'bg-[#F2F0FF] text-black/60'}`}>{s}</button>)}</div><div className="mt-3 flex gap-1">{colors.map((c:any,i:number)=><button key={i} onClick={()=>setActiveColor(i)} className={`w-5 h-5 rounded-full border-2 ${activeColor===i?'border-black':'border-white'}`} style={{background:c.bg || c.hex}} />)}</div><button onClick={()=>handleAddToCart(selectedShoe)} className="mt-4 w-full h-[44px] bg-black text-white rounded-[12px] font-bold text-[12px]">Add — Rs. {(selectedShoe.price*qty).toLocaleString()}</button></div></>) : <div className="p-10 text-center text-[13px] text-black/30">Select a shoe</div>}
        </div>
        <div className="space-y-3">
          <div className="relative h-[160px] rounded-[18px] overflow-hidden bg-[#111AFF] border"><div className="absolute inset-0 p-4"><div className="inline-flex h-5 px-2 bg-white text-[9px] font-black rounded-full items-center">{promoBadge}</div><div className="mt-2 text-white font-[900] text-[24px] leading-[0.9] whitespace-pre-line">{promoTitle.replace(/\n/g,'\n')}</div><button onClick={()=>setActiveFilter('Sale')} className="mt-2 h-7 px-3 bg-white text-black rounded-full text-[10px] font-bold">{promoCta}</button></div></div>
          <div className="grid grid-cols-2 gap-3">{filtered.map((p:any)=>(<div key={p.id} onClick={()=>setSelectedShoe(p)} className={`bg-white border rounded-[18px] p-2.5 cursor-pointer ${selectedShoe?.id===p.id?'border-black ring-2 ring-black ring-offset-2': 'border-black/[0.06]'}`}><div className="aspect-square bg-[#F8F7FF] rounded-[12px] p-3 grid place-items-center"><img src={p.image_url} alt="" className="w-full h-full object-contain" /></div><div className="mt-2.5"><div className="text-[11px] font-bold truncate">{p.name}</div><div className="text-[11px] font-black">Rs. {p.price}</div></div></div>))}</div>
        </div>
        <div className="hidden lg:block space-y-3">
          <div className="bg-[#0A0A0A] text-white rounded-[18px] p-4"><div className="text-[9px] tracking-[0.2em] text-white/50">MEMBER PERKS</div><div className="mt-2 font-[800] text-[15px] leading-[1.05] whitespace-pre-line">{memberTitle}</div><div className="mt-2 text-[10px] text-white/60">{memberDesc}</div><button className="mt-3 w-full h-8 bg-white text-black rounded-full text-[11px] font-bold">{memberCta}</button></div>
        </div>
      </div>
      <div className={`fixed inset-0 z-[120] ${localShowCart ? '' : 'pointer-events-none'}`}><div className={`absolute inset-0 bg-black/50 ${localShowCart ? 'opacity-100' : 'opacity-0'}`} onClick={closeCart}></div><div className={`absolute right-0 top-0 bottom-0 w-full max-w-[380px] bg-white border-l flex flex-col ${localShowCart ? 'translate-x-0' : 'translate-x-full'} transition-transform`}><div className="h-[64px] px-5 border-b flex items-center justify-between"><h3 className="font-black text-[13px]">Your Bag</h3><button onClick={closeCart} className="w-8 h-8 border rounded-full grid place-items-center">✕</button></div><div className="flex-1 overflow-auto p-3 space-y-2.5">{cart.map((p:any,i:number)=><div key={i} className="flex gap-2.5 p-2.5 bg-[#F2F0FF] border rounded-[14px]"><div className="w-[60px] h-[60px] bg-white rounded-[10px] grid place-items-center"><img src={p.image_url} className="w-[48px] h-[48px] object-contain" alt=""/></div><div className="flex-1"><div className="text-[11px] font-bold">{p.name}</div></div></div>)}</div>{cartCount>0 && <div className="p-4 border-t space-y-2.5"><input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Full name" className="w-full h-10 px-3 border rounded-[10px] text-[12px]"/><input value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} placeholder="Address" className="w-full h-10 px-3 border rounded-[10px] text-[12px]"/><button onClick={orderWhatsApp} className="w-full h-10 bg-[#25D366] text-white rounded-full text-[12px] font-bold">WhatsApp Order</button></div>}</div></div>
    </div>
  )
}

function TrenzoLuxuryTheme({ profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }: any) {
  const [localShowCart, setLocalShowCart] = useState(false)
  const [activeStory, setActiveStory] = useState(0)
  const custom = profile?.premium_custom || {}
  const eyebrow = custom.eyebrow || 'EST. 2018 • LUXURY CURATED'
  const heroTitle = (custom.heroTitle || 'A reflection\nof personal\nstyling').replace(/\n/g, '\n')
  const heroSubtitle = custom.heroSubtitle || 'Premium curated collection.'
  const heroImage = custom.heroImage || products[0]?.image_url
  const headerLabel = custom.headerLabel || '✦ TRENZO • LUXURY'
  const announcement = custom.announcement || 'CONCIERGE • 24H SHIPPING'
  const featuredLabel = custom.featuredLabel || 'FEATURED • NEW'
  const luxeBadge = custom.luxeBadge || '✦ LUXE'
  const ctaText = custom.ctaText || 'Explore Collection →'
  const stories = custom.stories || [{title:'Craftsmanship',desc:'Hand-stitched'},{title:'Heritage',desc:'Since 2018'},{title:'Sustainability',desc:'Ethically sourced'}]
  const cartCount = cart?.length || 0
  const openCart = () => { setLocalShowCart(true); if(setShowCart) setShowCart(true) }
  const closeCart = () => { setLocalShowCart(false); if(setShowCart) setShowCart(false) }
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-white/10 text-[10px] tracking-widest h-7 flex items-center justify-center">{announcement}</div>
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-5 sticky top-0 z-20 bg-black/80 backdrop-blur"><div className="font-black tracking-widest text-[12px]">{headerLabel}</div><button onClick={openCart} className="h-8 px-4 bg-white text-black rounded-full text-[11px] font-bold">Cart ({cartCount})</button></header>
      <div className="max-w-[1320px] mx-auto px-4 py-8 grid md:grid-cols-2 gap-8 items-center"><div><div className="inline-flex h-6 px-3 border border-white/20 rounded-full text-[9px] tracking-[0.2em] items-center">{eyebrow}</div><h1 className="mt-4 text-[32px] md:text-[56px] leading-[0.9] font-[800] whitespace-pre-line">{heroTitle}</h1><p className="mt-4 text-white/50 text-[13px] max-w-[360px]">{heroSubtitle}</p><button onClick={()=>document.getElementById('grid')?.scrollIntoView({behavior:'smooth'})} className="mt-6 h-10 px-5 border border-white/20 rounded-full text-[12px] font-bold">{ctaText}</button><div className="mt-8 flex gap-3">{stories.map((s:any,i:number)=><button key={i} onClick={()=>setActiveStory(i)} className={`text-left p-3 rounded-[12px] border flex-1 ${activeStory===i?'bg-white text-black border-white':'bg-white/5 border-white/10 text-white/60'}`}><div className="text-[10px] font-black">{s.title.toUpperCase()}</div><div className="mt-1 text-[10px]">{s.desc}</div></button>)}</div></div><div className="relative mx-auto w-[260px] md:w-[360px] h-[360px] md:h-[500px]"><div className="relative w-full h-full rounded-[180px] overflow-hidden border border-white/10"><img src={heroImage} className="w-full h-full object-cover" alt=""/><div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"><div className="text-[11px] font-bold">{featuredLabel}</div></div></div><div className="absolute -top-4 -right-4 w-20 h-20 border border-white/20 rounded-full grid place-items-center text-[9px] tracking-widest">{luxeBadge}</div></div></div>
      <div id="grid" className="max-w-[1320px] mx-auto px-4 py-8"><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{products.map((p:any)=><div key={p.id} onClick={()=>onOpen(p)} className="bg-[#141414] border border-white/10 rounded-[16px] p-2.5 cursor-pointer"><img src={p.image_url} className="w-full aspect-[4/5] object-cover rounded-[10px]" alt=""/><div className="mt-2 text-[12px]">{p.name}</div><div className="text-[11px] text-white/50">Rs. {p.price}</div></div>)}</div></div>
    </div>
  )
}

function SleekBase({ profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct, variant }: any) {
  const [localShowCart, setLocalShowCart] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const custom = profile?.premium_custom || {}
  const isBeige = variant==='beige'
  const isDark = variant==='dark'
  const isEditorial = variant==='editorial'
  const announcement = custom.announcement || 'FREE SHIPPING • NEW DROP • COD'
  const badge = custom.badge || custom.heroBadge || 'EDITORIAL • BEIGE • 2024'
  const headerLabel = custom.headerLabel || `${isBeige ? 'BEIGE' : isDark ? 'DARK' : 'EDITORIAL'} • ${profile?.business_name}`
  const headerTopLabel = custom.headerTopLabel || 'PREMIUM • EDITORIAL'
  const heroTitle = (custom.heroTitle || 'Warm minimal\nluxury, everyday\nicon.').replace(/\n/g, '\n')
  const heroSubtitle = custom.heroSubtitle || 'Soft beige tones, natural texture.'
  const heroImage = custom.heroImage || products[0]?.image_url
  const ctaText = custom.ctaText || `Shop ${variant} →`
  const cartCount = cart?.length || 0
  const bg = isDark ? 'bg-[#0A0A0A] text-white' : isBeige ? 'bg-[#F5F1EB] text-[#0A0A0A]' : 'bg-[#FCFBF9] text-[#0A0A0A]'
  const cardBg = isDark ? 'bg-[#141414] border-white/10' : 'bg-white border-black/5'
  return (
    <div className={`min-h-screen ${bg}`}>
      <div className={`${isDark ? 'bg-[#E8FF86] text-black' : isBeige ? 'bg-black text-[#E8FF86]' : 'bg-[#0A0A0A] text-white'} text-[10px] tracking-widest h-7 flex items-center justify-center font-bold`}>{announcement}</div>
      <header className={`h-14 border-b flex items-center justify-between px-5 sticky top-0 z-20 ${isDark ? 'bg-black/70 border-white/10' : 'bg-[#F5F1EB]/80 border-black/10'}`}><div className="font-black tracking-widest text-[12px]">{headerLabel} {isEditorial && <span className="ml-2 h-6 px-2.5 bg-black text-white rounded-full text-[9px]">{headerTopLabel}</span>}</div><button onClick={()=>{ setLocalShowCart(true); if(setShowCart) setShowCart(true) }} className={`h-8 px-4 rounded-full text-[11px] font-bold ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>Cart ({cartCount})</button></header>
      <section className="max-w-6xl mx-auto px-5 py-8 md:py-12 grid md:grid-cols-2 gap-8 items-center"><div><div className={`inline-flex h-6 px-3 rounded-full text-[10px] font-bold ${isDark ? 'bg-white/10 border border-white/20' : 'bg-white border'}`}>{badge}</div><h1 className="mt-4 text-[36px] md:text-[52px] leading-[0.9] font-[800] whitespace-pre-line">{heroTitle}</h1><p className={`mt-4 text-[12px] max-w-[340px] ${isDark ? 'text-white/50' : 'text-black/50'}`}>{heroSubtitle}</p><button className={`mt-6 h-10 px-5 rounded-full text-[12px] font-bold ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>{ctaText}</button></div><div className={`w-[300px] md:w-[380px] aspect-[4/5] border rounded-[24px] overflow-hidden mx-auto ${isDark ? 'bg-[#141414] border-white/10' : 'bg-white'}`}><img src={heroImage} className="w-full h-full object-cover" alt=""/></div></section>
      <main className="max-w-6xl mx-auto px-5 py-8 grid grid-cols-2 md:grid-cols-3 gap-3">{products.map((p:any)=><div key={p.id} onClick={()=>onOpen(p)} className={`${cardBg} border rounded-[18px] p-2.5 cursor-pointer`}><img src={p.image_url} className="w-full aspect-square object-cover rounded-[12px]" alt=""/><div className="mt-2.5 font-bold text-[12px]">{p.name}</div><div className="text-[12px] font-black">Rs. {p.price}</div></div>)}</main>
    </div>
  )
}

export function SleekBeigePremiumTheme(p:any){ return <SleekBase {...p} variant="beige" /> }
export function SleekDarkPremiumTheme(p:any){ return <SleekBase {...p} variant="dark" /> }
export function SleekEditorialPremiumTheme(p:any){ return <SleekBase {...p} variant="editorial" /> }

export function PremiumThemeRenderer({ themeId, profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }: any) {
  const props = { profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }
  if (themeId === 'spike-premium') return <SpikePremiumTheme {...props} />
  if (themeId === 'shoe-app-premium') return <ShoeAppPremiumTheme {...props} />
  if (themeId === 'trenzo-luxury') return <TrenzoLuxuryTheme {...props} />
  if (themeId === 'sleek-beige') return <SleekBeigePremiumTheme {...props} />
  if (themeId === 'sleek-dark') return <SleekDarkPremiumTheme {...props} />
  if (themeId === 'sleek-editorial') return <SleekEditorialPremiumTheme {...props} />
  return null
}
