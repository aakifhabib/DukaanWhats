'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type AdminView = 'payments' | 'users'
type Profile = { id: string; business_name: string | null; whatsapp_number: string | null; store_slug: string | null; current_plan: string | null }
type Payment = { id: string; user_id: string; plan_id: string; amount: number; till_id: string; txn_id: string; status: 'pending' | 'approved' | 'rejected'; billing_cycle: string; created_at: string; profiles: Profile | null }
type AdminUser = { id: string; email: string; created_at: string; last_sign_in_at: string | null; email_confirmed_at: string | null; profile: Profile | null }

const date = (value?: string | null) => value ? new Date(value).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'
const cleanPhone = (value?: string | null) => {
  const digits = String(value || '').replace(/\D/g, '')
  return digits.startsWith('0') ? `92${digits.slice(1)}` : digits
}

export default function AdminPayments() {
  const [session, setSession] = useState<Session | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [view, setView] = useState<AdminView>('payments')
  const [payments, setPayments] = useState<Payment[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [usersPage, setUsersPage] = useState(1)
  const [usersHasMore, setUsersHasMore] = useState(false)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [workingId, setWorkingId] = useState('')
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let alive = true
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!alive) return
      if (sessionError) setError(sessionError.message)
      setSession(data.session)
      setCheckingSession(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setCheckingSession(false)
    })
    return () => { alive = false; subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    let alive = true
    const load = async () => {
      if (!session) return
      setLoading(true)
      setError('')
      try {
        const response = await fetch(`/api/admin?view=${view}${view === 'users' ? `&page=${usersPage}` : ''}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Could not load admin data.')
        if (!alive) return
        if (view === 'payments') setPayments(result.payments || [])
        else { setUsers(result.users || []); setUsersHasMore(Boolean(result.hasMore)) }
      } catch (reason: any) {
        if (alive) setError(reason?.message || 'Could not load admin data.')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [session, view, refreshKey, usersPage])

  const filteredPayments = useMemo(() => payments.filter(payment => {
    if (filter !== 'all' && payment.status !== filter) return false
    const needle = search.trim().toLowerCase()
    if (!needle) return true
    return [payment.txn_id, payment.profiles?.business_name, payment.profiles?.whatsapp_number, payment.plan_id, payment.user_id]
      .some(value => String(value || '').toLowerCase().includes(needle))
  }), [payments, filter, search])

  const filteredUsers = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return users
    return users.filter(user => [user.email, user.profile?.business_name, user.profile?.whatsapp_number, user.profile?.store_slug, user.id]
      .some(value => String(value || '').toLowerCase().includes(needle)))
  }, [users, search])

  const updatePayment = useCallback(async (payment: Payment, status: 'approved' | 'rejected') => {
    if (!session) return
    const business = payment.profiles?.business_name || 'this customer'
    if (!window.confirm(`${status === 'approved' ? 'Approve' : 'Reject'} ${business}'s ${payment.plan_id} payment of Rs. ${payment.amount}?`)) return
    setWorkingId(payment.id)
    setError('')
    try {
      const response = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ paymentId: payment.id, status }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not update payment.')
      setRefreshKey(key => key + 1)
    } catch (reason: any) {
      setError(reason?.message || 'Could not update payment.')
    } finally {
      setWorkingId('')
    }
  }, [session])

  const sendWhatsApp = (payment: Payment) => {
    const number = cleanPhone(payment.profiles?.whatsapp_number)
    if (!number) {
      setError('This user has not added a WhatsApp number to their store profile.')
      return
    }
    const plan = payment.plan_id.toUpperCase()
    const business = payment.profiles?.business_name || 'there'
    const storeUrl = payment.profiles?.store_slug ? `${window.location.origin}/s/${payment.profiles.store_slug}` : ''
    const message = `DukaanWhats payment update\n\nHi ${business}, your ${plan} plan payment of Rs. ${payment.amount} (transaction ${payment.txn_id}) has been approved.${storeUrl ? `\n\nYour store: ${storeUrl}` : ''}\n\nThank you for choosing DukaanWhats.`
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setPayments([])
    setUsers([])
    setError('')
  }

  if (checkingSession) return <main className="grid min-h-screen place-items-center bg-[#F8F7F5] text-sm text-zinc-500">Checking your session…</main>

  if (!session) return (
    <main className="grid min-h-screen place-items-center bg-[#F8F7F5] p-5 text-zinc-900">
      <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-black text-xl text-[#E8FF86]">D</div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Administrator sign in</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">Sign in with your approved DukaanWhats account to view payments and registered users.</p>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-left text-sm text-red-700">{error}</p>}
        <Link href="/login?next=%2Fadmin%2Fpayments" className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white">Sign in securely</Link>
        <Link href="/" className="mt-4 inline-block text-sm text-zinc-500 hover:text-black">Back to home</Link>
      </section>
    </main>
  )

  const pendingCount = payments.filter(payment => payment.status === 'pending').length
  const activeUsers = users.filter(user => user.profile?.current_plan && user.profile.current_plan !== 'basic').length

  return (
    <main className="min-h-screen bg-[#F7F7F5] text-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-black font-bold text-[#E8FF86]">DW</div>
            <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-zinc-400">Secure administrator</p><h1 className="text-xl font-bold tracking-tight">DukaanWhats Admin</h1><p className="mt-0.5 text-xs text-zinc-500">Signed in as {session.user.email}</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setRefreshKey(key => key + 1)} disabled={loading} className="h-10 rounded-full border border-zinc-200 px-4 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50">{loading ? 'Refreshing…' : 'Refresh'}</button>
            <button type="button" onClick={signOut} className="h-10 rounded-full border border-zinc-200 px-4 text-sm font-medium hover:bg-zinc-50">Sign out</button>
          </div>
        </header>

        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4"><p className="text-xs text-zinc-500">Users on this page</p><p className="mt-1 text-2xl font-bold">{users.length || '—'}</p></div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4"><p className="text-xs text-zinc-500">Paid plans in loaded users</p><p className="mt-1 text-2xl font-bold">{view === 'users' ? activeUsers : '—'}</p></div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4"><p className="text-xs text-zinc-500">Pending payments</p><p className="mt-1 text-2xl font-bold">{view === 'payments' ? pendingCount : '—'}</p></div>
        </section>

        <section className="mt-5 overflow-hidden rounded-3xl border border-zinc-200 bg-white">
          <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 p-4 sm:p-5">
            <div className="flex rounded-full bg-zinc-100 p-1">
              {(['payments', 'users'] as const).map(item => <button key={item} type="button" aria-pressed={view === item} onClick={() => { setView(item); setSearch(''); setError(''); if (item === 'users') setUsersPage(1) }} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${view === item ? 'bg-black text-white' : 'text-zinc-600 hover:text-black'}`}>{item}</button>)}
            </div>
            {view === 'payments' && <div className="flex flex-wrap gap-1">{(['pending', 'approved', 'rejected', 'all'] as const).map(item => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)} className={`rounded-full px-3 py-2 text-xs font-semibold capitalize ${filter === item ? 'bg-[#E8FF86] text-black' : 'text-zinc-500 hover:bg-zinc-100'}`}>{item}{item === 'pending' ? ` · ${pendingCount}` : ''}</button>)}</div>}
            <label className="ml-auto w-full sm:w-72"><span className="sr-only">Search {view}</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder={view === 'users' ? 'Search email, store, phone…' : 'Search transaction, store…'} className="h-10 w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none focus:border-zinc-500 focus:bg-white" /></label>
          </div>

          {error && <div role="alert" className="m-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><span>{error}</span><button type="button" onClick={() => setRefreshKey(key => key + 1)} className="font-semibold underline">Try again</button></div>}
          {loading ? <div className="p-12 text-center text-sm text-zinc-500">Loading {view}…</div> : view === 'users' ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-zinc-50 text-[10px] uppercase tracking-wider text-zinc-500"><tr><th className="px-5 py-3 font-bold">User / store</th><th className="px-5 py-3 font-bold">Contact</th><th className="px-5 py-3 font-bold">Plan</th><th className="px-5 py-3 font-bold">Joined</th><th className="px-5 py-3 font-bold">Last sign-in</th></tr></thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredUsers.map(user => <tr key={user.id} className="align-top hover:bg-zinc-50/70">
                    <td className="px-5 py-4"><p className="font-semibold">{user.profile?.business_name || 'Store not set up'}</p><p className="mt-1 text-xs text-zinc-500">{user.email || 'No email'} · {user.profile?.store_slug ? `/s/${user.profile.store_slug}` : 'No store link'}</p><p className="mt-1 font-mono text-[10px] text-zinc-400">{user.id}</p></td>
                    <td className="px-5 py-4 text-xs text-zinc-600">{user.profile?.whatsapp_number || 'No WhatsApp number'}<p className="mt-1 text-zinc-400">{user.email_confirmed_at ? 'Email confirmed' : 'Email unconfirmed'}</p></td>
                    <td className="px-5 py-4"><span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold capitalize">{user.profile?.current_plan || 'basic'}</span></td>
                    <td className="px-5 py-4 text-xs text-zinc-600">{date(user.created_at)}</td><td className="px-5 py-4 text-xs text-zinc-600">{date(user.last_sign_in_at)}</td>
                  </tr>)}
                  {!filteredUsers.length && <tr><td colSpan={5} className="p-10 text-center text-sm text-zinc-500">{error ? 'User data could not be loaded.' : 'No matching users.'}</td></tr>}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3 text-xs text-zinc-500"><span>Page {usersPage} · {users.length} users</span><div className="flex gap-2"><button type="button" disabled={usersPage <= 1 || loading} onClick={() => setUsersPage(page => Math.max(1, page - 1))} className="rounded-full border border-zinc-200 px-3 py-1.5 disabled:opacity-40">Previous</button><button type="button" disabled={!usersHasMore || loading} onClick={() => setUsersPage(page => page + 1)} className="rounded-full border border-zinc-200 px-3 py-1.5 disabled:opacity-40">Next</button></div></div>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredPayments.map(payment => <article key={payment.id} className="grid gap-4 px-5 py-5 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-center">
                <div><p className="font-semibold">{payment.profiles?.business_name || 'Unknown store'}</p><p className="mt-1 text-xs text-zinc-500">{payment.profiles?.whatsapp_number || 'No WhatsApp'} · {payment.profiles?.store_slug ? `/s/${payment.profiles.store_slug}` : 'No store link'}</p><p className="mt-1 font-mono text-[10px] text-zinc-400">{payment.user_id} · {date(payment.created_at)}</p></div>
                <div><span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold capitalize">{payment.plan_id}</span><p className="mt-2 text-xs text-zinc-500">{payment.billing_cycle} billing</p></div>
                <div><p className="font-semibold">Rs. {Number(payment.amount || 0).toLocaleString('en-PK')}</p><p className="mt-1 break-all font-mono text-xs text-zinc-500">{payment.txn_id}</p><p className="mt-1 text-[10px] text-zinc-400">Till {payment.till_id}</p></div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end"><span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${payment.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : payment.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{payment.status}</span>
                  {payment.status === 'pending' ? <><button type="button" disabled={workingId === payment.id} onClick={() => updatePayment(payment, 'approved')} className="h-9 rounded-full bg-black px-4 text-xs font-semibold text-white disabled:opacity-50">{workingId === payment.id ? 'Saving…' : 'Approve'}</button><button type="button" disabled={workingId === payment.id} onClick={() => updatePayment(payment, 'rejected')} className="h-9 rounded-full border border-zinc-200 px-4 text-xs font-semibold disabled:opacity-50">Reject</button></> : payment.status === 'approved' ? <button type="button" onClick={() => sendWhatsApp(payment)} className="h-9 rounded-full bg-[#E8FF86] px-4 text-xs font-semibold">Resend WhatsApp</button> : null}
                </div>
              </article>)}
              {!filteredPayments.length && <div className="p-10 text-center text-sm text-zinc-500">{error ? 'Payment data could not be loaded.' : `No ${filter === 'all' ? '' : filter + ' '}payments found.`}</div>}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
