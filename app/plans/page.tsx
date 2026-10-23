'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Plan = { id: string; name: string; price: number; price_monthly?: number; price_yearly_total?: number; price_yearly_per_month?: number; max_products: number; features: string[] }

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [billing, setBilling] = useState<'monthly'|'yearly'>('monthly')

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('plans').select('*').order('price_monthly')
      if (data && data.length>0) setPlans(data)
      else setPlans([
        { id: 'basic', name: 'Basic', price: 0, price_monthly: 0, price_yearly_total: 0, price_yearly_per_month: 0, max_products: 5, features: ['5 Products','1 Image','3 Themes','COD Only'] },
        { id: 'advanced', name: 'Advanced', price: 899, price_monthly: 899, price_yearly_total: 8388, price_yearly_per_month: 699, max_products: 30, features: ['30 Products','5 Images','All Standard Themes','All Payments','Orders Dashboard'] },
        { id: 'premium', name: 'Premium', price: 2499, price_monthly: 2499, price_yearly_total: 23988, price_yearly_per_month: 1999, max_products: 1000, features: ['Unlimited','All Themes Glass','All Payments','No Branding','Priority Support'] },
      ])
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-[#F8F7F5]">
      <header className="bg-white border-b sticky top-0 z-20"><div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between"><Link href="/" className="flex items-center gap-2"><div className="w-9 h-9 bg-black text-white rounded-[10px] flex items-center justify-center font-bold">D</div><span className="font-semibold">DukaanWhats.pk</span></Link><Link href="/dashboard" className="h-10 px-5 bg-black text-white rounded-[10px] text-[13px] font-medium flex items-center">Dashboard</Link></div></header>
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8"><h1 className="text-[32px] font-bold">Plans — Final Pricing</h1><p className="text-zinc-500 mt-2 text-[14px]">Advanced Rs.899/mo or Rs.699/mo yearly (30 products) • Premium Rs.2499/mo or Rs.1999/mo yearly</p>
          <div className="mt-6 inline-flex bg-white border rounded-full p-1"><button onClick={()=>setBilling('monthly')} className={`px-6 h-9 rounded-full text-[13px] font-medium ${billing==='monthly'?'bg-black text-white':'text-zinc-600'}`}>Monthly</button><button onClick={()=>setBilling('yearly')} className={`px-6 h-9 rounded-full text-[13px] font-medium ${billing==='yearly'?'bg-black text-white':'text-zinc-600'}`}>Yearly <span className="bg-[#E8FF86] text-black text-[10px] px-2 py-0.5 rounded-full ml-1">Save 20-22%</span></button></div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(plan => {
            const monthly = plan.price_monthly || 0
            const yearlyPerMonth = plan.price_yearly_per_month || 0
            const yearlyTotal = plan.price_yearly_total || 0
            const displayPrice = billing==='yearly' && plan.id!=='basic' ? yearlyPerMonth : monthly
            return (
              <div key={plan.id} className={`rounded-[24px] border-2 p-7 flex flex-col ${plan.id==='premium'?'bg-black text-white border-black': plan.id==='advanced'?'bg-zinc-900 text-white':'bg-white'}`}>
                <div className="font-bold text-[18px]">{plan.name}</div>
                <div className="mt-4"><span className="text-[36px] font-bold">Rs. {plan.id==='basic'?'Free':displayPrice}</span><span className="opacity-60 text-[14px]">{plan.id==='basic'?'':'/mo'}</span></div>
                {billing==='yearly' && plan.id!=='basic' && <div className="mt-2 text-[12px]"><span className="line-through opacity-50">Rs. {monthly}/mo</span><span className="ml-2 bg-[#E8FF86] text-black px-2 py-0.5 rounded-full font-bold">Save Rs.{monthly - yearlyPerMonth}</span><div className="mt-1 opacity-70">Pay Rs.{yearlyTotal} for 12 months</div></div>}
                {billing==='monthly' && plan.id!=='basic' && <div className="mt-2 text-[12px] opacity-60">Billed monthly • Yearly saves 20-22%</div>}
                <div className="mt-6 space-y-2 flex-1">{plan.features.map((f,i)=><div key={i} className="flex gap-2 text-[13px]"><span className="text-green-500">✓</span>{f}</div>)}</div>
                <Link href="/dashboard" className={`mt-8 h-11 rounded-[12px] flex items-center justify-center font-medium ${plan.id==='premium'?'bg-[#E8FF86] text-black': plan.id==='advanced'?'bg-white text-black':'bg-black text-white'}`}>{plan.id==='basic'?'Start Free':'Choose Plan'}</Link>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
