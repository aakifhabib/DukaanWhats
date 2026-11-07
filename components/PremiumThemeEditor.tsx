'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
// @ts-ignore -- keeps the build green even when @types/react-dom is not installed
import { createPortal } from 'react-dom'
import { supabase } from '@/lib/supabase'
import { PremiumThemeRenderer, buildSchema, resolveContent, getImages, type Field as SchemaField } from './PremiumThemeRenderer'

type Field = SchemaField

const THEMES = [
  { id: 'spike-premium', name: 'Spike Pro', color: '#0A0A0A', accent: '#E8FF86', icon: '⚡' },
  { id: 'shoe-app-premium', name: 'Shoe App Pro', color: '#7C3AED', accent: '#F2F0FF', icon: '◩' },
  { id: 'trenzo-luxury', name: 'Trenzo Luxury', color: '#141414', accent: '#FFFFFF', icon: '✦' },
  { id: 'sleek-beige', name: 'Sleek Beige', color: '#F5F1EB', accent: '#0A0A0A', icon: '◧' },
  { id: 'sleek-dark', name: 'Sleek Dark', color: '#0A0A0A', accent: '#E8FF86', icon: '◫' },
  { id: 'sleek-editorial', name: 'Sleek Editorial', color: '#FCFBF9', accent: '#0A0A0A', icon: '◩' },
  { id: 'saffron-table', name: 'Saffron Table', color: '#F8F0E3', accent: '#C95C3A', icon: '✿' },
  { id: 'atelier-bloom', name: 'Atelier Bloom', color: '#F4EFE9', accent: '#718463', icon: '❀' },
  { id: 'mono-market', name: 'Mono Market', color: '#F3F3EF', accent: '#D9FF3F', icon: '▦' },
  { id: 'noir-gilt', name: 'Noir & Gilt', color: '#0C0A07', accent: '#C8A96B', icon: '✦' },
]

