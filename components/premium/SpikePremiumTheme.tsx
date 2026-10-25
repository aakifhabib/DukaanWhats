
'use client'
import { useState, useEffect } from 'react'

type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; original_price?: number; description?: string; sizes?: string[]; colors?: string[]; stock?: number; category?: string }

function Gallery({ images, onIdx }: { images: string[]; onIdx?: (i:number)=>void }) {
  const [idx, setIdx] = useState(0)
  const [hover, setHover] = useState(false)
  useEffect(()=>{ if(!hover || images.length<=1) return; const iv=setInterval(()=>setIdx(p=>(p+1)%images.length),2000); return()=>clearInterval(iv)},[hover,images.length])
  useEffect(()=>{ onIdx?.(idx) },[idx])
  return (
    <div className="relative group" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
      <div className="overflow-hidden rounded-[20px] aspect-[4/3] bg-zinc-50 relative">
        <img src={images[idx]} className="w-full h-full object-cover transition-all duration-[1200ms] group-hover:scale-[1.06]" alt="" />
        <div className="absolute top-3 left-3 bg-black text-white text-[10px] px-2.5 py-1 rounded-full font-bold tracking-widest">{idx+1}/{images.length}</div>
      </div>
      <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
        {images.map((u,i)=><button key={i} onClick={()=>setIdx(i)} className={`w-14 h-14 rounded-[12px] overflow-hidden border-2 flex-shrink-0 transition-all ${i===idx?'border-black scale-105':'border-zinc-200 opacity-70'}`}><img src={u} className="w-full h-full object-cover" alt=""/></button>)}
      </div>
    </div>
  )
}

