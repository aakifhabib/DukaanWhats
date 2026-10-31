'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '@/lib/supabase'
import { PremiumThemeRenderer } from './PremiumThemeRenderer'


const THEMES = [
  { id: 'spike-premium', name: 'Spike Pro', color: '#0A0A0A', accent: '#E8FF86', icon: '⚡' },
  { id: 'shoe-app-premium', name: 'Shoe App Pro', color: '#7C3AED', accent: '#F2F0FF', icon: '◩' },
  { id: 'trenzo-luxury', name: 'Trenzo Luxury', color: '#141414', accent: '#FFFFFF', icon: '✦' },
  { id: 'sleek-beige', name: 'Sleek Beige', color: '#F5F1EB', accent: '#0A0A0A', icon: '◧' },
  { id: 'sleek-dark', name: 'Sleek Dark', color: '#0A0A0A', accent: '#E8FF86', icon: '◫' },
  { id: 'sleek-editorial', name: 'Sleek Editorial', color: '#FCFBF9', accent: '#0A0A0A', icon: '◩' },
]

const MOCK_PRODUCTS = [
  { id: '1', name: 'Orvion Dashboard', price: 2499, image_url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600' },
  { id: '2', name: 'Air Max Pulse', price: 3200, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
  { id: '3', name: 'New Balance 550', price: 4100, image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600' },
  { id: '4', name: 'Puma RS-X', price: 2800, image_url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600' },
]

const DEFAULTS: Record<string, any> = {
  'spike-premium': {
    headerLabel: 'SPIKE • Shoes Shalwar',
    announcement: 'FREE SHIPPING • NEW DROP • COD AVAILABLE',
    heroBadge: 'MINIMAL • 2024',
    heroTitle: 'Cool and Aakif style',
    heroSubtitle: 'Clean lines, intentional whitespace, premium finish. Less is luxury.',
    ctaText: 'Shop Editorial →',
    brands: ['All','Nike','Adidas','Puma','New Balance'],
    statsOrders: '500+',
    statsRating: '4.9★',
    statsCod: 'COD',
    freeShippingBadge: 'FREE SHIPPING',
    hotBadge: 'HOT',
    heroImage: '',
  },
  'shoe-app-premium': {
    headerLabel: 'Shoe App • Premium',
    announcement: 'SHOES SHALWAR • LIVE • COD • FREE SHIPPING',
    heroBadge: 'NEW DROP • 2024',
    newDropLabel: 'NEW DROP • 2024',
    promoBadge: 'BLACK FRIDAY',
    promoTitle: 'GET UP TO\n50% OFF',
    promoCta: 'Shop Sale →',
    filters: ['All','Nike','Adidas','New','Sale'],
    memberPerksTitle: 'Free Shipping\n+ 7 Days Return',
    memberPerksDesc: 'Early access to drops, COD & priority.',
    memberCta: 'Join Premium — Free',
    heroImage: '',
  },
  'trenzo-luxury': {
    headerLabel: '✦ TRENZO • LUXURY',
    announcement: 'CONCIERGE • 24H SHIPPING • LUXURY CURATED',
    eyebrow: 'EST. 2018 • LUXURY CURATED',
    heroTitle: 'A reflection\nof personal\nstyling',
    heroSubtitle: 'Premium curated collection. Hand-finished, ethically sourced.',
    ctaText: 'Explore Collection →',
    featuredLabel: 'FEATURED • NEW',
    luxeBadge: '✦ LUXE',
    heroImage: '',
    stories: [
      { title: 'Craftsmanship', desc: 'Hand-stitched, 48h process, premium hide' },
      { title: 'Heritage', desc: 'Since 2018, curated for modern icons' },
      { title: 'Sustainability', desc: 'Ethically sourced, carbon neutral' },
    ],
  },
  'sleek-beige': {
    headerLabel: 'BEIGE • Studio',
    headerTopLabel: 'PREMIUM • BEIGE • 2024',
    announcement: 'FREE SHIPPING • NEW DROP • COD • CONCIERGE',
    badge: 'EDITORIAL • BEIGE • 2024',
    heroTitle: 'Warm minimal\nluxury, everyday\nicon.',
    heroSubtitle: 'Soft beige tones, natural texture, premium stitch. Curated for icons.',
    ctaText: 'Shop Beige →',
    brands: ['All','Nike','Adidas','Puma','New Balance','New','Sale'],
    featuredLabel: 'FEATURED • NEW',
    freeShippingBadge: 'FREE SHIPPING',
    hotBadge: 'NEW',
    statsOrders: '500+',
    statsRating: '4.9★',
    statsCod: 'COD',
    heroImage: '',
  },
  'sleek-dark': {
    headerLabel: 'DARK • Studio',
    headerTopLabel: 'NOIR • PREMIUM • 2024',
    announcement: 'DARK MODE • LUXURY • FREE SHIPPING • COD • 24H DISPATCH',
    badge: 'NOIR • DARK • 2024',
    heroTitle: 'Noir luxury,\nmidnight\nicon.',
    heroSubtitle: 'Deep black, subtle glow, premium finish. Designed for night.',
    ctaText: 'Shop Dark →',
    brands: ['All','Nike','Adidas','Puma','New Balance','New','Sale'],
    featuredLabel: 'FEATURED • NEW',
    freeShippingBadge: 'FREE SHIPPING',
    hotBadge: 'HOT',
    statsOrders: '500+',
    statsRating: '4.9★',
    statsCod: 'COD',
    heroImage: '',
  },
  'sleek-editorial': {
    headerLabel: 'EDITORIAL • Studio',
    headerTopLabel: 'PREMIUM • EDITORIAL',
    announcement: 'EDITORIAL • MINIMAL • LUXURY • FREE SHIPPING • COD',
    badge: 'MINIMAL • 2024',
    heroTitle: 'Cool and Aakif\nstyle — editorial\nminimal.',
    heroSubtitle: 'Clean lines, intentional whitespace, premium finish. Less is luxury.',
    ctaText: 'Shop Editorial →',
    brands: ['All','Nike','Adidas','Puma','New Balance','New','Sale'],
    featuredLabel: 'FEATURED • NEW',
    freeShippingBadge: 'FREE SHIPPING',
    hotBadge: 'NEW',
    statsOrders: '500+',
    statsRating: '4.9★',
    statsCod: 'COD',
    heroImage: '',
  },
}


/* =====================================================================
   UI TOKENS
   ===================================================================== */
const INPUT = 'w-full h-11 px-3.5 rounded-xl border border-zinc-200/80 bg-white text-[13.5px] text-zinc-900 placeholder:text-zinc-400 outline-none transition-[border-color,box-shadow] focus:border-zinc-900 focus:ring-4 focus:ring-[#E8FF86]/70'
const TEXTAREA = `${INPUT} h-auto py-3 resize-none leading-snug`
const BTN = 'relative overflow-hidden inline-flex items-center justify-center gap-2 shrink-0 rounded-full font-semibold tracking-[-0.01em] whitespace-nowrap cursor-pointer select-none transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2'

function Field({ label, hint, className = '', children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[12px] font-medium text-zinc-600 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11.5px] text-zinc-400 mt-1.5">{hint}</span>}
    </label>
  )
}

const Spinner = () => (
  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
)
const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
)

/* =====================================================================
   MEASURING
   ===================================================================== */
function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, size] as const
}

