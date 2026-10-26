'use client'
import { useState } from 'react'
export default function EcomGreenTheme({ profile, products, cart, setCart, setShowCart, showCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }) {
  const [q,setQ]=useState('')
  const total=cart.reduce((s,p)=>s+p.price,0)
  const remove = (i)=> setCart(cart.filter((_,idx)=>idx!==i))
  const filtered=products.filter((p)=>p.name.toLowerCase().includes(q.toLowerCase()))
  const orderWA=()=>{ const lines=cart.map((p)=>`• ${p.name} - Rs. ${p.price}`).join('%0A'); window.open(`https://wa.me/${profile.whatsapp_number}?text=Hi ${profile.business_name}!%0A${lines}%0ATotal Rs. ${total}`, '_blank')}
  return (
    <div className="min-h-screen bg-[#E8F5E9] p-3">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-4"><h1 className="text-[24px] font-black">Ecommerce Full Design <span className="bg-[#3B82F6] text-white text-[12px] px-3 py-1 rounded-full">FREE</span></h1><button onClick={()=>setShowCart(true)} className="bg-black text-white px-4 h-9 rounded-full text-[12px]">Cart ({cart.length})</button></div>
        <div className="grid md:grid-cols-12 gap-4">
          <div className="md:col-span-5 bg-white rounded-[16px] shadow-xl border overflow-hidden"><div className="h-10 bg-[#00C853] flex items-center px-4 text-white text-[11px]">Home • Products</div><div className="p-4"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." className="w-full h-10 px-4 border rounded-full text-[13px]"/><div className="mt-4 grid grid-cols-2 gap-3">{filtered.slice(0,6).map((p)=><div key={p.id} onClick={()=>onOpen(p)} className="border rounded-[12px] p-2 cursor-pointer"><img src={p.image_url} className="w-full h-[100px] object-cover rounded-[8px]" alt=""/><div className="text-[11px] font-bold truncate">{p.name}</div><div className="text-[#00C853] font-black text-[11px]">Rs. {p.price}</div><button onClick={(e)=>{e.stopPropagation(); onAdd(p)}} className="mt-2 w-full h-7 bg-[#00C853] text-white rounded-full text-[10px]">Add</button></div>)}</div></div></div>
          <div className="md:col-span-7 bg-white rounded-[16px] shadow-2xl border overflow-hidden"><div className="h-10 bg-[#00C853] flex items-center px-4 text-white text-[11px]">Top Categories</div><div className="p-4 grid grid-cols-2 gap-3"><div className="col-span-2 grid grid-cols-4 gap-2">{products.slice(0,8).map((p)=><div key={p.id} onClick={()=>onOpen(p)} className="border rounded-[8px] p-1 cursor-pointer"><img src={p.image_url} className="w-full h-[60px] object-cover rounded" alt=""/></div>)}</div></div></div>
        </div>
      </div>
      {selectedProduct && <div className="fixed inset-0 bg-black/60 z-50 grid place-items-center p-4"><div className="bg-white rounded-[20px] w-full max-w-[600px] p-6"><div className="flex justify-between"><h2 className="font-black">{selectedProduct.name}</h2><button onClick={()=>setSelectedProduct(null)} className="w-8 h-8 border rounded-full">✕</button></div><img src={selectedProduct.image_url} className="w-full h-[260px] object-contain mt-4" alt=""/><button onClick={()=>onAdd(selectedProduct)} className="mt-4 w-full h-12 bg-[#00C853] text-white rounded-full font-bold">Add to Cart</button></div></div>}
      {showCart && <div className="fixed inset-0 bg-black/40 z-50 flex justify-end"><div className="w-full max-w-sm bg-white h-full flex flex-col"><div className="p-6 border-b flex justify-between"><h3 className="font-bold">Cart ({cart.length}) • Rs. {total}</h3><button onClick={()=>setShowCart(false)} className="w-8 h-8 border rounded-full">✕</button></div><div className="flex-1 overflow-auto p-4 space-y-2">{cart.map((p,i)=><div key={i} className="flex gap-3 p-3 bg-zinc-50 rounded-[12px]"><img src={p.image_url} className="w-14 h-14 rounded-[8px] object-cover"/><div className="flex-1"><div className="text-[13px] font-bold truncate">{p.name}</div><div className="text-[12px]">Rs. {p.price}</div></div><button onClick={()=>remove(i)} className="text-[11px] text-red-500">Remove</button></div>)}</div><div className="p-6 border-t"><button onClick={orderWA} className="w-full h-12 bg-[#00C853] text-white rounded-full font-bold">Order on WhatsApp</button></div></div></div>}
    </div>
  )
}
