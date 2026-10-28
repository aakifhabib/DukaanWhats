'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Props = { profile: any; onSave: (d:any)=>void }

const PREMIUM_IDS = ['spike-premium','shoe-app-premium','trenzo-luxury','sleek-beige','sleek-dark','sleek-editorial']

const DEFAULTS: Record<string, any> = {
  'spike-premium': {
    announcement: 'FREE SHIPPING OVER RS. 5000 • NEW DROP LIVE • COD AVAILABLE',
    heroTitle: 'The journey begins with the perfect pair',
    heroSubtitle: 'Dive into unparalleled comfort with unmatched style. Find your perfect stride.',
    heroBadge: 'New Drop • Live • COD',
    heroImage: '',
    ctaText: 'Shop Now →',
    brands: ['All','Nike','Adidas','Puma','New Balance'],
    statsOrders: '500+',
    statsRating: '4.9★',
    statsCod: 'COD',
  },
  'shoe-app-premium': {
    announcement: 'LIVE • COD • FREE SHIPPING OVER 5000',
    heroBadge: 'NEW DROP • 2024',
    newDropLabel: 'NEW DROP • 2024',
    promoBadge: 'BLACK FRIDAY',
    promoTitle: 'GET UP TO\n50% OFF',
    promoCta: 'Shop Sale →',
    filters: ['All','Nike','Adidas','New','Sale'],
    memberPerksTitle: 'Free Shipping\n+ 7 Days Return',
    memberPerksDesc: 'Early access to drops, COD & priority.',
    memberCta: 'Join Premium — Free',
    heroTitle: 'Shoe App Premium',
    heroSubtitle: 'Engineered mesh, responsive foam, ultra-light.',
  },
  'trenzo-luxury': {
    announcement: 'CONCIERGE • 24H SHIPPING • LUXURY CURATED',
    eyebrow: 'EST. 2018 • LUXURY CURATED',
    heroTitle: 'A reflection\nof personal\nstyling',
    heroSubtitle: 'Premium curated collection. Hand-finished, ethically sourced. Each piece tells a story of craftsmanship.',
    ctaText: 'Explore Collection →',
    stories: [
      { title: 'Craftsmanship', desc: 'Hand-stitched, 48h process, premium hide' },
      { title: 'Heritage', desc: 'Since 2018, curated for modern icons' },
      { title: 'Sustainability', desc: 'Ethically sourced, carbon neutral' },
    ],
    featuredLabel: 'FEATURED • NEW',
    luxeBadge: '✦ LUXE',
    heroImage: '',
  },
  'sleek-beige': {
    announcement: 'FREE SHIPPING • NEW DROP • COD • PREMIUM BEIGE COLLECTION',
    badge: 'EDITORIAL • BEIGE • 2024',
    heroTitle: 'Warm minimal\nluxury, everyday\nicon.',
    heroSubtitle: 'Soft beige tones, natural texture, premium stitch. Curated for icons.',
    ctaText: 'Shop Beige →',
    heroImage: '',
  },
  'sleek-dark': {
    announcement: 'DARK MODE • LUXURY • FREE SHIPPING • COD • 24H DISPATCH',
    badge: 'NOIR • DARK • 2024',
    heroTitle: 'Noir luxury,\nmidnight\nicon.',
    heroSubtitle: 'Deep black, subtle glow, premium finish. Designed for night.',
    ctaText: 'Shop Dark →',
    heroImage: '',
  },
  'sleek-editorial': {
    announcement: 'EDITORIAL • MINIMAL • LUXURY • FREE SHIPPING • COD',
    headerLabel: 'PREMIUM • EDITORIAL',
    badge: 'EDITORIAL • MINIMAL • 2024',
    heroTitle: 'Less, but\nbetter. Always\neditorial.',
    heroSubtitle: 'Clean lines, intentional whitespace, premium finish. Less is luxury.',
    ctaText: 'Shop Editorial →',
    heroImage: '',
  },
}

