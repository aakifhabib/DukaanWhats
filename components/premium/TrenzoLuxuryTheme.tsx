'use client'
import { useState } from 'react'

export function TrenzoLuxuryTheme({ profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }: any) {
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [localShowCart, setLocalShowCart] = useState(false)
  const [qty, setQty] = useState(1)

  const cartCount = cart?.length || 0
  const cartTotal = cart?.reduce((s:any,p:any)=>s+p.price,0) || 0
  const openCart = () => { setLocalShowCart(true); if(setShowCart) setShowCart(true) }
  const closeCart = () => { setLocalShowCart(false); if(setShowCart) setShowCart(false) }

  const orderWhatsApp = () => {
    if(!profile || cart.length===0) return
    if(!customerName.trim()){ alert('Enter name'); return }
    if(!customerAddress.trim()){ alert('Enter address'); return }
    cart.forEach((p:any)=>track?.('whatsapp_click',p.id))
    const lines = cart.map((p:any)=>`• ${p.name} - Rs. ${p.price}`).join('%0A')
    const msg = `Hi ${profile.business_name}!%0AOrder:%0A${lines}%0ATotal: Rs. ${cartTotal}%0AName: ${customerName}%0AAddress: ${customerAddress}`
    window.open(`https://wa.me/${profile.whatsapp_number}?text=${msg}`,'_blank')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-5">
        <div className="font-black tracking-widest">✦ TRENZO • {profile?.business_name}</div>
        <button onClick={openCart} className="h-8 px-4 bg-white text-black rounded-full text-[12px] font-bold">Cart ({cartCount})</button>
      </header>
      <div className="max-w-[1280px] mx-auto px-5 py-10 grid md:grid-cols-2 gap-10">
        <div><h1 className="text-[56px] leading-[0.9]">A reflection of personal styling</h1><p className="mt-4 text-white/50 text-[13px]">Premium curated collection.</p><button onClick={()=>document.getElementById('grid')?.scrollIntoView({behavior:'smooth'})} className="mt-6 h-10 px-5 border border-white/20 rounded-full text-[12px]">Explore</button></div>
        <div className="w-[320px] h-[460px] rounded-[180px] overflow-hidden border border-white/10 mx-auto"><img src={products[0]?.image_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600'} className="w-full h-full object-cover" alt=""/></div>
      </div>
      <div id="grid" className="max-w-[1280px] mx-auto px-5 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p:any)=><div key={p.id} onClick={()=>{ setQty(1); onOpen(p)}} className="bg-[#141414] border border-white/10 rounded-[16px] p-2 cursor-pointer group"><img src={p.image_url} className="w-full aspect-[4/5] object-cover rounded-[12px] group-hover:scale-105 transition" alt=""/><div className="mt-2 text-[13px]">{p.name}</div><div className="text-[12px] text-white/50">Rs. {p.price}</div></div>)}
      </div>
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-[20px] w-full max-w-[800px] grid md:grid-cols-2 overflow-hidden">
            <img src={selectedProduct.image_url} className="w-full aspect-square object-cover" alt=""/>
            <div className="p-6">
              <div className="flex justify-between"><h2 className="text-[20px] font-bold">{selectedProduct.name}</h2><button onClick={()=>setSelectedProduct(null)} className="w-8 h-8 border border-white/20 rounded-full">✕</button></div>
              <div className="mt-3 text-[18px] font-bold">Rs. {selectedProduct.price}</div>
              <div className="mt-4 flex gap-2"><button onClick={()=>setQty(Math.max(1,qty-1))} className="w-8 h-8 border border-white/20 rounded-full">-</button><span>{qty}</span><button onClick={()=>setQty(qty+1)} className="w-8 h-8 border border-white/20 rounded-full">+</button></div>
              <div className="mt-6 grid grid-cols-2 gap-2">
                <button onClick={()=>{ onAdd(selectedProduct, qty); setSelectedProduct(null)}} className="h-10 bg-white text-black rounded-full font-bold text-[13px]">Add to Cart</button>
                <button onClick={()=>{ onAdd(selectedProduct, qty); openCart()}} className="h-10 bg-[#25D366] text-white rounded-full font-bold text-[13px]">WhatsApp</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={`fixed inset-0 z-50 ${localShowCart ? '' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/60 ${localShowCart ? 'opacity-100' : 'opacity-0'}`} onClick={closeCart}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-[360px] bg-[#141414] border-l border-white/10 flex flex-col transition-transform ${localShowCart ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-4 border-b border-white/10 flex justify-between"><h3 className="font-bold">Cart ({cartCount})</h3><button onClick={closeCart}>✕</button></div>
          <div className="flex-1 overflow-auto p-3 space-y-2">{cart.map((p:any,i:number)=><div key={i} className="flex gap-2 p-2 bg-white/5 rounded-[10px]"><img src={p.image_url} className="w-10 h-10 rounded object-cover"/><div className="text-[12px]">{p.name}</div></div>)}</div>
          {cartCount>0 && <div className="p-3 border-t border-white/10 space-y-2"><input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Name" className="w-full h-9 px-3 bg-white/10 border border-white/10 rounded-[8px] text-[13px]"/><input value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} placeholder="Address" className="w-full h-9 px-3 bg-white/10 border border-white/10 rounded-[8px] text-[13px]"/><button onClick={orderWhatsApp} className="w-full h-10 bg-[#25D366] text-white rounded-full font-bold">Order WhatsApp</button></div>}
        </div>
      </div>
    </div>
  )
}
