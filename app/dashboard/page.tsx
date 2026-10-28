'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { RealAnalytics } from '@/components/RealAnalytics'
import Link from 'next/link'
import { STORE_THEMES, getTheme, getAdvancedThemes, getPremiumThemes } from '@/lib/storeThemes'
import { DukaanWhatsLoader } from '@/components/DukaanWhatsLoader'
import { PremiumThemeEditor } from '@/components/PremiumThemeEditor'

const TILL_ID = '984837533'

type Profile = { id: string; business_name: string; whatsapp_number: string; store_slug: string; store_theme?: string; current_plan?: string }
type Product = { id: string; name: string; price: number; image_url: string; image_urls?: string[]; user_id: string }
type Billing = 'monthly' | 'yearly'
type PlanDef = { id: 'basic' | 'advanced' | 'premium'; name: string; monthly: number; yearlyMonthly: number; yearlyTotal: number; products: number; imagesPerProduct: number; advancedAllowed: number | 'all'; premiumAllowed: number | 'all'; stores: number; features: string[] }

/* -------------------- ICONS -------------------- */
const IconThemes = ({ c = '' }) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
const IconProducts = ({ c = '' }) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" /></svg>
const IconStore = ({ c = '' }) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1.5-5h15L21 9M3 9h18M3 9v11a1 1 0 0 0 1 1h4v-6h8v6h4a1 1 0 0 0 1-1V9" /></svg>
const IconAnalytics = ({ c = '' }) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18M7 14l4-4 4 4 6-6" /></svg>
const IconBilling = ({ c = '' }) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
const IconLock = ({ c = '' }) => <svg className={c} viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="10" width="14" height="10" rx="3" /><path d="M8 10V7.5C8 5.3 9.8 3.5 12 3.5C14.2 3.5 16 5.3 16 7.5V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" /></svg>
const IconCheck = ({ c = '' }) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
const IconUpload = ({ c = '' }) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
const IconPlus = ({ c = '' }) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
const IconExternal = ({ c = '' }) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" /></svg>

const LiveDot = () => (
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8FF86] opacity-75" />
    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E8FF86]" />
  </span>
)

/* -------------------- MINI STOREFRONT -------------------- */
function MiniStorefront({ theme }: { theme: any }) {
  const c = theme?.colors || {}
  const bg = c.bg || theme?.bg || '#F8F7F5'
  const accent = c.accent || theme?.accent || '#000'
  const card = c.card || theme?.card || '#ffffff'
  const border = c.border || theme?.border || '#e4e4e7'
  const text = c.text || theme?.text || '#0A0A0A'
  return (
    <div className="h-full w-full flex flex-col" style={{ background: bg, padding: 10 }}>
      <div className="flex items-center justify-between mb-2">
        <div className="h-1.5 w-10 rounded-full" style={{ background: accent }} />
        <div className="h-1 w-4 rounded-full opacity-30" style={{ background: text }} />
      </div>
      <div className="flex-1 grid grid-cols-3 gap-1.5 mb-1.5">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded flex flex-col overflow-hidden" style={{ background: card, border: '1px solid ' + border, padding: 3 }}>
            <div className="flex-1 rounded opacity-20" style={{ background: text }} />
            <div className="h-0.5 w-full rounded mt-1 opacity-30" style={{ background: text }} />
          </div>
        ))}
      </div>
      <div className="h-2.5 rounded-sm" style={{ background: accent }} />
    </div>
  )
}

/* -------------------- PRODUCT CARD -------------------- */
function PremiumProductCard({ p, onEdit, onDelete, imageLimit }: { p: any; onEdit: (p: any) => void; onDelete: (id: string) => void; imageLimit: number }) {
  const [idx, setIdx] = useState(0)
  const [hovering, setHovering] = useState(false)
  const images = (() => {
    if (p.image_urls && Array.isArray(p.image_urls) && p.image_urls.length > 0) return p.image_urls
    if (typeof p.image_urls === 'string') { try { const pa = JSON.parse(p.image_urls); if (Array.isArray(pa)) return pa } catch { } return [p.image_urls] }
    if (p.image_url) return [p.image_url]
    return []
  })()

  useEffect(() => {
    if (!hovering || images.length <= 1) return
    const interval = setInterval(() => setIdx(prev => (prev + 1) % images.length), 2000)
    return () => clearInterval(interval)
  }, [hovering, images.length])

  return (
    <div
      className="group bg-white border border-zinc-200/80 rounded-2xl overflow-hidden hover:border-black/60 hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-200"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="relative aspect-square bg-[#F8F7F5] overflow-hidden">
        {images.length > 1 && <img src={images[(idx - 1 + images.length) % images.length]} className="absolute inset-0 w-full h-full object-cover opacity-0" alt="" />}
        {images.length > 0 ? (
          <img src={images[idx]} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300 text-[10px]">No image</div>
        )}
        {images.length > 1 && (
          <>
            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur text-white text-[9px] font-bold px-2 py-1 rounded-full">
              {idx + 1}/{images.length}{hovering ? ' · AUTO' : ''}
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_: any, i: number) => (
                <div key={i} className={`h-1 rounded-full transition-all ${i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`} />
              ))}
            </div>
          </>
        )}
        {imageLimit !== 999999 && images.length >= imageLimit && (
          <div className="absolute top-2 right-2 bg-amber-100 border border-amber-200 text-amber-700 text-[9px] px-2 py-1 rounded-full font-bold">MAX {imageLimit}</div>
        )}
      </div>
      <div className="p-3.5">
        <div className="font-bold text-[13px] tracking-tight truncate">{p.name}</div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="font-black text-[14px] tracking-tight">Rs. {Number(p.price).toLocaleString()}</span>
          <span className="text-[10px] text-zinc-400">{images.length} img</span>
        </div>
        <div className="mt-3 flex gap-1.5">
          <button onClick={() => onEdit(p)} className="flex-1 h-8 bg-black text-white rounded-full text-[11px] font-bold border-none cursor-pointer hover:bg-zinc-800 transition-colors">Edit</button>
          <button onClick={() => onDelete(p.id)} className="w-8 h-8 rounded-full border border-zinc-200 text-zinc-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors bg-white cursor-pointer flex items-center justify-center">✕</button>
        </div>
      </div>
    </div>
  )
}

