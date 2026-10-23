'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STORE_THEMES, getTheme, ThemeCategory, getAdvancedThemes } from '@/lib/storeThemes'
import { DukaanWhatsLoader } from '@/components/DukaanWhatsLoader'

const TILL_ID = '984837533'

type Profile = { id: string; business_name: string; whatsapp_number: string; store_slug: string; store_theme?: string; current_plan?: string }
type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; user_id: string }
type Plan = { id: string; name: string; price: number; features: string[] }

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
  const [filter, setFilter] = useState<ThemeCategory | 'all' | string>('all')
  const [activeTab, setActiveTab] = useState<'store'|'themes'|'products'|'payments'>('payments')
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [txnId, setTxnId] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const router = useRouter()

  const plans: Plan[] = [
    { id: 'basic', name: 'Basic', price: 0, features: ['5 Products', '1 Image', 'COD Only'] },
    { id: 'advanced', name: 'Advanced', price: 499, features: ['50 Products', '5 Images', 'All Themes', 'Orders'] },
    { id: 'premium', name: 'Premium', price: 999, features: ['Unlimited', 'Glass Advanced', 'No Branding', 'Priority'] },
  ]

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

  const saveStore = async () => {
    if (!profile) return; setSaving(true)
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-')
    const { data, error } = await supabase.from('profiles').upsert({ id: profile.id, business_name: businessName.trim(), whatsapp_number: whatsapp.trim(), store_slug: cleanSlug, store_theme: theme, updated_at: new Date().toISOString() }, { onConflict: 'id' }).select().single()
    if (error) setErrorMsg(error.message); else { setProfile(data); setSlug(cleanSlug); setSaved(true); setTimeout(()=>setSaved(false), 2500) }
    setSaving(false)
  }
  const copyLink = async () => { await navigator.clipboard.writeText(`${window.location.origin}/s/${slug}`); setCopied(true); setTimeout(()=>setCopied(false), 2000) }
  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }
  const handleFile = (e: any) => { const sel = Array.from(e.target.files || []) as File[]; if (sel.length>5){alert('Max 5'); return}; setFiles(sel); setPreviews(sel.map(f=>URL.createObjectURL(f))) }
  const uploadOne = async (file: File, userId: string) => {
    const name = `${userId}/${Date.now()}_${file.name}`; const { error } = await supabase.storage.from('product-images').upload(name, file)
    if (error) throw error; return supabase.storage.from('product-images').getPublicUrl(name).data.publicUrl
  }
  const addProduct = async () => {
    if (!prodName.trim() || !prodPrice || files.length===0){alert('Name, price, photo required'); return}; setUploading(true)
    try{
      const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Not logged in')
      const urls = await Promise.all(files.map(f=>uploadOne(f, user.id)))
      const { data } = await supabase.from('products').insert({ user_id: user.id, name: prodName.trim(), price: Number(prodPrice), image_url: urls[0], image_urls: urls }).select().single()
      if (data) setProducts([data, ...products]); setProdName(''); setProdPrice(''); setFiles([]); setPreviews([])
    }catch(e:any){ setErrorMsg(e.message) } setUploading(false)
  }
  const deleteProduct = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('products').delete().eq('id', id); setProducts(products.filter(p=>p.id!==id)) }
  const handleBuyPlan = async () => {
    if (!selectedPlan || !txnId.trim()){alert('Enter Txn ID'); return}; setPurchasing(true)
    try{
      const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Not logged in')
      const { error } = await supabase.from('plan_payments').insert({ user_id: user.id, plan_id: selectedPlan.id, amount: selectedPlan.price, till_id: TILL_ID, txn_id: txnId.trim(), status: 'pending' })
      if (error) throw error; alert(`Submitted! Till ${TILL_ID}`); setSelectedPlan(null); setTxnId('')
    }catch(e:any){alert(e.message)} setPurchasing(false)
  }

  if (loading) return <DukaanWhatsLoader message="Loading your store..." />

  const standardThemes = STORE_THEMES.filter(t => t.category !== 'advanced')
  const advancedThemes = getAdvancedThemes()
  const filtered = (filter as string) === 'all' ? standardThemes : STORE_THEMES.filter(t => (t.category as string) === (filter as string) && t.category !== 'advanced')

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-zinc-900 pb-28">
      <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        .radio-container{--main-color:#E8FF86;--main-color-opacity:#E8FF861c;--total-radio:3;display:flex;flex-direction:column;position:relative;padding-left:1rem}
        .radio-container input{appearance:none;position:absolute;opacity:0}
        .radio-container .glider-container{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(0deg,transparent 0%,rgba(20,20,20,0.15) 50%,transparent 100%);width:1px}
        .radio-container .glider{position:relative;height:calc(100% / var(--total-radio));width:100%;background:linear-gradient(0deg,transparent 0%,var(--main-color) 50%,transparent 100%);transition:transform .5s cubic-bezier(0.37,1.95,0.66,0.56)}
        .radio-container .glider::before{content:"";position:absolute;height:60%;width:300%;top:50%;transform:translateY(-50%);background:var(--main-color);filter:blur(10px)}
        .radio-container label{cursor:pointer;padding:14px 12px;border-radius:12px;color:#9ca3af;transition:all .3s}
        .radio-container input:checked+label{color:#0A0A0A;background:#fff;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,.06)}
        .radio-container input:nth-of-type(1):checked~.glider-container .glider{transform:translateY(0)}
        .radio-container input:nth-of-type(2):checked~.glider-container .glider{transform:translateY(100%)}
        .radio-container input:nth-of-type(3):checked~.glider-container .glider{transform:translateY(200%)}
        .glass-container{position:relative;display:flex;justify-content:center;align-items:center;min-height:260px;padding:20px 0 30px;gap:0}
        .glass-container .glass{position:relative;width:200px;height:240px;background:linear-gradient(rgba(255,255,255,0.12),rgba(255,255,255,0.02));border:1px solid rgba(255,255,255,0.15);border-radius:18px;margin:0 -40px;backdrop-filter:blur(16px);transform:rotate(calc(var(--r)*1deg));transition:.6s;overflow:hidden;padding-top:14px;display:flex;flex-direction:column;align-items:center}
        .glass-container:hover .glass{transform:rotate(0deg);margin:0 12px}
        .neumorph-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;padding:16px;background:#e0e0e0;border-radius:20px}
        @media(min-width:768px){.neumorph-grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:20px;padding:24px}}
        .card{width:100%;height:210px;border-radius:32px;background:#e0e0e0;box-shadow:14px 14px 40px #bebebe,-14px -14px 40px #fff;display:flex;flex-direction:column;align-items:center;padding:18px 12px;cursor:pointer;transition:.3s}
        .card.selected{box-shadow:inset 8px 8px 16px #bebebe,inset -8px -8px 16px #fff,0 0 0 2px #E8FF86;transform:translateY(-4px)}
        .modern-tab-pill{display:flex;background:#0A0A0A;border-radius:999px;padding:3px;gap:2px;overflow-x:auto;max-width:100%}
        .modern-tab{height:32px;padding:0 14px;border-radius:999px;font-size:12px;font-weight:500;white-space:nowrap;display:flex;align-items:center;gap:6px;transition:.3s;flex-shrink:0}
        .modern-tab-active{background:#fff;color:#0A0A0A;font-weight:600}
        .modern-tab-inactive{color:rgba(255,255,255,.6)}
      `}</style>

      {/* HEADER - FIXED */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 md:px-6 h-[56px] md:h-16 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-black text-white rounded-[10px] flex items-center justify-center font-bold text-[14px]">D</div>
            <span className="font-semibold tracking-tight text-[13px] md:text-[15px] whitespace-nowrap">DukaanWhats.pk</span>
          </Link>
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <button onClick={copyLink} className="h-8 md:h-9 px-2.5 md:px-4 border bg-white rounded-[10px] text-[11px] md:text-[12px] font-medium whitespace-nowrap hover:bg-zinc-50">{copied?'Copied!':'Copy Link'}</button>
            <Link href={`/s/${slug}`} target="_blank" className="h-8 md:h-9 px-2.5 md:px-4 bg-black text-white rounded-[10px] text-[11px] md:text-[12px] font-medium flex items-center justify-center whitespace-nowrap hover:bg-zinc-800">View Store ↗</Link>
            <button onClick={logout} className="h-8 w-8 md:h-9 md:w-9 bg-zinc-100 border rounded-[10px] flex items-center justify-center text-[12px] shrink-0">↗</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 md:px-6 pt-3 md:pt-6">
        {errorMsg && <div className="mb-3 bg-red-50 border border-red-200 p-3 rounded-[12px] text-[11px] text-red-800">{errorMsg}</div>}
        <div className="modern-tab-pill no-scrollbar">
          {[{id:'store',label:'Store',icon:'◧'},{id:'themes',label:'Themes',icon:'◨'},{id:'products',label:`Products ${products.length}`,icon:'◫'},{id:'payments',label:`Till ${TILL_ID}`,icon:'⬡'}].map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id as any)} className={`modern-tab ${activeTab===t.id?'modern-tab-active':'modern-tab-inactive'}`}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-3 md:px-6 py-4 md:py-6 space-y-4">
        {activeTab==='payments' && (
          <div className="bg-white border rounded-[20px] p-4 md:p-7">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-black text-white rounded-[12px] flex items-center justify-center text-[16px] shrink-0">⬡</div>
              <div className="min-w-0"><h2 className="font-bold text-[15px] md:text-[18px] tracking-tight truncate">Till ID Payments — Only Method</h2><p className="text-[11px] md:text-[12px] text-zinc-500 truncate">Till {TILL_ID} • Barcode + QR</p></div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-[360px_1fr] gap-5">
              {/* Till Card */}
              <div className="rounded-[16px] md:rounded-[20px] p-4 md:p-6 text-center text-white relative overflow-hidden shrink-0" style={{background:'linear-gradient(180deg,#1a0a5e 0%,#0d117a 40%,#07052e 100%)'}}>
                <div className="text-[9px] tracking-[0.25em] uppercase opacity-50">JAZZCASH TILL ID</div>
                <div className="text-[28px] md:text-[32px] font-black tracking-[0.15em] mt-1">{TILL_ID}</div>
                <div className="mt-4 bg-white rounded-[12px] p-2.5 md:p-3">
                  <img src={`https://barcodeapi.org/api/code128/${TILL_ID}`} alt="Barcode" className="w-full h-[48px] md:h-[60px] object-contain"/>
                  <div className="text-[10px] tracking-[0.3em] mt-1 font-mono text-black font-bold">{TILL_ID}</div>
                </div>
                <div className="mt-3 md:mt-4 bg-white rounded-[14px] p-2.5 md:p-3 inline-block">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=JAZZCASH_TILL_${TILL_ID}`} alt="QR" className="w-[140px] h-[140px] md:w-[160px] md:h-[160px]"/>
                </div>
                <div className="mt-3 text-[10px] opacity-60">Scan in JazzCash App → Business → Till ID</div>
              </div>

              {/* Plans Glider */}
              <div className="bg-[#F8F7F5] border border-zinc-200 rounded-[16px] md:rounded-[20px] p-4 md:p-5">
                <h3 className="text-[11px] font-bold tracking-widest uppercase text-zinc-400 mb-3">Select Plan — Animated</h3>
                <div className="radio-container" style={{"--total-radio": plans.length} as any}>
                  {plans.map(p=>(
                    <div key={p.id} className="contents">
                      <input type="radio" id={`plan-${p.id}`} name="plan-selector" checked={selectedPlan?.id===p.id} onChange={()=>setSelectedPlan(p)}/>
                      <label htmlFor={`plan-${p.id}`} onClick={()=>setSelectedPlan(p)}>
                        <div className="flex justify-between items-center">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap"><span className="font-bold text-[13px]">{p.name}</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-black text-white font-mono">Rs. {p.price}</span></div>
                            <div className="text-[11px] mt-1 opacity-60 leading-[1.3] truncate">{p.features.join(' • ')}</div>
                          </div>
                          <span className="ml-2 text-[14px] opacity-30 shrink-0">→</span>
                        </div>
                      </label>
                    </div>
                  ))}
                  <div className="glider-container"><div className="glider"></div></div>
                </div>
                {selectedPlan && selectedPlan.price>0 && (
                  <div className="mt-4 rounded-[14px] border bg-[#FFFEF5] border-[#F5E6A0] p-4">
                    <div className="text-[12px] font-bold">Pay Rs. {selectedPlan.price} → Till {TILL_ID}</div>
                    <input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder="Txn ID after payment" className="mt-2.5 w-full h-10 md:h-11 px-3.5 rounded-[12px] border bg-white text-[12px] font-mono focus:outline-none focus:border-black"/>
                    <button onClick={handleBuyPlan} disabled={purchasing} className="mt-2.5 w-full h-10 md:h-11 bg-black text-white rounded-full font-medium text-[12px] disabled:opacity-50">{purchasing?'Submitting...':`I Paid to Till ${TILL_ID} — Verify`}</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab==='store' && (
          <div className="bg-white p-4 md:p-7 border rounded-[20px]">
            <div className="flex items-center justify-between"><h2 className="font-semibold text-[14px] md:text-[16px]">Store Identity</h2>{saved && <span className="bg-[#E8FF86] text-black px-2.5 py-1 rounded-full text-[10px] font-bold">Saved ✓</span>}</div>
            <div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-3 mt-4">
              <div><label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Business Name</label><input value={businessName} onChange={e=>setBusinessName(e.target.value)} className="mt-1.5 w-full h-10 md:h-11 px-3.5 border rounded-[12px] bg-zinc-50 text-[13px] focus:bg-white focus:outline-none focus:border-black" placeholder="Noor Boutique"/></div>
              <div><label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Slug /s/</label><input value={slug} onChange={e=>setSlug(e.target.value)} className="mt-1.5 w-full h-10 md:h-11 px-3.5 border rounded-[12px] bg-zinc-50 font-mono text-[12px] focus:bg-white focus:outline-none focus:border-black" placeholder="noor-boutique"/></div>
              <div><label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">WhatsApp</label><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} className="mt-1.5 w-full h-10 md:h-11 px-3.5 border rounded-[12px] bg-zinc-50 text-[13px] focus:bg-white focus:outline-none focus:border-black" placeholder="923001234567"/></div>
            </div>
            <div className="flex justify-end mt-4"><button onClick={saveStore} className="h-10 px-6 bg-black text-white rounded-full text-[12px] font-medium">{saving?'Saving...':'Save Store →'}</button></div>
          </div>
        )}

        {activeTab==='products' && (
          <div className="space-y-4">
            <div className="bg-white border rounded-[20px] p-4 md:p-6">
              <h2 className="font-semibold text-[13px] md:text-[15px]">Add Product — {files.length}/5 photos</h2>
              <label className="mt-3 border-2 border-dashed rounded-[14px] p-3 flex flex-col items-center justify-center cursor-pointer bg-zinc-50/50 min-h-[100px]"><div className="grid grid-cols-5 gap-1.5 w-full">{previews.map((s,i)=><img key={i} src={s} className="w-full h-[50px] object-cover rounded-[8px] border"/>)}</div>{!previews.length && <span className="text-[12px]">+ Upload photos</span>}<input type="file" multiple accept="image/*" onChange={handleFile} className="hidden"/></label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-3"><input value={prodName} onChange={e=>setProdName(e.target.value)} placeholder="Product name" className="h-10 px-3.5 border rounded-[12px] bg-zinc-50 text-[12px]"/><input value={prodPrice} onChange={e=>setProdPrice(e.target.value)} type="number" placeholder="Price" className="h-10 px-3.5 border rounded-[12px] bg-zinc-50 text-[12px]"/></div>
              <div className="flex justify-end mt-3"><button onClick={addProduct} className="h-10 px-6 bg-black text-white rounded-full text-[12px]">Add Product →</button></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4">{products.map(p=><div key={p.id} className="border rounded-[14px] md:rounded-[16px] p-2 bg-white"><img src={p.image_url} className="w-full h-28 md:h-32 object-cover rounded-[10px]"/><div className="mt-2 text-[11px] md:text-[13px] font-medium truncate">{p.name}</div><div className="text-[11px] font-bold">Rs. {p.price}</div></div>)}</div>
          </div>
        )}

        {activeTab==='themes' && (
          <div className="bg-white p-4 md:p-6 border rounded-[20px]">
            <div className="flex items-center justify-between gap-2"><h2 className="font-semibold text-[13px]">Themes — {filtered.length}</h2><div className="flex gap-1 overflow-x-auto no-scrollbar">{['all','food','clothing'].map(c=><button key={c} onClick={()=>setFilter(c)} className={`h-6 px-2.5 text-[10px] rounded-full border capitalize shrink-0 ${filter===c?'bg-black text-white':'bg-white'}`}>{c}</button>)}</div></div>
            <div className="neumorph-grid mt-4">{filtered.slice(0,6).map(t=>{const active=theme===t.id; return <button key={t.id} onClick={()=>setTheme(t.id)} className={`card ${active?'selected':''}`}><div className="text-[18px]">{t.badge}</div><div className="mt-1 text-[11px] font-bold">{t.name}</div></button>})}</div>
            <div className="flex justify-end mt-4"><button onClick={saveStore} className="h-10 px-5 bg-black text-white rounded-full text-[12px]">Save</button></div>
          </div>
        )}
      </main>
    </div>
  )
}