export function SpikePremiumTheme({ profile, products, onAdd, onOpen, track, selectedProduct, setSelectedProduct }: any) {
  const [activeBrand, setActiveBrand] = useState('All')
  const brands = ['All','Nike','Adidas','Puma','New Balance']
  const filtered = activeBrand==='All'? products : products.filter((p:any)=>p.name.toLowerCase().includes(activeBrand.toLowerCase()) || p.category?.toLowerCase().includes(activeBrand.toLowerCase()))
  
  return (
    <div className="min-h-screen bg-white text-black antialiased selection:bg-black selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@500;700;800&family=Fragment+Mono&display=swap');
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes float { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-12px) rotate(1deg)} }
        @keyframes fadeUp { from{opacity:0; transform:translateY(24px)} to{opacity:1; transform:translateY(0)} }
        .no-scrollbar::-webkit-scrollbar{display:none} .no-scrollbar{-ms-overflow-style:none; scrollbar-width:none}
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-[1280px] mx-auto px-5 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 font-black text-[18px] tracking-[-0.02em]">SPIKE<span className="w-1.5 h-1.5 bg-black rounded-full"/></div>
            <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-zinc-500">
              {['Home','About','Products','Testimonials','Contact us','FAQ'].map(l=><span key={l} className="hover:text-black cursor-pointer">{l}</span>)}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="h-9 px-4 bg-black text-white rounded-full text-[12px] font-bold">Cart ({products.length})</button>
          </div>
        </div>
      </header>

      {/* HERO - SPIKE REFERENCE */}
      <section className="max-w-[1280px] mx-auto px-5 py-8 md:py-12 grid md:grid-cols-[1.1fr_0.9fr] gap-8 items-start relative overflow-hidden">
        <div className="relative">
          <div className="inline-flex items-center gap-2 border rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-widest">New Drop • 2025 <span className="w-1 h-1 bg-black rounded-full animate-pulse"/></div>
          <h1 className="mt-6 text-[48px] md:text-[72px] font-[800] leading-[0.9] tracking-[-0.04em] animate-[fadeUp_0.8s_ease]">
            The journey<br/>begins with the<br/><span className="relative">perfect pair
              <span className="absolute -bottom-2 left-0 w-full h-[8px] bg-black/10 -rotate-1"/>
            </span>
          </h1>
          <p className="mt-6 text-[14px] leading-[1.6] text-zinc-500 max-w-[360px]">Dive into unparalleled with unmatched comfort. Find your perfect stride with Spike Collections — crafted for style comfortably.</p>
          <button className="mt-6 h-11 px-6 bg-black text-white rounded-full text-[13px] font-bold hover:scale-[1.02] transition">Shop Now →</button>

          <div className="mt-10">
            <div className="text-[12px] font-bold tracking-widest uppercase">Top Brands</div>
            <div className="mt-3 flex items-center gap-6 opacity-70">
              {brands.slice(1).map(b=><div key={b} className="h-8 px-4 border rounded-full grid place-items-center text-[12px] font-bold hover:bg-black hover:text-white transition cursor-pointer" onClick={()=>setActiveBrand(b)}>{b}</div>)}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-10 top-0 bottom-0 w-[120px] bg-black text-white grid place-items-center [writing-mode:vertical-rl] text-[72px] font-black tracking-[0.2em] opacity-10 rounded-l-[40px] select-none">ADIDAS</div>
          <div className="relative bg-[#F6F5F2] rounded-[32px] p-4 md:p-6 border border-black/5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.2)]">
            <div className="rounded-[20px] bg-white p-3 border">
              <img src={products[0]?.image_url || 'https://images.unsplash.com/photo-1608666634759-4376010f863d?w=600'} className="w-full aspect-square object-cover rounded-[16px] animate-[float_6s_ease-in-out_infinite]" alt=""/>
            </div>
            <div className="mt-4 flex gap-3">
              {(products[0]?.image_urls?.slice(0,3) || [products[0]?.image_url]).map((u:any,i:number)=><div key={i} className="w-14 h-14 rounded-[12px] bg-white border grid place-items-center overflow-hidden"><img src={u} className="w-full h-full object-cover" alt=""/></div>)}
            </div>
          </div>
        </div>
      </section>

      {/* SPIKE COLLECTIONS */}
      <section className="max-w-[1280px] mx-auto px-5 py-10">
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-bold tracking-tight">Spike Collections</h2>
          <div className="flex items-center gap-2 text-[11px] font-mono border rounded-full px-3 py-1">We Offer: Premium • Limited • Hype</div>
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.map((p:Product,i:number)=>(
            <div key={p.id} onClick={()=>onOpen(p)} className="group bg-white border rounded-[20px] p-3 hover:border-black hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.2)] transition-all duration-500 cursor-pointer animate-[fadeUp_0.6s_ease]" style={{animationDelay:`${i*80}ms`}}>
              <div className="overflow-hidden rounded-[16px] aspect-square bg-[#F8F7F5] relative">
                <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-[1.08] transition duration-700" alt=""/>
                <div className="absolute bottom-2 left-2 bg-black text-white text-[10px] px-2 py-1 rounded-full">{p.category || 'Spike'}</div>
              </div>
              <div className="mt-3">
                <div className="text-[13px] font-bold truncate">{p.name}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[14px] font-black">Rs. {p.price.toLocaleString()}</span>
                  <span className="w-7 h-7 bg-black text-white rounded-full grid place-items-center text-[12px] group-hover:rotate-45 transition">↗</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT MODAL - PREMIUM SPIKE */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[20px] flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] w-full max-w-[980px] max-h-[90vh] overflow-auto grid md:grid-cols-2 animate-[fadeUp_0.4s_ease]">
            <div className="p-5 bg-[#F8F7F5]">
              <Gallery images={selectedProduct.image_urls?.length? selectedProduct.image_urls : [selectedProduct.image_url]} />
            </div>
            <div className="p-7 flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <div className="inline-flex items-center gap-2 bg-black text-white text-[10px] px-3 h-6 rounded-full tracking-widest font-bold">SPIKE • {selectedProduct.category || 'SHOES'}</div>
                  <h2 className="mt-3 text-[28px] font-[800] leading-[0.95] tracking-[-0.03em]">{selectedProduct.name}</h2>
                  <div className="mt-2 flex items-center gap-2 text-[12px]"><span className="text-yellow-500">★★★★★</span><span className="text-zinc-500">(4.9) 128 reviews</span></div>
                </div>
                <button onClick={()=>setSelectedProduct(null)} className="w-9 h-9 border rounded-full grid place-items-center hover:bg-black hover:text-white transition">✕</button>
              </div>
              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-[28px] font-black">Rs. {selectedProduct.price.toLocaleString()}</span>
                {selectedProduct.original_price && <span className="text-[14px] line-through text-zinc-400">Rs. {selectedProduct.original_price.toLocaleString()}</span>}
              </div>
              {selectedProduct.description && <p className="mt-4 text-[13px] leading-[1.6] text-zinc-600">{selectedProduct.description}</p>}
              <div className="mt-6 space-y-4">
                {selectedProduct.sizes?.length>0 && <div><div className="text-[11px] font-bold tracking-widest">SIZE</div><div className="mt-2 flex flex-wrap gap-2">{selectedProduct.sizes.map((s:string)=><button key={s} className="h-9 px-4 border rounded-full text-[12px] font-bold hover:bg-black hover:text-white transition">{s}</button>)}</div></div>}
                {selectedProduct.colors?.length>0 && <div><div className="text-[11px] font-bold tracking-widest">COLOR</div><div className="mt-2 flex gap-2">{selectedProduct.colors.map((c:string)=><button key={c} className="w-8 h-8 rounded-full border-2 border-white shadow-[0_0_0_1px_#ddd] hover:scale-110 transition" style={{background:c.toLowerCase()}} title={c}/>)}</div></div>}
              </div>
              <div className="mt-auto pt-6 flex gap-3">
                <button onClick={()=>{onAdd(selectedProduct); setSelectedProduct(null)}} className="flex-1 h-12 bg-black text-white rounded-full font-bold text-[13px] hover:bg-zinc-900">Add to Cart — Rs. {selectedProduct.price.toLocaleString()}</button>
                <button onClick={()=>{onAdd(selectedProduct); setSelectedProduct(null)}} className="h-12 px-6 border rounded-full font-bold text-[13px]">Buy on WhatsApp</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
