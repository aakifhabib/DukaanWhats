'use client'
import { useEffect, useRef, useState } from 'react'
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
            <div className="mt-1.5 flex gap-1">
              {['All','Nike','Adidas'].map(b=> <div key={b} className="h-3 px-1.5 bg-black text-white rounded-full text-[5px] font-bold flex items-center">{b}</div>)}
            </div>
          </div>
          <div className="w-[46%] aspect-[4/5] rounded-[10px] overflow-hidden border border-black/10 bg-white"><img src={img1} className="w-full h-full object-cover" alt="" /></div>
        </div>
        <div className="px-2 pb-2 grid grid-cols-3 gap-1 mt-auto">
          {[img1,img2,img3].map((im,i)=><div key={i} className="aspect-square rounded-[6px] overflow-hidden bg-white border"><img src={im} className="w-full h-full object-cover" alt="" /></div>)}
        </div>
      </div>
    )
  }

  if (id === 'shoe-app-premium') {
    return (
      <div className="h-full w-full flex flex-col bg-[#F2F0FF] p-1.5 gap-1 overflow-hidden">
        <div className="h-6 bg-white rounded-[8px] border border-black/5 flex items-center justify-between px-1.5">
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-black text-white rounded-[4px] grid place-items-center text-[6px] font-black">S</div><div className="flex gap-0.5">{['All','Nike'].map(f=> <div key={f} className="h-2.5 px-1 bg-black text-white rounded-full text-[5px] font-bold flex items-center">{f}</div>)}</div></div>
          <div className="w-3 h-3 bg-black rounded-full grid place-items-center text-[5px] text-white">2</div>
        </div>
        <div className="flex-1 grid grid-cols-[28%_1fr_28%] gap-1">
          <div className="bg-[#7C3AED] rounded-[8px] p-1 flex flex-col justify-between text-white">
            <div className="text-[5px] font-black bg-black/20 rounded-full px-1 h-2.5 flex items-center w-fit">BLACK FRIDAY</div>
            <div className="text-[8px] font-black leading-[0.9]">GET UP TO<br/>50% OFF</div>
            <div className="h-3 bg-white text-black rounded-full text-[5px] font-bold grid place-items-center">Shop Sale →</div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {[img1,img2,img3,img1].map((im,i)=><div key={i} className="aspect-square rounded-[6px] overflow-hidden bg-white border"><img src={im} className="w-full h-full object-cover" alt="" /></div>)}
          </div>
          <div className="bg-black rounded-[8px] p-1 flex flex-col text-white">
            <div className="text-[6px] font-bold leading-[1.1]">Free Shipping<br/>+ 7 Days Return</div>
            <div className="mt-1 text-[4px] text-white/50">Early access</div>
            <div className="mt-auto h-3 bg-white text-black rounded-full text-[4px] font-bold grid place-items-center">Join Premium</div>
          </div>
        </div>
      </div>
    )
  }

  if (id === 'trenzo-luxury') {
    return (
      <div className="h-full w-full bg-[#0A0A0A] text-white p-1.5 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center"><div className="text-[6px] font-black tracking-[0.2em]">✦ TRENZO • LUXURY</div><div className="w-3 h-1.5 bg-white/10 rounded-full" /></div>
        <div className="mt-1 flex gap-1.5">
          <div className="flex-1">
            <div className="text-[5px] tracking-[0.2em] text-white/40">EST. 2018 • LUXURY CURATED</div>
            <div className="mt-1 text-[11px] font-[300] leading-[0.9] font-serif">A reflection<br/>of personal<br/>styling</div>
            <div className="mt-2 h-3 px-1.5 border border-white/20 rounded-full text-[5px] flex items-center w-fit">Explore Collection →</div>
          </div>
          <div className="w-[46%] aspect-[4/5] rounded-[14px] overflow-hidden border border-white/10 relative bg-[#141414]"><img src={img2} className="w-full h-full object-cover opacity-90" alt="" /><div className="absolute top-1 left-1 h-2 px-1 bg-white text-black rounded-full text-[4px] font-bold grid place-items-center">FEATURED • NEW</div><div className="absolute bottom-1 right-1 w-5 h-5 bg-white text-black rounded-full grid place-items-center text-[6px] font-black">✦</div></div>
        </div>
        <div className="mt-auto grid grid-cols-3 gap-1">
          {['Craftsmanship','Heritage','Sustainability'].map(t=> <div key={t} className="h-6 bg-[#141414] border border-white/10 rounded-[6px] px-1 flex flex-col justify-center"><div className="text-[5px] font-bold">{t}</div><div className="text-[3.5px] text-white/40 truncate">Hand-stitched</div></div>)}
        </div>
      </div>
    )
  }

  if (id === 'sleek-beige') {
    return (
      <div className="h-full w-full bg-[#F5F1EB] text-[#0A0A0A] p-1.5 flex flex-col overflow-hidden">
        <div className="h-2.5 bg-black text-[#E8FF86] text-[4px] flex items-center justify-center font-bold tracking-[0.2em]">FREE SHIPPING • NEW DROP • COD • PREMIUM BEIGE</div>
        <div className="mt-1 flex justify-between items-center"><div className="text-[6px] font-black tracking-[0.2em]">BEIGE • Studio</div><div className="h-3 px-1 bg-black text-white rounded-full text-[5px] flex items-center">Cart (2)</div></div>
        <div className="mt-1 flex gap-1.5">
          <div className="flex-1">
            <div className="h-2.5 px-1 bg-white border rounded-full text-[4px] font-bold inline-flex items-center">EDITORIAL • BEIGE • 2024</div>
            <div className="mt-1 text-[10px] font-black leading-[0.9]">Warm minimal<br/>luxury, everyday<br/>icon.</div>
            <div className="mt-1 h-3 px-2 bg-black text-white rounded-full text-[5px] font-bold flex items-center w-fit">Shop Beige →</div>
          </div>
          <div className="w-[44%] aspect-[4/5] rounded-[14px] overflow-hidden border shadow-[0_8px_16px_rgba(0,0,0,0.08)] bg-white"><img src={img1} className="w-full h-full object-cover" alt="" /></div>
        </div>
        <div className="mt-auto grid grid-cols-3 gap-1">{[img1,img2,img3].map((im,i)=><div key={i} className="aspect-square rounded-[5px] overflow-hidden bg-white border"><img src={im} className="w-full h-full object-cover" alt="" /></div>)}</div>
      </div>
    )
  }

  if (id === 'sleek-dark') {
    return (
      <div className="h-full w-full bg-[#0A0A0A] text-white p-1.5 flex flex-col overflow-hidden">
        <div className="h-2.5 bg-[#E8FF86] text-black text-[4px] flex items-center justify-center font-bold tracking-[0.2em]">DARK MODE • LUXURY • FREE SHIPPING • COD</div>
        <div className="mt-1 flex justify-between items-center"><div className="text-[6px] font-black tracking-[0.2em]">DARK • Studio</div><div className="h-3 px-1 bg-white text-black rounded-full text-[5px] flex items-center">Cart (2)</div></div>
        <div className="mt-1 flex gap-1.5">
          <div className="flex-1">
            <div className="h-2.5 px-1 bg-white/10 border border-white/20 rounded-full text-[4px] font-bold inline-flex items-center">NOIR • DARK • 2024</div>
            <div className="mt-1 text-[10px] font-black leading-[0.9]">Noir luxury,<br/>midnight<br/>icon.</div>
            <div className="mt-1 h-3 px-2 bg-white text-black rounded-full text-[5px] font-bold flex items-center w-fit">Shop Dark →</div>
          </div>
          <div className="w-[44%] aspect-[4/5] rounded-[14px] overflow-hidden border border-white/10 bg-[#141414]"><img src={img2} className="w-full h-full object-cover" alt="" /></div>
        </div>
        <div className="mt-auto grid grid-cols-3 gap-1">{[img1,img2,img3].map((im,i)=><div key={i} className="aspect-square rounded-[5px] overflow-hidden bg-[#141414] border border-white/10"><img src={im} className="w-full h-full object-cover" alt="" /></div>)}</div>
      </div>
    )
  }

  if (id === 'sleek-editorial') {
    return (
      <div className="h-full w-full bg-[#FCFBF9] text-[#0A0A0A] p-1.5 flex flex-col overflow-hidden">
        <div className="h-2.5 bg-black text-white text-[4px] flex items-center justify-center font-bold tracking-[0.2em]">EDITORIAL • MINIMAL • LUXURY • FREE SHIPPING</div>
        <div className="mt-1 flex justify-between items-center"><div className="text-[6px] font-black tracking-[0.2em]">EDITORIAL • Studio <span className="ml-1 h-2 px-1 bg-black text-white rounded-full text-[3px]">PREMIUM • EDITORIAL</span></div><div className="w-2 h-2 bg-black rounded-full" /></div>
        <div className="mt-1 flex gap-1.5">
          <div className="flex-1">
            <div className="h-2.5 px-1 bg-white border rounded-full text-[4px] font-bold inline-flex items-center">MINIMAL • 2024</div>
            <div className="mt-1 text-[11px] font-black leading-[0.85] tracking-[-0.02em]">Cool and<br/>Aakif style</div>
            <div className="mt-1 text-[5px] text-black/50">Clean lines, intentional whitespace, premium finish.</div>
            <div className="mt-1 h-3 px-2 bg-black text-white rounded-full text-[5px] font-bold flex items-center w-fit">Shop Editorial →</div>
          </div>
          <div className="w-[44%] aspect-[4/5] rounded-[14px] overflow-hidden border bg-white"><img src={img1} className="w-full h-full object-cover" alt="" /></div>
        </div>
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
      <div className="flex-1 p-1.5 grid grid-cols-3 gap-1">
        {[img1,img2,img3].map((im,i)=> (
          <div key={i} className="rounded-[6px] overflow-hidden flex flex-col" style={{ background: card, border: `1px solid ${border}` }}>
            <div className="flex-1 overflow-hidden"><img src={im} className="w-full h-full object-cover" alt="" /></div>
            <div className="h-3 px-1 flex flex-col justify-center"><div className="h-0.5 w-full rounded" style={{ background: text, opacity: 0.3 }} /><div className="mt-0.5 h-0.5 w-2/3 rounded" style={{ background: accent }} /></div>
          </div>
        ))}
      </div>
      <div className="h-2.5 mx-1.5 mb-1.5 rounded-full" style={{ background: accent }} />
    </div>
  )
}


