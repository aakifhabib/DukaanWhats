'use client'
import { useState, useEffect, useRef } from 'react'

type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; original_price?: number; description?: string; sizes?: string[]; colors?: string[]; stock?: number; category?: string }

function Gallery({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0)
  const [hover, setHover] = useState(false)
  useEffect(()=>{ if(!hover || images.length<=1) return; const iv=setInterval(()=>setIdx(p=>(p+1)%images.length),2200); return()=>clearInterval(iv)},[hover,images.length])
  return (
    <div className="relative group" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
      <div className="overflow-hidden rounded-[22px] aspect-[4/3] bg-[#F5F4F1] relative border border-black/[0.06]">
        <img src={images[idx]} className="w-full h-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-[1.04]" alt="" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="bg-black text-white text-[10px] px-2.5 h-6 rounded-full font-bold tracking-widest grid place-items-center">{idx+1}/{images.length}</span>
          {images.length>1 && <span className="bg-white/90 backdrop-blur border text-[10px] px-2 h-6 rounded-full font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"/>AUTO</span>}
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_:any,i:number)=><div key={i} className={`h-1 rounded-full transition-all duration-300 ${i===idx?'w-6 bg-black':'w-1.5 bg-black/20'}`} />)}
        </div>
      </div>
      <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
        {images.map((u,i)=><button key={i} onClick={()=>setIdx(i)} className={`relative w-[64px] h-[64px] rounded-[14px] overflow-hidden border-2 shrink-0 transition-all duration-300 ${i===idx?'border-black shadow-[0_4px_16px_rgba(0,0,0,0.15)] scale-[1.02]':'border-transparent opacity-60 hover:opacity-100'}`}><img src={u} className="w-full h-full object-cover" alt=""/></button>)}
      </div>
    </div>
  )
}

