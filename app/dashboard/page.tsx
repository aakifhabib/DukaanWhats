'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STORE_THEMES, getTheme, ThemeCategory, getAdvancedThemes } from '@/lib/storeThemes'
import { DukaanWhatsLoader } from '@/components/DukaanWhatsLoader'

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
  const [activeTab, setActiveTab] = useState<'store'|'themes'|'products'|'payments'>('themes')
  const [selectedPlan, setSelectedPlan] = useState<PlanDef | null>(null)
  const [billing, setBilling] = useState<Billing>('monthly')
  const [txnId, setTxnId] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const [copiedTill, setCopiedTill] = useState(false)
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

  // --- THEME CLASSIFICATION: 3 Premium (glass) + 8 Advanced ---
  const premiumThemes = getAdvancedThemes() // These 3 are the glass premium
  const premiumIds = premiumThemes.map(t=>t.id)
  // 8 Advanced = all themes with category 'advanced' OR from STORE_THEMES excluding premium, limited to 8
  const allAdvancedRaw = STORE_THEMES.filter(t => (t.category as string) === 'advanced' && !premiumIds.includes(t.id))
  const advancedThemesList = allAdvancedRaw.length >= 8 ? allAdvancedRaw.slice(0,8) : [...allAdvancedRaw, ...STORE_THEMES.filter(t=>!premiumIds.includes(t.id) && (t.category as string)!=='premium').slice(0, 8 - allAdvancedRaw.length)]
  const finalAdvancedList = advancedThemesList.length ? advancedThemesList : STORE_THEMES.filter(t=>!premiumIds.includes(t.id)).slice(0,8)
  const basicAllowedAdvancedIds = finalAdvancedList.slice(0,3).map(t=>t.id)

  const isPremiumTheme = (t: any) => premiumIds.includes(t.id) || (t.category as string) === 'premium' || (t as any).isPremium
  const isAdvancedTheme = (t: any) => !isPremiumTheme(t) && finalAdvancedList.some(a=>a.id===t.id) || (t.category as string) === 'advanced'

  const isThemeLocked = (t: any) => {
    if (isPremium) return false
    if (isPremiumTheme(t)) return true // Premium glass locked for basic & advanced
    if (isAdvancedTheme(t)) {
      if (isAdvanced) return false // Advanced plan gets all 8
      return !basicAllowedAdvancedIds.includes(t.id) // Basic only 3
    }
    return false // Standard always unlocked
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
        }
      } catch (e: any) { setErrorMsg(e.message) }
      setTimeout(()=>setLoading(false), 700)
    }
    init()
  }, [])

  const handleThemeClick = (t: any) => {
    if (isThemeLocked(t)) {
      if (isPremiumTheme(t)) {
        alert(`🔒 ${t.name} — PREMIUM GLASS THEME LOCKED\n\nPremium glass themes (3) are only for Premium plan.\nYour plan: ${currentPlanId.toUpperCase()}\nBasic: 0 Premium, 3 Advanced\nAdvanced: 0 Premium, All 8 Advanced (Rs. 899/mo or Rs. 699/mo yearly)\nPremium: All themes + No watermark + Live analytics (Rs. 2999/mo or Rs. 2499/mo yearly)\n\nUpgrade via PRO → Till ${TILL_ID}`)
      } else if (isAdvancedTheme(t)) {
        alert(`🔒 ${t.name} — ADVANCED THEME LOCKED\n\nBasic plan allows only 3 Advanced themes.\nYour plan: BASIC (3/8)\nAdvanced plan: All 8 Advanced (Rs. 899/mo)\n\nUpgrade via PRO → Till ${TILL_ID}`)
      }
      setActiveTab('payments'); return
    }
    setTheme(t.id)
  }

  const saveStore = async () => {
    if (!profile) return; setSaving(true)
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-')
    const { data, error } = await supabase.from('profiles').upsert({ id: profile.id, business_name: businessName.trim(), whatsapp_number: whatsapp.trim(), store_slug: cleanSlug, store_theme: theme, updated_at: new Date().toISOString() }, { onConflict: 'id' }).select().single()
    if (error) setErrorMsg(error.message); else { setProfile(data); setSlug(cleanSlug); setSaved(true); setTimeout(()=>setSaved(false), 3000) }
    setSaving(false)
  }
  const copyLink = async () => { await navigator.clipboard.writeText(`${window.location.origin}/s/${slug}`); setCopied(true); setTimeout(()=>setCopied(false), 2000) }
  const copyTill = async () => { await navigator.clipboard.writeText(TILL_ID); setCopiedTill(true); setTimeout(()=>setCopiedTill(false), 2000) }
  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }
  const handleFile = (e: any) => {
    const sel = Array.from(e.target.files || []) as File[]
    const limit = imageLimit===999999?20:imageLimit
    if (sel.length>limit){alert(`🔒 Image Limit\nYour ${currentPlanId.toUpperCase()} plan allows ${limit} image${limit>1?'s':''} per product.\nBasic: 1\nAdvanced: 5\nPremium: Unlimited\n\nUpgrade via PRO → Till ${TILL_ID}`); return}
    setFiles(sel); setPreviews(sel.map(f=>URL.createObjectURL(f)))
  }
  const uploadOne = async (file: File, userId: string) => {
    const name = `${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g,'_')}`
    const { error } = await supabase.storage.from('product-images').upload(name, file)
    if (error) throw error; return supabase.storage.from('product-images').getPublicUrl(name).data.publicUrl
  }
  const addProduct = async () => {
    if (products.length >= productLimit){alert(`🔒 Product Limit\nYour ${currentPlanId.toUpperCase()} allows ${productLimit===999999?'Unlimited':productLimit} products.\nBasic: 5\nAdvanced: 25\nPremium: Unlimited\n\nUpgrade via PRO → Till ${TILL_ID}`); setActiveTab('payments'); return}
    if (!prodName.trim() || !prodPrice || files.length===0){alert('Name, price, photo required'); return}
    if (files.length > imageLimit && imageLimit!==999999){alert(`Plan allows ${imageLimit} images per product.`); return}
    setUploading(true)
    try{
      const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Not logged in')
      const urls = []; for (const f of files){ urls.push(await uploadOne(f, user.id)) }
      const { data } = await supabase.from('products').insert({ user_id: user.id, name: prodName.trim(), price: Number(prodPrice), image_url: urls[0], image_urls: urls }).select().single()
      if (data) setProducts([data, ...products]); setProdName(''); setProdPrice(''); setFiles([]); setPreviews([]); setActiveTab('products')
    }catch(e:any){ setErrorMsg(e.message) } setUploading(false)
  }
  const deleteProduct = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('products').delete().eq('id', id); setProducts(products.filter(p=>p.id!==id)) }
  const handleBuyPlan = async () => {
    if (!selectedPlan) return; if (selectedPlan.monthly===0){setSelectedPlan(null); return}; if (!txnId.trim()){alert('Enter Transaction ID'); return}; setPurchasing(true)
    const amount = billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal
    try{
      const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Not logged in')
      const { error } = await supabase.from('plan_payments').insert({ user_id: user.id, plan_id: selectedPlan.id, amount, till_id: TILL_ID, txn_id: txnId.trim(), status: 'pending', billing_cycle: billing })
      if (error) throw error; alert(`Submitted! Till ${TILL_ID} - ${selectedPlan.name} (${billing}) Rs. ${amount}`); setSelectedPlan(null); setTxnId('')
    }catch(e:any){alert(e.message)} setPurchasing(false)
  }

  if (loading) return <DukaanWhatsLoader message="Loading your store..." />

  const standardThemes = STORE_THEMES.filter(t => !premiumIds.includes(t.id) && !finalAdvancedList.some(a=>a.id===t.id))
  const filteredStandard = (filter as string) === 'all' ? standardThemes : STORE_THEMES.filter(t => (t.category as string) === (filter as string) && !premiumIds.includes(t.id) && !finalAdvancedList.some(a=>a.id===t.id))
  const filteredAdvanced = (filter as string) === 'all' || filter === 'advanced' ? finalAdvancedList : finalAdvancedList.filter(t=>(t.category as string)===filter)

  const getDisplayPrice = (p: PlanDef) => billing==='monthly'?p.monthly:p.yearlyMonthly

  // Current Plan Button Component (not clickable)
  const CurrentPlanButton = () => (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] cursor-default select-none">
      <span className={`w-2 h-2 rounded-full animate-pulse ${isPremium?'bg-[#E8FF86] shadow-[0_0_8px_#E8FF86]':isAdvanced?'bg-black':'bg-zinc-400'}`}></span>
      <span className="text-[11px] font-black tracking-widest">{currentPlanDef.name.toUpperCase()}</span>
      <span className="text-[10px] opacity-60 font-mono">• {productLimit===999999?'∞':productLimit} prod • {imageLimit===999999?'∞':imageLimit} img • {currentPlanDef.advancedAllowed===0?'0 Adv':currentPlanDef.advancedAllowed===3?'3 Adv':currentPlanDef.advancedAllowed===8?'8 Adv':'All Adv'} • {currentPlanDef.premiumAllowed===0?'0 Prem':currentPlanDef.premiumAllowed==='all'?'All Prem':'?'}</span>
      {isPremium && <span className="ml-1 bg-[#E8FF86] text-black text-[8px] px-1.5 py-0.5 rounded-full font-bold">NO WATERMARK • LIVE</span>}
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#F8F7F5'}} className="text-zinc-900 pb-24">
      <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        .glass-container { position: relative; display: flex; justify-content: center; align-items: center; min-height: 380px; padding: 40px 0 60px; gap: 0; }
        .glass-container .glass { position: relative; width: 260px; height: 320px; background: linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 100%); border: 1px solid rgba(255,255,255,0.18); box-shadow: 0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2); display: flex; justify-content: flex-start; align-items: center; flex-direction: column; transition: all 0.5s cubic-bezier(0.23,1,0.32,1); border-radius: 20px; margin: 0 -50px; backdrop-filter: blur(18px); transform: rotate(calc(var(--r) * 1deg)) translateY(0); cursor: pointer; overflow: hidden; padding-top: 16px; }
        .glass-container .glass:hover { transform: rotate(0deg) translateY(-12px) scale(1.05); margin: 0 20px; box-shadow: 0 30px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(232,255,134,0.3), inset 0 1px 0 rgba(255,255,255,0.3); border-color: rgba(232,255,134,0.4); z-index: 10; }
        .glass-container .glass::before { content: attr(data-text); position: absolute; bottom: 0; width: 100%; height: 48px; background: rgba(255,255,255,0.08); border-top: 1px solid rgba(255,255,255,0.15); display: flex; justify-content: center; align-items: center; color: #fff; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; backdrop-filter: blur(10px); }
        .glass-container .glass.selected { background: linear-gradient(180deg, rgba(232,255,134,0.25) 0%, rgba(255,255,255,0.05) 100%); border: 2px solid #E8FF86; transform: rotate(0deg) translateY(-16px) scale(1.08); margin: 0 22px; z-index: 20; box-shadow: 0 30px 60px rgba(0,0,0,0.4), 0 0 30px rgba(232,255,134,0.5); }
        .glass-container .glass.selected::before { background: #E8FF86; color: #000; font-weight: 900; }
        .glass-lock-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.78) 100%); backdrop-filter: blur(12px) saturate(0.7); -webkit-backdrop-filter: blur(12px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; z-index: 10; border-radius: 20px; border: 1px solid rgba(255,255,255,0.18); }
        .glass-lock-icon { width: 52px; height: 52px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.25); backdrop-filter: blur(16px); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 12px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.35); }
        .glass-preview-wrap { width: 92%; height: 208px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.15); display: flex; flex-direction: column; background: #fff; }
        .neumorph-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 32px; padding: 40px 20px; background: #e0e0e0; border-radius: 24px; }
        .card { width: 190px; height: 254px; border-radius: 50px; background: #e0e0e0; box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff; display: flex; flex-direction: column; align-items: center; padding: 22px 16px 18px; cursor: pointer; transition: all 0.35s; position: relative; margin: 0 auto; overflow: hidden; }
        .card:hover { transform: translateY(-6px) scale(1.02); }
        .card.selected { box-shadow: inset 10px 10px 20px #bebebe, inset -10px -10px 20px #ffffff, 0 0 0 2px #E8FF86, 0 12px 30px rgba(232,255,134,0.3); transform: translateY(-8px) scale(1.03); }
        .card-lock-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(224,224,224,0.6) 0%, rgba(224,224,224,0.94) 100%); backdrop-filter: blur(10px) saturate(0.9); -webkit-backdrop-filter: blur(10px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; z-index: 5; border-radius: 50px; border: 1px solid rgba(0,0,0,0.08); box-shadow: inset 0 1px 0 rgba(255,255,255,0.8); }
        .card-lock-icon { width: 40px; height: 40px; background: #e0e0e0; box-shadow: 6px 6px 12px #bebebe, -6px -6px 12px #ffffff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .card .card-icon { width: 54px; height: 54px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff; margin-bottom: 12px; }
        .card .card-preview { width: 100%; height: 78px; border-radius: 18px; background: #e0e0e0; box-shadow: inset 6px 6px 12px #bebebe, inset -6px -6px 12px #ffffff; padding: 8px; display: flex; gap: 6px; overflow: hidden; }
        .modern-tab-pill { position: relative; display: flex; background: #0A0A0A; border-radius: 999px; padding: 4px; gap: 2px; }
        .modern-tab { height: 36px; padding: 0 18px; border-radius: 999px; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 7px; white-space: nowrap; transition: all .3s; }
        .modern-tab-active { background: #FFFFFF; color: #0A0A0A; font-weight: 600; }
        .modern-tab-inactive { color: rgba(255,255,255,0.6); }
        .pro-glow-btn{position:relative;background:#E8FF86;color:#0A0A0A;border-radius:999px;height:36px;padding:0 18px;font-size:13px;font-weight:700;display:flex;align-items:center;gap:8px;box-shadow:0 0 0 1px #E8FF86,0 0 24px rgba(232,255,134,0.6);white-space:nowrap}
        .pro-glow-btn.active{background:#0A0A0A;color:#E8FF86;border:1px solid #E8FF86;box-shadow:0 0 28px rgba(232,255,134,0.7)}
        .pro-dot{width:7px;height:7px;background:#0A0A0A;border-radius:999px;animation:proPulse 2s infinite}
        .pro-dot.active{background:#E8FF86}
        @keyframes proPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
        .billing-toggle{display:flex;background:#0A0A0A;border-radius:999px;padding:4px;gap:4px}
        .billing-btn{height:32px;padding:0 16px;border-radius:999px;font-size:12px;font-weight:600;transition:all .3s;white-space:nowrap}
        .billing-btn-active{background:#fff;color:#0A0A0A}
        .billing-btn-inactive{color:rgba(255,255,255,0.6)}
        .radio-container{--main-color:#E8FF86;--total-radio:3;display:flex;flex-direction:column;position:relative;padding-left:1rem}
        .radio-container input{appearance:none;position:absolute;opacity:0}
        .radio-container .glider-container{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(0deg,transparent 0%,rgba(20,20,20,0.15) 50%,transparent 100%);width:1px}
        .radio-container .glider{position:relative;height:calc(100% / var(--total-radio));width:100%;background:linear-gradient(0deg,transparent 0%,var(--main-color) 50%,transparent 100%);transition:transform .5s cubic-bezier(0.37,1.95,0.66,0.56)}
        .radio-container .glider::before{content:"";position:absolute;height:60%;width:300%;top:50%;transform:translateY(-50%);background:var(--main-color);filter:blur(10px)}
        .radio-container label{cursor:pointer;padding:14px 12px;border-radius:12px;color:#9ca3af;transition:all .3s}
        .radio-container input:checked+label{color:#0A0A0A;background:#fff;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,.06)}
        .radio-container input:nth-of-type(1):checked~.glider-container .glider{transform:translateY(0)}
        .radio-container input:nth-of-type(2):checked~.glider-container .glider{transform:translateY(100%)}
        .radio-container input:nth-of-type(3):checked~.glider-container .glider{transform:translateY(200%)}
        @media (max-width: 768px) { .glass-container .glass { width: 155px; height: 220px; margin: 0 -22px; } .neumorph-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 20px 10px; } .card { max-width: 165px; height: 220px; border-radius: 32px; } }
      `}</style>

      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 md:px-6 h-[56px] md:h-16 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 shrink-0"><div style={{borderRadius:10}} className="w-8 h-8 md:w-9 md:h-9 bg-black text-white flex items-center justify-center font-bold">D</div><span className="font-semibold tracking-tight text-[13px] md:text-[15px] whitespace-nowrap">DukaanWhats.pk</span></Link>
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <CurrentPlanButton />
            <button onClick={copyLink} className="h-8 md:h-10 px-2.5 md:px-4 border bg-white rounded-[10px] text-[11px] md:text-[12px] font-medium whitespace-nowrap">{copied?'Copied!':'Copy Link'}</button>
            <Link href={slug ? `/s/${slug}` : '#'} target="_blank" className="h-8 md:h-10 px-2.5 md:px-5 bg-black text-white rounded-[10px] text-[11px] md:text-[12px] font-medium flex items-center justify-center whitespace-nowrap">View Store ↗</Link>
            <button onClick={logout} className="h-8 w-8 md:w-auto md:px-4 bg-zinc-100 border rounded-[10px] flex items-center justify-center text-[12px] shrink-0">↗</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 md:px-6 pt-3 md:pt-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar">
            <div className="modern-tab-pill no-scrollbar shrink-0">
              {[{ id: 'store', label: 'Store', icon: '◧' },{ id: 'themes', label: 'Themes', icon: '◨' },{ id: 'products', label: `Products ${products.length}/${productLimit===999999?'∞':productLimit}`, icon: '◫' }].map(t => (
                <button key={t.id} onClick={()=>setActiveTab(t.id as any)} className={`modern-tab ${activeTab===t.id ? 'modern-tab-active' : 'modern-tab-inactive'}`}><span>{t.icon}</span>{t.label}</button>
              ))}
            </div>
            <button onClick={()=>setActiveTab('payments')} className={`pro-glow-btn ${activeTab==='payments'?'active':''}`}><span className={`pro-dot ${activeTab==='payments'?'active':''}`}></span>PRO • Till {TILL_ID}</button>
          </div>
          <div className="flex items-center gap-2">
            <div className="billing-toggle"><button onClick={()=>setBilling('monthly')} className={`billing-btn ${billing==='monthly'?'billing-btn-active':'billing-btn-inactive'}`}>Monthly</button><button onClick={()=>setBilling('yearly')} className={`billing-btn ${billing==='yearly'?'billing-btn-active':'billing-btn-inactive'}`}>Yearly <span className="ml-1 bg-[#E8FF86] text-black text-[9px] px-1.5 py-0.5 rounded-full">-22%</span></button></div>
          </div>
        </div>
        <div className="mt-3 bg-white border rounded-[12px] p-3 flex flex-wrap items-center gap-2">
          {/* pill removed - was duplicate */}
          <span className="text-[11px] text-zinc-500">• <b>Basic:</b> 5 prod • 1 img/prod • 3 Advanced • 0 Premium Glass • <b>Advanced:</b> 25 prod • 5 img • All 8 Advanced • 0 Premium • Rs. 899/mo or Rs. 699/mo yearly • <b>Premium:</b> Unlimited • Every theme (8+3) • No watermark • Live analytics • Rs. 2999/mo or Rs. 2499/mo yearly</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-3 md:px-6 py-4 md:py-8 space-y-6">
        {activeTab==='themes' && (
          <div style={{borderRadius:20}} className="bg-white p-4 md:p-6 border">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <label className="text-[14px] font-bold">Themes — Current: {currentPlanDef.name} • {currentPlanId==='basic'?'Only 3 Advanced unlocked, 5 Advanced locked + 3 Premium locked':currentPlanId==='advanced'?'All 8 Advanced unlocked, 3 Premium locked':'All 8 Advanced + 3 Premium unlocked ✓'}</label>
              <div className="flex items-center gap-2">{/* pill removed - was duplicate */}</div>
            </div>
            <div className="text-[11px] text-zinc-500 mb-4">💡 Basic = 3 Advanced (glossy lock on 5) + 0 Premium (glossy lock on 3 glass) • Advanced = All 8 Advanced (no lock) + 0 Premium (lock on 3 glass) • Premium = Everything unlocked, no watermark, live analytics</div>

            {/* 8 Advanced Themes Grid */}
            <div className="mb-2 flex items-center gap-2"><span className="text-[12px] font-black tracking-widest bg-black text-white px-2.5 py-1 rounded-full">8 ADVANCED THEMES</span><span className="text-[11px] opacity-60">{currentPlanId==='basic'?`Basic: ${basicAllowedAdvancedIds.length}/8 unlocked`:`${currentPlanId.toUpperCase()}: ${currentPlanDef.advancedAllowed===8||currentPlanDef.advancedAllowed==='all'?'8/8 unlocked ✓':'?'} `}</span>{/* pill removed - was duplicate */}</div>
            <div className="neumorph-grid">
              {finalAdvancedList.map(t => { const isActive = theme===t.id; const locked = isThemeLocked(t); return (
                <button key={t.id} onClick={()=>handleThemeClick(t)} className={`card ${isActive?'selected':''}`}>
                  {isActive && <span style={{position:'absolute',top:14,right:18,width:22,height:22,borderRadius:999,background:'#E8FF86',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,zIndex:2}}>✓</span>}
                  <div className="card-icon" style={{background:t.colors.bg}}>{t.badge}</div>
                  <div style={{textAlign:'center',marginBottom:10}}><div style={{fontSize:13,fontWeight:800}}>{t.name}</div><div style={{fontSize:9,color:'#8a8a8a',marginTop:2}} className="uppercase tracking-widest">{t.category} • ADVANCED</div></div>
                  <div className="card-preview"><div style={{width:36,height:'100%',borderRadius:12,background:t.colors.accent}} /></div>
                  {locked && <div className="card-lock-overlay"><div className="card-lock-icon">🔒</div><div className="text-[11px] font-black tracking-widest">LOCKED</div><div className="text-[9px] opacity-60 text-center">Basic allows 3/8<br/>Need Advanced</div><div className="bg-black text-white text-[9px] px-2.5 py-1 rounded-full font-bold">UPGRADE → Rs. 899</div></div>}
                  {!locked && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#E8FF86] text-black text-[8px] px-2 py-0.5 rounded-full font-bold">UNLOCKED ✓</div>}
                </button>
              )})}
            </div>

            {/* Standard Themes */}
            <div className="mt-8 mb-2 flex items-center gap-2"><span className="text-[12px] font-black tracking-widest bg-zinc-100 border px-2.5 py-1 rounded-full">STANDARD THEMES</span><span className="text-[11px] opacity-60">All plans can use standard</span></div>
            <div className="neumorph-grid">
              {filteredStandard.map(t => { const isActive = theme===t.id; const locked = isThemeLocked(t); return (
                <button key={t.id} onClick={()=>handleThemeClick(t)} className={`card ${isActive?'selected':''}`}>
                  {isActive && <span style={{position:'absolute',top:14,right:18,width:22,height:22,borderRadius:999,background:'#E8FF86',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,zIndex:2}}>✓</span>}
                  <div className="card-icon" style={{background:t.colors.bg}}>{t.badge}</div>
                  <div style={{textAlign:'center',marginBottom:10}}><div style={{fontSize:13,fontWeight:800}}>{t.name}</div><div style={{fontSize:9,color:'#8a8a8a'}} className="uppercase">{t.category}</div></div>
                  <div className="card-preview"><div style={{width:36,height:'100%',borderRadius:12,background:t.colors.accent}} /></div>
                  {locked && <div className="card-lock-overlay"><div className="card-lock-icon">🔒</div><div className="text-[10px] font-bold">LOCKED</div></div>}
                </button>
              )})}
            </div>

            {/* 3 Premium Glass Themes */}
            <div id="advanced-glass" style={{borderRadius:20}} className="mt-10 overflow-hidden border-2 border-black relative"><div className="absolute inset-0 bg-[#0c0e13]" /><div className="absolute inset-0 opacity-50" style={{background:'radial-gradient(circle at 20% 10%, #E8FF86 0%, transparent 35%), radial-gradient(circle at 85% 85%, #7c3aed 0%, transparent 45%)'}} /><div className="relative p-6 md:p-8"><div className="flex items-center gap-3 flex-wrap"><span style={{borderRadius:999}} className="bg-[#E8FF86] text-black text-[10px] font-bold px-3 py-1 tracking-widest">3 PREMIUM GLASS THEMES</span><span className="text-white font-semibold text-[15px]">Premium Only — Glossy Glass Lock</span><span className="bg-white/10 text-white text-[10px] px-2.5 py-1 rounded-full border border-white/20">{currentPlanId==='premium'?'All 3 Premium Unlocked ✓':`Locked for ${currentPlanId.toUpperCase()} — Need Premium Rs. 2999/mo`}</span>{/* pill removed - was duplicate */}</div><div className="mt-2 text-[11px] text-white/60">Basic: 0 Premium unlocked • Advanced: 0 Premium unlocked • Premium: All 3 Premium unlocked + No watermark + Live analytics</div><div className="glass-container mt-1">{premiumThemes.map((t,i)=>{const r=[-14,0,14][i]||0; const isActive=theme===t.id; const locked=isThemeLocked(t); return <div key={t.id} className={`glass ${isActive?'selected':''}`} data-text={t.name} style={{'--r':r} as any} onClick={()=>handleThemeClick(t)}><div className="glass-preview-wrap"><div className="glass-preview-header" style={{background:t.colors.bg,color:t.colors.text}}><span>{t.id.slice(0,14).toUpperCase()} • PREMIUM</span><span className="text-[6px] opacity-60">{locked?'🔒 LOCKED':'✓ UNLOCKED'}</span></div><div className="glass-preview-body" style={{background:t.colors.bg}}><div style={{height:28,borderRadius:6,background:t.colors.card,border:`1px solid ${t.colors.border}`}} /></div></div>{isActive && <div className="absolute top-3 right-3 w-6 h-6 bg-[#E8FF86] rounded-full flex items-center justify-center text-[11px] font-bold shadow-[0_0_15px_#E8FF86]">✓</div>}{locked && <div className="glass-lock-overlay"><div className="glass-lock-icon">🔒</div><div className="text-white text-[12px] font-black tracking-widest">PREMIUM LOCKED</div><div className="text-white/70 text-[10px] text-center leading-[1.3]">Basic: 0/3 Premium<br/>Advanced: 0/3 Premium<br/>Need Premium<br/>Rs. 2999/mo<br/>or Rs. 2499/mo yearly</div><div className="mt-1 bg-[#E8FF86] text-black text-[9px] font-bold px-3 py-1.5 rounded-full">UPGRADE → PREMIUM</div></div>}</div>})}</div></div></div>
            <div className="flex justify-between items-center pt-6 flex-wrap gap-3"><div className="flex items-center gap-2">{/* pill removed - was duplicate */}<span className="text-[11px] text-zinc-500">Products {products.length}/{productLimit===999999?'∞':productLimit} • Images {imageLimit===999999?'∞':imageLimit}/product</span></div><div className="flex gap-2">{saved && <span className="h-11 px-4 flex items-center text-[12px] text-green-600 font-medium">✓ Saved! {getTheme(theme).name}</span>}<button onClick={saveStore} style={{borderRadius:999}} className="h-11 px-6 bg-black text-white text-[13px] font-medium">Save Store & Theme</button></div></div>
          </div>
        )}

        {activeTab==='store' && (
          <div style={{borderRadius:20}} className="bg-white p-5 md:p-7 border">
            <div className="flex items-center justify-between flex-wrap gap-2"><h2 className="font-semibold text-[15px]">Store Identity • Current Plan</h2>{/* pill removed - was duplicate */}{saved && <span style={{borderRadius:999}} className="bg-[#E8FF86] text-black border px-3 py-1 text-[11px] font-bold">Saved ✓</span>}</div>
            <div className="mt-4 bg-zinc-50 border rounded-[12px] p-4 flex items-center gap-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[12px] ${isPremium?'bg-[#E8FF86] text-black':isAdvanced?'bg-black text-white':'bg-white border'}`}>{currentPlanDef.name[0]}</div><div><div className="font-black text-[13px]">Currently Using: {currentPlanDef.name} Plan (Not Clickable)</div><div className="text-[11px] opacity-60 mt-0.5">{productLimit===999999?'Unlimited':productLimit} products • {imageLimit===999999?'Unlimited':imageLimit} images/product • {currentPlanDef.advancedAllowed===0?'0 Advanced':currentPlanDef.advancedAllowed===3?'3 Advanced':currentPlanDef.advancedAllowed===8?'All 8 Advanced':'All Advanced'} • {currentPlanDef.premiumAllowed===0?'0 Premium Glass':currentPlanDef.premiumAllowed==='all'?'All 3 Premium Glass ✓':'?'} • {isPremium?'No watermark • Live analytics':''}</div></div><span className={`ml-auto px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest ${isPremium?'bg-[#E8FF86] text-black':'bg-black text-white'}`}>{currentPlanId.toUpperCase()} • Rs. {currentPlanDef.monthly}/mo</span></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div><label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Business Name</label><input value={businessName} onChange={e=>setBusinessName(e.target.value)} style={{borderRadius:12}} className="mt-2 w-full h-11 px-4 border bg-zinc-50/50 text-[14px] focus:bg-white focus:outline-none focus:border-black" /></div>
              <div><label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Store Slug</label><input value={slug} onChange={e=>setSlug(e.target.value)} style={{borderRadius:12}} className="mt-2 w-full h-11 px-4 border bg-zinc-50/50 font-mono text-[13px] focus:bg-white focus:outline-none focus:border-black" /></div>
              <div><label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">WhatsApp</label><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} style={{borderRadius:12}} className="mt-2 w-full h-11 px-4 border bg-zinc-50/50 text-[14px] focus:bg-white focus:outline-none focus:border-black" /></div>
            </div>
            <div className="flex justify-end mt-6"><button onClick={saveStore} disabled={saving} style={{borderRadius:999}} className="h-11 px-7 bg-black text-white text-[13px] font-medium">{saving?'Saving...':'Save Store →'}</button></div>
          </div>
        )}

        {activeTab==='products' && (
          <div className="space-y-4">
            <div style={{borderRadius:20}} className="bg-white border overflow-hidden"><div className="p-4 md:p-6 border-b flex items-center justify-between flex-wrap gap-2"><div className="flex items-center gap-2"><h2 className="font-semibold text-[14px]">Add Product — {products.length}/{productLimit===999999?'∞':productLimit} • {files.length}/{imageLimit===999999?'∞':imageLimit} images</h2>{/* pill removed - was duplicate */}</div>{products.length>=productLimit && <span className="text-[10px] px-2.5 py-1 rounded-full bg-red-100 text-red-600 border border-red-200 font-bold">LIMIT REACHED</span>}</div><div className="p-4 md:p-6 space-y-4"><label style={{borderRadius:16}} className="border-2 border-dashed p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 min-h-[120px] bg-zinc-50/30">{previews.length ? <div className="grid grid-cols-5 gap-2 w-full">{previews.map((src,i)=><img key={i} src={src} style={{borderRadius:10}} className="w-full h-[60px] object-cover border" />)}</div> : <div className="text-center"><div style={{borderRadius:12}} className="w-11 h-11 bg-black text-white flex items-center justify-center text-lg mx-auto">+</div><div className="mt-2 font-medium text-[13px]">Upload — Basic 1 image, Advanced 5 images, Premium Unlimited</div><div className="mt-1 text-[11px] opacity-60">Your plan {currentPlanId.toUpperCase()} allows {imageLimit===999999?'Unlimited':imageLimit} image{imageLimit!==1?'s':''} per product</div></div>}<input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" /></label><div className="grid md:grid-cols-2 gap-3"><input placeholder="Product name" value={prodName} onChange={e=>setProdName(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border bg-zinc-50/50 text-[13px] focus:bg-white focus:outline-none focus:border-black" /><input placeholder="Price Rs. 3500" type="number" value={prodPrice} onChange={e=>setProdPrice(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border bg-zinc-50/50 text-[13px] focus:bg-white focus:outline-none focus:border-black" /></div><div className="flex justify-end"><button onClick={addProduct} disabled={uploading || products.length>=productLimit} style={{borderRadius:999}} className="h-11 px-7 bg-black text-white text-[13px] font-medium disabled:opacity-40">{uploading?'Uploading...':products.length>=productLimit?`Limit ${productLimit===999999?'∞':productLimit} — Upgrade`:`Add Product →`}</button></div></div></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{products.map(p => (<div key={p.id} style={{borderRadius:16}} className="bg-white border p-2.5 group relative"><img src={p.image_url} style={{borderRadius:10}} className="w-full h-32 object-cover bg-zinc-50" /><div className="mt-2"><div className="font-medium text-[12px] truncate">{p.name}</div><div className="text-[12px] font-bold">Rs. {p.price}</div></div><button onClick={()=>deleteProduct(p.id)} className="absolute top-2 right-2 w-6 h-6 bg-white shadow border rounded-full flex items-center justify-center text-[10px]">✕</button></div>))}</div>
          </div>
        )}

        {activeTab==='payments' && (
          <div className="bg-white border rounded-[24px] p-5 md:p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#E8FF86] opacity-[0.08] rounded-full blur-[80px]"></div>
            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4"><div className="w-14 h-14 bg-black text-white rounded-[14px] flex items-center justify-center">⬡</div><div><h2 className="font-black text-[20px] tracking-tight">Pricing — Till ID {TILL_ID} — Current: {currentPlanDef.name}</h2><p className="text-[12px] text-zinc-500 mt-1">{/* pill removed - was duplicate */}</p></div></div>
                <div className="billing-toggle"><button onClick={()=>setBilling('monthly')} className={`billing-btn ${billing==='monthly'?'billing-btn-active':'billing-btn-inactive'}`}>Monthly</button><button onClick={()=>setBilling('yearly')} className={`billing-btn ${billing==='yearly'?'billing-btn-active':'billing-btn-inactive'}`}>Yearly <span className="ml-1 bg-[#E8FF86] text-black text-[9px] px-1.5 py-0.5 rounded-full">-22%</span></button></div>
              </div>

              <div className="mt-8 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
                <div className="relative rounded-[20px] overflow-hidden border border-[#1a1a2e] bg-[#0B0B1A] text-white p-6"><div className="absolute inset-0 opacity-80" style={{background:'radial-gradient(ellipse at 20% 0%, #1e1b8f 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, #4c1d95 0%, transparent 60%)'}}></div><div className="relative z-10 space-y-4"><div className="flex justify-between"><div className="text-[10px] tracking-[0.25em] uppercase opacity-40 font-bold">JAZZCASH BUSINESS TILL — CURRENT {currentPlanId.toUpperCase()}</div><button onClick={copyTill} className="h-7 px-3 bg-white/10 border border-white/10 rounded-full text-[10px]">{copiedTill?'Copied!':'Copy ID'}</button></div><div className="bg-white/[0.06] border border-white/[0.08] rounded-[14px] p-4"><div className="text-[10px] uppercase opacity-50">Till ID Number</div><div className="text-[32px] font-black font-mono tracking-[0.12em]">{TILL_ID}</div></div><div className="bg-white rounded-[14px] p-3"><img src={`https://barcodeapi.org/api/code128/${TILL_ID}`} alt="Barcode" className="w-full h-[52px] object-contain"/><div className="text-center text-[11px] font-mono text-black font-black tracking-[0.3em]">{TILL_ID}</div></div><div className="bg-white rounded-[14px] p-2.5 flex justify-center"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=JAZZCASH_TILL_${TILL_ID}`} alt="QR" className="w-[120px] h-[120px]"/></div></div></div>

                <div className="space-y-4">
                  <div className="radio-container" style={{"--total-radio": plans.length} as any}>
                    {plans.map(p=>{
                      const displayPrice = getDisplayPrice(p)
                      const isSelected = selectedPlan?.id===p.id
                      const isCurrent = currentPlanId===p.id
                      return (
                        <div key={p.id} className="contents">
                          <input type="radio" id={`dash-${p.id}`} name="dash-plan" checked={isSelected} onChange={()=>setSelectedPlan(p)} />
                          <label htmlFor={`dash-${p.id}`} onClick={()=>setSelectedPlan(p)} className={isCurrent?'!bg-[#E8FF86]/30 !border-[#E8FF86]' : ''}>
                            <div className="flex justify-between items-start gap-2">
                              <div className="min-w-0 flex-1"><div className="flex items-center gap-2 flex-wrap"><span className="font-black text-[14px]">{p.name}</span>{isCurrent && <span className="bg-black text-white text-[8px] px-2 py-0.5 rounded-full font-bold">CURRENT — IN USE</span>}<span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${p.id==='premium'?'bg-[#E8FF86] text-black':p.id==='advanced'?'bg-black text-white':'bg-zinc-200'}`}>Rs. {displayPrice}/mo</span>{p.id==='advanced' && <span className="bg-[#E8FF86] text-black text-[8px] px-1.5 py-0.5 rounded-full font-bold">POPULAR</span>}</div><div className="text-[11px] mt-1 opacity-70 leading-[1.2]">{p.features.join(' • ')}</div><div className="text-[10px] mt-1 opacity-50">{p.products===999999?'Unlimited':p.products} products • {p.imagesPerProduct===999999?'Unlimited':p.imagesPerProduct} img • {p.advancedAllowed===0?'0 Adv':p.advancedAllowed===3?'3 Adv':p.advancedAllowed===8?'All 8 Adv':'All Adv'} • {p.premiumAllowed===0?'0 Premium':p.premiumAllowed==='all'?'All 3 Premium ✓':'?'}</div></div><div className="text-right"><div className="font-black text-[16px]">Rs. {displayPrice}</div><div className="text-[10px] opacity-60">{billing==='yearly'?`Billed Rs. ${p.yearlyTotal}/yr`:p.id!=='basic'?`Yearly Rs. ${p.yearlyMonthly}/mo`:''}</div></div>
                            </div>
                          </label>
                        </div>
                      )
                    })}
                    <div className="glider-container"><div className="glider"></div></div>
                  </div>

                  {selectedPlan && selectedPlan.monthly>0 && (
                    <div className="rounded-[16px] border-2 border-black bg-[#FFFEF5] p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-[#E8FF86] opacity-20 rounded-full blur-[20px]"></div>
                      <div className="relative">
                        <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[12px]">₨</div><div className="text-[13px] font-black">Pay Rs. {billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal} → Till {TILL_ID} ({billing}) — Currently using {currentPlanDef.name}</div></div>
                        <input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder={`Txn ID after paying Rs. ${billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal} to Till ${TILL_ID}`} className="mt-4 w-full h-12 px-4 rounded-[12px] border-2 bg-white text-[12px] font-mono focus:outline-none focus:border-black"/>
                        <button onClick={handleBuyPlan} disabled={purchasing} className="mt-3 w-full h-12 bg-black text-white rounded-full font-bold text-[13px] flex items-center justify-center gap-2">{purchasing?'Submitting...':`I Paid Rs. ${billing==='monthly'?selectedPlan.monthly:selectedPlan.yearlyTotal} — Activate ${selectedPlan.name} (Current: ${currentPlanDef.name})`} <span className="w-5 h-5 bg-white text-black rounded-full flex items-center justify-center">↗</span></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