/* =====================================================================
   ISOLATED PREVIEW (real <iframe>)
   Why: Tailwind breakpoints (md:, lg:), vh units and `position: fixed` drawers/modals
   all resolve against the *viewport*. Rendering the store straight into the dashboard
   made the "mobile" frame use desktop breakpoints, and let the store's cart drawer and
   product modal escape the frame and widen the page. Inside an iframe the store gets a
   true viewport of exactly the device width, and everything stays contained.
   ===================================================================== */
const hash = (s: string) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return String(h) }

function syncStyles(from: Document, to: Document) {
  to.documentElement.className = from.documentElement.className
  to.documentElement.lang = from.documentElement.lang
  const hs = from.documentElement.getAttribute('style')
  if (hs) to.documentElement.setAttribute('style', hs)
  to.body.className = from.body.className
  const bs = from.body.getAttribute('style')
  if (bs) to.body.setAttribute('style', bs)

  const keyOf = (n: Element) => (n.tagName === 'LINK' ? 'L' + (n as HTMLLinkElement).href : 'S' + hash(n.textContent || ''))
  const have = new Map<string, Element>()
  to.head.querySelectorAll('[data-pf]').forEach(n => have.set(n.getAttribute('data-pf') as string, n))
  const seen = new Set<string>()
  from.head.querySelectorAll('link[rel="stylesheet"], style').forEach(n => {
    const k = keyOf(n)
    seen.add(k)
    if (have.has(k)) return
    const c = n.cloneNode(true) as HTMLElement
    c.setAttribute('data-pf', k)
    to.head.appendChild(c)
  })
  have.forEach((n, k) => { if (!seen.has(k)) n.remove() })
}

