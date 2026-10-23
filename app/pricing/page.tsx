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
  const router = useRouter()

  const plans = [
    { 
      id: 'basic', 
      name: 'Basic', 
      monthly: 0,
      yearlyMonthly: 0,
      yearlyTotal: 0,
      badge: 'FREE', 
      tagline: 'For first sale — 5 products', 
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
      tagline: '25 products • 5 images', 
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
      tagline: 'Unlimited • No watermark', 
      features: ['Unlimited Products', 'Unlimited Images', 'Every Theme Unlocked', 'No DukaanWhats Watermark', 'Live Analytics + Priority'], 
      cardClass: 'card-premium', 
      btn: 'Go Premium', 
      popular: false 
    },
  ]

  const getPrice = (p: any) => billing==='monthly' ? p.monthly : p.yearlyMonthly
  const getTotal = (p: any) => billing==='monthly' ? p.monthly : p.yearlyTotal

  const copyTill = async () => { await navigator.clipboard.writeText(TILL_ID); setCopiedTill(true); setTimeout(()=>setCopiedTill(false),2000) }

  const handlePay = async () => {
    if (!selectedPlan) return
    if (selectedPlan.monthly===0) { router.push('/dashboard'); return }
    if (!txnId.trim()) { alert('Enter Transaction ID from JazzCash App after paying to Till ID '+TILL_ID); return }
    setSubmitting(true)
    try{
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      await supabase.from('plan_payments').insert({ 
        user_id: user.id, 
        plan_id: selectedPlan.id, 
        amount: getTotal(selectedPlan), 
        till_id: TILL_ID, 
        txn_id: txnId.trim(), 
        status: 'pending',
        billing_cycle: billing
      })
      alert(`Payment submitted!\nTill ID: ${TILL_ID}\nPlan: ${selectedPlan.name} (${billing})\nAmount: Rs. ${getTotal(selectedPlan)}\nTxn: ${txnId}\nWe will verify in 30 mins.`)
      setSelectedPlan(null); setTxnId('')
    }catch(e:any){alert(e.message)}
    setSubmitting(false)
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
        .popup-bg { background-image: linear-gradient(to top, #210c93, #0d117a, #011160, #010e47, #07052e); }
        .barcode-glow { box-shadow: 0 0 30px rgba(232,255,134,0.2), inset 0 1px 0 rgba(255,255,255,0.1); }
        .billing-toggle{display:flex;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:999px;padding:4px;gap:4px;backdrop-filter:blur(12px)}
        .billing-btn{height:30px;padding:0 14px;border-radius:999px;font-size:11px;font-weight:600;transition:all .3s;white-space:nowrap}
        .billing-btn-active{background:#fff;color:#07052e}
        .billing-btn-inactive{color:rgba(255,255,255,0.6)}
        .radio-container{--main-color:#E8FF86;--total-radio:3;display:flex;flex-direction:column;position:relative;padding-left:1rem}
        .radio-container input{appearance:none;position:absolute;opacity:0}
        .radio-container .glider-container{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(0deg,transparent 0%,rgba(255,255,255,0.15) 50%,transparent 100%);width:1px}
        .radio-container .glider{position:relative;height:calc(100% / var(--total-radio));width:100%;background:linear-gradient(0deg,transparent 0%,var(--main-color) 50%,transparent 100%);transition:transform .5s cubic-bezier(0.37,1.95,0.66,0.56)}
        .radio-container .glider::before{content:"";position:absolute;height:60%;width:300%;top:50%;transform:translateY(-50%);background:var(--main-color);filter:blur(10px)}
        .radio-container label{cursor:pointer;padding:12px 10px;border-radius:12px;color:rgba(255,255,255,0.5);transition:all .3s}
        .radio-container input:checked+label{color:#fff;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12)}
        .radio-container input:nth-of-type(1):checked~.glider-container .glider{transform:translateY(0)}
        .radio-container input:nth-of-type(2):checked~.glider-container .glider{transform:translateY(100%)}
        .radio-container input:nth-of-type(3):checked~.glider-container .glider{transform:translateY(200%)}
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
          <p className="text-[13px] text-white/50 mt-4 max-w-2xl mx-auto leading-relaxed">Basic: 5 products • 1 image • 3 advanced themes • No premium • Advanced: Rs. 899/mo or Rs. 699/mo yearly (25 products, 5 images, all 8 advanced) • Premium: Rs. 2999/mo or Rs. 2499/mo yearly (unlimited, no watermark, live analytics)</p>
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
                  <div className="text-[11px] text-white/60 mt-1.5 leading-[1.3]">{p.tagline}</div>
                </div>
                <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
                <ul className="space-y-2 flex-1">{p.features.map((f,i)=><li key={i} className="flex items-center gap-2 text-[11px] text-white/70"><span className="text-[#E8FF86]">—</span> {f}</li>)}</ul>
                <button onClick={()=>setSelectedPlan(p)} className={`mt-5 h-10 rounded-full flex items-center justify-center text-[11px] tracking-[0.12em] uppercase font-medium transition-all ${p.popular ? 'bg-[#E8FF86] text-black font-bold hover:bg-[#dfff6b]' : p.id==='basic' ? 'border border-white/20 hover:bg-white hover:text-black' : 'bg-gradient-to-r from-[#d4a574] to-[#f5d6a8] text-black font-bold'}`}>{p.id==='basic'?p.btn:`Pay Rs. ${total} • ${p.btn}`}</button>
                <div className="mt-2 text-[9px] text-white/30 text-center">{p.id==='basic'?'5 products • 1 image • 3 advanced':p.id==='advanced'?'25 products • 5 images • All 8 advanced':'Unlimited • No watermark • Live analytics'}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* POPUP - SAME DESIGN AS BACKGROUND + Uiverse Glider */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[12px]">
          <div className="w-full max-w-[440px] max-h-[90vh] overflow-auto rounded-[24px] border border-white/10 popup-bg shadow-[0_30px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="sticky top-0 z-10 p-6 border-b border-white/10 flex items-center justify-between backdrop-blur-xl bg-[#07052e]/80">
              <div><div className="text-[11px] tracking-[0.2em] uppercase text-white/40">PAY VIA TILL ID {TILL_ID} • {billing.toUpperCase()}</div><div className="font-bold text-[18px] mt-1">Pay Rs. {getTotal(selectedPlan)} — {selectedPlan.name}</div><div className="text-[11px] text-white/50 mt-1">{selectedPlan.id==='basic'?'5 products • 1 image • 3 advanced':selectedPlan.id==='advanced'?'25 products • 5 images • All 8 advanced':'Unlimited • No watermark • Live analytics'} • Till {TILL_ID}</div></div>
              <button onClick={()=>setSelectedPlan(null)} className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/15">✕</button>
            </div>

            <div className="p-6">
              {/* Plan selector with glider */}
              <div className="mb-6 rounded-[16px] bg-white/[0.04] border border-white/10 p-4">
                <div className="text-[11px] tracking-widest uppercase text-white/40 font-bold mb-2">Choose Plan — Yellow Glider</div>
                <div className="radio-container" style={{"--total-radio": plans.length} as any}>
                  {plans.map(p=>(
                    <div key={p.id} className="contents">
                      <input type="radio" id={`glider-${p.id}`} name="pricing-glider" checked={selectedPlan.id===p.id} onChange={()=>setSelectedPlan(p)} />
                      <label htmlFor={`glider-${p.id}`} onClick={()=>setSelectedPlan(p)}>
                        <div className="flex justify-between items-center"><div><div className="font-bold text-[13px]">{p.name} <span className="text-[10px] opacity-50">• {p.id==='basic'?'5 products':p.id==='advanced'?'25 products':'Unlimited'}</span></div><div className="text-[11px] opacity-60">{p.id==='basic'?'1 image • 3 advanced':p.id==='advanced'?'5 images • All 8 advanced':'Unlimited • No watermark'}</div></div><div className="font-black text-[13px]">Rs. {billing==='monthly'?p.monthly:p.yearlyMonthly}</div></div>
                      </label>
                    </div>
                  ))}
                  <div className="glider-container"><div className="glider"></div></div>
                </div>
              </div>

              <div className="rounded-[16px] bg-black/30 border border-white/10 p-5 text-center backdrop-blur">
                <div className="text-[10px] tracking-[0.2em] uppercase text-white/40 flex items-center justify-center gap-2">JAZZCASH TILL ID <button onClick={copyTill} className="px-2 py-0.5 bg-white/10 rounded-full text-[9px] border border-white/10">{copiedTill?'Copied!':'Copy'}</button></div>
                <div className="text-[34px] font-black tracking-[0.18em] mt-2 font-mono">{TILL_ID}</div>
                <div className="mt-4 bg-white rounded-[12px] p-3 barcode-glow"><img src={`https://barcodeapi.org/api/code128/${TILL_ID}`} alt="Till Barcode" className="w-full h-[64px] object-contain" /><div className="text-center text-[10px] tracking-[0.3em] mt-2 font-mono text-black font-bold">{TILL_ID}</div></div>
                <div className="mt-4 bg-white rounded-[16px] p-3 inline-block"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=JAZZCASH_TILL_${TILL_ID}_AMOUNT_${getTotal(selectedPlan)}_PLAN_${selectedPlan.id}_BILLING_${billing}`} alt="Till QR" className="w-[170px] h-[170px]" /></div>
                <div className="text-[11px] text-white/50 mt-4 leading-relaxed">Open <b className="text-white">JazzCash App</b> → <b className="text-white">Business</b> → <b className="text-white">Till ID</b> → Enter <span className="bg-[#E8FF86] text-black px-2 py-0.5 rounded font-bold">{TILL_ID}</span><br/>or scan QR above</div>
              </div>

              <div className="mt-5 rounded-[12px] bg-white/[0.04] border border-white/10 p-4">
                <div className="text-[11px] tracking-[0.15em] uppercase text-white/40 font-medium">HOW TO PAY • {billing}</div>
                <div className="mt-3 space-y-2 text-[12px] text-white/70">
                  <div className="flex gap-2"><span className="text-[#E8FF86]">1.</span> Open JazzCash App → Business / Till ID</div>
                  <div className="flex gap-2"><span className="text-[#E8FF86]">2.</span> Enter Till ID: <b className="text-white">{TILL_ID}</b></div>
                  <div className="flex gap-2"><span className="text-[#E8FF86]">3.</span> Amount: <b className="text-white">Rs. {getTotal(selectedPlan)}</b> for {selectedPlan.name} ({billing})</div>
                  <div className="flex gap-2"><span className="text-[#E8FF86]">4.</span> Pay → Copy Transaction ID from History</div>
                </div>
              </div>

              {selectedPlan.monthly>0 ? (
                <>
                  <div className="mt-5"><label className="text-[11px] tracking-[0.15em] uppercase text-white/60 font-medium">Transaction ID * — Rs. {getTotal(selectedPlan)} to Till {TILL_ID}</label><input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder={`Paste Txn ID after paying Rs. ${getTotal(selectedPlan)} to Till ${TILL_ID}`} className="mt-2 w-full h-11 px-4 rounded-[12px] bg-white/[0.06] border border-white/10 text-[13px] placeholder:text-white/30 focus:outline-none focus:border-[#E8FF86]/50 focus:bg-white/[0.08] font-mono" /></div>
                  <button onClick={handlePay} disabled={submitting} className="mt-4 w-full h-12 rounded-full bg-[#E8FF86] text-black font-bold text-[13px] tracking-[0.05em] hover:bg-[#dfff6b] disabled:opacity-50 transition"> {submitting ? 'Submitting...' : `I Paid Rs. ${getTotal(selectedPlan)} to Till ${TILL_ID} — Activate ${selectedPlan.name} (${billing})`} </button>
                </>
              ) : (
                <button onClick={()=>{ setSelectedPlan(null); window.location.href='/dashboard' }} className="mt-5 w-full h-12 rounded-full bg-white text-black font-bold text-[13px]">Continue Free — 5 products • 1 image • 3 advanced</button>
              )}

              <div className="mt-4 text-center text-[10px] text-white/30">Till {TILL_ID} • {selectedPlan.id==='advanced'?'25 products • 5 images • All 8 advanced':selectedPlan.id==='premium'?'Unlimited • No watermark • Live analytics':'5 products • 1 image • 3 advanced'} • Verification in 30 mins • Secure by JazzCash</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
