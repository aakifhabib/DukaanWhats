'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const TILL_ID = '984837533'

type Plan = { id: string; name: string; price: number; duration_days: number; max_products: number; features: string[] }

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [selected, setSelected] = useState<Plan | null>(null)
  const [txnId, setTxnId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('plans').select('*').order('price')
      if (data && data.length) setPlans(data)
      else setPlans([
        { id: 'basic', name: 'Basic', price: 0, duration_days: 36500, max_products: 5, features: ['5 Products', '1 Image', 'COD Only'] },
        { id: 'advanced', name: 'Advanced', price: 499, duration_days: 30, max_products: 50, features: ['50 Products', '5 Images per product', 'All Themes', 'Orders Dashboard'] },
        { id: 'premium', name: 'Premium', price: 999, duration_days: 30, max_products: 1000, features: ['Unlimited Products', 'Glass Advanced Themes', 'No Branding', 'Priority Support'] },
      ])
      setLoading(false)
    }
    load()
  }, [])

  const handlePay = async () => {
    if (!selected || selected.price === 0) { router.push('/dashboard'); return }
    if (!txnId.trim()) { alert('Enter Transaction ID from 【entity-JazzCash¦canonical_name=JazzCash】'); return }
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      // Save payment request
      await supabase.from('plan_payments').insert({
        user_id: user.id,
        plan_id: selected.id,
        amount: selected.price,
        till_id: TILL_ID,
        txn_id: txnId.trim(),
        status: 'pending'
      })
      alert(`Payment submitted!\nTill ID: ${TILL_ID}\nTxn ID: ${txnId}\nWe will verify and activate ${selected.name} in 30 minutes.`)
      router.push('/dashboard')
    } catch (e: any) {
      alert(e.message)
    }
    setSubmitting(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8F7F5] text-">Loading plans...</div>

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-zinc-900">
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2"><div className="w-9 h-9 bg-black text-white rounded- flex items-center justify-center font-bold">D</div><span className="font-semibold">DukaanWhats.pk</span></Link>
          <Link href="/dashboard" className="h-10 px-5 bg-black text-white rounded- text- font-medium flex items-center">Dashboard</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text- font-bold tracking-tight">Pay with JazzCash Till ID</h1>
          <p className="text- text-zinc-500 mt-2">Only 1 method — simple, secure, no card details on our site</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text- font-bold">Till ID: {TILL_ID}</div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(p => (
            <div key={p.id} className={`rounded- border-2 p-6 flex flex-col ${p.id==='premium'?'bg-black text-white border-black':'bg-white border-zinc-200'}`}>
              <div className="font-bold text-">{p.name}</div>
              <div className="mt-2 text- font-bold">{p.price===0?'Free':`Rs. ${p.price}`}<span className="text- font-normal opacity-60">{p.price>0?' / month':''}</span></div>
              <div className="mt-4 space-y-2 flex-1">{p.features.map((f,i)=><div key={i} className="flex gap-2 text-"><span className="text-green-500">✓</span>{f}</div>)}</div>
              <button onClick={()=>setSelected(p)} className={`mt-6 h-11 rounded- font-medium ${p.id==='premium'?'bg-[#E8FF86] text-black':'bg-black text-white'}`}>{p.price===0?'Start Free':'Pay via Till ID'}</button>
            </div>
          ))}
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded- max-w-md w-full p-7">
              <div className="flex justify-between items-center"><h3 className="font-bold text-">Pay {selected.name} — Till {TILL_ID}</h3><button onClick={()=>setSelected(null)} className="w-8 h-8 rounded-full border flex items-center justify-center">✕</button></div>

              {/* Barcode + QR */}
              <div className="mt-6 bg-[#F8F7F5] rounded- p-5 border flex flex-col items-center">
                <div className="text- font-bold tracking-widest opacity-60">JAZZCASH TILL ID</div>
                <div className="text- font-black tracking-[0.2em] mt-2">{TILL_ID}</div>
                
                {/* Barcode */}
                <div className="mt-4 bg-white p-3 rounded- border w-full">
                  <img src={`https://barcodeapi.org/api/code128/${TILL_ID}`} alt="Till Barcode" className="w-full h- object-contain" />
                  <div className="text-center text- tracking-[0.3em] mt-1 font-mono">{TILL_ID}</div>
                </div>

                {/* QR Code */}
                <div className="mt-4 bg-white p-3 rounded- border">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=JAZZCASH_TILL_${TILL_ID}_AMOUNT_${selected.price}`} alt="Till QR" className="w- h-" />
                </div>
                <div className="text- text-zinc-500 mt-3 text-center">Scan QR in 【entity-JazzCash App¦canonical_name=JazzCash】 → Business → Till ID<br/>or enter Till ID manually</div>
              </div>

              <div className="mt-5 bg-[#FFF9E6] border border-[#F5E6A0] rounded- p-4 text- leading-[1.5]">
                <div className="font-bold">How to pay:</div>
                <div className="mt-2 space-y-1">
                  <div>1. Open <b>【entity-JazzCash App¦canonical_name=JazzCash】</b></div>
                  <div>2. Tap <b>Business / Till ID</b> or <b>Pay via Till</b></div>
                  <div>3. Enter Till ID: <b className="bg-black text-white px-2 py-0.5 rounded">{TILL_ID}</b></div>
                  <div>4. Amount: <b>Rs. {selected.price}</b></div>
                  <div>5. Pay → Copy <b>Transaction ID</b></div>
                </div>
              </div>

              {selected.price > 0 && (
                <div className="mt-5">
                  <label className="text- font-medium">【entity-JazzCash¦canonical_name=JazzCash】 Transaction ID *</label>
                  <input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder="e.g. 1234567890" className="mt-1.5 w-full h-11 px-4 border rounded- text- font-mono" />
                  <div className="text- text-zinc-500 mt-1">You will find this in 【entity-JazzCash App¦canonical_name=JazzCash】 → History after payment</div>
                </div>
              )}

              <button onClick={handlePay} disabled={submitting} className="mt-6 w-full h-12 bg-black text-white rounded- font-medium text- disabled:opacity-50">
                {submitting ? 'Submitting...' : selected.price===0 ? 'Activate Free Plan' : `I Paid to Till ${TILL_ID} — Activate`}
              </button>

              <div className="mt-3 text- text-center text-zinc-400">Till ID {TILL_ID} • Funds go to DukaanWhats Business Account • Verified in 30 mins</div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
