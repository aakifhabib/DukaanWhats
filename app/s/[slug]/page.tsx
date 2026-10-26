'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getTheme } from '@/lib/storeThemes'
import PremiumThemeRenderer from '@/components/PremiumThemeRenderer'

type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; description?: string }

function Gallery({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0)
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-[14px] h-52 bg-zinc-50"><img src={images[idx]} className="w-full h-full object-cover" alt=""/></div>
      <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar">
        {images.map((u,i)=><button key={i} onClick={()=>setIdx(i)} className={`w-12 h-12 rounded-[10px] border-2 shrink-0 overflow-hidden ${i===idx?'border-black':'border-zinc-200'}`}><img src={u} className="w-full h-full object-cover" alt=""/></button>)}
      </div>
    </div>
  )
}

export default function StorePage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const [rawSlug, setRawSlug] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [showCart, setShowCart] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  useEffect(()=>{
    const resolveSlug = async()=>{ const r = params instanceof Promise ? await params : params; return (r as any)?.slug || '' }
    const load = async(slugValue:string)=>{
      if(!slugValue){ setLoading(false); return }
      const clean = decodeURIComponent(slugValue).toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
      let prof:any = null
      try { const { data } = await (supabase as any).from('profiles').select('*').eq('store_slug', clean).maybeSingle(); if(data) prof = data } catch {}
      if(!prof){ try { const { data } = await (supabase as any).from('profiles').select('*').eq('store_slug', slugValue).maybeSingle(); if(data) prof = data } catch {} }
      if(!prof){ try { const { data } = await (supabase as any).from('profiles').select('*').ilike('store_slug', `%${clean}%`).maybeSingle(); if(data) prof = data } catch {} }
      if(!prof){ setLoading(false); return }
      setProfile(prof)
      const {data:prods} = await (supabase as any).from('products').select('*').eq('user_id',prof.id).order('created_at',{ascending:false})
      if(prods) setProducts(prods)
      setLoading(false)
    }
    resolveSlug().then(s=>{ setRawSlug(s); load(s) })
  },[params])

  const addToCart = (p:any)=>{ setCart([...cart,p]); setShowCart(true); setSelectedProduct(null) }
  const openProductDetail = (p:any)=>{ setSelectedProduct(p) }
  const removeFromCart = (i:number)=>setCart(cart.filter((_,idx)=>idx!==i))
  const orderWhatsApp = ()=>{ if(!profile) return; const total=cart.reduce((s,p)=>s+p.price,0); const lines=cart.map((p:any)=>`• ${p.name} - Rs. ${p.price}`).join('%0A'); const msg=`Hi ${profile.business_name}!%0A%0AOrder:%0A${lines}%0ATotal: Rs. ${total}%0AName: ${customerName}%0AAddress: ${customerAddress}`; window.open(`https://wa.me/${profile.whatsapp_number}?text=${msg}`,'_blank') }

  if(loading) return <div className="min-h-screen grid place-items-center text-sm bg-[#F8F7F5]">Loading store {rawSlug}...</div>
  if(!profile) return <div className="min-h-screen grid place-items-center bg-[#F8F7F5]"><div className="text-center"><div className="text-2xl font-bold">Store &quot;{rawSlug}&quot; not found</div><a href="/" className="mt-6 inline-block bg-black text-white px-5 py-2.5 rounded-full text-sm">Go Home</a></div></div>

  const themeId = profile.store_theme || 'clothing-noor'
  const isPremium = ['spike-premium','shoe-app-premium','trenzo-luxury','sleek-beige','sleek-dark','sleek-editorial'].includes(themeId)

  if(isPremium){
    return <PremiumThemeRenderer themeId={themeId} profile={profile} products={products} cart={cart} setCart={setCart} showCart={showCart} setShowCart={setShowCart} onAdd={addToCart} onOpen={openProductDetail} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} />
  }

  const theme = getTheme(themeId)
  return (
    <div style={{background:theme.colors.bg, color:theme.colors.text}} className="min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur"><div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between"><span className="font-bold">{profile.business_name}</span><button onClick={()=>setShowCart(true)} className="h-9 px-4 border rounded-[10px] text-[13px]">Cart ({cart.length})</button></div></header>
      <main className="max-w-6xl mx-auto px-4 py-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{products.map((p:any)=><div key={p.id} onClick={()=>openProductDetail(p)} className="border rounded-[20px] p-3 bg-white cursor-pointer"><img src={p.image_url} className="w-full h-52 object-cover rounded-[14px]" alt=""/><div className="mt-3 text-[13px] font-medium truncate">{p.name}</div><div className="font-bold">Rs. {p.price}</div><button onClick={(e)=>{e.stopPropagation(); addToCart(p)}} className="mt-3 w-full h-10 bg-black text-white rounded-[12px] text-[13px] font-bold">Quick Add</button></div>)}</div></main>
      {selectedProduct && <div className="fixed inset-0 bg-black/60 backdrop-blur z-50 grid place-items-center p-4"><div className="bg-white rounded-[24px] w-full max-w-[900px] grid md:grid-cols-2 overflow-hidden"><div className="p-4 bg-[#F8F7F5]"><Gallery images={selectedProduct.image_urls?.length? selectedProduct.image_urls : [selectedProduct.image_url]}/></div><div className="p-6"><div className="flex justify-between"><h2 className="font-black text-[20px]">{selectedProduct.name}</h2><button onClick={()=>setSelectedProduct(null)} className="w-8 h-8 border rounded-full">✕</button></div><div className="mt-4 text-[24px] font-black">Rs. {selectedProduct.price}</div><p className="mt-4 text-[13px] text-zinc-600">{selectedProduct.description}</p><button onClick={()=>addToCart(selectedProduct)} className="mt-6 w-full h-12 bg-black text-white rounded-full font-bold">Add to Cart</button></div></div></div>}
      {showCart && <div className="fixed inset-0 bg-black/40 z-50 flex justify-end"><div className="w-full max-w-sm bg-white h-full flex flex-col"><div className="p-6 border-b flex justify-between"><h3 className="font-bold">Cart ({cart.length})</h3><button onClick={()=>setShowCart(false)}>✕</button></div><div className="flex-1 overflow-auto p-6 space-y-3">{cart.map((p:any,i:number)=><div key={i} className="flex gap-3 p-3 bg-zinc-50 rounded-[12px]"><img src={p.image_url} className="w-14 h-14 rounded-[8px] object-cover"/><div className="flex-1"><div className="text-[13px]">{p.name}</div><div className="text-[13px] font-bold">Rs. {p.price}</div></div><button onClick={()=>removeFromCart(i)} className="text-[11px]">Remove</button></div>)}</div><div className="p-6 border-t space-y-3"><input placeholder="Your name" value={customerName} onChange={e=>setCustomerName(e.target.value)} className="w-full h-11 px-4 border rounded-[12px]"/><input placeholder="Full address" value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)} className="w-full h-11 px-4 border rounded-[12px]"/><button onClick={orderWhatsApp} className="w-full h-11 bg-black text-white rounded-[12px]">Order on WhatsApp</button></div></div></div>}
    </div>
  )
}
