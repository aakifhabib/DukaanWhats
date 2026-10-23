'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Profile = { id: string; business_name: string; whatsapp_number: string; store_slug: string }
type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; user_id: string }

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [businessName, setBusinessName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [slug, setSlug] = useState('')
  const [saved, setSaved] = useState(false)
  const [prodName, setProdName] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [editProd, setEditProd] = useState<Product | null>(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [copied, setCopied] = useState(false)
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
      store_slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    }).eq('id', profile.id)
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2500) }
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(`https://dukaan-whats.vercel.app/s/${slug}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  const handleFile = (e: any) => {
    const sel = Array.from(e.target.files || []) as File[]
    if (sel.length > 5) { alert('Max 5 images'); return }
    setFiles(sel); setPreviews(sel.map(f => URL.createObjectURL(f)))
  }

  const uploadOne = async (file: File) => {
    if (!profile) return ''
    const fileName = `${profile.id}/${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage.from('product-images').upload(fileName, file)
    if (error || !data) return ''
    const { data: pub } = supabase.storage.from('product-images').getPublicUrl(fileName)
    return pub.publicUrl
  }

  const addProduct = async () => {
    if (!profile || !prodName || !prodPrice || files.length === 0) { alert('Name, price, 1 photo required'); return }
    setUploading(true)
    try {
      const urls = (await Promise.all(files.map(uploadOne))).filter(Boolean)
      if (urls.length === 0) throw new Error('Upload failed - check product-images bucket is public')
      
      // FIX: DB with fallback if image_urls column missing
      let data, error
      const attempt = await supabase.from('products').insert({
        user_id: profile.id, name: prodName, price: Number(prodPrice),
        image_url: urls[0], image_urls: urls
      }).select().single()
      data = attempt.data; error = attempt.error

      if (error && error.message.includes('image_urls')) {
        // column doesn't exist yet -> insert old way
        const fallback = await supabase.from('products').insert({
          user_id: profile.id, name: prodName, price: Number(prodPrice), image_url: urls[0]
        }).select().single()
        data = fallback.data; error = fallback.error
      }
      if (error) throw error
      if (data) setProducts([data, ...products])
      setProdName(''); setProdPrice(''); setFiles([]); setPreviews([])
    } catch (e: any) { alert('DB Error: ' + e.message) }
    setUploading(false)
  }

  const openEdit = (p: Product) => { setEditProd(p); setEditName(p.name); setEditPrice(String(p.price)) }
  const saveEdit = async () => {
    if (!editProd) return
    const { data } = await supabase.from('products').update({ name: editName, price: Number(editPrice) }).eq('id', editProd.id).select().single()
    if (data) setProducts(products.map(pr => pr.id === data.id ? data : pr))
    setEditProd(null)
  }
  const deleteProduct = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('products').delete().eq('id', id); setProducts(products.filter(p => p.id !== id)) }

  if (loading) return <div style={{minHeight:'100vh',background:'#F8F7F5',display:'flex',alignItems:'center',justifyContent:'center'}} className="text-">Loading store...</div>
  const totalValue = products.reduce((s, p) => s + (p.price || 0), 0)

  return (
    <div style={{minHeight:'100vh',background:'#F8F7F5'}} className="text-zinc-900">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3"><div style={{borderRadius:10}} className="w-9 h-9 bg-black text-white flex items-center justify-center font-bold">D</div><span className="font-semibold tracking-tight">DukaanWhats.pk</span></div>
          <div className="flex items-center gap-2">
            <button onClick={copyLink} style={{borderRadius:10}} className="h-10 px-4 border bg-white text- font-medium hover:bg-zinc-50">{copied ? 'Copied!' : 'Copy Link'}</button>
            <Link href={`/s/${slug}`} target="_blank" style={{borderRadius:10}} className="h-10 px-5 bg-black text-white text- font-medium flex items-center hover:bg-zinc-800">View Store</Link>
            <button onClick={logout} style={{borderRadius:10}} className="h-10 px-4 bg-zinc-100 border border-zinc-200 text- font-medium hover:bg-zinc-200">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div style={{borderRadius:20}} className="bg-white p-6 border"><div className="text- text-zinc-500 font-semibold uppercase tracking-widest">Products</div><div className="text-2xl font-bold mt-3">{products.length}</div></div>
          <div style={{borderRadius:20}} className="bg-white p-6 border"><div className="text- text-zinc-500 font-semibold uppercase tracking-widest">Total Value</div><div className="text-2xl font-bold mt-3">Rs. {totalValue}</div></div>
          <div style={{borderRadius:20}} className="bg-black text-white p-6 flex flex-col justify-between"><div className="text- text-zinc-400 font-semibold uppercase tracking-widest">Store Link</div><div className="flex items-center justify-between mt-3"><div className="text- font-medium truncate">/s/{slug}</div><button onClick={copyLink} style={{borderRadius:10}} className="ml-3 h-8 px-3 bg-white/15 text-xs font-medium hover:bg-white/25">{copied ? '✓ Copied' : 'Copy'}</button></div></div>
        </div>

        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6">
          <div style={{borderRadius:20}} className="bg-white border overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b"><h2 className="font-semibold text-">Store Identity</h2>{saved && <span style={{borderRadius:999}} className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 text-xs font-medium">Saved ✓</span>}</div>
            <div className="p-6 space-y-4">
              <div><label className="text- font-medium">Business Name</label><input value={businessName} onChange={e => setBusinessName(e.target.value)} style={{borderRadius:12}} className="mt-2 w-full h-11 px-4 border bg-white focus:outline-none focus:ring-2 focus:ring-black" placeholder="Ayesha Boutique" /></div>
              <div><label className="text- font-medium">WhatsApp Number</label><input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} style={{borderRadius:12}} className="mt-2 w-full h-11 px-4 border bg-white focus:outline-none focus:ring-2 focus:ring-black" placeholder="923001234567" /></div>
              <div><label className="text- font-medium">Store Slug</label><div className="mt-2 flex items-center gap-2"><span className="text- text-zinc-500">/s/</span><input value={slug} onChange={e => setSlug(e.target.value)} style={{borderRadius:12}} className="flex-1 h-11 px-4 border bg-white focus:outline-none focus:ring-2 focus:ring-black" /></div></div>
              <div className="flex justify-end pt-2"><button onClick={saveStore} style={{borderRadius:10}} className="h-10 px-5 bg-black text-white text- font-medium hover:bg-zinc-800">Save Store</button></div>
            </div>
          </div>
          <div style={{borderRadius:20}} className="bg-white border p-6"><div className="text- font-semibold uppercase tracking-widest text-zinc-500">Live Preview</div><div style={{borderRadius:16}} className="mt-4 border overflow-hidden"><div className="h-2 bg-black" /><div className="p-4"><div className="flex items-center gap-2"><span style={{borderRadius:999}} className="w-6 h-6 bg-black text-white flex items-center justify-center text-">1</span><span className="text- font-semibold">Store Identity</span></div></div></div></div>
        </div>

        <div style={{borderRadius:20}} className="bg-white border overflow-hidden">
          <div className="p-6 border-b"><h2 className="font-semibold text-">Add Product — up to 5 photos</h2></div>
          <div className="p-6 space-y-4">
            <label style={{borderRadius:14}} className="border-2 border-dashed p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 transition min-h-">
              {previews.length ? <div className="grid grid-cols-3 gap-2 w-full">{previews.map((src, i) => <img key={i} src={src} style={{borderRadius:10}} className="w-full h- object-cover border" />)}</div> : <><div style={{borderRadius:10}} className="w-10 h-10 border flex items-center justify-center text-lg">+</div><div className="mt-3 font-medium text-">Upload up to 5 photos</div><div className="text- text-zinc-500 mt-1">First = cover photo</div></>}
              <input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
            </label>
            <input placeholder="Product name" value={prodName} onChange={e => setProdName(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border focus:outline-none focus:ring-2 focus:ring-black text-" />
            <input placeholder="Price Rs." type="number" value={prodPrice} onChange={e => setProdPrice(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border focus:outline-none focus:ring-2 focus:ring-black text-" />
            <div className="flex justify-end"><button onClick={addProduct} disabled={uploading} style={{borderRadius:10}} className="h-10 px-5 bg-black text-white text- font-medium hover:bg-zinc-800 disabled:opacity-50">{uploading ? 'Adding...' : `Add Product ${files.length?`(${files.length})`:''}`}</button></div>
          </div>
        </div>

        {products.length > 0 && (
          <div><h3 className="font-semibold text- mb-3">Your Products ({products.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map(p => (
                <div key={p.id} style={{borderRadius:20}} className="group bg-white border p-3 relative">
                  <div className="relative"><img src={p.image_url} style={{borderRadius:12}} className="w-full h-36 object-cover" />{p.image_urls && p.image_urls.length > 1 && <span style={{borderRadius:999}} className="absolute top-2 left-2 bg-black/70 text-white text- px-2 py-0.5">+{p.image_urls.length} photos</span>}</div>
                  <div className="mt-3"><div className="font-medium text- truncate">{p.name}</div><div className="text- font-bold">Rs. {p.price}</div></div>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition"><button onClick={() => openEdit(p)} style={{borderRadius:10}} className="w-8 h-8 bg-white shadow border flex items-center justify-center text-xs hover:bg-zinc-50">✎</button><button onClick={() => deleteProduct(p.id)} style={{borderRadius:10}} className="w-8 h-8 bg-white shadow border flex items-center justify-center text-xs hover:bg-red-50">🗑</button></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {editProd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div style={{borderRadius:20}} className="bg-white border w-full max-w-md p-6 space-y-4">
            <h3 className="font-semibold text-">Edit Product</h3>
            <input value={editName} onChange={e => setEditName(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border focus:outline-none focus:ring-2 focus:ring-black text-" />
            <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border focus:outline-none focus:ring-2 focus:ring-black text-" />
            <div className="flex justify-end gap-2 pt-2"><button onClick={() => setEditProd(null)} style={{borderRadius:10}} className="h-10 px-5 border bg-white text-">Cancel</button><button onClick={saveEdit} style={{borderRadius:10}} className="h-10 px-5 bg-black text-white text-">Save Changes</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
