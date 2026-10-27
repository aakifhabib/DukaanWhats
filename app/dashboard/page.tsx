'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { RealAnalytics } from '@/components/RealAnalytics'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STORE_THEMES, getTheme, ThemeCategory, getAdvancedThemes, getPremiumThemes, getStandardThemes } from '@/lib/storeThemes'
import { DukaanWhatsLoader } from '@/components/DukaanWhatsLoader'
import { PremiumThemeEditor } from '@/components/PremiumThemeEditor'

// --- CUSTOM PREMIUM ICONS (PRESERVED) ---
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
    <div className="group liquid-card rounded-[22px] p-3 hover:border-white/30 transition-all duration-300"
         onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      <div className="relative overflow-hidden rounded-[16px] h-48 bg-white/[0.06]">
        {images.length>0 ? (
          <>
            <img src={images[hoverIdx % images.length]} className="w-full h-full object-cover transition-all duration-500" />
            {images.length>1 && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">{images.map((_:any,i:number)=><span key={i} className={`h-1 rounded-full transition-all ${i===hoverIdx?'w-4 bg-white':'w-1.5 bg-white/40'}`} />)}</div>}
          </>
        ) : <div className="w-full h-full flex items-center justify-center text-white/40 text-[12px]">No image</div>}
        {imageLimit !== 999999 && images.length >= imageLimit && (
          <div className="absolute top-2 right-2 bg-yellow-300/90 backdrop-blur text-black text-[9px] px-2 py-1 rounded-full font-bold">LIMIT {imageLimit}</div>
        )}
      </div>
      <div className="mt-3 px-1">
        <div className="font-bold text-[13px] truncate text-white">{p.name}</div>
        <div className="flex items-center justify-between mt-1">
          <span className="font-black text-[14px] text-white">Rs. {p.price.toLocaleString()}</span>
          <span className="text-[11px] text-white/50">{images.length} img</span>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={()=>onEdit(p)} className="flex-1 h-8 bg-white text-black rounded-full text-[11px] font-bold hover:bg-white/90">Edit</button>
          <button onClick={()=>onDelete(p.id)} className="h-8 w-8 border border-white/20 bg-white/10 rounded-full flex items-center justify-center text-[12px] text-white hover:bg-white/20">✕</button>
        </div>
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
    { id: 'basic', name: 'Basic', monthly: 0, yearlyMonthly: 0, yearlyTotal: 0, products: 5, imagesPerProduct: 1, advancedAllowed: 3, premiumAllowed: 0, stores: 1, features: ['5 Products', '1 Image / product', '3 Advanced Themes', '0 Premium (Glass)', 'COD Only', 'Watermark'] },
    { id: 'advanced', name: 'Advanced', monthly: 899, yearlyMonthly: 699, yearlyTotal: 8388, products: 25, imagesPerProduct: 5, advancedAllowed: 8, premiumAllowed: 0, stores: 3, features: ['25 Products', '5 Images / product', 'All 8 Advanced Themes', '0 Premium Glass (locked)', 'Orders Dashboard'] },
    { id: 'premium', name: 'Premium', monthly: 2999, yearlyMonthly: 2499, yearlyTotal: 29988, products: 999999, imagesPerProduct: 999999, advancedAllowed: 'all', premiumAllowed: 'all', stores: 999999, features: ['Unlimited Products', 'Unlimited Images', 'Every Theme (8 Advanced + 3 Premium)', 'No Watermark', 'Live Analytics'] },
  ]

  const currentPlanId = (profile?.current_plan || 'basic') as 'basic'|'advanced'|'premium'
  const currentPlanDef = plans.find(p=>p.id===currentPlanId) || plans[0]
  const isPremium = currentPlanId === 'premium'
  const isAdvanced = currentPlanId === 'advanced' || isPremium
  const productLimit = currentPlanDef.products
  const imageLimit = currentPlanDef.imagesPerProduct

  // --- GLASS MERGED: 3 sleek + 3 premium = 6 glass themes --- PRESERVED EXACTLY
  const PREMIUM_NEW_IDS = ['spike-premium','shoe-app-premium','trenzo-luxury']
  const advancedGlassRaw = getAdvancedThemes()
  const premiumNewRaw = getPremiumThemes()
  const premiumThemes = [...advancedGlassRaw, ...premiumNewRaw]
  const premiumIds = premiumThemes.map(t=>t.id)
  const allAdvancedRaw = STORE_THEMES.filter(t => (t.category as string) === 'advanced' && !advancedGlassRaw.map(x=>x.id).includes(t.id))
  const advancedThemesList = allAdvancedRaw.length >= 5 ? allAdvancedRaw.slice(0,8) : [...allAdvancedRaw, ...STORE_THEMES.filter(t=> (t.category as string) === 'clothing' || (t.category as string) === 'tech').slice(0, 8 - allAdvancedRaw.length)]
  const finalAdvancedList = advancedThemesList.length ? advancedThemesList.slice(0,8) : STORE_THEMES.filter(t=>!premiumIds.includes(t.id)).slice(0,8)
  const basicAllowedAdvancedIds = finalAdvancedList.slice(0,3).map(t=>t.id)

  const isPremiumTheme = (t: any) => premiumIds.includes(t.id) || PREMIUM_NEW_IDS.includes(t.id) || (t.category as string) === 'premium' || (t as any).tier === 'premium'
  const isAdvancedTheme = (t: any) => !isPremiumTheme(t) && (finalAdvancedList.some((a:any)=>a.id===t.id) || (t.category as string) === 'advanced')
  const isThemeLocked = (t: any) => {
    if (isPremium) return false
    if (isPremiumTheme(t)) return true
    if (isAdvancedTheme(t)) {
      if (isAdvanced) return false
      return !basicAllowedAdvancedIds.includes(t.id)
    }
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
      if (isPremiumTheme(t)) {
        alert(`🔒 Premium Glass Locked\nBasic: 0/3 Premium\nAdvanced: 0/3 Premium\nNeed Premium — Till ${TILL_ID} Rs. 2999/mo\n\nThis glass animation theme is Premium only.`)
        setActiveTab('payments'); return
      }
      alert(`🔒 Advanced Theme Locked\nBasic allows 3/8 Advanced\nThis theme needs Advanced — Till ${TILL_ID} Rs. 899/mo\n\nUpgrade to unlock all 8 Advanced themes.`)
      setActiveTab('payments'); return
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
    const totalFiles = editingId ? selected.length : selected.length
    if (totalFiles > imageLimit && imageLimit !== 999999) { 
      setErrorMsg(`❌ ${currentPlanId.toUpperCase()} allows ${imageLimit} images per product. You selected ${totalFiles}. Upgrade: Till ${TILL_ID}`);
      setTimeout(()=>setErrorMsg(null),4000); return 
    }
    const newFiles = editingId ? [...files, ...selected].slice(0, imageLimit === 999999 ? 20 : imageLimit) : selected
    setFiles(newFiles)
    const pr: string[] = []
    const existingPreviews = editingId ? previews : []
    newFiles.forEach(file => {
      const r = new FileReader()
      r.onload = ev => {
        pr.push(ev.target?.result as string)
        if (pr.length === newFiles.length) {
          setPreviews(editingId ? [...existingPreviews, ...pr].slice(0, newFiles.length) : pr)
        }
      }
      r.readAsDataURL(file)
    })
    if (newFiles.length === 0) setPreviews([])
  }
  const removeFileAt = (idx: number) => {
    const nf = files.filter((_, i) => i !== idx)
    const np = previews.filter((_, i) => i !== idx)
    setFiles(nf); setPreviews(np)
  }
  const uploadOne = async (file: File, userId: string) => {
    const ext = file.name.split('.').pop(); const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(fileName, file); if (error) throw error
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName); return data.publicUrl
  }
  const startEdit = (p: any) => { 
    setEditingId(p.id); setProdName(p.name); setProdPrice(String(p.price)); setProdDesc(p.description || ''); setProdCategory(p.category || 'General'); setProdStock(String(p.stock || 100)); setProdSizes(Array.isArray(p.sizes) ? p.sizes.join(', ') : p.sizes || ''); setProdColors(Array.isArray(p.colors) ? p.colors.join(', ') : p.colors || ''); setProdOrigPrice(p.original_price ? String(p.original_price) : ''); setPreviews(p.image_urls && p.image_urls.length ? p.image_urls : [p.image_url]); setFiles([]); setActiveTab('products'); 
  }
  const cancelEdit = () => { setEditingId(null); setProdName(''); setProdPrice(''); setProdDesc(''); setProdCategory('General'); setProdStock('100'); setProdSizes(''); setProdColors(''); setProdOrigPrice(''); setPreviews([]); setFiles([]) }
  const addProduct = async () => {
    if (!prodName.trim() || !prodPrice) { setErrorMsg('Name and price required'); return }
    if (!profile) return
    if (!editingId && products.length >= productLimit) { setErrorMsg(`❌ ${currentPlanId.toUpperCase()} allows ${productLimit} products. Upgrade: Till ${TILL_ID}`); setActiveTab('payments'); return }
    setUploading(true)
    try {
      let imageUrls: string[] = []
      if (files.length>0) {
        for (const f of files) { const url = await uploadOne(f, profile.id); imageUrls.push(url) }
      } else if (previews.length>0 && editingId) {
        imageUrls = previews
      }
      if (editingId) {
        const existing = products.find(p=>p.id===editingId)
        const finalImages = imageUrls.length>0 ? imageUrls : (existing?.image_urls || [existing?.image_url])
        const { error } = await supabase.from('products').update({ name: prodName.trim(), price: parseFloat(prodPrice), description: prodDesc.trim(), category: prodCategory, stock: parseInt(prodStock)||100, sizes: prodSizes.split(',').map(s=>s.trim()).filter(Boolean), colors: prodColors.split(',').map(s=>s.trim()).filter(Boolean), original_price: prodOrigPrice?parseFloat(prodOrigPrice):null, image_url: finalImages[0]||'', image_urls: finalImages }).eq('id', editingId)
        if (error) throw error
      } else {
        if (imageUrls.length===0) { setErrorMsg('Please upload at least one image'); setUploading(false); return }
        const { data, error } = await supabase.from('products').insert({ user_id: profile.id, name: prodName.trim(), price: parseFloat(prodPrice), description: prodDesc.trim(), category: prodCategory, stock: parseInt(prodStock)||100, sizes: prodSizes.split(',').map(s=>s.trim()).filter(Boolean), colors: prodColors.split(',').map(s=>s.trim()).filter(Boolean), original_price: prodOrigPrice?parseFloat(prodOrigPrice):null, image_url: imageUrls[0], image_urls: imageUrls }).select().single()
        if (error) throw error
        if (data) setProducts([data as any, ...products])
      }
      const { data: prods } = await supabase.from('products').select('*').eq('user_id', profile.id).order('created_at', { ascending: false })
      if (prods) setProducts(prods)
      cancelEdit()
    } catch (e:any){ setErrorMsg(e.message) } setUploading(false)
  }
  const deleteProduct = async (id:string) => {
    if (!confirm('Delete product?')) return
    try { const { error } = await supabase.from('products').delete().eq('id', id); if (error) throw error; setProducts(products.filter(p=>p.id!==id)) } catch(e:any){ setErrorMsg(e.message) }
  }

  const getDisplayPrice = (p:PlanDef) => billing==='monthly'?p.monthly:p.yearlyMonthly
  const handleBuyPlan = async () => {
    if (!selectedPlan || !txnId.trim() || !profile) { setErrorMsg('Select plan and enter Txn ID'); return }
    setPurchasing(true)
    try {
      const amount = billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal
      const { data, error } = await supabase.from('plan_payments').insert({ user_id: profile.id, plan_id: selectedPlan.id, billing, amount, txn_id: txnId.trim(), status: 'pending' }).select().single()
      if (error) throw error
      setMyPayments([data, ...myPayments]); setJustSubmitted(data); setTxnId(''); setErrorMsg(null)
      setTimeout(()=>setJustSubmitted(null), 5000)
    } catch(e:any){ setErrorMsg(e.message) } setPurchasing(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filteredStandard = getStandardThemes ? getStandardThemes() : STORE_THEMES.filter(t=> (t.category as string)!=='premium' && (t.category as string)!=='advanced')
  const standardThemes = filteredStandard

  if (loading) return <DukaanWhatsLoader />

  const CurrentPlanButton = () => (
    <div className={`h-8 px-3 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1.5 border backdrop-blur ${isPremium?'bg-[#E8FF86]/90 text-black border-[#E8FF86]':isAdvanced?'bg-white/10 text-white border-white/20':'bg-white/10 text-white/70 border-white/10'}`}>
      <span className={`w-2 h-2 rounded-full ${isPremium?'bg-black':'bg-white'} animate-pulse`} />
      {currentPlanDef.name.toUpperCase()} • {productLimit===999999?'∞':productLimit}P
    </div>
  )

  // RIGHT NAV ITEMS - as requested
  const navItems = [
    { id: 'products', label: 'Products', icon: '◫', count: `${products.length}` },
    { id: 'payments', label: 'Pro', icon: '✦', glow: true },
    { id: 'themes', label: 'Themes', icon: '◧' },
    { id: 'store', label: 'Store', icon: '⌂' },
    { id: 'analytics', label: 'Analytics', icon: '▅', premium: true },
  ] as any[]

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#0A0A0E] text-white selection:bg-[#E8FF86] selection:text-black">
      {/* LIQUID GLASS BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#15151D] via-[#0E0E12] to-[#08080A]" />
        <div className="absolute inset-0 opacity-[0.4]" style={{backgroundImage:`url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80')`, backgroundSize:'cover', backgroundPosition:'center', filter:'blur(18px) brightness(0.45)'}} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
        {/* ambient orbs */}
        <div className="absolute top-[-10%] left-[20%] w-[60%] h-[50%] bg-[radial-gradient(ellipse_at_center,_rgba(120,119,198,0.25),transparent_70%)] blur-[40px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_center,_rgba(232,255,134,0.18),transparent_70%)] blur-[60px]" />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;900&display=swap');
        *{font-family: 'Geist', sans-serif}
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{-ms-overflow-style:none; scrollbar-width:none}
        .liquid-card{
          background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06));
          backdrop-filter: blur(28px) saturate(1.4);
          -webkit-backdrop-filter: blur(28px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: 0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .liquid-panel{
          background: rgba(18,18,22,0.72);
          backdrop-filter: blur(36px) saturate(1.5);
          -webkit-backdrop-filter: blur(36px) saturate(1.5);
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 20px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12);
        }
        .liquid-input{
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
        }
        .liquid-input:focus{
          background: rgba(255,255,255,0.10);
          border-color: rgba(255,255,255,0.25);
          outline: none;
        }
        .right-nav-glass{
          background: linear-gradient(180deg, rgba(28,28,34,0.88), rgba(16,16,20,0.92));
          backdrop-filter: blur(40px) saturate(1.6);
          -webkit-backdrop-filter: blur(40px) saturate(1.6);
          border-left: 1px solid rgba(255,255,255,0.08);
          box-shadow: -12px 0 40px rgba(0,0,0,0.45), inset 1px 0 0 rgba(255,255,255,0.08);
        }
        .nav-icon-btn{
          width: 48px; height: 48px;
          border-radius: 14px;
          display:flex; align-items:center; justify-content:center;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.65);
          transition: all 0.25s ease;
          position: relative;
        }
        .nav-icon-btn:hover{
          background: rgba(255,255,255,0.12);
          color: white;
          transform: translateY(-1px);
          border-color: rgba(255,255,255,0.16);
        }
        .nav-icon-btn.active{
          background: white;
          color: black;
          border-color: white;
          box-shadow: 0 8px 24px rgba(255,255,255,0.25), 0 0 0 1px rgba(255,255,255,0.6);
        }
        .nav-icon-btn.pro-glow.active{
          background: #E8FF86;
          color: black;
          border-color: #E8FF86;
          box-shadow: 0 8px 28px rgba(232,255,134,0.45);
        }
        .pro-dot{width:6px;height:6px;border-radius:999px;background:#E8FF86;box-shadow:0 0 8px #E8FF86}
        .pro-dot.active{background:black;box-shadow:none}
        /* PRESERVED 6 GLASS THEMES NAVIGATOR - DO NOT CHANGE ANIMATION/DESIGN */
        .glass-container{
          display:flex; gap:20px; overflow-x:auto; padding:24px 20px 36px;
          scroll-snap-type:x mandatory;
          scrollbar-width:none;
        }
        .glass-container::-webkit-scrollbar{display:none}
        .glass{
          min-width:260px; height:240px; position:relative; flex-shrink:0;
          background: rgba(255,255,255,0.10);
          backdrop-filter: blur(18px) saturate(1.3);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius:22px;
          transform: rotate(calc(var(--r) * 1deg));
          transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1);
          cursor:pointer;
          box-shadow: 0 12px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.25);
        }
        .glass:hover{ transform: rotate(0deg) translateY(-6px) scale(1.02); z-index:10; box-shadow: 0 20px 48px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.3);}
        .glass.selected{ transform: rotate(0deg) translateY(-4px) scale(1.03); border-color:white; box-shadow: 0 16px 40px rgba(0,0,0,0.3), 0 0 0 1px white; }
        .glass-preview-wrap{padding:12px; height:100%; display:flex; flex-direction:column; gap:10px}
        .glass-preview-header{height:36px; border-radius:12px; display:flex; align-items:center; justify-content:space-between; padding:0 12px; font-size:10px; font-weight:900; letter-spacing:0.05em}
        .glass-preview-body{display:flex; flex-direction:column; gap:8px; flex:1}
        .glass-lock-overlay{position:absolute; inset:0; background:rgba(248,247,245,0.86); backdrop-filter:blur(10px); border-radius:22px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding:16px}
        .adv-grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:14px}
        .adv-card{position:relative; height:220px; background: rgba(255,255,255,0.08); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.12); border-radius:20px; padding:16px; text-align:left; transition:all 0.25s; overflow:hidden}
        .adv-card:hover{border-color:rgba(255,255,255,0.22); transform:translateY(-2px); background:rgba(255,255,255,0.12)}
        .adv-card.selected{border-color:white; background:rgba(255,255,255,0.14); box-shadow:0 0 0 1px white}
        .adv-card-lock-overlay{position:absolute; inset:0; background:rgba(18,18,22,0.78); backdrop-filter:blur(16px); display:flex; flex-direction:column; align-items:center; justify-content:center; border-radius:20px; padding:12px}
        .radio-container{position:relative; display:flex; flex-direction:column; gap:10px; --total-radio:3}
        .radio-container input{display:none}
        .radio-container label{position:relative; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.10); border-radius:16px; padding:14px 16px; cursor:pointer; transition:all 0.25s; backdrop-filter:blur(12px)}
        .radio-container input:checked + label{background:rgba(255,255,255,0.12); border-color:white; box-shadow:0 0 0 1px white}
        .glider-container{position:absolute; pointer-events:none}
      `}</style>

      {/* TOP BAR - liquid */}
      <header className="relative z-10 sticky top-0 px-4 md:px-6 py-3">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white text-black flex items-center justify-center font-black rounded-[12px] text-[15px] shadow-[0_8px_20px_rgba(255,255,255,0.2)]">D</div>
            <div>
              <div className="font-bold tracking-tight text-[14px] md:text-[15px] leading-none">DukaanWhats.pk</div>
              <div className="text-[10px] text-white/50 tracking-widest uppercase mt-[2px]">Liquid OS • {theme}</div>
            </div>
            <div className="hidden md:flex ml-4"><CurrentPlanButton /></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 liquid-card px-3 h-9 rounded-full text-[11px]">
              <span className="w-2 h-2 bg-[#E8FF86] rounded-full animate-pulse" /> Live • {products.length} products
            </div>
            <Link href={slug ? `/s/${slug}` : '#'} target="_blank" className="h-9 px-5 bg-white text-black rounded-full text-[12px] font-bold flex items-center justify-center hover:bg-white/90 transition">View Store ↗</Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-[1400px] mx-auto flex gap-0 md:gap-6 px-0 md:px-6 pb-24 md:pb-6">
        {/* MAIN CONTENT - liquid cards */}
        <main className="flex-1 min-w-0 px-4 md:px-0 space-y-5 order-1">
          {/* Status strip like reference image */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-3 liquid-card rounded-[24px] p-5">
              <div className="flex justify-between items-start">
                <div><div className="text-[11px] text-white/50 tracking-widest uppercase">Air-Conditioner</div><div className="text-[11px] text-white/30">Living room</div></div>
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><div className="w-2 h-2 bg-[#6EF0FF] rounded-full" /></div>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 rotate-[-90deg]"><circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.12)" strokeWidth="6" fill="none"/><circle cx="48" cy="48" r="40" stroke="#6EF0FF" strokeWidth="6" fill="none" strokeDasharray="251" strokeDashoffset="90" strokeLinecap="round"/></svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-[24px] font-black">19°</span><span className="text-[10px] text-white/50">Celsius</span></div>
                </div>
                <div className="text-[10px] text-white/40">19° 40°</div>
              </div>
              <div className="mt-4 flex gap-2">
                <span className="px-3 h-7 rounded-full bg-[#0A84FF] text-white text-[10px] font-bold flex items-center">Cooling</span>
                <span className="px-3 h-7 rounded-full bg-white/10 text-white/50 text-[10px] flex items-center">Heating</span>
              </div>
            </div>

            <div className="col-span-12 md:col-span-6 liquid-panel rounded-[28px] overflow-hidden relative min-h-[220px]">
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="relative p-4 flex justify-between items-start">
                <div className="flex gap-2">
                  <span className="px-3 h-7 rounded-full bg-white/15 backdrop-blur text-white text-[10px] flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"/>Live</span>
                  <span className="px-2.5 h-7 rounded-full bg-black/40 backdrop-blur text-white/70 text-[10px] flex items-center">32W</span>
                  <span className="px-2.5 h-7 rounded-full bg-black/40 backdrop-blur text-white/70 text-[10px] flex items-center">24°C</span>
                </div>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {['Living Room 1','Living Room 2'].map((r,i)=><span key={r} className={`px-4 h-8 rounded-full text-[11px] font-medium flex items-center backdrop-blur ${i===0?'bg-white text-black':'bg-white/15 text-white'}`}>{r}</span>)}
              </div>
            </div>

            <div className="col-span-12 md:col-span-3 liquid-card rounded-[24px] p-4 hidden md:block">
              <div className="text-[11px] font-bold">Messages</div>
              <div className="mt-3 space-y-3">
                {[{n:'Andrey Janny'},{n:'Will Smith'},{n:'Khan Mart'},{n:'Saba Saleh'},{n:'Barbara Linda'}].map(u=>(
                  <div key={u.n} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white/15" />
                    <div className="text-[11px] text-white/80">{u.n}</div>
                    <div className="ml-auto text-[9px] text-white/30">Sun 24</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {activeTab==='themes' && (
            <div className="space-y-6">
              <div className="liquid-panel rounded-[28px] p-6 md:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <h2 className="text-[16px] font-bold tracking-tight">Themes — <span className="font-normal text-white/50 text-[13px]">Current: {currentPlanDef.name} • {currentPlanId==='basic'?'Only 3 Advanced unlocked':currentPlanId==='advanced'?'All 8 Advanced unlocked':'All unlocked ✓'}</span></h2>
                  <CurrentPlanButton />
                </div>

                <div className="mt-6 mb-3 flex items-center gap-2"><span className="text-[10px] font-black tracking-widest bg-white text-black px-3 py-1.5 rounded-full">8 ADVANCED THEMES</span><span className="text-[11px] text-white/50">{currentPlanId==='basic'?`${basicAllowedAdvancedIds.length}/8 unlocked`:`${currentPlanId.toUpperCase()}: 8/8 ✓`}</span></div>
                <div className="adv-grid">
                  {finalAdvancedList.map(t => { const isActive = theme===t.id; const locked = isThemeLocked(t); return (
                    <button key={t.id} onClick={()=>handleThemeClick(t)} className={`adv-card ${isActive?'selected':''}`}>
                      {isActive && <span className="absolute top-3 right-3 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-[11px] font-bold">✓</span>}
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[16px] shrink-0 bg-white/10 border border-white/10">{t.name?.[0] || '◧'}</div>
                        <div className="min-w-0 flex-1"><div className="text-[13px] font-bold truncate tracking-tight text-white">{t.name}</div><div className="text-[10px] text-white/40 uppercase tracking-widest font-medium mt-0.5">ADVANCED</div></div>
                      </div>
                      <div className="mt-4 w-full h-[88px] rounded-[14px] bg-white/[0.06] border border-white/10 p-2 flex gap-2">
                        <div className="w-9 h-full rounded-[10px]" style={{background:t.colors?.accent || '#fff'}} />
                        <div className="flex-1 flex flex-col gap-1.5"><div className="h-2 w-3/4 bg-white/20 rounded-full" /><div className="h-2 w-1/2 bg-white/10 rounded-full" /><div className="mt-auto h-6 w-full bg-white/10 border border-white/10 rounded-[10px]" /></div>
                      </div>
                      {locked && <div className="adv-card-lock-overlay"><GlassLockIcon size={40} /><div className="text-[11px] font-black tracking-widest mt-1 text-white">LOCKED</div><div className="text-[10px] text-white/50 text-center leading-tight">Basic 3/8<br/>Need Advanced</div><div className="mt-1.5 bg-white text-black text-[10px] px-3.5 h-7 rounded-full font-bold flex items-center">UPGRADE → Rs. 899</div></div>}
                      {!locked && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#E8FF86] text-black text-[9px] px-2.5 h-5 rounded-full font-bold flex items-center">UNLOCKED ✓</div>}
                    </button>
                  )})}
                </div>

                <div className="mt-10 mb-3 flex items-center gap-2"><span className="text-[10px] font-black tracking-widest bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-white">STANDARD THEMES</span><span className="text-[11px] text-white/40">All plans</span></div>
                <div className="adv-grid">
                  {filteredStandard.slice(0,6).map(t => { const isActive = theme===t.id; return (
                    <button key={t.id} onClick={()=>handleThemeClick(t)} className={`adv-card ${isActive?'selected':''} !h-[200px]`}>
                      {isActive && <span className="absolute top-3 right-3 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-[11px] font-bold">✓</span>}
                      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center text-[16px] text-white">{t.name?.[0] || '◧'}</div><div><div className="text-[13px] font-bold text-white">{t.name}</div><div className="text-[10px] text-white/40 uppercase tracking-widest">{t.category}</div></div></div>
                      <div className="mt-4 w-full h-[68px] rounded-[14px] bg-white/[0.06] border border-white/10" />
                    </button>
                  )})}
                </div>

                {/* PRESERVED 6 GLASS THEMES - EXACT ANIMATION */}
                <div className="mt-10 rounded-[28px] border border-white/10 overflow-hidden liquid-panel">
                  <div className="p-6 md:p-7 border-b border-white/10 bg-white/[0.03] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3"><span className="bg-white text-black text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest">6 GLASS THEMES</span><span className="font-bold text-[14px] tracking-tight text-white">Glass Collection — Premium Only</span></div>
                    <span className="bg-white/10 border border-white/10 text-[11px] px-3 py-1.5 rounded-full font-medium text-white/70">{currentPlanId==='premium'?'All Premium Unlocked ✓':`Locked for ${currentPlanId.toUpperCase()} — Need Premium Rs. 2999/mo`}</span>
                  </div>
                  <div className="bg-black/20 relative">
                    <div className="absolute top-3 right-5 hidden md:flex items-center gap-2 text-[10px] font-mono text-white/30"><span>← Scroll to see all {premiumThemes.length} Glass →</span></div>
                    <div className="glass-container">
                      {premiumThemes.map((t,i)=>{
                        const isActive=theme===t.id;
                        const locked=isThemeLocked(t);
                        const r = isActive ? 0 : (GLASS_TILTS[i % GLASS_TILTS.length]); 
                        return (
                          <div key={t.id} className={`glass ${isActive?'selected':''}`} data-text={t.name} style={{'--r':r, scrollSnapAlign:'start'} as any} onClick={()=>handleThemeClick(t)}>
                            <div className="glass-preview-wrap">
                              <div className="glass-preview-header" style={{background:t.colors?.bg || 'rgba(255,255,255,0.12)', color:t.colors?.text || '#fff'}}>
                                <span className="tracking-widest">{t.id.slice(0,14).toUpperCase()} • PREMIUM</span>
                                <span className="text-[8px] opacity-60">{locked?'🔒 LOCKED':'✓ UNLOCKED'}</span>
                              </div>
                              <div className="glass-preview-body">
                                <div className="h-8 rounded-[10px] border border-white/10" style={{background:t.colors?.card || 'rgba(255,255,255,0.08)'}} />
                                <div className="flex gap-2"><div className="flex-1 h-16 rounded-[12px] bg-white/10 border border-white/10" /><div className="flex-1 h-16 rounded-[12px] bg-white/10 border border-white/10" /></div>
                                <div className="h-8 rounded-[10px] bg-white/90" />
                              </div>
                            </div>
                            {isActive && <div className="absolute top-4 right-4 w-7 h-7 bg-white text-black rounded-full flex items-center justify-center text-[12px] font-bold shadow-lg">✓</div>}
                            {locked && (
                              <div className="glass-lock-overlay">
                                <GlassPremiumLock size={56} />
                                <div className="text-black text-[12px] font-black tracking-widest mt-1">PREMIUM LOCKED</div>
                                <div className="text-zinc-500 text-[10px] text-center leading-[1.4] font-medium">Basic: 0/3 • Advanced: 0/3<br/>Need Premium Rs. 2999/mo</div>
                                <div className="mt-2 bg-black text-white text-[10px] font-bold px-4 h-8 rounded-full flex items-center shadow-[0_8px_20px_rgba(0,0,0,0.2)]">UPGRADE → PREMIUM</div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-8 flex-wrap gap-3">
                  <span className="text-[11px] text-white/40">Products {products.length}/{productLimit===999999?'∞':productLimit} • Images {imageLimit===999999?'∞':imageLimit}/product • Current: {currentPlanDef.name}</span>
                  <div className="flex gap-2 items-center">
                    {saved && <span className="h-11 px-4 flex items-center text-[12px] text-black font-bold bg-[#E8FF86] rounded-full">✓ Saved! {getTheme(theme).name}</span>}
                    <button onClick={saveStore} className="h-11 px-7 bg-white text-black text-[13px] font-bold rounded-full hover:bg-white/90 transition-colors flex items-center justify-center leading-none">{saving?'Saving...':'Save Store & Theme'}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab==='store' && (
            <div className="liquid-panel rounded-[28px] p-6 md:p-8">
              <div className="flex items-center justify-between flex-wrap gap-3"><h2 className="font-bold text-[16px] tracking-tight">Store Identity</h2>{saved && <span className="bg-[#E8FF86] text-black px-3 h-7 rounded-full text-[11px] font-bold flex items-center">Saved ✓</span>}</div>
              <div className="mt-5 liquid-card rounded-[16px] p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[12px] ${isPremium?'bg-[#E8FF86] text-black':isAdvanced?'bg-white text-black':'bg-white/10 border border-white/10 text-white'}`}>{currentPlanDef.name[0]}</div>
                <div><div className="text-[13px] font-bold text-white">{currentPlanDef.name} • {productLimit===999999?'∞':productLimit} products • {imageLimit===999999?'∞':imageLimit} images</div><div className="text-[11px] text-white/50">{currentPlanDef.features.join(' • ')}</div></div>
              </div>
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold tracking-widest uppercase text-white/40">Business Name</label><input value={businessName} onChange={e=>setBusinessName(e.target.value)} className="mt-2 w-full h-11 px-4 rounded-[12px] liquid-input text-[13px] text-white" /></div>
                <div><label className="text-[10px] font-bold tracking-widest uppercase text-white/40">WhatsApp Number</label><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="923001234567" className="mt-2 w-full h-11 px-4 rounded-[12px] liquid-input text-[13px] text-white" /></div>
                <div className="md:col-span-2"><label className="text-[10px] font-bold tracking-widest uppercase text-white/40">Store Slug</label><input value={slug} onChange={e=>setSlug(e.target.value)} className="mt-2 w-full h-11 px-4 rounded-[12px] liquid-input text-[13px] text-white" /><div className="mt-2 text-[11px] text-white/40">Your store: /s/{slug || 'your-slug'}</div></div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 items-center">
                <button onClick={saveStore} disabled={saving} className="h-11 px-7 bg-white text-black rounded-full text-[13px] font-bold hover:bg-white/90 transition-colors flex items-center justify-center leading-none">{saving?'Saving...':saved?'Saved ✓':'Save Store'}</button>
                <button onClick={copyLink} className="h-11 px-6 border border-white/15 bg-white/5 rounded-full text-[13px] font-medium hover:bg-white/10 text-white transition-colors">{copied?'Copied!':'Copy Link'}</button>
                <span className="text-[11px] text-white/30">{slug ? `/s/${slug}` : ''}</span>
              </div>
              {profile && (
                <div className="mt-8">
                  <h3 className="font-bold text-[13px] text-white">Premium Editor</h3>
                  <div className="mt-3 liquid-card rounded-[16px] p-2">
                    <PremiumThemeEditor profile={{...profile, premium_custom: premiumCustom} as any} onSave={(d:any)=>{ setPremiumCustom(d); setProfile({...profile, premium_custom: d} as any) }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab==='products' && (
            <div className="space-y-4">
              <div className="liquid-panel rounded-[28px] p-6 md:p-8">
                <div className="flex items-center justify-between"><h2 className="font-bold text-[15px] tracking-tight text-white">Add Product — {editingId?'Editing':'New'} • {currentPlanId.toUpperCase()} allows {imageLimit===999999?'∞':imageLimit} images</h2><div className="text-[11px] text-white/40">{products.length}/{productLimit===999999?'∞':productLimit}</div></div>
                <label className="mt-6 group liquid-card rounded-[20px] border-dashed border-white/20 p-8 flex flex-col items-center justify-center cursor-pointer hover:border-white/30 transition-colors min-h-[160px]">
                  <div className="relative z-10 flex flex-col items-center">
                  {previews.length ? (
                    <div className="grid grid-cols-5 gap-2.5 w-full">
                      {previews.map((src,i)=>(
                        <div key={i} className="relative group/img">
                          <img src={src} className="w-full h-[72px] object-cover rounded-[12px] border-2 border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.2)]" />
                          <button type="button" onClick={(e)=>{e.preventDefault(); removeFileAt(i)}} className="absolute -top-2 -right-2 w-5 h-5 bg-white text-black rounded-full text-[10px]">✕</button>
                        </div>
                      ))}
                      <div className="h-[72px] rounded-[12px] border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center gap-1 hover:border-white/30 transition-colors">
                        <span className="text-[16px] text-white">+</span><span className="text-[9px] font-bold tracking-widest text-white/60">ADD</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <UploadIcon />
                      <div className="mt-4 text-center">
                        <div className="font-bold text-[14px] tracking-tight text-white">Drop images or click to upload</div>
                        <div className="mt-1.5 flex items-center justify-center gap-2 text-[11px]">
                          <span className="px-2.5 h-6 rounded-full bg-white text-black font-bold flex items-center">Basic 1</span>
                          <span className="px-2.5 h-6 rounded-full bg-white/10 border border-white/10 font-bold flex items-center text-white">Advanced 5</span>
                          <span className="px-2.5 h-6 rounded-full bg-[#E8FF86] text-black font-bold flex items-center">Premium ∞</span>
                        </div>
                        <div className="mt-2 text-[11px] text-white/40">Your plan <b className="text-white">{currentPlanId.toUpperCase()}</b> allows <b className="text-white">{imageLimit===999999?'Unlimited':imageLimit}</b> image{imageLimit!==1?'s':''} per product</div>
                      </div>
                    </>
                  )}
                  </div>
                  <input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
                </label>
                <div className="mt-6 grid md:grid-cols-2 gap-3">
                  <input placeholder="Product name *" value={prodName} onChange={e=>setProdName(e.target.value)} className="w-full h-11 px-4 rounded-[12px] liquid-input text-[13px] text-white" />
                  <input placeholder="Price Rs. 3500 *" type="number" value={prodPrice} onChange={e=>setProdPrice(e.target.value)} className="w-full h-11 px-4 rounded-[12px] liquid-input text-[13px] text-white" />
                  <input placeholder="Compare price (optional) Rs. 5000" type="number" value={prodOrigPrice} onChange={e=>setProdOrigPrice(e.target.value)} className="w-full h-11 px-4 rounded-[12px] liquid-input text-[13px] text-white" />
                  <select value={prodCategory} onChange={e=>setProdCategory(e.target.value)} className="w-full h-11 px-4 rounded-[12px] liquid-input text-[13px] text-white">
                    <option className="bg-black">General</option><option className="bg-black">Clothing</option><option className="bg-black">Shoes</option><option className="bg-black">Bags</option><option className="bg-black">Beauty</option><option className="bg-black">Electronics</option><option className="bg-black">Food</option><option className="bg-black">Other</option>
                  </select>
                  <input placeholder="Stock qty (e.g. 100)" type="number" value={prodStock} onChange={e=>setProdStock(e.target.value)} className="w-full h-11 px-4 rounded-[12px] liquid-input text-[13px] text-white" />
                  <input placeholder="Sizes (S, M, L, XL) - comma separated" value={prodSizes} onChange={e=>setProdSizes(e.target.value)} className="w-full h-11 px-4 rounded-[12px] liquid-input text-[13px] text-white" />
                  <input placeholder="Colors (Black, White, Red) - comma" value={prodColors} onChange={e=>setProdColors(e.target.value)} className="md:col-span-2 w-full h-11 px-4 rounded-[12px] liquid-input text-[13px] text-white" />
                  <textarea placeholder="Product description..." value={prodDesc} onChange={e=>setProdDesc(e.target.value)} className="md:col-span-2 w-full min-h-[80px] p-4 rounded-[12px] liquid-input text-[13px] text-white resize-none" />
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  {editingId && <button onClick={cancelEdit} className="h-11 px-6 border border-white/15 bg-white/5 rounded-full text-[13px] font-medium hover:bg-white/10 text-white transition-colors">Cancel</button>}
                  <button onClick={addProduct} disabled={uploading || (!editingId && products.length>=productLimit)} className="h-11 px-7 bg-white text-black text-[13px] font-bold rounded-full disabled:opacity-40 hover:bg-white/90 transition-colors flex items-center justify-center leading-none">{uploading?'Uploading...':!editingId && products.length>=productLimit?`Limit ${productLimit===999999?'∞':productLimit} — Upgrade`:`${editingId?'Update':'Add'} Product →`}</button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {products.length===0 ? (
                  <div className="col-span-2 md:col-span-4 liquid-card rounded-[20px] p-12 flex flex-col items-center justify-center text-center"><UploadIcon className="w-12 h-12" /><div className="mt-4 font-bold text-[14px] text-white">No products yet</div><div className="text-[11px] text-white/40 mt-1">Add your first product — {productLimit===999999?'Unlimited':productLimit} allowed on {currentPlanDef.name}</div></div>
                ) : products.map(p => (
                  <PremiumProductCard key={p.id} p={p} onEdit={startEdit} onDelete={deleteProduct} themeId={theme} imageLimit={imageLimit} />
                ))}
              </div>
            </div>
          )}

          {activeTab==='analytics' && (
            <div>
              {!profile ? <div className="p-8 text-center text-white/50">Loading...</div> : currentPlanId === 'premium' ? (
                <div className="liquid-panel rounded-[28px] p-2"><RealAnalytics userId={profile!.id} currentPlanId={currentPlanId} /></div>
              ) : (
                <div className="relative">
                  <div className="liquid-panel rounded-[28px] p-8 text-center relative">
                    <div className="w-16 h-16 bg-white/10 rounded-[16px] flex items-center justify-center mx-auto text-white border border-white/10">◐</div>
                    <h3 className="font-bold text-[16px] mt-4 text-white">Analytics Locked — Premium Only</h3>
                    <p className="text-[12px] text-white/50 mt-2">Upgrade to Premium to unlock live analytics.</p>
                    <button onClick={()=>setActiveTab('payments')} className="mt-4 h-10 px-6 bg-[#E8FF86] text-black rounded-full text-[12px] font-bold">Upgrade → Premium Rs. 2999</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab==='payments' && (
            <div className="liquid-panel rounded-[28px] p-6 md:p-8">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="font-bold text-[16px] text-white">Pro Plans — Till {TILL_ID}</h2>
                <div className="flex items-center gap-2">
                  <button onClick={()=>setBilling('monthly')} className={`h-8 px-4 rounded-full text-[11px] font-bold border transition ${billing==='monthly'?'bg-white text-black border-white':'bg-white/10 text-white/60 border-white/10'}`}>Monthly</button>
                  <button onClick={()=>setBilling('yearly')} className={`h-8 px-4 rounded-full text-[11px] font-bold border transition ${billing==='yearly'?'bg-white text-black border-white':'bg-white/10 text-white/60 border-white/10'}`}>Yearly Save 22%</button>
                </div>
              </div>

              <div className="mt-6 grid md:grid-cols-3 gap-4">
                <div className="liquid-card rounded-[20px] p-5">
                  <div className="text-[11px] tracking-widest text-white/40 font-bold">JAZZCASH TILL ID</div>
                  <div className="mt-3 flex items-center gap-2"><span className="font-mono text-[22px] font-black tracking-widest text-white">{TILL_ID}</span><button onClick={copyTill} className="h-7 px-3 rounded-full bg-white/10 text-[10px] text-white border border-white/10">{copiedTill?'Copied!':'Copy'}</button></div>
                  <div className="mt-3 bg-white rounded-[14px] p-3"><img src={`https://barcodeapi.org/api/code128/${TILL_ID}`} alt="Barcode" className="w-full h-[48px] object-contain"/><div className="text-center text-[11px] font-mono text-black font-black tracking-[0.3em] mt-1">{TILL_ID}</div></div>
                  <div className="mt-3 bg-white rounded-[14px] p-3 flex justify-center"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=JAZZCASH_TILL_${TILL_ID}`} alt="QR" className="w-[120px] h-[120px]"/></div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="radio-container" style={{"--total-radio": plans.length} as any}>
                    {plans.map(p=>{
                      const displayPrice = getDisplayPrice(p)
                      const isSelected = selectedPlan?.id===p.id
                      const isCurrent = currentPlanId===p.id
                      return (
                        <div key={p.id} className="contents">
                          <input type="radio" id={`dash-${p.id}`} name="dash-plan" checked={isSelected} onChange={()=>setSelectedPlan(p)} />
                          <label htmlFor={`dash-${p.id}`} onClick={()=>setSelectedPlan(p)} className={isCurrent?'!bg-white/15 !border-white' : ''}>
                            <div className="flex justify-between items-start gap-3">
                              <div className="min-w-0 flex-1"><div className="flex items-center gap-2 flex-wrap"><span className="font-black text-[14px] text-white">{p.name}</span>{isCurrent && <span className="bg-white text-black text-[8px] px-2 h-5 rounded-full font-bold flex items-center">CURRENT</span>}<span className={`text-[10px] px-2.5 h-6 rounded-full font-bold flex items-center ${p.id==='premium'?'bg-[#E8FF86] text-black':p.id==='advanced'?'bg-white text-black':'bg-white/10 text-white border border-white/10'}`}>Rs. {displayPrice}/mo</span>{p.id==='advanced' && <span className="bg-[#E8FF86] text-black text-[8px] px-2 h-5 rounded-full font-bold flex items-center">POPULAR</span>}</div><div className="text-[11px] mt-1.5 opacity-60 leading-[1.3] text-white">{p.features.join(' • ')}</div></div><div className="text-right shrink-0"><div className="font-black text-[16px] text-white">Rs. {displayPrice}</div><div className="text-[10px] opacity-60 text-white/50">{billing==='yearly'?`Billed Rs. ${p.yearlyTotal}/yr`:p.id!=='basic'?`Yearly Rs. ${p.yearlyMonthly}/mo`:''}</div></div>
                            </div>
                          </label>
                        </div>
                      )
                    })}
                    <div className="glider-container"><div className="glider"></div></div>
                  </div>
                  {selectedPlan && selectedPlan.monthly>0 && (
                    <div className="rounded-[20px] border border-[#E8FF86]/30 bg-[#E8FF86]/10 backdrop-blur p-5">
                      <div className="flex items-center gap-1.5 md:gap-2 flex-wrap"><div className="w-6 h-6 rounded-full bg-[#E8FF86] text-black flex items-center justify-center text-[12px]">₨</div><div className="text-[13px] font-bold text-white">Pay Rs. {billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal} → Till {TILL_ID} ({billing})</div></div>
                      <input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder={`Txn ID after paying Rs. ${billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal} to Till ${TILL_ID}`} className="mt-4 w-full h-12 px-4 rounded-[12px] border bg-black/40 text-white border-white/10 text-[12px] font-mono focus:outline-none focus:border-white/30"/>
                      <button onClick={handleBuyPlan} disabled={purchasing} className="mt-3 w-full h-12 bg-[#E8FF86] text-black rounded-full font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-[#E8FF86]/90 transition-colors leading-none">{purchasing?'Submitting...':`I Paid Rs. ${billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal} — Activate ${selectedPlan.name}`} <span className="w-5 h-5 bg-black text-[#E8FF86] rounded-full flex items-center justify-center text-[10px]">↗</span></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT NAV - liquid glass like reference */}
        <aside className="order-2 w-full md:w-[88px] shrink-0 md:sticky md:top-[72px] md:h-[calc(100vh-88px)]">
          <div className="right-nav-glass rounded-[28px] md:rounded-[28px] p-3 md:p-3 flex md:flex-col flex-row items-center justify-between md:justify-start gap-2 md:gap-3 mx-4 md:mx-0">
            <div className="hidden md:flex w-12 h-12 rounded-[16px] bg-white/5 border border-white/10 items-center justify-center text-white/60">88</div>
            
            <div className="flex md:flex-col flex-row gap-2 md:gap-3">
              {navItems.map((item:any)=>(
                <button key={item.id} onClick={()=>setActiveTab(item.id as any)}
                  className={`nav-icon-btn group ${activeTab===item.id?'active':''} ${item.glow?'pro-glow':''}`}
                  title={item.label}>
                  <span className="text-[16px] font-bold">{item.icon}</span>
                  {item.premium && !isPremium && <span className="absolute -top-1 -right-1 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center"><span className="text-[8px]">🔒</span></span>}
                  {item.count && <span className={`absolute -top-1 -right-1 text-[9px] font-black px-1.5 h-4 rounded-full flex items-center ${activeTab===item.id?'bg-black text-white':'bg-[#E8FF86] text-black'}`}>{item.count}</span>}
                  <span className="hidden md:group-hover:block absolute left-[62px] bg-black text-white text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap">{item.label}</span>
                </button>
              ))}
              <div className="hidden md:block w-full h-[1px] bg-white/10 my-1" />
              <button onClick={()=>setActiveTab('store' as any)} className={`nav-icon-btn ${activeTab==='store'?'active':''}`} title="Store">
                <span className="text-[14px]">⌂</span>
              </button>
            </div>

            <div className="flex md:flex-col flex-row gap-2 md:mt-auto items-center">
              <button onClick={handleLogout} className="nav-icon-btn !bg-red-500/10 !border-red-500/20 !text-red-300 hover:!bg-red-500/20" title="Logout">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
              <div className="hidden md:flex w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-black border border-white/10 items-center justify-center text-[12px] font-bold">A</div>
            </div>
          </div>

          {/* extra bottom pills like reference */}
          <div className="hidden md:flex mt-4 flex-col gap-3">
            <div className="liquid-card rounded-[20px] p-3">
              <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Humidity</div>
              <div className="text-[16px] font-black text-white mt-1">40.2%</div>
            </div>
            <div className="liquid-card rounded-[20px] p-3">
              <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Power Use</div>
              <div className="mt-2 h-12 flex items-end gap-1">
                <div className="flex-1 h-[40%] bg-white/10 rounded-full" /><div className="flex-1 h-[70%] bg-white/10 rounded-full" /><div className="flex-1 h-[90%] bg-[#6EF0FF] rounded-full shadow-[0_0_12px_rgba(110,240,255,0.6)]" /><div className="flex-1 h-[55%] bg-white/10 rounded-full" />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {errorMsg && <div className="fixed bottom-4 right-4 z-50 bg-red-500/90 backdrop-blur text-white px-4 py-2 rounded-full text-[12px] shadow-lg border border-red-400/20">{errorMsg}</div>}

      {showStatusModal && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="liquid-panel rounded-[28px] w-full max-w-[380px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            {showStatusModal.type === 'approved' ? (
              <div>
                <div className="bg-white/5 text-white p-8 text-center border-b border-white/10">
                  <div className="w-16 h-16 bg-[#E8FF86] rounded-full flex items-center justify-center mx-auto"><span className="text-[28px] text-black">✓</span></div>
                  <h2 className="font-black text-[22px] mt-4">Payment Approved!</h2>
                  <p className="text-[13px] text-white/50 mt-1">Your store is now {showStatusModal.payment.plan_id.toUpperCase()}</p>
                </div>
                <div className="p-6">
                  <div className="liquid-card rounded-[14px] p-4">
                    <div className="flex justify-between"><span className="text-[11px] text-white/50">Plan</span><span className="text-[13px] font-black text-white">{showStatusModal.payment.plan_id.toUpperCase()} • Rs. {showStatusModal.payment.amount}</span></div>
                    <div className="flex justify-between mt-2"><span className="text-[11px] text-white/50">Txn ID</span><span className="font-mono text-[12px] bg-white/10 border border-white/10 px-2 py-1 rounded-[8px] text-white">{showStatusModal.payment.txn_id}</span></div>
                  </div>
                  <button onClick={()=>setShowStatusModal(null)} className="mt-6 w-full h-12 bg-white text-black rounded-full font-bold text-[13px]">Continue →</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-white/[0.03] p-8 text-center border-b border-white/10">
                  <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto"><span className="text-[24px]">✕</span></div>
                  <h2 className="font-black text-[20px] mt-4 text-white">Payment Rejected</h2>
                  <p className="text-[12px] text-white/50 mt-1">Check Txn ID and try again</p>
                </div>
                <div className="p-6">
                  <p className="text-[12px] text-white/60">Txn ID could not be verified in Till {TILL_ID}. Please ensure correct amount and ID.</p>
                  <button onClick={()=>setShowStatusModal(null)} className="mt-6 w-full h-12 bg-white text-black rounded-full font-bold text-[13px]">Try Again →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
