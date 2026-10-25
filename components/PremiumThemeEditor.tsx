
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function PremiumThemeEditor({ profile, onSave }: { profile: any, onSave: (data:any)=>void }) {
  const [custom, setCustom] = useState<any>(profile?.premium_custom || {})
  
  useEffect(()=>{ setCustom(profile?.premium_custom || {}) },[profile])

  const save = async () => {
    try {
      const { error } = await (supabase as any).from('profiles').update({ premium_custom: custom }).eq('id', profile.id)
      if(error) throw error
      onSave(custom)
      alert('Premium theme settings saved!')
    } catch(e:any){ alert(e.message) }
  }

  return (
    <div className="mt-6 bg-white border border-black/10 rounded-[20px] p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-black text-white rounded-[10px] grid place-items-center font-black text-[12px]">✦</div>
        <div><div className="font-bold text-[14px]">Edit Premium Themes</div><div className="text-[11px] text-zinc-500">Customize Spike, Shoe App, Trenzo - users can edit their own store content</div></div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div><label className="text-[11px] font-bold tracking-widest uppercase">Spike Hero Title</label><input value={custom.spikeTitle || ''} onChange={e=>setCustom({...custom, spikeTitle: e.target.value})} placeholder="The journey begins with the perfect pair" className="mt-1 w-full h-10 px-3 border rounded-[10px] text-[13px]"/><div className="text-[10px] text-zinc-400 mt-1">Editable by store owner in dashboard</div></div>
        <div><label className="text-[11px] font-bold tracking-widest uppercase">Spike Subtitle</label><input value={custom.spikeSub || ''} onChange={e=>setCustom({...custom, spikeSub: e.target.value})} placeholder="Unmatched comfort..." className="mt-1 w-full h-10 px-3 border rounded-[10px] text-[13px]"/></div>
        <div><label className="text-[11px] font-bold tracking-widest uppercase">Brands (comma separated)</label><input value={(custom.spikeBrands || []).join(', ') || ''} onChange={e=>setCustom({...custom, spikeBrands: e.target.value.split(',').map((s:string)=>s.trim()).filter(Boolean)})} placeholder="All, Nike, Adidas, Puma" className="mt-1 w-full h-10 px-3 border rounded-[10px] text-[13px]"/></div>
        <div><label className="text-[11px] font-bold tracking-widest uppercase">Announcement Text</label><input value={custom.announcement || ''} onChange={e=>setCustom({...custom, announcement: e.target.value})} placeholder="Free Shipping Over Rs. 5000" className="mt-1 w-full h-10 px-3 border rounded-[10px] text-[13px]"/></div>
      </div>
      <button onClick={save} className="mt-4 h-10 px-6 bg-black text-white rounded-full text-[13px] font-bold hover:bg-zinc-800">Save Premium Theme Settings</button>
    </div>
  )
}
