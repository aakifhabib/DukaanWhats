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
    <div className="absolute inset-[1px] bg-black rounded-[13px] flex items-center justify-center">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3.5V14.5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/><path d="M8.5 7L12 3.5L15.5 7" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  </div>
)
const GlassLockIcon = ({ size = 40 }: { size?: number }) => (
  <div style={{ width: size, height: size }} className="relative shrink-0">
    <div className="absolute inset-0 rounded-[14px] bg-white/90 backdrop-blur-xl" />
    <div className="absolute inset-0 flex items-center justify-center">
      <svg width={size>40?22:16} height={size>40?22:16} viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="10" rx="3" fill="#0A0A0A" /></svg>
    </div>
  </div>
)
const GlassPremiumLock = ({ size = 56 }: { size?: number }) => (
  <div style={{ width: size, height: size }} className="relative">
    <div className="absolute inset-0 rounded-[16px] bg-[#0A0A0A]" />
    <div className="absolute inset-0 flex items-center justify-center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4.5" y="10.5" width="15" height="10" rx="3.5" fill="white" /></svg>
    </div>
  </div>
)

const TILL_ID = '984837533'
type Profile = { id: string; business_name: string; whatsapp_number: string; store_slug: string; store_theme?: string; current_plan?: string }
type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; user_id: string }
type Billing = 'monthly' | 'yearly'
type PlanDef = { id: 'basic'|'advanced'|'premium'; name: string; monthly: number; yearlyMonthly: number; yearlyTotal: number; products: number; imagesPerProduct: number; advancedAllowed: number|'all'; premiumAllowed: number|'all'; stores: number; features: string[] }

