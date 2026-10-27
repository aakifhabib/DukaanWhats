'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { RealAnalytics } from '@/components/RealAnalytics'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STORE_THEMES, getTheme, ThemeCategory, getAdvancedThemes, getPremiumThemes, getStandardThemes } from '@/lib/storeThemes'
import { DukaanWhatsLoader } from '@/components/DukaanWhatsLoader'
import { PremiumThemeEditor } from '@/components/PremiumThemeEditor'

const UploadIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <div className={`${className} relative`}>
    <div className="absolute inset-0 bg-black rounded-[14px]" />
    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black rounded-[14px]" />
    <div className="absolute inset-[1px] bg-black rounded-[13px] flex items-center justify-center">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 15.5V19.5C3 20.6 3.9 21.5 5 21.5H19C20.1 21.5 21 20.6 21 19.5V15.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.3"/><path d="M12 3.5V14.5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/><path d="M8.5 7L12 3.5L15.5 7" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="12.5" r="1.2" fill="white" opacity="0.9"/></svg>
    </div>
    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#E8FF86] rounded-full flex items-center justify-center border-2 border-white">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="black" strokeWidth="2.5" strokeLinecap="round"/></svg>
    </div>
  </div>
)
const GlassLockIcon = ({ size = 40 }: { size?: number }) => (
  <div style={{ width: size, height: size }} className="relative shrink-0">
    <div className="absolute inset-0 rounded-[14px] bg-white/90 backdrop-blur-xl border border-black/[0.06]" />
    <div className="absolute inset-0 flex items-center justify-center">
      <svg width={size>40?22:16} height={size>40?22:16} viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="10" rx="3" fill="#0A0A0A" /><path d="M8 10V7.5C8 5.3 9.8 3.5 12 3.5C14.2 3.5 16 5.3 16 7.5V10" stroke="#0A0A0A" strokeWidth="1.8" strokeLinecap="round" /></svg>
    </div>
  </div>
)
const GlassPremiumLock = ({ size = 56 }: { size?: number }) => (
  <div style={{ width: size, height: size }} className="relative">
    <div className="absolute inset-0 rounded-[16px] bg-[#0A0A0A]" />
    <div className="absolute inset-0 flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4.5" y="10.5" width="15" height="10" rx="3.5" fill="white" /><path d="M8 10.5V7.8C8 5.4 9.9 3.5 12.2 3.5C14.5 3.5 16.4 5.4 16.4 7.8V10.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" /></svg>
    </div>
  </div>
)

const TILL_ID = '984837533'
type Profile = { id: string; business_name: string; whatsapp_number: string; store_slug: string; store_theme?: string; current_plan?: string }
type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; user_id: string }
type Billing = 'monthly' | 'yearly'
type PlanDef = { id: 'basic'|'advanced'|'premium'; name: string; monthly: number; yearlyMonthly: number; yearlyTotal: number; products: number; imagesPerProduct: number; advancedAllowed: number|'all'; premiumAllowed: number|'all'; stores: number; features: string[] }

