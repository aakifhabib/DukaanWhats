
'use client'
import { useState, useEffect, useRef } from 'react'

type Device = 'mobile' | 'tablet' | 'desktop'

export function PremiumThemeEditor({ profile, onSave }: { profile: any, onSave: (d: any) => void }) {
  const [device, setDevice] = useState<Device>('mobile')
  const [saving, setSaving] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  // Mock premium custom fields - matches screenshot fields
  const [fields, setFields] = useState({
    headerLabel: profile?.premium_custom?.headerLabel || 'My Store',
    topLabel: profile?.premium_custom?.topLabel || 'NOIR • PREMIUM • 2024',
    announcement: profile?.premium_custom?.announcement || 'EDITORIAL • MINIMAL BY AAKIF • LUXURY • FREE SHIPPING • COD',
    badge: profile?.premium_custom?.badge || 'MINIMAL • 2024',
    freeShippingBadge: profile?.premium_custom?.freeShippingBadge || 'FREE SHIPPING',
    hotBadge: profile?.premium_custom?.hotBadge || 'HOT',
  })

  // Calculate scale for tablet/desktop to prevent overflow
  useEffect(() => {
    const calcScale = () => {
      if (!previewRef.current) return
      const containerWidth = previewRef.current.offsetWidth - 32 // padding
      if (device === 'mobile') {
        setScale(1)
      } else if (device === 'tablet') {
        // Tablet 768px should scale to fit
        const targetWidth = 768
        const newScale = Math.min(1, containerWidth / targetWidth)
        setScale(newScale)
      } else {
        // Desktop 1200px
        const targetWidth = 1200
        const newScale = Math.min(1, containerWidth / targetWidth)
        setScale(newScale)
      }
    }
    calcScale()
    window.addEventListener('resize', calcScale)
    return () => window.removeEventListener('resize', calcScale)
  }, [device])

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    onSave(fields)
    setSaving(false)
  }

  const deviceWidths = {
    mobile: 390,
    tablet: 768,
    desktop: 1200
  }

  return (
    <div className="w-full space-y-0 overflow-hidden rounded-[24px] border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 bg-[#0A0A0A] px-5 py-4 md:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#E8FF86] text-black shadow-[0_4px_16px_rgba(232,255,134,0.2)]">⚡</div>
          <div>
            <div className="text-[14px] font-bold tracking-[-0.01em] text-white">Spike Pro</div>
            <div className="text-[11px] text-white/40 font-mono">tech-minimal • Premium editor</div>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="h-9 rounded-full bg-[#E8FF86] px-4 text-[12px] font-semibold text-black hover:bg-[#e4ff7a] transition-all disabled:opacity-50 shadow-[0_2px_12px_rgba(232,255,134,0.2)]">
          {saving ? 'Saving...' : 'Save Live →'}
        </button>
      </div>

      {/* Form Fields - with premium styling */}
      <div className="p-5 md:p-7 space-y-5 bg-white">
        <div className="text-[10px] font-black tracking-[0.14em] text-zinc-400">TECH-MINIMAL</div>
        
        <div className="rounded-[16px] bg-[#0A0A0A] p-4 text-white">
          <div className="text-[12px] font-bold">Header</div>
          <div className="text-[11px] text-white/50">Top bar</div>
        </div>

        {[
          { label: 'HEADER LABEL', key: 'headerLabel', value: fields.headerLabel },
          { label: 'TOP LABEL', key: 'topLabel', value: fields.topLabel },
          { label: 'ANNOUNCEMENT BAR', key: 'announcement', value: fields.announcement },
          { label: 'BADGE', key: 'badge', value: fields.badge },
        ].map(f => (
          <div key={f.key} className="space-y-2">
            <div className="text-[10px] font-black tracking-[0.12em] text-zinc-900">{f.label}</div>
            <input
              value={f.value}
              onChange={e => setFields({ ...fields, [f.key]: e.target.value })}
              className="w-full h-[46px] rounded-full border border-zinc-900 bg-white px-4 text-[13px] font-medium focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all"
            />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-[10px] font-black tracking-[0.12em]">FREE SHIPPING BADGE</div>
            <input value={fields.freeShippingBadge} onChange={e => setFields({ ...fields, freeShippingBadge: e.target.value })} className="w-full h-[46px] rounded-full border border-zinc-200 bg-[#FAFAF9] px-4 text-[13px] font-bold focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all" />
          </div>
          <div className="space-y-2">
            <div className="text-[10px] font-black tracking-[0.12em]">HOT BADGE</div>
            <input value={fields.hotBadge} onChange={e => setFields({ ...fields, hotBadge: e.target.value })} className="w-full h-[46px] rounded-full border border-zinc-200 bg-[#FAFAF9] px-4 text-[13px] font-bold focus:outline-none focus:border-black transition-all" />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 pt-5">
          <span className="text-[11px] text-zinc-400 font-mono">32 fields • tech-minimal</span>
          <button onClick={handleSave} disabled={saving} className="h-10 rounded-full bg-black px-5 text-[12px] font-semibold text-white hover:bg-zinc-900 transition-all">
            {saving ? 'Saving...' : 'Save Live →'}
          </button>
        </div>
      </div>

      {/* LIVE PREVIEW - FIXED: No white blank, no overflow */}
      <div className="border-t border-zinc-200 bg-[#0A0A0A]">
        <div className="flex items-center justify-between px-5 py-3 md:px-7">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.14em] text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E8FF86] animate-pulse" />
            TECH-MINIMAL • LIVE PREVIEW
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 backdrop-blur-md border border-white/10">
            {(['mobile', 'tablet', 'desktop'] as Device[]).map(d => (
              <button
                key={d}
                onClick={() => setDevice(d)}
                className={`h-7 rounded-full px-3 text-[11px] font-semibold capitalize transition-all ${device === d ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Preview Container - FIXED overflow */}
        <div ref={previewRef} className="relative flex justify-center overflow-hidden bg-[#0A0A0A] p-4 md:p-8 min-h-[600px]">
          {/* Device Frame */}
          <div
            className="relative origin-top transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{
              width: deviceWidths[device],
              height: device === 'mobile' ? 844 : device === 'tablet' ? 1024 : 800,
              transform: `scale(${scale})`,
              marginBottom: device === 'mobile' ? 0 : `${-(deviceWidths[device] === 768 ? 1024 : 800) * (1 - scale)}px`,
            }}
          >
            {/* Phone/Tablet frame */}
            <div className={`absolute inset-0 overflow-hidden bg-white shadow-[0_32px_80px_rgba(0,0,0,0.4)] ${device === 'mobile' ? 'rounded-[48px] border-[10px] border-zinc-900' : device === 'tablet' ? 'rounded-[24px] border-[8px] border-zinc-800' : 'rounded-[16px] border border-zinc-800'}`}>
              {/* Notch for mobile */}
              {device === 'mobile' && (
                <div className="absolute top-0 left-1/2 z-20 h-6 w-24 -translate-x-1/2 rounded-b-[12px] bg-zinc-900" />
              )}
              
              {/* ACTUAL STORE PREVIEW - NOT BLANK */}
              <div className="h-full w-full overflow-y-auto bg-[#FCFBF9] text-[#0A0A0A]">
                {/* Announcement */}
                <div className="flex h-6 items-center justify-center bg-black px-2 text-[8px] font-bold tracking-[0.14em] text-white">
                  {fields.announcement}
                </div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-black/5 bg-white/80 px-4 py-3 backdrop-blur-md">
                  <div className="text-[12px] font-black tracking-tight">{fields.headerLabel}</div>
                  <div className="h-5 rounded-full bg-black px-2 text-[8px] font-bold text-white flex items-center">CART • 0</div>
                </div>
                {/* Hero */}
                <div className="p-4">
                  <div className="inline-flex h-5 items-center rounded-full bg-black px-2 text-[8px] font-bold text-white">{fields.badge}</div>
                  <div className="mt-2 text-[20px] font-black leading-[0.9] tracking-[-0.02em]">Cool and<br/>Minimal<br/>by Aakif</div>
                  <div className="mt-2 text-[10px] leading-[1.4] text-black/60">Clean lines, intentional whitespace, premium finish. Built for conversion.</div>
                  <div className="mt-3 flex gap-1.5">
                    <div className="h-6 rounded-full bg-black px-3 text-[9px] font-bold text-white flex items-center">Shop Now</div>
                    <div className="h-6 rounded-full border border-black/10 bg-white px-3 text-[9px] font-bold flex items-center">{fields.freeShippingBadge}</div>
                  </div>
                </div>
                {/* Products Grid - Always visible, not white blank */}
                <div className="grid grid-cols-2 gap-2 p-3">
                  {[
                    'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=400&fit=crop',
                    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
                    'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop',
                    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop',
                  ].map((img, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-[14px] bg-white border border-black/5">
                      <div className="aspect-[4/5] overflow-hidden bg-[#F5F3F0]">
                        <img src={img} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        {i === 0 && <div className="absolute left-2 top-2 rounded-full bg-[#E8FF86] px-2 py-0.5 text-[7px] font-black text-black">{fields.hotBadge}</div>}
                      </div>
                      <div className="p-2.5">
                        <div className="text-[9px] font-bold tracking-tight">Product {i+1}</div>
                        <div className="text-[8px] text-black/50">Rs. {(2500 + i*500).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3">
                  <div className="rounded-[12px] bg-black p-3 text-white">
                    <div className="text-[10px] font-bold">{fields.topLabel}</div>
                    <div className="mt-1 text-[8px] text-white/60">Premium • Fast delivery across Pakistan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
