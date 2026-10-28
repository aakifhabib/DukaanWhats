
'use client'
import { useState, useEffect } from 'react'

type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; description?: string }

function Gallery({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0)
  const [hover, setHover] = useState(false)
  useEffect(()=>{ if(!hover || images.length<=1) return; const iv=setInterval(()=>setIdx(p=>(p+1)%images.length),2000); return()=>clearInterval(iv)},[hover, images.length])
  return (
    <div className="relative group" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
      <div className="overflow-hidden rounded-[18px] aspect-[4/3] bg-[#F5F4F1] border"><img src={images[idx]} className="w-full h-full object-cover" alt="" /><div className="absolute top-2.5 left-2.5 bg-black text-white text-[9px] px-2 h-5 rounded-full font-bold grid place-items-center">{idx+1}/{images.length}</div></div>
      <div className="flex gap-1.5 mt-2.5 overflow-x-auto">{images.map((u,i)=><button key={i} onClick={()=>setIdx(i)} className={`w-[52px] h-[52px] rounded-[10px] overflow-hidden border-2 shrink-0 ${i===idx?'border-black':'border-transparent opacity-60'}`}><img src={u} className="w-full h-full object-cover" alt=""/></button>)}</div>
    </div>
  )
}

function SpikePremiumTheme({ profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }: any) {
  const [activeBrand, setActiveBrand] = useState('All')
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [qty, setQty] = useState(1)
  const [localShowCart, setLocalShowCart] = useState(false)
  const custom = profile?.premium_custom || {}
  const heroTitle = custom.heroTitle || custom.spikeTitle || 'The journey begins with the perfect pair'
  const heroSub = custom.heroSubtitle || custom.spikeSub || 'Dive into unparalleled comfort.'
  const brandList = custom.brands || custom.spikeBrands || ['All','Nike','Adidas','Puma','New Balance']
  const announcement = custom.announcement || 'FREE SHIPPING OVER RS. 5000 • NEW DROP LIVE'
  const heroImage = custom.heroImage || products[0]?.image_url
  const headerLabel = custom.headerLabel || `${custom.headerPrefix || 'SPIKE'} • ${profile?.business_name || ''}`
  const badge = custom.badge || 'New Drop • Live • COD'
  const ctaText = custom.ctaText || 'Shop Now →'
  const cartCount = cart?.length || 0
  const cartTotal = cart?.reduce((s:any,p:any)=>s+p.price,0) || 0
  const openCart = () => { setLocalShowCart(true); if(setShowCart) setShowCart(true) }
  const closeCart = () => { setLocalShowCart(false); if(setShowCart) setShowCart(false) }
  const filtered = activeBrand==='All' ? products : products.filter((p:any)=> (p.name||'').toLowerCase().includes(activeBrand.toLowerCase()))
  const orderWhatsApp = () => {
    if(!profile || cart.length===0) return
    if(!customerName.trim()){ alert('Please enter your name'); return }
    if(!customerAddress.trim()){ alert('Please enter your address'); return }
    cart.forEach((p:any)=>track?.('whatsapp_click',p.id))
    const lines = cart.map((p:any)=>`• ${p.name} - Rs. ${p.price}`).join('%0A')
    const msg = `Hi ${profile.business_name}!%0ASPIKE PREMIUM ORDER%0A${lines}%0ATotal: Rs. ${cartTotal}%0AName: ${customerName}%0AAddress: ${customerAddress}`
    window.open(`https://wa.me/${profile.whatsapp_number}?text=${msg}`,'_blank')
  }
  const handleAdd = (p:any, direct=false) => { const prod = {...p, selectedSize}; onAdd(prod, qty); setSelectedProduct(null); setQty(1); if(direct) setTimeout(()=>openCart(),300) }
  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#0A0A0A]">
      <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      <div className="bg-black text-white text-[10px] tracking-widest h-8 flex items-center overflow-hidden"><div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap gap-8"><span>{announcement}</span><span>{announcement}</span></div></div>
      <header className="sticky top-0 z-20 bg-[#FCFBF9]/80 backdrop-blur border-b border-black/10"><div className="max-w-[1320px] mx-auto px-4 h-[56px] flex items-center justify-between"><div className="font-black text-[15px]">{headerLabel}</div><button onClick={openCart} className="h-8 px-3.5 bg-black text-white rounded-full text-[11px] font-bold">Cart ({cartCount})</button></div></header>
      <section className="max-w-[1320px] mx-auto px-4 py-6 md:py-10 grid md:grid-cols-2 gap-6">
        <div>
          <div className="inline-flex border rounded-full px-2.5 h-6 text-[10px] uppercase font-bold tracking-widest">{badge}</div>
          <h1 className="mt-4 md:mt-6 text-[32px] md:text-[56px] font-[800] leading-[0.88] tracking-[-0.04em] whitespace-pre-line">{heroTitle}</h1>
          <p className="mt-3 md:mt-4 text-[12px] md:text-[13px] text-black/50 max-w-[340px] leading-[1.4]">{heroSub}</p>
          <div className="mt-5 flex gap-2"><button onClick={()=>document.getElementById('coll')?.scrollIntoView({behavior:'smooth'})} className="h-10 md:h-11 px-5 md:px-6 bg-black text-white rounded-full text-[12px] md:text-[13px] font-bold">{ctaText}</button></div>
          <div className="mt-6 flex flex-wrap gap-1.5">{brandList.map((b:any)=><button key={b} onClick={()=>setActiveBrand(b)} className={`h-7 px-3.5 rounded-full text-[11px] font-bold border ${activeBrand===b?'bg-black text-white':'bg-white hover:border-black/20'}`}>{b}</button>)}</div>
          <div className="mt-6 grid grid-cols-3 gap-2 text-[10px]"><div className="bg-white border rounded-[10px] p-2.5"><div className="font-black">{custom.statsOrders || '500+'}</div><div className="text-black/40">{custom.statsOrdersLabel || 'Orders'}</div></div><div className="bg-white border rounded-[10px] p-2.5"><div className="font-black">{custom.statsRating || '4.9★'}</div><div className="text-black/40">{custom.statsRatingLabel || 'Rating'}</div></div><div className="bg-white border rounded-[10px] p-2.5"><div className="font-black">{custom.statsCod || 'COD'}</div><div className="text-black/40">{custom.statsCodLabel || 'Available'}</div></div></div>
        </div>
        <div className="relative bg-white rounded-[20px] md:rounded-[28px] p-3 md:p-4 border shadow-[0_24px_64px_-20px_rgba(0,0,0,0.18)] h-fit"><img src={heroImage} className="w-full aspect-square object-cover rounded-[14px] md:rounded-[18px]" alt=""/><div className="absolute top-5 right-5 bg-white border rounded-full px-2.5 h-6 text-[10px] font-bold grid place-items-center">FREE SHIPPING</div></div>
      </section>
      <section id="coll" className="max-w-[1320px] mx-auto px-4 py-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{filtered.map((p:Product)=><div key={p.id} onClick={()=>{ setSelectedSize(''); setQty(1); onOpen(p)}} className="bg-white border rounded-[16px] p-2.5 cursor-pointer"><img src={p.image_url} className="w-full aspect-square object-cover rounded-[10px]" alt=""/><div className="mt-2 text-[12px] font-bold truncate">{p.name}</div><div className="text-[13px] font-black">Rs. {p.price}</div></div>)}</div></section>
      {selectedProduct && <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-3"><div className="bg-white rounded-[20px] w-full max-w-[960px] max-h-[90vh] overflow-auto grid md:grid-cols-2"><div className="p-4 bg-[#F6F5F2]"><Gallery images={selectedProduct.image_urls?.length? selectedProduct.image_urls : [selectedProduct.image_url]} /></div><div className="p-5 flex flex-col"><div className="flex justify-between"><h2 className="text-[20px] font-bold">{selectedProduct.name}</h2><button onClick={()=>setSelectedProduct(null)} className="w-8 h-8 border rounded-full">✕</button></div><div className="mt-3 text-[20px] font-black">Rs. {selectedProduct.price}</div><div className="mt-4"><div className="text-[10px] font-black">SIZE</div><div className="mt-2 flex flex-wrap gap-1.5">{(selectedProduct.sizes || ['40','41','42']).map((s:string)=><button key={s} onClick={()=>setSelectedSize(s)} className={`h-8 px-3.5 border rounded-full text-[11px] font-bold ${selectedSize===s?'bg-black text-white':'bg-white'}`}>{s}</button>)}</div></div><div className="mt-auto pt-5 grid grid-cols-2 gap-2"><button onClick={()=>handleAdd(selectedProduct,false)} className="h-10 bg-black text-white rounded-full font-bold text-[12px]">Add to Cart</button><button onClick={()=>handleAdd(selectedProduct,true)} className="h-10 bg-[#25D366] text-white rounded-full font-bold text-[12px]">WhatsApp</button></div></div></div></div>}
      <div className={`fixed inset-0 z-[110] ${localShowCart ? '' : 'pointer-events-none'}`}><div className={`absolute inset-0 bg-black/40 ${localShowCart ? 'opacity-100' : 'opacity-0'}`} onClick={closeCart}></div><div className={`absolute right-0 top-0 bottom-0 w-full max-w-[360px] bg-white flex flex-col ${localShowCart ? 'translate-x-0' : 'translate-x-full'} transition-transform`}><div className="p-4 border-b flex justify-between"><h3 className="font-bold text-[13px]">Cart ({cartCount})</h3><button onClick={closeCart}>✕</button></div><div className="flex-1 overflow-auto p-3 space-y-2">{cart.map((p:any,i:number)=><div key={i} className="flex gap-2.5 p-2.5 bg-zinc-50 rounded-[10px]"><img src={p.image_url} className="w-11 h-11 rounded object-cover"/><div className="text-[11px] font-bold">{p.name}</div></div>)}</div>{cartCount>0 && <div className="p-4 border-t space-y-2"><input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Name" className="w-full h-10 px-3 border rounded text-[12px]"/><input value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} placeholder="Address" className="w-full h-10 px-3 border rounded text-[12px]"/><button onClick={orderWhatsApp} className="w-full h-10 bg-[#25D366] text-white rounded-full font-bold text-[12px]">Order WhatsApp</button></div>}</div></div>
    </div>
  )
}

export function PremiumThemeRenderer({ themeId, profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }: any) {
  if (themeId === 'spike-premium') return <SpikePremiumTheme profile={profile} products={products} cart={cart} setShowCart={setShowCart} onAdd={onAdd} onOpen={onOpen} track={track} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} />
  return <SpikePremiumTheme profile={profile} products={products} cart={cart} setShowCart={setShowCart} onAdd={onAdd} onOpen={onOpen} track={track} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} />
}
