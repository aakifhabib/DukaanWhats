'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { RealAnalytics } from '@/components/RealAnalytics'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STORE_THEMES, getTheme, ThemeCategory, getAdvancedThemes, getPremiumThemes, getStandardThemes } from '@/lib/storeThemes'
import { DukaanWhatsLoader } from '@/components/DukaanWhatsLoader'
import { PremiumThemeEditor } from '@/components/PremiumThemeEditor'

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
    const interval = setInterval(() => {
      setHoverIdx(prev => (prev + 1) % images.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [isHovering, images.length])

  return (
    <div className="group bg-white border rounded-[20px] p-3 hover:border-black hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300"
         onMouseEnter={() => setIsHovering(true)}
         onMouseLeave={() => setIsHovering(false)}>
      <div className="relative overflow-hidden rounded-[14px] h-48 bg-[#F8F7F5]">
        {images.length > 1 && <img src={images[(hoverIdx - 1 + images.length) % images.length]} className="absolute inset-0 w-full h-full object-cover opacity-0" alt="" />}
        <img src={images[hoverIdx]} className="w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.03]" alt={p.name} />
        {images.length > 1 && (
          <>
            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur text-white text-[10px] px-2 py-1 rounded-full font-bold">
              {hoverIdx+1}/{images.length} {isHovering ? '• AUTO' : ''}
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_:any,i:number)=><div key={i} className={`h-1 rounded-full transition-all duration-300 ${i===hoverIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />)}
            </div>
            {!isHovering && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                <span className="text-[10px] bg-white text-black px-2.5 py-1 rounded-full font-bold tracking-widest">HOVER TO PREVIEW • {images.length} PICS</span>
              </div>
            )}
          </>
        )}
        {imageLimit !== 999999 && images.length >= imageLimit && (
          <div className="absolute top-2 right-2 bg-yellow-100 border border-yellow-200 text-yellow-700 text-[9px] px-2 py-1 rounded-full font-bold">LIMIT {imageLimit}</div>
        )}
      </div>
      <div className="mt-3 px-1">
        <div className="font-bold text-[13px] truncate">{p.name}</div>
        <div className="flex items-center justify-between mt-1">
          <span className="font-black text-[14px]">Rs. {p.price.toLocaleString()}</span>
          <span className="text-[11px] text-zinc-500">{images.length} img</span>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={()=>onEdit(p)} className="flex-1 h-8 bg-black text-white rounded-full text-[11px] font-bold">Edit</button>
          <button onClick={()=>onDelete(p.id)} className="h-8 w-8 border rounded-full flex items-center justify-center text-[12px]">✕</button>
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

  // --- GLASS MERGED: 3 sleek + 3 premium = 6 glass themes ---
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
          // Fetch user's payments
          const { data: pays } = await supabase.from('plan_payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
          if (pays) {
            setMyPayments(pays)
            // Check if any payment was just approved/rejected since last visit - show popup once
            const lastSeenId = localStorage.getItem('dw_last_seen_payment')
            const latest = pays[0]
            if (latest && latest.id !== lastSeenId) {
              if (latest.status === 'approved' || latest.status === 'rejected') {
                setShowStatusModal({ type: latest.status, payment: latest })
                localStorage.setItem('dw_last_seen_payment', latest.id)
              } else if (latest.status === 'pending') {
                // For pending, just mark as seen but don't show modal yet
                localStorage.setItem('dw_last_seen_payment_pending', latest.id)
              }
            } else if (latest && latest.status !== 'pending') {
              // If latest is approved/rejected and we haven't shown modal for this status change, check status change
              const lastStatus = localStorage.getItem('dw_last_seen_status_'+latest.id)
              if (lastStatus !== latest.status && (latest.status === 'approved' || latest.status === 'rejected')) {
                setShowStatusModal({ type: latest.status, payment: latest })
                localStorage.setItem('dw_last_seen_status_'+latest.id, latest.status)
              }
            }
            // Store latest status
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
    // Check total including already selected if editing
    const totalFiles = editingId ? selected.length : selected.length
    if (totalFiles > imageLimit && imageLimit !== 999999) { 
      setErrorMsg(`❌ ${currentPlanId.toUpperCase()} allows ${imageLimit} images per product. You selected ${totalFiles}. Upgrade: Till ${TILL_ID}`);
      setTimeout(()=>setErrorMsg(null),4000);
      return 
    }
    // For new product, replace; for edit, append if needed
    const newFiles = editingId ? [...files, ...selected].slice(0, imageLimit === 999999 ? 20 : imageLimit) : selected
    setFiles(newFiles)
    // Generate previews
    const pr: string[] = []
    // Keep existing previews if editing and we are appending
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
    setEditingId(p.id); 
    setProdName(p.name); 
    setProdPrice(String(p.price)); 
    setProdDesc((p as any).description || ''); 
    setProdCategory((p as any).category || 'General'); 
    setProdStock(String((p as any).stock || 100)); 
    setProdSizes(Array.isArray((p as any).sizes) ? (p as any).sizes.join(', ') : (p as any).sizes || ''); 
    setProdColors(Array.isArray((p as any).colors) ? (p as any).colors.join(', ') : (p as any).colors || ''); 
    setProdOrigPrice((p as any).original_price ? String((p as any).original_price) : ''); 
    setPreviews(p.image_urls && p.image_urls.length ? p.image_urls : [p.image_url]); 
    setFiles([]); 
    setActiveTab('products'); 
    window.scrollTo({ top: 0, behavior: 'smooth' }) 
  }
  const cancelEdit = () => { setEditingId(null); setProdName(''); setProdPrice(''); setProdDesc(''); setProdCategory('General'); setProdStock('100'); setProdSizes(''); setProdColors(''); setProdOrigPrice(''); setFiles([]); setPreviews([]) }
  const addProduct = async () => {
    if (editingId === null && products.length >= productLimit){
      setErrorMsg(`🔒 ${currentPlanId.toUpperCase()} allows ${productLimit===999999?'Unlimited':productLimit} products. Upgrade via PRO → Till ${TILL_ID}`);
      setTimeout(()=>setErrorMsg(null),4000);
      setActiveTab('payments'); return
    }
    if (!prodName.trim() || !prodPrice){ setErrorMsg('Name and price required'); setTimeout(()=>setErrorMsg(null),3000); return}
    if (files.length === 0 && !editingId){ setErrorMsg('Photo required - select at least 1 image'); setTimeout(()=>setErrorMsg(null),3000); return}
    if (files.length > imageLimit && imageLimit!==999999){ setErrorMsg(`❌ ${currentPlanId.toUpperCase()} allows ${imageLimit} images. You selected ${files.length}`); setTimeout(()=>setErrorMsg(null),4000); return}
    setUploading(true)
    try{
      const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Not logged in')
      let urls: string[] = []
      // Upload all files
      for (const f of files){ 
        const url = await uploadOne(f, user.id)
        urls.push(url)
      }
      // If editing and user didn't select new files, keep existing
      if (editingId && urls.length === 0) {
        // Keep existing product images
        const existing = products.find(p=>p.id===editingId)
        if (existing) {
          urls = existing.image_urls && existing.image_urls.length ? existing.image_urls : [existing.image_url].filter(Boolean) as string[]
        }
      }
      if (urls.length === 0) throw new Error('No images to save')
      
      if (editingId) {
        const sizesArr = prodSizes.split(',').map(s=>s.trim()).filter(Boolean)
        const colorsArr = prodColors.split(',').map(s=>s.trim()).filter(Boolean)
        const payload: any = { name: prodName.trim(), price: Number(prodPrice), image_url: urls[0], image_urls: urls, description: prodDesc.trim(), category: prodCategory, stock: Number(prodStock) || 100, sizes: sizesArr, colors: colorsArr, original_price: prodOrigPrice ? Number(prodOrigPrice) : 0 }
        const { data, error } = await supabase.from('products').update(payload).eq('id', editingId).select().single()
        if (error) throw error
        if (data) setProducts(products.map(pr => pr.id === editingId ? data : pr))
        setEditingId(null)
      } else {
        const sizesArr = prodSizes.split(',').map(s=>s.trim()).filter(Boolean)
        const colorsArr = prodColors.split(',').map(s=>s.trim()).filter(Boolean)
        const { data, error } = await supabase.from('products').insert({ user_id: user.id, name: prodName.trim(), price: Number(prodPrice), image_url: urls[0], image_urls: urls, description: prodDesc.trim(), category: prodCategory, stock: Number(prodStock) || 100, sizes: sizesArr, colors: colorsArr, original_price: prodOrigPrice ? Number(prodOrigPrice) : 0 }).select().single()
        if (error) throw error
        if (data) setProducts([data, ...products])
      }
      setProdName(''); setProdPrice(''); setProdDesc(''); setProdCategory('General'); setProdStock('100'); setProdSizes(''); setProdColors(''); setProdOrigPrice(''); setFiles([]); setPreviews([]); 
    }catch(e:any){ setErrorMsg(e.message); setTimeout(()=>setErrorMsg(null),5000) } setUploading(false)
  }
  const deleteProduct = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('products').delete().eq('id', id); setProducts(products.filter(p=>p.id!==id)) }
  const getDisplayPrice = (p: PlanDef) => billing==='monthly'?p.monthly:p.yearlyMonthly
  const handleBuyPlan = async () => {
    if (!selectedPlan) { setErrorMsg('Please select a plan'); return }
    if (selectedPlan.id==='basic') { setErrorMsg('Basic is free - already active'); return }
    if (!txnId.trim()) { setErrorMsg('Enter your JazzCash Transaction ID (TID)'); return }
    if (!profile) return
    setPurchasing(true)
    try {
      const amount = billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal
      const { data: pay, error } = await supabase.from('plan_payments').insert({ user_id: profile.id, plan_id: selectedPlan.id, billing, amount, txn_id: txnId.trim(), status: 'pending' }).select().single()
      if (error) throw error
      setMyPayments([pay, ...myPayments])
      setJustSubmitted(pay)
      setTxnId('')
      setErrorMsg(null)
      setTimeout(()=>setJustSubmitted(null), 8000)
    } catch(e:any){ setErrorMsg(e.message) }
    setPurchasing(false)
  }
  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login') }

  const standardThemes = STORE_THEMES.filter(t => !premiumIds.includes(t.id) && !finalAdvancedList.some(a=>a.id===t.id))
  const filteredStandard = (filter as string) === 'all' ? standardThemes : STORE_THEMES.filter(t => (t.category as string) === (filter as string) && !premiumIds.includes(t.id) && !finalAdvancedList.some(a=>a.id===t.id))
  const filteredAdvanced = (filter as string) === 'all' || filter === 'advanced' ? finalAdvancedList : finalAdvancedList.filter(t=>(t.category as string)===filter)

  if (loading) return <DukaanWhatsLoader message="Loading your store..." />

  const CurrentPlanButton = () => (
    <div className="liquid-glass-pill flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black tracking-widest">
      <span className={`w-2 h-2 rounded-full animate-pulse ${isPremium?'bg-[#E8FF86] shadow-[0_0_8px_#E8FF86]':isAdvanced?'bg-white':'bg-white/50'}`} />
      <span className="text-white">{currentPlanDef.name.toUpperCase()}</span>
      <span className="text-white/50 font-mono hidden md:inline">• {productLimit===999999?'∞':productLimit} • {imageLimit===999999?'∞':imageLimit}</span>
    </div>
  )

  const navItems = [
    { id: 'products', label: 'Products', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.8"/></svg>), count: products.length },
    { id: 'payments', label: 'Pro', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 5.4L19 12l-5.2 3.6L12 21l-1.8-5.4L5 12l5.2-3.6L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>), pro: true },
    { id: 'themes', label: 'Themes', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="7"/><path d="M12 5v2M12 17v2M5 12h2M17 12h2"/></svg>) },
    { id: 'store', label: 'Store', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 9l9-6 9 6v11a1 1 0 0 1-1 1h-5v-5H9v5H4a1 1 0 0 1-1-1V9z"/></svg>) },
    { id: 'analytics', label: 'Analytics', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 18V11M8 18V8M12 18v-5M16 18V6M20 18V10"/></svg>), premium: true },
  ] as any[]

  return (
    <div className="min-h-screen w-full relative bg-black text-white selection:bg-white selection:text-black">
      {/* GREEN BLACK ANIMATED BACKGROUND - CANNOT BE PURGED */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#050A06]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1F14] via-[#050A06] to-black" />
        <div className="absolute rounded-full blur-[60px] will-change-transform" style={{ width:'700px', height:'700px', left:'-10%', top:'-15%', background:'radial-gradient(circle, rgba(34,197,94,0.45) 0%, rgba(16,185,129,0.22) 40%, transparent 75%)', animation:'blob1 14s ease-in-out infinite' }} />
        <div className="absolute rounded-full blur-[70px] will-change-transform" style={{ width:'800px', height:'800px', right:'-15%', top:'10%', background:'radial-gradient(circle, rgba(16,185,129,0.38) 0%, rgba(5,150,105,0.18) 45%, transparent 75%)', animation:'blob2 18s ease-in-out infinite' }} />
        <div className="absolute rounded-full blur-[80px] will-change-transform" style={{ width:'900px', height:'900px', left:'20%', bottom:'-30%', background:'radial-gradient(circle, rgba(74,222,128,0.32) 0%, rgba(34,197,94,0.15) 50%, transparent 75%)', animation:'blob3 22s ease-in-out infinite' }} />
        <div className="absolute rounded-full blur-[50px] will-change-transform" style={{ width:'500px', height:'500px', left:'55%', top:'35%', background:'radial-gradient(circle, rgba(187,247,208,0.22) 0%, rgba(34,197,94,0.10) 60%, transparent 80%)', animation:'blob4 11s ease-in-out infinite' }} />
        <div className="absolute rounded-full blur-[40px] will-change-transform" style={{ width:'320px', height:'320px', left:'70%', bottom:'15%', background:'radial-gradient(circle, rgba(34,197,94,0.55) 0%, transparent 70%)', animation:'blobFast 8s ease-in-out infinite' }} />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
        *{font-family:'Inter',sans-serif}
        @keyframes blob1 { 0%{transform:translate(0,0) scale(1) rotate(0deg)} 25%{transform:translate(80px,60px) scale(1.15) rotate(8deg)} 50%{transform:translate(40px,120px) scale(0.92) rotate(-5deg)} 75%{transform:translate(-30px,50px) scale(1.08) rotate(12deg)} 100%{transform:translate(0,0) scale(1) rotate(0deg)} }
        @keyframes blob2 { 0%{transform:translate(0,0) scale(1)} 33%{transform:translate(-70px,80px) scale(1.18)} 66%{transform:translate(-120px,-30px) scale(0.88)} 100%{transform:translate(0,0) scale(1)} }
        @keyframes blob3 { 0%{transform:translate(0,0) scale(1)} 30%{transform:translate(60px,-80px) scale(1.12)} 60%{transform:translate(-40px,-50px) scale(1.20)} 100%{transform:translate(0,0) scale(1)} }
        @keyframes blob4 { 0%{transform:translate(0,0) scale(1) rotate(0deg)} 50%{transform:translate(-90px,-90px) scale(1.25) rotate(15deg)} 100%{transform:translate(0,0) scale(1) rotate(0deg)} }
        @keyframes blobFast { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,-70px) scale(1.35)} 100%{transform:translate(0,0) scale(1)} }
        @keyframes floatGlass { 0%,100%{transform:translateY(0px) rotate(var(--r))} 50%{transform:translateY(-10px) rotate(calc(var(--r) + 1deg))} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes pulseGlow { 0%,100%{opacity:0.6} 50%{opacity:1} }

        /* === TRUE FLOATING LIQUID GLASS FROM YOUR WEBP === */
        .liquid-glass{
          background: linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 100%);
          backdrop-filter: blur(40px) saturate(180%) brightness(1.08);
          -webkit-backdrop-filter: blur(40px) saturate(180%) brightness(1.08);
          border: 0.8px solid rgba(255,255,255,0.22);
          border-top-color: rgba(255,255,255,0.42);
          border-left-color: rgba(255,255,255,0.28);
          box-shadow:
            inset 0 1px 0.8px rgba(255,255,255,0.60),
            inset 0 -0.5px 0.5px rgba(255,255,255,0.12),
            inset 1px 0 0.5px rgba(255,255,255,0.18),
            0 12px 32px rgba(0,0,0,0.22),
            0 4px 12px rgba(0,0,0,0.14),
            0 0 0 0.5px rgba(255,255,255,0.08);
          position:relative;
          overflow:hidden;
        }
        .liquid-glass::before{
          content:''; position:absolute; top:0; left:0; right:0; height:45%;
          background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%);
          pointer-events:none; border-radius:inherit;
        }
        .liquid-glass:hover{
          background: linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.05) 100%);
          border-top-color: rgba(255,255,255,0.55);
          transform: translateY(-2px);
          box-shadow:
            inset 0 1.5px 1px rgba(255,255,255,0.70),
            0 20px 48px rgba(0,0,0,0.30),
            0 8px 20px rgba(0,0,0,0.20);
        }
        .liquid-glass:active{ transform: translateY(0px) scale(0.98); }
        .liquid-glass-pill{
          background: linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.07) 100%);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.20);
          border-top-color: rgba(255,255,255,0.38);
          box-shadow: inset 0 1px 0.5px rgba(255,255,255,0.50), 0 4px 16px rgba(0,0,0,0.18);
        }
        .liquid-glass-card{
          background: linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%);
          backdrop-filter: blur(36px) saturate(170%) brightness(1.06);
          -webkit-backdrop-filter: blur(36px) saturate(170%) brightness(1.06);
          border: 1px solid rgba(255,255,255,0.16);
          border-top-color: rgba(255,255,255,0.30);
          box-shadow: inset 0 1px 0.8px rgba(255,255,255,0.42), 0 16px 48px rgba(0,0,0,0.28);
        }
        .liquid-nav{
          background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%);
          backdrop-filter: blur(48px) saturate(190%) brightness(1.06);
          -webkit-backdrop-filter: blur(48px) saturate(190%) brightness(1.06);
          border: 1px solid rgba(255,255,255,0.20);
          border-top-color: rgba(255,255,255,0.38);
          box-shadow: inset 0 1.2px 0.8px rgba(255,255,255,0.50), 0 20px 60px rgba(0,0,0,0.35);
        }
        .liquid-nav-btn{
          width: 48px; height: 48px; border-radius: 16px;
          display:flex; align-items:center; justify-content:center;
          background: linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%);
          backdrop-filter: blur(20px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.14);
          border-top-color: rgba(255,255,255,0.26);
          box-shadow: inset 0 1px 0.5px rgba(255,255,255,0.36), 0 2px 8px rgba(0,0,0,0.12);
          color: rgba(255,255,255,0.60);
          transition: all 0.35s cubic-bezier(0.2,0.8,0.2,1);
          position:relative;
          overflow:hidden;
        }
        .liquid-nav-btn::before{
          content:''; position:absolute; top:0; left:0; right:0; height:50%;
          background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%);
          opacity:0; transition: opacity 0.3s;
        }
        .liquid-nav-btn:hover::before{ opacity:1; }
        .liquid-nav-btn:hover{
          background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%);
          color: white; transform: translateY(-2px) scale(1.04);
          box-shadow: inset 0 1px 0.8px rgba(255,255,255,0.55), 0 8px 24px rgba(0,0,0,0.22);
        }
        .liquid-nav-btn.active{
          background: linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.80) 100%);
          color: black; border-color: rgba(255,255,255,0.90);
          box-shadow: inset 0 1px 0.8px rgba(255,255,255,1), 0 8px 24px rgba(255,255,255,0.28);
          transform: translateY(-1px);
        }
        .liquid-nav-btn.pro.active{
          background: linear-gradient(180deg, #E8FF86 0%, #d4ee6a 100%);
          color: black; border-color: #E8FF86;
          box-shadow: 0 8px 24px rgba(232,255,134,0.35), inset 0 1px 0.8px rgba(255,255,255,0.8);
        }
        .liquid-input{
          background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
          backdrop-filter: blur(16px) saturate(150%);
          border: 1px solid rgba(255,255,255,0.14);
          border-top-color: rgba(255,255,255,0.22);
          box-shadow: inset 0 1px 0.5px rgba(255,255,255,0.22);
        }
        .liquid-input:focus{ background: linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%); border-color: rgba(255,255,255,0.32); outline:none; box-shadow: inset 0 1px 0.8px rgba(255,255,255,0.35), 0 0 0 3px rgba(255,255,255,0.10); }

        /* Floating animation for sections */
        .float-section{ animation: floatGlass 6s ease-in-out infinite; }
        @keyframes floatGlass { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-4px)} }

        /* PRESERVED 6 GLASS THEMES - WITH FLOATING */
        .glass-container{ display:flex; gap:20px; overflow-x:auto; padding:28px 20px 40px; scroll-snap-type:x mandatory; scrollbar-width:none; }
        .glass-container::-webkit-scrollbar{display:none}
        .glass{
          min-width:260px; height:240px; position:relative; flex-shrink:0;
          background: linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 100%);
          backdrop-filter: blur(32px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.22);
          border-top-color: rgba(255,255,255,0.40);
          border-radius:24px;
          transform: rotate(calc(var(--r) * 1deg));
          transition: all 0.5s cubic-bezier(0.34,1.56,0.64,1);
          cursor:pointer;
          box-shadow: inset 0 1px 0.8px rgba(255,255,255,0.55), 0 12px 32px rgba(0,0,0,0.20);
          animation: floatGlass 5s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.2s);
        }
        .glass:hover{ transform: rotate(0deg) translateY(-10px) scale(1.04); z-index:10; box-shadow: inset 0 1.5px 1px rgba(255,255,255,0.70), 0 20px 48px rgba(0,0,0,0.30); }
        .glass.selected{ transform: rotate(0deg) translateY(-6px) scale(1.05); border-color:white; box-shadow: inset 0 1px 1px rgba(255,255,255,0.8), 0 16px 40px rgba(0,0,0,0.35), 0 0 0 1px white; }
        .glass-preview-wrap{padding:12px; height:100%; display:flex; flex-direction:column; gap:10px}
        .glass-preview-header{height:36px; border-radius:12px; display:flex; align-items:center; justify-content:space-between; padding:0 12px; font-size:10px; font-weight:700; letter-spacing:0.05em}
        .glass-preview-body{display:flex; flex-direction:column; gap:8px; flex:1}
        .glass-lock-overlay{position:absolute; inset:0; background:rgba(248,247,245,0.92); backdrop-filter:blur(16px); border-radius:24px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding:16px}
        .adv-grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:16px}
        .adv-card{position:relative; height:210px; background: linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%); backdrop-filter:blur(28px) saturate(160%); border:1px solid rgba(255,255,255,0.16); border-top-color: rgba(255,255,255,0.28); border-radius:22px; padding:16px; text-align:left; transition:all 0.4s cubic-bezier(0.2,0.8,0.2,1); overflow:hidden; box-shadow: inset 0 1px 0.6px rgba(255,255,255,0.35), 0 8px 24px rgba(0,0,0,0.14);}
        .adv-card:hover{border-color:rgba(255,255,255,0.26); transform:translateY(-4px) scale(1.02); background: linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%); box-shadow: inset 0 1px 0.8px rgba(255,255,255,0.45), 0 16px 36px rgba(0,0,0,0.22);}
        .adv-card.selected{border-color:rgba(255,255,255,0.85); background:rgba(255,255,255,0.14); box-shadow:0 0 0 1px rgba(255,255,255,0.5), inset 0 1px 0.8px rgba(255,255,255,0.6)}
        .adv-card-lock-overlay{position:absolute; inset:0; background:rgba(10,10,12,0.78); backdrop-filter:blur(18px); display:flex; flex-direction:column; align-items:center; justify-content:center; border-radius:22px; padding:12px}
        .radio-container{position:relative; display:flex; flex-direction:column; gap:12px;}
        .radio-container input{display:none}
        .radio-container label{position:relative; background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%); border:1px solid rgba(255,255,255,0.14); border-top-color: rgba(255,255,255,0.22); border-radius:18px; padding:16px 18px; cursor:pointer; transition:all 0.3s cubic-bezier(0.2,0.8,0.2,1); backdrop-filter:blur(18px); box-shadow: inset 0 1px 0.5px rgba(255,255,255,0.22);}
        .radio-container label:hover{ transform: translateY(-2px); background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%); border-color: rgba(255,255,255,0.22); box-shadow: inset 0 1px 0.8px rgba(255,255,255,0.35), 0 8px 24px rgba(0,0,0,0.18); }
        .radio-container input:checked + label{background:rgba(255,255,255,0.14); border-color:white; box-shadow:0 0 0 1px white, inset 0 1px 0.8px rgba(255,255,255,0.6), 0 8px 24px rgba(0,0,0,0.18); transform: translateY(-2px) scale(1.01); }
        .glider-container{position:relative}
      `}</style>

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden md:flex w-[96px] shrink-0 pl-4 py-4">
          <div className="liquid-nav rounded-[28px] p-3 flex flex-col items-center gap-3 sticky top-4 h-[calc(100vh-32px)] float-section">
            <div className="w-10 h-10 rounded-[14px] liquid-glass flex items-center justify-center font-black text-[14px] text-white">D</div>
            <div className="w-full h-[1px] bg-white/10" />
            {navItems.map((item:any)=>(
              <button key={item.id} onClick={()=>setActiveTab(item.id)} className={`liquid-nav-btn group ${activeTab===item.id?'active':''} ${item.pro?'pro':''}`} title={item.label}>
                {item.icon}
                {item.count!==undefined && <span className={`absolute -top-1 -right-1 text-[9px] font-bold px-1 h-4 rounded-full flex items-center ${activeTab===item.id?'bg-black text-white':'bg-[#E8FF86] text-black'}`}>{item.count}</span>}
                <span className="absolute left-[60px] hidden group-hover:block liquid-glass-pill text-black text-[11px] px-3 py-1 rounded-full whitespace-nowrap shadow-xl">{item.label}</span>
              </button>
            ))}
            <div className="w-full h-[1px] bg-white/10 my-1 mt-auto" />
            <button onClick={handleLogout} className="liquid-nav-btn !bg-red-500/10 !border-red-500/20 !text-red-300" title="Logout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
            <div className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center text-[12px] font-bold">A</div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-20 px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="md:hidden w-8 h-8 rounded-[12px] liquid-glass flex items-center justify-center font-bold">D</div>
              <div className="leading-tight">
                <div className="font-semibold text-[14px] tracking-tight">DukaanWhats.pk</div>
                <div className="text-[10px] text-white/40 tracking-wide">FLOATING LIQUID OS • {theme}</div>
              </div>
              <div className="hidden md:flex ml-4"><CurrentPlanButton /></div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={slug ? `/s/${slug}` : '#'} target="_blank" className="h-9 px-5 bg-white text-black rounded-full text-[12px] font-bold hover:bg-white/90 transition-all hover:scale-[1.03] active:scale-[0.97]">View Store ↗</Link>
            </div>
          </header>

          <main className="px-4 md:px-8 pb-28 md:pb-8 space-y-6 max-w-[1200px]">
            {activeTab==='themes' && (
              <div className="liquid-glass-card rounded-[32px] p-6 md:p-8 float-section">
                <div className="flex flex-wrap justify-between gap-3">
                  <h2 className="text-[15px] font-bold">Themes <span className="font-normal text-white/40 text-[13px]">— {currentPlanDef.name} • {productLimit===999999?'∞':productLimit} products</span></h2>
                  <CurrentPlanButton />
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {(['all','clothing','shoes','beauty','tech','food','advanced'] as any[]).map(cat=>(
                    <button key={cat} onClick={()=>setFilter(cat)} className={`h-8 px-4 rounded-full text-[11px] font-bold tracking-widest capitalize transition-all ${filter===cat?'bg-white text-black shadow-[0_4px_16px_rgba(255,255,255,0.25)] scale-[1.05]':'liquid-glass text-white/60 hover:text-white hover:scale-[1.03]'}`}>{cat}</button>
                  ))}
                </div>

                <div className="mt-8 mb-3 flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-widest bg-white text-black px-3 py-1.5 rounded-full">8 ADVANCED THEMES</span>
                  <span className="text-[11px] text-white/40">{currentPlanId==='basic'?`${basicAllowedAdvancedIds.length}/8 unlocked`:'8/8 unlocked'}</span>
                </div>
                <div className="adv-grid">
                  {filteredAdvanced.map((t:any) => { const isActive = theme===t.id; const locked = isThemeLocked(t); return (
                    <button key={t.id} onClick={()=>{ const tmp=t; if (isThemeLocked(tmp)) { if (isPremiumTheme(tmp)) { alert(`🔒 Premium Glass Locked\nBasic: 0/3 Premium\nAdvanced: 0/3 Premium\nNeed Premium — Till ${TILL_ID} Rs. 2999/mo`); setActiveTab('payments'); return } alert(`🔒 Advanced Theme Locked\nBasic allows 3/8 Advanced\nThis theme needs Advanced — Till ${TILL_ID} Rs. 899/mo`); setActiveTab('payments'); return } setTheme(t.id) }} className={`adv-card group ${isActive?'selected':''}`}>
                      {isActive && <span className="absolute top-3 right-3 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-[11px] font-bold shadow-lg">✓</span>}
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-9 h-9 rounded-[10px] liquid-glass flex items-center justify-center text-white text-[13px] group-hover:scale-110 transition-transform">{t.name?.[0]}</div>
                        <div className="min-w-0 flex-1"><div className="text-[13px] font-bold truncate text-white">{t.name}</div><div className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">ADVANCED • {t.category}</div></div>
                      </div>
                      <div className="mt-4 w-full h-[84px] rounded-[12px] bg-white/[0.05] border border-white/10 p-2 flex gap-2">
                        <div className="w-8 h-full rounded-[8px] transition-all group-hover:scale-105" style={{background:t.colors?.accent || '#fff'}} />
                        <div className="flex-1 flex flex-col gap-1.5"><div className="h-2 w-3/4 bg-white/15 rounded-full" /><div className="h-2 w-1/2 bg-white/10 rounded-full" /><div className="mt-auto h-5 w-full bg-white/10 border border-white/10 rounded-[8px]" /></div>
                      </div>
                      {locked && <div className="adv-card-lock-overlay"><GlassLockIcon size={40} /><div className="text-[10px] font-black tracking-widest mt-1 text-white">LOCKED</div><div className="text-[10px] text-white/50 text-center">Need Advanced</div><div className="mt-2 bg-white text-black text-[10px] px-3 h-7 rounded-full font-bold flex items-center hover:scale-105 transition-transform">UPGRADE Rs. 899</div></div>}
                      {!locked && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#E8FF86] text-black text-[9px] px-2.5 h-5 rounded-full font-bold flex items-center shadow-lg">UNLOCKED ✓</div>}
                    </button>
                  )})}
                </div>

                <div className="mt-10 mb-3 flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-widest bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-white">STANDARD • {filteredStandard.length}</span>
                  <span className="text-[11px] text-white/30">All plans</span>
                </div>
                <div className="adv-grid">
                  {filteredStandard.slice(0,6).map((t:any) => { const isActive = theme===t.id; return (
                    <button key={t.id} onClick={()=>setTheme(t.id)} className={`adv-card !h-[180px] group ${isActive?'selected':''}`}>
                      {isActive && <span className="absolute top-3 right-3 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-[11px] font-bold">✓</span>}
                      <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-[10px] liquid-glass flex items-center justify-center text-white group-hover:scale-110 transition-transform">{t.name?.[0]}</div><div><div className="text-[13px] font-bold text-white">{t.name}</div><div className="text-[9px] text-white/40 uppercase">{t.category}</div></div></div>
                      <div className="mt-4 w-full h-[56px] rounded-[12px] bg-white/[0.05] border border-white/10 group-hover:bg-white/[0.08] transition-colors" />
                    </button>
                  )})}
                </div>

                <div className="mt-10 rounded-[28px] border border-white/10 overflow-hidden liquid-glass-card">
                  <div className="p-5 md:p-6 border-b border-white/10 bg-white/[0.03] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3"><span className="bg-white text-black text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest animate-pulse">6 GLASS THEMES</span><span className="font-bold text-[13px] text-white">Glass Collection — Premium Only</span></div>
                    <span className="liquid-glass-pill text-[11px] px-3 py-1.5 rounded-full text-white/60">{currentPlanId==='premium'?'All Premium Unlocked ✓':`Locked • Need Premium Rs. 2999/mo`}</span>
                  </div>
                  <div className="bg-black/20 relative">
                    <div className="absolute top-3 right-5 hidden md:flex items-center gap-2 text-[10px] font-mono text-white/30"><span>← Scroll to see all {premiumThemes.length} Glass →</span></div>
                    <div className="glass-container">
                      {premiumThemes.map((t,i)=>{
                        const isActive=theme===t.id;
                        const locked=isThemeLocked(t);
                        const r = isActive ? 0 : ([-12, 9, -10, 11, -8, 13][i % 6]); 
                        return (
                          <div key={t.id} className={`glass ${isActive?'selected':''}`} data-text={t.name} style={{'--r':r, '--i':i, scrollSnapAlign:'start'} as any} onClick={()=>{ if (isThemeLocked(t)) { alert(`🔒 Premium Glass Locked\nNeed Premium — Till ${TILL_ID} Rs. 2999/mo`); setActiveTab('payments'); return } setTheme(t.id) }}>
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
                            {isActive && <div className="absolute top-4 right-4 w-7 h-7 bg-white text-black rounded-full flex items-center justify-center text-[12px] font-bold shadow-lg animate-pulse">✓</div>}
                            {locked && (
                              <div className="glass-lock-overlay">
                                <GlassPremiumLock size={56} />
                                <div className="text-black text-[12px] font-black tracking-widest mt-1">PREMIUM LOCKED</div>
                                <div className="text-zinc-500 text-[10px] text-center leading-[1.4] font-medium">Basic: 0/3 • Advanced: 0/3<br/>Need Premium Rs. 2999/mo</div>
                                <div className="mt-2 bg-black text-white text-[10px] font-bold px-4 h-8 rounded-full flex items-center shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:scale-105 transition-transform">UPGRADE → PREMIUM</div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-8 flex-wrap gap-3">
                  <span className="text-[11px] text-white/30">Products {products.length}/{productLimit===999999?'∞':productLimit} • Images {imageLimit===999999?'∞':imageLimit}/product • {justSubmitted?'Just submitted ✓':''}</span>
                  <div className="flex gap-2 items-center">
                    {saved && <span className="h-10 px-4 flex items-center text-[12px] text-black font-bold bg-[#E8FF86] rounded-full animate-pulse">✓ Saved! {getTheme(theme).name}</span>}
                    <button onClick={saveStore} className="h-10 px-6 bg-white text-black text-[13px] font-bold rounded-full hover:bg-white/90 transition-all hover:scale-[1.03] active:scale-[0.97] shadow-[0_8px_24px_rgba(255,255,255,0.20)]">{saving?'Saving...':'Save Store & Theme'}</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab==='store' && (
              <div className="liquid-glass-card rounded-[32px] p-6 md:p-8 float-section">
                <div className="flex items-center justify-between flex-wrap gap-3"><h2 className="font-black text-[15px]">Store Identity</h2>{saved && <span className="bg-[#E8FF86] text-black px-3 h-7 rounded-full text-[11px] font-bold flex items-center animate-pulse">Saved ✓</span>}</div>
                <div className="mt-5 liquid-glass rounded-[16px] p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-[12px] ${isPremium?'bg-[#E8FF86] text-black':isAdvanced?'bg-white text-black':'bg-white/10 border border-white/10 text-white'}`}>{currentPlanDef.name[0]}</div>
                  <div><div className="text-[13px] font-bold text-white">{currentPlanDef.name} • {productLimit===999999?'∞':productLimit} products • {imageLimit===999999?'∞':imageLimit} images</div><div className="text-[11px] text-white/40">{currentPlanDef.features.join(' • ')}</div></div>
                </div>
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-black tracking-widest uppercase text-white/40">Business Name</label><input value={businessName} onChange={e=>setBusinessName(e.target.value)} className="mt-2 w-full h-11 px-4 rounded-[14px] liquid-input text-[13px] text-white" /></div>
                  <div><label className="text-[10px] font-black tracking-widest uppercase text-white/40">WhatsApp Number</label><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="923001234567" className="mt-2 w-full h-11 px-4 rounded-[14px] liquid-input text-[13px] text-white" /></div>
                  <div className="md:col-span-2"><label className="text-[10px] font-black tracking-widest uppercase text-white/40">Store Slug</label><input value={slug} onChange={e=>setSlug(e.target.value)} className="mt-2 w-full h-11 px-4 rounded-[14px] liquid-input text-[13px] text-white" /><div className="mt-2 text-[11px] text-white/30">Your store: /s/{slug || 'your-slug'}</div></div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3 items-center">
                  <button onClick={saveStore} disabled={saving} className="h-11 px-7 bg-white text-black rounded-full text-[13px] font-bold hover:bg-white/90 transition-all hover:scale-[1.03] active:scale-[0.97]">{saving?'Saving...':saved?'Saved ✓':'Save Store'}</button>
                  <button onClick={copyLink} className="h-11 px-6 liquid-glass rounded-full text-[13px] font-medium text-white hover:scale-[1.03] transition-transform">{copied?'Copied!':'Copy Link'}</button>
                </div>
                {profile && (
                  <div className="mt-8">
                    <h3 className="font-bold text-[13px] text-white">Premium Editor</h3>
                    <div className="mt-3 liquid-glass rounded-[16px] p-2">
                      <PremiumThemeEditor profile={{...profile, premium_custom: premiumCustom} as any} onSave={(d:any)=>{ setPremiumCustom(d); setProfile({...profile, premium_custom: d} as any) }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab==='products' && (
              <div className="space-y-4">
                <div className="liquid-glass-card rounded-[32px] p-6 md:p-8 float-section">
                  <div className="flex items-center justify-between"><h2 className="font-bold text-[14px] text-white">Add Product — {editingId?'Editing':'New'} • {currentPlanId.toUpperCase()} {imageLimit===999999?'∞':imageLimit} images • {prodCategory} • Stock {prodStock}</h2><div className="text-[11px] text-white/40">{products.length}/{productLimit===999999?'∞':productLimit}</div></div>
                  <label className="mt-6 group liquid-glass rounded-[20px] border-dashed border-white/20 p-8 flex flex-col items-center justify-center cursor-pointer hover:border-white/30 transition-all hover:scale-[1.01] min-h-[160px]">
                    <div className="relative z-10 flex flex-col items-center">
                    {previews.length ? (
                      <div className="grid grid-cols-5 gap-2.5 w-full">
                        {previews.map((src,i)=>(
                          <div key={i} className="relative group/img">
                            <img src={src} className="w-full h-[72px] object-cover rounded-[12px] border border-white/20 group-hover/img:scale-105 transition-transform" />
                            <button type="button" onClick={(e)=>{e.preventDefault(); const nf=files.filter((_,idx)=>idx!==i); const np=previews.filter((_,idx)=>idx!==i); setFiles(nf); setPreviews(np);}} className="absolute -top-2 -right-2 w-5 h-5 bg-white text-black rounded-full text-[10px] hover:scale-110 transition-transform">✕</button>
                          </div>
                        ))}
                        <div className="h-[72px] rounded-[12px] border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center gap-1 hover:border-white/30 hover:bg-white/10 transition-all">
                          <span className="text-[16px] text-white">+</span><span className="text-[9px] font-bold tracking-widest text-white/60">ADD</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <UploadIcon />
                        <div className="mt-4 text-center">
                          <div className="font-bold text-[14px] text-white">Drop images or click to upload</div>
                          <div className="mt-2 text-[11px] text-white/40">Your plan <b className="text-white">{currentPlanId.toUpperCase()}</b> allows <b className="text-white">{imageLimit===999999?'Unlimited':imageLimit}</b> images • {prodSizes?`Sizes ${prodSizes}`:''} {prodColors?`• Colors ${prodColors}`:''}</div>
                        </div>
                      </>
                    )}
                    </div>
                    <input type="file" accept="image/*" multiple onChange={e=>{
                      const selected = Array.from(e.target.files || []); if (!selected.length) return;
                      if (selected.length > imageLimit && imageLimit !== 999999) { setErrorMsg(`❌ ${currentPlanId.toUpperCase()} allows ${imageLimit} images per product. You selected ${selected.length}. Upgrade: Till ${TILL_ID}`); setTimeout(()=>setErrorMsg(null),4000); return }
                      const newFiles = editingId ? [...files, ...selected].slice(0, imageLimit === 999999 ? 20 : imageLimit) : selected;
                      setFiles(newFiles);
                      const pr: string[] = [];
                      const existingPreviews = editingId ? previews : [];
                      newFiles.forEach(file => { const r = new FileReader(); r.onload = ev => { pr.push(ev.target?.result as string); if (pr.length === newFiles.length) { setPreviews(editingId ? [...existingPreviews, ...pr].slice(0, newFiles.length) : pr) } }; r.readAsDataURL(file) });
                      if (newFiles.length === 0) setPreviews([]);
                    }} className="hidden" />
                  </label>
                  <div className="mt-6 grid md:grid-cols-2 gap-3">
                    <input placeholder="Product name *" value={prodName} onChange={e=>setProdName(e.target.value)} className="w-full h-11 px-4 rounded-[14px] liquid-input text-[13px] text-white" />
                    <input placeholder="Price Rs. 3500 *" type="number" value={prodPrice} onChange={e=>setProdPrice(e.target.value)} className="w-full h-11 px-4 rounded-[14px] liquid-input text-[13px] text-white" />
                    <input placeholder="Compare price (optional)" type="number" value={prodOrigPrice} onChange={e=>setProdOrigPrice(e.target.value)} className="w-full h-11 px-4 rounded-[14px] liquid-input text-[13px] text-white" />
                    <select value={prodCategory} onChange={e=>setProdCategory(e.target.value)} className="w-full h-11 px-4 rounded-[14px] liquid-input text-[13px] text-white">
                      <option className="bg-[#0A1F14]">General</option><option className="bg-[#0A1F14]">Clothing</option><option className="bg-[#0A1F14]">Shoes</option><option className="bg-[#0A1F14]">Bags</option><option className="bg-[#0A1F14]">Beauty</option><option className="bg-[#0A1F14]">Electronics</option><option className="bg-[#0A1F14]">Food</option><option className="bg-[#0A1F14]">Other</option>
                    </select>
                    <input placeholder="Stock qty" type="number" value={prodStock} onChange={e=>setProdStock(e.target.value)} className="w-full h-11 px-4 rounded-[14px] liquid-input text-[13px] text-white" />
                    <input placeholder="Sizes (S, M, L, XL)" value={prodSizes} onChange={e=>setProdSizes(e.target.value)} className="w-full h-11 px-4 rounded-[14px] liquid-input text-[13px] text-white" />
                    <input placeholder="Colors (comma)" value={prodColors} onChange={e=>setProdColors(e.target.value)} className="md:col-span-2 w-full h-11 px-4 rounded-[14px] liquid-input text-[13px] text-white" />
                    <textarea placeholder="Description..." value={prodDesc} onChange={e=>setProdDesc(e.target.value)} className="md:col-span-2 w-full min-h-[80px] p-4 rounded-[14px] liquid-input text-[13px] text-white resize-none" />
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    {editingId && <button onClick={()=>{ setEditingId(null); setProdName(''); setProdPrice(''); setProdDesc(''); setProdCategory('General'); setProdStock('100'); setProdSizes(''); setProdColors(''); setProdOrigPrice(''); setPreviews([]); setFiles([])}} className="h-11 px-6 liquid-glass rounded-full text-[13px] font-medium text-white">Cancel</button>}
                    <button onClick={async ()=>{
                      if (!prodName.trim() || !prodPrice) { setErrorMsg('Name and price required'); return }
                      if (!profile) return
                      if (!editingId && products.length >= productLimit) { setErrorMsg(`❌ ${currentPlanId.toUpperCase()} allows ${productLimit} products. Upgrade: Till ${TILL_ID}`); setActiveTab('payments'); return }
                      setUploading(true)
                      try {
                        let imageUrls: string[] = []
                        if (files.length>0) { for (const f of files) { const ext = f.name.split('.').pop(); const fileName = `${profile.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`; const { error } = await supabase.storage.from('product-images').upload(fileName, f); if (error) throw error; const { data } = supabase.storage.from('product-images').getPublicUrl(fileName); imageUrls.push(data.publicUrl) } } else if (previews.length>0 && editingId) { imageUrls = previews }
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
                        setEditingId(null); setProdName(''); setProdPrice(''); setProdDesc(''); setProdCategory('General'); setProdStock('100'); setProdSizes(''); setProdColors(''); setProdOrigPrice(''); setPreviews([]); setFiles([])
                      } catch (e:any){ setErrorMsg(e.message) } setUploading(false)
                    }} disabled={uploading || (!editingId && products.length>=productLimit)} className="h-11 px-7 bg-white text-black text-[13px] font-bold rounded-full disabled:opacity-40 hover:bg-white/90 transition-all hover:scale-[1.03] active:scale-[0.97] shadow-[0_8px_24px_rgba(255,255,255,0.20)]">{uploading?'Uploading...':!editingId && products.length>=productLimit?`Limit ${productLimit} — Upgrade`:`${editingId?'Update':'Add'} Product →`}</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {products.length===0 ? (
                    <div className="col-span-2 md:col-span-4 liquid-glass rounded-[24px] p-12 flex flex-col items-center justify-center text-center float-section"><UploadIcon className="w-12 h-12" /><div className="mt-4 font-bold text-[14px] text-white">No products yet</div><div className="text-[11px] text-white/40 mt-1">Add your first product — {productLimit===999999?'∞':productLimit} allowed</div></div>
                  ) : products.map(p => {
                    const images = (() => { if (p.image_urls && Array.isArray(p.image_urls) && p.image_urls.length>0) return p.image_urls; if (typeof p.image_urls==='string'){try{const pa=JSON.parse(p.image_urls); if(Array.isArray(pa)) return pa}catch{} return [p.image_urls]} if(p.image_url) return [p.image_url]; return [] })()
                    return (
                      <div key={p.id} className="group liquid-glass rounded-[22px] p-3 hover:scale-[1.02] transition-all duration-400 float-section" style={{'--i':0} as any}>
                        <div className="relative overflow-hidden rounded-[16px] h-48 bg-white/[0.04]">
                          <img src={images[0]} className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700" alt={p.name} />
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">{images.map((_:any,i:number)=><div key={i} className={`h-1 rounded-full transition-all ${i===0?'w-4 bg-white':'w-1.5 bg-white/40'}`} />)}</div>
                        </div>
                        <div className="mt-3 px-1"><div className="font-bold text-[13px] truncate text-white">{p.name}</div><div className="flex items-center justify-between mt-1"><span className="font-black text-[14px] text-white">Rs. {p.price.toLocaleString()}</span><span className="text-[11px] text-white/40">{images.length} img • {(p as any).category || 'General'}</span></div><div className="mt-3 flex gap-2"><button onClick={()=>{ setEditingId(p.id); setProdName(p.name); setProdPrice(String(p.price)); setProdDesc((p as any).description || ''); setProdCategory((p as any).category || 'General'); setProdStock(String((p as any).stock || 100)); setProdSizes(Array.isArray((p as any).sizes) ? (p as any).sizes.join(', ') : (p as any).sizes || ''); setProdColors(Array.isArray((p as any).colors) ? (p as any).colors.join(', ') : (p as any).colors || ''); setProdOrigPrice((p as any).original_price ? String((p as any).original_price) : ''); setPreviews(p.image_urls && p.image_urls.length ? p.image_urls : [p.image_url]); setFiles([]); setActiveTab('products'); }} className="flex-1 h-8 bg-white text-black rounded-full text-[11px] font-bold hover:scale-[1.05] transition-transform">Edit</button><button onClick={async ()=>{ if (!confirm('Delete product?')) return; const { error } = await supabase.from('products').delete().eq('id', p.id); if (!error) setProducts(products.filter(x=>x.id!==p.id)) }} className="h-8 w-8 liquid-glass rounded-full flex items-center justify-center text-[12px] text-white hover:scale-110 transition-transform">✕</button></div></div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeTab==='analytics' && (
              <div className="float-section">
                {!profile ? <div className="p-8 text-center text-white/50 liquid-glass rounded-[24px]">Loading...</div> : currentPlanId === 'premium' ? (
                  <div className="liquid-glass-card rounded-[32px] p-2"><RealAnalytics userId={profile!.id} currentPlanId={currentPlanId} /></div>
                ) : (
                  <div className="liquid-glass-card rounded-[32px] p-12 text-center">
                    <div className="w-16 h-16 liquid-glass rounded-[18px] flex items-center justify-center mx-auto text-white text-[24px]">◐</div>
                    <h3 className="font-black text-[18px] mt-4 text-white">Analytics Locked — Premium Only</h3>
                    <p className="text-[12px] text-white/40 mt-2">Your {currentPlanId.toUpperCase()} plan: {currentPlanDef.features.join(' • ')} — Upgrade to Premium for live analytics.</p>
                    <button onClick={()=>setActiveTab('payments')} className="mt-6 h-11 px-8 bg-white text-black rounded-full text-[13px] font-bold hover:scale-[1.05] transition-transform shadow-[0_8px_24px_rgba(255,255,255,0.20)]">Upgrade → Premium Till {TILL_ID}</button>
                  </div>
                )}
              </div>
            )}

            {activeTab==='payments' && (
              <div className="liquid-glass-card rounded-[32px] p-6 md:p-8 float-section">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h2 className="font-black text-[16px] text-white">Pro Plans — Till {TILL_ID}</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>setBilling('monthly')} className={`h-9 px-5 rounded-full text-[11px] font-black border transition-all ${billing==='monthly'?'bg-white text-black border-white shadow-[0_4px_16px_rgba(255,255,255,0.25)] scale-[1.05]':'liquid-glass text-white/60 border-white/10 hover:text-white'}`}>Monthly</button>
                    <button onClick={()=>setBilling('yearly')} className={`h-9 px-5 rounded-full text-[11px] font-black border transition-all ${billing==='yearly'?'bg-white text-black border-white shadow-[0_4px_16px_rgba(255,255,255,0.25)] scale-[1.05]':'liquid-glass text-white/60 border-white/10 hover:text-white'}`}>Yearly Save 22%</button>
                  </div>
                </div>
                <div className="mt-6 grid md:grid-cols-3 gap-4">
                  <div className="liquid-glass rounded-[22px] p-5">
                    <div className="text-[10px] tracking-widest text-white/40 font-black">JAZZCASH TILL ID</div>
                    <div className="mt-3 flex items-center gap-2"><span className="font-mono text-[22px] font-black tracking-widest text-white">{TILL_ID}</span><button onClick={copyTill} className="h-7 px-3 rounded-full liquid-glass text-[10px] text-white hover:scale-105 transition-transform">{copiedTill?'Copied!':'Copy'}</button></div>
                    <div className="mt-3 bg-white rounded-[14px] p-3"><img src={`https://barcodeapi.org/api/code128/${TILL_ID}`} alt="Barcode" className="w-full h-[48px] object-contain"/><div className="text-center text-[11px] font-mono text-black font-black tracking-[0.3em] mt-1">{TILL_ID}</div></div>
                    <div className="mt-3 bg-white rounded-[14px] p-3 flex justify-center"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=JAZZCASH_TILL_${TILL_ID}`} alt="QR" className="w-[120px] h-[120px]"/></div>
                    {myPayments.length>0 && <div className="mt-4 liquid-glass rounded-[14px] p-3"><div className="text-[10px] font-black text-white/60">MY PAYMENTS</div>{myPayments.slice(0,3).map((pay:any)=><div key={pay.id} className="mt-2 text-[11px] flex justify-between"><span className="text-white/80">{pay.plan_id} • Rs.{pay.amount}</span><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${pay.status==='approved'?'bg-[#E8FF86] text-black':pay.status==='pending'?'bg-yellow-400 text-black':'bg-red-400 text-black'}`}>{pay.status}</span></div>)}</div>}
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
                                <div className="min-w-0 flex-1"><div className="flex items-center gap-2 flex-wrap"><span className="font-black text-[14px] text-white">{p.name}</span>{isCurrent && <span className="bg-white text-black text-[8px] px-2 h-5 rounded-full font-bold flex items-center">CURRENT</span>}<span className={`text-[10px] px-2.5 h-6 rounded-full font-bold flex items-center ${p.id==='premium'?'bg-[#E8FF86] text-black':p.id==='advanced'?'bg-white text-black':'bg-white/10 text-white border border-white/10'}`}>Rs. {displayPrice}/mo</span>{p.id==='advanced' && <span className="bg-[#E8FF86] text-black text-[8px] px-2 h-5 rounded-full font-bold">POPULAR</span>}</div><div className="text-[11px] mt-1.5 opacity-60 leading-[1.3] text-white/60">{p.features.join(' • ')}</div></div><div className="text-right shrink-0"><div className="font-black text-[16px] text-white">Rs. {displayPrice}</div><div className="text-[10px] opacity-60 text-white/40">{billing==='yearly'?`Billed Rs. ${p.yearlyTotal}/yr`:p.id!=='basic'?`Yearly Rs. ${p.yearlyMonthly}/mo`:''}</div></div>
                              </div>
                            </label>
                          </div>
                        )
                      })}
                      <div className="glider-container"><div className="glider"></div></div>
                    </div>
                    {selectedPlan && selectedPlan.monthly>0 && (
                      <div className="rounded-[22px] liquid-glass p-5">
                        <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-[12px] font-bold">₨</div><div className="text-[13px] font-bold text-white">Pay Rs. {billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal} → Till {TILL_ID} ({billing}) • {justSubmitted?'Submitted ✓':''}</div></div>
                        <input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder={`Txn ID after paying Rs. ${billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal} to Till ${TILL_ID}`} className="mt-4 w-full h-12 px-4 rounded-[14px] liquid-input text-white text-[12px] font-mono"/>
                        <button onClick={handleBuyPlan} disabled={purchasing} className="mt-3 w-full h-12 bg-white text-black rounded-full font-black text-[13px] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_8px_24px_rgba(255,255,255,0.20)]">{purchasing?'Submitting...':`I Paid Rs. ${billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal} — Activate ${selectedPlan.name}`} <span className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[10px]">↗</span></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>

          <div className="md:hidden fixed bottom-4 left-4 right-4 z-30">
            <div className="liquid-nav rounded-[28px] p-2 flex items-center justify-between gap-1">
              {navItems.map((item:any)=>(
                <button key={item.id} onClick={()=>setActiveTab(item.id)} className={`flex-1 h-12 rounded-[18px] flex flex-col items-center justify-center gap-0.5 transition-all ${activeTab===item.id?'bg-white text-black shadow-[0_4px_16px_rgba(255,255,255,0.25)] scale-[1.05]':'text-white/50 hover:text-white'}`}>
                  <span>{item.icon}</span><span className="text-[9px] font-bold">{item.label}</span>
                </button>
              ))}
              <button onClick={handleLogout} className="h-12 w-12 rounded-[18px] bg-red-500/10 text-red-300 flex items-center justify-center">↪</button>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && <div className="fixed bottom-24 md:bottom-4 right-4 z-50 liquid-glass bg-red-500/20 border-red-500/30 text-white px-4 py-2 rounded-full text-[12px] shadow-xl">{errorMsg}</div>}
      {showStatusModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="liquid-glass-card rounded-[32px] w-full max-w-[380px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            {showStatusModal.type === 'approved' ? (
              <div>
                <div className="bg-white/5 text-white p-8 text-center border-b border-white/10">
                  <div className="w-16 h-16 bg-[#E8FF86] rounded-full flex items-center justify-center mx-auto shadow-[0_8px_24px_rgba(232,255,134,0.35)]"><span className="text-[28px] text-black">✓</span></div>
                  <h2 className="font-black text-[22px] mt-4">Payment Approved!</h2>
                  <p className="text-[13px] text-white/60 mt-1">Your store is now {showStatusModal.payment.plan_id.toUpperCase()}</p>
                </div>
                <div className="p-6">
                  <div className="liquid-glass rounded-[14px] p-4">
                    <div className="flex justify-between"><span className="text-[11px] text-white/40">Plan</span><span className="text-[13px] font-black text-white">{showStatusModal.payment.plan_id.toUpperCase()} • Rs. {showStatusModal.payment.amount}</span></div>
                    <div className="flex justify-between mt-2"><span className="text-[11px] text-white/40">Txn ID</span><span className="font-mono text-[12px] liquid-glass px-2 py-1 rounded-[8px] text-white">{showStatusModal.payment.txn_id}</span></div>
                  </div>
                  <button onClick={()=>setShowStatusModal(null)} className="mt-6 w-full h-12 bg-white text-black rounded-full font-black text-[13px] hover:scale-[1.02] active:scale-[0.98] transition-transform">Continue →</button>
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
                  <button onClick={()=>setShowStatusModal(null)} className="mt-6 w-full h-12 bg-white text-black rounded-full font-black text-[13px] hover:scale-[1.02] transition-transform">Try Again →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
