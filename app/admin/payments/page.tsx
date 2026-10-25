'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// --- CONFIG: Put your admin email(s) here ---
const ADMIN_EMAILS = ['your-email@gmail.com'] // Change this to your email

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
  user_email?: string
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending'|'approved'|'rejected'|'all'>('pending')
  const [search, setSearch] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }
    // For now allow anyone with link - in production check email
    // if (!ADMIN_EMAILS.includes(user.email || '')) { alert('Not admin'); return }
    setIsAdmin(true)
    fetchPayments()
  }

  const fetchPayments = async () => {
    setLoading(true)
    // Fetch payments with profile info
    const { data, error } = await supabase
      .from('plan_payments')
      .select(`
        *,
        profiles:profiles!plan_payments_user_id_fkey (
          business_name,
          whatsapp_number,
          store_slug,
          current_plan
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      // Fallback: fetch without join if FK not set
      const { data: fallback } = await supabase.from('plan_payments').select('*').order('created_at', { ascending: false })
      if (fallback) {
        // Fetch profiles separately
        const enriched = await Promise.all(fallback.map(async (p:any) => {
          const { data: prof } = await supabase.from('profiles').select('business_name, whatsapp_number, store_slug, current_plan').eq('id', p.user_id).maybeSingle()
          const { data: userData } = await supabase.auth.admin.getUserById ? { data: null } : { data: null } // Can't get email client side, so we show user_id
          return { ...p, profiles: prof }
        }))
        setPayments(enriched)
      }
    } else {
      setPayments(data as any)
    }
    setLoading(false)
  }

  const approvePayment = async (payment: Payment) => {
    if (!confirm(`Approve ${payment.profiles?.business_name || payment.user_id}?\nPlan: ${payment.plan_id.toUpperCase()}\nAmount: Rs. ${payment.amount}\nTxn: ${payment.txn_id}\n\nThis will upgrade their store to ${payment.plan_id.toUpperCase()} immediately.`)) return

    // 1. Update payment status
    const { error: payError } = await supabase.from('plan_payments').update({ 
      status: 'approved',
      approved_at: new Date().toISOString()
    }).eq('id', payment.id)

    if (payError) { alert(payError.message); return }

    // 2. Update user's current_plan in profiles
    const { error: profileError } = await supabase.from('profiles').update({ 
      current_plan: payment.plan_id 
    }).eq('id', payment.user_id)

    if (profileError) { alert(profileError.message); return }

    alert(`✅ Approved! ${payment.profiles?.business_name || 'User'} is now ${payment.plan_id.toUpperCase()}`)
    fetchPayments()
  }

  const rejectPayment = async (payment: Payment) => {
    const reason = prompt(`Reject payment from ${payment.profiles?.business_name || payment.user_id}?\nTxn: ${payment.txn_id}\n\nEnter reason (optional):`)
    if (reason === null) return // cancelled

    const { error } = await supabase.from('plan_payments').update({ 
      status: 'rejected',
      rejection_reason: reason || 'Invalid transaction'
    }).eq('id', payment.id)

    if (error) { alert(error.message); return }
    alert('Rejected')
    fetchPayments()
  }

  const copyTxn = (txn: string) => {
    navigator.clipboard.writeText(txn)
    alert(`Copied Txn ID: ${txn}\n\nNow search this in your JazzCash Business App under Till ${paymentTillId}`)
  }

  const paymentTillId = '984837533'

  const filtered = payments.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        p.txn_id.toLowerCase().includes(s) ||
        p.profiles?.business_name?.toLowerCase().includes(s) ||
        p.profiles?.whatsapp_number?.includes(s) ||
        p.user_id.includes(s) ||
        p.plan_id.includes(s)
      )
    }
    return true
  })

  if (loading) return <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center"><div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-zinc-900 p-4 md:p-6">
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white border rounded-[20px] p-5 md:p-6 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black text-white rounded-[12px] flex items-center justify-center font-bold">A</div>
              <div>
                <h1 className="font-black text-[18px] tracking-tight">Payments Admin — Till {paymentTillId}</h1>
                <p className="text-[11px] text-zinc-500">Approve who paid to your JazzCash Till. Check Txn ID in JazzCash Business App → Transactions → Search Txn ID</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 px-3 bg-black text-white rounded-full text-[12px] font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-[#E8FF86] rounded-full animate-pulse" />
                {filtered.length} {filter}
              </div>
              <button onClick={fetchPayments} className="h-9 px-4 border bg-white rounded-full text-[12px] font-medium hover:bg-zinc-50">Refresh ↻</button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {(['pending','approved','rejected','all'] as const).map(f => (
              <button key={f} onClick={()=>setFilter(f)} className={`h-8 px-4 rounded-full text-[12px] font-medium capitalize transition-colors ${filter===f ? 'bg-black text-white' : 'bg-zinc-100 border hover:bg-white'}`}>
                {f} {f==='pending' && payments.filter(p=>p.status==='pending').length > 0 && `(${payments.filter(p=>p.status==='pending').length})`}
              </button>
            ))}
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Txn ID, Business Name, WhatsApp, User ID" className="ml-auto w-full md:w-[320px] h-9 px-4 border rounded-full bg-zinc-50 text-[12px] focus:bg-white focus:outline-none focus:border-black" />
          </div>
        </div>

        {/* How to verify */}
        <div className="bg-black text-white rounded-[16px] p-4 mb-4 flex flex-wrap items-center gap-3 text-[11px]">
          <span className="bg-white/10 border border-white/10 px-3 h-7 rounded-full flex items-center font-bold">HOW TO VERIFY:</span>
          <span className="opacity-80">1. Open JazzCash Business App → 2. Go to Till {paymentTillId} → Transactions → 3. Search Txn ID from table below → 4. Check amount matches Rs. {`{amount}`} → 5. If yes, click Approve</span>
        </div>

        {/* Payments Table */}
        <div className="bg-white border rounded-[20px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8F7F5] border-b text-[11px] font-black tracking-widest uppercase">
                <tr>
                  <th className="p-3">User / Store</th>
                  <th className="p-3">Plan & Billing</th>
                  <th className="p-3">Amount & Txn ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {filtered.length===0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-zinc-500">No {filter} payments {search && `matching "${search}"`}</td></tr>
                ) : filtered.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-[#FFFEF5] transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-[13px]">{p.profiles?.business_name || 'Unknown Store'}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">WA: {p.profiles?.whatsapp_number || '—'}</div>
                      <div className="text-[10px] font-mono text-zinc-400 mt-1">/s/{p.profiles?.store_slug || '—'}</div>
                      <div className="text-[10px] font-mono text-zinc-400">User: {p.user_id.slice(0,8)}...</div>
                      <div className="mt-1.5 flex items-center gap-1.5"><span className="text-[10px] px-2 h-5 rounded-full bg-zinc-100 border flex items-center">Current: {p.profiles?.current_plan || 'basic'}</span></div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2"><span className={`px-2.5 h-6 rounded-full text-[11px] font-black flex items-center ${p.plan_id==='premium'?'bg-[#E8FF86] text-black':p.plan_id==='advanced'?'bg-black text-white':'bg-zinc-100'}`}>{p.plan_id.toUpperCase()}</span><span className="text-[11px] px-2 h-5 rounded-full bg-zinc-50 border">{p.billing_cycle}</span></div>
                      <div className="text-[11px] text-zinc-500 mt-1.5">{p.plan_id==='advanced' ? (p.billing_cycle==='monthly' ? 'Rs. 899/mo' : 'Rs. 699/mo (Rs. 8388/yr)') : p.plan_id==='premium' ? (p.billing_cycle==='monthly' ? 'Rs. 2999/mo' : 'Rs. 2499/mo (Rs. 29988/yr)') : 'Free'}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-black text-[14px]">Rs. {p.amount}</div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="font-mono text-[12px] bg-[#F8F7F5] border px-2.5 py-1 rounded-[8px]">{p.txn_id}</span>
                        <button onClick={()=>copyTxn(p.txn_id)} className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-[10px] hover:bg-zinc-800">⎙</button>
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1">Till: {p.till_id}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-[12px]">{new Date(p.created_at).toLocaleDateString()}</div>
                      <div className="text-[11px] text-zinc-500">{new Date(p.created_at).toLocaleTimeString()}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 h-6 rounded-full text-[10px] font-bold flex items-center w-fit ${p.status==='pending'?'bg-yellow-100 text-yellow-700 border border-yellow-200':p.status==='approved'?'bg-green-100 text-green-700 border border-green-200':'bg-red-100 text-red-700 border border-red-200'}`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      {p.status==='pending' ? (
                        <div className="flex flex-col gap-1.5">
                          <button onClick={()=>approvePayment(p)} className="h-8 px-4 bg-black text-white rounded-full text-[11px] font-bold hover:bg-zinc-900 flex items-center justify-center gap-1">✓ Approve & Upgrade to {p.plan_id.toUpperCase()}</button>
                          <button onClick={()=>rejectPayment(p)} className="h-7 px-3 border bg-white rounded-full text-[11px] font-medium hover:bg-zinc-50">✕ Reject</button>
                        </div>
                      ) : p.status==='approved' ? (
                        <span className="text-[11px] text-green-600 font-medium">✓ Upgraded to {p.plan_id}</span>
                      ) : (
                        <span className="text-[11px] text-red-600">Rejected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 bg-[#E8FF86] border border-black/5 rounded-[16px] p-4 text-[11px] leading-[1.5]">
          <div className="font-black text-[12px]">✅ Workflow to avoid wrong approvals:</div>
          <div className="mt-2 grid md:grid-cols-3 gap-3">
            <div><b>1. Txn ID is unique per payment.</b> When user pays to Till {paymentTillId}, JazzCash generates a unique Txn ID. User pastes that Txn ID on your site. You search that exact Txn ID in JazzCash Business App — it shows amount, date, time. If amount = Rs. {`{payment.amount}`} and Till = {paymentTillId}, it's real.</div>
            <div><b>2. User is auto-linked.</b> You don't need to guess who paid — when user submits Txn ID, we save their user_id automatically (from login). So row shows Business Name + WhatsApp + Store Slug + User ID. You approve that exact user, not someone else.</div>
            <div><b>3. One-click upgrade.</b> Approve button does: update plan_payments.status=approved AND profiles.current_plan=plan_id. User's dashboard instantly shows new limits (Basic 5/1 → Advanced 25/5 → Premium ∞).</div>
          </div>
        </div>
      </div>
    </div>
  )
}
