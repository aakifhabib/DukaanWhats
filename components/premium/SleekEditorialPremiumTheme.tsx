'use client'
import { useState } from 'react'

export function SleekEditorialPremiumTheme({ profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }: any) {
  const [localShowCart, setLocalShowCart] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
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
    const msg = `Hi ${profile.business_name}!%0AOrder EDITORIAL PREMIUM%0A${lines}%0ATotal: Rs. ${cartTotal}%0AName: ${customerName}%0AAddress: ${customerAddress}`
    window.open(`https://wa.me/${profile.whatsapp_number}?text=${msg}`,'_blank')
  }
  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#0A0A0A] antialiased">
      <div className="bg-[#0A0A0A] text-white text-[10px] mono tracking-widest h-7 flex items-center justify-center">EDITORIAL • MINIMAL • LUXURY • FREE SHIPPING • COD</div>
      <header className="h-14 border-b border-black/10 flex items-center justify-between px-5 sticky top-0 z-20 backdrop-blur bg-[#FCFBF9]/80"><div className="font-black tracking-[0.2em] text-[12px]">EDITORIAL • {profile?.business_name}</div><div className="flex items-center gap-2"><span className="hidden md:flex h-6 px-2.5 bg-black text-white rounded-full text-[9px] tracking-widest items-center">PREMIUM • EDITORIAL</span><button onClick={openCart} className="h-8 px-4 bg-black text-white rounded-full text-[11px] font-bold">Cart ({cartCount})</button></div></header>
      <section className="max-w-6xl mx-auto px-5 py-8 md:py-12 grid md:grid-cols-2 gap-8 items-center"><div><div className="inline-flex h-6 px-3 bg-black text-white rounded-full text-[10px] font-bold tracking-widest">EDITORIAL • MINIMAL • 2024</div><h1 className="mt-4 text-[40px] md:text-[56px] leading-[0.88] tracking-[-0.05em] font-[900]">Less, but<br/>better. Always<br/>editorial.</h1><p className="mt-4 text-[12px] text-black/50 max-w-[340px]">Clean lines, intentional whitespace, premium finish. Less is luxury.</p><button onClick={()=>document.getElementById('grid-edit')?.scrollIntoView({behavior:'smooth'})} className="mt-6 h-10 px-5 bg-black text-white rounded-full text-[12px] font-bold">Shop Editorial →</button></div><div className="w-[300px] md:w-[420px] aspect-[3/4] bg-white border rounded-[12px] overflow-hidden mx-auto shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] p-3"><img src={products[0]?.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600'} className="w-full h-full object-cover rounded-[8px]" alt=""/></div></section>
      <main id="grid-edit" className="max-w-6xl mx-auto px-5 py-8 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">{products.map((p:any,i:number)=><div key={p.id} onClick={()=>{ setQty(1); onOpen(p)}} className="group cursor-pointer"><div className="bg-white border rounded-[16px] p-2.5 overflow-hidden"><img src={p.image_url} className="w-full aspect-[4/5] object-cover rounded-[10px] group-hover:scale-[1.02] transition duration-500" alt=""/><div className="mt-3"><div className="font-bold text-[13px] tracking-[-0.01em]">{p.name}</div><div className="mt-1 text-[11px] mono text-black/40">Rs. {p.price.toLocaleString()} • EDITORIAL • FREE SHIP</div></div></div></div>)}</main>
      {selectedProduct && <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4"><div className="bg-white rounded-[20px] w-full max-w-[700px] grid md:grid-cols-2 overflow-hidden max-h-[90vh]"><img src={selectedProduct.image_url} className="w-full aspect-square object-cover" alt=""/><div className="p-5 flex flex-col"><div className="flex justify-between"><h2 className="font-bold text-[18px]">{selectedProduct.name}</h2><button onClick={()=>setSelectedProduct(null)} className="w-7 h-7 border rounded-full grid place-items-center">✕</button></div><div className="mt-3 font-black text-[16px]">Rs. {selectedProduct.price}</div><div className="mt-3 flex gap-2"><button onClick={()=>setQty(Math.max(1,qty-1))} className="w-7 h-7 border rounded-full">-</button><span className="w-6 text-center">{qty}</span><button onClick={()=>setQty(qty+1)} className="w-7 h-7 border rounded-full">+</button></div><button onClick={()=>{ onAdd(selectedProduct, qty); setSelectedProduct(null)}} className="mt-auto h-10 bg-black text-white rounded-full font-bold text-[12px]">Add to Cart • Editorial</button></div></div></div>}
      {localShowCart && <div className="fixed inset-0 bg-black/40 z-50 flex justify-end"><div className="w-full max-w-[360px] bg-white h-full flex flex-col"><div className="p-4 border-b flex justify-between"><h3 className="font-bold text-[13px]">Cart ({cartCount}) • EDITORIAL</h3><button onClick={closeCart}>✕</button></div><div className="flex-1 overflow-auto p-3 space-y-2">{cart.map((p:any,i:number)=><div key={i} className="flex gap-2 p-2 bg-zinc-50 rounded-[10px]"><img src={p.image_url} className="w-10 h-10 rounded object-cover"/><div className="text-[11px]">{p.name}</div></div>)}</div><div className="p-4 border-t space-y-2"><input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Name" className="w-full h-9 px-3 border rounded-[8px] text-[12px]"/><input value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} placeholder="Address" className="w-full h-9 px-3 border rounded-[8px] text-[12px]"/><button onClick={orderWhatsApp} className="w-full h-10 bg-[#25D366] text-white rounded-full font-bold text-[12px]">Order WhatsApp</button></div></div></div>}
    </div>
  )
}
