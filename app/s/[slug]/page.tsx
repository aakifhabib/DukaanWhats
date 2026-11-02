'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PremiumThemeRenderer } from '@/components/PremiumThemeRenderer'
import { STORE_THEMES, getTheme } from '@/lib/storeThemes'
import Link from 'next/link'

type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; description?: string; category?: string; user_id: string; original_price?: number; stock?: number; sizes?: string[]; colors?: string[]; created_at?: string }

// Basic theme fallback (for non-premium)
function BasicTheme({ profile, products, cart, onAdd, onOpen }: any) {
  const theme = getTheme(profile?.store_theme) || STORE_THEMES[0]
  const c = (theme as any).colors || {}
  return (
    <div className="min-h-screen" style={{ background: c.bg || '#F8F7F5', color: c.text || '#0A0A0A' }}>
      <header className="h-14 border-b flex items-center justify-between px-4 sticky top-0 z-20 backdrop-blur bg-white/80">
        <div className="font-black text-[13px] tracking-widest">{profile?.business_name || 'My store'}</div>
        <div className="text-[11px] font-bold">Cart ({cart?.length || 0})</div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {products.map((p: Product)=><div key={p.id} onClick={()=>onOpen(p)} className="bg-white border rounded-[16px] p-2.5 cursor-pointer"><img src={p.image_url} className="w-full aspect-square object-cover rounded-[12px]" alt=""/><div className="mt-2 font-bold text-[12px]">{p.name}</div><div className="text-[12px] font-black">Rs. {p.price}</div></div>)}
      </main>
    </div>
  )
}

export default function StorePage({ params }: { params: { slug: string } }) {
  const slug = params.slug
  const [profile, setProfile] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [showCart, setShowCart] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const load = async () => {
      try {
        const { data: prof, error: profErr } = await (supabase as any).from('profiles').select('*').eq('store_slug', slug).maybeSingle()
        if(profErr) throw profErr
        if(!prof) { setLoading(false); return }
        setProfile(prof)
        const { data: prods } = await (supabase as any).from('products').select('*').eq('user_id', prof.id).order('created_at', { ascending: false })
        if(prods) setProducts(prods)

        // analytics view
        try {
          await fetch('/api/analytics', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ store_slug: slug, event_type: 'store_view', store_owner_id: prof.id }) })
        } catch {}
      } catch(e){ console.error(e) }
      setLoading(false)
    }
    if(slug) load()
  },[slug])

  const track = async (type: string, productId?: string) => {
    try {
      await fetch('/api/analytics', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ store_slug: slug, event_type: type, product_id: productId, store_owner_id: profile?.id }) })
    } catch {}
  }

  const onAdd = (p: any, q=1) => {
    const items = Array(q).fill(p)
    setCart(prev=>[...prev, ...items])
    track('add_to_cart', p.id)
  }

  const onOpen = (p: Product) => {
    setSelectedProduct(p)
    track('product_view', p.id)
  }

  // Lets customers remove an item from the cart drawer (index into the cart array)
  const onRemove = (index: number) => setCart(prev => prev.filter((_, i) => i !== index))

  if(loading) return <div className="min-h-screen bg-[#F8F7F5] grid place-items-center"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>
  if(!profile) return <div className="min-h-screen grid place-items-center bg-[#F8F7F5]"><div className="text-center"><div className="font-black text-[20px]">Store not found</div><div className="mt-2 text-[12px] opacity-60">Slug: {slug}</div><Link href="/" className="mt-4 inline-block h-9 px-4 bg-black text-white rounded-full grid place-items-center text-[12px] font-bold">Go Home</Link></div></div>

  const themeId = profile?.store_theme || 'classic'
  const isPremium = ['spike-premium','shoe-app-premium','trenzo-luxury','sleek-beige','sleek-dark','sleek-editorial'].includes(themeId)

  // ALWAYS pass premium_custom - this is the fix for your screenshot issue
  // Editor preview was new, but /s/[slug] was not reading premium_custom
  const enrichedProfile = {
    ...profile,
    premium_custom: profile?.premium_custom || {},
    business_name: profile.business_name,
    whatsapp_number: profile.whatsapp_number,
  }

  const rendererProps = {
    themeId,
    profile: enrichedProfile,
    products,
    cart,
    setShowCart,
    onAdd,
    onOpen,
    track,
    selectedProduct,
    setSelectedProduct,
    onRemove,
  }

  if(isPremium) {
    return <PremiumThemeRenderer {...rendererProps} />
  }

  return <BasicTheme profile={enrichedProfile} products={products} cart={cart} onAdd={onAdd} onOpen={onOpen} />
}