function PreviewFrame({ width, height, title, hideScrollbar, children }: { width: number; height: number; title: string; hideScrollbar?: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [mount, setMount] = useState<HTMLElement | null>(null)

  const srcDoc = useMemo(() => {
    const css = `html,body{margin:0;padding:0;min-height:100%}body{overflow-x:hidden;-webkit-text-size-adjust:100%}` +
      (hideScrollbar ? `html{scrollbar-width:none}::-webkit-scrollbar{display:none}` : `html{scrollbar-width:thin}`)
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><div id="pf-root"></div></body></html>`
  }, [hideScrollbar])

  const onLoad = () => {
    const doc = ref.current?.contentDocument
    if (!doc) return
    syncStyles(document, doc)
    // The preview must never navigate the dashboard away
    doc.addEventListener('click', (e) => { const a = (e.target as Element | null)?.closest?.('a'); if (a) e.preventDefault() }, true)
    doc.addEventListener('submit', (e) => e.preventDefault(), true)
    // Let Esc reach the editor even when focus is inside the preview
    doc.addEventListener('keydown', (e) => { window.dispatchEvent(new KeyboardEvent('keydown', { key: e.key })) })
    setMount(doc.getElementById('pf-root'))
  }

  // keep the preview's stylesheets in sync with the dashboard (HMR, lazy CSS, route CSS)
  useEffect(() => {
    if (!mount) return
    const doc = ref.current?.contentDocument
    if (!doc) return
    let t: any
    const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => syncStyles(document, doc), 60) })
    mo.observe(document.head, { childList: true, subtree: true, characterData: true })
    return () => { mo.disconnect(); clearTimeout(t) }
  }, [mount])

  return (
    <>
      <iframe ref={ref} title={title} srcDoc={srcDoc} onLoad={onLoad} className="block border-0 bg-white" style={{ width, height }} />
      {mount && createPortal(children, mount)}
    </>
  )
}

/* =====================================================================
   PREVIEW PANE — device switcher + frames that always fit the available space
   ===================================================================== */
const DEVICES = {
  mobile: { label: 'Mobile', w: 390, h: 844 },
  tablet: { label: 'Tablet', w: 768, h: 1024 },
  desktop: { label: 'Desktop', w: 1280, h: 800 },
} as const
type DeviceKey = keyof typeof DEVICES

function PreviewPane({ themeId, storeHost, device, setDevice, expanded, setExpanded, children }: {
  themeId: string; storeHost: string; device: DeviceKey; setDevice: (d: DeviceKey) => void
  expanded: boolean; setExpanded: (v: boolean) => void; children: React.ReactNode
}) {
  const [stageRef, stage] = useSize<HTMLDivElement>()
  const spec = DEVICES[device]
  const outer = device === 'mobile' ? { w: spec.w + 20, h: spec.h + 20 }
    : device === 'tablet' ? { w: spec.w + 24, h: spec.h + 24 }
      : { w: spec.w, h: spec.h + 40 }
  const pad = expanded ? 28 : 18
  const scale = stage.w && stage.h ? Math.max(0.1, Math.min(1, (stage.w - pad * 2) / outer.w, (stage.h - pad * 2) / outer.h)) : 0
  const idx = (Object.keys(DEVICES) as DeviceKey[]).indexOf(device)

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0A0A0A] text-white">
      <div className="h-[56px] shrink-0 px-4 bg-[#141414] border-b border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex w-2 h-2 shrink-0"><span className="absolute inset-0 rounded-full bg-[#E8FF86] animate-ping opacity-60" /><span className="relative w-2 h-2 rounded-full bg-[#E8FF86]" /></span>
          <span className="text-[12px] font-semibold tracking-[-0.01em] shrink-0">Live preview</span>
          <span className="font-mono text-[10.5px] text-white/40 truncate hidden sm:inline">{themeId}</span>
        </div>
        <div className="flex items-center gap-2">
          {scale > 0 && scale < 1 && <span className="font-mono text-[10.5px] text-white/40 hidden md:inline" title="Preview is scaled to fit">{Math.round(scale * 100)}%</span>}
          <div role="group" aria-label="Preview device" className="relative grid grid-cols-3 p-1 rounded-full bg-white/10 border border-white/10">
            <span aria-hidden className="absolute top-1 bottom-1 left-1 w-[calc((100%-8px)/3)] rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(.2,.9,.25,1.1)]" style={{ transform: `translateX(${idx * 100}%)` }} />
            {(Object.keys(DEVICES) as DeviceKey[]).map(k => (
              <button key={k} type="button" aria-pressed={device === k} onClick={() => setDevice(k)} className={`relative z-10 h-7 px-3 rounded-full text-[11px] font-semibold transition-colors duration-300 ${device === k ? 'text-black' : 'text-white/60 hover:text-white'}`}>{DEVICES[k].label}</button>
            ))}
          </div>
          <button type="button" onClick={() => setExpanded(!expanded)} aria-label={expanded ? 'Exit full screen' : 'Full screen preview'} title={expanded ? 'Exit full screen (Esc)' : 'Full screen'} className="w-8 h-8 rounded-full bg-white/10 border border-white/10 grid place-items-center text-white/80 hover:bg-white/20 hover:text-white transition-colors">
            {expanded ? (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
            )}
          </button>
        </div>
      </div>

      <div ref={stageRef} className="flex-1 min-h-0 relative overflow-hidden flex items-center justify-center" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)', backgroundSize: '18px 18px' }}>
        {scale > 0 && (
          <div style={{ width: outer.w * scale, height: outer.h * scale, flexShrink: 0 }}>
            <div style={{ width: outer.w, height: outer.h, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              {device === 'mobile' && (
                <div className="relative bg-black rounded-[54px] p-[10px] shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_32px_80px_rgba(0,0,0,0.6)]" style={{ width: outer.w, height: outer.h }}>
                  <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[100px] h-[26px] bg-black rounded-b-[16px] z-20 grid place-items-center pointer-events-none"><div className="w-12 h-1 bg-white/20 rounded-full" /></div>
                  <div className="rounded-[44px] overflow-hidden bg-white" style={{ width: spec.w, height: spec.h }}>
                    <PreviewFrame key="mobile" width={spec.w} height={spec.h} title="Mobile preview" hideScrollbar>{children}</PreviewFrame>
                  </div>
                </div>
              )}
              {device === 'tablet' && (
                <div className="bg-[#1A1A1A] rounded-[28px] p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_32px_80px_rgba(0,0,0,0.55)]" style={{ width: outer.w, height: outer.h }}>
                  <div className="rounded-[16px] overflow-hidden bg-white" style={{ width: spec.w, height: spec.h }}>
                    <PreviewFrame key="tablet" width={spec.w} height={spec.h} title="Tablet preview" hideScrollbar>{children}</PreviewFrame>
                  </div>
                </div>
              )}
              {device === 'desktop' && (
                <div className="bg-[#1E1E1E] rounded-xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_32px_80px_rgba(0,0,0,0.55)]" style={{ width: outer.w, height: outer.h }}>
                  <div className="h-10 bg-[#2D2D2D] flex items-center px-4 gap-2 border-b border-white/10">
                    <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-[#FF5F56]" /><div className="w-3 h-3 rounded-full bg-[#FFBD2E]" /><div className="w-3 h-3 rounded-full bg-[#27C93F]" /></div>
                    <div className="ml-4 flex-1 h-7 bg-[#1A1A1A] rounded-full flex items-center px-3 font-mono text-[11px] text-white/40 truncate">{storeHost}</div>
                  </div>
                  <div className="bg-white" style={{ width: spec.w, height: spec.h }}>
                    <PreviewFrame key="desktop" width={spec.w} height={spec.h} title="Desktop preview">{children}</PreviewFrame>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* =====================================================================
   CHIP INPUT (same behaviour, restyled)
   ===================================================================== */
function ChipInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('')
  const add = () => {
    const v = input.trim()
    if (!v) return
    if (value.includes(v)) { setInput(''); return }
    onChange([...value, v])
    setInput('')
  }
  return (
    <div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }} placeholder={placeholder} className={`${INPUT} flex-1 min-w-0`} />
        <button type="button" onClick={add} className={`${BTN} h-11 px-5 bg-[#0A0A0A] text-white text-[12.5px] hover:bg-zinc-800`}>Add</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {value.map((b, i) => (
          <div key={i} className="h-8 pl-3.5 pr-2 bg-[#0A0A0A] text-white rounded-full flex items-center gap-2 text-[12px] font-semibold">
            {b}
            <button type="button" aria-label={`Remove ${b}`} onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="w-5 h-5 rounded-full bg-white/15 hover:bg-white/30 grid place-items-center text-[10px] transition-colors">✕</button>
          </div>
        ))}
        {value.length === 0 && <span className="text-[12px] text-zinc-400">No chips yet. Type one and press Enter.</span>}
      </div>
    </div>
  )
}

