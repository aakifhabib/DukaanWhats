'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { RealAnalytics } from '@/components/RealAnalytics'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STORE_THEMES, getTheme, ThemeCategory, getAdvancedThemes } from '@/lib/storeThemes'
import { DukaanWhatsLoader } from '@/components/DukaanWhatsLoader'

// --- CUSTOM PREMIUM ICONS ---
const UploadIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <div className={`${className} relative`}>
    <div className="absolute inset-0 bg-black rounded-[14px] shadow-[0_8px_20px_rgba(0,0,0,0.15)]" />
    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black rounded-[14px]" />
    <div className="absolute inset-[1px] bg-black rounded-[13px] flex items-center justify-center">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 15.5V19.5C3 20.6 3.9 21.5 5 21.5H19C20.1 21.5 21 20.6 21 19.5V15.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/><path d="M12 3.5V14.5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/><path d="M8.5 7L12 3.5L15.5 7" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="12.5" r="1.2" fill="white" opacity="0.9"/></svg>
    </div>
    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#E8FF86] rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(232,255,134,0.5)] border-2 border-white">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="black" strokeWidth="2.5" strokeLinecap="round"/></svg>
    </div>
  </div>
)
const GlassLockIcon = ({ size = 40 }: { size?: number }) => (
  <div style={{ width: size, height: size }} className="relative shrink-0">
    <div className="absolute inset-0 rounded-[14px] bg-white/90 backdrop-blur-xl border border-black/[0.06] shadow-[0_8px_24px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)]" />
    <div className="absolute inset-0 rounded-[14px] bg-gradient-to-br from-white via-white/80 to-zinc-50/90" />
    <div className="absolute inset-[1px] rounded-[13px] bg-gradient-to-b from-white to-transparent opacity-80" />
    <div className="absolute inset-0 flex items-center justify-center">
      <svg width={size>40?22:16} height={size>40?22:16} viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="10" rx="3" fill="#0A0A0A" /><path d="M8 10V7.5C8 5.3 9.8 3.5 12 3.5C14.2 3.5 16 5.3 16 7.5V10" stroke="#0A0A0A" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="15" r="1.6" fill="white" /><path d="M12 16.6V18" stroke="white" strokeWidth="1.2" strokeLinecap="round" /></svg>
    </div>
    <div className="absolute top-[2px] left-[3px] right-[3px] h-[45%] rounded-t-[13px] bg-gradient-to-b from-white/90 to-transparent opacity-60 pointer-events-none" />
  </div>
)
const GlassPremiumLock = ({ size = 56 }: { size?: number }) => (
  <div style={{ width: size, height: size }} className="relative">
    <div className="absolute inset-0 rounded-[16px] bg-[#0A0A0A] shadow-[0_12px_28px_rgba(0,0,0,0.22)]" />
    <div className="absolute inset-0 rounded-[16px] bg-gradient-to-br from-zinc-800 to-black" />
    <div className="absolute inset-[1px] rounded-[15px] bg-gradient-to-b from-white/[0.08] to-transparent" />
    <div className="absolute inset-0 flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4.5" y="10.5" width="15" height="10" rx="3.5" fill="white" /><path d="M8 10.5V7.8C8 5.4 9.9 3.5 12.2 3.5C14.5 3.5 16.4 5.4 16.4 7.8V10.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" /><circle cx="12" cy="15.5" r="1.5" fill="black" /><path d="M12 17V18.5" stroke="black" strokeWidth="1.2" strokeLinecap="round" /></svg>
    </div>
    <div className="absolute top-[3px] left-[4px] right-[4px] h-[40%] rounded-t-[15px] bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#E8FF86] rounded-full border-2 border-black flex items-center justify-center"><span className="text-[8px]">✦</span></div>
  </div>
)

const TILL_ID = '984837533'
type Profile = { id: string; business_name: string; whatsapp_number: string; store_slug: string; store_theme?: string; current_plan?: string }
type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; user_id: string }
type Billing = 'monthly' | 'yearly'
type PlanDef = { id: 'basic'|'advanced'|'premium'; name: string; monthly: number; yearlyMonthly: number; yearlyTotal: number; products: number; imagesPerProduct: number; advancedAllowed: number|'all'; premiumAllowed: number|'all'; stores: number; features: string[] }

