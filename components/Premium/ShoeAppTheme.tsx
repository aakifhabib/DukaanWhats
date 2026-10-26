'use client'
import { useState } from 'react'
export default function ShoeAppTheme({ profile, products, cart, setCart, setShowCart, showCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }) {
  const [size,setSize]=useState('30')
  const total=cart.reduce((s,p)=>s+p.price,0)
  const remove=(i)=>setCart(cart.filter((_,idx)=>idx!==i))
  const wa=()=>{ const l=cart.map((p)=>`• ${p.name}`).join('%0A'); window.open(`https://wa.me/${profile.whatsapp_number}?text=Hi!%0A${l}%0ATotal Rs. ${total}`, '_blank')}
  return (
    <div className="min-h-screen bg-[#F8F8F8] p-2 md:p-4">
      <div className="max-w-[1100px] mx-auto bg-white rounded-[24px] shadow-xl overflow-hidden">
        <header className="flex justify-between items-center px-6 h-[64px] border-b"><span className="font-black text-[16px]">👟 Shoe App</span><button onClick={()=>setShowCart(true)} className="bg-black text-white px-4 h-8 rounded-full text-[11px]">Cart ({cart.length})</button></header>
        <div className="p-4 grid md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-[#F5F5F5] rounded-[20px] p-6 flex flex-col items-center"><img src={products[0]?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'} className="w-full max-w-[360px] h-[240px] object-contain" alt=""/><div className="mt-4 flex gap-2">{['28','29','30','31','32'].map((s)=><button key={s} onClick={()=>setSize(s)} className={`w-9 h-9 rounded-full text-[11px] border ${size===s?'bg-black text-white':'bg-white'}`}>{s}</button>)}</div><div className="mt-4 w-full bg-[#1A1AFF] text-white rounded-[16px] p-4 flex justify-between items-center"><div><div className="font-black text-[14px]">BLACK FRIDAY</div><div className="text-[10px] opacity-80">60% OFF • Limited</div></div><button className="bg-white text-black px-3 py-1 rounded-full text-[10px] font-bold">Shop</button></div></div>
          <div className="md:col-span-5"><h2 className="font-black text-[18px]">For You</h2><div className="mt-3 grid grid-cols-2 gap-3">{products.slice(0,6).map((p)=><div key={p.id} onClick={()=>onOpen(p)} className="border rounded-[16px] p-2 cursor-pointer"><img src={p.image_url} className="w-full h-[90px] object-cover rounded-[12px]" alt=""/><div className="mt-1 text-[11px] font-bold truncate">{p.name}</div><div className="text-[11px]">Rs. {p.price}</div><button onClick={(e)=>{e.stopPropagation(); onAdd(p)}} className="mt-2 w-full h-7 bg-black text-white rounded-full text-[10px]">Add</button></div>)}</div></div>
        </div>
      </div>
      {selectedProduct && <div className="fixed inset-0 bg-black/60 z-50 grid place-items-center p-4"><div className="bg-white rounded-[20px] w-full max-w-[600px] p-6"><div className="flex justify-between"><h2 className="font-black">{selectedProduct.name}</h2><button onClick={()=>setSelectedProduct(null)} className="w-8 h-8 border rounded-full">✕</button></div><img src={selectedProduct.image_url} className="w-full h-[240px] object-contain mt-4" alt=""/><button onClick={()=>onAdd(selectedProduct)} className="mt-4 w-full h-12 bg-black text-white rounded-full">Add Size {size}</button></div></div>}
      {showCart && <div className="fixed inset-0 bg-black/40 z-50 flex justify-end"><div className="w-full max-w-sm bg-white h-full flex flex-col"><div className="p-6 border-b flex justify-between"><h3 className="font-bold">Cart ({cart.length}) • Rs. {total}</h3><button onClick={()=>setShowCart(false)} className="w-8 h-8 border rounded-full">✕</button></div><div className="flex-1 overflow-auto p-4 space-y-2">{cart.map((p,i)=><div key={i} className="flex gap-3 p-3 bg-zinc-50 rounded-[12px]"><img src={p.image_url} className="w-14 h-14 rounded-[8px] object-cover"/><div className="flex-1"><div className="text-[13px] font-bold truncate">{p.name}</div><div className="text-[12px]">Rs. {p.price}</div></div><button onClick={()=>remove(i)} className="text-[11px] text-red-500">Remove</button></div>)}</div><div className="p-6 border-t"><button onClick={wa} className="w-full h-12 bg-black text-white rounded-full">Order on WhatsApp</button></div></div></div>}
    </div>
  )
}
