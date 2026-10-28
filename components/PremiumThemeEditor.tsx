
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const THEMES = [
  { id: 'spike-premium', name: 'Spike Pro', color: '#0A0A0A', accent: '#E8FF86', desc: 'Gallery + Filters + Stats' },
  { id: 'shoe-app-premium', name: 'Shoe App Pro', color: '#7C3AED', accent: '#F2F0FF', desc: 'Violet • Sizes • Colors • Promo' },
  { id: 'trenzo-luxury', name: 'Trenzo Luxury', color: '#141414', accent: '#FFFFFF', desc: 'Pill Image • Stories • Luxe' },
  { id: 'sleek-beige', name: 'Sleek Beige', color: '#F5F1EB', accent: '#0A0A0A', desc: 'Warm Minimal • Beige' },
  { id: 'sleek-dark', name: 'Sleek Dark', color: '#0A0A0A', accent: '#E8FF86', desc: 'Noir Luxury • Dark' },
  { id: 'sleek-editorial', name: 'Sleek Editorial', color: '#FCFBF9', accent: '#0A0A0A', desc: 'Less but Better • Editorial' },
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
    sizeLabel: 'SIZE',
    sizes: ['40','41','42','43','44'],
  },
  'shoe-app-premium': {
    headerLabel: 'S • Shoe App',
    logoLetter: 'S',
    announcement: 'LIVE • COD • FREE SHIPPING OVER 5000',
    heroBadge: 'NEW DROP • 2024',
    newDropLabel: 'NEW DROP • 2024',
    heroTitle: 'Shoe App Premium',
    heroSubtitle: 'Engineered mesh, responsive foam, ultra-light.',
    promoBadge: 'BLACK FRIDAY',
    promoTitle: 'GET UP TO\n50% OFF',
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
    memberPerksTitle: 'Free Shipping\n+ 7 Days Return',
    memberPerksDesc: 'Early access to drops, COD & priority.',
    memberCta: 'Join Premium — Free',
    recentlyViewedLabel: 'Recently Viewed',
    cartTitle: 'Your Bag',
    ctaText: 'Add — Rs. 5,000',
    whatsappButton: 'WhatsApp Order',
    keepShopping: 'Keep Shopping',
    heroImage: '',
  },
  'trenzo-luxury': {
    headerLabel: '✦ TRENZO • LUXURY',
    announcement: 'CONCIERGE • 24H SHIPPING • LUXURY CURATED',
    eyebrow: 'EST. 2018 • LUXURY CURATED',
    heroTitle: 'A reflection\nof personal\nstyling',
    heroSubtitle: 'Premium curated collection. Hand-finished, ethically sourced. Each piece tells a story of craftsmanship.',
    ctaText: 'Explore Collection →',
    featuredLabel: 'FEATURED • NEW',
    luxeBadge: '✦ LUXE',
    heroImage: '',
    stories: [
      { title: 'Craftsmanship', desc: 'Hand-stitched, 48h process, premium hide' },
      { title: 'Heritage', desc: 'Since 2018, curated for modern icons' },
      { title: 'Sustainability', desc: 'Ethically sourced, carbon neutral' },
    ],
    productLabel: 'FEATURED',
  },
  'sleek-beige': {
    headerLabel: 'BEIGE • Studio',
    announcement: 'FREE SHIPPING • NEW DROP • COD • PREMIUM BEIGE COLLECTION',
    badge: 'EDITORIAL • BEIGE • 2024',
    heroTitle: 'Warm minimal\nluxury, everyday\nicon.',
    heroSubtitle: 'Soft beige tones, natural texture, premium stitch. Curated for icons.',
    ctaText: 'Shop Beige →',
    heroImage: '',
    hotBadge: 'NEW',
    newBadge: 'NEW',
  },
  'sleek-dark': {
    headerLabel: 'DARK • Studio',
    announcement: 'DARK MODE • LUXURY • FREE SHIPPING • COD • 24H DISPATCH',
    badge: 'NOIR • DARK • 2024',
    heroTitle: 'Noir luxury,\nmidnight\nicon.',
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
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); add() } }} placeholder={placeholder} className="flex-1 h-10 px-3 bg-white border border-zinc-200 rounded-[10px] text-[12px] focus:outline-none focus:border-black" />
        <button onClick={add} className="h-10 px-4 bg-black text-white rounded-[10px] text-[11px] font-bold">Add</button>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {value.map((b,i)=>(
          <div key={i} className="h-7 px-3 bg-zinc-900 text-white rounded-full flex items-center gap-1.5 text-[11px] font-bold">
            {b}<button onClick={()=>onChange(value.filter((_,idx)=>idx!==i))} className="w-4 h-4 rounded-full bg-white/20 grid place-items-center">✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function ColorEditor({ value, onChange }: { value: { name: string; hex: string }[]; onChange: (v:any)=>void }) {
  const [name, setName] = useState('')
  const [hex, setHex] = useState('#7C3AED')
  const add = () => {
    if(!name.trim()) return
    onChange([...value, { name: name.trim(), hex }])
    setName('')
  }
  return (
    <div>
      <div className="flex gap-2">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Color name e.g. Violet" className="flex-1 h-10 px-3 border rounded-[10px] text-[12px]" />
        <input type="color" value={hex} onChange={e=>setHex(e.target.value)} className="w-10 h-10 rounded-[10px] border p-1" />
        <button onClick={add} className="h-10 px-4 bg-black text-white rounded-[10px] text-[11px] font-bold">Add</button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {value.map((c,i)=>(
          <div key={i} className="h-7 px-2.5 border rounded-full flex items-center gap-1.5 text-[11px] bg-white">
            <span className="w-3.5 h-3.5 rounded-full border" style={{ background: c.hex }} />
            {c.name}
            <button onClick={()=>onChange(value.filter((_,idx)=>idx!==i))} className="ml-1 w-4 h-4 rounded-full bg-zinc-100 grid place-items-center">✕</button>
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
  const [activeSection, setActiveSection] = useState('header')

  useEffect(()=>{
    const base = profile?.premium_custom || {}
    const merged = { ...defaults, ...base }
    if (base.spikeTitle && !merged.heroTitle) merged.heroTitle = base.spikeTitle
    if (base.spikeSub && !merged.heroSubtitle) merged.heroSubtitle = base.spikeSub
    if (base.spikeBrands && !merged.brands) merged.brands = base.spikeBrands
    setCustom(merged)
  },[profile?.premium_custom, themeId])

  const update = (k:string, v:any) => setCustom((s:any)=>({ ...s, [k]: v }))
  const updateNested = (parent:string, idx:number, field:string, v:string) => {
    const arr = [...(custom[parent] || [])]
    arr[idx] = { ...arr[idx], [field]: v }
    update(parent, arr)
  }

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

  const sectionsForTheme = (id:string) => {
    if(id==='spike-premium') return [
      { id: 'header', label: 'Header & Announcement', icon: '◩', desc: 'Logo, marquee, badge' },
      { id: 'hero', label: 'Hero Content', icon: '◧', desc: 'Title, subtitle, CTA, image' },
      { id: 'filters', label: 'Filters & Brands', icon: '☰', desc: 'Pills you circled in red' },
      { id: 'stats', label: 'Stats & Badges', icon: '◫', desc: '500+, Rating, COD, HOT' },
    ]
    if(id==='shoe-app-premium') return [
      { id: 'header', label: 'Header & Nav', icon: '◩', desc: 'Logo, announcement, cart' },
      { id: 'promo', label: 'Promo Banner', icon: '⚡', desc: 'Black Friday, 50% OFF' },
      { id: 'filters', label: 'Filters & Sizes', icon: '☰', desc: 'All/Nike/Adidas + EU sizes' },
      { id: 'colors', label: 'Colors', icon: '◍', desc: '5 colors with hex' },
      { id: 'perks', label: 'Member Perks Card', icon: '♡', desc: 'Free shipping card' },
      { id: 'hero', label: 'Hero & CTA', icon: '◧', desc: 'Title, image, buttons' },
    ]
    if(id==='trenzo-luxury') return [
      { id: 'header', label: 'Header & Announcement', icon: '◩', desc: 'TRENZO • Luxury, concierge' },
      { id: 'hero', label: 'Hero Pill', icon: '◧', desc: 'Title, subtitle, pill image, badges' },
      { id: 'stories', label: 'Stories (3)', icon: '≡', desc: 'Craftsmanship, Heritage, Sustainability' },
      { id: 'labels', label: 'Labels & Badges', icon: '✦', desc: 'FEATURED, LUXE' },
    ]
    return [
      { id: 'header', label: 'Header & Announcement', icon: '◩', desc: 'Top bar + header' },
      { id: 'hero', label: 'Hero Minimal', icon: '◧', desc: 'Badge, title, subtitle, CTA' },
      { id: 'media', label: 'Media', icon: '◫', desc: 'Hero image, HOT/NEW badges' },
    ]
  }

  const sections = sectionsForTheme(themeId)

  return (
    <div className="mt-6 bg-white border border-zinc-200 rounded-[28px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: themeMeta.color }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='white'/%3E%3C/svg%3E")` }} />
        <div className="relative px-6 py-5 flex items-center justify-between gap-4 text-white">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[14px] bg-white text-black grid place-items-center font-black text-[16px] shadow-lg">{themeMeta.name[0]}</div>
            <div>
              <div className="font-black text-[14px] tracking-tight flex items-center gap-2">{themeMeta.name} <span className="h-5 px-2 bg-white/15 backdrop-blur border border-white/10 rounded-full text-[9px] tracking-widest grid place-items-center">{themeId.toUpperCase()}</span> <span className="h-5 px-2 bg-[#E8FF86] text-black rounded-full text-[9px] font-black grid place-items-center">LIVE</span></div>
              <div className="text-[11px] text-white/60 mt-0.5">{themeMeta.desc} • Everything editable • Creative Studio</div>
            </div>
          </div>
          <button onClick={save} disabled={saving} className="h-10 px-6 bg-white text-black rounded-full text-[12px] font-black hover:bg-[#E8FF86] transition-colors disabled:opacity-50 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">{saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Live →'}</button>
        </div>
      </div>

      {/* Theme Switch Hint */}
      <div className="px-6 py-3 bg-[#FAFAF9] border-b border-zinc-100 flex items-center gap-2 overflow-x-auto">
        {THEMES.map(t=>(
          <div key={t.id} className={`h-8 px-3 rounded-full text-[11px] font-bold flex items-center gap-1.5 border whitespace-nowrap ${t.id===themeId ? 'bg-black text-white border-black' : 'bg-white text-zinc-500 border-zinc-200'}`}>
            <span className="w-2 h-2 rounded-full" style={{ background: t.color }} />{t.name}{t.id===themeId && <span className="ml-1 w-1.5 h-1.5 bg-[#E8FF86] rounded-full animate-pulse" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[280px_1fr_380px] min-h-[620px]">
        {/* Left Nav - Theme Specific */}
        <div className="bg-[#FAFAF9] border-r border-zinc-100 p-3 space-y-2">
          <div className="text-[10px] font-black tracking-[0.15em] text-zinc-400 px-2 py-2">EDIT SECTIONS FOR {themeMeta.name.toUpperCase()}</div>
          {sections.map(s=>(
            <button key={s.id} onClick={()=>setActiveSection(s.id)} className={`w-full text-left p-3 rounded-[14px] border transition-all ${activeSection===s.id ? 'bg-black text-white border-black shadow-[0_8px_20px_rgba(0,0,0,0.15)]' : 'bg-white text-zinc-700 border-zinc-200 hover:border-black hover:shadow-sm'}`}>
              <div className="flex items-center gap-2.5"><span className={`w-8 h-8 rounded-[10px] grid place-items-center text-[14px] ${activeSection===s.id ? 'bg-white/10' : 'bg-[#F5F1EB]'}`}>{s.icon}</span><div className="flex-1"><div className="font-bold text-[12px] leading-[1]">{s.label}</div><div className={`text-[10px] mt-1 ${activeSection===s.id ? 'text-white/60' : 'text-zinc-500'}`}>{s.desc}</div></div></div>
            </button>
          ))}
          <div className="mt-4 p-3 bg-white border rounded-[14px] text-[11px]">
            <div className="font-bold">Theme-specific editor</div>
            <div className="text-zinc-500 mt-1 leading-[1.4]">Each premium theme has different buttons & functionality. This panel shows only what you can edit in <b>{themeMeta.name}</b>.</div>
          </div>
        </div>

        {/* Center Editor - Dynamic per theme */}
        <div className="p-5 md:p-6 space-y-6 overflow-auto max-h-[700px]">
          {/* SPIKE PREMIUM */}
          {themeId==='spike-premium' && (
            <>
              {activeSection==='header' && (
                <div className="space-y-5">
                  <div className="bg-black text-white rounded-[16px] p-4"><div className="text-[11px] font-black tracking-widest flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> HEADER — YOU CIRCLED</div><div className="text-[12px] text-white/60 mt-1">Top left <b className="text-white">SPIKE - Shoes Shalwar</b> is here</div></div>
                  <div><label className="text-[10px] font-black tracking-widest">FULL HEADER TEXT (top left)</label><input value={custom.headerLabel || ''} onChange={e=>update('headerLabel', e.target.value)} placeholder="SPIKE • Shoes Shalwar" className="mt-2 w-full h-12 px-4 bg-white border-2 border-black rounded-[14px] font-bold text-[13px]" /><div className="mt-2 p-2.5 bg-[#E8FF86] rounded-[10px] text-[11px]">Preview: <b>{custom.headerLabel || 'SPIKE • Shoes Shalwar'}</b></div></div>
                  <div className="grid grid-cols-2 gap-3"><div><label className="text-[10px] font-black">PREFIX (SPIKE)</label><input value={custom.headerPrefix || ''} onChange={e=>update('headerPrefix', e.target.value)} placeholder="SPIKE" className="mt-1 w-full h-11 px-3 border rounded-[12px] font-black" /></div><div><label className="text-[10px] font-black">BADGE (MINIMAL • 2024)</label><input value={custom.heroBadge || custom.badge || ''} onChange={e=>{update('heroBadge', e.target.value); update('badge', e.target.value)}} placeholder="MINIMAL • 2024" className="mt-1 w-full h-11 px-3 border rounded-[12px]" /></div></div>
                  <div><label className="text-[10px] font-black">ANNOUNCEMENT BAR (top black marquee)</label><input value={custom.announcement || ''} onChange={e=>update('announcement', e.target.value)} placeholder="EDITORIAL • MINIMAL BY AAKIF • LUXURY • FREE SHIPPING • COD" className="mt-2 w-full h-11 px-4 bg-[#FAFAF9] border rounded-[12px] text-[12px]" /></div>
                </div>
              )}
              {activeSection==='hero' && (
                <div className="space-y-4">
                  <div><label className="text-[10px] font-black">HERO TITLE (big)</label><textarea value={custom.heroTitle || ''} onChange={e=>update('heroTitle', e.target.value)} rows={2} className="mt-2 w-full px-4 py-3 border rounded-[14px] font-black text-[18px] leading-[1.1]" placeholder="Cool and Aakif style" /></div>
                  <div><label className="text-[10px] font-black">SUBTITLE</label><textarea value={custom.heroSubtitle || ''} onChange={e=>update('heroSubtitle', e.target.value)} rows={3} className="mt-2 w-full px-4 py-3 border rounded-[12px] text-[13px]" placeholder="Clean lines, intentional whitespace..." /></div>
                  <div className="grid grid-cols-2 gap-3"><div><label className="text-[10px] font-black">CTA BUTTON TEXT</label><input value={custom.ctaText || ''} onChange={e=>update('ctaText', e.target.value)} placeholder="Shop Editorial →" className="mt-1 w-full h-11 px-3 border rounded-[12px] font-bold" /></div><div><label className="text-[10px] font-black">HERO IMAGE URL</label><input value={custom.heroImage || ''} onChange={e=>update('heroImage', e.target.value)} placeholder="https://... or empty = product" className="mt-1 w-full h-11 px-3 border rounded-[12px] text-[11px] font-mono" /></div></div>
                  {custom.heroImage && <img src={custom.heroImage} alt="" className="w-full h-[200px] object-cover rounded-[14px] border" />}
                </div>
              )}
              {activeSection==='filters' && (
                <div className="space-y-5">
                  <div className="bg-red-50 border border-red-200 rounded-[14px] p-4"><div className="text-[11px] font-black text-red-700 flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> FILTER PILLS — YOU CIRCLED THIS IN RED</div><div className="text-[12px] text-red-700/70 mt-1">These are <b>All, Nike, Adidas, Puma, New Balance</b> in screenshot — fully editable</div></div>
                  <div><label className="text-[10px] font-black">BRAND / FILTER PILLS</label><div className="mt-2"><ChipInput value={custom.brands || []} onChange={v=>update('brands', v)} placeholder="Type brand and press Enter" /></div></div>
                  <div className="bg-[#F8F7F5] border rounded-[12px] p-3 text-[11px]">These filter products by name. Add <b>Shalwar, Shoes, Luxury</b> for your store.</div>
                </div>
              )}
              {activeSection==='stats' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#FAFAF9] border rounded-[12px] p-3"><label className="text-[10px] font-black">ORDERS NUMBER</label><input value={custom.statsOrders || ''} onChange={e=>update('statsOrders', e.target.value)} placeholder="500+" className="mt-1 w-full h-9 px-2 border rounded-[8px] font-black text-[13px]" /><input value={custom.statsOrdersLabel || ''} onChange={e=>update('statsOrdersLabel', e.target.value)} placeholder="Orders" className="mt-1 w-full h-8 px-2 border rounded-[8px] text-[10px]" /></div>
                    <div className="bg-[#FAFAF9] border rounded-[12px] p-3"><label className="text-[10px] font-black">RATING</label><input value={custom.statsRating || ''} onChange={e=>update('statsRating', e.target.value)} placeholder="4.9★" className="mt-1 w-full h-9 px-2 border rounded-[8px] font-black text-[13px]" /><input value={custom.statsRatingLabel || ''} onChange={e=>update('statsRatingLabel', e.target.value)} placeholder="Rating" className="mt-1 w-full h-8 px-2 border rounded-[8px] text-[10px]" /></div>
                    <div className="bg-[#FAFAF9] border rounded-[12px] p-3"><label className="text-[10px] font-black">COD</label><input value={custom.statsCod || ''} onChange={e=>update('statsCod', e.target.value)} placeholder="COD" className="mt-1 w-full h-9 px-2 border rounded-[8px] font-black text-[13px]" /><input value={custom.statsCodLabel || ''} onChange={e=>update('statsCodLabel', e.target.value)} placeholder="Available" className="mt-1 w-full h-8 px-2 border rounded-[8px] text-[10px]" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3"><div><label className="text-[10px] font-black">HOT BADGE TEXT</label><input value={custom.hotBadge || ''} onChange={e=>update('hotBadge', e.target.value)} placeholder="HOT" className="mt-1 w-full h-10 px-3 border rounded-[10px]" /></div><div><label className="text-[10px] font-black">FREE SHIPPING BADGE</label><input value={custom.freeShippingBadge || ''} onChange={e=>update('freeShippingBadge', e.target.value)} placeholder="FREE SHIPPING" className="mt-1 w-full h-10 px-3 border rounded-[10px]" /></div></div>
                  <div><label className="text-[10px] font-black">SIZES (for product modal)</label><div className="mt-2"><ChipInput value={custom.sizes || []} onChange={v=>update('sizes', v)} placeholder="Size e.g. 40" /></div></div>
                </div>
              )}
            </>
          )}

          {/* SHOE APP PREMIUM */}
          {themeId==='shoe-app-premium' && (
            <>
              {activeSection==='header' && (
                <div className="space-y-4">
                  <div className="bg-[#7C3AED] text-white rounded-[14px] p-4"><div className="text-[11px] font-black">HEADER — Violet theme header</div><div className="text-[12px] text-white/70 mt-1">Logo letter, cart, LIVE • COD bar</div></div>
                  <div className="grid grid-cols-2 gap-3"><div><label className="text-[10px] font-black">LOGO LETTER</label><input value={custom.logoLetter || ''} onChange={e=>update('logoLetter', e.target.value)} placeholder="S" className="mt-1 w-full h-11 px-3 border rounded-[12px] font-black text-[18px] text-center" /></div><div><label className="text-[10px] font-black">HEADER LABEL</label><input value={custom.headerLabel || ''} onChange={e=>update('headerLabel', e.target.value)} placeholder="S • Shoe App" className="mt-1 w-full h-11 px-3 border rounded-[12px]" /></div></div>
                  <div><label className="text-[10px] font-black">ANNOUNCEMENT</label><input value={custom.announcement || ''} onChange={e=>update('announcement', e.target.value)} placeholder="LIVE • COD • FREE SHIPPING OVER 5000" className="mt-1 w-full h-11 px-3 border rounded-[12px]" /></div>
                  <div><label className="text-[10px] font-black">NEW DROP BADGE</label><input value={custom.newDropLabel || custom.heroBadge || ''} onChange={e=>{update('newDropLabel', e.target.value); update('heroBadge', e.target.value)}} placeholder="NEW DROP • 2024" className="mt-1 w-full h-11 px-3 border rounded-[12px]" /></div>
                </div>
              )}
              {activeSection==='promo' && (
                <div className="space-y-4">
                  <div className="bg-[#111AFF] text-white rounded-[14px] p-4"><div className="text-[11px] font-black">PROMO BANNER — Blue 50% OFF card</div><div className="text-[12px] text-white/70 mt-1">This is the blue card with BLACK FRIDAY + GET UP TO 50% OFF</div></div>
                  <div><label className="text-[10px] font-black">PROMO BADGE (small)</label><input value={custom.promoBadge || ''} onChange={e=>update('promoBadge', e.target.value)} placeholder="BLACK FRIDAY" className="mt-1 w-full h-11 px-3 border rounded-[12px] font-black tracking-widest text-[11px]" /></div>
                  <div><label className="text-[10px] font-black">PROMO TITLE (big, supports Enter for line break)</label><textarea value={(custom.promoTitle || '').replace(/\\n/g, '\n')} onChange={e=>update('promoTitle', e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 border rounded-[12px] font-black text-[18px] leading-[0.9]" placeholder="GET UP TO\n50% OFF" /></div>
                  <div><label className="text-[10px] font-black">PROMO CTA BUTTON</label><input value={custom.promoCta || ''} onChange={e=>update('promoCta', e.target.value)} placeholder="Shop Sale →" className="mt-1 w-full h-11 px-3 border rounded-[12px] font-bold" /></div>
                </div>
              )}
              {activeSection==='filters' && (
                <div className="space-y-4">
                  <div><label className="text-[10px] font-black">FILTER PILLS</label><div className="mt-2"><ChipInput value={custom.filters || custom.brands || []} onChange={v=>{update('filters', v); update('brands', v)}} placeholder="Filter e.g. Nike" /></div></div>
                  <div><label className="text-[10px] font-black">EU SIZES (28-34)</label><div className="mt-2"><ChipInput value={custom.sizes || []} onChange={v=>update('sizes', v)} placeholder="Size e.g. 31" /></div></div>
                  <div><label className="text-[10px] font-black">RECENTLY VIEWED LABEL</label><input value={custom.recentlyViewedLabel || ''} onChange={e=>update('recentlyViewedLabel', e.target.value)} placeholder="Recently Viewed" className="mt-1 w-full h-10 px-3 border rounded-[10px]" /></div>
                </div>
              )}
              {activeSection==='colors' && (
                <div className="space-y-4">
                  <div className="bg-[#F2F0FF] border border-violet-100 rounded-[12px] p-3 text-[11px]"><b>Colors</b> — these are the 5 color dots in Shoe App. Each has name + hex.</div>
                  <ColorEditor value={custom.colors || []} onChange={v=>update('colors', v)} />
                </div>
              )}
              {activeSection==='perks' && (
                <div className="space-y-4">
                  <div><label className="text-[10px] font-black">MEMBER PERKS TITLE</label><textarea value={(custom.memberPerksTitle || '').replace(/\\n/g, '\n')} onChange={e=>update('memberPerksTitle', e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 border rounded-[12px] font-bold text-[14px]" placeholder="Free Shipping\n+ 7 Days Return" /></div>
                  <div><label className="text-[10px] font-black">MEMBER PERKS DESC</label><input value={custom.memberPerksDesc || ''} onChange={e=>update('memberPerksDesc', e.target.value)} placeholder="Early access to drops, COD & priority." className="mt-1 w-full h-11 px-3 border rounded-[12px]" /></div>
                  <div><label className="text-[10px] font-black">MEMBER CTA</label><input value={custom.memberCta || ''} onChange={e=>update('memberCta', e.target.value)} placeholder="Join Premium — Free" className="mt-1 w-full h-11 px-3 border rounded-[12px]" /></div>
                </div>
              )}
              {activeSection==='hero' && (
                <div className="space-y-4">
                  <div><label className="text-[10px] font-black">HERO TITLE / PRODUCT TITLE</label><input value={custom.heroTitle || ''} onChange={e=>update('heroTitle', e.target.value)} placeholder="Shoe App Premium" className="mt-1 w-full h-11 px-3 border rounded-[12px] font-bold" /></div>
                  <div><label className="text-[10px] font-black">SUBTITLE</label><textarea value={custom.heroSubtitle || ''} onChange={e=>update('heroSubtitle', e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 border rounded-[12px]" /></div>
                  <div className="grid grid-cols-2 gap-3"><div><label className="text-[10px] font-black">CART TITLE</label><input value={custom.cartTitle || ''} onChange={e=>update('cartTitle', e.target.value)} placeholder="Your Bag" className="mt-1 w-full h-10 px-3 border rounded-[10px]" /></div><div><label className="text-[10px] font-black">WHATSAPP BUTTON</label><input value={custom.whatsappButton || ''} onChange={e=>update('whatsappButton', e.target.value)} placeholder="WhatsApp Order" className="mt-1 w-full h-10 px-3 border rounded-[10px]" /></div></div>
                  <div><label className="text-[10px] font-black">ADD TO CART BUTTON</label><input value={custom.ctaText || ''} onChange={e=>update('ctaText', e.target.value)} placeholder="Add — Rs. 5,000" className="mt-1 w-full h-11 px-3 border rounded-[12px] font-bold" /></div>
                </div>
              )}
            </>
          )}

          {/* TRENZO LUXURY */}
          {themeId==='trenzo-luxury' && (
            <>
              {activeSection==='header' && (
                <div className="space-y-4">
                  <div><label className="text-[10px] font-black">HEADER LABEL</label><input value={custom.headerLabel || ''} onChange={e=>update('headerLabel', e.target.value)} placeholder="✦ TRENZO • LUXURY" className="mt-1 w-full h-11 px-3 border rounded-[12px] font-black" /></div>
                  <div><label className="text-[10px] font-black">ANNOUNCEMENT</label><input value={custom.announcement || ''} onChange={e=>update('announcement', e.target.value)} placeholder="CONCIERGE • 24H SHIPPING • LUXURY CURATED" className="mt-1 w-full h-11 px-3 border rounded-[12px]" /></div>
                  <div><label className="text-[10px] font-black">EYEBROW (small pill above title)</label><input value={custom.eyebrow || ''} onChange={e=>update('eyebrow', e.target.value)} placeholder="EST. 2018 • LUXURY CURATED" className="mt-1 w-full h-11 px-3 border rounded-[12px] tracking-widest text-[11px]" /></div>
                </div>
              )}
              {activeSection==='hero' && (
                <div className="space-y-4">
                  <div><label className="text-[10px] font-black">HERO TITLE (multiline)</label><textarea value={(custom.heroTitle || '').replace(/\\n/g, '\n')} onChange={e=>update('heroTitle', e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 border rounded-[12px] font-black text-[16px] leading-[1]" placeholder="A reflection\nof personal\nstyling" /></div>
                  <div><label className="text-[10px] font-black">SUBTITLE</label><textarea value={custom.heroSubtitle || ''} onChange={e=>update('heroSubtitle', e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 border rounded-[12px]" /></div>
                  <div className="grid grid-cols-2 gap-3"><div><label className="text-[10px] font-black">CTA</label><input value={custom.ctaText || ''} onChange={e=>update('ctaText', e.target.value)} placeholder="Explore Collection →" className="mt-1 w-full h-10 px-3 border rounded-[10px]" /></div><div><label className="text-[10px] font-black">FEATURED LABEL</label><input value={custom.featuredLabel || ''} onChange={e=>update('featuredLabel', e.target.value)} placeholder="FEATURED • NEW" className="mt-1 w-full h-10 px-3 border rounded-[10px]" /></div></div>
                  <div><label className="text-[10px] font-black">LUXE BADGE (floating circle)</label><input value={custom.luxeBadge || ''} onChange={e=>update('luxeBadge', e.target.value)} placeholder="✦ LUXE" className="mt-1 w-full h-10 px-3 border rounded-[10px] text-center font-black" /></div>
                  <div><label className="text-[10px] font-black">HERO PILL IMAGE URL</label><input value={custom.heroImage || ''} onChange={e=>update('heroImage', e.target.value)} placeholder="https://... or empty = product" className="mt-1 w-full h-10 px-3 border rounded-[10px] font-mono text-[11px]" />{custom.heroImage && <img src={custom.heroImage} alt="" className="mt-2 w-full h-[240px] object-cover rounded-[18px] border" />}</div>
                </div>
              )}
              {activeSection==='stories' && (
                <div className="space-y-3">
                  <div className="text-[11px] text-zinc-500">These are the 3 small cards below hero title in Trenzo</div>
                  {(custom.stories || []).map((s:any,i:number)=>(
                    <div key={i} className="bg-[#141414] text-white border rounded-[14px] p-3 space-y-2">
                      <div className="text-[10px] font-black tracking-widest opacity-60">STORY {i+1}</div>
                      <input value={s.title} onChange={e=>updateNested('stories', i, 'title', e.target.value)} placeholder="Title e.g. Craftsmanship" className="w-full h-9 px-3 bg-white/10 border border-white/10 rounded-[10px] text-[12px] font-bold text-white" />
                      <input value={s.desc} onChange={e=>updateNested('stories', i, 'desc', e.target.value)} placeholder="Description" className="w-full h-9 px-3 bg-white/10 border border-white/10 rounded-[10px] text-[11px] text-white/70" />
                    </div>
                  ))}
                </div>
              )}
              {activeSection==='labels' && (
                <div className="space-y-3">
                  <div><label className="text-[10px] font-black">PRODUCT LABEL</label><input value={custom.productLabel || ''} onChange={e=>update('productLabel', e.target.value)} placeholder="FEATURED" className="mt-1 w-full h-10 px-3 border rounded-[10px]" /></div>
                </div>
              )}
            </>
          )}

          {/* SLEEK THEMES */}
          {(themeId==='sleek-beige' || themeId==='sleek-dark' || themeId==='sleek-editorial') && (
            <>
              {activeSection==='header' && (
                <div className="space-y-4">
                  <div><label className="text-[10px] font-black">HEADER LABEL (top bar)</label><input value={custom.headerLabel || ''} onChange={e=>update('headerLabel', e.target.value)} placeholder={themeId==='sleek-beige'?'BEIGE • Studio':themeId==='sleek-dark'?'DARK • Studio':'EDITORIAL • Studio'} className="mt-1 w-full h-11 px-3 border rounded-[12px] font-black" /></div>
                  {themeId==='sleek-editorial' && <div><label className="text-[10px] font-black">TOP RIGHT SMALL LABEL</label><input value={custom.headerTopLabel || ''} onChange={e=>update('headerTopLabel', e.target.value)} placeholder="PREMIUM • EDITORIAL" className="mt-1 w-full h-11 px-3 border rounded-[12px]" /></div>}
                  <div><label className="text-[10px] font-black">ANNOUNCEMENT BAR (colored top strip)</label><input value={custom.announcement || ''} onChange={e=>update('announcement', e.target.value)} placeholder="FREE SHIPPING • NEW DROP • COD" className="mt-1 w-full h-11 px-3 border rounded-[12px]" /></div>
                  <div><label className="text-[10px] font-black">BADGE PILL (above title) — e.g. MINIMAL • 2024</label><input value={custom.badge || ''} onChange={e=>update('badge', e.target.value)} placeholder="EDITORIAL • BEIGE • 2024" className="mt-1 w-full h-11 px-3 border rounded-[12px]" /></div>
                </div>
              )}
              {activeSection==='hero' && (
                <div className="space-y-4">
                  <div><label className="text-[10px] font-black">HERO TITLE (big, multiline)</label><textarea value={(custom.heroTitle || '').replace(/\\n/g, '\n')} onChange={e=>update('heroTitle', e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 border rounded-[14px] font-black text-[20px] leading-[0.9]" placeholder="Warm minimal\nluxury, everyday\nicon." /></div>
                  <div><label className="text-[10px] font-black">SUBTITLE</label><textarea value={custom.heroSubtitle || ''} onChange={e=>update('heroSubtitle', e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 border rounded-[12px]" /></div>
                  <div><label className="text-[10px] font-black">CTA BUTTON</label><input value={custom.ctaText || ''} onChange={e=>update('ctaText', e.target.value)} placeholder="Shop Beige →" className="mt-1 w-full h-11 px-3 border rounded-[12px] font-bold" /></div>
                </div>
              )}
              {activeSection==='media' && (
                <div className="space-y-4">
                  <div><label className="text-[10px] font-black">HERO IMAGE (pill shape)</label><input value={custom.heroImage || ''} onChange={e=>update('heroImage', e.target.value)} placeholder="https://... or empty = first product" className="mt-1 w-full h-11 px-3 border rounded-[12px] font-mono text-[11px]" />{custom.heroImage && <img src={custom.heroImage} alt="" className="mt-2 w-full h-[260px] object-cover rounded-[24px] border" />}</div>
                  <div className="grid grid-cols-2 gap-3"><div><label className="text-[10px] font-black">HOT/NEW BADGE TEXT</label><input value={custom.hotBadge || ''} onChange={e=>update('hotBadge', e.target.value)} placeholder={themeId==='sleek-dark'?'HOT':'NEW'} className="mt-1 w-full h-10 px-3 border rounded-[10px]" /></div><div><label className="text-[10px] font-black">FREE SHIPPING BADGE</label><input value={custom.freeShippingBadge || ''} onChange={e=>update('freeShippingBadge', e.target.value)} placeholder="FREE SHIPPING" className="mt-1 w-full h-10 px-3 border rounded-[10px]" /></div></div>
                </div>
              )}
            </>
          )}

          <div className="pt-4 border-t flex items-center justify-between">
            <div className="text-[11px] text-zinc-500">JSONB • {Object.keys(custom).length} fields • {themeId}</div>
            <button onClick={save} disabled={saving} className="h-10 px-6 bg-black text-white rounded-full text-[12px] font-bold">{saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save All →'}</button>
          </div>
        </div>

        {/* Right Live Preview - Theme Specific */}
        <div className="bg-[#F8F7F5] p-4 border-l border-zinc-100">
          <div className="text-[10px] font-black tracking-widest text-zinc-500 flex items-center gap-2"><span className="w-2 h-2 bg-[#E8FF86] rounded-full animate-pulse" /> LIVE PREVIEW — {themeMeta.name.toUpperCase()}</div>
          
          <div className="mt-4 bg-white border rounded-[18px] overflow-hidden shadow-sm">
            <div className="h-10 px-3 border-b flex items-center justify-between bg-white">
              <div className="font-black text-[11px] truncate">{custom.headerLabel || `${custom.headerPrefix || themeMeta.name.split(' ')[0].toUpperCase()} • ${'Store'}`}</div>
              <div className="h-6 px-2 bg-black text-white rounded-full text-[9px] font-bold grid place-items-center">Cart (0)</div>
            </div>
            <div className="p-3">
              <div className="inline-flex h-5 px-2.5 bg-[#F8F7F5] border rounded-full text-[8px] font-black tracking-widest items-center">{custom.badge || custom.heroBadge || 'MINIMAL • 2024'}</div>
              <div className="mt-2 font-black text-[16px] leading-[0.95] whitespace-pre-line">{(custom.heroTitle || 'Title').replace(/\\n/g, '\n')}</div>
              <div className="mt-1.5 text-[10px] text-black/50 line-clamp-2">{custom.heroSubtitle || 'Subtitle'}</div>
              <div className="mt-3 h-7 px-3 bg-black text-white rounded-full text-[10px] font-bold inline-flex items-center">{custom.ctaText || 'Shop →'}</div>
              
              {(themeId==='spike-premium' || themeId==='shoe-app-premium') && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {(custom.brands || custom.filters || []).slice(0,5).map((b:string)=><div key={b} className="h-5 px-2.5 bg-[#F2F0FF] border rounded-full text-[9px] font-bold">{b}</div>)}
                </div>
              )}

              {themeId==='shoe-app-premium' && custom.promoTitle && (
                <div className="mt-3 bg-[#111AFF] text-white rounded-[12px] p-3">
                  <div className="text-[8px] font-black tracking-widest bg-white text-[#111AFF] inline-flex h-4 px-2 rounded-full items-center">{custom.promoBadge || 'BLACK FRIDAY'}</div>
                  <div className="mt-1 font-black text-[14px] leading-[0.9] whitespace-pre-line">{(custom.promoTitle || '').replace(/\\n/g, '\n')}</div>
                </div>
              )}

              {themeId==='trenzo-luxury' && (
                <div className="mt-3 space-y-1.5">
                  {(custom.stories || []).slice(0,2).map((s:any,i:number)=><div key={i} className="bg-[#141414] text-white rounded-[10px] p-2"><div className="text-[8px] font-black tracking-widest opacity-60">{s.title?.toUpperCase()}</div><div className="text-[9px] opacity-70">{s.desc?.slice(0,30)}...</div></div>)}
                </div>
              )}

              <div className="mt-3 grid grid-cols-3 gap-1">
                <div className="bg-[#F8F7F5] border rounded-[8px] p-1.5"><div className="font-black text-[10px]">{custom.statsOrders || '500+'}</div><div className="text-[8px] text-black/40">Orders</div></div>
                <div className="bg-[#F8F7F5] border rounded-[8px] p-1.5"><div className="font-black text-[10px]">{custom.statsRating || '4.9★'}</div><div className="text-[8px] text-black/40">Rating</div></div>
                <div className="bg-[#F8F7F5] border rounded-[8px] p-1.5"><div className="font-black text-[10px]">{custom.statsCod || 'COD'}</div><div className="text-[8px] text-black/40">Available</div></div>
              </div>

              <div className="mt-3 aspect-[4/3] rounded-[12px] overflow-hidden bg-zinc-100 border">
                <img src={custom.heroImage || 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400'} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <div className="mt-3 bg-zinc-900 text-white rounded-[12px] p-3 text-[10px]">
            <div className="font-bold">Editing: {themeMeta.name}</div>
            <div className="mt-1 text-white/60 leading-[1.4]">You are editing <b className="text-white">{sections.find(s=>s.id===activeSection)?.label}</b> — {sections.find(s=>s.id===activeSection)?.desc}. Changes save to <b className="text-white">premium_custom</b> and appear live in /s/{"{slug}"}.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
