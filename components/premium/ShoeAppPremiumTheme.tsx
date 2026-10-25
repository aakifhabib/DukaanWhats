
'use client'
import { useState, useEffect } from 'react'

type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; original_price?: number; description?: string; sizes?: string[]; colors?: string[]; category?: string }

export function ShoeAppPremiumTheme({ profile, products, onAdd, onOpen, track, selectedProduct, setSelectedProduct, cart, setShowCart }: any) {
  const [activeColor, setActiveColor] = useState(0)
  const [activeSize, setActiveSize] = useState(31)
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('All')
  const brands = [{id:'Adidas',icon:'A'},{id:'Nike',icon:'N'},{id:'Puma',icon:'P'},{id:'Reebok',icon:'R'}]
  const colors = ['#1E40AF','#DC2626','#EC4899','#06B6D4','#A16207']
  const filtered = products.filter((p:any)=>p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#F2F0FF] text-black antialiased">
      <style>{`
        @keyframes slideUp { from{transform:translateY(20px); opacity:0} to{transform:translateY(0); opacity:1} }
        @keyframes pop { 0%{transform:scale(0.8)} 50%{transform:scale(1.1)} 100%{transform:scale(1)} }
      `}</style>

      <div className="max-w-[1280px] mx-auto px-4 py-6 grid lg:grid-cols-[380px_1fr_380px] gap-6">
        
        {/* LEFT - SHOE DETAILS (like ref image 1) */}
        <div className="bg-white rounded-[28px] border shadow-[0_20px_60px_-20px_rgba(124,58,237,0.2)] overflow-hidden sticky top-6 h-fit animate-[slideUp_0.6s_ease]">
          <div className="p-5 flex items-center justify-between">
            <button className="w-9 h-9 border rounded-full grid place-items-center">←</button>
            <div className="font-bold text-[15px]">Shoe Details</div>
            <div className="flex gap-2"><button className="w-9 h-9 border rounded-full grid place-items-center">🔔</button><button className="w-9 h-9 border rounded-full grid place-items-center">♡</button></div>
          </div>
          {selectedProduct ? (
            <>
              <div className="px-5">
                <div className="relative bg-[#F8F7FF] rounded-[20px] p-6 aspect-square grid place-items-center overflow-hidden group">
                  <img src={selectedProduct.image_urls?.[activeColor] || selectedProduct.image_url} className="w-[90%] object-contain rotate-[-12deg] group-hover:rotate-[-8deg] group-hover:scale-[1.08] transition duration-700" alt=""/>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-white/80 backdrop-blur rounded-full p-2 border">
                    {colors.map((c,i)=><button key={i} onClick={()=>setActiveColor(i)} className={`w-6 h-6 rounded-full border-2 transition ${i===activeColor?'border-black scale-110':'border-white'}`} style={{background:c}}/>)}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between"><span className="text-[13px] text-zinc-500">(4.9) ★★★★★</span><span className="font-black text-[16px]">${selectedProduct.price}</span></div>
                <h2 className="mt-2 text-[22px] font-black leading-[1.1]">{selectedProduct.name}</h2>
                <div className="mt-4">
                  <div className="text-[12px] font-bold tracking-widest uppercase">Size</div>
                  <div className="mt-2 flex gap-2">{[28,29,30,31,32].map(s=><button key={s} onClick={()=>setActiveSize(s)} className={`w-10 h-8 rounded-[10px] border text-[12px] font-bold transition ${s===activeSize?'bg-black text-white border-black':'bg-white'}`}>{s}</button>)}</div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between"><span className="text-[13px] font-bold">Description</span><span className="text-[12px] border rounded-full px-2 py-0.5">01</span></div>
                  <p className="mt-2 text-[12px] leading-[1.6] text-zinc-500 line-clamp-3">{selectedProduct.description || 'We updated the look with open languur team for added comfort and style, with deco stitching details that started on the basketball court.'}</p>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button onClick={()=>onAdd(selectedProduct)} className="h-11 border rounded-[12px] font-bold text-[13px]">Add to Cart</button>
                  <button onClick={()=>{onAdd(selectedProduct); setShowCart(true)}} className="h-11 bg-[#7C3AED] text-white rounded-[12px] font-bold text-[13px] shadow-[0_8px_20px_rgba(124,58,237,0.3)]">Buy Now</button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-10 text-center text-zinc-400">Select a shoe from middle →<br/>for premium detail view</div>
          )}
        </div>

        {/* MIDDLE - SHOE STORE */}
        <div className="space-y-4">
          <div className="bg-white rounded-[28px] p-5 border shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-zinc-100 overflow-hidden"><img src="https://i.pravatar.cc/100" alt=""/></div><div className="font-bold">Shoe Store</div></div>
              <div className="flex gap-2"><button className="w-8 h-8 border rounded-full grid place-items-center text-[12px]">🔔</button><button className="w-8 h-8 border rounded-full grid place-items-center text-[12px]">♡</button></div>
            </div>
            <div className="mt-4 relative">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Any Shoe Here" className="w-full h-11 pl-10 pr-4 bg-[#F8F7FF] border border-transparent focus:border-[#7C3AED]/30 focus:bg-white rounded-full text-[13px] outline-none transition"/>
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">⌕</span>
            </div>
            {/* BLACK FRIDAY BANNER */}
            <div className="mt-4 relative overflow-hidden rounded-[20px] bg-[#1a1aff] text-white p-4 flex items-center justify-between">
              <div><div className="text-[10px] tracking-widest uppercase opacity-80">Super Sale</div><div className="text-[22px] font-black leading-[0.9] tracking-[-0.02em]">BLACK<br/>FRIDAY</div><div className="text-[10px] mt-1 opacity-70">LIMITED OFFER</div><button className="mt-2 h-7 px-3 bg-white text-black rounded-full text-[11px] font-bold">Buy Now</button></div>
              <img src="https://images.unsplash.com/photo-1608666634759-4376010f863d?w=300" className="w-[120px] h-[80px] object-contain rotate-[-12deg]" alt=""/>
              <div className="absolute -right-2 -bottom-2 bg-yellow-300 text-black text-[10px] font-black px-2 py-1 rounded-full">50% OFF</div>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {brands.map(b=><button key={b.id} onClick={()=>setBrand(b.id)} className={`flex-shrink-0 h-14 w-14 rounded-[16px] border bg-white grid place-items-center gap-1 hover:border-black transition ${brand===b.id?'border-black':''}`}><span className="font-black text-[14px]">{b.icon}</span><span className="text-[9px]">{b.id}</span></button>)}
            </div>
          </div>

          <div className="bg-white rounded-[28px] p-5 border">
            <div className="flex items-center justify-between"><h3 className="font-bold">Popular products</h3><span className="text-[11px] text-zinc-500">View All</span></div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {filtered.slice(0,3).map((p:any)=>(
                <div key={p.id} onClick={()=>setSelectedProduct(p)} className="group bg-[#F8F7FF] border rounded-[16px] p-3 hover:border-black hover:shadow-lg transition cursor-pointer">
                  <div className="relative"><img src={p.image_url} className="w-full aspect-square object-contain group-hover:scale-105 transition" alt=""/><span className="absolute top-0 right-0 w-6 h-6 bg-white rounded-full grid place-items-center text-[10px] border">♡</span></div>
                  <div className="mt-2 text-[11px] font-bold truncate">{p.name}</div>
                  <div className="flex items-center justify-between mt-1"><span className="text-[12px] font-black">${p.price}</span><button className="w-6 h-6 bg-[#7C3AED] text-white rounded-full grid place-items-center text-[12px]">+</button></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT - FOR YOU */}
        <div className="bg-white rounded-[28px] border p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] sticky top-6 h-fit">
          <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-zinc-100 overflow-hidden"><img src="https://i.pravatar.cc/101" alt=""/></div><div className="font-bold">For You</div></div><div className="flex gap-2"><span className="w-8 h-8 border rounded-full grid place-items-center text-[12px]">🔔</span><span className="w-8 h-8 border rounded-full grid place-items-center text-[12px]">♡</span></div></div>
          <div className="mt-4 relative"><input placeholder="Search Any Shoe Here" className="w-full h-10 pl-9 pr-3 bg-[#F8F7FF] rounded-full text-[12px]"/><span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">⌕</span></div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {filtered.slice(0,6).map((p:any)=>(
              <div key={p.id} onClick={()=>setSelectedProduct(p)} className="group bg-[#F8F7FF] rounded-[16px] p-2.5 border hover:border-black transition cursor-pointer">
                <div className="bg-white rounded-[12px] p-2 relative"><img src={p.image_url} className="w-full aspect-square object-contain group-hover:scale-105 transition" alt=""/><span className="absolute top-1 left-1 w-5 h-5 bg-white border rounded-full grid place-items-center text-[8px]">♡</span></div>
                <div className="mt-2 text-[10px] font-bold truncate">{p.name}</div>
                <div className="text-[9px] text-yellow-500">★★★★★</div>
                <div className="flex items-center justify-between mt-1"><span className="text-[12px] font-black">${p.price}</span><span className="w-5 h-5 bg-[#7C3AED] text-white rounded-full grid place-items-center text-[10px]">+</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
