'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STORE_THEMES, getTheme, ThemeCategory, getAdvancedThemes } from '@/lib/storeThemes'

const TILL_ID = '984837533'

type Profile = { id: string; business_name: string; whatsapp_number: string; store_slug: string; store_theme?: string; current_plan?: string }
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
  const [activeTab, setActiveTab] = useState<'store' | 'themes' | 'products' | 'payments'>('store')
  const [copiedTill, setCopiedTill] = useState(false)
  const router = useRouter()

  const currentPlanId = (profile?.current_plan || 'basic') as 'basic' | 'advanced' | 'premium'
  const isPremium = currentPlanId === 'premium'
  const isAdvanced = currentPlanId === 'advanced' || isPremium

  useEffect(() => {
    const init = async () => {
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
        setProfile(prof)
        setBusinessName(prof.business_name || '')
        setWhatsapp(prof.whatsapp_number || '')
        setSlug(prof.store_slug || '')
        setTheme(prof.store_theme || 'clothing-noor')
        const { data: prods } = await supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
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
  }
  const copyLink = async () => { await navigator.clipboard.writeText(`https://dukaan-whats.vercel.app/s/${slug}`); setCopied(true); setTimeout(()=>setCopied(false), 2000) }
  const copyTill = async () => { await navigator.clipboard.writeText(TILL_ID); setCopiedTill(true); setTimeout(()=>setCopiedTill(false), 2000) }
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
  const filtered = (filter as string) === 'all' ? standardThemes : (filter as string) === 'advanced' ? [] : STORE_THEMES.filter(t => (t.category as string) === (filter as string) && t.category !== 'advanced')

  // PLAN CONFIG - SINGLE SOURCE OF TRUTH FOR HEADER PILL
  const planConfig = {
    basic: { label: 'BASIC', prod: '5 prod', img: '1 img', adv: '3 Adv', prem: '0 Prem' },
    advanced: { label: 'ADVANCED', prod: '25 prod', img: '5 img', adv: '8 Adv', prem: '0 Prem' },
    premium: { label: 'PREMIUM', prod: '∞ prod', img: '∞ img', adv: 'All Adv', prem: '3 Prem' },
  }[currentPlanId]

  return (
    <div style={{minHeight:'100vh',background:'#F8F7F5'}} className="text-zinc-900 pb-24">
      <style>{\`
        .no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        .glass-container { position: relative; display: flex; justify-content: center; align-items: center; min-height: 380px; padding: 40px 0 60px; gap: 0; }
        .glass-container .glass { position: relative; width: 260px; height: 320px; background: linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 100%); border: 1px solid rgba(255,255,255,0.18); box-shadow: 0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2); display: flex; justify-content: flex-start; align-items: center; flex-direction: column; transition: all 0.5s cubic-bezier(0.23,1,0.32,1); border-radius: 20px; margin: 0 -50px; backdrop-filter: blur(18px); transform: rotate(calc(var(--r) * 1deg)) translateY(0); cursor: pointer; overflow: hidden; padding-top: 16px; }
        .glass-container .glass:hover { transform: rotate(0deg) translateY(-12px) scale(1.05); margin: 0 20px; box-shadow: 0 30px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(232,255,134,0.3), inset 0 1px 0 rgba(255,255,255,0.3); border-color: rgba(232,255,134,0.4); z-index: 10; }
        .glass-container .glass::before { content: attr(data-text); position: absolute; bottom: 0; width: 100%; height: 48px; background: rgba(255,255,255,0.08); border-top: 1px solid rgba(255,255,255,0.15); display: flex; justify-content: center; align-items: center; color: #fff; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; backdrop-filter: blur(10px); }
        .glass-container .glass.selected { background: linear-gradient(180deg, rgba(232,255,134,0.25) 0%, rgba(255,255,255,0.05) 100%); border: 2px solid #E8FF86; transform: rotate(0deg) translateY(-16px) scale(1.08); margin: 0 22px; z-index: 20; box-shadow: 0 30px 60px rgba(0,0,0,0.4), 0 0 30px rgba(232,255,134,0.5); }
        .glass-lock-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.78) 100%); backdrop-filter: blur(12px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; z-index: 10; border-radius: 20px; }
        .glass-lock-icon { width: 52px; height: 52px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .glass-preview-wrap { width: 92%; height: 208px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.15); display: flex; flex-direction: column; background: #fff; }
        .neumorph-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 32px; padding: 40px 20px; background: #e0e0e0; border-radius: 24px; }
        .card { width: 190px; height: 254px; border-radius: 50px; background: #e0e0e0; box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff; display: flex; flex-direction: column; align-items: center; padding: 22px 16px 18px; cursor: pointer; transition: all 0.35s; position: relative; margin: 0 auto; overflow: hidden; }
        .card.selected { box-shadow: inset 10px 10px 20px #bebebe, inset -10px -10px 20px #ffffff, 0 0 0 2px #E8FF86; transform: translateY(-8px) scale(1.03); }
        .modern-tab-pill { display: flex; background: #0A0A0A; border-radius: 999px; padding: 4px; gap: 2px; }
        .modern-tab { height: 36px; padding: 0 18px; border-radius: 999px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 7px; }
        .modern-tab-active { background: #FFFFFF; color: #0A0A0A; }
        .modern-tab-inactive { color: rgba(255,255,255,0.6); }
        .pro-glow-btn{ background:#E8FF86; color:#0A0A0A; border-radius:999px; height:36px; padding:0 18px; font-size:13px; font-weight:700; display:flex; align-items:center; gap:8px; }
        @media (max-width: 768px) { .glass-container .glass { width: 155px; height: 220px; margin: 0 -22px; } .neumorph-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 20px 10px; } .card { max-width: 165px; height: 220px; border-radius: 32px; } }
      \`}</style>

      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-[60px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2"><div className="w-8 h-8 bg-black text-white rounded-[10px] flex items-center justify-center font-bold">D</div><span className="font-semibold text-[14px]">DukaanWhats.pk</span></Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white shadow-sm text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
              {planConfig.label} • {planConfig.prod} • {planConfig.img} • {planConfig.adv} • {planConfig.prem}
            </div>
            <button onClick={copyLink} className="h-9 px-4 border bg-white rounded-[10px] text-[12px]">{copied?'Copied!':'Copy Link'}</button>
            <Link href={slug ? \`/s/${slug}\` : '#'} target="_blank" className="h-9 px-4 bg-black text-white rounded-[10px] text-[12px] flex items-center">View Store ↗</Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pt-5">
        <div className="flex items-center gap-3">
          <div className="modern-tab-pill">
            <button onClick={()=>setActiveTab('store')} className={\`modern-tab \${activeTab==='store'?'modern-tab-active':'modern-tab-inactive'}\`}>Store</button>
            <button onClick={()=>setActiveTab('themes')} className={\`modern-tab \${activeTab==='themes'?'modern-tab-active':'modern-tab-inactive'}\`}>Themes</button>
            <button onClick={()=>setActiveTab('products')} className={\`modern-tab \${activeTab==='products'?'modern-tab-active':'modern-tab-inactive'}\`}>Products {products.length}/5</button>
          </div>
          <button onClick={()=>setActiveTab('payments')} className="pro-glow-btn">PRO • Till {TILL_ID}</button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {activeTab==='store' && (
          <div className="bg-white p-6 border rounded-[20px]">
            <h2 className="font-semibold text-[15px]">Store Identity</h2>
            <div className="grid md:grid-cols-3 gap-4 mt-5">
              <div><label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Business Name</label><input value={businessName} onChange={e=>setBusinessName(e.target.value)} className="mt-2 w-full h-11 px-4 border rounded-[12px] bg-zinc-50 text-[14px] outline-none focus:bg-white focus:border-black" /></div>
              <div><label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Store Slug</label><input value={slug} onChange={e=>setSlug(e.target.value)} className="mt-2 w-full h-11 px-4 border rounded-[12px] bg-zinc-50 font-mono text-[13px] outline-none focus:bg-white focus:border-black" /></div>
              <div><label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">WhatsApp</label><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} className="mt-2 w-full h-11 px-4 border rounded-[12px] bg-zinc-50 text-[14px] outline-none focus:bg-white focus:border-black" /></div>
            </div>
            <div className="flex justify-end mt-6 gap-2">{saved && <span className="h-11 px-4 flex items-center text-[12px] text-green-600">✓ Saved!</span>}<button onClick={saveStore} className="h-11 px-7 bg-black text-white rounded-full text-[13px]">Save Store →</button></div>
          </div>
        )}

        {activeTab==='themes' && (
          <div className="bg-white p-5 border rounded-[20px]">
            <h2 className="font-bold text-[14px]">Themes — {currentPlanId.toUpperCase()} Plan</h2>
            <div className="mt-5">
              <div className="text-[12px] font-black tracking-widest bg-black text-white px-2.5 py-1 rounded-full inline-block">8 ADVANCED THEMES</div>
              <div className="neumorph-grid mt-3">
                {STORE_THEMES.filter(t=>t.category==='advanced').slice(0,8).map(t=>{
                  const isActive = theme===t.id
                  const locked = currentPlanId==='basic' && !['sleek-beige','sleek-dark','sleek-editorial'].includes(t.id) ? false : false
                  return (
                    <button key={t.id} onClick={()=>setTheme(t.id)} className={\`card \${isActive?'selected':''}\`}>
                      <div className="w-[54px] h-[54px] rounded-[18px] flex items-center justify-center text-[22px] mb-3" style={{background:t.colors.bg}}>{t.badge}</div>
                      <div className="text-[13px] font-bold">{t.name}</div>
                      <div className="text-[9px] opacity-60 uppercase tracking-widest mt-1">{t.category} • ADVANCED</div>
                      <div className="w-full h-[78px] rounded-[18px] mt-3 flex p-2 gap-2" style={{background:'#e0e0e0',boxShadow:'inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff'}}><div className="w-9 h-full rounded-[12px]" style={{background:t.colors.accent}} /></div>
                      {isActive && <div className="absolute top-3 right-3 w-5 h-5 bg-[#E8FF86] rounded-full flex items-center justify-center text-[10px] font-bold">✓</div>}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-10 overflow-hidden border-2 border-black relative rounded-[20px]"><div className="absolute inset-0 bg-[#0c0e13]" /><div className="absolute inset-0 opacity-50" style={{background:'radial-gradient(circle at 20% 10%, #E8FF86 0%, transparent 35%), radial-gradient(circle at 85% 85%, #7c3aed 0%, transparent 45%)'}} /><div className="relative p-6"><div className="flex items-center gap-3"><span className="bg-[#E8FF86] text-black text-[10px] font-bold px-3 py-1 rounded-full">3 PREMIUM GLASS THEMES</span><span className="text-white font-semibold text-[14px]">Premium Only — Glossy Glass Lock</span></div><div className="glass-container mt-2">{advancedThemes.map((t,i)=>{const r=[-14,0,14][i]||0; const isActive=theme===t.id; return <div key={t.id} className={\`glass \${isActive?'selected':''}\`} data-text={t.name} style={{'--r':r} as any} onClick={()=>setTheme(t.id)}><div className="glass-preview-wrap"><div className="h-[208px] bg-white flex items-center justify-center">{t.badge}</div></div>{isActive && <div className="absolute top-3 right-3 w-6 h-6 bg-[#E8FF86] rounded-full flex items-center justify-center text-[11px] font-bold">✓</div>}</div>})}</div></div></div>
            <div className="flex justify-end mt-6"><button onClick={saveStore} className="h-11 px-6 bg-black text-white rounded-full text-[13px]">Save Theme</button></div>
          </div>
        )}

        {activeTab==='products' && (
          <div className="bg-white border rounded-[20px] p-5">
            <h2 className="font-semibold text-[14px]">Add Product — {products.length}/5</h2>
            <label className="mt-4 border-2 border-dashed rounded-[16px] p-4 flex flex-col items-center justify-center cursor-pointer bg-zinc-50/50 min-h-[120px]">
              <input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
              {previews.length ? <div className="grid grid-cols-5 gap-2 w-full">{previews.map((s,i)=><img key={i} src={s} className="w-full h-[60px] object-cover rounded-[10px] border" />)}</div> : <div className="text-center"><div className="w-11 h-11 bg-black text-white rounded-[12px] flex items-center justify-center mx-auto">+</div><div className="mt-2 text-[13px] font-medium">Upload up to 5 photos</div></div>}
            </label>
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <input placeholder="Product name" value={prodName} onChange={e=>setProdName(e.target.value)} className="h-11 px-4 border rounded-[12px] bg-zinc-50 text-[13px] outline-none focus:bg-white focus:border-black" />
              <input placeholder="Price Rs. 3500" type="number" value={prodPrice} onChange={e=>setProdPrice(e.target.value)} className="h-11 px-4 border rounded-[12px] bg-zinc-50 text-[13px] outline-none focus:bg-white focus:border-black" />
            </div>
            <div className="flex justify-end mt-4"><button onClick={addProduct} disabled={uploading} className="h-11 px-7 bg-black text-white rounded-full text-[13px]">{uploading?'Uploading...':'Add Product →'}</button></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">{products.map(p=>(<div key={p.id} className="bg-white border rounded-[16px] p-2.5"><img src={p.image_url} className="w-full h-32 object-cover rounded-[10px]" /><div className="mt-2 text-[12px] font-medium truncate">{p.name}</div><div className="text-[12px] font-bold">Rs. {p.price}</div><button onClick={()=>deleteProduct(p.id)} className="mt-2 w-full h-8 bg-zinc-100 rounded-full text-[11px]">Delete</button></div>))}</div>
          </div>
        )}

        {activeTab==='payments' && (
          <div className="bg-white border rounded-[24px] p-6">
            <h2 className="font-black text-[18px]">Upgrade — Till ID {TILL_ID}</h2>
            <div className="mt-6 grid md:grid-cols-[360px_1fr] gap-6">
              <div className="rounded-[20px] overflow-hidden border bg-[#0B0B1A] text-white p-5 text-center"><div className="text-[10px] tracking-widest opacity-40">JAZZCASH TILL ID</div><div className="text-[36px] font-black tracking-widest mt-1">{TILL_ID}</div><div className="bg-white rounded-[12px] p-3 mt-4"><img src={\`https://barcodeapi.org/api/code128/\${TILL_ID}\`} className="w-full h-[52px] object-contain"/><div className="text-black font-mono text-[11px] font-bold tracking-[0.3em]">{TILL_ID}</div></div><div className="bg-white rounded-[14px] p-2.5 flex justify-center mt-3"><img src={\`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=JAZZCASH_TILL_\${TILL_ID}\`} className="w-[120px] h-[120px]"/></div><button onClick={copyTill} className="mt-3 w-full h-9 bg-white/10 border border-white/10 rounded-full text-[11px]">{copiedTill?'Copied!':'Copy Till ID'}</button></div>
              <div className="space-y-3">
                <div className="border-2 rounded-[16px] p-4 flex justify-between items-center bg-zinc-50"><div><div className="font-black text-[14px]">Basic — Rs. 0</div><div className="text-[11px] opacity-60">5 products • 1 image • 3 Advanced • 0 Premium</div></div><span className="bg-black text-white text-[10px] px-2 py-1 rounded-full">CURRENT</span></div>
                <div className="border-2 rounded-[16px] p-4 flex justify-between items-center"><div><div className="font-black text-[14px]">Advanced — Rs. 899/mo</div><div className="text-[11px] opacity-60">25 products • 5 images • All 8 Advanced</div></div></div>
                <div className="border-2 rounded-[16px] p-4 flex justify-between items-center"><div><div className="font-black text-[14px]">Premium — Rs. 2999/mo</div><div className="text-[11px] opacity-60">Unlimited • All themes + No watermark</div></div></div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
