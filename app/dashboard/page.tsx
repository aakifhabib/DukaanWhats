'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const TILL_ID = '984837533'

type Profile = { id: string; business_name: string; whatsapp_number: string; store_slug: string; store_theme?: string; current_plan?: string }
type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; user_id: string }
type Plan = { id: string; name: string; price: number; features: string[] }

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
  const [copied, setCopied] = useState(false)
  const [showPlans, setShowPlans] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [txnId, setTxnId] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const router = useRouter()

  const plans: Plan[] = [
    { id: 'basic', name: 'Basic', price: 0, features: ['5 Products', '1 Image per product', 'COD Only', 'Free Forever'] },
    { id: 'advanced', name: 'Advanced', price: 499, features: ['50 Products', '5 Images per product', 'All Themes', 'Orders Dashboard', 'JazzCash Payments'] },
    { id: 'premium', name: 'Premium', price: 999, features: ['Unlimited Products', 'Glass Advanced Themes', 'No Branding', 'Priority Support', 'Analytics'] },
  ]

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      let { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!prof) {
        const metaName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'My Store'
        const baseSlug = metaName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0,20) || `store-${user.id.slice(0,6)}`
        let finalSlug = baseSlug
        const { data: existing } = await supabase.from('profiles').select('id').eq('store_slug', baseSlug).single()
        if (existing) finalSlug = `${baseSlug}-${Math.floor(Math.random()*900+100)}`
        const { data: created } = await supabase.from('profiles').insert({ id: user.id, business_name: metaName, whatsapp_number: '', store_slug: finalSlug, store_theme: 'clothing-noor', current_plan: 'basic' }).select().single()
        if (created) prof = created
      }
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
    const { error } = await supabase.from('profiles').update({ business_name: businessName, whatsapp_number: whatsapp, store_slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-') }).eq('id', profile.id)
    if (!error) { setSaved(true); setTimeout(()=>setSaved(false), 2500) } else alert(error.message)
  }
  const copyLink = async () => { await navigator.clipboard.writeText(`https://dukaan-whats.vercel.app/s/${slug}`); setCopied(true); setTimeout(()=>setCopied(false), 2000) }
  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }
  const handleFile = (e: any) => { const sel = Array.from(e.target.files || []) as File[]; if (sel.length>5){alert('Max 5 photos'); return}; setFiles(sel); setPreviews(sel.map(f=>URL.createObjectURL(f))) }
  const uploadOne = async (file: File) => { if (!profile) return ''; const name = `${profile.id}/${Date.now()}_${file.name}`; const { data } = await supabase.storage.from('product-images').upload(name, file); if (!data) return ''; return supabase.storage.from('product-images').getPublicUrl(name).data.publicUrl }
  const addProduct = async () => {
    if (!profile || !prodName || !prodPrice || files.length===0){alert('Name, price, at least 1 photo required'); return}
    setUploading(true)
    try{
      const urls = (await Promise.all(files.map(uploadOne))).filter(Boolean)
      if (!urls.length) throw new Error('Upload failed')
      const { data, error } = await supabase.from('products').insert({ user_id: profile.id, name: prodName, price: Number(prodPrice), image_url: urls[0], image_urls: urls }).select().single()
      if (error) {
        const fb = await supabase.from('products').insert({ user_id: profile.id, name: prodName, price: Number(prodPrice), image_url: urls[0] }).select().single()
        if (fb.data) setProducts([fb.data, ...products])
        else throw error
      } else if (data) setProducts([data, ...products])
      setProdName(''); setProdPrice(''); setFiles([]); setPreviews([])
    }catch(e:any){alert(e.message)}
    setUploading(false)
  }
  const deleteProduct = async (id: string) => { if (!confirm('Delete product?')) return; await supabase.from('products').delete().eq('id', id); setProducts(products.filter(p=>p.id!==id)) }

  const handleBuyPlan = async () => {
    if (!selectedPlan) return
    if (selectedPlan.price===0) { alert('Basic is free and already active'); setShowPlans(false); return }
    if (!txnId.trim()) { alert('Enter Transaction ID from JazzCash'); return }
    setPurchasing(true)
    try{
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      await supabase.from('plan_payments').insert({ user_id: user.id, plan_id: selectedPlan.id, amount: selectedPlan.price, till_id: TILL_ID, txn_id: txnId.trim(), status: 'pending' })
      alert(`Submitted!\nTill ID: ${TILL_ID}\nTxn: ${txnId}\nPlan: ${selectedPlan.name}\nWe will verify in 30 mins and activate.`)
      setSelectedPlan(null); setTxnId(''); setShowPlans(false)
    }catch(e:any){alert(e.message)}
    setPurchasing(false)
  }

  if (loading) return <div style={{minHeight:'100vh',background:'#F8F7F5',display:'flex',alignItems:'center',justifyContent:'center'}} className="text-[13px]">Loading store...</div>

  return (
    <div style={{minHeight:'100vh',background:'#F8F7F5'}} className="text-zinc-900 pb-24">
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 shrink-0"><div style={{borderRadius:10}} className="w-9 h-9 bg-black text-white flex items-center justify-center font-bold">D</div><span className="font-semibold tracking-tight text-[14px]">DukaanWhats.pk</span></Link>
          <div className="flex items-center gap-1.5 md:gap-2">
            <button onClick={()=>setShowPlans(true)} style={{borderRadius:10}} className="h-9 md:h-10 px-3 md:px-4 bg-[#E8FF86] text-black border border-black/10 text-[12px] md:text-[13px] font-bold">Plans • Till {TILL_ID}</button>
            <button onClick={copyLink} style={{borderRadius:10}} className="h-9 md:h-10 px-3 md:px-4 border bg-white text-[12px] md:text-[13px] font-medium hover:bg-zinc-50">{copied?'Copied!':'Copy Link'}</button>
            <Link href={`/s/${slug}`} target="_blank" style={{borderRadius:10}} className="h-9 md:h-10 px-3 md:px-5 bg-black text-white text-[12px] md:text-[13px] font-medium flex items-center hover:bg-zinc-800">View Store</Link>
            <button onClick={logout} style={{borderRadius:10}} className="h-9 md:h-10 px-3 md:px-4 bg-zinc-100 border text-[12px] md:text-[13px] font-medium">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div style={{borderRadius:20}} className="bg-white p-6 border"><div className="text-[11px] text-zinc-500 font-semibold uppercase tracking-widest">Products</div><div className="text-2xl font-bold mt-3">{products.length}</div><div className="text-[11px] text-zinc-400 mt-1">Current plan: {profile?.current_plan || 'basic'}</div></div>
          <div style={{borderRadius:20}} className="bg-white p-6 border"><div className="text-[11px] text-zinc-500 font-semibold uppercase tracking-widest">Till ID</div><div className="text-[20px] font-black mt-3 tracking-widest">{TILL_ID}</div><div className="text-[11px] text-zinc-500 mt-1">JazzCash Till for plan payments</div></div>
          <div style={{borderRadius:20}} className="bg-[#E8FF86] p-6 border border-black/10"><div className="text-[11px] text-black/60 font-semibold uppercase tracking-widest">Store Link</div><div className="text-[13px] font-medium mt-3 truncate">/s/{slug}</div><button onClick={copyLink} className="mt-2 text-[11px] font-bold underline">{copied?'Copied':'Copy'}</button></div>
        </div>

        <div style={{borderRadius:20}} className="bg-white p-6 border">
          <div className="flex items-center justify-between"><h2 className="font-semibold text-[15px]">Store Settings</h2>{saved && <span style={{borderRadius:999}} className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 text-[11px] font-medium">Saved ✓</span>}</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            <div><label className="text-[12px] font-medium">Business Name</label><input value={businessName} onChange={e=>setBusinessName(e.target.value)} style={{borderRadius:12}} className="mt-1.5 w-full h-11 px-4 border text-[14px] focus:outline-none focus:border-black" placeholder="Ayesha Boutique" /></div>
            <div><label className="text-[12px] font-medium">Store Slug</label><input value={slug} onChange={e=>setSlug(e.target.value)} style={{borderRadius:12}} className="mt-1.5 w-full h-11 px-4 border text-[14px] focus:outline-none focus:border-black" placeholder="ayesha-boutique" /></div>
            <div><label className="text-[12px] font-medium">WhatsApp Number</label><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} style={{borderRadius:12}} className="mt-1.5 w-full h-11 px-4 border text-[14px] focus:outline-none focus:border-black" placeholder="923001234567" /></div>
          </div>
          <div className="flex justify-end mt-5"><button onClick={saveStore} style={{borderRadius:10}} className="h-10 px-5 bg-black text-white text-[13px] font-medium hover:bg-zinc-800">Save Store</button></div>
        </div>

        <div style={{borderRadius:20}} className="bg-white border overflow-hidden">
          <div className="p-6 border-b"><h2 className="font-semibold text-[14px]">Add Product — up to 5 photos</h2><p className="text-[11px] text-zinc-500 mt-1">First photo = cover. Multiple photos shown as gallery in store.</p></div>
          <div className="p-6 space-y-4">
            <label style={{borderRadius:14}} className="border-2 border-dashed p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 transition min-h-[140px]">
              {previews.length ? <div className="grid grid-cols-3 gap-2 w-full">{previews.map((src,i)=><img key={i} src={src} style={{borderRadius:10}} className="w-full h-[70px] object-cover border" />)}</div> : <><div style={{borderRadius:10}} className="w-10 h-10 border flex items-center justify-center text-lg">+</div><div className="mt-3 font-medium text-[13px]">Upload up to 5 photos</div><div className="text-[11px] text-zinc-500 mt-1">JPG/PNG up to 5MB each</div></>}
              <input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              <input placeholder="Product name" value={prodName} onChange={e=>setProdName(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border focus:outline-none focus:ring-1 focus:ring-black text-[14px]" />
              <input placeholder="Price Rs." type="number" value={prodPrice} onChange={e=>setProdPrice(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border focus:outline-none focus:ring-1 focus:ring-black text-[14px]" />
            </div>
            <div className="flex justify-end"><button onClick={addProduct} disabled={uploading} style={{borderRadius:10}} className="h-10 px-5 bg-black text-white text-[13px] font-medium hover:bg-zinc-800 disabled:opacity-50">{uploading?'Uploading...':`Add Product ${files.length?`(${files.length})`:''}`}</button></div>
          </div>
        </div>

        {products.length > 0 && (
          <div>
            <h3 className="font-semibold text-[14px] mb-3">Your Products ({products.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map(p => (
                <div key={p.id} style={{borderRadius:20}} className="group bg-white border p-3 relative">
                  <div className="relative"><img src={p.image_url} style={{borderRadius:12}} className="w-full h-36 object-cover bg-zinc-50" />{p.image_urls && p.image_urls.length > 1 && <span style={{borderRadius:999}} className="absolute top-2 left-2 bg-black/70 text-white text-[11px] px-2 py-0.5">+{p.image_urls.length} photos</span>}</div>
                  <div className="mt-3"><div className="font-medium text-[13px] truncate">{p.name}</div><div className="text-[13px] font-bold">Rs. {p.price}</div></div>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition"><button onClick={()=>deleteProduct(p.id)} style={{borderRadius:10}} className="w-8 h-8 bg-white shadow border flex items-center justify-center text-xs hover:bg-red-50">🗑</button></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showPlans && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto">
          <div className="bg-[#F8F7F5] rounded-[24px] max-w-5xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[#F8F7F5] p-6 border-b flex justify-between items-center z-10"><h2 className="text-[18px] font-bold">Choose Plan — Pay via JazzCash Till {TILL_ID}</h2><button onClick={()=>setShowPlans(false)} style={{borderRadius:999}} className="w-9 h-9 bg-white border flex items-center justify-center">✕</button></div>
            <div className="p-6 grid md:grid-cols-3 gap-5">
              {plans.map(plan => {
                const isCurrent = profile?.current_plan===plan.id
                return (
                  <div key={plan.id} style={{borderRadius:20}} className={`border-2 p-6 flex flex-col ${isCurrent?'border-[#E8FF86] bg-white shadow-[0_0_0_2px_#E8FF86]': plan.id==='premium'?'bg-black text-white border-black':'bg-white border-zinc-200'}`}>
                    {isCurrent && <div style={{borderRadius:999}} className="text-[10px] bg-[#E8FF86] text-black px-3 py-1 font-bold w-fit mb-3">CURRENT</div>}
                    <div className="font-bold text-[16px]">{plan.name}</div>
                    <div className="mt-2 text-[28px] font-bold">{plan.price===0?'Free':`Rs. ${plan.price}`}<span className="text-[12px] font-normal opacity-60">{plan.price>0?'/mo':''}</span></div>
                    <div className="mt-4 space-y-2 flex-1">{plan.features.map((f,i)=><div key={i} className="flex gap-2 text-[13px]"><span className="text-green-500">✓</span><span>{f}</span></div>)}</div>
                    <button onClick={()=>setSelectedPlan(plan)} disabled={isCurrent} style={{borderRadius:12}} className={`mt-6 h-11 font-medium text-[13px] ${isCurrent?'bg-zinc-100 text-zinc-400': plan.id==='premium'?'bg-[#E8FF86] text-black':'bg-black text-white'}`}>{isCurrent?'Current Plan':'Choose '+plan.name}</button>
                  </div>
                )
              })}
            </div>

            {selectedPlan && selectedPlan.price>0 && (
              <div style={{borderRadius:16}} className="p-6 border bg-white mx-6 mb-6">
                <h3 className="font-bold text-[16px]">Pay Rs. {selectedPlan.price} for {selectedPlan.name} — Till {TILL_ID}</h3>
                
                <div className="mt-5 bg-[#F8F7F5] rounded-[16px] p-5 border flex flex-col items-center">
                  <div className="text-[11px] font-bold tracking-widest opacity-60">JAZZCASH TILL ID</div>
                  <div className="text-[32px] font-black tracking-[0.2em] mt-2">{TILL_ID}</div>
                  <div className="mt-4 bg-white p-3 rounded-[10px] border w-full">
                    <img src={`https://barcodeapi.org/api/code128/${TILL_ID}`} alt="Barcode" className="w-full h-[60px] object-contain" />
                    <div className="text-center text-[10px] tracking-[0.3em] mt-1 font-mono">{TILL_ID}</div>
                  </div>
                  <div className="mt-4 bg-white p-3 rounded-[12px] border">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=JAZZCASH_TILL_${TILL_ID}_AMOUNT_${selectedPlan.price}`} alt="QR" className="w-[160px] h-[160px]" />
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-3 text-center">Open JazzCash App → Business → Till ID → Enter {TILL_ID}<br/>or scan this QR</div>
                </div>

                <div className="mt-4 p-4 bg-[#FFF9E6] border border-[#F5E6A0] rounded-[12px] text-[12px]">
                  <div className="font-bold">How to pay Till {TILL_ID}:</div>
                  <div className="mt-2 space-y-1 text-[12px]">1. Open JazzCash App 2. Tap Business / Till ID 3. Enter Till: <b>{TILL_ID}</b> 4. Amount Rs.{selectedPlan.price} 5. Pay 6. Copy Transaction ID</div>
                </div>

                <div className="mt-4">
                  <label className="text-[12px] font-medium">Transaction ID after paying to Till {TILL_ID} *</label>
                  <input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder="e.g. 1234567890" className="mt-1.5 w-full h-11 px-4 border rounded-[12px] text-[14px] font-mono" />
                </div>

                <div className="mt-6 flex gap-3">
                  <button onClick={handleBuyPlan} disabled={purchasing} style={{borderRadius:12}} className="flex-1 h-12 bg-black text-white font-medium disabled:opacity-50">{purchasing?'Submitting...':`I Paid to Till ${TILL_ID} — Activate ${selectedPlan.name}`}</button>
                  <button onClick={()=>setSelectedPlan(null)} style={{borderRadius:12}} className="h-12 px-6 border">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
