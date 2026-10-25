'use client'
import { useState, useEffect } from 'react'

export function TrenzoLuxuryTheme({ profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }: any) {
  const [idx, setIdx] = useState(0)
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [showCartLocal, setShowCartLocal] = useState(false)
  const [qty, setQty] = useState(1)
  useEffect(()=>{ const iv=setInterval(()=>setIdx(p=>(p+1)%Math.max(1,products.length)),3500); return()=>clearInterval(iv)},[products.length])
  const cartCount = cart?.length || 0
  const cartTotal = cart?.reduce((s:any,p:any)=>s+p.price,0) || 0
  const openCart = () => { if(setShowCart) setShowCart(true); setShowCartLocal(true) }
  const closeCart = () => { if(setShowCart) setShowCart(false); setShowCartLocal(false) }
  const orderWhatsApp = () => {
    if(!profile || cart.length===0) return
    cart.forEach((p:any)=>track?.('whatsapp_click',p.id))
    const lines = cart.map((p:any)=>`• ${p.name} - Rs. ${p.price}`).join('%0A')
    const msg = `Hi ${profile.business_name}!%0A%0AOrder:%0A${lines}%0ATotal: Rs. ${cartTotal}%0AName: ${customerName}%0AAddress: ${customerAddress}`
    window.open(`https://wa.me/${profile.whatsapp_number}?text=${msg}`,'_blank')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white antialiased">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');@keyframes floatSlow{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>

      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1280px] mx-auto px-5 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-2 font-black tracking-[0.2em] text-[14px]">✦ TRENZO</div>
          <div className="flex items-center gap-3"><span className="text-[11px] text-white/50 hidden md:block">{profile?.business_name}</span><button onClick={openCart} className="h-9 px-4 bg-white text-black rounded-full text-[12px] font-bold">Cart ({cartCount})</button></div>
        </div>
      </header>

      <section className="max-w-[1280px] mx-auto px-5 py-10 md:py-16 grid md:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        <div>
          <h1 className="text-[44px] md:text-[72px] leading-[0.9] tracking-[-0.03em] font-[400]" style={{fontFamily:'Instrument Serif'}}>A reflection<br/>of personal<br/><span className="italic">styling</span></h1>
          <p className="mt-6 text-[13px] text-white/50 max-w-[320px] leading-[1.6]">Showcasing your personal flair through sleek design and thoughtful details.</p>
          <button onClick={()=>document.getElementById('luxury-grid')?.scrollIntoView({behavior:'smooth'})} className="mt-8 h-10 px-5 border border-white/20 rounded-full text-[12px] uppercase tracking-widest hover:bg-white hover:text-black transition">Explore Now →</button>
        </div>
        <div className="relative">
          <div className="relative mx-auto w-[320px] md:w-[360px] h-[480px] md:h-[520px] rounded-[180px] overflow-hidden border border-white/10 bg-[#1a1a1a] animate-[floatSlow_6s_ease_infinite]">
            <img src={products[idx]?.image_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600'} className="w-full h-full object-cover" alt=""/>
          </div>
          <div className="absolute top-8 -right-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-[12px] p-2.5 flex gap-2 max-w-[200px]"><img src="https://i.pravatar.cc/40?img=8" className="w-6 h-6 rounded-full"/><div className="text-[10px]">★★★★★<br/>Great quality, super comfy!</div></div>
        </div>
      </section>

      <div className="border-y border-white/10 bg-white text-black py-3 overflow-hidden">
        <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap gap-10">{['adidas','SHEIN','NIKE','CHANEL','GUCCI','adidas','Dior'].map((b,i)=><span key={i} className="font-black tracking-widest opacity-70">{b}</span>)}<span className="flex gap-10">{['adidas','SHEIN','NIKE','CHANEL','GUCCI','adidas','Dior'].map((b,i)=><span key={i+'2'} className="font-black tracking-widest opacity-70">{b}</span>)}</span></div>
      </div>

      <section id="luxury-grid" className="max-w-[1280px] mx-auto px-5 py-12">
        <div className="flex justify-between items-center"><h2 className="text-[14px] tracking-widest uppercase font-bold">{profile?.business_name} • {products.length} Pieces</h2><span className="text-[11px] text-white/40">/{profile?.store_slug}</span></div>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-5">
          {products.map((p:any)=><div key={p.id} onClick={()=>{ setQty(1); onOpen(p)}} className="group cursor-pointer"><div className="relative overflow-hidden rounded-[16px] bg-[#181818] border border-white/10 aspect-[4/5]"><img src={p.image_url} className="w-full h-full object-cover group-hover:scale-105 transition duration-1000" alt=""/><div className="absolute bottom-2 left-2 right-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition"><span className="bg-white text-black text-[10px] px-3 h-6 rounded-full font-bold grid place-items-center">Quick Add</span><span className="w-6 h-6 bg-white/20 backdrop-blur rounded-full grid place-items-center text-[10px]">↗</span></div></div><div className="mt-3"><div className="text-[13px] font-medium">{p.name}</div><div className="text-[12px] text-white/50">Rs. {p.price.toLocaleString()}</div></div></div>)}
        </div>
      </section>

      {selectedProduct && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-[16px] flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-[24px] w-full max-w-[900px] max-h-[90vh] overflow-auto grid md:grid-cols-2">
            <div className="p-4 bg-black"><img src={selectedProduct.image_url} className="w-full aspect-square object-cover rounded-[16px]" alt=""/></div>
            <div className="p-6 flex flex-col">
              <div className="flex justify-between"><span className="text-[10px] border border-white/20 px-3 h-6 rounded-full grid place-items-center tracking-widest">TRENZO • {selectedProduct.category}</span><button onClick={()=>setSelectedProduct(null)} className="w-8 h-8 border border-white/20 rounded-full hover:bg-white hover:text-black">✕</button></div>
              <h2 className="mt-4 text-[26px] leading-[0.95]" style={{fontFamily:'Instrument Serif'}}>{selectedProduct.name}</h2>
              <div className="mt-3 text-[20px] font-bold">Rs. {selectedProduct.price.toLocaleString()}</div>
              <p className="mt-3 text-[13px] text-white/50 leading-[1.5]">{selectedProduct.description || 'Premium fabric, timeless cut. Showcasing personal flair.'}</p>
              <div className="mt-5 flex items-center gap-3"><button onClick={()=>setQty(Math.max(1,qty-1))} className="w-9 h-9 border border-white/20 rounded-full">-</button><span className="font-bold">{qty}</span><button onClick={()=>setQty(qty+1)} className="w-9 h-9 border border-white/20 rounded-full">+</button></div>
              <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                <button onClick={()=>{ onAdd(selectedProduct, qty); setSelectedProduct(null)}} className="h-11 bg-white text-black rounded-full font-bold text-[13px]">Add to Cart</button>
                <button onClick={()=>{ onAdd(selectedProduct, qty); openCart()}} className="h-11 bg-[#25D366] text-white rounded-full font-bold text-[13px]">WhatsApp Order</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`fixed inset-0 z-[110] ${showCartLocal ? '' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/60 transition ${showCartLocal ? 'opacity-100' : 'opacity-0'}`} onClick={closeCart}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-full max-w-[380px] bg-[#141414] border-l border-white/10 flex flex-col transition-transform duration-300 ${showCartLocal ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-5 border-b border-white/10 flex justify-between items-center"><h3 className="font-bold">Cart ({cartCount})</h3><button onClick={closeCart} className="w-8 h-8 border border-white/20 rounded-full">✕</button></div>
          <div className="flex-1 overflow-auto p-4 space-y-3">{cart.map((p:any,i:number)=><div key={i} className="flex gap-3 p-3 bg-white/5 rounded-[12px] border border-white/10"><img src={p.image_url} className="w-12 h-12 rounded-[8px] object-cover"/><div className="flex-1"><div className="text-[12px] font-bold">{p.name}</div><div className="text-[11px] text-white/50">Rs. {p.price}</div></div></div>)}{cartCount===0 && <div className="py-20 text-center text-white/30 text-[13px]">Cart empty</div>}</div>
          {cartCount>0 && <div className="p-4 border-t border-white/10 space-y-3"><input placeholder="Your name" value={customerName} onChange={e=>setCustomerName(e.target.value)} className="w-full h-10 px-3 bg-white/10 border border-white/10 rounded-[10px] text-[13px]"/><input placeholder="Full address" value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} className="w-full h-10 px-3 bg-white/10 border border-white/10 rounded-[10px] text-[13px]"/><div className="flex justify-between font-bold text-[13px]"><span>Total</span><span>Rs. {cartTotal.toLocaleString()}</span></div><button onClick={orderWhatsApp} className="w-full h-11 bg-[#25D366] text-white rounded-full font-bold text-[13px]">Order on WhatsApp</button></div>}
        </div>
      </div>
    </div>
  )
}
