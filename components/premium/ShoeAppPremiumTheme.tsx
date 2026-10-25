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
  const [showSizeGuide, setShowSizeGuide] = useState(false)

  const cartCount = cart?.length || 0
  const cartTotal = cart?.reduce((s:any,p:any)=>s+p.price,0) || 0
  const openCart = () => { setLocalShowCart(true); if(setShowCart) setShowCart(true) }
  const closeCart = () => { setLocalShowCart(false); if(setShowCart) setShowCart(false) }

  const colors = [
    { name: 'Violet', bg: '#7C3AED' },
    { name: 'Midnight', bg: '#0A0A0A' },
    { name: 'Cloud', bg: '#E8E8F0' },
    { name: 'Coral', bg: '#FF5A5A' },
    { name: 'Lime', bg: '#E8FF86' },
  ]
  const sizes = [28,29,30,31,32,33,34]

  useEffect(()=>{ if(products[0] && !selectedShoe) setSelectedShoe(products[0]) },[products])

  const filtered = activeFilter==='All' ? products : products.filter((p:any)=> (p.name+p.category||'').toLowerCase().includes(activeFilter.toLowerCase()))
  const toggleLike = (id:string)=> setLiked(prev=> prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id])
  const orderWhatsApp = ()=>{
    if(!profile || cart.length===0) return
    if(!customerName.trim()){ alert('Please enter your name'); return }
    if(!customerAddress.trim()){ alert('Please enter your address'); return }
    cart.forEach((p:any)=>track?.('whatsapp_click',p.id))
    const lines=cart.map((p:any)=>`• ${p.name} - Rs. ${p.price} (Sz ${activeSize}, ${colors[activeColor].name})`).join('%0A')
    const msg=`Hi ${profile.business_name}!%0A%0A🟣 SHOE APP PREMIUM ORDER%0A${lines}%0ATotal: Rs. ${cartTotal.toLocaleString()}%0AName: ${customerName}%0AAddress: ${customerAddress}%0AStore: ${typeof window!=='undefined'? window.location.href:''}`
    window.open(`https://wa.me/${profile.whatsapp_number}?text=${msg}`,'_blank')
  }
  const handleAddToCart = (p:Product)=>{ const prod={...p,selectedSize:activeSize,selectedColor:colors[activeColor].name,selectedColorBg:colors[activeColor].bg}; for(let i=0;i<qty;i++) onAdd(prod); setTimeout(()=>openCart(),250) }

  return (
    <div className="min-h-screen bg-[#F2F0FF] text-[#0A0A0A] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700;800&display=swap');
        *{font-family:'Geist',system-ui,sans-serif}
        @keyframes floatShoe{0%,100%{transform:rotate(-12deg) translateY(0)}50%{transform:rotate(-12deg) translateY(-8px)}}
        @keyframes shine{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
        .glass-card{backdrop-filter:blur(24px) saturate(1.2);-webkit-backdrop-filter:blur(24px) saturate(1.2)}
        .no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{scrollbar-width:none}
        .shoe-shadow{filter:drop-shadow(0 20px 24px rgba(124,58,237,0.22)) drop-shadow(0 6px 10px rgba(0,0,0,0.12))}
      `}</style>

      <div className="max-w-[1440px] mx-auto px-3 md:px-6 py-3 md:py-4">
        <div className="h-[56px] md:h-[64px] bg-white/90 glass-card border border-black/[0.06] rounded-[16px] md:rounded-[20px] flex items-center justify-between px-4 md:px-5 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 md:gap-6">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-[10px] md:rounded-[12px] bg-[#0A0A0A] text-white grid place-items-center font-black text-[12px] md:text-[13px]">S</div>
            <div className="hidden md:flex items-center gap-1 bg-[#F2F0FF] rounded-full p-1 border">
              {['All','Nike','Adidas','New','Sale'].map(f=><button key={f} onClick={()=>setActiveFilter(f)} className={`h-7 px-4 rounded-full text-[12px] font-bold ${activeFilter===f?'bg-black text-white shadow':'text-black/60 hover:text-black'}`}>{f}</button>)}
            </div>
            <div className="hidden lg:flex items-center gap-2 text-[10px] mono font-bold tracking-widest text-black/40">{profile?.business_name?.toUpperCase()} • LIVE • COD</div>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <button className="w-8 h-8 md:w-9 md:h-9 bg-white border rounded-full grid place-items-center text-[12px]">♡</button>
            <button onClick={openCart} className="h-8 md:h-9 pl-2 pr-1 bg-black text-white rounded-full flex items-center gap-2 text-[11px] md:text-[12px] font-bold"><span className="px-2 hidden md:inline">Cart</span><span className="w-6 h-6 md:w-7 md:h-7 bg-white text-black rounded-full grid place-items-center text-[10px] md:text-[11px] font-black">{cartCount}</span></button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-3 md:px-6 pb-20 grid lg:grid-cols-[320px_1fr_340px] gap-3 md:gap-4">

        {/* LEFT - SMALLER PREVIEW TO FIT SCREEN */}
        <div className="bg-white border border-black/[0.06] rounded-[20px] md:rounded-[28px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col lg:sticky lg:top-[84px] lg:max-h-[calc(100vh-100px)] lg:overflow-auto no-scrollbar">
          {selectedShoe ? (
            <>
              <div className="relative bg-[#F8F7FF] h-[220px] md:h-[260px] lg:h-[240px] p-4 md:p-5 flex items-center justify-center shrink-0">
                <div className="absolute top-3 left-3 right-3 flex justify-between">
                  <div className="h-6 px-2.5 bg-white border rounded-full text-[9px] font-black mono tracking-widest grid place-items-center">NEW DROP • {new Date().getFullYear()}</div>
                  <button onClick={()=>toggleLike(selectedShoe.id)} className={`w-7 h-7 rounded-full border grid place-items-center text-[12px] ${liked.includes(selectedShoe.id)?'bg-black text-white':'bg-white'}`}>{liked.includes(selectedShoe.id)?'♥':'♡'}</button>
                </div>
                <img src={selectedShoe.image_url} alt="" className="w-[72%] md:w-[68%] max-h-[160px] md:max-h-[180px] object-contain shoe-shadow animate-[floatShoe_5s_ease-in-out_infinite]" />
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                  <div className="flex gap-1">{colors.map((c,i)=><button key={i} onClick={()=>setActiveColor(i)} className={`w-5 h-5 rounded-full border-2 ${activeColor===i?'border-black scale-110':'border-white'} shadow-sm`} style={{background:c.bg}} />)}</div>
                  <div className="h-5 px-2 bg-black text-white rounded-full text-[9px] font-bold grid place-items-center">{colors[activeColor].name.toUpperCase()}</div>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-[16px] md:text-[18px] font-[800] leading-[0.95] tracking-[-0.02em] line-clamp-2">{selectedShoe.name}</h2>
                  <div className="text-right shrink-0"><div className="text-[16px] md:text-[18px] font-black">Rs. {selectedShoe.price.toLocaleString()}</div>{selectedShoe.original_price && <div className="text-[10px] line-through text-black/40">Rs. {selectedShoe.original_price}</div>}</div>
                </div>
                <p className="mt-2 text-[11px] leading-[1.4] text-black/50 line-clamp-2">{selectedShoe.description || 'Engineered mesh upper, responsive foam, ultra-light traction. Premium comfort meets street dominance.'}</p>

                <div className="mt-3">
                  <div className="flex justify-between items-center"><span className="mono text-[9px] font-black tracking-[0.14em]">SIZE • EU</span><button onClick={()=>setShowSizeGuide(true)} className="text-[10px] text-black/40 underline">Guide</button></div>
                  <div className="mt-2 grid grid-cols-7 gap-[5px]">{sizes.map(s=><button key={s} onClick={()=>setActiveSize(s)} className={`h-[32px] rounded-[10px] border text-[11px] font-bold ${activeSize===s?'bg-black text-white border-black shadow':'bg-[#F2F0FF] border-transparent text-black/60 hover:border-black/20'}`}>{s}</button>)}</div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="mono text-[9px] font-black tracking-[0.14em]">QTY</div>
                  <div className="flex items-center gap-1.5 bg-[#F2F0FF] rounded-full p-1 border">
                    <button onClick={()=>setQty(Math.max(1,qty-1))} className="w-6 h-6 bg-white border rounded-full grid place-items-center font-bold text-[12px]">−</button>
                    <span className="w-6 text-center text-[12px] font-black">{qty}</span>
                    <button onClick={()=>setQty(qty+1)} className="w-6 h-6 bg-white border rounded-full grid place-items-center font-bold text-[12px]">+</button>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-[9px] mono text-black/50"><span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full"/>IN STOCK</span><span>⚡ Ships in 24h</span><span>↩ 7-Day Return</span><span>✓ COD Available</span></div>
                  <div className="grid grid-cols-[1fr_48px] gap-2">
                    <button onClick={()=>handleAddToCart(selectedShoe)} className="relative overflow-hidden h-[44px] bg-[#0A0A0A] text-white rounded-[12px] font-bold text-[12px] flex items-center justify-center gap-2 group"><span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[900ms]"/><span>🛒 Add — Rs. {(selectedShoe.price*qty).toLocaleString()}</span></button>
                    <button onClick={()=>handleAddToCart(selectedShoe)} className="h-[44px] w-[48px] bg-[#E8FF86] border border-black rounded-[12px] grid place-items-center font-black text-[16px]">↗</button>
                  </div>
                </div>
              </div>
            </>
          ) : <div className="p-10 text-center text-[13px] text-black/30">Select a shoe</div>}
        </div>

        {/* CENTER */}
        <div className="space-y-3">
          <div className="relative h-[140px] md:h-[160px] rounded-[18px] md:rounded-[24px] overflow-hidden bg-[#111AFF] border">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_50%)]" />
            <div className="absolute inset-0 p-4 md:p-5 flex">
              <div className="flex-1"><div className="inline-flex h-5 px-2 bg-white text-[9px] font-black mono rounded-full items-center">LIMITED • BLACK FRIDAY</div><div className="mt-2 text-white font-[900] text-[20px] md:text-[24px] leading-[0.9]">GET UP TO<br/>50% OFF</div><button onClick={()=>setActiveFilter('Sale')} className="mt-2 h-7 px-3 bg-white text-black rounded-full text-[10px] font-bold">Shop Sale →</button></div>
              <div className="w-[160px] hidden md:block relative"><img src={products[1]?.image_url || products[0]?.image_url} alt="" className="absolute -bottom-2 -right-4 w-[180px] object-contain -rotate-12 shoe-shadow" /></div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#E8FF86] via-white to-[#7C3AED]"/>
          </div>

          <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar pb-1">{['All','Nike','Adidas','New','Sale'].map(f=><button key={f} onClick={()=>setActiveFilter(f)} className={`h-7 px-3 rounded-full text-[11px] font-bold whitespace-nowrap border ${activeFilter===f?'bg-black text-white':'bg-white'}`}>{f}</button>)}</div>

          <div className="grid grid-cols-2 gap-2.5 md:gap-3">
            {filtered.map((p:Product,i:number)=>(
              <div key={p.id} onClick={()=>setSelectedShoe(p)} className={`group relative bg-white border rounded-[18px] md:rounded-[22px] p-2.5 md:p-3 cursor-pointer hover:border-black hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] ${selectedShoe?.id===p.id?'border-black ring-2 ring-black ring-offset-2 ring-offset-[#F2F0FF]': 'border-black/[0.06]'}`}>
                <button onClick={(e)=>{e.stopPropagation(); toggleLike(p.id)}} className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full border grid place-items-center text-[10px] z-10 ${liked.includes(p.id)?'bg-black text-white':'bg-white/90 glass-card'}`}>{liked.includes(p.id)?'♥':'♡'}</button>
                {i<2 && <div className="absolute top-2.5 left-2.5 h-5 px-1.5 bg-[#E8FF86] border border-black rounded-full text-[8px] font-black mono grid place-items-center">BEST</div>}
                <div className="aspect-square bg-[#F8F7FF] rounded-[12px] md:rounded-[14px] p-3 grid place-items-center"><img src={p.image_url} alt="" className="w-full h-full object-contain group-hover:scale-[1.06] group-hover:-rotate-3 transition duration-500 shoe-shadow" /></div>
                <div className="mt-2.5 px-0.5"><div className="flex justify-between gap-1"><div className="text-[11px] font-bold leading-[1.1] truncate">{p.name}</div><div className="text-[11px] font-black shrink-0">Rs. {p.price}</div></div><div className="mt-1.5 flex justify-between items-center"><div className="flex gap-1">{[0,1,2].map(d=><span key={d} className="w-1 h-1 rounded-full" style={{background:d===0?'#7C3AED':d===1?'#0A0A0A':'#E8E8F0'}}/>)}</div><div className="w-5 h-5 bg-black text-white rounded-full grid place-items-center text-[10px] group-hover:rotate-45 transition">↗</div></div></div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="hidden lg:block space-y-3">
          <div className="bg-white border border-black/[0.06] rounded-[18px] p-3.5">
            <div className="flex justify-between"><span className="font-bold text-[11px]">Recently Viewed</span><span className="text-[10px] text-black/40 underline">Clear</span></div>
            <div className="mt-2.5 space-y-1.5">{products.slice(0,3).map((p:any)=><div key={p.id} onClick={()=>setSelectedShoe(p)} className="flex gap-2.5 p-2 rounded-[10px] hover:bg-[#F2F0FF] cursor-pointer"><div className="w-10 h-10 bg-[#F8F7FF] rounded-[8px] grid place-items-center"><img src={p.image_url} className="w-8 h-8 object-contain -rotate-12" alt=""/></div><div className="flex-1 min-w-0"><div className="text-[10px] font-bold truncate">{p.name}</div><div className="text-[9px] text-black/50">Rs. {p.price} • Sz {activeSize}</div></div><div className="w-4 h-4 bg-black text-white rounded-full grid place-items-center text-[8px]">↗</div></div>)}</div>
          </div>
          <div className="bg-[#0A0A0A] text-white rounded-[18px] p-4 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-24 h-24 bg-[#7C3AED] rounded-full blur-[20px] opacity-60"/>
            <div className="mono text-[9px] tracking-[0.2em] text-white/50">MEMBER PERKS</div>
            <div className="mt-2 font-[800] text-[15px] leading-[1.05]">Free Shipping<br/>+ 7 Days Return</div>
            <div className="mt-2 text-[10px] text-white/60">Early access to drops, COD & priority.</div>
            <button className="mt-3 w-full h-8 bg-white text-black rounded-full text-[11px] font-bold">Join Premium — Free</button>
          </div>
        </div>
      </div>

      {showSizeGuide && <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur grid place-items-center p-4"><div className="bg-white rounded-[20px] w-full max-w-[400px] p-5"><div className="flex justify-between"><h3 className="font-bold text-[14px]">Size Guide</h3><button onClick={()=>setShowSizeGuide(false)} className="w-7 h-7 border rounded-full grid place-items-center">✕</button></div><div className="mt-4 grid grid-cols-3 gap-2 text-[11px]"><div className="font-bold">EU</div><div className="font-bold">US</div><div className="font-bold">CM</div>{sizes.map(s=><>{s}<span>{(s-22)}</span><span>{(s*0.66).toFixed(1)}</span></>)}</div></div></div>}

      <div className={`fixed inset-0 z-[120] ${localShowCart ? '' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition ${localShowCart ? 'opacity-100' : 'opacity-0'}`} onClick={closeCart}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-full max-w-[380px] md:max-w-[400px] bg-white border-l flex flex-col transition-transform duration-[400ms] ${localShowCart ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-[64px] px-5 border-b flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-black text-white grid place-items-center font-black text-[11px]">{cartCount}</div><h3 className="font-black text-[13px]">Your Bag</h3></div><button onClick={closeCart} className="w-8 h-8 border rounded-full grid place-items-center">✕</button></div>
          <div className="flex-1 overflow-auto p-3 space-y-2.5">{cart.map((p:any,i:number)=><div key={i} className="flex gap-2.5 p-2.5 bg-[#F2F0FF] border rounded-[14px]"><div className="w-[60px] h-[60px] bg-white rounded-[10px] grid place-items-center"><img src={p.image_url} className="w-[48px] h-[48px] object-contain -rotate-12" alt=""/></div><div className="flex-1"><div className="text-[11px] font-bold leading-[1.1]">{p.name}</div><div className="mt-1 flex gap-1"><span className="h-4 px-1.5 bg-black text-white rounded-full text-[9px] grid place-items-center">Sz {p.selectedSize||activeSize}</span><span className="w-4 h-4 rounded-full border-2 border-white shadow" style={{background:p.selectedColorBg||'#7C3AED'}}/></div><div className="mt-1 font-black text-[11px]">Rs. {p.price.toLocaleString()}</div></div><button onClick={()=>{/* cart removal handled by parent - placeholder */ console.log('remove',i)}} className="w-6 h-6 bg-white border rounded-full grid place-items-center text-[10px]">✕</button></div>)}{cartCount===0 && <div className="py-16 text-center"><div className="w-14 h-14 mx-auto bg-[#F2F0FF] rounded-full grid place-items-center text-[20px]">🛍️</div><div className="mt-3 font-bold text-[12px]">Your bag is empty</div><div className="mt-1 text-[10px] text-black/40">Select sizes & colors</div><button onClick={closeCart} className="mt-3 h-8 px-4 bg-black text-white rounded-full text-[11px] font-bold">Continue</button></div>}</div>
          {cartCount>0 && <div className="p-4 border-t bg-[#FCFCFF] space-y-2.5"><input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Full name *" className="w-full h-10 px-3 bg-white border border-black/10 rounded-[10px] text-[12px] outline-none focus:border-black"/><input value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} placeholder="Complete address *" className="w-full h-10 px-3 bg-white border border-black/10 rounded-[10px] text-[12px] outline-none focus:border-black"/><div className="flex justify-between text-[12px]"><span className="text-black/60">Subtotal • {cartCount} items</span><span className="font-black">Rs. {cartTotal.toLocaleString()}</span></div><div className="grid grid-cols-2 gap-2"><button onClick={closeCart} className="h-10 bg-white border rounded-full text-[12px] font-bold">Keep Shopping</button><button onClick={orderWhatsApp} className="h-10 bg-[#25D366] text-white rounded-full text-[12px] font-bold">● WhatsApp Order</button></div><div className="text-[9px] mono text-center text-black/30">SECURE • COD • FREE SHIPPING OVER 5000</div></div>}
        </div>
      </div>
    </div>
  )
}
