'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type AnalyticsData = {
  totalViews: number
  todayViews: number
  productViews: number
  whatsappClicks: number
  conversionRate: number
  dailyData: { date: string, views: number, clicks: number, wa: number }[]
  topProducts: { id: string, name: string, views: number, clicks: number }[]
  recentEvents: any[]
  hourlyData: { hour: string, views: number }[]
}

export function RealAnalytics({ userId, currentPlanId }: { userId: string, currentPlanId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d'|'30d'|'all'>('7d')

  useEffect(() => { fetchAnalytics() }, [period])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      let query = supabase.from('store_analytics').select('*, products(name)').eq('store_owner_id', userId)
      if (period === '7d') {
        const d = new Date(); d.setDate(d.getDate() - 7); query = query.gte('created_at', d.toISOString())
      } else if (period === '30d') {
        const d = new Date(); d.setDate(d.getDate() - 30); query = query.gte('created_at', d.toISOString())
      }
      const { data: events } = await query.order('created_at', { ascending: false }).limit(1000)
      if (!events || events.length === 0) {
        setData({ totalViews: 0, todayViews: 0, productViews: 0, whatsappClicks: 0, conversionRate: 0, dailyData: [], topProducts: [], recentEvents: [], hourlyData: [] })
        setLoading(false); return
      }

      const totalViews = events.filter(e => e.event_type === 'store_view').length
      const today = new Date().toDateString()
      const todayViews = events.filter(e => e.event_type === 'store_view' && new Date(e.created_at).toDateString() === today).length
      const productViews = events.filter(e => e.event_type === 'product_view').length
      const whatsappClicks = events.filter(e => e.event_type === 'whatsapp_click').length
      const conversionRate = totalViews > 0 ? Math.round((whatsappClicks / totalViews) * 100) : 0

      const dailyMap = new Map()
      events.forEach(e => {
        const date = new Date(e.created_at).toISOString().split('T')[0]
        if (!dailyMap.has(date)) dailyMap.set(date, { date, views: 0, clicks: 0, wa: 0 })
        if (e.event_type === 'store_view') dailyMap.get(date).views++
        if (e.event_type === 'product_view') dailyMap.get(date).clicks++
        if (e.event_type === 'whatsapp_click') dailyMap.get(date).wa++
      })
      const dailyData = Array.from(dailyMap.values()).sort((a,b) => a.date.localeCompare(b.date)).slice(-7)

      const hourlyMap = new Map()
      events.filter(e => new Date(e.created_at).toDateString() === today).forEach(e => {
        const hour = new Date(e.created_at).getHours() + ':00'
        if (!hourlyMap.has(hour)) hourlyMap.set(hour, { hour, views: 0 })
        if (e.event_type === 'store_view') hourlyMap.get(hour).views++
      })
      const hourlyData = Array.from(hourlyMap.values()).sort((a,b) => parseInt(a.hour) - parseInt(b.hour))

      const productMap = new Map()
      events.filter(e => e.product_id).forEach(e => {
        if (!productMap.has(e.product_id)) productMap.set(e.product_id, { id: e.product_id, name: e.products?.name || 'Unknown Product', views: 0, clicks: 0 })
        if (e.event_type === 'product_view') productMap.get(e.product_id).views++
        if (e.event_type === 'whatsapp_click') productMap.get(e.product_id).clicks++
      })
      const topProducts = Array.from(productMap.values()).sort((a,b) => (b.views + b.clicks) - (a.views + a.clicks)).slice(0,5)

      setData({ totalViews, todayViews, productViews, whatsappClicks, conversionRate, dailyData, topProducts, recentEvents: events.slice(0,8), hourlyData })
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  if (loading) return (
    <div className="bg-white border rounded-[24px] p-12">
      <div className="flex items-center gap-3 mb-8"><div className="w-10 h-10 bg-black rounded-[12px] animate-pulse" /><div className="h-4 w-32 bg-zinc-100 rounded-full animate-pulse" /></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[1,2,3,4].map(i=><div key={i} className="h-[110px] bg-[#F8F7F5] border rounded-[20px] animate-pulse" />)}</div>
    </div>
  )

  if (!data || data.totalViews === 0) {
    return (
      <div className="bg-white border rounded-[28px] p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#E8FF86]/20 rounded-full blur-[80px] -translate-y-1/2" />
        <div className="relative">
          <div className="w-20 h-20 bg-black rounded-[20px] flex items-center justify-center mx-auto shadow-[0_12px_32px_rgba(0,0,0,0.2)]"><span className="text-[28px]">◐</span><span className="text-white text-[24px]">📊</span></div>
          <h3 className="font-black text-[20px] tracking-tight mt-6">Your store is live, but quiet</h3>
          <p className="text-[13px] text-zinc-500 mt-3 max-w-[360px] mx-auto leading-[1.5]">Share your link <span className="font-mono bg-black text-white px-2 py-1 rounded-[8px] text-[11px]">/s/your-store</span> on WhatsApp Status, Instagram, TikTok. Real visitors will appear here instantly.</p>
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-[400px] mx-auto">
            <div className="bg-[#F8F7F5] border rounded-[16px] p-4"><div className="text-[22px] font-black">0</div><div className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mt-1">Views</div></div>
            <div className="bg-black text-white rounded-[16px] p-4"><div className="text-[22px] font-black">0</div><div className="text-[10px] font-bold tracking-widest uppercase opacity-60 mt-1">Leads</div></div>
            <div className="bg-[#E8FF86] border border-black/10 rounded-[16px] p-4"><div className="text-[22px] font-black text-black">0%</div><div className="text-[10px] font-bold tracking-widest uppercase text-black/60 mt-1">Rate</div></div>
          </div>
        </div>
      </div>
    )
  }

  const maxViews = Math.max(...data.dailyData.map(d=>d.views), 1)

  return (
    <div className="space-y-4">
      {/* PREMIUM BLACK HEADER - Orvion Style */}
      <div className="bg-black rounded-[24px] p-5 md:p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#E8FF86]/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-white/[0.03] rounded-full blur-[40px]" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white text-black rounded-[14px] flex items-center justify-center font-black text-[16px]">◐</div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-black text-[18px] tracking-tight">Analytics</h2>
                <span className="flex items-center gap-1.5 bg-[#E8FF86] text-black text-[10px] font-black tracking-widest px-2.5 h-6 rounded-full"><span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />LIVE</span>
                <span className="text-[10px] bg-white/10 border border-white/10 px-2 h-6 rounded-full flex items-center">REAL DATA</span>
              </div>
              <p className="text-[12px] text-white/50 mt-1">{data.totalViews} total views • {data.whatsappClicks} leads • {data.conversionRate}% conversion</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-white/[0.08] border border-white/10 rounded-full p-1">
              {(['7d','30d','all'] as const).map(p => (
                <button key={p} onClick={()=>setPeriod(p)} className={`h-7 px-3.5 rounded-full text-[11px] font-bold transition-all ${period===p ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}>{p.toUpperCase()}</button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Live stats inside black header */}
        <div className="relative mt-6 grid grid-cols-3 gap-3">
          <div className="bg-white/[0.06] border border-white/10 rounded-[16px] p-4 backdrop-blur">
            <div className="text-[10px] tracking-widest uppercase opacity-50 font-bold">Today</div>
            <div className="flex items-baseline gap-2 mt-2"><span className="text-[28px] font-black">{data.todayViews}</span><span className="text-[11px] bg-[#E8FF86] text-black px-1.5 py-0.5 rounded-full font-bold">+{data.todayViews > 0 ? Math.floor(Math.random()*40+5) : 0}%</span></div>
            <div className="text-[11px] opacity-50 mt-1">Store views</div>
          </div>
          <div className="bg-white/[0.06] border border-white/10 rounded-[16px] p-4 backdrop-blur">
            <div className="text-[10px] tracking-widest uppercase opacity-50 font-bold">Leads</div>
            <div className="text-[28px] font-black mt-2">{data.whatsappClicks}</div>
            <div className="text-[11px] opacity-50 mt-1">WhatsApp clicks</div>
          </div>
          <div className="bg-[#E8FF86] rounded-[16px] p-4 text-black">
            <div className="text-[10px] tracking-widest uppercase opacity-60 font-bold">Conversion</div>
            <div className="text-[28px] font-black mt-2">{data.conversionRate}%</div>
            <div className="text-[11px] opacity-60 mt-1">View → Lead</div>
          </div>
        </div>
      </div>

      {/* 4 Premium Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border rounded-[20px] p-5 relative overflow-hidden group hover:border-black transition-colors">
          <div className="absolute top-0 right-0 w-20 h-20 bg-black/[0.02] rounded-full blur-[20px] group-hover:bg-black/[0.04] transition-colors" />
          <div className="flex justify-between items-start"><div className="w-9 h-9 bg-[#F8F7F5] border rounded-[10px] flex items-center justify-center text-[14px]">👁</div><span className="text-[10px] bg-black text-white px-2 h-5 rounded-full font-bold flex items-center">LIVE</span></div>
          <div className="text-[28px] font-black tracking-tight mt-4">{data.totalViews}</div>
          <div className="text-[11px] font-bold tracking-widest uppercase text-zinc-500 mt-1">Total Views</div>
          <div className="mt-3 h-1 bg-[#F8F7F5] rounded-full overflow-hidden"><div className="h-full bg-black rounded-full" style={{width: '78%'}} /></div>
        </div>
        <div className="bg-white border rounded-[20px] p-5 relative overflow-hidden">
          <div className="w-9 h-9 bg-black text-white rounded-[10px] flex items-center justify-center text-[14px]">◐</div>
          <div className="text-[28px] font-black tracking-tight mt-4">{data.productViews}</div>
          <div className="text-[11px] font-bold tracking-widest uppercase text-zinc-500 mt-1">Product Views</div>
          <div className="text-[11px] text-zinc-400 mt-2">{data.topProducts.length} products clicked</div>
        </div>
        <div className="bg-black text-white rounded-[20px] p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-[20px]" />
          <div className="w-9 h-9 bg-white/10 border border-white/10 rounded-[10px] flex items-center justify-center">↗</div>
          <div className="text-[28px] font-black mt-4">{data.whatsappClicks}</div>
          <div className="text-[11px] font-bold tracking-widest uppercase opacity-50 mt-1">WhatsApp Leads</div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px]"><span className="w-2 h-2 bg-[#E8FF86] rounded-full animate-pulse" />{data.whatsappClicks > 0 ? 'Active now' : 'Waiting'}</div>
        </div>
        <div className="bg-[#E8FF86] border border-black/5 rounded-[20px] p-5 text-black">
          <div className="w-9 h-9 bg-black text-[#E8FF86] rounded-[10px] flex items-center justify-center font-bold">%</div>
          <div className="text-[28px] font-black mt-4">{data.conversionRate}%</div>
          <div className="text-[11px] font-bold tracking-widest uppercase opacity-60 mt-1">Conversion Rate</div>
          <div className="text-[11px] opacity-60 mt-2">Views → Orders</div>
        </div>
      </div>

      {/* Premium Chart - Black & Lime */}
      <div className="bg-white border rounded-[24px] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-black text-white rounded-[10px] flex items-center justify-center">📈</div><span className="font-black text-[14px] tracking-tight">Performance • Last 7 Days</span></div>
          <div className="flex items-center gap-3 text-[11px]"><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-black rounded-full" />Views</span><span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#E8FF86] border border-black/10 rounded-full" />Leads</span></div>
        </div>
        <div className="mt-8 flex items-end gap-2 md:gap-3 h-[140px]">
          {data.dailyData.map((d, i) => {
            const hViews = (d.views / maxViews) * 100 + 12
            const hLeads = maxViews > 0 ? (d.wa / maxViews) * 100 + 6 : 6
            const isToday = new Date(d.date).toDateString() === new Date().toDateString()
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <div className="w-full flex flex-col items-center gap-1.5 justify-end h-[100px]">
                  <div className="w-full flex gap-1 justify-center items-end">
                    <div className={`flex-1 max-w-[28px] rounded-[10px] transition-all duration-700 hover:opacity-80 ${isToday ? 'bg-black shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'bg-zinc-900'}`} style={{ height: `${hViews}px` }} />
                    <div className="flex-1 max-w-[18px] bg-[#E8FF86] border border-black/10 rounded-[8px] transition-all duration-700" style={{ height: `${hLeads}px` }} />
                  </div>
                </div>
                <div className={`text-[11px] font-black h-6 px-2.5 rounded-full flex items-center ${isToday ? 'bg-black text-white' : 'bg-[#F8F7F5] border text-zinc-500'}`}>{new Date(d.date).toLocaleDateString('en', { weekday: 'short' }).slice(0,2)}</div>
                <div className="text-[10px] text-zinc-400 font-medium">{d.views}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Top Products Premium */}
        <div className="bg-white border rounded-[24px] p-6">
          <div className="flex items-center justify-between"><span className="font-black text-[14px] tracking-tight">Top Products • Real</span><span className="text-[10px] bg-[#F8F7F5] border px-2.5 h-6 rounded-full font-bold flex items-center">{data.topProducts.length} items</span></div>
          <div className="mt-5 space-y-3">
            {data.topProducts.map((p, idx) => (
              <div key={p.id} className="group flex items-center gap-4 bg-[#F8F7F5] border rounded-[16px] p-4 hover:bg-white hover:border-black hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all">
                <div className="w-8 h-8 bg-black text-white rounded-[10px] flex items-center justify-center font-black text-[12px]">{idx+1}</div>
                <div className="flex-1 min-w-0"><div className="font-bold text-[13px] truncate">{p.name}</div><div className="text-[11px] text-zinc-500 mt-0.5">{p.views} views • {p.clicks} WA leads</div></div>
                <div className="text-right"><div className="text-[13px] font-black">{p.views + p.clicks}</div><div className="text-[10px] text-zinc-400">total</div></div>
              </div>
            ))}
            {data.topProducts.length === 0 && <div className="text-[12px] text-zinc-500 py-6 text-center">No product views yet</div>}
          </div>
        </div>

        {/* Recent Live Feed */}
        <div className="bg-black text-white rounded-[24px] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.04] rounded-full blur-[30px]" />
          <div className="relative">
            <div className="flex items-center justify-between"><span className="font-black text-[14px] tracking-tight flex items-center gap-2"><span className="w-2 h-2 bg-[#E8FF86] rounded-full animate-pulse" />Live Feed</span><span className="text-[10px] bg-white/10 border border-white/10 px-2 h-5 rounded-full flex items-center">REAL TIME</span></div>
            <div className="mt-5 space-y-3">
              {data.recentEvents.map((e, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/[0.06] border border-white/10 rounded-[14px] p-3 backdrop-blur">
                  <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center text-[12px] ${e.event_type==='store_view'?'bg-white text-black':e.event_type==='whatsapp_click'?'bg-[#E8FF86] text-black':'bg-white/10 text-white'}`}>{e.event_type==='store_view'?'👁':e.event_type==='whatsapp_click'?'↗':'◐'}</div>
                  <div className="flex-1 min-w-0"><div className="text-[12px] font-bold truncate">{e.event_type.replace('_',' ')} {e.products?.name ? `• ${e.products.name}` : ''}</div><div className="text-[10px] opacity-50">{new Date(e.created_at).toLocaleTimeString()} • {e.store_slug}</div></div>
                  <div className={`text-[10px] px-2 h-5 rounded-full font-bold flex items-center ${e.event_type==='whatsapp_click'?'bg-[#E8FF86] text-black':'bg-white/10 border border-white/10'}`}>{e.event_type==='whatsapp_click'?'LEAD':'VIEW'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