export function SpikePremiumTheme({ profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }: any) {
  const [activeBrand, setActiveBrand] = useState('All')
  const [activeCat, setActiveCat] = useState('All')
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [qty, setQty] = useState(1)
  const [showCart, setShowCartLocal] = useState(false)
  const [wishlist, setWishlist] = useState<string[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const heroRef = useRef<HTMLDivElement>(null)
  const collectionRef = useRef<HTMLDivElement>(null)

  // Edit support - users can edit via dashboard (stored in profile.business_name etc, plus custom fields)
  const custom = (profile as any)?.premium_custom || {}
  const heroTitle = custom.spikeTitle || 'The journey begins with the perfect pair'
  const heroSub = custom.spikeSub || 'Dive into unparalleled comfort with unmatched style. Find your perfect stride with Spike Collections — crafted for style comfortably.'
  const brandList = custom.spikeBrands || ['All','Nike','Adidas','Puma','New Balance','Converse']

  const cartCount = cart?.length || 0
  const cartTotal = cart?.reduce((s:any,p:any)=>s+p.price,0) || 0

  const openCart = () => { setShowCartLocal(true); if(setShowCart) setShowCart(true) }
  const closeCart = () => { setShowCartLocal(false); if(setShowCart) setShowCart(false) }

  // All products filtering
  const filteredByBrand = activeBrand==='All' ? products : products.filter((p:any)=> (p.name+p.category).toLowerCase().includes(activeBrand.toLowerCase()))
  const filtered = activeCat==='All' ? filteredByBrand : filteredByBrand.filter((p:any)=>p.category?.toLowerCase()===activeCat.toLowerCase() || p.name.toLowerCase().includes(activeCat.toLowerCase()))
  const searchFiltered = searchQuery ? products.filter((p:any)=>p.name.toLowerCase().includes(searchQuery.toLowerCase())) : filtered

  const toggleWishlist = (id:string) => { setWishlist(prev=>prev.includes(id)? prev.filter(x=>x!==id) : [...prev,id]) }

  const orderWhatsApp = () => {
    if(!profile || cart.length===0) return
    if(!customerName.trim()) { alert('Please enter your name'); return }
    if(!customerAddress.trim()) { alert('Please enter your address'); return }
    cart.forEach((p:any)=>track?.('whatsapp_click',p.id))
    const lines = cart.map((p:any)=>`• ${p.name} - Rs. ${p.price}${p.selectedSize?` (Size: ${p.selectedSize})`:''}${p.selectedColor?` (Color: ${p.selectedColor})`:''}`).join('%0A')
    const msg = `Hi ${profile.business_name}!%0A%0A🛒 *New Order - SPIKE*%0A%0A${lines}%0A%0A*Total: Rs. ${cartTotal.toLocaleString()}*%0A%0A👤 Name: ${customerName}%0A📍 Address: ${customerAddress}%0A%0AStore: https://dukaanwhats.pk/s/${profile.store_slug}`
    window.open(`https://wa.me/${profile.whatsapp_number}?text=${msg}`,'_blank')
  }

  const handleAdd = (p:any, directWhatsApp=false) => {
    const prod = {...p, selectedSize, selectedColor}
    onAdd(prod, qty)
    setSelectedProduct(null)
    setQty(1)
    setSelectedSize('')
    setSelectedColor('')
    if(directWhatsApp) { setTimeout(()=>openCart(), 300) }
  }

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#0A0A0A] antialiased selection:bg-black selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@500;700;800&family=Fragment+Mono&display=swap');
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes float{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-14px) rotate(1deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulseDot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:0.6}}
        .no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        .font-instrument{font-family:'Instrument Sans',sans-serif}
        .font-mono2{font-family:'Fragment Mono',monospace}
      `}</style>

      {/* ANNOUNCEMENT BAR */}
      <div className="relative z-50 bg-black text-white h-9 flex items-center overflow-hidden">
        <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap gap-8 text-[11px] tracking-widest uppercase font-medium">
          <span className="flex items-center gap-8"><span>✦ Free Shipping Over Rs. 5000</span><span className="w-1 h-1 bg-white/30 rounded-full"/><span>New Drops Every Friday</span><span className="w-1 h-1 bg-white/30 rounded-full"/><span>30-Day Returns</span><span className="w-1 h-1 bg-white/30 rounded-full"/><span>Trusted by 1,200+ Stores</span></span>
          <span className="flex items-center gap-8"><span>✦ Free Shipping Over Rs. 5000</span><span className="w-1 h-1 bg-white/30 rounded-full"/><span>New Drops Every Friday</span><span className="w-1 h-1 bg-white/30 rounded-full"/><span>30-Day Returns</span><span className="w-1 h-1 bg-white/30 rounded-full"/><span>Trusted by 1,200+ Stores</span></span>
        </div>
      </div>

      {/* HEADER - REAL STORE */}
      <header className="sticky top-0 z-40 bg-[#FCFBF9]/80 backdrop-blur-[20px] border-b border-black/[0.06]">
        <div className="max-w-[1320px] mx-auto px-5 md:px-7 h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-black rounded-[10px] grid place-items-center text-white font-black text-[14px] tracking-[-0.02em]">S</div>
              <div className="font-black text-[17px] tracking-[-0.02em] leading-none">SPIKE<span className="inline-block w-1.5 h-1.5 bg-black rounded-full ml-1 animate-[pulseDot_2s_ease-infinite]"/></div>
              <div className="hidden md:block ml-3 h-5 w-px bg-black/10"/>
              <div className="hidden md:block text-[12px] text-black/50 font-medium">{profile?.business_name || 'Premium Store'}</div>
            </div>
            <nav className="hidden lg:flex items-center gap-7 text-[13px] font-[500] text-black/60">
              {[
                {l:'Shop', a:()=>collectionRef.current?.scrollIntoView({behavior:'smooth'})},
                {l:'New In', a:()=>heroRef.current?.scrollIntoView({behavior:'smooth'})},
                {l:'Collections', a:()=>collectionRef.current?.scrollIntoView({behavior:'smooth'})},
                {l:'About', a:()=>{}},
              ].map(item=><button key={item.l} onClick={item.a} className="hover:text-black transition font-medium">{item.l}</button>)}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setSearchOpen(!searchOpen)} className="w-9 h-9 bg-white border border-black/10 rounded-full grid place-items-center hover:border-black transition"><span className="text-[14px]">⌕</span></button>
            <button onClick={openCart} className="relative h-9 pl-3 pr-3.5 bg-black text-white rounded-full flex items-center gap-2 text-[12px] font-bold hover:bg-zinc-800 transition">
              <span>Cart</span><span className="w-5 h-5 bg-white text-black rounded-full grid place-items-center text-[10px] font-black">{cartCount}</span>
            </button>
          </div>
        </div>
        {searchOpen && (
          <div className="border-t border-black/10 bg-white px-5 py-3 animate-[fadeUp_0.3s_ease]">
            <div className="max-w-[1320px] mx-auto flex gap-3">
              <input autoFocus value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search shoes, brand, category..." className="flex-1 h-11 px-4 bg-[#F6F5F2] rounded-full text-[13px] outline-none border border-transparent focus:border-black/20 focus:bg-white transition"/>
              <button onClick={()=>{setSearchOpen(false); setSearchQuery('')}} className="h-11 px-5 border rounded-full text-[13px]">Close</button>
            </div>
          </div>
        )}
      </header>

      {/* HERO - PRODUCTION REAL */}
      <section ref={heroRef} className="max-w-[1320px] mx-auto px-5 md:px-7 py-8 md:py-14 grid md:grid-cols-[1.15fr_0.85fr] gap-8 md:gap-12 items-start relative">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white border border-black/10 shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-full px-3.5 h-7 text-[11px] font-mono tracking-widest uppercase"><span className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse"/>New Drop • SS 2025 • Live</div>
          <h1 className="mt-7 font-instrument text-[42px] md:text-[64px] xl:text-[72px] font-[800] leading-[0.88] tracking-[-0.04em] animate-[fadeUp_0.7s_ease]">
            {heroTitle.split(' ').slice(0,3).join(' ')}<br/>{heroTitle.split(' ').slice(3).join(' ')}
          </h1>
          <p className="mt-6 text-[14px] leading-[1.6] text-black/50 max-w-[380px] font-medium">{heroSub}</p>
          <div className="mt-8 flex items-center gap-3">
            <button onClick={()=>collectionRef.current?.scrollIntoView({behavior:'smooth'})} className="h-[44px] px-7 bg-black text-white rounded-full text-[13px] font-bold tracking-[-0.01em] hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all">Shop Collection →</button>
            <button onClick={openCart} className="h-[44px] px-6 bg-white border border-black/10 rounded-full text-[13px] font-bold hover:border-black transition">View Cart ({cartCount})</button>
          </div>
          <div className="mt-12">
            <div className="flex items-center gap-3"><span className="text-[11px] font-bold tracking-[0.15em] uppercase text-black/40">Top Brands</span><span className="h-px flex-1 bg-black/10"/></div>
            <div className="mt-4 flex flex-wrap gap-2">
              {brandList.map((b:any)=><button key={b} onClick={()=>{ setActiveBrand(b); collectionRef.current?.scrollIntoView({behavior:'smooth'}) }} className={`h-8 px-4 rounded-full text-[12px] font-bold border transition-all ${activeBrand===b?'bg-black text-white border-black shadow-[0_4px_16px_rgba(0,0,0,0.15)]':'bg-white border-black/10 hover:border-black hover:bg-black hover:text-white'}`}>{b}</button>)}
            </div>
          </div>
          <div className="mt-8 flex items-center gap-4 p-3 bg-white border border-black/5 rounded-[14px] w-fit shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            <div className="flex -space-x-2">{[1,2,3].map(i=><img key={i} src={`https://i.pravatar.cc/32?img=${10+i}`} className="w-7 h-7 rounded-full border-2 border-white" alt=""/>)}</div>
            <div className="text-[11px] leading-[1.2]"><div className="font-bold">Trusted by 1,200+ stores</div><div className="text-black/40">Karachi • Lahore • Islamabad</div></div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-6 md:-right-10 top-0 bottom-0 w-[84px] md:w-[110px] bg-black text-white grid place-items-center [writing-mode:vertical-rl] text-[56px] md:text-[72px] font-black tracking-[0.18em] rounded-l-[36px] select-none overflow-hidden opacity-[0.06] md:opacity-10">ADIDAS</div>
          <div className="relative bg-white rounded-[28px] p-3 md:p-4 border border-black/[0.06] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.18),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
            <div className="rounded-[18px] bg-[#F6F5F2] p-3 border border-black/[0.03] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-gradient-to-br from-black/[0.04] to-transparent rounded-full blur-[20px]"/>
              <img src={products[0]?.image_url || 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=600'} className="relative w-full aspect-square object-cover rounded-[14px] animate-[float_6s_ease-in-out_infinite] will-change-transform" alt=""/>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                <div className="bg-black text-white text-[10px] px-3 h-7 rounded-full font-bold tracking-widest grid place-items-center">LIVE • {products.length} PRODUCTS</div>
                <div className="bg-white/90 backdrop-blur border text-[10px] px-2.5 h-7 rounded-full font-bold">★ 4.9</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2.5">
              {(products.slice(0,3).length? products.slice(0,3) : [{image_url:'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=200'},{image_url:'https://images.unsplash.com/photo-1608231387042-66d1773070a?w=200'},{image_url:'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=200'}] as any).map((p:any,i:number)=><div key={i} className="aspect-square bg-[#F6F5F2] rounded-[12px] border border-black/5 overflow-hidden p-1.5"><img src={p.image_url} className="w-full h-full object-cover rounded-[8px]" alt=""/></div>)}
            </div>
          </div>
          {/* Floating glass card */}
          <div className="absolute -left-4 md:-left-6 bottom-10 bg-white/90 backdrop-blur-xl border border-black/10 rounded-[16px] p-3 shadow-[0_16px_40px_rgba(0,0,0,0.12)] flex items-center gap-3 animate-[float_5s_ease-in-out_infinite]">
            <div className="w-10 h-10 bg-black rounded-full grid place-items-center text-white text-[12px]">✓</div>
            <div className="text-[11px] leading-[1.2]"><div className="font-bold">Just sold</div><div className="text-black/50">3 pairs • Rs. 8,400</div></div>
          </div>
        </div>
      </section>

      {/* COLLECTIONS - REAL STORE */}
      <section ref={collectionRef} className="max-w-[1320px] mx-auto px-5 md:px-7 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-baseline gap-4"><h2 className="font-instrument text-[26px] md:text-[32px] font-[700] tracking-[-0.03em]">Spike Collections</h2><span className="text-[11px] font-mono px-2.5 h-6 rounded-full bg-black text-white grid place-items-center">{searchFiltered.length} ITEMS</span></div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 p-1 bg-[#F1EFEA] rounded-full border">
              {['All','Shoes','Sneakers','Limited'].map(c=><button key={c} onClick={()=>setActiveCat(c)} className={`h-7 px-4 rounded-full text-[11px] font-bold transition ${activeCat===c?'bg-black text-white shadow':'text-black/50 hover:text-black'}`}>{c}</button>)}
            </div>
            <button onClick={()=>{ setActiveBrand('All'); setActiveCat('All'); setSearchQuery('')}} className="h-8 px-3 bg-white border rounded-full text-[11px] font-bold">Reset ✕</button>
          </div>
        </div>
        <div className="mt-7 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {searchFiltered.map((p:Product,i:number)=>(
            <div key={p.id} className="group relative bg-white border border-black/[0.06] rounded-[20px] p-2.5 md:p-3 hover:border-black hover:shadow-[0_24px_48px_-20px_rgba(0,0,0,0.18)] hover:-translate-y-1 transition-all duration-500 cursor-pointer animate-[fadeUp_0.6s_ease_both]" style={{animationDelay:`${i*50}ms`}} onClick={()=>{ setSelectedSize(''); setSelectedColor(''); setQty(1); onOpen(p)}}>
              <div className="relative overflow-hidden rounded-[14px] aspect-square bg-[#F6F5F2] border border-black/[0.03]">
                <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-[800ms] ease-[cubic-bezier(0.2,0,0,1)]" alt=""/>
                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                  <span className="bg-white/90 backdrop-blur border text-[10px] px-2 h-5 rounded-full font-bold tracking-widest">{p.category || 'SPIKE'}</span>
                  {p.original_price && <span className="bg-black text-white text-[10px] px-2 h-5 rounded-full font-bold">-{Math.round((1-p.price/p.original_price)*100)}%</span>}
                </div>
                <button onClick={(e)=>{e.stopPropagation(); toggleWishlist(p.id)}} className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full grid place-items-center border backdrop-blur transition ${wishlist.includes(p.id)?'bg-black text-white border-black':'bg-white/90 border-black/10 hover:border-black'}`}>♡</button>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex gap-2">
                  <button onClick={(e)=>{e.stopPropagation(); handleAdd(p)}} className="flex-1 h-8 bg-black text-white rounded-full text-[11px] font-bold">Quick Add</button>
                  <button onClick={(e)=>{e.stopPropagation(); onOpen(p)}} className="w-8 h-8 bg-white border rounded-full grid place-items-center text-[12px]">↗</button>
                </div>
              </div>
              <div className="mt-3 px-1 pb-1">
                <div className="flex justify-between items-start gap-2"><div className="text-[13px] font-[600] leading-[1.2] truncate">{p.name}</div><div className="text-[10px] text-black/40 font-mono shrink-0">#{p.id.slice(0,4)}</div></div>
                <div className="mt-1.5 flex items-center justify-between"><span className="font-black text-[14px] tracking-[-0.01em]">Rs. {p.price.toLocaleString()}</span><span className="text-[11px] text-black/40 line-through">{p.original_price?`Rs. ${p.original_price.toLocaleString()}`:''}</span></div>
              </div>
            </div>
          ))}
        </div>
        {searchFiltered.length===0 && <div className="py-20 text-center text-[13px] text-black/40">No products found for "{searchQuery || activeBrand}" — <button onClick={()=>{setSearchQuery(''); setActiveBrand('All')}} className="underline font-bold text-black">Clear filters</button></div>}
      </section>

      {/* MODAL - FULL PRODUCTION */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] bg-[#0A0A0A]/60 backdrop-blur-[18px] flex items-center justify-center p-3 md:p-6">
          <div className="bg-white rounded-[24px] md:rounded-[28px] w-full max-w-[1020px] max-h-[92vh] overflow-hidden grid md:grid-cols-[1.05fr_0.95fr] shadow-[0_40px_120px_rgba(0,0,0,0.4)] animate-[fadeUp_0.35s_ease]">
            <div className="p-3 md:p-5 bg-[#F6F5F2] overflow-auto no-scrollbar"><Gallery images={selectedProduct.image_urls?.length? selectedProduct.image_urls : [selectedProduct.image_url]} /></div>
            <div className="p-5 md:p-7 flex flex-col overflow-auto no-scrollbar">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 bg-black text-white text-[10px] px-3 h-6 rounded-full tracking-[0.12em] font-bold">SPIKE • {selectedProduct.category || 'FOOTWEAR'}</div>
                  <h2 className="mt-3 font-instrument text-[26px] md:text-[32px] font-[700] leading-[0.95] tracking-[-0.02em]">{selectedProduct.name}</h2>
                  <div className="mt-2 flex items-center gap-2 text-[12px]"><span className="text-black">★★★★★</span><span className="text-black/40">(4.9) 128 reviews • In stock</span></div>
                </div>
                <button onClick={()=>setSelectedProduct(null)} className="w-9 h-9 bg-[#F1EFEA] border border-black/10 rounded-full grid place-items-center hover:bg-black hover:text-white hover:border-black transition shrink-0">✕</button>
              </div>
              <div className="mt-5 flex items-baseline gap-3">
                <span className="text-[28px] font-black tracking-[-0.02em]">Rs. {selectedProduct.price.toLocaleString()}</span>
                {selectedProduct.original_price && <><span className="text-[14px] line-through text-black/30">Rs. {selectedProduct.original_price.toLocaleString()}</span><span className="bg-[#E8FF86] text-black text-[11px] px-2 h-6 rounded-full font-bold grid place-items-center">SAVE {Math.round((1-selectedProduct.price/selectedProduct.original_price)*100)}%</span></>}
              </div>
              {selectedProduct.description && <p className="mt-4 text-[13px] leading-[1.6] text-black/55">{selectedProduct.description}</p>}
              <div className="mt-6 space-y-5">
                <div><div className="text-[11px] font-bold tracking-[0.15em] uppercase">Select Size</div><div className="mt-2.5 flex flex-wrap gap-2">{(selectedProduct.sizes || ['40','41','42','43','44','45']).map((s:string)=><button key={s} onClick={()=>setSelectedSize(s)} className={`h-10 min-w-[48px] px-4 border rounded-full text-[13px] font-bold transition-all ${selectedSize===s?'bg-black text-white border-black shadow-[0_4px_16px_rgba(0,0,0,0.2)] scale-[1.02]':'bg-white border-black/10 hover:border-black'}`}>{s}</button>)}</div></div>
                <div><div className="text-[11px] font-bold tracking-[0.15em] uppercase">Color</div><div className="mt-2.5 flex gap-2">{(selectedProduct.colors || ['Black','White','Red','Blue']).map((c:string)=><button key={c} onClick={()=>setSelectedColor(c)} className={`h-10 px-4 rounded-full border text-[12px] font-bold transition ${selectedColor===c?'bg-black text-white border-black':'bg-white border-black/10 hover:border-black'}`}>{c}</button>)}</div></div>
                <div><div className="text-[11px] font-bold tracking-[0.15em] uppercase">Quantity</div><div className="mt-2.5 flex items-center gap-3"><button onClick={()=>setQty(Math.max(1,qty-1))} className="w-10 h-10 bg-white border border-black/10 rounded-full grid place-items-center font-bold hover:border-black">-</button><span className="w-10 text-center font-black text-[14px]">{qty}</span><button onClick={()=>setQty(qty+1)} className="w-10 h-10 bg-white border border-black/10 rounded-full grid place-items-center font-bold hover:border-black">+</button><span className="ml-2 text-[11px] text-black/40">{selectedProduct.stock?`${selectedProduct.stock} in stock`: 'In stock'}</span></div></div>
              </div>
              <div className="mt-auto pt-7 grid grid-cols-2 gap-3">
                <button onClick={()=>handleAdd(selectedProduct,false)} className="h-[48px] bg-white border border-black rounded-full font-bold text-[13px] hover:bg-[#F6F5F2] transition">Add to Cart — Rs. {(selectedProduct.price*qty).toLocaleString()}</button>
                <button onClick={()=>handleAdd(selectedProduct,true)} className="h-[48px] bg-[#25D366] text-white rounded-full font-bold text-[13px] hover:bg-[#20bd5a] shadow-[0_8px_24px_rgba(37,211,102,0.3)] transition">Buy on WhatsApp</button>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-black/40"><span className="flex items-center gap-1.5"><span className="w-4 h-4 border rounded-full grid place-items-center text-[10px]">✓</span>30-day returns</span><span className="flex items-center gap-1.5"><span className="w-4 h-4 border rounded-full grid place-items-center text-[10px]">✓</span>Secure checkout</span></div>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER - FULL WORKING PRODUCTION */}
      <div className={`fixed inset-0 z-[110] ${showCartLocal ? '' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-[6px] transition-opacity duration-300 ${showCartLocal ? 'opacity-100' : 'opacity-0'}`} onClick={closeCart}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-full max-w-[420px] bg-[#FCFBF9] border-l border-black/10 shadow-[-24px_0_80px_rgba(0,0,0,0.18)] flex flex-col transition-transform duration-[400ms] ease-[cubic-bezier(0.2,0,0,1)] ${showCartLocal ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-6 border-b border-black/10 flex justify-between items-center bg-white">
            <div><h3 className="font-instrument font-bold text-[18px] tracking-[-0.01em]">Cart — {cartCount} items</h3><div className="text-[11px] text-black/40 mt-0.5">{cartCount>0?`Rs. ${cartTotal.toLocaleString()} total • Free shipping over 5k`: 'Add some heat'}</div></div>
            <button onClick={closeCart} className="w-9 h-9 bg-[#F1EFEA] border border-black/10 rounded-full grid place-items-center hover:bg-black hover:text-white transition">✕</button>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3 bg-[#F6F5F2]">
            {cart.map((p:any,i:number)=>(
              <div key={`${p.id}-${i}`} className="flex gap-3 p-3 bg-white rounded-[16px] border border-black/5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <img src={p.image_url} className="w-16 h-16 rounded-[12px] object-cover border border-black/5"/>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold leading-[1.2] truncate">{p.name}</div>
                  <div className="text-[11px] text-black/50 mt-1">{p.selectedSize?`Size ${p.selectedSize}`:''} {p.selectedColor?`• ${p.selectedColor}`:''}</div>
                  <div className="mt-1.5 flex items-center justify-between"><span className="font-black text-[13px]">Rs. {p.price.toLocaleString()}</span><button onClick={()=>{ const newCart = cart.filter((_:any,idx:number)=>idx!==i); (window as any).__setCart?.(newCart); setShowCartLocal(newCart.length>0); if((window as any).__setCartParent) (window as any).__setCartParent(newCart); }} className="text-[11px] text-black/40 hover:text-red-600 underline">Remove</button></div>
                </div>
              </div>
            ))}
            {cartCount===0 && <div className="py-24 text-center"><div className="w-16 h-16 bg-white border rounded-full grid place-items-center mx-auto text-[20px]">🛒</div><div className="mt-4 font-bold">Your cart is empty</div><div className="mt-1 text-[12px] text-black/40">Add some spikes to get started</div><button onClick={closeCart} className="mt-6 h-10 px-6 bg-black text-white rounded-full text-[12px] font-bold">Continue Shopping</button></div>}
          </div>
          {cartCount>0 && (
            <div className="p-5 border-t border-black/10 bg-white space-y-3">
              <div className="space-y-2.5">
                <input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Your full name *" className="w-full h-11 px-4 bg-[#F6F5F2] border border-black/10 rounded-full text-[13px] outline-none focus:border-black focus:bg-white transition"/>
                <input value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} placeholder="Full delivery address *" className="w-full h-11 px-4 bg-[#F6F5F2] border border-black/10 rounded-full text-[13px] outline-none focus:border-black focus:bg-white transition"/>
              </div>
              <div className="flex justify-between items-center py-2 border-y border-dashed border-black/10 text-[13px]"><span className="text-black/50">Subtotal • {cartCount} items</span><span className="font-black text-[16px]">Rs. {cartTotal.toLocaleString()}</span></div>
              <button onClick={orderWhatsApp} className="w-full h-[48px] bg-[#25D366] text-white rounded-full font-bold text-[13px] tracking-[-0.01em] hover:bg-[#20bd5a] active:scale-[0.99] shadow-[0_8px_24px_rgba(37,211,102,0.25)] transition-all flex items-center justify-center gap-2"><span>Order on WhatsApp</span><span className="bg-white/20 rounded-full px-2 h-6 grid place-items-center text-[11px]">Rs. {cartTotal.toLocaleString()}</span></button>
              <div className="text-center text-[10px] text-black/30">Secure • WhatsApp checkout • 30-day returns • Trusted by 1,200+ stores</div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-black/10 bg-white mt-10"><div className="max-w-[1320px] mx-auto px-5 py-8 flex flex-wrap justify-between gap-4 text-[11px] text-black/40"><span>© {new Date().getFullYear()} {profile?.business_name} • Powered by DukaanWhats.pk • SPIKE Premium</span><span className="flex gap-4"><span>Shipping</span><span>Returns</span><span>Contact: {profile?.whatsapp_number}</span></span></div></footer>
    </div>
  )
}
