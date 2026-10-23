'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const JAZZCASH_TILL_ID = '984837533'
const BANK_NAME = 'Alfalah Bank'

type Profile = { id: string; business_name: string; whatsapp_number: string; store_slug: string; store_theme?: string; current_plan?: string; plan_expires_at?: string; }
type Product = { id: string; name: string; price: number; image_url: string; user_id: string }
type Plan = { id: string; name: string; price_monthly?: number; price_yearly_total?: number; price_yearly_per_month?: number; duration_days: number; max_products: number; features: string[] }

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentPlanDef, setCurrentPlanDef] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [businessName, setBusinessName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [slug, setSlug] = useState('')
  const [showPlans, setShowPlans] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly'|'yearly'>('monthly')
  const [payMethod, setPayMethod] = useState<'till_app' | 'card_to_bank'>('till_app')
  const [txnId, setTxnId] = useState('')
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (prof) {
        setProfile(prof); setBusinessName(prof.business_name||''); setWhatsapp(prof.whatsapp_number||''); setSlug(prof.store_slug||'')
        const { data: prods } = await supabase.from('products').select('*').eq('user_id', prof.id).order('created_at', { ascending: false })
        if (prods) setProducts(prods)
      }
      const { data: plansData } = await supabase.from('plans').select('*').order('price_monthly')
      if (plansData && plansData.length>0) { setPlans(plansData); setCurrentPlanDef(plansData.find(p=>p.id===prof?.current_plan) || plansData[0]) }
      else {
        const fallback: Plan[] = [
          { id: 'basic', name: 'Basic', price_monthly: 0, price_yearly_total: 0, price_yearly_per_month: 0, duration_days: 36500, max_products: 5, features: ['5 Products','COD Only'] },
          { id: 'advanced', name: 'Advanced', price_monthly: 899, price_yearly_total: 8388, price_yearly_per_month: 699, duration_days: 30, max_products: 30, features: ['30 Products','All Payments','Orders Dashboard','Save Rs.2,400 yearly'] },
          { id: 'premium', name: 'Premium', price_monthly: 2499, price_yearly_total: 23988, price_yearly_per_month: 1999, duration_days: 30, max_products: 1000, features: ['Unlimited','Glass Themes','No Branding','Save Rs.6,000 yearly'] },
        ]
        setPlans(fallback); setCurrentPlanDef(fallback[0])
      }
      setLoading(false)
    }
    init()
  }, [])

  const handleBuyPlan = async () => {
    if (!profile || !selectedPlan) return
    const isYearly = billingCycle==='yearly'
    const amount = isYearly ? selectedPlan.price_yearly_total! : selectedPlan.price_monthly!
    
    if (payMethod==='card_to_bank') {
      setPurchasing(true)
      try {
        const res = await fetch('/api/payments/jazzcash/init', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan_id: selectedPlan.id, billing_cycle: billingCycle, user_id: profile.id, amount }) })
        const json = await res.json()
        if (json.actionUrl && json.payload) {
          const form = document.createElement('form'); form.method='POST'; form.action=json.actionUrl
          Object.entries(json.payload).forEach(([k,v])=>{ const i=document.createElement('input'); i.type='hidden'; i.name=k; i.value=v as string; form.appendChild(i) })
          document.body.appendChild(form); form.submit(); return
        } else { alert(`Pay to Till ${JAZZCASH_TILL_ID} via JazzCash App - then enter Txn ID. Money auto-goes to ${BANK_NAME}`); setPayMethod('till_app') }
      } catch(e:any){ alert(e.message) }
      setPurchasing(false); return
    }

    if (!txnId) { alert(`Enter Transaction ID after paying to Till ID ${JAZZCASH_TILL_ID}`); return }
    setPurchasing(true)
    try {
      const durationDays = isYearly ? 365 : 30
      await supabase.from('plan_purchases').insert({ user_id: profile.id, plan_id: selectedPlan.id, amount_paid: amount, payment_method: `jazzcash_till_${JAZZCASH_TILL_ID}_to_alfalah`, transaction_id: txnId, status: 'pending', billing_cycle: billingCycle, billing_months: isYearly?12:1, jazzcash_till_id: JAZZCASH_TILL_ID, expires_at: new Date(Date.now()+durationDays*24*60*60*1000).toISOString() })
      await supabase.from('profiles').update({ current_plan: selectedPlan.id, plan_started_at: new Date().toISOString(), plan_expires_at: new Date(Date.now()+durationDays*24*60*60*1000).toISOString(), plan_status: 'active' }).eq('id', profile.id)
      alert(`✅ Activated! Rs.${amount} → Till ${JAZZCASH_TILL_ID} → Auto-settles to ${BANK_NAME}`)
      window.location.reload()
    } catch(e:any){ alert(e.message) }
    setPurchasing(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-[#F8F7F5] pb-24">
      <header className="bg-white border-b sticky top-0 z-20"><div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between"><Link href="/" className="font-bold">DukaanWhats.pk • Till {JAZZCASH_TILL_ID} → {BANK_NAME}</Link><button onClick={()=>setShowPlans(true)} className="h-10 px-4 bg-black text-white rounded-[10px] text-[13px]">Upgrade Plan</button></div></header>
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="bg-white p-5 rounded-[20px] border"><h2 className="font-bold">Payments: Till ID {JAZZCASH_TILL_ID} → {BANK_NAME}</h2><p className="text-[13px] opacity-60 mt-2">Advanced Rs.899/mo or Rs.699/mo yearly (30 products) • Premium Rs.2499/mo or Rs.1999/mo yearly • Card payments via JazzCash secure page → Auto-settles to Alfalah Bank next morning 9 AM</p></div>
      </main>
      {showPlans && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
          <div className="bg-[#F8F7F5] rounded-[24px] max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b flex justify-between"><h2 className="font-bold text-[18px]">Plans — Till {JAZZCASH_TILL_ID} → {BANK_NAME}</h2><button onClick={()=>setShowPlans(false)} className="w-8 h-8 bg-white border rounded-full">✕</button></div>
            <div className="p-6 grid md:grid-cols-3 gap-4">
              {plans.map(plan => (
                <div key={plan.id} className="bg-white border-2 rounded-[20px] p-5">
                  <div className="font-bold">{plan.name}</div>
                  <div className="text-[22px] font-bold mt-2">Rs. {plan.id==='basic'?0: (billingCycle==='yearly'?plan.price_yearly_per_month:plan.price_monthly)}/mo</div>
                  {plan.id!=='basic' && <div className="text-[11px] opacity-60">Pay Rs.{billingCycle==='yearly'?plan.price_yearly_total:plan.price_monthly} → Till {JAZZCASH_TILL_ID} → {BANK_NAME}</div>}
                  <button onClick={()=>{setSelectedPlan(plan); setBillingCycle('monthly')}} className="mt-4 w-full h-10 bg-black text-white rounded-[10px] text-[13px]">Choose {plan.name}</button>
                </div>
              ))}
            </div>
            {selectedPlan && (selectedPlan.price_monthly||0)>0 && (
              <div className="p-6 bg-white mx-4 mb-6 rounded-[16px] border">
                <h3 className="font-bold">Pay Rs.{billingCycle==='yearly'?selectedPlan.price_yearly_total:selectedPlan.price_monthly} — Till {JAZZCASH_TILL_ID} → {BANK_NAME}</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button onClick={()=>setBillingCycle('monthly')} className={`p-3 border-2 rounded-[12px] ${billingCycle==='monthly'?'border-black bg-zinc-50':'border-zinc-200'}`}><div className="font-bold">Monthly Rs.{selectedPlan.price_monthly}</div></button>
                  <button onClick={()=>setBillingCycle('yearly')} className={`p-3 border-2 rounded-[12px] ${billingCycle==='yearly'?'border-[#E8FF86] bg-[#FFFEF0]':'border-zinc-200'}`}><div className="font-bold">Yearly Rs.{selectedPlan.price_yearly_per_month}/mo</div><div className="text-[11px]">Pay Rs.{selectedPlan.price_yearly_total}</div></button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={()=>setPayMethod('till_app')} className={`p-3 border-2 rounded-[12px] text-left ${payMethod==='till_app'?'border-black bg-black text-white':'border-zinc-200'}`}><div className="font-bold text-[12px]">JazzCash App → Till</div><div className="text-[10px]">Till {JAZZCASH_TILL_ID} → {BANK_NAME}</div></button>
                  <button onClick={()=>setPayMethod('card_to_bank')} className={`p-3 border-2 rounded-[12px] text-left ${payMethod==='card_to_bank'?'border-[#E8FF86] bg-black text-white':'border-zinc-200'}`}><div className="font-bold text-[12px]">Card → {BANK_NAME}</div><div className="text-[10px]">Visa/MC → Till {JAZZCASH_TILL_ID} → {BANK_NAME}</div></button>
                </div>
                <div className="mt-4 p-3 bg-[#FFF9E6] rounded-[12px] text-[12px]">
                  {payMethod==='till_app' ? `1. Open JazzCash App → Business → Till ID → Enter ${JAZZCASH_TILL_ID} → Amount Rs.${billingCycle==='yearly'?selectedPlan.price_yearly_total:selectedPlan.price_monthly} → Pay → Copy Txn ID. Money auto-settles to ${BANK_NAME} next morning.` : `Card payment: Redirect to JazzCash secure page → Enter Visa/Mastercard → Authorized by JazzCash → Money to Till ${JAZZCASH_TILL_ID} → Auto-settles to your ${BANK_NAME} account next morning 9 AM. PCI-DSS secure.`}
                </div>
                {payMethod==='till_app' && <input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder={`Txn ID from Till ${JAZZCASH_TILL_ID}`} className="mt-3 w-full h-11 px-4 border rounded-[12px]" />}
                <button onClick={handleBuyPlan} disabled={purchasing} className="mt-4 w-full h-12 bg-black text-white rounded-[12px] font-medium">{purchasing?'Processing...': payMethod==='card_to_bank'?`Pay Rs.${billingCycle==='yearly'?selectedPlan.price_yearly_total:selectedPlan.price_monthly} with Card → ${BANK_NAME}`:`I Paid Till ${JAZZCASH_TILL_ID} → Activate → ${BANK_NAME}`}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
