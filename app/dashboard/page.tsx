'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STORE_THEMES, getTheme, ThemeCategory, getAdvancedThemes } from '@/lib/storeThemes'

type Profile = { 
  id: string; 
  business_name: string; 
  whatsapp_number: string; 
  store_slug: string; 
  store_theme?: string;
  current_plan?: string;
  plan_expires_at?: string;
  plan_status?: string;
  payment_cod_enabled?: boolean;
  payment_jazzcash_enabled?: boolean;
  payment_jazzcash_number?: string;
  payment_jazzcash_title?: string;
  payment_easypaisa_enabled?: boolean;
  payment_easypaisa_number?: string;
  payment_easypaisa_title?: string;
  payment_bank_enabled?: boolean;
  payment_bank_details?: string;
  delivery_charges?: number;
}
type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; user_id: string }
type Plan = { id: string; name: string; price: number; price_monthly?: number; price_yearly_total?: number; price_yearly_per_month?: number; duration_days: number; max_products: number; max_images_per_product: number; can_use_advanced_themes: boolean; can_use_all_payments: boolean; can_view_orders: boolean; can_remove_branding: boolean; features: string[] }

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentPlanDef, setCurrentPlanDef] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [businessName, setBusinessName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [slug, setSlug] = useState('')
  const [theme, setTheme] = useState('clothing-noor')
  const [saved, setSaved] = useState(false)
  const [prodName, setProdName] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [filter, setFilter] = useState<ThemeCategory | 'all' | string>('all')
  const [showPlans, setShowPlans] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly'|'yearly'>('monthly')
  const [payMethod, setPayMethod] = useState('jazzcash')
  const [txnId, setTxnId] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [purchasing, setPurchasing] = useState(false)
  const [ordersCount, setOrdersCount] = useState(0)
  const [codEnabled, setCodEnabled] = useState(true)
  const [jazzEnabled, setJazzEnabled] = useState(false)
  const [jazzNumber, setJazzNumber] = useState('')
  const [jazzTitle, setJazzTitle] = useState('')
  const [easyEnabled, setEasyEnabled] = useState(false)
  const [easyNumber, setEasyNumber] = useState('')
  const [easyTitle, setEasyTitle] = useState('')
  const [bankEnabled, setBankEnabled] = useState(false)
  const [bankDetails, setBankDetails] = useState('')
  const [deliveryCharges, setDeliveryCharges] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      let { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!prof) {
        const metaName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'My Store'
        const baseSlug = metaName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20) || `store-${user.id.slice(0,6)}`
        let finalSlug = baseSlug
        const { data: existing } = await supabase.from('profiles').select('id').eq('store_slug', baseSlug).single()
        if (existing) finalSlug = `${baseSlug}-${Math.floor(Math.random()*900+100)}`
        const newProfile = { id: user.id, business_name: metaName, whatsapp_number: '', store_slug: finalSlug, store_theme: 'clothing-noor', current_plan: 'basic', payment_cod_enabled: true }
        const { data: created } = await supabase.from('profiles').insert(newProfile).select().single()
        if (created) prof = created
      }
      if (prof) {
        setProfile(prof)
        setBusinessName(prof.business_name || '')
        setWhatsapp(prof.whatsapp_number || '')
        setSlug(prof.store_slug || '')
        setTheme(prof.store_theme || 'clothing-noor')
        setCodEnabled(prof.payment_cod_enabled ?? true)
        setJazzEnabled(prof.payment_jazzcash_enabled ?? false)
        setJazzNumber(prof.payment_jazzcash_number || '')
        setJazzTitle(prof.payment_jazzcash_title || '')
        setEasyEnabled(prof.payment_easypaisa_enabled ?? false)
        setEasyNumber(prof.payment_easypaisa_number || '')
        setEasyTitle(prof.payment_easypaisa_title || '')
        setBankEnabled(prof.payment_bank_enabled ?? false)
        setBankDetails(prof.payment_bank_details || '')
        setDeliveryCharges(prof.delivery_charges || 0)
        const { data: prods } = await supabase.from('products').select('*').eq('user_id', prof.id).order('created_at', { ascending: false })
        if (prods) setProducts(prods)
        try { const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', prof.id); if (count) setOrdersCount(count) } catch(e){}
      }
      try {
        const { data: plansData } = await supabase.from('plans').select('*').order('price_monthly', { ascending: true })
        if (plansData && plansData.length>0) {
          setPlans(plansData)
          const cur = plansData.find(p=>p.id===prof?.current_plan) || plansData[0]
          setCurrentPlanDef(cur)
        } else {
          const fallback: Plan[] = [
            { id: 'basic', name: 'Basic', price: 0, price_monthly: 0, price_yearly_total: 0, price_yearly_per_month: 0, duration_days: 36500, max_products: 5, max_images_per_product: 1, can_use_advanced_themes: false, can_use_all_payments: false, can_view_orders: false, can_remove_branding: false, features: ['5 Products','1 Image','3 Themes','COD Only'] },
            { id: 'advanced', name: 'Advanced', price: 899, price_monthly: 899, price_yearly_total: 8388, price_yearly_per_month: 699, duration_days: 30, max_products: 30, max_images_per_product: 5, can_use_advanced_themes: false, can_use_all_payments: true, can_view_orders: true, can_remove_branding: false, features: ['30 Products','5 Images','All Standard Themes','All Payments','Orders Dashboard','Rs.899/mo or Rs.699/mo yearly'] },
            { id: 'premium', name: 'Premium', price: 2499, price_monthly: 2499, price_yearly_total: 23988, price_yearly_per_month: 1999, duration_days: 30, max_products: 1000, max_images_per_product: 5, can_use_advanced_themes: true, can_use_all_payments: true, can_view_orders: true, can_remove_branding: true, features: ['Unlimited','All Themes Glass','All Payments','No Branding','Rs.2499/mo or Rs.1999/mo yearly'] },
          ]
          setPlans(fallback)
          setCurrentPlanDef(fallback.find(p=>p.id===prof?.current_plan) || fallback[0])
        }
      } catch(e){}
      setLoading(false)
    }
    init()
  }, [])

  const saveStore = async () => {
    if (!profile) return
    if (currentPlanDef && !currentPlanDef.can_use_advanced_themes && ['sleek-beige','sleek-dark','sleek-editorial'].includes(theme)) {
      alert(`Advanced themes locked. Upgrade to Premium.`)
      return
    }
    if (currentPlanDef && !currentPlanDef.can_use_all_payments && (jazzEnabled || easyEnabled || bankEnabled)) {
      alert('JazzCash/Easypaisa/Bank requires Advanced plan.')
      return
    }
    const { error } = await supabase.from('profiles').update({
      business_name: businessName, whatsapp_number: whatsapp, store_slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'), store_theme: theme,
      payment_cod_enabled: codEnabled, payment_jazzcash_enabled: jazzEnabled, payment_jazzcash_number: jazzNumber, payment_jazzcash_title: jazzTitle,
      payment_easypaisa_enabled: easyEnabled, payment_easypaisa_number: easyNumber, payment_easypaisa_title: easyTitle,
      payment_bank_enabled: bankEnabled, payment_bank_details: bankDetails, delivery_charges: Number(deliveryCharges) || 0
    }).eq('id', profile.id)
    if (!error) { setSaved(true); setTimeout(()=>setSaved(false), 2500) } else { alert(error.message) }
  }

  const copyLink = async () => { await navigator.clipboard.writeText(`https://dukaan-whats.vercel.app/s/${slug}`); setCopied(true); setTimeout(()=>setCopied(false), 2000) }
  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }
  const handleFile = (e: any) => { const sel = Array.from(e.target.files || []) as File[]; const limit = currentPlanDef?.max_images_per_product || 1; if (sel.length>limit){alert(`Your ${currentPlanDef?.name} plan allows max ${limit} images. Upgrade.`); return}; setFiles(sel); setPreviews(sel.map(f=>URL.createObjectURL(f))) }
  const uploadOne = async (file: File) => { if (!profile) return ''; const name = `${profile.id}/${Date.now()}_${file.name}`; const { data, error } = await supabase.storage.from('product-images').upload(name, file); if (error||!data) return ''; return supabase.storage.from('product-images').getPublicUrl(name).data.publicUrl }
  const addProduct = async () => {
    if (!profile) return
    if (currentPlanDef && products.length >= currentPlanDef.max_products) {
      alert(`Product limit reached: ${currentPlanDef.name} allows ${currentPlanDef.max_products} products. Upgrade.`)
      setShowPlans(true); return
    }
    if (!prodName || !prodPrice || files.length===0){alert('Name, price, photo required'); return}
    setUploading(true)
    try{
      const urls = (await Promise.all(files.map(uploadOne))).filter(Boolean)
      if (!urls.length) throw new Error('Upload failed')
      let { data, error } = await supabase.from('products').insert({ user_id: profile.id, name: prodName, price: Number(prodPrice), image_url: urls[0], image_urls: urls }).select().single()
      if (error && error.message.includes('image_urls')) { const fb = await supabase.from('products').insert({ user_id: profile.id, name: prodName, price: Number(prodPrice), image_url: urls[0] }).select().single(); data=fb.data; error=fb.error }
      if (error) throw error
      if (data) setProducts([data,...products])
      setProdName(''); setProdPrice(''); setFiles([]); setPreviews([])
    }catch(e:any){alert(e.message)}
    setUploading(false)
  }
  const deleteProduct = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('products').delete().eq('id', id); setProducts(products.filter(p=>p.id!==id)) }

  const handleBuyPlan = async () => {
    if (!profile || !selectedPlan) return
    if (selectedPlan.price_monthly===0) { alert('Basic is free forever.'); return }
    if (!txnId) { alert('Enter Transaction ID'); return }
    setPurchasing(true)
    try {
      let proofUrl = ''
      if (proofFile) {
        const name = `${profile.id}/proofs/${Date.now()}_${proofFile.name}`
        const { data, error } = await supabase.storage.from('product-images').upload(name, proofFile)
        if (!error && data) proofUrl = supabase.storage.from('product-images').getPublicUrl(name).data.publicUrl
      }
      const isYearly = billingCycle==='yearly'
      const amount = isYearly ? (selectedPlan.price_yearly_total || 0) : (selectedPlan.price_monthly || 0)
      const months = isYearly ? 12 : 1
      const durationDays = isYearly ? 365 : (selectedPlan.duration_days || 30)
      const { error } = await supabase.from('plan_purchases').insert({
        user_id: profile.id, plan_id: selectedPlan.id, amount_paid: amount, payment_method: payMethod, transaction_id: txnId, proof_image_url: proofUrl, status: 'pending', billing_cycle: billingCycle, billing_months: months, expires_at: new Date(Date.now() + durationDays*24*60*60*1000).toISOString()
      })
      if (error) throw error
      const autoApprove = true
      if (autoApprove) {
        await supabase.from('profiles').update({ current_plan: selectedPlan.id, plan_started_at: new Date().toISOString(), plan_expires_at: new Date(Date.now() + durationDays*24*60*60*1000).toISOString(), plan_status: 'active' }).eq('id', profile.id)
        alert(`✅ ${selectedPlan.name} ${isYearly?'Yearly':'Monthly'} plan activated! Rs.${amount} - Privileges unlocked.`)
        window.location.reload()
      } else {
        alert('Purchase submitted! We will verify within 2 hours.')
        setShowPlans(false)
      }
    } catch(e:any){ alert(e.message) }
    setPurchasing(false)
  }

  if (loading) return <div style={{minHeight:'100vh',background:'#F8F7F5',display:'flex',alignItems:'center',justifyContent:'center'}} className="text-[13px]">Loading store...</div>

  const standardThemes = STORE_THEMES.filter(t => t.category !== 'advanced')
  const advancedThemes = getAdvancedThemes()
  const filtered = (filter as string) === 'all' ? standardThemes : (filter as string) === 'advanced' ? [] : STORE_THEMES.filter(t => (t.category as string) === (filter as string) && t.category !== 'advanced')
  const isPremium = profile?.current_plan==='premium'
  const isAdvanced = profile?.current_plan==='advanced' || isPremium
  const planExpired = profile?.plan_expires_at ? new Date(profile.plan_expires_at) < new Date() : false
  const effectivePlan = planExpired ? plans.find(p=>p.id==='basic') || currentPlanDef : currentPlanDef

  const getDisplayPrice = (plan: Plan) => {
    if (plan.price_monthly===0) return { monthly: 0, yearlyPerMonth: 0, yearlyTotal: 0 }
    return { monthly: plan.price_monthly || plan.price, yearlyPerMonth: plan.price_yearly_per_month || 0, yearlyTotal: plan.price_yearly_total || 0 }
  }

  return (
    <div style={{minHeight:'100vh',background:'#F8F7F5'}} className="text-zinc-900 pb-24">
      <style>{`
        .glass-container { position: relative; display: flex; justify-content: center; align-items: center; min-height: 340px; padding: 30px 0 50px; gap: 0; }
        .glass-container .glass { position: relative; width: 260px; height: 300px; background: linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0.02)); border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 25px 45px rgba(0,0,0,0.35); display: flex; justify-content: flex-start; align-items: center; flex-direction: column; transition: 0.6s cubic-bezier(0.23,1,0.32,1); border-radius: 18px; margin: 0 -55px; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); transform: rotate(calc(var(--r) * 1deg)); cursor: pointer; overflow: hidden; padding-top: 14px; }
        .glass-container:hover .glass { transform: rotate(0deg); margin: 0 18px; }
        .glass-container .glass::before { content: attr(data-text); position: absolute; bottom: 0; width: 100%; height: 46px; background: rgba(255,255,255,0.06); border-top: 1px solid rgba(255,255,255,0.12); display: flex; justify-content: center; align-items: center; color: #fff; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; }
        .glass-container .glass.selected { background: linear-gradient(rgba(232,255,134,0.22), rgba(255,255,255,0.04)); border: 2px solid #E8FF86; box-shadow: 0 30px 50px rgba(0,0,0,0.45), 0 0 40px rgba(232,255,134,0.25); transform: rotate(0deg) translateY(-14px) scale(1.06); margin: 0 18px; z-index: 20; }
        .glass-container .glass.selected::before { background: #E8FF86; color: #000; }
        .glass-preview-wrap { width: 92%; height: 208px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 8px 20px rgba(0,0,0,0.25); display: flex; flex-direction: column; background: #fff; pointer-events: none; }
        .toggle { width: 40px; height: 24px; border-radius: 999px; position: relative; cursor: pointer; transition: all 0.2s; } .toggle.on { background: #111; } .toggle.off { background: #e5e7eb; } .toggle-dot { width: 18px; height: 18px; border-radius: 999px; background: white; position: absolute; top: 3px; transition: all 0.2s; } .toggle.on .toggle-dot { left: 19px; } .toggle.off .toggle-dot { left: 3px; }
        .plan-card { transition: all 0.3s; } .plan-card:hover { transform: translateY(-4px); } .plan-card.current { border-color: #E8FF86; box-shadow: 0 0 0 2px #E8FF86, 0 20px 40px rgba(0,0,0,0.1); }
      `}</style>

      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0"><div style={{borderRadius:10}} className="w-9 h-9 bg-black text-white flex items-center justify-center font-bold">D</div><span className="font-semibold tracking-tight text-[14px] md:text-[15px]">DukaanWhats.pk</span></Link>
          <div className="flex items-center gap-1.5 md:gap-2">
            <button onClick={()=>setShowPlans(true)} style={{borderRadius:10}} className={`h-9 md:h-10 px-3 md:px-4 text-[12px] md:text-[13px] font-medium border ${isPremium?'bg-[#E8FF86] border-[#E8FF86] text-black': isAdvanced?'bg-black text-white':'bg-white'}`}>{currentPlanDef?.name || 'Basic'} {planExpired && '(Expired)'} ↗</button>
            <button onClick={copyLink} style={{borderRadius:10}} className="h-9 md:h-10 px-3 md:px-4 border bg-white text-[12px] md:text-[13px] font-medium">{copied ? 'Copied!' : 'Copy Link'}</button>
            <Link href={`/s/${slug}`} target="_blank" style={{borderRadius:10}} className="h-9 md:h-10 px-3 md:px-5 bg-black text-white text-[12px] md:text-[13px] font-medium flex items-center">View Store</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        <div style={{borderRadius:20}} className={`p-5 border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${isPremium?'bg-[#0A0A0A] text-white border-black': isAdvanced?'bg-[#111] text-white border-zinc-800':'bg-white'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center font-bold ${isPremium?'bg-[#E8FF86] text-black': isAdvanced?'bg-white text-black':'bg-zinc-900 text-white'}`}>{isPremium?'👑': isAdvanced?'⚡':'🆓'}</div>
            <div>
              <div className="font-semibold text-[15px] flex items-center gap-2">{currentPlanDef?.name} Plan {planExpired && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full">EXPIRED</span>}</div>
              <div className="text-[12px] opacity-60 mt-1">{products.length}/{effectivePlan?.max_products} products • {effectivePlan?.max_images_per_product} images • Expires: {profile?.plan_expires_at ? new Date(profile.plan_expires_at).toLocaleDateString() : 'Never'}</div>
              <div className="mt-2 h-1.5 w-[200px] bg-black/10 rounded-full overflow-hidden"><div className="h-full bg-[#E8FF86]" style={{width: `${Math.min(100, (products.length/(effectivePlan?.max_products||5))*100)}%`}} /></div>
            </div>
          </div>
          <div className="flex gap-2"><button onClick={()=>setShowPlans(true)} style={{borderRadius:10}} className={`h-10 px-5 text-[13px] font-medium ${isPremium?'bg-[#E8FF86] text-black':'bg-white text-black border'}`}>{isPremium?'Manage Plan':'Upgrade Plan'}</button></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div style={{borderRadius:20}} className="bg-white p-6 border"><div className="text-[11px] text-zinc-500 font-semibold uppercase tracking-widest">Products</div><div className="text-2xl font-bold mt-3">{products.length} / {effectivePlan?.max_products}</div></div>
          <div style={{borderRadius:20}} className="bg-white p-6 border"><div className="text-[11px] text-zinc-500 font-semibold uppercase tracking-widest">Orders</div><div className="text-2xl font-bold mt-3">{ordersCount}</div></div>
          <div style={{borderRadius:20}} className="bg-white p-6 border"><div className="text-[11px] text-zinc-500 font-semibold uppercase tracking-widest">Theme</div><div className="text-[14px] font-semibold mt-3">{getTheme(theme).name}</div></div>
          <div style={{borderRadius:20}} className="bg-[#E8FF86] p-6 border border-black/10"><div className="text-[11px] text-black/60 font-semibold uppercase tracking-widest">Store Link</div><div className="text-[13px] font-medium mt-3 truncate">/s/{slug}</div></div>
        </div>

        <div style={{borderRadius:20}} className="bg-white p-6 border">
          <h2 className="font-semibold text-[15px]">Store Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <input placeholder="Business name" value={businessName} onChange={e=>setBusinessName(e.target.value)} style={{borderRadius:12}} className="h-11 px-4 border text-[14px]" />
            <input placeholder="Store slug" value={slug} onChange={e=>setSlug(e.target.value)} style={{borderRadius:12}} className="h-11 px-4 border text-[14px]" />
            <input placeholder="WhatsApp number" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} style={{borderRadius:12}} className="h-11 px-4 border text-[14px]" />
          </div>
          <div className="mt-4"><label className="text-[12px] font-medium text-zinc-600">Delivery Charges (Rs.)</label><input type="number" value={deliveryCharges} onChange={e=>setDeliveryCharges(Number(e.target.value))} style={{borderRadius:12}} className="mt-2 w-full md:w-[200px] h-11 px-4 border text-[14px]" placeholder="0" /></div>
          <div className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3"><label className="text-[13px] font-semibold">Choose Theme</label><div className="flex flex-wrap gap-1.5">{(['all','food','clothing','tech','shoes'] as const).map(c => (<button key={c} onClick={()=>setFilter(c)} style={{borderRadius:999}} className={`h-7 px-3 text-[11px] font-medium capitalize border ${filter===c ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 border-zinc-200'}`}>{c}</button>))}<button onClick={()=>setFilter('advanced')} style={{borderRadius:999}} className={`h-7 px-3 text-[11px] font-medium capitalize border ${filter==='advanced' ? 'bg-black text-white' : isPremium?'bg-[#0A0A0A] text-white':'bg-zinc-100 text-zinc-400'}`}>advanced {isPremium?'':'🔒'}</button></div></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filtered.map(t => {
                const isActive = theme === t.id
                return (
                  <button key={t.id} onClick={()=>{ if (t.category==='advanced' && !effectivePlan?.can_use_advanced_themes) { alert('Premium required'); setShowPlans(true); return } setTheme(t.id)}} className={`relative rounded-[20px] border p-3 flex flex-col text-left ${isActive?'border-black ring-1 ring-black bg-zinc-50':'border-zinc-200 bg-white'}`}>
                    {isActive && <span className="absolute top-2 right-2 w-5 h-5 bg-[#E8FF86] rounded-full flex items-center justify-center text-[10px] font-bold">✓</span>}
                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{background: t.colors.bg, border:`1px solid ${t.colors.border}`}}>{t.badge}</div>
                    <div className="mt-2 font-medium text-[13px]">{t.name}</div><div className="text-[11px] text-zinc-500">{t.category}</div>
                  </button>
                )
              })}
            </div>
            <div id="advanced-glass" style={{borderRadius:20}} className={`mt-10 overflow-hidden border-2 ${isPremium?'border-black':'border-zinc-200 opacity-60'} relative`}>
              <div className="absolute inset-0 bg-[#0c0e13]" />
              <div className="relative p-6"><div className="flex items-center gap-3"><span className="bg-[#E8FF86] text-black text-[10px] font-bold px-3 py-1 rounded-full">ADVANCED</span><span className="text-white font-semibold text-[15px]">Glass Previews {isPremium?'':'— Premium Only'}</span></div>
                <div className="glass-container mt-1">{getAdvancedThemes().map((t,i)=>{ const r=[-18,0,18][i]||0; const isActive=theme===t.id; return (<div key={t.id} className={`glass ${isActive?'selected':''}`} data-text={t.name} style={{'--r': r} as any} onClick={()=>{ if(!isPremium){ alert('Premium required'); setShowPlans(true); return } setTheme(t.id)}}><div className="glass-preview-wrap"><div className="h-6 flex items-center px-2 text-[7px] font-bold" style={{background:t.colors.bg, color:t.colors.text}}>{t.name}</div></div></div>)})}</div>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-6 gap-2">{saved && <span className="h-11 px-4 flex items-center text-[12px] text-green-600">✓ Saved!</span>}<button onClick={saveStore} style={{borderRadius:10}} className="h-11 px-6 bg-black text-white text-[13px] font-medium">Save Store, Theme & Payments</button></div>
        </div>

        <div style={{borderRadius:20}} className="bg-white border overflow-hidden">
          <div className="p-6 border-b"><h2 className="font-semibold text-[14px]">Add Product — {effectivePlan?.max_images_per_product} photos max ({products.length}/{effectivePlan?.max_products})</h2></div>
          <div className="p-6 space-y-4">
            <label style={{borderRadius:14}} className="border-2 border-dashed p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 min-h-[100px]">{previews.length ? <div className="grid grid-cols-3 gap-2 w-full">{previews.map((src,i)=><img key={i} src={src} style={{borderRadius:10}} className="w-full h-[60px] object-cover border" />)}</div> : <><div className="w-10 h-10 border rounded-[10px] flex items-center justify-center">+</div><div className="mt-2 text-[12px]">Upload {effectivePlan?.max_images_per_product} max</div></>}<input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" /></label>
            <input placeholder="Product name" value={prodName} onChange={e=>setProdName(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border text-[14px]" />
            <input placeholder="Price Rs." type="number" value={prodPrice} onChange={e=>setProdPrice(e.target.value)} style={{borderRadius:12}} className="w-full h-11 px-4 border text-[14px]" />
            <div className="flex justify-end"><button onClick={addProduct} disabled={uploading} style={{borderRadius:10}} className="h-10 px-5 bg-black text-white text-[13px] font-medium disabled:opacity-50">{uploading ? 'Adding...' : 'Add Product'}</button></div>
          </div>
        </div>

        {products.length > 0 && (<div><h3 className="font-semibold text-[14px] mb-3">Your Products ({products.length})</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{products.map(p => (<div key={p.id} style={{borderRadius:20}} className="group bg-white border p-3 relative"><img src={p.image_url} style={{borderRadius:12}} className="w-full h-36 object-cover" /><div className="mt-3"><div className="font-medium text-[13px] truncate">{p.name}</div><div className="text-[13px] font-bold">Rs. {p.price}</div></div><button onClick={()=>deleteProduct(p.id)} style={{borderRadius:10}} className="absolute top-2 right-2 w-8 h-8 bg-white shadow border flex items-center justify-center text-xs opacity-0 group-hover:opacity-100">🗑</button></div>))}</div></div>)}
      </main>

      {showPlans && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
          <div className="bg-[#F8F7F5] rounded-[24px] max-w-5xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-[#F8F7F5] p-6 border-b flex justify-between items-center z-10"><h2 className="text-[20px] font-bold">Choose Plan — Final Pricing</h2><button onClick={()=>setShowPlans(false)} className="w-9 h-9 rounded-full bg-white border flex items-center justify-center">✕</button></div>
            
            <div className="p-6 grid md:grid-cols-3 gap-5">
              {plans.map(plan => {
                const isCurrent = profile?.current_plan===plan.id && !planExpired
                const p = getDisplayPrice(plan)
                const isYearlyView = billingCycle==='yearly'
                return (
                  <div key={plan.id} className={`plan-card rounded-[20px] border-2 bg-white p-6 flex flex-col ${isCurrent?'current':'border-zinc-200'} ${plan.id==='premium'?'bg-[#0A0A0A] text-white border-black': plan.id==='advanced'?'bg-zinc-900 text-white border-zinc-800':''}`}>
                    {isCurrent && <div className="text-[10px] bg-[#E8FF86] text-black px-3 py-1 rounded-full font-bold w-fit mb-3">CURRENT</div>}
                    <div className="flex items-center gap-3 mb-2"><div className={`w-10 h-10 rounded-[10px] flex items-center justify-center font-bold ${plan.id==='premium'?'bg-[#E8FF86] text-black': plan.id==='advanced'?'bg-white text-black':'bg-black text-white'}`}>{plan.id==='basic'?'🆓': plan.id==='advanced'?'⚡':'👑'}</div><div><div className="font-bold text-[16px]">{plan.name}</div><div className="text-[12px] opacity-60">{plan.id==='basic'?'Free forever':`${plan.max_products} products`}</div></div></div>
                    
                    {plan.id==='basic' ? (
                      <div className="mt-2"><span className="text-[28px] font-bold">Free</span></div>
                    ) : (
                      <div className="mt-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[28px] font-bold">Rs. {isYearlyView ? p.yearlyPerMonth : p.monthly}</span>
                          <span className="text-[13px] opacity-60">/month</span>
                        </div>
                        {isYearlyView ? (
                          <div className="mt-1">
                            <div className="text-[13px] opacity-70 line-through">Rs. {p.monthly}/mo</div>
                            <div className="text-[12px] bg-[#E8FF86] text-black px-2 py-0.5 rounded-full font-bold w-fit mt-1">Save Rs. {p.monthly - p.yearlyPerMonth}/mo • Pay Rs. {p.yearlyTotal} yearly</div>
                          </div>
                        ) : (
                          <div className="mt-1 text-[12px] opacity-60">Billed monthly • <span className="text-[#E8FF86] font-medium">Save with yearly</span></div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 space-y-2 flex-1">{plan.features.map((f,i)=><div key={i} className="flex gap-2 text-[13px]"><span className="text-green-500">✓</span><span>{f}</span></div>)}</div>
                    <div className="mt-6">
                      {isCurrent ? <button disabled className="w-full h-11 rounded-[12px] bg-zinc-100 text-zinc-500 font-medium text-[14px]">Current Plan</button> :
                      <button onClick={()=>{setSelectedPlan(plan); setBillingCycle('monthly')}} className={`w-full h-11 rounded-[12px] font-medium text-[14px] ${plan.id==='premium'?'bg-[#E8FF86] text-black': plan.id==='advanced'?'bg-white text-black':'bg-black text-white'}`}>{plan.price_monthly===0?'Downgrade to Basic':`Upgrade to ${plan.name}`}</button>}
                    </div>
                  </div>
                )
              })}
            </div>

            {selectedPlan && (selectedPlan.price_monthly||0)>0 && (
              <div className="p-6 border-t bg-white mx-6 mb-6 rounded-[16px]">
                <h3 className="font-bold text-[16px]">Buy {selectedPlan.name} — Choose Billing</h3>
                
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button onClick={()=>setBillingCycle('monthly')} className={`p-4 rounded-[12px] border-2 text-left ${billingCycle==='monthly'?'border-black bg-zinc-50':'border-zinc-200'}`}>
                    <div className="font-bold text-[14px]">Monthly</div>
                    <div className="text-[20px] font-bold mt-1">Rs. {selectedPlan.price_monthly}/mo</div>
                    <div className="text-[11px] opacity-60 mt-1">Billed every month</div>
                  </button>
                  <button onClick={()=>setBillingCycle('yearly')} className={`p-4 rounded-[12px] border-2 text-left relative ${billingCycle==='yearly'?'border-[#E8FF86] bg-[#FFFEF0]':'border-zinc-200'}`}>
                    <span className="absolute -top-2 -right-2 bg-[#E8FF86] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">SAVE {selectedPlan.id==='advanced'?'22%':'20%'}</span>
                    <div className="font-bold text-[14px]">Yearly</div>
                    <div className="text-[20px] font-bold mt-1">Rs. {selectedPlan.price_yearly_per_month}/mo</div>
                    <div className="text-[11px] opacity-60 mt-1">Pay Rs. {selectedPlan.price_yearly_total} for 12 months</div>
                  </button>
                </div>

                <div className="mt-4 p-4 bg-[#FFF9E6] border border-[#F5E6A0] rounded-[12px] text-[13px]">
                  <div className="font-bold">Pay to (Your JazzCash/Easypaisa):</div>
                  <div className="mt-2">JazzCash: 0300-1234567 | Easypaisa: 0300-1234567 | Bank: Meezan PK00...</div>
                  <div className="text-[12px] mt-2 font-bold">Total to pay now: Rs. {billingCycle==='yearly' ? selectedPlan.price_yearly_total : selectedPlan.price_monthly} ({billingCycle})</div>
                </div>

                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div><label className="text-[12px] font-medium">Payment Method</label><select value={payMethod} onChange={e=>setPayMethod(e.target.value)} className="mt-1 w-full h-11 px-4 border rounded-[12px] text-[14px]"><option value="jazzcash">JazzCash</option><option value="easypaisa">Easypaisa</option><option value="bank">Bank</option></select></div>
                  <div><label className="text-[12px] font-medium">Transaction ID *</label><input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder="Txn ID" className="mt-1 w-full h-11 px-4 border rounded-[12px] text-[14px]" /></div>
                </div>
                <div className="mt-4"><label className="text-[12px] font-medium">Proof Screenshot</label><input type="file" accept="image/*" onChange={e=>setProofFile(e.target.files?.[0]||null)} className="mt-1 w-full h-11 px-4 border rounded-[12px] text-[14px]" /></div>
                <div className="mt-6 flex gap-3"><button onClick={handleBuyPlan} disabled={purchasing} className="flex-1 h-12 bg-black text-white rounded-[12px] font-medium disabled:opacity-50">{purchasing?'Activating...':`Pay Rs. ${billingCycle==='yearly' ? selectedPlan.price_yearly_total : selectedPlan.price_monthly} & Activate ${selectedPlan.name} ${billingCycle}`}</button><button onClick={()=>setSelectedPlan(null)} className="h-12 px-6 border rounded-[12px]">Cancel</button></div>
              </div>
            )}
          </div>
        </div>
      )}

      <button onClick={logout} style={{borderRadius:999}} className="fixed bottom-6 right-6 z-50 h-11 px-6 bg-white border border-zinc-200 shadow-lg text-[13px] font-medium">Logout ↗</button>
    </div>
  )
}
