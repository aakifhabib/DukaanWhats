'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STORE_THEMES, getTheme, ThemeCategory } from '@/lib/storeThemes'

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

  const filtered = filter === 'all' ? STORE_THEMES : STORE_THEMES.filter(t => t.category === filter)
  const currentTheme = getTheme(theme)

  return (
    <div style={{minHeight:'100vh',background:'#F8F7F5'}} className="text-zinc-900 pb-24">
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
          <div style={{borderRadius:20}} className="bg-white p-6 border"><div className="text-[11px] text-zinc-500 font-semibold uppercase tracking-widest">Theme</div><div className="text-[14px] font-bold mt-3 flex items-center gap-2"><span>{currentTheme.badge}</span>{currentTheme.name}</div></div>
          <div style={{borderRadius:20}} className="bg-black text-white p-6 flex flex-col justify-between"><div className="text-[11px] text-zinc-400 font-semibold uppercase tracking-widest">Store Link</div><div className="flex items-center justify-between mt-3 gap-2"><div className="text-[13px] font-medium truncate">/s/{slug}</div><button onClick={copyLink} style={{borderRadius:10}} className="shrink-0 h-8 px-3 bg-white/15 text-xs font-medium hover:bg-white/25">{copied ? '✓ Copied' : 'Copy'}</button></div></div>
        </div>

        <div style={{borderRadius:20}} className="bg-white border overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b"><h2 className="font-semibold text-[14px]">Store Identity & Theme</h2>{saved && <span style={{borderRadius:999}} className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 text-xs font-medium">Saved ✓</span>}</div>
          <div className="p-6 space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div><label className="text-[13px] font-medium">Business Name</label><input value={businessName} onChange={e=>setBusinessName(e.target.value)} style={{borderRadius:12}} className="mt-2 w-full h-11 px-4 border bg-white focus:outline-none focus:ring-2 focus:ring-black text-[14px]" placeholder="Noor Fabrics" /></div>
              <div><label className="text-[13px] font-medium">WhatsApp Number</label><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} style={{borderRadius:12}} className="mt-2 w-full h-11 px-4 border bg-white focus:outline-none focus:ring-2 focus:ring-black text-[14px]" placeholder="923001234567" /></div>
              <div><label className="text-[13px] font-medium">Store Slug</label><div className="mt-2 flex items-center gap-2"><span className="text-[13px] text-zinc-500">/s/</span><input value={slug} onChange={e=>setSlug(e.target.value)} style={{borderRadius:12}} className="flex-1 h-11 px-4 border bg-white focus:outline-none focus:ring-2 focus:ring-black text-[14px]" /></div></div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <label className="text-[13px] font-semibold">Choose Theme — 8 Premium Niche Designs</label>
                <div className="flex flex-wrap gap-1.5">
                  {(['all','food','clothing','tech','shoes'] as const).map(c => (
                    <button key={c} onClick={()=>setFilter(c)} style={{borderRadius:999}} className={`h-7 px-3 text-[11px] font-medium capitalize border ${filter===c ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'}`}>{c}</button>
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

              <div className="flex justify-end pt-4"><button onClick={saveStore} style={{borderRadius:10}} className="h-11 px-6 bg-black text-white text-[13px] font-medium hover:bg-zinc-800">Save Store & Theme</button></div>
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
