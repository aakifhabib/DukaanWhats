'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const TILL_ID = '984837533'

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [txnId, setTxnId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const plans = [
    { id: 'basic', name: 'Basic', price: 0, badge: 'FREE', tagline: 'For first sale', features: ['1 store', '20 products', 'WhatsApp orders', '1 theme'], cardClass: 'card-basic', btn: 'Start Free →', popular: false },
    { id: 'advanced', name: 'Advanced', price: 499, badge: 'MOST POPULAR', tagline: 'Where stores scale', features: ['3 stores', '100 products', 'All 8 themes', 'Analytics + domain'], cardClass: 'card-advanced', btn: 'Go Advanced', popular: true },
    { id: 'premium', name: 'Premium', price: 999, badge: 'UNLIMITED', tagline: 'Without limits', features: ['Unlimited stores', 'All 11 themes (sleek)', 'Glass animations', 'Priority + no brand'], cardClass: 'card-premium', btn: 'Go Premium', popular: false },
  ]

  const handlePay = async () => {
    if (!selectedPlan) return
    if (selectedPlan.price===0) { router.push('/dashboard'); return }
    if (!txnId.trim()) { alert('Enter Transaction ID from JazzCash App after paying to Till ID '+TILL_ID); return }
    setSubmitting(true)
    try{
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      await supabase.from('plan_payments').insert({ user_id: user.id, plan_id: selectedPlan.id, amount: selectedPlan.price, till_id: TILL_ID, txn_id: txnId.trim(), status: 'pending' })
      alert(`Payment submitted!\nTill ID: ${TILL_ID}\nPlan: ${selectedPlan.name}\nTxn: ${txnId}\nWe will verify in 30 mins.`)
      setSelectedPlan(null); setTxnId('')
    }catch(e:any){alert(e.message)}
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#07052e] text-white relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        .card { height: 380px; width: 280px; background-image: linear-gradient(to top, #210c93, #0d117a, #011160, #010e47, #07052e); box-shadow: rgba(0,0,0,0.24) -20px 30px 10px; transform-style: preserve-3d; transform: perspective(400px) rotateX(60deg) rotateZ(-30deg); border-radius: 16px; transition: transform 2s, filter 0.6s ease, opacity 0.6s ease, box-shadow 0.6s ease; position: relative; overflow: hidden; filter: brightness(0.55) saturate(0.7); opacity: 0.7; }
        .card:hover { transform: perspective(800px) rotateY(19deg) rotateX(8deg) translateZ(30px) scale(1.02); filter: brightness(1) saturate(1); opacity: 1; }
        .card-basic { background: linear-gradient(to top, #1a1a2e, #16213e, #0f3460); border: 1px solid rgba(255,255,255,0.1); }
        .card-basic:hover { box-shadow: rgba(0,0,0,0.4) -20px 40px 20px, 0 0 30px rgba(15,52,96,0.3); }
        .card-advanced { background-image: linear-gradient(to top, #210c93, #0d117a, #011160, #010e47, #07052e); border: 1px solid rgba(105,70,255,0.3); }
        .card-advanced:hover { box-shadow: rgba(0,0,0,0.5) -20px 40px 30px, 0 0 50px rgba(105,70,255,0.5); }
        .card-premium { background: linear-gradient(to top, #2e1a07, #5c3a12, #8a5a1a, #d4a574); border: 1px solid rgba(212,165,116,0.3); }
        .card-premium:hover { box-shadow: rgba(0,0,0,0.5) -20px 40px 30px, 0 0 40px rgba(212,165,116,0.4); }
        @media (max-width: 900px) { .card { width: 100%; max-width: 320px; height: 420px; transform: perspective(600px) rotateX(10deg) rotateZ(-2deg); } .card:hover { transform: perspective(800px) rotateY(10deg) rotateX(5deg) translateZ(20px); } }
        .popup-bg { background-image: linear-gradient(to top, #210c93, #0d117a, #011160, #010e47, #07052e); }
        .barcode-glow { box-shadow: 0 0 30px rgba(232,255,134,0.2), inset 0 1px 0 rgba(255,255,255,0.1); }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-[#210c93]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-[#0d117a]/20 rounded-full blur-[100px]" />
      </div>

      <header className="relative z-10 max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2"><div className="w-8 h-8 bg-white text-black rounded-[8px] flex items-center justify-center font-bold">D</div><span className="font-semibold">DukaanWhats.pk</span></Link>
        <Link href="/dashboard" className="h-9 px-4 bg-white text-black rounded-full text-[12px] font-medium">Dashboard</Link>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[10px] tracking-[0.2em] uppercase font-medium mb-6"><span className="w-1.5 h-1.5 rounded-full bg-[#E8FF86] animate-pulse" /> PRICING • TILL ID {TILL_ID}</div>
          <h1 className="text-[36px] md:text-[56px] font-bold tracking-tight leading-[0.9] max-w-3xl mx-auto">Choose your <span className="text-white/40">growth</span> plan</h1>
          <p className="text-[14px] text-white/50 mt-4 max-w-xl mx-auto">Pay via JazzCash Till ID {TILL_ID} — barcode & QR below. No card details on our site.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-8">
          {plans.map(p => (
            <div key={p.id} className={`card ${p.cardClass} p-6 flex flex-col ${p.popular ? 'md:scale-[1.08] md:-translate-y-4' : ''} relative`}>
              {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#E8FF86] text-black text-[9px] tracking-[0.15em] uppercase font-bold flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-black animate-pulse" /> MOST POPULAR</div>}
              <div className="flex items-center justify-between mb-4 mt-2"><span className="text-[10px] tracking-[0.2em] uppercase text-white/50 font-medium">{p.name}</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10">{p.badge}</span></div>
              <div className="mb-4"><div className="flex items-baseline gap-1"><span className="text-[12px] text-white/50">Rs.</span><span className="text-[40px] font-bold leading-none">{p.price}</span><span className="text-[12px] text-white/40">/mo</span></div><div className="text-[12px] text-white/60 mt-1">{p.tagline}</div></div>
              <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
              <ul className="space-y-2.5 flex-1">{p.features.map((f,i)=><li key={i} className="flex items-center gap-2 text-[12px] text-white/70"><span className="text-[#E8FF86]">—</span> {f}</li>)}</ul>
              <button onClick={()=>setSelectedPlan(p)} className={`mt-6 h-10 rounded-full flex items-center justify-center text-[11px] tracking-[0.15em] uppercase font-medium transition-all ${p.popular ? 'bg-[#E8FF86] text-black font-bold hover:bg-[#dfff6b]' : p.id==='basic' ? 'border border-white/20 hover:bg-white hover:text-black' : 'bg-gradient-to-r from-[#d4a574] to-[#f5d6a8] text-black font-bold'}`}>{p.btn}</button>
            </div>
          ))}
        </div>
      </div>

      {/* POPUP - SAME DESIGN AS BACKGROUND */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[12px]">
          <div className="w-full max-w-[440px] max-h-[90vh] overflow-auto rounded-[24px] border border-white/10 popup-bg shadow-[0_30px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="sticky top-0 z-10 p-6 border-b border-white/10 flex items-center justify-between backdrop-blur-xl bg-[#07052e]/80">
              <div><div className="text-[11px] tracking-[0.2em] uppercase text-white/40">PAY VIA TILL ID</div><div className="font-bold text-[18px] mt-1">Pay Rs. {selectedPlan.price} — {selectedPlan.name}</div><div className="text-[11px] text-white/50 mt-1">Till ID {TILL_ID} • No card details stored</div></div>
              <button onClick={()=>setSelectedPlan(null)} className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/15">✕</button>
            </div>

            <div className="p-6">
              <div className="rounded-[16px] bg-black/30 border border-white/10 p-5 text-center backdrop-blur">
                <div className="text-[10px] tracking-[0.2em] uppercase text-white/40">JAZZCASH TILL ID</div>
                <div className="text-[34px] font-black tracking-[0.18em] mt-2">{TILL_ID}</div>
                <div className="mt-4 bg-white rounded-[12px] p-3 barcode-glow"><img src={`https://barcodeapi.org/api/code128/${TILL_ID}`} alt="Till Barcode" className="w-full h-[64px] object-contain" /><div className="text-center text-[10px] tracking-[0.3em] mt-2 font-mono text-black font-bold">{TILL_ID}</div></div>
                <div className="mt-4 bg-white rounded-[16px] p-3 inline-block"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=JAZZCASH_TILL_${TILL_ID}_AMOUNT_${selectedPlan.price}_PLAN_${selectedPlan.id}`} alt="Till QR" className="w-[170px] h-[170px]" /></div>
                <div className="text-[11px] text-white/50 mt-4 leading-relaxed">Open <b className="text-white">JazzCash App</b> → <b className="text-white">Business</b> → <b className="text-white">Till ID</b> → Enter <span className="bg-[#E8FF86] text-black px-2 py-0.5 rounded font-bold">{TILL_ID}</span><br/>or scan QR above</div>
              </div>

              <div className="mt-5 rounded-[12px] bg-white/[0.04] border border-white/10 p-4">
                <div className="text-[11px] tracking-[0.15em] uppercase text-white/40 font-medium">HOW TO PAY</div>
                <div className="mt-3 space-y-2 text-[12px] text-white/70">
                  <div className="flex gap-2"><span className="text-[#E8FF86]">1.</span> Open JazzCash App → Business / Till ID</div>
                  <div className="flex gap-2"><span className="text-[#E8FF86]">2.</span> Enter Till ID: <b className="text-white">{TILL_ID}</b></div>
                  <div className="flex gap-2"><span className="text-[#E8FF86]">3.</span> Amount: <b className="text-white">Rs. {selectedPlan.price}</b> for {selectedPlan.name}</div>
                  <div className="flex gap-2"><span className="text-[#E8FF86]">4.</span> Pay → Copy Transaction ID from History</div>
                </div>
              </div>

              {selectedPlan.price>0 && (
                <>
                  <div className="mt-5"><label className="text-[11px] tracking-[0.15em] uppercase text-white/60 font-medium">Transaction ID *</label><input value={txnId} onChange={e=>setTxnId(e.target.value)} placeholder={`Paste Txn ID after paying Rs. ${selectedPlan.price} to Till ${TILL_ID}`} className="mt-2 w-full h-11 px-4 rounded-[12px] bg-white/[0.06] border border-white/10 text-[13px] placeholder:text-white/30 focus:outline-none focus:border-[#E8FF86]/50 focus:bg-white/[0.08]" /></div>
                  <button onClick={handlePay} disabled={submitting} className="mt-4 w-full h-12 rounded-full bg-[#E8FF86] text-black font-bold text-[13px] tracking-[0.05em] hover:bg-[#dfff6b] disabled:opacity-50 transition"> {submitting ? 'Submitting...' : `I Paid Rs. ${selectedPlan.price} to Till ${TILL_ID} — Activate Now`} </button>
                </>
              )}
              {selectedPlan.price===0 && <button onClick={()=>{ setSelectedPlan(null); window.location.href='/dashboard' }} className="mt-5 w-full h-12 rounded-full bg-white text-black font-bold text-[13px]">Continue Free — Go to Dashboard</button>}

              <div className="mt-4 text-center text-[10px] text-white/30">Till {TILL_ID} • Funds to DukaanWhats Business • Verification in 30 mins • Secure by JazzCash</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
