
'use client'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { PremiumThemeRenderer } from './PremiumThemeRenderer'

const THEMES = [
  { id: 'spike-premium', name: 'Spike Pro', color: '#0A0A0A', accent: '#E8FF86', icon: '⚡' },
  { id: 'shoe-app-premium', name: 'Shoe App Pro', color: '#7C3AED', accent: '#F2F0FF', icon: '◩' },
  { id: 'trenzo-luxury', name: 'Trenzo Luxury', color: '#141414', accent: '#FFFFFF', icon: '✦' },
  { id: 'sleek-beige', name: 'Sleek Beige', color: '#F5F1EB', accent: '#0A0A0A', icon: '◧' },
  { id: 'sleek-dark', name: 'Sleek Dark', color: '#0A0A0A', accent: '#E8FF86', icon: '◫' },
  { id: 'sleek-editorial', name: 'Editorial', color: '#FCFBF9', accent: '#0A0A0A', icon: '◩' },
]

const MOCK_PRODUCTS = [
  { id: '1', name: 'Orvion Dashboard', price: 2499, image_url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600', image_urls: ['https://images.unsplash.com/photo-1558655146-d09347e92766?w=600'] },
  { id: '2', name: 'Air Max Pulse', price: 3200, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
  { id: '3', name: 'New Balance 550', price: 4100, image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600' },
  { id: '4', name: 'Puma RS-X', price: 2800, image_url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600' },
]

const DEFAULTS: Record<string, any> = {
  'spike-premium': {
    headerLabel: 'SPIKE • Shoes Shalwar',
    headerPrefix: 'SPIKE',
    announcement: 'EDITORIAL • MINIMAL BY AAKIF • LUXURY • FREE SHIPPING • COD',
    heroBadge: 'MINIMAL • 2024',
    heroTitle: 'Cool and Aakif style',
    heroSubtitle: 'Clean lines, intentional whitespace, premium finish. Less is luxury.',
    ctaText: 'Shop Editorial →',
    brands: ['All','Nike','Adidas','Puma','New Balance'],
    statsOrders: '500+',
    statsOrdersLabel: 'Orders',
    statsRating: '4.9★',
    statsRatingLabel: 'Rating',
    statsCod: 'COD',
    statsCodLabel: 'Available',
    hotBadge: 'HOT',
    freeShippingBadge: 'FREE SHIPPING',
    heroImage: '',
  },
  'shoe-app-premium': {
    headerLabel: 'Shoe App • Premium',
    logoLetter: 'S',
    announcement: 'SHOES SHALWAR • LIVE • COD • FREE SHIPPING',
    heroBadge: 'NEW DROP • 2024',
    newDropLabel: 'NEW DROP • 2024',
    promoBadge: 'BLACK FRIDAY',
    promoTitle: 'GET UP TO\n50% OFF',
    promoCta: 'Shop Sale →',
    filters: ['All','Nike','Adidas','New','Sale'],
    sizes: ['28','29','30','31','32','33','34'],
    memberPerksTitle: 'Free Shipping\n+ 7 Days Return',
    memberPerksDesc: 'Early access to drops, COD & priority.',
    memberCta: 'Join Premium — Free',
    heroTitle: 'Shoe App Premium',
    heroSubtitle: 'Engineered mesh, responsive foam.',
    ctaText: 'Add to Cart',
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
    announcement: 'FREE SHIPPING • NEW DROP • COD • PREMIUM BEIGE COLLECTION',
    badge: 'EDITORIAL • BEIGE • 2024',
    heroTitle: 'Warm minimal\nluxury, everyday\nicon.',
    heroSubtitle: 'Soft beige tones, natural texture, premium stitch.',
    ctaText: 'Shop Beige →',
    heroImage: '',
  },
  'sleek-dark': {
    headerLabel: 'DARK • Studio',
    announcement: 'DARK MODE • LUXURY • FREE SHIPPING • COD • 24H DISPATCH',
    badge: 'NOIR • DARK • 2024',
    heroTitle: 'Noir luxury,\nmidnight\nicon.',
    heroSubtitle: 'Deep black, subtle glow, premium finish. Designed for night.',
    ctaText: 'Shop Dark →',
    heroImage: '',
  },
  'sleek-editorial': {
    headerLabel: 'EDITORIAL • Studio',
    announcement: 'EDITORIAL • MINIMAL • LUXURY • FREE SHIPPING • COD',
    headerTopLabel: 'PREMIUM • EDITORIAL',
    badge: 'MINIMAL • 2024',
    heroTitle: 'Cool and Aakif style',
    heroSubtitle: 'Clean lines, intentional whitespace, premium finish.',
    ctaText: 'Shop Editorial →',
    heroImage: '',
  },
}

function ChipInput({ value, onChange, placeholder }: { value: string[]; onChange: (v:string[])=>void; placeholder: string }) {
  const [input, setInput] = useState('')
  const add = () => {
    const v = input.trim()
    if(!v) return
    if(value.includes(v)) { setInput(''); return }
    onChange([...value, v])
    setInput('')
  }
  return (
    <div>
      <div className="flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); add() } }} placeholder={placeholder} className="flex-1 h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-[12px] text-[13px] focus:bg-white focus:border-black outline-none" />
        <button onClick={add} className="h-11 px-5 bg-black text-white rounded-[12px] text-[12px] font-bold">Add</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {value.map((b,i)=>(
          <div key={i} className="h-8 px-3.5 bg-black text-white rounded-full flex items-center gap-2 text-[11px] font-bold">{b}<button onClick={()=>onChange(value.filter((_,idx)=>idx!==i))} className="w-4 h-4 rounded-full bg-white/20 grid place-items-center">✕</button></div>
        ))}
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
  const [device, setDevice] = useState<'mobile'|'tablet'|'desktop'>('desktop')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [cart, setCart] = useState<any[]>([])

  useEffect(()=>{
    const base = profile?.premium_custom || {}
    const merged = { ...defaults, ...base }
    if (base.spikeTitle && !merged.heroTitle) merged.heroTitle = base.spikeTitle
    if (base.spikeSub && !merged.heroSubtitle) merged.heroSubtitle = base.spikeSub
    if (base.spikeBrands && !merged.brands) merged.brands = base.spikeBrands
    if (base.spikeBrands && !merged.filters) merged.filters = base.spikeBrands
    setCustom(merged)
    setActiveTab('header')
  },[themeId, profile?.premium_custom])

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
      { id: 'header', label: 'Header', sub: 'SPIKE • Shoes Shalwar — your red circle #1' },
      { id: 'hero', label: 'Hero', sub: 'Title, subtitle, badge, image, CTA' },
      { id: 'filters', label: 'Filters', sub: 'All, Nike, Adidas — your red circle #2' },
      { id: 'stats', label: 'Stats & Badges', sub: '500+, 4.9★, COD, HOT, FREE SHIPPING' },
    ]
    if(themeId==='shoe-app-premium') return [
      { id: 'header', label: 'Header', sub: 'Logo S, announcement LIVE • COD' },
      { id: 'promo', label: 'Promo Banner', sub: 'BLACK FRIDAY • 50% OFF • blue card' },
      { id: 'filters', label: 'Filters & Sizes', sub: 'Pills + EU 28-34 + 5 colors' },
      { id: 'perks', label: 'Member Perks', sub: 'Free Shipping + 7 Days Return card' },
      { id: 'hero', label: 'Hero', sub: 'Image, CTA' },
    ]
    if(themeId==='trenzo-luxury') return [
      { id: 'header', label: 'Header', sub: '✦ TRENZO • LUXURY' },
      { id: 'hero', label: 'Hero Pill', sub: 'Title, image 360x500, LUXE badge, FEATURED' },
      { id: 'stories', label: 'Stories', sub: 'Craftsmanship / Heritage / Sustainability' },
    ]
    if(themeId.startsWith('sleek-')) return [
      { id: 'header', label: 'Header', sub: 'BEIGE/DARK/EDITORIAL • Studio + announcement' },
      { id: 'hero', label: 'Hero Minimal', sub: 'Badge, multiline title, pill image, CTA' },
    ]
    return [{ id: 'header', label: 'Header', sub: 'Top bar' }]
  }

  const tabs = getTabs()

  const deviceConfig = {
    mobile: { w: 390, h: 844, label: 'iPhone 15 Pro • 390×844' },
    tablet: { w: 768, h: 1024, label: 'iPad Pro • 768×1024' },
    desktop: { w: 1280, h: 800, label: 'MacBook Pro • 1280×800' },
  }[device]

  return (
    <div id="premium-editor-anchor" className="mt-8 border border-zinc-200 rounded-[32px] overflow-hidden bg-white shadow-[0_16px_64px_rgba(0,0,0,0.08)]">
      <div className="h-[64px] px-6 flex items-center justify-between border-b bg-[#0A0A0A] text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#E8FF86] text-black grid place-items-center font-black text-[16px]">{themeMeta.icon}</div>
          <div>
            <div className="font-black text-[14px] flex items-center gap-2">{themeMeta.name} Studio <span className="text-[10px] px-2 h-5 bg-white/10 rounded-full grid place-items-center border border-white/10 animate-pulse">{themeId.toUpperCase()} • EDITING</span></div>
            <div className="text-[11px] text-white/50">Theme-specific editor • Only shows what this theme actually uses • Real device preview →</div>
          </div>
        </div>
        <button onClick={save} disabled={saving} className="h-10 px-6 bg-[#E8FF86] text-black rounded-full font-black text-[12px] hover:bg-white transition-colors disabled:opacity-50">{saving ? 'Saving...' : saved ? '✓ Saved Live' : 'Save Live →'}</button>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] xl:grid-cols-[300px_1fr_560px] min-h-[760px]">
        <div className="border-r border-zinc-100 bg-[#FAFAF9] p-3">
          <div className="text-[10px] font-black tracking-[0.15em] text-zinc-400 px-2 py-2">THEME-SPECIFIC • {themeId.toUpperCase()} ONLY</div>
          <div className="space-y-1.5">
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`w-full text-left p-3 rounded-[14px] border transition-all ${activeTab===t.id ? 'bg-black text-white border-black shadow-lg' : 'bg-white border-zinc-200 hover:border-black'}`}>
                <div className="font-bold text-[12px]">{t.label}</div>
                <div className={`text-[10px] mt-1 ${activeTab===t.id ? 'text-white/60' : 'text-zinc-500'}`}>{t.sub}</div>
              </button>
            ))}
          </div>
          <div className="mt-6 p-3 bg-black text-white rounded-[16px]">
            <div className="text-[11px] font-black">This is {themeMeta.name} editor</div>
            <div className="mt-2 text-[10px] text-white/60 leading-[1.5]">Other themes have different fields. Click any theme in Glass Collection → this panel switches automatically. Spike shows Filters (All,Nike...), Shoe App shows Promo Blue Card, Trenzo shows Stories.</div>
          </div>
        </div>

        <div className="p-6 overflow-auto max-h-[900px] space-y-7 bg-white">
          {activeTab==='header' && (
            <div className="space-y-5">
              <h3 className="font-black text-[14px] flex items-center gap-2"><span className="w-7 h-7 bg-black text-white rounded-[8px] grid place-items-center text-[12px]">◩</span>Header — theme specific for {themeId}</h3>
              {themeId==='spike-premium' && (
                <>
                  <div>
                    <label className="text-[10px] font-black tracking-widest">HEADER TEXT — fixes your red circle #1 — e.g. SPIKE • Shoes Shalwar</label>
                    <input value={custom.headerLabel || ''} onChange={e=>update('headerLabel', e.target.value)} placeholder="SPIKE • Shoes Shalwar" className="mt-2 w-full h-12 px-4 bg-white border-2 border-black rounded-[14px] text-[13px] font-bold outline-none" />
                    <div className="mt-2 text-[11px] px-3 py-2 bg-[#E8FF86] rounded-[10px]">Live: <b>{custom.headerLabel || 'SPIKE • Shoes Shalwar'}</b></div>
                  </div>
                  <div><label className="text-[10px] font-black">ANNOUNCEMENT BAR (top black marquee)</label><input value={custom.announcement || ''} onChange={e=>update('announcement', e.target.value)} placeholder="EDITORIAL • MINIMAL BY AAKIF • LUXURY • FREE SHIPPING • COD" className="mt-2 w-full h-11 px-4 bg-zinc-50 border rounded-[12px] text-[12px] outline-none" /></div>
                </>
              )}
              {themeId==='shoe-app-premium' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[10px] font-black">LOGO LETTER</label><input value={custom.logoLetter || ''} onChange={e=>update('logoLetter', e.target.value)} placeholder="S" className="mt-1 w-full h-11 px-3 bg-zinc-50 border rounded-[12px] text-[14px] font-black" /></div>
                    <div><label className="text-[10px] font-black">HEADER LABEL</label><input value={custom.headerLabel || ''} onChange={e=>update('headerLabel', e.target.value)} placeholder="Shoe App • Premium" className="mt-1 w-full h-11 px-3 bg-zinc-50 border rounded-[12px] text-[12px]" /></div>
                  </div>
                  <div><label className="text-[10px] font-black">ANNOUNCEMENT — LIVE • COD • FREE SHIPPING</label><input value={custom.announcement || ''} onChange={e=>update('announcement', e.target.value)} className="mt-2 w-full h-11 px-4 bg-zinc-50 border rounded-[12px] text-[12px]" /></div>
                </>
              )}
              {themeId==='trenzo-luxury' && (
                <>
                  <div><label className="text-[10px] font-black">HEADER — ✦ TRENZO • LUXURY</label><input value={custom.headerLabel || ''} onChange={e=>update('headerLabel', e.target.value)} placeholder="✦ TRENZO • LUXURY" className="mt-2 w-full h-11 px-4 bg-zinc-50 border rounded-[12px] text-[12px] font-black" /></div>
                  <div><label className="text-[10px] font-black">ANNOUNCEMENT — CONCIERGE • 24H SHIPPING</label><input value={custom.announcement || ''} onChange={e=>update('announcement', e.target.value)} className="mt-2 w-full h-11 px-4 bg-zinc-50 border rounded-[12px] text-[12px]" /></div>
                  <div><label className="text-[10px] font-black">EYEBROW — EST. 2018 • LUXURY CURATED</label><input value={custom.eyebrow || ''} onChange={e=>update('eyebrow', e.target.value)} className="mt-2 w-full h-11 px-4 bg-zinc-50 border rounded-[12px] text-[12px]" /></div>
                </>
              )}
              {(themeId==='sleek-beige' || themeId==='sleek-dark' || themeId==='sleek-editorial') && (
                <>
                  <div><label className="text-[10px] font-black">HEADER LABEL — BEIGE/DARK/EDITORIAL • Studio</label><input value={custom.headerLabel || ''} onChange={e=>update('headerLabel', e.target.value)} placeholder={themeId==='sleek-beige' ? 'BEIGE • Studio' : themeId==='sleek-dark' ? 'DARK • Studio' : 'EDITORIAL • Studio'} className="mt-2 w-full h-11 px-4 bg-zinc-50 border rounded-[12px] text-[12px] font-black" /></div>
                  {themeId==='sleek-editorial' && <div><label className="text-[10px] font-black">HEADER TOP LABEL — PREMIUM • EDITORIAL</label><input value={custom.headerTopLabel || ''} onChange={e=>update('headerTopLabel', e.target.value)} placeholder="PREMIUM • EDITORIAL" className="mt-2 w-full h-11 px-4 bg-zinc-50 border rounded-[12px] text-[12px]" /></div>}
                  <div><label className="text-[10px] font-black">ANNOUNCEMENT BAR</label><input value={custom.announcement || ''} onChange={e=>update('announcement', e.target.value)} className="mt-2 w-full h-11 px-4 bg-zinc-50 border rounded-[12px] text-[12px]" /></div>
                  <div><label className="text-[10px] font-black">BADGE — EDITORIAL • BEIGE • 2024 / NOIR • DARK • 2024 / MINIMAL • 2024</label><input value={custom.badge || custom.heroBadge || ''} onChange={e=>{ update('badge', e.target.value); update('heroBadge', e.target.value) }} className="mt-2 w-full h-11 px-4 bg-zinc-50 border rounded-[12px] text-[12px] font-bold" /></div>
                </>
              )}
            </div>
          )}

          {activeTab==='hero' && (
            <div className="space-y-5">
              <h3 className="font-black text-[14px]">Hero — {themeMeta.name} only</h3>
              <div><label className="text-[10px] font-black">HERO TITLE — use \n for line break</label><textarea value={custom.heroTitle || ''} onChange={e=>update('heroTitle', e.target.value)} rows={3} placeholder="Cool and Aakif style" className="mt-2 w-full px-4 py-3 bg-zinc-50 border rounded-[14px] text-[20px] font-black leading-[0.9] outline-none resize-none" /></div>
              <div><label className="text-[10px] font-black">SUBTITLE</label><textarea value={custom.heroSubtitle || ''} onChange={e=>update('heroSubtitle', e.target.value)} rows={2} placeholder="Clean lines, intentional whitespace..." className="mt-2 w-full px-4 py-3 bg-zinc-50 border rounded-[12px] text-[12px] outline-none resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-black">CTA TEXT</label><input value={custom.ctaText || ''} onChange={e=>update('ctaText', e.target.value)} placeholder="Shop Editorial →" className="mt-1 w-full h-11 px-3 bg-zinc-50 border rounded-[12px] text-[12px] font-bold" /></div>
                <div><label className="text-[10px] font-black">HERO IMAGE URL</label><input value={custom.heroImage || ''} onChange={e=>update('heroImage', e.target.value)} placeholder="https://... leave empty = product" className="mt-1 w-full h-11 px-3 bg-zinc-50 border rounded-[12px] text-[10px] font-mono" /></div>
              </div>
              {custom.heroImage && <img src={custom.heroImage} className="w-full h-[220px] object-cover rounded-[16px] border" alt="" />}
              {themeId==='trenzo-luxury' && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] font-black">FEATURED LABEL — FEATURED • NEW</label><input value={custom.featuredLabel || ''} onChange={e=>update('featuredLabel', e.target.value)} className="mt-1 w-full h-11 px-3 bg-zinc-50 border rounded-[12px] text-[12px]" /></div>
                  <div><label className="text-[10px] font-black">LUXE BADGE — ✦ LUXE circle</label><input value={custom.luxeBadge || ''} onChange={e=>update('luxeBadge', e.target.value)} className="mt-1 w-full h-11 px-3 bg-zinc-50 border rounded-[12px] text-[12px]" /></div>
                </div>
              )}
            </div>
          )}

          {activeTab==='filters' && (
            <div className="space-y-5">
              <h3 className="font-black text-[14px]">{themeId==='shoe-app-premium' ? 'Filters, Sizes & Colors — Shoe App only' : 'Filters — Spike only — your red circle #2'}</h3>
              <div className="bg-red-50 border border-red-200 rounded-[12px] p-3 text-[11px] text-red-700">Your screenshot shows <b>All, Nike, Adidas, Puma, New Balance</b> — this is Spike filter. Edit here. Click ✕ to remove.</div>
              <ChipInput value={custom.brands || custom.filters || []} onChange={v=>{ update('brands', v); update('filters', v) }} placeholder="Type brand and press Enter" />
              {themeId==='shoe-app-premium' && (
                <div className="pt-4 border-t space-y-4">
                  <div><label className="text-[10px] font-black">EU SIZES — 28-34 — only for Shoe App</label><div className="mt-2"><ChipInput value={custom.sizes || []} onChange={v=>update('sizes', v)} placeholder="e.g. 28" /></div></div>
                </div>
              )}
            </div>
          )}

          {activeTab==='stats' && (
            <div className="space-y-4">
              <h3 className="font-black text-[14px]">Stats & Badges — Spike only</h3>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-[10px] font-black">500+</label><input value={custom.statsOrders || ''} onChange={e=>update('statsOrders', e.target.value)} className="mt-1 w-full h-11 px-3 border rounded-[12px] font-black" /></div>
                <div><label className="text-[10px] font-black">4.9★</label><input value={custom.statsRating || ''} onChange={e=>update('statsRating', e.target.value)} className="mt-1 w-full h-11 px-3 border rounded-[12px] font-black" /></div>
                <div><label className="text-[10px] font-black">COD</label><input value={custom.statsCod || ''} onChange={e=>update('statsCod', e.target.value)} className="mt-1 w-full h-11 px-3 border rounded-[12px] font-black" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-[10px] font-black">Orders Label</label><input value={custom.statsOrdersLabel || ''} onChange={e=>update('statsOrdersLabel', e.target.value)} placeholder="Orders" className="mt-1 w-full h-10 px-3 border rounded-[10px] text-[11px]" /></div>
                <div><label className="text-[10px] font-black">Rating Label</label><input value={custom.statsRatingLabel || ''} onChange={e=>update('statsRatingLabel', e.target.value)} placeholder="Rating" className="mt-1 w-full h-10 px-3 border rounded-[10px] text-[11px]" /></div>
                <div><label className="text-[10px] font-black">Available Label</label><input value={custom.statsCodLabel || ''} onChange={e=>update('statsCodLabel', e.target.value)} placeholder="Available" className="mt-1 w-full h-10 px-3 border rounded-[10px] text-[11px]" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-black">HOT BADGE — HOT/NEW</label><input value={custom.hotBadge || ''} onChange={e=>update('hotBadge', e.target.value)} placeholder="HOT" className="mt-1 w-full h-11 px-3 border rounded-[12px] text-[12px]" /></div>
                <div><label className="text-[10px] font-black">FREE SHIPPING BADGE</label><input value={custom.freeShippingBadge || ''} onChange={e=>update('freeShippingBadge', e.target.value)} placeholder="FREE SHIPPING" className="mt-1 w-full h-11 px-3 border rounded-[12px] text-[12px]" /></div>
              </div>
            </div>
          )}

          {activeTab==='promo' && (
            <div className="space-y-4">
              <h3 className="font-black text-[14px]">Promo Banner — Shoe App only — blue card</h3>
              <div><label className="text-[10px] font-black">BLACK FRIDAY BADGE</label><input value={custom.promoBadge || ''} onChange={e=>update('promoBadge', e.target.value)} className="mt-1 w-full h-11 px-3 bg-zinc-50 border rounded-[12px] font-black text-[12px]" /></div>
              <div><label className="text-[10px] font-black">TITLE — GET UP TO\n50% OFF — use \n</label><textarea value={custom.promoTitle || ''} onChange={e=>update('promoTitle', e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 border rounded-[12px] text-[16px] font-black" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-black">CTA — Shop Sale →</label><input value={custom.promoCta || ''} onChange={e=>update('promoCta', e.target.value)} className="mt-1 w-full h-11 px-3 border rounded-[12px] text-[12px] font-bold" /></div>
                <div><label className="text-[10px] font-black">NEW DROP LABEL</label><input value={custom.newDropLabel || ''} onChange={e=>update('newDropLabel', e.target.value)} placeholder="NEW DROP • 2024" className="mt-1 w-full h-11 px-3 border rounded-[12px] text-[12px]" /></div>
              </div>
            </div>
          )}

          {activeTab==='perks' && (
            <div className="space-y-4">
              <h3 className="font-black text-[14px]">Member Perks Card — Shoe App only — black card</h3>
              <div><label className="text-[10px] font-black">TITLE — Free Shipping\n+ 7 Days Return</label><textarea value={custom.memberPerksTitle || ''} onChange={e=>update('memberPerksTitle', e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 border rounded-[12px] font-bold" /></div>
              <div><label className="text-[10px] font-black">DESC — Early access to drops...</label><input value={custom.memberPerksDesc || ''} onChange={e=>update('memberPerksDesc', e.target.value)} className="mt-1 w-full h-11 px-3 border rounded-[12px] text-[12px]" /></div>
              <div><label className="text-[10px] font-black">CTA — Join Premium — Free</label><input value={custom.memberCta || ''} onChange={e=>update('memberCta', e.target.value)} className="mt-1 w-full h-11 px-3 border rounded-[12px] text-[12px] font-bold" /></div>
            </div>
          )}

          {activeTab==='stories' && (
            <div className="space-y-3">
              <h3 className="font-black text-[14px]">Stories — Trenzo Luxury only — 3 black cards</h3>
              {(custom.stories || []).map((s:any,i:number)=>(
                <div key={i} className="bg-black text-white rounded-[16px] p-4">
                  <div className="text-[10px] font-black text-white/50">STORY #{i+1} — {['Craftsmanship','Heritage','Sustainability'][i]}</div>
                  <input value={s.title} onChange={e=>{ const arr=[...(custom.stories||[])]; arr[i]={...arr[i], title:e.target.value}; update('stories', arr) }} className="mt-2 w-full h-10 px-3 bg-white/10 border border-white/10 rounded-[10px] text-[12px] font-bold text-white" />
                  <input value={s.desc} onChange={e=>{ const arr=[...(custom.stories||[])]; arr[i]={...arr[i], desc:e.target.value}; update('stories', arr) }} className="mt-2 w-full h-10 px-3 bg-white/10 border border-white/10 rounded-[10px] text-[11px] text-white/70" />
                </div>
              ))}
            </div>
          )}

          <div className="pt-6 border-t flex justify-between items-center">
            <div className="text-[11px] text-zinc-500">{Object.keys(custom).length} fields • {themeId} only • Real preview →</div>
            <button onClick={save} className="h-11 px-7 bg-black text-white rounded-full font-bold text-[12px]">{saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Live →'}</button>
          </div>
        </div>

        <div className="bg-[#0A0A0A] flex flex-col xl:col-span-1 col-span-1 lg:col-span-2">
          <div className="h-[56px] px-4 bg-[#141414] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#E8FF86] rounded-full animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.15em] text-white">REAL {themeId.toUpperCase()}</span>
              <span className="text-[9px] px-2 h-5 bg-white/10 border border-white/10 rounded-full text-white/60 grid place-items-center">{deviceConfig.label}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/10 rounded-full p-1 border border-white/10">
              <button onClick={()=>setDevice('mobile')} className={`h-7 px-3 rounded-full text-[10px] font-bold ${device==='mobile'?'bg-white text-black':'text-white/60'}`}>Mobile</button>
              <button onClick={()=>setDevice('tablet')} className={`h-7 px-3 rounded-full text-[10px] font-bold ${device==='tablet'?'bg-white text-black':'text-white/60'}`}>Tablet</button>
              <button onClick={()=>setDevice('desktop')} className={`h-7 px-3 rounded-full text-[10px] font-bold ${device==='desktop'?'bg-white text-black':'text-white/60'}`}>Desktop</button>
            </div>
          </div>

          <div className="flex-1 bg-[#0A0A0A] p-4 flex items-center justify-center overflow-auto">
            {device==='mobile' && (
              <div className="relative bg-black rounded-[54px] p-[10px] shadow-[0_32px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.1)] border border-white/10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-b-[16px] z-20 grid place-items-center"><div className="w-14 h-1 bg-white/20 rounded-full" /></div>
                <div className="w-[390px] h-[844px] bg-white rounded-[44px] overflow-hidden relative">
                  <div className="w-full h-full overflow-auto scrollbar-none">
                    <PremiumThemeRenderer themeId={themeId} profile={liveProfile} products={MOCK_PRODUCTS} cart={cart} setShowCart={()=>{}} onAdd={(p:any)=>setCart(prev=>[...prev,p])} onOpen={(p:any)=>setSelectedProduct(p)} track={()=>{}} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} />
                  </div>
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[120px] h-1 bg-white/30 rounded-full" />
              </div>
            )}
            {device==='tablet' && (
              <div className="relative bg-[#1A1A1A] rounded-[24px] p-3 shadow-[0_32px_80px_rgba(0,0,0,0.5)] border border-white/10">
                <div className="w-[768px] h-[1024px] bg-white rounded-[16px] overflow-hidden">
                  <div className="w-full h-full overflow-auto">
                    <PremiumThemeRenderer themeId={themeId} profile={liveProfile} products={MOCK_PRODUCTS} cart={cart} setShowCart={()=>{}} onAdd={(p:any)=>setCart(prev=>[...prev,p])} onOpen={(p:any)=>setSelectedProduct(p)} track={()=>{}} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} />
                  </div>
                </div>
              </div>
            )}
            {device==='desktop' && (
              <div className="w-full max-w-[1280px] bg-[#1E1E1E] rounded-[12px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.5)] border border-white/10">
                <div className="h-10 bg-[#2D2D2D] flex items-center px-4 gap-2 border-b border-white/10">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-[#FF5F56]" /><div className="w-3 h-3 rounded-full bg-[#FFBD2E]" /><div className="w-3 h-3 rounded-full bg-[#27C93F]" /></div>
                  <div className="ml-4 flex-1 h-7 bg-[#1A1A1A] rounded-full flex items-center px-3 text-[11px] text-white/40">dukaanwhats.pk/s/{liveProfile.business_name?.toLowerCase().replace(/\s/g,'') || 'premiumstore'} • {themeId}</div>
                </div>
                <div className="w-full h-[800px] bg-white overflow-auto">
                  <PremiumThemeRenderer themeId={themeId} profile={liveProfile} products={MOCK_PRODUCTS} cart={cart} setShowCart={()=>{}} onAdd={(p:any)=>setCart(prev=>[...prev,p])} onOpen={(p:any)=>setSelectedProduct(p)} track={()=>{}} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} />
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-[#141414] border-t border-white/10 text-[10px] text-white/50">
            <div className="flex justify-between"><span>Real <b className="text-white">{themeId}</b> • {deviceConfig.w}×{deviceConfig.h} • Theme-specific</span><span className="text-[#E8FF86]">● Live</span></div>
            <div className="mt-1 truncate">Header: <b className="text-white">{custom.headerLabel}</b> • Filters: <b className="text-white">{(custom.brands || custom.filters || []).join(', ')}</b></div>
          </div>
        </div>
      </div>
    </div>
  )
}
