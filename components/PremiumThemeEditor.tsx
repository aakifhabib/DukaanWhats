'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Props = { profile: any; onSave: (d:any)=>void }

export function PremiumThemeEditor({ profile, onSave }: Props) {
  const [custom, setCustom] = useState<any>(profile?.premium_custom || {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(()=>{
    setCustom(profile?.premium_custom || {})
  },[profile?.premium_custom])

  const save = async () => {
    if(!profile?.id) return
    setSaving(true)
    try {
      const { error } = await (supabase as any).from('profiles').update({ premium_custom: custom }).eq('id', profile.id)
      if(error) throw error
      onSave(custom)
      setSaved(true)
      setTimeout(()=>setSaved(false), 2000)
    } catch(e:any) {
      alert(e.message || 'Save failed')
    }
    setSaving(false)
  }

  const themeId = profile?.store_theme || ''
  const isPremiumTheme = ['spike-premium','shoe-app-premium','trenzo-luxury','sleek-beige','sleek-dark','sleek-editorial'].includes(themeId)

  if(!isPremiumTheme){
    return (
      <div className="mt-6 bg-[#FFF7E8] border border-amber-200 rounded-[16px] p-4 text-[12px]">
        <div className="font-bold">âœï¸ Edit Premium Themes</div>
        <div className="mt-1 text-black/60">Select a Premium Glass theme above (Spike Pro / Shoe App Pro / Trenzo Luxury / Sleek) to unlock editor. Then you can change hero title, subtitle, brands.</div>
      </div>
    )
  }

  return (
    <div className="mt-6 bg-white border rounded-[20px] p-5">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h3 className="font-bold text-[14px]">âœï¸ Edit Premium â€” {themeId}</h3>
        <button onClick={save} disabled={saving} className="h-9 px-5 bg-black text-white rounded-full text-[12px] font-bold hover:bg-zinc-900">{saving ? 'Saving...' : saved ? 'Saved âœ“' : 'Save Edits'}</button>
      </div>
      <div className="mt-5 grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-black tracking-widest">HERO TITLE</label>
            <input value={custom.spikeTitle || ''} onChange={e=>setCustom({...custom, spikeTitle: e.target.value})} placeholder="The journey begins with the perfect pair" className="mt-1 w-full h-11 px-3 border rounded-[10px] text-[13px] outline-none focus:border-black" />
          </div>
          <div>
            <label className="text-[10px] font-black tracking-widest">SUBTITLE</label>
            <input value={custom.spikeSub || ''} onChange={e=>setCustom({...custom, spikeSub: e.target.value})} placeholder="Dive into unparalleled comfort..." className="mt-1 w-full h-11 px-3 border rounded-[10px] text-[13px] outline-none focus:border-black" />
          </div>
          <div>
            <label className="text-[10px] font-black tracking-widest">BRANDS (comma separated)</label>
            <input value={(custom.spikeBrands || []).join(', ')} onChange={e=>setCustom({...custom, spikeBrands: e.target.value.split(',').map((s:string)=>s.trim()).filter(Boolean)})} placeholder="All, Nike, Adidas, Puma" className="mt-1 w-full h-11 px-3 border rounded-[10px] text-[13px] outline-none focus:border-black" />
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-black tracking-widest">ANNOUNCEMENT BAR</label>
            <input value={custom.announcement || ''} onChange={e=>setCustom({...custom, announcement: e.target.value})} placeholder="FREE SHIPPING OVER RS. 5000 â€¢ NEW DROP LIVE" className="mt-1 w-full h-11 px-3 border rounded-[10px] text-[13px] outline-none focus:border-black" />
          </div>
          <div className="bg-[#F2F0FF] border border-violet-100 rounded-[12px] p-3 text-[11px] leading-[1.4]">
            <div className="font-bold">How it works:</div>
            <div className="mt-1 text-black/60">Saved in profiles.premium_custom JSONB. No redeploy needed. Edit and see live in store.</div>
            <div className="mt-2 text-[10px] mono bg-white border rounded px-2 py-1">Run SQL: alter table profiles add column if not exists premium_custom jsonb default '{}'::jsonb;</div>
          </div>
        </div>
      </div>
    </div>
  )
}
