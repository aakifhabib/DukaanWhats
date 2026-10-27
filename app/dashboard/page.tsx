'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { RealAnalytics } from '@/components/RealAnalytics'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STORE_THEMES, getTheme, ThemeCategory, getAdvancedThemes, getPremiumThemes, getStandardThemes } from '@/lib/storeThemes'
import { DukaanWhatsLoader } from '@/components/DukaanWhatsLoader'
import { PremiumThemeEditor } from '@/components/PremiumThemeEditor'

// --- ICONS (same logic, new style) ---
const UploadIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <div className={`${className} relative`}>
    <div className="absolute inset-0 bg-[#0A0A0A] rounded-[14px] shadow-[0_8px_20px_rgba(0,0,0,0.15)]" />
    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black rounded-[14px]" />
    <div className="absolute inset-[1px] bg-black rounded-[13px] flex items-center justify-center">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 15.5V19.5C3 20.6 3.9 21.5 5 21.5H19C20.1 21.5 21 20.6 21 19.5V15.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/><path d="M12 3.5V14.5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/><path d="M8.5 7L12 3.5L15.5 7" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="12.5" r="1.2" fill="white" opacity="0.9"/></svg>
    </div>
    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#E8FF86] rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(167,139,250,0.5)] border-2 border-white">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
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
  </div>
)
const AnalyticsIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"><rect x="3" y="12" width="4" height="8" rx="1.5" fill="currentColor" /><rect x="10" y="8" width="4" height="12" rx="1.5" fill="currentColor" opacity="0.7" /><rect x="17" y="4" width="4" height="16" rx="1.5" fill="currentColor" opacity="0.4" /></svg>
)
const LiveDot = () => (<span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8FF86] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#E8FF86]"></span></span>)

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
    <div className="group bg-[#FCFBF9]/90 backdrop-blur border border-white/60 rounded-[24px] p-3 hover:bg-white hover:border-black/10 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] transition-all duration-300"
         onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      <div className="relative overflow-hidden rounded-[18px] h-48 bg-[#F5F1ED]">
        <img src={images[hoverIdx]} className="w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.03]" alt={p.name} />
        {images.length > 1 && (
          <>
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur text-white text-[10px] px-2.5 py-1 rounded-full font-bold">{hoverIdx+1}/{images.length} {isHovering ? '• AUTO' : ''}</div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">{images.map((_:any,i:number)=><div key={i} className={`h-1 rounded-full transition-all duration-300 ${i===hoverIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/60'}`} />)}</div>
          </>
        )}
      </div>
      <div className="mt-3 px-1">
        <div className="font-bold text-[13px] truncate tracking-tight">{p.name}</div>
        <div className="flex items-center justify-between mt-1"><span className="font-black text-[14px]">Rs. {p.price.toLocaleString()}</span><span className="text-[11px] text-zinc-500 bg-white px-2 py-0.5 rounded-full border">{images.length} img</span></div>
        <div className="mt-3 flex gap-2"><button onClick={()=>onEdit(p)} className="flex-1 h-8 bg-[#0A0A0A] text-white rounded-full text-[11px] font-bold hover:bg-zinc-800">Edit</button><button onClick={()=>onDelete(p.id)} className="h-8 w-8 bg-white border rounded-full flex items-center justify-center text-[12px] hover:bg-zinc-50">✕</button></div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [premiumCustom, setPremiumCustom] = useState<any>({})
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
  const [justSubmitted, setJustSubmitted] = useState<any>(null)
  const router = useRouter()

  const plans: PlanDef[] = [
    { id: 'basic', name: 'Basic', monthly: 0, yearlyMonthly: 0, yearlyTotal: 0, products: 5, imagesPerProduct: 1, advancedAllowed: 3, premiumAllowed: 0, stores: 1, features: ['5 Products', '1 Image / Product', '3 Advanced Themes', '1 Store'] },
    { id: 'advanced', name: 'Advanced', monthly: 899, yearlyMonthly: 699, yearlyTotal: 8388, products: 25, imagesPerProduct: 5, advancedAllowed: 8, premiumAllowed: 0, stores: 3, features: ['25 Products', '5 Images / Product', 'All Advanced Themes', '3 Stores'] },
    { id: 'premium', name: 'Premium', monthly: 2999, yearlyMonthly: 2499, yearlyTotal: 29988, products: 999999, imagesPerProduct: 999999, advancedAllowed: 'all', premiumAllowed: 'all', stores: 999999, features: ['Unlimited Products', 'Unlimited Images', 'All Themes incl. Glass Premium', 'Unlimited Stores', 'Analytics'] },
  ]

  const currentPlanId = (profile?.current_plan || 'basic') as 'basic'|'advanced'|'premium'
  const currentPlanDef = plans.find(p=>p.id===currentPlanId) || plans[0]
  const isPremium = currentPlanId === 'premium'
  const isAdvanced = currentPlanId === 'advanced' || isPremium
  const productLimit = currentPlanDef.products
  const imageLimit = currentPlanDef.imagesPerProduct

  const PREMIUM_NEW_IDS = ['spike-premium','shoe-app-premium','trenzo-luxury']
  const advancedGlassRaw = getAdvancedThemes()
  const premiumNewRaw = getPremiumThemes()
  const premiumThemes = [...advancedGlassRaw, ...premiumNewRaw]
  const premiumIds = premiumThemes.map(t=>t.id)
  const allAdvancedRaw = STORE_THEMES.filter(t => (t.category as string) === 'advanced' && !advancedGlassRaw.map(x=>x.id).includes(t.id))
  const advancedThemesList = allAdvancedRaw.length >= 5 ? allAdvancedRaw.slice(0,8) : [...allAdvancedRaw, ...STORE_THEMES.filter(t=> (t.category as string) === 'clothing' || (t.category as string) === 'elegance')]
  const finalAdvancedList = advancedThemesList.length ? advancedThemesList.slice(0,8) : STORE_THEMES.filter(t=>!premiumIds.includes(t.id)).slice(0,8)
  const basicAllowedAdvancedIds = finalAdvancedList.slice(0,3).map(t=>t.id)
  const isPremiumTheme = (t: any) => premiumIds.includes(t.id) || PREMIUM_NEW_IDS.includes(t.id) || (t.category as string) === 'premium' || (t as any).tier === 'premium'
  const isAdvancedTheme = (t: any) => !isPremiumTheme(t) && (finalAdvancedList.some((a:any)=>a.id===t.id) || (t.category as string) === 'advanced')
  const isThemeLocked = (t: any) => {
    if (isPremium) return false
    if (isPremiumTheme(t)) return true
    if (isAdvancedTheme(t)) { if (isAdvanced) return false; return !basicAllowedAdvancedIds.includes(t.id) }
    return false
  }
  const GLASS_TILTS = [-12, 9, -10, 11, -8, 13, -14, 7]

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
          setProfile(prof); setBusinessName(prof.business_name || ''); setWhatsapp(prof.whatsapp_number || ''); setSlug(prof.store_slug || ''); setTheme(prof.store_theme || 'clothing-noor'); setPremiumCustom((prof as any).premium_custom || {})
          const { data: prods } = await supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
          if (prods) setProducts(prods)
          const { data: pays } = await supabase.from('plan_payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
          if (pays) {
            setMyPayments(pays)
            const lastSeenId = localStorage.getItem('dw_last_seen_payment')
            const latest = pays[0]
            if (latest && latest.id !== lastSeenId) {
              if (latest.status === 'approved' || latest.status === 'rejected') {
                setShowStatusModal({ type: latest.status, payment: latest })
                localStorage.setItem('dw_last_seen_payment', latest.id)
              } else if (latest.status === 'pending') {
                localStorage.setItem('dw_last_seen_payment_pending', latest.id)
              }
            } else if (latest && latest.status !== 'pending') {
              const lastStatus = localStorage.getItem('dw_last_seen_status_'+latest.id)
              if (lastStatus !== latest.status && (latest.status === 'approved' || latest.status === 'rejected')) {
                setShowStatusModal({ type: latest.status, payment: latest })
                localStorage.setItem('dw_last_seen_status_'+latest.id, latest.status)
              }
            }
            if (latest) localStorage.setItem('dw_last_seen_status_'+latest.id, latest.status)
          }
        }
      } catch (e: any) { setErrorMsg(e.message) }
      setTimeout(()=>setLoading(false), 700)
    }
    init()
  }, [])

  const handleThemeClick = (t: any) => {
    if (isThemeLocked(t)) {
      if (isPremiumTheme(t)) { alert(`🔒 Premium Glass Locked\nNeed Premium — Till ${TILL_ID} Rs. 2999/mo`); setActiveTab('payments'); return }
      alert(`🔒 Advanced Theme Locked\nNeed Advanced — Till ${TILL_ID} Rs. 899/mo`); setActiveTab('payments'); return
    }
    setTheme(t.id)
  }

  const saveStore = async () => {
    if (!profile) return; setSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({ business_name: businessName.trim(), whatsapp_number: whatsapp.trim(), store_slug: slug.trim(), store_theme: theme, premium_custom: premiumCustom }).eq('id', profile.id)
      if (error) throw error; setSaved(true); setTimeout(()=>setSaved(false), 2500)
    } catch (e: any) { setErrorMsg(e.message) } setSaving(false)
  }
  const copyLink = async () => { const url = `${window.location.origin}/s/${slug}`; await navigator.clipboard.writeText(url); setCopied(true); setTimeout(()=>setCopied(false), 2000) }
  const copyTill = async () => { await navigator.clipboard.writeText(TILL_ID); setCopiedTill(true); setTimeout(()=>setCopiedTill(false), 2000) }
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []); if (!selected.length) return
    const totalFiles = selected.length
    if (totalFiles > imageLimit && imageLimit !== 999999) { setErrorMsg(`❌ ${currentPlanId.toUpperCase()} allows ${imageLimit} images per product.`); setTimeout(()=>setErrorMsg(null),4000); return }
    const newFiles = editingId ? [...files, ...selected].slice(0, imageLimit === 999999 ? 20 : imageLimit) : selected
    setFiles(newFiles)
    const pr: string[] = []
    const existingPreviews = editingId ? previews : []
    newFiles.forEach(file => {
      const r = new FileReader()
      r.onload = ev => { pr.push(ev.target?.result as string); if (pr.length === newFiles.length) { setPreviews(editingId ? [...existingPreviews, ...pr].slice(0, newFiles.length) : pr) } }
      r.readAsDataURL(file)
    })
    if (newFiles.length === 0) setPreviews([])
  }
  const removeFileAt = (idx: number) => { const nf = files.filter((_, i) => i !== idx); const np = previews.filter((_, i) => i !== idx); setFiles(nf); setPreviews(np) }
  const uploadOne = async (file: File, userId: string) => {
    const ext = file.name.split('.').pop(); const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(fileName, file); if (error) throw error
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName); return data.publicUrl
  }
  const startEdit = (p: any) => { 
    setEditingId(p.id); setProdName(p.name); setProdPrice(String(p.price)); setProdDesc(p.description || ''); setProdCategory(p.category || 'General'); setProdStock(String(p.stock || 100)); setProdSizes(Array.isArray(p.sizes) ? p.sizes.join(', ') : p.sizes || ''); setProdColors(Array.isArray(p.colors) ? p.colors.join(', ') : p.colors || ''); setProdOrigPrice(p.original_price ? String(p.original_price) : ''); setPreviews(p.image_urls && p.image_urls.length ? p.image_urls : [p.image_url]); setFiles([]); setActiveTab('products'); window.scrollTo({ top: 0, behavior: 'smooth' }) 
  }
  const cancelEdit = () => { setEditingId(null); setProdName(''); setProdPrice(''); setProdDesc(''); setProdCategory('General'); setProdStock('100'); setProdSizes(''); setProdColors(''); setProdOrigPrice(''); setFiles([]); setPreviews([]) }
  const addProduct = async () => {
    if (editingId === null && products.length >= productLimit){ setErrorMsg(`🔒 ${currentPlanId.toUpperCase()} allows ${productLimit===999999?'Unlimited':productLimit} products.`); setTimeout(()=>setErrorMsg(null),4000); setActiveTab('payments'); return }
    if (!prodName.trim() || !prodPrice){ setErrorMsg('Name and price required'); setTimeout(()=>setErrorMsg(null),3000); return}
    if (files.length === 0 && !editingId){ setErrorMsg('Photo required'); setTimeout(()=>setErrorMsg(null),3000); return}
    if (files.length > imageLimit && imageLimit!==999999){ setErrorMsg(`❌ Allows ${imageLimit} images.`); setTimeout(()=>setErrorMsg(null),4000); return}
    setUploading(true)
    try{
      const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Not logged in')
      let urls: string[] = []
      for (const f of files){ const url = await uploadOne(f, user.id); urls.push(url) }
      if (editingId && urls.length === 0) { const existing = products.find(p=>p.id===editingId); if (existing) { urls = existing.image_urls && existing.image_urls.length ? existing.image_urls : [existing.image_url].filter(Boolean) as string[] } }
      if (urls.length === 0) throw new Error('No images')
      if (editingId) {
        const sizesArr = prodSizes.split(',').map(s=>s.trim()).filter(Boolean)
        const colorsArr = prodColors.split(',').map(s=>s.trim()).filter(Boolean)
        const payload: any = { name: prodName.trim(), price: Number(prodPrice), image_url: urls[0], image_urls: urls, description: prodDesc.trim(), category: prodCategory, stock: Number(prodStock) || 100, sizes: sizesArr, colors: colorsArr, original_price: prodOrigPrice ? Number(prodOrigPrice) : 0 }
        const { data, error } = await supabase.from('products').update(payload).eq('id', editingId).select().single()
        if (error) throw error; if (data) setProducts(products.map(pr => pr.id === editingId ? data : pr)); setEditingId(null)
      } else {
        const sizesArr = prodSizes.split(',').map(s=>s.trim()).filter(Boolean)
        const colorsArr = prodColors.split(',').map(s=>s.trim()).filter(Boolean)
        const { data, error } = await supabase.from('products').insert({ user_id: user.id, name: prodName.trim(), price: Number(prodPrice), image_url: urls[0], image_urls: urls, description: prodDesc.trim(), category: prodCategory, stock: Number(prodStock) || 100, sizes: sizesArr, colors: colorsArr, original_price: prodOrigPrice ? Number(prodOrigPrice) : 0 }).select().single()
        if (error) throw error; if (data) setProducts([data, ...products])
      }
      setProdName(''); setProdPrice(''); setProdDesc(''); setProdCategory('General'); setProdStock('100'); setProdSizes(''); setProdColors(''); setProdOrigPrice(''); setFiles([]); setPreviews([]); 
    }catch(e:any){ setErrorMsg(e.message); setTimeout(()=>setErrorMsg(null),5000) } setUploading(false)
  }
  const deleteProduct = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('products').delete().eq('id', id); setProducts(products.filter(p=>p.id!==id)) }
  const handleBuyPlan = async () => {
    if (!selectedPlan) return; if (selectedPlan.monthly===0){setSelectedPlan(null); return}; if (!txnId.trim()){setErrorMsg('Enter Transaction ID'); setTimeout(()=>setErrorMsg(null),3000); return}; setPurchasing(true)
    const amount = billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal
    try{
      const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Not logged in')
      const { error } = await supabase.from('plan_payments').insert({ user_id: user.id, plan_id: selectedPlan.id, amount, till_id: TILL_ID, txn_id: txnId.trim(), status: 'pending' })
      if (error) throw error;
      const { data: pays } = await supabase.from('plan_payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (pays) { setMyPayments(pays); if (pays[0]) setJustSubmitted(pays[0]) }
      setSelectedPlan(null); setTxnId('')
    }catch(e:any){ setErrorMsg(e.message); setTimeout(()=>setErrorMsg(null),4000) } setPurchasing(false)
  }

  if (loading) return <DukaanWhatsLoader message="Loading your store..." />

  const standardThemes = STORE_THEMES.filter(t => !premiumIds.includes(t.id) && !finalAdvancedList.some(a=>a.id===t.id))
  const filteredStandard = (filter as string) === 'all' ? standardThemes : STORE_THEMES.filter(t => (t.category as string) === (filter as string) && !premiumIds.includes(t.id) && !finalAdvancedList.some(a=>a.id===t.id))
  const filteredAdvanced = (filter as string) === 'all' || filter === 'advanced' ? finalAdvancedList : finalAdvancedList.filter(t=>(t.category as string)===filter)
  const getDisplayPrice = (p: PlanDef) => billing==='monthly'?p.monthly:p.yearlyMonthly

  const CurrentPlanButton = () => (
    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur border border-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <span className={`w-2 h-2 rounded-full ${isPremium?'bg-[#E8FF86] shadow-[0_0_8px_#E8FF86]':isAdvanced?'bg-black':'bg-zinc-400'} animate-pulse`}></span>
      <span className="text-[11px] font-bold tracking-widest">{currentPlanDef.name.toUpperCase()}</span>
      <span className="text-[10px] opacity-50 font-mono hidden md:inline">• {productLimit===999999?'∞':productLimit} prod • {imageLimit===999999?'∞':imageLimit} img</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#EDE8E3] text-zinc-900 pb-24 antialiased overflow-x-clip selection:bg-[#E8FF86]/20">
      <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        .glass-container { position: relative; display: flex; justify-content: flex-start; align-items: center; min-height: 380px; padding: 30px 24px 50px 32px; gap: 0; overflow-x: auto; overflow-y: visible; scroll-snap-type: x proximity; -webkit-overflow-scrolling: touch; } .glass-container::-webkit-scrollbar{display:none}
        .glass-container .glass { position: relative; width: 260px; height: 330px; flex-shrink: 0; background: rgba(255,255,255,0.75); border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 20px 50px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,1) inset; display: flex; flex-direction: column; align-items: center; border-radius: 28px; backdrop-filter: blur(16px); transition: all 0.45s cubic-bezier(0.4,0,0.2,1); transform: rotate(var(--r,0deg)); margin: 0 -18px; }
        .glass-container .glass:hover { transform: rotate(0deg) translateY(-12px) scale(1.05); margin: 0 16px; box-shadow: 0 28px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04); z-index: 10; background: #fff; }
        .glass-container .glass.selected { background: #0A0A0A; border: 2px solid #0A0A0A; transform: rotate(0deg) translateY(-16px) scale(1.07); margin: 0 18px; z-index: 20; box-shadow: 0 28px 70px rgba(0,0,0,0.22), 0 0 0 4px #E8FF86; }
        .glass-lock-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.78); backdrop-filter: blur(18px) saturate(1.2); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; z-index: 10; border-radius: 28px; }
        .glass-preview-wrap { width: 86%; height: 220px; border-radius: 16px; overflow: hidden; border: 1px solid rgba(0,0,0,0.06); display: flex; flex-direction: column; background: #F8F7F5; margin-top: 16px; }
        .adv-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; } @media (min-width: 768px){ .adv-grid{ grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap:16px; } }
        .adv-card { width: 100%; height: 196px; border-radius: 22px; background: rgba(255,255,255,0.75); border: 1px solid rgba(255,255,255,0.9); backdrop-filter: blur(12px); box-shadow: 0 8px 24px rgba(0,0,0,0.04); display: flex; flex-direction: column; align-items: flex-start; padding: 14px; cursor: pointer; transition: all 0.25s ease; position: relative; overflow: hidden; text-align: left; }
        .adv-card:hover { transform: translateY(-4px); background: #fff; box-shadow: 0 16px 32px rgba(0,0,0,0.08); }
        .adv-card.selected { border: 2px solid #0A0A0A; box-shadow: 0 0 0 3px #E8FF86, 0 16px 32px rgba(0,0,0,0.1); background: #fff; }
        .adv-card-lock-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.86); backdrop-filter: blur(10px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; z-index: 5; border-radius: 22px; }
        .modern-pill { height: 36px; padding: 0 18px; border-radius: 999px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 7px; white-space: nowrap; transition: all .25s; }
        .modern-pill-active { background: #fff; color: #0A0A0A; font-weight: 600; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.06); }
        .modern-pill-inactive { color: #71717a; } .modern-pill-inactive:hover { color: #000; background: rgba(255,255,255,0.6); }
        .billing-toggle{display:flex;background:#0A0A0A;border-radius:999px;padding:3px;gap:3px}
        .billing-btn{height:28px;padding:0 12px;border-radius:999px;font-size:11px;font-weight:600;transition:all .25s;white-space:nowrap;display:flex;align-items:center;}
        .billing-btn-active{background:#fff;color:#0A0A0A} .billing-btn-inactive{color:rgba(255,255,255,0.6)}
        .radio-container{--main-color:#0A0A0A;--total-radio:3;display:flex;flex-direction:column;position:relative;padding-left:1rem}
        .radio-container input{appearance:none;position:absolute;opacity:0} .radio-container .glider-container{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(0deg,transparent 0%,rgba(0,0,0,0.08) 50%,transparent 100%);width:1px}
        .radio-container .glider{position:relative;height:calc(100% / var(--total-radio));width:100%;background:var(--main-color);transition:transform .45s cubic-bezier(0.4,0,0.2,1)}
        .radio-container .glider::before{content:"";position:absolute;height:60%;width:300%;top:50%;transform:translateY(-50%);background:var(--main-color);filter:blur(12px);opacity:0.15}
        .radio-container label{cursor:pointer;padding:14px 14px;border-radius:18px;color:#71717a;transition:all .25s;border:1px solid transparent}
        .radio-container input:checked+label{color:#0A0A0A;background:#fff;border:1px solid #e4e4e7;box-shadow:0 2px 8px rgba(0,0,0,.06)}
        @media (max-width: 768px) { .glass-container .glass { width: 200px; height: 280px; margin: 0 -18px; } .glass-container { min-height: 300px; padding: 20px 0 30px; } }
      `}</style>

      {/* Soft background blurs like reference */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-[#E8FF86]/60 blur-[120px] rounded-full opacity-60" />
        <div className="absolute top-[30%] -right-[15%] w-[50%] h-[50%] bg-[#D6EAF8] blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-[0%] left-[20%] w-[70%] h-[40%] bg-[#FADADD] blur-[140px] rounded-full opacity-60" />
      </div>

      {/* OUTER GLASS DASHBOARD CONTAINER - like the big card in reference */}
      <div className="relative z-10 p-3 md:p-6">
        <div className="max-w-[1280px] mx-auto bg-[#F6F3F1]/85 backdrop-blur-[24px] border border-white/60 rounded-[32px] shadow-[0_32px_80px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] overflow-hidden">

          {/* TOP HEADER - pill nav like reference */}
          <div className="px-4 md:px-8 pt-6 pb-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#E8FF86] to-[#111111] text-white flex items-center justify-center font-bold text-[16px] shadow-[0_8px_20px_rgba(139,111,234,0.3)]">D</div>
              <div className="hidden md:block text-[11px] tracking-[0.14em] font-bold text-zinc-400">DUKAANWHATS</div>
            </div>

            {/* Center Pill Nav */}
            <div className="order-3 md:order-2 w-full md:w-auto bg-[#EFEAE6]/80 backdrop-blur border border-white/50 rounded-full p-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <div className="flex items-center gap-1">
                {[
                  { id: 'store', label: 'Store' },
                  { id: 'themes', label: 'Themes' },
                  { id: 'products', label: `Products` },
                  { id: 'analytics', label: 'Analytics' },
                  { id: 'payments', label: 'PRO', glow: true },
                ].map((t:any) => {
                  const active = activeTab===t.id
                  const isGlow = t.glow
                  return (
                    <button key={t.id} onClick={()=>setActiveTab(t.id as any)}
                      className={`h-[36px] px-4 rounded-full text-[13px] font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${active ? 'bg-white text-black shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-black/5 font-semibold' : isGlow ? 'bg-[#E8FF86] text-black hover:bg-[#222222] shadow-[0_4px_16px_rgba(167,139,250,0.3)]' : 'text-zinc-500 hover:text-black hover:bg-white/60'}`}>
                      {t.label}
                      {t.id==='analytics' && !isPremium && !active && <span className="w-3 h-3 rounded-full bg-black/10 flex items-center justify-center text-[7px]">🔒</span>}
                      {t.id==='analytics' && isPremium && <LiveDot />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right icons like reference */}
            <div className="order-2 md:order-3 flex items-center gap-2 ml-auto md:ml-0">
              <div className="hidden md:flex items-center gap-2 bg-white/60 backdrop-blur rounded-full p-1 border border-white/60">
                <button className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-black/5 hover:bg-zinc-50 text-[16px]">◐</button>
                <button className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-black/5 hover:bg-zinc-50">📅</button>
                <button className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-black/5 hover:bg-zinc-50">⌕</button>
                <button className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-black/5 relative">🔔<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span></button>
              </div>
              <CurrentPlanButton />
              <Link href={slug ? `/s/${slug}` : '#'} target="_blank" className="h-9 px-4 bg-black text-white rounded-full text-[12px] font-medium flex items-center gap-1 hover:bg-zinc-900">View <span className="opacity-60">↗</span></Link>
            </div>
          </div>

          {/* Greeting + Stats Row - inspired by reference's top cards */}
          <div className="px-4 md:px-8 mt-2">
            <h1 className="text-[18px] md:text-[20px] font-bold tracking-tight">Good morning, {businessName || 'James'}!</h1>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#FCFBF9]/80 backdrop-blur border border-white/70 rounded-[24px] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-shadow">
                <div className="flex justify-between items-start"><div className="w-9 h-9 rounded-[12px] bg-white border flex items-center justify-center text-[16px]">◧</div><span className="w-7 h-7 rounded-full bg-white border flex items-center justify-center text-[12px]">⋮</span></div>
                <div className="mt-4 font-black text-[22px] tracking-tight">{products.length}/{productLimit===999999?'∞':productLimit}</div>
                <div className="text-[12px] text-zinc-500 mt-1 leading-tight">Your product<br/>balance</div>
              </div>
              <div className="bg-[#FCFBF9]/80 backdrop-blur border border-white/70 rounded-[24px] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
                <div className="w-9 h-9 rounded-full border-2 border-black flex items-center justify-center relative"><div className="absolute -top-1 -right-1 w-3 h-3 bg-[#E8FF86] rounded-full border-2 border-white"></div>◐</div>
                <div className="mt-4 font-black text-[22px]">{imageLimit===999999?'∞':imageLimit}</div>
                <div className="text-[12px] text-zinc-500 mt-1 leading-tight">Images per<br/>product allowed</div>
              </div>
              <div className="bg-[#FCFBF9]/80 backdrop-blur border border-white/70 rounded-[24px] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
                <div className="w-9 h-9 rounded-[12px] bg-white border flex items-center justify-center">◫</div>
                <div className="mt-4 font-black text-[22px]">{finalAdvancedList.length + premiumThemes.length}</div>
                <div className="text-[12px] text-zinc-500 mt-1 leading-tight">Themes<br/>working today</div>
              </div>
              <div className="bg-[#FCFBF9]/80 backdrop-blur border border-white/70 rounded-[24px] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
                <div className="w-9 h-9 rounded-[12px] bg-white border flex items-center justify-center">↧</div>
                <div className="mt-4 font-black text-[22px]">Rs. {currentPlanDef.monthly}</div>
                <div className="text-[12px] text-zinc-500 mt-1 leading-tight">This month's<br/>plan cost</div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <main className="px-4 md:px-8 py-6 space-y-6">
            {activeTab==='themes' && (
              <div className="space-y-6">
                {/* Advanced */}
                <div className="bg-[#FCFBF9]/70 backdrop-blur border border-white/60 rounded-[28px] p-5 md:p-7 shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3"><span className="bg-black text-white text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full">8 ADVANCED THEMES</span><span className="text-[12px] text-zinc-500">Current: {currentPlanDef.name}</span></div>
                    <div className="flex items-center gap-2"><span className="text-[11px] text-zinc-500">{currentPlanId==='basic'?`${basicAllowedAdvancedIds.length}/8 unlocked`:'All unlocked'}</span><CurrentPlanButton/></div>
                  </div>
                  <div className="adv-grid">
                    {finalAdvancedList.map(t => { const isActive = theme===t.id; const locked = isThemeLocked(t); return (
                      <button key={t.id} onClick={()=>handleThemeClick(t)} className={`adv-card ${isActive?'selected':''}`}>
                        {isActive && <span className="absolute top-3 right-3 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[11px] font-bold">✓</span>}
                        <div className="flex items-center gap-3 w-full"><div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[16px] shrink-0" style={{background:t.colors?.bg || '#F4F4F5'}}>{t.name?.[0]}</div><div className="min-w-0 flex-1"><div className="text-[13px] font-bold truncate">{t.name}</div><div className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium mt-0.5">ADVANCED</div></div></div>
                        <div className="mt-4 w-full h-[88px] rounded-[14px] bg-[#F5F1ED] border border-white p-2 flex gap-2"><div className="w-9 h-full rounded-[10px]" style={{background:t.colors?.accent || '#000'}} /><div className="flex-1 flex flex-col gap-1.5"><div className="h-2 w-3/4 bg-zinc-200 rounded-full" /><div className="h-2 w-1/2 bg-zinc-100 rounded-full" /><div className="mt-auto h-6 w-full bg-white border rounded-[8px]" /></div></div>
                        {locked && <div className="adv-card-lock-overlay"><GlassLockIcon size={40} /><div className="text-[11px] font-black tracking-widest">LOCKED</div><div className="text-[10px] text-zinc-500 text-center">Need Advanced</div></div>}
                        {!locked && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#E8FF86] text-black text-[9px] px-2.5 h-5 rounded-full font-bold flex items-center">UNLOCKED ✓</div>}
                      </button>
                    )})}
                  </div>
                </div>

                {/* Standard */}
                <div className="bg-[#FCFBF9]/70 backdrop-blur border border-white/60 rounded-[28px] p-5 md:p-7">
                  <div className="mb-4 flex items-center gap-2"><span className="text-[11px] font-black tracking-widest bg-white border px-3 py-1.5 rounded-full">STANDARD THEMES</span><span className="text-[11px] text-zinc-500">All plans</span></div>
                  <div className="adv-grid">
                    {standardThemes.slice(0,6).map(t => { const isActive = theme===t.id; return (
                      <button key={t.id} onClick={()=>handleThemeClick(t)} className={`adv-card ${isActive?'selected':''} !h-[200px]`}>
                        {isActive && <span className="absolute top-3 right-3 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[11px] font-bold">✓</span>}
                        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-[12px] bg-zinc-100 flex items-center justify-center">{t.name?.[0]}</div><div><div className="text-[13px] font-bold">{t.name}</div><div className="text-[10px] text-zinc-500 uppercase tracking-widest">STANDARD</div></div></div>
                        <div className="mt-4 w-full h-[68px] rounded-[14px] bg-[#F5F1ED] border border-white" />
                      </button>
                    )})}
                  </div>
                </div>

                {/* Premium Glass */}
                <div className="rounded-[28px] border border-black/10 overflow-hidden bg-gradient-to-br from-white/80 to-[#F5FFE8]/80 backdrop-blur shadow-[0_16px_40px_rgba(232,255,134,0.18)]">
                  <div className="p-6 md:p-7 border-b border-white/60 bg-white/50 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3"><span className="bg-[#E8FF86] text-black text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest">3 PREMIUM GLASS</span><span className="font-bold text-[14px]">Glass Collection — Premium Only</span></div>
                    <span className="bg-white border text-[11px] px-3 py-1.5 rounded-full font-medium">{currentPlanId==='premium'?'All 3 Unlocked ✓':`Locked — Need Premium Rs. 2999`}</span>
                  </div>
                  <div className="bg-gradient-to-br from-[#FEFFEB] to-[#F5F7F0] relative">
                    <div className="absolute top-3 right-5 hidden md:flex items-center gap-2 text-[10px] mono text-black/30"><span>← Scroll to see all {premiumThemes.length} Glass →</span></div>
                    <div className="glass-container">
                      {premiumThemes.map((t,i)=>{
                        const isActive=theme===t.id; const locked=isThemeLocked(t); const r = isActive ? 0 : (GLASS_TILTS[i % GLASS_TILTS.length]); 
                        return (
                          <div key={t.id} className={`glass ${isActive?'selected':''}`} style={{'--r':r, scrollSnapAlign:'start'} as any} onClick={()=>handleThemeClick(t)}>
                            <div className="glass-preview-wrap">
                              <div className="h-8 flex items-center justify-between px-3 text-[9px] font-bold tracking-widest" style={{background:t.colors?.bg || '#fff', color:t.colors?.text || '#000'}}><span>{t.id.slice(0,12).toUpperCase()}</span><span className="opacity-60">{locked?'🔒':'✓'}</span></div>
                              <div className="flex-1 p-3 flex flex-col gap-2"><div className="h-8 rounded-[8px] border bg-white" /><div className="flex gap-2"><div className="flex-1 h-14 rounded-[10px] bg-white border" /><div className="flex-1 h-14 rounded-[10px] bg-white border" /></div><div className="h-7 rounded-[8px] bg-black" /></div>
                            </div>
                            <div className="mt-3 text-[12px] font-bold tracking-tight">{t.name}</div>
                            {isActive && <div className="absolute top-3 right-3 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[10px]">✓</div>}
                            {locked && (<div className="glass-lock-overlay"><GlassPremiumLock size={52} /><div className="text-[11px] font-black tracking-widest">PREMIUM LOCKED</div><div className="text-[10px] text-zinc-500 text-center leading-[1.4]">Need Premium<br/>Rs. 2999/mo</div><div className="mt-1 bg-black text-white text-[10px] font-bold px-4 h-7 rounded-full flex items-center">UPGRADE →</div></div>)}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 flex-wrap gap-3 bg-white/60 backdrop-blur border border-white/60 rounded-full px-5 py-3">
                  <span className="text-[11px] text-zinc-500">Products {products.length}/{productLimit===999999?'∞':productLimit} • Images {imageLimit===999999?'∞':imageLimit}/product • Current: {currentPlanDef.name}</span>
                  <div className="flex gap-2 items-center">{saved && <span className="h-9 px-4 flex items-center text-[11px] text-green-600 font-medium bg-green-50 rounded-full border border-green-200">✓ Saved! {getTheme(theme).name}</span>}<button onClick={saveStore} className="h-9 px-6 bg-black text-white text-[12px] font-medium rounded-full hover:bg-zinc-900 flex items-center gap-2">Save Store & Theme <span className="w-5 h-5 bg-white text-black rounded-full flex items-center justify-center text-[10px]">↗</span></button></div>
                </div>
              </div>
            )}

            {activeTab==='store' && (
              <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
                <div className="bg-[#FCFBF9]/80 backdrop-blur border border-white/70 rounded-[28px] p-6 md:p-8 shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between"><h2 className="font-bold text-[16px] tracking-tight">Store Identity</h2>{saved && <span className="bg-[#E8FF86] text-black px-3 h-7 rounded-full text-[11px] font-bold flex items-center">Saved ✓</span>}</div>
                  <div className="mt-5 bg-white/70 border border-white rounded-[18px] p-4 flex items-center gap-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[12px] ${isPremium?'bg-[#E8FF86] text-black':isAdvanced?'bg-black text-white':'bg-white border'}`}>{currentPlanDef.name[0]}</div><div><div className="text-[13px] font-bold">{currentPlanDef.name} • {productLimit===999999?'∞':productLimit} products • {imageLimit===999999?'∞':imageLimit} images</div><div className="text-[11px] text-zinc-500">{currentPlanDef.features.join(' • ')}</div></div></div>
                  <div className="mt-6 grid md:grid-cols-2 gap-4">
                    <div><label className="text-[11px] font-bold tracking-widest uppercase text-zinc-500">Business Name</label><input value={businessName} onChange={e=>setBusinessName(e.target.value)} className="mt-2 w-full h-11 px-4 border border-white bg-white/70 rounded-[14px] text-[13px] focus:bg-white focus:outline-none focus:border-black/20 focus:ring-4 focus:ring-[#E8FF86]/20 transition-all" /></div>
                    <div><label className="text-[11px] font-bold tracking-widest uppercase text-zinc-500">WhatsApp Number</label><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="923001234567" className="mt-2 w-full h-11 px-4 border border-white bg-white/70 rounded-[14px] text-[13px] focus:bg-white focus:outline-none focus:border-black/20 focus:ring-4 focus:ring-[#E8FF86]/20 transition-all" /></div>
                    <div className="md:col-span-2"><label className="text-[11px] font-bold tracking-widest uppercase text-zinc-500">Store Slug</label><input value={slug} onChange={e=>setSlug(e.target.value)} className="mt-2 w-full h-11 px-4 border border-white bg-white/70 rounded-[14px] text-[13px] focus:bg-white focus:outline-none focus:border-black/20 focus:ring-4 focus:ring-[#E8FF86]/20" /><div className="text-[11px] text-zinc-500 mt-2">Your store: /s/{slug || 'your-slug'}</div></div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3"><button onClick={saveStore} disabled={saving} className="h-11 px-7 bg-black text-white rounded-full text-[13px] font-medium hover:bg-zinc-900 transition-colors flex items-center gap-2">{saving?'Saving...':saved?'Saved ✓':'Save Store'} <span className="w-5 h-5 bg-white text-black rounded-full flex items-center justify-center text-[10px]">↗</span></button><button onClick={copyLink} className="h-11 px-5 border border-white bg-white/80 rounded-full text-[13px] font-medium hover:bg-white">{copied?'Copied!':'Copy Link'}</button><Link href={slug ? `/s/${slug}` : '#'} target="_blank" className="h-11 px-5 bg-white/80 border border-white rounded-full text-[13px] font-medium flex items-center hover:bg-white">View Store ↗</Link></div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/70 backdrop-blur border border-white/60 rounded-[24px] p-5">
                    <h3 className="font-bold text-[14px]">Formation status</h3><p className="text-[12px] text-zinc-500 mt-1">In progress — {currentPlanDef.name} setup</p>
                    <div className="mt-4 h-2.5 bg-white rounded-full overflow-hidden border"><div className="h-full bg-[#E8FF86] rounded-full" style={{width: isPremium?'100%':isAdvanced?'70%':'35%'}}></div></div>
                    <p className="text-[11px] text-zinc-500 mt-3">Estimated Processing<br/>4-5 Business Days for verification</p>
                    <button onClick={()=>setActiveTab('payments')} className="mt-4 w-full h-11 bg-white border rounded-full font-bold text-[13px] hover:bg-zinc-50">View status</button>
                  </div>
                  <div className="bg-gradient-to-br from-[#E8FF86] to-[#111111] rounded-[24px] p-6 text-white shadow-[0_12px_32px_rgba(139,111,234,0.3)]">
                    <div className="flex justify-between items-start"><div><h3 className="font-bold">Success Rate</h3><p className="text-[11px] opacity-70 mt-1">Keep growing your store</p></div><span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">↗</span></div>
                    <div className="mt-8 flex items-end justify-center"><div className="text-[48px] font-black tracking-tight">{products.length*7+13}.2%<span className="text-[14px] font-medium ml-2 bg-white/20 px-2 py-1 rounded-full">+5%</span></div></div>
                    <p className="text-[11px] opacity-80 mt-4 text-center">Hooray you have {products.length} products and {productLimit===999999?'∞':productLimit} limit, keep it up</p>
                    <div className="mt-6 grid grid-cols-2 gap-4 text-center"><div><div className="text-[11px] opacity-60">Products</div><div className="font-bold text-[18px]">{products.length}</div></div><div><div className="text-[11px] opacity-60">Themes</div><div className="font-bold text-[18px]">{finalAdvancedList.length + premiumThemes.length}</div></div></div>
                  </div>
                </div>
              </div>
            )}

            {profile && activeTab==='themes' && (
              <div className="bg-[#FCFBF9]/70 backdrop-blur border border-white/60 rounded-[28px] p-5">
                <PremiumThemeEditor profile={{...profile, premium_custom: premiumCustom}} onSave={(d:any)=>{ setPremiumCustom(d); setProfile({...profile, premium_custom: d} as any) }} />
              </div>
            )}

            {activeTab==='products' && (
              <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
                <div className="space-y-4">
                  <div className="bg-[#FCFBF9]/80 backdrop-blur border border-white/70 rounded-[28px] p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5"><h2 className="font-bold text-[16px] tracking-tight">Add Product — {products.length}/{productLimit===999999?'∞':productLimit}</h2><div className="flex items-center gap-2"><span className={`px-3 h-7 rounded-full text-[10px] font-bold flex items-center border ${products.length>=productLimit?'bg-red-500 text-white border-red-500':'bg-white text-black border-white'}`}>{products.length>=productLimit?'LIMIT REACHED':`${productLimit===999999?'∞':productLimit-products.length} left`}</span><CurrentPlanButton /></div></div>
                    <label className="group relative border-2 border-dashed border-white bg-white/60 rounded-[24px] p-6 flex flex-col items-center justify-center cursor-pointer hover:border-black/20 hover:bg-white transition-all min-h-[160px] overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-white to-[#F5FFE8]/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10 flex flex-col items-center w-full">
                        {previews.length ? (
                          <div className="grid grid-cols-5 gap-2.5 w-full">{previews.map((src,i)=>(<div key={i} className="relative group/img"><img src={src} className="w-full h-[72px] object-cover rounded-[14px] border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]" /></div>))}<div className="h-[72px] rounded-[14px] border-2 border-dashed border-zinc-200 bg-white flex flex-col items-center justify-center gap-1 hover:border-black"><span className="text-[16px]">+</span><span className="text-[9px] font-bold tracking-widest">ADD</span></div></div>
                        ) : (
                          <><UploadIcon /><div className="mt-4 text-center"><div className="font-bold text-[14px] tracking-tight">Drop images or click to upload</div><div className="mt-2 flex items-center justify-center gap-2 text-[11px]"><span className="px-2.5 h-6 rounded-full bg-black text-white font-bold flex items-center">Basic 1</span><span className="px-2.5 h-6 rounded-full bg-white border font-bold flex items-center">Advanced 5</span><span className="px-2.5 h-6 rounded-full bg-[#E8FF86] text-black font-bold flex items-center">Premium ∞</span></div><div className="mt-2 text-[11px] text-zinc-500">Your plan <b className="text-black">{currentPlanId.toUpperCase()}</b> allows <b className="text-black">{imageLimit===999999?'Unlimited':imageLimit}</b> image{imageLimit!==1?'s':''} per product</div></div></>
                        )}
                      </div>
                      <input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
                    </label>
                    <div className="mt-5 grid md:grid-cols-2 gap-3">
                      <input placeholder="Product name *" value={prodName} onChange={e=>setProdName(e.target.value)} className="w-full h-11 px-4 border border-white bg-white/70 rounded-[14px] text-[13px] focus:bg-white focus:outline-none focus:border-black/20 focus:ring-4 focus:ring-[#E8FF86]/20" />
                      <input placeholder="Price Rs. 3500 *" type="number" value={prodPrice} onChange={e=>setProdPrice(e.target.value)} className="w-full h-11 px-4 border border-white bg-white/70 rounded-[14px] text-[13px] focus:bg-white focus:outline-none focus:border-black/20" />
                      <input placeholder="Compare price (optional)" type="number" value={prodOrigPrice} onChange={e=>setProdOrigPrice(e.target.value)} className="w-full h-11 px-4 border border-white bg-white/70 rounded-[14px] text-[13px] focus:bg-white focus:outline-none" />
                      <select value={prodCategory} onChange={e=>setProdCategory(e.target.value)} className="w-full h-11 px-4 border border-white bg-white/70 rounded-[14px] text-[13px] focus:bg-white focus:outline-none"><option>General</option><option>Clothing</option><option>Shoes</option><option>Bags</option><option>Beauty</option><option>Electronics</option><option>Food</option><option>Other</option></select>
                      <input placeholder="Stock qty (e.g. 100)" type="number" value={prodStock} onChange={e=>setProdStock(e.target.value)} className="w-full h-11 px-4 border border-white bg-white/70 rounded-[14px] text-[13px] focus:bg-white focus:outline-none" />
                      <input placeholder="Sizes (S, M, L, XL)" value={prodSizes} onChange={e=>setProdSizes(e.target.value)} className="w-full h-11 px-4 border border-white bg-white/70 rounded-[14px] text-[13px] focus:bg-white focus:outline-none" />
                      <input placeholder="Colors (Black, White, Red)" value={prodColors} onChange={e=>setProdColors(e.target.value)} className="md:col-span-2 w-full h-11 px-4 border border-white bg-white/70 rounded-[14px] text-[13px] focus:bg-white focus:outline-none" />
                      <textarea placeholder="Product description, materials, care instructions..." value={prodDesc} onChange={e=>setProdDesc(e.target.value)} className="md:col-span-2 w-full min-h-[80px] p-4 border border-white bg-white/70 rounded-[14px] text-[13px] focus:bg-white focus:outline-none" />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">{editingId && <button onClick={cancelEdit} className="h-11 px-6 border border-white bg-white/70 rounded-full text-[13px] font-medium hover:bg-white">Cancel</button>}<button onClick={addProduct} disabled={uploading || (!editingId && products.length>=productLimit)} className="h-11 px-7 bg-black text-white text-[13px] font-medium rounded-full disabled:opacity-40 hover:bg-zinc-900 flex items-center gap-2">{uploading?(editingId?'Updating...':'Adding...'):editingId?'Update Product':'Add Product'} <span className="w-5 h-5 bg-white text-black rounded-full flex items-center justify-center text-[10px]">↗</span></button></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {products.length===0 ? (<div className="col-span-2 md:col-span-3 bg-white/60 border border-dashed border-white rounded-[24px] p-12 flex flex-col items-center justify-center text-center"><UploadIcon className="w-12 h-12" /><div className="mt-4 font-bold text-[14px]">No products yet</div><div className="text-[11px] text-zinc-500 mt-1">Add your first product to start selling</div></div>) : products.map(p => (<PremiumProductCard key={p.id} p={p} onEdit={startEdit} onDelete={deleteProduct} themeId={theme} imageLimit={imageLimit} />))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/70 backdrop-blur border border-white/60 rounded-[24px] p-5">
                    <h3 className="font-bold">Recent emails</h3>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between bg-[#F5F1ED] rounded-full p-2 pr-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[10px]">H</div><span className="text-[12px] font-medium">Hannah Morgan</span></div><span className="text-[11px] text-zinc-500">Meeting scheduled</span></div>
                      <div className="flex items-center justify-between bg-[#F5F1ED] rounded-full p-2 pr-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-[#E8FF86] text-black flex items-center justify-center text-[10px]">M</div><span className="text-[12px] font-medium">Megan Clark</span></div><span className="text-[11px] text-zinc-500">Update on campaign</span></div>
                    </div>
                  </div>
                  <div className="bg-[#FCFBF9]/80 backdrop-blur border border-white/70 rounded-[24px] p-5">
                    <h3 className="font-bold text-[14px]">Average Sales</h3><p className="text-[11px] text-zinc-500">Sales overview from all channels</p>
                    <div className="mt-4 grid grid-cols-2 gap-3"><div><div className="text-[11px] text-zinc-500">Offline</div><div className="font-black text-[18px]">$12,201 <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">-11%</span></div></div><div><div className="text-[11px] text-zinc-500">Online</div><div className="font-black text-[18px]">$100,799 <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full">+6%</span></div></div></div>
                    <div className="mt-4 h-[120px] flex items-end gap-2">{[40,80,60,35,75,100,50,40,60].map((h,i)=><div key={i} className={`flex-1 rounded-[10px] ${i===4?'bg-[#E8FF86]':'bg-[#EDE8F5]'} transition-all`} style={{height:`${h}%`}}></div>)}</div>
                    <div className="flex justify-between text-[10px] text-zinc-400 mt-2"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab==='analytics' && (
              <div>
                {!profile ? <div className="p-8 text-center">Loading...</div> : currentPlanId === 'premium' ? (
                  <div className="bg-[#FCFBF9]/70 backdrop-blur border border-white/60 rounded-[28px] p-6"><RealAnalytics userId={profile!.id} currentPlanId={currentPlanId} /></div>
                ) : (
                  <div className="relative">
                    <div className="bg-white/70 backdrop-blur border border-white/60 rounded-[28px] p-8 text-center"><div className="w-16 h-16 bg-black rounded-[16px] flex items-center justify-center mx-auto text-white">◐</div><h3 className="font-black text-[18px] mt-4">Analytics is Premium Only</h3><p className="text-[12px] text-zinc-500 mt-2 max-w-[320px] mx-auto">Your {currentPlanId.toUpperCase()} plan shows blurred preview. Upgrade to Premium to see real live analytics.</p><button onClick={()=>setActiveTab('payments')} className="mt-5 h-10 px-6 bg-black text-white rounded-full text-[12px] font-bold">Upgrade to Premium →</button></div>
                    <div className="mt-4 opacity-30 blur-[8px] pointer-events-none select-none"><RealAnalytics userId={profile!.id} currentPlanId={'premium'} /></div>
                  </div>
                )}
              </div>
            )}

            {activeTab==='payments' && (
              <div className="bg-[#FCFBF9]/80 backdrop-blur border border-white/70 rounded-[28px] p-6 md:p-8 shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
                {myPayments.length > 0 && (
                  <div className="mb-6 rounded-[20px] border border-white bg-white/70 p-4 md:p-5">
                    <div className="flex items-center gap-2.5 mb-3"><div className="w-8 h-8 bg-black text-white rounded-[10px] flex items-center justify-center text-[12px]">₨</div><span className="font-black text-[13px] tracking-tight">Your Payments</span>{myPayments.filter((p:any)=>p.status==='pending').length > 0 && <span className="ml-auto flex items-center gap-1.5 text-[11px] bg-yellow-50 border border-yellow-200 text-yellow-700 px-2.5 h-7 rounded-full font-bold"><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>Pending</span>}</div>
                    <div className="space-y-2.5">{myPayments.slice(0,5).map((p:any)=>(<div key={p.id} className="group flex items-center justify-between gap-3 bg-[#F5F1ED] border border-white rounded-[14px] p-3.5"><div className="flex items-center gap-3 min-w-0 flex-1"><span className={`shrink-0 h-7 px-3 rounded-full text-[10px] font-black tracking-widest flex items-center border ${p.status==='pending'?'bg-yellow-100 text-yellow-700 border-yellow-200':p.status==='approved'?'bg-black text-white border-black':'bg-red-50 text-red-600 border-red-200'}`}>{p.status.toUpperCase()}</span><div className="min-w-0"><div className="flex items-center gap-2"><span className="text-[13px] font-black">{p.plan_id.toUpperCase()}</span><span className="text-[12px] font-bold text-zinc-600">Rs. {p.amount}</span></div><div className="flex items-center gap-2 mt-1"><span className="font-mono text-[11px] bg-white border px-2 py-0.5 rounded-[8px]">{p.txn_id}</span><span className="text-[10px] text-zinc-500 hidden md:inline">{new Date(p.created_at).toLocaleDateString()}</span></div></div></div><div className="shrink-0 text-right">{p.status==='pending' && <div className="text-[11px] font-medium text-zinc-500">Verifying...<br/><span className="text-[10px]">~1 hour</span></div>}{p.status==='approved' && <div className="text-[11px] font-black text-green-600">Active<br/><span className="text-[10px] font-medium text-zinc-500">Unlocked</span></div>}{p.status==='rejected' && <div className="text-[11px] font-black text-red-600">Rejected<br/><span className="text-[10px] font-medium text-zinc-500">Contact support</span></div>}</div></div>))}</div>
                    {justSubmitted && justSubmitted.status==='pending' && (<div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-[12px] p-3 flex items-start gap-2.5"><span className="w-6 h-6 bg-yellow-100 border border-yellow-200 rounded-full flex items-center justify-center text-[12px] shrink-0">⏳</span><div><div className="text-[12px] font-bold text-yellow-800">Payment submitted — Pending verification</div><div className="text-[11px] text-yellow-700/80 mt-0.5">Verifying Txn ID <span className="font-mono bg-white px-1 py-0.5 rounded border">{justSubmitted.txn_id}</span></div></div></div>)}
                  </div>
                )}
                <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-black text-white rounded-[14px] flex items-center justify-center text-[18px]">⬡</div><div><h2 className="font-black text-[18px] tracking-tight">Pricing — Till {TILL_ID} — Current: {currentPlanDef.name}</h2><p className="text-[12px] text-zinc-500">Upgrade via JazzCash Business Till</p></div></div><div className="flex items-center gap-2"><div className="billing-toggle"><button onClick={()=>setBilling('monthly')} className={`billing-btn ${billing==='monthly'?'billing-btn-active':'billing-btn-inactive'}`}>Monthly</button><button onClick={()=>setBilling('yearly')} className={`billing-btn ${billing==='yearly'?'billing-btn-active':'billing-btn-inactive'}`}>Yearly <span className="ml-1 bg-[#E8FF86] text-black text-[8px] px-1 py-0.5 rounded-full">-22%</span></button></div><CurrentPlanButton /></div></div>
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
                  <div className="rounded-[20px] border border-white bg-black text-white p-5 shadow-[0_16px_40px_rgba(0,0,0,0.2)]"><div className="flex justify-between items-center"><div className="text-[10px] tracking-[0.2em] uppercase opacity-50 font-bold">JAZZCASH BUSINESS TILL</div><button onClick={copyTill} className="h-7 px-3 bg-white/10 border border-white/10 rounded-full text-[11px] hover:bg-white/20">{copiedTill?'Copied!':'Copy'}</button></div><div className="mt-4 bg-white/[0.06] border border-white/[0.08] rounded-[14px] p-4"><div className="text-[10px] uppercase opacity-50">Till ID Number</div><div className="text-[32px] font-black font-mono tracking-[0.12em]">{TILL_ID}</div></div><div className="mt-3 bg-white rounded-[14px] p-3"><img src={`https://barcodeapi.org/api/code128/${TILL_ID}`} alt="Barcode" className="w-full h-[48px] object-contain"/><div className="text-center text-[11px] font-mono text-black font-black tracking-[0.3em] mt-1">{TILL_ID}</div></div><div className="mt-3 bg-white rounded-[14px] p-3 flex justify-center"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=JAZZCASH_TILL_${TILL_ID}`} alt="QR" className="w-[120px] h-[120px]"/></div></div>
                  <div className="space-y-4">
                    <div className="radio-container" style={{"--total-radio": plans.length} as any}>
                      {plans.map(p=>{
                        const displayPrice = getDisplayPrice(p)
                        const isSelected = selectedPlan?.id===p.id
                        const isCurrent = currentPlanId===p.id
                        return (
                          <div key={p.id} className="contents">
                            <input type="radio" id={`dash-${p.id}`} name="dash-plan" checked={isSelected} onChange={()=>setSelectedPlan(p)} />
                            <label htmlFor={`dash-${p.id}`} onClick={()=>setSelectedPlan(p)} className={isCurrent?'!bg-[#FFFEF5] !border-black' : ''}>
                              <div className="flex justify-between items-start gap-3">
                                <div className="min-w-0 flex-1"><div className="flex items-center gap-2 flex-wrap"><span className="font-black text-[14px]">{p.name}</span>{isCurrent && <span className="bg-black text-white text-[8px] px-2 h-5 rounded-full font-bold flex items-center">CURRENT</span>}<span className={`text-[10px] px-2.5 h-6 rounded-full font-bold flex items-center ${p.id==='premium'?'bg-[#E8FF86] text-black':p.id==='advanced'?'bg-black text-white':'bg-zinc-100'}`}>Rs. {displayPrice}/mo</span>{p.id==='advanced' && <span className="bg-[#E8FF86] text-black text-[8px] px-2 h-5 rounded-full font-bold flex items-center">POPULAR</span>}</div><div className="text-[11px] mt-1.5 opacity-60 leading-[1.3]">{p.features.join(' • ')}</div></div><div className="text-right shrink-0"><div className="font-black text-[16px]">Rs. {displayPrice}</div><div className="text-[10px] opacity-60">{billing==='yearly'?`Billed Rs. ${p.yearlyTotal}/yr`:p.id!=='basic'?`Yearly Rs. ${p.yearlyMonthly}/mo`:''}</div></div>
                              </div>
                            </label>
                          </div>
                        )
                      })}
                      <div className="glider-container"><div className="glider"></div></div>
                    </div>
                    {selectedPlan && selectedPlan.monthly>0 && (
                      <div className="rounded-[18px] border-2 border-black bg-[#FFFEF5] p-5">
                        <div className="flex items-center gap-2 flex-wrap"><div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[12px]">₨</div><div className="text-[13px] font-bold">Pay Rs. {billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal} → Till {TILL_ID} ({billing})</div></div>
                        <input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder={`Txn ID after paying Rs. ${billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal} to Till ${TILL_ID}`} className="mt-4 w-full h-12 px-4 rounded-[14px] border-2 bg-white text-[12px] font-mono focus:outline-none focus:border-black"/>
                        <button onClick={handleBuyPlan} disabled={purchasing} className="mt-3 w-full h-12 bg-black text-white rounded-full font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-zinc-900 leading-none">{purchasing?'Submitting...':`I Paid Rs. ${billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal} — Activate ${selectedPlan.name}`} <span className="w-5 h-5 bg-white text-black rounded-full flex items-center justify-center text-[10px]">↗</span></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {errorMsg && <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full text-[12px] shadow-lg z-[100]">{errorMsg}</div>}

      {showStatusModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] w-full max-w-[380px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            {showStatusModal.type === 'approved' ? (
              <div>
                <div className="bg-black text-white p-8 text-center"><div className="w-16 h-16 bg-[#E8FF86] rounded-full flex items-center justify-center mx-auto"><span className="text-[28px]">✓</span></div><h2 className="font-black text-[22px] mt-4">Payment Approved!</h2><p className="text-[13px] text-white/60 mt-1">Your store is now {showStatusModal.payment.plan_id.toUpperCase()}</p></div>
                <div className="p-6"><div className="bg-[#F5F1ED] border border-white rounded-[14px] p-4"><div className="flex justify-between"><span className="text-[11px] text-zinc-500">Plan</span><span className="text-[13px] font-black">{showStatusModal.payment.plan_id.toUpperCase()} • Rs. {showStatusModal.payment.amount}</span></div><div className="flex justify-between mt-2"><span className="text-[11px] text-zinc-500">Txn ID</span><span className="font-mono text-[12px] bg-white border px-2 py-1 rounded-[8px]">{showStatusModal.payment.txn_id}</span></div></div><button onClick={()=>setShowStatusModal(null)} className="mt-6 w-full h-12 bg-black text-white rounded-full font-bold text-[13px]">Continue →</button></div>
              </div>
            ) : (
              <div><div className="bg-[#FFFBF0] p-8 text-center border-b"><div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto"><span className="text-[24px]">✕</span></div><h2 className="font-black text-[20px] mt-4">Payment Rejected</h2><p className="text-[12px] text-zinc-500 mt-1">Check Txn ID and try again</p></div><div className="p-6"><p className="text-[12px] text-zinc-600">Txn ID could not be verified in Till {TILL_ID}. Please ensure correct amount and ID.</p><button onClick={()=>setShowStatusModal(null)} className="mt-6 w-full h-12 bg-black text-white rounded-full font-bold text-[13px]">Try Again →</button></div></div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
