
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type AnalyticsData = {
  totalViews: number
  todayViews: number
  productViews: number
  whatsappClicks: number
  dailyData: { date: string, views: number, clicks: number }[]
  topProducts: { id: string, name: string, views: number, clicks: number }[]
  recentEvents: any[]
}

export function RealAnalytics({ userId, currentPlanId }: { userId: string, currentPlanId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d'|'30d'|'all'>('7d')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      let query = supabase.from('store_analytics').select('*, products(name)').eq('store_owner_id', userId)
      
      if (period === '7d') {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        query = query.gte('created_at', sevenDaysAgo.toISOString())
      } else if (period === '30d') {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        query = query.gte('created_at', thirtyDaysAgo.toISOString())
      }

      const { data: events, error } = await query.order('created_at', { ascending: false }).limit(500)
      if (error) throw error

      if (!events || events.length === 0) {
        setData({ totalViews: 0, todayViews: 0, productViews: 0, whatsappClicks: 0, dailyData: [], topProducts: [], recentEvents: [] })
        setLoading(false)
        return
      }

      const totalViews = events.filter(e => e.event_type === 'store_view').length
      const today = new Date().toDateString()
      const todayViews = events.filter(e => e.event_type === 'store_view' && new Date(e.created_at).toDateString() === today).length
      const productViews = events.filter(e => e.event_type === 'product_view').length
      const whatsappClicks = events.filter(e => e.event_type === 'whatsapp_click').length

      // Daily data for chart
      const dailyMap = new Map()
      events.forEach(e => {
        const date = new Date(e.created_at).toISOString().split('T')[0]
        if (!dailyMap.has(date)) dailyMap.set(date, { date, views: 0, clicks: 0 })
        if (e.event_type === 'store_view') dailyMap.get(date).views++
        if (e.event_type === 'whatsapp_click') dailyMap.get(date).clicks++
      })
      const dailyData = Array.from(dailyMap.values()).sort((a,b) => a.date.localeCompare(b.date)).slice(-7)

      // Top products
      const productMap = new Map()
      events.filter(e => e.product_id).forEach(e => {
        if (!productMap.has(e.product_id)) {
          productMap.set(e.product_id, { id: e.product_id, name: e.products?.name || 'Unknown', views: 0, clicks: 0 })
        }
        if (e.event_type === 'product_view') productMap.get(e.product_id).views++
        if (e.event_type === 'whatsapp_click') productMap.get(e.product_id).clicks++
      })
      const topProducts = Array.from(productMap.values()).sort((a,b) => (b.views + b.clicks) - (a.views + a.clicks)).slice(0,5)

      setData({ totalViews, todayViews, productViews, whatsappClicks, dailyData, topProducts, recentEvents: events.slice(0,10) })
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  if (loading) return <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" /></div>

  if (!data || data.totalViews === 0) {
    return (
      <div className="bg-white border rounded-[24px] p-12 text-center">
        <div className="w-16 h-16 bg-[#F8F7F5] border rounded-[16px] flex items-center justify-center mx-auto text-[24px]">📊</div>
        <h3 className="font-black text-[16px] mt-4">No analytics yet</h3>
        <p className="text-[12px] text-zinc-500 mt-2 max-w-[320px] mx-auto">Share your store link <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded">/s/your-store</span> — real views will appear here. Premium plan shows live analytics.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-[#E8FF86] opacity-75" /><span className="relative rounded-full h-2 w-2 bg-[#E8FF86]" /></span>
          <span className="font-black text-[14px]">LIVE Real Analytics</span>
          <span className="text-[10px] bg-black text-white px-2 h-5 rounded-full flex items-center">REAL DATA</span>
        </div>
        <div className="flex gap-1 bg-[#F8F7F5] border rounded-full p-1">
          {(['7d','30d','all'] as const).map(p => (
            <button key={p} onClick={()=>setPeriod(p)} className={`h-7 px-3 rounded-full text-[11px] font-bold ${period===p ? 'bg-black text-white' : 'text-zinc-500'}`}>{p.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border rounded-[16px] p-4"><div className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">Total Views</div><div className="text-[24px] font-black mt-1">{data.totalViews}</div><div className="text-[11px] text-zinc-500 mt-1">All time</div></div>
        <div className="bg-black text-white rounded-[16px] p-4"><div className="text-[10px] font-bold tracking-widest uppercase opacity-60">Today</div><div className="text-[24px] font-black mt-1">{data.todayViews}</div><div className="text-[11px] opacity-60 mt-1">Store views</div></div>
        <div className="bg-white border rounded-[16px] p-4"><div className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">Product Views</div><div className="text-[24px] font-black mt-1">{data.productViews}</div><div className="text-[11px] text-zinc-500 mt-1">Clicks on products</div></div>
        <div className="bg-[#E8FF86] border border-black/10 rounded-[16px] p-4"><div className="text-[10px] font-bold tracking-widest uppercase text-black/60">WhatsApp Clicks</div><div className="text-[24px] font-black mt-1 text-black">{data.whatsappClicks}</div><div className="text-[11px] text-black/60 mt-1">Leads generated</div></div>
      </div>

      <div className="bg-white border rounded-[20px] p-5">
        <div className="font-black text-[13px]">Views Last 7 Days</div>
        <div className="mt-4 flex items-end gap-2 h-[100px]">
          {data.dailyData.map((d, i) => {
            const max = Math.max(...data.dailyData.map(x=>x.views), 1)
            const h = (d.views / max) * 80 + 10
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-black rounded-[8px] transition-all" style={{ height: `${h}px` }} />
                <div className="text-[10px] font-bold">{new Date(d.date).toLocaleDateString('en', { weekday: 'short' }).slice(0,2)}</div>
                <div className="text-[10px] text-zinc-500">{d.views}</div>
              </div>
            )
          })}
        </div>
      </div>

      {data.topProducts.length > 0 && (
        <div className="bg-white border rounded-[20px] p-5">
          <div className="font-black text-[13px]">Top Products (Real)</div>
          <div className="mt-3 space-y-2">
            {data.topProducts.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-[#F8F7F5] border rounded-[12px] p-3">
                <span className="text-[13px] font-bold truncate max-w-[160px]">{p.name}</span>
                <span className="text-[11px] text-zinc-500">{p.views} views • {p.clicks} WA clicks</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
