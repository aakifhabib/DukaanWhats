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
        <img src={images[idx]} className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]" alt="" />
        <div className="absolute top-3 left-3 bg-black text-white text-[10px] px-2.5 h-6 rounded-full font-bold">{idx+1}/{images.length}</div>
      </div>
      <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
        {images.map((u,i)=><button key={i} onClick={()=>setIdx(i)} className={`w-[64px] h-[64px] rounded-[14px] overflow-hidden border-2 shrink-0 ${i===idx?'border-black':'border-transparent opacity-60'}`}><img src={u} className="w-full h-full object-cover" alt=""/></button>)}
      </div>
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
  const heroRef = useRef<HTMLDivElement>(null)
  const collectionRef = useRef<HTMLDivElement>(null)

  const custom = (profile as any)?.premium_custom || {}
  const heroTitle = custom.spikeTitle || 'The journey begins with the perfect pair'
  const heroSub = custom.spikeSub || 'Dive into unparalleled comfort with unmatched style. Find your perfect stride.'
  const brandList = custom.spikeBrands || ['All','Nike','Adidas','Puma','New Balance']

  const cartCount = cart?.length || 0
  const cartTotal = cart?.reduce((s:any,p:any)=>s+p.price,0) || 0

  const openCart = () => { setLocalShowCart(true); if(setShowCart) setShowCart(true) }
  const closeCart = () => { setLocalShowCart(false); if(setShowCart) setShowCart(false) }
  const isCartOpen = localShowCart

  const filtered = activeBrand==='All' ? products : products.filter((p:any)=> (p.name+p.category).toLowerCase().includes(activeBrand.toLowerCase()))

  const orderWhatsApp = () => {
    if(!profile || cart.length===0) return
    if(!customerName.trim()){ alert('Please enter your name'); return }
    if(!customerAddress.trim()){ alert('Please enter your address'); return }
    cart.forEach((p:any)=>track?.('whatsapp_click',p.id))
    const lines = cart.map((p:any)=>`• ${p.name} - Rs. ${p.price}${p.selectedSize?` (Size: ${p.selectedSize})`:''}`).join('%0A')
    const msg = `Hi ${profile.business_name}!%0A%0AOrder - SPIKE%0A${lines}%0ATotal: Rs. ${cartTotal}%0AName: ${customerName}%0AAddress: ${customerAddress}`
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
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.no-scrollbar::-webkit-scrollbar{display:none}`}</style>
      <header className="sticky top-0 z-30 bg-[#FCFBF9]/80 backdrop-blur border-b border-black/10">
        <div className="max-w-[1320px] mx-auto px-5 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-[17px]">SPIKE • {profile?.business_name}</div>
          <button onClick={openCart} className="h-9 px-4 bg-black text-white rounded-full text-[12px] font-bold">Cart ({cartCount})</button>
        </div>
      </header>
      <section ref={heroRef} className="max-w-[1320px] mx-auto px-5 py-10 grid md:grid-cols-2 gap-8">
        <div>
          <div className="inline-flex border rounded-full px-3 h-7 text-[11px] uppercase">New Drop • Live</div>
          <h1 className="mt-6 text-[44px] md:text-[64px] font-[800] leading-[0.88] tracking-[-0.04em]">{heroTitle}</h1>
          <p className="mt-4 text-[14px] text-black/50 max-w-[360px]">{heroSub}</p>
          <div className="mt-6 flex gap-2">
            <button onClick={()=>collectionRef.current?.scrollIntoView({behavior:'smooth'})} className="h-11 px-6 bg-black text-white rounded-full text-[13px] font-bold">Shop Now →</button>
            <button onClick={openCart} className="h-11 px-6 bg-white border rounded-full text-[13px] font-bold">Cart ({cartCount})</button>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">{brandList.map((b:any)=><button key={b} onClick={()=>{setActiveBrand(b); collectionRef.current?.scrollIntoView({behavior:'smooth'})}} className={`h-8 px-4 rounded-full text-[12px] font-bold border ${activeBrand===b?'bg-black text-white':'bg-white'}`}>{b}</button>)}</div>
        </div>
        <div className="relative bg-white rounded-[28px] p-4 border shadow-[0_30px_80px_-20px_rgba(0,0,0,0.2)]">
          <img src={products[0]?.image_url || 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=600'} className="w-full aspect-square object-cover rounded-[18px] animate-[float_6s_ease-in-out_infinite]" alt=""/>
        </div>
      </section>
      <section ref={collectionRef} className="max-w-[1320px] mx-auto px-5 py-8">
        <h2 className="text-[22px] font-bold">Spike Collections • {filtered.length}</h2>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.map((p:Product,i:number)=>(
            <div key={p.id} onClick={()=>{ setSelectedSize(''); setSelectedColor(''); setQty(1); onOpen(p)}} className="bg-white border rounded-[20px] p-3 hover:border-black cursor-pointer group">
              <div className="overflow-hidden rounded-[14px] aspect-square bg-[#F8F7F5]"><img src={p.image_url} className="w-full h-full object-cover group-hover:scale-105 transition" alt=""/></div>
              <div className="mt-3 text-[13px] font-bold truncate">{p.name}</div>
              <div className="text-[14px] font-black">Rs. {p.price.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </section>
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-[960px] max-h-[90vh] overflow-auto grid md:grid-cols-2">
            <div className="p-5 bg-[#F6F5F2]"><Gallery images={selectedProduct.image_urls?.length? selectedProduct.image_urls : [selectedProduct.image_url]} /></div>
            <div className="p-6 flex flex-col">
              <div className="flex justify-between"><h2 className="text-[24px] font-bold">{selectedProduct.name}</h2><button onClick={()=>setSelectedProduct(null)} className="w-8 h-8 border rounded-full">✕</button></div>
              <div className="mt-4 text-[22px] font-black">Rs. {selectedProduct.price.toLocaleString()}</div>
              <p className="mt-3 text-[13px] text-black/60">{selectedProduct.description}</p>
              <div className="mt-4"><div className="text-[11px] font-bold">SIZE</div><div className="mt-2 flex flex-wrap gap-2">{(selectedProduct.sizes || ['40','41','42','43','44']).map((s:string)=><button key={s} onClick={()=>setSelectedSize(s)} className={`h-9 px-4 border rounded-full text-[12px] font-bold ${selectedSize===s?'bg-black text-white':'bg-white'}`}>{s}</button>)}</div></div>
              <div className="mt-3"><div className="text-[11px] font-bold">COLOR</div><div className="mt-2 flex gap-2">{(selectedProduct.colors || ['Black','White']).map((c:string)=><button key={c} onClick={()=>setSelectedColor(c)} className={`h-8 px-3 border rounded-full text-[12px] ${selectedColor===c?'bg-black text-white':'bg-white'}`}>{c}</button>)}</div></div>
              <div className="mt-3 flex items-center gap-2"><button onClick={()=>setQty(Math.max(1,qty-1))} className="w-8 h-8 border rounded-full">-</button><span className="w-8 text-center font-bold">{qty}</span><button onClick={()=>setQty(qty+1)} className="w-8 h-8 border rounded-full">+</button></div>
              <div className="mt-auto pt-6 grid grid-cols-2 gap-2">
                <button onClick={()=>handleAdd(selectedProduct,false)} className="h-11 bg-black text-white rounded-full font-bold text-[13px]">Add to Cart</button>
                <button onClick={()=>handleAdd(selectedProduct,true)} className="h-11 bg-[#25D366] text-white rounded-full font-bold text-[13px]">WhatsApp Order</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={`fixed inset-0 z-[110] ${isCartOpen ? '' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/40 transition ${isCartOpen ? 'opacity-100' : 'opacity-0'}`} onClick={closeCart}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-full max-w-[380px] bg-white flex flex-col transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-5 border-b flex justify-between items-center"><h3 className="font-bold">Cart ({cartCount})</h3><button onClick={closeCart} className="w-8 h-8 border rounded-full">✕</button></div>
          <div className="flex-1 overflow-auto p-4 space-y-2">{cart.map((p:any,i:number)=><div key={i} className="flex gap-3 p-3 bg-zinc-50 rounded-[12px]"><img src={p.image_url} className="w-12 h-12 rounded-[8px] object-cover"/><div className="flex-1"><div className="text-[12px] font-bold">{p.name}</div><div className="text-[11px]">Rs. {p.price}</div></div></div>)}{cartCount===0 && <div className="py-20 text-center text-[13px] text-zinc-400">Cart empty</div>}</div>
          {cartCount>0 && <div className="p-4 border-t space-y-3"><input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Your name *" className="w-full h-10 px-3 border rounded-[10px] text-[13px]"/><input value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} placeholder="Address *" className="w-full h-10 px-3 border rounded-[10px] text-[13px]"/><div className="flex justify-between font-bold text-[13px]"><span>Total</span><span>Rs. {cartTotal.toLocaleString()}</span></div><button onClick={orderWhatsApp} className="w-full h-11 bg-[#25D366] text-white rounded-full font-bold">Order on WhatsApp</button></div>}
        </div>
      </div>
    </div>
  )
}
