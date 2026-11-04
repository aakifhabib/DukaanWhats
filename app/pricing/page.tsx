'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const TILL_ID = '984837533'

type Billing = 'monthly' | 'yearly'

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [billing, setBilling] = useState<Billing>('monthly')
  const [txnId, setTxnId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [copiedTill, setCopiedTill] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [paymentNotice, setPaymentNotice] = useState('')
  const router = useRouter()

  const plans = [
    { 
      id: 'basic', 
      name: 'Basic', 
      monthly: 0,
      yearlyMonthly: 0,
      yearlyTotal: 0,
      badge: 'FREE', 
      features: ['5 Products only', '1 Image per product', 'Up to 3 Advanced Themes', 'No Premium Theme', 'WhatsApp orders'], 
      cardClass: 'card-basic', 
      btn: 'Start Free →', 
      popular: false 
    },
    { 
      id: 'advanced', 
      name: 'Advanced', 
      monthly: 899,
      yearlyMonthly: 699,
      yearlyTotal: 8388,
      badge: 'MOST POPULAR', 
      features: ['25 Products', '5 Images per product', 'All 8 Advanced Themes', 'All Standard Themes', 'Orders + Analytics'], 
      cardClass: 'card-advanced', 
      btn: 'Go Advanced', 
      popular: true 
    },
    { 
      id: 'premium', 
      name: 'Premium', 
      monthly: 2999,
      yearlyMonthly: 2499,
      yearlyTotal: 29988,
      badge: 'UNLIMITED', 
      features: ['Unlimited Products', 'Unlimited Images', 'Every Theme Unlocked', 'No DukaanWhats Watermark', 'Live Analytics + Priority'], 
      cardClass: 'card-premium', 
      btn: 'Go Premium', 
      popular: false 
    },
  ]

  const getPrice = (p: any) => billing==='monthly' ? p.monthly : p.yearlyMonthly
  const getTotal = (p: any) => billing==='monthly' ? p.monthly : p.yearlyTotal

  const copyTill = async () => {
    try {
      await navigator.clipboard.writeText(TILL_ID)
    } catch {
      const field = document.createElement('textarea')
      field.value = TILL_ID
      field.style.position = 'fixed'
      field.style.opacity = '0'
      document.body.appendChild(field)
      field.select()
      document.execCommand('copy')
      field.remove()
    }
    setCopiedTill(true)
    setTimeout(() => setCopiedTill(false), 1800)
  }
  const closePayment = () => { setSelectedPlan(null); setTxnId(''); setPaymentError('') }

  useEffect(() => {
    if (!paymentNotice) return
    const timer = window.setTimeout(() => setPaymentNotice(''), 6000)
    return () => window.clearTimeout(timer)
  }, [paymentNotice])

  useEffect(() => {
    if (!selectedPlan) return
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') closePayment() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [selectedPlan])

  const handlePay = async () => {
    if (!selectedPlan) return
    if (selectedPlan.monthly===0) { router.push('/dashboard'); return }
    if (!txnId.trim()) return
    setSubmitting(true)
    setPaymentError('')
    try{
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { closePayment(); router.push('/login'); return }
      const { error } = await supabase.from('plan_payments').insert({
        user_id: user.id,
        plan_id: selectedPlan.id,
        amount: getTotal(selectedPlan),
        till_id: TILL_ID,
        txn_id: txnId.trim(),
        status: 'pending',
        billing_cycle: billing
      })
      if (error) throw error
      const planName = selectedPlan.name
      closePayment()
      setPaymentNotice(`${planName} payment submitted. We’ll verify it within 30 minutes.`)
    }catch(e:any){
      setPaymentError(e.message || 'Payment could not be submitted. Please try again.')
    }
    finally { setSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-[#07052e] text-white relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        .card { height: 400px; width: 285px; background-image: linear-gradient(to top, #210c93, #0d117a, #011160, #010e47, #07052e); box-shadow: rgba(0,0,0,0.24) -20px 30px 10px; transform-style: preserve-3d; transform: perspective(400px) rotateX(60deg) rotateZ(-30deg); border-radius: 16px; transition: transform 2s, filter 0.6s ease, opacity 0.6s ease, box-shadow 0.6s ease; position: relative; overflow: hidden; filter: brightness(0.55) saturate(0.7); opacity: 0.7; }
        .card:hover { transform: perspective(800px) rotateY(19deg) rotateX(8deg) translateZ(30px) scale(1.02); filter: brightness(1) saturate(1); opacity: 1; }
        .card-basic { background: linear-gradient(to top, #1a1a2e, #16213e, #0f3460); border: 1px solid rgba(255,255,255,0.1); }
        .card-basic:hover { box-shadow: rgba(0,0,0,0.4) -20px 40px 20px, 0 0 30px rgba(15,52,96,0.3); }
        .card-advanced { background-image: linear-gradient(to top, #210c93, #0d117a, #011160, #010e47, #07052e); border: 1px solid rgba(105,70,255,0.3); }
        .card-advanced:hover { box-shadow: rgba(0,0,0,0.5) -20px 40px 30px, 0 0 50px rgba(105,70,255,0.5); }
        .card-premium { background: linear-gradient(to top, #2e1a07, #5c3a12, #8a5a1a, #d4a574); border: 1px solid rgba(212,165,116,0.3); }
        .card-premium:hover { box-shadow: rgba(0,0,0,0.5) -20px 40px 30px, 0 0 40px rgba(212,165,116,0.4); }
        @media (max-width: 900px) { .card { width: 100%; max-width: 320px; height: 440px; transform: perspective(600px) rotateX(10deg) rotateZ(-2deg); } .card:hover { transform: perspective(800px) rotateY(10deg) rotateX(5deg) translateZ(20px); } }
        .billing-toggle{display:flex;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:999px;padding:4px;gap:4px;backdrop-filter:blur(12px)}
        .billing-btn{height:30px;padding:0 14px;border-radius:999px;font-size:11px;font-weight:600;transition:all .3s;white-space:nowrap}
        .billing-btn-active{background:#fff;color:#07052e}
        .billing-btn-inactive{color:rgba(255,255,255,0.6)}
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-[#210c93]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-[#0d117a]/20 rounded-full blur-[100px]" />
      </div>

      <header className="relative z-10 max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2"><div className="w-8 h-8 bg-white text-black rounded-[8px] flex items-center justify-center font-bold">D</div><span className="font-semibold">DukaanWhats.pk</span></Link>
        <div className="flex items-center gap-3">
          <div className="billing-toggle">
            <button onClick={()=>setBilling('monthly')} className={`billing-btn ${billing==='monthly'?'billing-btn-active':'billing-btn-inactive'}`}>Monthly</button>
            <button onClick={()=>setBilling('yearly')} className={`billing-btn ${billing==='yearly'?'billing-btn-active':'billing-btn-inactive'}`}>Yearly <span className="ml-1 bg-[#E8FF86] text-black text-[9px] px-1.5 py-0.5 rounded-full">-22%</span></button>
          </div>
          <Link href="/dashboard" className="h-9 px-4 bg-white text-black rounded-full text-[12px] font-medium">Dashboard</Link>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 md:py-16">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[10px] tracking-[0.2em] uppercase font-medium mb-6"><span className="w-1.5 h-1.5 rounded-full bg-[#E8FF86] animate-pulse" /> PRICING • TILL ID {TILL_ID} • {billing==='monthly'?'MONTHLY':'YEARLY SAVE 22%'}</div>
          <h1 className="text-[32px] md:text-[52px] font-bold tracking-tight leading-[0.9] max-w-3xl mx-auto">Choose your <span className="text-white/40">growth</span> plan</h1>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-8">
          {plans.map(p => {
            const price = getPrice(p)
            const total = getTotal(p)
            return (
              <div key={p.id} className={`card ${p.cardClass} p-6 flex flex-col ${p.popular ? 'md:scale-[1.08] md:-translate-y-4' : ''} relative`}>
                {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#E8FF86] text-black text-[9px] tracking-[0.15em] uppercase font-bold flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-black animate-pulse" /> MOST POPULAR</div>}
                <div className="flex items-center justify-between mb-3 mt-2"><span className="text-[10px] tracking-[0.2em] uppercase text-white/50 font-medium">{p.name}</span><span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10 tracking-widest">{p.badge}</span></div>
                <div className="mb-3">
                  <div className="flex items-baseline gap-1"><span className="text-[12px] text-white/50">Rs.</span><span className="text-[36px] font-bold leading-none">{price}</span><span className="text-[11px] text-white/40">/{billing==='monthly'?'mo':'mo'}</span></div>
                  {p.id!=='basic' && billing==='yearly' && <div className="text-[10px] text-white/50 mt-1">Billed Rs. {p.yearlyTotal}/year • <span className="bg-[#E8FF86] text-black px-1.5 py-0.5 rounded-full text-[9px] font-bold">SAVE Rs. {(p.monthly - p.yearlyMonthly)*12}</span></div>}
                  {p.id!=='basic' && billing==='monthly' && <div className="text-[10px] text-white/40 mt-1">Yearly: Rs. {p.yearlyMonthly}/mo • Save 22%</div>}
                </div>
                <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
                <ul className="space-y-2 flex-1">{p.features.map((f,i)=><li key={i} className="flex items-center gap-2 text-[11px] text-white/70"><span className="text-[#E8FF86]">—</span> {f}</li>)}</ul>
                <button onClick={()=>setSelectedPlan(p)} className={`mt-5 h-10 rounded-full flex items-center justify-center text-[11px] tracking-[0.12em] uppercase font-medium transition-all ${p.popular ? 'bg-[#E8FF86] text-black font-bold hover:bg-[#dfff6b]' : p.id==='basic' ? 'border border-white/20 hover:bg-white hover:text-black' : 'bg-gradient-to-r from-[#d4a574] to-[#f5d6a8] text-black font-bold'}`}>{p.id==='basic'?p.btn:`Pay Rs. ${total} • ${p.btn}`}</button>
              </div>
            )
          })}
        </div>
      </div>

      {paymentNotice && <div role="status" className="fixed bottom-5 left-1/2 z-[80] -translate-x-1/2 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 shadow-2xl">{paymentNotice}</div>}

      {selectedPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={event => { if (event.target === event.currentTarget) closePayment() }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="pricing-payment-title"
            className="flex w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/50 bg-white text-[#11121a] shadow-[0_32px_100px_rgba(0,0,0,0.65)]"
            style={{ height: 'min(860px, calc(100dvh - 24px))' }}
          >
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-200 px-4 py-4 sm:px-7 sm:py-5">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#0A0A0A] text-sm font-bold text-[#E8FF86]">D</div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">Secure checkout</div>
                  <h2 id="pricing-payment-title" className="mt-0.5 truncate text-lg font-bold tracking-tight sm:text-xl">{selectedPlan.name} plan</h2>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-5">
                <div className="hidden text-right sm:block">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{billing} total</div>
                  <div className="text-base font-extrabold">Rs. {getTotal(selectedPlan).toLocaleString('en-PK')}</div>
                </div>
                <button type="button" onClick={closePayment} aria-label="Close payment dialog" title="Close payment dialog" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-zinc-200 bg-white text-xl text-zinc-500 transition hover:bg-zinc-100 hover:text-black">×</button>
              </div>
            </header>

            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto md:grid-cols-[1.04fr_0.96fr] md:grid-rows-[auto_1fr] md:overflow-hidden">
              <section className="px-4 pb-4 pt-5 sm:px-7 md:col-start-1 md:row-start-1 md:pb-3" aria-label="Choose a plan">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-xs font-bold text-zinc-800">Choose a plan</h3>
                  <span className="text-[10px] text-zinc-400">{billing === 'yearly' ? 'Yearly billing' : 'Monthly billing'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {plans.map(plan => {
                    const active = selectedPlan.id === plan.id
                    const descriptor = plan.id === 'basic' ? '5 products' : plan.id === 'advanced' ? '25 products' : 'Unlimited'
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() => { setSelectedPlan(plan); setTxnId(''); setPaymentError('') }}
                        className={`min-w-0 rounded-2xl border p-3 text-left transition sm:p-4 ${active ? 'border-black bg-[#E8FF86] shadow-[0_5px_18px_rgba(10,10,10,0.12)]' : 'border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50'}`}
                      >
                        <span className="block truncate text-xs font-bold sm:text-sm">{plan.name}</span>
                        <span className={`mt-1 block truncate text-[10px] ${active ? 'text-black/60' : 'text-zinc-500'}`}>{descriptor}</span>
                        <span className="mt-2 block truncate text-[11px] font-extrabold sm:text-xs">Rs. {getPrice(plan)}<span className="font-medium">/mo</span></span>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="px-4 pb-5 sm:px-7 md:col-start-1 md:row-start-2 md:overflow-y-auto md:pb-7" aria-label="Payment submission">
                {selectedPlan.monthly > 0 ? (
                  <form onSubmit={event => { event.preventDefault(); handlePay() }} className="rounded-2xl border border-zinc-200 bg-[#FAFAF9] p-4 sm:p-5">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Amount due</div>
                        <div className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Rs. {getTotal(selectedPlan).toLocaleString('en-PK')}</div>
                      </div>
                      <span className="mb-1 rounded-full bg-white px-3 py-1 text-[10px] font-semibold capitalize text-zinc-600 shadow-sm">{billing}</span>
                    </div>
                    <div className="my-4 h-px bg-zinc-200" />
                    <label htmlFor="pricing-transaction-id" className="text-xs font-bold text-zinc-800">JazzCash transaction ID</label>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">Enter the ID shown in your JazzCash payment history.</p>
                    <input
                      id="pricing-transaction-id"
                      value={txnId}
                      onChange={event => { setTxnId(event.target.value); if (paymentError) setPaymentError('') }}
                      placeholder="e.g. 123456789"
                      autoComplete="off"
                      required
                      className="mt-3 h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 font-mono text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-black focus:ring-4 focus:ring-[#E8FF86]/60"
                    />
                    {paymentError && <p role="alert" className="mt-2 text-xs font-medium text-red-600">{paymentError}</p>}
                    <button type="submit" disabled={submitting || !txnId.trim()} className="mt-3 h-12 w-full rounded-xl bg-black px-4 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-45">
                      {submitting ? 'Submitting…' : 'Submit for verification'}
                    </button>
                    <p className="mt-3 text-center text-[10px] text-zinc-400">Verification usually takes up to 30 minutes.</p>
                  </form>
                ) : (
                  <div className="rounded-2xl border border-zinc-200 bg-[#FAFAF9] p-5">
                    <div className="text-xs font-bold text-zinc-800">No payment required</div>
                    <p className="mt-1 text-[11px] text-zinc-500">Start with the Basic plan for free.</p>
                    <button type="button" onClick={() => { closePayment(); router.push('/dashboard') }} className="mt-4 h-12 w-full rounded-xl bg-black px-4 text-sm font-bold text-white transition hover:bg-zinc-800">Continue to dashboard</button>
                  </div>
                )}
              </section>

              <aside className="border-t border-[#e4def8] bg-[#f4f1fc] px-4 py-5 sm:px-7 md:col-start-2 md:row-span-2 md:row-start-1 md:border-l md:border-t-0 md:py-7" aria-label="JazzCash payment details">
                {selectedPlan.monthly > 0 ? (
                  <div className="mx-auto max-w-sm">
                    <div className="rounded-2xl bg-[#100d38] p-4 text-white sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">JazzCash Till ID</div>
                          <div className="mt-1 font-mono text-2xl font-bold tracking-[0.12em] text-[#E8FF86]">{TILL_ID}</div>
                        </div>
                        <button type="button" onClick={copyTill} title="Copy JazzCash Till ID" className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20">{copiedTill ? 'Copied!' : 'Copy ID'}</button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col items-center rounded-2xl border border-[#e7e2f0] bg-white p-3 text-center sm:p-4">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=JAZZCASH_TILL_${TILL_ID}_AMOUNT_${getTotal(selectedPlan)}_PLAN_${selectedPlan.id}_BILLING_${billing}`}
                        alt="JazzCash payment QR code"
                        className="h-32 w-32 sm:h-40 sm:w-40"
                      />
                      <span className="mt-2 text-[10px] font-semibold text-zinc-500">Scan with JazzCash</span>
                    </div>
                    <div className="mt-3 rounded-2xl border border-[#e7e2f0] bg-white p-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">Pay in the JazzCash app</div>
                      <p className="mt-2 text-xs font-semibold leading-relaxed text-zinc-800">Business <span className="px-1 text-violet-500">→</span> Till ID <span className="px-1 text-violet-500">→</span> {TILL_ID}</p>
                      <p className="mt-1 text-[11px] text-zinc-500">Pay Rs. {getTotal(selectedPlan).toLocaleString('en-PK')} for {selectedPlan.name} ({billing}).</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full min-h-32 flex-col justify-center rounded-2xl border border-[#e7e2f0] bg-white p-5 text-center">
                    <div className="text-lg font-bold text-zinc-900">Basic is free</div>
                    <p className="mt-1 text-xs text-zinc-500">No payment details needed.</p>
                  </div>
                )}
              </aside>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
