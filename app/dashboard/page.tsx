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

/* -------------------- ICONS — 1.5px refined stroke set -------------------- */
const IconThemes = ({ c = '' }: any) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
const IconProducts = ({ c = '' }: any) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" /></svg>
const IconStore = ({ c = '' }: any) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1.5-5h15L21 9M3 9h18M3 9v11a1 1 0 0 0 1 1h4v-6h8v6h4a1 1 0 0 0 1-1V9" /></svg>
const IconAnalytics = ({ c = '' }: any) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18M7 14l4-4 4 4 6-6" /></svg>
const IconBilling = ({ c = '' }: any) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20" /></svg>
const IconLock = ({ c = '' }: any) => <svg className={c} viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="10" width="14" height="10" rx="3" /><path d="M8 10V7.5C8 5.3 9.8 3.5 12 3.5C14.2 3.5 16 5.3 16 7.5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" /></svg>
const IconCheck = ({ c = '' }: any) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
const IconUpload = ({ c = '' }: any) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
const IconPlus = ({ c = '' }: any) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
const IconExternal = ({ c = '' }: any) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" /></svg>
const IconTrash = ({ c = '' }: any) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" /></svg>
const IconArrowRight = ({ c = '' }: any) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
const IconCopy = ({ c = '' }: any) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="12" height="12" rx="2.5" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
const IconClock = ({ c = '' }: any) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>
const IconX = ({ c = '' }: any) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>

const LiveDot = () => (
  <span className="relative flex h-1.5 w-1.5">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D9FF4B] opacity-70" />
    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#D9FF4B]" />
  </span>
)

/* -------------------- MINI STOREFRONT - preserved 100% -------------------- */
function MiniStorefront({ theme }: { theme: any }) {
  const id = theme?.id || ''
  const c = theme?.colors || {}
  const bg = c.bg || '#F8F7F5'
  const text = c.text || '#0A0A0A'
  const accent = c.accent || '#000'
  const card = c.card || '#ffffff'
  const border = c.border || '#e4e4e7'
  const img1 = 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=200&h=200&fit=crop'
  const img2 = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop'
  const img3 = 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=200&h=200&fit=crop'

  if (id === 'spike-premium') {
    return (
      <div className="h-full w-full flex flex-col bg-[#FCFBF9] text-[#0A0A0A] overflow-hidden">
        <div className="h-[14px] bg-black text-[5px] text-white flex items-center justify-center tracking-[0.2em] font-bold">EDITORIAL • MINIMAL BY AAKIF • LUXURY • FREE SHIPPING</div>
        <div className="px-2 py-1.5 flex items-center justify-between border-b border-black/[0.06] bg-white/80 backdrop-blur">
          <div className="text-[7px] font-black tracking-[0.15em]">SPIKE • Shoes Shalwar</div>
          <div className="flex gap-0.5"><div className="w-2 h-2 rounded-full bg-black" /><div className="w-2 h-2 rounded-full bg-zinc-200" /></div>
        </div>
        <div className="px-2 py-2 flex gap-1.5">
          <div className="flex-1">
            <div className="h-3 px-1 bg-black text-white text-[5px] rounded-full inline-flex items-center font-bold">MINIMAL • 2024</div>
            <div className="mt-1 text-[10px] font-black leading-[0.9] tracking-[-0.02em]">Cool and<br/>Aakif style</div>
            <div className="mt-1 text-[5px] text-black/50 leading-[1.2] w-[90%]">Clean lines, intentional whitespace, premium finish.</div>
            <div className="mt-1.5 flex gap-1">{['All','Nike','Adidas'].map(b=> <div key={b} className="h-3 px-1.5 bg-black text-white rounded-full text-[5px] font-bold flex items-center">{b}</div>)}</div>
          </div>
          <div className="w-[46%] aspect-[4/5] rounded-[10px] overflow-hidden border border-black/10 bg-white"><img src={img1} className="w-full h-full object-cover" alt="" /></div>
        </div>
        <div className="px-2 pb-2 grid grid-cols-3 gap-1 mt-auto">{[img1,img2,img3].map((im,i)=><div key={i} className="aspect-square rounded-[6px] overflow-hidden bg-white border"><img src={im} className="w-full h-full object-cover" alt="" /></div>)}</div>
      </div>
    )
  }
  if (id === 'shoe-app-premium') {
    return (
      <div className="h-full w-full flex flex-col bg-[#F2F0FF] p-1.5 gap-1 overflow-hidden">
        <div className="flex items-center justify-between"><div className="text-[6px] font-black tracking-[0.15em]">SHOE • APP</div><div className="h-2.5 px-1 bg-black text-white rounded-full text-[4px] flex items-center">Live</div></div>
        <div className="flex-1 bg-white rounded-[10px] border p-1 flex flex-col"><div className="flex-1 rounded-[6px] overflow-hidden bg-[#F5F5F5]"><img src={img2} className="w-full h-full object-cover" alt="" /></div><div className="h-4 mt-1 bg-black rounded-full" /></div>
      </div>
    )
  }
  if (id === 'trenzo-luxury') {
    return (
      <div className="h-full w-full bg-[#0A0A0A] text-white p-1.5 flex flex-col overflow-hidden">
        <div className="h-3 flex items-center justify-between"><div className="text-[5px] font-black tracking-[0.2em]">TRENZO</div><div className="w-2 h-2 bg-[#E8FF86] rounded-full" /></div>
        <div className="mt-1 flex-1 rounded-[10px] overflow-hidden bg-[#141414] border border-white/10"><img src={img3} className="w-full h-full object-cover" alt="" /></div>
        <div className="mt-auto grid grid-cols-3 gap-1">{['Craftsmanship','Heritage','Sustainability'].map(t=> <div key={t} className="h-6 bg-[#141414] border border-white/10 rounded-[6px] px-1 flex flex-col justify-center"><div className="text-[5px] font-bold">{t}</div><div className="text-[3.5px] text-white/40 truncate">Hand-stitched</div></div>)}</div>
      </div>
    )
  }
  if (id === 'sleek-beige') {
    return (
      <div className="h-full w-full bg-[#F5F1EB] text-[#0A0A0A] p-1.5 flex flex-col overflow-hidden">
        <div className="h-2.5 bg-black text-[#E8FF86] text-[4px] flex items-center justify-center font-bold tracking-[0.2em]">FREE SHIPPING • NEW DROP • COD • PREMIUM BEIGE</div>
        <div className="mt-1 flex justify-between items-center"><div className="text-[6px] font-black tracking-[0.2em]">BEIGE • Studio</div><div className="h-3 px-1 bg-black text-white rounded-full text-[5px] flex items-center">Cart (2)</div></div>
        <div className="mt-1 flex gap-1.5"><div className="flex-1"><div className="h-2.5 px-1 bg-white border rounded-full text-[4px] font-bold inline-flex items-center">EDITORIAL • BEIGE • 2024</div><div className="mt-1 text-[10px] font-black leading-[0.9]">Warm minimal<br/>luxury, everyday<br/>icon.</div><div className="mt-1 h-3 px-2 bg-black text-white rounded-full text-[5px] font-bold flex items-center w-fit">Shop Beige →</div></div><div className="w-[44%] aspect-[4/5] rounded-[14px] overflow-hidden border shadow-[0_8px_16px_rgba(0,0,0,0.08)] bg-white"><img src={img1} className="w-full h-full object-cover" alt="" /></div></div>
        <div className="mt-auto grid grid-cols-3 gap-1">{[img1,img2,img3].map((im,i)=><div key={i} className="aspect-square rounded-[5px] overflow-hidden bg-white border"><img src={im} className="w-full h-full object-cover" alt="" /></div>)}</div>
      </div>
    )
  }
  if (id === 'sleek-dark') {
    return (
      <div className="h-full w-full bg-[#0A0A0A] text-white p-1.5 flex flex-col overflow-hidden">
        <div className="h-2.5 bg-[#E8FF86] text-black text-[4px] flex items-center justify-center font-bold tracking-[0.2em]">DARK MODE • LUXURY • FREE SHIPPING • COD</div>
        <div className="mt-1 flex justify-between items-center"><div className="text-[6px] font-black tracking-[0.2em]">DARK • Studio</div><div className="h-3 px-1 bg-white text-black rounded-full text-[5px] flex items-center">Cart (2)</div></div>
        <div className="mt-1 flex gap-1.5"><div className="flex-1"><div className="h-2.5 px-1 bg-white/10 border border-white/20 rounded-full text-[4px] font-bold inline-flex items-center">NOIR • DARK • 2024</div><div className="mt-1 text-[10px] font-black leading-[0.9]">Noir luxury,<br/>midnight<br/>icon.</div><div className="mt-1 h-3 px-2 bg-white text-black rounded-full text-[5px] font-bold flex items-center w-fit">Shop Dark →</div></div><div className="w-[44%] aspect-[4/5] rounded-[14px] overflow-hidden border border-white/10 bg-[#141414]"><img src={img2} className="w-full h-full object-cover" alt="" /></div></div>
        <div className="mt-auto grid grid-cols-3 gap-1">{[img1,img2,img3].map((im,i)=><div key={i} className="aspect-square rounded-[5px] overflow-hidden bg-[#141414] border border-white/10"><img src={im} className="w-full h-full object-cover" alt="" /></div>)}</div>
      </div>
    )
  }
  if (id === 'sleek-editorial') {
    return (
      <div className="h-full w-full bg-[#FCFBF9] text-[#0A0A0A] p-1.5 flex flex-col overflow-hidden">
        <div className="h-2.5 bg-black text-white text-[4px] flex items-center justify-center font-bold tracking-[0.2em]">EDITORIAL • MINIMAL • LUXURY • FREE SHIPPING</div>
        <div className="mt-1 flex justify-between items-center"><div className="text-[6px] font-black tracking-[0.2em]">EDITORIAL • Studio <span className="ml-1 h-2 px-1 bg-black text-white rounded-full text-[3px]">PREMIUM • EDITORIAL</span></div><div className="w-2 h-2 bg-black rounded-full" /></div>
        <div className="mt-1 flex gap-1.5"><div className="flex-1"><div className="h-2.5 px-1 bg-white border rounded-full text-[4px] font-bold inline-flex items-center">MINIMAL • 2024</div><div className="mt-1 text-[11px] font-black leading-[0.85] tracking-[-0.02em]">Cool and<br/>Aakif style</div><div className="mt-1 text-[5px] text-black/50">Clean lines, intentional whitespace, premium finish.</div><div className="mt-1 h-3 px-2 bg-black text-white rounded-full text-[5px] font-bold flex items-center w-fit">Shop Editorial →</div></div><div className="w-[44%] aspect-[4/5] rounded-[14px] overflow-hidden border bg-white"><img src={img1} className="w-full h-full object-cover" alt="" /></div></div>
      </div>
    )
  }
  return (
    <div className="h-full w-full flex flex-col overflow-hidden" style={{ background: bg }}>
      <div className="h-2 w-full" style={{ background: accent }} />
      <div className="px-2 py-1.5 flex items-center justify-between" style={{ background: card, borderBottom: `1px solid ${border}` }}>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: accent }} /><div className="text-[6px] font-black tracking-[0.15em]" style={{ color: text }}>{theme?.name?.toUpperCase()}</div></div>
        <div className="w-3 h-1.5 rounded-full opacity-30" style={{ background: text }} />
      </div>
      <div className="flex-1 p-1.5 grid grid-cols-3 gap-1">{[img1,img2,img3].map((im,i)=> (<div key={i} className="rounded-[6px] overflow-hidden flex flex-col" style={{ background: card, border: `1px solid ${border}` }}><div className="flex-1 overflow-hidden"><img src={im} className="w-full h-full object-cover" alt="" /></div><div className="h-3 px-1 flex flex-col justify-center"><div className="h-0.5 w-full rounded" style={{ background: text, opacity: 0.3 }} /><div className="mt-0.5 h-0.5 w-2/3 rounded" style={{ background: accent }} /></div></div>))}</div>
      <div className="h-2.5 mx-1.5 mb-1.5 rounded-full" style={{ background: accent }} />
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
    const interval = setInterval(() => setIdx(prev => (prev + 1) % images.length), 1800)
    return () => clearInterval(interval)
  }, [hovering, images.length])

  return (
    <div
      className="group relative bg-white border border-[#E8E8E5] rounded-[14px] overflow-hidden transition-all duration-200 hover:border-[#0A0A0A]/25 hover:shadow-[0_10px_28px_-12px_rgba(0,0,0,0.14)]"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="relative aspect-[4/3] bg-[#F7F7F5] overflow-hidden">
        {images.length > 0 ? <img src={images[idx]} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /> : <div className="w-full h-full flex items-center justify-center text-zinc-300 text-[10px]">No image</div>}
        {images.length > 1 && (
          <>
            <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur text-white text-[9.5px] font-mono font-medium pl-2 pr-2.5 py-1 rounded-md flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#D9FF4B]" />{idx + 1}/{images.length}</div>
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 p-[3px] rounded-full bg-black/35 backdrop-blur-md">{images.map((_: any, i: number) => (<div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === idx ? 'w-3.5 bg-white' : 'w-1 bg-white/40'}`} />))}</div>
          </>
        )}
        {imageLimit !== 999999 && images.length >= imageLimit && <div className="absolute top-2.5 right-2.5 bg-[#E8FF86] text-black text-[8.5px] px-2 h-[18px] rounded-md font-bold tracking-[0.08em] flex items-center">MAX</div>}
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2.5">
          <div className="font-medium text-[13px] tracking-[-0.01em] leading-snug line-clamp-1">{p.name}</div>
          <div className="text-[9.5px] font-mono text-zinc-400 border border-[#ECECEA] bg-[#FAFAF9] px-1.5 py-[2px] rounded-md shrink-0">{images.length} IMG</div>
        </div>
        <div className="flex items-baseline justify-between mt-1.5">
          <span className="font-semibold text-[13.5px] tracking-[-0.01em]">Rs. {Number(p.price).toLocaleString()}</span>
          <span className="text-[11px] text-zinc-400 truncate">{p.category || 'General'}</span>
        </div>
        <div className="mt-3 flex gap-1.5">
          <button onClick={() => onEdit(p)} className="flex-1 h-[34px] border border-[#E4E4E1] bg-white text-[12px] font-medium rounded-[9px] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-colors">Edit</button>
          <button onClick={() => onDelete(p.id)} aria-label="Delete product" className="w-[34px] h-[34px] rounded-[9px] border border-[#ECECEA] bg-white text-zinc-400 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center"><IconTrash c="w-[15px] h-[15px]" /></button>
        </div>
      </div>
    </div>
  )
}

