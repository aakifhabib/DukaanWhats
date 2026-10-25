'use client'
import { useState, useEffect } from 'react'

type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; original_price?: number; description?: string }

export function ShoeAppPremiumTheme({ profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }: any) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [activeSize, setActiveSize] = useState(31)
  const [activeColor, setActiveColor] = useState(0)
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [localShowCart, setLocalShowCart] = useState(false)
  const [qty, setQty] = useState(1)
  const [liked, setLiked] = useState<string[]>([])
  const [selectedShoe, setSelectedShoe] = useState<Product | null>(null)

  const cartCount = cart?.length || 0
  const cartTotal = cart?.reduce((s:any,p:any)=>s+p.price,0) || 0
  const openCart = () => { setLocalShowCart(true); if(setShowCart) setShowCart(true) }
  const closeCart = () => { setLocalShowCart(false); if(setShowCart) setShowCart(false) }

  const colors = [
    { name: 'Violet', bg: '#7C3AED', ring: '#7C3AED' },
    { name: 'Midnight', bg: '#0A0A0A', ring: '#0A0A0A' },
    { name: 'Cloud', bg: '#E8E8F0', ring: '#D0D0D8' },
    { name: 'Coral', bg: '#FF5A5A', ring: '#FF5A5A' },
    { name: 'Lime', bg: '#E8FF86', ring: '#E8FF86' },
  ]

  const sizes = [28, 29, 30, 31, 32, 33, 34]

  useEffect(()=>{
    if(products[0] && !selectedShoe) setSelectedShoe(products[0])
  },[products])

  const filtered = activeFilter==='All' ? products : products.filter((p:any)=> p.name.toLowerCase().includes(activeFilter.toLowerCase()) || (p.category||'').toLowerCase().includes(activeFilter.toLowerCase()))

  const toggleLike = (id:string) => setLiked(prev=> prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id])

  const orderWhatsApp = () => {
    if(!profile || cart.length===0) return
    if(!customerName.trim()){ alert('Please enter your name'); return }
    if(!customerAddress.trim()){ alert('Please enter your address'); return }
    cart.forEach((p:any)=>track?.('whatsapp_click',p.id))
    const lines = cart.map((p:any)=>`• ${p.name} - Rs. ${p.price} (Size ${activeSize}, Color ${colors[activeColor].name})`).join('%0A')
    const msg = `Hi ${profile.business_name}!%0A%0A🟣 SHOE APP PREMIUM ORDER%0A${lines}%0A%0ATotal: Rs. ${cartTotal.toLocaleString()}%0AQty: ${cart.length}%0AName: ${customerName}%0AAddress: ${customerAddress}%0A%0AStore: ${window.location.href}`
    window.open(`https://wa.me/${profile.whatsapp_number}?text=${msg}`,'_blank')
  }

  const handleAddToCart = (p:Product) => {
    const prod = { ...p, selectedSize: activeSize, selectedColor: colors[activeColor].name, selectedColorBg: colors[activeColor].bg }
    for(let i=0;i<qty;i++) onAdd(prod)
    setTimeout(()=>openCart(),250)
  }

  return (
    <div className="min-h-screen bg-[#F2F0FF] text-[#0A0A0A] antialiased selection:bg-[#7C3AED] selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700;800&family=Geist+Mono:wght@500&display=swap');
        *{font-family:'Geist',system-ui,sans-serif}
        .mono{font-family:'Geist Mono',monospace}
        @keyframes floatShoe{0%,100%{transform:rotate(-14deg) translateY(0) scale(1)}50%{transform:rotate(-14deg) translateY(-10px) scale(1.02)}}
        @keyframes shine{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
        @keyframes pop{0%{transform:scale(0.9)}60%{transform:scale(1.08)}100%{transform:scale(1)}}
        .glass-card{backdrop-filter:blur(24px) saturate(1.2);-webkit-backdrop-filter:blur(24px) saturate(1.2)}
        .no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{scrollbar-width:none;-ms-overflow-style:none}
        .shoe-shadow{filter:drop-shadow(0 28px 40px rgba(124,58,237,0.28)) drop-shadow(0 10px 18px rgba(0,0,0,0.12))}
      `}</style>

      {/* TOP NAV - Premium */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-4">
        <div className="h-[64px] bg-white/90 glass-card border border-black/[0.06] rounded-[20px] flex items-center justify-between px-5 shadow-[0_8px_24px_rgba(0,0,0,0.06),0_1px_0_rgba(255,255,255,1)_inset]">
          <div className="flex items-center gap-6">
            <div className="w-9 h-9 rounded-[12px] bg-[#0A0A0A] text-white grid place-items-center font-black text-[13px]">S</div>
            <div className="hidden md:flex items-center gap-1 bg-[#F2F0FF] rounded-full p-1 border">
              {['All','Nike','Adidas','New','Sale'].map(f=>(
                <button key={f} onClick={()=>setActiveFilter(f)} className={`h-7 px-4 rounded-full text-[12px] font-bold transition ${activeFilter===f ? 'bg-black text-white shadow' : 'text-black/60 hover:text-black'}`}>{f}</button>
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-2 text-[11px]"><span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"/><span className="mono font-bold tracking-widest text-black/50">{profile?.business_name?.toUpperCase()} • LIVE</span></div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 bg-white border rounded-full grid place-items-center">♡</button>
            <button className="w-9 h-9 bg-white border rounded-full grid place-items-center">◍</button>
            <button onClick={openCart} className="h-9 pl-2 pr-1 bg-black text-white rounded-full flex items-center gap-2 text-[12px] font-bold">
              <span className="px-2">Cart</span><span className="w-7 h-7 bg-white text-black rounded-full grid place-items-center text-[11px] font-black">{cartCount}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 pb-24 grid lg:grid-cols-[320px_1fr_360px] gap-4">

        {/* LEFT - Product Detail Card (Ultra Premium) */}
        <div className="bg-white border border-black/[0.06] rounded-[28px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col lg:sticky lg:top-[96px] lg:h-[calc(100vh-120px)]">
          {selectedShoe ? (
            <>
              {/* Image Stage */}
              <div className="relative bg-[#F8F7FF] aspect-square p-6">
                <div className="absolute top-5 left-5 right-5 flex justify-between">
                  <div className="h-7 px-3 bg-white border rounded-full text-[10px] font-black mono tracking-widest">NEW DROP • {new Date().getFullYear()}</div>
                  <button onClick={()=>toggleLike(selectedShoe.id)} className={`w-8 h-8 rounded-full border grid place-items-center ${liked.includes(selectedShoe.id)?'bg-black text-white':'bg-white'}`}>{liked.includes(selectedShoe.id)?'♥':'♡'}</button>
                </div>
                <img src={selectedShoe.image_url} alt="" className="w-full h-full object-contain shoe-shadow animate-[floatShoe_5s_ease-in-out_infinite]" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                  <div className="flex gap-1.5">{colors.map((c,i)=><button key={i} onClick={()=>setActiveColor(i)} className={`w-6 h-6 rounded-full border-2 ${activeColor===i ? 'border-black scale-110' : 'border-white'}`} style={{background:c.bg}} />)}</div>
                  <div className="h-6 px-2.5 bg-black text-white rounded-full text-[10px] font-bold grid place-items-center mono">{colors[activeColor].name.toUpperCase()}</div>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-[22px] font-[800] leading-[0.95] tracking-[-0.02em]">{selectedShoe.name}</h2>
                  <div className="text-right"><div className="text-[20px] font-black">Rs. {selectedShoe.price.toLocaleString()}</div>{selectedShoe.original_price && <div className="text-[11px] line-through text-black/40">Rs. {selectedShoe.original_price}</div>}</div>
                </div>
                <p className="mt-3 text-[12px] leading-[1.5] text-black/55 line-clamp-2">{selectedShoe.description || 'Engineered mesh upper, responsive foam midsole, ultra-light traction. Premium comfort meets street dominance.'}</p>

                {/* Size */}
                <div className="mt-5">
                  <div className="flex justify-between items-center"><span className="mono text-[10px] font-black tracking-[0.14em]">SELECT SIZE</span><span className="text-[10px] text-black/40 underline cursor-pointer">Size Guide</span></div>
                  <div className="mt-3 grid grid-cols-7 gap-[6px]">{sizes.map(s=>(
                    <button key={s} onClick={()=>setActiveSize(s)} className={`h-[36px] rounded-[11px] border text-[12px] font-bold transition-all ${activeSize===s ? 'bg-black text-white border-black shadow-[0_6px_16px_rgba(0,0,0,0.18)] scale-[1.06]' : 'bg-[#F2F0FF] border-transparent hover:border-black/20 text-black/70'}`}>{s}</button>
                  ))}</div>
                </div>

                {/* Qty */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="mono text-[10px] font-black tracking-[0.14em]">QUANTITY</div>
                  <div className="flex items-center gap-2 bg-[#F2F0FF] rounded-full p-1 border">
                    <button onClick={()=>setQty(Math.max(1,qty-1))} className="w-7 h-7 bg-white border rounded-full grid place-items-center font-bold">−</button>
                    <span className="w-8 text-center text-[13px] font-black">{qty}</span>
                    <button onClick={()=>setQty(qty+1)} className="w-7 h-7 bg-white border rounded-full grid place-items-center font-bold">+</button>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-auto pt-5 grid grid-cols-[1fr_56px] gap-2">
                  <button onClick={()=>handleAddToCart(selectedShoe)} className="relative overflow-hidden h-[52px] bg-[#0A0A0A] text-white rounded-[14px] font-bold text-[13px] flex items-center justify-center gap-2 group">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[900ms]" style={{animation:'shine 2s linear infinite'}}/>
                    <span>🛒 Add to Cart — Rs. {(selectedShoe.price*qty).toLocaleString()}</span>
                  </button>
                  <button onClick={()=>{handleAddToCart(selectedShoe);}} className="h-[52px] w-[56px] bg-[#E8FF86] border border-black rounded-[14px] grid place-items-center font-black text-[18px]">↗</button>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[10px] mono text-black/40"><span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"/>IN STOCK • FREE COD • 7-DAY RETURN</div>
              </div>
            </>
          ) : <div className="p-10 text-center text-[13px] text-black/30">Select a shoe</div>}
        </div>

        {/* CENTER - Feed */}
        <div className="space-y-4">
          {/* Hero Banner - Premium */}
          <div className="relative h-[168px] md:h-[188px] rounded-[24px] overflow-hidden bg-[#111AFF] border border-black/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_50%)]" />
            <div className="absolute inset-0 p-6 flex">
              <div className="flex-1">
                <div className="inline-flex h-6 px-2.5 bg-white text-[10px] font-black mono rounded-full items-center">LIMITED • BLACK FRIDAY</div>
                <div className="mt-3 text-white font-[900] text-[28px] leading-[0.9] tracking-[-0.03em]">GET UP TO<br/>50% OFF</div>
                <button onClick={()=>setActiveFilter('Sale')} className="mt-3 h-8 px-4 bg-white text-black rounded-full text-[11px] font-bold">Shop Sale →</button>
              </div>
              <div className="w-[200px] hidden md:block relative"><img src={products[1]?.image_url || products[0]?.image_url} alt="" className="absolute -bottom-2 -right-6 w-[220px] object-contain -rotate-12 shoe-shadow" /></div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#E8FF86] via-white to-[#7C3AED]"/>
          </div>

          {/* Mobile Filters */}
          <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['All','Nike','Adidas','New','Sale'].map(f=><button key={f} onClick={()=>setActiveFilter(f)} className={`h-8 px-4 rounded-full text-[12px] font-bold whitespace-nowrap border ${activeFilter===f?'bg-black text-white':'bg-white'}`}>{f}</button>)}
          </div>

          {/* Product Grid - Ultra Premium Cards */}
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p:Product,i:number)=>(
              <div key={p.id} onClick={()=>setSelectedShoe(p)} className={`group relative bg-white border rounded-[22px] p-3 cursor-pointer transition-all hover:border-black hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)] ${selectedShoe?.id===p.id ? 'border-black ring-2 ring-black ring-offset-2 ring-offset-[#F2F0FF]' : 'border-black/[0.06]'}`}>
                <button onClick={(e)=>{e.stopPropagation(); toggleLike(p.id)}} className={`absolute top-3 right-3 w-7 h-7 rounded-full border grid place-items-center z-10 ${liked.includes(p.id)?'bg-black text-white':'bg-white/90 glass-card'}`}>{liked.includes(p.id)?'♥':'♡'}</button>
                {i<2 && <div className="absolute top-3 left-3 h-6 px-2 bg-[#E8FF86] border border-black rounded-full text-[9px] font-black mono grid place-items-center">BESTSELLER</div>}
                <div className="aspect-square bg-[#F8F7FF] rounded-[14px] p-4 grid place-items-center overflow-hidden">
                  <img src={p.image_url} alt="" className="w-full h-full object-contain group-hover:scale-[1.08] group-hover:-rotate-6 transition-[transform] duration-500 shoe-shadow" />
                </div>
                <div className="mt-3 px-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[12px] font-bold leading-[1.1] truncate">{p.name}</div>
                    <div className="text-[11px] font-black">Rs. {p.price}</div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex gap-1">{[0,1,2].map(d=><span key={d} className="w-1.5 h-1.5 rounded-full bg-black/20" style={{background: d===0 ? '#7C3AED' : d===1 ? '#0A0A0A' : '#E8E8F0'}}/>)}</div>
                    <div className="h-6 w-6 bg-black text-white rounded-full grid place-items-center text-[12px] group-hover:rotate-45 transition-transform">↗</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT - Premium Sidebar */}
        <div className="hidden lg:block space-y-4">
          <div className="bg-white border border-black/[0.06] rounded-[20px] p-4">
            <div className="flex justify-between items-center"><span className="font-bold text-[12px]">Recently Viewed</span><span className="text-[10px] text-black/40 underline">Clear</span></div>
            <div className="mt-3 space-y-2">
              {products.slice(0,3).map((p:any)=><div key={p.id} onClick={()=>setSelectedShoe(p)} className="flex gap-3 p-2 rounded-[12px] hover:bg-[#F2F0FF] cursor-pointer"><div className="w-12 h-12 bg-[#F8F7FF] rounded-[10px] grid place-items-center"><img src={p.image_url} className="w-10 h-10 object-contain -rotate-12" alt=""/></div><div className="flex-1 min-w-0"><div className="text-[11px] font-bold truncate">{p.name}</div><div className="text-[10px] text-black/50">Rs. {p.price} • Size {activeSize}</div></div><div className="w-5 h-5 bg-black text-white rounded-full grid place-items-center text-[10px]">↗</div></div>)}
            </div>
          </div>

          <div className="bg-[#0A0A0A] text-white rounded-[20px] p-5 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#7C3AED] rounded-full blur-[28px] opacity-60"/>
            <div className="mono text-[10px] tracking-[0.2em] text-white/50">MEMBER PERKS</div>
            <div className="mt-3 font-[800] text-[18px] leading-[1.05]">Free Shipping<br/>+ 7 Days Return</div>
            <div className="mt-3 text-[11px] text-white/60 leading-[1.4]">Premium members get early access to drops, free COD & priority support.</div>
            <button className="mt-4 w-full h-9 bg-white text-black rounded-full text-[12px] font-bold">Join Premium — Free</button>
          </div>

          <div className="bg-white border border-black/[0.06] rounded-[20px] p-4">
            <div className="font-bold text-[12px]">Your Collection</div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {products.slice(0,6).map((p:any)=><div key={p.id} onClick={()=>setSelectedShoe(p)} className="aspect-square bg-[#F8F7FF] border rounded-[12px] p-1.5 cursor-pointer"><img src={p.image_url} className="w-full h-full object-contain" alt=""/></div>)}
            </div>
          </div>
        </div>
      </div>

      {/* CART - Ultra Premium */}
      <div className={`fixed inset-0 z-[120] ${localShowCart ? '' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition ${localShowCart ? 'opacity-100' : 'opacity-0'}`} onClick={closeCart}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-full max-w-[420px] bg-white border-l border-black/10 flex flex-col transition-transform duration-[420ms] cubic-bezier(0.22,1,0.32,1) ${localShowCart ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-[72px] px-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-black text-white grid place-items-center font-black text-[12px]">{cartCount}</div><h3 className="font-black text-[14px] tracking-[-0.02em]">Your Bag • Shoe App</h3></div>
            <button onClick={closeCart} className="w-9 h-9 border rounded-full grid place-items-center">✕</button>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {cart.map((p:any,i:number)=>(
              <div key={i} className="flex gap-3 p-3 bg-[#F2F0FF] border border-black/[0.06] rounded-[16px]">
                <div className="w-[72px] h-[72px] bg-white rounded-[12px] grid place-items-center"><img src={p.image_url} className="w-[56px] h-[56px] object-contain -rotate-12" alt=""/></div>
                <div className="flex-1">
                  <div className="text-[12px] font-bold leading-[1.1]">{p.name}</div>
                  <div className="mt-1 flex gap-1.5"><span className="h-5 px-2 bg-black text-white rounded-full text-[10px] grid place-items-center">Sz {p.selectedSize||activeSize}</span><span className="w-5 h-5 rounded-full border-2 border-white shadow" style={{background:p.selectedColorBg||'#7C3AED'}}/></div>
                  <div className="mt-2 font-black text-[12px]">Rs. {p.price.toLocaleString()}</div>
                </div>
                <button onClick={()=>{cart.splice(i,1); setLocalShowCart(false); setTimeout(()=>setLocalShowCart(true),10)}} className="w-7 h-7 bg-white border rounded-full grid place-items-center text-[11px]">✕</button>
              </div>
            ))}
            {cartCount===0 && <div className="py-24 text-center"><div className="w-16 h-16 mx-auto bg-[#F2F0FF] rounded-full grid place-items-center text-[22px]">🛍️</div><div className="mt-4 font-bold text-[13px]">Your bag is empty</div><div className="mt-1 text-[11px] text-black/40">Select sizes & colors to add</div><button onClick={closeCart} className="mt-4 h-9 px-5 bg-black text-white rounded-full text-[12px] font-bold">Continue Shopping</button></div>}
          </div>
          {cartCount>0 && (
            <div className="p-5 border-t bg-[#FCFCFF] space-y-3">
              <div className="space-y-2">
                <input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Full name *" className="w-full h-11 px-4 bg-white border border-black/10 rounded-[12px] text-[13px] outline-none focus:border-black"/>
                <input value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} placeholder="Complete delivery address *" className="w-full h-11 px-4 bg-white border border-black/10 rounded-[12px] text-[13px] outline-none focus:border-black"/>
              </div>
              <div className="flex justify-between text-[13px]"><span className="text-black/60">Subtotal • {cartCount} items</span><span className="font-black">Rs. {cartTotal.toLocaleString()}</span></div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={closeCart} className="h-11 bg-white border border-black/10 rounded-full text-[13px] font-bold">Keep Shopping</button>
                <button onClick={orderWhatsApp} className="h-11 bg-[#25D366] text-white rounded-full text-[13px] font-bold flex items-center justify-center gap-1.5">● WhatsApp Order</button>
              </div>
              <div className="text-[10px] mono text-center text-black/30">SECURE • COD AVAILABLE • FREE SHIPPING OVER RS. 5000</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