const PremiumProductCard = ({ p, onEdit, onDelete }: { p: any; onEdit: (p:any)=>void; onDelete: (id:string)=>void; themeId: string; imageLimit: number }) => {
  const images = (() => { if (p.image_urls && Array.isArray(p.image_urls) && p.image_urls.length>0) return p.image_urls; if (typeof p.image_urls==='string'){try{const pa=JSON.parse(p.image_urls); if(Array.isArray(pa)) return pa}catch{} return [p.image_urls]} if(p.image_url) return [p.image_url]; return [] })()
  return (
    <div className="group liquid-glass rounded-[24px] p-[10px] hover:liquid-glass-hover transition-all duration-300">
      <div className="relative overflow-hidden rounded-[18px] h-[180px] bg-white/[0.04]">
        {images.length>0 ? <img src={images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/30 text-[11px]">No image</div>}
      </div>
      <div className="mt-3 px-2 pb-2">
        <div className="font-semibold text-[13px] truncate text-white">{p.name}</div>
        <div className="font-bold text-[13px] text-white mt-1">Rs. {p.price.toLocaleString()}</div>
        <div className="mt-3 flex gap-2">
          <button onClick={()=>onEdit(p)} className="flex-1 h-8 bg-white text-black rounded-full text-[11px] font-semibold">Edit</button>
          <button onClick={()=>onDelete(p.id)} className="h-8 w-8 liquid-glass rounded-full flex items-center justify-center text-white/60">✕</button>
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
        }
      } catch (e: any) { setErrorMsg(e.message) }
      setTimeout(()=>setLoading(false), 700)
    }
    init()
  }, [])

  const handleThemeClick = (t: any) => { if (isThemeLocked(t)) { setActiveTab('payments'); return } setTheme(t.id) }
  const saveStore = async () => { if (!profile) return; setSaving(true); try { const { error } = await supabase.from('profiles').update({ business_name: businessName.trim(), whatsapp_number: whatsapp.trim(), store_slug: slug.trim(), store_theme: theme, premium_custom: premiumCustom }).eq('id', profile.id); if (error) throw error; setSaved(true); setTimeout(()=>setSaved(false), 2500) } catch (e: any) { setErrorMsg(e.message) } setSaving(false) }
  const copyLink = async () => { const url = `${window.location.origin}/s/${slug}`; await navigator.clipboard.writeText(url); setCopied(true); setTimeout(()=>setCopied(false), 2000) }
  const copyTill = async () => { await navigator.clipboard.writeText(TILL_ID); setCopiedTill(true); setTimeout(()=>setCopiedTill(false), 2000) }
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []); if (!selected.length) return
    const newFiles = editingId ? [...files, ...selected].slice(0, imageLimit === 999999 ? 20 : imageLimit) : selected
    setFiles(newFiles)
    const pr: string[] = []
    newFiles.forEach(file => { const r = new FileReader(); r.onload = ev => { pr.push(ev.target?.result as string); if (pr.length === newFiles.length) setPreviews(pr) }; r.readAsDataURL(file) })
  }
  const removeFileAt = (idx: number) => { setFiles(files.filter((_, i) => i !== idx)); setPreviews(previews.filter((_, i) => i !== idx)) }
  const uploadOne = async (file: File, userId: string) => { const ext = file.name.split('.').pop(); const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`; const { error } = await supabase.storage.from('product-images').upload(fileName, file); if (error) throw error; const { data } = supabase.storage.from('product-images').getPublicUrl(fileName); return data.publicUrl }
  const startEdit = (p: any) => { setEditingId(p.id); setProdName(p.name); setProdPrice(String(p.price)); setPreviews(p.image_urls && p.image_urls.length ? p.image_urls : [p.image_url]); setFiles([]); setActiveTab('products'); }
  const cancelEdit = () => { setEditingId(null); setProdName(''); setProdPrice(''); setPreviews([]); setFiles([]) }
  const addProduct = async () => {
    if (!prodName.trim() || !prodPrice) { setErrorMsg('Name and price required'); return }
    if (!profile) return; setUploading(true)
    try {
      let imageUrls: string[] = []; if (files.length>0) { for (const f of files) { const url = await uploadOne(f, profile.id); imageUrls.push(url) } } else if (previews.length>0 && editingId) { imageUrls = previews }
      if (editingId) { const existing = products.find(p=>p.id===editingId); const finalImages = imageUrls.length>0 ? imageUrls : (existing?.image_urls || [existing?.image_url]); const { error } = await supabase.from('products').update({ name: prodName.trim(), price: parseFloat(prodPrice), image_url: finalImages[0]||'', image_urls: finalImages }).eq('id', editingId); if (error) throw error }
      else { if (imageUrls.length===0) { setErrorMsg('Please upload image'); setUploading(false); return } const { data, error } = await supabase.from('products').insert({ user_id: profile.id, name: prodName.trim(), price: parseFloat(prodPrice), image_url: imageUrls[0], image_urls: imageUrls }).select().single(); if (error) throw error; if (data) setProducts([data as any, ...products]) }
      const { data: prods } = await supabase.from('products').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }); if (prods) setProducts(prods); cancelEdit()
    } catch (e:any){ setErrorMsg(e.message) } setUploading(false)
  }
  const deleteProduct = async (id:string) => { if (!confirm('Delete?')) return; const { error } = await supabase.from('products').delete().eq('id', id); if (!error) setProducts(products.filter(p=>p.id!==id)) }
  const getDisplayPrice = (p:PlanDef) => billing==='monthly'?p.monthly:p.yearlyMonthly
  const handleBuyPlan = async () => { if (!selectedPlan || !txnId.trim() || !profile) return; setPurchasing(true); try { const amount = billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal; const { data, error } = await supabase.from('plan_payments').insert({ user_id: profile.id, plan_id: selectedPlan.id, billing, amount, txn_id: txnId.trim(), status: 'pending' }).select().single(); if (error) throw error; setMyPayments([data, ...myPayments]); setTxnId('') } catch(e:any){ setErrorMsg(e.message) } setPurchasing(false) }
  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login') }
  const filteredStandard = getStandardThemes ? getStandardThemes() : STORE_THEMES.filter(t=> (t.category as string)!=='premium' && (t.category as string)!=='advanced')

  if (loading) return <DukaanWhatsLoader />

  const CurrentPlanButton = () => (
    <div className="liquid-glass-pill h-7 px-3 rounded-full text-[10px] font-bold tracking-widest flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${isPremium?'bg-black':'bg-white'} animate-pulse`} />
      {currentPlanDef.name.toUpperCase()}
    </div>
  )

  const navItems = [
    { id: 'products', label: 'Products', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="7" height="7" rx="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.8"/></svg>), count: products.length },
    { id: 'payments', label: 'Pro', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 5.4L19 12l-5.2 3.6L12 21l-1.8-5.4L5 12l5.2-3.6L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>), pro: true },
    { id: 'themes', label: 'Themes', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="7"/><path d="M12 5v2M12 17v2M5 12h2M17 12h2"/></svg>) },
    { id: 'store', label: 'Store', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 9l9-6 9 6v11a1 1 0 0 1-1 1h-5v-5H9v5H4a1 1 0 0 1-1-1V9z"/></svg>) },
    { id: 'analytics', label: 'Analytics', icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 18V11M8 18V8M12 18v-5M16 18V6M20 18V10"/></svg>), premium: true },
  ] as any[]

  return (
    <div className="min-h-screen w-full relative bg-black text-white selection:bg-white selection:text-black">
      {/* ANIMATED GREEN BLACK BACKGROUND */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#050A06]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1F14] via-[#050A06] to-black" />
        <div className="absolute rounded-full blur-[60px]" style={{ width:'700px', height:'700px', left:'-10%', top:'-15%', background:'radial-gradient(circle, rgba(34,197,94,0.45) 0%, rgba(16,185,129,0.22) 40%, transparent 75%)', animation:'blob1 14s ease-in-out infinite' }} />
        <div className="absolute rounded-full blur-[70px]" style={{ width:'800px', height:'800px', right:'-15%', top:'10%', background:'radial-gradient(circle, rgba(16,185,129,0.38) 0%, transparent 75%)', animation:'blob2 18s ease-in-out infinite' }} />
        <div className="absolute rounded-full blur-[80px]" style={{ width:'900px', height:'900px', left:'20%', bottom:'-30%', background:'radial-gradient(circle, rgba(74,222,128,0.32) 0%, transparent 75%)', animation:'blob3 22s ease-in-out infinite' }} />
        <div className="absolute rounded-full blur-[50px]" style={{ width:'500px', height:'500px', left:'55%', top:'35%', background:'radial-gradient(circle, rgba(187,247,208,0.22) 0%, transparent 80%)', animation:'blob4 11s ease-in-out infinite' }} />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *{font-family:'Inter',sans-serif}
        @keyframes blob1 { 0%{transform:translate(0,0) scale(1)} 25%{transform:translate(80px,60px) scale(1.15)} 50%{transform:translate(40px,120px) scale(0.92)} 75%{transform:translate(-30px,50px) scale(1.08)} 100%{transform:translate(0,0) scale(1)} }
        @keyframes blob2 { 0%{transform:translate(0,0) scale(1)} 33%{transform:translate(-70px,80px) scale(1.18)} 66%{transform:translate(-120px,-30px) scale(0.88)} 100%{transform:translate(0,0) scale(1)} }
        @keyframes blob3 { 0%{transform:translate(0,0) scale(1)} 30%{transform:translate(60px,-80px) scale(1.12)} 60%{transform:translate(-40px,-50px) scale(1.20)} 100%{transform:translate(0,0) scale(1)} }
        @keyframes blob4 { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(-90px,-90px) scale(1.25)} 100%{transform:translate(0,0) scale(1)} }

        /* === TRUE LIQUID GLASS FROM YOUR WEBP REFERENCE === */
        .liquid-glass{
          background: linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 100%);
          backdrop-filter: blur(40px) saturate(180%) brightness(1.08);
          -webkit-backdrop-filter: blur(40px) saturate(180%) brightness(1.08);
          border: 0.8px solid rgba(255,255,255,0.22);
          border-top-color: rgba(255,255,255,0.40);
          border-left-color: rgba(255,255,255,0.28);
          box-shadow:
            inset 0 1px 0.5px rgba(255,255,255,0.55),
            inset 0 -0.5px 0.5px rgba(255,255,255,0.12),
            inset 1px 0 0.5px rgba(255,255,255,0.15),
            0 12px 32px rgba(0,0,0,0.22),
            0 4px 12px rgba(0,0,0,0.15),
            0 0 0 0.5px rgba(255,255,255,0.08);
        }
        .liquid-glass:hover{
          background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%);
          border-color: rgba(255,255,255,0.28);
          border-top-color: rgba(255,255,255,0.50);
          box-shadow:
            inset 0 1.5px 1px rgba(255,255,255,0.65),
            inset 0 -0.5px 0.5px rgba(255,255,255,0.15),
            0 16px 40px rgba(0,0,0,0.28),
            0 6px 16px rgba(0,0,0,0.18);
        }
        .liquid-glass-pill{
          background: linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.07) 100%);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.20);
          border-top-color: rgba(255,255,255,0.38);
          box-shadow:
            inset 0 1px 0.5px rgba(255,255,255,0.50),
            0 4px 16px rgba(0,0,0,0.18);
        }
        .liquid-glass-card{
          background: linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%);
          backdrop-filter: blur(36px) saturate(170%) brightness(1.05);
          -webkit-backdrop-filter: blur(36px) saturate(170%) brightness(1.05);
          border: 1px solid rgba(255,255,255,0.18);
          border-top-color: rgba(255,255,255,0.32);
          box-shadow:
            inset 0 1px 0.8px rgba(255,255,255,0.45),
            inset 0 -0.5px 0.5px rgba(255,255,255,0.08),
            0 10px 30px rgba(0,0,0,0.22),
            0 2px 8px rgba(0,0,0,0.12);
        }
        /* Left nav - floating like webp circles overlapping */
        .liquid-nav{
          background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%);
          backdrop-filter: blur(48px) saturate(190%) brightness(1.06);
          -webkit-backdrop-filter: blur(48px) saturate(190%) brightness(1.06);
          border: 1px solid rgba(255,255,255,0.20);
          border-top-color: rgba(255,255,255,0.38);
          box-shadow:
            inset 0 1.2px 0.8px rgba(255,255,255,0.50),
            inset 0 -0.8px 0.8px rgba(255,255,255,0.10),
            0 20px 60px rgba(0,0,0,0.35),
            0 8px 24px rgba(0,0,0,0.20);
        }
        .liquid-nav-btn{
          width: 48px; height: 48px; border-radius: 16px;
          display:flex; align-items:center; justify-content:center;
          background: linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%);
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.16);
          border-top-color: rgba(255,255,255,0.28);
          box-shadow: inset 0 1px 0.5px rgba(255,255,255,0.40), 0 2px 8px rgba(0,0,0,0.12);
          color: rgba(255,255,255,0.65);
          transition: all 0.28s cubic-bezier(0.2,0.8,0.2,1);
          position:relative;
        }
        .liquid-nav-btn:hover{
          background: linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%);
          border-color: rgba(255,255,255,0.26);
          color: white;
          transform: translateY(-1px) scale(1.02);
          box-shadow: inset 0 1px 0.8px rgba(255,255,255,0.55), 0 6px 20px rgba(0,0,0,0.20);
        }
        .liquid-nav-btn.active{
          background: linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.80) 100%);
          color: black;
          border-color: rgba(255,255,255,0.90);
          border-top-color: white;
          box-shadow:
            inset 0 1px 0.8px rgba(255,255,255,1),
            0 8px 24px rgba(255,255,255,0.28),
            0 4px 12px rgba(0,0,0,0.15);
          transform: translateY(-1px);
        }
        .liquid-nav-btn.pro.active{
          background: linear-gradient(180deg, #E8FF86 0%, #d4ee6a 100%);
          color: black;
          border-color: #E8FF86;
          box-shadow: 0 8px 24px rgba(232,255,134,0.35), inset 0 1px 0.8px rgba(255,255,255,0.8);
        }
        .liquid-input{
          background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
          backdrop-filter: blur(16px) saturate(150%);
          border: 1px solid rgba(255,255,255,0.14);
          border-top-color: rgba(255,255,255,0.22);
          box-shadow: inset 0 1px 0.5px rgba(255,255,255,0.25);
        }
        .liquid-input:focus{ background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%); border-color: rgba(255,255,255,0.28); outline:none }

        /* PRESERVED 6 GLASS THEMES - DO NOT CHANGE LOGIC */
        .glass-container{ display:flex; gap:20px; overflow-x:auto; padding:24px 20px 36px; scroll-snap-type:x mandatory; scrollbar-width:none; }
        .glass-container::-webkit-scrollbar{display:none}
        .glass{
          min-width:260px; height:240px; position:relative; flex-shrink:0;
          background: linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%);
          backdrop-filter: blur(28px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.22);
          border-top-color: rgba(255,255,255,0.38);
          border-radius:24px;
          transform: rotate(calc(var(--r) * 1deg));
          transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1);
          cursor:pointer;
          box-shadow: inset 0 1px 0.8px rgba(255,255,255,0.50), 0 12px 32px rgba(0,0,0,0.18);
        }
        .glass:hover{ transform: rotate(0deg) translateY(-6px) scale(1.02); z-index:10; }
        .glass.selected{ transform: rotate(0deg) translateY(-4px) scale(1.03); border-color:white; box-shadow: inset 0 1px 1px rgba(255,255,255,0.7), 0 16px 40px rgba(0,0,0,0.3), 0 0 0 1px white; }
        .glass-preview-wrap{padding:12px; height:100%; display:flex; flex-direction:column; gap:10px}
        .glass-preview-header{height:36px; border-radius:12px; display:flex; align-items:center; justify-content:space-between; padding:0 12px; font-size:10px; font-weight:700; letter-spacing:0.05em}
        .glass-preview-body{display:flex; flex-direction:column; gap:8px; flex:1}
        .glass-lock-overlay{position:absolute; inset:0; background:rgba(248,247,245,0.92); backdrop-filter:blur(16px); border-radius:24px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; padding:16px}
        .adv-grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:14px}
        .adv-card{position:relative; height:210px; background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%); backdrop-filter:blur(24px) saturate(160%); border:1px solid rgba(255,255,255,0.14); border-top-color: rgba(255,255,255,0.24); border-radius:22px; padding:16px; text-align:left; transition:all 0.28s; overflow:hidden; box-shadow: inset 0 1px 0.5px rgba(255,255,255,0.30), 0 6px 20px rgba(0,0,0,0.14);}
        .adv-card:hover{border-color:rgba(255,255,255,0.22); transform:translateY(-2px); background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%);}
        .adv-card.selected{border-color:rgba(255,255,255,0.85); background:rgba(255,255,255,0.12); box-shadow:0 0 0 1px rgba(255,255,255,0.5), inset 0 1px 0.8px rgba(255,255,255,0.6)}
        .adv-card-lock-overlay{position:absolute; inset:0; background:rgba(10,10,12,0.72); backdrop-filter:blur(16px); display:flex; flex-direction:column; align-items:center; justify-content:center; border-radius:22px; padding:12px}
        .radio-container{position:relative; display:flex; flex-direction:column; gap:10px;}
        .radio-container input{display:none}
        .radio-container label{position:relative; background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%); border:1px solid rgba(255,255,255,0.12); border-top-color: rgba(255,255,255,0.20); border-radius:16px; padding:14px 16px; cursor:pointer; transition:all 0.22s; backdrop-filter:blur(16px); box-shadow: inset 0 1px 0.5px rgba(255,255,255,0.20);}
        .radio-container input:checked + label{background:rgba(255,255,255,0.12); border-color:white; box-shadow:0 0 0 1px white, inset 0 1px 0.8px rgba(255,255,255,0.5)}
      `}</style>

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden md:flex w-[96px] shrink-0 pl-4 py-4">
          <div className="liquid-nav rounded-[28px] p-3 flex flex-col items-center gap-3 sticky top-4 h-[calc(100vh-32px)]">
            <div className="w-10 h-10 rounded-[14px] liquid-glass flex items-center justify-center font-bold text-[14px] text-white">D</div>
            <div className="w-full h-[1px] bg-white/10" />
            {navItems.map((item:any)=>(
              <button key={item.id} onClick={()=>setActiveTab(item.id)} className={`liquid-nav-btn group ${activeTab===item.id?'active':''} ${item.pro?'pro':''}`} title={item.label}>
                {item.icon}
                {item.count!==undefined && <span className={`absolute -top-1 -right-1 text-[9px] font-bold px-1 h-4 rounded-full flex items-center ${activeTab===item.id?'bg-black text-white':'bg-[#E8FF86] text-black'}`}>{item.count}</span>}
                <span className="absolute left-[60px] hidden group-hover:block liquid-glass-pill text-black text-[11px] px-3 py-1 rounded-full whitespace-nowrap shadow-lg">{item.label}</span>
              </button>
            ))}
            <div className="w-full h-[1px] bg-white/10 my-1 mt-auto" />
            <button onClick={handleLogout} className="liquid-nav-btn !bg-red-500/10 !border-red-500/20 !text-red-300 hover:!bg-red-500/20" title="Logout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
            <div className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center text-[12px] font-bold">A</div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-20 px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="md:hidden w-8 h-8 rounded-[10px] liquid-glass flex items-center justify-center font-bold">D</div>
              <div className="leading-tight">
                <div className="font-semibold text-[14px] tracking-tight">DukaanWhats.pk</div>
                <div className="text-[10px] text-white/40 tracking-wide">LIQUID GLASS OS • {theme}</div>
              </div>
              <div className="hidden md:flex ml-4"><CurrentPlanButton /></div>
            </div>
            <Link href={slug ? `/s/${slug}` : '#'} target="_blank" className="h-9 px-5 bg-white text-black rounded-full text-[12px] font-semibold hover:bg-white/90">View Store ↗</Link>
          </header>

          <main className="px-4 md:px-8 pb-28 md:pb-8 space-y-6 max-w-[1200px]">
            {activeTab==='themes' && (
              <div className="liquid-glass-card rounded-[32px] p-6 md:p-8">
                <div className="flex flex-wrap justify-between gap-3">
                  <h2 className="text-[15px] font-semibold">Themes</h2>
                  <CurrentPlanButton />
                </div>

                <div className="mt-8 mb-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest bg-white text-black px-3 py-1.5 rounded-full">8 ADVANCED THEMES</span>
                </div>
                <div className="adv-grid">
                  {finalAdvancedList.map(t => { const isActive = theme===t.id; const locked = isThemeLocked(t); return (
                    <button key={t.id} onClick={()=>handleThemeClick(t)} className={`adv-card ${isActive?'selected':''}`}>
                      {isActive && <span className="absolute top-3 right-3 w-6 h-6 bg-white text-black rounded-full flex items-center justify-center text-[11px] font-bold">✓</span>}
                      <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-[10px] liquid-glass flex items-center justify-center text-white text-[13px]">{t.name?.[0]}</div><div><div className="text-[13px] font-semibold text-white">{t.name}</div><div className="text-[9px] text-white/40 uppercase">ADVANCED</div></div></div>
                      <div className="mt-4 w-full h-[84px] rounded-[12px] bg-white/[0.04] border border-white/10 p-2 flex gap-2"><div className="w-8 h-full rounded-[8px]" style={{background:t.colors?.accent || '#fff'}} /><div className="flex-1 flex flex-col gap-1.5"><div className="h-2 w-3/4 bg-white/15 rounded-full" /><div className="h-2 w-1/2 bg-white/10 rounded-full" /></div></div>
                      {locked && <div className="adv-card-lock-overlay"><GlassLockIcon size={40} /><div className="text-[10px] font-bold mt-1 text-white">LOCKED</div></div>}
                    </button>
                  )})}
                </div>

                <div className="mt-10 rounded-[28px] overflow-hidden liquid-glass-card">
                  <div className="p-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between"><span className="bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded-full">6 GLASS THEMES</span><span className="text-[11px] text-white/60">Glass Collection</span></div>
                  <div className="glass-container">
                    {premiumThemes.map((t,i)=>{ const isActive=theme===t.id; const locked=isThemeLocked(t); const r = isActive ? 0 : (GLASS_TILTS[i % GLASS_TILTS.length]); return (
                      <div key={t.id} className={`glass ${isActive?'selected':''}`} style={{'--r':r} as any} onClick={()=>handleThemeClick(t)}>
                        <div className="glass-preview-wrap"><div className="glass-preview-header" style={{background:t.colors?.bg || 'rgba(255,255,255,0.12)', color:t.colors?.text || '#fff'}}><span>{t.id.slice(0,14).toUpperCase()}</span></div><div className="glass-preview-body"><div className="h-8 rounded-[10px] border border-white/10" style={{background:t.colors?.card || 'rgba(255,255,255,0.08)'}} /><div className="flex gap-2"><div className="flex-1 h-16 rounded-[12px] bg-white/10" /><div className="flex-1 h-16 rounded-[12px] bg-white/10" /></div></div></div>
                        {locked && (<div className="glass-lock-overlay"><GlassPremiumLock size={56} /><div className="text-black text-[12px] font-black">PREMIUM LOCKED</div></div>)}
                      </div>
                    )})}
                  </div>
                </div>

                <div className="flex justify-end pt-8"><button onClick={saveStore} className="h-10 px-6 bg-white text-black text-[13px] font-semibold rounded-full">Save Store & Theme</button></div>
              </div>
            )}

            {activeTab==='store' && (
              <div className="liquid-glass-card rounded-[32px] p-6 md:p-8">
                <h2 className="font-semibold text-[15px]">Store Identity</h2>
                <div className="mt-5 liquid-glass rounded-[16px] p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold">{currentPlanDef.name[0]}</div>
                  <div><div className="text-[13px] font-semibold text-white">{currentPlanDef.name}</div><div className="text-[11px] text-white/40">{currentPlanDef.features.join(' • ')}</div></div>
                </div>
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div><label className="text-[10px] font-bold tracking-widest uppercase text-white/40">Business Name</label><input value={businessName} onChange={e=>setBusinessName(e.target.value)} className="mt-2 w-full h-11 px-4 rounded-[14px] liquid-input text-[13px] text-white" /></div>
                  <div><label className="text-[10px] font-bold tracking-widest uppercase text-white/40">WhatsApp</label><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} className="mt-2 w-full h-11 px-4 rounded-[14px] liquid-input text-[13px] text-white" /></div>
                  <div className="md:col-span-2"><label className="text-[10px] font-bold tracking-widest uppercase text-white/40">Store Slug</label><input value={slug} onChange={e=>setSlug(e.target.value)} className="mt-2 w-full h-11 px-4 rounded-[14px] liquid-input text-[13px] text-white" /></div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button onClick={saveStore} className="h-11 px-7 bg-white text-black rounded-full text-[13px] font-semibold">{saving?'Saving...':'Save Store'}</button>
                  <button onClick={copyLink} className="h-11 px-6 liquid-glass rounded-full text-[13px] text-white">{copied?'Copied!':'Copy Link'}</button>
                </div>
                {profile && <div className="mt-8"><h3 className="font-semibold text-[13px] text-white">Premium Editor</h3><div className="mt-3 liquid-glass rounded-[16px] p-2"><PremiumThemeEditor profile={{...profile, premium_custom: premiumCustom} as any} onSave={(d:any)=>{ setPremiumCustom(d); setProfile({...profile, premium_custom: d} as any) }} /></div></div>}
              </div>
            )}

            {activeTab==='products' && (
              <div className="space-y-4">
                <div className="liquid-glass-card rounded-[32px] p-6 md:p-8">
                  <h2 className="font-semibold text-[14px] text-white">Add Product</h2>
                  <label className="mt-6 liquid-glass rounded-[20px] border-dashed border-white/20 p-8 flex flex-col items-center justify-center cursor-pointer min-h-[160px]">
                    {previews.length ? <div className="grid grid-cols-5 gap-2 w-full">{previews.map((src,i)=><div key={i} className="relative"><img src={src} className="w-full h-[72px] object-cover rounded-[12px] border border-white/20" /><button type="button" onClick={(e)=>{e.preventDefault(); removeFileAt(i)}} className="absolute -top-2 -right-2 w-5 h-5 bg-white text-black rounded-full text-[10px]">✕</button></div>)}</div> : <><UploadIcon /><div className="mt-4 text-[14px] font-semibold text-white">Drop images or click</div></>}
                    <input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
                  </label>
                  <div className="mt-6 grid md:grid-cols-2 gap-3">
                    <input placeholder="Product name *" value={prodName} onChange={e=>setProdName(e.target.value)} className="w-full h-11 px-4 rounded-[14px] liquid-input text-[13px] text-white" />
                    <input placeholder="Price *" type="number" value={prodPrice} onChange={e=>setProdPrice(e.target.value)} className="w-full h-11 px-4 rounded-[14px] liquid-input text-[13px] text-white" />
                    <textarea placeholder="Description" value={prodDesc} onChange={e=>setProdDesc(e.target.value)} className="md:col-span-2 w-full min-h-[80px] p-4 rounded-[14px] liquid-input text-[13px] text-white resize-none" />
                  </div>
                  <div className="mt-6 flex justify-end"><button onClick={addProduct} disabled={uploading} className="h-11 px-7 bg-white text-black text-[13px] font-semibold rounded-full">{uploading?'Uploading...':'Add Product →'}</button></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {products.map(p => (<PremiumProductCard key={p.id} p={p} onEdit={startEdit} onDelete={deleteProduct} themeId={theme} imageLimit={imageLimit} />))}
                </div>
              </div>
            )}

            {activeTab==='analytics' && <div className="liquid-glass-card rounded-[32px] p-2">{profile && <RealAnalytics userId={profile.id} currentPlanId={currentPlanId} />}</div>}
            {activeTab==='payments' && (
              <div className="liquid-glass-card rounded-[32px] p-6 md:p-8">
                <h2 className="font-semibold text-[16px] text-white">Pro Plans — Till {TILL_ID}</h2>
                <div className="mt-6 grid md:grid-cols-3 gap-4">
                  <div className="liquid-glass rounded-[20px] p-5">
                    <div className="text-[10px] tracking-widest text-white/40 font-bold">JAZZCASH TILL ID</div>
                    <div className="mt-3 flex items-center gap-2"><span className="font-mono text-[20px] font-bold text-white">{TILL_ID}</span><button onClick={copyTill} className="h-7 px-3 rounded-full liquid-glass text-[10px] text-white">{copiedTill?'Copied!':'Copy'}</button></div>
                    <div className="mt-3 bg-white rounded-[14px] p-3 flex justify-center"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=JAZZCASH_TILL_${TILL_ID}`} alt="QR" className="w-[120px] h-[120px]"/></div>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div className="radio-container">
                      {plans.map(p=>{ const displayPrice = getDisplayPrice(p); const isSelected = selectedPlan?.id===p.id; return (<div key={p.id} className="contents"><input type="radio" id={`dash-${p.id}`} name="dash-plan" checked={isSelected} onChange={()=>setSelectedPlan(p)} /><label htmlFor={`dash-${p.id}`} onClick={()=>setSelectedPlan(p)}><div className="flex justify-between"><span className="font-bold text-[14px] text-white">{p.name}</span><span className="text-[10px] px-2.5 h-6 rounded-full bg-white text-black font-bold">Rs. {displayPrice}/mo</span></div><div className="text-[11px] mt-1.5 opacity-60 text-white">{p.features.join(' • ')}</div></label></div>)})}
                    </div>
                    {selectedPlan && selectedPlan.monthly>0 && <div className="rounded-[20px] liquid-glass p-5"><input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder={`Txn ID to Till ${TILL_ID}`} className="w-full h-12 px-4 rounded-[14px] liquid-input text-white text-[12px]"/><button onClick={handleBuyPlan} disabled={purchasing} className="mt-3 w-full h-12 bg-white text-black rounded-full font-bold text-[13px]">{purchasing?'Submitting...':`Activate ${selectedPlan.name}`}</button></div>}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        <div className="md:hidden fixed bottom-4 left-4 right-4 z-30">
          <div className="liquid-nav rounded-[24px] p-2 flex items-center justify-between gap-1">
            {navItems.map((item:any)=>(<button key={item.id} onClick={()=>setActiveTab(item.id)} className={`flex-1 h-12 rounded-[16px] flex flex-col items-center justify-center gap-0.5 ${activeTab===item.id?'bg-white text-black':'text-white/50'}`}><span>{item.icon}</span><span className="text-[9px]">{item.label}</span></button>))}
          </div>
        </div>
      </div>
      {errorMsg && <div className="fixed bottom-4 right-4 z-50 bg-red-500/90 text-white px-4 py-2 rounded-full text-[12px]">{errorMsg}</div>}
    </div>
  )
}