export function PremiumThemeEditor({ profile, onSave }: { profile: any; onSave: (d:any)=>void }) {
  const themeId = profile?.store_theme || 'spike-premium'
  const themeMeta = THEMES.find(t=>t.id===themeId) || THEMES[0]
  const defaults = DEFAULTS[themeId] || DEFAULTS['spike-premium']
  const [custom, setCustom] = useState<any>(profile?.premium_custom || {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('header')
  const [device, setDevice] = useState<'mobile'|'tablet'|'desktop'>('mobile')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [cart, setCart] = useState<any[]>([])

  useEffect(()=>{
    const base = profile?.premium_custom || {}
    const merged = { ...defaults, ...base }
    setCustom(merged)
    setActiveTab('header')
  },[themeId])

  const update = (k:string, v:any) => setCustom((s:any)=>({ ...s, [k]: v }))

  const save = async () => {
    if(!profile?.id) return
    setSaving(true)
    try {
      const toSave = { ...custom, spikeTitle: custom.heroTitle, spikeSub: custom.heroSubtitle, spikeBrands: custom.brands || custom.filters, announcement: custom.announcement }
      const { error } = await (supabase as any).from('profiles').update({ premium_custom: toSave }).eq('id', profile.id)
      if(error) throw error
      onSave(toSave)
      setSaved(true)
      setTimeout(()=>setSaved(false), 2500)
    } catch(e:any){ alert(e.message || 'Save failed') }
    setSaving(false)
  }

  const liveProfile = useMemo(()=>({
    ...profile,
    business_name: profile?.business_name || 'Shoes Shalwar',
    whatsapp_number: profile?.whatsapp_number || '923000000000',
    premium_custom: custom,
  }),[profile, custom])

  const getTabs = () => {
    if(themeId==='spike-premium') return [
      { id: 'header', label: 'Header', sub: 'Store name & announcement bar' },
      { id: 'hero', label: 'Hero', sub: 'Title, subtitle & image' },
      { id: 'filters', label: 'Filters', sub: 'Brand filter chips' },
      { id: 'stats', label: 'Stats', sub: 'Trust badges & ratings' },
    ]
    if(themeId==='shoe-app-premium') return [
      { id: 'header', label: 'Header', sub: 'Logo & announcement' },
      { id: 'promo', label: 'Promo', sub: 'Black Friday card' },
      { id: 'filters', label: 'Filters', sub: 'Brand & sizes' },
      { id: 'perks', label: 'Perks', sub: 'Member benefits' },
    ]
    if(themeId==='trenzo-luxury') return [
      { id: 'header', label: 'Header', sub: 'Logo & concierge bar' },
      { id: 'hero', label: 'Hero', sub: 'Title & featured image' },
      { id: 'stories', label: 'Stories', sub: 'Craftsmanship & heritage' },
    ]
    if(themeId==='sleek-beige') return [
      { id: 'header', label: 'Header', sub: 'Logo, top label & announcement' },
      { id: 'hero', label: 'Hero', sub: 'Title, subtitle & image' },
      { id: 'filters', label: 'Collection', sub: 'Filter chips' },
      { id: 'stats', label: 'Trust', sub: 'Ratings & story strip' },
    ]
    if(themeId==='sleek-dark') return [
      { id: 'header', label: 'Header', sub: 'Logo & announcement' },
      { id: 'hero', label: 'Hero', sub: 'Title, subtitle & image' },
      { id: 'filters', label: 'Collection', sub: 'Filter chips' },
      { id: 'stats', label: 'Trust', sub: 'Ratings & badges' },
    ]
    if(themeId==='sleek-editorial') return [
      { id: 'header', label: 'Header', sub: 'Logo & announcement' },
      { id: 'hero', label: 'Hero', sub: 'Title & image' },
      { id: 'filters', label: 'Collection', sub: 'Filter chips' },
      { id: 'stats', label: 'Trust', sub: 'Story & ratings' },
    ]
    return [{ id: 'header', label: 'Header', sub: 'Top bar' }]
  }

  const tabs = getTabs()

  /* ---------- layout + preview state (new) ---------- */
  const [expanded, setExpanded] = useState(false)
  const [rootRef, rootSize] = useSize<HTMLDivElement>()
  const split = rootSize.w >= 900          // side-by-side only when the editor itself is wide enough
  const activeMeta = tabs.find(t => t.id === activeTab) || tabs[0]
  const storeHost = `dukaanwhats.pk/s/${liveProfile.business_name?.toLowerCase().replace(/\s/g, '') || 'store'}`

  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(false) }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [expanded])

  const saveLabel = saving ? <><Spinner /> Saving...</> : saved ? <><CheckIcon /> Saved</> : 'Save live'

  const store = (
    <PremiumThemeRenderer themeId={themeId} profile={liveProfile} products={MOCK_PRODUCTS} cart={cart} setShowCart={() => { }} onAdd={(p: any) => setCart(prev => [...prev, p])} onOpen={(p: any) => setSelectedProduct(p)} track={() => { }} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} />
  )
  const pane = (
    <PreviewPane themeId={themeId} storeHost={storeHost} device={device} setDevice={setDevice} expanded={expanded} setExpanded={setExpanded}>
      {store}
    </PreviewPane>
  )

  return (
    <div
      ref={rootRef}
      id="premium-editor-anchor"
      className="relative border border-zinc-200/80 rounded-[28px] overflow-clip bg-white shadow-[0_16px_64px_rgba(10,10,10,0.08)]"
      style={{ visibility: rootSize.w ? 'visible' : 'hidden' }}
    >
      <style>{`
        @keyframes pteIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes pteFade { from { opacity: 0; } to { opacity: 1; } }
        .pte-panel { animation: pteIn 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
        .pte-fade { animation: pteFade 0.25s ease both; }
        .pte-ns { scrollbar-width: none; }
        .pte-ns::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) { .pte-panel, .pte-fade { animation: none; } }
      `}</style>

      {/* Header */}
      <div className="h-[68px] px-5 md:px-6 flex items-center justify-between gap-3 bg-[#0A0A0A] text-white">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#E8FF86] text-black grid place-items-center font-extrabold text-[16px] shrink-0">{themeMeta.icon}</div>
          <div className="min-w-0">
            <div className="font-extrabold text-[15px] tracking-[-0.02em] truncate">{themeMeta.name}</div>
            <div className="font-mono text-[11px] text-white/45 truncate">{themeId} · Premium editor</div>
          </div>
        </div>
        <button type="button" onClick={save} disabled={saving} className={`${BTN} h-10 px-5 bg-[#E8FF86] text-black text-[12.5px] hover:brightness-95 focus-visible:ring-offset-[#0A0A0A]`}>{saveLabel}</button>
      </div>

      <div className={split ? 'grid' : 'block'} style={split ? { gridTemplateColumns: 'minmax(0,1fr) clamp(400px, 46%, 540px)' } : undefined}>
        {/* Form column */}
        <div className="min-w-0 flex flex-col bg-white">
          <div role="tablist" aria-label="Sections" className="pte-ns flex gap-1.5 overflow-x-auto px-5 md:px-6 pt-5">
            {tabs.map(t => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={activeTab === t.id}
                onClick={() => setActiveTab(t.id)}
                className={`shrink-0 h-9 px-4 rounded-full text-[12.5px] font-semibold tracking-[-0.01em] inline-flex items-center gap-2 transition-all duration-300 ${activeTab === t.id ? 'bg-[#0A0A0A] text-white shadow-[0_8px_18px_-8px_rgba(10,10,10,0.6)]' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80'}`}
              >
                {activeTab === t.id && <span className="w-1.5 h-1.5 rounded-full bg-[#E8FF86]" />}
                {t.label}
              </button>
            ))}
          </div>
          <p className="px-5 md:px-6 mt-3 text-[12.5px] text-zinc-500">{activeMeta.sub}</p>

          <div key={activeTab} className="pte-panel px-5 md:px-6 py-6 space-y-5 flex-1">
            {activeTab === 'header' && (
              <>
                <Field label="Header label"><input value={custom.headerLabel || ''} onChange={e => update('headerLabel', e.target.value)} placeholder="BEIGE • Studio" className={INPUT} /></Field>
                <Field label="Top label"><input value={custom.headerTopLabel || ''} onChange={e => update('headerTopLabel', e.target.value)} placeholder="PREMIUM • BEIGE • 2024" className={INPUT} /></Field>
                <Field label="Announcement bar"><input value={custom.announcement || ''} onChange={e => update('announcement', e.target.value)} placeholder="FREE SHIPPING • NEW DROP • COD" className={INPUT} /></Field>
                <Field label="Badge"><input value={custom.badge || custom.heroBadge || ''} onChange={e => { update('badge', e.target.value); update('heroBadge', e.target.value) }} placeholder="EDITORIAL • BEIGE • 2024" className={INPUT} /></Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Free shipping badge"><input value={custom.freeShippingBadge || ''} onChange={e => update('freeShippingBadge', e.target.value)} placeholder="FREE SHIPPING" className={INPUT} /></Field>
                  <Field label="Hot badge"><input value={custom.hotBadge || ''} onChange={e => update('hotBadge', e.target.value)} placeholder="HOT / NEW" className={INPUT} /></Field>
                </div>
              </>
            )}

            {activeTab === 'hero' && (
              <>
                <Field label="Title" hint={'Use \\n for a line break'}><textarea value={custom.heroTitle || ''} onChange={e => update('heroTitle', e.target.value)} rows={3} className={`${TEXTAREA} text-[20px] font-extrabold tracking-[-0.03em] leading-[1]`} /></Field>
                <Field label="Subtitle"><textarea value={custom.heroSubtitle || ''} onChange={e => update('heroSubtitle', e.target.value)} rows={2} className={TEXTAREA} /></Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Button text"><input value={custom.ctaText || ''} onChange={e => update('ctaText', e.target.value)} placeholder="Shop Now →" className={INPUT} /></Field>
                  <Field label="Featured label"><input value={custom.featuredLabel || ''} onChange={e => update('featuredLabel', e.target.value)} placeholder="FEATURED • NEW" className={INPUT} /></Field>
                </div>
                <Field label="Hero image URL"><input value={custom.heroImage || ''} onChange={e => update('heroImage', e.target.value)} placeholder="https://..." className={`${INPUT} font-mono !text-[12px]`} /></Field>
                {custom.heroImage && <img src={custom.heroImage} className="w-full h-[220px] object-cover rounded-2xl border border-zinc-200/80" alt="" />}
              </>
            )}

            {activeTab === 'filters' && (
              <Field label="Collection filters" hint="Type a name and press Enter">
                <ChipInput value={custom.brands || custom.filters || []} onChange={v => { update('brands', v); update('filters', v) }} placeholder="Type brand and press Enter" />
              </Field>
            )}

            {activeTab === 'stats' && (
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Orders"><input value={custom.statsOrders || ''} onChange={e => update('statsOrders', e.target.value)} className={`${INPUT} font-semibold`} /></Field>
                <Field label="Rating"><input value={custom.statsRating || ''} onChange={e => update('statsRating', e.target.value)} className={`${INPUT} font-semibold`} /></Field>
                <Field label="COD"><input value={custom.statsCod || ''} onChange={e => update('statsCod', e.target.value)} className={`${INPUT} font-semibold`} /></Field>
              </div>
            )}

            {activeTab === 'promo' && (
              <>
                <Field label="Badge"><input value={custom.promoBadge || ''} onChange={e => update('promoBadge', e.target.value)} className={`${INPUT} font-semibold`} /></Field>
                <Field label="Title"><textarea value={custom.promoTitle || ''} onChange={e => update('promoTitle', e.target.value)} rows={2} className={`${TEXTAREA} text-[16px] font-extrabold`} /></Field>
                <Field label="Button text"><input value={custom.promoCta || ''} onChange={e => update('promoCta', e.target.value)} className={`${INPUT} font-semibold`} /></Field>
              </>
            )}

            {activeTab === 'perks' && (
              <>
                <Field label="Title"><textarea value={custom.memberPerksTitle || ''} onChange={e => update('memberPerksTitle', e.target.value)} rows={2} className={`${TEXTAREA} font-semibold`} /></Field>
                <Field label="Description"><input value={custom.memberPerksDesc || ''} onChange={e => update('memberPerksDesc', e.target.value)} className={INPUT} /></Field>
              </>
            )}

            {activeTab === 'stories' && (
              <div className="space-y-3">
                {(custom.stories || []).map((s: any, i: number) => (
                  <div key={i} className="bg-[#0A0A0A] text-white rounded-2xl p-4">
                    <div className="font-mono text-[11px] text-white/45">Story {i + 1}</div>
                    <input value={s.title} onChange={e => { const arr = [...(custom.stories || [])]; arr[i] = { ...arr[i], title: e.target.value }; update('stories', arr) }} className="mt-2 w-full h-10 px-3 bg-white/10 border border-white/10 rounded-xl text-[13px] font-semibold text-white outline-none focus:border-[#E8FF86]" />
                    <input value={s.desc} onChange={e => { const arr = [...(custom.stories || [])]; arr[i] = { ...arr[i], desc: e.target.value }; update('stories', arr) }} className="mt-2 w-full h-10 px-3 bg-white/10 border border-white/10 rounded-xl text-[12px] text-white/75 outline-none focus:border-[#E8FF86]" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-5 md:px-6 py-4 border-t border-zinc-200/80 flex justify-between items-center gap-3">
            <div className="font-mono text-[11px] text-zinc-500">{Object.keys(custom).length} fields · {themeId}</div>
            <button type="button" onClick={save} disabled={saving} className={`${BTN} h-10 px-6 bg-[#0A0A0A] text-white text-[12.5px] hover:bg-zinc-800`}>{saveLabel}</button>
          </div>
        </div>

        {/* Preview column (sticky beside the form when there is room, stacked below otherwise) */}
        <div
          className={split ? 'border-l border-zinc-200/80' : 'border-t border-zinc-200/80'}
          style={split ? { position: 'sticky', top: 72, alignSelf: 'start', height: 'min(calc(100vh - 96px), 900px)', minHeight: 540 } : { height: 'clamp(560px, 82vh, 820px)' }}
        >
          {!expanded ? pane : (
            <div className="h-full bg-[#0A0A0A] text-white grid place-items-center text-center p-6">
              <div>
                <div className="text-[13px] font-semibold">Preview is open full screen</div>
                <button type="button" onClick={() => setExpanded(false)} className={`${BTN} mt-4 h-9 px-5 bg-white/10 border border-white/15 text-white text-[12px] hover:bg-white/20`}>Bring it back</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {expanded && typeof document !== 'undefined' && createPortal(
        <div className="pte-fade fixed inset-0 z-[9999] bg-[#0A0A0A] flex flex-col">{pane}</div>,
        document.body
      )}
    </div>
  )
}
