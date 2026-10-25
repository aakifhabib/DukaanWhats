'use client'
import { useState, useEffect, useRef } from 'react'

type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; original_price?: number; description?: string; sizes?: string[]; colors?: string[]; stock?: number; category?: string }

function Gallery({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0)
  const [hover, setHover] = useState(false)
  useEffect(()=>{ if(!hover || images.length<=1) return; const iv=setInterval(()=>setIdx(p=>(p+1)%images.length),2000); return()=>clearInterval(iv)},[hover,images.length])
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
  const [selectedColor, setSelectedColor] = useState('')
  const [qty, setQty] = useState(1)
  const [localShowCart, setLocalShowCart] = useState(false)
  const collectionRef = useRef<HTMLDivElement>(null)

  const custom = (profile as any)?.premium_custom || {}
  const heroTitle = custom.spikeTitle || 'The journey begins with the perfect pair'
  const heroSub = custom.spikeSub || 'Dive into unparalleled comfort with unmatched style. Find your perfect stride.'
  const brandList = custom.spikeBrands || ['All','Nike','Adidas','Puma','New Balance']
  const announcement = custom.announcement || 'FREE SHIPPING OVER RS. 5000 • NEW DROP LIVE • COD AVAILABLE'

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
    const lines = cart.map((p:any)=>`• ${p.name} - Rs. ${p.price}${p.selectedSize?` (Size: ${p.selectedSize})`:''}`).join('%0A')
    const msg = `Hi ${profile.business_name}!%0A%0ASPIKE PREMIUM ORDER%0A${lines}%0ATotal: Rs. ${cartTotal}%0AName: ${customerName}%0AAddress: ${customerAddress}%0AStore: ${typeof window!=='undefined'? window.location.href:''}`
    window.open(`https://wa.me/${profile.whatsapp_number}?text=${msg}`,'_blank')
  }
  const handleAdd = (p:any, direct=false) => {
    const prod = {...p, selectedSize, selectedColor}
    onAdd(prod, qty)
    setSelectedProduct(null)
    setQty(1)
    if(direct) setTimeout(()=>openCart(),300)
  }

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#0A0A0A] antialiased">
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}} .no-scrollbar::-webkit-scrollbar{display:none}`}</style>
      <div className="bg-black text-white text-[10px] mono tracking-widest h-8 flex items-center overflow-hidden"><div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap gap-8"><span>{announcement}</span><span>{announcement}</span><span>{announcement}</span></div></div>
      <header className="sticky top-0 z-30 bg-[#FCFBF9]/80 backdrop-blur border-b border-black/10"><div className="max-w-[1320px] mx-auto px-4 h-[56px] flex items-center justify-between"><div className="flex items-center gap-2 font-black text-[15px]">SPIKE • {profile?.business_name}</div><div className="flex items-center gap-2"><span className="hidden md:flex h-7 px-3 bg-white border rounded-full text-[10px] font-bold items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>LIVE • {products.length} PRODUCTS</span><button onClick={openCart} className="h-8 px-3.5 bg-black text-white rounded-full text-[11px] font-bold">Cart ({cartCount})</button></div></div></header>

      <section className="max-w-[1320px] mx-auto px-4 py-6 md:py-10 grid md:grid-cols-2 gap-6 md:gap-8">
        <div>
          <div className="inline-flex border rounded-full px-2.5 h-6 text-[10px] uppercase font-bold tracking-widest">New Drop • Live • COD</div>
          <h1 className="mt-4 md:mt-6 text-[32px] md:text-[56px] font-[800] leading-[0.88] tracking-[-0.04em]">{heroTitle}</h1>
          <p className="mt-3 md:mt-4 text-[12px] md:text-[13px] text-black/50 max-w-[340px] leading-[1.4]">{heroSub}</p>
          <div className="mt-5 flex gap-2"><button onClick={()=>collectionRef.current?.scrollIntoView({behavior:'smooth'})} className="h-10 md:h-11 px-5 md:px-6 bg-black text-white rounded-full text-[12px] md:text-[13px] font-bold">Shop Now →</button><button onClick={openCart} className="h-10 md:h-11 px-5 md:px-6 bg-white border rounded-full text-[12px] md:text-[13px] font-bold">Cart ({cartCount})</button></div>
          <div className="mt-6 flex flex-wrap gap-1.5">{brandList.map((b:any)=><button key={b} onClick={()=>{setActiveBrand(b); collectionRef.current?.scrollIntoView({behavior:'smooth'})}} className={`h-7 px-3.5 rounded-full text-[11px] font-bold border ${activeBrand===b?'bg-black text-white':'bg-white hover:border-black/20'}`}>{b}</button>)}</div>
          <div className="mt-6 grid grid-cols-3 gap-2 text-[10px] mono"><div className="bg-white border rounded-[10px] p-2.5"><div className="font-black">500+</div><div className="text-black/40">Orders</div></div><div className="bg-white border rounded-[10px] p-2.5"><div className="font-black">4.9★</div><div className="text-black/40">Rating</div></div><div className="bg-white border rounded-[10px] p-2.5"><div className="font-black">COD</div><div className="text-black/40">Available</div></div></div>
        </div>
        <div className="relative bg-white rounded-[20px] md:rounded-[28px] p-3 md:p-4 border shadow-[0_24px_64px_-20px_rgba(0,0,0,0.18)] h-fit"><img src={products[0]?.image_url || 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=600'} className="w-full aspect-square object-cover rounded-[14px] md:rounded-[18px] animate-[float_6s_ease-in-out_infinite]" alt=""/><div className="absolute top-5 right-5 bg-white border rounded-full px-2.5 h-6 text-[10px] font-bold grid place-items-center">FREE SHIPPING</div><div className="absolute bottom-5 left-5 right-5 bg-black text-white rounded-[12px] p-3 flex justify-between items-center"><div><div className="text-[11px] font-bold">Trending Now</div><div className="text-[10px] text-white/60">{products.length} curated drops</div></div><div className="w-8 h-8 bg-white text-black rounded-full grid place-items-center text-[12px]">↗</div></div></div>
      </section>

      <section ref={collectionRef} className="max-w-[1320px] mx-auto px-4 py-6">
        <div className="flex justify-between items-center"><h2 className="text-[18px] md:text-[20px] font-bold">Spike Collections • {filtered.length}</h2><span className="text-[10px] mono text-black/40">PREMIUM CURATED</span></div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((p:Product,i:number)=><div key={p.id} onClick={()=>{ setSelectedSize(''); setSelectedColor(''); setQty(1); onOpen(p)}} className="bg-white border rounded-[16px] md:rounded-[20px] p-2.5 md:p-3 hover:border-black hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] cursor-pointer group"><div className="overflow-hidden rounded-[10px] md:rounded-[14px] aspect-square bg-[#F8F7F5] relative"><img src={p.image_url} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt=""/>{i<2 && <div className="absolute top-2 left-2 h-5 px-2 bg-[#E8FF86] border border-black rounded-full text-[8px] font-black grid place-items-center">HOT</div>}</div><div className="mt-2.5 text-[12px] font-bold truncate">{p.name}</div><div className="text-[13px] font-black">Rs. {p.price.toLocaleString()}</div><div className="mt-1 text-[10px] mono text-black/40">FREE DELIVERY • COD</div></div>)}
        </div>
      </section>

      {selectedProduct && <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur flex items-center justify-center p-3 md:p-4"><div className="bg-white rounded-[20px] md:rounded-[24px] w-full max-w-[960px] max-h-[90vh] overflow-auto grid md:grid-cols-2"><div className="p-4 bg-[#F6F5F2]"><Gallery images={selectedProduct.image_urls?.length? selectedProduct.image_urls : [selectedProduct.image_url]} /></div><div className="p-5 flex flex-col"><div className="flex justify-between"><h2 className="text-[20px] font-bold">{selectedProduct.name}</h2><button onClick={()=>setSelectedProduct(null)} className="w-8 h-8 border rounded-full grid place-items-center">✕</button></div><div className="mt-3 text-[20px] font-black">Rs. {selectedProduct.price.toLocaleString()}</div><p className="mt-2 text-[12px] text-black/60 leading-[1.4]">{selectedProduct.description}</p><div className="mt-4"><div className="text-[10px] font-black tracking-widest">SIZE</div><div className="mt-2 flex flex-wrap gap-1.5">{(selectedProduct.sizes || ['40','41','42','43','44']).map((s:string)=><button key={s} onClick={()=>setSelectedSize(s)} className={`h-8 px-3.5 border rounded-full text-[11px] font-bold ${selectedSize===s?'bg-black text-white':'bg-white'}`}>{s}</button>)}</div></div><div className="mt-3"><div className="text-[10px] font-black tracking-widest">COLOR</div><div className="mt-2 flex gap-1.5">{(selectedProduct.colors || ['Black','White']).map((c:string)=><button key={c} onClick={()=>setSelectedColor(c)} className={`h-7 px-2.5 border rounded-full text-[11px] ${selectedColor===c?'bg-black text-white':'bg-white'}`}>{c}</button>)}</div></div><div className="mt-3 flex items-center gap-2"><button onClick={()=>setQty(Math.max(1,qty-1))} className="w-7 h-7 border rounded-full grid place-items-center">-</button><span className="w-6 text-center font-bold text-[13px]">{qty}</span><button onClick={()=>setQty(qty+1)} className="w-7 h-7 border rounded-full grid place-items-center">+</button><span className="ml-auto text-[10px] mono text-black/40">{selectedProduct.stock||12} in stock • Ships 24h</span></div><div className="mt-auto pt-5 grid grid-cols-2 gap-2"><button onClick={()=>handleAdd(selectedProduct,false)} className="h-10 bg-black text-white rounded-full font-bold text-[12px]">Add to Cart</button><button onClick={()=>handleAdd(selectedProduct,true)} className="h-10 bg-[#25D366] text-white rounded-full font-bold text-[12px]">WhatsApp Order</button></div></div></div></div>}

      <div className={`fixed inset-0 z-[110] ${localShowCart ? '' : 'pointer-events-none'}`}><div className={`absolute inset-0 bg-black/40 transition ${localShowCart ? 'opacity-100' : 'opacity-0'}`} onClick={closeCart}></div><div className={`absolute right-0 top-0 bottom-0 w-full max-w-[360px] bg-white flex flex-col transition-transform duration-300 ${localShowCart ? 'translate-x-0' : 'translate-x-full'}`}><div className="p-4 border-b flex justify-between items-center"><h3 className="font-bold text-[13px]">Cart ({cartCount}) • SPIKE</h3><button onClick={closeCart} className="w-7 h-7 border rounded-full grid place-items-center">✕</button></div><div className="flex-1 overflow-auto p-3 space-y-2">{cart.map((p:any,i:number)=><div key={i} className="flex gap-2.5 p-2.5 bg-zinc-50 rounded-[10px]"><img src={p.image_url} className="w-11 h-11 rounded-[8px] object-cover"/><div className="flex-1"><div className="text-[11px] font-bold">{p.name}</div><div className="text-[10px]">Rs. {p.price}{p.selectedSize?` • Sz ${p.selectedSize}`:''}</div></div></div>)}{cartCount===0 && <div className="py-16 text-center text-[12px] text-zinc-400">Cart empty</div>}</div>{cartCount>0 && <div className="p-4 border-t space-y-2.5"><input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Your name *" className="w-full h-10 px-3 border rounded-[10px] text-[12px]"/><input value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} placeholder="Address *" className="w-full h-10 px-3 border rounded-[10px] text-[12px]"/><div className="flex justify-between font-bold text-[12px]"><span>Total</span><span>Rs. {cartTotal.toLocaleString()}</span></div><button onClick={orderWhatsApp} className="w-full h-10 bg-[#25D366] text-white rounded-full font-bold text-[12px]">Order on WhatsApp</button></div>}</div></div>
    </div>
  )
}
