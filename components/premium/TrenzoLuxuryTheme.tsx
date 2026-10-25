
'use client'
import { useState, useEffect } from 'react'

type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; description?: string; category?: string }

export function TrenzoLuxuryTheme({ profile, products, onAdd, onOpen, track, selectedProduct, setSelectedProduct }: any) {
  const [idx, setIdx] = useState(0)
  useEffect(()=>{ const iv=setInterval(()=>setIdx(p=>(p+1)%Math.max(1,products.length)),3000); return()=>clearInterval(iv)},[products.length])

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white antialiased selection:bg-white selection:text-black">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;600&display=swap');
        @keyframes floatSlow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
      `}</style>

      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1280px] mx-auto px-5 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-2 font-black tracking-[0.2em] text-[14px]">✦ TRENZO</div>
          <nav className="hidden md:flex items-center gap-6 text-[11px] tracking-[0.15em] uppercase text-white/60">
            {['Home','Man','Woman','Kids','Sale'].map(l=><span key={l} className="hover:text-white cursor-pointer border-b border-transparent hover:border-white transition">{l}</span>)}
          </nav>
          <div className="flex items-center gap-3 text-white/60"><span>⌕</span><span>🛒</span></div>
        </div>
      </header>

      {/* HERO - TRENZO REFERENCE */}
      <section className="max-w-[1280px] mx-auto px-5 py-10 md:py-16 grid md:grid-cols-[1.1fr_0.9fr] gap-8 items-center relative">
        <div>
          <h1 className="text-[56px] md:text-[84px] font-[400] leading-[0.9] tracking-[-0.04em]" style={{fontFamily:'Instrument Serif'}}>
            A reflection<br/>of personal<br/><span className="italic">styling</span>
          </h1>
          <p className="mt-6 text-[13px] leading-[1.6] text-white/50 max-w-[320px]">Showcasing your personal flair through sleek design and thoughtful details. Curated essentials for every identity.</p>
          <button className="mt-8 h-10 px-5 border border-white/20 rounded-full text-[12px] tracking-widest uppercase hover:bg-white hover:text-black transition">Explore Now →</button>

          <div className="mt-16 relative w-fit">
            <div className="bg-white/5 border border-white/10 rounded-[16px] p-3 flex gap-3 backdrop-blur">
              <img src="https://i.pravatar.cc/40?img=5" className="w-8 h-8 rounded-full" alt=""/>
              <div><div className="text-[11px]">★★★★★ Beautiful and comfy. Felt instantly right. Will buy again!</div><div className="text-[9px] text-white/40 mt-1">Zara | Content Creator</div></div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="relative mx-auto w-[360px] h-[520px] rounded-[180px] overflow-hidden border border-white/10 bg-gradient-to-b from-[#1a1a1a] to-black animate-[floatSlow_6s_ease_infinite]">
            <img src={products[idx]?.image_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600'} className="w-full h-full object-cover opacity-90" alt=""/>
          </div>
          {/* Floating review cards */}
          <div className="absolute top-10 -right-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-[14px] p-3 flex gap-2 max-w-[220px] animate-[floatSlow_5s_ease_infinite]">
            <img src="https://i.pravatar.cc/40?img=8" className="w-7 h-7 rounded-full" alt=""/><div className="text-[10px] leading-[1.3]"><div>★★★★★</div>Great quality, super comfy. Feels like it was made for me!<div className="text-white/40 mt-1">Mia | Designer</div></div>
          </div>
        </div>
      </section>

      {/* BRAND STRIP */}
      <div className="border-y border-white/10 bg-white text-black py-3 overflow-hidden">
        <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap gap-12 items-center">
          {['adidas','SHEIN','NIKE','CHANEL','GUCCI','adidas','Dior','SHEIN','NIKE','GUCCI'].map((b,i)=><span key={i} className="text-[16px] font-black tracking-widest opacity-60">{b}</span>)}
          {['adidas','SHEIN','NIKE','CHANEL','GUCCI','adidas','Dior','SHEIN','NIKE','GUCCI'].map((b,i)=><span key={`2-${i}`} className="text-[16px] font-black tracking-widest opacity-60">{b}</span>)}
        </div>
      </div>

      {/* PRODUCTS LUXURY GRID */}
      <section className="max-w-[1280px] mx-auto px-5 py-12">
        <div className="flex items-center justify-between"><h2 className="text-[18px] tracking-widest uppercase font-bold">{profile.business_name} • {products.length} Pieces</h2><span className="text-[11px] text-white/40">/{profile.store_slug}</span></div>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p:any,i:number)=>(
            <div key={p.id} onClick={()=>onOpen(p)} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-[16px] bg-[#181818] border border-white/10 aspect-[4/5]">
                <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-[1.08] transition duration-[1000ms]" alt=""/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition"/>
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition translate-y-2 group-hover:translate-y-0">
                  <span className="bg-white text-black text-[10px] px-3 h-7 rounded-full font-bold grid place-items-center">Quick Add</span>
                  <span className="w-7 h-7 bg-white/20 backdrop-blur rounded-full grid place-items-center">↗</span>
                </div>
              </div>
              <div className="mt-3"><div className="text-[13px] font-medium">{p.name}</div><div className="text-[12px] text-white/50 mt-1">Rs. {p.price.toLocaleString()}</div></div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-[16px] flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-[24px] w-full max-w-[900px] max-h-[90vh] overflow-auto grid md:grid-cols-2">
            <div className="p-4 bg-black"><img src={selectedProduct.image_url} className="w-full aspect-square object-cover rounded-[16px]" alt=""/></div>
            <div className="p-7">
              <div className="flex justify-between"><span className="text-[10px] tracking-widest border border-white/20 px-3 h-6 rounded-full grid place-items-center">TRENZO • {selectedProduct.category}</span><button onClick={()=>setSelectedProduct(null)} className="w-8 h-8 border border-white/20 rounded-full grid place-items-center hover:bg-white hover:text-black">✕</button></div>
              <h2 className="mt-4 text-[28px] leading-[0.95]" style={{fontFamily:'Instrument Serif'}}>{selectedProduct.name}</h2>
              <div className="mt-4 text-[22px] font-bold">Rs. {selectedProduct.price.toLocaleString()}</div>
              <p className="mt-4 text-[13px] leading-[1.6] text-white/50">{selectedProduct.description || 'Showcasing your personal flair through sleek design and thoughtful details. Premium fabric, timeless cut.'}</p>
              <div className="mt-8 flex gap-3">
                <button onClick={()=>{onAdd(selectedProduct); setSelectedProduct(null)}} className="flex-1 h-12 bg-white text-black rounded-full font-bold">Add to Cart</button>
                <button onClick={()=>{onAdd(selectedProduct); setSelectedProduct(null)}} className="h-12 px-6 border border-white/20 rounded-full font-bold">WhatsApp</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
