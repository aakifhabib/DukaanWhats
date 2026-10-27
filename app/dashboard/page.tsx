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
    <div className="group bg-white/60 backdrop-blur-xl border border-white/80 rounded-[24px] p-4 hover:border-black/30 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all duration-300"
         onMouseEnter={() => setIsHovering(true)}
         onMouseLeave={() => setIsHovering(false)}>
      <div className="relative overflow-hidden rounded-[16px] h-48 bg-[#F8F7F5]">
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
      <div className="mt-4 px-1">
        <div className="font-bold text-[14px] truncate">{p.name}</div>
        <div className="flex items-center justify-between mt-1">
          <span className="font-black text-[15px]">Rs. {p.price.toLocaleString()}</span>
          <span className="text-[12px] text-zinc-500 font-medium">{images.length} img</span>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={()=>onEdit(p)} className="flex-1 h-9 bg-black text-white rounded-full text-[12px] font-bold hover:bg-zinc-900 transition-colors">Edit</button>
          <button onClick={()=>onDelete(p.id)} className="h-9 w-9 bg-white/80 border border-white/60 rounded-full flex items-center justify-center text-[13px] hover:bg-black hover:text-white transition-all">✕</button>
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
      setTimeout(()=>setErrorMsg(null),4000);
      return 
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
    setEditingId(p.id); 
    setProdName(p.name); 
    setProdPrice(String(p.price)); 
    setProdDesc(p.description || ''); 
    setProdCategory(p.category || 'General'); 
    setProdStock(String(p.stock || 100)); 
    setProdSizes(Array.isArray(p.sizes) ? p.sizes.join(', ') : p.sizes || ''); 
    setProdColors(Array.isArray(p.colors) ? p.colors.join(', ') : p.colors || ''); 
    setProdOrigPrice(p.original_price ? String(p.original_price) : ''); 
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
      for (const f of files){ 
        const url = await uploadOne(f, user.id)
        urls.push(url)
      }
      if (editingId && urls.length === 0) {
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
    <div className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 rounded-full border border-white/80 bg-white/70 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-default select-none">
      <span className={`w-2 h-2 rounded-full animate-pulse ${isPremium?'bg-[#E8FF86] shadow-[0_0_8px_#E8FF86]':isAdvanced?'bg-black':'bg-zinc-400'}`}></span>
      <span className="text-[11px] font-black tracking-widest">{currentPlanDef.name.toUpperCase()}</span>
      <span className="text-[10px] opacity-60 font-mono hidden md:inline">• {productLimit===999999?'∞':productLimit} prod • {imageLimit===999999?'∞':imageLimit} img</span>
      {isPremium && <span className="ml-1 bg-[#E8FF86] text-black text-[8px] px-1.5 py-0.5 rounded-full font-bold hidden md:inline">NO WATERMARK • LIVE</span>}
    </div>
  )

  return (
    <div style={{minHeight:'100vh', background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)'}} className="text-zinc-900 pb-24 antialiased overflow-x-clip max-w-[100vw] relative">
      {/* Background Mesh (Soft pastel) */}
      <div className="fixed inset-0 z-[-1] pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(60% 50% at 10% 10%, rgba(232,255,134,0.12), transparent 60%),
          radial-gradient(55% 45% at 90% 20%, rgba(199,210,254,0.15), transparent 60%),
          radial-gradient(50% 40% at 60% 90%, rgba(251,207,232,0.15), transparent 60%)
        `
      }} />

      <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none} html,body{overflow-x:hidden;max-width:100vw} *{box-sizing:border-box;min-width:0}
        
        /* GLASS THEMES NAVIGATOR (Untouched) */
        .glass-container { position: relative; display: flex; justify-content: flex-start; align-items: center; min-height: 420px; padding: 40px 24px 60px 40px; gap: 0; overflow-x: auto; overflow-y: visible; scroll-snap-type: x proximity; -webkit-overflow-scrolling: touch; } .glass-container::-webkit-scrollbar{height:6px} .glass-container::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.12);border-radius:999px} @media (max-width: 768px){ .glass-container { padding: 20px 16px 40px 16px; min-height: 360px; } }
        .glass-container .glass { position: relative; width: 280px; height: 360px; flex-shrink: 0; background: rgba(255,255,255,0.85); border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 20px 50px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,1) inset; display: flex; justify-content: flex-start; align-items: center; flex-direction: column; transition: all 0.6s cubic-bezier(0.23,1,0.32,1); border-radius: 24px; margin: 0 -40px; backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); transform: rotate(calc(var(--r) * 1deg)) translateY(0); cursor: pointer; overflow: hidden; }
        .glass-container .glass:hover { transform: rotate(0deg) translateY(-14px) scale(1.06); margin: 0 24px; box-shadow: 0 32px 80px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06); border-color: rgba(0,0,0,0.12); z-index: 10; background: #fff; }
        .glass-container .glass::before { content: attr(data-text); position: absolute; bottom: 0; width: 100%; height: 52px; background: #fff; border-top: 1px solid rgba(0,0,0,0.06); display: flex; justify-content: center; align-items: center; color: #0A0A0A; font-size: 12px; font-weight: 700; letter-spacing: -0.01em; }
        .glass-container .glass.selected { background: #0A0A0A; border: 2px solid #0A0A0A; transform: rotate(0deg) translateY(-18px) scale(1.08); margin: 0 26px; z-index: 20; box-shadow: 0 32px 80px rgba(0,0,0,0.22), 0 0 0 4px #E8FF86; }
        .glass-container .glass.selected::before { background: #0A0A0A; color: #fff; border-top: 1px solid rgba(255,255,255,0.1); }
        .glass-container .glass.selected .glass-preview-wrap { border-color: rgba(255,255,255,0.1); }
        .glass-lock-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.82); backdrop-filter: blur(18px) saturate(1.2); -webkit-backdrop-filter: blur(18px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; z-index: 10; border-radius: 24px; border: 1px solid rgba(0,0,0,0.06); }
        .glass-preview-wrap { width: 88%; height: 240px; border-radius: 16px; overflow: hidden; border: 1px solid rgba(0,0,0,0.06); display: flex; flex-direction: column; background: #F8F7F5; margin-top: 18px; transition: all 0.4s; }
        .glass-preview-header { height: 32px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; font-size: 9px; font-weight: 800; letter-spacing: 0.08em; }
        .glass-preview-body { flex:1; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
        
        /* NEW SPACIOUS GLASS UI */
        .pg-panel { background: rgba(255,255,255,0.45); backdrop-filter: blur(32px) saturate(1.2); -webkit-backdrop-filter: blur(32px) saturate(1.2); border: 1px solid rgba(255,255,255,0.7); border-radius: 40px; box-shadow: 0 24px 64px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9); }
        .pg-tile { background: rgba(255,255,255,0.65); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.9); border-radius: 28px; box-shadow: 0 8px 24px rgba(0,0,0,0.03); transition: transform 0.2s, box-shadow 0.2s; }
        .pg-input { background: rgba(255,255,255,0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.9); border-radius: 20px; padding: 0 20px; transition: all 0.2s; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
        .pg-input:focus { background: #fff; border-color: #0A0A0A; outline: none; }
        .pg-tab { height: 40px; padding: 0 20px; border-radius: 999px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; white-space: nowrap; transition: all 0.2s; cursor: pointer; color: #71717a; }
        .pg-tab:hover:not(.active) { background: rgba(255,255,255,0.8); color: #000; }
        .pg-tab.active { background: #fff; color: #000; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        
        .adv-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; } @media (min-width: 768px){ .adv-grid{ grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:20px; } }
        .adv-card { width: 100%; height: 200px; border-radius: 24px; background: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.9); display: flex; flex-direction: column; align-items: flex-start; padding: 16px; cursor: pointer; transition: all 0.25s ease; position: relative; overflow: hidden; text-align: left; box-shadow: 0 4px 16px rgba(0,0,0,0.02); } 
        .adv-card:hover { transform: translateY(-4px); border-color: #0A0A0A; box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
        .adv-card.selected { border: 2px solid #0A0A0A; box-shadow: 0 0 0 3px #E8FF86, 0 12px 32px rgba(0,0,0,0.08); transform: translateY(-4px); background: #fff; }
        .adv-card-lock-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.7); backdrop-filter: blur(12px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; z-index: 5; border-radius: inherit; }
        
        .radio-container{--main-color:#0A0A0A;--total-radio:3;display:flex;flex-direction:column;position:relative;padding-left:1rem}
        .radio-container input{appearance:none;position:absolute;opacity:0} .radio-container .glider-container{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(0deg,transparent 0%,rgba(0,0,0,0.08) 50%,transparent 100%);width:1px}
        .radio-container .glider{position:relative;height:calc(100% / var(--total-radio));width:100%;background:var(--main-color);transition:transform .45s cubic-bezier(0.4,0,0.2,1)}
        .radio-container .glider::before{content:"";position:absolute;height:60%;width:300%;top:50%;transform:translateY(-50%);background:var(--main-color);filter:blur(12px);opacity:0.15}
        .radio-container label{cursor:pointer;padding:16px;border-radius:24px;color:#71717a;transition:all .25s;border:1px solid transparent}
        .radio-container input:checked+label{color:#0A0A0A;background:#fff;border:1px solid rgba(0,0,0,0.05);box-shadow:0 4px 16px rgba(0,0,0,0.04)}
        
        @media (max-width: 768px) { .glass-container .glass { width: 200px; height: 280px; margin: 0 -24px; } .glass-container { min-height: 340px; padding: 20px 0 40px; } }
      `}</style>

      <div className="max-w-[1100px] mx-auto px-2 md:px-6 pt-4 md:pt-8 w-full relative z-10">
        
        {/* Floating Window Container */}
        <div className="pg-panel p-2 md:p-6 min-h-[90vh]">
          
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-2 md:p-4 mb-4">
            <div className="flex items-center gap-3">
              <a href="/" className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold rounded-[14px] text-[16px] shadow-sm hover:scale-105 transition-transform">D</a>
              <span className="font-bold tracking-tight text-[18px]">DukaanWhats.pk</span>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <CurrentPlanButton />
              <Link href={slug ? `/s/${slug}` : '#'} target="_blank" className="h-10 px-5 bg-black text-white rounded-full text-[13px] font-medium flex items-center justify-center leading-none hover:bg-zinc-900 transition-colors shadow-sm">View ↗</Link>
            </div>
          </header>

          {/* Navigation Tabs (Pill inside Panel) */}
          <div className="px-2 md:px-4 mb-6 md:mb-8">
            <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto no-scrollbar bg-white/40 p-1.5 rounded-full border border-white/60 w-fit max-w-full shadow-sm">
              {[
                { id: 'store', label: 'Store' },
                { id: 'themes', label: 'Themes' },
                { id: 'products', label: `Products ${products.length}/${productLimit===999999?'∞':productLimit}` },
                { id: 'analytics', label: 'Analytics' },
              ].map((t:any) => (
                <button key={t.id} onClick={()=>setActiveTab(t.id as any)} className={`pg-tab shrink-0 ${activeTab===t.id ? 'active' : ''}`}>
                  {t.label}
                  {t.id === 'analytics' && !isPremium && <span className="ml-1 opacity-50">🔒</span>}
                  {t.id === 'analytics' && isPremium && <LiveDot />}
                </button>
              ))}
              <div className="w-[1px] h-6 bg-black/10 mx-1 hidden md:block"></div>
              <button onClick={()=>setActiveTab('payments')} className={`pg-tab shrink-0 !bg-[#E8FF86] !text-black shadow-[0_0_15px_rgba(232,255,134,0.4)] font-bold ${activeTab==='payments'?'!bg-black !text-[#E8FF86] ring-2 ring-[#E8FF86]':''}`}>PRO</button>
            </div>
          </div>

          <main className="px-2 md:px-4 pb-10">
            
            {activeTab==='themes' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <h2 className="text-[18px] font-bold tracking-tight">Themes <span className="font-normal text-zinc-500">— Current: {currentPlanDef.name}</span></h2>
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2"><span className="text-[11px] font-black tracking-widest bg-black/5 px-3 py-1.5 rounded-full">8 ADVANCED THEMES</span><span className="text-[11px] text-zinc-500">{currentPlanId==='basic'?`${basicAllowedAdvancedIds.length}/8 unlocked`:`${currentPlanId.toUpperCase()}: 8/8 unlocked`}</span></div>
                  <div className="adv-grid">
                    {finalAdvancedList.map(t => { const isActive = theme===t.id; const locked = isThemeLocked(t); return (
                      <button key={t.id} onClick={()=>handleThemeClick(t)} className={`adv-card ${isActive?'selected':''}`}>
                        {isActive && <span className="absolute top-4 right-4 w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-[12px] font-bold z-10">✓</span>}
                        <div className="flex items-center gap-3 w-full relative z-10">
                          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[16px] shrink-0" style={{background:t.colors?.bg || '#F4F4F5'}}>{t.name?.[0] || '◧'}</div>
                          <div className="min-w-0 flex-1"><div className="text-[14px] font-bold truncate tracking-tight">{t.name}</div><div className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium mt-0.5">ADVANCED</div></div>
                        </div>
                        <div className="mt-4 w-full h-[100px] rounded-[16px] bg-white/50 border border-white/60 p-3 flex gap-3 relative z-10 shadow-inner">
                          <div className="w-10 h-full rounded-[10px]" style={{background:t.colors?.accent || '#000'}} />
                          <div className="flex-1 flex flex-col gap-2"><div className="h-2.5 w-3/4 bg-zinc-200/80 rounded-full" /><div className="h-2.5 w-1/2 bg-zinc-200/50 rounded-full" /><div className="mt-auto h-7 w-full bg-white border border-black/5 rounded-[10px] shadow-sm" /></div>
                        </div>
                        {locked && <div className="adv-card-lock-overlay"><GlassLockIcon size={40} /><div className="text-[11px] font-black tracking-widest mt-1">LOCKED</div><div className="text-[10px] text-zinc-500 text-center leading-tight">Basic 3/8<br/>Need Advanced</div><div className="mt-1.5 bg-black text-white text-[10px] px-4 h-8 rounded-full font-bold flex items-center shadow-md">UPGRADE → Rs. 899</div></div>}
                      </button>
                    )})}
                  </div>
                </div>

                <div className="pt-4">
                  <div className="mb-3 flex items-center gap-2"><span className="text-[11px] font-black tracking-widest bg-white/60 px-3 py-1.5 rounded-full border border-white/80 shadow-sm">STANDARD THEMES</span></div>
                  <div className="adv-grid">
                    {filteredStandard.slice(0,6).map(t => { const isActive = theme===t.id; return (
                      <button key={t.id} onClick={()=>handleThemeClick(t)} className={`adv-card ${isActive?'selected':''} !h-[200px]`}>
                        {isActive && <span className="absolute top-4 right-4 w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-[12px] font-bold z-10">✓</span>}
                        <div className="flex items-center gap-3 relative z-10"><div className="w-10 h-10 rounded-[12px] bg-white shadow-sm border border-white/60 flex items-center justify-center text-[16px]">{t.name?.[0] || '◧'}</div><div><div className="text-[14px] font-bold">{t.name}</div><div className="text-[10px] text-zinc-500 uppercase tracking-widest">{t.category}</div></div></div>
                        <div className="mt-4 w-full h-[80px] rounded-[16px] bg-white/40 border border-white/60 shadow-inner" />
                      </button>
                    )})}
                  </div>
                </div>

                {/* 3 PREMIUM GLASS THEMES (UNTOUCHED) */}
                <div className="mt-8 rounded-[32px] border border-white/80 overflow-hidden bg-white/30 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
                  <div className="p-6 md:p-8 border-b border-white/60 flex flex-wrap items-center justify-between gap-3 bg-white/40">
                    <div className="flex items-center gap-3"><span className="bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest shadow-sm">3 PREMIUM THEMES</span><span className="font-bold text-[15px] tracking-tight">Glass Collection</span></div>
                    <span className="bg-white/80 border border-white/80 text-[11px] px-3 py-1.5 rounded-full font-medium shadow-sm">{currentPlanId==='premium'?'All 3 Premium Unlocked ✓':`Locked — Need Premium`}</span>
                  </div>
                  <div className="bg-transparent relative">
                    <div className="absolute top-3 right-5 hidden md:flex items-center gap-2 text-[10px] mono text-black/30 z-10"><span>← Scroll to see all {premiumThemes.length} Glass →</span></div>
                    <div className="glass-container">
                      {premiumThemes.map((t,i)=>{
                        const isActive=theme===t.id;
                        const locked=isThemeLocked(t);
                        const r = isActive ? 0 : (GLASS_TILTS[i % GLASS_TILTS.length]); 
                        return (
                          <div key={t.id} className={`glass ${isActive?'selected':''}`} data-text={t.name} style={{'--r':r, scrollSnapAlign:'start'} as any} onClick={()=>handleThemeClick(t)}>
                            <div className="glass-preview-wrap">
                              <div className="glass-preview-header" style={{background:t.colors?.bg || '#fff', color:t.colors?.text || '#000'}}>
                                <span className="tracking-widest">{t.id.slice(0,14).toUpperCase()} • PREMIUM</span>
                                <span className="text-[8px] opacity-60">{locked?'🔒 LOCKED':'✓ UNLOCKED'}</span>
                              </div>
                              <div className="glass-preview-body">
                                <div className="h-8 rounded-[8px] border" style={{background:t.colors?.card || '#fff', borderColor:t.colors?.border || '#eee'}} />
                                <div className="flex gap-2"><div className="flex-1 h-16 rounded-[10px] bg-white border" /><div className="flex-1 h-16 rounded-[10px] bg-white border" /></div>
                                <div className="h-8 rounded-[8px] bg-black" />
                              </div>
                            </div>
                            {isActive && <div className="absolute top-4 right-4 w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-[12px] font-bold shadow-lg z-20">✓</div>}
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

                <div className="flex justify-between items-center pt-6 flex-wrap gap-3">
                  <span className="text-[11px] text-zinc-500 font-medium">Products {products.length}/{productLimit===999999?'∞':productLimit} • Images {imageLimit===999999?'∞':imageLimit}/product</span>
                  <div className="flex gap-2 items-center">
                    {saved && <span className="h-11 px-4 flex items-center text-[12px] text-green-700 font-bold bg-green-100/50 backdrop-blur-md rounded-full border border-green-200/50 shadow-sm">✓ Saved!</span>}
                    <button onClick={saveStore} className="h-11 px-8 bg-black text-white text-[13px] font-bold rounded-full hover:bg-zinc-900 transition-colors shadow-lg active:scale-95">{saving?'Saving...':'Save Store & Theme'}</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab==='store' && (
              <div className="pg-tile p-6 md:p-10 max-w-3xl">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-6"><h2 className="font-bold text-[18px] tracking-tight">Store Identity</h2>{saved && <span className="bg-[#E8FF86] text-black px-3 h-7 rounded-full text-[11px] font-bold flex items-center shadow-sm">Saved ✓</span>}</div>
                <div className="bg-white/40 backdrop-blur-md border border-white/80 rounded-[20px] p-5 flex items-center gap-4 shadow-sm mb-8">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-[14px] shadow-sm ${isPremium?'bg-[#E8FF86] text-black':isAdvanced?'bg-black text-white':'bg-white/80 border border-white/60'}`}>{currentPlanDef.name[0]}</div>
                  <div><div className="text-[14px] font-bold">{currentPlanDef.name} Plan Active</div><div className="text-[12px] text-zinc-500 mt-0.5">{currentPlanDef.features.join(' • ')}</div></div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div><label className="text-[11px] font-bold tracking-widest uppercase text-zinc-500 ml-2">Business Name</label><input value={businessName} onChange={e=>setBusinessName(e.target.value)} className="pg-input mt-2 w-full h-12 text-[14px]" /></div>
                  <div><label className="text-[11px] font-bold tracking-widest uppercase text-zinc-500 ml-2">WhatsApp Number</label><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="923001234567" className="pg-input mt-2 w-full h-12 text-[14px]" /></div>
                  <div className="md:col-span-2"><label className="text-[11px] font-bold tracking-widest uppercase text-zinc-500 ml-2">Store Slug</label><input value={slug} onChange={e=>setSlug(e.target.value)} className="pg-input mt-2 w-full h-12 text-[14px]" /><div className="mt-2 ml-2 text-[12px] text-zinc-500">Your store URL: /s/{slug || 'your-slug'}</div></div>
                </div>
                <div className="mt-8 flex flex-wrap gap-3 items-center">
                  <button onClick={saveStore} disabled={saving} className="h-12 px-8 bg-black text-white rounded-full text-[13px] font-bold hover:bg-zinc-900 transition-colors shadow-lg active:scale-95">{saving?'Saving...':saved?'Saved ✓':'Save Store'}</button>
                  <button onClick={copyLink} className="h-12 px-6 border border-white/80 bg-white/50 backdrop-blur-md rounded-full text-[13px] font-bold hover:bg-white transition-colors shadow-sm">{copied?'Copied!':'Copy Link'}</button>
                  <Link href={slug ? `/s/${slug}` : '#'} target="_blank" className="h-12 px-6 border border-white/80 bg-white/50 backdrop-blur-md rounded-full text-[13px] font-bold flex items-center justify-center hover:bg-white transition-colors shadow-sm">View ↗</Link>
                </div>
              </div>
            )}

            {activeTab==='themes' && profile && (
              <PremiumThemeEditor profile={{...profile, premium_custom: premiumCustom}} onSave={(d:any)=>{ setPremiumCustom(d); setProfile({...profile, premium_custom: d} as any) }} />
            )}
            
            {activeTab==='products' && (
              <div className="space-y-6">
                <div className="pg-tile p-6 md:p-10">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <h2 className="font-bold text-[18px] tracking-tight">Add Product <span className="font-normal text-zinc-500">({products.length}/{productLimit===999999?'∞':productLimit})</span></h2>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 h-7 rounded-full text-[11px] font-bold flex items-center ${products.length>=productLimit?'bg-red-500 text-white shadow-sm':productLimit===999999?'bg-[#E8FF86] text-black shadow-sm':'bg-black text-white shadow-sm'}`}>{products.length>=productLimit?'LIMIT REACHED':`${productLimit===999999?'∞':productLimit-products.length} LEFT`}</span>
                      <CurrentPlanButton />
                    </div>
                  </div>
                  <div className="space-y-5">
                    <label className="group relative border-2 border-dashed border-white/90 rounded-[24px] p-8 flex flex-col items-center justify-center cursor-pointer hover:border-black/30 hover:bg-white/60 transition-all min-h-[180px] bg-white/30 backdrop-blur-md overflow-hidden shadow-sm">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10 flex flex-col items-center w-full">
                      {previews.length ? (
                        <div className="grid grid-cols-5 gap-3 w-full">
                          {previews.map((src,i)=>(
                            <div key={i} className="relative group/img">
                              <img src={src} className="w-full h-[80px] object-cover rounded-[14px] border-2 border-white/90 shadow-sm group-hover/img:shadow-md transition-shadow" />
                            </div>
                          ))}
                          <div className="h-[80px] rounded-[14px] border-2 border-dashed border-white/90 bg-white/40 flex flex-col items-center justify-center gap-1 hover:border-black/30 transition-colors shadow-sm">
                            <span className="text-[18px]">+</span><span className="text-[10px] font-bold tracking-widest">ADD</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <UploadIcon />
                          <div className="mt-5 text-center">
                            <div className="font-bold text-[15px] tracking-tight">Drop images or click to upload</div>
                            <div className="mt-3 flex items-center justify-center gap-2 text-[11px]">
                              <span className="px-3 h-7 rounded-full bg-black text-white font-bold flex items-center shadow-sm">Basic 1</span>
                              <span className="px-3 h-7 rounded-full bg-white/80 border border-white/90 font-bold flex items-center shadow-sm">Advanced 5</span>
                              <span className="px-3 h-7 rounded-full bg-[#E8FF86] border border-white/90 font-bold flex items-center shadow-sm">Premium ∞</span>
                            </div>
                            <div className="mt-3 text-[12px] text-zinc-500">Your plan <b className="text-black">{currentPlanId.toUpperCase()}</b> allows <b className="text-black">{imageLimit===999999?'Unlimited':imageLimit}</b> image{imageLimit!==1?'s':''}</div>
                          </div>
                        </>
                      )}
                      </div>
                      <input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
                    </label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <input placeholder="Product name *" value={prodName} onChange={e=>setProdName(e.target.value)} className="pg-input w-full h-12 text-[14px]" />
                      <input placeholder="Price Rs. 3500 *" type="number" value={prodPrice} onChange={e=>setProdPrice(e.target.value)} className="pg-input w-full h-12 text-[14px]" />
                      <input placeholder="Compare price Rs. 5000" type="number" value={prodOrigPrice} onChange={e=>setProdOrigPrice(e.target.value)} className="pg-input w-full h-12 text-[14px]" />
                      <select value={prodCategory} onChange={e=>setProdCategory(e.target.value)} className="pg-input w-full h-12 text-[14px]">
                        <option>General</option><option>Clothing</option><option>Shoes</option><option>Bags</option><option>Beauty</option><option>Electronics</option><option>Food</option><option>Other</option>
                      </select>
                      <input placeholder="Stock qty (e.g. 100)" type="number" value={prodStock} onChange={e=>setProdStock(e.target.value)} className="pg-input w-full h-12 text-[14px]" />
                      <input placeholder="Sizes (S, M, L) - comma" value={prodSizes} onChange={e=>setProdSizes(e.target.value)} className="pg-input w-full h-12 text-[14px]" />
                      <input placeholder="Colors (Black, Red) - comma" value={prodColors} onChange={e=>setProdColors(e.target.value)} className="pg-input md:col-span-2 w-full h-12 text-[14px]" />
                      <textarea placeholder="Description, materials, care instructions..." value={prodDesc} onChange={e=>setProdDesc(e.target.value)} className="pg-input md:col-span-2 w-full min-h-[100px] p-5 text-[14px] resize-none" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      {editingId && <button onClick={cancelEdit} className="h-12 px-6 border border-white/80 bg-white/50 backdrop-blur-md rounded-full text-[13px] font-bold hover:bg-white transition-colors shadow-sm">Cancel</button>}
                      <button onClick={addProduct} disabled={uploading || (!editingId && products.length>=productLimit)} className="h-12 px-8 bg-black text-white text-[13px] font-bold rounded-full disabled:opacity-40 hover:bg-zinc-900 transition-colors flex items-center justify-center shadow-lg active:scale-95">{uploading?'Uploading...':!editingId && products.length>=productLimit?`Limit Reached`:`${editingId?'Update':'Add'} Product →`}</button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {products.length===0 ? (
                    <div className="col-span-2 md:col-span-4 bg-white/30 backdrop-blur-xl border border-white/80 border-dashed rounded-[32px] p-16 flex flex-col items-center justify-center text-center shadow-sm"><UploadIcon className="w-14 h-14" /><div className="mt-5 font-bold text-[16px]">No products yet</div><div className="text-[12px] text-zinc-500 mt-1">Add your first product — {productLimit===999999?'Unlimited':productLimit} allowed on {currentPlanDef.name}</div></div>
                  ) : products.map(p => (
                    <PremiumProductCard key={p.id} p={p} onEdit={startEdit} onDelete={deleteProduct} themeId={theme} imageLimit={imageLimit} />
                  ))}
                </div>
              </div>
            )}

            {activeTab==='analytics' && (
              <div>
                {!profile ? <div className="p-8 text-center">Loading...</div> : currentPlanId === 'premium' ? (
                  <RealAnalytics userId={profile!.id} currentPlanId={currentPlanId} />
                ) : (
                  <div className="relative">
                    <div className="pg-tile p-12 text-center relative max-w-2xl mx-auto">
                      <div className="w-20 h-20 bg-black rounded-[24px] flex items-center justify-center mx-auto text-white shadow-xl">◐</div>
                      <h3 className="font-black text-[22px] mt-6 tracking-tight">Analytics is Premium Only</h3>
                      <p className="text-[14px] text-zinc-500 mt-3 max-w-[400px] mx-auto leading-relaxed">Your {currentPlanId.toUpperCase()} plan shows a blurred preview. Upgrade to Premium to see real live analytics and boost your sales.</p>
                      <button onClick={()=>setActiveTab('payments')} className="mt-8 h-12 px-8 bg-black text-white rounded-full text-[14px] font-bold shadow-lg hover:bg-zinc-900 transition-colors">Upgrade to Premium →</button>
                    </div>
                    <div className="mt-6 opacity-30 blur-[8px] pointer-events-none select-none max-w-4xl mx-auto">
                      <RealAnalytics userId={profile!.id} currentPlanId={'premium'} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center shadow-[0_16px_48px_rgba(0,0,0,0.3)]">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[22px]">🔒</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab==='payments' && (
              <div className="pg-tile p-6 md:p-10 overflow-hidden relative">
                {myPayments.length > 0 && (
                  <div className="mb-8 rounded-[24px] border border-white/80 bg-white/40 backdrop-blur-md p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-black text-white rounded-[12px] flex items-center justify-center text-[14px] shadow-sm">₨</div>
                      <span className="font-black text-[15px] tracking-tight">Your Payments</span>
                      {myPayments.filter((p:any)=>p.status==='pending').length > 0 && <span className="ml-auto flex items-center gap-1.5 text-[11px] bg-yellow-100/80 backdrop-blur border border-yellow-200 text-yellow-700 px-3 h-8 rounded-full font-bold"><span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />{myPayments.filter((p:any)=>p.status==='pending').length} Pending</span>}
                      {myPayments.filter((p:any)=>p.status==='pending').length === 0 && myPayments.filter((p:any)=>p.status==='approved').length > 0 && <span className="ml-auto text-[11px] bg-green-100/80 backdrop-blur border border-green-200 text-green-700 px-3 h-8 rounded-full font-bold flex items-center gap-1">✓ Active</span>}
                    </div>
                    <div className="space-y-3">
                      {myPayments.slice(0,5).map((p:any)=>(
                        <div key={p.id} className="group flex items-center justify-between gap-3 bg-white/60 border border-white/80 rounded-[16px] p-4 hover:bg-white transition-colors shadow-sm">
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <span className={`shrink-0 h-8 px-3 rounded-full text-[10px] font-black tracking-widest flex items-center border shadow-sm ${p.status==='pending'?'bg-yellow-100 text-yellow-700 border-yellow-200':p.status==='approved'?'bg-black text-white border-black':'bg-red-50 text-red-600 border-red-200'}`}>{p.status==='pending'?'⏳ PENDING':p.status==='approved'?'✓ APPROVED':'✕ REJECTED'}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2"><span className="text-[14px] font-black">{p.plan_id.toUpperCase()}</span><span className="text-[13px] font-bold text-zinc-600">Rs. {p.amount}</span></div>
                              <div className="flex items-center gap-2 mt-1.5"><span className="font-mono text-[11px] bg-white/80 border border-white/80 px-2 py-0.5 rounded-[8px]">{p.txn_id}</span><span className="text-[11px] text-zinc-500 hidden md:inline">{new Date(p.created_at).toLocaleDateString()} • {p.till_id && `Till ${p.till_id}`}</span></div>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            {p.status==='pending' && <div className="text-[12px] font-medium text-zinc-500">Verifying...<br/><span className="text-[11px]">~1 hour</span></div>}
                            {p.status==='approved' && <div className="text-[12px] font-black text-green-600">Active<br/><span className="text-[11px] font-medium text-zinc-500">Unlocked</span></div>}
                            {p.status==='rejected' && <div className="text-[12px] font-black text-red-600">Rejected<br/><span className="text-[11px] font-medium text-zinc-500">Contact support</span></div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                  <div className="flex items-center gap-4"><div className="w-14 h-14 bg-black text-white rounded-[16px] flex items-center justify-center text-[22px] shadow-lg">⬡</div><div><h2 className="font-black text-[20px] tracking-tight">Pricing Plans</h2><p className="text-[13px] text-zinc-500 mt-1">Pay to JazzCash Till <b>{TILL_ID}</b> & submit Txn ID</p></div></div>
                  <div className="flex items-center gap-3">
                    <div className="billing-toggle flex bg-black/5 backdrop-blur-md border border-white/60 p-1 rounded-full shadow-sm">
                      <button onClick={()=>setBilling('monthly')} className={`h-9 px-5 rounded-full text-[12px] font-bold transition-all ${billing==='monthly'?'bg-white text-black shadow-sm':'text-zinc-500'}`}>Monthly</button>
                      <button onClick={()=>setBilling('yearly')} className={`h-9 px-5 rounded-full text-[12px] font-bold transition-all ${billing==='yearly'?'bg-white text-black shadow-sm':'text-zinc-500'}`}>Yearly <span className="ml-1 bg-[#E8FF86] text-black text-[9px] px-2 py-0.5 rounded-full">-22%</span></button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
                  <div className="bg-[#0A0A0A] rounded-[24px] text-white p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8FF86] rounded-full blur-[80px] opacity-10 pointer-events-none"></div>
                    <div className="flex justify-between items-center relative z-10"><div className="text-[11px] tracking-[0.2em] uppercase opacity-60 font-bold">JAZZCASH BUSINESS TILL</div><button onClick={copyTill} className="h-8 px-4 bg-white/10 border border-white/10 rounded-full text-[11px] font-bold hover:bg-white/20 transition-colors">{copiedTill?'Copied!':'Copy ID'}</button></div>
                    <div className="mt-5 bg-white/[0.08] border border-white/[0.1] rounded-[16px] p-5 relative z-10"><div className="text-[11px] uppercase tracking-widest opacity-60">Till ID Number</div><div className="text-[36px] font-black font-mono tracking-[0.1em] mt-1">{TILL_ID}</div></div>
                    <div className="mt-4 bg-white rounded-[16px] p-4 shadow-lg relative z-10"><img src={`https://barcodeapi.org/api/code128/${TILL_ID}`} alt="Barcode" className="w-full h-[50px] object-contain"/><div className="text-center text-[12px] font-mono text-black font-black tracking-[0.3em] mt-2">{TILL_ID}</div></div>
                    <div className="mt-4 bg-white rounded-[16px] p-4 flex justify-center shadow-lg relative z-10"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=JAZZCASH_TILL_${TILL_ID}`} alt="QR" className="w-[140px] h-[140px]"/></div>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="radio-container" style={{"--total-radio": plans.length} as any}>
                      {plans.map(p=>{
                        const displayPrice = getDisplayPrice(p)
                        const isSelected = selectedPlan?.id===p.id
                        const isCurrent = currentPlanId===p.id
                        return (
                          <div key={p.id} className="contents">
                            <input type="radio" id={`dash-${p.id}`} name="dash-plan" checked={isSelected} onChange={()=>setSelectedPlan(p)} />
                            <label htmlFor={`dash-${p.id}`} onClick={()=>setSelectedPlan(p)} className={isCurrent?'!bg-white/90 !border-black/10 shadow-sm' : ''}>
                              <div className="flex justify-between items-start gap-4">
                                <div className="min-w-0 flex-1"><div className="flex items-center gap-2 flex-wrap"><span className="font-black text-[15px]">{p.name}</span>{isCurrent && <span className="bg-black text-white text-[9px] px-2 h-5 rounded-full font-bold flex items-center shadow-sm">CURRENT</span>}<span className={`text-[10px] px-3 h-6 rounded-full font-bold flex items-center shadow-sm ${p.id==='premium'?'bg-[#E8FF86] text-black':p.id==='advanced'?'bg-black text-white':'bg-white/80 border border-white/80'}`}>Rs. {displayPrice}/mo</span>{p.id==='advanced' && <span className="bg-[#E8FF86] text-black text-[9px] px-2 h-5 rounded-full font-bold flex items-center shadow-sm">POPULAR</span>}</div><div className="text-[12px] mt-2 opacity-60 leading-[1.4] font-medium">{p.features.join(' • ')}</div></div><div className="text-right shrink-0"><div className="font-black text-[18px]">Rs. {displayPrice}</div><div className="text-[11px] font-medium opacity-60 mt-1">{billing==='yearly'?`Billed Rs. ${p.yearlyTotal}/yr`:p.id!=='basic'?`Yearly Rs. ${p.yearlyMonthly}/mo`:''}</div></div>
                              </div>
                            </label>
                          </div>
                        )
                      })}
                      <div className="glider-container"><div className="glider"></div></div>
                    </div>
                    {selectedPlan && selectedPlan.monthly>0 && (
                      <div className="rounded-[24px] border border-black/10 bg-white/80 backdrop-blur-xl p-6 shadow-lg">
                        <div className="flex items-center gap-2 flex-wrap"><div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[14px] shadow-sm">₨</div><div className="text-[14px] font-bold">Pay Rs. {billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal} → Till {TILL_ID} ({billing})</div></div>
                        <input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder={`Txn ID after paying Rs. ${billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal}`} className="pg-input mt-5 w-full h-14 !border-black/20 text-[13px] font-mono focus:!border-black shadow-inner" />
                        <button onClick={handleBuyPlan} disabled={purchasing} className="mt-4 w-full h-14 bg-black text-white rounded-full font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-zinc-900 transition-colors shadow-lg active:scale-95">{purchasing?'Submitting...':`I Paid Rs. ${billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal} — Activate ${selectedPlan.name}`} <span className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-[12px]">↗</span></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {errorMsg && <div className="fixed bottom-6 right-6 bg-red-600/90 backdrop-blur-md text-white px-6 py-3 rounded-full text-[13px] font-bold shadow-xl z-50 animate-bounce">{errorMsg}</div>}

      {showStatusModal && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-3xl border border-white/60 rounded-[32px] w-full max-w-[400px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.25)]">
            {showStatusModal.type === 'approved' ? (
              <div>
                <div className="bg-black text-white p-10 text-center border-b border-white/10">
                  <div className="w-20 h-20 bg-[#E8FF86] rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(232,255,134,0.4)]"><span className="text-[36px] text-black">✓</span></div>
                  <h2 className="font-black text-[24px] mt-5 tracking-tight">Payment Approved!</h2>
                  <p className="text-[14px] text-white/60 mt-2">Your store is now {showStatusModal.payment.plan_id.toUpperCase()}</p>
                </div>
                <div className="p-7">
                  <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-[16px] p-5 shadow-sm">
                    <div className="flex justify-between items-center"><span className="text-[12px] text-zinc-500 font-medium">Plan</span><span className="text-[14px] font-black">{showStatusModal.payment.plan_id.toUpperCase()} • Rs. {showStatusModal.payment.amount}</span></div>
                    <div className="flex justify-between items-center mt-3"><span className="text-[12px] text-zinc-500 font-medium">Txn ID</span><span className="font-mono text-[13px] bg-white border border-white/80 px-3 py-1.5 rounded-[8px] shadow-sm font-bold">{showStatusModal.payment.txn_id}</span></div>
                  </div>
                  <button onClick={()=>setShowStatusModal(null)} className="mt-7 w-full h-14 bg-black text-white rounded-full font-bold text-[14px] hover:bg-zinc-900 transition-colors shadow-lg active:scale-95">Continue →</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-red-50 p-10 text-center border-b border-white/60">
                  <div className="w-20 h-20 bg-red-100 border border-red-200 rounded-full flex items-center justify-center mx-auto shadow-sm"><span className="text-[30px] text-red-600">✕</span></div>
                  <h2 className="font-black text-[22px] mt-5 tracking-tight">Payment Rejected</h2>
                  <p className="text-[14px] text-zinc-500 mt-2">Check Txn ID and try again</p>
                </div>
                <div className="p-7">
                  <p className="text-[13px] text-zinc-600 leading-relaxed text-center">Txn ID could not be verified in Till {TILL_ID}. Please ensure the correct amount and ID were entered.</p>
                  <button onClick={()=>setShowStatusModal(null)} className="mt-7 w-full h-14 bg-black text-white rounded-full font-bold text-[14px] hover:bg-zinc-900 transition-colors shadow-lg active:scale-95">Try Again →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
