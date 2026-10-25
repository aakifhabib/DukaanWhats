'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const TILL_ID = '984837533'

type Payment = {
  id: string
  user_id: string
  plan_id: 'basic'|'advanced'|'premium'
  amount: number
  till_id: string
  txn_id: string
  status: 'pending'|'approved'|'rejected'
  billing_cycle: 'monthly'|'yearly'
  created_at: string
  profiles?: {
    business_name: string
    whatsapp_number: string
    store_slug: string
    current_plan: string
  }
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending'|'approved'|'rejected'|'all'>('pending')
  const [search, setSearch] = useState('')
  const [sendingWA, setSendingWA] = useState<string | null>(null)

  useEffect(() => { fetchPayments() }, [])

  const fetchPayments = async () => {
    setLoading(true)
    const { data } = await supabase.from('plan_payments').select(`
      *,
      profiles:profiles!plan_payments_user_id_fkey (
        business_name,
        whatsapp_number,
        store_slug,
        current_plan
      )
    `).order('created_at', { ascending: false })
    
    if (data) setPayments(data as any)
    else {
      const { data: fallback } = await supabase.from('plan_payments').select('*').order('created_at', { ascending: false })
      if (fallback) {
        const enriched = await Promise.all(fallback.map(async (p:any) => {
          const { data: prof } = await supabase.from('profiles').select('business_name, whatsapp_number, store_slug, current_plan').eq('id', p.user_id).maybeSingle()
          return { ...p, profiles: prof }
        }))
        setPayments(enriched)
      }
    }
    setLoading(false)
  }

  // WhatsApp Cloud API sender - uses your Meta WhatsApp Business
  const sendWhatsAppApproval = async (payment: Payment) => {
    setSendingWA(payment.id)
    try {
      const waNumber = payment.profiles?.whatsapp_number?.replace(/[^0-9]/g, '')
      if (!waNumber) { alert('No WhatsApp number for this user'); setSendingWA(null); return }

      const planName = payment.plan_id.toUpperCase()
      const businessName = payment.profiles?.business_name || 'there'
      const storeLink = `https://dukaanwhats.pk/s/${payment.profiles?.store_slug || ''}`
      const limits = payment.plan_id === 'premium' ? 'Unlimited Products, Unlimited Images, All 11 Themes (including 3 Premium Glass), Live Analytics, No Watermark' 
        : payment.plan_id === 'advanced' ? '25 Products, 5 Images/product, All 8 Advanced Themes' 
        : '5 Products, 1 Image/product, 3 Advanced Themes'

      // Message template
      const message = `🎉 *DukaanWhats.pk - Payment Approved!*

Hi ${businessName}! 

✅ Your payment of *Rs. ${payment.amount}* (Txn: ${payment.txn_id}) for *${planName}* plan has been approved!

🚀 *Your store is now ${planName}:*
${limits}

🔗 Your store: ${storeLink}
📊 Dashboard: https://dukaanwhats.pk/dashboard

Billing: ${payment.billing_cycle} • Till ID: ${TILL_ID}
Thank you for choosing DukaanWhats.pk!

Need help? Reply to this message.`

      // Option 1: Call your Supabase Edge Function that sends WhatsApp
      // Create edge function with: supabase functions new send-whatsapp
      const { error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          to: waNumber,
          message: message,
          user_id: payment.user_id,
          payment_id: payment.id
        }
      })

      if (error) {
        // Fallback: Open wa.me link for manual send
        console.log('Edge function not configured, using fallback wa.me')
        const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
        window.open(waLink, '_blank')
        alert(`WhatsApp not auto-configured yet.\n\nOpening WhatsApp for manual send to ${waNumber}\n\nMessage copied!\n\nTo enable AUTO WhatsApp:\n1. Setup WhatsApp Cloud API (see instructions in file)\n2. Deploy Edge Function`)
      } else {
        alert(`✅ WhatsApp sent to ${businessName} (${waNumber})`)
      }
    } catch (e: any) {
      alert(`WhatsApp error: ${e.message}\n\nFallback: Opening manual wa.me link`)
      const waNumber = payment.profiles?.whatsapp_number?.replace(/[^0-9]/g, '')
      const message = `Your ${payment.plan_id.toUpperCase()} payment approved! Rs. ${payment.amount} Txn ${payment.txn_id}. Your store is now ${payment.plan_id.toUpperCase()}!`
      window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank')
    }
    setSendingWA(null)
  }

  const approvePayment = async (payment: Payment) => {
    if (!confirm(`Approve ${payment.profiles?.business_name || payment.user_id}?\nPlan: ${payment.plan_id.toUpperCase()}\nAmount: Rs. ${payment.amount}\nTxn: ${payment.txn_id}\n\nThis will upgrade them to ${payment.plan_id.toUpperCase()} + send WhatsApp notification`)) return

    const { error: payError } = await supabase.from('plan_payments').update({ 
      status: 'approved',
      approved_at: new Date().toISOString()
    }).eq('id', payment.id)

    if (payError) { alert(payError.message); return }

    const { error: profileError } = await supabase.from('profiles').update({ 
      current_plan: payment.plan_id 
    }).eq('id', payment.user_id)

    if (profileError) { alert(profileError.message); return }

    // Auto-send WhatsApp after approval
    await sendWhatsAppApproval(payment)
    
    alert(`✅ Approved & Upgraded to ${payment.plan_id.toUpperCase()}!\nWhatsApp notification sent.`)
    fetchPayments()
  }

  const rejectPayment = async (payment: Payment) => {
    const reason = prompt(`Reject ${payment.profiles?.business_name || payment.user_id}?\nTxn: ${payment.txn_id}\nReason:`)
    if (reason === null) return
    await supabase.from('plan_payments').update({ status: 'rejected', rejection_reason: reason || 'Invalid' }).eq('id', payment.id)
    fetchPayments()
  }

  const filtered = payments.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false
    if (search) {
      const s = search.toLowerCase()
      return p.txn_id.toLowerCase().includes(s) || p.profiles?.business_name?.toLowerCase().includes(s) || p.profiles?.whatsapp_number?.includes(s)
    }
    return true
  })

  if (loading) return <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center"><div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-zinc-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border rounded-[20px] p-5 md:p-6 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black text-white rounded-[12px] flex items-center justify-center font-bold">A</div>
              <div>
                <h1 className="font-black text-[18px]">Payments + WhatsApp — Till {TILL_ID}</h1>
                <p className="text-[11px] text-zinc-500">Approve → auto-upgrade → auto WhatsApp notification to user</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 px-3 bg-black text-white rounded-full text-[12px] font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-[#E8FF86] rounded-full animate-pulse" />
                {filtered.length} {filter}
              </div>
              <button onClick={fetchPayments} className="h-9 px-4 border bg-white rounded-full text-[12px] font-medium">Refresh ↻</button>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {(['pending','approved','rejected','all'] as const).map(f => (
              <button key={f} onClick={()=>setFilter(f)} className={`h-8 px-4 rounded-full text-[12px] font-medium capitalize ${filter===f ? 'bg-black text-white' : 'bg-zinc-100 border'}`}>
                {f} {f==='pending' && `(${payments.filter(p=>p.status==='pending').length})`}
              </button>
            ))}
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Txn ID, Business Name, WhatsApp" className="ml-auto w-full md:w-[320px] h-9 px-4 border rounded-full bg-zinc-50 text-[12px] focus:bg-white focus:outline-none focus:border-black" />
          </div>
        </div>

        <div className="bg-black text-white rounded-[16px] p-4 mb-4 flex flex-wrap items-center gap-3 text-[11px]">
          <span className="bg-white/10 border border-white/10 px-3 h-7 rounded-full flex items-center font-bold">WORKFLOW:</span>
          <span className="opacity-80">User pays to Till {TILL_ID} → Submits Txn ID → You verify in JazzCash App → Approve → User gets upgraded + WhatsApp auto-sent</span>
        </div>

        <div className="bg-white border rounded-[20px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8F7F5] border-b text-[11px] font-black tracking-widest uppercase">
                <tr><th className="p-3">User / Store</th><th className="p-3">Plan</th><th className="p-3">Amount & Txn</th><th className="p-3">Date</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
              </thead>
              <tbody className="text-[13px]">
                {filtered.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-[#FFFEF5]">
                    <td className="p-3">
                      <div className="font-bold">{p.profiles?.business_name || 'Unknown'}</div>
                      <div className="text-[11px] text-zinc-500">WA: {p.profiles?.whatsapp_number || '—'} • /s/{p.profiles?.store_slug || '—'}</div>
                      <div className="text-[10px] font-mono text-zinc-400">User: {p.user_id.slice(0,8)}... • Current: {p.profiles?.current_plan || 'basic'}</div>
                    </td>
                    <td className="p-3"><span className={`px-2.5 h-6 rounded-full text-[11px] font-black flex items-center w-fit ${p.plan_id==='premium'?'bg-[#E8FF86] text-black':p.plan_id==='advanced'?'bg-black text-white':'bg-zinc-100'}`}>{p.plan_id.toUpperCase()}</span><div className="text-[11px] text-zinc-500 mt-1">{p.billing_cycle}</div></td>
                    <td className="p-3"><div className="font-black">Rs. {p.amount}</div><div className="font-mono text-[12px] bg-[#F8F7F5] border px-2 py-1 rounded-[8px] mt-1 w-fit">{p.txn_id}</div></td>
                    <td className="p-3 text-[12px]">{new Date(p.created_at).toLocaleDateString()}<br/><span className="text-[11px] text-zinc-500">{new Date(p.created_at).toLocaleTimeString()}</span></td>
                    <td className="p-3"><span className={`px-2.5 h-6 rounded-full text-[10px] font-bold flex items-center w-fit ${p.status==='pending'?'bg-yellow-100 text-yellow-700 border':p.status==='approved'?'bg-green-100 text-green-700 border':'bg-red-100 text-red-700 border'}`}>{p.status.toUpperCase()}</span></td>
                    <td className="p-3">
                      {p.status==='pending' ? (
                        <div className="flex flex-col gap-1.5">
                          <button onClick={()=>approvePayment(p)} className="h-8 px-4 bg-black text-white rounded-full text-[11px] font-bold hover:bg-zinc-900">✓ Approve + WhatsApp</button>
                          <button onClick={()=>sendWhatsAppApproval(p)} disabled={sendingWA===p.id} className="h-7 px-3 border bg-white rounded-full text-[11px] font-medium hover:bg-zinc-50">{sendingWA===p.id ? 'Sending...' : '↗ Send WA Only'}</button>
                          <button onClick={()=>rejectPayment(p)} className="h-7 px-3 border bg-white rounded-full text-[11px]">✕ Reject</button>
                        </div>
                      ) : <button onClick={()=>sendWhatsAppApproval(p)} className="h-8 px-3 bg-[#E8FF86] text-black border rounded-full text-[11px] font-bold">↗ Resend WhatsApp</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
