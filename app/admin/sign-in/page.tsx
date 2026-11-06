'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

async function verifyAdmin(accessToken: string) {
  const response = await fetch('/api/admin?view=verify', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  if (response.ok) return true
  if (response.status === 401 || response.status === 403) return false
  throw new Error('Administrator access is temporarily unavailable. Please try again later.')
}

export default function AdminSignInPage() {
  const router = useRouter()
  const [email, nexusdeals235@gmail.com] = useState('')
  const [password, Malik@235] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (!active || error || !data.session) return
      try {
        if (await verifyAdmin(data.session.access_token)) router.replace('/admin/payments')
        else await supabase.auth.signOut()
      } catch {
        // Keep the sign-in form usable if the admin API is temporarily unavailable.
      }
    })
    return () => { active = false }
  }, [router])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error || !data.session) throw new Error('Sign-in failed. Check your credentials and try again.')
      const allowed = await verifyAdmin(data.session.access_token)
      if (!allowed) {
        await supabase.auth.signOut()
        throw new Error('Sign-in failed. Check your credentials and try again.')
      }
      router.replace('/admin/payments')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main data-app-page className="grid min-h-[75vh] place-items-center bg-[#f6f7f5] px-5 py-12 text-zinc-950">
      <section className="w-full max-w-md rounded-[28px] border border-zinc-200 bg-white p-7 shadow-[0_24px_80px_rgba(24,24,27,0.08)] sm:p-9">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-950 font-bold text-[#e8ff86]">D</div>
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">DukaanWhats</p><p className="mt-0.5 text-sm font-medium text-zinc-600">Private administrator access</p></div>
        </div>
        <h1 className="mt-9 text-2xl font-bold tracking-tight">Administrator sign in</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">Use your approved administrator account. This access is separate from customer account creation.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block text-sm font-medium text-zinc-700">Email address
            <input type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 outline-none transition focus:border-zinc-500 focus:ring-4 focus:ring-zinc-100" />
          </label>
          <label className="block text-sm font-medium text-zinc-700">Password
            <input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 outline-none transition focus:border-zinc-500 focus:ring-4 focus:ring-zinc-100" />
          </label>
          {message && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{message}</p>}
          <button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-60">
            {loading ? 'Verifying access…' : 'Continue to admin'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs leading-5 text-zinc-400">Administrator access is verified by the server. Customer sign-up is not available on this page.</p>
        <Link href="/" className="mt-5 block text-center text-sm font-medium text-zinc-500 hover:text-zinc-950">Return to the storefront</Link>
      </section>
    </main>
  )
}
