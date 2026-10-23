'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Profile = { id: string; business_name: string; whatsapp_number: string; store_slug: string }
type Product = { id: string; name: string; price: number; image_url: string; user_id: string }

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
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [editProd, setEditProd] = useState<Product | null>(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [copied, setCopied] = useState(false)

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
    const link = `https://dukaan-whats.vercel.app/s/${slug}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFile = (e: any) => {
    const f = e.target.files?.[0]
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)) }
  }

  const addProduct = async () => {
    if (!profile || !prodName || !prodPrice || !file) return
    setUploading(true)
    const fileName = `${profile.id}/${Date.now()}_${file.name}`
    const { data: up } = await supabase.storage.from('product-images').upload(fileName, file)
    let url = ''
    if (up) { const { data } = supabase.storage.from('product-images').getPublicUrl(fileName); url = data.publicUrl }
    const { data } = await supabase.from('products').insert({
      user_id: profile.id, name: prodName, price: Number(prodPrice), image_url: url
    }).select().single()
    if (data) setProducts([data, ...products])
    setProdName(''); setProdPrice(''); setFile(null); setPreview(''); setUploading(false)
  }

  const openEdit = (p: Product) => {
    setEditProd(p)
    setEditName(p.name)
    setEditPrice(String(p.price))
  }

  const saveEdit = async () => {
    if (!editProd) return
    const { data } = await supabase.from('products').update({ name: editName, price: Number(editPrice) }).eq('id', editProd.id).select().single()
    if (data) setProducts(products.map(pr => pr.id === data.id ? data : pr))
    setEditProd(null)
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    setProducts(products.filter(p => p.id !== id))
  }

  if (loading) return <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center">Loading store...</div>

  const totalValue = products.reduce((s, p) => s + (p.price || 0), 0)

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-zinc-900">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black text-white rounded-lg flex items-center justify-center font-bold">D</div>
            <span className="font-semibold tracking-tight">DukaanWhats.pk</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyLink} className="h-10 px-4 rounded-lg border bg-white text-sm font-medium hover:bg-zinc-50">{copied ? 'Copied!' : 'Copy Link'}</button>
            <Link href={`/s/${slug}`} target="_blank" className="h-10 px-5 rounded-lg bg-black text-white text-sm font-medium flex items-center hover:bg-zinc-800">View Store</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 border">
            <div className="text- text-zinc-500 font-semibold uppercase tracking-widest">Products</div>
            <div className="text-2xl font-bold mt-3">{products.length}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border">
            <div className="text- text-zinc-500 font-semibold uppercase tracking-widest">Total Value</div>
            <div className="text-2xl font-bold mt-3">Rs. {totalValue}</div>
          </div>
          <div className="bg-black text-white rounded-2xl p-6 flex flex-col justify-between">
            <div className="text- text-zinc-400 font-semibold uppercase tracking-widest">Store Link</div>
            <div className="flex items-center justify-between mt-3">
              <div className="text- font-medium truncate">/s/{slug}</div>
              <button onClick={copyLink} className="ml-3 h-8 px-3 rounded-lg bg-white/15 text-xs font-medium hover:bg-white/25">{copied ? '✓ Copied' : 'Copy'}</button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b">
              <h2 className="font-semibold">Store Identity</h2>
              {saved && <span className="bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 text-xs font-medium">Saved ✓</span>}
            </div>
            <div className="p-6 space-y-4">
              <div><label className="text- font-medium">Business Name</label><input value={businessName} onChange={e => setBusinessName(e.target.value)} className="mt-2 w-full h-11 px-4 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-black" placeholder="Ayesha Boutique" /></div>
              <div><label className="text- font-medium">WhatsApp Number</label><input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="mt-2 w-full h-11 px-4 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-black" placeholder="923001234567" /></div>
              <div><label className="text- font-medium">Store Slug</label><div className="mt-2 flex items-center gap-2"><span className="text-sm text-zinc-500">/s/</span><input value={slug} onChange={e => setSlug(e.target.value)} className="flex-1 h-11 px-4 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-black" /></div></div>
              <div className="flex justify-end pt-2"><button onClick={saveStore} className="h-10 px-5 rounded-lg bg-black text-white text-sm font-medium hover:bg-zinc-800">Save Store</button></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-6">
            <div className="text- font-semibold uppercase tracking-widest text-zinc-500">Live Preview</div>
            <div className="mt-4 border rounded-2xl overflow-hidden">
              <div className="h-2 bg-black" />
              <div className="p-4">
                <div className="flex items-center gap-2"><span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-">1</span><span className="text- font-semibold">Store Identity</span><span className="ml-auto text- bg-green-50 text-green-700 px-2 py-0.5 rounded-full border">AUTO-SAVED</span></div>
                <div className="mt-4 space-y-2">
                  <div className="text- text-zinc-400 uppercase">Business Name</div><div className="h-5 bg-zinc-100 rounded-full px-3 text- flex items-center">{businessName || 'Your Store'}</div>
                  <div className="text- text-zinc-400 uppercase">WhatsApp Number</div><div className="h-5 bg-zinc-100 rounded-full px-3 text- flex items-center">{whatsapp || '92xxxxxxxxxx'}</div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-zinc-600">{businessName || 'Jdigb'}<br/><span className="font-bold">Rs. {totalValue}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="p-6 border-b"><h2 className="font-semibold">Add Product</h2></div>
          <div className="p-6 space-y-4">
            <label className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 transition">
              {preview ? <img src={preview} className="w-24 h-24 object-cover rounded-xl" /> : <><div className="w-10 h-10 border rounded-lg flex items-center justify-center text-lg">+</div><div className="mt-3 font-medium text-sm">Upload photo</div><div className="text-xs text-zinc-500 mt-1">JPG, PNG up to 5MB</div></>}
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
            <input placeholder="Product name" value={prodName} onChange={e => setProdName(e.target.value)} className="w-full h-11 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-black" />
            <input placeholder="Price Rs." type="number" value={prodPrice} onChange={e => setProdPrice(e.target.value)} className="w-full h-11 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-black" />
            <div className="flex justify-end"><button onClick={addProduct} disabled={uploading} className="h-10 px-5 rounded-lg bg-black text-white text-sm font-medium hover:bg-zinc-800 disabled:opacity-50">{uploading ? 'Adding...' : 'Add Product'}</button></div>
          </div>
        </div>

        {products.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Your Products ({products.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map(p => (
                <div key={p.id} className="group bg-white rounded-2xl border p-3 relative">
                  <img src={p.image_url} className="w-full h-36 object-cover rounded-xl" />
                  <div className="mt-3"><div className="font-medium text-sm truncate">{p.name}</div><div className="text-sm font-bold">Rs. {p.price}</div></div>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => openEdit(p)} className="w-8 h-8 bg-white rounded-lg shadow border flex items-center justify-center text-xs hover:bg-zinc-50">✎</button>
                    <button onClick={() => deleteProduct(p.id)} className="w-8 h-8 bg-white rounded-lg shadow border flex items-center justify-center text-xs hover:bg-red-50">🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {editProd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border w-full max-w-md p-6 space-y-4">
            <h3 className="font-semibold">Edit Product</h3>
            <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full h-11 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-black" />
            <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-full h-11 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-black" />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditProd(null)} className="h-10 px-5 rounded-lg border bg-white text-sm">Cancel</button>
              <button onClick={saveEdit} className="h-10 px-5 rounded-lg bg-black text-white text-sm">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
