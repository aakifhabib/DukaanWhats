'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STORE_THEMES, getTheme, ThemeCategory, getAdvancedThemes } from '@/lib/storeThemes'

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
  const router = useRouter()

  const plans: Plan[] = [
    { id: 'basic', name: 'Basic', price: 0, features: ['5 Products', '1 Image', 'COD Only'] },
    { id: 'advanced', name: 'Advanced', price: 499, features: ['50 Products', '5 Images', 'All Themes'] },
    { id: 'premium', name: 'Premium', price: 999, features: ['Unlimited', 'Glass Advanced', 'No Branding'] },
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
          const metaName = user.email?.split('@')[0] || 'My Store'
          const baseSlug = metaName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0,20)
          const newProfile = { id: user.id, business_name: metaName, whatsapp_number: '', store_slug: `${baseSlug}-${Math.floor(Math.random()*900+100)}`, store_theme: 'clothing-noor', current_plan: 'basic' }
          const { data: created } = await supabase.from('profiles').upsert(newProfile, { onConflict: 'id' }).select().single()
          prof = created || newProfile as any
        }
        if (prof) {
          setProfile(prof); setBusinessName(prof.business_name || ''); setWhatsapp(prof.whatsapp_number || ''); setSlug(prof.store_slug || ''); setTheme(prof.store_theme || 'clothing-noor')
          const { data: prods } = await supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
          if (prods) setProducts(prods)
        }
      } catch (e: any) { setErrorMsg(e.message) }
      setLoading(false)
    }
    init()
  }, [])

  const saveStore = async () => {
    if (!profile) return; setSaving(true)
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-')
    const { data, error } = await supabase.from('profiles').upsert({ id: profile.id, business_name: businessName.trim(), whatsapp_number: whatsapp.trim(), store_slug: cleanSlug, store_theme: theme, updated_at: new Date().toISOString() }, { onConflict: 'id' }).select().single()
    if (error) setErrorMsg(error.message); else { setProfile(data); setSlug(cleanSlug); setSaved(true); setTimeout(()=>setSaved(false), 3000) }
    setSaving(false)
  }
  const copyLink = async () => { await navigator.clipboard.writeText(`${window.location.origin}/s/${slug}`); setCopied(true); setTimeout(()=>setCopied(false), 2000) }
  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }
  const handleFile = (e: any) => { const sel = Array.from(e.target.files || []) as File[]; setFiles(sel); setPreviews(sel.map(f=>URL.createObjectURL(f))) }
  const uploadOne = async (file: File, userId: string) => {
    const name = `${userId}/${Date.now()}_${file.name}`; const { error } = await supabase.storage.from('product-images').upload(name, file)
    if (error) throw error; return supabase.storage.from('product-images').getPublicUrl(name).data.publicUrl
  }
  const addProduct = async () => {
    if (!profile || !prodName.trim() || !prodPrice || files.length===0) return; setUploading(true)
    try{
      const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Not logged in')
      const urls = await Promise.all(files.map(f=>uploadOne(f, user.id)))
      const { data } = await supabase.from('products').insert({ user_id: user.id, name: prodName.trim(), price: Number(prodPrice), image_url: urls[0], image_urls: urls }).select().single()
      if (data) setProducts([data, ...products]); setProdName(''); setProdPrice(''); setFiles([]); setPreviews([])
    }catch(e:any){ setErrorMsg(e.message) } setUploading(false)
  }
  const deleteProduct = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('products').delete().eq('id', id); setProducts(products.filter(p=>p.id!==id)) }
  const handleBuyPlan = async () => {
    if (!selectedPlan || !txnId.trim()) { alert('Enter Txn ID'); return }; setPurchasing(true)
    try{
      const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Not logged in')
      const { error } = await supabase.from('plan_payments').insert({ user_id: user.id, plan_id: selectedPlan.id, amount: selectedPlan.price, till_id: TILL_ID, txn_id: txnId.trim(), status: 'pending' })
      if (error) throw error; alert(`Submitted! Till ${TILL_ID} - ${selectedPlan.name}`); setSelectedPlan(null); setTxnId('')
    }catch(e:any){ alert(e.message) } setPurchasing(false)
  }

  if (loading) return <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center"><div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"/></div>

  const standardThemes = STORE_THEMES.filter(t => t.category !== 'advanced')
  const advancedThemes = getAdvancedThemes()
  const filtered = (filter as string) === 'all' ? standardThemes : (filter as string) === 'advanced' ? [] : STORE_THEMES.filter(t => (t.category as string) === (filter as string))

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-zinc-900 pb-24">
      <style>{`
        /* Uiverse Radio Glider - From Smit-Prajapati - Customized for DukaanWhats */
        .radio-container {
          --main-color: #E8FF86;
          --main-color-opacity: #E8FF861c;
          --total-radio: 3;
          display: flex; flex-direction: column; position: relative; padding-left: 1rem;
        }
        .radio-container input { cursor: pointer; appearance: none; position: absolute; opacity: 0; }
        .radio-container .glider-container {
          position: absolute; left: 0; top: 0; bottom: 0;
          background: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(20,20,20,0.2) 50%, rgba(0,0,0,0) 100%); width: 1px;
        }
        .radio-container .glider-container .glider {
          position: relative; height: calc(100% / var(--total-radio)); width: 100%;
          background: linear-gradient(0deg, rgba(0,0,0,0) 0%, var(--main-color) 50%, rgba(0,0,0,0) 100%);
          transition: transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56);
        }
        .radio-container .glider-container .glider::before {
          content: ""; position: absolute; height: 60%; width: 300%; top: 50%; transform: translateY(-50%);
          background: var(--main-color); filter: blur(10px);
        }
        .radio-container .glider-container .glider::after {
          content: ""; position: absolute; left: 0; height: 100%; width: 150px;
          background: linear-gradient(90deg, var(--main-color-opacity) 0%, rgba(0,0,0,0) 100%);
        }
        .radio-container label {
          cursor: pointer; padding: 1.2rem 1rem; position: relative; color: #9ca3af;
          transition: all 0.3s ease-in-out; border-radius: 12px; margin-bottom: 4px;
        }
        .radio-container label:hover { background: rgba(0,0,0,0.02); color: #111; }
        .radio-container input:checked + label { color: #0A0A0A; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e5e7eb; }
        .radio-container input:nth-of-type(1):checked ~ .glider-container .glider { transform: translateY(0); }
        .radio-container input:nth-of-type(2):checked ~ .glider-container .glider { transform: translateY(100%); }
        .radio-container input:nth-of-type(3):checked ~ .glider-container .glider { transform: translateY(200%); }

        .glass-container { position: relative; display: flex; justify-content: center; align-items: center; min-height: 340px; padding: 30px 0 50px; gap: 0; }
        .glass-container .glass { position: relative; width: 260px; height: 300px; background: linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.02)); border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 25px 45px rgba(0,0,0,0.35); display: flex; justify-content: flex-start; align-items: center; flex-direction: column; transition: 0.6s cubic-bezier(0.23,1,0.32,1); border-radius: 18px; margin: 0 -55px; backdrop-filter: blur(16px); transform: rotate(calc(var(--r) * 1deg)); cursor: pointer; overflow: hidden; padding-top: 14px; }
        .glass-container:hover .glass { transform: rotate(0deg); margin: 0 18px; }
        .neumorph-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 32px; padding: 40px 20px; background: #e0e0e0; border-radius: 24px; }
        .card { width: 190px; height: 254px; border-radius: 50px; background: #e0e0e0; box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff; display: flex; flex-direction: column; align-items: center; padding: 22px 16px 18px; cursor: pointer; transition: all 0.3s ease; margin: 0 auto; }
        .card.selected { box-shadow: inset 10px 10px 20px #bebebe, inset -10px -10px 20px #ffffff, 0 0 0 2px #E8FF86; }
        .modern-tab-pill { position: relative; display: flex; background: #0A0A0A; border-radius: 999px; padding: 4px; gap: 2px; }
        .modern-tab { position: relative; z-index: 1; height: 36px; padding: 0 18px; border-radius: 999px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 7px; white-space: nowrap; transition: all 0.3s; }
        .modern-tab-active { background: #FFFFFF; color: #0A0A0A; font-weight: 600; }
        .modern-tab-inactive { color: rgba(255,255,255,0.6); }
        .modern-tab-inactive:hover { color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.06); }
      `}</style>

      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2"><div className="w-9 h-9 bg-black text-white rounded- flex items-center justify-center font-bold">D</div><span className="font-semibold text-">DukaanWhats.pk</span></Link>
          <div className="flex items-center gap-2">
            <button onClick={copyLink} className="h-10 px-4 border bg-white rounded- text- font-medium">{copied?'Copied!':'Copy Link'}</button>
            <Link href={`/s/${slug}`} target="_blank" className="h-10 px-5 bg-black text-white rounded- text- font-medium flex items-center">View Store ↗</Link>
            <button onClick={logout} className="h-10 px-4 bg-zinc-100 border rounded- text- font-medium">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pt-6">
        {errorMsg && <div className="mb-4 bg-red-50 border border-red-200 p-4 text- text-red-800 rounded-">Error: {errorMsg}</div>}
        <div className="modern-tab-pill w-fit">
          {[{id:'store',label:'Store',icon:'◧'},{id:'themes',label:'Themes',icon:'◨'},{id:'products',label:`Products ${products.length}`,icon:'◫'},{id:'payments',label:`Till ${TILL_ID}`,icon:'⬡'}].map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id as any)} className={`modern-tab ${activeTab===t.id?'modern-tab-active':'modern-tab-inactive'}`}><span>{t.icon}</span>{t.label}</button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab==='payments' && (
          <div className="bg-white border rounded- p-6 md:p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-black text-white rounded- flex items-center justify-center">⬡</div>
              <div><h2 className="font-bold text- tracking-tight">Till ID Payments — Plans</h2><p className="text- text-zinc-500">Select plan with glider animation → Pay to Till {TILL_ID}</p></div>
            </div>

            <div className="grid md:grid-cols-[400px_1fr] gap-8 items-start">
              {/* LEFT: Till Barcode / QR */}
              <div className="space-y-4">
                <div className="rounded- p-6 text-center text-white relative overflow-hidden" style={{backgroundImage:'linear-gradient(to top, #210c93, #0d117a, #011160, #010e47, #07052e)'}}>
                  <div className="text- tracking-[0.2em] opacity-40">【entity-JAZZCASH¦canonical_name=JAZZCASH】 TILL ID</div>
                  <div className="text- font-black tracking-[0.15em] mt-2">{TILL_ID}</div>
                  <div className="mt-4 bg-white rounded- p-3"><img src={`https://barcodeapi.org/api/code128/${TILL_ID}`} alt="Barcode" className="w-full h- object-contain"/><div className="text- tracking-[0.3em] mt-1 font-mono text-black font-bold">{TILL_ID}</div></div>
                  <div className="mt-4 bg-white rounded- p-3 inline-block"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=JAZZCASH_TILL_${TILL_ID}`} alt="QR" className="w- h-"/></div>
                </div>
              </div>

              {/* RIGHT: NEW RADIO GLIDER PANEL FOR PLANS */}
              <div className="bg-[#F8F7F5] border border-zinc-200 rounded- p-6">
                <h3 className="text- font-bold tracking-widest uppercase text-zinc-400 mb-4">Select Plan — Animated</h3>
                
                <div className="radio-container" style={{"--total-radio": plans.length} as any}>
                  {plans.map((p, idx) => (
                    <>
                      <input key={`input-${p.id}`} type="radio" id={`plan-${p.id}`} name="plan-selector" checked={selectedPlan?.id === p.id} onChange={()=>setSelectedPlan(p)} />
                      <label key={`label-${p.id}`} htmlFor={`plan-${p.id}`} onClick={()=>setSelectedPlan(p)}>
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text- tracking-tight">{p.name}</span>
                              <span className="text- px-2 py-0.5 rounded-full bg-black text-white font-mono">Rs. {p.price}</span>
                              {p.price===0 && <span className="text- bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">FREE</span>}
                            </div>
                            <div className="text- mt-1.5 opacity-70 leading-relaxed">{p.features.join(' • ')}</div>
                          </div>
                          <div className="text- opacity-30">→</div>
                        </div>
                      </label>
                    </>
                  ))}
                  <div className="glider-container"><div className="glider"></div></div>
                </div>

                {selectedPlan && selectedPlan.price > 0 && (
                  <div className="mt-6 rounded- border bg-[#FFFEF5] border-[#F5E6A0] p-5 animate-in">
                    <div className="text- font-bold">Pay Rs. {selectedPlan.price} to Till {TILL_ID}</div>
                    <div className="text- text-zinc-500 mt-1">After paying, enter Transaction ID below</div>
                    <input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder={`Txn ID e.g. 12345678`} className="mt-3 w-full h-11 px-4 rounded- border bg-white text- font-mono focus:outline-none focus:border-black"/>
                    <button onClick={handleBuyPlan} disabled={purchasing} className="mt-3 w-full h-11 bg-black text-white rounded-full font-medium text- disabled:opacity-50">{purchasing?'Submitting...':`I Paid Rs. ${selectedPlan.price} to Till ${TILL_ID} — Verify`}</button>
                  </div>
                )}
                {selectedPlan?.price===0 && (
                  <div className="mt-6 rounded- bg-green-50 border border-green-200 p-4 text- text-green-800">Basic is free — no payment needed. You are on Basic plan.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab==='store' && (
          <div className="bg-white p-7 border rounded-">
            <h2 className="font-semibold text-">Store Identity</h2>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <input value={businessName} onChange={e=>setBusinessName(e.target.value)} placeholder="Business Name" className="h-11 px-4 border rounded- bg-zinc-50 text-"/>
              <input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="store-slug" className="h-11 px-4 border rounded- bg-zinc-50 font-mono text-"/>
              <input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="92300..." className="h-11 px-4 border rounded- bg-zinc-50 text-"/>
            </div>
            <div className="flex justify-end mt-6"><button onClick={saveStore} className="h-11 px-7 bg-black text-white rounded-full text- font-medium">{saving?'Saving...':'Save Store →'}</button></div>
          </div>
        )}

        {activeTab==='products' && (
          <div className="bg-white border rounded- p-6">
            <h2 className="font-semibold text-">Add Product — up to 5 photos</h2>
            <label className="mt-4 border-2 border-dashed p-4 flex flex-col items-center justify-center cursor-pointer rounded- min-h- bg-zinc-50">
              {previews.length ? <div className="grid grid-cols-5 gap-2 w-full">{previews.map((s,i)=><img key={i} src={s} className="w-full h- object-cover rounded- border"/>)}</div> : <span className="text-">+ Upload photos</span>}
              <input type="file" multiple accept="image/*" onChange={handleFile} className="hidden"/>
            </label>
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <input value={prodName} onChange={e=>setProdName(e.target.value)} placeholder="Product name" className="h-11 px-4 border rounded- bg-zinc-50"/>
              <input value={prodPrice} onChange={e=>setProdPrice(e.target.value)} type="number" placeholder="Price Rs." className="h-11 px-4 border rounded- bg-zinc-50"/>
            </div>
            <div className="flex justify-end mt-4"><button onClick={addProduct} className="h-11 px-7 bg-black text-white rounded-full text-">Add Product →</button></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">{products.map(p=><div key={p.id} className="border rounded- p-2"><img src={p.image_url} className="w-full h-32 object-cover rounded-"/><div className="mt-2 text- font-medium">{p.name}</div><div className="text- font-bold">Rs. {p.price}</div></div>)}</div>
          </div>
        )}

        {activeTab==='themes' && (
          <div className="bg-white p-6 border rounded-">
            <h2 className="font-semibold">Themes — {standardThemes.length} designs</h2>
            <div className="neumorph-grid mt-6">{standardThemes.slice(0,6).map(t=>{const isActive=theme===t.id; return <button key={t.id} onClick={()=>setTheme(t.id)} className={`card ${isActive?'selected':''}`}><div className="text-">{t.badge}</div><div className="mt-2 text- font-bold">{t.name}</div></button>})}</div>
            <div className="flex justify-end mt-6"><button onClick={saveStore} className="h-11 px-6 bg-black text-white rounded-full text-">Save Theme</button></div>
          </div>
        )}
      </main>
    </div>
  )
}