export function PremiumThemeEditor({ profile, onSave }: Props) {
  const themeId = profile?.store_theme || ''
  const isPremium = PREMIUM_IDS.includes(themeId)
  const defaults = DEFAULTS[themeId] || DEFAULTS['spike-premium']
  
  const [custom, setCustom] = useState<any>(profile?.premium_custom || {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(()=>{
    const base = profile?.premium_custom || {}
    // merge defaults for missing keys to help editor
    const merged = { ...defaults, ...base }
    // ensure backward compat for spike fields
    if (base.spikeTitle && !merged.heroTitle) merged.heroTitle = base.spikeTitle
    if (base.spikeSub && !merged.heroSubtitle) merged.heroSubtitle = base.spikeSub
    if (base.spikeBrands && !merged.brands) merged.brands = base.spikeBrands
    if (base.announcement && !merged.announcement) merged.announcement = base.announcement
    setCustom(merged)
  },[profile?.premium_custom, themeId])

  const update = (k:string, v:any) => setCustom((s:any)=>({ ...s, [k]: v }))
  const updateNested = (parent:string, idx:number, field:string, v:string) => {
    const arr = [...(custom[parent] || defaults[parent] || [])]
    arr[idx] = { ...arr[idx], [field]: v }
    update(parent, arr)
  }

  const save = async () => {
    if(!profile?.id) return
    setSaving(true)
    try {
      // keep backward compat keys for Spike
      const toSave = {
        ...custom,
        spikeTitle: custom.heroTitle,
        spikeSub: custom.heroSubtitle,
        spikeBrands: custom.brands,
        announcement: custom.announcement,
        // also keep legacy announcement
      }
      const { error } = await (supabase as any).from('profiles').update({ premium_custom: toSave }).eq('id', profile.id)
      if(error) throw error
      onSave(toSave)
      setSaved(true)
      setTimeout(()=>setSaved(false), 2000)
    } catch(e:any) {
      alert(e.message || 'Save failed')
    }
    setSaving(false)
  }

  if(!isPremium){
    return (
      <div className="mt-6 bg-[#FFF7E8] border border-amber-200 rounded-[16px] p-4 text-[12px] leading-[1.5]">
        <div className="font-bold flex items-center gap-2">✏️ Edit Premium Themes <span className="h-5 px-2 bg-black text-white rounded-full text-[9px] grid place-items-center">PREMIUM</span></div>
        <div className="mt-2 text-black/60">Select a Premium Glass theme to unlock the full editor: <b>Spike Pro, Shoe App Pro, Trenzo Luxury, Sleek Beige, Sleek Dark, Editorial</b>. Each theme has its own fields — title, subtitle, badge, hero image, promo, filters, stories.</div>
        <div className="mt-3 bg-white border rounded-[10px] p-2.5 font-mono text-[10px]">SQL: alter table profiles add column if not exists premium_custom jsonb default '{}'::jsonb;</div>
      </div>
    )
  }

  return (
    <div className="mt-6 bg-white border border-zinc-200 rounded-[24px] p-5 md:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h3 className="font-black text-[15px] tracking-tight flex items-center gap-2">✏️ Edit Premium — {themeId} <span className="h-5 px-2 bg-[#E8FF86] text-black rounded-full text-[9px] font-black grid place-items-center tracking-widest">{themeId.includes('sleek')?'SLEEK': themeId.split('-')[0].toUpperCase()}</span></h3>
          <p className="text-[11px] text-zinc-500 mt-1">Edits save to <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded">profiles.premium_custom</span> — no redeploy. Live instantly in /s/{"{slug}"}</p>
        </div>
        <button onClick={save} disabled={saving} className="h-10 px-6 bg-black text-white rounded-full text-[12px] font-bold hover:bg-zinc-900 disabled:opacity-50 transition-colors">
          {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Edits'}
        </button>
      </div>

      {/* Common */}
      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-[#FAFAF9] border rounded-[14px] p-3">
            <div className="text-[10px] font-black tracking-widest text-zinc-500">COMMON — ALL THEMES</div>
          </div>
          
          <div>
            <label className="text-[10px] font-black tracking-widest">ANNOUNCEMENT BAR (marquee)</label>
            <input value={custom.announcement || ''} onChange={e=>update('announcement', e.target.value)} placeholder={defaults.announcement} className="mt-1.5 w-full h-11 px-3 border border-zinc-200 rounded-[12px] text-[13px] outline-none focus:border-black bg-white" />
          </div>

          <div>
            <label className="text-[10px] font-black tracking-widest">STORE TITLE / HERO TITLE</label>
            <textarea value={custom.heroTitle || ''} onChange={e=>update('heroTitle', e.target.value)} placeholder={defaults.heroTitle} rows={3} className="mt-1.5 w-full px-3 py-2.5 border border-zinc-200 rounded-[12px] text-[13px] outline-none focus:border-black bg-white resize-none leading-[1.3]" />
            <div className="text-[10px] text-zinc-400 mt-1">Use \n for line breaks — different per theme</div>
          </div>

          <div>
            <label className="text-[10px] font-black tracking-widest">SUBTITLE / SUMMARY</label>
            <textarea value={custom.heroSubtitle || ''} onChange={e=>update('heroSubtitle', e.target.value)} placeholder={defaults.heroSubtitle} rows={3} className="mt-1.5 w-full px-3 py-2.5 border border-zinc-200 rounded-[12px] text-[13px] outline-none focus:border-black bg-white resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black tracking-widest">HERO BADGE</label>
              <input value={custom.heroBadge || custom.badge || ''} onChange={e=>{ update('heroBadge', e.target.value); update('badge', e.target.value)}} placeholder={defaults.badge || defaults.heroBadge} className="mt-1.5 w-full h-11 px-3 border rounded-[12px] text-[13px] outline-none focus:border-black" />
            </div>
            <div>
              <label className="text-[10px] font-black tracking-widest">CTA TEXT</label>
              <input value={custom.ctaText || ''} onChange={e=>update('ctaText', e.target.value)} placeholder={defaults.ctaText} className="mt-1.5 w-full h-11 px-3 border rounded-[12px] text-[13px] outline-none focus:border-black" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black tracking-widest">HERO IMAGE URL (override first product)</label>
            <input value={custom.heroImage || ''} onChange={e=>update('heroImage', e.target.value)} placeholder="https://... leave empty to use product[0]" className="mt-1.5 w-full h-11 px-3 border rounded-[12px] text-[12px] outline-none focus:border-black font-mono" />
            {custom.heroImage && <img src={custom.heroImage} alt="" className="mt-2 w-full h-[160px] object-cover rounded-[12px] border" />}
          </div>
        </div>

        <div className="space-y-4">
          {/* Theme specific */}
          <div className="bg-black text-white rounded-[14px] p-3 flex items-center justify-between">
            <div className="text-[10px] font-black tracking-widest">THEME SPECIFIC — {themeId.toUpperCase()}</div>
            <span className="h-5 px-2 bg-[#E8FF86] text-black rounded-full text-[9px] font-black grid place-items-center">{themeId}</span>
          </div>

          {themeId === 'spike-premium' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black tracking-widest">BRANDS (comma separated)</label>
                <input value={(custom.brands || []).join(', ')} onChange={e=>update('brands', e.target.value.split(',').map((s:string)=>s.trim()).filter(Boolean))} placeholder="All, Nike, Adidas, Puma" className="mt-1.5 w-full h-11 px-3 border rounded-[12px] text-[13px]" />
                <div className="text-[10px] text-zinc-400 mt-1">These become filter pills + clickable in hero</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><label className="text-[10px] font-black">ORDERS STAT</label><input value={custom.statsOrders || ''} onChange={e=>update('statsOrders', e.target.value)} placeholder="500+" className="mt-1 w-full h-10 px-2 border rounded-[10px] text-[12px]" /></div>
                <div><label className="text-[10px] font-black">RATING</label><input value={custom.statsRating || ''} onChange={e=>update('statsRating', e.target.value)} placeholder="4.9★" className="mt-1 w-full h-10 px-2 border rounded-[10px] text-[12px]" /></div>
                <div><label className="text-[10px] font-black">COD LABEL</label><input value={custom.statsCod || ''} onChange={e=>update('statsCod', e.target.value)} placeholder="COD" className="mt-1 w-full h-10 px-2 border rounded-[10px] text-[12px]" /></div>
              </div>
              <div className="bg-[#F8F7F5] border rounded-[12px] p-3 text-[11px]"><b>How Spike uses this:</b> heroTitle + heroSubtitle + badge + announcement + brands + heroImage + stats. Gallery auto-rotates product images.</div>
            </div>
          )}

          {themeId === 'shoe-app-premium' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-black">NEW DROP LABEL</label><input value={custom.newDropLabel || ''} onChange={e=>update('newDropLabel', e.target.value)} placeholder="NEW DROP • 2024" className="mt-1 w-full h-10 px-2 border rounded-[10px] text-[12px]" /></div>
                <div><label className="text-[10px] font-black">PROMO BADGE</label><input value={custom.promoBadge || ''} onChange={e=>update('promoBadge', e.target.value)} placeholder="BLACK FRIDAY" className="mt-1 w-full h-10 px-2 border rounded-[10px] text-[12px]" /></div>
              </div>
              <div><label className="text-[10px] font-black">PROMO TITLE (supports \n)</label><textarea value={custom.promoTitle || ''} onChange={e=>update('promoTitle', e.target.value)} placeholder="GET UP TO&#10;50% OFF" rows={2} className="mt-1 w-full px-2 py-2 border rounded-[10px] text-[12px]" /></div>
              <div><label className="text-[10px] font-black">PROMO CTA</label><input value={custom.promoCta || ''} onChange={e=>update('promoCta', e.target.value)} placeholder="Shop Sale →" className="mt-1 w-full h-10 px-3 border rounded-[12px] text-[12px]" /></div>
              <div><label className="text-[10px] font-black">FILTER PILLS (comma)</label><input value={(custom.filters || []).join(', ')} onChange={e=>update('filters', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} placeholder="All, Nike, Adidas, New, Sale" className="mt-1 w-full h-11 px-3 border rounded-[12px] text-[12px]" /></div>
              <div className="grid grid-cols-1 gap-3">
                <div><label className="text-[10px] font-black">MEMBER PERKS TITLE</label><textarea value={custom.memberPerksTitle || ''} onChange={e=>update('memberPerksTitle', e.target.value)} placeholder="Free Shipping&#10;+ 7 Days Return" rows={2} className="mt-1 w-full px-2 py-2 border rounded-[10px] text-[12px]" /></div>
                <div><label className="text-[10px] font-black">MEMBER PERKS DESC</label><input value={custom.memberPerksDesc || ''} onChange={e=>update('memberPerksDesc', e.target.value)} placeholder="Early access to drops, COD & priority." className="mt-1 w-full h-10 px-3 border rounded-[12px] text-[12px]" /></div>
              </div>
              <div className="bg-[#F2F0FF] border border-violet-100 rounded-[12px] p-3 text-[11px]"><b>Shoe App</b> layout: [320px left preview | center grid | 340px right]. Uses promo + filters + member perks. Size EU 28-34 + 5 colors are product-driven.</div>
            </div>
          )}

          {themeId === 'trenzo-luxury' && (
            <div className="space-y-4">
              <div><label className="text-[10px] font-black">EYEBROW</label><input value={custom.eyebrow || ''} onChange={e=>update('eyebrow', e.target.value)} placeholder="EST. 2018 • LUXURY CURATED" className="mt-1 w-full h-11 px-3 border rounded-[12px] text-[12px]" /></div>
              <div><label className="text-[10px] font-black">FEATURED LABEL</label><input value={custom.featuredLabel || ''} onChange={e=>update('featuredLabel', e.target.value)} placeholder="FEATURED • NEW" className="mt-1 w-full h-10 px-3 border rounded-[12px] text-[12px]" /></div>
              <div><label className="text-[10px] font-black">LUXE BADGE</label><input value={custom.luxeBadge || ''} onChange={e=>update('luxeBadge', e.target.value)} placeholder="✦ LUXE" className="mt-1 w-full h-10 px-3 border rounded-[12px] text-[12px]" /></div>
              <div className="space-y-2">
                <label className="text-[10px] font-black">STORIES (3)</label>
                {(custom.stories || defaults.stories || []).map((s:any,i:number)=>(
                  <div key={i} className="grid grid-cols-[110px_1fr] gap-2 bg-[#FAFAF9] border rounded-[10px] p-2">
                    <input value={s.title} onChange={e=>updateNested('stories', i, 'title', e.target.value)} placeholder="Title" className="h-9 px-2 border rounded-[8px] text-[11px] font-bold" />
                    <input value={s.desc} onChange={e=>updateNested('stories', i, 'desc', e.target.value)} placeholder="Description" className="h-9 px-2 border rounded-[8px] text-[11px]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {(themeId === 'sleek-beige' || themeId === 'sleek-dark' || themeId === 'sleek-editorial') && (
            <div className="space-y-4">
              {themeId === 'sleek-editorial' && (
                <div><label className="text-[10px] font-black">HEADER LABEL</label><input value={custom.headerLabel || ''} onChange={e=>update('headerLabel', e.target.value)} placeholder="PREMIUM • EDITORIAL" className="mt-1 w-full h-11 px-3 border rounded-[12px] text-[12px]" /></div>
              )}
              <div className="bg-[#FCFBF9] border rounded-[12px] p-3 text-[11px] leading-[1.4]">
                <b>{themeId.toUpperCase()} uses:</b> badge + heroTitle + heroSubtitle + announcement + heroImage + CTA. Minimal design — title is big, whitespace is luxury. Hero image is pill {themeId==='sleek-beige' ? 'beige' : themeId==='sleek-dark' ? 'noir' : 'editorial'} style.
              </div>
              <div className="text-[11px] text-zinc-500">
                Tip: Keep title 2-3 lines, subtitle under 18 words for editorial balance.
              </div>
            </div>
          )}

          <div className="bg-zinc-900 text-white rounded-[12px] p-3 text-[11px]">
            <div className="font-bold flex items-center gap-1.5"><span className="w-2 h-2 bg-[#E8FF86] rounded-full animate-pulse" /> Live Preview</div>
            <div className="mt-2 space-y-1 font-mono text-[10px] opacity-70">
              <div>Theme: {themeId}</div>
              <div>Title: {(custom.heroTitle||'').slice(0,40)}...</div>
              <div>Announcement: {(custom.announcement||'').slice(0,30)}...</div>
              <div>Image: {custom.heroImage ? 'Custom ✓' : 'Using product[0]'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t flex items-center justify-between text-[11px] text-zinc-500">
        <span>Saved in <b>premium_custom</b> JSONB • Read by PremiumThemeRenderer in /s/[slug]</span>
        <span className="font-mono text-[10px] bg-[#F8F7F5] border px-2 py-1 rounded-full">{Object.keys(custom).length} fields</span>
      </div>
    </div>
  )
}
