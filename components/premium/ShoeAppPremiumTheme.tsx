'use client'
import { useState } from 'react'

export function ShoeAppPremiumTheme({ profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }: any) {
  const [activeColor, setActiveColor] = useState(0)
  const [activeSize, setActiveSize] = useState(31)
  const [search, setSearch] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [showCartLocal, setShowCartLocal] = useState(false)
  const [qty, setQty] = useState(1)
  const colors = ['#1E40AF','#DC2626','#EC4899','#06B6D4','#A16207']
  const filtered = products.filter((p:any)=>p.name.toLowerCase().includes(search.toLowerCase()))
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
    <div className="min-h-screen bg-[#F2F0FF] text-black antialiased">
      <style>{`@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}.no-scrollbar::-webkit-scrollbar{display:none}`}</style>

      <div className="max-w-[1280px] mx-auto px-4 py-6">
        <header className="flex justify-between items-center bg-white rounded-[16px] p-3 border mb-4">
          <div className="font-black">{profile?.business_name} • Shoe Store</div>
          <button onClick={openCart} className="h-9 px-4 bg-black text-white rounded-full text-[12px] font-bold">Cart ({cartCount})</button>
        </header>

        <div className="grid lg:grid-cols-[380px_1fr_380px] gap-6 items-start">
          {/* LEFT - DETAILS */}
          <div className="bg-white rounded-[24px] border shadow-sm overflow-hidden sticky top-6">
            <div className="p-4 flex justify-between items-center border-b"><span className="font-bold">Shoe Details</span><span className="text-[11px] border rounded-full px-2 py-1">{selectedProduct ? '1 selected' : 'Select a shoe'}</span></div>
            {selectedProduct ? (
              <>
                <div className="p-5">
                  <div className="relative bg-[#F8F7FF] rounded-[18px] p-6 aspect-square grid place-items-center">
                    <img src={selectedProduct.image_urls?.[activeColor] || selectedProduct.image_url} className="w-[85%] object-contain -rotate-12 hover:rotate-[-6deg] hover:scale-105 transition duration-700" alt=""/>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-white/90 backdrop-blur rounded-full p-2 border">
                      {colors.map((c,i)=><button key={i} onClick={()=>setActiveColor(i)} className={`w-6 h-6 rounded-full border-2 ${i===activeColor?'border-black':'border-white'}`} style={{background:c}}/>)}
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <div className="flex justify-between"><span className="text-[12px] text-zinc-500">(4.9) ★★★★★</span><span className="font-black">${selectedProduct.price}</span></div>
                  <h2 className="mt-2 text-[20px] font-black leading-[1.1]">{selectedProduct.name}</h2>
                  <div className="mt-4"><div className="text-[11px] font-bold tracking-widest">SIZE</div><div className="mt-2 flex gap-2">{[28,29,30,31,32].map(s=><button key={s} onClick={()=>setActiveSize(s)} className={`w-10 h-8 rounded-[10px] border text-[12px] font-bold ${s===activeSize?'bg-black text-white':'bg-white'}`}>{s}</button>)}</div></div>
                  <div className="mt-4"><div className="text-[11px] font-bold">QTY</div><div className="mt-2 flex items-center gap-2"><button onClick={()=>setQty(Math.max(1,qty-1))} className="w-8 h-8 border rounded-full">-</button><span className="w-6 text-center font-bold">{qty}</span><button onClick={()=>setQty(qty+1)} className="w-8 h-8 border rounded-full">+</button></div></div>
                  <p className="mt-4 text-[12px] text-zinc-500 leading-[1.5] line-clamp-3">{selectedProduct.description || 'Premium comfort with open languur team for added style.'}</p>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button onClick={()=>{ onAdd(selectedProduct, qty); setSelectedProduct(null)}} className="h-11 border rounded-[12px] font-bold text-[13px]">Add to Cart</button>
                    <button onClick={()=>{ onAdd(selectedProduct, qty); openCart()}} className="h-11 bg-[#7C3AED] text-white rounded-[12px] font-bold text-[13px]">Buy Now</button>
                  </div>
                </div>
              </>
            ) : <div className="p-10 text-center text-zinc-400 text-[13px]">Click any shoe from middle/right<br/>to see premium details</div>}
          </div>

          {/* MIDDLE */}
          <div className="space-y-4">
            <div className="bg-white rounded-[20px] p-4 border">
              <div className="relative"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Any Shoe Here" className="w-full h-11 pl-10 pr-4 bg-[#F8F7FF] rounded-full text-[13px] border focus:border-[#7C3AED]/30 outline-none"/><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">⌕</span></div>
              <div className="mt-4 relative overflow-hidden rounded-[16px] bg-[#1a1aff] text-white p-4 flex justify-between items-center">
                <div><div className="text-[10px] uppercase tracking-widest opacity-80">Super Sale</div><div className="text-[20px] font-black leading-[0.9]">BLACK<br/>FRIDAY</div><button onClick={()=>{ const el=document.getElementById('popular'); el?.scrollIntoView({behavior:'smooth'}) }} className="mt-2 h-7 px-3 bg-white text-black rounded-full text-[11px] font-bold">Buy Now</button></div>
                <img src={products[0]?.image_url || 'https://images.unsplash.com/photo-1608666634759-4376010f863d?w=200'} className="w-[90px] h-[70px] object-contain -rotate-12" alt=""/>
                <div className="absolute -right-1 -bottom-1 bg-yellow-300 text-black text-[10px] font-black px-2 py-1 rounded-full">50% OFF</div>
              </div>
            </div>
            <div id="popular" className="bg-white rounded-[20px] p-4 border">
              <div className="flex justify-between"><h3 className="font-bold text-[14px]">Popular products</h3><span className="text-[11px] text-zinc-500">{filtered.length} items</span></div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {filtered.slice(0,6).map((p:any)=><div key={p.id} onClick={()=>setSelectedProduct(p)} className="bg-[#F8F7FF] border rounded-[14px] p-2.5 hover:border-black hover:shadow-md cursor-pointer transition"><div className="bg-white rounded-[10px] p-2 aspect-square"><img src={p.image_url} className="w-full h-full object-contain" alt=""/></div><div className="mt-2 text-[11px] font-bold truncate">{p.name}</div><div className="flex justify-between items-center mt-1"><span className="text-[11px] font-black">Rs. {p.price.toLocaleString()}</span><span className="w-5 h-5 bg-[#7C3AED] text-white rounded-full grid place-items-center text-[10px]">+</span></div></div>)}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-white rounded-[20px] border p-4 sticky top-6">
            <div className="font-bold">For You</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {filtered.slice(0,8).map((p:any)=><div key={p.id} onClick={()=>setSelectedProduct(p)} className="bg-[#F8F7FF] rounded-[14px] p-2 border hover:border-black cursor-pointer transition"><div className="bg-white rounded-[10px] p-2 aspect-square"><img src={p.image_url} className="w-full h-full object-contain" alt=""/></div><div className="mt-2 text-[10px] font-bold truncate">{p.name}</div><div className="text-[9px] text-yellow-500">★★★★★</div><div className="flex justify-between items-center"><span className="text-[11px] font-black">Rs. {p.price.toLocaleString()}</span><span className="w-5 h-5 bg-[#7C3AED] text-white rounded-full grid place-items-center text-[10px]">+</span></div></div>)}
            </div>
          </div>
        </div>
      </div>

      {/* CART DRAWER */}
      <div className={`fixed inset-0 z-[100] ${showCartLocal ? '' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/40 transition ${showCartLocal ? 'opacity-100' : 'opacity-0'}`} onClick={closeCart}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-full max-w-[380px] bg-white shadow-xl flex flex-col transition-transform duration-300 ${showCartLocal ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-5 border-b flex justify-between items-center"><h3 className="font-black">Cart ({cartCount})</h3><button onClick={closeCart} className="w-8 h-8 border rounded-full">✕</button></div>
          <div className="flex-1 overflow-auto p-4 space-y-2">{cart.map((p:any,i:number)=><div key={i} className="flex gap-3 p-3 bg-[#F8F7FF] rounded-[12px] border"><img src={p.image_url} className="w-12 h-12 rounded-[8px] object-cover"/><div className="flex-1"><div className="text-[12px] font-bold">{p.name}</div><div className="text-[11px]">Rs. {p.price}</div></div></div>)}{cartCount===0 && <div className="py-20 text-center text-zinc-400 text-[13px]">Cart empty</div>}</div>
          {cartCount>0 && <div className="p-4 border-t space-y-3"><input placeholder="Your name" value={customerName} onChange={e=>setCustomerName(e.target.value)} className="w-full h-10 px-3 border rounded-[10px] text-[13px]"/><input placeholder="Full address" value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} className="w-full h-10 px-3 border rounded-[10px] text-[13px]"/><div className="flex justify-between font-bold text-[13px]"><span>Total</span><span>Rs. {cartTotal.toLocaleString()}</span></div><button onClick={orderWhatsApp} className="w-full h-11 bg-[#25D366] text-white rounded-full font-bold text-[13px]">Order on WhatsApp</button></div>}
        </div>
      </div>
    </div>
  )
}
