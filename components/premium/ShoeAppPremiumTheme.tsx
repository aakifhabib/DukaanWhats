'use client'
import { useState } from 'react'

export function ShoeAppPremiumTheme({ profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }: any) {
  const [activeColor, setActiveColor] = useState(0)
  const [activeSize, setActiveSize] = useState(31)
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
    <div className="min-h-screen bg-[#F2F0FF] text-black">
      <div className="max-w-[1280px] mx-auto p-4">
        <div className="flex justify-between bg-white rounded-[12px] p-3 border mb-4">
          <div className="font-bold">{profile?.business_name} • Shoe Store</div>
          <button onClick={openCart} className="h-8 px-3 bg-black text-white rounded-full text-[12px]">Cart ({cartCount})</button>
        </div>
        <div className="grid lg:grid-cols-[360px_1fr_360px] gap-4">
          <div className="bg-white rounded-[20px] border p-4">
            {selectedProduct ? (
              <>
                <div className="bg-[#F8F7FF] rounded-[16px] p-6 aspect-square grid place-items-center"><img src={selectedProduct.image_url} className="w-[80%] object-contain -rotate-12" alt=""/></div>
                <h2 className="mt-3 font-black text-[18px]">{selectedProduct.name}</h2>
                <div className="mt-2 flex gap-2">{[28,29,30,31,32].map(s=><button key={s} onClick={()=>setActiveSize(s)} className={`w-9 h-7 rounded-[8px] border text-[12px] ${s===activeSize?'bg-black text-white':'bg-white'}`}>{s}</button>)}</div>
                <div className="mt-3 flex items-center gap-2"><button onClick={()=>setQty(Math.max(1,qty-1))} className="w-7 h-7 border rounded-full">-</button><span className="font-bold">{qty}</span><button onClick={()=>setQty(qty+1)} className="w-7 h-7 border rounded-full">+</button></div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={()=>{ onAdd(selectedProduct, qty); setSelectedProduct(null)}} className="h-10 border rounded-[10px] font-bold text-[13px]">Add to Cart</button>
                  <button onClick={()=>{ onAdd(selectedProduct, qty); openCart()}} className="h-10 bg-[#7C3AED] text-white rounded-[10px] font-bold text-[13px]">Buy Now</button>
                </div>
              </>
            ) : <div className="py-20 text-center text-[13px] text-zinc-400">Select a shoe</div>}
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-[16px] p-4 border">
              <div className="h-20 bg-[#1a1aff] rounded-[12px] text-white p-3 flex justify-between"><div className="font-black">BLACK FRIDAY 50% OFF</div><img src={products[0]?.image_url || ''} className="w-16 h-16 object-contain -rotate-12" alt=""/></div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {products.slice(0,6).map((p:any)=><div key={p.id} onClick={()=>setSelectedProduct(p)} className="bg-[#F8F7FF] border rounded-[12px] p-2 cursor-pointer"><img src={p.image_url} className="w-full aspect-square object-contain" alt=""/><div className="text-[11px] font-bold truncate mt-1">{p.name}</div><div className="text-[11px]">Rs. {p.price}</div></div>)}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[16px] p-4 border">
            <div className="font-bold text-[13px]">For You</div>
            <div className="mt-3 grid grid-cols-2 gap-2">{products.slice(0,6).map((p:any)=><div key={p.id} onClick={()=>setSelectedProduct(p)} className="bg-[#F8F7FF] border rounded-[12px] p-2 cursor-pointer"><img src={p.image_url} className="w-full aspect-square object-contain" alt=""/><div className="text-[11px] font-bold truncate">{p.name}</div><div className="text-[10px]">Rs. {p.price}</div></div>)}</div>
          </div>
        </div>
      </div>
      <div className={`fixed inset-0 z-50 ${localShowCart ? '' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/40 ${localShowCart ? 'opacity-100' : 'opacity-0'}`} onClick={closeCart}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-[360px] bg-white flex flex-col transition-transform ${localShowCart ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-4 border-b flex justify-between"><h3 className="font-bold">Cart ({cartCount})</h3><button onClick={closeCart}>✕</button></div>
          <div className="flex-1 overflow-auto p-3 space-y-2">{cart.map((p:any,i:number)=><div key={i} className="flex gap-2 p-2 bg-zinc-50 rounded-[10px]"><img src={p.image_url} className="w-10 h-10 rounded object-cover"/><div className="text-[12px]">{p.name}</div></div>)}</div>
          {cartCount>0 && <div className="p-3 border-t space-y-2"><input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Name" className="w-full h-9 px-3 border rounded-[8px] text-[13px]"/><input value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} placeholder="Address" className="w-full h-9 px-3 border rounded-[8px] text-[13px]"/><button onClick={orderWhatsApp} className="w-full h-10 bg-[#25D366] text-white rounded-full font-bold">Order WhatsApp</button></div>}
        </div>
      </div>
    </div>
  )
}
