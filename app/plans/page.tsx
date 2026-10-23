'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const TILL_ID = '984837533'

type Billing = 'monthly' | 'yearly'
type Plan = { id: string; name: string; monthly: number; yearlyMonthly: number; yearlyTotal: number; max_products: number; images: number|string; advancedThemes: string; features: string[]; badge: string; popular?: boolean }

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [selected, setSelected] = useState<Plan | null>(null)
  const [billing, setBilling] = useState<Billing>('monthly')
  const [txnId, setTxnId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [copiedTill, setCopiedTill] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      // New pricing per your request
      const newPlans: Plan[] = [
        { 
          id: 'basic', 
          name: 'Basic', 
          monthly: 0, 
          yearlyMonthly: 0, 
          yearlyTotal: 0, 
          max_products: 5, 
          images: 1,
          advancedThemes: '3 Advanced',
          badge: 'FREE',
          features: ['Up to 5 Products', '1 Image per product', 'Up to 3 Advanced Themes', 'No Premium Theme', 'COD Only'] 
        },
        { 
          id: 'advanced', 
          name: 'Advanced', 
          monthly: 899, 
          yearlyMonthly: 699, 
          yearlyTotal: 8388, 
          max_products: 25, 
          images: 5,
          advancedThemes: 'All 8 Advanced',
          badge: 'MOST POPULAR',
          popular: true,
          features: ['Up to 25 Products', '5 Images per product', 'All 8 Advanced Themes', 'All Standard Themes', 'Orders Dashboard + Analytics'] 
        },
        { 
          id: 'premium', 
          name: 'Premium', 
          monthly: 2999, 
          yearlyMonthly: 2499, 
          yearlyTotal: 29988, 
          max_products: 999999, 
          images: 'Unlimited',
          advancedThemes: 'Every Theme',
          badge: 'UNLIMITED',
          features: ['Unlimited Products', 'Unlimited Image Uploads', 'Access to Every Theme', 'No DukaanWhats Watermark', 'Live Analytics + Dashboard', 'Priority Support'] 
        },
      ]
      const { data } = await supabase.from('plans').select('*').order('price')
      if (data && data.length && data[0].price===899) setPlans(data as any)
      else setPlans(newPlans)
      setLoading(false)
    }
    load()
  }, [])

  const getPrice = (p: Plan) => billing==='monthly' ? p.monthly : p.yearlyMonthly
  const getTotal = (p: Plan) => billing==='monthly' ? p.monthly : p.yearlyTotal

  const copyTill = async () => { await navigator.clipboard.writeText(TILL_ID); setCopiedTill(true); setTimeout(()=>setCopiedTill(false),2000) }

  const handlePay = async () => {
    if (!selected || selected.monthly === 0) { router.push('/dashboard'); return }
    if (!txnId.trim()) { alert('Enter Transaction ID from JazzCash App after paying to Till ID '+TILL_ID); return }
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      await supabase.from('plan_payments').insert({
        user_id: user.id,
        plan_id: selected.id,
        amount: getTotal(selected),
        till_id: TILL_ID,
        txn_id: txnId.trim(),
        status: 'pending',
        billing_cycle: billing
      })
      alert(`Payment submitted!\nTill ID: ${TILL_ID}\nPlan: ${selected.name} (${billing})\nAmount: Rs. ${getTotal(selected)}\nTxn: ${txnId}\nWe will verify in 30 mins.`)
      router.push('/dashboard')
    } catch (e: any) { alert(e.message) }
    setSubmitting(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8F7F5]">Loading plans...</div>

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-zinc-900">
      <style>{`
        .radio-container{--main-color:#E8FF86;--total-radio:3;display:flex;flex-direction:column;position:relative;padding-left:1rem}
        .radio-container input{appearance:none;position:absolute;opacity:0}
        .radio-container .glider-container{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(0deg,transparent 0%,rgba(20,20,20,0.15) 50%,transparent 100%);width:1px}
        .radio-container .glider{position:relative;height:calc(100% / var(--total-radio));width:100%;background:linear-gradient(0deg,transparent 0%,var(--main-color) 50%,transparent 100%);transition:transform .5s cubic-bezier(0.37,1.95,0.66,0.56)}
        .radio-container .glider::before{content:"";position:absolute;height:60%;width:300%;top:50%;transform:translateY(-50%);background:var(--main-color);filter:blur(10px)}
        .radio-container label{cursor:pointer;padding:14px 12px;border-radius:12px;color:#9ca3af;transition:all .3s}
        .radio-container input:checked+label{color:#0A0A0A;background:#fff;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,.06)}
        .radio-container input:nth-of-type(1):checked~.glider-container .glider{transform:translateY(0)}
        .radio-container input:nth-of-type(2):checked~.glider-container .glider{transform:translateY(100%)}
        .radio-container input:nth-of-type(3):checked~.glider-container .glider{transform:translateY(200%)}
        .billing-toggle{display:flex;background:#0A0A0A;border-radius:999px;padding:4px;gap:4px}
        .billing-btn{height:32px;padding:0 16px;border-radius:999px;font-size:12px;font-weight:600;transition:all .3s;white-space:nowrap}
        .billing-btn-active{background:#fff;color:#0A0A0A}
        .billing-btn-inactive{color:rgba(255,255,255,0.6)}
        .card-glow:hover{box-shadow:0 20px 40px rgba(0,0,0,0.08),0 0 0 1px #E8FF86}
      `}</style>

      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-3 md:px-6 h-[56px] md:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2"><div style={{borderRadius:10}} className="w-9 h-9 bg-black text-white flex items-center justify-center font-bold">D</div><span className="font-semibold tracking-tight">DukaanWhats.pk</span></Link>
          <div className="flex items-center gap-2">
            <div className="billing-toggle">
              <button onClick={()=>setBilling('monthly')} className={`billing-btn ${billing==='monthly'?'billing-btn-active':'billing-btn-inactive'}`}>Monthly</button>
              <button onClick={()=>setBilling('yearly')} className={`billing-btn ${billing==='yearly'?'billing-btn-active':'billing-btn-inactive'}`}>Yearly <span className="ml-1 bg-[#E8FF86] text-black text-[9px] px-1.5 py-0.5 rounded-full font-bold">-22%</span></button>
            </div>
            <Link href="/dashboard" className="h-10 px-5 bg-black text-white rounded-[12px] text-[12px] font-medium flex items-center">Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-[11px] font-bold tracking-widest">Till ID: {TILL_ID} • JazzCash Only</div>
          <h1 className="text-[32px] md:text-[44px] font-black tracking-tight mt-4 leading-[0.9]">Pay with <span className="bg-[#E8FF86] px-2">JazzCash Till ID</span></h1>
          <p className="text-[13px] text-zinc-500 mt-3 max-w-xl mx-auto">Only 1 method — simple, secure, no card details on our site • Monthly / Yearly billing</p>
          <p className="text-[11px] text-zinc-400 mt-2">Basic: 5 products • 1 image • 3 advanced themes • Advanced: 25 products • 5 images • All 8 advanced themes • Premium: Unlimited • No watermark • Live analytics</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(p => {
            const price = getPrice(p)
            return (
              <div key={p.id} className={`rounded-[20px] border-2 p-6 flex flex-col relative card-glow transition-all ${p.popular?'border-black bg-white shadow-[0_16px_40px_rgba(0,0,0,0.08)] md:scale-[1.04] md:-translate-y-2':'bg-white border-zinc-200'}`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#E8FF86] text-black text-[9px] tracking-[0.15em] font-bold">MOST POPULAR</div>}
                <div className="flex items-center justify-between"><div className="font-black text-[14px] tracking-tight">{p.name}</div><span className={`text-[9px] px-2 py-1 rounded-full font-bold tracking-widest ${p.id==='premium'?'bg-black text-white':'bg-zinc-100 border'}`}>{p.badge}</span></div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-[12px] opacity-60">Rs.</span><span className="text-[36px] font-black leading-none">{price}</span><span className="text-[12px] opacity-60">/{billing==='monthly'?'mo':'mo'}</span>
                </div>
                {p.id!=='basic' && billing==='yearly' && <div className="mt-1 text-[11px] text-zinc-500">Billed Rs. {p.yearlyTotal}/year • <span className="bg-[#E8FF86] text-black px-1.5 py-0.5 rounded-full font-bold text-[10px]">Save Rs. {(p.monthly - p.yearlyMonthly)*12}</span></div>}
                {p.id!=='basic' && billing==='monthly' && <div className="mt-1 text-[11px] text-zinc-500">Yearly: Rs. {p.yearlyMonthly}/mo • Save 22%</div>}
                {p.id==='basic' && <div className="mt-1 text-[11px] text-zinc-500">Free forever</div>}
                
                <div className="mt-4 h-[1px] bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
                <div className="mt-4 space-y-2.5 flex-1">
                  {p.features.map((f,i)=><div key={i} className="flex gap-2 text-[12px]"><span className="text-green-500 font-bold">✓</span><span className="opacity-70 leading-[1.3]">{f}</span></div>)}
                </div>
                <button onClick={()=>setSelected(p)} className={`mt-6 h-11 rounded-full font-bold text-[12px] flex items-center justify-center gap-2 ${p.id==='premium'?'bg-[#E8FF86] text-black':p.popular?'bg-black text-white':'bg-zinc-900 text-white'}`}>{p.monthly===0?'Start Free →':`Pay Rs. ${getTotal(p)} via Till ${TILL_ID}`}<span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${p.id==='premium'?'bg-black text-white':'bg-white text-black'}`}>↗</span></button>
              </div>
            )
          })}
        </div>

        <div className="mt-10 bg-black text-white rounded-[20px] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#E8FF86] text-black flex items-center justify-center font-bold">!</div><div><div className="font-bold text-[13px]">JazzCash Till ID {TILL_ID} — Only Payment Method</div><div className="text-[11px] opacity-60 mt-1">Basic 5 products 1 image 3 advanced themes • Advanced 25 products 5 images all 8 advanced themes • Premium unlimited no watermark live analytics</div></div></div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span><span className="text-[11px] opacity-70">Secure • Verified in 30 mins</span></div>
        </div>
      </main>

      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[12px] z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[440px] max-h-[90vh] overflow-auto bg-[#F8F7F5] rounded-[24px] border-2 border-black shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
            <div className="sticky top-0 z-10 p-6 border-b bg-white rounded-t-[22px] flex items-center justify-between">
              <div><div className="text-[11px] tracking-[0.2em] uppercase opacity-50 font-bold">PAY VIA TILL ID {TILL_ID}</div><div className="font-black text-[18px] mt-1">Pay Rs. {getTotal(selected)} — {selected.name} ({billing})</div><div className="text-[11px] opacity-60 mt-1">{selected.max_products===999999?'Unlimited':selected.max_products} products • {selected.images==='Unlimited'?'Unlimited':selected.images} images • {selected.advancedThemes}</div></div>
              <button onClick={()=>setSelected(null)} className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center">✕</button>
            </div>

            <div className="p-6">
              {/* Uiverse Glider for Plan Selection Inside Popup */}
              <div className="mb-6 bg-white border rounded-[16px] p-4">
                <div className="text-[11px] font-bold tracking-widest uppercase mb-2">Selected Plan — Yellow Glider</div>
                <div className="radio-container" style={{"--total-radio": plans.length} as any}>
                  {plans.map(p=>(
                    <div key={p.id} className="contents">
                      <input type="radio" id={`popup-${p.id}`} name="popup-plan" checked={selected.id===p.id} onChange={()=>setSelected(p)} />
                      <label htmlFor={`popup-${p.id}`} onClick={()=>setSelected(p)}>
                        <div className="flex justify-between items-center"><div><div className="font-bold text-[13px] flex items-center gap-2">{p.name} {p.popular && <span className="bg-black text-white text-[8px] px-1.5 py-0.5 rounded-full">POPULAR</span>}</div><div className="text-[11px] opacity-60 mt-0.5">{p.max_products===999999?'Unlimited':p.max_products} products • {p.images} img • {p.advancedThemes}</div></div><div className="text-[13px] font-black">Rs. {billing==='monthly'?p.monthly:p.yearlyMonthly}</div></div>
                      </label>
                    </div>
                  ))}
                  <div className="glider-container"><div className="glider"></div></div>
                </div>
              </div>

              {/* Till ID Card with Barcode + QR - SAME BG as pricing cards */}
              <div className="rounded-[16px] bg-black text-white p-5 text-center border-2 border-[#E8FF86]/30 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30" style={{background:'radial-gradient(circle at 20% 10%, #E8FF86 0%, transparent 50%)'}} />
                <div className="relative">
                  <div className="text-[10px] tracking-[0.2em] uppercase opacity-50">JAZZCASH TILL ID</div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="text-[34px] font-black tracking-[0.18em] font-mono">{TILL_ID}</div>
                    <button onClick={copyTill} className="h-7 px-3 bg-white/10 border border-white/20 rounded-full text-[10px]">{copiedTill?'Copied!':'Copy'}</button>
                  </div>
                  <div className="mt-4 bg-white rounded-[12px] p-3"><img src={`https://barcodeapi.org/api/code128/${TILL_ID}`} alt="Till Barcode" className="w-full h-[56px] object-contain" /><div className="text-center text-[10px] tracking-[0.3em] mt-2 font-mono text-black font-bold">{TILL_ID}</div></div>
                  <div className="mt-4 bg-white rounded-[16px] p-3 inline-block"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=JAZZCASH_TILL_${TILL_ID}_AMOUNT_${getTotal(selected)}_PLAN_${selected.id}_BILLING_${billing}`} alt="Till QR" className="w-[170px] h-[170px]" /></div>
                  <div className="text-[11px] opacity-60 mt-4 leading-relaxed">Open <b className="text-[#E8FF86]">JazzCash App</b> → <b className="text-white">Business</b> → <b className="text-white">Till ID</b> → Enter <span className="bg-[#E8FF86] text-black px-2 py-0.5 rounded font-bold">{TILL_ID}</span></div>
                </div>
              </div>

              <div className="mt-5 rounded-[12px] bg-[#FFF9E6] border border-[#F5E6A0] p-4 text-[12px] leading-[1.5]">
                <div className="font-bold text-[11px] tracking-widest uppercase">HOW TO PAY</div>
                <div className="mt-2 space-y-1 opacity-80">
                  <div>1. Open <b>JazzCash App</b> → <b>Business / Till ID</b></div>
                  <div>2. Enter Till ID: <b className="bg-black text-white px-2 py-0.5 rounded">{TILL_ID}</b></div>
                  <div>3. Amount: <b>Rs. {getTotal(selected)}</b> ({billing}) for {selected.name}</div>
                  <div>4. Pay → Copy <b>Transaction ID</b> from History</div>
                </div>
                <div className="mt-3 text-[11px] bg-white border rounded-full px-3 py-1.5 inline-flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>{selected.max_products===999999?'Unlimited':selected.max_products} products • {selected.images} images • {selected.advancedThemes} • {selected.id==='premium'?'No watermark + Live analytics':''}</div>
              </div>

              {selected.monthly > 0 ? (
                <div className="mt-5">
                  <label className="text-[11px] font-bold tracking-widest uppercase opacity-60">JazzCash Transaction ID *</label>
                  <input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder={`Paste Txn ID after paying Rs. ${getTotal(selected)} to Till ${TILL_ID}`} className="mt-2 w-full h-12 px-4 border-2 rounded-[12px] bg-white text-[12px] font-mono focus:outline-none focus:border-black" />
                  <button onClick={handlePay} disabled={submitting} className="mt-4 w-full h-12 bg-black text-white rounded-full font-bold text-[13px] flex items-center justify-center gap-2 disabled:opacity-50">{submitting ? 'Submitting...' : `I Paid Rs. ${getTotal(selected)} to Till ${TILL_ID} — Activate ${selected.name}`} <span className="w-5 h-5 bg-white text-black rounded-full flex items-center justify-center">↗</span></button>
                </div>
              ) : (
                <button onClick={()=>router.push('/dashboard')} className="mt-5 w-full h-12 bg-black text-white rounded-full font-bold text-[13px]">Continue Free — Go to Dashboard</button>
              )}

              <div className="mt-4 text-center text-[10px] opacity-40">Till {TILL_ID} • Funds to DukaanWhats Business • Verification in 30 mins • Secure by JazzCash</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
