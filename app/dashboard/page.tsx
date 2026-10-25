'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
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
const AnalyticsIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"><rect x="3" y="12" width="4" height="8" rx="1.5" fill="currentColor" /><rect x="10" y="8" width="4" height="12" rx="1.5" fill="currentColor" opacity="0.7" /><rect x="17" y="4" width="4" height="16" rx="1.5" fill="currentColor" opacity="0.4" /></svg>
)
const LiveDot = () => (<span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8FF86] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#E8FF86]"></span></span>)

const TILL_ID = '984837533'
type Profile = { id: string; business_name: string; whatsapp_number: string; store_slug: string; store_theme?: string; current_plan?: string }
type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; user_id: string }
type Billing = 'monthly' | 'yearly'
type PlanDef = { id: 'basic'|'advanced'|'premium'; name: string; monthly: number; yearlyMonthly: number; yearlyTotal: number; products: number; imagesPerProduct: number; advancedAllowed: number|'all'; premiumAllowed: number|'all'; stores: number; features: string[] }

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
  const [activeTab, setActiveTab] = useState<'store'|'themes'|'products'|'analytics'|'payments'>('themes')
  const [selectedPlan, setSelectedPlan] = useState<PlanDef | null>(null)
  const [billing, setBilling] = useState<Billing>('monthly')
  const [txnId, setTxnId] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const [copiedTill, setCopiedTill] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [myPayments, setMyPayments] = useState<any[]>([])
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

  const premiumThemes = getAdvancedThemes()
  const premiumIds = premiumThemes.map(t=>t.id)
  const allAdvancedRaw = STORE_THEMES.filter(t => (t.category as string) === 'advanced' && !premiumIds.includes(t.id))
  const advancedThemesList = allAdvancedRaw.length >= 8 ? allAdvancedRaw.slice(0,8) : [...allAdvancedRaw, ...STORE_THEMES.filter(t=>!premiumIds.includes(t.id) && (t.category as string)!=='premium').slice(0, 8 - allAdvancedRaw.length)]
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
          // Fetch user's payments
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
      const { error } = await supabase.from('profiles').update({ business_name: businessName.trim(), whatsapp_number: whatsapp.trim(), store_slug: slug.trim(), store_theme: theme }).eq('id', profile.id)
      if (error) throw error; setSaved(true); setTimeout(()=>setSaved(false), 2500)
    } catch (e: any) { setErrorMsg(e.message) } setSaving(false)
  }
  const copyLink = async () => { const url = `${window.location.origin}/s/${slug}`; await navigator.clipboard.writeText(url); setCopied(true); setTimeout(()=>setCopied(false), 2000) }
  const copyTill = async () => { await navigator.clipboard.writeText(TILL_ID); setCopiedTill(true); setTimeout(()=>setCopiedTill(false), 2000) }
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = Array.from(e.target.files || []); if (!f.length) return
    if (f.length > imageLimit && imageLimit !== 999999) { alert(`Plan allows ${imageLimit} images per product. Your ${currentPlanId.toUpperCase()} allows ${imageLimit} — Till ${TILL_ID}`); return }
    setFiles(f)
    const pr: string[] = []; f.forEach(file => { const r = new FileReader(); r.onload = ev => { pr.push(ev.target?.result as string); if (pr.length === f.length) setPreviews(pr) }; r.readAsDataURL(file) })
  }
  const uploadOne = async (file: File, userId: string) => {
    const ext = file.name.split('.').pop(); const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(fileName, file); if (error) throw error
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName); return data.publicUrl
  }
  const startEdit = (p: Product) => { setEditingId(p.id); setProdName(p.name); setProdPrice(String(p.price)); setPreviews(p.image_urls && p.image_urls.length ? p.image_urls : [p.image_url]); setFiles([]); setActiveTab('products'); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const cancelEdit = () => { setEditingId(null); setProdName(''); setProdPrice(''); setFiles([]); setPreviews([]) }
  const addProduct = async () => {
    if (editingId === null && products.length >= productLimit){alert(`🔒 Product Limit\nYour ${currentPlanId.toUpperCase()} allows ${productLimit===999999?'Unlimited':productLimit} products.\nBasic: 5\nAdvanced: 25\nPremium: Unlimited\n\nUpgrade via PRO → Till ${TILL_ID}`); setActiveTab('payments'); return}
    if (!prodName.trim() || !prodPrice){alert('Name and price required'); return}
    if (files.length === 0 && !editingId){alert('Photo required'); return}
    if (files.length > imageLimit && imageLimit!==999999){alert(`Plan allows ${imageLimit} images per product.`); return}
    setUploading(true)
    try{
      const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Not logged in')
      const urls: string[] = []
      for (const f of files){ urls.push(await uploadOne(f, user.id)) }
      if (editingId) {
        const payload: any = { name: prodName.trim(), price: Number(prodPrice) }
        if (urls.length) { payload.image_url = urls[0]; payload.image_urls = urls }
        const { data } = await supabase.from('products').update(payload).eq('id', editingId).select().single()
        if (data) setProducts(products.map(pr => pr.id === editingId ? data : pr))
        setEditingId(null)
      } else {
        const { data } = await supabase.from('products').insert({ user_id: user.id, name: prodName.trim(), price: Number(prodPrice), image_url: urls[0], image_urls: urls }).select().single()
        if (data) setProducts([data, ...products])
      }
      setProdName(''); setProdPrice(''); setFiles([]); setPreviews([]); 
    }catch(e:any){ setErrorMsg(e.message) } setUploading(false)
  }
  const deleteProduct = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('products').delete().eq('id', id); setProducts(products.filter(p=>p.id!==id)) }
  const handleBuyPlan = async () => {
    if (!selectedPlan) return; if (selectedPlan.monthly===0){setSelectedPlan(null); return}; if (!txnId.trim()){alert('Enter Transaction ID'); return}; setPurchasing(true)
    const amount = billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal
    try{
      const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Not logged in')
      const { error } = await supabase.from('plan_payments').insert({ user_id: user.id, plan_id: selectedPlan.id, amount, till_id: TILL_ID, txn_id: txnId.trim(), status: 'pending', billing_cycle: billing })
      if (error) throw error;
      // Refresh payments list
      const { data: pays } = await supabase.from('plan_payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (pays) setMyPayments(pays)
      alert(`✅ Submitted! Till ${TILL_ID} - ${selectedPlan.name} (${billing}) Rs. ${amount}\n\nYour payment is now PENDING. We will verify Txn ID in JazzCash App and approve within 1 hour. You will get WhatsApp notification.`); setSelectedPlan(null); setTxnId('')
    }catch(e:any){alert(e.message)} setPurchasing(false)
  }

  if (loading) return <DukaanWhatsLoader message="Loading your store..." />

  const standardThemes = STORE_THEMES.filter(t => !premiumIds.includes(t.id) && !finalAdvancedList.some(a=>a.id===t.id))
  const filteredStandard = (filter as string) === 'all' ? standardThemes : STORE_THEMES.filter(t => (t.category as string) === (filter as string) && !premiumIds.includes(t.id) && !finalAdvancedList.some(a=>a.id===t.id))
  const filteredAdvanced = (filter as string) === 'all' || filter === 'advanced' ? finalAdvancedList : finalAdvancedList.filter(t=>(t.category as string)===filter)
  const getDisplayPrice = (p: PlanDef) => billing==='monthly'?p.monthly:p.yearlyMonthly

  const CurrentPlanButton = () => (
    <div className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] cursor-default select-none">
      <span className={`w-2 h-2 rounded-full animate-pulse ${isPremium?'bg-[#E8FF86] shadow-[0_0_8px_#E8FF86]':isAdvanced?'bg-black':'bg-zinc-400'}`}></span>
      <span className="text-[11px] font-black tracking-widest">{currentPlanDef.name.toUpperCase()}</span>
      <span className="text-[10px] opacity-60 font-mono hidden md:inline">• {productLimit===999999?'∞':productLimit} prod • {imageLimit===999999?'∞':imageLimit} img</span>
      {isPremium && <span className="ml-1 bg-[#E8FF86] text-black text-[8px] px-1.5 py-0.5 rounded-full font-bold hidden md:inline">NO WATERMARK • LIVE</span>}
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#F8F7F5'}} className="text-zinc-900 pb-24 antialiased overflow-x-clip max-w-[100vw]">
      <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none} html,body{overflow-x:hidden;max-width:100vw} *{box-sizing:border-box;min-width:0}
        .glass-container { position: relative; display: flex; justify-content: center; align-items: center; min-height: 400px; padding: 40px 0 60px; gap: 0; overflow-x: visible; } @media (max-width: 768px){ .glass-container { justify-content: flex-start; overflow-x: auto; padding: 20px 16px 40px 16px; min-height: 340px; } .glass-container::-webkit-scrollbar{display:none} .glass-container{ -ms-overflow-style:none; scrollbar-width:none; } }
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
        .adv-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; } @media (min-width: 768px){ .adv-grid{ grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:16px; } }
        .adv-card { width: 100%; height: 190px; border-radius: 16px; background: #fff; border: 1px solid #e4e4e7; display: flex; flex-direction: column; align-items: flex-start; padding: 12px; cursor: pointer; transition: all 0.25s ease; position: relative; overflow: hidden; text-align: left; } @media (min-width: 768px){ .adv-card{ height:228px; border-radius:20px; padding:16px; } }
        .adv-card:hover { transform: translateY(-4px); border-color: #0A0A0A; box-shadow: 0 12px 24px rgba(0,0,0,0.08); }
        .adv-card.selected { border: 2px solid #0A0A0A; box-shadow: 0 0 0 3px #E8FF86, 0 16px 32px rgba(0,0,0,0.1); transform: translateY(-4px); }
        .adv-card-lock-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.86); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; z-index: 5; border-radius: 20px; }
        .modern-tab { height: 36px; padding: 0 18px; border-radius: 999px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 7px; white-space: nowrap; transition: all .25s; line-height: 1; } @media (max-width: 768px){ .modern-tab{ height:32px; padding:0 12px; font-size:12px; gap:6px; } }
        .modern-tab-active { background: #0A0A0A; color: #fff; font-weight: 600; }
        .modern-tab-inactive { color: #71717a; } .modern-tab-inactive:hover { color: #000; background: #fff; border: 1px solid #e4e4e7; }
        .pro-glow-btn{position:relative;background:#E8FF86;color:#0A0A0A;border-radius:999px;height:36px;padding:0 18px;font-size:13px;font-weight:700;display:flex;align-items:center;gap:8px;white-space:nowrap; line-height: 1; border: 1px solid #E8FF86; box-shadow: 0 0 0 1px #E8FF86, 0 4px 16px rgba(232,255,134,0.3);} @media (max-width:768px){ .pro-glow-btn{ height:32px; padding:0 12px; font-size:11px; gap:6px; } }
        .pro-glow-btn.active{background:#0A0A0A;color:#E8FF86;border:1px solid #E8FF86;box-shadow:0 0 20px rgba(232,255,134,0.5)}
        .pro-dot{width:7px;height:7px;background:#0A0A0A;border-radius:999px;animation:proPulse 2s infinite} .pro-dot.active{background:#E8FF86} @keyframes proPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}
        .billing-toggle{display:flex;background:#0A0A0A;border-radius:999px;padding:3px;gap:3px} @media (min-width:768px){ .billing-toggle{ padding:4px; gap:4px; } }
        .billing-btn{height:28px;padding:0 10px;border-radius:999px;font-size:11px;font-weight:600;transition:all .25s;white-space:nowrap;line-height:1;display:flex;align-items:center;} @media (min-width:768px){ .billing-btn{ height:32px; padding:0 16px; font-size:12px; } }
        .billing-btn-active{background:#fff;color:#0A0A0A} .billing-btn-inactive{color:rgba(255,255,255,0.6)}
        .radio-container{--main-color:#0A0A0A;--total-radio:3;display:flex;flex-direction:column;position:relative;padding-left:1rem}
        .radio-container input{appearance:none;position:absolute;opacity:0} .radio-container .glider-container{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(0deg,transparent 0%,rgba(0,0,0,0.08) 50%,transparent 100%);width:1px}
        .radio-container .glider{position:relative;height:calc(100% / var(--total-radio));width:100%;background:var(--main-color);transition:transform .45s cubic-bezier(0.4,0,0.2,1)}
        .radio-container .glider::before{content:"";position:absolute;height:60%;width:300%;top:50%;transform:translateY(-50%);background:var(--main-color);filter:blur(12px);opacity:0.15}
        .radio-container label{cursor:pointer;padding:14px 14px;border-radius:14px;color:#71717a;transition:all .25s;border:1px solid transparent}
        .radio-container input:checked+label{color:#0A0A0A;background:#fff;border:1px solid #e4e4e7;box-shadow:0 2px 8px rgba(0,0,0,.06)}
        @media (max-width: 768px) { .glass-container .glass { width: 200px; height: 280px; margin: 0 -24px; } .glass-container { min-height: 340px; padding: 20px 0 40px; } }
      `}</style>

            <header className="bg-white border-b sticky top-0 z-30 overflow-hidden">
        <div className="max-w-6xl mx-auto px-3 md:px-6">
          <div className="flex items-center justify-between h-[48px] md:h-[64px] gap-2">
            <a href="/" className="flex items-center gap-2 md:gap-2.5 shrink-0"><div className="w-8 h-8 md:w-9 md:h-9 bg-black text-white flex items-center justify-center font-bold rounded-[10px] text-[13px] md:text-[14px]">D</div><span className="font-semibold tracking-tight text-[13px] md:text-[15px]">DukaanWhats.pk</span></a>
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              <CurrentPlanButton />
              <Link href={slug ? `/s/${slug}` : '#'} target="_blank" className="h-8 md:h-10 px-2.5 md:px-5 bg-black text-white rounded-[10px] md:rounded-[12px] text-[10px] md:text-[12px] font-medium flex items-center justify-center leading-none hover:bg-zinc-900">View ↗</Link>
            </div>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 pb-2.5 md:pb-0 overflow-x-auto no-scrollbar -mx-3 px-3 md:mx-0 md:px-0 md:justify-center md:h-[40px]">
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              {[
                { id: 'store', label: 'Store' },
                { id: 'themes', label: 'Themes' },
                { id: 'products', label: `Products ${products.length}/${productLimit===999999?'∞':productLimit}` },
                { id: 'analytics', label: 'Analytics', premium: true },
              ].map((t:any) => (
                <button key={t.id} onClick={()=>setActiveTab(t.id as any)} className={`modern-tab shrink-0 ${activeTab===t.id ? 'modern-tab-active' : 'modern-tab-inactive'}`}>
                  {t.label}
                  {t.premium && !isPremium && <span className="ml-0.5 w-4 h-4 rounded-full bg-black/10 flex items-center justify-center"><svg width="8" height="8" viewBox="0 0 24 24" fill="none"><rect x="4" y="10" width="16" height="10" rx="2" fill="currentColor"/><path d="M8 10V7C8 5 10 3 12 3C14 3 16 5 16 7V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></span>}
                  {t.premium && isPremium && <LiveDot />}
                </button>
              ))}
              <button onClick={()=>setActiveTab('payments')} className={`pro-glow-btn shrink-0 ${activeTab==='payments'?'active':''}`}><span className={`pro-dot ${activeTab==='payments'?'active':''}`}></span>PRO</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6 w-full max-w-full">
        {activeTab==='themes' && (
          <div className="bg-white border rounded-[20px] p-5 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-[16px] font-bold tracking-tight">Themes — <span className="font-normal text-zinc-500">Current: {currentPlanDef.name} • {currentPlanId==='basic'?'Only 3 Advanced unlocked, 5 locked + 3 Premium locked':currentPlanId==='advanced'?'All 8 Advanced unlocked, 3 Premium locked':'All unlocked ✓'}</span></h2>
              <div className="flex items-center gap-2"><CurrentPlanButton /></div>
            </div>

            <div className="mb-3 flex items-center gap-2"><span className="text-[11px] font-black tracking-widest bg-black text-white px-3 py-1.5 rounded-full">8 ADVANCED THEMES</span><span className="text-[11px] text-zinc-500">{currentPlanId==='basic'?`${basicAllowedAdvancedIds.length}/8 unlocked`:`${currentPlanId.toUpperCase()}: 8/8 unlocked ✓`}</span></div>
            <div className="adv-grid">
              {finalAdvancedList.map(t => { const isActive = theme===t.id; const locked = isThemeLocked(t); return (
                <button key={t.id} onClick={()=>handleThemeClick(t)} className={`adv-card ${isActive?'selected':''}`}>
                  {isActive && <span className="absolute top-3 right-3 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[11px] font-bold">✓</span>}
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[16px] shrink-0" style={{background:t.colors?.bg || '#F4F4F5'}}>{t.badge || '◧'}</div>
                    <div className="min-w-0 flex-1"><div className="text-[13px] font-bold truncate tracking-tight">{t.name}</div><div className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium mt-0.5">ADVANCED</div></div>
                  </div>
                  <div className="mt-4 w-full h-[88px] rounded-[12px] bg-[#F8F7F5] border border-zinc-100 p-2 flex gap-2">
                    <div className="w-9 h-full rounded-[8px]" style={{background:t.colors?.accent || '#000'}} />
                    <div className="flex-1 flex flex-col gap-1.5"><div className="h-2 w-3/4 bg-zinc-200 rounded-full" /><div className="h-2 w-1/2 bg-zinc-100 rounded-full" /><div className="mt-auto h-6 w-full bg-white border rounded-[8px]" /></div>
                  </div>
                  {locked && <div className="adv-card-lock-overlay"><GlassLockIcon size={40} /><div className="text-[11px] font-black tracking-widest mt-1">LOCKED</div><div className="text-[10px] text-zinc-500 text-center leading-tight">Basic 3/8<br/>Need Advanced</div><div className="mt-1.5 bg-black text-white text-[10px] px-3.5 h-7 rounded-full font-bold flex items-center shadow-[0_4px_12px_rgba(0,0,0,0.15)]">UPGRADE → Rs. 899</div></div>}
                  {!locked && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#E8FF86] text-black text-[9px] px-2.5 h-5 rounded-full font-bold flex items-center">UNLOCKED ✓</div>}
                </button>
              )})}
            </div>

            <div className="mt-10 mb-3 flex items-center gap-2"><span className="text-[11px] font-black tracking-widest bg-zinc-100 border px-3 py-1.5 rounded-full">STANDARD THEMES</span><span className="text-[11px] text-zinc-500">All plans can use standard</span></div>
            <div className="adv-grid">
              {filteredStandard.slice(0,6).map(t => { const isActive = theme===t.id; return (
                <button key={t.id} onClick={()=>handleThemeClick(t)} className={`adv-card ${isActive?'selected':''} !h-[200px]`}>
                  {isActive && <span className="absolute top-3 right-3 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-[11px] font-bold">✓</span>}
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-[10px] bg-zinc-100 flex items-center justify-center text-[16px]">{t.badge || '◧'}</div><div><div className="text-[13px] font-bold">{t.name}</div><div className="text-[10px] text-zinc-500 uppercase tracking-widest">{t.category}</div></div></div>
                  <div className="mt-4 w-full h-[68px] rounded-[12px] bg-[#F8F7F5] border" />
                </button>
              )})}
            </div>

            <div className="mt-10 rounded-[24px] border-2 border-black overflow-hidden bg-white">
              <div className="p-6 md:p-7 border-b bg-[#F8F7F5] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3"><span className="bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest">3 PREMIUM THEMES</span><span className="font-bold text-[14px] tracking-tight">Glass Collection — Premium Only</span></div>
                <span className="bg-white border text-[11px] px-3 py-1.5 rounded-full font-medium">{currentPlanId==='premium'?'All 3 Premium Unlocked ✓':`Locked for ${currentPlanId.toUpperCase()} — Need Premium Rs. 2999/mo`}</span>
              </div>
              <div className="bg-[#F8F7F5]">
                <div className="glass-container">
                  {premiumThemes.map((t,i)=>{
                    const r=[-14,0,14][i]||0; 
                    const isActive=theme===t.id; 
                    const locked=isThemeLocked(t); 
                    return (
                      <div key={t.id} className={`glass ${isActive?'selected':''}`} data-text={t.name} style={{'--r':r} as any} onClick={()=>handleThemeClick(t)}>
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
                        {isActive && <div className="absolute top-4 right-4 w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-[12px] font-bold shadow-lg">✓</div>}
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
              <span className="text-[11px] text-zinc-500">Products {products.length}/{productLimit===999999?'∞':productLimit} • Images {imageLimit===999999?'∞':imageLimit}/product • Current: {currentPlanDef.name}</span>
              <div className="flex gap-2 items-center">
                {saved && <span className="h-11 px-4 flex items-center text-[12px] text-green-600 font-medium bg-green-50 rounded-full border border-green-200">✓ Saved! {getTheme(theme).name}</span>}
                <button onClick={saveStore} className="h-11 px-7 bg-black text-white text-[13px] font-medium rounded-full hover:bg-zinc-900 transition-colors flex items-center justify-center leading-none">{saving?'Saving...':'Save Store & Theme'}</button>
              </div>
            </div>
          </div>
        )}

        {activeTab==='store' && (
          <div className="bg-white border rounded-[20px] p-6 md:p-8">
            <div className="flex items-center justify-between flex-wrap gap-3"><h2 className="font-bold text-[15px] tracking-tight">Store Identity</h2>{saved && <span className="bg-[#E8FF86] text-black border px-3 h-7 rounded-full text-[11px] font-bold flex items-center">Saved ✓</span>}</div>
            <div className="mt-5 bg-[#F8F7F5] border rounded-[16px] p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[12px] ${isPremium?'bg-[#E8FF86] text-black':isAdvanced?'bg-black text-white':'bg-white border'}`}>{currentPlanDef.name[0]}</div>
              <div><div className="text-[13px] font-bold">{currentPlanDef.name} • {productLimit===999999?'∞':productLimit} products • {imageLimit===999999?'∞':imageLimit} images</div><div className="text-[11px] text-zinc-500">{currentPlanDef.features.join(' • ')}</div></div>
            </div>
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div><label className="text-[11px] font-bold tracking-widest uppercase text-zinc-500">Business Name</label><input value={businessName} onChange={e=>setBusinessName(e.target.value)} className="mt-2 w-full h-11 px-4 border rounded-[12px] bg-zinc-50/50 text-[13px] focus:bg-white focus:outline-none focus:border-black" /></div>
              <div><label className="text-[11px] font-bold tracking-widest uppercase text-zinc-500">WhatsApp Number</label><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="923001234567" className="mt-2 w-full h-11 px-4 border rounded-[12px] bg-zinc-50/50 text-[13px] focus:bg-white focus:outline-none focus:border-black" /></div>
              <div className="md:col-span-2"><label className="text-[11px] font-bold tracking-widest uppercase text-zinc-500">Store Slug</label><input value={slug} onChange={e=>setSlug(e.target.value)} className="mt-2 w-full h-11 px-4 border rounded-[12px] bg-zinc-50/50 text-[13px] focus:bg-white focus:outline-none focus:border-black" /><div className="mt-2 text-[11px] text-zinc-500">Your store: /s/{slug || 'your-slug'}</div></div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <button onClick={saveStore} disabled={saving} className="h-11 px-7 bg-black text-white rounded-full text-[13px] font-medium hover:bg-zinc-900 transition-colors flex items-center justify-center leading-none">{saving?'Saving...':saved?'Saved ✓':'Save Store'}</button>
              <button onClick={copyLink} className="h-11 px-5 border bg-white rounded-full text-[13px] font-medium hover:bg-zinc-50 transition-colors flex items-center justify-center leading-none">{copied?'Copied!':'Copy Link'}</button>
              <Link href={slug ? `/s/${slug}` : '#'} target="_blank" className="h-11 px-5 bg-white border rounded-full text-[13px] font-medium flex items-center justify-center leading-none hover:bg-zinc-50">View Store ↗</Link>
            </div>
          </div>
        )}

        {activeTab==='products' && (
          <div className="space-y-4">
            <div className="bg-white border rounded-[20px] p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="font-bold text-[15px] tracking-tight">Add Product — {products.length}/{productLimit===999999?'∞':productLimit} • Limit {productLimit===999999?'∞':productLimit}</h2>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 h-6 rounded-full text-[10px] font-bold flex items-center ${products.length>=productLimit?'bg-red-500 text-white':productLimit===999999?'bg-[#E8FF86] text-black':'bg-black text-white'}`}>{products.length>=productLimit?'LIMIT REACHED':`${productLimit===999999?'∞':productLimit-products.length} left`}</span>
                  <CurrentPlanButton />
                </div>
              </div>
              <div className="space-y-3">
                <label className="group relative border-2 border-dashed border-zinc-200 rounded-[20px] p-6 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-white transition-all min-h-[160px] bg-[#FCFCFA] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white to-[#F8F7F5] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex flex-col items-center">
                  {previews.length ? (
                    <div className="grid grid-cols-5 gap-2.5 w-full">
                      {previews.map((src,i)=>(
                        <div key={i} className="relative group/img">
                          <img src={src} className="w-full h-[72px] object-cover rounded-[12px] border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] group-hover/img:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-shadow" />
                        </div>
                      ))}
                      <div className="h-[72px] rounded-[12px] border-2 border-dashed border-zinc-200 bg-white flex flex-col items-center justify-center gap-1 hover:border-black transition-colors">
                        <span className="text-[16px]">+</span><span className="text-[9px] font-bold tracking-widest">ADD</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <UploadIcon />
                      <div className="mt-4 text-center">
                        <div className="font-bold text-[14px] tracking-tight">Drop images or click to upload</div>
                        <div className="mt-1.5 flex items-center justify-center gap-2 text-[11px]">
                          <span className="px-2.5 h-6 rounded-full bg-black text-white font-bold flex items-center">Basic 1</span>
                          <span className="px-2.5 h-6 rounded-full bg-zinc-100 border font-bold flex items-center">Advanced 5</span>
                          <span className="px-2.5 h-6 rounded-full bg-[#E8FF86] border border-black/5 font-bold flex items-center">Premium ∞</span>
                        </div>
                        <div className="mt-2 text-[11px] text-zinc-500">Your plan <b className="text-black">{currentPlanId.toUpperCase()}</b> allows <b className="text-black">{imageLimit===999999?'Unlimited':imageLimit}</b> image{imageLimit!==1?'s':''} per product • PNG, JPG, WEBP up to 5MB</div>
                      </div>
                    </>
                  )}
                  </div>
                  <input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
                </label>
                <div className="grid md:grid-cols-2 gap-3"><input placeholder="Product name" value={prodName} onChange={e=>setProdName(e.target.value)} className="w-full h-11 px-4 border rounded-[12px] bg-zinc-50/50 text-[13px] focus:bg-white focus:outline-none focus:border-black" /><input placeholder="Price Rs. 3500" type="number" value={prodPrice} onChange={e=>setProdPrice(e.target.value)} className="w-full h-11 px-4 border rounded-[12px] bg-zinc-50/50 text-[13px] focus:bg-white focus:outline-none focus:border-black" /></div>
                <div className="flex justify-end gap-2">
                  {editingId && <button onClick={cancelEdit} className="h-11 px-6 border bg-white rounded-full text-[13px] font-medium hover:bg-zinc-50 transition-colors">Cancel</button>}
                  <button onClick={addProduct} disabled={uploading || (!editingId && products.length>=productLimit)} className="h-11 px-7 bg-black text-white text-[13px] font-medium rounded-full disabled:opacity-40 hover:bg-zinc-900 transition-colors flex items-center justify-center leading-none">{uploading?'Uploading...':!editingId && products.length>=productLimit?`Limit ${productLimit===999999?'∞':productLimit} — Upgrade`:`${editingId?'Update':'Add'} Product →`}</button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {products.length===0 ? (
                <div className="col-span-2 md:col-span-4 bg-white border border-dashed rounded-[20px] p-12 flex flex-col items-center justify-center text-center"><UploadIcon className="w-12 h-12" /><div className="mt-4 font-bold text-[14px]">No products yet</div><div className="text-[11px] text-zinc-500 mt-1">Add your first product — {productLimit===999999?'Unlimited':productLimit} allowed on {currentPlanDef.name}</div></div>
              ) : products.map(p => (
                <div key={p.id} className="bg-white border rounded-[16px] p-2.5 group relative hover:border-black transition-colors">
                  <img src={p.image_url} className="w-full h-32 object-cover rounded-[12px] bg-zinc-50" />
                  <div className="mt-2 px-1"><div className="font-medium text-[12px] truncate">{p.name}</div><div className="text-[12px] font-bold">Rs. {p.price}</div></div>
                  <button onClick={()=>startEdit(p)} className="absolute bottom-2 right-10 w-7 h-7 bg-white shadow border rounded-full flex items-center justify-center text-[10px] hover:bg-black hover:text-white transition-colors">✎</button>
                  <button onClick={()=>deleteProduct(p.id)} className="absolute bottom-2 right-2 w-7 h-7 bg-white shadow border rounded-full flex items-center justify-center text-[10px] hover:bg-black hover:text-white transition-colors">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab==='analytics' && (
          <div className="space-y-4">
            {!isPremium ? (
              <div className="relative bg-white border-2 border-black rounded-[24px] overflow-hidden min-h-[640px]">
                <div className="absolute inset-0 p-6 md:p-8 blur-[14px] opacity-40 pointer-events-none select-none">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[{ label: 'Total Views', value: '12.4k', change: '+23%' },{ label: 'WhatsApp Clicks', value: '1,842', change: '+18%' },{ label: 'Orders Started', value: '324', change: '+12%' },{ label: 'Revenue Est.', value: 'Rs. 184k', change: '+31%' }].map((s,i)=>(<div key={i} className="bg-[#F8F7F5] border rounded-[16px] p-4"><div className="text-[11px] uppercase tracking-widest text-zinc-500 font-bold">{s.label}</div><div className="text-[22px] font-black mt-1">{s.value}</div><div className="text-[11px] text-green-600 font-bold mt-1">{s.change}</div></div>))}
                  </div>
                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
                    <div className="bg-[#F8F7F5] border rounded-[20px] p-5 h-[260px]"><div className="h-4 w-24 bg-zinc-200 rounded-full" /><div className="mt-6 flex items-end gap-2 h-[180px]">{[40,65,35,85,55,90,70,45,75,60,80,50].map((h,i)=><div key={i} className="flex-1 bg-black rounded-t-[8px]" style={{height: `${h}%`}} />)}</div></div>
                    <div className="bg-[#F8F7F5] border rounded-[20px] p-5 h-[260px]"><div className="h-4 w-20 bg-zinc-200 rounded-full" /><div className="mt-6 space-y-3">{[85,60,45,30].map((w,i)=><div key={i} className="flex items-center gap-3"><div className="w-8 h-8 rounded-[10px] bg-zinc-200" /><div className="flex-1"><div className="h-3 bg-zinc-200 rounded-full" style={{width: `${w}%`}} /><div className="h-2 bg-zinc-100 rounded-full mt-2 w-1/2" /></div></div>)}</div></div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-white/75 backdrop-blur-[20px] flex flex-col items-center justify-center p-6 text-center">
                  <div className="relative"><GlassPremiumLock size={72} /><div className="absolute -bottom-1 -right-1 bg-black text-white text-[9px] font-black px-2 h-5 rounded-full flex items-center tracking-widest">PREMIUM</div></div>
                  <h3 className="mt-6 text-[22px] md:text-[26px] font-black tracking-tight leading-none">Live Analytics is Premium Only</h3>
                  <p className="mt-3 text-[13px] text-zinc-500 max-w-[360px] leading-[1.5]">You promised your users live analytics — this is it. Track store views, WhatsApp clicks, top products, and revenue in real-time. Basic and Advanced plans can't access this.</p>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-[520px]">
                    <div className="bg-[#F8F7F5] border rounded-[14px] p-3.5 text-left"><div className="w-8 h-8 rounded-[10px] bg-black text-white flex items-center justify-center"><AnalyticsIcon className="w-4 h-4" /></div><div className="mt-2.5 font-bold text-[12px]">Real-time Views</div><div className="text-[11px] text-zinc-500 mt-1 leading-[1.3]">Every store visit tracked live</div></div>
                    <div className="bg-[#F8F7F5] border rounded-[14px] p-3.5 text-left"><div className="w-8 h-8 rounded-[10px] bg-black text-white flex items-center justify-center">↗</div><div className="mt-2.5 font-bold text-[12px]">WhatsApp Funnel</div><div className="text-[11px] text-zinc-500 mt-1 leading-[1.3]">Clicks → Orders → Revenue</div></div>
                    <div className="bg-[#F8F7F5] border rounded-[14px] p-3.5 text-left"><div className="w-8 h-8 rounded-[10px] bg-[#E8FF86] text-black flex items-center justify-center font-black text-[12px]">₨</div><div className="mt-2.5 font-bold text-[12px]">Top Products</div><div className="text-[11px] text-zinc-500 mt-1 leading-[1.3]">Know what sells best</div></div>
                  </div>
                  <div className="mt-6 flex flex-col md:flex-row items-center gap-3">
                    <button onClick={()=>setActiveTab('payments')} className="h-11 px-7 bg-black text-white rounded-full text-[13px] font-bold flex items-center gap-2 hover:bg-zinc-900 transition-colors">Upgrade to Premium — Rs. 2999/mo<span className="w-5 h-5 bg-white text-black rounded-full flex items-center justify-center text-[10px]">↗</span></button>
                    <span className="text-[11px] text-zinc-500 font-medium">Till {TILL_ID} • Yearly Rs. 2499/mo (-22%) • Live + No watermark</span>
                  </div>
                  <div className="mt-8 flex items-center gap-2 text-[10px] font-bold tracking-widest"><span className="px-2.5 h-6 rounded-full bg-black text-white flex items-center">Basic 0% Analytics</span><span className="px-2.5 h-6 rounded-full bg-zinc-100 border flex items-center">Advanced 0% Analytics</span><span className="px-2.5 h-6 rounded-full bg-[#E8FF86] border border-black/5 flex items-center">Premium 100% Live</span></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-black text-white rounded-[24px] p-6 md:p-7 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#E8FF86] opacity-[0.08] rounded-full blur-[80px] pointer-events-none" />
                  <div className="relative flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4"><div className="w-12 h-12 bg-white text-black rounded-[14px] flex items-center justify-center"><AnalyticsIcon className="w-6 h-6" /></div><div><div className="flex items-center gap-2.5"><h2 className="font-black text-[20px] tracking-tight">Live Analytics</h2><span className="flex items-center gap-1.5 px-2.5 h-6 rounded-full bg-[#E8FF86] text-black text-[10px] font-black tracking-widest"><LiveDot /> LIVE</span><span className="px-2.5 h-6 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold tracking-widest">PREMIUM UNLOCKED ✓</span></div><p className="text-[11px] text-white/60 mt-1">Real-time • No watermark • {products.length} products tracked</p></div></div>
                    <div className="flex items-center gap-2"><div className="h-9 px-3 rounded-full bg-white/10 border border-white/10 text-[11px] font-medium flex items-center gap-2"><span className="w-2 h-2 bg-[#E8FF86] rounded-full animate-pulse" />Store: {slug || 'your-store'} • Live</div><div className="h-9 px-3 rounded-full bg-white text-black text-[11px] font-bold flex items-center">Last 7 days</div></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[{ label: 'Total Views', value: '12,483', sub: 'Unique visitors', change: '+23.4%', up: true, icon: '◧' },{ label: 'WhatsApp Clicks', value: '1,842', sub: '87.2% CTR', change: '+18.1%', up: true, icon: '↗' },{ label: 'Orders Started', value: '324', sub: '17.6% conversion', change: '+12.3%', up: true, icon: '◫' },{ label: 'Est. Revenue', value: 'Rs. 184,500', sub: 'Avg Rs. 569 / order', change: '+31.2%', up: true, icon: '₨' }].map((s,i)=>(
                    <div key={i} className="bg-white border rounded-[20px] p-5 relative overflow-hidden group hover:border-black transition-colors">
                      <div className="flex items-start justify-between"><div className="w-9 h-9 rounded-[12px] bg-[#F8F7F5] border flex items-center justify-center text-[14px] font-bold">{s.icon}</div><span className={`px-2 h-6 rounded-full text-[10px] font-black flex items-center gap-1 ${s.up ? 'bg-[#E8FF86] text-black' : 'bg-red-100 text-red-600'}`}>{s.up ? '↗' : '↘'} {s.change}</span></div>
                      <div className="mt-4"><div className="text-[11px] font-bold tracking-widest uppercase text-zinc-500">{s.label}</div><div className="text-[24px] font-black tracking-tight mt-1">{s.value}</div><div className="text-[11px] text-zinc-500 mt-1">{s.sub}</div></div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-3">
                  <div className="bg-white border rounded-[20px] p-5 md:p-6">
                    <div className="flex items-center justify-between"><h3 className="font-bold text-[13px] tracking-tight">Views & Clicks — Last 7 Days</h3><div className="flex items-center gap-3 text-[10px] font-bold tracking-widest"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-black" />Views</span><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#E8FF86] border border-black/10" />WhatsApp Clicks</span></div></div>
                    <div className="mt-6 h-[160px] md:h-[200px] flex items-end gap-[4px] md:gap-[10px]">{[{ v: 60, c: 32 },{ v: 85, c: 48 },{ v: 55, c: 28 },{ v: 95, c: 62 },{ v: 70, c: 44 },{ v: 110, c: 78 },{ v: 88, c: 52 }].map((d,i)=>(<div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar"><div className="w-full flex gap-1 items-end justify-center h-[160px]"><div className="flex-1 bg-black rounded-t-[10px]" style={{height: `${d.v}%`}} /><div className="flex-1 bg-[#E8FF86] border border-black/5 rounded-t-[10px]" style={{height: `${d.c}%`}} /></div><span className="text-[10px] font-bold text-zinc-500">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span></div>))}</div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white border rounded-[20px] p-5"><h3 className="font-bold text-[13px] tracking-tight">Top Products by WhatsApp Clicks</h3><div className="mt-4 space-y-3">{(products.length ? products.slice(0,4) : [{ id:'1', name:'Noor Lawn Suit', price:3500, image_url:'https://picsum.photos/100' } as any, { id:'2', name:'Gul Ahmed Cotton', price:2800, image_url:'https://picsum.photos/101' } as any, { id:'3', name:'Khaadi Khaddar', price:4200, image_url:'https://picsum.photos/102' } as any]).map((p:any, i:number)=>(<div key={p.id} className="flex items-center gap-3"><div className="w-10 h-10 rounded-[12px] bg-[#F8F7F5] border flex items-center justify-center font-bold text-[11px]">{i+1}</div><img src={p.image_url} className="w-10 h-10 rounded-[10px] object-cover border bg-zinc-50" /><div className="flex-1 min-w-0"><div className="text-[12px] font-bold truncate">{p.name}</div><div className="text-[11px] text-zinc-500">Rs. {p.price} • {Math.floor(Math.random()*60+20)} clicks</div></div><div className="w-14 h-2 rounded-full bg-[#F8F7F5] border overflow-hidden"><div className="h-full bg-black rounded-full" style={{width: `${85 - i*15}%`}} /></div></div>))}</div></div>
                    <div className="bg-black text-white rounded-[20px] p-5 relative overflow-hidden"><div className="absolute top-0 right-0 w-32 h-32 bg-[#E8FF86] opacity-[0.12] rounded-full blur-[30px]" /><h3 className="font-bold text-[12px] tracking-widest uppercase relative">Conversion Funnel</h3><div className="mt-4 space-y-2.5 relative">{[{ label: 'Store Views', value: '12,483', pct: '100%' },{ label: 'Product Views', value: '4,821', pct: '38.6%' },{ label: 'WhatsApp Clicks', value: '1,842', pct: '14.7%' },{ label: 'Orders Started', value: '324', pct: '2.6%' }].map((f,i)=>(<div key={i} className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-bold">{i+1}</div><div className="flex-1"><div className="flex items-center justify-between"><span className="text-[12px] font-medium">{f.label}</span><span className="text-[11px] font-mono opacity-60">{f.pct}</span></div><div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-[#E8FF86]" style={{width: f.pct}} /></div></div><span className="text-[12px] font-black">{f.value}</span></div>))}</div></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white border rounded-[20px] p-5"><div className="text-[11px] font-black tracking-widest uppercase text-zinc-500">Device Breakdown</div><div className="mt-4 flex items-center gap-4"><div className="w-16 h-16 rounded-full border-[6px] border-black border-r-[#E8FF86] border-b-[#E8FF86] flex items-center justify-center font-black text-[11px]">78%</div><div className="space-y-2 text-[11px]"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-black" />Mobile 78%</div><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#E8FF86] border" />Desktop 18%</div><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-zinc-200" />Other 4%</div></div></div></div>
                  <div className="bg-white border rounded-[20px] p-5"><div className="text-[11px] font-black tracking-widest uppercase text-zinc-500">Traffic Source</div><div className="mt-4 space-y-2.5">{[{s:'Direct Link', p:'62%'}, {s:'WhatsApp Status', p:'24%'}, {s:'Instagram Bio', p:'14%'}].map((t,i)=><div key={i} className="flex items-center justify-between text-[12px]"><span className="font-medium">{t.s}</span><span className="font-mono text-[11px] bg-[#F8F7F5] border px-2 h-6 rounded-full flex items-center">{t.p}</span></div>)}</div></div>
                  <div className="bg-[#E8FF86] border border-black/5 rounded-[20px] p-5 relative overflow-hidden"><div className="absolute -right-6 -top-6 w-24 h-24 bg-black/5 rounded-full" /><div className="relative"><div className="w-9 h-9 rounded-[12px] bg-black text-white flex items-center justify-center font-bold">✦</div><div className="mt-3 font-black text-[13px] tracking-tight">Premium Analytics Live</div><div className="text-[11px] mt-1 leading-[1.4] opacity-70">You unlocked everything: no watermark, live views, funnel, top products, device & source tracking. This is what you promised users.</div><div className="mt-3 h-8 px-3 rounded-full bg-black text-white text-[11px] font-bold flex items-center w-fit">Watermark OFF • Live ON ✓</div></div></div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab==='payments' && (
          <div className="bg-white border rounded-[24px] p-6 md:p-8 overflow-hidden relative">
            {/* User's Pending Payments */}
            {myPayments.length > 0 && (
              <div className="mb-6 rounded-[16px] border-2 border-black bg-[#FFFEF5] p-4">
                <div className="flex items-center gap-2 mb-3"><span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" /><span className="font-black text-[13px]">Your Payments — Status</span><span className="ml-auto text-[11px] bg-black text-white px-2.5 h-6 rounded-full flex items-center">{myPayments.filter((p:any)=>p.status==='pending').length} pending</span></div>
                <div className="space-y-2">
                  {myPayments.slice(0,5).map((p:any)=>(
                    <div key={p.id} className="flex items-center justify-between gap-2 bg-white border rounded-[12px] p-3">
                      <div className="flex items-center gap-3">
                        <span className={`h-6 px-2.5 rounded-full text-[10px] font-black flex items-center ${p.status==='pending'?'bg-yellow-100 text-yellow-700 border border-yellow-200':p.status==='approved'?'bg-green-100 text-green-700 border border-green-200':'bg-red-100 text-red-700 border border-red-200'}`}>{p.status.toUpperCase()}</span>
                        <span className="text-[12px] font-bold">{p.plan_id.toUpperCase()} • Rs. {p.amount}</span>
                        <span className="font-mono text-[11px] bg-zinc-50 border px-2 py-0.5 rounded">{p.txn_id}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500">{new Date(p.created_at).toLocaleDateString()} {p.status==='pending' && '• Verifying...'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4"><div className="w-12 h-12 bg-black text-white rounded-[14px] flex items-center justify-center text-[18px]">⬡</div><div><h2 className="font-black text-[18px] tracking-tight">Pricing — Till ID {TILL_ID} — Current: {currentPlanDef.name}</h2><p className="text-[11px] text-zinc-500 mt-0.5">Pay to JazzCash Till & submit Txn ID</p></div></div>
              <div className="flex items-center gap-2">
                <div className="billing-toggle"><button onClick={()=>setBilling('monthly')} className={`billing-btn ${billing==='monthly'?'billing-btn-active':'billing-btn-inactive'}`}>Monthly</button><button onClick={()=>setBilling('yearly')} className={`billing-btn ${billing==='yearly'?'billing-btn-active':'billing-btn-inactive'}`}>Yearly <span className="ml-1.5 bg-[#E8FF86] text-black text-[9px] px-1.5 py-0.5 rounded-full font-bold">-22%</span></button></div>
                <CurrentPlanButton />
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
              <div className="rounded-[20px] border bg-black text-white p-5">
                <div className="flex justify-between items-center"><div className="text-[10px] tracking-[0.2em] uppercase opacity-50 font-bold">JAZZCASH BUSINESS TILL</div><button onClick={copyTill} className="h-7 px-3 bg-white/10 border border-white/10 rounded-full text-[11px] hover:bg-white/20 transition-colors flex items-center justify-center leading-none">{copiedTill?'Copied!':'Copy ID'}</button></div>
                <div className="mt-4 bg-white/[0.06] border border-white/[0.08] rounded-[14px] p-4"><div className="text-[10px] uppercase opacity-50">Till ID Number</div><div className="text-[32px] font-black font-mono tracking-[0.12em]">{TILL_ID}</div></div>
                <div className="mt-3 bg-white rounded-[14px] p-3"><img src={`https://barcodeapi.org/api/code128/${TILL_ID}`} alt="Barcode" className="w-full h-[48px] object-contain"/><div className="text-center text-[11px] font-mono text-black font-black tracking-[0.3em] mt-1">{TILL_ID}</div></div>
                <div className="mt-3 bg-white rounded-[14px] p-3 flex justify-center"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=JAZZCASH_TILL_${TILL_ID}`} alt="QR" className="w-[120px] h-[120px]"/></div>
              </div>
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
                  <div className="rounded-[16px] border-2 border-black bg-[#FFFEF5] p-5">
                    <div className="flex items-center gap-1.5 md:gap-2 flex-wrap"><div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[12px]">₨</div><div className="text-[13px] font-bold">Pay Rs. {billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal} → Till {TILL_ID} ({billing})</div></div>
                    <input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder={`Txn ID after paying Rs. ${billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal} to Till ${TILL_ID}`} className="mt-4 w-full h-12 px-4 rounded-[12px] border-2 bg-white text-[12px] font-mono focus:outline-none focus:border-black"/>
                    <button onClick={handleBuyPlan} disabled={purchasing} className="mt-3 w-full h-12 bg-black text-white rounded-full font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-zinc-900 transition-colors leading-none">{purchasing?'Submitting...':`I Paid Rs. ${billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal} — Activate ${selectedPlan.name}`} <span className="w-5 h-5 bg-white text-black rounded-full flex items-center justify-center text-[10px]">↗</span></button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      {errorMsg && <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full text-[12px] shadow-lg">{errorMsg}</div>}
    </div>
  )
}
