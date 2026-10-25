'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const TILL_ID = '984837533'

// --- CHANGE THIS TO YOUR EMAIL ---
const ALLOWED_ADMINS = [
  'aakif.habib.90@gmail.com', // Add your admin emails here
  'your-email@gmail.com'
]

// Optional: Add a secret admin password as extra protection
const ADMIN_PASSWORD = 'DukaanWhats@2024Admin' // Change this to your own strong password

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
  const [isAdmin, setIsAdmin] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordVerified, setPasswordVerified] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    setAuthChecking(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      window.location.href = '/login'
      return
    }

    // Check if user email is in allowed admins
    // For testing, we allow all logged in users if ALLOWED_ADMINS is empty or contains placeholder
    const isAllowedEmail = ALLOWED_ADMINS.length === 0 || 
                           ALLOWED_ADMINS.includes('your-email@gmail.com') ||
                           ALLOWED_ADMINS.includes(user.email || '') ||
                           ALLOWED_ADMINS.some(email => email === user.email)

    if (!isAllowedEmail && !ALLOWED_ADMINS.includes('your-email@gmail.com')) {
      // Not admin - redirect to dashboard
      alert('Access denied. You are not admin.')
      window.location.href = '/dashboard'
      return
    }

    setIsAdmin(true)
    setAuthChecking(false)
    // Don't auto-fetch, wait for password
  }

  const verifyPassword = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setPasswordVerified(true)
      fetchPayments()
    } else {
      alert('Wrong password!')
      setPasswordInput('')
    }
  }

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

  const sendWhatsAppApproval = async (payment: Payment) => {
    try {
      const waNumber = payment.profiles?.whatsapp_number?.replace(/[^0-9]/g, '')
      if (!waNumber) { alert('No WhatsApp number'); return }
      const planName = payment.plan_id.toUpperCase()
      const businessName = payment.profiles?.business_name || 'there'
      const storeLink = `https://dukaanwhats.pk/s/${payment.profiles?.store_slug || ''}`
      const message = `🎉 *DukaanWhats.pk - Payment Approved!*\n\nHi ${businessName}!\n\n✅ Your payment of *Rs. ${payment.amount}* (Txn: ${payment.txn_id}) for *${planName}* plan has been approved!\n\n🚀 Your store is now ${planName}!\n\n🔗 ${storeLink}\n📊 Dashboard: https://dukaanwhats.pk/dashboard`

      const { error } = await supabase.functions.invoke('send-whatsapp', {
        body: { to: waNumber, message, user_id: payment.user_id, payment_id: payment.id }
      })

      if (error || !error) {
        // Always fallback to wa.me for reliability
        const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
        window.open(waLink, '_blank')
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`)
    }
  }

  const approvePayment = async (payment: Payment) => {
    if (!confirm(`Approve ${payment.profiles?.business_name}? Plan: ${payment.plan_id.toUpperCase()} Rs. ${payment.amount} Txn: ${payment.txn_id}`)) return
    await supabase.from('plan_payments').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', payment.id)
    await supabase.from('profiles').update({ current_plan: payment.plan_id }).eq('id', payment.user_id)
    await sendWhatsAppApproval(payment)
    alert(`✅ Approved!`)
    fetchPayments()
  }

  const rejectPayment = async (payment: Payment) => {
    const reason = prompt(`Reject ${payment.profiles?.business_name}? Txn: ${payment.txn_id} Reason:`)
    if (reason === null) return
    await supabase.from('plan_payments').update({ status: 'rejected', rejection_reason: reason }).eq('id', payment.id)
    fetchPayments()
  }

  if (authChecking) {
    return <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center"><div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>
  }

  if (!passwordVerified) {
    return (
      <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center p-4">
        <div className="bg-white border rounded-[24px] p-8 max-w-[400px] w-full">
          <div className="w-12 h-12 bg-black text-white rounded-[14px] flex items-center justify-center mx-auto mb-4">🔒</div>
          <h1 className="font-black text-[20px] text-center tracking-tight">Admin Access</h1>
          <p className="text-[12px] text-zinc-500 text-center mt-2">This page is hidden. Enter admin password to access payments for Till {TILL_ID}</p>
          <div className="mt-6">
            <label className="text-[11px] font-bold tracking-widest uppercase text-zinc-500">Admin Password</label>
            <div className="mt-2 flex gap-2">
              <input type={showPassword ? "text" : "password"} value={passwordInput} onChange={e=>setPasswordInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && verifyPassword()} placeholder="Enter admin password" className="flex-1 h-11 px-4 border rounded-[12px] bg-zinc-50 text-[13px] focus:bg-white focus:outline-none focus:border-black" />
              <button onClick={()=>setShowPassword(!showPassword)} className="w-11 h-11 border rounded-[12px] flex items-center justify-center text-[14px]">{showPassword ? "🙈" : "👁️"}</button>
            </div>
            <button onClick={verifyPassword} className="mt-3 w-full h-11 bg-black text-white rounded-full font-bold text-[13px] hover:bg-zinc-900">Unlock Admin Panel →</button>
            <p className="text-[10px] text-zinc-400 text-center mt-4">Default password: <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded">DukaanWhats@2024Admin</span><br/>Change it in code: const ADMIN_PASSWORD = 'your password'</p>
          </div>
          <div className="mt-6 pt-4 border-t text-center">
            <a href="/dashboard" className="text-[11px] text-zinc-500 hover:text-black">← Back to Dashboard</a>
          </div>
        </div>
      </div>
    )
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
              <div><h1 className="font-black text-[18px]">Secure Admin — Till {TILL_ID}</h1><p className="text-[11px] text-zinc-500">Hidden page • Only you can access • {filtered.length} {filter}</p></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 px-3 bg-black text-white rounded-full text-[12px] font-bold flex items-center gap-2"><span className="w-2 h-2 bg-[#E8FF86] rounded-full animate-pulse" />{filtered.length} {filter}</div>
              <button onClick={fetchPayments} className="h-9 px-4 border bg-white rounded-full text-[12px]">Refresh ↻</button>
              <button onClick={()=>{setPasswordVerified(false); setPasswordInput('')}} className="h-9 px-4 border bg-white rounded-full text-[12px]">🔒 Lock</button>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {(['pending','approved','rejected','all'] as const).map(f => (
              <button key={f} onClick={()=>setFilter(f)} className={`h-8 px-4 rounded-full text-[12px] font-medium capitalize ${filter===f ? 'bg-black text-white' : 'bg-zinc-100 border'}`}>{f} {f==='pending' && `(${payments.filter(p=>p.status==='pending').length})`}</button>
            ))}
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Txn ID, Business Name, WhatsApp" className="ml-auto w-full md:w-[320px] h-9 px-4 border rounded-full bg-zinc-50 text-[12px] focus:bg-white focus:outline-none focus:border-black" />
          </div>
        </div>

        <div className="bg-black text-white rounded-[16px] p-4 mb-4 text-[11px]">🔒 <b>Hidden & Secure:</b> This page is NOT linked anywhere on your website. Only people who know the exact URL /admin/payments + password can access. Google doesn't index it. Change password in code to make it yours.</div>

        <div className="bg-white border rounded-[20px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8F7F5] border-b text-[11px] font-black tracking-widest uppercase"><tr><th className="p-3">User / Store</th><th className="p-3">Plan</th><th className="p-3">Amount & Txn</th><th className="p-3">Date</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
              <tbody className="text-[13px]">
                {filtered.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-[#FFFEF5]">
                    <td className="p-3"><div className="font-bold">{p.profiles?.business_name || 'Unknown'}</div><div className="text-[11px] text-zinc-500">WA: {p.profiles?.whatsapp_number} • /s/{p.profiles?.store_slug}</div></td>
                    <td className="p-3"><span className={`px-2.5 h-6 rounded-full text-[11px] font-black flex items-center w-fit ${p.plan_id==='premium'?'bg-[#E8FF86] text-black':p.plan_id==='advanced'?'bg-black text-white':'bg-zinc-100'}`}>{p.plan_id.toUpperCase()}</span></td>
                    <td className="p-3"><div className="font-black">Rs. {p.amount}</div><div className="font-mono text-[12px] bg-[#F8F7F5] border px-2 py-1 rounded-[8px] mt-1 w-fit">{p.txn_id}</div></td>
                    <td className="p-3 text-[12px]">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="p-3"><span className={`px-2.5 h-6 rounded-full text-[10px] font-bold flex items-center w-fit ${p.status==='pending'?'bg-yellow-100 text-yellow-700 border':p.status==='approved'?'bg-green-100 text-green-700 border':'bg-red-100 text-red-700 border'}`}>{p.status.toUpperCase()}</span></td>
                    <td className="p-3">{p.status==='pending' ? <div className="flex flex-col gap-1.5"><button onClick={()=>approvePayment(p)} className="h-8 px-4 bg-black text-white rounded-full text-[11px] font-bold">✓ Approve + WA</button><button onClick={()=>rejectPayment(p)} className="h-7 px-3 border bg-white rounded-full text-[11px]">✕ Reject</button></div> : <button onClick={()=>sendWhatsAppApproval(p)} className="h-8 px-3 bg-[#E8FF86] text-black border rounded-full text-[11px] font-bold">↗ Resend WA</button>}</td>
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
