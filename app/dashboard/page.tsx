'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STORE_THEMES, getTheme, ThemeCategory, getAdvancedThemes } from '@/lib/storeThemes'

type Profile = { id: string; business_name: string; whatsapp_number: string; store_slug: string; store_theme?: string }
type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; user_id: string }

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
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      // Try to get existing profile
      let { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()

      // Auto-create for Google/Apple OAuth users who don't have a profile yet
      if (!prof) {
        const metaName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'My Store'
        const baseSlug = metaName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20) || `store-${user.id.slice(0,6)}`
        let finalSlug = baseSlug
        // Ensure unique slug
        const { data: existing } = await supabase.from('profiles').select('id').eq('store_slug', baseSlug).single()
        if (existing) finalSlug = `${baseSlug}-${Math.floor(Math.random()*900+100)}`

        const newProfile = {
          id: user.id,
          business_name: metaName,
          whatsapp_number: '',
          store_slug: finalSlug,
          store_theme: 'clothing-noor'
        }
        const { data: created, error: createError } = await supabase.from('profiles').insert(newProfile).select().single()
        if (!createError && created) {
          prof = created
        } else {
          console.error('Profile create error:', createError)
        }
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
      setLoading(false)
    }
    init()
  }, [])

  const saveStore = async () => {
    if (!profile) return
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
  const handleFile = (e: any) => { const sel = Array.from(e.target.files || []) as File[]; if (sel.length>5){alert('Max 5'); return}; setFiles(sel); setPreviews(sel.map(f=>URL.createObjectURL(f))) }
  const uploadOne = async (file: File) => { if (!profile) return ''; const name = `${profile.id}/${Date.now()}_${file.name}`; const { data, error } = await supabase.storage.from('product-images').upload(name, file); if (error||!data) return ''; return supabase.storage.from('product-images').getPublicUrl(name).data.publicUrl }
  const addProduct = async () => {
    if (!profile || !prodName || !prodPrice || files.length===0){alert('Name, price, photo required'); return}
    setUploading(true)
    try{
      const urls = (await Promise.all(files.map(uploadOne))).filter(Boolean)
      if (!urls.length) throw new Error('Upload failed')
      let { data, error } = await supabase.from('products').insert({ user_id: profile.id, name: prodName, price: Number(prodPrice), image_url: urls[0], image_urls: urls }).select().single()
      if (error && error.message.includes('image_urls')) { const fb = await supabase.from('products').insert({ user_id: profile.id, name: prodName, price: Number(prodPrice), image_url: urls[0] }).select().single(); data=fb.data; error=fb.error }
      if (error) throw error
      if (data) setProducts([data,...products])
      setProdName(''); setProdPrice(''); setFiles([]); setPreviews([])
    }catch(e:any){alert(e.message)}
    setUploading(false)
  }
  const deleteProduct = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('products').delete().eq('id', id); setProducts(products.filter(p=>p.id!==id)) }

  if (loading) return <div style={{minHeight:'100vh',background:'#F8F7F5',display:'flex',alignItems:'center',justifyContent:'center'}} className="text-[13px]">Loading store...</div>

  const standardThemes = STORE_THEMES.filter(t => t.category !== 'advanced')
  const advancedThemes = getAdvancedThemes()
  // Upper grid NEVER shows advanced - only in glass panel
  const filtered = (filter as string) === 'all' ? standardThemes : (filter as string) === 'advanced' ? [] : STORE_THEMES.filter(t => (t.category as string) === (filter as string) && t.category !== 'advanced')

  return (
    <div style={{minHeight:'100vh',background:'#F8F7F5'}} className="text-zinc-900 pb-24">
      <style>{`
        .glass-container {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 340px;
          padding: 30px 0 50px;
          gap: 0;
        }
        .glass-container .glass {
          position: relative;
          width: 260px;
          height: 300px;
          background: linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow: 0 25px 45px rgba(0,0,0,0.35);
          display: flex;
          justify-content: flex-start;
          align-items: center;
          flex-direction: column;
          transition: 0.6s cubic-bezier(0.23,1,0.32,1);
          border-radius: 18px;
          margin: 0 -55px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transform: rotate(calc(var(--r) * 1deg));
          cursor: pointer;
          overflow: hidden;
          padding-top: 14px;
        }
        .glass-container:hover .glass {
          transform: rotate(0deg);
          margin: 0 18px;
        }
        .glass-container .glass::before {
          content: attr(data-text);
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 46px;
          background: rgba(255,255,255,0.06);
          border-top: 1px solid rgba(255,255,255,0.12);
          display: flex;
          justify-content: center;
          align-items: center;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
        }
        .glass-container .glass.selected {
          background: linear-gradient(rgba(232,255,134,0.22), rgba(255,255,255,0.04));
          border: 2px solid #E8FF86;
          box-shadow: 0 30px 50px rgba(0,0,0,0.45), 0 0 40px rgba(232,255,134,0.25);
          transform: rotate(0deg) translateY(-14px) scale(1.06);
          margin: 0 18px;
          z-index: 20;
        }
        .glass-container .glass.selected::before {
          background: #E8FF86;
          color: #000;
        }
        .glass-preview-wrap {
          width: 92%;
          height: 208px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow: 0 8px 20px rgba(0,0,0,0.25);
          display: flex;
          flex-direction: column;
          background: #fff;
          pointer-events: none;
        }
        .glass-preview-header {
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 8px;
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.04em;
        }
        .glass-preview-body {
          flex: 1;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        @media (max-width: 768px) {
          .glass-container { min-height: 220px; }
          .glass-container .glass {
            width: 140px;
            height: 200px;
            margin: 0 -18px;
          }
          .glass-container:hover .glass { margin: 0 8px; }
          .glass-container .glass.selected { margin: 0 8px; transform: rotate(0deg) translateY(-8px) scale(1.05); }
          .glass-preview-wrap { height: 130px; }
          .glass-preview-header { height: 18px; font-size: 6px; }
          .glass-preview-body { padding: 5px; gap: 4px; }
        }
      `}</style>

      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0"><div style={{borderRadius:10}} className="w-9 h-9 bg-black text-white flex items-center justify-center font-bold">D</div><span className="font-semibold tracking-tight text-[14px] md:text-[15px]">DukaanWhats.pk</span></Link>
          <div className="flex items-center gap-1.5 md:gap-2"><button onClick={copyLink} style={{borderRadius:10}} className="h-9 md:h-10 px-3 md:px-4 border bg-white text-[12px] md:text-[13px] font-medium hover:bg-zinc-50">{copied ? 'Copied!' : 'Copy Link'}</button><Link href={`/s/${slug}`} target="_blank" style={{borderRadius:10}} className="h-9 md:h-10 px-3 md:px-5 bg-black text-white text-[12px] md:text-[13px] font-medium flex items-center hover:bg-zinc-800">View Store</Link></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div style={{borderRadius:20}} className="bg-white p-6 border"><div className="text-[11px] text-zinc-500 font-semibold uppercase tracking-widest">Products</div><div className="text-2xl font-bold mt-3">{products.length}</div></div>
          <div style={{borderRadius:20}} className="bg-white p-6 border"><div className="text-[11px] text-zinc-500 font-semibold uppercase tracking-widest">Theme</div><div className="text-[14px] font-semibold mt-3">{getTheme(theme).name} • {getTheme(theme).badge}</div><div className="text-[11px] text-zinc-500 mt-1 capitalize">{getTheme(theme).category}</div></div>
          <div style={{borderRadius:20}} className="bg-[#E8FF86] p-6 border border-black/10"><div className="text-[11px] text-black/60 font-semibold uppercase tracking-widest">Store Link</div><div className="text-[13px] font-medium mt-3 truncate">/s/{slug}</div></div>
        </div>

        <div style={{borderRadius:20}} className="bg-white p-6 border">
          <h2 className="font-semibold text-[15px]">Store Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <input placeholder="Business name" value={businessName} onChange={e=>setBusinessName(e.target.value)} style={{borderRadius:12}} className="h-11 px-4 border text-[14px]" />
            <input placeholder="Store slug" value={slug} onChange={e=>setSlug(e.target.value)} style={{borderRadius:12}} className="h-11 px-4 border text-[14px]" />
            <input placeholder="WhatsApp number" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} style={{borderRadius:12}} className="h-11 px-4 border text-[14px]" />
          </div>

          <div className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3"><label className="text-[13px] font-semibold">Choose Theme — {filter==='advanced' ? 'see below ↓' : `${filtered.length} designs`}</label><div className="flex flex-wrap gap-1.5">{(['all','food','clothing','tech','shoes'] as const).map(c => (<button key={c} onClick={()=>setFilter(c)} style={{borderRadius:999}} className={`h-7 px-3 text-[11px] font-medium capitalize border ${filter===c ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}>{c}</button>))}<button onClick={()=>{setFilter('advanced'); document.getElementById('advanced-glass')?.scrollIntoView({behavior:'smooth'})}} style={{borderRadius:999}} className={`h-7 px-3 text-[11px] font-medium capitalize border ${filter==='advanced' ? 'bg-black text-white border-black' : 'bg-[#0A0A0A] text-white border-black hover:bg-zinc-800'}`}>advanced ↓</button></div></div>
            <style>{`
              .neumorph-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
                gap: 32px;
                padding: 40px 20px;
                background: #e0e0e0;
                border-radius: 24px;
              }
              .card {
                width: 190px;
                height: 254px;
                border-radius: 50px;
                background: #e0e0e0;
                box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 22px 16px 18px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                border: none;
                text-align: left;
                margin: 0 auto;
              }
              .card:hover {
                box-shadow: 12px 12px 40px #bebebe, -12px -12px 40px #ffffff;
                transform: translateY(-4px);
              }
              .card.selected {
                background: #e0e0e0;
                box-shadow: inset 10px 10px 20px #bebebe, inset -10px -10px 20px #ffffff, 0 0 0 2px #E8FF86, 0 8px 24px rgba(232,255,134,0.3);
                transform: translateY(-6px);
              }
              .card .card-icon {
                width: 54px;
                height: 54px;
                border-radius: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 22px;
                box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
                margin-bottom: 12px;
              }
              .card .card-preview {
                width: 100%;
                height: 78px;
                border-radius: 18px;
                background: #e0e0e0;
                box-shadow: inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff;
                padding: 8px;
                display: flex;
                gap: 6px;
                overflow: hidden;
              }
              .card .card-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
              }
              @media (max-width: 640px) {
                .neumorph-grid { grid-template-columns: repeat(2, 1fr); gap: 18px; padding: 24px 10px; }
                .card { width: 100%; max-width: 170px; height: 230px; border-radius: 36px; }
              }
            `}</style>

            {filter === 'advanced' ? (
              <div className="text-center py-8 bg-zinc-50 rounded-[16px] border border-dashed"><div className="text-[13px] font-medium">Advanced themes are below in the glass panel ↓</div><div className="text-[11px] text-zinc-500 mt-1">Hover to spread, click to select the 3 minimal designs</div></div>
            ) : (
            <div className="neumorph-grid">
              {filtered.map(t => {
                const isActive = theme === t.id
                return (
                  <button key={t.id} onClick={()=>setTheme(t.id)} className={`card ${isActive ? 'selected' : ''}`}>
                    {isActive && <span style={{position:'absolute', top:14, right:18, width:22, height:22, borderRadius:999, background:'#E8FF86', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#000', boxShadow:'0 2px 8px rgba(0,0,0,0.15)'}}>✓</span>}
                    
                    <div className="card-icon" style={{background: t.colors.bg, color: t.colors.text, border: `1px solid ${t.colors.border}20`}}>{t.badge}</div>
                    
                    <div style={{textAlign:'center', marginBottom:10}}>
                      <div style={{fontSize:13, fontWeight:800, color:'#2d2d2d', letterSpacing:'-0.01em'}}>{t.name}</div>
                      <div style={{fontSize:9, fontWeight:600, color:'#8a8a8a', letterSpacing:'0.08em', marginTop:2, textTransform:'uppercase'}}>{t.category} • {t.tagline.split(' ').slice(0,2).join(' ')}</div>
                    </div>

                    <div className="card-preview">
                      <div style={{width:36, height:'100%', borderRadius:12, background: t.colors.accent, opacity:0.9, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3}}>
                        <div style={{width:18, height:18, borderRadius:6, background:'rgba(255,255,255,0.3)'}} />
                        <div style={{width:22, height:3, borderRadius:2, background:'rgba(255,255,255,0.5)'}} />
                      </div>
                      <div style={{flex:1, display:'flex', flexDirection:'column', gap:5}}>
                        <div style={{display:'flex', gap:3}}><div className="card-dot" style={{background:t.colors.text, opacity:0.15}} /><div className="card-dot" style={{background:t.colors.accent, opacity:0.6}} /><div className="card-dot" style={{background:t.colors.text, opacity:0.08}} /></div>
                        <div style={{height:4, borderRadius:3, background:t.colors.text, opacity:0.12, width:'80%'}} />
                        <div style={{height:4, borderRadius:3, background:t.colors.text, opacity:0.08, width:'60%'}} />
                        <div style={{marginTop:'auto', display:'flex', gap:4}}>
                          <div style={{flex:1, height:22, borderRadius:8, background:t.colors.card, border:`1px solid ${t.colors.border}40`}} />
                          <div style={{flex:1, height:22, borderRadius:8, background:t.colors.bg, border:`1px solid ${t.colors.border}40`}} />
                        </div>
                      </div>
                    </div>

                    <div style={{marginTop:12, display:'flex', gap:6, alignItems:'center'}}>
                      <div style={{width:28, height:12, borderRadius:20, background: t.colors.bg, border:`1px solid ${t.colors.border}50`, boxShadow:`inset 2px 2px 4px #bebebe60`}}><div style={{width:10, height:10, borderRadius:999, background:t.colors.accent, margin:'1px', transition:'all 0.3s'}} /></div>
                      <span style={{fontSize:8, color:'#9a9a9a', letterSpacing:'0.06em', fontWeight:600}}>THEME</span>
                    </div>
                  </button>
                )
              })}
            </div>
            )}

            {/* GLASS ADVANCED PANEL WITH 3 STORE PREVIEWS - ONLY PLACE FOR ADVANCED THEMES */}
            <div id="advanced-glass" style={{borderRadius:20}} className="mt-10 overflow-hidden border-2 border-black relative">
              <div className="absolute inset-0 bg-[#0c0e13]" />
              <div className="absolute inset-0 opacity-50" style={{background: 'radial-gradient(circle at 20% 10%, #E8FF86 0%, transparent 35%), radial-gradient(circle at 85% 85%, #7c3aed 0%, transparent 45%), radial-gradient(circle at 50% 50%, #ffffff08 0%, transparent 60%)'}} />
              <div className="relative p-6 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3"><span style={{borderRadius:999}} className="bg-[#E8FF86] text-black text-[10px] font-bold px-3 py-1 tracking-widest">ADVANCED</span><span className="text-white font-semibold text-[15px]">Glass Store Previews — Hover to Explore</span></div>
                  <div className="text-white/40 text-[11px] hidden md:inline">Hover spreads • Click selects • Save to apply</div>
                </div>

                <div className="glass-container mt-1">
                  {advancedThemes.map((t, i) => {
                    const r = [-18, 0, 18][i] || 0
                    const isActive = theme === t.id
                    return (
                      <div key={t.id} className={`glass ${isActive ? 'selected' : ''}`} data-text={t.name} style={{'--r': r} as any} onClick={() => setTheme(t.id)}>
                        {/* MINI STORE PREVIEW INSIDE GLASS */}
                        <div className="glass-preview-wrap">
                          {/* Header */}
                          <div className="glass-preview-header" style={{background: t.colors.bg, color: t.colors.text, borderBottom: `1px solid ${t.colors.border}`}}>
                            <span style={{fontWeight: 800}}>{t.id === 'sleek-beige' ? 'SLEEK' : t.id === 'sleek-dark' ? 'DARK' : 'EDITORIAL'}</span>
                            <span style={{opacity: 0.6, fontSize: 6}}>●●●</span>
                          </div>
                          {/* Body - different per theme */}
                          <div className="glass-preview-body" style={{background: t.colors.bg}}>
                            {t.id === 'sleek-beige' && (
                              <>
                                <div style={{height: 28, borderRadius: 6, background: t.colors.card, border: `1px solid ${t.colors.border}`, display: 'flex', alignItems: 'center', gap: 6, padding: '0 6px'}}>
                                  <div style={{width: 18, height: 18, borderRadius: 4, background: t.colors.accent}} />
                                  <div><div style={{width: 32, height: 4, borderRadius: 2, background: t.colors.text, opacity: 0.2}} /><div style={{width: 20, height: 3, borderRadius: 2, background: t.colors.text, opacity: 0.1, marginTop: 3}} /></div>
                                </div>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, flex: 1}}>
                                  {[1,2,3,4].map(k=><div key={k} style={{borderRadius: 6, background: t.colors.card, border: `1px solid ${t.colors.border}`, padding: 4}}><div style={{height: 20, borderRadius: 4, background: '#f3f3f3'}} /><div style={{height: 3, borderRadius: 2, background: t.colors.text, opacity: 0.15, marginTop: 4, width: '70%'}} /><div style={{height: 3, borderRadius: 2, background: t.colors.text, opacity: 0.08, marginTop: 2, width: '50%'}} /></div>)}
                                </div>
                              </>
                            )}
                            {t.id === 'sleek-dark' && (
                              <>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><div style={{width: 30, height: 4, borderRadius: 2, background: t.colors.text, opacity: 0.3}} /><div style={{width: 14, height: 10, borderRadius: 4, background: t.colors.accent}} /></div>
                                <div style={{flex: 1, borderRadius: 8, background: t.colors.card, border: `1px solid ${t.colors.border}`, padding: 6, display: 'flex', flexDirection: 'column', gap: 5}}>
                                  <div style={{height: 42, borderRadius: 6, background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)'}} />
                                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4}}>{[1,2,3].map(k=><div key={k} style={{height: 24, borderRadius: 4, background: t.colors.bg, border: `1px solid ${t.colors.border}`}} />)}</div>
                                </div>
                                <div style={{height: 12, borderRadius: 5, background: t.colors.text, opacity: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.colors.bg, fontSize: 5, fontWeight: 700}}>ORDER VIA WHATSAPP</div>
                              </>
                            )}
                            {t.id === 'sleek-editorial' && (
                              <>
                                <div style={{display: 'flex', gap: 6, flex: 1}}>
                                  <div style={{flex: 1.2, display: 'flex', flexDirection: 'column', gap: 5}}><div style={{height: 16, display: 'flex', flexDirection: 'column', gap: 2}}><div style={{height: 3, width: '80%', background: t.colors.text, opacity: 0.8, borderRadius: 2}} /><div style={{height: 3, width: '60%', background: t.colors.text, opacity: 0.2, borderRadius: 2}} /><div style={{height: 2, width: '90%', background: t.colors.text, opacity: 0.1, borderRadius: 2, marginTop: 2}} /></div><div style={{flex: 1, borderRadius: 6, background: t.colors.card, border: `1px solid ${t.colors.border}`, padding: 4}}><div style={{height: '100%', borderRadius: 4, background: '#eee'}} /></div></div>
                                  <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 4}}>{[1,2].map(k=><div key={k} style={{flex: 1, borderRadius: 6, background: t.colors.card, border: `1px solid ${t.colors.border}`, padding: 4}}><div style={{height: 18, borderRadius: 4, background: '#f5f5f5'}} /><div style={{height: 2, background: t.colors.text, opacity: 0.15, marginTop: 4, borderRadius: 2, width: '60%'}} /></div>)}</div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div style={{marginTop: 8, display: 'flex', alignItems: 'center', gap: 6}}>
                          <span style={{width: 20, height: 20, borderRadius: 6, background: t.colors.card, border: `1px solid rgba(255,255,255,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10}}>{t.badge}</span>
                          <span style={{fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em'}} className="uppercase">{t.tagline}</span>
                        </div>
                        {isActive && <div className="absolute top-3 right-3 w-5 h-5 bg-[#E8FF86] rounded-full flex items-center justify-center text-[10px] font-bold text-black shadow-lg">✓</div>}
                      </div>
                    )
                  })}
                </div>

                <div className="flex flex-wrap gap-2 mt-1 justify-center">
                  {advancedThemes.map(t => (
                    <div key={t.id} className={`text-[10px] px-3 py-1.5 rounded-full border transition-all ${theme===t.id ? 'bg-[#E8FF86] text-black border-[#E8FF86] font-bold shadow-[0_0_12px_rgba(232,255,134,0.3)]' : 'bg-white/10 text-white/60 border-white/10'}`}>{t.badge} {t.name}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 gap-2">{saved && <span className="h-11 px-4 flex items-center text-[12px] text-green-600 font-medium">✓ Saved! {getTheme(theme).name} applied</span>}<button onClick={saveStore} style={{borderRadius:10}} className="h-11 px-6 bg-black text-white text-[13px] font-medium hover:bg-zinc-800">Save Store & Theme</button></div>
          </div>
        </div>

        <div style={{borderRadius:20}} className="bg-white border overflow-hidden">
          <div className="p-6 border-b"><h2 className="font-semibold text-[14px]">Add Product — up to 5 photos</h2></div>
          <div className="p-6 space-y-4">
            <label style={{borderRadius:14}} className="border-2 border-dashed p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 transition min-h-[140px]">{previews.length ? <div className="grid grid-cols-3 gap-2 w-full">{previews.map((src,i)=><img key={i} src={src} style={{borderRadius:10}} className="w-full h-[70px] object-cover border" />)}</div> : <><div style={{borderRadius:10}} className="w-10 h-10 border flex items-center justify-center text-lg">+</div><div className="mt-3 font-medium text-[13px]">Upload up to 5 photos</div><div className="text-[11px] text-zinc-500 mt-1">First = cover photo</div></>}<input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" /></label>
            <input placeholder="Product name" value={prodName} onChange={e=>setProdName(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border focus:outline-none focus:ring-2 focus:ring-black text-[14px]" />
            <input placeholder="Price Rs." type="number" value={prodPrice} onChange={e=>setProdPrice(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border focus:outline-none focus:ring-2 focus:ring-black text-[14px]" />
            <div className="flex justify-end"><button onClick={addProduct} disabled={uploading} style={{borderRadius:10}} className="h-10 px-5 bg-black text-white text-[13px] font-medium hover:bg-zinc-800 disabled:opacity-50">{uploading ? 'Adding...' : `Add Product ${files.length?`(${files.length})`:''}`}</button></div>
          </div>
        </div>

        {products.length > 0 && (<div><h3 className="font-semibold text-[14px] mb-3">Your Products ({products.length})</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{products.map(p => (<div key={p.id} style={{borderRadius:20}} className="group bg-white border p-3 relative"><div className="relative"><img src={p.image_url} style={{borderRadius:12}} className="w-full h-36 object-cover" />{p.image_urls && p.image_urls.length > 1 && <span style={{borderRadius:999}} className="absolute top-2 left-2 bg-black/70 text-white text-[11px] px-2 py-0.5">+{p.image_urls.length}</span>}</div><div className="mt-3"><div className="font-medium text-[13px] truncate">{p.name}</div><div className="text-[13px] font-bold">Rs. {p.price}</div></div><div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition"><button onClick={()=>deleteProduct(p.id)} style={{borderRadius:10}} className="w-8 h-8 bg-white shadow border flex items-center justify-center text-xs hover:bg-red-50">🗑</button></div></div>))}</div></div>)}
      </main>

      <button onClick={logout} style={{borderRadius:999}} className="fixed bottom-6 right-6 z-50 h-11 px-6 bg-white border border-zinc-200 shadow-lg text-[13px] font-medium hover:bg-zinc-50 flex items-center gap-2"><span>Logout</span><span className="text-[14px]">↗</span></button>
    </div>
  )
}