/* -------------------- EXTRA ICONS -------------------- */
const IconX = ({ c = '' }) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
const IconCopy = ({ c = '' }) => <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="12" height="12" rx="2.5" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>

/* -------------------- DESIGN TOKENS -------------------- */
const UI = {
  card: 'bg-white border border-zinc-200/80 rounded-2xl p-5 md:p-6',
  input: 'w-full h-11 px-3.5 rounded-xl border border-zinc-200/80 bg-white text-[13.5px] text-zinc-900 placeholder:text-zinc-400 outline-none transition-[border-color,box-shadow] focus:border-zinc-900 focus:ring-4 focus:ring-[#E8FF86]/70',
  chipMono: 'font-mono text-[11px] px-1.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200/80 text-zinc-700',
  focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF9]',
}
const BTN = 'relative overflow-hidden inline-flex items-center justify-center gap-2 shrink-0 rounded-full font-semibold tracking-[-0.01em] whitespace-nowrap cursor-pointer select-none transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF9]'
const BTN_DARK = `${BTN} dw-shine bg-[#0A0A0A] text-white hover:bg-zinc-800`
const BTN_LIGHT = `${BTN} bg-white text-zinc-900 border border-zinc-200/80 hover:bg-zinc-50 hover:border-zinc-300`
const BTN_LIME = `${BTN} dw-shine bg-[#E8FF86] text-black hover:brightness-95`

/* -------------------- SMALL PRIMITIVES -------------------- */
/* -------------------- SCALED PREVIEW (fixes cropped / mis-proportioned previews) -------------------- */
/* MiniStorefront is drawn with fixed px sizes for a ~240px-wide canvas. We lay it out at that
   design width and scale the whole thing to whatever box it lives in, so it never crops or stretches. */
function ScaledPreview({ theme, baseW = 240 }: { theme: any; baseW?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const s = box.w ? box.w / baseW : 0
  const baseH = s ? box.h / s : 0
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      {s > 0 && (
        <div style={{ width: baseW, height: baseH, transform: `scale(${s})`, transformOrigin: 'top left' }}>
          <MiniStorefront theme={theme} />
        </div>
      )}
    </div>
  )
}

/* -------------------- MOTION HELPERS -------------------- */
function CountUp({ value, duration = 800 }: { value: number; duration?: number }) {
  const [n, setN] = useState(0)
  const from = useRef(0)
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setN(value); from.current = value; return }
    const a = from.current
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const e = 1 - Math.pow(1 - p, 4)
      setN(Math.round(a + (value - a) * e))
      if (p < 1) raf = requestAnimationFrame(tick)
      else from.current = value
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return <>{n}</>
}

function Confetti() {
  const bits = Array.from({ length: 18 }, (_, i) => i)
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {bits.map(i => (
        <span
          key={i}
          className="dw-confetti"
          style={{ ['--a' as any]: `${(i / bits.length) * 360 + (i % 2 ? 11 : 0)}deg`, ['--d' as any]: `${78 + (i % 3) * 30}px`, animationDelay: `${180 + (i % 4) * 45}ms`, background: i % 3 === 0 ? '#ffffff' : '#E8FF86' }}
        />
      ))}
    </div>
  )
}

function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 mb-6 md:mb-8">
      <div className="min-w-0">
        <h1 className="text-[30px] md:text-[40px] font-extrabold tracking-[-0.03em] leading-[1.02]">{title}</h1>
        {subtitle && <p className="text-[13px] md:text-[14px] text-zinc-500 mt-2 max-w-xl leading-relaxed">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  )
}

function SectionHead({ title, meta, action }: { title: string; meta?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4 md:mb-5">
      <div className="flex items-baseline gap-2.5 min-w-0 flex-wrap">
        <h3 className="text-[15px] font-semibold tracking-[-0.02em]">{title}</h3>
        {meta && <span className="font-mono text-[11.5px] text-zinc-500">{meta}</span>}
      </div>
      {action}
    </div>
  )
}

function Field({ label, hint, className = '', children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[12px] font-medium text-zinc-600 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11.5px] text-zinc-400 mt-1.5">{hint}</span>}
    </label>
  )
}

function BrowserFrame({ url, tone = 'light', theme, tall = false }: { url: string; tone?: 'light' | 'dark'; theme: any; tall?: boolean }) {
  const dark = tone === 'dark'
  return (
    <div className={`rounded-xl overflow-hidden border ${dark ? 'border-white/10 bg-[#18181B] shadow-[0_28px_60px_-24px_rgba(0,0,0,0.9)]' : 'border-zinc-200/80 bg-white'}`}>
      <div className={`flex items-center gap-2 h-8 px-3 border-b ${dark ? 'border-white/10' : 'border-zinc-200/80 bg-zinc-50'}`}>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => <span key={i} className={`w-1.5 h-1.5 rounded-full ${dark ? 'bg-white/20' : 'bg-zinc-300'}`} />)}
        </div>
        <div className={`flex-1 min-w-0 truncate font-mono text-[10px] text-center ${dark ? 'text-white/45' : 'text-zinc-400'}`}>{url}</div>
        <div className="w-[22px]" />
      </div>
      <div className={`relative overflow-hidden ${tall ? 'aspect-[8/9]' : 'aspect-[4/3]'}`}><ScaledPreview theme={theme} baseW={tall ? 240 : 300} /></div>
    </div>
  )
}

function ThemeTile({ t, active, locked, label, lockPrice, onSelect }: { t: any; active: boolean; locked: boolean; label: string; lockPrice?: string; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      onMouseMove={(e) => {
        const el = e.currentTarget
        const r = el.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width
        const y = (e.clientY - r.top) / r.height
        el.style.setProperty('--ry', `${((x - 0.5) * 9).toFixed(2)}deg`)
        el.style.setProperty('--rx', `${((0.5 - y) * 9).toFixed(2)}deg`)
        el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`)
        el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`)
      }}
      onMouseLeave={(e) => { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg') }}
      className={`dw-tilt group relative text-left w-full bg-white rounded-2xl overflow-hidden border cursor-pointer ${UI.focus} ${active ? 'border-zinc-900 shadow-[0_0_0_1px_#0A0A0A,0_0_0_5px_#E8FF86]' : 'border-zinc-200/80 hover:border-zinc-400 hover:shadow-[0_22px_40px_-22px_rgba(10,10,10,0.35)]'}`}
    >
      <div className="aspect-[4/3] relative overflow-hidden border-b border-zinc-200/80">
        <ScaledPreview theme={t} />
        {locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 backdrop-blur-md bg-white/70">
            <div className="dw-lock w-9 h-9 rounded-xl bg-[#0A0A0A] flex items-center justify-center"><IconLock c="w-4 h-4 text-[#E8FF86]" /></div>
            <div className="text-[11.5px] font-semibold tracking-[-0.01em] text-zinc-900">Locked</div>
            {lockPrice && <div className="font-mono text-[10px] text-zinc-500">{lockPrice}</div>}
          </div>
        )}
      </div>
      <div className="p-3.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="font-semibold text-[13px] tracking-[-0.015em] truncate">{t.name}</div>
          <div className="text-[11.5px] text-zinc-400 mt-0.5 capitalize">{label}</div>
        </div>
        {active && !locked && (
          <span className="shrink-0 inline-flex items-center gap-1.5 h-5 px-2 rounded-full bg-[#E8FF86] text-black text-[10.5px] font-bold">
            <span className="w-1 h-1 rounded-full bg-black" />Active
          </span>
        )}
      </div>
    </button>
  )
}

