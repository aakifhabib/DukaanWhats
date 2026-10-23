'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Profile = { id: string; business_name: string; whatsapp_number: string; store_slug: string }
type Product = { id: string; name: string; price: number; image_url: string }

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

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (prof) {
        setProfile(prof)
        setBusinessName(prof.business_name || '')
        setWhatsapp(prof.whatsapp_number || '')
        setSlug(prof.store_slug || '')
        const { data: prods } = await supabase.from('products').select('*').eq('user_id', prof.id)
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
      store_slug: slug
    }).eq('id', profile.id)
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
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
    if (data) setProducts([...products, data])
    setProdName(''); setProdPrice(''); setFile(null); setPreview(''); setUploading(false)
  }

  if (loading) return <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center">Loading...</div>

  const totalValue = products.reduce((s, p) => s + (p.price || 0), 0)

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-zinc-900">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black text-white rounded-lg flex items-center justify-center font-bold">D</div>
            <span className="font-semibold">DukaanWhats.pk</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/s/${slug}`} target="_blank" className="h-10 px-5 rounded-lg bg-black text-white text-sm font-medium flex items-center hover:bg-zinc-800">View Store</Link>
            <Link href={`/s/${slug}`} className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center">↗</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 border">
            <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Products</div>
            <div className="text-2xl font-bold mt-2">{products.length}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border">
            <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Total Value</div>
            <div className="text-2xl font-bold mt-2">Rs. {totalValue}</div>
          </div>
          <div className="bg-black text-white rounded-2xl p-6">
            <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Store Link</div>
            <div className="text-lg font-medium mt-2 truncate">/s/{slug || '...'}</div>
          </div>
        </div>

        {/* Store Identity */}
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b">
            <h2 className="font-semibold">Store Identity</h2>
            {saved && <span className="bg-green-50 text-green-700 rounded-full px-3 py-1 text-sm font-medium">Saved</span>}
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Business Name</label>
              <input value={businessName} onChange={e => setBusinessName(e.target.value)} className="mt-2 w-full h-11 px-4 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="text-sm font-medium">WhatsApp Number</label>
              <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="mt-2 w-full h-11 px-4 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="text-sm font-medium">Store Slug</label>
              <div className="mt-2 flex items-center">
                <span className="text-zinc-500 text-sm pr-2">/s/</span>
                <input value={slug} onChange={e => setSlug(e.target.value)} className="flex-1 h-11 px-4 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={saveStore} className="h-10 px-5 rounded-lg bg-black text-white text-sm font-medium hover:bg-zinc-800">Save Store</button>
            </div>
          </div>
        </div>

        {/* Add Product */}
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="font-semibold">Add Product</h2>
          </div>
          <div className="p-6 space-y-4">
            <label className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50">
              {preview ? <img src={preview} className="w-24 h-24 object-cover rounded-xl" /> : <div className="w-10 h-10 border rounded-lg flex items-center justify-center">+</div>}
              <div className="mt-3 font-medium text-sm">{preview ? 'Change photo' : 'Upload photo'}</div>
              <div className="text-xs text-zinc-500 mt-1">JPG, PNG up to 5MB</div>
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
            <input placeholder="Product name" value={prodName} onChange={e => setProdName(e.target.value)} className="w-full h-11 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-black" />
            <input placeholder="Price Rs." type="number" value={prodPrice} onChange={e => setProdPrice(e.target.value)} className="w-full h-11 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-black" />
            <div className="flex justify-end">
              <button onClick={addProduct} disabled={uploading} className="h-10 px-5 rounded-lg bg-black text-white text-sm font-medium hover:bg-zinc-800 disabled:opacity-50">{uploading ? 'Adding...' : 'Add Product'}</button>
            </div>
          </div>
        </div>

        {/* Products List */}
        {products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border p-3">
                <img src={p.image_url} className="w-full h-32 object-cover rounded-xl" />
                <div className="mt-3 font-medium text-sm truncate">{p.name}</div>
                <div className="text-sm font-bold">Rs. {p.price}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
