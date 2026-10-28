
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
  { id: '2', name: 'Air Max Pulse', price: 3200, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', image_urls: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'] },
  { id: '3', name: 'New Balance 550', price: 4100, image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600', image_urls: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600'] },
  { id: '4', name: 'Puma RS-X', price: 2800, image_url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600', image_urls: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600'] },
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
    promoTitle: 'GET UP TO\\n50% OFF',
    promoCta: 'Shop Sale →',
    filters: ['All','Nike','Adidas','New','Sale'],
    sizes: ['28','29','30','31','32','33','34'],
    colors: [
      { name: 'Violet', hex: '#7C3AED' },
      { name: 'Midnight', hex: '#0A0A0A' },
      { name: 'Cloud', hex: '#E8E8F0' },
      { name: 'Coral', hex: '#FF5A5A' },
      { name: 'Lime', hex: '#E8FF86' },
    ],
    memberPerksTitle: 'Free Shipping\\n+ 7 Days Return',
    memberPerksDesc: 'Early access to drops, COD & priority.',
    memberCta: 'Join Premium — Free',
    recentlyViewedLabel: 'Recently Viewed',
    heroTitle: 'Shoe App Premium',
    heroSubtitle: 'Engineered mesh, responsive foam, ultra-light.',
    ctaText: 'Add to Cart',
    heroImage: '',
  },
  'trenzo-luxury': {
    headerLabel: '✦ TRENZO • LUXURY',
    announcement: 'CONCIERGE • 24H SHIPPING • LUXURY CURATED',
    eyebrow: 'EST. 2018 • LUXURY CURATED',
    badge: '✦ LUXE',
    heroTitle: 'A reflection\\nof personal\\nstyling',
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
    heroTitle: 'Warm minimal\\nluxury, everyday\\nicon.',
    heroSubtitle: 'Soft beige tones, natural texture, premium stitch. Curated for icons.',
    ctaText: 'Shop Beige →',
    heroImage: '',
    hotBadge: 'NEW',
  },
  'sleek-dark': {
    headerLabel: 'DARK • Studio',
    announcement: 'DARK MODE • LUXURY • FREE SHIPPING • COD • 24H DISPATCH',
    badge: 'NOIR • DARK • 2024',
    heroTitle: 'Noir luxury,\\nmidnight\\nicon.',
    heroSubtitle: 'Deep black, subtle glow, premium finish. Designed for night.',
    ctaText: 'Shop Dark →',
    heroImage: '',
    hotBadge: 'HOT',
  },
  'sleek-editorial': {
    headerLabel: 'EDITORIAL • Studio',
    announcement: 'EDITORIAL • MINIMAL • LUXURY • FREE SHIPPING • COD',
    headerTopLabel: 'PREMIUM • EDITORIAL',
    badge: 'MINIMAL • 2024',
    heroTitle: 'Cool and Aakif style',
    heroSubtitle: 'Clean lines, intentional whitespace, premium finish. Less is luxury.',
    ctaText: 'Shop Editorial →',
    heroImage: '',
    hotBadge: 'NEW',
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
        <button onClick={add} className="h-11 px-5 bg-black text-white rounded-[12px] text-[12px] font-bold hover:bg-zinc-800">Add</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {value.map((b,i)=>(
          <div key={i} className="h-8 px-3.5 bg-black text-white rounded-full flex items-center gap-2 text-[11px] font-bold">
            {b}<button onClick={()=>onChange(value.filter((_,idx)=>idx!==i))} className="w-4 h-4 rounded-full bg-white/20 grid place-items-center">✕</button>
          </div>
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
  const [previewScale, setPreviewScale] = useState(0.5)
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
  },[profile?.premium_custom, themeId])

  const update = (k:string, v:any) => setCustom((s:any)=>({ ...s, [k]: v }))

  const save = async () => {
    if(!profile?.id) return
    setSaving(true)
    try {
      const toSave = {
        ...custom,
        spikeTitle: custom.heroTitle,
        spikeSub: custom.heroSubtitle,
        spikeBrands: custom.brands || custom.filters,
        announcement: custom.announcement,
      }
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
      { id: 'header', label: 'Header', sub: 'SPIKE • Shoes Shalwar' },
      { id: 'hero', label: 'Hero', sub: 'Title, subtitle, badge, image' },
      { id: 'filters', label: 'Filters', sub: 'All, Nike, Adidas...' },
      { id: 'stats', label: 'Stats', sub: '500+, 4.9★, COD' },
    ]
    if(themeId==='shoe-app-premium') return [
      { id: 'header', label: 'Header & Nav', sub: 'Logo, announcement' },
      { id: 'promo', label: 'Promo', sub: 'Black Friday banner' },
      { id: 'filters', label: 'Filters & Sizes', sub: 'Pills + EU sizes' },
      { id: 'perks', label: 'Perks Card', sub: 'Member perks' },
      { id: 'hero', label: 'Hero', sub: 'Title, image, CTA' },
    ]
    if(themeId==='trenzo-luxury') return [
      { id: 'header', label: 'Header', sub: '✦ TRENZO' },
      { id: 'hero', label: 'Hero Pill', sub: 'Title, image, luxe badge' },
      { id: 'stories', label: 'Stories', sub: '3 luxury stories' },
    ]
    return [
      { id: 'header', label: 'Header', sub: 'Top bar' },
      { id: 'hero', label: 'Hero', sub: 'Title, subtitle, image' },
    ]
  }

  const tabs = getTabs()

  return (
    <div className="mt-8 border border-zinc-200 rounded-[32px] overflow-hidden bg-white shadow-[0_16px_64px_rgba(0,0,0,0.08)]">
      {/* Top bar */}
      <div className="h-[64px] px-6 flex items-center justify-between border-b bg-[#0A0A0A] text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#E8FF86] text-black grid place-items-center font-black text-[16px]">{themeMeta.icon}</div>
          <div>
            <div className="font-black text-[14px] tracking-tight flex items-center gap-2">{themeMeta.name} Studio <span className="text-[10px] px-2 h-5 bg-white/10 rounded-full grid place-items-center border border-white/10">{themeId.toUpperCase()}</span></div>
            <div className="text-[11px] text-white/50">Theme-specific editor • Everything is editable • Real preview on right</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 bg-white/10 rounded-full p-1 border border-white/10">
            <button onClick={()=>setPreviewScale(0.45)} className={`h-7 px-3 rounded-full text-[11px] font-bold ${previewScale===0.45?'bg-white text-black':'text-white/60'}`}>Mobile</button>
            <button onClick={()=>setPreviewScale(0.65)} className={`h-7 px-3 rounded-full text-[11px] font-bold ${previewScale===0.65?'bg-white text-black':'text-white/60'}`}>Tablet</button>
            <button onClick={()=>setPreviewScale(0.9)} className={`h-7 px-3 rounded-full text-[11px] font-bold ${previewScale===0.9?'bg-white text-black':'text-white/60'}`}>Desktop</button>
          </div>
          <button onClick={save} disabled={saving} className="h-10 px-6 bg-[#E8FF86] text-black rounded-full font-black text-[12px] hover:bg-white transition-colors disabled:opacity-50">{saving ? 'Saving...' : saved ? '✓ Saved Live' : 'Save Live →'}</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px_1fr_520px] min-h-[720px]">
        {/* Left nav - theme specific */}
        <div className="border-r border-zinc-100 bg-[#FAFAF9] p-3">
          <div className="text-[10px] font-black tracking-[0.15em] text-zinc-400 px-2 py-2">THEME-SPECIFIC SECTIONS</div>
          <div className="space-y-1.5">
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`w-full text-left p-3 rounded-[14px] border transition-all ${activeTab===t.id ? 'bg-black text-white border-black shadow-lg' : 'bg-white border-zinc-200 hover:border-black hover:shadow-sm'}`}>
                <div className="font-bold text-[12px]">{t.label}</div>
                <div className={`text-[10px] mt-1 ${activeTab===t.id ? 'text-white/60' : 'text-zinc-500'}`}>{t.sub}</div>
              </button>
            ))}
          </div>
          <div className="mt-4 p-3 bg-white border rounded-[14px]">
            <div className="text-[11px] font-black">Current Theme</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {THEMES.map(th=>(
                <div key={th.id} className={`h-7 px-2.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${th.id===themeId ? 'bg-black text-white border-black' : 'bg-white border-zinc-200 text-zinc-500'}`}>
                  <span className="w-2 h-2 rounded-full" style={{ background: th.color, border: '1px solid #000' }} />{th.name}
                </div>
              ))}
            </div>
            <div className="mt-3 text-[10px] text-zinc-500">Switch theme in Theme Selector above. Editor auto-switches fields.</div>
          </div>
        </div>

        {/* Center editor */}
        <div className="p-6 overflow-auto max-h-[800px] space-y-7">
          {activeTab==='header' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-[8px] bg-black text-white grid place-items-center text-[12px]">◩</div><h3 className="font-black text-[13px]">Header & Announcement — you circled this</h3></div>
              <div>
                <label className="text-[10px] font-black tracking-widest">HEADER TEXT (top left) — SPIKE • Shoes Shalwar</label>
                <input value={custom.headerLabel || ''} onChange={e=>update('headerLabel', e.target.value)} placeholder="SPIKE • Shoes Shalwar" className="mt-2 w-full h-12 px-4 bg-white border-2 border-black rounded-[14px] text-[13px] font-bold focus:outline-none" />
                <div className="mt-2 text-[11px] px-3 py-2 bg-[#E8FF86] rounded-[10px]">Live: <b>{custom.headerLabel || 'SPIKE • Shoes Shalwar'}</b> — this fixes your red circle #1</div>
              </div>
              <div>
                <label className="text-[10px] font-black tracking-widest">ANNOUNCEMENT BAR (top black strip)</label>
                <input value={custom.announcement || ''} onChange={e=>update('announcement', e.target.value)} placeholder="EDITORIAL • MINIMAL • LUXURY • FREE SHIPPING • COD" className="mt-2 w-full h-11 px-4 bg-zinc-50 border rounded-[12px] text-[12px] outline-none focus:bg-white focus:border-black" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black">PREFIX</label>
                  <input value={custom.headerPrefix || ''} onChange={e=>update('headerPrefix', e.target.value)} placeholder="SPIKE" className="mt-1 w-full h-11 px-3 bg-zinc-50 border rounded-[12px] text-[12px] font-black outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black">BADGE / EYEBROW</label>
                  <input value={custom.heroBadge || custom.badge || custom.eyebrow || ''} onChange={e=>{ update('heroBadge', e.target.value); update('badge', e.target.value); update('eyebrow', e.target.value) }} placeholder="MINIMAL • 2024" className="mt-1 w-full h-11 px-3 bg-zinc-50 border rounded-[12px] text-[12px] outline-none" />
                </div>
              </div>
            </div>
          )}

          {activeTab==='hero' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-[8px] bg-[#7C3AED] text-white grid place-items-center text-[12px]">◧</div><h3 className="font-black text-[13px]">Hero Content</h3></div>
              <div>
                <label className="text-[10px] font-black tracking-widest">HERO TITLE (big)</label>
                <textarea value={custom.heroTitle || ''} onChange={e=>update('heroTitle', e.target.value)} rows={3} placeholder="Cool and Aakif style" className="mt-2 w-full px-4 py-3 bg-zinc-50 border rounded-[14px] text-[18px] font-black leading-[1] outline-none focus:bg-white focus:border-black resize-none" />
              </div>
              <div>
                <label className="text-[10px] font-black tracking-widest">SUBTITLE</label>
                <textarea value={custom.heroSubtitle || ''} onChange={e=>update('heroSubtitle', e.target.value)} rows={3} placeholder="Clean lines, intentional whitespace, premium finish..." className="mt-2 w-full px-4 py-3 bg-zinc-50 border rounded-[12px] text-[12px] outline-none focus:bg-white focus:border-black resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black">CTA TEXT</label>
                  <input value={custom.ctaText || ''} onChange={e=>update('ctaText', e.target.value)} placeholder="Shop Editorial →" className="mt-1 w-full h-11 px-3 bg-zinc-50 border rounded-[12px] text-[12px] font-bold outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black">FREE SHIPPING BADGE</label>
                  <input value={custom.freeShippingBadge || ''} onChange={e=>update('freeShippingBadge', e.target.value)} placeholder="FREE SHIPPING" className="mt-1 w-full h-11 px-3 bg-zinc-50 border rounded-[12px] text-[12px] outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black tracking-widest">HERO IMAGE URL</label>
                <input value={custom.heroImage || ''} onChange={e=>update('heroImage', e.target.value)} placeholder="https://... leave empty = first product image" className="mt-2 w-full h-11 px-4 bg-zinc-50 border rounded-[12px] text-[11px] font-mono outline-none focus:bg-white focus:border-black" />
                {custom.heroImage && <img src={custom.heroImage} alt="" className="mt-3 w-full h-[220px] object-cover rounded-[16px] border" />}
              </div>
              {themeId==='trenzo-luxury' && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] font-black">FEATURED LABEL</label><input value={custom.featuredLabel || ''} onChange={e=>update('featuredLabel', e.target.value)} placeholder="FEATURED • NEW" className="mt-1 w-full h-11 px-3 bg-zinc-50 border rounded-[12px] text-[12px]" /></div>
                  <div><label className="text-[10px] font-black">LUXE BADGE</label><input value={custom.luxeBadge || ''} onChange={e=>update('luxeBadge', e.target.value)} placeholder="✦ LUXE" className="mt-1 w-full h-11 px-3 bg-zinc-50 border rounded-[12px] text-[12px]" /></div>
                </div>
              )}
            </div>
          )}

          {activeTab==='filters' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-[8px] bg-red-500 text-white grid place-items-center text-[12px]">☰</div><h3 className="font-black text-[13px]">Filters — you circled this #2</h3></div>
              <div className="bg-red-50 border border-red-200 rounded-[14px] p-3 text-[11px] text-red-700">Your screenshot shows <b>All, Nike, Adidas, Puma, New Balance</b> — edit here. Click ✕ to remove, Add new.</div>
              <div>
                <label className="text-[10px] font-black tracking-widest">BRAND / FILTER PILLS</label>
                <div className="mt-2"><ChipInput value={custom.brands || custom.filters || []} onChange={v=>{ update('brands', v); update('filters', v) }} placeholder="Type e.g. Puma and press Enter" /></div>
              </div>
              {themeId==='shoe-app-premium' && (
                <div>
                  <label className="text-[10px] font-black tracking-widest">EU SIZES</label>
                  <div className="mt-2"><ChipInput value={custom.sizes || []} onChange={v=>update('sizes', v)} placeholder="e.g. 28" /></div>
                </div>
              )}
            </div>
          )}

          {activeTab==='stats' && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-[10px] font-black">ORDERS</label><input value={custom.statsOrders || ''} onChange={e=>update('statsOrders', e.target.value)} placeholder="500+" className="mt-1 w-full h-11 px-3 border rounded-[12px] font-black text-[14px]" /></div>
                <div><label className="text-[10px] font-black">RATING</label><input value={custom.statsRating || ''} onChange={e=>update('statsRating', e.target.value)} placeholder="4.9★" className="mt-1 w-full h-11 px-3 border rounded-[12px] font-black text-[14px]" /></div>
                <div><label className="text-[10px] font-black">COD</label><input value={custom.statsCod || ''} onChange={e=>update('statsCod', e.target.value)} placeholder="COD" className="mt-1 w-full h-11 px-3 border rounded-[12px] font-black text-[14px]" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-[10px] font-black">ORDERS LABEL</label><input value={custom.statsOrdersLabel || ''} onChange={e=>update('statsOrdersLabel', e.target.value)} placeholder="Orders" className="mt-1 w-full h-10 px-3 border rounded-[10px] text-[11px]" /></div>
                <div><label className="text-[10px] font-black">RATING LABEL</label><input value={custom.statsRatingLabel || ''} onChange={e=>update('statsRatingLabel', e.target.value)} placeholder="Rating" className="mt-1 w-full h-10 px-3 border rounded-[10px] text-[11px]" /></div>
                <div><label className="text-[10px] font-black">COD LABEL</label><input value={custom.statsCodLabel || ''} onChange={e=>update('statsCodLabel', e.target.value)} placeholder="Available" className="mt-1 w-full h-10 px-3 border rounded-[10px] text-[11px]" /></div>
              </div>
              <div><label className="text-[10px] font-black">HOT BADGE</label><input value={custom.hotBadge || ''} onChange={e=>update('hotBadge', e.target.value)} placeholder="HOT / NEW" className="mt-1 w-full h-11 px-3 border rounded-[12px] text-[12px]" /></div>
            </div>
          )}

          {activeTab==='promo' && (
            <div className="space-y-5">
              <div><label className="text-[10px] font-black">PROMO BADGE (BLACK FRIDAY)</label><input value={custom.promoBadge || ''} onChange={e=>update('promoBadge', e.target.value)} placeholder="BLACK FRIDAY" className="mt-1 w-full h-11 px-3 bg-zinc-50 border rounded-[12px] text-[12px] font-black" /></div>
              <div><label className="text-[10px] font-black">PROMO TITLE (supports \\n)</label><textarea value={custom.promoTitle || ''} onChange={e=>update('promoTitle', e.target.value)} rows={2} placeholder="GET UP TO\\n50% OFF" className="mt-1 w-full px-3 py-2 border rounded-[12px] text-[16px] font-black leading-[0.9]" /></div>
              <div><label className="text-[10px] font-black">PROMO CTA</label><input value={custom.promoCta || ''} onChange={e=>update('promoCta', e.target.value)} placeholder="Shop Sale →" className="mt-1 w-full h-11 px-3 border rounded-[12px] text-[12px] font-bold" /></div>
              <div><label className="text-[10px] font-black">NEW DROP LABEL</label><input value={custom.newDropLabel || ''} onChange={e=>update('newDropLabel', e.target.value)} placeholder="NEW DROP • 2024" className="mt-1 w-full h-11 px-3 border rounded-[12px] text-[12px]" /></div>
            </div>
          )}

          {activeTab==='perks' && (
            <div className="space-y-5">
              <div><label className="text-[10px] font-black">MEMBER PERKS TITLE</label><textarea value={custom.memberPerksTitle || ''} onChange={e=>update('memberPerksTitle', e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 border rounded-[12px] text-[13px] font-bold" /></div>
              <div><label className="text-[10px] font-black">MEMBER PERKS DESC</label><input value={custom.memberPerksDesc || ''} onChange={e=>update('memberPerksDesc', e.target.value)} placeholder="Early access to drops, COD & priority." className="mt-1 w-full h-11 px-3 border rounded-[12px] text-[12px]" /></div>
              <div><label className="text-[10px] font-black">MEMBER CTA</label><input value={custom.memberCta || ''} onChange={e=>update('memberCta', e.target.value)} placeholder="Join Premium — Free" className="mt-1 w-full h-11 px-3 border rounded-[12px] text-[12px] font-bold" /></div>
            </div>
          )}

          {activeTab==='stories' && (
            <div className="space-y-4">
              {(custom.stories || []).map((s:any,i:number)=>(
                <div key={i} className="bg-black text-white rounded-[16px] p-4 border">
                  <div className="text-[10px] font-black tracking-widest text-white/50">STORY #{i+1}</div>
                  <input value={s.title} onChange={e=>{ const arr=[...(custom.stories||[])]; arr[i]={...arr[i], title:e.target.value}; update('stories', arr) }} placeholder="Title" className="mt-2 w-full h-10 px-3 bg-white/10 border border-white/10 rounded-[10px] text-[12px] font-bold text-white" />
                  <input value={s.desc} onChange={e=>{ const arr=[...(custom.stories||[])]; arr[i]={...arr[i], desc:e.target.value}; update('stories', arr) }} placeholder="Description" className="mt-2 w-full h-10 px-3 bg-white/10 border border-white/10 rounded-[10px] text-[11px] text-white/70" />
                </div>
              ))}
            </div>
          )}

          <div className="pt-6 border-t flex justify-between items-center">
            <div className="text-[11px] text-zinc-500">{Object.keys(custom).length} fields • JSONB • Real preview →</div>
            <button onClick={save} className="h-11 px-7 bg-black text-white rounded-full font-bold text-[12px] hover:bg-zinc-800">{saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Live →'}</button>
          </div>
        </div>

        {/* Right - REAL preview using actual PremiumThemeRenderer */}
        <div className="bg-[#F8F7F5] border-l border-zinc-100 flex flex-col">
          <div className="h-12 px-4 border-b bg-white flex items-center justify-between">
            <div className="text-[10px] font-black tracking-[0.15em] flex items-center gap-2"><span className="w-2 h-2 bg-[#E8FF86] rounded-full animate-pulse" />REAL STORE PREVIEW — not fake</div>
            <div className="text-[10px] text-zinc-400">{themeId}</div>
          </div>
          <div className="flex-1 overflow-auto bg-[#FAFAF9] p-2">
            <div className="origin-top-left bg-white border rounded-[20px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.12)]" style={{ width: `${100/previewScale}%`, transform: `scale(${previewScale})`, transformOrigin: 'top left', height: `${100/previewScale}%` }}>
              <PremiumThemeRenderer 
                themeId={themeId}
                profile={liveProfile}
                products={MOCK_PRODUCTS}
                cart={cart}
                setShowCart={()=>{}}
                onAdd={(p:any)=>setCart(prev=>[...prev, p])}
                onOpen={(p:any)=>setSelectedProduct(p)}
                track={()=>{}}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
              />
            </div>
          </div>
          <div className="p-3 bg-black text-white text-[11px]">
            <div className="font-bold">Real renderer • Updates as you type • Click product to test modal</div>
            <div className="mt-1 text-white/60 text-[10px]">Header: <b className="text-white">{custom.headerLabel || 'SPIKE • Shoes Shalwar'}</b> • Filters: <b className="text-white">{(custom.brands || custom.filters || []).join(', ')}</b></div>
          </div>
        </div>
      </div>
    </div>
  )
}
