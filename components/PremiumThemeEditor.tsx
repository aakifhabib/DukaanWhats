'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const PREMIUM_IDS = ['spike-premium','shoe-app-premium','trenzo-luxury','sleek-beige','sleek-dark','sleek-editorial']
const DEFAULTS: Record<string, any> = {
  'spike-premium': {
    headerPrefix: 'SPIKE',
    headerLabel: 'SPIKE • Shoes Shalwar',
    announcement: 'EDITORIAL • MINIMAL BY AAKIF • LUXURY • FREE SHIPPING • COD',
    badge: 'MINIMAL • 2024',
    heroTitle: 'Cool and Aakif style',
    heroSubtitle: 'Clean lines, intentional whitespace, premium finish. Less is luxury.',
    ctaText: 'Shop Editorial →',
    brands: ['All','Nike','Adidas','Puma','New Balance'],
    statsOrders: '500+',
    statsRating: '4.9★',
    statsCod: 'COD',
    heroImage: '',
  },
}

function ChipInput({ value, onChange, placeholder, label }: { value: string[]; onChange: (v:string[])=>void; placeholder: string; label: string }) {
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
      <label className="text-[10px] font-black tracking-[0.14em] text-zinc-500 uppercase">{label} — highlighted in red</label>
      <div className="mt-2 flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); add() } }} placeholder={placeholder} className="flex-1 h-11 px-4 bg-[#FAFAF9] border rounded-[12px] text-[13px]" />
        <button onClick={add} className="h-11 px-5 bg-black text-white rounded-[12px] text-[12px] font-bold">Add</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {value.map((b,i)=>(
          <div key={i} className="h-8 px-3.5 bg-white border rounded-full flex items-center gap-2 text-[12px] font-semibold">
            <span>{b}</span>
            <button onClick={()=>onChange(value.filter((_,idx)=>idx!==i))} className="w-5 h-5 grid place-items-center rounded-full bg-zinc-100">✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PremiumThemeEditor({ profile, onSave }: { profile: any; onSave: (d:any)=>void }) {
  const themeId = profile?.store_theme || 'spike-premium'
  const defaults = DEFAULTS[themeId] || DEFAULTS['spike-premium']
  const [custom, setCustom] = useState<any>(profile?.premium_custom || {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'header'|'filters'|'general'>('header')
  useEffect(()=>{
    const base = profile?.premium_custom || {}
    const merged = { ...defaults, ...base }
    setCustom(merged)
  },[profile?.premium_custom, themeId])
  const update = (k:string, v:any) => setCustom((s:any)=>({ ...s, [k]: v }))
  const save = async () => {
    if(!profile?.id) return
    setSaving(true)
    try {
      const toSave = { ...custom, spikeTitle: custom.heroTitle, spikeSub: custom.heroSubtitle, spikeBrands: custom.brands }
      const { error } = await (supabase as any).from('profiles').update({ premium_custom: toSave }).eq('id', profile.id)
      if(error) throw error
      onSave(toSave)
      setSaved(true)
      setTimeout(()=>setSaved(false), 2500)
    } catch(e:any){ alert(e.message) }
    setSaving(false)
  }
  return (
    <div className="mt-6 bg-white border rounded-[24px] overflow-hidden">
      <div className="bg-black text-white p-4 flex justify-between"><div className="font-bold">Premium Studio — {themeId}</div><button onClick={save} className="h-10 px-6 bg-[#E8FF86] text-black rounded-full font-black">{saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Live →'}</button></div>
      <div className="flex gap-2 p-3 bg-[#FAFAF9] border-b">
        <button onClick={()=>setTab('header')} className={`h-9 px-4 rounded-full font-bold ${tab==='header'?'bg-black text-white':'bg-white border'}`}>Header — you circled ◯</button>
        <button onClick={()=>setTab('filters')} className={`h-9 px-4 rounded-full font-bold ${tab==='filters'?'bg-black text-white':'bg-white border'}`}>Filters — you circled ◯</button>
        <button onClick={()=>setTab('general')} className={`h-9 px-4 rounded-full font-bold ${tab==='general'?'bg-black text-white':'bg-white border'}`}>General</button>
      </div>
      <div className="p-6 space-y-6">
        {tab==='header' && (
          <div className="space-y-4">
            <div className="bg-[#0A0A0A] text-white rounded-[14px] p-4 text-[12px]">You circled <b>SPIKE - Shoes Shalwar</b> — edit here. Change prefix from SPIKE to EDITORIAL to fix your screenshot.</div>
            <div><label className="text-[10px] font-black">FULL HEADER TEXT (top left)</label><input value={custom.headerLabel || ''} onChange={e=>update('headerLabel', e.target.value)} placeholder="SPIKE • Shoes Shalwar" className="mt-2 w-full h-11 px-4 border-2 border-black rounded-[12px] font-bold" /><div className="mt-2 p-2.5 bg-[#E8FF86] rounded-[10px] text-[11px]">Live: <b>{custom.headerLabel || 'SPIKE • Shoes Shalwar'}</b></div></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[10px] font-black">PREFIX</label><input value={custom.headerPrefix || ''} onChange={e=>{update('headerPrefix', e.target.value); update('headerLabel', e.target.value + ' • ' + (custom.headerLabel?.split('•')[1]?.trim() || ''))}} placeholder="SPIKE" className="mt-1 w-full h-11 px-4 bg-[#FAFAF9] border rounded-[12px]" /></div>
              <div><label className="text-[10px] font-black">BADGE</label><input value={custom.badge || ''} onChange={e=>update('badge', e.target.value)} placeholder="MINIMAL • 2024" className="mt-1 w-full h-11 px-4 bg-[#FAFAF9] border rounded-[12px]" /></div>
            </div>
            <div><label className="text-[10px] font-black">HERO TITLE</label><textarea value={custom.heroTitle || ''} onChange={e=>update('heroTitle', e.target.value)} rows={2} className="mt-1 w-full px-4 py-3 bg-[#FAFAF9] border rounded-[12px] font-black text-[15px]" /></div>
          </div>
        )}
        {tab==='filters' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-[14px] p-4 text-[12px] text-red-700">You circled <b>All, Nike, Adidas, Puma, New Balance</b> — edit / delete / add any brand here</div>
            <ChipInput value={custom.brands || []} onChange={v=>update('brands', v)} label="BRAND FILTERS" placeholder="Type brand and Enter" />
          </div>
        )}
        {tab==='general' && (
          <div className="space-y-4">
            <div><label className="text-[10px] font-black">ANNOUNCEMENT</label><input value={custom.announcement || ''} onChange={e=>update('announcement', e.target.value)} className="mt-1 w-full h-11 px-4 bg-[#FAFAF9] border rounded-[12px]" /></div>
            <div><label className="text-[10px] font-black">SUBTITLE</label><textarea value={custom.heroSubtitle || ''} onChange={e=>update('heroSubtitle', e.target.value)} rows={3} className="mt-1 w-full px-4 py-3 bg-[#FAFAF9] border rounded-[12px]" /></div>
          </div>
        )}
        <button onClick={save} className="h-11 px-6 bg-black text-white rounded-full font-bold w-full">{saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save All →'}</button>
      </div>
    </div>
  )
}
