'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const TILL_ID = '984837533'
const ADMIN_PASSWORD = 'Malik@235'

export default function AdminPayments() {
  const [verified, setVerified] = useState(false)
  const [pass, setPass] = useState('')
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const checkPass = () => {
    if (pass === ADMIN_PASSWORD) {
      setVerified(true)
      load()
    } else alert('Wrong password')
  }

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('plan_payments').select('*').order('created_at', { ascending: false })
    if (data) setPayments(data)
    setLoading(false)
  }

  const approve = async (p: any) => {
    if (!confirm(`Approve ${p.user_id} for ${p.plan_id}?`)) return
    await supabase.from('plan_payments').update({ status: 'approved' }).eq('id', p.id)
    await supabase.from('profiles').update({ current_plan: p.plan_id }).eq('id', p.user_id)
    alert('Approved!')
    load()
  }

  if (!verified) {
    return (
      <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center p-4">
        <div className="bg-white border rounded- p-8 w-full max-w-">
          <h1 className="font-black text- text-center">Admin Login</h1>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" className="mt-4 w-full h-11 px-4 border rounded-" />
          <button onClick={checkPass} className="mt-3 w-full h-11 bg-black text-white rounded-full font-bold">Unlock</button>
          <p className="text- text-zinc-400 text-center mt-3">Default: DukaanWhats@2024Admin</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F7F5] p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-black text-">Payments — Till {TILL_ID} — {payments.length} total</h1>
        <button onClick={load} className="mt-2 h-8 px-4 border bg-white rounded-full text-">Refresh</button>
        <div className="mt-4 space-y-3">
          {payments.map((p: any) => (
            <div key={p.id} className="bg-white border rounded- p-4 flex justify-between items-center">
              <div>
                <div className="font-bold">{p.plan_id.toUpperCase()} — Rs. {p.amount}</div>
                <div className="text- font-mono bg-zinc-50 border px-2 py-1 rounded mt-1">{p.txn_id}</div>
                <div className="text- text-zinc-500 mt-1">User: {p.user_id.slice(0,8)} • {new Date(p.created_at).toLocaleString()} • {p.status}</div>
              </div>
              {p.status === 'pending' && <button onClick={() => approve(p)} className="h-9 px-4 bg-black text-white rounded-full text- font-bold">Approve</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