/* Category-aware demo products keep each premium theme preview relevant before a seller adds products. */
const SAMPLE_PRODUCTS: Record<string, any[]> = {
  shoes: [
    { id: 'sample-shoe-1', name: 'Air Max Pulse', price: 6400, original_price: 8200, category: 'Sneakers', stock: 3, sizes: ['40', '41', '42', '43', '44'], colors: ['Black', 'White', 'Red'], description: 'Responsive cushioning meets a street-ready silhouette.', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80' },
    { id: 'sample-shoe-2', name: 'Court Classic Low', price: 4200, category: 'Everyday', stock: 100, sizes: ['39', '40', '41', '42'], colors: ['Off White', 'Navy'], description: 'A clean leather court shoe for everyday wear.', image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900&q=80' },
    { id: 'sample-shoe-3', name: 'Runner 550', price: 5100, original_price: 6000, category: 'New arrivals', stock: 12, colors: ['Grey'], description: 'Lightweight daily trainer with soft foam cushioning.', image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900&q=80' },
  ],
  clothing: [
    { id: 'sample-clothing-1', name: 'Everyday Linen Set', price: 4200, category: 'New arrivals', stock: 8, sizes: ['S', 'M', 'L'], colors: ['Sand', 'Olive'], description: 'An easy, breathable set made for everyday wear.', image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=900&q=80' },
    { id: 'sample-clothing-2', name: 'Cotton Essential', price: 2850, category: 'Clothing', stock: 14, sizes: ['S', 'M', 'L', 'XL'], colors: ['White', 'Black'], description: 'Soft cotton, thoughtful details, and a relaxed fit.', image_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&q=80' },
    { id: 'sample-clothing-3', name: 'Woven Carryall', price: 1950, category: 'Accessories', stock: 6, colors: ['Natural'], description: 'A handcrafted everyday accessory with room for the essentials.', image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&q=80' },
  ],
  food: [
    { id: 'sample-food-1', name: 'Pistachio Celebration Cake', price: 1800, category: 'Bakery', stock: 8, description: 'A soft sponge layered with cream and roasted pistachio.', image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&q=80' },
    { id: 'sample-food-2', name: 'Sourdough Loaf', price: 850, category: 'Fresh daily', stock: 12, description: 'Slow-fermented, crisp crust, baked fresh each morning.', image_url: 'https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=900&q=80' },
    { id: 'sample-food-3', name: 'Saffron Latte', price: 620, category: 'Drinks', stock: 20, description: 'A warm espresso with milk and a hint of saffron.', image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=900&q=80' },
  ],
  tech: [
    { id: 'sample-tech-1', name: 'Studio Headphones', price: 8900, category: 'Audio', stock: 8, colors: ['Black', 'Silver'], description: 'Comfortable over-ear sound for work and travel.', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80' },
    { id: 'sample-tech-2', name: 'Pocket Speaker', price: 5200, category: 'Audio', stock: 11, colors: ['Black', 'Cream'], description: 'Room-filling sound in a compact, portable design.', image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900&q=80' },
    { id: 'sample-tech-3', name: 'Everyday Camera', price: 14900, category: 'Gear', stock: 4, description: 'A compact camera ready for the next great moment.', image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&q=80' },
  ],
  home: [
    { id: 'sample-home-1', name: 'Sculpted Ceramic Vase', price: 3200, category: 'Objects', stock: 5, colors: ['Ivory'], description: 'A softly sculpted ceramic piece for a quiet corner.', image_url: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=900&q=80' },
    { id: 'sample-home-2', name: 'Sunday Candle', price: 1650, category: 'Home fragrance', stock: 16, description: 'A warm, clean scent poured in small batches.', image_url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=900&q=80' },
    { id: 'sample-home-3', name: 'Little Green Plant', price: 2100, category: 'Living', stock: 7, description: 'An easy-care green companion for your home.', image_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=900&q=80' },
  ],
}
const getSampleProducts = (themeId: string) => {
  const category = themeId.includes('saffron') ? 'food' : themeId.includes('mono') ? 'tech' : themeId.includes('atelier') ? 'home' : themeId.includes('spike') || themeId.includes('shoe') ? 'shoes' : 'clothing'
  return SAMPLE_PRODUCTS[category]
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

export function PreviewFrame({ width, height, title, hideScrollbar, tabIndex, children }: { width: number; height: number; title: string; hideScrollbar?: boolean; tabIndex?: number; children: React.ReactNode }) {
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
      <iframe ref={ref} title={title} tabIndex={tabIndex} srcDoc={srcDoc} onLoad={onLoad} className="block border-0 bg-white" style={{ width, height }} />
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
    <div data-theme-exempt className="flex flex-col h-full min-h-0 bg-[#0A0A0A] text-white">
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

/* =====================================================================
   SCHEMA-DRIVEN FIELDS
   ===================================================================== */
type Ctx = { images: string[]; upload: (file: File) => Promise<string>; hasProducts: boolean }

function ImagePicker({ current, ctx, onPick, onClose }: { current: string; ctx: Ctx; onPick: (url: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState<'gallery' | 'upload' | 'link'>(ctx.images.length ? 'gallery' : 'upload')
  const [sel, setSel] = useState(current || '')
  const [link, setLink] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [drag, setDrag] = useState(false)
  const imgs = Array.from(new Set([...(current ? [current] : []), ...ctx.images]))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const doUpload = async (file?: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { setErr('Please choose an image file.'); return }
    if (file.size > 5 * 1024 * 1024) { setErr('That image is larger than 5MB. Please pick a smaller one.'); return }
    setBusy(true); setErr('')
    try { const url = await ctx.upload(file); onPick(url) }
    catch (e: any) { setErr(e?.message || 'Upload failed. Please try again.') }
    setBusy(false)
  }

  const tabs: [typeof tab, string][] = [['gallery', `My photos${imgs.length ? ` (${imgs.length})` : ''}`], ['upload', 'Upload new'], ['link', 'Paste link']]
  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center sm:p-6 bg-black/60 backdrop-blur-sm pte-fade" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Choose image" onClick={e => e.stopPropagation()} className="w-full sm:max-w-[760px] max-h-[92vh] bg-white rounded-t-[28px] sm:rounded-[28px] flex flex-col overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.4)] pte-panel">
        <div className="px-5 sm:px-6 h-16 shrink-0 flex items-center justify-between border-b border-zinc-200/80">
          <div><div className="font-extrabold text-[16px] tracking-[-0.02em]">Choose an image</div><div className="text-[12px] text-zinc-500">From your product photos, a new upload, or a link</div></div>
          <button type="button" onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full border border-zinc-200 grid place-items-center hover:bg-zinc-100 transition">✕</button>
        </div>
        <div className="px-5 sm:px-6 pt-4 flex gap-1.5">
          {tabs.map(([k, l]) => <button key={k} type="button" onClick={() => setTab(k)} aria-pressed={tab === k} className={`h-9 px-4 rounded-full text-[12.5px] font-semibold transition ${tab === k ? 'bg-[#0A0A0A] text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>{l}</button>)}
        </div>

        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 min-h-[300px]">
          {tab === 'gallery' && (imgs.length ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {imgs.map(u => (
                <button type="button" key={u} onClick={() => setSel(u)} onDoubleClick={() => onPick(u)} aria-pressed={sel === u} className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition ${sel === u ? 'border-[#0A0A0A] shadow-[0_0_0_4px_#E8FF86]' : 'border-transparent hover:border-zinc-300'}`}>
                  <img src={u} alt="" loading="lazy" className="w-full h-full object-cover" />
                  {sel === u && <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#E8FF86] text-black grid place-items-center"><CheckIcon /></span>}
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-[13px] text-zinc-500">{ctx.hasProducts ? 'Your products have no photos yet.' : 'No product photos yet. Add products in the Products tab and their photos will show up here.'}<br /><button type="button" onClick={() => setTab('upload')} className="mt-3 underline underline-offset-4 font-semibold text-zinc-900">Upload one now</button></div>
          ))}

          {tab === 'upload' && (
            <label onDragOver={e => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); doUpload(e.dataTransfer.files?.[0]) }} className={`block rounded-3xl border-2 border-dashed py-14 px-6 text-center cursor-pointer transition ${drag ? 'border-[#0A0A0A] bg-[#E8FF86]/30' : 'border-zinc-300 hover:border-zinc-900 bg-zinc-50'}`}>
              <input type="file" accept="image/*" className="sr-only" onChange={e => doUpload(e.target.files?.[0])} disabled={busy} />
              <div className="w-12 h-12 rounded-2xl bg-[#0A0A0A] text-[#E8FF86] grid place-items-center mx-auto">{busy ? <Spinner /> : <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></svg>}</div>
              <div className="mt-4 font-semibold text-[14px]">{busy ? 'Uploading…' : 'Drop an image here, or click to browse'}</div>
              <div className="mt-1 text-[12px] text-zinc-500">PNG, JPG or WEBP up to 5MB. Wide images work best for headers.</div>
            </label>
          )}

          {tab === 'link' && (
            <div>
              <label className="block text-[12px] font-medium text-zinc-600 mb-1.5">Image URL</label>
              <input value={link} onChange={e => setLink(e.target.value)} placeholder="https://…" className={`${INPUT} font-mono !text-[12.5px]`} />
              {link && /^https?:\/\//i.test(link) && <img src={link} alt="" className="mt-4 w-full max-h-[260px] object-cover rounded-2xl border border-zinc-200/80" />}
            </div>
          )}
          {err && <div role="alert" className="mt-4 text-[12.5px] font-medium text-red-600">{err}</div>}
        </div>

        <div className="px-5 sm:px-6 py-4 border-t border-zinc-200/80 flex items-center justify-between gap-3">
          <button type="button" onClick={() => onPick('')} className="text-[12.5px] font-semibold text-zinc-500 hover:text-zinc-900 underline underline-offset-4">Use my first product photo</button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={`${BTN} h-10 px-5 border border-zinc-200 text-[12.5px] hover:bg-zinc-50`}>Cancel</button>
            <button type="button" disabled={tab === 'upload' || (tab === 'link' ? !/^https?:\/\//i.test(link) : !sel)} onClick={() => onPick(tab === 'link' ? link.trim() : sel)} className={`${BTN} h-10 px-6 bg-[#0A0A0A] text-white text-[12.5px] hover:bg-zinc-800`}>Use this image</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

function ImageField({ f, value, onChange, ctx }: { f: Field; value: string; onChange: (v: string) => void; ctx: Ctx }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <span className="block text-[12px] font-medium text-zinc-600 mb-1.5">{f.label}</span>
      <div className="flex items-stretch gap-3 p-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/60">
        <div className="w-[104px] h-[104px] shrink-0 rounded-xl overflow-hidden bg-zinc-200 grid place-items-center text-zinc-400">
          {value ? <img src={value} alt="" className="w-full h-full object-cover" /> : <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m21 16-5-5-9 9" /></svg>}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
          <div className="text-[12px] text-zinc-500 leading-snug">{value ? <span className="font-mono text-[10.5px] break-all line-clamp-2">{value}</span> : (f.hint || 'Using your first product photo.')}</div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setOpen(true)} className={`${BTN} h-9 px-4 bg-[#0A0A0A] text-white text-[12px] hover:bg-zinc-800`}>{value ? 'Change image' : 'Choose image'}</button>
            {value && <button type="button" onClick={() => onChange('')} className={`${BTN} h-9 px-4 border border-zinc-200 text-[12px] hover:bg-white`}>Remove</button>}
          </div>
        </div>
      </div>
      {value && f.hint && <span className="block text-[11.5px] text-zinc-400 mt-1.5">{f.hint}</span>}
      {open && <ImagePicker current={value} ctx={ctx} onClose={() => setOpen(false)} onPick={u => { onChange(u); setOpen(false) }} />}
    </div>
  )
}

function ToggleField({ f, value, onChange }: { f: Field; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 h-11 px-3.5 rounded-xl border border-zinc-200/80 bg-white">
      <span className="text-[13px] font-medium">{f.label}</span>
      <button type="button" role="switch" aria-checked={!!value} aria-label={f.label} onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${value ? 'bg-[#0A0A0A]' : 'bg-zinc-300'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-300 ease-[cubic-bezier(.2,.9,.25,1.2)] ${value ? 'translate-x-5 bg-[#E8FF86]' : 'bg-white'}`} />
      </button>
    </div>
  )
}

const PRESETS = ['#E8FF86', '#7C3AED', '#C9A96B', '#B5603A', '#C8321E', '#2563EB', '#10B981', '#F97316', '#EC4899', '#111111']
function ColorField({ f, value, onChange }: { f: Field; value: string; onChange: (v: string) => void }) {
  const v = /^#[0-9a-f]{6}$/i.test(value || '') ? value : '#E8FF86'
  return (
    <div>
      <span className="block text-[12px] font-medium text-zinc-600 mb-1.5">{f.label}</span>
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="relative w-11 h-11 rounded-xl overflow-hidden border border-zinc-200/80 cursor-pointer shrink-0" style={{ background: v }}><input type="color" value={v} onChange={e => onChange(e.target.value.toUpperCase())} className="absolute inset-0 opacity-0 cursor-pointer" aria-label={f.label} /></label>
        <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="#E8FF86" className={`${INPUT} !w-[118px] font-mono !text-[12.5px] uppercase`} />
        <div className="flex gap-1.5 flex-wrap">{PRESETS.map(c => <button key={c} type="button" onClick={() => onChange(c)} aria-label={`Use ${c}`} className={`w-7 h-7 rounded-full border transition hover:scale-110 ${v.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-offset-2 ring-black border-white' : 'border-black/10'}`} style={{ background: c }} />)}</div>
      </div>
      {f.hint && <span className="block text-[11.5px] text-zinc-400 mt-1.5">{f.hint}</span>}
    </div>
  )
}

function ListField({ f, value, onChange }: { f: Field; value: any[]; onChange: (v: any[]) => void }) {
  const list = Array.isArray(value) ? value : []
  const items = f.items || []
  const set = (i: number, k: string, v: string) => onChange(list.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)))
  const move = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= list.length) return; const n = [...list];[n[i], n[j]] = [n[j], n[i]]; onChange(n) }
  return (
    <div>
      <div className="flex items-center justify-between mb-2"><span className="text-[12px] font-medium text-zinc-600">{f.label}</span><span className="font-mono text-[10.5px] text-zinc-400">{list.length}{f.max ? `/${f.max}` : ''}</span></div>
      <div className="space-y-2.5">
        {list.map((it, i) => (
          <div key={i} className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-mono text-[10.5px] text-zinc-400">#{i + 1}</span>
              <div className="flex gap-1">
                <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="w-7 h-7 rounded-full hover:bg-zinc-200 disabled:opacity-30 text-[12px]">↑</button>
                <button type="button" aria-label="Move down" disabled={i === list.length - 1} onClick={() => move(i, 1)} className="w-7 h-7 rounded-full hover:bg-zinc-200 disabled:opacity-30 text-[12px]">↓</button>
                <button type="button" aria-label="Remove" onClick={() => onChange(list.filter((_, idx) => idx !== i))} className="w-7 h-7 rounded-full hover:bg-red-100 text-red-600 text-[12px]">✕</button>
              </div>
            </div>
            <div className={`grid gap-2.5 ${items.length > 1 && !items.some(x => x.multiline) ? 'sm:grid-cols-2' : ''}`}>
              {items.map(sub => sub.multiline
                ? <textarea key={sub.key} aria-label={sub.label} placeholder={sub.label} value={it?.[sub.key] || ''} onChange={e => set(i, sub.key, e.target.value)} rows={2} className={TEXTAREA} />
                : <input key={sub.key} aria-label={sub.label} placeholder={sub.placeholder || sub.label} value={it?.[sub.key] || ''} onChange={e => set(i, sub.key, e.target.value)} className={INPUT} />)}
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="text-[12px] text-zinc-400 py-2">Nothing here yet.</div>}
      </div>
      {(!f.max || list.length < f.max) && <button type="button" onClick={() => onChange([...list, Object.fromEntries(items.map(x => [x.key, '']))])} className={`${BTN} mt-3 h-9 px-4 border border-dashed border-zinc-300 text-[12px] hover:border-zinc-900 hover:bg-zinc-50`}>+ Add {f.label.toLowerCase().replace(/s$/, '')}</button>}
    </div>
  )
}

const SOCIAL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourbrand' },
  { id: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/923001234567' },
  { id: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
  { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourbrand' },
]

function SocialsField({ f, value, onChange }: { f: Field; value: any; onChange: (v: any) => void }) {
  const links = value && typeof value === 'object' ? value : {}
  const update = (id: string, patch: any) => onChange({ ...links, [id]: { ...(links[id] || { enabled: false, url: '' }), ...patch } })
  return (
    <div className="space-y-2.5">
      <span className="block text-[12px] font-medium text-zinc-600">{f.label}</span>
      {SOCIAL_PLATFORMS.map(platform => {
        const item = links[platform.id] || { enabled: false, url: '' }
        return (
          <div key={platform.id} className={`grid gap-2 rounded-2xl border p-3 sm:grid-cols-[135px_1fr] sm:items-center ${item.enabled ? 'border-zinc-900 bg-white' : 'border-zinc-200/80 bg-zinc-50/60'}`}>
            <button type="button" aria-pressed={!!item.enabled} onClick={() => update(platform.id, { enabled: !item.enabled })} className={`inline-flex h-9 items-center justify-center gap-2 rounded-full px-3 text-[12px] font-semibold transition ${item.enabled ? 'bg-[#0A0A0A] text-white' : 'border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-500'}`}>
              <span className="text-[15px] leading-none">{item.enabled ? '−' : '+'}</span>{item.enabled ? `Remove ${platform.label}` : `Add ${platform.label}`}
            </button>
            <input type="text" inputMode="url" value={item.url || ''} onChange={e => update(platform.id, { url: e.target.value })} placeholder={platform.placeholder} aria-label={`${platform.label} profile URL`} className={`${INPUT} min-w-0 font-mono !text-[11.5px]`} />
          </div>
        )
      })}
      {f.hint && <span className="block text-[11.5px] text-zinc-400">{f.hint}</span>}
    </div>
  )
}

function FieldRenderer({ f, value, onChange, ctx }: { f: Field; value: any; onChange: (v: any) => void; ctx: Ctx }) {
  const span = f.half ? '' : 'sm:col-span-2'
  let body: React.ReactNode = null
  if (f.type === 'text') body = <Field label={f.label} hint={f.hint}><input value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={f.placeholder} className={INPUT} /></Field>
  else if (f.type === 'textarea') body = <Field label={f.label} hint={f.hint}><textarea value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={f.placeholder} rows={3} className={TEXTAREA} /></Field>
  else if (f.type === 'toggle') body = <ToggleField f={f} value={value !== false} onChange={onChange} />
  else if (f.type === 'color') body = <ColorField f={f} value={value} onChange={onChange} />
  else if (f.type === 'image') body = <ImageField f={f} value={value || ''} onChange={onChange} ctx={ctx} />
  else if (f.type === 'chips') body = <div><span className="block text-[12px] font-medium text-zinc-600 mb-1.5">{f.label}</span><ChipInput value={Array.isArray(value) ? value : []} onChange={onChange} placeholder="Type and press Enter" />{f.hint && <span className="block text-[11.5px] text-zinc-400 mt-1.5">{f.hint}</span>}</div>
  else if (f.type === 'list') body = <ListField f={f} value={value} onChange={onChange} />
  else if (f.type === 'socials') body = <SocialsField f={f} value={value} onChange={onChange} />
  return <div className={span}>{body}</div>
}

export function PremiumThemeEditor({ profile, onSave }: { profile: any; onSave: (d: any) => void }) {
  const themeId = profile?.store_theme || 'spike-premium'
  const themeMeta = THEMES.find(t => t.id === themeId) || THEMES[0]
  const schema = useMemo(() => buildSchema(themeId), [themeId])
  const [custom, setCustom] = useState<any>(() => resolveContent(themeId, profile))
  const [snap, setSnap] = useState<string>(() => JSON.stringify(resolveContent(themeId, profile)))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [fieldSearch, setFieldSearch] = useState('')
  const [activeTab, setActiveTab] = useState('brand')
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [cart, setCart] = useState<any[]>([])
  const [userProducts, setUserProducts] = useState<any[]>([])
  const [uploaded, setUploaded] = useState<string[]>([])
  const [expanded, setExpanded] = useState(false)
  const [rootRef, rootSize] = useSize<HTMLDivElement>()

  // Switching theme loads that theme's saved edits (or its defaults)
  useEffect(() => {
    const next = resolveContent(themeId, profile)
    setCustom(next)
    setSnap(JSON.stringify(next))
    setActiveTab('brand')
    setFieldSearch('')
    setSaveError('')
    setSelectedProduct(null)
  }, [themeId])

  // The customer's real products power both the preview and the image gallery
  useEffect(() => {
    if (!profile?.id) return
    let alive = true
    ;(async () => {
      try {
        const { data } = await (supabase as any).from('products').select('*').eq('user_id', profile.id).order('created_at', { ascending: false })
        if (alive && Array.isArray(data)) setUserProducts(data)
      } catch { /* preview falls back to sample products */ }
    })()
    return () => { alive = false }
  }, [profile?.id])

  const update = (k: string, v: any) => {
    setSaveError('')
    setSaved(false)
    setCustom((s: any) => ({ ...s, [k]: v }))
  }
  const dirty = JSON.stringify(custom) !== snap

  const save = async () => {
    if (!profile?.id) return
    setSaving(true)
    try {
      // Keep theme-specific edits separate; migrate existing flat edits onto the currently selected theme.
      const existing = profile?.premium_custom || {}
      const themes = { ...(existing.themes || {}) }
      if (!Object.keys(themes).length && Object.keys(existing).length) {
        const { themes: _ignored, ...legacyEdits } = existing
        themes[profile?.store_theme || themeId] = legacyEdits
      }
      const themeEdits = { ...custom, spikeTitle: custom.heroTitle, spikeSub: custom.heroSubtitle, spikeBrands: custom.brands, filters: custom.brands, badge: custom.heroBadge, announcement: custom.announcement }
      themes[themeId] = themeEdits
      // Keep top-level legacy keys for older storefront code; modern renderers use the theme bucket.
      const toSave = { ...existing, ...themeEdits, themes }
      const { error } = await (supabase as any).from('profiles').update({ premium_custom: toSave }).eq('id', profile.id)
      if (error) throw error
      onSave(toSave)
      setSnap(JSON.stringify(custom))
      setSaved(true)
      setSaveError('')
      setTimeout(() => setSaved(false), 2500)
    } catch (e: any) {
      setSaveError(e?.message || 'Your theme could not be saved. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  const resetAll = () => {
    if (typeof window !== 'undefined' && !window.confirm('Reset every field in this theme back to its defaults? Your saved version stays until you press Save.')) return
    setSaveError('')
    setSaved(false)
    setFieldSearch('')
    setCustom(resolveContent(themeId, { business_name: profile?.business_name, premium_custom: {} }))
  }

  const upload = async (file: File): Promise<string> => {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    const path = `${profile.id}/theme-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error } = await (supabase as any).storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) throw error
    const { data } = (supabase as any).storage.from('product-images').getPublicUrl(path)
    setUploaded(u => [data.publicUrl, ...u])
    return data.publicUrl as string
  }

  const previewProducts = userProducts.length ? userProducts : getSampleProducts(themeId)
  const galleryImages = useMemo(() => {
    const out: string[] = []
    const add = (u: any) => { if (typeof u === 'string' && u && !out.includes(u)) out.push(u) }
    uploaded.forEach(add)
    userProducts.forEach(p => getImages(p).forEach(add))
    return out
  }, [userProducts, uploaded])
  const ctx: Ctx = { images: galleryImages, upload, hasProducts: userProducts.length > 0 }

  const liveProfile = useMemo(() => ({
    ...profile,
    business_name: profile?.business_name || 'Shoes Shalwar',
    whatsapp_number: profile?.whatsapp_number || '923000000000',
    premium_custom: custom,
  }), [profile, custom])

  const section = schema.find(s => s.id === activeTab) || schema[0]
  const searchTerm = fieldSearch.trim().toLowerCase()
  const visibleFields = section.fields.filter((field: Field) => !searchTerm || `${field.label} ${field.hint || ''}`.toLowerCase().includes(searchTerm))
  const split = rootSize.w >= 900
  const storeHost = `dukaanwhats.pk/s/${liveProfile.store_slug || liveProfile.business_name?.toLowerCase().replace(/\s/g, '') || 'store'}`

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
    <PremiumThemeRenderer
      themeId={themeId} profile={liveProfile} products={previewProducts} cart={cart} setShowCart={() => { }}
      onAdd={(p: any, q: number = 1) => setCart(prev => [...prev, ...Array.from({ length: Math.max(1, q) }, () => p)])}
      onRemove={(i: number) => setCart(prev => prev.filter((_, k) => k !== i))}
      onOpen={(p: any) => setSelectedProduct(p)} track={() => { }} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct}
    />
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

      <div className="h-[68px] px-5 md:px-6 flex items-center justify-between gap-3 bg-[#0A0A0A] text-white">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#E8FF86] text-black grid place-items-center font-extrabold text-[16px] shrink-0">{themeMeta.icon}</div>
          <div className="min-w-0">
            <div className="font-extrabold text-[15px] tracking-[-0.02em] truncate flex items-center gap-2">{themeMeta.name}{dirty && <span className="inline-flex items-center gap-1.5 h-5 px-2 rounded-full bg-white/10 text-[10px] font-semibold text-[#E8FF86]"><span className="w-1.5 h-1.5 rounded-full bg-[#E8FF86] animate-pulse" />Unsaved</span>}</div>
            <div className="font-mono text-[11px] text-white/45 truncate">{themeId} · Premium editor</div>
          </div>
        </div>
        <button type="button" onClick={save} disabled={saving || !dirty} className={`${BTN} h-10 px-5 bg-[#E8FF86] text-black text-[12.5px] hover:brightness-95 focus-visible:ring-offset-[#0A0A0A]`}>{saveLabel}</button>
      </div>

      {saveError && <div role="alert" className="mx-5 md:mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] leading-5 text-red-800">{saveError}</div>}

      <div className={split ? 'grid' : 'block'} style={split ? { gridTemplateColumns: 'minmax(0,1fr) clamp(400px, 46%, 540px)' } : undefined}>
        <div className="min-w-0 flex flex-col bg-white">
          <div role="tablist" aria-label="Sections" className="pte-ns flex gap-1.5 overflow-x-auto px-5 md:px-6 pt-5">
            {schema.map(t => (
              <button key={t.id} type="button" role="tab" aria-selected={activeTab === t.id} onClick={() => { setActiveTab(t.id); setFieldSearch('') }} className={`shrink-0 h-9 px-4 rounded-full text-[12.5px] font-semibold tracking-[-0.01em] inline-flex items-center gap-2 transition-all duration-300 ${activeTab === t.id ? 'bg-[#0A0A0A] text-white shadow-[0_8px_18px_-8px_rgba(10,10,10,0.6)]' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80'}`}>
                {activeTab === t.id && <span className="w-1.5 h-1.5 rounded-full bg-[#E8FF86]" />}{t.label}
              </button>
            ))}
          </div>
          <div className="px-5 md:px-6 mt-3 flex flex-wrap items-center justify-between gap-2 text-[12.5px] text-zinc-500"><span>{section.sub}</span><span className="font-mono text-[10.5px] text-zinc-400">{userProducts.length ? `Previewing your ${userProducts.length} product${userProducts.length > 1 ? 's' : ''}` : 'Sample products match this theme'} · edits preview here, then save to publish</span></div>

          <div key={section.id + themeId} className="pte-panel px-5 md:px-6 py-5 grid sm:grid-cols-2 gap-x-4 gap-y-5 flex-1 content-start">
            <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
              <label className="relative min-w-[220px] flex-1">
                <span className="sr-only">Find a setting in this section</span>
                <input type="search" value={fieldSearch} onChange={e => setFieldSearch(e.target.value)} placeholder={`Find a ${section.label.toLowerCase()} setting…`} className={`${INPUT} !h-10 !pl-10`} />
                <span aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">⌕</span>
              </label>
              <span className="font-mono text-[10.5px] text-zinc-400">{visibleFields.length} of {section.fields.length} settings</span>
            </div>
            {visibleFields.map((f: Field) => <FieldRenderer key={f.key} f={f} value={custom[f.key]} onChange={v => update(f.key, v)} ctx={ctx} />)}
            {!visibleFields.length && <div className="sm:col-span-2 rounded-2xl border border-dashed border-zinc-200 px-5 py-8 text-center text-[12.5px] text-zinc-500">No settings match “{fieldSearch}”. Try a different word or clear your search.</div>}
          </div>

          <div className="px-5 md:px-6 py-4 border-t border-zinc-200/80 flex flex-wrap justify-between items-center gap-3">
            <div className="flex flex-col gap-1.5">
              <button type="button" onClick={resetAll} className="self-start text-[12px] font-semibold text-zinc-500 hover:text-red-600 underline underline-offset-4 transition-colors">Reset to defaults</button>
              <span aria-live="polite" className={`text-[10.5px] ${dirty ? 'text-amber-700' : saved ? 'text-emerald-700' : 'text-zinc-400'}`}>{dirty ? 'Unsaved edits — save to publish' : saved ? 'Changes saved to your live store' : 'Your live store is up to date'}</span>
            </div>
            <button type="button" onClick={save} disabled={saving || !dirty} className={`${BTN} h-10 px-6 bg-[#0A0A0A] text-white text-[12.5px] hover:bg-zinc-800`}>{saveLabel}</button>
          </div>
        </div>

        <div className={split ? 'border-l border-zinc-200/80' : 'border-t border-zinc-200/80'} style={split ? { position: 'sticky', top: 72, alignSelf: 'start', height: 'min(calc(100vh - 96px), 900px)', minHeight: 540 } : { height: 'clamp(560px, 82vh, 820px)' }}>
          {!expanded ? pane : (
            <div className="h-full bg-[#0A0A0A] text-white grid place-items-center text-center p-6"><div><div className="text-[13px] font-semibold">Preview is open full screen</div><button type="button" onClick={() => setExpanded(false)} className={`${BTN} mt-4 h-9 px-5 bg-white/10 border border-white/15 text-white text-[12px] hover:bg-white/20`}>Bring it back</button></div></div>
          )}
        </div>
      </div>

      {expanded && typeof document !== 'undefined' && createPortal(<div className="pte-fade fixed inset-0 z-[9999] bg-[#0A0A0A] flex flex-col">{pane}</div>, document.body)}
    </div>
  )
}
