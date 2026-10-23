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
  const [activeTab, setActiveTab] = useState<'store'|'themes'|'products'|'payments'>('store')
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [txnId, setTxnId] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const router = useRouter()

  const plans: Plan[] = [
    { id: 'basic', name: 'Basic', price: 0, features: ['5 Products', '1 Image', 'COD Only'] },
    { id: 'advanced', name: 'Advanced', price: 499, features: ['50 Products', '5 Images', 'All Themes', 'Orders Dashboard'] },
    { id: 'premium', name: 'Premium', price: 999, features: ['Unlimited', 'Glass Advanced', 'No Branding', 'Priority'] },
  ]

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { window.location.href = '/login'; return }
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { window.location.href = '/login'; return }

        let { data: prof, error: profError } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
        
        if (!prof) {
          const metaName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'My Store'
          const baseSlug = metaName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0,20) || `store-${user.id.slice(0,6)}`
          let finalSlug = baseSlug
          const { data: existing } = await supabase.from('profiles').select('id').eq('store_slug', baseSlug).maybeSingle()
          if (existing) finalSlug = `${baseSlug}-${Math.floor(Math.random()*900+100)}`
          const newProfile = { 
            id: user.id, 
            business_name: metaName, 
            whatsapp_number: '', 
            store_slug: finalSlug, 
            store_theme: 'clothing-noor',
            current_plan: 'basic'
          }
          const { data: created, error: createError } = await supabase.from('profiles').upsert(newProfile, { onConflict: 'id' }).select().single()
          if (createError) {
            setErrorMsg(`Profile create failed: ${createError.message}. Run FIX_RLS SQL!`)
            prof = { id: user.id, business_name: metaName, whatsapp_number: '', store_slug: finalSlug, store_theme: 'clothing-noor' } as any
          } else if (created) {
            prof = created
          }
        }

        if (prof) {
          setProfile(prof)
          setBusinessName(prof.business_name || '')
          setWhatsapp(prof.whatsapp_number || '')
          setSlug(prof.store_slug || '')
          setTheme(prof.store_theme || 'clothing-noor')
          const { data: prods } = await supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
          if (prods) setProducts(prods)
        }
      } catch (e: any) {
        setErrorMsg(e.message)
      }
      setTimeout(()=>setLoading(false), 700)
    }
    init()
  }, [])

  const saveStore = async () => {
    if (!profile) { setErrorMsg('No profile - refresh'); return }
    setSaving(true)
    setErrorMsg(null)
    try {
      const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '').replace(/--+/g, '-')
      if (!cleanSlug) { alert('Enter valid store slug'); setSaving(false); return }
      if (!businessName.trim()) { alert('Enter business name'); setSaving(false); return }
      const { data, error } = await supabase.from('profiles').upsert({
          id: profile.id, business_name: businessName.trim(), whatsapp_number: whatsapp.trim(), store_slug: cleanSlug, store_theme: theme, updated_at: new Date().toISOString()
        }, { onConflict: 'id' }).select().single()
      if (error) {
        if (error.message.includes('row-level security') || error.message.includes('policy')) setErrorMsg(`RLS Error: ${error.message} - Run FIX_RLS_STORE_NOT_FOUND.sql`)
        else if (error.message.includes('duplicate') || error.message.includes('store_slug')) setErrorMsg(`Slug "${cleanSlug}" already taken`)
        else setErrorMsg(error.message)
        alert(error.message)
      } else {
        setProfile(data || { ...profile, business_name: businessName, store_slug: cleanSlug, whatsapp_number: whatsapp, store_theme: theme })
        setSlug(cleanSlug); setSaved(true); setTimeout(()=>setSaved(false), 3000)
        localStorage.setItem('dukaan_backup', JSON.stringify({ businessName, slug: cleanSlug, whatsapp, theme }))
      }
    } catch (e: any) { setErrorMsg(e.message); alert(e.message) }
    setSaving(false)
  }

  const copyLink = async () => {
    if (!slug) { alert('Save store first to get link'); return }
    await navigator.clipboard.writeText(`${window.location.origin}/s/${slug}`)
    setCopied(true); setTimeout(()=>setCopied(false), 2000)
  }
  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }
  const handleFile = (e: any) => {
    const sel = Array.from(e.target.files || []) as File[]
    if (sel.length>5){alert('Max 5 photos'); return}
    if (sel.some(f=>f.size>5*1024*1024)){alert('Each file max 5MB'); return}
    setFiles(sel); setPreviews(sel.map(f=>URL.createObjectURL(f)))
  }
  const uploadOne = async (file: File, userId: string) => {
    const name = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name.replace(/[^a-zA-Z0-9.-]/g,'_')}`
    const { data, error } = await supabase.storage.from('product-images').upload(name, file, { cacheControl: '3600', upsert: false })
    if (error) throw error
    return supabase.storage.from('product-images').getPublicUrl(name).data.publicUrl
  }
  const addProduct = async () => {
    if (!profile || !prodName.trim() || !prodPrice || files.length===0){alert('Name, price, at least 1 photo required'); return}
    if (Number(prodPrice) <= 0){alert('Enter valid price'); return}
    setUploading(true); setErrorMsg(null)
    try{
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')
      const urls = []
      for (const file of files) { const url = await uploadOne(file, user.id); urls.push(url) }
      if (!urls.length) throw new Error('All uploads failed')
      const { data, error } = await supabase.from('products').insert({ user_id: user.id, name: prodName.trim(), price: Number(prodPrice), image_url: urls[0], image_urls: urls }).select().single()
      if (error) {
        if (error.message.includes('image_urls')) {
          const { data: fb, error: fbErr } = await supabase.from('products').insert({ user_id: user.id, name: prodName.trim(), price: Number(prodPrice), image_url: urls[0] }).select().single()
          if (fbErr) throw fbErr; if (fb) setProducts([fb, ...products])
        } else throw error
      } else if (data) setProducts([data, ...products])
      setProdName(''); setProdPrice(''); setFiles([]); setPreviews([]); setActiveTab('products')
    }catch(e:any){ setErrorMsg(e.message); alert('Add product failed: '+e.message) }
    setUploading(false)
  }
  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) { alert(error.message); return }
    setProducts(products.filter(p=>p.id!==id))
  }
  const handleBuyPlan = async () => {
    if (!selectedPlan) return
    if (selectedPlan.price===0) { setSelectedPlan(null); return }
    if (!txnId.trim()) { alert('Enter Transaction ID after paying to Till ID '+TILL_ID); return }
    setPurchasing(true)
    try{
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')
      const { error } = await supabase.from('plan_payments').insert({ user_id: user.id, plan_id: selectedPlan.id, amount: selectedPlan.price, till_id: TILL_ID, txn_id: txnId.trim(), status: 'pending' })
      if (error) throw error
      alert(`Submitted!\nTill ID: ${TILL_ID}\nPlan: ${selectedPlan.name}\nTxn: ${txnId}\nWe will verify in 30 mins and activate.`)
      setSelectedPlan(null); setTxnId('')
    }catch(e:any){alert(e.message)}
    setPurchasing(false)
  }

  if (loading) return <DukaanWhatsLoader message="Loading your store..." />

  const standardThemes = STORE_THEMES.filter(t => t.category !== 'advanced')
  const advancedThemes = getAdvancedThemes()
  const filtered = (filter as string) === 'all' ? standardThemes : (filter as string) === 'advanced' ? [] : STORE_THEMES.filter(t => (t.category as string) === (filter as string) && t.category !== 'advanced')

  return (
    <div style={{minHeight:'100vh',background:'#F8F7F5'}} className="text-zinc-900 pb-24">
      <style>{`
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
        .modern-tab { position: relative; z-index: 1; height: 36px; padding: 0 18px; border-radius: 999px; font-size: 13px; font-weight: 500; letter-spacing: -0.01em; transition: all 0.4s cubic-bezier(0.16,1,0.3,1); display: flex; align-items: center; gap: 7px; white-space: nowrap; }
        .modern-tab-active { background: #FFFFFF; color: #0A0A0A; box-shadow: 0 2px 8px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.8) inset; font-weight: 600; }
        .modern-tab-inactive { color: rgba(255,255,255,0.6); }
        .modern-tab-inactive:hover { color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.06); }
        @media (max-width: 768px) { .glass-container { min-height: 220px; } .glass-container .glass { width: 140px; height: 200px; margin: 0 -18px; } .neumorph-grid { grid-template-columns: repeat(2, 1fr); gap: 18px; padding: 24px 10px; } .card { width: 100%; max-width: 170px; height: 230px; border-radius: 36px; } .modern-tab { height: 34px; padding: 0 14px; font-size: 12px; } }
      `}</style>

      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0"><div style={{borderRadius:10}} className="w-9 h-9 bg-black text-white flex items-center justify-center font-bold">D</div><span className="font-semibold tracking-tight text- md:text-">DukaanWhats.pk</span></Link>
          <div className="flex items-center gap-2">
            <button onClick={copyLink} style={{borderRadius:10}} className="h-9 md:h-10 px-3 md:px-4 border bg-white text- font-medium hover:bg-zinc-50">{copied?'Copied!':'Copy Link'}</button>
            <Link href={slug ? `/s/${slug}` : '#'} target="_blank" onClick={(e)=>{ if(!slug){ e.preventDefault(); alert('Save store first to get link!'); } }} style={{borderRadius:10}} className="h-9 md:h-10 px-3 md:px-5 bg-black text-white text- font-medium flex items-center hover:bg-zinc-800">View Store ↗</Link>
            <button onClick={logout} style={{borderRadius:10}} className="h-9 w-9 md:w-auto md:px-4 bg-zinc-100 border flex items-center justify-center text-">↗</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6">
        {errorMsg && <div style={{borderRadius:12}} className="mb-4 bg-red-50 border border-red-200 p-4 text- text-red-800"><div className="font-bold">Error</div><div className="mt-1">{errorMsg}</div></div>}
        <div className="flex items-center justify-between gap-4">
          <div className="modern-tab-pill">
            {[{ id: 'store', label: 'Store', icon: '◧' },{ id: 'themes', label: 'Themes', icon: '◨' },{ id: 'products', label: `Products ${products.length}`, icon: '◫' },{ id: 'payments', label: `Till ${TILL_ID}`, icon: '⬡' }].map(t => (
              <button key={t.id} onClick={()=>setActiveTab(t.id as any)} className={`modern-tab ${activeTab===t.id ? 'modern-tab-active' : 'modern-tab-inactive'}`}><span className="text-">{t.icon}</span>{t.label}</button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2 text- text-zinc-400"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />{profile ? `Saved as /s/${slug}` : 'Loading...'} • {getTheme(theme).name}</div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        {activeTab==='store' && (
          <div style={{borderRadius:20}} className="bg-white p-6 md:p-7 border">
            <div className="flex items-center justify-between"><h2 className="font-semibold text- tracking-tight">Store Identity</h2>{saved && <span style={{borderRadius:999}} className="bg-[#E8FF86] text-black border px-3 py-1 text- font-bold">Saved ✓</span>}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div><label className="text- font-semibold uppercase tracking-widest text-zinc-400">Business Name *</label><input value={businessName} onChange={e=>setBusinessName(e.target.value)} style={{borderRadius:12}} className="mt-2 w-full h-11 px-4 border bg-zinc-50/50 text- focus:bg-white focus:outline-none focus:border-black" placeholder="Noor Boutique" /></div>
              <div><label className="text- font-semibold uppercase tracking-widest text-zinc-400">Store Slug /s/ *</label><input value={slug} onChange={e=>setSlug(e.target.value)} style={{borderRadius:12}} className="mt-2 w-full h-11 px-4 border bg-zinc-50/50 text- focus:bg-white focus:outline-none focus:border-black font-mono text-" placeholder="noor-boutique" /></div>
              <div><label className="text- font-semibold uppercase tracking-widest text-zinc-400">WhatsApp Number *</label><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} style={{borderRadius:12}} className="mt-2 w-full h-11 px-4 border bg-zinc-50/50 text- focus:bg-white focus:outline-none focus:border-black" placeholder="923001234567" /></div>
            </div>
            <div className="flex justify-end mt-6"><button onClick={saveStore} disabled={saving} style={{borderRadius:999}} className="h-11 px-7 bg-black text-white text- font-medium hover:bg-zinc-800 disabled:opacity-50">{saving?'Saving...':'Save Store →'}</button></div>
          </div>
        )}
        {activeTab==='themes' && (
          <div style={{borderRadius:20}} className="bg-white p-6 border">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4"><label className="text- font-semibold tracking-tight">Choose Theme — {filter==='advanced'?'see below ↓':`${filtered.length} designs`}</label><div className="flex flex-wrap gap-1.5">{(['all','food','clothing','tech','shoes'] as const).map(c => (<button key={c} onClick={()=>setFilter(c)} style={{borderRadius:999}} className={`h-7 px-3 text- font-medium capitalize border ${filter===c ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}>{c}</button>))}<button onClick={()=>{setFilter('advanced'); document.getElementById('advanced-glass')?.scrollIntoView({behavior:'smooth'})}} style={{borderRadius:999}} className={`h-7 px-3 text- font-medium border ${filter==='advanced' ? 'bg-black text-white' : 'bg-[#0A0A0A] text-white'}`}>advanced ↓</button></div></div>
            {filter !== 'advanced' && <div className="neumorph-grid">{filtered.map(t => { const isActive = theme===t.id; return <button key={t.id} onClick={()=>setTheme(t.id)} className={`card ${isActive?'selected':''}`}>{isActive && <span style={{position:'absolute',top:14,right:18,width:22,height:22,borderRadius:999,background:'#E8FF86',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700}}>✓</span>}<div className="card-icon" style={{background:t.colors.bg}}>{t.badge}</div><div style={{textAlign:'center',marginBottom:10}}><div style={{fontSize:13,fontWeight:800}}>{t.name}</div><div style={{fontSize:9,fontWeight:600,color:'#8a8a8a',marginTop:2,textTransform:'uppercase'}}>{t.category}</div></div><div className="card-preview"><div style={{width:36,height:'100%',borderRadius:12,background:t.colors.accent,opacity:0.9}} /><div style={{flex:1}}><div style={{height:4,borderRadius:3,background:t.colors.text,opacity:0.12,width:'80%'}} /></div></div></button>})}</div>}
            <div id="advanced-glass" style={{borderRadius:20}} className="mt-10 overflow-hidden border-2 border-black relative"><div className="absolute inset-0 bg-[#0c0e13]" /><div className="absolute inset-0 opacity-50" style={{background:'radial-gradient(circle at 20% 10%, #E8FF86 0%, transparent 35%), radial-gradient(circle at 85% 85%, #7c3aed 0%, transparent 45%)'}} /><div className="relative p-6 md:p-8"><div className="flex items-center gap-3"><span style={{borderRadius:999}} className="bg-[#E8FF86] text-black text- font-bold px-3 py-1 tracking-widest">ADVANCED</span><span className="text-white font-semibold text-">Glass Store Previews</span></div><div className="glass-container mt-1">{advancedThemes.map((t,i)=>{const r=[-18,0,18][i]||0; const isActive=theme===t.id; return <div key={t.id} className={`glass ${isActive?'selected':''}`} data-text={t.name} style={{'--r':r} as any} onClick={()=>setTheme(t.id)}><div className="glass-preview-wrap"><div className="glass-preview-header" style={{background:t.colors.bg,color:t.colors.text}}><span>{t.id==='sleek-beige'?'SLEEK':t.id==='sleek-dark'?'DARK':'EDITORIAL'}</span></div><div className="glass-preview-body" style={{background:t.colors.bg}}><div style={{height:28,borderRadius:6,background:t.colors.card,border:`1px solid ${t.colors.border}`}} /><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,flex:1}}>{[1,2].map(k=><div key={k} style={{borderRadius:6,background:t.colors.card,border:`1px solid ${t.colors.border}`}} />)}</div></div></div><div style={{marginTop:8,display:'flex',alignItems:'center',gap:6}}><span style={{width:20,height:20,borderRadius:6,background:t.colors.card,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10}}>{t.badge}</span><span style={{fontSize:10,color:'rgba(255,255,255,0.6)'}} className="uppercase">{t.tagline}</span></div>{isActive && <div className="absolute top-3 right-3 w-5 h-5 bg-[#E8FF86] rounded-full flex items-center justify-center text- font-bold">✓</div>}</div>})}</div></div></div>
            <div className="flex justify-end pt-6"><button onClick={saveStore} style={{borderRadius:999}} className="h-11 px-6 bg-black text-white text- font-medium">Save Store & Theme</button></div>
          </div>
        )}
        {activeTab==='products' && (
          <div className="space-y-6">
            <div style={{borderRadius:20}} className="bg-white border overflow-hidden"><div className="p-6 border-b flex items-center justify-between"><h2 className="font-semibold text-">Add Product — up to 5 photos</h2><span className="text- px-2.5 py-1 rounded-full bg-zinc-100 border">{files.length}/5</span></div><div className="p-6 space-y-4"><label style={{borderRadius:16}} className="border-2 border-dashed p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 min-h- bg-zinc-50/30">{previews.length ? <div className="grid grid-cols-5 gap-2 w-full">{previews.map((src,i)=><img key={i} src={src} style={{borderRadius:10}} className="w-full h- object-cover border" />)}</div> : <><div style={{borderRadius:12}} className="w-11 h-11 bg-black text-white flex items-center justify-center text-lg">+</div><div className="mt-3 font-medium text-">Upload photos</div></>}<input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" /></label><div className="grid md:grid-cols-2 gap-3"><input placeholder="Product name" value={prodName} onChange={e=>setProdName(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border bg-zinc-50/50 text- focus:bg-white focus:outline-none focus:border-black" /><input placeholder="Price Rs. 3500" type="number" value={prodPrice} onChange={e=>setProdPrice(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border bg-zinc-50/50 text- focus:bg-white focus:outline-none focus:border-black" /></div><div className="flex justify-end"><button onClick={addProduct} disabled={uploading} style={{borderRadius:999}} className="h-11 px-7 bg-black text-white text- font-medium disabled:opacity-50">{uploading?'Uploading...':`Add Product ${files.length?`(${files.length})`:''} →`}</button></div></div></div>
            {products.length > 0 && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{products.map(p => (<div key={p.id} style={{borderRadius:20}} className="group bg-white border p-3 relative"><div className="relative"><img src={p.image_url} style={{borderRadius:12}} className="w-full h-36 object-cover bg-zinc-50" />{p.image_urls && p.image_urls.length>1 && <span style={{borderRadius:999}} className="absolute top-2 left-2 bg-black text-white text- px-2 py-1">+{p.image_urls.length}</span>}</div><div className="mt-3"><div className="font-medium text- truncate">{p.name}</div><div className="text- font-bold">Rs. {p.price}</div></div><button onClick={()=>deleteProduct(p.id)} style={{borderRadius:999}} className="absolute top-2 right-2 w-7 h-7 bg-white shadow border flex items-center justify-center text- opacity-0 group-hover:opacity-100">✕</button></div>))}</div>}
          </div>
        )}
        {activeTab==='payments' && (
          <div style={{borderRadius:20}} className="bg-white p-6 md:p-8 border">
            <div className="flex items-center gap-4"><div style={{borderRadius:14}} className="w-14 h-14 bg-black text-white flex items-center justify-center">⬡</div><div><h2 className="font-bold text-">Till ID Payments — Only Method</h2><p className="text- text-zinc-500">Till {TILL_ID}</p></div></div>
            <div className="mt-8 grid md:grid-cols-[380px_1fr] gap-6">
              <div className="rounded- p-6 text-center border bg-[#07052e] text-white" style={{backgroundImage:'linear-gradient(to top, #210c93, #0d117a, #011160, #010e47, #07052e)'}}><div className="text- tracking-widest opacity-40">【entity-JAZZCASH¦canonical_name=JAZZCASH】 TILL ID</div><div className="text- font-black tracking-widest mt-2">{TILL_ID}</div><div className="mt-4 bg-white rounded- p-3"><img src={`https://barcodeapi.org/api/code128/${TILL_ID}`} alt="Barcode" className="w-full h- object-contain" /><div className="text- font-mono text-black font-bold">{TILL_ID}</div></div><div className="mt-4 bg-white rounded- p-3 inline-block"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=JAZZCASH_TILL_${TILL_ID}`} alt="QR" className="w- h-" /></div></div>
              <div className="space-y-4">
                <div className="grid gap-3">{plans.map(p => (<div key={p.id} style={{borderRadius:14}} className={`p-4 border-2 flex justify-between items-center ${selectedPlan?.id===p.id?'border-black bg-[#E8FF86]/20':'border-zinc-100 bg-zinc-50/50'}`}><div><div className="font-semibold text-">{p.name} — Rs. {p.price}</div><div className="text- text-zinc-500">{p.features.join(' • ')}</div></div><button onClick={()=>setSelectedPlan(p)} disabled={p.price===0} style={{borderRadius:999}} className="h-8 px-4 text- font-medium bg-black text-white disabled:bg-zinc-200">Pay</button></div>))}</div>
                {selectedPlan && selectedPlan.price>0 && (<div className="rounded- border bg-[#FFFEF5] border-[#F5E6A0] p-5"><div className="text- font-bold">Selected: {selectedPlan.name} — Rs. {selectedPlan.price} → Till {TILL_ID}</div><input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder={`Transaction ID after paying Rs. ${selectedPlan.price} to Till ${TILL_ID}`} className="mt-3 w-full h-11 px-4 rounded- border bg-white text- font-mono focus:outline-none focus:border-black" /><button onClick={handleBuyPlan} disabled={purchasing} style={{borderRadius:999}} className="mt-3 w-full h-11 bg-black text-white font-medium text- disabled:opacity-50">{purchasing?'Submitting...':`I Paid to Till ${TILL_ID} — Activate`}</button></div>)}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