/* -------------------- PAGE HEADER -------------------- */
function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-5 gap-y-4 mb-7">
      <div className="min-w-0">
        {eyebrow && <div className="font-mono text-[10.5px] font-medium tracking-[0.14em] uppercase text-zinc-400 mb-2">{eyebrow}</div>}
        <h1 className="text-[22px] md:text-[26px] font-semibold tracking-[-0.02em] leading-[1.1] text-[#0A0A0A]">{title}</h1>
        {subtitle && <p className="text-[13px] text-zinc-500 mt-1.5 leading-[1.55] max-w-xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}

/* -------------------- SHARED PRIMITIVES -------------------- */
const btnPrimary = "h-9 px-4 bg-[#0A0A0A] text-white text-[12.5px] font-medium rounded-[10px] hover:bg-black transition-colors disabled:opacity-40 inline-flex items-center justify-center gap-2"
const btnSecondary = "h-9 px-4 border border-[#E4E4E1] bg-white text-[12.5px] font-medium text-zinc-700 rounded-[10px] hover:border-[#0A0A0A]/30 hover:text-[#0A0A0A] transition-colors inline-flex items-center justify-center gap-2"
const inputBase = "w-full h-[40px] px-3.5 border border-[#E4E4E1] rounded-[10px] text-[13.5px] bg-white focus:outline-none focus:border-[#0A0A0A] focus:ring-[3px] focus:ring-zinc-900/[0.06] transition-all placeholder:text-zinc-400"
const labelBase = "block text-[12px] font-medium text-zinc-500 mb-1.5"
const cardBase = "bg-white border border-[#E8E8E5] rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"

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
  /* UX-only state: replaces native alert()/confirm() with styled in-app dialogs.
     No business logic is changed — same messages, same follow-up actions. */
  const [lockedTheme, setLockedTheme] = useState<null | { title: string; body: string }>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

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

  const PREMIUM_NEW_IDS = ['spike-premium', 'shoe-app-premium', 'trenzo-luxury']
  const advancedGlassRaw = getAdvancedThemes()
  const premiumNewRaw = getPremiumThemes()
  const premiumThemes = [...advancedGlassRaw, ...premiumNewRaw]
  const premiumIds = premiumThemes.map(t => t.id)
  const allAdvancedRaw = STORE_THEMES.filter(t => (t.category as string) === 'advanced' && !advancedGlassRaw.map(x => x.id).includes(t.id))
  const advancedThemesList = allAdvancedRaw.length >= 5 ? allAdvancedRaw.slice(0, 8) : [...allAdvancedRaw, ...STORE_THEMES.filter(t => (t.category as string) === 'clothing' || (t.category as string) === 'tech').slice(0, 8 - allAdvancedRaw.length)]
  const finalAdvancedList = advancedThemesList.length ? advancedThemesList.slice(0, 8) : STORE_THEMES.filter(t => !premiumIds.includes(t.id)).slice(0, 8)
  const basicAllowedAdvancedIds = finalAdvancedList.slice(0, 3).map(t => t.id)

  const isPremiumTheme = (t: any) => premiumIds.includes(t.id) || PREMIUM_NEW_IDS.includes(t.id) || (t.category as string) === 'premium' || (t as any).tier === 'premium'
  const isAdvancedTheme = (t: any) => !isPremiumTheme(t) && (finalAdvancedList.some((a: any) => a.id === t.id) || (t.category as string) === 'advanced')
  const isThemeLocked = (t: any) => {
    if (isPremium) return false
    if (isPremiumTheme(t)) return true
    if (isAdvancedTheme(t)) { if (isAdvanced) return false; return !basicAllowedAdvancedIds.includes(t.id) }
    return false
  }

  const GLASS_TILTS = [-10, 8, -8, 9, -7, 10, -12, 11]

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
          setProfile(prof); setBusinessName(prof.business_name || ''); setWhatsapp(prof.whatsapp_number || ''); setSlug(prof.store_slug || ''); setTheme(prof.store_theme || 'clothing-noor'); setPremiumCustom((prof as any).premium_custom || {})
          const { data: prods } = await supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false }); if (prods) setProducts(prods)
          const { data: pays } = await supabase.from('plan_payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
          if (pays) {
            setMyPayments(pays); const lastSeenId = localStorage.getItem('dw_last_seen_payment'); const latest = pays[0]
            if (latest && latest.id !== lastSeenId) { if (latest.status === 'approved' || latest.status === 'rejected') { setShowStatusModal({ type: latest.status, payment: latest }); localStorage.setItem('dw_last_seen_payment', latest.id) } else if (latest.status === 'pending') { localStorage.setItem('dw_last_seen_payment_pending', latest.id) } }
            else if (latest && latest.status !== 'pending') { const lastStatus = localStorage.getItem('dw_last_seen_status_' + latest.id); if (lastStatus !== latest.status && (latest.status === 'approved' || latest.status === 'rejected')) { setShowStatusModal({ type: latest.status, payment: latest }); localStorage.setItem('dw_last_seen_status_' + latest.id, latest.status) } }
            if (latest) localStorage.setItem('dw_last_seen_status_' + latest.id, latest.status)
          }
        }
      } catch (e: any) { setErrorMsg(e.message) }
      setTimeout(() => setLoading(false), 700)
    }
    init()
  }, [])

  const handleThemeClick = async (t: any) => {
    if (isThemeLocked(t)) {
      if (isPremiumTheme(t)) {
        setLockedTheme({
          title: 'Premium theme locked',
          body: `Basic: 0/3 Premium · Advanced: 0/3 Premium. This glass animation theme is Premium only — Rs. 2999/mo via Till ${TILL_ID}.`,
        })
        return
      }
      setLockedTheme({
        title: 'Advanced theme locked',
        body: `Basic allows 3 of 8 Advanced themes. This theme needs Advanced — Rs. 899/mo via Till ${TILL_ID}. Upgrade to unlock all 8.`,
      })
      return
    }
    setTheme(t.id)
    setProfile((prev: any) => prev ? ({ ...prev, store_theme: t.id }) : prev)
    try { const { data: { user } } = await supabase.auth.getUser(); if (user && profile) { await supabase.from('profiles').update({ store_theme: t.id }).eq('id', user.id) } } catch {}
    if (['spike-premium','shoe-app-premium','trenzo-luxury','sleek-beige','sleek-dark','sleek-editorial'].includes(t.id)) { setTimeout(()=> { document.getElementById('premium-editor-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 150) }
  }

  const saveStore = async () => {
    if (!profile) return; setSaving(true)
    try { const { error } = await supabase.from('profiles').update({ business_name: businessName.trim(), whatsapp_number: whatsapp.trim(), store_slug: slug.trim(), store_theme: theme, premium_custom: premiumCustom, }).eq('id', profile.id); if (error) throw error; setSaved(true); setTimeout(() => setSaved(false), 2500) } catch (e: any) { setErrorMsg(e.message) }
    setSaving(false)
  }
  const copyLink = async () => { const url = `${window.location.origin}/s/${slug}`; await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const copyTill = async () => { await navigator.clipboard.writeText(TILL_ID); setCopiedTill(true); setTimeout(() => setCopiedTill(false), 2000) }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []); if (!selected.length) return
    const totalFiles = editingId ? selected.length : selected.length
    if (totalFiles > imageLimit && imageLimit !== 999999) { setErrorMsg(`${currentPlanId.toUpperCase()} allows ${imageLimit} images per product. You selected ${totalFiles}. Upgrade: Till ${TILL_ID}`); setTimeout(() => setErrorMsg(null), 4000); return }
    const newFiles = editingId ? [...files, ...selected].slice(0, imageLimit === 999999 ? 20 : imageLimit) : selected; setFiles(newFiles)
    const pr: string[] = []; const existingPreviews = editingId ? previews : []
    newFiles.forEach(file => { const r = new FileReader(); r.onload = ev => { pr.push(ev.target?.result as string); if (pr.length === newFiles.length) { setPreviews(editingId ? [...existingPreviews, ...pr].slice(0, newFiles.length) : pr) } }; r.readAsDataURL(file) })
    if (newFiles.length === 0) setPreviews([])
  }
  const removeFileAt = (idx: number) => { const nf = files.filter((_, i) => i !== idx); const np = previews.filter((_, i) => i !== idx); setFiles(nf); setPreviews(np) }
  const uploadOne = async (file: File, userId: string) => { const ext = file.name.split('.').pop(); const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`; const { error } = await supabase.storage.from('product-images').upload(fileName, file); if (error) throw error; const { data } = supabase.storage.from('product-images').getPublicUrl(fileName); return data.publicUrl }
  const startEdit = (p: any) => { setEditingId(p.id); setProdName(p.name); setProdPrice(String(p.price)); setProdDesc(p.description || ''); setProdCategory(p.category || 'General'); setProdStock(String(p.stock || 100)); setProdSizes(Array.isArray(p.sizes) ? p.sizes.join(', ') : p.sizes || ''); setProdColors(Array.isArray(p.colors) ? p.colors.join(', ') : p.colors || ''); setProdOrigPrice(p.original_price ? String(p.original_price) : ''); setPreviews(p.image_urls && p.image_urls.length ? p.image_urls : [p.image_url]); setFiles([]); setActiveTab('products'); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const cancelEdit = () => { setEditingId(null); setProdName(''); setProdPrice(''); setProdDesc(''); setProdCategory('General'); setProdStock('100'); setProdSizes(''); setProdColors(''); setProdOrigPrice(''); setFiles([]); setPreviews([]) }
  const addProduct = async () => {
    if (editingId === null && products.length >= productLimit) { setErrorMsg(`${currentPlanId.toUpperCase()} allows ${productLimit === 999999 ? 'Unlimited' : productLimit} products. Upgrade via PRO → Till ${TILL_ID}`); setTimeout(() => setErrorMsg(null), 4000); setActiveTab('payments'); return }
    if (!prodName.trim() || !prodPrice) { setErrorMsg('Name and price required'); setTimeout(() => setErrorMsg(null), 3000); return }
    if (files.length === 0 && !editingId) { setErrorMsg('Photo required - select at least 1 image'); setTimeout(() => setErrorMsg(null), 3000); return }
    if (files.length > imageLimit && imageLimit !== 999999) { setErrorMsg(`${currentPlanId.toUpperCase()} allows ${imageLimit} images. You selected ${files.length}`); setTimeout(() => setErrorMsg(null), 4000); return }
    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Not logged in')
      let urls: string[] = []; for (const f of files) { const url = await uploadOne(f, user.id); urls.push(url) }
      if (editingId && urls.length === 0) { const existing = products.find(p => p.id === editingId); if (existing) { urls = existing.image_urls && existing.image_urls.length ? existing.image_urls : [existing.image_url].filter(Boolean) as string[] } }
      if (urls.length === 0) throw new Error('No images to save')
      if (editingId) {
        const sizesArr = prodSizes.split(',').map(s => s.trim()).filter(Boolean); const colorsArr = prodColors.split(',').map(s => s.trim()).filter(Boolean)
        const payload: any = { name: prodName.trim(), price: Number(prodPrice), image_url: urls[0], image_urls: urls, description: prodDesc.trim(), category: prodCategory, stock: Number(prodStock) || 100, sizes: sizesArr, colors: colorsArr, original_price: prodOrigPrice ? Number(prodOrigPrice) : 0, }
        const { data, error } = await supabase.from('products').update(payload).eq('id', editingId).select().single(); if (error) throw error; if (data) setProducts(products.map(pr => pr.id === editingId ? data : pr)); setEditingId(null)
      } else {
        const sizesArr = prodSizes.split(',').map(s => s.trim()).filter(Boolean); const colorsArr = prodColors.split(',').map(s => s.trim()).filter(Boolean)
        const { data, error } = await supabase.from('products').insert({ user_id: user.id, name: prodName.trim(), price: Number(prodPrice), image_url: urls[0], image_urls: urls, description: prodDesc.trim(), category: prodCategory, stock: Number(prodStock) || 100, sizes: sizesArr, colors: colorsArr, original_price: prodOrigPrice ? Number(prodOrigPrice) : 0, }).select().single(); if (error) throw error; if (data) setProducts([data, ...products])
      }
      setProdName(''); setProdPrice(''); setProdDesc(''); setProdCategory('General'); setProdStock('100'); setProdSizes(''); setProdColors(''); setProdOrigPrice(''); setFiles([]); setPreviews([])
    } catch (e: any) { setErrorMsg(e.message); setTimeout(() => setErrorMsg(null), 5000) }
    setUploading(false)
  }
  const confirmDeleteProduct = async () => { const id = deleteTarget; setDeleteTarget(null); if (!id) return; await supabase.from('products').delete().eq('id', id); setProducts(products.filter(p => p.id !== id)) }
  const handleBuyPlan = async () => {
    if (!selectedPlan) return; if (selectedPlan.monthly === 0) { setSelectedPlan(null); return }
    if (!txnId.trim()) { setErrorMsg('Enter Transaction ID'); setTimeout(() => setErrorMsg(null), 3000); return }
    setPurchasing(true); const amount = billing === 'monthly' ? selectedPlan.monthly : selectedPlan.yearlyTotal
    try { const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error('Not logged in'); const { error } = await supabase.from('plan_payments').insert({ user_id: user.id, plan_id: selectedPlan.id, amount, till_id: TILL_ID, txn_id: txnId.trim(), status: 'pending', }); if (error) throw error; const { data: pays } = await supabase.from('plan_payments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }); if (pays) { setMyPayments(pays); if (pays[0]) setJustSubmitted(pays[0]) }; setSelectedPlan(null); setTxnId('') } catch (e: any) { setErrorMsg(e.message); setTimeout(() => setErrorMsg(null), 4000) }
    setPurchasing(false)
  }
  const getDisplayPrice = (p: PlanDef) => billing === 'monthly' ? p.monthly : p.yearlyMonthly
  if (loading) return <DukaanWhatsLoader message="Loading your store..." />

  const standardThemes = STORE_THEMES.filter(t => !premiumIds.includes(t.id) && !finalAdvancedList.some(a => a.id === t.id))
  const currentTheme: any = [...finalAdvancedList, ...standardThemes, ...premiumThemes].find(t => t.id === theme) || finalAdvancedList[0] || standardThemes[0] || { name: 'Theme', colors: { bg: '#F8F7F5', accent: '#000' } }
  const currentTier = finalAdvancedList.some(t => t.id === theme) ? 'Advanced' : standardThemes.some(t => t.id === theme) ? 'Standard' : 'Premium'

  const sidebarNav: { id: string; label: string; Icon: any; badge?: string; pro?: boolean }[] = [
    { id: 'themes', label: 'Themes', Icon: IconThemes },
    { id: 'products', label: 'Products', Icon: IconProducts, badge: `${products.length}/${productLimit === 999999 ? '∞' : productLimit}` },
    { id: 'store', label: 'Store', Icon: IconStore },
    { id: 'analytics', label: 'Analytics', Icon: IconAnalytics, pro: !isPremium },
    { id: 'payments', label: 'Plans & Billing', Icon: IconBilling },
  ]

  const statusMeta: any = {
    pending: { dot: '#d97706', bg: '#FFFBEB', border: '#FDE9C8', fg: '#92400E', label: 'PENDING' },
    approved: { dot: '#16a34a', bg: '#F0FDF4', border: '#CBEBD5', fg: '#166534', label: 'APPROVED' },
    rejected: { dot: '#dc2626', bg: '#FEF2F2', border: '#FBD5D5', fg: '#991B1B', label: 'REJECTED' },
  }

  /* ---------------- THEMES PAGE -------------------- */
  const themesPage = (
    <div className="animate-[fadeIn_0.3s_ease]">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .glass-container { position: relative; display: flex; justify-content: flex-start; align-items: center; min-height: 420px; padding: 44px 24px 44px 40px; gap: 0; overflow-x: auto; overflow-y: visible; scroll-snap-type: x proximity; -webkit-overflow-scrolling: touch; }
        .glass-container::-webkit-scrollbar { height: 4px; }
        .glass-container::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.10); border-radius: 999px; }
        .glass-container .glass { position: relative; width: 268px; height: 356px; flex-shrink: 0; background: #fff; border: 1px solid rgba(0,0,0,0.07); box-shadow: 0 16px 44px rgba(0,0,0,0.07); display: flex; justify-content: flex-start; align-items: center; flex-direction: column; transition: all 0.55s cubic-bezier(0.23,1,0.32,1); border-radius: 18px; margin: 0 -30px; transform: rotate(calc(var(--r) * 1deg)) translateY(0); cursor: pointer; overflow: hidden; }
        .glass-container .glass:hover { transform: rotate(0deg) translateY(-12px) scale(1.03); margin: 0 18px; box-shadow: 0 28px 64px rgba(0,0,0,0.14); z-index: 10; }
        .glass-container .glass::before { content: attr(data-text); position: absolute; bottom: 0; width: 100%; height: 44px; background: #fff; border-top: 1px solid rgba(0,0,0,0.06); display: flex; justify-content: center; align-items: center; color: #0A0A0A; font-size: 12px; font-weight: 600; letter-spacing: -0.01em; }
        .glass-container .glass.selected { background: #0A0A0A; border: 1.5px solid #0A0A0A; transform: rotate(0deg) translateY(-14px) scale(1.05); margin: 0 24px; z-index: 20; box-shadow: 0 28px 64px rgba(0,0,0,0.26), 0 0 0 3px #E8FF86; }
        .glass-container .glass.selected::before { background: #0A0A0A; color: #fff; border-top: 1px solid rgba(255,255,255,0.08); }
        .glass-lock-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.88); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; z-index: 10; border-radius: 18px; }
        @media (max-width: 768px) { .glass-container .glass { width: 200px; height: 280px; margin: 0 -20px; } .glass-container { min-height: 330px; padding: 24px 0 32px; } }
      `}</style>

      <PageHeader
        eyebrow="Theme Studio"
        title="Craft your storefront"
        subtitle={currentPlanId === 'basic' ? '3 of 8 Advanced themes unlocked · Premium locked' : currentPlanId === 'advanced' ? 'All 8 Advanced themes unlocked · Premium locked' : 'All 11 themes unlocked — you’re limitless'}
        actions={<>
          <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-[10px] bg-white border border-[#E4E4E1] text-[11.5px] font-mono text-zinc-500"><LiveDot /> <span>/s/{slug || 'your-slug'}</span></div>
          <button onClick={saveStore} disabled={saving} className={btnPrimary}>{saving ? 'Saving…' : saved ? <><IconCheck c="w-3.5 h-3.5 text-[#D9FF4B]" /> Published</> : 'Save & Publish'}</button>
        </>}
      />

      {/* Active theme hero */}
      <div className="relative rounded-[16px] overflow-hidden mb-5 bg-[#0B0B0C]">
        <div className="absolute top-0 right-0 w-[380px] h-[380px] bg-[#E8FF86]/[0.07] rounded-full blur-[90px] -mr-32 -mt-32" />
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-7">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] uppercase text-[#D9FF4B]"><span className="w-1.5 h-1.5 rounded-full bg-[#D9FF4B] animate-pulse" /> Currently live</div>
            <h2 className="text-white text-[22px] md:text-[26px] font-semibold tracking-[-0.02em] mt-3 leading-tight">{currentTheme.name}</h2>
            <div className="flex items-center gap-2 mt-2.5">
              <span className="text-[10.5px] font-mono bg-white/[0.08] border border-white/10 text-white/70 px-2.5 h-[22px] rounded-md flex items-center uppercase tracking-wide">{currentTier}</span>
              <span className="text-[11px] text-white/35 font-mono">/s/{slug || 'your-slug'}</span>
            </div>
            <div className="flex gap-2 mt-5 flex-wrap">
              <Link href={slug ? `/s/${slug}` : '#'} target="_blank" className="h-9 px-4 bg-white text-black rounded-[10px] text-[12.5px] font-medium no-underline inline-flex items-center gap-1.5 hover:bg-zinc-200 transition-colors">View live <IconExternal c="w-3.5 h-3.5" /></Link>
              <button onClick={saveStore} disabled={saving} className="h-9 px-4 bg-white/[0.08] text-white border border-white/15 rounded-[10px] text-[12.5px] font-medium hover:bg-white/[0.14] transition-colors disabled:opacity-50">Republish</button>
            </div>
          </div>
          <div className="w-full md:w-[240px] h-[170px] rounded-[14px] overflow-hidden shrink-0 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.45)] bg-white"><MiniStorefront theme={currentTheme} /></div>
        </div>
      </div>

      {/* Advanced */}
      <div className={`${cardBase} p-5 md:p-6 mb-5`}>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[10px] font-semibold tracking-[0.14em] bg-[#0B0B0C] text-white px-2.5 h-[22px] rounded-md flex items-center">ADVANCED</span>
            <span className="text-[12.5px] text-zinc-500">{currentPlanId === 'basic' ? `${basicAllowedAdvancedIds.length}/8 unlocked` : '8/8 unlocked'}</span>
          </div>
          {currentPlanId === 'basic' && <button onClick={() => setActiveTab('payments')} className="text-[12px] font-medium text-zinc-700 hover:text-black bg-white border border-[#E4E4E1] h-8 px-3 rounded-[9px] inline-flex items-center gap-1.5 transition-colors">Unlock all <IconArrowRight c="w-3 h-3" /></button>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-3.5">
          {finalAdvancedList.map(t => {
            const isActive = theme === t.id; const locked = isThemeLocked(t)
            return (
              <button key={t.id} onClick={() => handleThemeClick(t)} className={`group relative bg-white border rounded-[14px] overflow-hidden text-left w-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/30 ${isActive ? 'border-[#0A0A0A] shadow-[0_8px_20px_-8px_rgba(0,0,0,0.18)]' : 'border-[#E8E8E5] hover:border-[#0A0A0A]/25 hover:shadow-[0_8px_20px_-10px_rgba(0,0,0,0.10)]'}`}>
                <div className="aspect-[4/3] relative overflow-hidden bg-[#F7F7F5]">
                  <MiniStorefront theme={t} />
                  {isActive && <div className="absolute top-2 right-2 w-[22px] h-[22px] rounded-full bg-[#0A0A0A] text-white flex items-center justify-center shadow-md"><IconCheck c="w-3 h-3" /></div>}
                  {locked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85 backdrop-blur-md">
                      <div className="w-9 h-9 rounded-[10px] bg-[#0B0B0C] flex items-center justify-center"><IconLock c="w-4 h-4 text-[#D9FF4B]" /></div>
                      <div className="text-[9.5px] font-semibold tracking-[0.14em] text-zinc-800">LOCKED</div>
                      <div className="text-[10px] text-zinc-500 font-mono">Rs. 899/mo</div>
                    </div>
                  )}
                </div>
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-[12.5px] tracking-[-0.01em] truncate">{t.name}</div>
                    <div className="font-mono text-[8.5px] text-zinc-400 uppercase tracking-[0.14em] mt-0.5">Advanced</div>
                  </div>
                  {isActive && !locked && <span className="shrink-0 text-[8.5px] font-semibold tracking-[0.1em] px-2 h-[18px] rounded-md bg-[#E8FF86] text-black flex items-center">ACTIVE</span>}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {standardThemes.length > 0 && (
        <div className="bg-[#F7F7F5] border border-[#E8E8E5] rounded-[14px] p-5 md:p-6 mb-5">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="font-mono text-[10px] font-semibold tracking-[0.14em] bg-white border border-[#E4E4E1] px-2.5 h-[22px] rounded-md flex items-center text-zinc-600">STANDARD</span>
            <span className="text-[12.5px] text-zinc-500">Included with every plan</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {standardThemes.slice(0, 6).map(t => {
              const isActive = theme === t.id
              return (
                <button key={t.id} onClick={() => handleThemeClick(t)} className={`group relative bg-white border rounded-[12px] overflow-hidden text-left w-full cursor-pointer transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/30 ${isActive ? 'border-[#0A0A0A]' : 'border-[#E8E8E5] hover:border-[#0A0A0A]/25'}`}>
                  <div className="aspect-[4/3] relative overflow-hidden"><MiniStorefront theme={t} />{isActive && <div className="absolute top-2 right-2 w-[20px] h-[20px] rounded-full bg-[#0A0A0A] text-white flex items-center justify-center"><IconCheck c="w-3 h-3" /></div>}</div>
                  <div className="p-2.5"><div className="font-medium text-[11.5px] tracking-[-0.01em] truncate">{t.name}</div><div className="font-mono text-[8px] text-zinc-400 uppercase tracking-[0.14em] mt-0.5">{t.category}</div></div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="rounded-[14px] border border-[#0B0B0C] overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="px-5 md:px-6 py-4 bg-[#0B0B0C] text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-black text-[10px] font-semibold px-2.5 h-[22px] rounded-md tracking-[0.14em] flex items-center bg-[#E8FF86]">PREMIUM</span>
            <span className="font-semibold text-[13.5px] tracking-[-0.01em]">Glass Collection</span>
            <span className="text-[10.5px] text-white/40 hidden md:inline font-mono">animated showcase</span>
          </div>
          <span className="text-white/70 text-[11px] px-3 h-7 rounded-full font-medium flex items-center border border-white/10 bg-white/[0.06]">{isPremium ? <span className="inline-flex items-center gap-1.5"><IconCheck c="w-3 h-3 text-[#D9FF4B]" /> All unlocked</span> : `Locked · Rs. 2999/mo — Till ${TILL_ID}`}</span>
        </div>
        <div className="bg-[#F7F7F5] relative">
          <div className="absolute top-4 right-6 hidden md:flex items-center gap-2 text-[10px] font-mono text-zinc-400 z-10 border border-[#E4E4E1] bg-white px-2.5 h-6 rounded-full">← drag to explore →</div>
          <div className="glass-container">
            {premiumThemes.map((t, i) => {
              const isActive = theme === t.id; const locked = isThemeLocked(t); const r = isActive ? 0 : GLASS_TILTS[i % GLASS_TILTS.length]; const styleObj: any = { '--r': r, scrollSnapAlign: 'start' }
              return (
                <div key={t.id} className={`glass ${isActive ? 'selected' : ''}`} data-text={t.name} style={styleObj} onClick={() => handleThemeClick(t)}>
                  <div className="w-[88%] h-[238px] rounded-[14px] overflow-hidden border border-black/[0.06] mt-4 shadow-[0_8px_20px_rgba(0,0,0,0.06)]"><MiniStorefront theme={t} /></div>
                  {isActive && <div className="absolute top-3 right-3 w-6 h-6 bg-[#0A0A0A] text-white rounded-full flex items-center justify-center shadow-md"><IconCheck c="w-3 h-3" /></div>}
                  {locked && (
                    <div className="glass-lock-overlay">
                      <div className="w-11 h-11 rounded-[12px] bg-[#0B0B0C] flex items-center justify-center shadow-lg"><IconLock c="w-5 h-5 text-[#D9FF4B]" /></div>
                      <div className="text-[10.5px] font-semibold tracking-[0.12em] text-zinc-800 mt-1">PREMIUM GLASS</div>
                      <div className="text-[9.5px] text-zinc-500 font-mono">Rs. 2999/mo · Till {TILL_ID}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div id="premium-editor-anchor" className="scroll-mt-6" />
      {profile && (<div className="mt-7"><PremiumThemeEditor profile={{ ...profile, premium_custom: premiumCustom }} onSave={(d: any) => { setPremiumCustom(d); setProfile({ ...profile, premium_custom: d } as any) }} /></div>)}
    </div>
  )

  /* ---------------- PRODUCTS PAGE ---------------- */
  const productsPage = (
    <div className="animate-[fadeIn_0.3s_ease]">
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        subtitle={`${products.length} of ${productLimit === 999999 ? 'unlimited' : productLimit} used · ${imageLimit === 999999 ? 'unlimited' : imageLimit} image${imageLimit !== 1 ? 's' : ''} per product`}
        actions={<span className={`font-mono text-[10px] tracking-[0.08em] px-2.5 h-7 rounded-md flex items-center border ${products.length >= productLimit ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-[#E4E4E1] text-zinc-600'}`}>{products.length >= productLimit ? 'LIMIT REACHED' : `${productLimit === 999999 ? '∞' : (productLimit - products.length)} LEFT`}</span>}
      />

      <div className={`${cardBase} p-5 md:p-6 mb-6`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[14px] font-semibold tracking-[-0.01em] flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-[8px] bg-[#0B0B0C] text-white flex items-center justify-center"><IconPlus c="w-3 h-3" /></span>
            {editingId ? 'Editing product' : 'Add new product'}
          </h3>
          {editingId && <button onClick={cancelEdit} className="text-[12px] font-medium text-zinc-500 hover:text-black bg-white border border-[#E4E4E1] h-8 px-3 rounded-[9px] inline-flex items-center gap-1.5 transition-colors"><IconX c="w-3 h-3" /> Cancel edit</button>}
        </div>

        <label className="group block border border-dashed border-[#D8D8D4] rounded-[14px] p-6 md:p-8 text-center cursor-pointer hover:border-[#0A0A0A]/40 hover:bg-[#FAFAF8] transition-all">
          <input type="file" accept="image/*" multiple onChange={handleFile} className="hidden" />
          {previews.length ? (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {previews.map((src, i) => (
                <div key={i} className="relative group/img">
                  <img src={src} alt="" className="w-full aspect-square object-cover rounded-[12px] border border-[#E8E8E5]" />
                  <button type="button" onClick={(e) => { e.preventDefault(); removeFileAt(i) }} aria-label="Remove image" className="absolute -top-1.5 -right-1.5 w-[22px] h-[22px] bg-[#0B0B0C] text-white text-[10px] rounded-full shadow-md opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">✕</button>
                  <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] font-mono px-1.5 h-[16px] rounded-md flex items-center">{i+1}</span>
                </div>
              ))}
              <div className="aspect-square rounded-[12px] border border-dashed border-[#D8D8D4] bg-white flex flex-col items-center justify-center hover:border-[#0A0A0A]/40 transition-colors"><IconPlus c="w-4 h-4 text-zinc-400" /><span className="font-mono text-[9px] mt-1 tracking-[0.12em] text-zinc-500">ADD</span></div>
            </div>
          ) : (
            <>
              <div className="w-11 h-11 rounded-[12px] bg-[#F0F0EE] mx-auto flex items-center justify-center mb-3 group-hover:bg-[#E8E8E5] transition-colors"><IconUpload c="w-5 h-5 text-zinc-600" /></div>
              <div className="font-medium text-[13.5px] tracking-[-0.01em]">Drop images or click to upload</div>
              <div className="text-[12px] text-zinc-500 mt-1">PNG, JPG, WEBP · up to 5MB each · {imageLimit === 999999 ? 'Unlimited' : `${imageLimit} max`} per product</div>
              <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap">
                <span className="font-mono text-[9.5px] px-2 h-[22px] rounded-md bg-white border border-[#E4E4E1] text-zinc-500 flex items-center">Basic · 1</span>
                <span className="font-mono text-[9.5px] px-2 h-[22px] rounded-md bg-[#0B0B0C] text-white flex items-center">Advanced · 5</span>
                <span className="font-mono text-[9.5px] px-2 h-[22px] rounded-md text-black bg-[#E8FF86] flex items-center">Premium · ∞</span>
              </div>
            </>
          )}
        </label>

        <div className="grid md:grid-cols-2 gap-x-4 gap-y-4 mt-5">
          <div><label className={labelBase}>Name <span className="text-red-500">*</span></label><input placeholder="Cashmere Scarf — Premium" value={prodName} onChange={e => setProdName(e.target.value)} className={inputBase} /></div>
          <div><label className={labelBase}>Price (Rs.) <span className="text-red-500">*</span></label><input placeholder="3500" type="number" value={prodPrice} onChange={e => setProdPrice(e.target.value)} className={inputBase} /></div>
          <div><label className={labelBase}>Compare at</label><input placeholder="4500 (optional)" type="number" value={prodOrigPrice} onChange={e => setProdOrigPrice(e.target.value)} className={inputBase} /></div>
          <div>
            <label className={labelBase}>Category</label>
            <select value={prodCategory} onChange={e => setProdCategory(e.target.value)} className={`${inputBase} appearance-none pr-8 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_12px_center]`}>
              <option>General</option><option>Clothing</option><option>Shoes</option><option>Bags</option><option>Beauty</option><option>Electronics</option><option>Food</option><option>Other</option>
            </select>
          </div>
          <div><label className={labelBase}>Stock</label><input placeholder="100" type="number" value={prodStock} onChange={e => setProdStock(e.target.value)} className={inputBase} /></div>
          <div><label className={labelBase}>Sizes</label><input placeholder="S, M, L, XL" value={prodSizes} onChange={e => setProdSizes(e.target.value)} className={inputBase} /></div>
          <div className="md:col-span-2"><label className={labelBase}>Colors</label><input placeholder="Black, White, Sand — comma separated" value={prodColors} onChange={e => setProdColors(e.target.value)} className={inputBase} /></div>
          <div className="md:col-span-2"><label className={labelBase}>Description</label><textarea placeholder="Materials, craftsmanship, care instructions..." value={prodDesc} onChange={e => setProdDesc(e.target.value)} className="w-full min-h-[88px] p-3.5 border border-[#E4E4E1] rounded-[12px] text-[13.5px] bg-white focus:outline-none focus:border-[#0A0A0A] focus:ring-[3px] focus:ring-zinc-900/[0.06] transition-all resize-none placeholder:text-zinc-400" /></div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-5 border-t border-[#F0F0EE]">
          {editingId && <button onClick={cancelEdit} className={`${btnSecondary} h-10`}>Cancel</button>}
          <button onClick={addProduct} disabled={uploading || (!editingId && products.length >= productLimit)} className={`${btnPrimary} h-10 px-5`}>
            {uploading ? 'Uploading…' : !editingId && products.length >= productLimit ? `Limit ${productLimit === 999999 ? '∞' : productLimit} — Upgrade to add` : `${editingId ? 'Update' : 'Add'} product`}
            {!uploading && <IconArrowRight c="w-3.5 h-3.5 opacity-70" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-3.5">
        {products.length === 0 ? (
          <div className="col-span-2 md:col-span-4 bg-white border border-dashed border-[#E0E0DC] rounded-[14px] p-14 flex flex-col items-center justify-center text-center">
            <div className="w-11 h-11 rounded-[12px] bg-[#F0F0EE] flex items-center justify-center mb-3"><IconUpload c="w-5 h-5 text-zinc-500" /></div>
            <div className="font-medium text-[14px] tracking-[-0.01em]">No products yet</div>
            <div className="text-[12.5px] text-zinc-500 mt-1 max-w-[300px] leading-relaxed">Add your first product — {productLimit === 999999 ? 'Unlimited' : productLimit} allowed on {currentPlanDef.name}. Images: {imageLimit === 999999 ? 'Unlimited' : imageLimit} per product.</div>
          </div>
        ) : products.map(p => (<PremiumProductCard key={p.id} p={p} imageLimit={imageLimit} onEdit={startEdit} onDelete={(id: string) => setDeleteTarget(id)} />))}
      </div>
    </div>
  )

  /* ---------------- STORE PAGE ---------------- */
  const storePage = (
    <div className="animate-[fadeIn_0.3s_ease]">
      <PageHeader eyebrow="Settings" title="Store identity" subtitle="How customers see and reach your business" actions={<button onClick={saveStore} disabled={saving} className={btnPrimary}>{saving ? 'Saving…' : saved ? <><IconCheck c="w-3.5 h-3.5 text-[#D9FF4B]" /> Saved</> : 'Save changes'}</button>} />
      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <div className={`${cardBase} p-6 md:p-7 space-y-5`}>
          <div>
            <label className={labelBase}>Business name</label>
            <input value={businessName} onChange={e => setBusinessName(e.target.value)} className={`${inputBase} h-[42px] font-medium`} />
          </div>
          <div>
            <label className={labelBase}>WhatsApp number</label>
            <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="923001234567" className={`${inputBase} h-[42px] font-mono`} />
            <div className="text-[11.5px] text-zinc-400 mt-1.5">Include country code, no spaces (e.g. 923001234567)</div>
          </div>
          <div>
            <label className={labelBase}>Store URL</label>
            <div className="flex items-center border border-[#E4E4E1] rounded-[10px] overflow-hidden bg-white focus-within:border-[#0A0A0A] focus-within:ring-[3px] focus-within:ring-zinc-900/[0.06] transition-all">
              <span className="pl-3.5 pr-1 text-[12.5px] text-zinc-400 font-mono shrink-0">dukaanwhats.pk/s/</span>
              <input value={slug} onChange={e => setSlug(e.target.value)} className="flex-1 h-[42px] pr-3.5 bg-transparent text-[13px] font-mono focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-2 pt-1 flex-wrap">
            <button onClick={copyLink} className={`${btnSecondary} h-10`}><IconCopy c="w-3.5 h-3.5" /> {copied ? 'Copied' : 'Copy link'}</button>
            <Link href={slug ? `/s/${slug}` : '#'} target="_blank" className={`${btnPrimary} h-10 no-underline`}>Preview <IconExternal c="w-3.5 h-3.5 opacity-70" /></Link>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-[#0B0B0C] rounded-[14px] p-5 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#E8FF86]/10 rounded-full blur-[28px] -mr-10 -mt-10" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[9.5px] font-medium tracking-[0.14em] uppercase text-white/40">Current plan</div>
                <div className="flex items-center gap-1.5"><LiveDot /><span className="font-mono text-[9.5px] text-[#D9FF4B]">LIVE</span></div>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-[20px] font-semibold tracking-[-0.02em]">{currentPlanDef.name}</span>
                {currentPlanId === 'advanced' && <span className="text-[8.5px] font-semibold tracking-[0.1em] px-1.5 h-[18px] rounded-md text-black bg-[#E8FF86] flex items-center">POPULAR</span>}
              </div>
              <div className="text-[11.5px] text-white/50 mt-1.5 leading-relaxed">{currentPlanDef.features.slice(0, 3).join(' · ')}</div>
              <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-[#E8FF86] rounded-full transition-all" style={{ width: `${Math.min(100, (products.length / (productLimit === 999999 ? 100 : productLimit)) * 100)}%` }} /></div>
              <div className="font-mono text-[10px] text-white/40 mt-1.5">{products.length} / {productLimit === 999999 ? '∞' : productLimit} products used</div>
              {!isPremium && <button onClick={() => setActiveTab('payments')} className="mt-4 w-full h-9 bg-white text-black text-[12.5px] font-medium rounded-[10px] hover:bg-zinc-200 transition-colors inline-flex items-center justify-center gap-1.5">Upgrade plan <IconArrowRight c="w-3 h-3" /></button>}
              {isPremium && <div className="mt-4 w-full h-9 rounded-[10px] text-[10.5px] font-semibold tracking-[0.1em] text-black flex items-center justify-center bg-[#E8FF86]">PREMIUM <IconCheck c="w-3 h-3 ml-1" /></div>}
            </div>
          </div>
          <div className={`${cardBase} p-4`}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-[9.5px] font-medium tracking-[0.14em] uppercase text-zinc-400">Live preview</div>
              <div className="flex items-center gap-1.5 font-mono text-[9.5px] text-zinc-400"><LiveDot /> LIVE</div>
            </div>
            <div className="aspect-[4/3] rounded-[12px] overflow-hidden border border-[#E8E8E5] bg-[#F7F7F5]"><MiniStorefront theme={currentTheme} /></div>
            <div className="mt-3 flex items-center justify-between">
              <div className="font-mono text-[10.5px] text-zinc-500 truncate">/s/{slug || 'your-slug'}</div>
              <span className="text-[9px] font-mono text-black bg-[#E8FF86] px-1.5 h-[18px] rounded-md flex items-center">LIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  /* ---------------- ANALYTICS PAGE ---------------- */
  const analyticsPage = (
    <div className="animate-[fadeIn_0.3s_ease]">
      <PageHeader eyebrow="Insights" title="Analytics" subtitle="Real-time store performance · Premium only" />
      {!profile ? (<div className="p-10 text-center text-zinc-500 text-[13px] font-mono">Loading analytics...</div>) : currentPlanId === 'premium' ? (<RealAnalytics userId={profile.id} currentPlanId={currentPlanId} />) : (
        <div className={`${cardBase} p-8 md:p-14 text-center`}>
          <div className="w-12 h-12 rounded-[12px] bg-[#0B0B0C] flex items-center justify-center mx-auto"><IconAnalytics c="w-5 h-5 text-[#D9FF4B]" /></div>
          <h3 className="font-semibold text-[19px] tracking-[-0.02em] mt-5">Analytics is a Premium feature</h3>
          <p className="text-[13px] text-zinc-500 mt-2 max-w-[400px] mx-auto leading-relaxed">You’re on <b className="text-zinc-900 font-medium">{currentPlanDef.name}</b>. Upgrade to Premium to unlock real-time visitors, orders, conversion rate and revenue insights.</p>
          <div className="flex flex-wrap gap-1.5 justify-center mt-5">{['Live Visitors', 'Conversion Rate', 'Revenue', 'Orders', 'Traffic Sources', 'Retention'].map(f => (<span key={f} className="text-[11px] text-zinc-600 bg-[#F7F7F5] border border-[#ECECEA] px-2.5 h-6 rounded-md flex items-center">{f}</span>))}</div>
          <button onClick={() => setActiveTab('payments')} className={`${btnPrimary} h-10 px-5 mt-7`}>Upgrade to Premium <IconArrowRight c="w-3.5 h-3.5 text-[#D9FF4B]" /></button>
        </div>
      )}
    </div>
  )

  /* ---------------- PAYMENTS PAGE ---------------- */
  const paymentsPage = (
    <div className="animate-[fadeIn_0.3s_ease]">
      <PageHeader eyebrow="Subscription" title="Plans & Billing" subtitle={`You are on ${currentPlanDef.name} · Till ${TILL_ID}`} />

      {myPayments.length > 0 && (
        <div className={`${cardBase} p-5 md:p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13.5px] font-semibold tracking-[-0.01em] flex items-center gap-2">
              <span className="w-6 h-6 rounded-[8px] bg-[#0B0B0C] text-white flex items-center justify-center font-mono text-[10px]">Rs</span>
              Payment history
            </h3>
            {myPayments.filter((p: any) => p.status === 'pending').length > 0 && (
              <span className="text-[10.5px] font-medium bg-amber-50 border border-amber-200 text-amber-800 px-2.5 h-7 rounded-md flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />{myPayments.filter((p: any) => p.status === 'pending').length} pending
              </span>
            )}
          </div>
          <div className="space-y-2">
            {myPayments.slice(0, 5).map((p: any) => {
              const st = statusMeta[p.status] || statusMeta.pending
              return (
                <div key={p.id} className="flex items-center justify-between gap-3 bg-[#FAFAF8] border border-[#F0F0EE] rounded-[12px] p-3.5">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="shrink-0 h-6 px-2 rounded-md text-[9px] font-semibold tracking-[0.08em] flex items-center gap-1.5 border" style={{ background: st.bg, color: st.fg, borderColor: st.border }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />{st.label}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2"><span className="text-[12.5px] font-semibold tracking-tight capitalize">{p.plan_id}</span><span className="text-[12px] text-zinc-600">Rs. {p.amount}</span></div>
                      <div className="flex items-center gap-2 mt-1"><span className="font-mono text-[10px] bg-white border border-[#E8E8E5] px-2 py-[1px] rounded-md text-zinc-500">{p.txn_id}</span><span className="text-[10px] text-zinc-400 hidden md:inline font-mono">{new Date(p.created_at).toLocaleDateString()} · Till {p.till_id}</span></div>
                    </div>
                  </div>
                  <div className="text-[10.5px] font-medium shrink-0 text-right" style={{ color: st.fg }}>{p.status === 'pending' ? 'Verifying' : p.status === 'approved' ? 'Active' : 'Rejected'}</div>
                </div>
              )
            })}
          </div>
          {justSubmitted && justSubmitted.status === 'pending' && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-[12px] p-4 flex items-start gap-3">
              <span className="w-7 h-7 bg-amber-100 border border-amber-200 rounded-full flex items-center justify-center shrink-0"><IconClock c="w-3.5 h-3.5 text-amber-700" /></span>
              <div>
                <div className="text-[12.5px] font-semibold text-amber-900">Payment submitted — pending verification</div>
                <div className="text-[11.5px] text-amber-700/80 mt-0.5 leading-relaxed">Verifying Txn ID <span className="font-mono bg-white px-1.5 py-[1px] rounded-md border border-amber-200 text-[10.5px]">{justSubmitted.txn_id}</span>. WhatsApp notification within 1 hour.</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={`${cardBase} p-5 md:p-7`}>
        <div className="flex flex-wrap items-start justify-between gap-5 mb-6">
          <div>
            <h3 className="text-[15px] font-semibold tracking-[-0.01em] flex items-center gap-2 flex-wrap">Pay to JazzCash Till <span className="font-mono text-[11.5px] font-medium bg-[#F7F7F5] border border-[#E4E4E1] px-2 h-6 rounded-md flex items-center tracking-wider">{TILL_ID}</span></h3>
            <p className="text-[12.5px] text-zinc-500 mt-1.5">Send payment, then submit the Transaction ID below</p>
          </div>
          <div className="flex bg-[#F0F0EE] rounded-[10px] p-[3px] gap-[2px]">
            <button onClick={() => setBilling('monthly')} className={`h-7 px-3.5 rounded-[8px] text-[12px] font-medium transition-all ${billing === 'monthly' ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>Monthly</button>
            <button onClick={() => setBilling('yearly')} className={`h-7 px-3.5 rounded-[8px] text-[12px] font-medium transition-all flex items-center gap-1.5 ${billing === 'yearly' ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>Yearly <span className="text-[8.5px] px-1 py-[1px] rounded-[5px] text-black font-semibold bg-[#E8FF86]">-22%</span></button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-5">
          <div className="bg-[#0B0B0C] rounded-[14px] p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#E8FF86]/[0.06] rounded-full blur-[40px] -mr-14 -mt-14" />
            <div className="relative">
              <div className="flex justify-between items-center mb-4">
                <div className="font-mono text-[9.5px] tracking-[0.16em] uppercase text-white/40 font-medium">JazzCash Till</div>
                <button onClick={copyTill} className="h-7 px-2.5 bg-white/[0.08] border border-white/10 rounded-[8px] text-[11px] font-medium text-white hover:bg-white/[0.14] transition-colors inline-flex items-center gap-1.5"><IconCopy c="w-3 h-3" />{copiedTill ? 'Copied' : 'Copy ID'}</button>
              </div>
              <div className="bg-white/[0.05] border border-white/[0.08] rounded-[12px] p-4">
                <div className="font-mono text-[9px] uppercase text-white/40 tracking-[0.14em]">Till ID</div>
                <div className="text-[24px] font-semibold font-mono tracking-[0.06em] text-white mt-1">{TILL_ID}</div>
              </div>
              <div className="mt-3 bg-white rounded-[12px] p-3">
                <img src={`https://barcodeapi.org/api/code128/${TILL_ID}`} alt="Barcode" className="w-full h-[40px] object-contain" />
                <div className="text-center text-[10.5px] font-mono text-zinc-900 font-semibold tracking-[0.28em] mt-1.5">{TILL_ID}</div>
              </div>
              <div className="mt-3 bg-white rounded-[12px] p-3 flex justify-center"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=JAZZCASH_TILL_${TILL_ID}`} alt="QR code" className="w-[104px] h-[104px] rounded-[8px]" /></div>
              <div className="mt-4 text-[10.5px] text-white/40 leading-relaxed">Manual verification via JazzCash merchant app. Submit Txn ID after payment.</div>
            </div>
          </div>

          <div className="space-y-2.5">
            {plans.map(p => {
              const displayPrice = getDisplayPrice(p); const isCurrent = currentPlanId === p.id; const isSelected = selectedPlan?.id === p.id
              return (
                <button key={p.id} onClick={() => setSelectedPlan(p)} className={`w-full text-left rounded-[12px] border p-4 transition-all cursor-pointer bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/30 ${isSelected ? 'border-[#0A0A0A] shadow-[0_6px_18px_-10px_rgba(0,0,0,0.14)] ring-[3px] ring-zinc-900/[0.05]' : isCurrent ? 'border-zinc-900/25 bg-[#FAFAF8]' : 'border-[#E8E8E5] hover:border-[#0A0A0A]/25 hover:shadow-[0_4px_14px_-8px_rgba(0,0,0,0.08)]'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[13.5px] tracking-[-0.01em]">{p.name}</span>
                        {isCurrent && <span className="bg-[#0B0B0C] text-white text-[8.5px] px-2 h-[18px] rounded-md font-semibold flex items-center tracking-[0.1em]">CURRENT</span>}
                        {p.id === 'advanced' && <span className="text-black text-[8.5px] px-2 h-[18px] rounded-md font-semibold flex items-center tracking-[0.1em] bg-[#E8FF86]">POPULAR</span>}
                        {isSelected && <span className="w-[18px] h-[18px] bg-[#0B0B0C] text-white rounded-full flex items-center justify-center"><IconCheck c="w-2.5 h-2.5" /></span>}
                      </div>
                      <div className="text-[11.5px] mt-2 text-zinc-600 leading-relaxed flex flex-wrap gap-1.5">{p.features.map(feat => (<span key={feat} className="bg-[#F7F7F5] border border-[#F0F0EE] px-2 h-[22px] rounded-md text-[10.5px] flex items-center text-zinc-600">{feat}</span>))}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-[17px] tracking-[-0.02em]">Rs. {displayPrice}</div>
                      <div className="text-[10.5px] text-zinc-400 font-mono">{billing === 'yearly' && p.yearlyTotal > 0 ? `Rs. ${p.yearlyTotal.toLocaleString()}/yr` : '/month'}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {selectedPlan && selectedPlan.monthly > 0 && (
          <div className="mt-5 rounded-[14px] border border-[#0A0A0A] bg-[#FDFDF3] p-5 shadow-[0_6px_18px_-12px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-7 h-7 rounded-full bg-[#0B0B0C] text-white flex items-center justify-center font-mono text-[10px]">Rs</div>
              <div className="text-[13.5px] font-semibold tracking-[-0.01em]">Pay Rs. {(billing === 'monthly' ? selectedPlan.monthly : selectedPlan.yearlyTotal).toLocaleString()} → Till {TILL_ID}</div>
              <span className="ml-auto font-mono text-[9px] font-medium tracking-[0.1em] bg-[#0B0B0C] text-white px-2 h-[20px] rounded-md flex items-center">{billing.toUpperCase()}</span>
            </div>
            <input value={txnId} onChange={e => setTxnId(e.target.value)} placeholder="Enter Transaction ID from JazzCash SMS" className="mt-4 w-full h-[42px] px-3.5 rounded-[10px] border border-[#E4E4E1] bg-white text-[13px] font-mono focus:outline-none focus:border-[#0A0A0A] focus:ring-[3px] focus:ring-zinc-900/[0.06] transition-all placeholder:text-zinc-400" />
            <button onClick={handleBuyPlan} disabled={purchasing} className={`${btnPrimary} mt-3.5 w-full h-[42px] text-[13px]`}>
              {purchasing ? 'Submitting…' : `I paid — Activate ${selectedPlan.name}`} <IconArrowRight c="w-3.5 h-3.5 text-[#D9FF4B]" />
            </button>
            <div className="text-[11px] text-zinc-500 mt-3 text-center">Verification via merchant Till {TILL_ID} · WhatsApp update within 1 hour</div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#0A0A0A] antialiased selection:bg-[#E8FF86] selection:text-black">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'); *{font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;} .font-mono{font-family: 'JetBrains Mono', monospace !important;} .no-scrollbar::-webkit-scrollbar{display:none} .no-scrollbar{-ms-overflow-style:none; scrollbar-width:none} button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible{outline:2px solid rgba(10,10,10,0.5); outline-offset:2px; border-radius:8px;}`}</style>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[264px] bg-[#0B0B0C] text-white flex-col z-40">
        <div className="px-5 pt-6 pb-5">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-[9px] flex items-center justify-center font-bold text-[14px] text-black bg-[#E8FF86]">D</div>
            <div>
              <div className="font-semibold text-[14px] tracking-[-0.01em] leading-none">DukaanWhats</div>
              <div className="font-mono text-[9px] text-white/35 tracking-[0.14em] mt-1">SAAS · PK</div>
            </div>
          </Link>
        </div>

        <div className="flex-1 px-3 overflow-y-auto">
          <div className="px-2 pt-1 pb-2 font-mono text-[9.5px] font-medium tracking-[0.16em] uppercase text-white/30">Workspace</div>
          <div className="space-y-[2px]">
            {sidebarNav.map(item => {
              const isActive = activeTab === item.id; const Icon = item.Icon
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id as any)} aria-current={isActive ? 'page' : undefined} className={`w-full flex items-center gap-2.5 px-3 h-9 rounded-[10px] text-[13px] font-medium tracking-[-0.01em] transition-colors ${isActive ? 'bg-white text-[#0A0A0A]' : 'text-white/55 hover:text-white hover:bg-white/[0.06]'}`}>
                  <Icon c={`w-[16px] h-[16px] ${isActive ? 'text-[#0A0A0A]' : 'text-white/35'}`} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {(item as any).badge && <span className={`font-mono text-[9.5px] px-1.5 h-[18px] rounded-md flex items-center ${isActive ? 'bg-[#0A0A0A] text-white' : 'bg-white/[0.07] text-white/50 border border-white/[0.08]'}`}>{(item as any).badge}</span>}
                  {(item as any).pro && <span className="text-[7.5px] font-semibold tracking-[0.1em] px-1.5 h-[16px] rounded-md bg-[#E8FF86] text-black flex items-center">PRO</span>}
                </button>
              )
            })}
          </div>

          <div className="mt-7 mx-1 rounded-[14px] bg-white/[0.04] border border-white/[0.08] p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9.5px] font-medium tracking-[0.14em] uppercase text-white/40">Plan</span>
              <div className="flex items-center gap-1.5"><LiveDot /><span className="font-mono text-[9px] text-[#D9FF4B]">LIVE</span></div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-[17px] font-semibold tracking-[-0.01em]">{currentPlanDef.name}</span>
              <span className="font-mono text-[9.5px] text-white/35">{productLimit === 999999 ? '∞' : productLimit}p · {imageLimit === 999999 ? '∞' : imageLimit}i</span>
            </div>
            <div className="mt-3 h-1 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-[#E8FF86] rounded-full transition-all" style={{ width: `${Math.min(100, (products.length / (productLimit === 999999 ? 100 : productLimit)) * 100)}%` }} /></div>
            <div className="font-mono text-[9.5px] text-white/35 mt-1.5">{products.length} / {productLimit === 999999 ? '∞' : productLimit} products used</div>
            {!isPremium
              ? <button onClick={() => setActiveTab('payments')} className="mt-4 w-full h-[34px] rounded-[9px] text-[12px] font-medium text-black bg-[#E8FF86] hover:bg-[#DEF56E] transition-colors inline-flex items-center justify-center gap-1.5">Upgrade plan <IconArrowRight c="w-3 h-3" /></button>
              : <div className="mt-4 w-full h-[34px] rounded-[9px] text-[10px] font-semibold tracking-[0.1em] text-black flex items-center justify-center gap-1.5 bg-[#E8FF86]">PREMIUM <IconCheck c="w-3 h-3" /></div>}
          </div>
        </div>

        <div className="p-3 border-t border-white/[0.07]">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-[10px] hover:bg-white/[0.05] transition-colors cursor-default">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[12px] text-black shrink-0 bg-[#E8FF86]">{(businessName || 'S')[0].toUpperCase()}</div>
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] font-medium truncate tracking-[-0.01em]">{businessName || 'Your Store'}</div>
              <div className="font-mono text-[9.5px] text-white/35 truncate">/s/{slug || 'your-slug'}</div>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#D9FF4B] shrink-0" />
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden sticky top-0 z-30 bg-[#FAFAF8]/90 backdrop-blur-xl border-b border-[#E8E8E5]">
        <div className="flex items-center justify-between px-4 h-[54px]">
          <Link href="/" className="flex items-center gap-2 no-underline text-inherit">
            <div className="w-7 h-7 rounded-[8px] flex items-center justify-center font-bold text-[12px] text-black bg-[#E8FF86]">D</div>
            <span className="font-semibold text-[14px] tracking-[-0.01em]">DukaanWhats</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-7 px-2.5 rounded-[8px] bg-white border border-[#E4E4E1] flex items-center gap-1.5 text-[10.5px] font-mono text-zinc-600"><LiveDot />{currentPlanDef.name}</div>
            <button onClick={() => setActiveTab('payments')} className="h-7 px-3 rounded-[8px] text-[10.5px] font-semibold tracking-[0.08em] bg-[#0B0B0C] text-white">{isPremium ? 'PLANS' : 'PRO'}</button>
          </div>
        </div>
        <div className="flex gap-1.5 px-3 pb-3 overflow-x-auto no-scrollbar">
          {[{ id: 'themes', label: 'Themes' }, { id: 'products', label: 'Products' }, { id: 'store', label: 'Store' }, { id: 'analytics', label: 'Analytics' }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`h-8 px-3.5 rounded-[9px] text-[12.5px] font-medium whitespace-nowrap transition-colors ${activeTab === t.id ? 'bg-[#0B0B0C] text-white' : 'bg-white text-zinc-600 border border-[#E4E4E1]'}`}>{t.label}</button>
          ))}
          <button onClick={() => setActiveTab('payments')} className={`h-8 px-3.5 rounded-[9px] text-[12.5px] font-semibold whitespace-nowrap ${activeTab === 'payments' ? 'bg-[#0B0B0C] text-white' : 'bg-[#E8FF86] text-black'}`}>{isPremium ? 'Plans' : 'Upgrade'}</button>
        </div>
      </header>

      <div className="md:ml-[264px]">
        <main className="max-w-[1120px] mx-auto px-4 md:px-8 py-6 md:py-9 pb-[92px] md:pb-10">
          {activeTab === 'themes' && themesPage}
          {activeTab === 'products' && productsPage}
          {activeTab === 'store' && storePage}
          {activeTab === 'analytics' && analyticsPage}
          {activeTab === 'payments' && paymentsPage}
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-[#E8E8E5] px-2 pt-1.5 pb-[max(8px,env(safe-area-inset-bottom))]">
        <div className="flex justify-around">
          {sidebarNav.map(item => {
            const isActive = activeTab === item.id; const Icon = item.Icon
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id as any)} aria-current={isActive ? 'page' : undefined} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-[10px] transition-colors ${isActive ? 'text-[#0A0A0A]' : 'text-zinc-400'}`}>
                <Icon c="w-[18px] h-[18px]" />
                <span className="text-[9.5px] font-medium tracking-[-0.01em]">{item.label.split(' ')[0]}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Toast */}
      {errorMsg && (
        <div className="fixed bottom-[92px] md:bottom-6 right-4 md:right-6 z-[100] bg-[#0B0B0C] text-white pl-3.5 pr-4 py-2.5 rounded-[12px] text-[12.5px] font-medium shadow-[0_12px_32px_rgba(0,0,0,0.22)] border border-white/10 flex items-center gap-2.5 animate-[fadeIn_0.25s_ease] max-w-[calc(100vw-32px)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D9FF4B] animate-pulse shrink-0" /><span className="truncate">{errorMsg}</span>
        </div>
      )}

      {/* Locked-theme dialog (replaces native alert — same message, same destination) */}
      {lockedTheme && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => setLockedTheme(null)} />
          <div className="relative bg-white rounded-[16px] w-full max-w-[380px] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.25)] border border-[#E8E8E5] animate-[fadeIn_0.25s_ease]">
            <div className="w-10 h-10 rounded-[10px] bg-[#0B0B0C] flex items-center justify-center"><IconLock c="w-[18px] h-[18px] text-[#D9FF4B]" /></div>
            <h3 className="mt-4 text-[16px] font-semibold tracking-[-0.01em]">{lockedTheme.title}</h3>
            <p className="mt-2 text-[12.5px] text-zinc-500 leading-relaxed">{lockedTheme.body}</p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setLockedTheme(null)} className={`${btnSecondary} flex-1`}>Not now</button>
              <button onClick={() => { setLockedTheme(null); setActiveTab('payments') }} className={`${btnPrimary} flex-1`}>View plans</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation (replaces native confirm()) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-[16px] w-full max-w-[380px] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.25)] border border-[#E8E8E5] animate-[fadeIn_0.25s_ease]">
            <h3 className="text-[16px] font-semibold tracking-[-0.01em]">Delete product?</h3>
            <p className="mt-2 text-[12.5px] text-zinc-500 leading-relaxed">
              <span className="text-zinc-900 font-medium">{products.find(p => p.id === deleteTarget)?.name || 'This product'}</span> will be permanently removed from your store. This can’t be undone.
            </p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className={`${btnSecondary} flex-1`}>Cancel</button>
              <button onClick={confirmDeleteProduct} className="flex-1 h-9 px-4 bg-red-600 text-white text-[12.5px] font-medium rounded-[10px] hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-2"><IconTrash c="w-3.5 h-3.5" /> Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment status modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-[16px] w-full max-w-[400px] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.3)] border border-[#E8E8E5] animate-[fadeIn_0.25s_ease]">
            {showStatusModal.type === 'approved' ? (
              <div>
                <div className="bg-[#0B0B0C] text-white p-8 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-36 h-36 bg-[#E8FF86]/10 rounded-full blur-[32px] -mr-10 -mt-10" />
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto bg-[#E8FF86]"><IconCheck c="w-6 h-6 text-black" /></div>
                    <h2 className="font-semibold text-[20px] tracking-[-0.02em] mt-4">Payment approved</h2>
                    <p className="text-[12.5px] text-white/60 mt-1.5">Your store is now {showStatusModal.payment.plan_id} · Till {TILL_ID}</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="bg-[#FAFAF8] border border-[#F0F0EE] rounded-[12px] p-4 space-y-3">
                    <div className="flex justify-between items-center"><span className="font-mono text-[9.5px] text-zinc-400 uppercase tracking-[0.14em]">Plan</span><span className="text-[12.5px] font-semibold capitalize">{showStatusModal.payment.plan_id} · Rs. {showStatusModal.payment.amount}</span></div>
                    <div className="flex justify-between items-center"><span className="font-mono text-[9.5px] text-zinc-400 uppercase tracking-[0.14em]">Txn ID</span><span className="font-mono text-[11px] bg-white border border-[#E4E4E1] px-2 py-[2px] rounded-md">{showStatusModal.payment.txn_id}</span></div>
                  </div>
                  <button onClick={() => setShowStatusModal(null)} className={`${btnPrimary} mt-5 w-full h-10`}>Continue <IconArrowRight c="w-3.5 h-3.5 text-[#D9FF4B]" /></button>
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-[#FEF2F2] p-8 text-center border-b border-red-100">
                  <div className="w-14 h-14 bg-white border border-red-200 rounded-full flex items-center justify-center mx-auto"><IconX c="w-5 h-5 text-red-600" /></div>
                  <h2 className="font-semibold text-[19px] tracking-[-0.02em] mt-4 text-red-900">Payment rejected</h2>
                  <p className="text-[12px] text-red-700/70 mt-1.5">Check Txn ID and try again · Till {TILL_ID}</p>
                </div>
                <div className="p-5">
                  <p className="text-[12.5px] text-zinc-600 leading-relaxed">Txn ID could not be verified in Till {TILL_ID}. Please ensure the correct amount and ID were entered.</p>
                  <button onClick={() => setShowStatusModal(null)} className={`${btnPrimary} mt-5 w-full h-10`}>Try again <IconArrowRight c="w-3.5 h-3.5 text-[#D9FF4B]" /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
