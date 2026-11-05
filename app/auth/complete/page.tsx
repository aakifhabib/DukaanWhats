'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function safeDestination(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/auth/complete')) return '/dashboard'
  return value
}

export default function AuthCompletePage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const complete = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const type = params.get('type')
      const saveTermsAcceptance = async () => {
        if (params.get('signup') === 'true' && params.get('termsAccepted') === 'true') {
          const { error } = await supabase.auth.updateUser({ data: { terms_accepted_at: new Date().toISOString(), terms_version: '2026-11-04' } })
          if (error) throw error
        }
      }
      if (!code) {
        const { data, error: sessionError } = await supabase.auth.getSession()
        if (!active) return
        if (data.session && !sessionError) {
          await saveTermsAcceptance()
          if (!active) return
          router.replace(safeDestination(params.get('next')))
          return
        }
        setError('This sign-in link is missing or has expired. Please request a new one.')
        return
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      if (exchangeError) {
        // Supabase may have exchanged the same PKCE code during client initialization or a strict-mode replay.
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData.session) {
          if (active) setError(`${exchangeError.message} Please request a new link and try again.`)
          return
        }
      }
      if (!active) return
      await saveTermsAcceptance()
      const destination = type === 'recovery' || params.get('next') === '/reset-password'
        ? '/reset-password'
        : safeDestination(params.get('next'))
      router.replace(destination)
    }
    complete().catch(reason => { if (active) setError(reason?.message || 'Could not complete sign-in.') })
    return () => { active = false }
  }, [router])

  return (
    <main className="grid min-h-screen place-items-center bg-[#F8F7F5] p-5 text-zinc-900">
      <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        {!error ? <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-black" aria-label="Completing sign-in" /> : <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-red-50 text-red-700">!</div>}
        <h1 className="mt-4 text-xl font-bold">{error ? 'Sign-in link problem' : 'Completing sign in…'}</h1>
        <p role={error ? 'alert' : undefined} className="mt-2 text-sm leading-6 text-zinc-500">{error || 'Please wait while we securely verify your account.'}</p>
        {error && <Link href="/login" className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-sm font-semibold text-white">Back to sign in</Link>}
      </section>
    </main>
  )
}
