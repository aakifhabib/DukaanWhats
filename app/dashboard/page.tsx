'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STORE_THEMES, getTheme, getAdvancedThemes } from '@/lib/storeThemes'
import { DukaanWhatsLoader } from '@/components/DukaanWhatsLoader'

const TILL_ID = '984837533'
type Profile = { id: string; business_name: string; whatsapp_number: string; store_slug: string; store_theme?: string; current_plan?: string }
type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; user_id: string }
type Billing = 'monthly' | 'yearly'
type PlanDef = { id: 'basic'|'advanced'|'premium'; name: string; monthly: number; yearlyMonthly: number; yearlyTotal: number; products: number; imagesPerProduct: number }

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [slug, setSlug] = useState('')
  const [theme, setTheme] = useState('clothing-noor')
  const [saved, setSaved] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [prodName, setProdName] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'store'|'themes'|'products'|'payments'>('themes')
  const [selectedPlan, setSelectedPlan] = useState<PlanDef | null>(null)
  const [billing, setBilling] = useState<Billing>('monthly')
  const [txnId, setTxnId] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const [copiedTill, setCopiedTill] = useState(false)
  const router = useRouter()

  const plans: PlanDef[] = [
    { id: 'basic', name: 'Basic', monthly: 0, yearlyMonthly: 0, yearlyTotal: 0, products: 5, imagesPerProduct: 1 },
    { id: 'advanced', name: 'Advanced', monthly: 899, yearlyMonthly: 699, yearlyTotal: 8388, products: 25, imagesPerProduct: 5 },
    { id: 'premium', name: 'Premium', monthly: 2999, yearlyMonthly: 2499, yearlyTotal: 29988, products: 999999, imagesPerProduct: 999999 },
  ]

  const currentPlanId = (profile?.current_plan || 'basic') as 'basic'|'advanced'|'premium'
  const currentPlanDef = plans.find(p=>p.id===currentPlanId) || plans[0]
  const isPremium = currentPlanId === 'premium'
  const isAdvanced = currentPlanId === 'advanced' || isPremium
  const productLimit = currentPlanDef.products
  const imageLimit = currentPlanDef.imagesPerProduct

  const premiumThemes = getAdvancedThemes()
  const premiumIds = premiumThemes.map(t=>t.id)
  const allAdvancedRaw = STORE_THEMES.filter(t => (t.category as string) === 'advanced' && !premiumIds.includes(t.id))
  const advancedThemesList = allAdvancedRaw.length >= 8 ? allAdvancedRaw.slice(0,8) : [...allAdvancedRaw, ...STORE_THEMES.filter(t=>!premiumIds.includes(t.id)).slice(0, 8 - allAdvancedRaw.length)]
  const finalAdvancedList = advancedThemesList.length ? advancedThemesList : STORE_THEMES.filter(t=>!premiumIds.includes(t.id)).slice(0,8)
  const basicAllowedAdvancedIds = finalAdvancedList.slice(0,3).map(t=>t.id)

  const isPremiumTheme = (t: any) => premiumIds.includes(t.id) || (t.category as string) === 'premium'
  const isAdvancedTheme = (t: any) => finalAdvancedList.some(a=>a.id===t.id) || (t.category as string) === 'advanced'
  const isThemeLocked = (t: any) => {
    if (isPremium) return false
    if (isPremiumTheme(t)) return true
    if (isAdvancedTheme(t)) {
      if (isAdvanced) return false
      return !basicAllowedAdvancedIds.includes(t.id)
    }
    return false
  }

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { window.location.href = '/login'; return }
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { window.location.href = '/login'; return }
        let { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
        if (!prof) {
          const metaName = user.email?.split('@')[0] || 'My Store'
          const baseSlug = metaName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0,20)
          const newProfile = { id: user.id, business_name: metaName, whatsapp_number: '', store_slug: `${baseSlug}-${Math.floor(Math.random()*900+100)}`, store_theme: 'clothing-noor', current_plan: 'basic' }
          const { data: created } = await supabase.from('profiles').upsert(newProfile, { onConflict: 'id' }).select().single()
          prof = created || newProfile as any
        }
        if (prof) {
          setProfile(prof); setBusinessName(prof.business_name || ''); setWhatsapp(prof.whatsapp_number || ''); setSlug(prof.store_slug || ''); setTheme(prof.store_theme || 'clothing-noor')
          const { data: prods } = await supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
          if (prods) setProducts(prods)
        }
      } catch (e: any) { setErrorMsg(e.message) }
      setTimeout(()=>setLoading(false), 700)
    }
    init()
  }, [])

  const handleThemeClick = (t: any) => {
    if (isThemeLocked(t)) { setActiveTab('payments'); return }
    setTheme(t.id)
  }
  const saveStore = async () => {
    if (!profile) return; setSaving(true)
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-')
    const { data, error } = await supabase.from('profiles').upsert({ id: profile.id, business_name: businessName.trim(), whatsapp_number: whatsapp.trim(), store_slug: cleanSlug, store_theme: theme }, { onConflict: 'id' }).select().single()
    if (error) setErrorMsg(error.message); else { setProfile(data); setSlug(cleanSlug); setSaved(true); setTimeout(()=>setSaved(false), 3000) }
    setSaving(false)
  }
  const copyLink = async () => { await navigator.clipboard.writeText(`${window.location.origin}/s/${slug}`); setCopied(true); setTimeout(()=>setCopied(false), 2000) }
  const copyTill = async () => { await navigator.clipboard.writeText(TILL_ID); setCopiedTill(true); setTimeout(()=>setCopiedTill(false), 2000) }
  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }
  const handleFile = (e: any) => {
    const sel = Array.from(e.target.files || []) as File[]
    const limit = imageLimit===999999?20:imageLimit
    if (sel.length>limit){ alert(`Your ${currentPlanId.toUpperCase()} allows ${limit} images`); return }
    setFiles(sel); setPreviews(sel.map(f=>URL.createObjectURL(f)))
  }
  const uploadOne = async (file: File, userId: string) => {
    const name = `${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g,'_')}`
    const { error } = await supabase.storage.from('product-images').upload(name, file)
    if (error) throw error; return supabase.storage.from('product-images').getPublicUrl(name).data.publicUrl
  }
  const addProduct = async () => {
    if (products.length >= productLimit){ alert(`Limit: ${productLimit} products. Upgrade needed.`); setActiveTab('payments'); return }
    if (!prodName.trim() || !prodPrice || files.length===0){ alert('Name, price, photo required'); return }
    setUploading(true)
    try{
      const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Not logged in')
      const urls = []; for (const f of files){ urls.push(await uploadOne(f, user.id)) }
      const { data } = await supabase.from('products').insert({ user_id: user.id, name: prodName.trim(), price: Number(prodPrice), image_url: urls[0], image_urls: urls }).select().single()
      if (data) setProducts([data, ...products]); setProdName(''); setProdPrice(''); setFiles([]); setPreviews([]); setActiveTab('products')
    }catch(e:any){ setErrorMsg(e.message) } setUploading(false)
  }
  const deleteProduct = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('products').delete().eq('id', id); setProducts(products.filter(p=>p.id!==id)) }

  if (loading) return <DukaanWhatsLoader message="Loading your store..." />

  return (
    <div style={{minHeight:'100vh',background:'#F8F7F5'}} className="text-zinc-900 pb-24">
      <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        .glass-container { display:flex; justify-content:center; align-items:center; min-height:340px; padding:30px 0; }
        .glass-container .glass { width:260px; height:320px; background:linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 100%); border:1px solid rgba(255,255,255,0.18); border-radius:20px; margin:0 -50px; backdrop-filter:blur(18px); transform:rotate(calc(var(--r) * 1deg)); transition:all 0.5s; cursor:pointer; overflow:hidden; padding-top:16px; position:relative }
        .glass-container .glass:hover { transform:rotate(0deg) translateY(-12px) scale(1.05); margin:0 20px; z-index:10; }
        .neumorph-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(190px, 1fr)); gap:28px; padding:30px 16px; background:#e0e0e0; border-radius:24px; }
        .card { width:190px; height:254px; border-radius:32px; background:#e0e0e0; box-shadow:20px 20px 60px #bebebe, -20px -20px 60px #ffffff; display:flex; flex-direction:column; align-items:center; padding:22px 16px; cursor:pointer; transition:all 0.35s; position:relative; margin:0 auto; overflow:hidden; }
        .card.selected { box-shadow:inset 10px 10px 20px #bebebe, inset -10px -10px 20px #ffffff, 0 0 0 2px #E8FF86; transform:translateY(-6px) scale(1.02); }
        .card-lock-overlay { position:absolute; inset:0; background:rgba(224,224,224,0.88); backdrop-filter:blur(10px); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; z-index:5; border-radius:32px; }
        .modern-tab-pill { display:flex; background:#0A0A0A; border-radius:999px; padding:4px; gap:2px; }
        .modern-tab { height:36px; padding:0 18px; border-radius:999px; font-size:13px; font-weight:500; display:flex; align-items:center; gap:7px; }
        .modern-tab-active { background:#FFFFFF; color:#0A0A0A; }
        .modern-tab-inactive { color:rgba(255,255,255,0.6); }
        .pro-glow-btn{ background:#E8FF86; color:#0A0A0A; border-radius:999px; height:36px; padding:0 18px; font-size:13px; font-weight:700; display:flex; align-items:center; gap:8px; box-shadow:0 0 20px rgba(232,255,134,0.5); }
        .billing-toggle{display:flex;background:#0A0A0A;border-radius:999px;padding:4px;gap:4px}
        .billing-btn{height:32px;padding:0 16px;border-radius:999px;font-size:12px;font-weight:600}
        .billing-btn-active{background:#fff;color:#0A0A0A}
        .billing-btn-inactive{color:rgba(255,255,255,0.6)}
        @media (max-width:768px){ .glass-container .glass{width:155px;height:220px;margin:0 -22px} .neumorph-grid{grid-template-columns:repeat(2,1fr);gap:16px} .card{max-width:165px;height:220px} }
      `}</style>

      {/* HEADER - ONLY ONE PLAN PILL HERE */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h- flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2"><div className="w-8 h-8 bg-black text-white rounded- flex items-center justify-center font-bold">D</div><span className="font-semibold text-">DukaanWhats.pk</span></Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white text- font-bold shadow-sm">
              <span className={`w-2 h-2 rounded-full ${isPremium?'bg-[#E8FF86]':isAdvanced?'bg-black':'bg-zinc-400'}`}></span>
              {currentPlanDef.name.toUpperCase()} • {productLimit===999999?'∞':productLimit} products
            </div>
            <button onClick={copyLink} className="h-9 px-4 border bg-white rounded- text- font-medium">{copied?'Copied!':'Copy Link'}</button>
            <Link href={`/s/${slug}`} target="_blank" className="h-9 px-4 bg-black text-white rounded- text- font-medium flex items-center">View Store ↗</Link>
            <button onClick={logout} className="h-9 w-9 bg-zinc-100 border rounded- flex items-center justify-center">↗</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pt-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="modern-tab-pill">
              {[{id:'store',label:'Store'},{id:'themes',label:'Themes'},{id:'products',label:`Products ${products.length}/${productLimit===999999?'∞':productLimit}`}].map(t=>(
                <button key={t.id} onClick={()=>setActiveTab(t.id as any)} className={`modern-tab ${activeTab===t.id?'modern-tab-active':'modern-tab-inactive'}`}>{t.label}</button>
              ))}
            </div>
            <button onClick={()=>setActiveTab('payments')} className="pro-glow-btn">PRO • Till {TILL_ID}</button>
          </div>
          <div className="billing-toggle">
            <button onClick={()=>setBilling('monthly')} className={`billing-btn ${billing==='monthly'?'billing-btn-active':'billing-btn-inactive'}`}>Monthly</button>
            <button onClick={()=>setBilling('yearly')} className={`billing-btn ${billing==='yearly'?'billing-btn-active':'billing-btn-inactive'}`}>Yearly -22%</button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {activeTab==='themes' && (
          <div className="bg-white p-5 border rounded-">
            <h2 className="font-bold text-">Themes — {currentPlanDef.name} Plan: {currentPlanId==='basic'?'3 Advanced unlocked, 5 locked + 3 Premium locked':currentPlanId==='advanced'?'All 8 Advanced unlocked, 3 Premium locked':'All unlocked ✓'}</h2>
            <div className="neumorph-grid mt-5">
              {finalAdvancedList.map(t=>{const isActive=theme===t.id; const locked=isThemeLocked(t); return(
                <button key={t.id} onClick={()=>{ if(locked){setActiveTab('payments'); return} setTheme(t.id)}} className={`card ${isActive?'selected':''}`}>
                  <div className="w- h- rounded- flex items-center justify-center text- mb-3" style={{background:t.colors.bg,boxShadow:'inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff'}}>{t.badge}</div>
                  <div className="text- font-bold">{t.name}</div>
                  <div className="text- opacity-60 uppercase tracking-widest mt-1">{t.category} • ADVANCED</div>
                  <div className="w-full h- rounded- mt-3 flex p-2 gap-2" style={{background:'#e0e0e0',boxShadow:'inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff'}}><div className="w-9 h-full rounded-" style={{background:t.colors.accent}} /></div>
                  {locked && <div className="card-lock-overlay"><div className="text-">🔒</div><div className="text- font-black">LOCKED</div><div className="text- opacity-60">Need Advanced</div><div className="bg-black text-white text- px-2.5 py-1 rounded-full">UPGRADE Rs. 899</div></div>}
                  {!locked && <div className="absolute bottom-2 bg-[#E8FF86] text-black text- px-2 py-0.5 rounded-full font-bold">UNLOCKED ✓</div>}
                </button>
              )})}
            </div>
            <div className="flex justify-end gap-3 mt-6"><button onClick={saveStore} className="h-11 px-6 bg-black text-white rounded-full text- font-medium">{saving?'Saving...':'Save Theme'}</button></div>
          </div>
        )}
        {activeTab==='store' && (
          <div className="bg-white p-6 border rounded-">
            <h2 className="font-semibold text-">Store Identity</h2>
            <div className="grid md:grid-cols-3 gap-4 mt-5">
              <input value={businessName} onChange={e=>setBusinessName(e.target.value)} placeholder="Business Name" className="h-11 px-4 border rounded- bg-zinc-50 text- outline-none focus:bg-white focus:border-black" />
              <input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="store-slug" className="h-11 px-4 border rounded- bg-zinc-50 font-mono text- outline-none focus:bg-white focus:border-black" />
              <input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="92300..." className="h-11 px-4 border rounded- bg-zinc-50 text- outline-none focus:bg-white focus:border-black" />
            </div>
            <div className="flex justify-end mt-5"><button onClick={saveStore} className="h-11 px-7 bg-black text-white rounded-full text-">Save Store →</button></div>
          </div>
        )}
        {activeTab==='products' && (
          <div className="space-y-4">
            <div className="bg-white border rounded- p-5">
              <h2 className="font-semibold text-">Add Product — {products.length}/{productLimit===999999?'∞':productLimit}</h2>
              <label className="mt-4 border-2 border-dashed rounded- p-4 flex flex-col items-center justify-center cursor-pointer bg-zinc-50/50 min-h-">
                <input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
                {previews.length ? <div className="grid grid-cols-5 gap-2 w-full">{previews.map((s,i)=><img key={i} src={s} className="w-full h- object-cover rounded- border" />)}</div> : <div className="text-center"><div className="w-11 h-11 bg-black text-white rounded- flex items-center justify-center mx-auto">+</div><div className="mt-2 text- font-medium">Upload {imageLimit===999999?'Unlimited':imageLimit} images</div></div>}
              </label>
              <div className="grid md:grid-cols-2 gap-3 mt-4">
                <input placeholder="Product name" value={prodName} onChange={e=>setProdName(e.target.value)} className="h-11 px-4 border rounded- bg-zinc-50 text- outline-none focus:bg-white focus:border-black" />
                <input placeholder="Price Rs. 3500" type="number" value={prodPrice} onChange={e=>setProdPrice(e.target.value)} className="h-11 px-4 border rounded- bg-zinc-50 text- outline-none focus:bg-white focus:border-black" />
              </div>
              <div className="flex justify-end mt-4"><button onClick={addProduct} disabled={uploading} className="h-11 px-7 bg-black text-white rounded-full text-">{uploading?'Uploading...':'Add Product →'}</button></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {products.map(p=>(<div key={p.id} className="bg-white border rounded- p-2.5 relative"><img src={p.image_url} className="w-full h-32 object-cover rounded- bg-zinc-50" /><div className="mt-2 text- font-medium truncate">{p.name}</div><div className="text- font-bold">Rs. {p.price}</div><button onClick={()=>deleteProduct(p.id)} className="absolute top-2 right-2 w-6 h-6 bg-white shadow border rounded-full text-">✕</button></div>))}
            </div>
          </div>
        )}
        {activeTab==='payments' && (
          <div className="bg-white border rounded- p-6">
            <h2 className="font-black text-">Upgrade — Till ID {TILL_ID}</h2>
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              {plans.map(p=>(
                <div key={p.id} className={`border-2 rounded- p-4 cursor-pointer ${selectedPlan?.id===p.id?'border-black bg-zinc-50':'border-zinc-200'}`} onClick={()=>setSelectedPlan(p)}>
                  <div className="font-black text-">{p.name}</div>
                  <div className="text- font-black mt-1">Rs. {billing==='monthly'?p.monthly:p.yearlyMonthly}/mo</div>
                  <div className="text- opacity-60 mt-2">{p.products===999999?'Unlimited':p.products} products • {p.imagesPerProduct===999999?'Unlimited':p.imagesPerProduct} images</div>
                  <div className="mt-3 text- leading-[1.4]">{p.id==='basic'?'5 Products, 1 Image, 3 Advanced':p.id==='advanced'?'25 Products, All 8 Advanced':'Unlimited + All Premium'}</div>
                </div>
              ))}
            </div>
            {selectedPlan && selectedPlan.monthly>0 && (
              <div className="mt-6 border-2 border-black rounded- p-5 bg-[#FFFEF5]">
                <input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder={`Txn ID after paying Rs. ${billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal} to Till ${TILL_ID}`} className="w-full h-12 px-4 rounded- border-2 text- font-mono focus:border-black outline-none" />
                <button onClick={async()=>{
                  if(!txnId.trim()){alert('Enter Txn ID'); return}
                  setPurchasing(true)
                  const { data: { user } } = await supabase.auth.getUser()
                  const amount = billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal
                  const { error } = await supabase.from('plan_payments').insert({ user_id: user?.id, plan_id: selectedPlan.id, amount, till_id: TILL_ID, txn_id: txnId.trim(), status:'pending', billing_cycle: billing })
                  if(error) alert(error.message); else { alert(`Submitted Rs. ${amount} for ${selectedPlan.name}`); setSelectedPlan(null); setTxnId('') }
                  setPurchasing(false)
                }} className="mt-3 w-full h-12 bg-black text-white rounded-full font-bold text-">{purchasing?'Submitting...':`I Paid Rs. ${billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal} → Activate`}</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