const PremiumProductCard = ({ p, onEdit, onDelete }: { p: any; onEdit: (p:any)=>void; onDelete: (id:string)=>void; themeId: string; imageLimit: number }) => {
  const [hoverIdx, setHoverIdx] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const images = (() => { if (p.image_urls && Array.isArray(p.image_urls) && p.image_urls.length>0) return p.image_urls; if (typeof p.image_urls==='string'){try{const pa=JSON.parse(p.image_urls); if(Array.isArray(pa)) return pa}catch{} return [p.image_urls]} if(p.image_url) return [p.image_url]; return [] })()
  useEffect(() => {
    if (!isHovering || images.length <= 1) return
    const interval = setInterval(() => { setHoverIdx(prev => (prev + 1) % images.length) }, 2000)
    return () => clearInterval(interval)
  }, [isHovering, images.length])
  return (
    <div className="group clear-glass rounded-[22px] p-[10px] hover:border-white/30 transition-all duration-300"
         onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      <div className="relative overflow-hidden rounded-[16px] h-[180px] bg-white/[0.04]">
        {images.length>0 ? (<><img src={images[hoverIdx % images.length]} className="w-full h-full object-cover" /></>) : <div className="w-full h-full flex items-center justify-center text-white/30 text-[11px]">No image</div>}
      </div>
      <div className="mt-3 px-2 pb-2">
        <div className="font-semibold text-[13px] truncate text-white">{p.name}</div>
        <div className="flex items-center justify-between mt-1">
          <span className="font-bold text-[13px] text-white">Rs. {p.price.toLocaleString()}</span>
          <span className="text-[10px] text-white/40">{images.length} img</span>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={()=>onEdit(p)} className="flex-1 h-8 bg-white text-black rounded-full text-[11px] font-semibold">Edit</button>
          <button onClick={()=>onDelete(p.id)} className="h-8 w-8 bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white/60">✕</button>
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
    { id: 'premium', name: 'Premium', monthly: 2999, yearlyMonthly: 2499, yearlyTotal: 29988, products: 999999, imagesPerProduct: 999999, advancedAllowed: 'all', premiumAllowed: 'all', stores: 999999, features: ['Unlimited Products', 'Unlimited Images', 'Every Theme (8 Advanced + 3 Premium)', 'No Watermark', 'Live Analytics'] },
  ]
  const currentPlanId = (profile?.current_plan || 'basic') as 'basic'|'advanced'|'premium'
  const currentPlanDef = plans.find(p=>p.id===currentPlanId) || plans[0]
  const isPremium = currentPlanId === 'premium'
  const isAdvanced = currentPlanId === 'advanced' || isPremium
  const productLimit = currentPlanDef.products
  const imageLimit = currentPlanDef.imagesPerProduct

  const advancedGlassRaw = getAdvancedThemes()
  const premiumNewRaw = getPremiumThemes()
  const premiumThemes = [...advancedGlassRaw, ...premiumNewRaw]
  const premiumIds = premiumThemes.map(t=>t.id)
  const allAdvancedRaw = STORE_THEMES.filter(t => (t.category as string) === 'advanced' && !advancedGlassRaw.map(x=>x.id).includes(t.id))
  const advancedThemesList = allAdvancedRaw.length >= 5 ? allAdvancedRaw.slice(0,8) : [...allAdvancedRaw, ...STORE_THEMES.filter(t=> (t.category as string) === 'clothing' || (t.category as string) === 'tech').slice(0, 8 - allAdvancedRaw.length)]
  const finalAdvancedList = advancedThemesList.length ? advancedThemesList.slice(0,8) : STORE_THEMES.filter(t=>!premiumIds.includes(t.id)).slice(0,8)
  const basicAllowedAdvancedIds = finalAdvancedList.slice(0,3).map(t=>t.id)
  const isPremiumTheme = (t: any) => premiumIds.includes(t.id) || (t.category as string) === 'premium' || (t as any).tier === 'premium'
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
          if (pays) setMyPayments(pays)
        }
      } catch (e: any) { setErrorMsg(e.message) }
      setTimeout(()=>setLoading(false), 700)
    }
    init()
  }, [])

  const handleThemeClick = (t: any) => {
    if (isThemeLocked(t)) {
      alert(`🔒 Locked - Till ${TILL_ID}`);
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
    const newFiles = editingId ? [...files, ...selected].slice(0, imageLimit === 999999 ? 20 : imageLimit) : selected
    setFiles(newFiles)
    const pr: string[] = []
    const existingPreviews = editingId ? previews : []
    newFiles.forEach(file => {
      const r = new FileReader()
      r.onload = ev => { pr.push(ev.target?.result as string); if (pr.length === newFiles.length) setPreviews(editingId ? [...existingPreviews, ...pr].slice(0, newFiles.length) : pr) }
      r.readAsDataURL(file)
    })
  }
  const removeFileAt = (idx: number) => { setFiles(files.filter((_, i) => i !== idx)); setPreviews(previews.filter((_, i) => i !== idx)) }
  const uploadOne = async (file: File, userId: string) => {
    const ext = file.name.split('.').pop(); const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(fileName, file); if (error) throw error
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName); return data.publicUrl
  }
  const startEdit = (p: any) => { setEditingId(p.id); setProdName(p.name); setProdPrice(String(p.price)); setProdDesc(p.description || ''); setProdCategory(p.category || 'General'); setProdStock(String(p.stock || 100)); setProdSizes(Array.isArray(p.sizes) ? p.sizes.join(', ') : p.sizes || ''); setProdColors(Array.isArray(p.colors) ? p.colors.join(', ') : p.colors || ''); setProdOrigPrice(p.original_price ? String(p.original_price) : ''); setPreviews(p.image_urls && p.image_urls.length ? p.image_urls : [p.image_url]); setFiles([]); setActiveTab('products'); }
  const cancelEdit = () => { setEditingId(null); setProdName(''); setProdPrice(''); setProdDesc(''); setProdCategory('General'); setProdStock('100'); setProdSizes(''); setProdColors(''); setProdOrigPrice(''); setPreviews([]); setFiles([]) }
  const addProduct = async () => {
    if (!prodName.trim() || !prodPrice) { setErrorMsg('Name and price required'); return }
    if (!profile) return
    setUploading(true)
    try {
      let imageUrls: string[] = []
      if (files.length>0) { for (const f of files) { const url = await uploadOne(f, profile.id); imageUrls.push(url) } } else if (previews.length>0 && editingId) { imageUrls = previews }
      if (editingId) {
        const existing = products.find(p=>p.id===editingId)
        const finalImages = imageUrls.length>0 ? imageUrls : (existing?.image_urls || [existing?.image_url])
        const { error } = await supabase.from('products').update({ name: prodName.trim(), price: parseFloat(prodPrice), description: prodDesc.trim(), category: prodCategory, stock: parseInt(prodStock)||100, sizes: prodSizes.split(',').map(s=>s.trim()).filter(Boolean), colors: prodColors.split(',').map(s=>s.trim()).filter(Boolean), original_price: prodOrigPrice?parseFloat(prodOrigPrice):null, image_url: finalImages[0]||'', image_urls: finalImages }).eq('id', editingId)
        if (error) throw error
      } else {
        if (imageUrls.length===0) { setErrorMsg('Please upload image'); setUploading(false); return }
        const { data, error } = await supabase.from('products').insert({ user_id: profile.id, name: prodName.trim(), price: parseFloat(prodPrice), description: prodDesc.trim(), category: prodCategory, stock: parseInt(prodStock)||100, sizes: prodSizes.split(',').map(s=>s.trim()).filter(Boolean), colors: prodColors.split(',').map(s=>s.trim()).filter(Boolean), original_price: prodOrigPrice?parseFloat(prodOrigPrice):null, image_url: imageUrls[0], image_urls: imageUrls }).select().single()
        if (error) throw error
        if (data) setProducts([data as any, ...products])
      }
      const { data: prods } = await supabase.from('products').select('*').eq('user_id', profile.id).order('created_at', { ascending: false })
      if (prods) setProducts(prods)
      cancelEdit()
    } catch (e:any){ setErrorMsg(e.message) } setUploading(false)
  }
  const deleteProduct = async (id:string) => { if (!confirm('Delete?')) return; const { error } = await supabase.from('products').delete().eq('id', id); if (!error) setProducts(products.filter(p=>p.id!==id)) }
  const getDisplayPrice = (p:PlanDef) => billing==='monthly'?p.monthly:p.yearlyMonthly
  const handleBuyPlan = async () => {
    if (!selectedPlan || !txnId.trim() || !profile) { setErrorMsg('Select plan and enter Txn ID'); return }
    setPurchasing(true)
    try {
      const amount = billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal
      const { data, error } = await supabase.from('plan_payments').insert({ user_id: profile.id, plan_id: selectedPlan.id, billing, amount, txn_id: txnId.trim(), status: 'pending' }).select().single()
      if (error) throw error
      setMyPayments([data, ...myPayments]); setTxnId('')
    } catch(e:any){ setErrorMsg(e.message) } setPurchasing(false)
  }
  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login') }
  const filteredStandard = getStandardThemes ? getStandardThemes() : STORE_THEMES.filter(t=> (t.category as string)!=='premium' && (t.category as string)!=='advanced')

  if (loading) return <DukaanWhatsLoader />

  const CurrentPlanButton = () => (
    <div className={`h-7 px-3 rounded-full text-[10px] font-bold tracking-widest flex items-center gap-1.5 border backdrop-blur ${isPremium?'bg-[#E8FF86] text-black border-[#E8FF86]':isAdvanced?'bg-white/10 text-white border-white/20':'bg-white/10 text-white/60 border-white/10'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isPremium?'bg-black':'bg-white'} animate-pulse`} />
      {currentPlanDef.name.toUpperCase()}
    </div>
  )

  const navItems = [
    { id: 'products', label: 'Products', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>), count: products.length },
    { id: 'payments', label: 'Pro', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 5.4L19 12l-5.2 3.6L12 21l-1.8-5.4L5 12l5.2-3.6L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>), pro: true },
    { id: 'themes', label: 'Themes', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="7"/><path d="M12 5v2M12 17v2M5 12h2M17 12h2"/></svg>) },
    { id: 'store', label: 'Store', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 9l9-6 9 6v11a1 1 0 0 1-1 1h-5v-5H9v5H4a1 1 0 0 1-1-1V9z"/></svg>) },
    { id: 'analytics', label: 'Analytics', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 18V11M8 18V8M12 18v-5M16 18V6M20 18V10"/></svg>), premium: true },
  ] as any[]

  return (
    <div className="min-h-screen w-full relative bg-black text-white selection:bg-white selection:text-black">
      {/* ANIMATED GREEN BLACK BACKGROUND - NOW WITH STRONG KEYFRAMES */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* base */}
        <div className="absolute inset-0 bg-[#050A06]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1F14] via-[#050A06] to-black" />
        
        {/* GREEN GLOW BLOBS - INLINE ANIMATIONS THAT CANNOT BE PURGED */}
        <div
          className="absolute rounded-full blur-[60px] will-change-transform"
          style={{
            width: '700px', height: '700px',
            left: '-10%', top: '-15%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.45) 0%, rgba(16,185,129,0.22) 40%, transparent 75%)',
            animation: 'blob1 14s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full blur-[70px] will-change-transform"
          style={{
            width: '800px', height: '800px',
            right: '-15%', top: '10%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.38) 0%, rgba(5,150,105,0.18) 45%, transparent 75%)',
            animation: 'blob2 18s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full blur-[80px] will-change-transform"
          style={{
            width: '900px', height: '900px',
            left: '20%', bottom: '-30%',
            background: 'radial-gradient(circle, rgba(74,222,128,0.32) 0%, rgba(34,197,94,0.15) 50%, transparent 75%)',
            animation: 'blob3 22s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full blur-[50px] will-change-transform"
          style={{
            width: '500px', height: '500px',
            left: '55%', top: '35%',
            background: 'radial-gradient(circle, rgba(187,247,208,0.22) 0%, rgba(34,197,94,0.10) 60%, transparent 80%)',
            animation: 'blob4 11s ease-in-out infinite',
          }}
        />
        {/* extra small fast blobs for visible motion */}
        <div
          className="absolute rounded-full blur-[40px] will-change-transform"
          style={{
            width: '320px', height: '320px',
            left: '70%', bottom: '15%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.55) 0%, transparent 70%)',
            animation: 'blobFast 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full blur-[45px] will-change-transform"
          style={{
            width: '380px', height: '380px',
            left: '5%', bottom: '10%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.40) 0%, transparent 70%)',
            animation: 'blobFast2 9.5s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *{font-family:'Inter',sans-serif}
        /* BLOBS MUST MOVE VISIBLY */
        @keyframes blob1 {
          0%{transform:translate(0px,0px) scale(1) rotate(0deg)}
          25%{transform:translate(80px,60px) scale(1.15) rotate(8deg)}
          50%{transform:translate(40px,120px) scale(0.92) rotate(-5deg)}
          75%{transform:translate(-30px,50px) scale(1.08) rotate(12deg)}
          100%{transform:translate(0px,0px) scale(1) rotate(0deg)}
        }
        @keyframes blob2 {
          0%{transform:translate(0px,0px) scale(1)}
          33%{transform:translate(-70px,80px) scale(1.18)}
          66%{transform:translate(-120px,-30px) scale(0.88)}
          100%{transform:translate(0px,0px) scale(1)}
        }
        @keyframes blob3 {
          0%{transform:translate(0px,0px) scale(1)}
          30%{transform:translate(60px,-80px) scale(1.12)}
          60%{transform:translate(-40px,-50px) scale(1.20)}
          100%{transform:translate(0px,0px) scale(1)}
        }
        @keyframes blob4 {
          0%{transform:translate(0,0) scale(1) rotate(0deg)}
          50%{transform:translate(-90px,-90px) scale(1.25) rotate(15deg)}
          100%{transform:translate(0,0) scale(1) rotate(0deg)}
        }
        @keyframes blobFast {
          0%{transform:translate(0,0) scale(1)}
          50%{transform:translate(-50px,-70px) scale(1.35)}
          100%{transform:translate(0,0) scale(1)}
        }
        @keyframes blobFast2 {
          0%{transform:translate(0,0) scale(1)}
          50%{transform:translate(70px,-60px) scale(1.3)}
          100%{transform:translate(0,0) scale(1)}
        }

        .clear-glass{
          background: rgba(255,255,255,0.07);
          backdrop-filter: blur(28px) saturate(1.5);
          -webkit-backdrop-filter: blur(28px) saturate(1.5);
          border: 1px solid rgba(255,255,255,0.14);
          box-shadow: 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.20);
        }
        .clear-panel{
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(32px) saturate(1.6);
          -webkit-backdrop-filter: blur(32px) saturate(1.6);
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 16px 48px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.16);
        }
        .clear-input{
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(10px);
        }
        .clear-input:focus{ background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.20); outline:none }
        .left-glass{
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(36px) saturate(1.8);
          -webkit-backdrop-filter: blur(36px) saturate(1.8);
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 20px 60px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.14);
        }
        .nav-btn{
          width: 48px; height: 48px; border-radius: 14px;
          display:flex; align-items:center; justify-content:center;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.60);
          transition: all 0.22s ease;
          position:relative;
        }
        .nav-btn:hover{ background: rgba(255,255,255,0.12); color: white; border-color: rgba(255,255,255,0.16) }
        .nav-btn.active{ background: white; color: black; border-color: white; box-shadow: 0 8px 24px rgba(255,255,255,0.28) }
        .nav-btn.pro.active{ background: #E8FF86; color: black; border-color: #E8FF86; box-shadow: 0 8px 24px rgba(232,255,134,0.38) }

        .glass-container{ display:flex; gap:20px; overflow-x:auto; padding:24px 20px 36px; scroll-snap-type:x mandatory; scrollbar-width:none; }
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
        .glass:hover{ transform: rotate(0deg) translateY(-6px) scale(1.02); z-index:10; }
        .glass.selected{ transform: rotate(0deg) translateY(-4px) scale(1.03); border-color:white; box-shadow: 0 16px 40px rgba(0,0,0,0.3), 0 0 0 1px white; }
        .glass-preview-wrap{padding:12px; height:100%; display:flex; flex-direction:column; gap:10px}
        .glass-preview-header{height:36px; border-radius:12px; display:flex; align-items:center; justify-content:space-between; padding:0 12px; font-size:10px; font-weight:700; letter-spacing:0.05em}
        .glass-preview-body{display:flex; flex-direction:column; gap:8px; flex:1}
        .glass-lock-overlay{position:absolute; inset:0; background:rgba(248,247,245,0.88); backdrop-filter:blur(12px); border-radius:22px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding:16px}
        .adv-grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:14px}
        .adv-card{position:relative; height:210px; background: rgba(255,255,255,0.06); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.10); border-radius:20px; padding:16px; text-align:left; transition:all 0.22s; overflow:hidden}
        .adv-card:hover{border-color:rgba(255,255,255,0.18); transform:translateY(-2px); background:rgba(255,255,255,0.09)}
        .adv-card.selected{border-color:rgba(255,255,255,0.85); background:rgba(255,255,255,0.12); box-shadow:0 0 0 1px rgba(255,255,255,0.5)}
        .adv-card-lock-overlay{position:absolute; inset:0; background:rgba(10,10,12,0.72); backdrop-filter:blur(16px); display:flex; flex-direction:column; align-items:center; justify-content:center; border-radius:20px; padding:12px}
        .radio-container{position:relative; display:flex; flex-direction:column; gap:10px;}
        .radio-container input{display:none}
        .radio-container label{position:relative; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.10); border-radius:16px; padding:14px 16px; cursor:pointer; transition:all 0.22s; backdrop-filter:blur(12px)}
        .radio-container input:checked + label{background:rgba(255,255,255,0.12); border-color:white; box-shadow:0 0 0 1px white}
      `}</style>

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden md:flex w-[96px] shrink-0 pl-4 py-4">
          <div className="left-glass rounded-[24px] p-3 flex flex-col items-center gap-3 sticky top-4 h-[calc(100vh-32px)]">
            <div className="w-10 h-10 rounded-[12px] bg-white text-black flex items-center justify-center font-bold text-[14px]">D</div>
            <div className="w-full h-[1px] bg-white/10" />
            {navItems.map((item:any)=>(
              <button key={item.id} onClick={()=>setActiveTab(item.id)} className={`nav-btn group ${activeTab===item.id?'active':''} ${item.pro?'pro':''}`} title={item.label}>
                {item.icon}
                {item.count!==undefined && <span className={`absolute -top-1 -right-1 text-[9px] font-bold px-1 h-4 rounded-full flex items-center ${activeTab===item.id?'bg-black text-white':'bg-[#E8FF86] text-black'}`}>{item.count}</span>}
                <span className="absolute left-[60px] hidden group-hover:block bg-white text-black text-[11px] px-3 py-1 rounded-full whitespace-nowrap shadow-lg">{item.label}</span>
              </button>
            ))}
            <div className="w-full h-[1px] bg-white/10 my-1 mt-auto" />
            <button onClick={handleLogout} className="nav-btn !bg-red-500/10 !border-red-500/20 !text-red-300 hover:!bg-red-500/20" title="Logout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-500 to-black border border-white/10 flex items-center justify-center text-[12px] font-bold">A</div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-20 px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="md:hidden w-8 h-8 rounded-[10px] bg-white text-black flex items-center justify-center font-bold">D</div>
              <div className="leading-tight">
                <div className="font-semibold text-[14px] tracking-tight">DukaanWhats.pk</div>
                <div className="text-[10px] text-white/40 tracking-wide">ANIMATED GREEN OS • {theme}</div>
              </div>
              <div className="hidden md:flex ml-4"><CurrentPlanButton /></div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={slug ? `/s/${slug}` : '#'} target="_blank" className="h-9 px-5 bg-white text-black rounded-full text-[12px] font-semibold hover:bg-white/90">View Store ↗</Link>
            </div>
          </header>

          <main className="px-4 md:px-8 pb-28 md:pb-8 space-y-6 max-w-[1200px]">
            {activeTab==='themes' && (
              <div className="clear-panel rounded-[28px] p-6 md:p-8">
                <div className="flex flex-wrap justify-between gap-3">
                  <h2 className="text-[15px] font-semibold">Themes <span className="font-normal text-white/40 text-[13px]">— Current: {currentPlanDef.name}</span></h2>
                  <CurrentPlanButton />
                </div>

                <div className="mt-8 mb-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest bg-white text-black px-3 py-1.5 rounded-full">8 ADVANCED THEMES</span>
                </div>
                <div className="adv-grid">
                  {finalAdvancedList.map(t => { const isActive = theme===t.id; const locked = isThemeLocked(t); return (
                    <button key={t.id} onClick={()=>handleThemeClick(t)} className={`adv-card ${isActive?'selected':''}`}>
                      {isActive && <span className="absolute top-3 right-3 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-[11px] font-bold">✓</span>}
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-9 h-9 rounded-[10px] bg-white/10 border border-white/10 flex items-center justify-center text-white text-[13px]">{t.name?.[0]}</div>
                        <div className="min-w-0 flex-1"><div className="text-[13px] font-semibold truncate text-white">{t.name}</div><div className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">ADVANCED</div></div>
                      </div>
                      <div className="mt-4 w-full h-[84px] rounded-[12px] bg-white/[0.06] border border-white/10 p-2 flex gap-2">
                        <div className="w-8 h-full rounded-[8px]" style={{background:t.colors?.accent || '#fff'}} />
                        <div className="flex-1 flex flex-col gap-1.5"><div className="h-2 w-3/4 bg-white/15 rounded-full" /><div className="h-2 w-1/2 bg-white/10 rounded-full" /><div className="mt-auto h-5 w-full bg-white/10 border border-white/10 rounded-[8px]" /></div>
                      </div>
                      {locked && <div className="adv-card-lock-overlay"><GlassLockIcon size={40} /><div className="text-[10px] font-bold tracking-widest mt-1 text-white">LOCKED</div></div>}
                    </button>
                  )})}
                </div>

                <div className="mt-10 rounded-[24px] border border-white/10 overflow-hidden clear-panel">
                  <div className="p-5 md:p-6 border-b border-white/10 bg-white/[0.03] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3"><span className="bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest">6 GLASS THEMES</span><span className="font-semibold text-[13px] text-white">Glass Collection — Premium Only</span></div>
                  </div>
                  <div className="bg-black/20 relative">
                    <div className="glass-container">
                      {premiumThemes.map((t,i)=>{
                        const isActive=theme===t.id;
                        const locked=isThemeLocked(t);
                        const r = isActive ? 0 : (GLASS_TILTS[i % GLASS_TILTS.length]); 
                        return (
                          <div key={t.id} className={`glass ${isActive?'selected':''}`} style={{'--r':r, scrollSnapAlign:'start'} as any} onClick={()=>handleThemeClick(t)}>
                            <div className="glass-preview-wrap">
                              <div className="glass-preview-header" style={{background:t.colors?.bg || 'rgba(255,255,255,0.12)', color:t.colors?.text || '#fff'}}>
                                <span className="tracking-widest">{t.id.slice(0,14).toUpperCase()} • PREMIUM</span>
                              </div>
                              <div className="glass-preview-body">
                                <div className="h-8 rounded-[10px] border border-white/10" style={{background:t.colors?.card || 'rgba(255,255,255,0.08)'}} />
                                <div className="flex gap-2"><div className="flex-1 h-16 rounded-[12px] bg-white/10 border border-white/10" /><div className="flex-1 h-16 rounded-[12px] bg-white/10 border border-white/10" /></div>
                                <div className="h-8 rounded-[10px] bg-white/90" />
                              </div>
                            </div>
                            {locked && (<div className="glass-lock-overlay"><GlassPremiumLock size={56} /><div className="text-black text-[12px] font-black tracking-widest mt-1">PREMIUM LOCKED</div></div>)}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-8">
                  <span className="text-[11px] text-white/30">Products {products.length}/{productLimit===999999?'∞':productLimit}</span>
                  <button onClick={saveStore} className="h-10 px-6 bg-white text-black text-[13px] font-semibold rounded-full">Save Store & Theme</button>
                </div>
              </div>
            )}

            {activeTab==='store' && (
              <div className="clear-panel rounded-[28px] p-6 md:p-8">
                <h2 className="font-semibold text-[15px]">Store Identity</h2>
                <div className="mt-5 clear-glass rounded-[16px] p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold">{currentPlanDef.name[0]}</div>
                  <div><div className="text-[13px] font-semibold text-white">{currentPlanDef.name} • {productLimit===999999?'∞':productLimit} products</div><div className="text-[11px] text-white/40">{currentPlanDef.features.join(' • ')}</div></div>
                </div>
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-bold tracking-widest uppercase text-white/40">Business Name</label><input value={businessName} onChange={e=>setBusinessName(e.target.value)} className="mt-2 w-full h-11 px-4 rounded-[12px] clear-input text-[13px] text-white" /></div>
                  <div><label className="text-[10px] font-bold tracking-widest uppercase text-white/40">WhatsApp Number</label><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} className="mt-2 w-full h-11 px-4 rounded-[12px] clear-input text-[13px] text-white" /></div>
                  <div className="md:col-span-2"><label className="text-[10px] font-bold tracking-widest uppercase text-white/40">Store Slug</label><input value={slug} onChange={e=>setSlug(e.target.value)} className="mt-2 w-full h-11 px-4 rounded-[12px] clear-input text-[13px] text-white" /></div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button onClick={saveStore} disabled={saving} className="h-11 px-7 bg-white text-black rounded-full text-[13px] font-semibold">{saving?'Saving...':'Save Store'}</button>
                  <button onClick={copyLink} className="h-11 px-6 border border-white/15 bg-white/5 rounded-full text-[13px] text-white">{copied?'Copied!':'Copy Link'}</button>
                </div>
                {profile && (
                  <div className="mt-8">
                    <h3 className="font-semibold text-[13px] text-white">Premium Editor</h3>
                    <div className="mt-3 clear-glass rounded-[16px] p-2">
                      <PremiumThemeEditor profile={{...profile, premium_custom: premiumCustom} as any} onSave={(d:any)=>{ setPremiumCustom(d); setProfile({...profile, premium_custom: d} as any) }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab==='products' && (
              <div className="space-y-4">
                <div className="clear-panel rounded-[28px] p-6 md:p-8">
                  <div className="flex items-center justify-between"><h2 className="font-semibold text-[14px] text-white">Add Product</h2><div className="text-[11px] text-white/40">{products.length}/{productLimit===999999?'∞':productLimit}</div></div>
                  <label className="mt-6 group clear-glass rounded-[20px] border-dashed border-white/15 p-8 flex flex-col items-center justify-center cursor-pointer hover:border-white/25 min-h-[160px]">
                    {previews.length ? (
                      <div className="grid grid-cols-5 gap-2.5 w-full">
                        {previews.map((src,i)=><div key={i} className="relative"><img src={src} className="w-full h-[72px] object-cover rounded-[12px] border border-white/20" /><button type="button" onClick={(e)=>{e.preventDefault(); removeFileAt(i)}} className="absolute -top-2 -right-2 w-5 h-5 bg-white text-black rounded-full text-[10px]">✕</button></div>)}
                      </div>
                    ) : (<><UploadIcon /><div className="mt-4 text-[14px] font-semibold text-white">Drop images or click</div></>)}
                    <input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
                  </label>
                  <div className="mt-6 grid md:grid-cols-2 gap-3">
                    <input placeholder="Product name *" value={prodName} onChange={e=>setProdName(e.target.value)} className="w-full h-11 px-4 rounded-[12px] clear-input text-[13px] text-white" />
                    <input placeholder="Price Rs. *" type="number" value={prodPrice} onChange={e=>setProdPrice(e.target.value)} className="w-full h-11 px-4 rounded-[12px] clear-input text-[13px] text-white" />
                    <input placeholder="Compare price" type="number" value={prodOrigPrice} onChange={e=>setProdOrigPrice(e.target.value)} className="w-full h-11 px-4 rounded-[12px] clear-input text-[13px] text-white" />
                    <select value={prodCategory} onChange={e=>setProdCategory(e.target.value)} className="w-full h-11 px-4 rounded-[12px] clear-input text-[13px] text-white"><option className="bg-black">General</option><option className="bg-black">Clothing</option><option className="bg-black">Shoes</option><option className="bg-black">Other</option></select>
                    <input placeholder="Stock" type="number" value={prodStock} onChange={e=>setProdStock(e.target.value)} className="w-full h-11 px-4 rounded-[12px] clear-input text-[13px] text-white" />
                    <input placeholder="Sizes" value={prodSizes} onChange={e=>setProdSizes(e.target.value)} className="w-full h-11 px-4 rounded-[12px] clear-input text-[13px] text-white" />
                    <input placeholder="Colors" value={prodColors} onChange={e=>setProdColors(e.target.value)} className="md:col-span-2 w-full h-11 px-4 rounded-[12px] clear-input text-[13px] text-white" />
                    <textarea placeholder="Description..." value={prodDesc} onChange={e=>setProdDesc(e.target.value)} className="md:col-span-2 w-full min-h-[80px] p-4 rounded-[12px] clear-input text-[13px] text-white resize-none" />
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                    {editingId && <button onClick={cancelEdit} className="h-11 px-6 border border-white/15 bg-white/5 rounded-full text-[13px] text-white">Cancel</button>}
                    <button onClick={addProduct} disabled={uploading} className="h-11 px-7 bg-white text-black text-[13px] font-semibold rounded-full">{uploading?'Uploading...':`${editingId?'Update':'Add'} Product →`}</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {products.map(p => (<PremiumProductCard key={p.id} p={p} onEdit={startEdit} onDelete={deleteProduct} themeId={theme} imageLimit={imageLimit} />))}
                </div>
              </div>
            )}

            {activeTab==='analytics' && (
              <div>
                {!profile ? <div className="p-8 text-center text-white/50">Loading...</div> : currentPlanId === 'premium' ? (
                  <div className="clear-panel rounded-[28px] p-2"><RealAnalytics userId={profile!.id} currentPlanId={currentPlanId} /></div>
                ) : (
                  <div className="clear-panel rounded-[28px] p-8 text-center"><h3 className="font-semibold text-[16px] text-white">Analytics Locked — Premium Only</h3><button onClick={()=>setActiveTab('payments')} className="mt-4 h-10 px-6 bg-white text-black rounded-full text-[12px] font-semibold">Upgrade → Premium</button></div>
                )}
              </div>
            )}

            {activeTab==='payments' && (
              <div className="clear-panel rounded-[28px] p-6 md:p-8">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h2 className="font-semibold text-[16px] text-white">Pro Plans — Till {TILL_ID}</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>setBilling('monthly')} className={`h-8 px-4 rounded-full text-[11px] font-bold border ${billing==='monthly'?'bg-white text-black border-white':'bg-white/10 text-white/60 border-white/10'}`}>Monthly</button>
                    <button onClick={()=>setBilling('yearly')} className={`h-8 px-4 rounded-full text-[11px] font-bold border ${billing==='yearly'?'bg-white text-black border-white':'bg-white/10 text-white/60 border-white/10'}`}>Yearly</button>
                  </div>
                </div>
                <div className="mt-6 grid md:grid-cols-3 gap-4">
                  <div className="clear-glass rounded-[20px] p-5">
                    <div className="text-[10px] tracking-widest text-white/40 font-bold">JAZZCASH TILL ID</div>
                    <div className="mt-3 flex items-center gap-2"><span className="font-mono text-[20px] font-bold tracking-widest text-white">{TILL_ID}</span><button onClick={copyTill} className="h-7 px-3 rounded-full bg-white/10 text-[10px] text-white border border-white/10">{copiedTill?'Copied!':'Copy'}</button></div>
                    <div className="mt-3 bg-white rounded-[14px] p-3"><img src={`https://barcodeapi.org/api/code128/${TILL_ID}`} alt="Barcode" className="w-full h-[48px] object-contain"/><div className="text-center text-[11px] font-mono text-black font-black tracking-[0.3em] mt-1">{TILL_ID}</div></div>
                    <div className="mt-3 bg-white rounded-[14px] p-3 flex justify-center"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=JAZZCASH_TILL_${TILL_ID}`} alt="QR" className="w-[120px] h-[120px]"/></div>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div className="radio-container">
                      {plans.map(p=>{
                        const displayPrice = getDisplayPrice(p)
                        const isSelected = selectedPlan?.id===p.id
                        const isCurrent = currentPlanId===p.id
                        return (
                          <div key={p.id} className="contents">
                            <input type="radio" id={`dash-${p.id}`} name="dash-plan" checked={isSelected} onChange={()=>setSelectedPlan(p)} />
                            <label htmlFor={`dash-${p.id}`} onClick={()=>setSelectedPlan(p)} className={isCurrent?'!bg-white/15 !border-white' : ''}>
                              <div className="flex justify-between items-start gap-3">
                                <div className="min-w-0 flex-1"><div className="flex items-center gap-2 flex-wrap"><span className="font-bold text-[14px] text-white">{p.name}</span>{isCurrent && <span className="bg-white text-black text-[8px] px-2 h-5 rounded-full font-bold">CURRENT</span>}<span className={`text-[10px] px-2.5 h-6 rounded-full font-bold ${p.id==='premium'?'bg-[#E8FF86] text-black':p.id==='advanced'?'bg-white text-black':'bg-white/10 text-white border border-white/10'}`}>Rs. {displayPrice}/mo</span></div><div className="text-[11px] mt-1.5 opacity-60 text-white">{p.features.join(' • ')}</div></div>
                              </div>
                            </label>
                          </div>
                        )
                      })}
                    </div>
                    {selectedPlan && selectedPlan.monthly>0 && (
                      <div className="rounded-[20px] border border-white/15 bg-white/10 backdrop-blur p-5">
                        <input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder={`Txn ID after paying to Till ${TILL_ID}`} className="w-full h-12 px-4 rounded-[12px] border bg-black/30 text-white border-white/10 text-[12px] font-mono"/>
                        <button onClick={handleBuyPlan} disabled={purchasing} className="mt-3 w-full h-12 bg-white text-black rounded-full font-bold text-[13px]">{purchasing?'Submitting...':`I Paid — Activate ${selectedPlan.name}`}</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        <div className="md:hidden fixed bottom-4 left-4 right-4 z-30">
          <div className="left-glass rounded-[24px] p-2 flex items-center justify-between gap-1">
            {navItems.map((item:any)=>(
              <button key={item.id} onClick={()=>setActiveTab(item.id)} className={`flex-1 h-12 rounded-[16px] flex flex-col items-center justify-center gap-0.5 ${activeTab===item.id?'bg-white text-black':'text-white/50'}`}>
                <span>{item.icon}</span><span className="text-[9px] font-medium">{item.label}</span>
              </button>
            ))}
            <button onClick={handleLogout} className="h-12 w-12 rounded-[16px] bg-red-500/10 text-red-300 flex items-center justify-center">↪</button>
          </div>
        </div>
      </div>

      {errorMsg && <div className="fixed bottom-24 md:bottom-4 right-4 z-50 bg-red-500/90 backdrop-blur text-white px-4 py-2 rounded-full text-[12px]">{errorMsg}</div>}
    </div>
  )
}