const PremiumProductCard = ({ p, onEdit, onDelete, themeId, imageLimit }: { p: any; onEdit: (p:any)=>void; onDelete: (id:string)=>void; themeId: string; imageLimit: number }) => {
  const [hoverIdx, setHoverIdx] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const images = (() => { if (p.image_urls && Array.isArray(p.image_urls) && p.image_urls.length>0) return p.image_urls; if (typeof p.image_urls==='string'){try{const pa=JSON.parse(p.image_urls); if(Array.isArray(pa)) return pa}catch{} return [p.image_urls]} if(p.image_url) return [p.image_url]; return [] })()
  useEffect(() => {
    if (!isHovering || images.length <= 1) return
    const interval = setInterval(() => { setHoverIdx(prev => (prev + 1) % images.length) }, 2000)
    return () => clearInterval(interval)
  }, [isHovering, images.length])
  return (
    <div className="group bg-white border rounded-[20px] p-3 hover:border-black hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      <div className="relative overflow-hidden rounded-[14px] h-48 bg-[#F8F7F5]">
        <img src={images[hoverIdx]} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.03]" alt={p.name} />
        {images.length > 1 && <><div className="absolute top-2 left-2 bg-black/70 backdrop-blur text-white text-[10px] px-2 py-1 rounded-full font-bold">{hoverIdx+1}/{images.length} {isHovering ? '• AUTO' : ''}</div><div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">{images.map((_:any,i:number)=><div key={i} className={`h-1 rounded-full transition-all ${i===hoverIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />)}</div></>}
      </div>
      <div className="mt-3 px-1"><div className="font-bold text-[13px] truncate">{p.name}</div><div className="flex items-center justify-between mt-1"><span className="font-black text-[14px]">Rs. {p.price.toLocaleString()}</span><span className="text-[11px] text-zinc-500">{images.length} img</span></div><div className="mt-3 flex gap-2"><button onClick={()=>onEdit(p)} className="flex-1 h-8 bg-black text-white rounded-full text-[11px] font-bold">Edit</button><button onClick={()=>onDelete(p.id)} className="h-8 w-8 border rounded-full flex items-center justify-center text-[12px]">✕</button></div></div>
    </div>
  )
}

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
  const [prodDesc, setProdDesc] = useState('')
  const [prodCategory, setProdCategory] = useState('General')
  const [prodStock, setProdStock] = useState('100')
  const [prodSizes, setProdSizes] = useState('')
  const [prodColors, setProdColors] = useState('')
  const [prodOrigPrice, setProdOrigPrice] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [filter, setFilter] = useState<ThemeCategory | 'all' | string>('all')
  const [activeTab, setActiveTab] = useState<'store'|'themes'|'products'|'analytics'|'payments'>('themes')
  const [selectedPlan, setSelectedPlan] = useState<PlanDef | null>(null)
  const [billing, setBilling] = useState<Billing>('monthly')
  const [txnId, setTxnId] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const [copiedTill, setCopiedTill] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [myPayments, setMyPayments] = useState<any[]>([])
  const [showStatusModal, setShowStatusModal] = useState<null | {type:'approved'|'rejected', payment:any}>(null)
  const router = useRouter()

  const plans: PlanDef[] = [
    { id: 'basic', name: 'Basic', monthly: 0, yearlyMonthly: 0, yearlyTotal: 0, products: 5, imagesPerProduct: 1, advancedAllowed: 3, premiumAllowed: 0, stores: 1, features: ['5 Products', '1 Image / product', '3 Advanced Themes', '0 Premium (Glass)', 'COD Only', 'Watermark'] },
    { id: 'advanced', name: 'Advanced', monthly: 899, yearlyMonthly: 699, yearlyTotal: 8388, products: 25, imagesPerProduct: 5, advancedAllowed: 8, premiumAllowed: 0, stores: 3, features: ['25 Products', '5 Images / product', 'All 8 Advanced Themes', '0 Premium Glass (locked)', 'Orders Dashboard'] },
    { id: 'premium', name: 'Premium', monthly: 2999, yearlyMonthly: 2499, yearlyTotal: 29988, products: 999999, imagesPerProduct: 999999, advancedAllowed: 'all', premiumAllowed: 'all', stores: 999999, features: ['Unlimited Products', 'Unlimited Images', 'Every Theme (8 Advanced + 6 Premium)', 'No Watermark', 'Live Analytics'] },
  ]

  const currentPlanId = (profile?.current_plan || 'basic') as 'basic'|'advanced'|'premium'
  const currentPlanDef = plans.find(p=>p.id===currentPlanId) || plans[0]
  const isPremium = currentPlanId === 'premium'
  const isAdvanced = currentPlanId === 'advanced' || isPremium
  const productLimit = currentPlanDef.products
  const imageLimit = currentPlanDef.imagesPerProduct

  const premiumThemes = getAdvancedThemes()
  const premiumIds = premiumThemes.map(t=>t.id)
  const urduThemes = STORE_THEMES.filter(t => (t as any).lang === 'UR')
  const englishStandard = STORE_THEMES.filter(t => (t as any).lang === 'EN' && (t.category as string) === 'advanced')
  const advancedThemesList = [...urduThemes, ...englishStandard].slice(0,8)
  const finalAdvancedList = advancedThemesList.length ? advancedThemesList : STORE_THEMES.filter(t=>!premiumIds.includes(t.id)).slice(0,8)
  const basicAllowedAdvancedIds = finalAdvancedList.slice(0,3).map(t=>t.id)

  const isPremiumTheme = (t: any) => premiumIds.includes(t.id) || (t.category as string) === 'premium' || (t as any).isPremium
  const isAdvancedTheme = (t: any) => !isPremiumTheme(t) && finalAdvancedList.some(a=>a.id===t.id) || (t.category as string) === 'advanced'
  const isThemeLocked = (t: any) => {
    if (isPremium) return false
    if (isPremiumTheme(t)) return true
    if (isAdvancedTheme(t)) {
      if (isAdvanced) return false
      return !basicAllowedAdvancedIds.includes(t.id)
    }
    return false
  }

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
          const { data: pays } = await supabase.from('plan_payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
          if (pays) setMyPayments(pays)
        }
      } catch (e: any) { setErrorMsg(e.message) }
      setTimeout(()=>setLoading(false), 700)
    }
    init()
  }, [])

  const handleThemeClick = (t: any) => {
    if (isThemeLocked(t)) {
      if (isPremiumTheme(t)) { alert(`🔒 Premium Glass Locked\nNeed Premium — Till ${TILL_ID} Rs. 2999/mo`); setActiveTab('payments'); return }
      alert(`🔒 Advanced Theme Locked\nBasic allows 3/8 Advanced\nNeed Advanced — Till ${TILL_ID} Rs. 899/mo`); setActiveTab('payments'); return
    }
    setTheme(t.id)
  }

  const saveStore = async () => {
    if (!profile) return; setSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({ business_name: businessName.trim(), whatsapp_number: whatsapp.trim(), store_slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g,'-'), store_theme: theme }).eq('id', profile.id)
      if (error) throw error; setSaved(true); setTimeout(()=>setSaved(false), 2500)
    } catch (e: any) { setErrorMsg(e.message) } setSaving(false)
  }
  const copyLink = async () => { const url = `${window.location.origin}/s/${slug}`; await navigator.clipboard.writeText(url); setCopied(true); setTimeout(()=>setCopied(false), 2000) }
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []); if (!selected.length) return
    if (selected.length > imageLimit && imageLimit !== 999999) { setErrorMsg(`❌ ${currentPlanId.toUpperCase()} allows ${imageLimit} images`); return }
    setFiles(selected)
    const pr: string[] = []
    selected.forEach(file => { const r = new FileReader(); r.onload = ev => { pr.push(ev.target?.result as string); if (pr.length === selected.length) setPreviews(pr) }; r.readAsDataURL(file) })
  }
  const uploadOne = async (file: File, userId: string) => {
    const ext = file.name.split('.').pop(); const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(fileName, file); if (error) throw error
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName); return data.publicUrl
  }
  const startEdit = (p: any) => { setEditingId(p.id); setProdName(p.name); setProdPrice(String(p.price)); setProdDesc(p.description || ''); setProdCategory(p.category || 'General'); setProdStock(String(p.stock || 100)); setProdSizes(Array.isArray(p.sizes) ? p.sizes.join(', ') : p.sizes || ''); setProdColors(Array.isArray(p.colors) ? p.colors.join(', ') : p.colors || ''); setProdOrigPrice(p.original_price ? String(p.original_price) : ''); setPreviews(p.image_urls && p.image_urls.length ? p.image_urls : [p.image_url]); setFiles([]); setActiveTab('products'); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const cancelEdit = () => { setEditingId(null); setProdName(''); setProdPrice(''); setProdDesc(''); setProdCategory('General'); setProdStock('100'); setProdSizes(''); setProdColors(''); setProdOrigPrice(''); setFiles([]); setPreviews([]) }
  const addProduct = async () => {
    if (editingId === null && products.length >= productLimit){ setErrorMsg(`🔒 ${currentPlanId.toUpperCase()} allows ${productLimit} products`); return }
    if (!prodName.trim() || !prodPrice){ setErrorMsg('Name and price required'); return}
    if (files.length === 0 && !editingId){ setErrorMsg('Photo required'); return}
    setUploading(true)
    try{
      const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Not logged in')
      let urls: string[] = []
      for (const f of files){ const url = await uploadOne(f, user.id); urls.push(url) }
      if (editingId && urls.length === 0) { const existing = products.find(p=>p.id===editingId); if (existing) { urls = existing.image_urls && existing.image_urls.length ? existing.image_urls : [existing.image_url].filter(Boolean) as string[] } }
      if (editingId) {
        const payload: any = { name: prodName.trim(), price: Number(prodPrice), image_url: urls[0], image_urls: urls, description: prodDesc.trim(), category: prodCategory, stock: Number(prodStock) || 100 }
        const { data, error } = await supabase.from('products').update(payload).eq('id', editingId).select().single()
        if (error) throw error
        if (data) setProducts(products.map(pr => pr.id === editingId ? data : pr))
        setEditingId(null)
      } else {
        const { data, error } = await supabase.from('products').insert({ user_id: user.id, name: prodName.trim(), price: Number(prodPrice), image_url: urls[0], image_urls: urls, description: prodDesc.trim(), category: prodCategory, stock: Number(prodStock) || 100 }).select().single()
        if (error) throw error
        if (data) setProducts([data, ...products])
      }
      setProdName(''); setProdPrice(''); setProdDesc(''); setProdCategory('General'); setProdStock('100'); setFiles([]); setPreviews([]); 
    }catch(e:any){ setErrorMsg(e.message) } setUploading(false)
  }
  const deleteProduct = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('products').delete().eq('id', id); setProducts(products.filter(p=>p.id!==id)) }

  if (loading) return <DukaanWhatsLoader />
  return (
    <div className="min-h-screen bg-[#F8F7F5]">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-2 mb-6">
          <button onClick={()=>setActiveTab('store')} className={`px-4 py-2 rounded-full text-sm ${activeTab==='store'?'bg-black text-white':'bg-white border'}`}>Store</button>
          <button onClick={()=>setActiveTab('themes')} className={`px-4 py-2 rounded-full text-sm ${activeTab==='themes'?'bg-black text-white':'bg-white border'}`}>Themes • {STORE_THEMES.length}</button>
          <button onClick={()=>setActiveTab('products')} className={`px-4 py-2 rounded-full text-sm ${activeTab==='products'?'bg-black text-white':'bg-white border'}`}>Products {products.length}/{productLimit===999999?'∞':productLimit}</button>
        </div>

        {activeTab==='store' && (
          <div className="bg-white rounded-[20px] p-6 border">
            <h3 className="font-black">Store Settings + Slug</h3>
            <input value={businessName} onChange={e=>setBusinessName(e.target.value)} placeholder="Business Name" className="w-full border p-3 mt-3 rounded-xl" />
            <input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="WhatsApp 92300..." className="w-full border p-3 mt-3 rounded-xl" />
            <div className="flex gap-2 mt-3"><span className="bg-zinc-100 px-3 py-3 rounded-xl">/s/</span><input value={slug} onChange={e=>setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g,'-'))} placeholder="store-slug" className="flex-1 border p-3 rounded-xl" /></div>
            <button onClick={saveStore} className="w-full bg-black text-white py-3 rounded-full mt-4 font-bold">{saving?'Saving...':saved?'Saved ✓':'Save Store & Slug'}</button>
            <div className="mt-3 text-xs">Link: <Link href={`/s/${slug}`} target="_blank" className="text-green-600 underline">/s/{slug}</Link> <button onClick={copyLink} className="ml-2 text-xs bg-zinc-100 px-2 py-1 rounded-full">{copied?'Copied':'Copy'}</button></div>
          </div>
        )}

        {activeTab==='themes' && (
          <div className="space-y-8">
            <div>
              <h3 className="font-black text-[18px]">8 Standard Themes — 3 Urdu + 5 English</h3>
              <p className="text-[12px] text-zinc-500 mt-1">These are free for all plans — glass preview kept</p>
              <div className="grid md:grid-cols-4 gap-4 mt-4">
                {finalAdvancedList.map(t=>{
                  const isActive=theme===t.id; const locked=isThemeLocked(t)
                  return (
                    <div key={t.id} onClick={()=>handleThemeClick(t)} className={`relative bg-white border rounded-[20px] p-4 cursor-pointer hover:border-black ${isActive?'border-black ring-2 ring-black':''} ${locked?'opacity-60':''}`}>
                      <div className="h-24 rounded-[12px]" style={{background:t.colors.bg}} />
                      <div className="mt-3 font-bold text-[13px] flex justify-between">{t.name} {(t as any).nameUrdu && <span className="text-[11px]">{(t as any).nameUrdu}</span>}</div>
                      <div className="text-[11px] text-zinc-500 mt-1">{t.description}</div>
                      {isActive && <div className="absolute top-3 right-3 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[10px]">✓</div>}
                      {locked && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-[20px] flex flex-col items-center justify-center"><GlassLockIcon size={40} /><div className="text-[10px] font-bold mt-2">LOCKED</div></div>}
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="font-black text-[18px] flex items-center gap-2">6 Premium Themes — Glass Preview Kept <span className="bg-black text-white text-[10px] px-2 py-1 rounded-full">PREMIUM</span></h3>
              <p className="text-[12px] text-zinc-500 mt-1">Your glass animation layout preserved — 3 existing + 3 new sleek from your images</p>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                {premiumThemes.map((t,i)=>{
                  const isActive=theme===t.id; const locked=isThemeLocked(t)
                  return (
                    <div key={t.id} onClick={()=>handleThemeClick(t)} className={`relative bg-white border rounded-[20px] p-4 cursor-pointer hover:border-black ${isActive?'border-black ring-2 ring-black':''}`}>
                      <div className="h-32 rounded-[14px] overflow-hidden relative" style={{background:(t.colors.bg)}}>
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] tracking-widest opacity-60">{t.id.toUpperCase()} • PREMIUM</div>
                        <div className="absolute bottom-2 left-2 right-2 flex gap-2"><div className="flex-1 h-12 rounded-[10px] bg-white border" /><div className="flex-1 h-12 rounded-[10px] bg-white border" /></div>
                      </div>
                      <div className="mt-3 font-black text-[13px] flex justify-between">{t.name} <span className="text-[10px] bg-[#E8FF86] text-black px-2 py-0.5 rounded-full">{t.price}</span></div>
                      <div className="text-[11px] text-zinc-500 mt-1 line-clamp-2">{t.description}</div>
                      <div className="flex gap-1 mt-2 flex-wrap">{t.features?.slice(0,3).map((f:string)=><span key={f} className="text-[9px] bg-zinc-100 px-2 py-0.5 rounded-full">{f}</span>)}</div>
                      {isActive && <div className="absolute top-4 right-4 w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-[12px] font-bold">✓</div>}
                      {locked && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-[20px] flex flex-col items-center justify-center p-4 text-center">
                          <GlassPremiumLock size={56} />
                          <div className="font-black text-[12px] mt-3">PREMIUM LOCKED</div>
                          <div className="text-[10px] text-zinc-500 mt-1">Need Premium Rs. 2999/mo<br/>Till {TILL_ID}</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab==='products' && (
          <div className="bg-white rounded-[20px] p-6 border">
            <h3 className="font-black">Add Product</h3>
            <input type="file" multiple accept="image/*" onChange={handleFile} className="w-full mt-3 text-xs" />
            <div className="flex gap-2 mt-2 flex-wrap">{previews.map((src,i)=><img key={i} src={src} className="w-20 h-20 object-cover rounded-xl border" />)}</div>
            <input placeholder="Product name" value={prodName} onChange={e=>setProdName(e.target.value)} className="w-full border p-3 mt-3 rounded-xl" />
            <input placeholder="Price Rs." type="number" value={prodPrice} onChange={e=>setProdPrice(e.target.value)} className="w-full border p-3 mt-3 rounded-xl" />
            <button onClick={addProduct} className="w-full bg-black text-white py-3 rounded-full mt-4 font-bold">{uploading?'Uploading...':editingId?'Update Product':'Add Product'}</button>
            {editingId && <button onClick={cancelEdit} className="w-full border py-3 rounded-full mt-2">Cancel Edit</button>}
            <div className="grid md:grid-cols-3 gap-4 mt-6">{products.map(p=><PremiumProductCard key={p.id} p={p} onEdit={startEdit} onDelete={deleteProduct} themeId={theme} imageLimit={imageLimit} />)}</div>
          </div>
        )}
      </div>
      {errorMsg && <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full text-xs">{errorMsg}</div>}
    </div>
  )
}
