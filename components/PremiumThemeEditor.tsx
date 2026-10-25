'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function PremiumThemeEditor({ profile, onSave }: { profile: any; onSave: (d:any)=>void }) {
  const [custom, setCustom] = useState<any>(profile?.premium_custom || {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(()=>{ setCustom(profile?.premium_custom || {}) },[profile?.premium_custom])

  const save = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({ premium_custom: custom }).eq('id', profile.id)
      if(error) throw error
      onSave(custom)
      setSaved(true)
      setTimeout(()=>setSaved(false),2000)
    } catch(e:any){ alert(e.message) }
    setSaving(false)
  }

  const themeId = profile?.store_theme || ''
  const isPremium = ['spike-premium','shoe-app-premium','trenzo-luxury','sleek-beige','sleek-dark','sleek-editorial'].includes(themeId)

  if(!isPremium) return (
    <div className="mt-6 bg-[#FFF7E8] border border-amber-200 rounded-[16px] p-4 text-[12px]">
      <div className="font-bold">Editing Premium Themes</div>
      <div className="mt-1 text-black/60">Select a Premium Glass theme above (Spike Pro / Shoe App Pro / Trenzo Luxury) to unlock editor. Then you can change hero title, subtitle, brands & announcement.</div>
    </div>
  )

  return (
    <div className="mt-6 bg-white border rounded-[20px] p-5">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-[14px]">✏️ Edit Your Premium Theme — {themeId}</h3>
        <button onClick={save} disabled={saving} className="h-9 px-5 bg-black text-white rounded-full text-[12px] font-bold">{saving?'Saving...': saved ? 'Saved ✓' : 'Save Edits'}</button>
      </div>

      <div className="mt-5 grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold mono tracking-widest">HERO TITLE (Spike / Trenzo)</label>
            <input value={custom.spikeTitle||''} onChange={e=>setCustom({...custom, spikeTitle: e.target.value})} placeholder="The journey begins with the perfect pair" className="mt-1 w-full h-11 px-3 border rounded-[10px] text-[13px]"/>
          </div>
          <div>
            <label className="text-[11px] font-bold mono tracking-widest">SUBTITLE</label>
            <input value={custom.spikeSub||''} onChange={e=>setCustom({...custom, spikeSub: e.target.value})} placeholder="Dive into unparalleled comfort..." className="mt-1 w-full h-11 px-3 border rounded-[10px] text-[13px]"/>
          </div>
          <div>
            <label className="text-[11px] font-bold mono tracking-widest">BRANDS (comma separated)</label>
            <input value={(custom.spikeBrands||[]).join(', ')||''} onChange={e=>setCustom({...custom, spikeBrands: e.target.value.split(',').map((s:string)=>s.trim()).filter(Boolean)})} placeholder="All, Nike, Adidas, Puma, New Balance" className="mt-1 w-full h-11 px-3 border rounded-[10px] text-[13px]"/>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold mono tracking-widest">ANNOUNCEMENT BAR</label>
            <input value={custom.announcement||''} onChange={e=>setCustom({...custom, announcement: e.target.value})} placeholder="FREE SHIPPING OVER RS. 5000 • NEW DROP LIVE" className="mt-1 w-full h-11 px-3 border rounded-[10px] text-[13px]"/>
          </div>
          <div>
            <label className="text-[11px] font-bold mono tracking-widest">SHOE APP - MEMBER PERKS TEXT</label>
            <input value={custom.shoePerks||''} onChange={e=>setCustom({...custom, shoePerks: e.target.value})} placeholder="Free Shipping + 7 Days Return" className="mt-1 w-full h-11 px-3 border rounded-[10px] text-[13px]"/>
          </div>
          <div className="bg-[#F2F0FF] border border-violet-100 rounded-[12px] p-3 text-[11px] leading-[1.4]">
            <div className="font-bold">How editing works:</div>
            <div className="mt-1 text-black/60">All edits saved in <code className='bg-white px-1 rounded'>profiles.premium_custom</code> JSONB. Themes read <code className='bg-white px-1 rounded'>custom.spikeTitle</code>, <code className='bg-white px-1 rounded'>spikeSub</code>, <code className='bg-white px-1 rounded'>spikeBrands</code>. Instant preview after save. No code redeploy needed.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
