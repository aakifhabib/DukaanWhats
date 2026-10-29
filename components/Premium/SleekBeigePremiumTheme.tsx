'use client'
import { useState } from 'react'

function SleekBase({ profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct, variant }: any) {
  const [localShowCart, setLocalShowCart] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [qty, setQty] = useState(1)
  const custom = profile?.premium_custom || {}
  const isBeige = variant==='beige'
  const isDark = variant==='dark'
  const isEditorial = variant==='editorial'
  const announcement = custom.announcement || (isBeige ? 'FREE SHIPPING • NEW DROP • COD • PREMIUM BEIGE COLLECTION' : isDark ? 'DARK MODE • LUXURY • FREE SHIPPING • COD • 24H DISPATCH' : 'EDITORIAL • MINIMAL • LUXURY • FREE SHIPPING • COD')
  const badge = custom.badge || custom.heroBadge || (isBeige ? 'EDITORIAL • BEIGE • 2024' : isDark ? 'NOIR • DARK • 2024' : 'EDITORIAL • MINIMAL • 2024')
  const headerLabel = custom.headerLabel || 'PREMIUM • EDITORIAL'
  const heroTitle = custom.heroTitle || (isBeige ? 'Warm minimal\nluxury, everyday\nicon.' : isDark ? 'Noir luxury,\nmidnight\nicon.' : 'Less, but\nbetter. Always\neditorial.')
  const heroSubtitle = custom.heroSubtitle || (isBeige ? 'Soft beige tones, natural texture, premium stitch. Curated for icons.' : isDark ? 'Deep black, subtle glow, premium finish. Designed for night.' : 'Clean lines, intentional whitespace, premium finish. Less is luxury.')
  const heroImage = custom.heroImage || products[0]?.image_url
  const ctaText = custom.ctaText || (isBeige ? 'Shop Beige →' : isDark ? 'Shop Dark →' : 'Shop Editorial →')
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
    const msg = `Hi ${profile.business_name}!%0AOrder ${variant.toUpperCase()} PREMIUM%0A${lines}%0ATotal: Rs. ${cartTotal}%0AName: ${customerName}%0AAddress: ${customerAddress}`
    window.open(`https://wa.me/${profile.whatsapp_number}?text=${msg}`,'_blank')
  }
  const bg = isDark ? 'bg-[#0A0A0A] text-white' : isBeige ? 'bg-[#F5F1EB] text-[#0A0A0A]' : 'bg-[#FCFBF9] text-[#0A0A0A]'
  const cardBg = isDark ? 'bg-[#141414] border-white/10' : 'bg-white border-black/5'
  return (
    <div className={`min-h-screen ${bg} antialiased`}>
      <div className={`${isDark ? 'bg-[#E8FF86] text-black' : isBeige ? 'bg-black text-[#E8FF86]' : 'bg-[#0A0A0A] text-white'} text-[10px] tracking-widest h-7 flex items-center justify-center font-bold`}>{announcement}</div>
      <header className={`h-14 border-b flex items-center justify-between px-5 sticky top-0 z-20 backdrop-blur ${isDark ? 'bg-black/70 border-white/10' : 'bg-[#F5F1EB]/80 border-black/10'}`}><div className="font-black tracking-widest text-[12px]">{isBeige ? 'BEIGE' : isDark ? 'DARK' : 'EDITORIAL'} • {profile?.business_name} {isEditorial && <span className="hidden md:inline-flex ml-2 h-6 px-2.5 bg-black text-white rounded-full text-[9px] items-center">{headerLabel}</span>}</div><button onClick={openCart} className={`h-8 px-4 rounded-full text-[11px] font-bold ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>Cart ({cartCount})</button></header>
      <section className="max-w-6xl mx-auto px-5 py-8 md:py-12 grid md:grid-cols-2 gap-8 items-center"><div><div className={`inline-flex h-6 px-3 rounded-full text-[10px] font-bold tracking-widest ${isDark ? 'bg-white/10 border border-white/20' : 'bg-white border'}`}>{badge}</div><h1 className="mt-4 text-[36px] md:text-[52px] leading-[0.9] tracking-[-0.03em] font-[800] whitespace-pre-line">{heroTitle}</h1><p className={`mt-4 text-[12px] max-w-[340px] ${isDark ? 'text-white/50' : 'text-black/50'}`}>{heroSubtitle}</p><button onClick={()=>document.getElementById('grid')?.scrollIntoView({behavior:'smooth'})} className={`mt-6 h-10 px-5 rounded-full text-[12px] font-bold ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>{ctaText}</button></div><div className={`w-[300px] md:w-[380px] aspect-[4/5] border rounded-[24px] overflow-hidden mx-auto ${isDark ? 'bg-[#141414] border-white/10' : 'bg-white border shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)]'}`}><img src={heroImage} className="w-full h-full object-cover" alt=""/></div></section>
      <main id="grid" className="max-w-6xl mx-auto px-5 py-8 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">{products.map((p:any,i:number)=><div key={p.id} onClick={()=>{ setQty(1); onOpen(p)}} className={`${cardBg} border rounded-[18px] p-2.5 cursor-pointer`}><div className="relative overflow-hidden rounded-[12px]"><img src={p.image_url} className="w-full aspect-square object-cover" alt=""/>{i<2 && <div className="absolute top-2 left-2 h-5 px-2 bg-[#E8FF86] border border-black rounded-full text-[8px] font-black grid place-items-center">{isDark?'HOT':'NEW'}</div>}</div><div className="mt-2.5 font-bold text-[12px]">{p.name}</div><div className="text-[12px] font-black">Rs. {p.price.toLocaleString()}</div></div>)}</main>
      {selectedProduct && <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4"><div className="bg-white rounded-[20px] w-full max-w-[700px] grid md:grid-cols-2 overflow-hidden max-h-[90vh]"><img src={selectedProduct.image_url} className="w-full aspect-square object-cover" alt=""/><div className="p-5 flex flex-col"><div className="flex justify-between"><h2 className="font-bold text-[18px] text-black">{selectedProduct.name}</h2><button onClick={()=>setSelectedProduct(null)} className="w-7 h-7 border rounded-full grid place-items-center text-black">✕</button></div><div className="mt-3 font-black text-[16px] text-black">Rs. {selectedProduct.price}</div><button onClick={()=>{ onAdd(selectedProduct, qty); setSelectedProduct(null)}} className="mt-auto h-10 bg-black text-white rounded-full font-bold text-[12px]">Add to Cart</button></div></div></div>}
      {localShowCart && <div className="fixed inset-0 bg-black/40 z-50 flex justify-end"><div className="w-full max-w-[360px] bg-white h-full flex flex-col"><div className="p-4 border-b flex justify-between"><h3 className="font-bold text-[13px] text-black">Cart ({cartCount})</h3><button onClick={closeCart} className="text-black">✕</button></div><div className="flex-1 overflow-auto p-3 space-y-2">{cart.map((p:any,i:number)=><div key={i} className="flex gap-2 p-2 bg-[#F5F1EB] rounded-[10px]"><img src={p.image_url} className="w-10 h-10 rounded object-cover"/><div className="text-[11px] text-black">{p.name}</div></div>)}</div><div className="p-4 border-t space-y-2"><input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Name" className="w-full h-9 px-3 border rounded-[8px] text-[12px] text-black"/><input value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} placeholder="Address" className="w-full h-9 px-3 border rounded-[8px] text-[12px] text-black"/><button onClick={orderWhatsApp} className="w-full h-10 bg-[#25D366] text-white rounded-full font-bold text-[12px]">Order WhatsApp</button></div></div></div>}
    </div>
  )
}

export function SleekBeigePremiumTheme(props:any){ return SleekBase({...props, variant:'beige'}) }
