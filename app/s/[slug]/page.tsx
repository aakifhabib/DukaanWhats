'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PremiumThemeRenderer } from '@/components/PremiumThemeRenderer'
import { STORE_THEMES, getTheme } from '@/lib/storeThemes'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  price: number
  image_url: string
  image_urls?: string[]
  description?: string
  category?: string
  user_id: string
  original_price?: number
  stock?: number
  sizes?: string[]
  colors?: string[]
  created_at?: string
}

const money = (value: number) => `Rs. ${new Intl.NumberFormat('en-PK').format(Number(value) || 0)}`

function BasicTheme({
  profile, products, cart, onAdd, onOpen, onRemove, setShowCart, showCart, selectedProduct, setSelectedProduct,
}: {
  profile: any
  products: Product[]
  cart: Product[]
  onAdd: (product: Product, quantity?: number) => void
  onOpen: (product: Product) => void
  onRemove: (index: number) => void
  setShowCart: (open: boolean) => void
  showCart: boolean
  selectedProduct: Product | null
  setSelectedProduct: (product: Product | null) => void
}) {
  const theme = getTheme(profile?.store_theme) || STORE_THEMES[0]
  const colors = theme.colors
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [sort, setSort] = useState('featured')
  const [notice, setNotice] = useState('')
  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category?.trim()).filter(Boolean) as string[]))], [products])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const rows = products.filter(p => (activeCategory === 'All' || p.category === activeCategory) && (!q || `${p.name} ${p.category || ''} ${p.description || ''}`.toLowerCase().includes(q)))
    if (sort === 'low') rows.sort((a, b) => a.price - b.price)
    if (sort === 'high') rows.sort((a, b) => b.price - a.price)
    if (sort === 'newest') rows.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    return rows
  }, [products, query, activeCategory, sort])
  const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
  const whatsapp = String(profile?.whatsapp_number || '').replace(/\D/g, '')
  const whatsappNumber = whatsapp.startsWith('0') ? `92${whatsapp.slice(1)}` : whatsapp

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 2200)
    return () => window.clearTimeout(timer)
  }, [notice])

  const addToCart = (product: Product) => {
    if (product.stock === 0) return
    onAdd(product)
    setNotice(`${product.name} added to your bag`)
  }

  const placeOrder = () => {
    if (!whatsappNumber || cart.length === 0) return
    const counts = new Map<string, { product: Product; quantity: number }>()
    cart.forEach(product => {
      const entry = counts.get(product.id)
      counts.set(product.id, { product, quantity: (entry?.quantity || 0) + 1 })
    })
    const lines = [...counts.values()].map(({ product, quantity }) => `• ${product.name} × ${quantity} — ${money(product.price * quantity)}`)
    const message = `Hi ${profile?.business_name || 'there'}! I'd like to place an order:\n\n${lines.join('\n')}\n\nTotal: ${money(total)}`
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen" style={{ background: colors.bg, color: colors.text }}>
      <div className="h-1" style={{ background: colors.accent }} />
      <header className="sticky top-0 z-30 border-b backdrop-blur-xl" style={{ background: `${colors.bg}ed`, borderColor: colors.border }}>
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <a href="#top" className="min-w-0">
            <span className="block truncate text-[15px] font-black tracking-[-0.04em] sm:text-[17px]">{profile?.business_name || 'My store'}</span>
          </a>
          <div className="flex items-center gap-2">
            {profile?.instagram && <a href={`https://instagram.com/${String(profile.instagram).replace(/^@/, '')}`} target="_blank" rel="noreferrer" className="hidden h-10 items-center rounded-full border px-4 text-xs font-semibold transition hover:-translate-y-0.5 sm:inline-flex" style={{ borderColor: colors.border }}>Instagram ↗</a>}
            <button type="button" onClick={() => setShowCart(true)} title="Open your shopping bag" className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-bold transition hover:-translate-y-0.5" style={{ background: colors.text, color: colors.bg }} aria-label={`Open bag with ${cart.length} items`}>
              <span>Bag</span><span className="grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px]" style={{ background: colors.accent, color: colors.text }}>{cart.length}</span>
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-20 blur-3xl" style={{ background: colors.accent }} />
          <div className="relative max-w-3xl">
            <h1 className="text-[clamp(42px,8vw,88px)] font-black leading-[0.9] tracking-[-0.075em]">Discover<br /><span style={{ color: colors.accent }}>{profile?.business_name || 'our store'}.</span></h1>
            <p className="mt-6 max-w-xl text-sm leading-7 opacity-65 sm:text-base">Browse products and message us to order.</p>
            <a href="#collection" className="mt-8 inline-flex h-12 items-center gap-3 rounded-full px-6 text-sm font-bold transition hover:-translate-y-0.5" style={{ background: colors.text, color: colors.bg }}>Browse products <span aria-hidden>↓</span></a>
          </div>
        </section>

        <section id="collection" className="scroll-mt-24">
          <div className="flex flex-col gap-5 border-y py-5 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: colors.border }}>
            <h2 className="text-2xl font-black tracking-[-0.05em] sm:text-3xl">Products</h2>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor="store-search">Search products</label>
              <input id="store-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products" className="h-11 w-full rounded-xl border bg-transparent px-4 text-sm outline-none transition focus:ring-2 sm:w-56" style={{ borderColor: colors.border, ['--tw-ring-color' as any]: colors.accent }} />
              <label className="sr-only" htmlFor="store-sort">Sort products</label>
              <select id="store-sort" value={sort} onChange={e => setSort(e.target.value)} className="h-11 rounded-xl border bg-transparent px-3 text-sm outline-none" style={{ borderColor: colors.border, color: colors.text }}>
                <option value="featured">Featured</option><option value="newest">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option>
              </select>
            </div>
          </div>

          {categories.length > 1 && <div className="flex gap-2 overflow-x-auto py-4" aria-label="Product categories">
            {categories.map(category => <button key={category} type="button" onClick={() => setActiveCategory(category)} aria-pressed={activeCategory === category} className="shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition" style={{ borderColor: activeCategory === category ? colors.text : colors.border, background: activeCategory === category ? colors.text : 'transparent', color: activeCategory === category ? colors.bg : colors.text }}>{category}</button>)}
          </div>}

          {filtered.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-7 pt-3 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4">
            {filtered.map((product, index) => <article key={product.id} className="group min-w-0">
              <button type="button" onClick={() => onOpen(product)} className="relative block w-full overflow-hidden rounded-2xl text-left" style={{ background: colors.card }} aria-label={`View ${product.name}`}>
                <div className="aspect-[4/5] overflow-hidden">
                  {product.image_url ? <img src={product.image_url} alt={product.name} loading={index < 4 ? 'eager' : 'lazy'} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="grid h-full place-items-center text-sm opacity-40">No image yet</div>}
                </div>
                {product.original_price && product.original_price > product.price && <span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: colors.accent, color: colors.text }}>SALE</span>}
                {product.stock === 0 && <span className="absolute inset-0 grid place-items-center bg-black/45 text-xs font-bold uppercase tracking-[0.2em] text-white">Sold out</span>}
              </button>
              <div className="flex items-start justify-between gap-2 px-0.5 pt-3">
                <div className="min-w-0"><button type="button" onClick={() => onOpen(product)} className="block max-w-full truncate text-left text-sm font-bold">{product.name}</button><div className="mt-1 text-[10px] uppercase tracking-[0.14em] opacity-50">{product.category || 'Collection'}</div></div>
                <div className="shrink-0 text-right"><div className="text-xs font-bold">{money(product.price)}</div>{product.original_price && product.original_price > product.price && <div className="text-[10px] opacity-45 line-through">{money(product.original_price)}</div>}</div>
              </div>
              <button type="button" onClick={() => addToCart(product)} disabled={product.stock === 0} className="mt-3 h-10 w-full rounded-xl border text-xs font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45" style={{ borderColor: colors.border }}>{product.stock === 0 ? 'Unavailable' : 'Add to bag +'}</button>
            </article>)}
          </div> : <div className="my-10 rounded-3xl border px-5 py-16 text-center" style={{ borderColor: colors.border }}><div className="text-2xl font-black tracking-tight">{products.length ? 'No matches this time' : 'The collection is on its way'}</div><p className="mt-2 text-sm opacity-60">{products.length ? 'Try a different search or category.' : 'Check back soon for new arrivals.'}</p>{products.length > 0 && <button type="button" onClick={() => { setQuery(''); setActiveCategory('All') }} className="mt-5 text-sm font-bold underline underline-offset-4">Clear filters</button>}</div>}
        </section>

      </main>

      <footer className="border-t px-4 py-8 text-center" style={{ borderColor: colors.border }}><div className="text-xs opacity-60">Contact on WhatsApp{profile?.whatsapp_number ? ` · ${profile.whatsapp_number}` : ''}</div></footer>

      {notice && <div role="status" className="fixed bottom-5 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-black px-5 py-3 text-xs font-semibold text-white shadow-2xl">{notice}</div>}

      {selectedProduct && <div className="fixed inset-0 z-[85] grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${selectedProduct.name} details`} onMouseDown={e => { if (e.target === e.currentTarget) setSelectedProduct(null) }}>
        <div className="relative my-auto grid w-full max-w-3xl overflow-hidden rounded-3xl shadow-2xl md:grid-cols-2" style={{ background: colors.bg, color: colors.text }}>
          <button type="button" onClick={() => setSelectedProduct(null)} className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/70 text-xl text-white" aria-label="Close product details">×</button>
          <div className="aspect-[4/3] bg-black/5 md:aspect-auto md:min-h-[480px]">{selectedProduct.image_url && <img src={selectedProduct.image_url} alt={selectedProduct.name} className="h-full w-full object-cover" />}</div>
          <div className="flex flex-col p-6 sm:p-8">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-55">{selectedProduct.category || 'Collection'}</div>
            <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-0.06em]">{selectedProduct.name}</h2>
            <div className="mt-4 flex items-baseline gap-3"><span className="text-lg font-bold">{money(selectedProduct.price)}</span>{selectedProduct.original_price && selectedProduct.original_price > selectedProduct.price && <span className="text-sm opacity-45 line-through">{money(selectedProduct.original_price)}</span>}</div>
            {selectedProduct.description && <p className="mt-5 text-sm leading-7 opacity-65">{selectedProduct.description}</p>}
            {selectedProduct.sizes?.length ? <div className="mt-5"><div className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-55">Available sizes</div><div className="mt-2 flex flex-wrap gap-2">{selectedProduct.sizes.map(size => <span key={size} className="rounded-lg border px-3 py-2 text-xs" style={{ borderColor: colors.border }}>{size}</span>)}</div></div> : null}
            {selectedProduct.colors?.length ? <div className="mt-4"><div className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-55">Available colours</div><div className="mt-2 flex flex-wrap gap-2">{selectedProduct.colors.map(color => <span key={color} className="rounded-full border px-3 py-1.5 text-xs" style={{ borderColor: colors.border }}>{color}</span>)}</div></div> : null}
            <div className="mt-auto pt-8"><button type="button" disabled={selectedProduct.stock === 0} onClick={() => { addToCart(selectedProduct); setSelectedProduct(null) }} className="h-12 w-full rounded-xl text-sm font-bold disabled:opacity-45" style={{ background: colors.text, color: colors.bg }}>{selectedProduct.stock === 0 ? 'Sold out' : 'Add to bag'}</button><button type="button" onClick={() => setSelectedProduct(null)} className="mt-3 h-11 w-full rounded-xl border text-sm font-semibold" style={{ borderColor: colors.border }}>Keep browsing</button></div>
          </div>
        </div>
      </div>}

      {showCart && <div className="fixed inset-0 z-[90] flex justify-end" role="dialog" aria-modal="true" aria-label="Your shopping bag">
        <button type="button" className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={() => setShowCart(false)} aria-label="Close shopping bag" />
        <div className="relative flex h-full w-full max-w-md flex-col shadow-2xl" style={{ background: colors.bg, color: colors.text }}>
          <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: colors.border }}><div><div className="text-xs font-bold uppercase tracking-[0.18em] opacity-55">Your selection</div><h2 className="mt-1 text-xl font-black">Shopping bag <span className="text-sm opacity-50">({cart.length})</span></h2></div><button type="button" onClick={() => setShowCart(false)} className="grid h-10 w-10 place-items-center rounded-full border text-xl" style={{ borderColor: colors.border }} aria-label="Close bag">×</button></div>
          {cart.length ? <>
            <div className="flex-1 overflow-y-auto px-5 py-3">{cart.map((item, index) => <div key={`${item.id}-${index}`} className="flex gap-3 border-b py-4" style={{ borderColor: colors.border }}>
              {item.image_url ? <img src={item.image_url} alt="" className="h-20 w-16 rounded-xl object-cover" /> : <div className="h-20 w-16 rounded-xl" style={{ background: colors.card }} />}
              <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{item.name}</div><div className="mt-1 text-xs opacity-60">{money(item.price)}</div><button type="button" onClick={() => onRemove(index)} className="mt-3 text-[11px] font-semibold underline underline-offset-2 opacity-60">Remove</button></div><div className="pt-1 text-xs font-bold">{money(item.price)}</div>
            </div>)}</div>
            <div className="border-t px-5 py-5" style={{ borderColor: colors.border }}><div className="flex justify-between text-sm"><span className="opacity-60">Subtotal</span><strong>{money(total)}</strong></div><p className="mt-2 text-[11px] opacity-55">Delivery and final details can be confirmed in chat.</p><button type="button" onClick={placeOrder} disabled={!whatsappNumber} className="mt-4 h-12 w-full rounded-xl text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50" style={{ background: colors.text, color: colors.bg }}>{whatsappNumber ? 'Continue on WhatsApp ↗' : 'WhatsApp number unavailable'}</button></div>
          </> : <div className="flex flex-1 flex-col items-center justify-center px-8 text-center"><div className="grid h-16 w-16 place-items-center rounded-full text-2xl" style={{ background: colors.card }}>✦</div><div className="mt-5 text-lg font-black">Your bag is waiting</div><p className="mt-2 text-sm opacity-60">Add something lovely from the collection.</p><button type="button" onClick={() => setShowCart(false)} className="mt-5 rounded-full px-5 py-2.5 text-xs font-bold" style={{ background: colors.text, color: colors.bg }}>Explore products</button></div>}
        </div>
      </div>}
    </div>
  )
}

