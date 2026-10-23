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
  const [filter, setFilter] = useState<ThemeCategory | 'all'>('all')
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
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

  const copyLink = async () => {
    await navigator.clipboard.writeText(`https://dukaan-whats.vercel.app/s/${slug}`)
    setCopied(true); setTimeout(()=>setCopied(false), 2000)
  }
  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }
  const handleFile = (e: any) => {
    const sel = Array.from(e.target.files || []) as File[]
    if (sel.length > 5) { alert('Max 5'); return }
    setFiles(sel); setPreviews(sel.map(f => URL.createObjectURL(f)))
  }
  const uploadOne = async (file: File) => {
    if (!profile) return ''
    const name = `${profile.id}/${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage.from('product-images').upload(name, file)
    if (error || !data) return ''
    return supabase.storage.from('product-images').getPublicUrl(name).data.publicUrl
  }
  const addProduct = async () => {
    if (!profile || !prodName || !prodPrice || files.length === 0) { alert('Name, price, photo required'); return }
    setUploading(true)
    try {
      const urls = (await Promise.all(files.map(uploadOne))).filter(Boolean)
      if (!urls.length) throw new Error('Upload failed')
      let { data, error } = await supabase.from('products').insert({ user_id: profile.id, name: prodName, price: Number(prodPrice), image_url: urls[0], image_urls: urls }).select().single()
      if (error && error.message.includes('image_urls')) {
        const fb = await supabase.from('products').insert({ user_id: profile.id, name: prodName, price: Number(prodPrice), image_url: urls[0] }).select().single()
        data = fb.data; error = fb.error
      }
      if (error) throw error
      if (data) setProducts([data, ...products])
      setProdName(''); setProdPrice(''); setFiles([]); setPreviews([])
    } catch (e: any) { alert(e.message) }
    setUploading(false)
  }
  const deleteProduct = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('products').delete().eq('id', id); setProducts(products.filter(p => p.id !== id)) }

  if (loading) return <div style={{minHeight:'100vh',background:'#F8F7F5',display:'flex',alignItems:'center',justifyContent:'center'}} className="text-[13px]">Loading store...</div>

  const standardThemes = STORE_THEMES.filter(t => t.category !== 'advanced')
  const advancedThemes = getAdvancedThemes()
  const filtered = filter === 'all' ? standardThemes : STORE_THEMES.filter(t => t.category === filter)

  // icons for glass
  const icons: Record<string, string> = {
    'sleek-beige': '○',
    'sleek-dark': '●',
    'sleek-editorial': '—'
  }

  return (
    <div style={{minHeight:'100vh',background:'#F8F7F5'}} className="text-zinc-900 pb-24">
      <style>{`
        .glass-container {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 260px;
          padding: 20px 0 40px;
        }
        .glass-container .glass {
          position: relative;
          width: 190px;
          height: 220px;
          background: linear-gradient(rgba(255,255,255,0.15), transparent);
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 25px 25px rgba(0,0,0,0.25);
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          transition: 0.5s;
          border-radius: 16px;
          margin: 0 -35px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transform: rotate(calc(var(--r) * 1deg));
          cursor: pointer;
          overflow: hidden;
        }
        .glass-container:hover .glass {
          transform: rotate(0deg);
          margin: 0 12px;
        }
        .glass-container .glass::before {
          content: attr(data-text);
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 44px;
          background: rgba(255,255,255,0.08);
          border-top: 1px solid rgba(255,255,255,0.1);
          display: flex;
          justify-content: center;
          align-items: center;
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
        }
        .glass-container .glass .glass-icon {
          font-size: 2.6em;
          color: #fff;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
          margin-top: -18px;
        }
        .glass-container .glass .glass-tagline {
          font-size: 10px;
          color: rgba(255,255,255,0.6);
          margin-top: 8px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .glass-container .glass.selected {
          background: linear-gradient(rgba(232,255,134,0.25), rgba(255,255,255,0.05));
          border: 2px solid #E8FF86;
          box-shadow: 0 25px 35px rgba(0,0,0,0.35), 0 0 30px rgba(232,255,134,0.25);
          transform: rotate(0deg) translateY(-10px) scale(1.05);
          margin: 0 12px;
          z-index: 10;
        }
        .glass-container .glass.selected::before {
          background: #E8FF86;
          color: #000;
          font-weight: 700;
        }
        @media (max-width: 768px) {
          .glass-container .glass {
            width: 110px;
            height: 150px;
            margin: 0 -15px;
          }
          .glass-container:hover .glass {
            margin: 0 6px;
          }
          .glass-container .glass .glass-icon { font-size: 1.8em; margin-top: -10px; }
          .glass-container .glass::before { height: 32px; font-size: 9px; }
        }
      `}</style>

      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div style={{borderRadius:10}} className="w-9 h-9 bg-black text-white flex items-center justify-center font-bold">D</div>
            <span className="font-semibold tracking-tight text-[14px] md:text-[15px]">DukaanWhats.pk</span>
          </Link>
          <div className="flex items-center gap-1.5 md:gap-2">
            <button onClick={copyLink} style={{borderRadius:10}} className="h-9 md:h-10 px-3 md:px-4 border bg-white text-[12px] md:text-[13px] font-medium hover:bg-zinc-50">{copied ? 'Copied!' : 'Copy Link'}</button>
            <Link href={`/s/${slug}`} target="_blank" style={{borderRadius:10}} className="h-9 md:h-10 px-3 md:px-5 bg-black text-white text-[12px] md:text-[13px] font-medium flex items-center hover:bg-zinc-800">View Store</Link>
          </div>
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
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <label className="text-[13px] font-semibold">Choose Theme — {filtered.length} designs</label>
              <div className="flex flex-wrap gap-1.5">
                {(['all','food','clothing','tech','shoes','advanced'] as const).map(c => (
                  <button key={c} onClick={()=>setFilter(c)} style={{borderRadius:999}} className={`h-7 px-3 text-[11px] font-medium capitalize border ${filter===c ? 'bg-black text-white border-black' : c==='advanced' ? 'bg-[#0A0A0A] text-white border-black' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}>{c}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {filtered.map(t => {
                const isActive = theme === t.id
                return (
                  <button key={t.id} onClick={()=>setTheme(t.id)} style={{borderRadius:16, background: t.colors.bg, borderColor: isActive ? '#E8FF86' : '#E5E7EB', borderWidth: isActive ? 2 : 1}} className={`relative text-left p-4 border overflow-hidden transition-all hover:scale-[1.01] ${isActive ? 'shadow-[0_0_20px_rgba(232,255,134,0.4)]' : 'hover:shadow-md'}`}>
                    {isActive && <span style={{borderRadius:999}} className="absolute top-2 right-2 w-5 h-5 bg-[#E8FF86] text-black flex items-center justify-center text-[11px] font-bold">✓</span>}
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{borderRadius:8, background: t.colors.card, borderColor: t.colors.accent}} className="w-8 h-8 border flex items-center justify-center text-[14px]">{t.badge}</span>
                      <div><div style={{color: t.colors.text}} className="text-[13px] font-bold leading-none">{t.name}</div><div style={{color: t.colors.sub}} className="text-[10px] uppercase tracking-widest mt-1">{t.category}</div></div>
                    </div>
                    <div style={{borderRadius:10, background: t.colors.card}} className="h-16 border p-2 flex gap-1.5 overflow-hidden">
                      <div style={{background: t.colors.accent, borderRadius:8}} className="w-12 h-full opacity-80" />
                      <div className="flex-1 space-y-1.5">
                        <div style={{background: t.colors.text, borderRadius:4}} className="h-2 w-3/4 opacity-20" />
                        <div style={{background: t.colors.text, borderRadius:4}} className="h-2 w-1/2 opacity-10" />
                        <div style={{background: t.colors.accent, borderRadius:6}} className="h-5 w-16 mt-1" />
                      </div>
                    </div>
                    <div style={{color: t.colors.sub}} className="text-[11px] mt-2 leading-snug">{t.tagline}</div>
                  </button>
                )
              })}
            </div>

            {/* GLASS ADVANCED PANEL */}
            <div style={{borderRadius:20}} className="mt-10 overflow-hidden border-2 border-black relative">
              <div className="absolute inset-0 bg-[#0d0f14]" />
              <div className="absolute inset-0 opacity-40" style={{background: 'radial-gradient(circle at 30% 20%, #E8FF86 0%, transparent 40%), radial-gradient(circle at 80% 80%, #7000ff 0%, transparent 50%)'}} />
              <div className="relative p-6 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span style={{borderRadius:999}} className="bg-[#E8FF86] text-black text-[10px] font-bold px-3 py-1 tracking-widest">ADVANCED</span>
                    <span className="text-white font-semibold text-[15px]">Glass Select — 3 Minimal Themes</span>
                    <span className="text-white/40 text-[11px] hidden md:inline">Hover to spread • Click to select</span>
                  </div>
                  <div className="text-white/50 text-[11px]">Selected: <span className="text-[#E8FF86] font-bold">{getTheme(theme).name}</span></div>
                </div>

                <div className="glass-container mt-2">
                  {advancedThemes.map((t, i) => {
                    const r = [-18, 0, 18][i] || 0
                    const isActive = theme === t.id
                    return (
                      <div
                        key={t.id}
                        className={`glass ${isActive ? 'selected' : ''}`}
                        data-text={t.name}
                        style={{'--r': r} as any}
                        onClick={() => setTheme(t.id)}
                      >
                        <div className="glass-icon">{icons[t.id] || t.badge}</div>
                        <div className="glass-tagline">{t.tagline}</div>
                        {isActive && <div className="absolute top-3 right-3 w-5 h-5 bg-[#E8FF86] rounded-full flex items-center justify-center text-[10px] font-bold text-black">✓</div>}
                      </div>
                    )
                  })}
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {advancedThemes.map(t => (
                    <div key={t.id} className={`text-[10px] px-3 py-1.5 rounded-full border ${theme===t.id ? 'bg-[#E8FF86] text-black border-[#E8FF86] font-bold' : 'bg-white/10 text-white/60 border-white/10'}`}>{t.badge} {t.name} — {t.tagline}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 gap-2">
              {saved && <span className="h-11 px-4 flex items-center text-[12px] text-green-600 font-medium">✓ Saved! {getTheme(theme).name} applied</span>}
              <button onClick={saveStore} style={{borderRadius:10}} className="h-11 px-6 bg-black text-white text-[13px] font-medium hover:bg-zinc-800">Save Store & Theme</button>
            </div>
          </div>
        </div>

        <div style={{borderRadius:20}} className="bg-white border overflow-hidden">
          <div className="p-6 border-b"><h2 className="font-semibold text-[14px]">Add Product — up to 5 photos</h2></div>
          <div className="p-6 space-y-4">
            <label style={{borderRadius:14}} className="border-2 border-dashed p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 transition min-h-[140px]">
              {previews.length ? <div className="grid grid-cols-3 gap-2 w-full">{previews.map((src,i)=><img key={i} src={src} style={{borderRadius:10}} className="w-full h-[70px] object-cover border" />)}</div> : <><div style={{borderRadius:10}} className="w-10 h-10 border flex items-center justify-center text-lg">+</div><div className="mt-3 font-medium text-[13px]">Upload up to 5 photos</div><div className="text-[11px] text-zinc-500 mt-1">First = cover photo</div></>}
              <input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
            </label>
            <input placeholder="Product name" value={prodName} onChange={e=>setProdName(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border focus:outline-none focus:ring-2 focus:ring-black text-[14px]" />
            <input placeholder="Price Rs." type="number" value={prodPrice} onChange={e=>setProdPrice(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border focus:outline-none focus:ring-2 focus:ring-black text-[14px]" />
            <div className="flex justify-end"><button onClick={addProduct} disabled={uploading} style={{borderRadius:10}} className="h-10 px-5 bg-black text-white text-[13px] font-medium hover:bg-zinc-800 disabled:opacity-50">{uploading ? 'Adding...' : `Add Product ${files.length?`(${files.length})`:''}`}</button></div>
          </div>
        </div>

        {products.length > 0 && (
          <div><h3 className="font-semibold text-[14px] mb-3">Your Products ({products.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map(p => (
                <div key={p.id} style={{borderRadius:20}} className="group bg-white border p-3 relative">
                  <div className="relative"><img src={p.image_url} style={{borderRadius:12}} className="w-full h-36 object-cover" />{p.image_urls && p.image_urls.length > 1 && <span style={{borderRadius:999}} className="absolute top-2 left-2 bg-black/70 text-white text-[11px] px-2 py-0.5">+{p.image_urls.length}</span>}</div>
                  <div className="mt-3"><div className="font-medium text-[13px] truncate">{p.name}</div><div className="text-[13px] font-bold">Rs. {p.price}</div></div>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition"><button onClick={()=>deleteProduct(p.id)} style={{borderRadius:10}} className="w-8 h-8 bg-white shadow border flex items-center justify-center text-xs hover:bg-red-50">🗑</button></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <button onClick={logout} style={{borderRadius:999}} className="fixed bottom-6 right-6 z-50 h-11 px-6 bg-white border border-zinc-200 shadow-lg text-[13px] font-medium hover:bg-zinc-50 flex items-center gap-2">
        <span>Logout</span><span className="text-[14px]">↗</span>
      </button>
    </div>
  )
}