/* -------------------- PAGE HEADER -------------------- */
function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div className="min-w-0">
        {eyebrow && <div className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-400 mb-1.5">{eyebrow}</div>}
        <h1 className="text-[26px] md:text-[32px] font-black tracking-[-0.03em] leading-[1.05]">{title}</h1>
        {subtitle && <p className="text-[12.5px] md:text-[13.5px] text-zinc-500 mt-1.5 max-w-xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}

/* -------------------- MAIN DASHBOARD -------------------- */
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
  const [activeTab, setActiveTab] = useState<'store' | 'themes' | 'products' | 'analytics' | 'payments'>('themes')
  const [selectedPlan, setSelectedPlan] = useState<PlanDef | null>(null)
  const [billing, setBilling] = useState<Billing>('monthly')
  const [txnId, setTxnId] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const [copiedTill, setCopiedTill] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [myPayments, setMyPayments] = useState<any[]>([])
  const [showStatusModal, setShowStatusModal] = useState<null | { type: 'approved' | 'rejected', payment: any }>(null)
  const [justSubmitted, setJustSubmitted] = useState<any>(null)

  const plans: PlanDef[] = [
    { id: 'basic', name: 'Basic', monthly: 0, yearlyMonthly: 0, yearlyTotal: 0, products: 5, imagesPerProduct: 1, advancedAllowed: 3, premiumAllowed: 0, stores: 1, features: ['5 Products', '1 Image / product', '3 Advanced Themes', '0 Premium (Glass)', 'COD Only', 'Watermark'] },
    { id: 'advanced', name: 'Advanced', monthly: 899, yearlyMonthly: 699, yearlyTotal: 8388, products: 25, imagesPerProduct: 5, advancedAllowed: 8, premiumAllowed: 0, stores: 3, features: ['25 Products', '5 Images / product', 'All 8 Advanced Themes', '0 Premium Glass (locked)', 'Orders Dashboard'] },
    { id: 'premium', name: 'Premium', monthly: 2999, yearlyMonthly: 2499, yearlyTotal: 29988, products: 999999, imagesPerProduct: 999999, advancedAllowed: 'all', premiumAllowed: 'all', stores: 999999, features: ['Unlimited Products', 'Unlimited Images', 'Every Theme (8 Advanced + 3 Premium)', 'No Watermark', 'Live Analytics'] },
  ]

  const currentPlanId = (profile?.current_plan || 'basic') as 'basic' | 'advanced' | 'premium'
  const currentPlanDef = plans.find(p => p.id === currentPlanId) || plans[0]
  const isPremium = currentPlanId === 'premium'
  const isAdvanced = currentPlanId === 'advanced' || isPremium
  const productLimit = currentPlanDef.products
  const imageLimit = currentPlanDef.imagesPerProduct

  /* theme buckets — mirrors original logic exactly */
  const PREMIUM_NEW_IDS = ['spike-premium', 'shoe-app-premium', 'trenzo-luxury']
  const advancedGlassRaw = getAdvancedThemes()
  const premiumNewRaw = getPremiumThemes()
  const premiumThemes = [...advancedGlassRaw, ...premiumNewRaw]
  const premiumIds = premiumThemes.map(t => t.id)
  const allAdvancedRaw = STORE_THEMES.filter(t => (t.category as string) === 'advanced' && !advancedGlassRaw.map(x => x.id).includes(t.id))
  const advancedThemesList = allAdvancedRaw.length >= 5
    ? allAdvancedRaw.slice(0, 8)
    : [...allAdvancedRaw, ...STORE_THEMES.filter(t => (t.category as string) === 'clothing' || (t.category as string) === 'tech').slice(0, 8 - allAdvancedRaw.length)]
  const finalAdvancedList = advancedThemesList.length
    ? advancedThemesList.slice(0, 8)
    : STORE_THEMES.filter(t => !premiumIds.includes(t.id)).slice(0, 8)
  const basicAllowedAdvancedIds = finalAdvancedList.slice(0, 3).map(t => t.id)

  const isPremiumTheme = (t: any) => premiumIds.includes(t.id) || PREMIUM_NEW_IDS.includes(t.id) || (t.category as string) === 'premium' || (t as any).tier === 'premium'
  const isAdvancedTheme = (t: any) => !isPremiumTheme(t) && (finalAdvancedList.some((a: any) => a.id === t.id) || (t.category as string) === 'advanced')
  const isThemeLocked = (t: any) => {
    if (isPremium) return false
    if (isPremiumTheme(t)) return true
    if (isAdvancedTheme(t)) {
      if (isAdvanced) return false
      return !basicAllowedAdvancedIds.includes(t.id)
    }
    return false
  }

  const GLASS_TILTS = [-10, 8, -8, 9, -7, 10, -12, 11]

  /* ---------------- INIT ---------------- */
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
          const baseSlug = metaName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20)
          const newProfile = { id: user.id, business_name: metaName, whatsapp_number: '', store_slug: `${baseSlug}-${Math.floor(Math.random() * 900 + 100)}`, store_theme: 'clothing-noor', current_plan: 'basic' }
          const { data: created } = await supabase.from('profiles').upsert(newProfile, { onConflict: 'id' }).select().single()
          prof = created || newProfile as any
        }
        if (prof) {
          setProfile(prof)
          setBusinessName(prof.business_name || '')
          setWhatsapp(prof.whatsapp_number || '')
          setSlug(prof.store_slug || '')
          setTheme(prof.store_theme || 'clothing-noor')
          setPremiumCustom((prof as any).premium_custom || {})
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
              const lastStatus = localStorage.getItem('dw_last_seen_status_' + latest.id)
              if (lastStatus !== latest.status && (latest.status === 'approved' || latest.status === 'rejected')) {
                setShowStatusModal({ type: latest.status, payment: latest })
                localStorage.setItem('dw_last_seen_status_' + latest.id, latest.status)
              }
            }
            if (latest) localStorage.setItem('dw_last_seen_status_' + latest.id, latest.status)
          }
        }
      } catch (e: any) { setErrorMsg(e.message) }
      setTimeout(() => setLoading(false), 700)
    }
    init()
  }, [])

  /* ---------------- HANDLERS ---------------- */
    const handleThemeClick = async (t: any) => {
    if (isThemeLocked(t)) {
      if (isPremiumTheme(t)) {
        alert(`🔒 Premium Glass Locked
Basic: 0/3 Premium
Advanced: 0/3 Premium
Need Premium — Till ${TILL_ID} Rs. 2999/mo

This glass animation theme is Premium only.`)
        setActiveTab('payments'); return
      }
      alert(`🔒 Advanced Theme Locked
Basic allows 3/8 Advanced
This theme needs Advanced — Till ${TILL_ID} Rs. 899/mo

Upgrade to unlock all 8 Advanced themes.`)
      setActiveTab('payments'); return
    }
    // THEME-SPECIFIC EDITOR AUTO-SWITCH - FIXED BY AAKIF PATCH
    setTheme(t.id)
    setProfile((prev: any) => prev ? ({ ...prev, store_theme: t.id }) : prev)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && profile) {
        await supabase.from('profiles').update({ store_theme: t.id }).eq('id', user.id)
      }
    } catch {}
    if (['spike-premium','shoe-app-premium','trenzo-luxury','sleek-beige','sleek-dark','sleek-editorial'].includes(t.id)) {
      setTimeout(()=> {
        document.getElementById('premium-editor-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    }
  }

  const saveStore = async () => {
    if (!profile) return
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({
        business_name: businessName.trim(),
        whatsapp_number: whatsapp.trim(),
        store_slug: slug.trim(),
        store_theme: theme,
        premium_custom: premiumCustom,
      }).eq('id', profile.id)
      if (error) throw error
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e: any) { setErrorMsg(e.message) }
    setSaving(false)
  }
  const copyLink = async () => { const url = `${window.location.origin}/s/${slug}`; await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const copyTill = async () => { await navigator.clipboard.writeText(TILL_ID); setCopiedTill(true); setTimeout(() => setCopiedTill(false), 2000) }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    if (!selected.length) return
    const totalFiles = editingId ? selected.length : selected.length
    if (totalFiles > imageLimit && imageLimit !== 999999) {
      setErrorMsg(`❌ ${currentPlanId.toUpperCase()} allows ${imageLimit} images per product. You selected ${totalFiles}. Upgrade: Till ${TILL_ID}`)
      setTimeout(() => setErrorMsg(null), 4000)
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
    const ext = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(fileName, file)
    if (error) throw error
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
    return data.publicUrl
  }

  const startEdit = (p: any) => {
    setEditingId(p.id)
    setProdName(p.name)
    setProdPrice(String(p.price))
    setProdDesc(p.description || '')
    setProdCategory(p.category || 'General')
    setProdStock(String(p.stock || 100))
    setProdSizes(Array.isArray(p.sizes) ? p.sizes.join(', ') : p.sizes || '')
    setProdColors(Array.isArray(p.colors) ? p.colors.join(', ') : p.colors || '')
    setProdOrigPrice(p.original_price ? String(p.original_price) : '')
    setPreviews(p.image_urls && p.image_urls.length ? p.image_urls : [p.image_url])
    setFiles([])
    setActiveTab('products')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setProdName(''); setProdPrice(''); setProdDesc(''); setProdCategory('General')
    setProdStock('100'); setProdSizes(''); setProdColors(''); setProdOrigPrice('')
    setFiles([]); setPreviews([])
  }

  const addProduct = async () => {
    if (editingId === null && products.length >= productLimit) {
      setErrorMsg(`🔒 ${currentPlanId.toUpperCase()} allows ${productLimit === 999999 ? 'Unlimited' : productLimit} products. Upgrade via PRO → Till ${TILL_ID}`)
      setTimeout(() => setErrorMsg(null), 4000)
      setActiveTab('payments'); return
    }
    if (!prodName.trim() || !prodPrice) { setErrorMsg('Name and price required'); setTimeout(() => setErrorMsg(null), 3000); return }
    if (files.length === 0 && !editingId) { setErrorMsg('Photo required - select at least 1 image'); setTimeout(() => setErrorMsg(null), 3000); return }
    if (files.length > imageLimit && imageLimit !== 999999) { setErrorMsg(`❌ ${currentPlanId.toUpperCase()} allows ${imageLimit} images. You selected ${files.length}`); setTimeout(() => setErrorMsg(null), 4000); return }
    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')
      let urls: string[] = []
      for (const f of files) {
        const url = await uploadOne(f, user.id)
        urls.push(url)
      }
      if (editingId && urls.length === 0) {
        const existing = products.find(p => p.id === editingId)
        if (existing) {
          urls = existing.image_urls && existing.image_urls.length ? existing.image_urls : [existing.image_url].filter(Boolean) as string[]
        }
      }
      if (urls.length === 0) throw new Error('No images to save')

      if (editingId) {
        const sizesArr = prodSizes.split(',').map(s => s.trim()).filter(Boolean)
        const colorsArr = prodColors.split(',').map(s => s.trim()).filter(Boolean)
        const payload: any = {
          name: prodName.trim(), price: Number(prodPrice), image_url: urls[0], image_urls: urls,
          description: prodDesc.trim(), category: prodCategory, stock: Number(prodStock) || 100,
          sizes: sizesArr, colors: colorsArr, original_price: prodOrigPrice ? Number(prodOrigPrice) : 0,
        }
        const { data, error } = await supabase.from('products').update(payload).eq('id', editingId).select().single()
        if (error) throw error
        if (data) setProducts(products.map(pr => pr.id === editingId ? data : pr))
        setEditingId(null)
      } else {
        const sizesArr = prodSizes.split(',').map(s => s.trim()).filter(Boolean)
        const colorsArr = prodColors.split(',').map(s => s.trim()).filter(Boolean)
        const { data, error } = await supabase.from('products').insert({
          user_id: user.id, name: prodName.trim(), price: Number(prodPrice),
          image_url: urls[0], image_urls: urls, description: prodDesc.trim(), category: prodCategory,
          stock: Number(prodStock) || 100, sizes: sizesArr, colors: colorsArr,
          original_price: prodOrigPrice ? Number(prodOrigPrice) : 0,
        }).select().single()
        if (error) throw error
        if (data) setProducts([data, ...products])
      }
      setProdName(''); setProdPrice(''); setProdDesc(''); setProdCategory('General')
      setProdStock('100'); setProdSizes(''); setProdColors(''); setProdOrigPrice('')
      setFiles([]); setPreviews([])
    } catch (e: any) { setErrorMsg(e.message); setTimeout(() => setErrorMsg(null), 5000) }
    setUploading(false)
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete?')) return
    await supabase.from('products').delete().eq('id', id)
    setProducts(products.filter(p => p.id !== id))
  }

  const handleBuyPlan = async () => {
    if (!selectedPlan) return
    if (selectedPlan.monthly === 0) { setSelectedPlan(null); return }
    if (!txnId.trim()) { setErrorMsg('Enter Transaction ID'); setTimeout(() => setErrorMsg(null), 3000); return }
    setPurchasing(true)
    const amount = billing === 'monthly' ? selectedPlan.monthly : selectedPlan.yearlyTotal
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')
      const { error } = await supabase.from('plan_payments').insert({
        user_id: user.id, plan_id: selectedPlan.id, amount, till_id: TILL_ID, txn_id: txnId.trim(), status: 'pending',
      })
      if (error) throw error
      const { data: pays } = await supabase.from('plan_payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (pays) { setMyPayments(pays); if (pays[0]) setJustSubmitted(pays[0]) }
      setSelectedPlan(null); setTxnId('')
    } catch (e: any) { setErrorMsg(e.message); setTimeout(() => setErrorMsg(null), 4000) }
    setPurchasing(false)
  }

  const getDisplayPrice = (p: PlanDef) => billing === 'monthly' ? p.monthly : p.yearlyMonthly

  if (loading) return <DukaanWhatsLoader message="Loading your store..." />

  /* ---------------- DERIVED THEME VIEWS ---------------- */
  const standardThemes = STORE_THEMES.filter(t => !premiumIds.includes(t.id) && !finalAdvancedList.some(a => a.id === t.id))
  const currentTheme: any =
    [...finalAdvancedList, ...standardThemes, ...premiumThemes].find(t => t.id === theme) ||
    finalAdvancedList[0] ||
    standardThemes[0] ||
    { name: 'Theme', colors: { bg: '#F8F7F5', accent: '#000' } }
  const currentTier = finalAdvancedList.some(t => t.id === theme) ? 'Advanced'
    : standardThemes.some(t => t.id === theme) ? 'Standard' : 'Premium'

  const CurrentPlanButton = () => (
    <div className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 h-8 md:h-9 rounded-full border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] cursor-default select-none">
      <span className={`w-1.5 h-1.5 rounded-full ${isPremium ? 'bg-[#E8FF86] shadow-[0_0_8px_#E8FF86]' : isAdvanced ? 'bg-black' : 'bg-zinc-400'}`}></span>
      <span className="text-[10px] md:text-[11px] font-black tracking-[0.12em]">{currentPlanDef.name.toUpperCase()}</span>
      <span className="text-[10px] text-zinc-400 font-mono hidden md:inline">• {productLimit === 999999 ? '∞' : productLimit}p • {imageLimit === 999999 ? '∞' : imageLimit}i</span>
      {isPremium && <span className="ml-0.5 bg-black text-[#E8FF86] text-[8px] px-1.5 h-4 rounded-full font-bold hidden md:flex items-center tracking-widest">LIVE</span>}
    </div>
  )

  const sidebarNav = [
    { id: 'themes', label: 'Themes', Icon: IconThemes },
    { id: 'products', label: 'Products', Icon: IconProducts, badge: `${products.length}/${productLimit === 999999 ? '∞' : productLimit}` },
    { id: 'store', label: 'Store', Icon: IconStore },
    { id: 'analytics', label: 'Analytics', Icon: IconAnalytics, pro: !isPremium },
    { id: 'payments', label: 'Plans & Billing', Icon: IconBilling },
  ] as const

  /* ---------------- THEMES PAGE ---------------- */
  const themesPage = (
    <div className="animate-[fadeIn_0.35s_ease]">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .glass-container { position: relative; display: flex; justify-content: flex-start; align-items: center; min-height: 400px; padding: 40px 24px 40px 40px; gap: 0; overflow-x: auto; overflow-y: visible; scroll-snap-type: x proximity; -webkit-overflow-scrolling: touch; }
        .glass-container::-webkit-scrollbar { height: 5px; }
        .glass-container::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.10); border-radius: 999px; }
        .glass-container .glass { position: relative; width: 260px; height: 340px; flex-shrink: 0; background: rgba(255,255,255,0.9); border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 20px 50px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,1) inset; display: flex; justify-content: flex-start; align-items: center; flex-direction: column; transition: all 0.55s cubic-bezier(0.23,1,0.32,1); border-radius: 20px; margin: 0 -36px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); transform: rotate(calc(var(--r) * 1deg)) translateY(0); cursor: pointer; overflow: hidden; }
        .glass-container .glass:hover { transform: rotate(0deg) translateY(-12px) scale(1.05); margin: 0 20px; box-shadow: 0 32px 80px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06); z-index: 10; background: #fff; }
        .glass-container .glass::before { content: attr(data-text); position: absolute; bottom: 0; width: 100%; height: 46px; background: #fff; border-top: 1px solid rgba(0,0,0,0.06); display: flex; justify-content: center; align-items: center; color: #0A0A0A; font-size: 12px; font-weight: 700; letter-spacing: -0.01em; }
        .glass-container .glass.selected { background: #0A0A0A; border: 2px solid #0A0A0A; transform: rotate(0deg) translateY(-16px) scale(1.07); margin: 0 24px; z-index: 20; box-shadow: 0 32px 80px rgba(0,0,0,0.22), 0 0 0 4px #E8FF86; }
        .glass-container .glass.selected::before { background: #0A0A0A; color: #fff; border-top: 1px solid rgba(255,255,255,0.1); }
        .glass-lock-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; z-index: 10; border-radius: 20px; }
        @media (max-width: 768px) {
          .glass-container .glass { width: 190px; height: 260px; margin: 0 -22px; }
          .glass-container { min-height: 320px; padding: 20px 0 30px; }
        }
      `}</style>

      <PageHeader
        eyebrow="Theme Studio"
        title="Pick your storefront theme"
        subtitle={currentPlanId === 'basic' ? '3 of 8 Advanced unlocked · Premium locked'
          : currentPlanId === 'advanced' ? 'All 8 Advanced unlocked · Premium locked'
            : 'All themes unlocked'}
        actions={
          <>
            {saved && <span className="h-10 px-3.5 flex items-center text-[12px] text-emerald-700 font-semibold bg-emerald-50 rounded-full border border-emerald-200">✓ Saved — {getTheme(theme).name}</span>}
            <button onClick={saveStore} disabled={saving} className="h-10 px-5 bg-black text-white text-[12.5px] font-bold rounded-full border-none cursor-pointer hover:bg-zinc-800 transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Save & Publish'}
            </button>
          </>
        }
      />

      {/* Active theme hero */}
      <div className="relative rounded-3xl overflow-hidden mb-6" style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #18181B 50%, #0A0A0A 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '22px 22px' }} />
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase text-[#E8FF86]">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#E8FF86]" />
              Currently Active
            </div>
            <h2 className="text-white text-[24px] md:text-[30px] font-black tracking-[-0.02em] mt-2 leading-tight">{currentTheme.name}</h2>
            <p className="text-white/50 text-[12.5px] mt-1">{currentTier} tier · <span className="font-mono text-white/40">/s/{slug || 'your-slug'}</span></p>
            <div className="flex gap-2 mt-4 flex-wrap">
              <Link href={slug ? `/s/${slug}` : '#'} target="_blank" className="h-9 px-4 bg-white text-black rounded-full text-[11.5px] font-bold no-underline flex items-center gap-1.5">
                View Live <IconExternal c="w-3 h-3" />
              </Link>
              <button onClick={saveStore} disabled={saving} className="h-9 px-4 bg-white/10 text-white border border-white/15 rounded-full text-[11.5px] font-semibold cursor-pointer hover:bg-white/15 transition-colors">Republish</button>
            </div>
          </div>
          <div className="w-44 h-32 md:w-56 md:h-40 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
            <MiniStorefront theme={currentTheme} />
          </div>
        </div>
      </div>

      {/* Advanced */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 md:p-6 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-black tracking-[0.15em] bg-black text-white px-2.5 h-6 rounded-full flex items-center">ADVANCED</span>
            <span className="text-[12px] text-zinc-500 font-medium">{currentPlanId === 'basic' ? `${basicAllowedAdvancedIds.length}/8 unlocked` : '8/8 unlocked'}</span>
          </div>
          {currentPlanId === 'basic' && (
            <button onClick={() => setActiveTab('payments')} className="text-[11px] font-bold text-zinc-900 hover:underline bg-transparent border-none cursor-pointer">Unlock all →</button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {finalAdvancedList.map(t => {
            const isActive = theme === t.id
            const locked = isThemeLocked(t)
            return (
              <button
                key={t.id}
                onClick={() => handleThemeClick(t)}
                className={`group relative bg-white border rounded-2xl overflow-hidden text-left w-full cursor-pointer transition-all hover:-translate-y-1 ${isActive ? 'border-black ring-2 ring-black ring-offset-2 ring-offset-[#FAFAF9]' : 'border-zinc-200/80 hover:border-black/50 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1)]'}`}
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <MiniStorefront theme={t} />
                  {isActive && <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shadow-md"><IconCheck c="w-3.5 h-3.5" /></div>}
                  {locked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 backdrop-blur-md bg-white/75">
                      <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center"><IconLock c="w-4 h-4 text-white" /></div>
                      <div className="text-[9.5px] font-black tracking-widest text-zinc-900">LOCKED</div>
                      <div className="text-[9px] text-zinc-500 font-medium">Rs. 899/mo</div>
                    </div>
                  )}
                </div>
                <div className="p-3.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-[12.5px] tracking-tight truncate">{t.name}</div>
                    <div className="text-[9px] text-zinc-400 uppercase tracking-[0.15em] font-semibold mt-0.5">ADVANCED</div>
                  </div>
                  {isActive && !locked && <span className="shrink-0 text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded bg-[#E8FF86] text-black">ACTIVE</span>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Standard */}
      {standardThemes.length > 0 && (
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 md:p-6 mb-4">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-[10px] font-black tracking-[0.15em] bg-zinc-100 border border-zinc-200 px-2.5 h-6 rounded-full flex items-center">STANDARD</span>
            <span className="text-[12px] text-zinc-500 font-medium">Included with every plan</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {standardThemes.slice(0, 6).map(t => {
              const isActive = theme === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => handleThemeClick(t)}
                  className={`group relative bg-white border rounded-2xl overflow-hidden text-left w-full cursor-pointer transition-all hover:-translate-y-1 ${isActive ? 'border-black ring-2 ring-black ring-offset-2 ring-offset-[#FAFAF9]' : 'border-zinc-200/80 hover:border-black/50 hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.1)]'}`}
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <MiniStorefront theme={t} />
                    {isActive && <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shadow-md"><IconCheck c="w-3.5 h-3.5" /></div>}
                  </div>
                  <div className="p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-[11.5px] tracking-tight truncate">{t.name}</div>
                      <div className="text-[8.5px] text-zinc-400 uppercase tracking-[0.15em] font-semibold mt-0.5">{t.category}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Premium glass */}
      <div className="rounded-2xl border-2 border-black overflow-hidden bg-white">
        <div className="p-5 md:p-6 bg-black text-white flex flex-wrap items-center justify-between gap-3 border-b border-black/20">
          <div className="flex items-center gap-3">
            <span className="text-black text-[10px] font-black px-2.5 h-6 rounded-full tracking-[0.15em] flex items-center bg-[#E8FF86]">PREMIUM</span>
            <span className="font-bold text-[14px] tracking-tight">Glass Collection</span>
            <span className="text-[11px] text-white/40 hidden md:inline">· animated showcase themes</span>
          </div>
          <span className="bg-white/10 border border-white/15 text-white text-[11px] px-3 h-7 rounded-full font-medium flex items-center">
            {isPremium ? '✓ All unlocked' : `Locked · Rs. 2999/mo`}
          </span>
        </div>
        <div className="bg-[#FAFAF9] relative">
          <div className="absolute top-3 right-5 hidden md:flex items-center gap-2 text-[10px] font-mono text-black/30 z-10"><span>← Scroll →</span></div>
          <div className="glass-container">
            {premiumThemes.map((t, i) => {
              const isActive = theme === t.id
              const locked = isThemeLocked(t)
              const r = isActive ? 0 : GLASS_TILTS[i % GLASS_TILTS.length]
              const styleObj: any = { '--r': r, scrollSnapAlign: 'start' }
              return (
                <div key={t.id} className={`glass ${isActive ? 'selected' : ''}`} data-text={t.name} style={styleObj} onClick={() => handleThemeClick(t)}>
                  <div className="w-[88%] h-[230px] rounded-2xl overflow-hidden border border-black/[0.06] mt-4">
                    <MiniStorefront theme={t} />
                  </div>
                  {isActive && <div className="absolute top-3 right-3 w-7 h-7 bg-black text-white rounded-full flex items-center justify-center shadow-lg"><IconCheck c="w-3.5 h-3.5" /></div>}
                  {locked && (
                    <div className="glass-lock-overlay">
                      <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center shadow-xl"><IconLock c="w-6 h-6 text-white" /></div>
                      <div className="text-[11px] font-black tracking-widest text-zinc-900 mt-1">PREMIUM</div>
                      <div className="text-[9px] text-zinc-500 text-center leading-tight">Rs. 2999/mo</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Premium theme editor — THEME-SPECIFIC REAL PREVIEW — AUTO-SWITCH */}
      <div id="premium-editor-anchor" />
      {profile && (
        <div className="mt-6">
          <PremiumThemeEditor
            profile={{ ...profile, premium_custom: premiumCustom }}
            onSave={(d: any) => { setPremiumCustom(d); setProfile({ ...profile, premium_custom: d } as any) }}
          />
        </div>
      )}
    </div>
  )

  /* ---------------- PRODUCTS PAGE ---------------- */
  const productsPage = (
    <div className="animate-[fadeIn_0.35s_ease]">
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        subtitle={`${products.length} of ${productLimit === 999999 ? '∞' : productLimit} used · ${imageLimit === 999999 ? 'Unlimited' : imageLimit} image${imageLimit !== 1 ? 's' : ''} per product`}
        actions={
          <span className={`text-[10px] font-black tracking-widest px-3 h-8 rounded-full flex items-center ${products.length >= productLimit ? 'bg-red-500 text-white' : 'bg-black text-white'}`}>
            {products.length >= productLimit ? 'LIMIT REACHED' : `${productLimit === 999999 ? '∞' : (productLimit - products.length)} LEFT`}
          </span>
        }
      />

      <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 md:p-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-bold tracking-tight">{editingId ? 'Editing Product' : 'Add New Product'}</h3>
          {editingId && <button onClick={cancelEdit} className="text-[11px] font-bold text-zinc-500 hover:text-black bg-transparent border-none cursor-pointer">Cancel edit</button>}
        </div>

        <label className="block border-2 border-dashed border-zinc-200 rounded-2xl p-6 text-center cursor-pointer hover:border-black hover:bg-zinc-50/50 transition-all">
          <input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
          {previews.length ? (
            <div className="grid grid-cols-4 md:grid-cols-5 gap-2.5">
              {previews.map((src, i) => (
                <div key={i} className="relative group/img">
                  <img src={src} alt="" className="w-full aspect-square object-cover rounded-xl border border-zinc-200" />
                  <button type="button" onClick={(e) => { e.preventDefault(); removeFileAt(i) }} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black text-white text-[10px] rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity border-none cursor-pointer">✕</button>
                </div>
              ))}
              <div className="aspect-square rounded-xl border-2 border-dashed border-zinc-200 bg-white flex flex-col items-center justify-center hover:border-black hover:bg-zinc-50 transition-colors">
                <IconPlus c="w-4 h-4 text-zinc-400" />
                <span className="text-[9px] font-bold mt-1 tracking-widest text-zinc-400">ADD</span>
              </div>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-black mx-auto flex items-center justify-center mb-3 shadow-lg"><IconUpload c="w-5 h-5 text-white" /></div>
              <div className="font-bold text-[13.5px] tracking-tight">Drop images or click to upload</div>
              <div className="text-[11px] text-zinc-500 mt-1.5">PNG, JPG, WEBP · up to 5MB each</div>
              <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap">
                <span className="text-[9.5px] font-bold px-2 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600">Basic · 1</span>
                <span className="text-[9.5px] font-bold px-2 py-1 rounded-full bg-zinc-900 text-white">Advanced · 5</span>
                <span className="text-[9.5px] font-bold px-2 py-1 rounded-full text-black bg-[#E8FF86]">Premium · ∞</span>
              </div>
            </>
          )}
        </label>

        <div className="grid md:grid-cols-2 gap-3 mt-4">
          <input placeholder="Product name *" value={prodName} onChange={e => setProdName(e.target.value)} className="h-11 px-4 border border-zinc-200 rounded-xl text-[13px] bg-white focus:outline-none focus:border-black transition-colors" />
          <input placeholder="Price Rs. 3500 *" type="number" value={prodPrice} onChange={e => setProdPrice(e.target.value)} className="h-11 px-4 border border-zinc-200 rounded-xl text-[13px] bg-white focus:outline-none focus:border-black transition-colors" />
          <input placeholder="Compare price (optional)" type="number" value={prodOrigPrice} onChange={e => setProdOrigPrice(e.target.value)} className="h-11 px-4 border border-zinc-200 rounded-xl text-[13px] bg-white focus:outline-none focus:border-black transition-colors" />
          <select value={prodCategory} onChange={e => setProdCategory(e.target.value)} className="h-11 px-4 border border-zinc-200 rounded-xl text-[13px] bg-white focus:outline-none focus:border-black transition-colors">
            <option>General</option><option>Clothing</option><option>Shoes</option><option>Bags</option><option>Beauty</option><option>Electronics</option><option>Food</option><option>Other</option>
          </select>
          <input placeholder="Stock qty" type="number" value={prodStock} onChange={e => setProdStock(e.target.value)} className="h-11 px-4 border border-zinc-200 rounded-xl text-[13px] bg-white focus:outline-none focus:border-black transition-colors" />
          <input placeholder="Sizes (S, M, L, XL) — comma separated" value={prodSizes} onChange={e => setProdSizes(e.target.value)} className="h-11 px-4 border border-zinc-200 rounded-xl text-[13px] bg-white focus:outline-none focus:border-black transition-colors" />
          <input placeholder="Colors (Black, White, Red) — comma separated" value={prodColors} onChange={e => setProdColors(e.target.value)} className="md:col-span-2 h-11 px-4 border border-zinc-200 rounded-xl text-[13px] bg-white focus:outline-none focus:border-black transition-colors" />
          <textarea placeholder="Product description, materials, care instructions..." value={prodDesc} onChange={e => setProdDesc(e.target.value)} className="md:col-span-2 min-h-[88px] p-4 border border-zinc-200 rounded-xl text-[13px] bg-white focus:outline-none focus:border-black transition-colors resize-none" />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          {editingId && <button onClick={cancelEdit} className="h-10 px-5 border border-zinc-200 bg-white rounded-full text-[12.5px] font-semibold hover:bg-zinc-50 transition-colors cursor-pointer">Cancel</button>}
          <button
            onClick={addProduct}
            disabled={uploading || (!editingId && products.length >= productLimit)}
            className="h-10 px-6 bg-black text-white text-[12.5px] font-bold rounded-full border-none cursor-pointer hover:bg-zinc-800 transition-colors disabled:opacity-40"
          >
            {uploading ? 'Uploading...' : !editingId && products.length >= productLimit ? `Limit ${productLimit === 999999 ? '∞' : productLimit} — Upgrade` : `${editingId ? 'Update' : 'Add'} Product →`}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {products.length === 0 ? (
          <div className="col-span-2 md:col-span-4 bg-white border border-dashed border-zinc-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center mb-3"><IconUpload c="w-5 h-5 text-white" /></div>
            <div className="font-bold text-[14px]">No products yet</div>
            <div className="text-[11.5px] text-zinc-500 mt-1">Add your first product — {productLimit === 999999 ? 'Unlimited' : productLimit} allowed on {currentPlanDef.name}</div>
          </div>
        ) : products.map(p => (
          <PremiumProductCard key={p.id} p={p} imageLimit={imageLimit} onEdit={startEdit} onDelete={deleteProduct} />
        ))}
      </div>
    </div>
  )

  /* ---------------- STORE PAGE ---------------- */
  const storePage = (
    <div className="animate-[fadeIn_0.35s_ease]">
      <PageHeader
        eyebrow="Settings"
        title="Store identity"
        subtitle="How customers see and reach your business"
        actions={<button onClick={saveStore} disabled={saving} className="h-10 px-5 bg-black text-white text-[12.5px] font-bold rounded-full border-none cursor-pointer hover:bg-zinc-800 transition-colors disabled:opacity-50">{saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}</button>}
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 md:p-7 space-y-5">
          <div>
            <label className="text-[10px] font-black tracking-[0.15em] uppercase text-zinc-400">Business Name</label>
            <input value={businessName} onChange={e => setBusinessName(e.target.value)} className="mt-2 w-full h-11 px-4 border border-zinc-200 rounded-xl bg-white text-[13px] focus:outline-none focus:border-black transition-colors" />
          </div>
          <div>
            <label className="text-[10px] font-black tracking-[0.15em] uppercase text-zinc-400">WhatsApp Number</label>
            <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="923001234567" className="mt-2 w-full h-11 px-4 border border-zinc-200 rounded-xl bg-white text-[13px] focus:outline-none focus:border-black transition-colors font-mono" />
            <div className="text-[10.5px] text-zinc-400 mt-1.5">Include country code, no spaces (e.g. 923001234567)</div>
          </div>
          <div>
            <label className="text-[10px] font-black tracking-[0.15em] uppercase text-zinc-400">Store URL</label>
            <div className="mt-2 flex items-center border border-zinc-200 rounded-xl overflow-hidden bg-white focus-within:border-black transition-colors">
              <span className="pl-4 pr-1 text-[12.5px] text-zinc-400 font-mono shrink-0">/s/</span>
              <input value={slug} onChange={e => setSlug(e.target.value)} className="flex-1 h-11 pr-4 bg-transparent text-[13px] font-mono focus:outline-none border-none" />
            </div>
          </div>
          <div className="flex gap-2 pt-2 flex-wrap">
            <button onClick={copyLink} className="h-10 px-5 border border-zinc-200 bg-white rounded-full text-[12.5px] font-semibold hover:bg-zinc-50 transition-colors cursor-pointer">{copied ? '✓ Copied' : 'Copy Link'}</button>
            <Link href={slug ? `/s/${slug}` : '#'} target="_blank" className="h-10 px-5 bg-white border border-zinc-200 rounded-full text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-zinc-50 transition-colors no-underline text-inherit">Preview <IconExternal c="w-3 h-3" /></Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5">
            <div className="text-[10px] font-black tracking-[0.15em] uppercase text-zinc-400 mb-2">Current Plan</div>
            <div className="flex items-baseline gap-2">
              <span className="text-[22px] font-black tracking-tight">{currentPlanDef.name}</span>
              {currentPlanId === 'advanced' && <span className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded text-black bg-[#E8FF86]">POPULAR</span>}
            </div>
            <div className="text-[11.5px] text-zinc-500 mt-1.5 leading-relaxed">{currentPlanDef.features.slice(0, 3).join(' · ')}</div>
            {!isPremium && <button onClick={() => setActiveTab('payments')} className="mt-4 w-full h-9 bg-black text-white text-[12px] font-bold rounded-full border-none cursor-pointer">Upgrade Plan →</button>}
          </div>
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5">
            <div className="text-[10px] font-black tracking-[0.15em] uppercase text-zinc-400 mb-3">Store Preview</div>
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-zinc-200">
              <MiniStorefront theme={currentTheme} />
            </div>
            <div className="text-[10.5px] text-zinc-400 mt-2 truncate font-mono">dukaanwhats.pk/s/{slug || 'your-slug'}</div>
          </div>
        </div>
      </div>
    </div>
  )

  /* ---------------- ANALYTICS PAGE ---------------- */
  const analyticsPage = (
    <div className="animate-[fadeIn_0.35s_ease]">
      <PageHeader eyebrow="Insights" title="Analytics" subtitle="Real-time store performance" />
      {!profile ? (
        <div className="p-8 text-center text-zinc-500 text-[13px]">Loading analytics...</div>
      ) : currentPlanId === 'premium' ? (
        <RealAnalytics userId={profile.id} currentPlanId={currentPlanId} />
      ) : (
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-8 md:p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center mx-auto shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
            <IconAnalytics c="w-7 h-7 text-[#E8FF86]" />
          </div>
          <h3 className="font-black text-[22px] tracking-tight mt-4">Analytics is Premium</h3>
          <p className="text-[13px] text-zinc-500 mt-2 max-w-[380px] mx-auto leading-relaxed">
            You're on <b className="text-black">{currentPlanDef.name}</b>. Upgrade to Premium to unlock real-time visitors, orders, conversion rate and revenue insights.
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center mt-5">
            {['Live Visitors', 'Conversion Rate', 'Revenue', 'Orders', 'Traffic Sources', 'Retention'].map(f => (
              <span key={f} className="text-[10px] font-semibold bg-zinc-100 border border-zinc-200 px-2.5 h-6 rounded-full flex items-center text-zinc-600">{f}</span>
            ))}
          </div>
          <button onClick={() => setActiveTab('payments')} className="mt-6 h-11 px-7 bg-black text-white rounded-full text-[13px] font-bold border-none cursor-pointer inline-flex items-center gap-2 hover:bg-zinc-800 transition-colors">
            Upgrade to Premium <span className="text-[#E8FF86]">→</span>
          </button>
        </div>
      )}
    </div>
  )

  /* ---------------- PAYMENTS PAGE ---------------- */
  const paymentsPage = (
    <div className="animate-[fadeIn_0.35s_ease]">
      <PageHeader eyebrow="Subscription" title="Plans & Billing" subtitle={`You are on ${currentPlanDef.name}`} />

      {myPayments.length > 0 && (
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[13px] font-bold tracking-tight">Payment History</h3>
            {myPayments.filter((p: any) => p.status === 'pending').length > 0 && (
              <span className="text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-700 px-2.5 h-6 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                {myPayments.filter((p: any) => p.status === 'pending').length} pending
              </span>
            )}
          </div>
          <div className="space-y-2">
            {myPayments.slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between gap-3 bg-[#FAFAF9] border border-zinc-100 rounded-xl p-3.5">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span
                    className="shrink-0 h-6 px-2.5 rounded-full text-[9px] font-black tracking-widest flex items-center border"
                    style={{
                      background: p.status === 'pending' ? '#fef3c7' : p.status === 'approved' ? '#000' : '#fef2f2',
                      color: p.status === 'pending' ? '#a16207' : p.status === 'approved' ? '#fff' : '#dc2626',
                      borderColor: p.status === 'pending' ? '#fde68a' : p.status === 'approved' ? '#000' : '#fecaca',
                    }}
                  >
                    {p.status === 'pending' ? '⏳ PENDING' : p.status === 'approved' ? '✓ APPROVED' : '✕ REJECTED'}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12.5px] font-black tracking-tight">{p.plan_id.toUpperCase()}</span>
                      <span className="text-[12px] font-bold text-zinc-600">Rs. {p.amount}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] bg-white border border-zinc-200 px-1.5 py-0.5 rounded">{p.txn_id}</span>
                      <span className="text-[10px] text-zinc-400 hidden md:inline">{new Date(p.created_at).toLocaleDateString()} · Till {p.till_id}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-bold shrink-0 text-right" style={{ color: p.status === 'approved' ? '#16a34a' : p.status === 'rejected' ? '#dc2626' : '#71717a' }}>
                  {p.status === 'pending' ? 'Verifying' : p.status === 'approved' ? 'Active' : 'Rejected'}
                </div>
              </div>
            ))}
          </div>
          {justSubmitted && justSubmitted.status === 'pending' && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
              <span className="w-6 h-6 bg-amber-100 border border-amber-200 rounded-full flex items-center justify-center text-[12px] shrink-0">⏳</span>
              <div>
                <div className="text-[12px] font-bold text-amber-800">Payment submitted — Pending verification</div>
                <div className="text-[11px] text-amber-700/80 mt-0.5 leading-[1.5]">
                  Verifying Txn ID <span className="font-mono bg-white px-1 py-0.5 rounded border">{justSubmitted.txn_id}</span>. WhatsApp notification within 1 hour.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="text-[15px] font-black tracking-tight">Pay to JazzCash Till <span className="font-mono text-zinc-400">{TILL_ID}</span></h3>
            <p className="text-[11.5px] text-zinc-500 mt-1">Send payment, then submit the Transaction ID</p>
          </div>
          <div className="flex bg-black rounded-full p-1 gap-1">
            <button onClick={() => setBilling('monthly')} className={`h-8 px-4 rounded-full text-[11.5px] font-bold border-none cursor-pointer transition-all ${billing === 'monthly' ? 'bg-white text-black' : 'bg-transparent text-white/60'}`}>Monthly</button>
            <button onClick={() => setBilling('yearly')} className={`h-8 px-4 rounded-full text-[11.5px] font-bold border-none cursor-pointer transition-all flex items-center gap-1.5 ${billing === 'yearly' ? 'bg-white text-black' : 'bg-transparent text-white/60'}`}>
              Yearly <span className="text-[9px] px-1.5 py-0.5 rounded-full text-black font-black bg-[#E8FF86]">-22%</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-4">
          <div className="bg-black rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.03] rounded-full -mr-20 -mt-20" />
            <div className="relative">
              <div className="flex justify-between items-center mb-3">
                <div className="text-[9px] tracking-[0.2em] uppercase text-white/50 font-bold">JazzCash Till</div>
                <button onClick={copyTill} className="h-6 px-2.5 bg-white/10 border border-white/10 rounded-full text-[10px] font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer">{copiedTill ? '✓' : 'Copy'}</button>
              </div>
              <div className="bg-white/[0.06] border border-white/[0.08] rounded-xl p-4">
                <div className="text-[9px] uppercase text-white/40 tracking-widest">Till ID</div>
                <div className="text-[26px] font-black font-mono tracking-[0.08em] text-white mt-0.5">{TILL_ID}</div>
              </div>
              <div className="mt-3 bg-white rounded-xl p-3">
                <img src={`https://barcodeapi.org/api/code128/${TILL_ID}`} alt="Barcode" className="w-full h-[40px] object-contain" />
                <div className="text-center text-[10px] font-mono text-black font-black tracking-[0.3em] mt-1">{TILL_ID}</div>
              </div>
              <div className="mt-3 bg-white rounded-xl p-2.5 flex justify-center">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=JAZZCASH_TILL_${TILL_ID}`} alt="QR" className="w-[100px] h-[100px]" />
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {plans.map(p => {
              const displayPrice = getDisplayPrice(p)
              const isCurrent = currentPlanId === p.id
              const isSelected = selectedPlan?.id === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlan(p)}
                  className={`w-full text-left rounded-xl border p-4 transition-all cursor-pointer bg-white ${isSelected ? 'border-black shadow-[0_2px_12px_rgba(0,0,0,0.06)]' : isCurrent ? 'border-black/30 bg-[#FAFAF9]' : 'border-zinc-200 hover:border-zinc-400'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-[14px] tracking-tight">{p.name}</span>
                        {isCurrent && <span className="bg-black text-white text-[8px] px-2 h-4 rounded-full font-bold flex items-center tracking-widest">CURRENT</span>}
                        {p.id === 'advanced' && <span className="text-black text-[8px] px-2 h-4 rounded-full font-bold flex items-center tracking-widest bg-[#E8FF86]">POPULAR</span>}
                      </div>
                      <div className="text-[11px] mt-1.5 text-zinc-600 leading-[1.4]">{p.features.join(' · ')}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-[16px] tracking-tight">Rs. {displayPrice}</div>
                      <div className="text-[10px] text-zinc-400">{billing === 'yearly' && p.yearlyTotal > 0 ? `Rs. ${p.yearlyTotal.toLocaleString()}/yr` : '/month'}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {selectedPlan && selectedPlan.monthly > 0 && (
          <div className="mt-4 rounded-xl border-2 border-black bg-[#FFFEF5] p-4 md:p-5">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-bold">₨</div>
              <div className="text-[13px] font-bold tracking-tight">Pay Rs. {(billing === 'monthly' ? selectedPlan.monthly : selectedPlan.yearlyTotal).toLocaleString()} → Till {TILL_ID}</div>
              <span className="ml-auto text-[10px] font-bold bg-black text-white px-2 h-5 rounded-full flex items-center">{billing.toUpperCase()}</span>
            </div>
            <input
              value={txnId}
              onChange={e => setTxnId(e.target.value)}
              placeholder="Enter Transaction ID from JazzCash SMS"
              className="mt-3 w-full h-11 px-4 rounded-xl border-2 border-zinc-200 bg-white text-[12px] font-mono focus:outline-none focus:border-black transition-colors"
            />
            <button
              onClick={handleBuyPlan}
              disabled={purchasing}
              className="mt-3 w-full h-11 bg-black text-white rounded-full font-bold text-[12.5px] flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors border-none cursor-pointer disabled:opacity-60"
            >
              {purchasing ? 'Submitting...' : `I Paid — Activate ${selectedPlan.name}`}
              <span className="w-5 h-5 bg-white text-black rounded-full flex items-center justify-center text-[10px]">↗</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )

  /* ---------------- LAYOUT ---------------- */
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-zinc-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0A0A0A] text-white fixed left-0 top-0 bottom-0 z-40">
        <div className="px-5 pt-6 pb-5 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2.5 no-underline text-inherit">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-[15px] text-black bg-[#E8FF86]">D</div>
            <div>
              <div className="font-bold text-[14px] tracking-tight leading-none">DukaanWhats</div>
              <div className="text-[10px] text-white/40 tracking-widest uppercase mt-1">Dashboard</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {sidebarNav.map(item => {
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`relative w-full flex items-center gap-3 px-3 h-10 rounded-lg text-[13px] font-medium transition-all border-none cursor-pointer ${active ? 'bg-white/[0.08] text-white' : 'text-white/55 hover:text-white hover:bg-white/[0.04]'}`}
              >
                {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[#E8FF86]" />}
                <item.Icon c={`w-[17px] h-[17px] ${active ? 'text-[#E8FF86]' : ''}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {'badge' in item && item.badge && <span className="text-[10px] font-mono text-white/35">{item.badge}</span>}
                {'pro' in item && item.pro && <span className="text-[8px] font-black text-black px-1.5 py-0.5 rounded tracking-widest bg-[#E8FF86]">PRO</span>}
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8FF86] shadow-[0_0_6px_#E8FF86]" />
              <span className="text-[9.5px] font-black tracking-widest text-white/70 uppercase">{currentPlanDef.name} Plan</span>
            </div>
            <div className="text-[10.5px] text-white/40 leading-snug mb-3">
              {productLimit === 999999 ? '∞' : productLimit} products · {imageLimit === 999999 ? '∞' : imageLimit} img
            </div>
            {!isPremium ? (
              <button onClick={() => setActiveTab('payments')} className="w-full h-8 rounded-lg text-[11px] font-bold text-black border-none cursor-pointer transition-colors hover:opacity-90 bg-[#E8FF86]">
                Upgrade plan →
              </button>
            ) : (
              <div className="w-full h-8 rounded-lg text-[10.5px] font-bold text-black flex items-center justify-center tracking-widest bg-[#E8FF86]">PREMIUM ✓</div>
            )}
          </div>
        </div>

        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[12px] text-black shrink-0 bg-[#E8FF86]">{(businessName || 'S')[0].toUpperCase()}</div>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-semibold truncate">{businessName || 'Your Store'}</div>
              <div className="text-[10px] text-white/35 font-mono truncate">/s/{slug || 'your-slug'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 bg-[#FAFAF9]/95 backdrop-blur-xl border-b border-zinc-200/70">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2 no-underline text-inherit">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-[13px] text-black bg-[#E8FF86]">D</div>
            <span className="font-bold text-[14px] tracking-tight">DukaanWhats</span>
          </Link>
          <button onClick={() => setActiveTab('payments')} className="h-7 px-2.5 rounded-full text-[10px] font-black tracking-widest bg-black text-white border-none cursor-pointer">
            {currentPlanDef.name.toUpperCase()}
          </button>
        </div>
        <div className="flex gap-1.5 px-3 pb-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'themes', label: 'Themes' },
            { id: 'products', label: 'Products' },
            { id: 'store', label: 'Store' },
            { id: 'analytics', label: 'Analytics' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`h-8 px-3.5 rounded-full text-[12px] font-semibold whitespace-nowrap border-none cursor-pointer transition-all ${activeTab === t.id ? 'bg-black text-white' : 'bg-white text-zinc-600 border border-zinc-200'}`}
            >
              {t.label}
            </button>
          ))}
          <button
            onClick={() => setActiveTab('payments')}
            className={`h-8 px-3.5 rounded-full text-[12px] font-bold whitespace-nowrap border-none cursor-pointer ${activeTab === 'payments' ? 'bg-black text-white' : 'text-black'}`}
            style={{ background: activeTab === 'payments' ? '#000' : '#E8FF86' }}
          >
            {isPremium ? 'Plans' : 'Upgrade'}
          </button>
        </div>
      </header>

      <div className="md:ml-64">
        <main className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
          {activeTab === 'themes' && themesPage}
          {activeTab === 'products' && productsPage}
          {activeTab === 'store' && storePage}
          {activeTab === 'analytics' && analyticsPage}
          {activeTab === 'payments' && paymentsPage}
        </main>
      </div>

      {/* Toast for errorMsg */}
      {errorMsg && (
        <div className="fixed bottom-5 right-5 z-[100] bg-[#0A0A0A] text-white pl-3.5 pr-4 py-2.5 rounded-full text-[12.5px] font-medium shadow-[0_12px_32px_rgba(0,0,0,0.25)] border border-white/10 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8FF86]" />
          {errorMsg}
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-[380px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            {showStatusModal.type === 'approved' ? (
              <div>
                <div className="bg-black text-white p-8 text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-[#E8FF86] shadow-[0_8px_24px_rgba(232,255,134,0.3)]"><span className="text-[28px]">✓</span></div>
                  <h2 className="font-black text-[22px] tracking-tight mt-4">Payment Approved!</h2>
                  <p className="text-[13px] text-white/60 mt-1">Your store is now {showStatusModal.payment.plan_id.toUpperCase()}</p>
                </div>
                <div className="p-6">
                  <div className="bg-[#FAFAF9] border border-zinc-100 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between"><span className="text-[11px] text-zinc-500">Plan</span><span className="text-[12.5px] font-black">{showStatusModal.payment.plan_id.toUpperCase()} • Rs. {showStatusModal.payment.amount}</span></div>
                    <div className="flex justify-between items-center"><span className="text-[11px] text-zinc-500">Txn ID</span><span className="font-mono text-[11px] bg-white border border-zinc-200 px-2 py-1 rounded-lg">{showStatusModal.payment.txn_id}</span></div>
                  </div>
                  <button onClick={() => setShowStatusModal(null)} className="mt-5 w-full h-11 bg-black text-white rounded-full font-bold text-[13px] hover:bg-zinc-800 transition-colors border-none cursor-pointer">Continue →</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-[#FFFBF0] p-8 text-center border-b border-zinc-100">
                  <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto"><span className="text-[24px]">✕</span></div>
                  <h2 className="font-black text-[20px] tracking-tight mt-4">Payment Rejected</h2>
                  <p className="text-[12px] text-zinc-500 mt-1">Check Txn ID and try again</p>
                </div>
                <div className="p-6">
                  <p className="text-[12px] text-zinc-600 leading-relaxed">Txn ID could not be verified in Till {TILL_ID}. Please ensure correct amount and ID.</p>
                  <button onClick={() => setShowStatusModal(null)} className="mt-5 w-full h-11 bg-black text-white rounded-full font-bold text-[13px] hover:bg-zinc-800 transition-colors border-none cursor-pointer">Try Again →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
