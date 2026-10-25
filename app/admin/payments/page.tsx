'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const TILL_ID = '984837533'
const ADMIN_PASSWORD = 'Malik@235' // CHANGE THIS
const ADMIN_EMAILS = ['nexusdeals235@gmail.com'] // Add your email

type Payment = {
  id: string
  user_id: string
  plan_id: 'basic'|'advanced'|'premium'
  amount: number
  till_id: string
  txn_id: string
  status: 'pending'|'approved'|'rejected'
  billing_cycle: string
  created_at: string
  profiles?: any
}

export default function AdminPayments() {
  const [verified, setVerified] = useState(false)
  const [pass, setPass] = useState('')
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending'|'approved'|'rejected'|'all'>('pending')
  const [search, setSearch] = useState('')
  const [authCheck, setAuthCheck] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('dw_admin_ok')
    if (saved === ADMIN_PASSWORD) {
      setVerified(true)
      fetchPayments()
    }
    setAuthCheck(false)
  }, [])

  const checkPass = () => {
    if (pass === ADMIN_PASSWORD) {
      localStorage.setItem('dw_admin_ok', pass)
      setVerified(true)
      fetchPayments()
    } else alert('Wrong password')
  }

  const fetchPayments = async () => {
    setLoading(true)
    // Simple query first - always works
    const { data, error } = await supabase.from('plan_payments').select('*').order('created_at', { ascending: false })
    if (error) { alert(error.message); setLoading(false); return }
    
    // Enrich with profiles one by one (safe)
    if (data) {
      const enriched = await Promise.all(data.map(async (p: any) => {
        const { data: prof } = await supabase.from('profiles').select('business_name, whatsapp_number, store_slug, current_plan').eq('id', p.user_id).maybeSingle()
        return { ...p, profiles: prof }
      }))
      setPayments(enriched)
    }
    setLoading(false)
  }

  const sendWhatsApp = (p: Payment) => {
    const wa = p.profiles?.whatsapp_number?.replace(/[^0-9]/g, '') || ''
    if (!wa) { alert('No WhatsApp'); return }
    const plan = p.plan_id.toUpperCase()
    const name = p.profiles?.business_name || 'there'
    const link = `https://dukaanwhats.pk/s/${p.profiles?.store_slug || ''}`
    const msg = `🎉 *DukaanWhats.pk - Payment Approved!*\n\nHi ${name}!\n\n✅ Your payment of *Rs. ${p.amount}* (Txn: ${p.txn_id}) for *${plan}* plan approved!\n\n🚀 Your store is now ${plan}!\n\n🔗 ${link}\n📊 Dashboard: https://dukaanwhats.pk/dashboard\n\nThanks for choosing DukaanWhats!`
    // Try Edge Function, fallback to wa.me
    supabase.functions.invoke('send-whatsapp', { body: { to: wa, message: msg, user_id: p.user_id } }).catch(()=>{})
    const waLink = `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`
    window.open(waLink, '_blank')
  }

  const approve = async (p: Payment) => {
    if (!confirm(`Approve ${p.profiles?.business_name} - ${p.plan_id} Rs.${p.amount} Txn:${p.txn_id} ?`)) return
    const { error: e1 } = await supabase.from('plan_payments').update({ status: 'approved' }).eq('id', p.id)
    if (e1) { alert(e1.message); return }
    const { error: e2 } = await supabase.from('profiles').update({ current_plan: p.plan_id }).eq('id', p.user_id)
    if (e2) alert('Payment approved but plan update failed: ' + e2.message)
    sendWhatsApp(p)
    fetchPayments()
  }

  const reject = async (p: Payment) => {
    const reason = prompt(`Reject ${p.profiles?.business_name}? Reason:`)
    if (reason === null) return
    await supabase.from('plan_payments').update({ status: 'rejected' }).eq('id', p.id)
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

  if (authCheck) return <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center"><div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>

  if (!verified) {
    return (
      <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center p-4">
        <div className="bg-white border rounded-[28px] p-8 w-full max-w-[380px] shadow-sm">
          <div className="w-12 h-12 bg-black text-white rounded-[14px] flex items-center justify-center mx-auto">🔒</div>
          <h1 className="font-black text-[20px] text-center mt-4 tracking-tight">Hidden Admin</h1>
          <p className="text-[11px] text-zinc-500 text-center mt-2 leading-[1.4]">This page is not linked anywhere.<br/>Only you know this URL. Enter password.</p>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter' && checkPass()} placeholder="Admin password" className="mt-6 w-full h-12 px-4 border rounded-[14px] bg-[#F8F7F5] focus:bg-white focus:outline-none focus:border-black text-[13px]" />
          <button onClick={checkPass} className="mt-3 w-full h-12 bg-black text-white rounded-full font-bold text-[13px]">Unlock →</button>
          <p className="text-[10px] text-zinc-400 text-center mt-4">Default: <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded">DukaanWhats@2024Admin</span></p>
          <div className="mt-6 pt-4 border-t text-center"><a href="/dashboard" className="text-[11px] text-zinc-500">← Dashboard</a></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-zinc-900">
      <div className="max-w-[1100px] mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="bg-white border rounded-[22px] p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black text-white rounded-[12px] flex items-center justify-center font-black text-[14px]">DW</div>
              <div>
                <h1 className="font-black text-[18px] tracking-tight">Admin • Till {TILL_ID}</h1>
                <p className="text-[11px] text-zinc-500">Hidden • Secure • {payments.length} payments • {payments.filter(p=>p.status==='pending').length} pending</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchPayments} className="h-9 px-4 border rounded-full bg-white text-[12px] font-medium">Refresh ↻</button>
              <button onClick={()=>{localStorage.removeItem('dw_admin_ok'); setVerified(false); setPass('')}} className="h-9 px-4 border rounded-full bg-white text-[12px]">🔒 Lock</button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {(['pending','approved','rejected','all'] as const).map(f => (
              <button key={f} onClick={()=>setFilter(f)} className={`h-8 px-4 rounded-full text-[12px] font-bold capitalize border ${filter===f ? 'bg-black text-white border-black' : 'bg-[#F8F7F5] text-zinc-600'}`}>
                {f} {f==='pending' ? `(${payments.filter(p=>p.status==='pending').length})` : ''}
              </button>
            ))}
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Txn, Business, WhatsApp" className="ml-auto w-full md:w-[300px] h-9 px-4 border rounded-full bg-[#F8F7F5] focus:bg-white focus:outline-none focus:border-black text-[12px]" />
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 bg-black text-white rounded-[14px] px-4 py-3 text-[11px] flex items-center gap-2">
          <span className="w-2 h-2 bg-[#E8FF86] rounded-full animate-pulse" /> Secure: Only you know this URL. Change password in code: <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">ADMIN_PASSWORD</span>
        </div>

        {/* List */}
        {loading ? (
          <div className="mt-6 flex justify-center"><div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="mt-4 bg-white border rounded-[22px] overflow-hidden">
            <div className="hidden md:grid grid-cols-12 bg-[#F8F7F5] border-b px-5 py-3 text-[10px] font-black tracking-widest uppercase text-zinc-500">
              <div className="col-span-4">Store / User</div>
              <div className="col-span-2">Plan</div>
              <div className="col-span-3">Txn & Amount</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Actions</div>
            </div>

            {filtered.length === 0 && <div className="p-12 text-center text-[13px] text-zinc-500">No {filter} payments</div>}

            {filtered.map(p => (
              <div key={p.id} className="grid md:grid-cols-12 gap-3 px-5 py-4 border-b last:border-0 hover:bg-[#FFFEF5] items-center">
                <div className="md:col-span-4">
                  <div className="font-black text-[13px]">{p.profiles?.business_name || 'Unknown Business'}</div>
                  <div className="text-[11px] text-zinc-500 mt-1">WA: {p.profiles?.whatsapp_number || '—'} • /s/{p.profiles?.store_slug || '—'}</div>
                  <div className="text-[10px] text-zinc-400 mt-1 font-mono">{p.user_id.slice(0,12)}... • {new Date(p.created_at).toLocaleString()}</div>
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <span className={`h-6 px-3 rounded-full text-[11px] font-black flex items-center ${p.plan_id==='premium'?'bg-[#E8FF86] text-black':p.plan_id==='advanced'?'bg-black text-white':'bg-zinc-100'}`}>{p.plan_id.toUpperCase()}</span>
                  <span className="text-[11px] text-zinc-500">{p.billing_cycle}</span>
                </div>
                <div className="md:col-span-3">
                  <div className="font-black text-[13px]">Rs. {p.amount}</div>
                  <div className="mt-1 font-mono text-[11px] bg-[#F8F7F5] border px-2.5 py-1 rounded-[10px] w-fit">{p.txn_id}</div>
                  <div className="text-[10px] text-zinc-400 mt-1">Till {p.till_id}</div>
                </div>
                <div className="md:col-span-1">
                  <span className={`h-6 px-2.5 rounded-full text-[10px] font-bold border flex items-center w-fit ${p.status==='pending'?'bg-yellow-50 text-yellow-700 border-yellow-200':p.status==='approved'?'bg-green-50 text-green-700 border-green-200':'bg-red-50 text-red-700 border-red-200'}`}>{p.status.toUpperCase()}</span>
                </div>
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  {p.status==='pending' ? (
                    <>
                      <button onClick={()=>approve(p)} className="h-9 bg-black text-white rounded-full text-[11px] font-bold hover:bg-zinc-900">✓ Approve + WA</button>
                      <button onClick={()=>reject(p)} className="h-8 border bg-white rounded-full text-[11px]">✕ Reject</button>
                    </>
                  ) : (
                    <button onClick={()=>sendWhatsApp(p)} className="h-9 bg-[#E8FF86] text-black border rounded-full text-[11px] font-bold">↗ Resend WA</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