export default function StorePage({ params }: { params: { slug: string } }) {
  const slug = params.slug
  const [profile, setProfile] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Product[]>([])
  const [showCart, setShowCart] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: prof, error: profErr } = await (supabase as any).from('profiles').select('*').eq('store_slug', slug).maybeSingle()
        if (profErr) throw profErr
        if (!prof) { setLoading(false); return }
        setProfile(prof)
        const { data: prods } = await (supabase as any).from('products').select('*').eq('user_id', prof.id).order('created_at', { ascending: false })
        if (prods) setProducts(prods)
        try {
          await fetch('/api/analytics/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ store_slug: slug, event_type: 'store_view', store_owner_id: prof.id }) })
        } catch {}
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    if (slug) load()
  }, [slug])

  const track = async (type: string, productId?: string) => {
    try {
      await fetch('/api/analytics/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ store_slug: slug, event_type: type, product_id: productId, store_owner_id: profile?.id }) })
    } catch {}
  }

  const onAdd = (product: Product, quantity = 1) => {
    setCart(prev => [...prev, ...Array(quantity).fill(product)])
    track('add_to_cart', product.id)
  }
  const onOpen = (product: Product) => { setSelectedProduct(product); track('product_view', product.id) }
  const onRemove = (index: number) => setCart(prev => prev.filter((_, i) => i !== index))

  if (loading) return <div className="min-h-screen bg-[#F8F7F5] grid place-items-center" role="status" aria-label="Loading store"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>
  if (!profile) return <div className="min-h-screen grid place-items-center bg-[#F8F7F5] p-5"><div className="text-center"><div className="font-black text-[20px]">Store not found</div><div className="mt-2 text-[12px] opacity-60">We couldn’t find a store at /s/{slug}</div><Link href="/" className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-[12px] font-bold text-white">Go Home</Link></div></div>

  const themeId = profile?.store_theme || 'classic'
  const isPremium = ['spike-premium', 'shoe-app-premium', 'trenzo-luxury', 'sleek-beige', 'sleek-dark', 'sleek-editorial', 'saffron-table', 'atelier-bloom', 'mono-market', 'noir-gilt'].includes(themeId)
  const enrichedProfile = { ...profile, premium_custom: profile?.premium_custom || {}, business_name: profile.business_name, whatsapp_number: profile.whatsapp_number }
  const rendererProps = { themeId, profile: enrichedProfile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct, onRemove }

  if (isPremium) return <PremiumThemeRenderer {...rendererProps} />
  return <BasicTheme profile={enrichedProfile} products={products} cart={cart} onAdd={onAdd} onOpen={onOpen} onRemove={onRemove} showCart={showCart} setShowCart={setShowCart} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} />
}
