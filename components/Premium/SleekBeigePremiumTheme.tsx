'use client'
import { useState } from 'react'

export function SleekBeigePremiumTheme({ profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }: any) {
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
    const lines = cart.map((p:any)=>`â€¢ ${p.name} - Rs. ${p.price}`).join('%0A')
    const msg = `Hi ${profile.business_name}!%0AOrder SLEEK BEIGE PREMIUM%0A${lines}%0ATotal: Rs. ${cartTotal}%0AName: ${customerName}%0AAddress: ${customerAddress}%0AStore: ${typeof window!=='undefined'? window.location.href:''}`
    window.open(`https://wa.me/${profile.whatsapp_number}?text=${msg}`,'_blank')
  }
  return (
    <div className="min-h-screen bg-[#F5F1EB] text-[#0A0A0A] antialiased">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&display=swap'); *{font-family:'Geist',sans-serif}`}</style>
      <div className="bg-black text-[#E8FF86] text-[10px] mono tracking-widest h-7 flex items-center justify-center">FREE SHIPPING â€¢ NEW DROP â€¢ COD â€¢ PREMIUM BEIGE COLLECTION</div>
      <header className="h-14 border-b border-black/10 flex items-center justify-between px-5 sticky top-0 z-20 backdrop-blur bg-[#F5F1EB]/80"><div className="font-black tracking-widest text-[12px]">BEIGE â€¢ {profile?.business_name}</div><div className="flex items-center gap-2"><span className="hidden md:flex h-6 px-2.5 bg-white border rounded-full text-[9px] font-bold items-center">PREMIUM â€¢ LUXE â€¢ BEIGE</span><button onClick={openCart} className="h-8 px-4 bg-black text-white rounded-full text-[11px] font-bold">Cart ({cartCount})</button></div></header>
      <section className="max-w-6xl mx-auto px-5 py-8 md:py-12 grid md:grid-cols-2 gap-8 items-center"><div><div className="inline-flex h-6 px-3 bg-white border rounded-full text-[10px] font-bold tracking-widest">EDITORIAL â€¢ BEIGE â€¢ 2024</div><h1 className="mt-4 text-[36px] md:text-[52px] leading-[0.9] tracking-[-0.03em] font-[800]">Warm minimal<br/>luxury, everyday<br/>icon.</h1><p className="mt-4 text-[12px] text-black/50 max-w-[340px]">Soft beige tones, natural texture, premium stitch. Curated for icons.</p><button onClick={()=>document.getElementById('grid')?.scrollIntoView({behavior:'smooth'})} className="mt-6 h-10 px-5 bg-black text-white rounded-full text-[12px] font-bold">Shop Beige â†’</button></div><div className="w-[300px] md:w-[380px] aspect-[4/5] bg-white border rounded-[24px] overflow-hidden mx-auto shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)]"><img src={products[0]?.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600'} className="w-full h-full object-cover" alt=""/></div></section>
      <main id="grid" className="max-w-6xl mx-auto px-5 py-8 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">{products.map((p:any,i:number)=><div key={p.id} onClick={()=>{ setQty(1); onOpen(p)}} className="bg-white border border-black/5 rounded-[18px] p-2.5 md:p-3 cursor-pointer hover:border-black/20 hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] group"><div className="relative overflow-hidden rounded-[12px]"><img src={p.image_url} className="w-full aspect-square object-cover group-hover:scale-[1.03] transition duration-500" alt=""/>{i<2 && <div className="absolute top-2 left-2 h-5 px-2 bg-[#E8FF86] border border-black rounded-full text-[8px] font-black grid place-items-center">NEW</div>}</div><div className="mt-2.5 font-bold text-[12px]">{p.name}</div><div className="text-[12px] font-black">Rs. {p.price.toLocaleString()}</div><div className="mt-1 text-[9px] mono text-black/30">BEIGE â€¢ FREE SHIP â€¢ COD</div></div>)}</main>
      {selectedProduct && <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4"><div className="bg-white rounded-[20px] w-full max-w-[700px] grid md:grid-cols-2 overflow-hidden max-h-[90vh]"><img src={selectedProduct.image_url} className="w-full aspect-square object-cover" alt=""/><div className="p-5 flex flex-col"><div className="flex justify-between"><h2 className="font-bold text-[18px]">{selectedProduct.name}</h2><button onClick={()=>setSelectedProduct(null)} className="w-7 h-7 border rounded-full grid place-items-center">âœ•</button></div><div className="mt-3 font-black text-[16px]">Rs. {selectedProduct.price}</div><div className="mt-3 flex gap-2"><button onClick={()=>setQty(Math.max(1,qty-1))} className="w-7 h-7 border rounded-full">-</button><span className="w-6 text-center">{qty}</span><button onClick={()=>setQty(qty+1)} className="w-7 h-7 border rounded-full">+</button></div><button onClick={()=>{ onAdd(selectedProduct, qty); setSelectedProduct(null)}} className="mt-auto h-10 bg-black text-white rounded-full font-bold text-[12px]">Add to Cart â€¢ Premium Beige</button></div></div></div>}
      {localShowCart && <div className="fixed inset-0 bg-black/40 z-50 flex justify-end"><div className="w-full max-w-[360px] bg-white h-full flex flex-col"><div className="p-4 border-b flex justify-between"><h3 className="font-bold text-[13px]">Cart ({cartCount}) â€¢ BEIGE</h3><button onClick={closeCart}>âœ•</button></div><div className="flex-1 overflow-auto p-3 space-y-2">{cart.map((p:any,i:number)=><div key={i} className="flex gap-2 p-2 bg-[#F5F1EB] rounded-[10px]"><img src={p.image_url} className="w-10 h-10 rounded object-cover"/><div className="text-[11px]">{p.name}</div></div>)}</div><div className="p-4 border-t space-y-2"><input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Name" className="w-full h-9 px-3 border rounded-[8px] text-[12px]"/><input value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} placeholder="Address" className="w-full h-9 px-3 border rounded-[8px] text-[12px]"/><button onClick={orderWhatsApp} className="w-full h-10 bg-[#25D366] text-white rounded-full font-bold text-[12px]">Order WhatsApp</button></div></div></div>}
    </div>
  )
}