const paymentStatusUI = (s: string) =>
  s === 'pending'
    ? { chip: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500 animate-pulse', label: 'Pending', right: 'Verifying', rightCls: 'text-zinc-500' }
    : s === 'approved'
      ? { chip: 'bg-[#0A0A0A] text-white border-[#0A0A0A]', dot: 'bg-[#E8FF86]', label: 'Approved', right: 'Active', rightCls: 'text-emerald-600' }
      : { chip: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', label: 'Rejected', right: 'Rejected', rightCls: 'text-red-600' }

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
      className="group bg-white border border-zinc-200/80 rounded-2xl overflow-hidden transition-all duration-200 hover:border-zinc-400 hover:shadow-[0_20px_40px_-22px_rgba(10,10,10,0.35)]"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="relative aspect-square bg-[#F4F4F2] overflow-hidden">
        {images.length > 1 && <img src={images[(idx - 1 + images.length) % images.length]} className="absolute inset-0 w-full h-full object-cover opacity-0" alt="" />}
        {images.length > 0 ? (
          <img src={images[idx]} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-[11px]">No image</div>
        )}
        {images.length > 1 && (
          <>
            <div className="absolute top-2.5 left-2.5 bg-black/55 backdrop-blur-md text-white font-mono text-[10px] px-2 h-6 rounded-full inline-flex items-center">
              {idx + 1}/{images.length}{hovering ? ' · auto' : ''}
            </div>
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_: any, i: number) => (
                <div key={i} className={`h-1 rounded-full transition-all ${i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`} />
              ))}
            </div>
          </>
        )}
        {imageLimit !== 999999 && images.length >= imageLimit && (
          <div className="absolute top-2.5 right-2.5 bg-amber-100 border border-amber-200 text-amber-800 text-[10px] px-2 h-6 inline-flex items-center rounded-full font-semibold">Max {imageLimit}</div>
        )}
      </div>
      <div className="p-4">
        <div className="font-semibold text-[13.5px] tracking-[-0.015em] truncate">{p.name}</div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="font-extrabold text-[15px] tracking-[-0.03em] tabular-nums">Rs. {Number(p.price).toLocaleString()}</span>
          <span className="font-mono text-[10.5px] text-zinc-400">{images.length} img</span>
        </div>
        <div className="mt-3.5 flex gap-1.5">
          <button type="button" onClick={() => onEdit(p)} className={`${BTN_DARK} flex-1 h-9 text-[12px]`}>Edit</button>
          <button type="button" aria-label="Delete product" onClick={() => onDelete(p.id)} className={`${BTN_LIGHT} w-9 h-9 !p-0 text-zinc-500 hover:!border-red-300 hover:!text-red-600 hover:!bg-red-50`}>
            <IconX c="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
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


  const sidebarNav = [
    { id: 'themes', label: 'Themes', Icon: IconThemes },
    { id: 'products', label: 'Products', Icon: IconProducts, badge: `${products.length}/${productLimit === 999999 ? '∞' : productLimit}` },
    { id: 'store', label: 'Store', Icon: IconStore },
    { id: 'analytics', label: 'Analytics', Icon: IconAnalytics, pro: !isPremium },
    { id: 'payments', label: 'Plans & Billing', Icon: IconBilling },
  ] as const

  /* ---------------- SHARED VIEW HELPERS ---------------- */
  const tabLabel: Record<string, string> = { themes: 'Themes', products: 'Products', store: 'Store', analytics: 'Analytics', payments: 'Plans & billing' }
  const mobileLabel: Record<string, string> = { themes: 'Themes', products: 'Products', store: 'Store', analytics: 'Analytics', payments: 'Plans' }
  const maxLabel = (n: number) => (n === 999999 ? '∞' : String(n))
  const productPct = productLimit === 999999 ? 3 : Math.min(100, (products.length / productLimit) * 100)
  const limitReached = products.length >= productLimit
  const activeIdx = Math.max(0, sidebarNav.findIndex(n => n.id === activeTab))

  const CurrentPlanButton = () => (
    <button
      type="button"
      onClick={() => setActiveTab('payments')}
      className={`flex items-center gap-2 h-9 pl-3 pr-3.5 rounded-full border border-zinc-200/80 bg-white cursor-pointer transition-colors hover:border-zinc-300 ${UI.focus}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isPremium ? 'bg-[#E8FF86] shadow-[0_0_0_3px_rgba(232,255,134,0.35),0_0_0_1px_#0A0A0A]' : isAdvanced ? 'bg-black' : 'bg-zinc-400'}`} />
      <span className="text-[12.5px] font-semibold tracking-[-0.01em]">{currentPlanDef.name}</span>
      <span className="text-[11px] text-zinc-400 font-mono hidden lg:inline">{maxLabel(productLimit)} products, {maxLabel(imageLimit)} img</span>
      {isPremium && <span className="bg-[#0A0A0A] text-[#E8FF86] text-[10px] px-2 h-[18px] rounded-full font-bold hidden md:inline-flex items-center">Live</span>}
    </button>
  )

  /* ---------------- THEMES PAGE ---------------- */
  const themesPage = (
    <div className="dw-page dw-stagger">
      <PageHeader
        title="Themes"
        subtitle={currentPlanId === 'basic' ? '3 of 8 Advanced themes unlocked. Premium is locked.'
          : currentPlanId === 'advanced' ? 'All 8 Advanced themes unlocked. Premium is locked.'
            : 'All themes unlocked.'}
        actions={
          <>
            {saved && (
              <span className="dw-pop h-10 px-3.5 inline-flex items-center gap-1.5 text-[12.5px] text-emerald-700 font-medium bg-emerald-50 rounded-full border border-emerald-200">
                <IconCheck c="w-3.5 h-3.5" /> Saved — {getTheme(theme).name}
              </span>
            )}
            <button type="button" onClick={saveStore} disabled={saving} className={`${BTN_DARK} h-10 px-5 text-[13px]`}>
              {saving ? 'Saving...' : 'Save & publish'}
            </button>
          </>
        }
      />

      {/* Active theme — the one bold moment on this screen */}
      <section
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
          e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
        }}
        className="dw-hero relative rounded-[28px] overflow-hidden mb-6 md:mb-8 bg-[#0A0A0A] text-white border border-zinc-900"
      >
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '20px 20px' }} />
        <div aria-hidden className="dw-aurora a" />
        <div aria-hidden className="dw-aurora b" />
        <div aria-hidden className="dw-spot" />
        <div className="relative grid md:grid-cols-[1fr_340px] gap-8 md:gap-10 p-6 md:p-10 items-center">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md text-[12px] font-medium text-white/80">
              <LiveDot /> Active theme
            </div>
            <h2 key={currentTheme.id} aria-label={currentTheme.name} className="mt-5 text-[40px] md:text-[60px] font-extrabold tracking-[-0.045em] leading-[0.95] [perspective:600px]">
              {String(currentTheme.name).split(' ').map((w: string, wi: number, arr: string[]) => (
                <span key={wi} aria-hidden className="inline-block whitespace-nowrap">
                  {Array.from(w).map((ch, i) => (
                    <span key={i} className="dw-char" style={{ animationDelay: `${(wi * 5 + i) * 28}ms` }}>{ch}</span>
                  ))}
                  {wi < arr.length - 1 ? '\u00A0' : ''}
                </span>
              ))}
            </h2>
            <div className="mt-4 flex items-center gap-2.5 flex-wrap">
              <span className="text-[12.5px] font-medium text-white/60">{currentTier} tier</span>
              <span className="font-mono text-[12px] text-[#E8FF86] bg-white/[0.06] border border-white/10 rounded-md px-2 py-0.5">/s/{slug || 'your-slug'}</span>
            </div>
            <div className="flex gap-2 mt-7 flex-wrap">
              <Link href={slug ? `/s/${slug}` : '#'} target="_blank" className={`${BTN} dw-shine h-10 px-5 bg-[#E8FF86] text-black text-[13px] no-underline hover:brightness-95`}>
                View live <IconExternal c="w-3.5 h-3.5" />
              </Link>
              <button type="button" onClick={saveStore} disabled={saving} className={`${BTN} h-10 px-5 bg-white/10 text-white border border-white/15 text-[13px] hover:bg-white/15 backdrop-blur-md`}>
                {saving ? 'Publishing...' : 'Republish'}
              </button>
            </div>
          </div>
          <div key={`frame-${currentTheme.id}`} className="dw-swap">
            <div className="dw-spin">
              <BrowserFrame tone="dark" url={`dukaanwhats.pk/s/${slug || 'your-slug'}`} theme={currentTheme} tall={premiumThemes.some(p => p.id === currentTheme.id)} />
            </div>
          </div>
        </div>
      </section>

      {/* Advanced */}
      <section className={`${UI.card} mb-4`}>
        <SectionHead
          title="Advanced"
          meta={currentPlanId === 'basic' ? `${basicAllowedAdvancedIds.length}/8 unlocked` : '8/8 unlocked'}
          action={currentPlanId === 'basic' ? (
            <button type="button" onClick={() => setActiveTab('payments')} className={`${BTN_LIGHT} h-8 px-3.5 text-[12px]`}>Unlock all</button>
          ) : undefined}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 p-1">
          {finalAdvancedList.map(t => (
            <ThemeTile
              key={t.id}
              t={t}
              active={theme === t.id}
              locked={isThemeLocked(t)}
              label="Advanced"
              lockPrice="Rs. 899/mo"
              onSelect={() => handleThemeClick(t)}
            />
          ))}
        </div>
      </section>

      {/* Standard */}
      {standardThemes.length > 0 && (
        <section className={`${UI.card} mb-4`}>
          <SectionHead title="Standard" meta="included with every plan" />
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 p-1">
            {standardThemes.slice(0, 6).map(t => (
              <ThemeTile
                key={t.id}
                t={t}
                active={theme === t.id}
                locked={false}
                label={String(t.category)}
                onSelect={() => handleThemeClick(t)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Premium glass */}
      <section className="rounded-2xl border border-zinc-900 overflow-hidden bg-white">
        <div className="px-5 md:px-6 py-4 md:py-5 bg-[#0A0A0A] text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-black text-[11px] font-bold px-2.5 h-6 rounded-full flex items-center bg-[#E8FF86]">Premium</span>
            <span className="font-semibold text-[15px] tracking-[-0.02em]">Glass collection</span>
            <span className="text-[12px] text-white/40 hidden md:inline">Animated showcase themes</span>
          </div>
          <span className="bg-white/10 border border-white/15 backdrop-blur-md text-white text-[12px] px-3 h-7 rounded-full font-medium inline-flex items-center gap-1.5">
            {isPremium ? <><IconCheck c="w-3 h-3 text-[#E8FF86]" /> All unlocked</> : <>Locked <span className="font-mono text-white/50">Rs. 2999/mo</span></>}
          </span>
        </div>
        <div className="bg-[#FAFAF9] relative">
          <div className="glass-container">
            {premiumThemes.map((t, i) => {
              const isActive = theme === t.id
              const locked = isThemeLocked(t)
              const r = isActive ? 0 : GLASS_TILTS[i % GLASS_TILTS.length]
              const styleObj: any = { '--r': r, '--i': i, scrollSnapAlign: 'start' }
              return (
                <div
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  aria-label={t.name}
                  className={`glass ${isActive ? 'selected' : ''}`}
                  data-text={t.name}
                  style={styleObj}
                  onClick={() => handleThemeClick(t)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleThemeClick(t) } }}
                >
                  <div className="relative w-[88%] h-[256px] rounded-2xl overflow-hidden border border-black/[0.06] mt-4">
                    <ScaledPreview theme={t} />
                  </div>
                  {isActive && <div className="absolute top-3 right-3 w-7 h-7 bg-[#E8FF86] text-black rounded-full flex items-center justify-center shadow-lg"><IconCheck c="w-3.5 h-3.5" /></div>}
                  {locked && (
                    <div className="glass-lock-overlay">
                      <div className="dw-lock w-12 h-12 rounded-2xl bg-[#0A0A0A] flex items-center justify-center shadow-xl"><IconLock c="w-6 h-6 text-[#E8FF86]" /></div>
                      <div className="text-[12px] font-semibold text-zinc-900 mt-1">Premium</div>
                      <div className="font-mono text-[10px] text-zinc-500 text-center leading-tight">Rs. 2999/mo</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="hidden md:flex absolute bottom-3 inset-x-0 justify-center pointer-events-none text-[10.5px] font-mono text-black/35">← scroll →</div>
        </div>
      </section>

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
    <div className="dw-page dw-stagger">
      <PageHeader
        title="Products"
        subtitle={`${products.length} of ${productLimit === 999999 ? '∞' : productLimit} used, ${imageLimit === 999999 ? 'unlimited' : imageLimit} image${imageLimit !== 1 ? 's' : ''} per product`}
      />

      {/* Usage strip */}
      <div className="grid grid-cols-3 divide-x divide-zinc-200/80 bg-white border border-zinc-200/80 rounded-2xl mb-5">
        <div className="p-4 md:p-5">
          <div className="text-[12px] text-zinc-500 font-medium">Products</div>
          <div className="mt-1 text-[22px] md:text-[28px] font-extrabold tracking-[-0.035em] tabular-nums leading-none">
            <CountUp value={products.length} /><span className="text-zinc-300 font-semibold">/{maxLabel(productLimit)}</span>
          </div>
          <div className="mt-3 h-1 rounded-full bg-zinc-100 overflow-hidden">
            <div className={`dw-grow h-full rounded-full transition-all duration-500 ${limitReached ? 'bg-red-500' : 'bg-[#0A0A0A]'}`} style={{ width: `${productPct}%` }} />
          </div>
        </div>
        <div className="p-4 md:p-5">
          <div className="text-[12px] text-zinc-500 font-medium">Images each</div>
          <div className="mt-1 text-[22px] md:text-[28px] font-extrabold tracking-[-0.035em] tabular-nums leading-none">{imageLimit === 999999 ? '∞' : <CountUp value={imageLimit} />}</div>
          <div className="mt-3 text-[11.5px] text-zinc-400">{currentPlanDef.name} plan</div>
        </div>
        <div className="p-4 md:p-5">
          <div className="text-[12px] text-zinc-500 font-medium">Remaining</div>
          {limitReached ? (
            <span className="mt-1.5 inline-flex items-center h-7 px-2.5 rounded-full bg-red-500 text-white text-[11px] font-bold">Limit reached</span>
          ) : (
            <div className="mt-1 text-[22px] md:text-[28px] font-extrabold tracking-[-0.035em] tabular-nums leading-none">
              {productLimit === 999999 ? '∞' : <CountUp value={productLimit - products.length} />}
              <span className="text-zinc-300 font-semibold text-[14px] md:text-[16px] ml-1">left</span>
            </div>
          )}
          <div className="mt-3 text-[11.5px] text-zinc-400">{limitReached ? 'Upgrade to add more' : 'before upgrade'}</div>
        </div>
      </div>

      {/* Editor */}
      <div className={`${UI.card} mb-6`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold tracking-[-0.02em]">{editingId ? 'Edit product' : 'New product'}</h3>
          {editingId && <button type="button" onClick={cancelEdit} className="text-[12px] font-semibold text-zinc-500 hover:text-black bg-transparent border-none cursor-pointer">Cancel edit</button>}
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          <label className="group/drop block self-start rounded-2xl border border-dashed border-zinc-300 bg-[#FAFAF9] p-4 cursor-pointer hover:border-zinc-900 hover:bg-white transition-colors focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-2">
            <input type="file" accept="image/*" multiple onChange={handleFile} className="sr-only" />
            {previews.length ? (
              <div className="grid grid-cols-3 gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative group/img">
                    <img src={src} alt="" className="w-full aspect-square object-cover rounded-xl border border-zinc-200/80" />
                    <button type="button" aria-label="Remove image" onClick={(e) => { e.preventDefault(); removeFileAt(i) }} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#0A0A0A] text-white rounded-full opacity-100 md:opacity-0 md:group-hover/img:opacity-100 transition-opacity border-none cursor-pointer flex items-center justify-center">
                      <IconX c="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
                <div className="aspect-square rounded-xl border border-dashed border-zinc-300 bg-white flex flex-col items-center justify-center group-hover/drop:border-zinc-900 transition-colors">
                  <IconPlus c="w-4 h-4 text-zinc-400" />
                  <span className="text-[10.5px] font-medium mt-1 text-zinc-400">Add</span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#0A0A0A] mx-auto flex items-center justify-center mb-3.5"><IconUpload c="w-5 h-5 text-[#E8FF86]" /></div>
                <div className="font-semibold text-[13.5px] tracking-[-0.015em]">Drop images or click to upload</div>
                <div className="text-[11.5px] text-zinc-500 mt-1">PNG, JPG, WEBP, up to 5MB each</div>
                <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap">
                  {[['basic', 'Basic', '1'], ['advanced', 'Advanced', '5'], ['premium', 'Premium', '∞']].map(([id, n, v]) => (
                    <span key={id} className={`font-mono text-[10.5px] px-2 h-6 rounded-full inline-flex items-center border ${currentPlanId === id ? 'bg-[#E8FF86] border-[#E8FF86] text-black font-semibold' : 'bg-white border-zinc-200/80 text-zinc-500'}`}>{n} {v}</span>
                  ))}
                </div>
              </div>
            )}
          </label>

          <div className="grid md:grid-cols-2 gap-x-3.5 gap-y-4 content-start">
            <Field label="Product name *" className="md:col-span-2">
              <input placeholder="Linen kurta" value={prodName} onChange={e => setProdName(e.target.value)} className={UI.input} />
            </Field>
            <Field label="Price *">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[12px] text-zinc-400 pointer-events-none">Rs.</span>
                <input placeholder="3500" type="number" value={prodPrice} onChange={e => setProdPrice(e.target.value)} className={`${UI.input} !pl-11 tabular-nums`} />
              </div>
            </Field>
            <Field label="Compare price (optional)">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[12px] text-zinc-400 pointer-events-none">Rs.</span>
                <input placeholder="4500" type="number" value={prodOrigPrice} onChange={e => setProdOrigPrice(e.target.value)} className={`${UI.input} !pl-11 tabular-nums`} />
              </div>
            </Field>
            <Field label="Category">
              <select value={prodCategory} onChange={e => setProdCategory(e.target.value)} className={UI.input}>
                <option>General</option><option>Clothing</option><option>Shoes</option><option>Bags</option><option>Beauty</option><option>Electronics</option><option>Food</option><option>Other</option>
              </select>
            </Field>
            <Field label="Stock quantity">
              <input placeholder="100" type="number" value={prodStock} onChange={e => setProdStock(e.target.value)} className={`${UI.input} tabular-nums`} />
            </Field>
            <Field label="Sizes" hint="Comma separated">
              <input placeholder="S, M, L, XL" value={prodSizes} onChange={e => setProdSizes(e.target.value)} className={UI.input} />
            </Field>
            <Field label="Colors" hint="Comma separated">
              <input placeholder="Black, White, Red" value={prodColors} onChange={e => setProdColors(e.target.value)} className={UI.input} />
            </Field>
            <Field label="Description" className="md:col-span-2">
              <textarea placeholder="Materials, fit, care instructions..." value={prodDesc} onChange={e => setProdDesc(e.target.value)} className={`${UI.input} !h-auto min-h-[96px] py-3 resize-none`} />
            </Field>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-5 border-t border-zinc-200/80">
          {editingId && <button type="button" onClick={cancelEdit} className={`${BTN_LIGHT} h-10 px-5 text-[13px]`}>Cancel</button>}
          <button
            type="button"
            onClick={addProduct}
            disabled={uploading || (!editingId && products.length >= productLimit)}
            className={`${BTN_DARK} h-10 px-6 text-[13px]`}
          >
            {uploading ? 'Uploading...' : !editingId && products.length >= productLimit ? `Limit ${productLimit === 999999 ? '∞' : productLimit} — Upgrade` : `${editingId ? 'Update' : 'Add'} product`}
          </button>
        </div>
      </div>

      <div className="dw-sg grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {products.length === 0 ? (
          <div className="col-span-2 md:col-span-3 lg:col-span-4 bg-white border border-dashed border-zinc-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#0A0A0A] flex items-center justify-center mb-3.5"><IconProducts c="w-5 h-5 text-[#E8FF86]" /></div>
            <div className="font-semibold text-[15px] tracking-[-0.02em]">No products yet</div>
            <div className="text-[12.5px] text-zinc-500 mt-1">Add your first product above. {productLimit === 999999 ? 'Unlimited' : productLimit} allowed on {currentPlanDef.name}.</div>
          </div>
        ) : products.map(p => (
          <PremiumProductCard key={p.id} p={p} imageLimit={imageLimit} onEdit={startEdit} onDelete={deleteProduct} />
        ))}
      </div>
    </div>
  )

  /* ---------------- STORE PAGE ---------------- */
  const storePage = (
    <div className="dw-page dw-stagger">
      <PageHeader
        title="Store"
        subtitle="How customers see and reach your business."
        actions={<button type="button" onClick={saveStore} disabled={saving} className={`${BTN_DARK} h-10 px-5 text-[13px]`}>{saving ? 'Saving...' : saved ? 'Saved' : 'Save changes'}</button>}
      />

      <div className="grid lg:grid-cols-[1fr_340px] gap-4">
        <div className={`${UI.card} space-y-5`}>
          <Field label="Business name">
            <input value={businessName} onChange={e => setBusinessName(e.target.value)} className={UI.input} />
          </Field>
          <Field label="WhatsApp number" hint="Include country code, no spaces (e.g. 923001234567)">
            <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="923001234567" className={`${UI.input} font-mono`} />
          </Field>
          <Field label="Store URL">
            <div className="flex items-center rounded-xl border border-zinc-200/80 overflow-hidden bg-white transition-[border-color,box-shadow] focus-within:border-zinc-900 focus-within:ring-4 focus-within:ring-[#E8FF86]/70">
              <span className="pl-3.5 pr-3 mr-2.5 self-stretch flex items-center text-[12.5px] text-zinc-400 font-mono shrink-0 bg-zinc-50 border-r border-zinc-200/80">dukaanwhats.pk/s/</span>
              <input value={slug} onChange={e => setSlug(e.target.value)} className="flex-1 min-w-0 h-11 pr-3.5 bg-transparent text-[13.5px] font-mono outline-none border-none" />
            </div>
          </Field>
          <div className="flex gap-2 pt-1 flex-wrap">
            <button type="button" onClick={copyLink} className={`${BTN_LIGHT} h-10 px-5 text-[13px]`}>
              {copied ? <><IconCheck c="w-3.5 h-3.5" /> Copied</> : <><IconCopy c="w-3.5 h-3.5" /> Copy link</>}
            </button>
            <Link href={slug ? `/s/${slug}` : '#'} target="_blank" className={`${BTN_LIGHT} h-10 px-5 text-[13px] no-underline`}>Preview <IconExternal c="w-3 h-3" /></Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className={UI.card}>
            <div className="text-[12px] font-medium text-zinc-500">Current plan</div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[26px] font-extrabold tracking-[-0.035em] leading-none">{currentPlanDef.name}</span>
              {currentPlanId === 'advanced' && <span className="text-[10.5px] font-bold px-2 h-5 inline-flex items-center rounded-full text-black bg-[#E8FF86]">Popular</span>}
            </div>
            <ul className="mt-4 space-y-2">
              {currentPlanDef.features.slice(0, 3).map(f => (
                <li key={f} className="flex items-center gap-2 text-[12.5px] text-zinc-600"><IconCheck c="w-3 h-3 text-zinc-900 shrink-0" />{f}</li>
              ))}
            </ul>
            {!isPremium && <button type="button" onClick={() => setActiveTab('payments')} className={`${BTN_DARK} mt-5 w-full h-10 text-[13px]`}>Upgrade plan</button>}
          </div>
          <div className={UI.card}>
            <div className="text-[12px] font-medium text-zinc-500 mb-3">Store preview</div>
            <BrowserFrame url={`dukaanwhats.pk/s/${slug || 'your-slug'}`} theme={currentTheme} tall={premiumThemes.some(p => p.id === currentTheme.id)} />
          </div>
        </div>
      </div>
    </div>
  )

  /* ---------------- ANALYTICS PAGE ---------------- */
  const analyticsPage = (
    <div className="dw-page dw-stagger">
      <PageHeader title="Analytics" subtitle="Real-time store performance." />
      {!profile ? (
        <div className="p-8 text-center text-zinc-500 text-[13px]">Loading analytics...</div>
      ) : currentPlanId === 'premium' ? (
        <RealAnalytics userId={profile.id} currentPlanId={currentPlanId} />
      ) : (
        <div className={`${UI.card} relative overflow-hidden min-h-[440px]`}>
          <div aria-hidden className="grid grid-cols-2 md:grid-cols-4 gap-3 blur-[3px] opacity-60 select-none pointer-events-none">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="rounded-xl border border-zinc-200/80 p-4">
                <div className="h-2 w-14 rounded bg-zinc-200" />
                <div className="h-6 w-20 rounded bg-zinc-900/80 mt-3" />
                <div className="h-9 mt-4 rounded bg-zinc-100" />
              </div>
            ))}
            <div className="col-span-2 md:col-span-4 h-32 rounded-xl border border-zinc-200/80 bg-zinc-50" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-5">
            <div className="w-full max-w-[420px] rounded-2xl border border-zinc-200/80 bg-white/85 backdrop-blur-md p-6 md:p-7 text-center shadow-[0_24px_60px_-28px_rgba(10,10,10,0.4)]">
              <div className="w-12 h-12 rounded-2xl bg-[#0A0A0A] flex items-center justify-center mx-auto">
                <IconAnalytics c="w-6 h-6 text-[#E8FF86]" />
              </div>
              <h3 className="font-extrabold text-[22px] tracking-[-0.03em] mt-4">Analytics is Premium</h3>
              <p className="text-[13px] text-zinc-500 mt-2 leading-relaxed">
                You&apos;re on <b className="text-black font-semibold">{currentPlanDef.name}</b>. Upgrade to Premium to unlock real-time visitors, orders, conversion rate and revenue insights.
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center mt-4">
                {['Live Visitors', 'Conversion Rate', 'Revenue', 'Orders', 'Traffic Sources', 'Retention'].map(f => (
                  <span key={f} className="text-[11px] font-medium bg-zinc-100 border border-zinc-200/80 px-2.5 h-6 rounded-full flex items-center text-zinc-600">{f}</span>
                ))}
              </div>
              <button type="button" onClick={() => setActiveTab('payments')} className={`${BTN_DARK} mt-6 h-11 px-7 text-[13px]`}>
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  /* ---------------- PAYMENTS PAGE ---------------- */
  const paymentsPage = (
    <div className="dw-page dw-stagger">
      <PageHeader title="Plans & billing" subtitle={`You are on ${currentPlanDef.name}.`} />

      {myPayments.length > 0 && (
        <div className={`${UI.card} mb-4`}>
          <SectionHead
            title="Payment history"
            action={myPayments.filter((p: any) => p.status === 'pending').length > 0 ? (
              <span className="text-[11.5px] font-medium bg-amber-50 border border-amber-200 text-amber-800 px-2.5 h-6 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                {myPayments.filter((p: any) => p.status === 'pending').length} pending
              </span>
            ) : undefined}
          />
          <div className="divide-y divide-zinc-200/80 border border-zinc-200/80 rounded-xl overflow-hidden">
            {myPayments.slice(0, 5).map((p: any) => {
              const s = paymentStatusUI(p.status)
              return (
                <div key={p.id} className="flex items-center justify-between gap-3 bg-[#FAFAF9] p-3.5">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className={`shrink-0 h-6 px-2.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border ${s.chip}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold tracking-[-0.01em]">{p.plan_id.toUpperCase()}</span>
                        <span className="text-[12.5px] font-medium text-zinc-600 tabular-nums">Rs. {p.amount}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={UI.chipMono}>{p.txn_id}</span>
                        <span className="font-mono text-[10.5px] text-zinc-400 hidden md:inline">{new Date(p.created_at).toLocaleDateString()} · Till {p.till_id}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`text-[12px] font-semibold shrink-0 text-right ${s.rightCls}`}>{s.right}</div>
                </div>
              )
            })}
          </div>
          {justSubmitted && justSubmitted.status === 'pending' && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
              <span className="w-2 h-2 mt-1.5 bg-amber-500 rounded-full animate-pulse shrink-0" />
              <div>
                <div className="text-[13px] font-semibold text-amber-900">Payment submitted — pending verification</div>
                <div className="text-[12px] text-amber-800/80 mt-0.5 leading-[1.55]">
                  Verifying Txn ID <span className="font-mono bg-white px-1.5 py-0.5 rounded-md border border-amber-200">{justSubmitted.txn_id}</span>. WhatsApp notification within 1 hour.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={UI.card}>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="text-[17px] font-extrabold tracking-[-0.025em]">Pay to JazzCash Till <span className="font-mono font-medium text-zinc-400">{TILL_ID}</span></h3>
            <p className="text-[12.5px] text-zinc-500 mt-1">Send payment, then submit the Transaction ID.</p>
          </div>
          <div role="group" aria-label="Billing period" className="flex bg-zinc-100 border border-zinc-200/80 rounded-full p-1 gap-1">
            <button type="button" aria-pressed={billing === 'monthly'} onClick={() => setBilling('monthly')} className={`h-8 px-4 rounded-full text-[12.5px] font-semibold border-none cursor-pointer transition-all ${billing === 'monthly' ? 'bg-[#0A0A0A] text-white' : 'bg-transparent text-zinc-500 hover:text-zinc-900'}`}>Monthly</button>
            <button type="button" aria-pressed={billing === 'yearly'} onClick={() => setBilling('yearly')} className={`h-8 px-4 rounded-full text-[12.5px] font-semibold border-none cursor-pointer transition-all flex items-center gap-1.5 ${billing === 'yearly' ? 'bg-[#0A0A0A] text-white' : 'bg-transparent text-zinc-500 hover:text-zinc-900'}`}>
              Yearly <span className="text-[10px] px-1.5 py-0.5 rounded-full text-black font-bold bg-[#E8FF86]">-22%</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-5">
          <div className="bg-[#0A0A0A] text-white rounded-2xl p-5 relative overflow-hidden self-start">
            <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '18px 18px' }} />
            <div className="relative">
              <div className="flex justify-between items-center mb-3">
                <div className="text-[12px] font-medium text-white/55">JazzCash till</div>
                <button type="button" onClick={copyTill} className="h-7 px-3 bg-white/10 border border-white/10 backdrop-blur-md rounded-full text-[11.5px] font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer inline-flex items-center gap-1.5">
                  {copiedTill ? <><IconCheck c="w-3 h-3 text-[#E8FF86]" /> Copied</> : <><IconCopy c="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <div className="bg-white/[0.06] border border-white/[0.08] rounded-xl p-4">
                <div className="text-[11px] text-white/40">Till ID</div>
                <div className="text-[28px] font-semibold font-mono tracking-[0.04em] text-[#E8FF86] mt-0.5">{TILL_ID}</div>
              </div>
              <div className="mt-3 bg-white rounded-xl p-3">
                <img src={`https://barcodeapi.org/api/code128/${TILL_ID}`} alt="Barcode" className="w-full h-[40px] object-contain" />
                <div className="text-center text-[10.5px] font-mono text-black font-semibold tracking-[0.3em] mt-1">{TILL_ID}</div>
              </div>
              <div className="mt-3 bg-white rounded-xl p-2.5 flex justify-center">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=JAZZCASH_TILL_${TILL_ID}`} alt="QR" className="w-[100px] h-[100px]" />
              </div>
            </div>
          </div>

          <div role="radiogroup" aria-label="Choose a plan" className="space-y-3">
            {plans.map(p => {
              const displayPrice = getDisplayPrice(p)
              const isCurrent = currentPlanId === p.id
              const isSelected = selectedPlan?.id === p.id
              return (
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  key={p.id}
                  onClick={() => setSelectedPlan(p)}
                  className={`w-full text-left rounded-2xl border p-4 md:p-5 transition-all cursor-pointer bg-white ${UI.focus} ${isSelected ? 'border-zinc-900 shadow-[0_0_0_1px_#0A0A0A,0_0_0_5px_#E8FF86]' : isCurrent ? 'border-zinc-400 bg-[#FAFAF9]' : 'border-zinc-200/80 hover:border-zinc-400'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <span className={`mt-1 w-4 h-4 rounded-full border grid place-items-center shrink-0 transition-colors ${isSelected ? 'border-zinc-900 bg-[#0A0A0A]' : 'border-zinc-300 bg-white'}`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#E8FF86]" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-[16px] tracking-[-0.025em]">{p.name}</span>
                          {isCurrent && <span className="bg-[#0A0A0A] text-white text-[10px] px-2 h-[18px] rounded-full font-semibold flex items-center">Current</span>}
                          {p.id === 'advanced' && <span className="text-black text-[10px] px-2 h-[18px] rounded-full font-bold flex items-center bg-[#E8FF86]">Popular</span>}
                        </div>
                        <ul className="mt-3 grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
                          {p.features.map(f => (
                            <li key={f} className="flex items-center gap-2 text-[12px] text-zinc-600"><IconCheck c="w-3 h-3 text-zinc-900 shrink-0" />{f}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-[18px] tracking-[-0.035em] tabular-nums">Rs. {displayPrice}</div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{billing === 'yearly' && p.yearlyTotal > 0 ? `Rs. ${p.yearlyTotal.toLocaleString()}/yr` : '/month'}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {selectedPlan && selectedPlan.monthly > 0 && (
          <div className="mt-5 rounded-2xl border border-zinc-900 bg-white p-5 md:p-6 shadow-[0_0_0_5px_rgba(232,255,134,0.55)]">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-8 h-8 rounded-full bg-[#0A0A0A] text-[#E8FF86] flex items-center justify-center text-[12px] font-bold">₨</div>
              <div className="text-[14px] font-semibold tracking-[-0.015em]">Pay Rs. {(billing === 'monthly' ? selectedPlan.monthly : selectedPlan.yearlyTotal).toLocaleString()} to Till <span className="font-mono">{TILL_ID}</span></div>
              <span className="ml-auto text-[11px] font-semibold bg-zinc-100 border border-zinc-200/80 text-zinc-700 px-2.5 h-6 rounded-full flex items-center capitalize">{billing}</span>
            </div>
            <div className="mt-4">
              <Field label="Transaction ID" hint="Find it in the JazzCash confirmation SMS.">
                <input
                  value={txnId}
                  onChange={e => setTxnId(e.target.value)}
                  placeholder="Enter Transaction ID from JazzCash SMS"
                  className={`${UI.input} font-mono !text-[13px]`}
                />
              </Field>
            </div>
            <button
              type="button"
              onClick={handleBuyPlan}
              disabled={purchasing}
              className={`${BTN_DARK} mt-4 w-full h-11 text-[13px]`}
            >
              {purchasing ? 'Submitting...' : `I Paid — Activate ${selectedPlan.name}`}
            </button>
          </div>
        )}
      </div>
    </div>
  )

  /* ---------------- LAYOUT ---------------- */
  return (
    <div className="dw-root min-h-screen bg-[#FAFAF9] text-zinc-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap');
        .dw-root { font-family: 'Inter Tight', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
        .dw-root input, .dw-root select, .dw-root textarea, .dw-root button { font-family: inherit; }
        .dw-root .font-mono { font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-variant-numeric: tabular-nums; }
        .dw-root .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .dw-root .no-scrollbar::-webkit-scrollbar { display: none; }
        /* ---------- motion system ---------- */
        @keyframes dwRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        .dw-stagger > * { animation: dwRise 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .dw-stagger > *:nth-child(2) { animation-delay: 0.07s; }
        .dw-stagger > *:nth-child(3) { animation-delay: 0.14s; }
        .dw-stagger > *:nth-child(4) { animation-delay: 0.21s; }
        .dw-stagger > *:nth-child(n+5) { animation-delay: 0.28s; }
        @supports (animation-timeline: view()) {
          .dw-stagger > *:nth-child(n+4) { animation: dwRise linear both; animation-timeline: view(); animation-range: entry 0% entry 38%; }
        }
        ${Array.from({ length: 12 }, (_, i) => `.dw-sg > *:nth-child(${i + 1}) { animation: dwRise 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) ${0.12 + i * 0.05}s both; }`).join('\n        ')}

        @keyframes dwChar { from { opacity: 0; transform: translateY(0.55em) rotateX(-55deg); filter: blur(8px); } to { opacity: 1; transform: none; filter: none; } }
        .dw-char { display: inline-block; animation: dwChar 0.75s cubic-bezier(0.2, 0.9, 0.2, 1) both; transform-origin: 50% 100%; }
        @keyframes dwSwap { from { opacity: 0; transform: translateY(10px) scale(0.95); filter: blur(10px); } to { opacity: 1; transform: none; filter: none; } }
        .dw-swap { animation: dwSwap 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s both; }

        @keyframes dwSpin { to { transform: rotate(1turn); } }
        .dw-spin { position: relative; padding: 1px; border-radius: 13px; overflow: hidden; background: rgba(255,255,255,0.08); }
        .dw-spin::before { content: ''; position: absolute; inset: -100%; background: conic-gradient(from 0deg, transparent 0 70%, rgba(232,255,134,0.95) 86%, transparent 100%); animation: dwSpin 6s linear infinite; }
        .dw-spin > * { position: relative; }

        @keyframes dwDrift { to { transform: translate3d(-70px, 46px, 0) scale(1.18); } }
        .dw-aurora { position: absolute; border-radius: 9999px; filter: blur(80px); pointer-events: none; }
        .dw-aurora.a { width: 340px; height: 340px; background: #E8FF86; opacity: 0.16; top: -130px; right: -50px; animation: dwDrift 16s ease-in-out infinite alternate; }
        .dw-aurora.b { width: 300px; height: 300px; background: #ffffff; opacity: 0.07; bottom: -160px; left: 18%; animation: dwDrift 22s ease-in-out infinite alternate-reverse; }
        .dw-spot { position: absolute; inset: 0; pointer-events: none; opacity: 0; transition: opacity 0.4s; background: radial-gradient(460px circle at var(--mx, 70%) var(--my, 30%), rgba(232,255,134,0.13), transparent 60%); }
        .dw-hero:hover .dw-spot { opacity: 1; }

        .dw-root .dw-tilt { transform: perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateY(var(--ty, 0px)); transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s, border-color 0.2s; will-change: transform; }
        .dw-root .dw-tilt:hover { --ty: -5px; }
        .dw-tilt::after { content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0; transition: opacity 0.3s; background: radial-gradient(260px circle at var(--gx, 50%) var(--gy, 50%), rgba(232,255,134,0.32), transparent 62%); }
        .dw-tilt:hover::after { opacity: 1; }

        .dw-shine::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.32) 50%, transparent 70%); transform: translateX(-120%); transition: transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .dw-shine:hover::after { transform: translateX(120%); }

        @keyframes dwGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .dw-grow { transform-origin: left; animation: dwGrow 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) 0.25s both; }
        @keyframes dwWiggle { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-12deg) scale(1.06); } 60% { transform: rotate(9deg) scale(1.06); } }
        .group:hover .dw-lock { animation: dwWiggle 0.55s ease; }

        @keyframes dwToast { from { opacity: 0; transform: translateY(18px) scale(0.96); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }
        .dw-toast { animation: dwToast 0.42s cubic-bezier(0.2, 0.9, 0.25, 1.1) both; }
        @keyframes dwFade { from { opacity: 0; } to { opacity: 1; } }
        .dw-fade { animation: dwFade 0.25s ease both; }
        @keyframes dwPop { from { opacity: 0; transform: translateY(26px) scale(0.93); } to { opacity: 1; transform: none; } }
        .dw-pop { animation: dwPop 0.5s cubic-bezier(0.2, 0.9, 0.25, 1.1) both; }
        @keyframes dwDraw { to { stroke-dashoffset: 0; } }
        .dw-draw polyline { stroke-dasharray: 30; stroke-dashoffset: 30; animation: dwDraw 0.5s ease-out 0.35s forwards; }
        @keyframes dwRing { from { opacity: 0.7; transform: scale(0.9); } to { opacity: 0; transform: scale(2.1); } }
        .dw-ring { animation: dwRing 1.3s ease-out 0.25s 2 both; }
        @keyframes dwBurst { 0% { opacity: 1; transform: rotate(var(--a)) translateX(0) scale(1); } 100% { opacity: 0; transform: rotate(var(--a)) translateX(var(--d)) scale(0.35); } }
        .dw-confetti { position: absolute; width: 6px; height: 6px; border-radius: 2px; opacity: 0; animation: dwBurst 0.95s cubic-bezier(0.15, 0.8, 0.3, 1) both; }

        .glass-container { position: relative; display: flex; justify-content: flex-start; align-items: center; min-height: 480px; padding: 76px 56px 84px 96px; gap: 0; overflow-x: auto; overflow-y: visible; scroll-snap-type: x proximity; -webkit-overflow-scrolling: touch; }
        .glass-container::-webkit-scrollbar { height: 5px; }
        .glass-container::-webkit-scrollbar-thumb { background: rgba(10,10,10,0.12); border-radius: 999px; }
        .glass-container .glass { position: relative; width: 260px; height: 340px; flex-shrink: 0; background: rgba(255,255,255,0.9); border: 1px solid rgba(10,10,10,0.08); box-shadow: 0 20px 50px rgba(10,10,10,0.08), 0 1px 0 rgba(255,255,255,1) inset; display: flex; justify-content: flex-start; align-items: center; flex-direction: column; transition: all 0.55s cubic-bezier(0.23,1,0.32,1); border-radius: 20px; margin: 0 -36px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); transform: rotate(calc(var(--r) * 1deg)) translateY(0); cursor: pointer; overflow: hidden; outline: none; animation: dwDrop 0.85s cubic-bezier(0.2, 0.9, 0.2, 1) calc(var(--i, 0) * 75ms) backwards; }
        @keyframes dwDrop { from { opacity: 0; transform: translateY(54px) rotate(calc(var(--r) * 1deg)) scale(0.9); } }
        @keyframes dwHalo { 0%, 100% { box-shadow: 0 32px 80px rgba(10,10,10,0.25), 0 0 0 5px #E8FF86; } 50% { box-shadow: 0 32px 80px rgba(10,10,10,0.25), 0 0 0 10px rgba(232,255,134,0.4); } }
        .glass-container .glass::after { content: ''; position: absolute; inset: 0; z-index: 5; pointer-events: none; background: linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%); transform: translateX(-130%); transition: transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .glass-container .glass:hover::after { transform: translateX(130%); }
        .glass-container .glass:hover, .glass-container .glass:focus-visible { transform: rotate(0deg) translateY(-12px) scale(1.05); margin: 0 20px; box-shadow: 0 32px 80px rgba(10,10,10,0.16), 0 0 0 1px rgba(10,10,10,0.06); z-index: 10; background: #fff; }
        .glass-container .glass:focus-visible { box-shadow: 0 0 0 2px #0A0A0A, 0 0 0 5px #E8FF86; }
        .glass-container .glass::before { content: attr(data-text); position: absolute; bottom: 0; width: 100%; height: 46px; background: #fff; border-top: 1px solid rgba(10,10,10,0.06); display: flex; justify-content: center; align-items: center; color: #0A0A0A; font-size: 13px; font-weight: 600; letter-spacing: -0.015em; }
        .glass-container .glass.selected { background: #0A0A0A; border: 1px solid #0A0A0A; transform: rotate(0deg) translateY(-16px) scale(1.07); margin: 0 24px; z-index: 20; box-shadow: 0 32px 80px rgba(10,10,10,0.25), 0 0 0 5px #E8FF86; animation: dwDrop 0.85s cubic-bezier(0.2, 0.9, 0.2, 1) calc(var(--i, 0) * 75ms) backwards, dwHalo 2.8s ease-in-out 1.3s infinite; }
        .glass-container .glass.selected::before { background: #0A0A0A; color: #fff; border-top: 1px solid rgba(255,255,255,0.1); }
        .glass-lock-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.8); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; z-index: 10; border-radius: 20px; }
        @media (max-width: 768px) {
          .glass-container .glass { width: 190px; height: 260px; margin: 0 -22px; }
          .glass-container { min-height: 400px; padding: 56px 48px 64px 56px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dw-root *, .dw-root *::before, .dw-root *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }
        }
      `}</style>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0A0A0A] text-white fixed inset-y-0 left-0 z-40 border-r border-white/[0.06]">
        <div className="px-5 pt-6 pb-5 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-3 no-underline text-inherit">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-[15px] text-black bg-[#E8FF86]">D</div>
            <div>
              <div className="font-bold text-[15px] tracking-[-0.025em] leading-none">DukaanWhats</div>
              <div className="text-[11.5px] text-white/40 mt-1">Dashboard</div>
            </div>
          </Link>
        </div>

        <nav aria-label="Dashboard" className="relative flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <span aria-hidden className="absolute left-3 right-3 top-4 h-10 rounded-xl bg-white/[0.07] transition-transform duration-500 ease-[cubic-bezier(.2,.9,.25,1.05)]" style={{ transform: `translateY(${activeIdx * 42}px)` }}>
            <span className="absolute -left-3 top-2.5 bottom-2.5 w-[3px] rounded-full bg-[#E8FF86] shadow-[0_0_14px_2px_rgba(232,255,134,0.55)]" />
          </span>
          {sidebarNav.map(item => {
            const active = activeTab === item.id
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                aria-current={active ? 'page' : undefined}
                className={`relative z-10 w-full flex items-center gap-3 px-3 h-10 rounded-xl text-[13.5px] font-medium tracking-[-0.01em] transition-colors border-none cursor-pointer bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8FF86]/70 ${active ? 'text-white' : 'text-white/55 hover:text-white hover:bg-white/[0.04]'}`}
              >
                <item.Icon c={`w-[17px] h-[17px] transition-colors duration-300 ${active ? 'text-[#E8FF86]' : ''}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {'badge' in item && item.badge && <span className="text-[11px] font-mono text-white/40">{item.badge}</span>}
                {'pro' in item && item.pro && <span className="text-[10px] font-bold text-black px-1.5 h-4 inline-flex items-center rounded-full bg-[#E8FF86]">Pro</span>}
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          <div className="bg-[#18181B] border border-white/[0.07] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isPremium ? <LiveDot /> : <span className="w-2 h-2 rounded-full bg-white/30" />}
                <span className="text-[12.5px] font-semibold tracking-[-0.01em]">{currentPlanDef.name} plan</span>
              </div>
              <span className="font-mono text-[11px] text-white/40"><CountUp value={products.length} />/{maxLabel(productLimit)}</span>
            </div>
            <div className="h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="dw-grow h-full rounded-full bg-[#E8FF86] transition-all duration-500 shadow-[0_0_10px_rgba(232,255,134,0.6)]" style={{ width: `${productPct}%` }} />
            </div>
            <div className="text-[11.5px] text-white/40 leading-snug mt-2.5 mb-3.5">
              {maxLabel(productLimit)} products, {maxLabel(imageLimit)} img each
            </div>
            {!isPremium ? (
              <button type="button" onClick={() => setActiveTab('payments')} className={`${BTN_LIME} w-full h-9 text-[12.5px] !rounded-xl focus-visible:!ring-offset-[#18181B] focus-visible:!ring-[#E8FF86]`}>
                Upgrade plan
              </button>
            ) : (
              <div className="w-full h-9 rounded-xl text-[12.5px] font-semibold text-[#E8FF86] border border-[#E8FF86]/30 bg-[#E8FF86]/10 flex items-center justify-center gap-1.5">
                <IconCheck c="w-3.5 h-3.5" /> Premium active
              </div>
            )}
          </div>
        </div>

        <div className="px-3 pb-3 pt-0">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-[12.5px] text-black shrink-0 bg-[#E8FF86]">{(businessName || 'S')[0].toUpperCase()}</div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold truncate tracking-[-0.01em]">{businessName || 'Your Store'}</div>
              <div className="text-[11px] text-white/40 font-mono truncate">/s/{slug || 'your-slug'}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 bg-[#FAFAF9]/80 backdrop-blur-md border-b border-zinc-200/80 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2.5 no-underline text-inherit">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-[13px] text-black bg-[#E8FF86]">D</div>
            <span className="font-bold text-[15px] tracking-[-0.025em]">DukaanWhats</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => setActiveTab('payments')} className={`${BTN} h-8 px-3 text-[11.5px] bg-[#0A0A0A] text-white`}>
              {currentPlanDef.name}
            </button>
            {!isPremium && (
              <button type="button" onClick={() => setActiveTab('payments')} className={`${BTN_LIME} h-8 px-3 text-[11.5px]`}>Upgrade</button>
            )}
          </div>
        </div>
      </header>

      <div className="md:pl-64">
        {/* Desktop top bar */}
        <div className="hidden md:flex sticky top-0 z-30 h-14 items-center justify-between px-8 bg-[#FAFAF9]/80 backdrop-blur-md border-b border-zinc-200/80">
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-zinc-400">Dashboard</span>
            <span className="text-zinc-300">/</span>
            <span className="font-semibold tracking-[-0.01em]">{tabLabel[activeTab]}</span>
          </div>
          <div className="flex items-center gap-2">
            <CurrentPlanButton />
            <button
              type="button"
              onClick={copyLink}
              title="Copy store link"
              className={`flex items-center gap-2 h-9 pl-3 pr-3 rounded-full border border-zinc-200/80 bg-white cursor-pointer transition-colors hover:border-zinc-300 ${UI.focus}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8FF86] shadow-[0_0_0_1px_#0A0A0A]" />
              <span className="font-mono text-[11.5px] text-zinc-600 max-w-[160px] truncate">/s/{slug || 'your-slug'}</span>
              {copied ? <IconCheck c="w-3.5 h-3.5 text-emerald-600" /> : <IconCopy c="w-3.5 h-3.5 text-zinc-400" />}
            </button>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-28 md:pb-14">
          {activeTab === 'themes' && themesPage}
          {activeTab === 'products' && productsPage}
          {activeTab === 'store' && storePage}
          {activeTab === 'analytics' && analyticsPage}
          {activeTab === 'payments' && paymentsPage}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav aria-label="Primary" className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/80 backdrop-blur-md border-t border-zinc-200/80 pb-[env(safe-area-inset-bottom)]">
        <div className="relative grid grid-cols-5 px-1.5 pt-2 pb-2">
          <span aria-hidden className="absolute top-[10px] h-7 w-12 rounded-full bg-[#E8FF86] transition-[left] duration-500 ease-[cubic-bezier(.2,.9,.25,1.05)]" style={{ left: `calc(6px + (100% - 12px) * ${(activeIdx + 0.5) / 5} - 24px)` }} />
          {sidebarNav.map(item => {
            const active = activeTab === item.id
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                aria-current={active ? 'page' : undefined}
                className="flex flex-col items-center gap-1 py-0.5 bg-transparent border-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-xl"
              >
                <span className={`relative z-10 h-7 w-12 rounded-full grid place-items-center transition-colors duration-300 ${active ? 'text-black' : 'text-zinc-500'}`}>
                  <item.Icon c="w-[19px] h-[19px]" />
                  {'pro' in item && item.pro && !active && <span className="absolute top-0.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#0A0A0A]" />}
                </span>
                <span className={`text-[10.5px] tracking-[-0.01em] ${active ? 'font-semibold text-zinc-900' : 'font-medium text-zinc-500'}`}>{mobileLabel[item.id]}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Toast for errorMsg */}
      {errorMsg && (
        <div role="status" className="dw-toast fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-[100] bg-[#0A0A0A] text-white pl-4 pr-5 py-3 rounded-2xl text-[13px] font-medium shadow-[0_16px_40px_rgba(0,0,0,0.3)] border border-white/10 flex items-center gap-2.5 md:max-w-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8FF86] shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Status modal */}
      {showStatusModal && (
        <div role="dialog" aria-modal="true" className="dw-fade fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="dw-pop bg-white rounded-3xl w-full max-w-[400px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
            {showStatusModal.type === 'approved' ? (
              <div>
                <div className="relative overflow-hidden bg-[#0A0A0A] text-white p-8 text-center">
                  <Confetti />
                  <div className="relative w-16 h-16 mx-auto">
                    <span aria-hidden className="dw-ring absolute inset-0 rounded-full border-2 border-[#E8FF86]" />
                    <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-[#E8FF86] text-black shadow-[0_0_0_8px_rgba(232,255,134,0.15)]"><IconCheck c="w-7 h-7 dw-draw" /></div>
                  </div>
                  <h2 className="font-extrabold text-[24px] tracking-[-0.035em] mt-5">Payment approved</h2>
                  <p className="text-[13px] text-white/60 mt-1.5">Your store is now {showStatusModal.payment.plan_id.toUpperCase()}</p>
                </div>
                <div className="p-6">
                  <div className="bg-[#FAFAF9] border border-zinc-200/80 rounded-xl divide-y divide-zinc-200/80">
                    <div className="flex justify-between items-center px-4 py-3"><span className="text-[12px] text-zinc-500">Plan</span><span className="text-[13px] font-bold tracking-[-0.01em]">{showStatusModal.payment.plan_id.toUpperCase()} · Rs. {showStatusModal.payment.amount}</span></div>
                    <div className="flex justify-between items-center px-4 py-3"><span className="text-[12px] text-zinc-500">Txn ID</span><span className={UI.chipMono}>{showStatusModal.payment.txn_id}</span></div>
                  </div>
                  <button type="button" onClick={() => setShowStatusModal(null)} className={`${BTN_DARK} mt-5 w-full h-11 text-[13px]`}>Continue</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-[#FAFAF9] p-8 text-center border-b border-zinc-200/80">
                  <div className="w-16 h-16 bg-red-50 border border-red-200 text-red-600 rounded-full flex items-center justify-center mx-auto"><IconX c="w-6 h-6" /></div>
                  <h2 className="font-extrabold text-[22px] tracking-[-0.035em] mt-5">Payment rejected</h2>
                  <p className="text-[13px] text-zinc-500 mt-1.5">Check the Txn ID and try again</p>
                </div>
                <div className="p-6">
                  <p className="text-[13px] text-zinc-600 leading-relaxed">Txn ID could not be verified in Till <span className="font-mono">{TILL_ID}</span>. Please ensure correct amount and ID.</p>
                  <button type="button" onClick={() => setShowStatusModal(null)} className={`${BTN_DARK} mt-5 w-full h-11 text-[13px]`}>Try again</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
