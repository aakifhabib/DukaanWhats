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
  const [copiedTill, setCopiedTill] = useState(false)
  const router = useRouter()

  const plans: Plan[] = [
    { id: 'basic', name: 'Basic', price: 0, features: ['5 Products', '1 Image', 'COD Only'] },
    { id: 'advanced', name: 'Advanced', price: 499, features: ['50 Products', '5 Images', 'All Themes', 'Orders Dashboard'] },
    { id: 'premium', name: 'Premium', price: 999, features: ['Unlimited', 'Glass Advanced', 'No Branding', 'Priority Support'] },
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
          const metaName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'My Store'
          const baseSlug = metaName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0,20) || `store-${user.id.slice(0,6)}`
          let finalSlug = baseSlug
          const { data: existing } = await supabase.from('profiles').select('id').eq('store_slug', baseSlug).maybeSingle()
          if (existing) finalSlug = `${baseSlug}-${Math.floor(Math.random()*900+100)}`
          const newProfile = { id: user.id, business_name: metaName, whatsapp_number: '', store_slug: finalSlug, store_theme: 'clothing-noor', current_plan: 'basic' }
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
    if (!profile) return; setSaving(true); setErrorMsg(null)
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-')
    const { data, error } = await supabase.from('profiles').upsert({ id: profile.id, business_name: businessName.trim(), whatsapp_number: whatsapp.trim(), store_slug: cleanSlug, store_theme: theme, updated_at: new Date().toISOString() }, { onConflict: 'id' }).select().single()
    if (error) setErrorMsg(error.message); else { setProfile(data); setSlug(cleanSlug); setSaved(true); setTimeout(()=>setSaved(false), 3000) }
    setSaving(false)
  }
  const copyLink = async () => { await navigator.clipboard.writeText(`${window.location.origin}/s/${slug}`); setCopied(true); setTimeout(()=>setCopied(false), 2000) }
  const copyTill = async () => { await navigator.clipboard.writeText(TILL_ID); setCopiedTill(true); setTimeout(()=>setCopiedTill(false), 2000) }
  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }
  const handleFile = (e: any) => { const sel = Array.from(e.target.files || []) as File[]; if (sel.length>5){alert('Max 5'); return}; setFiles(sel); setPreviews(sel.map(f=>URL.createObjectURL(f))) }
  const uploadOne = async (file: File, userId: string) => {
    const name = `${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g,'_')}`
    const { error } = await supabase.storage.from('product-images').upload(name, file)
    if (error) throw error; return supabase.storage.from('product-images').getPublicUrl(name).data.publicUrl
  }
  const addProduct = async () => {
    if (!prodName.trim() || !prodPrice || files.length===0){alert('Name, price, photo required'); return}; setUploading(true)
    try{
      const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Not logged in')
      const urls = []; for (const f of files){ urls.push(await uploadOne(f, user.id)) }
      const { data } = await supabase.from('products').insert({ user_id: user.id, name: prodName.trim(), price: Number(prodPrice), image_url: urls[0], image_urls: urls }).select().single()
      if (data) setProducts([data, ...products]); setProdName(''); setProdPrice(''); setFiles([]); setPreviews([]); setActiveTab('products')
    }catch(e:any){ setErrorMsg(e.message) } setUploading(false)
  }
  const deleteProduct = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('products').delete().eq('id', id); setProducts(products.filter(p=>p.id!==id)) }
  const handleBuyPlan = async () => {
    if (!selectedPlan) return; if (selectedPlan.price===0){setSelectedPlan(null); return}; if (!txnId.trim()){alert('Enter Transaction ID'); return}; setPurchasing(true)
    try{
      const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Not logged in')
      const { error } = await supabase.from('plan_payments').insert({ user_id: user.id, plan_id: selectedPlan.id, amount: selectedPlan.price, till_id: TILL_ID, txn_id: txnId.trim(), status: 'pending' })
      if (error) throw error; alert(`Submitted! Till ${TILL_ID} - ${selectedPlan.name}`); setSelectedPlan(null); setTxnId('')
    }catch(e:any){alert(e.message)} setPurchasing(false)
  }

  if (loading) return <DukaanWhatsLoader message="Loading your store..." />

  const standardThemes = STORE_THEMES.filter(t => t.category !== 'advanced')
  const advancedThemes = getAdvancedThemes()
  const filtered = (filter as string) === 'all' ? standardThemes : STORE_THEMES.filter(t => (t.category as string) === (filter as string) && t.category !== 'advanced')

  return (
    <div style={{minHeight:'100vh',background:'#F8F7F5'}} className="text-zinc-900 pb-24">
      <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        .glass-container { position: relative; display: flex; justify-content: center; align-items: center; min-height: 340px; padding: 30px 0 50px; gap: 0; }
        .glass-container .glass { position: relative; width: 260px; height: 300px; background: linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.02)); border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 25px 45px rgba(0,0,0,0.35); display: flex; justify-content: flex-start; align-items: center; flex-direction: column; transition: 0.6s cubic-bezier(0.23,1,0.32,1); border-radius: 18px; margin: 0 -55px; backdrop-filter: blur(16px); transform: rotate(calc(var(--r) * 1deg)); cursor: pointer; overflow: hidden; padding-top: 14px; }
        .glass-container:hover .glass { transform: rotate(0deg); margin: 0 18px; }
        .glass-container .glass::before { content: attr(data-text); position: absolute; bottom: 0; width: 100%; height: 46px; background: rgba(255,255,255,0.06); border-top: 1px solid rgba(255,255,255,0.12); display: flex; justify-content: center; align-items: center; color: #fff; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; }
        .glass-container .glass.selected { background: linear-gradient(rgba(232,255,134,0.22), rgba(255,255,255,0.04)); border: 2px solid #E8FF86; transform: rotate(0deg) translateY(-14px) scale(1.06); margin: 0 18px; z-index: 20; }
        .glass-container .glass.selected::before { background: #E8FF86; color: #000; }
        .glass-preview-wrap { width: 92%; height: 208px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.15); display: flex; flex-direction: column; background: #fff; }
        .glass-preview-header { height: 26px; display: flex; align-items: center; justify-content: space-between; padding: 0 8px; font-size: 7px; font-weight: 700; }
        .glass-preview-body { flex: 1; padding: 8px; display: flex; flex-direction: column; gap: 6px; }
        .neumorph-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 32px; padding: 40px 20px; background: #e0e0e0; border-radius: 24px; }
        .card { width: 190px; height: 254px; border-radius: 50px; background: #e0e0e0; box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff; display: flex; flex-direction: column; align-items: center; padding: 22px 16px 18px; cursor: pointer; transition: all 0.3s ease; position: relative; margin: 0 auto; }
        .card:hover { transform: translateY(-4px); }
        .card.selected { box-shadow: inset 10px 10px 20px #bebebe, inset -10px -10px 20px #ffffff, 0 0 0 2px #E8FF86; transform: translateY(-6px); }
        .card .card-icon { width: 54px; height: 54px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff; margin-bottom: 12px; }
        .card .card-preview { width: 100%; height: 78px; border-radius: 18px; background: #e0e0e0; box-shadow: inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff; padding: 8px; display: flex; gap: 6px; overflow: hidden; }
        .modern-tab-pill { position: relative; display: flex; background: #0A0A0A; border-radius: 999px; padding: 4px; gap: 2px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.08); }
        .modern-tab { position: relative; z-index: 1; height: 36px; padding: 0 18px; border-radius: 999px; font-size: 13px; font-weight: 500; letter-spacing: -0.01em; transition: all 0.4s cubic-bezier(0.16,1,0.3,1); display: flex; align-items: center; gap: 7px; white-space: nowrap; flex-shrink: 0; }
        .modern-tab-active { background: #FFFFFF; color: #0A0A0A; box-shadow: 0 2px 8px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.8) inset; font-weight: 600; }
        .modern-tab-inactive { color: rgba(255,255,255,0.6); }
        .pro-glow-btn{position:relative;background:#E8FF86;color:#0A0A0A;border-radius:999px;height:36px;padding:0 18px;font-size:13px;font-weight:700;letter-spacing:-0.01em;display:flex;align-items:center;gap:8px;box-shadow:0 0 0 1px #E8FF86,0 0 24px rgba(232,255,134,0.6),0 4px 16px rgba(232,255,134,0.3);transition:all .3s cubic-bezier(0.16,1,0.3,1);white-space:nowrap;flex-shrink:0}
        .pro-glow-btn:hover{transform:translateY(-1px) scale(1.02);box-shadow:0 0 0 1px #E8FF86,0 0 32px rgba(232,255,134,0.8),0 8px 24px rgba(232,255,134,0.4)}
        .pro-glow-btn.active{background:#0A0A0A;color:#E8FF86;border:1px solid #E8FF86;box-shadow:0 0 0 1px #E8FF86,0 0 28px rgba(232,255,134,0.7)}
        .pro-dot{width:7px;height:7px;background:#0A0A0A;border-radius:999px;box-shadow:0 0 8px rgba(0,0,0,0.4);animation:proPulse 2s infinite}
        .pro-dot.active{ background:#E8FF86; box-shadow:0 0 10px #E8FF86 }
        @keyframes proPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.2);opacity:.8}}
        .radio-container{--main-color:#E8FF86;--total-radio:3;display:flex;flex-direction:column;position:relative;padding-left:1rem}
        .radio-container input{appearance:none;position:absolute;opacity:0}
        .radio-container .glider-container{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(0deg,transparent 0%,rgba(20,20,20,0.15) 50%,transparent 100%);width:1px}
        .radio-container .glider{position:relative;height:calc(100% / var(--total-radio));width:100%;background:linear-gradient(0deg,transparent 0%,var(--main-color) 50%,transparent 100%);transition:transform .5s cubic-bezier(0.37,1.95,0.66,0.56)}
        .radio-container .glider::before{content:"";position:absolute;height:60%;width:300%;top:50%;transform:translateY(-50%);background:var(--main-color);filter:blur(10px)}
        .radio-container label{cursor:pointer;padding:14px 12px;border-radius:12px;color:#9ca3af;transition:all .3s}
        .radio-container input:checked+label{color:#0A0A0A;background:#fff;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,.06)}
        .radio-container input:nth-of-type(1):checked~.glider-container .glider{transform:translateY(0)}
        .radio-container input:nth-of-type(2):checked~.glider-container .glider{transform:translateY(100%)}
        .radio-container input:nth-of-type(3):checked~.glider-container .glider{transform:translateY(200%)}
        @media (max-width: 768px) { .glass-container { min-height: 220px; } .glass-container .glass { width: 140px; height: 200px; margin: 0 -18px; } .neumorph-grid { grid-template-columns: repeat(2, 1fr); gap: 18px; padding: 24px 10px; } .card { width: 100%; max-width: 170px; height: 230px; border-radius: 36px; } .modern-tab { height: 32px; padding: 0 14px; font-size: 12px; } .pro-glow-btn{height:32px;padding:0 14px;font-size:12px} }
      `}</style>

      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 md:px-6 h-[56px] md:h-16 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 shrink-0"><div style={{borderRadius:10}} className="w-8 h-8 md:w-9 md:h-9 bg-black text-white flex items-center justify-center font-bold">D</div><span className="font-semibold tracking-tight text-[13px] md:text-[15px] whitespace-nowrap">DukaanWhats.pk</span></Link>
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <button onClick={copyLink} className="h-8 md:h-10 px-2.5 md:px-4 border bg-white rounded-[10px] text-[11px] md:text-[12px] font-medium whitespace-nowrap hover:bg-zinc-50">{copied?'Copied!':'Copy Link'}</button>
            <Link href={slug ? `/s/${slug}` : '#'} target="_blank" onClick={(e)=>{ if(!slug){ e.preventDefault(); alert('Save store first!'); } }} className="h-8 md:h-10 px-2.5 md:px-5 bg-black text-white rounded-[10px] text-[11px] md:text-[12px] font-medium flex items-center justify-center whitespace-nowrap hover:bg-zinc-800">View Store ↗</Link>
            <button onClick={logout} className="h-8 w-8 md:w-auto md:px-4 bg-zinc-100 border rounded-[10px] flex items-center justify-center text-[12px] shrink-0">↗</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 md:px-6 pt-3 md:pt-6">
        {errorMsg && <div style={{borderRadius:12}} className="mb-4 bg-red-50 border border-red-200 p-4 text-[12px] text-red-800">{errorMsg}</div>}
        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar">
          <div className="modern-tab-pill no-scrollbar shrink-0">
            {[
              { id: 'store', label: 'Store', icon: '◧' },
              { id: 'themes', label: 'Themes', icon: '◨' },
              { id: 'products', label: `Products ${products.length}`, icon: '◫' },
            ].map(t => (
              <button key={t.id} onClick={()=>setActiveTab(t.id as any)} className={`modern-tab ${activeTab===t.id ? 'modern-tab-active' : 'modern-tab-inactive'}`}><span>{t.icon}</span>{t.label}</button>
            ))}
          </div>
          {/* PRO GLOWING BUTTON - SEPARATE */}
          <button onClick={()=>setActiveTab('payments')} className={`pro-glow-btn ${activeTab==='payments'?'active':''}`}>
            <span className={`pro-dot ${activeTab==='payments'?'active':''}`}></span>
            PRO • Till {TILL_ID}
            <span className="text-[10px] opacity-60">↗</span>
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-3 md:px-6 py-4 md:py-8 space-y-6">
        {activeTab==='payments' && (
          <div className="space-y-4">
            {/* PREMIUM TILL HEADER */}
            <div className="bg-white border rounded-[20px] md:rounded-[24px] p-5 md:p-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#E8FF86] opacity-[0.08] rounded-full blur-[80px] pointer-events-none"></div>
              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-[#0A0A0A] text-white rounded-[14px] flex items-center justify-center text-[20px] shrink-0 shadow-[0_8px_24px_rgba(0,0,0,0.15)]">⬡</div>
                  <div className="min-w-0">
                    <h2 className="font-black text-[16px] md:text-[20px] tracking-tight flex items-center gap-2">JazzCash Till ID Payment <span className="hidden md:inline-flex bg-[#E8FF86] text-black text-[9px] font-bold px-2 py-1 rounded-full tracking-widest">SECURE</span></h2>
                    <p className="text-[11px] md:text-[12px] text-zinc-500 mt-1 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>Only verified method • Instant activation after verification</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 text-[10px] text-zinc-400"><span className="px-2.5 py-1 rounded-full bg-zinc-100 border">Till ID: {TILL_ID}</span><span className="px-2.5 py-1 rounded-full bg-zinc-100 border">24/7 Support</span></div>
              </div>

              <div className="mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 md:gap-6">
                {/* PREMIUM TILL CREDENTIALS CARD */}
                <div className="relative rounded-[20px] overflow-hidden border border-[#1a1a2e] bg-[#0B0B1A] text-white p-5 md:p-6">
                  <div className="absolute inset-0 opacity-80" style={{background:'radial-gradient(ellipse at 20% 0%, #1e1b8f 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, #4c1d95 0%, transparent 60%)'}}></div>
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] tracking-[0.25em] uppercase opacity-40 font-bold">JAZZCASH BUSINESS TILL</div>
                      <button onClick={copyTill} className="h-7 px-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full text-[10px] font-medium transition">{copiedTill?'Copied!':'Copy ID'}</button>
                    </div>
                    
                    <div className="bg-white/[0.06] border border-white/[0.08] rounded-[14px] p-4 backdrop-blur">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-[10px] uppercase tracking-widest opacity-50">Till ID Number</div>
                          <div className="text-[28px] md:text-[32px] font-black tracking-[0.12em] mt-1 font-mono">{TILL_ID}</div>
                          <div className="flex gap-1.5 mt-2">
                            {TILL_ID.split('').map((d,i)=><div key={i} className="w-6 h-1 bg-[#E8FF86]/60 rounded-full"></div>)}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#E8FF86] text-black flex items-center justify-center font-bold text-[12px]">✓</div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
                        <div className="bg-white/[0.05] rounded-[10px] p-2.5 border border-white/[0.06]"><div className="opacity-40 text-[9px] uppercase">Account Title</div><div className="font-semibold mt-1">DukaanWhats.pk</div></div>
                        <div className="bg-white/[0.05] rounded-[10px] p-2.5 border border-white/[0.06]"><div className="opacity-40 text-[9px] uppercase">Network</div><div className="font-semibold mt-1">JazzCash • Till</div></div>
                      </div>
                    </div>

                    <div className="bg-white rounded-[14px] p-3">
                      <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-bold text-black tracking-widest uppercase">Barcode</span><span className="text-[9px] text-zinc-500">Code128</span></div>
                      <img src={`https://barcodeapi.org/api/code128/${TILL_ID}`} alt="Barcode" className="w-full h-[52px] object-contain"/>
                      <div className="text-center text-[11px] tracking-[0.3em] mt-1.5 font-mono text-black font-black">{TILL_ID}</div>
                    </div>

                    <div className="flex gap-3">
                      <div className="bg-white rounded-[14px] p-2.5 flex-1 flex flex-col items-center">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=JAZZCASH_TILL_${TILL_ID}`} alt="QR" className="w-[110px] h-[110px] md:w-[120px] md:h-[120px]"/>
                        <div className="text-[9px] text-zinc-500 mt-1.5 uppercase tracking-widest font-bold">Scan in JazzCash</div>
                      </div>
                      <div className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-[14px] p-3 flex flex-col justify-center gap-2.5">
                        <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">How to Pay</div>
                        <div className="space-y-2 text-[11px] leading-[1.3]"><div className="flex gap-2"><span className="w-5 h-5 rounded-full bg-[#E8FF86] text-black flex items-center justify-center text-[10px] font-bold shrink-0">1</span>Open JazzCash App</div><div className="flex gap-2"><span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>Business → Till ID → {TILL_ID}</div><div className="flex gap-2"><span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>Enter amount & pay</div></div>
                        <div className="mt-1 h-px bg-white/10"></div>
                        <div className="text-[10px] opacity-50">Copy Txn ID after payment</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PREMIUM PLANS GLIDER */}
                <div className="bg-[#FEFEFE] border border-zinc-200 rounded-[20px] md:rounded-[24px] p-5 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[12px] font-black tracking-[0.15em] uppercase">Choose Plan — Yellow Glider</h3>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#E8FF86] text-black font-bold tracking-widest">POPULAR</span>
                  </div>
                  <div className="mt-5 radio-container" style={{"--total-radio": plans.length} as any}>
                    {plans.map(p=>(
                      <div key={p.id} className="contents">
                        <input type="radio" id={`plan-${p.id}`} name="plan-selector" checked={selectedPlan?.id===p.id} onChange={()=>setSelectedPlan(p)}/>
                        <label htmlFor={`plan-${p.id}`} onClick={()=>setSelectedPlan(p)}>
                          <div className="flex justify-between items-center">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-[14px]">{p.name}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${p.price===0?'bg-zinc-200 text-zinc-600':'bg-black text-white'}`}>Rs. {p.price}</span>
                                {p.id==='advanced' && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#E8FF86] text-black font-bold">BEST VALUE</span>}
                              </div>
                              <div className="text-[11px] mt-1 opacity-60 leading-[1.3] truncate">{p.features.join(' • ')}</div>
                            </div>
                            <span className="ml-3 w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-[12px] shrink-0">→</span>
                          </div>
                        </label>
                      </div>
                    ))}
                    <div className="glider-container"><div className="glider"></div></div>
                  </div>

                  {selectedPlan && selectedPlan.price>0 && (
                    <div className="mt-6 rounded-[16px] border-2 border-black bg-[#FFFEF5] p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-[#E8FF86] opacity-20 rounded-full blur-[20px]"></div>
                      <div className="relative">
                        <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[12px]">₨</div><div className="text-[13px] font-black">Pay Rs. {selectedPlan.price} → Till {TILL_ID}</div></div>
                        <div className="mt-1 text-[11px] text-zinc-500">Selected: <span className="font-bold text-black">{selectedPlan.name}</span> • Enter Txn ID after payment</div>
                        <div className="mt-4 relative">
                          <input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder={`e.g. 1234567890 - Txn ID from JazzCash`} className="w-full h-12 px-4 pr-12 rounded-[12px] border-2 border-zinc-200 bg-white text-[12px] font-mono focus:outline-none focus:border-black transition"/>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#E8FF86] rounded-[8px] flex items-center justify-center text-[12px] font-bold">✓</div>
                        </div>
                        <button onClick={handleBuyPlan} disabled={purchasing} className="mt-3 w-full h-12 bg-black text-white rounded-full font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-50 transition"><span>{purchasing?'Verifying...':`I Paid Rs. ${selectedPlan.price} to Till ${TILL_ID}`}</span><span className="w-5 h-5 bg-white text-black rounded-full flex items-center justify-center text-[12px]">↗</span></button>
                        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-zinc-400"><span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>We verify in 15-30 mins • 100% Secure</div>
                      </div>
                    </div>
                  )}
                  {(!selectedPlan || selectedPlan.price===0) && <div className="mt-4 p-3 rounded-[12px] bg-zinc-50 border border-dashed text-[11px] text-zinc-500 text-center">Select Advanced or Premium to pay via Till {TILL_ID}</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab==='store' && (
          <div style={{borderRadius:20}} className="bg-white p-5 md:p-7 border">
            <div className="flex items-center justify-between"><h2 className="font-semibold text-[15px] tracking-tight">Store Identity</h2>{saved && <span style={{borderRadius:999}} className="bg-[#E8FF86] text-black border px-3 py-1 text-[11px] font-bold">Saved ✓</span>}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div><label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Business Name *</label><input value={businessName} onChange={e=>setBusinessName(e.target.value)} style={{borderRadius:12}} className="mt-2 w-full h-11 px-4 border bg-zinc-50/50 text-[14px] focus:bg-white focus:outline-none focus:border-black" placeholder="Noor Boutique" /></div>
              <div><label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Store Slug /s/ *</label><input value={slug} onChange={e=>setSlug(e.target.value)} style={{borderRadius:12}} className="mt-2 w-full h-11 px-4 border bg-zinc-50/50 text-[14px] focus:bg-white focus:outline-none focus:border-black font-mono text-[13px]" placeholder="noor-boutique" /></div>
              <div><label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">WhatsApp Number *</label><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} style={{borderRadius:12}} className="mt-2 w-full h-11 px-4 border bg-zinc-50/50 text-[14px] focus:bg-white focus:outline-none focus:border-black" placeholder="923001234567" /></div>
            </div>
            <div className="flex justify-end mt-6"><button onClick={saveStore} disabled={saving} style={{borderRadius:999}} className="h-11 px-7 bg-black text-white text-[13px] font-medium hover:bg-zinc-800 disabled:opacity-50">{saving?'Saving...':'Save Store →'}</button></div>
          </div>
        )}

        {activeTab==='themes' && (
          <div style={{borderRadius:20}} className="bg-white p-4 md:p-6 border">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4"><label className="text-[14px] font-semibold tracking-tight">Choose Theme — {filter==='advanced' ? 'see below ↓' : `${filtered.length} designs`}</label><div className="flex flex-wrap gap-1.5">{(['all','food','clothing','tech','shoes'] as const).map(c => (<button key={c} onClick={()=>setFilter(c)} style={{borderRadius:999}} className={`h-7 px-3 text-[11px] font-medium capitalize border transition ${filter===c ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}>{c}</button>))}<button onClick={()=>{setFilter('advanced'); document.getElementById('advanced-glass')?.scrollIntoView({behavior:'smooth'})}} style={{borderRadius:999}} className={`h-7 px-3 text-[11px] font-medium border ${filter==='advanced' ? 'bg-black text-white' : 'bg-[#0A0A0A] text-white'}`}>advanced ↓</button></div></div>
            {filter !== 'advanced' && <div className="neumorph-grid">{filtered.map(t => { const isActive = theme===t.id; return <button key={t.id} onClick={()=>setTheme(t.id)} className={`card ${isActive?'selected':''}`}>{isActive && <span style={{position:'absolute',top:14,right:18,width:22,height:22,borderRadius:999,background:'#E8FF86',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700}}>✓</span>}<div className="card-icon" style={{background:t.colors.bg}}>{t.badge}</div><div style={{textAlign:'center',marginBottom:10}}><div style={{fontSize:13,fontWeight:800}}>{t.name}</div><div style={{fontSize:9,fontWeight:600,color:'#8a8a8a',marginTop:2,textTransform:'uppercase'}}>{t.category}</div></div><div className="card-preview"><div style={{width:36,height:'100%',borderRadius:12,background:t.colors.accent,opacity:0.9}} /><div style={{flex:1}}><div style={{height:4,borderRadius:3,background:t.colors.text,opacity:0.12,width:'80%'}} /></div></div></button>})}</div>}
            <div id="advanced-glass" style={{borderRadius:20}} className="mt-10 overflow-hidden border-2 border-black relative"><div className="absolute inset-0 bg-[#0c0e13]" /><div className="absolute inset-0 opacity-50" style={{background:'radial-gradient(circle at 20% 10%, #E8FF86 0%, transparent 35%), radial-gradient(circle at 85% 85%, #7c3aed 0%, transparent 45%)'}} /><div className="relative p-6 md:p-8"><div className="flex items-center gap-3"><span style={{borderRadius:999}} className="bg-[#E8FF86] text-black text-[10px] font-bold px-3 py-1 tracking-widest">ADVANCED</span><span className="text-white font-semibold text-[15px]">Glass Store Previews — Hover to Explore</span></div><div className="glass-container mt-1">{advancedThemes.map((t,i)=>{const r=[-18,0,18][i]||0; const isActive=theme===t.id; return <div key={t.id} className={`glass ${isActive?'selected':''}`} data-text={t.name} style={{'--r':r} as any} onClick={()=>setTheme(t.id)}><div className="glass-preview-wrap"><div className="glass-preview-header" style={{background:t.colors.bg,color:t.colors.text}}><span>{t.id==='sleek-beige'?'SLEEK':t.id==='sleek-dark'?'DARK':'EDITORIAL'}</span></div><div className="glass-preview-body" style={{background:t.colors.bg}}><div style={{height:28,borderRadius:6,background:t.colors.card,border:`1px solid ${t.colors.border}`}} /><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,flex:1}}>{[1,2].map(k=><div key={k} style={{borderRadius:6,background:t.colors.card,border:`1px solid ${t.colors.border}`}} />)}</div></div></div><div style={{marginTop:8,display:'flex',alignItems:'center',gap:6}}><span style={{width:20,height:20,borderRadius:6,background:t.colors.card,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10}}>{t.badge}</span><span style={{fontSize:10,color:'rgba(255,255,255,0.6)'}} className="uppercase">{t.tagline}</span></div>{isActive && <div className="absolute top-3 right-3 w-5 h-5 bg-[#E8FF86] rounded-full flex items-center justify-center text-[10px] font-bold">✓</div>}</div>})}</div></div></div>
            <div className="flex justify-end pt-6 gap-2">{saved && <span className="h-11 px-4 flex items-center text-[12px] text-green-600 font-medium">✓ Saved! {getTheme(theme).name}</span>}<button onClick={saveStore} style={{borderRadius:999}} className="h-11 px-6 bg-black text-white text-[13px] font-medium">Save Store & Theme</button></div>
          </div>
        )}

        {activeTab==='products' && (
          <div className="space-y-6">
            <div style={{borderRadius:20}} className="bg-white border overflow-hidden"><div className="p-4 md:p-6 border-b flex items-center justify-between"><h2 className="font-semibold text-[14px] md:text-[15px] tracking-tight">Add Product — up to 5 photos</h2><span className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-100 border">{files.length}/5</span></div><div className="p-4 md:p-6 space-y-4"><label style={{borderRadius:16}} className="border-2 border-dashed p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 transition min-h-[120px] bg-zinc-50/30">{previews.length ? <div className="grid grid-cols-5 gap-2 w-full">{previews.map((src,i)=><img key={i} src={src} style={{borderRadius:10}} className="w-full h-[60px] object-cover border" />)}</div> : <><div style={{borderRadius:12}} className="w-11 h-11 bg-black text-white flex items-center justify-center text-lg">+</div><div className="mt-2 font-medium text-[13px]">Upload photos</div></>}<input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" /></label><div className="grid md:grid-cols-2 gap-3"><input placeholder="Product name" value={prodName} onChange={e=>setProdName(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border bg-zinc-50/50 focus:bg-white text-[13px] focus:outline-none focus:border-black" /><input placeholder="Price Rs. 3500" type="number" value={prodPrice} onChange={e=>setProdPrice(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border bg-zinc-50/50 focus:bg-white text-[13px] focus:outline-none focus:border-black" /></div><div className="flex justify-end"><button onClick={addProduct} disabled={uploading} style={{borderRadius:999}} className="h-11 px-7 bg-black text-white text-[13px] font-medium hover:bg-zinc-800 disabled:opacity-50">{uploading?'Uploading...':`Add Product ${files.length?`(${files.length})`:''} →`}</button></div></div></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{products.map(p => (<div key={p.id} style={{borderRadius:16}} className="bg-white border p-2.5 group relative"><img src={p.image_url} style={{borderRadius:10}} className="w-full h-32 object-cover bg-zinc-50" /><div className="mt-2"><div className="font-medium text-[12px] truncate">{p.name}</div><div className="text-[12px] font-bold">Rs. {p.price}</div></div><button onClick={()=>deleteProduct(p.id)} className="absolute top-2 right-2 w-6 h-6 bg-white shadow border rounded-full flex items-center justify-center text-[10px]">✕</button></div>))}</div>
          </div>
        )}
      </main>
    </div>
  )
}
