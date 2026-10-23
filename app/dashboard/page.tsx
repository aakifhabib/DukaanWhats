'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STORE_THEMES, getTheme, ThemeCategory, getAdvancedThemes } from '@/lib/storeThemes'

type Profile = { id: string; business_name: string; whatsapp_number: string; store_slug: string; store_theme?: string }
type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; user_id: string }
type PlanId = 'basic' | 'advanced' | 'premium'

const TILL_ID = '984837533'

const PLAN_LIMITS = {
  basic: { maxProducts: 5, maxImages: 1, advancedAllowed: 3, name: 'BASIC' },
  advanced: { maxProducts: 25, maxImages: 5, advancedAllowed: 8, name: 'ADVANCED' },
  premium: { maxProducts: 9999, maxImages: 10, advancedAllowed: 8, name: 'PREMIUM' },
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [businessName, setBusinessName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [slug, setSlug] = useState('')
  const [theme, setTheme] = useState('clothing-noor')
  const [saved, setSaved] = useState(false)
  const [prodName, setProdName] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [filter, setFilter] = useState<ThemeCategory | 'all' | string>('all')
  const [currentPlan, setCurrentPlan] = useState<PlanId>('basic')
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      let { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!prof) {
        const metaName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'My Store'
        const baseSlug = metaName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20) || `store-${user.id.slice(0,6)}`
        let finalSlug = baseSlug
        const { data: existing } = await supabase.from('profiles').select('id').eq('store_slug', baseSlug).single()
        if (existing) finalSlug = `${baseSlug}-${Math.floor(Math.random()*900+100)}`
        const newProfile = { id: user.id, business_name: metaName, whatsapp_number: '', store_slug: finalSlug, store_theme: 'clothing-noor' }
        const { data: created } = await supabase.from('profiles').insert(newProfile).select().single()
        if (created) prof = created
      }

      if (prof) {
        setProfile(prof)
        setBusinessName(prof.business_name || '')
        setWhatsapp(prof.whatsapp_number || '')
        setSlug(prof.store_slug || '')
        setTheme(prof.store_theme || 'clothing-noor')
        const { data: prods } = await supabase.from('products').select('*').eq('user_id', prof.id).order('created_at', { ascending: false })
        if (prods) setProducts(prods)
      }

      // Get plan - check approved payments
      const { data: payment } = await supabase.from('plan_payments').select('plan_id').eq('user_id', user.id).eq('status', 'approved').order('created_at', { ascending: false }).limit(1).single()
      if (payment) setCurrentPlan(payment.plan_id as PlanId)

      setLoading(false)
    }
    init()
  }, [])

  const limits = PLAN_LIMITS[currentPlan]
  const standardThemes = STORE_THEMES.filter(t => t.category !== 'advanced')
  const advancedThemesAll = getAdvancedThemes()
  const advancedThemes = currentPlan === 'basic' ? advancedThemesAll.slice(0, limits.advancedAllowed) : advancedThemesAll
  const filtered = (filter as string) === 'all' ? standardThemes : (filter as string) === 'advanced' ? [] : STORE_THEMES.filter(t => (t.category as string) === (filter as string) && t.category !== 'advanced')

  const isThemeLocked = (themeId: string) => {
    const t = STORE_THEMES.find(x => x.id === themeId)
    if (!t || t.category !== 'advanced') return false
    if (currentPlan === 'premium') return false
    if (currentPlan === 'advanced') return false
    const idx = advancedThemesAll.findIndex(x => x.id === themeId)
    return idx >= limits.advancedAllowed
  }

  const saveStore = async () => {
    if (!profile) return
    if (isThemeLocked(theme)) { alert(`Theme locked on ${limits.name}. Upgrade to Advanced (Till ${TILL_ID}) for all 8 advanced themes.`); return }
    const { error } = await supabase.from('profiles').update({
      business_name: businessName,
      whatsapp_number: whatsapp,
      store_slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      store_theme: theme
    }).eq('id', profile.id)
    if (!error) { setSaved(true); setTimeout(()=>setSaved(false), 2500) }
    else { alert(error.message) }
  }

  const copyLink = async () => { await navigator.clipboard.writeText(`https://dukaan-whats.vercel.app/s/${slug}`); setCopied(true); setTimeout(()=>setCopied(false), 2000) }
  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  const handleFile = (e: any) => {
    const sel = Array.from(e.target.files || []) as File[]
    if (sel.length > limits.maxImages) { alert(`${limits.name}: Max ${limits.maxImages} image${limits.maxImages>1?'s':''} per product. Upgrade for more.`); return }
    setFiles(sel.slice(0, limits.maxImages))
    setPreviews(sel.slice(0, limits.maxImages).map(f=>URL.createObjectURL(f)))
  }

  const uploadOne = async (file: File) => {
    if (!profile) return ''
    const name = `${profile.id}/${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage.from('product-images').upload(name, file)
    if (error||!data) return ''
    return supabase.storage.from('product-images').getPublicUrl(name).data.publicUrl
  }

  const addProduct = async () => {
    if (products.length >= limits.maxProducts) { alert(`${limits.name} plan: ${limits.maxProducts} products max. Upgrade to add more.\nTill ID: ${TILL_ID}`); router.push('/pricing'); return }
    if (!profile || !prodName || !prodPrice || files.length===0){ alert('Name, price, photo required'); return }
    setUploading(true)
    try{
      const urls = (await Promise.all(files.map(uploadOne))).filter(Boolean)
      if (!urls.length) throw new Error('Upload failed')
      let { data, error } = await supabase.from('products').insert({ user_id: profile.id, name: prodName, price: Number(prodPrice), image_url: urls[0], image_urls: urls }).select().single()
      if (error && error.message.includes('image_urls')) {
        const fb = await supabase.from('products').insert({ user_id: profile.id, name: prodName, price: Number(prodPrice), image_url: urls[0] }).select().single()
        data=fb.data; error=fb.error
      }
      if (error) throw error
      if (data) setProducts([data,...products])
      setProdName(''); setProdPrice(''); setFiles([]); setPreviews([])
    }catch(e:any){ alert(e.message) }
    setUploading(false)
  }

  const deleteProduct = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('products').delete().eq('id', id); setProducts(products.filter(p=>p.id!==id)) }

  if (loading) return <div style={{minHeight:'100vh',background:'#F8F7F5',display:'flex',alignItems:'center',justifyContent:'center'}} className="text-">Loading store...</div>

  return (
    <div style={{minHeight:'100vh',background:'#F8F7F5'}} className="text-zinc-900 pb-24">
      <style>{`
        .glass-container { position: relative; display: flex; justify-content: center; }
        .glass-card { background: rgba(7,5,46,0.92); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        .radio-container{--main-color:#E8FF86;--total-radio:3;display:flex;flex-direction:column;position:relative;padding-left:1rem}
        .radio-container input{appearance:none;position:absolute;opacity:0}
        .radio-container .glider-container{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(0deg,transparent 0%,rgba(255,255,255,0.15) 50%,transparent 100%);width:1px}
        .radio-container .glider{position:relative;height:calc(100% / var(--total-radio));width:100%;background:linear-gradient(0deg,transparent 0%,var(--main-color) 50%,transparent 100%);transition:transform .5s cubic-bezier(0.37,1.95,0.66,0.56)}
        .radio-container .glider::before{content:"";position:absolute;height:60%;width:300%;top:50%;transform:translateY(-50%);background:var(--main-color);filter:blur(10px)}
        .radio-container label{cursor:pointer;padding:10px;border-radius:10px;color:rgba(255,255,255,0.5);transition:all .3s}
        .radio-container input:checked+label{color:#fff;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12)}
        .radio-container input:nth-of-type(1):checked~.glider-container .glider{transform:translateY(0)}
        .radio-container input:nth-of-type(2):checked~.glider-container .glider{transform:translateY(100%)}
        .radio-container input:nth-of-type(3):checked~.glider-container .glider{transform:translateY(200%)}
      `}</style>

      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2"><div style={{borderRadius:10}} className="w-9 h-9 bg-black text-white flex items-center justify-center font-bold">D</div><span className="font-semibold">DukaanWhats.pk</span><span style={{borderRadius:999}} className="ml-2 px-2.5 py-0.5 bg-black text-white text- font-bold tracking-widest">{limits.name} • {products.length}/{limits.maxProducts}</span></Link>
          <div className="flex items-center gap-2">
            <button onClick={copyLink} style={{borderRadius:10}} className="h-10 px-4 border bg-white text- font-medium hover:bg-zinc-50">{copied?'Copied!':'Copy Link'}</button>
            <Link href={`/s/${slug}`} target="_blank" style={{borderRadius:10}} className="h-10 px-5 bg-black text-white text- font-medium flex items-center">View Store ↗</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {/* STORE IDENTITY */}
        <div style={{borderRadius:20}} className="bg-white border p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-">Store Identity • {limits.name} Plan</h2>
            <div className="flex items-center gap-2">
              <span className="text- text-zinc-500">{limits.maxProducts} products • {limits.maxImages} img • {limits.advancedAllowed} advanced themes</span>
              {saved && <span className="px-2.5 py-1 rounded-full bg-[#E8FF86] text- font-bold">Saved ✓ {getTheme(theme).name}</span>}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mt-5">
            <input value={businessName} onChange={e=>setBusinessName(e.target.value)} placeholder="Business Name" style={{borderRadius:12}} className="h-11 px-4 border bg-zinc-50 text- focus:outline-none focus:ring-2 focus:ring-black" />
            <input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="store-slug" style={{borderRadius:12}} className="h-11 px-4 border bg-zinc-50 font-mono text- focus:outline-none focus:ring-2 focus:ring-black" />
            <input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="92300..." style={{borderRadius:12}} className="h-11 px-4 border bg-zinc-50 text- focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
        </div>

        {/* THEMES */}
        <div style={{borderRadius:20}} className="bg-white border overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="font-semibold text-">Themes • {currentPlan==='basic' ? `${limits.advancedAllowed} Advanced Unlocked` : 'All Unlocked'}</h2>
            <div className="flex gap-1">
              <button onClick={()=>setFilter('all')} style={{borderRadius:10}} className={`h-8 px-3 text- border ${filter==='all'?'bg-black text-white':'bg-white'}`}>All</button>
              <button onClick={()=>setFilter('clothing')} style={{borderRadius:10}} className={`h-8 px-3 text- border ${filter==='clothing'?'bg-black text-white':'bg-white'}`}>Clothing</button>
              <button onClick={()=>setFilter('electronics')} style={{borderRadius:10}} className={`h-8 px-3 text- border ${filter==='electronics'?'bg-black text-white':'bg-white'}`}>Electronics</button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {filtered.map(t => {
                const isActive = theme===t.id
                return (
                  <button key={t.id} onClick={()=>setTheme(t.id)} style={{borderRadius:14}} className={`p-3 text-left border-2 transition ${isActive?'border-black bg-zinc-50':'border-zinc-100 hover:border-zinc-200'}`}>
                    <div style={{borderRadius:8, background: t.colors.bg, border: `1px solid ${t.colors.border}`}} className="h-20 p-2"><div style={{height:6, background: t.colors.text, opacity:0.8, borderRadius:4}} /></div>
                    <div className="mt-2 flex items-center gap-1.5"><span className="text-">{t.badge}</span><span className="text- font-medium">{t.name}</span>{isActive && <span className="ml-auto w-4 h-4 bg-black text-white rounded-full flex items-center justify-center text-">✓</span>}</div>
                  </button>
                )
              })}
            </div>

            {/* ADVANCED THEMES - GLASS PANEL - PREMIUM DESIGN */}
            <div className="mt-6 glass-container">
              <div className="glass-card w-full p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text- tracking-[0.2em] uppercase text-white/40">ADVANCED THEMES • {currentPlan==='basic' ? `${limits.advancedAllowed} UNLOCKED` : 'ALL UNLOCKED'} • TILL {TILL_ID}</div>
                  <Link href="/pricing" style={{borderRadius:999}} className="h-7 px-3 bg-[#E8FF86] text-black text- font-bold flex items-center">Upgrade →</Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {advancedThemesAll.map(t => {
                    const locked = isThemeLocked(t.id)
                    const isActive = theme===t.id
                    return (
                      <button key={t.id} disabled={locked} onClick={()=>!locked && setTheme(t.id)} style={{borderRadius:12}} className={`p-3 text-left border transition relative ${locked ? 'opacity-40 border-white/5 bg-white/[0.02] cursor-not-allowed' : isActive ? 'border-[#E8FF86] bg-[#E8FF86]/10' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.06]'}`}>
                        <div style={{borderRadius:8, background: t.colors.bg}} className="h-16" />
                        <div className="mt-2 text- text-white/80 flex items-center gap-1">{t.badge} {t.name} {locked && <span className="text- px-1.5 py-0.5 rounded-full bg-white/10">LOCKED</span>}</div>
                        {isActive && <div className="absolute top-2 right-2 w-4 h-4 bg-[#E8FF86] rounded-full flex items-center justify-center text- text-black font-bold">✓</div>}
                      </button>
                    )
                  })}
                </div>
                {currentPlan==='basic' && <div className="mt-3 text-center text- text-white/40">Basic: 3 Advanced Themes only • Advanced: All 8 Advanced • Till {TILL_ID}</div>}
              </div>
            </div>

            <div className="flex justify-end pt-6"><button onClick={saveStore} style={{borderRadius:10}} className="h-11 px-6 bg-black text-white text- font-medium hover:bg-zinc-800">Save Store & Theme</button></div>
          </div>
        </div>

        {/* ADD PRODUCT */}
        <div style={{borderRadius:20}} className="bg-white border overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="font-semibold text-">Add Product — {limits.maxImages} image{limits.maxImages>1?'s':''} max • {products.length}/{limits.maxProducts}</h2>
            {products.length >= limits.maxProducts && <Link href="/pricing" style={{borderRadius:999}} className="h-7 px-3 bg-red-50 text-red-600 border border-red-100 text- font-medium flex items-center">Limit Reached — Upgrade Till {TILL_ID}</Link>}
          </div>
          <div className="p-6 space-y-4">
            <label style={{borderRadius:14}} className="border-2 border-dashed p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 transition min-h-">{previews.length ? <div className="grid grid-cols-3 gap-2 w-full">{previews.map((src,i)=><img key={i} src={src} style={{borderRadius:10}} className="w-full h- object-cover border" />)}</div> : <><div style={{borderRadius:10}} className="w-10 h-10 border flex items-center justify-center text-lg">+</div><div className="mt-2 font-medium text-">Upload up to {limits.maxImages} photo{limits.maxImages>1?'s':''}</div><div className="text- text-zinc-500 mt-1">{limits.name} plan • Till {TILL_ID}</div></>}<input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" /></label>
            <div className="grid md:grid-cols-2 gap-3">
              <input placeholder="Product name" value={prodName} onChange={e=>setProdName(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border focus:outline-none focus:ring-2 focus:ring-black text-" />
              <input placeholder="Price Rs." type="number" value={prodPrice} onChange={e=>setProdPrice(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border focus:outline-none focus:ring-2 focus:ring-black text-" />
            </div>
            <div className="flex justify-end"><button onClick={addProduct} disabled={uploading || products.length>=limits.maxProducts} style={{borderRadius:10}} className="h-10 px-5 bg-black text-white text- font-medium hover:bg-zinc-800 disabled:opacity-50">{uploading ? 'Adding...' : `Add Product ${files.length?`(${files.length})`:''}`}</button></div>
          </div>
        </div>

        {products.length > 0 && (<div><h3 className="font-semibold text- mb-3">Your Products ({products.length}/{limits.maxProducts})</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{products.map(p => (<div key={p.id} style={{borderRadius:20}} className="group bg-white border p-3 relative"><div className="relative"><img src={p.image_url} style={{borderRadius:12}} className="w-full h-36 object-cover" />{p.image_urls && p.image_urls.length > 1 && <span style={{borderRadius:999}} className="absolute top-2 left-2 bg-black/70 text-white text- px-2 py-0.5">+{p.image_urls.length}</span>}</div><div className="mt-3"><div className="font-medium text- truncate">{p.name}</div><div className="text- font-bold">Rs. {p.price}</div></div><button onClick={()=>deleteProduct(p.id)} style={{borderRadius:10}} className="absolute top-2 right-2 w-8 h-8 bg-white shadow border flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 hover:bg-red-50">🗑</button></div>))}</div></div>)}
      </main>

      <button onClick={logout} style={{borderRadius:999}} className="fixed bottom-6 right-6 z-50 h-11 px-6 bg-white border border-zinc-200 shadow-lg text- font-medium hover:bg-zinc-50 flex items-center gap-2"><span>Logout</span><span>↗</span></button>
    </div>
  )
}
