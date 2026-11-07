'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

async function verifyAdmin(accessToken: string): Promise<true | 'mfa_required' | false> {
  const response = await fetch('/api/admin?view=verify', {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  const result = await response.json().catch(() => ({}))
  if (response.ok) return true
  if (result.code === 'mfa_required') return 'mfa_required'
  if (response.status === 401 || response.status === 403) return false
  throw new Error('Administrator access is temporarily unavailable. Please try again later.')
}

export default function AdminSignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [step, setStep] = useState<'credentials' | 'verify' | 'enroll'>('credentials')
  const [factorId, setFactorId] = useState('')
  const [challengeId, setChallengeId] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [mfaCode, setMfaCode] = useState('')

  const startMfa = useCallback(async () => {
    const { data, error } = await supabase.auth.mfa.listFactors()
    if (error) throw new Error('Could not load administrator MFA factors. Please retry.')
    const factor = data.totp?.find(item => item.status === 'verified')
    if (factor) {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id })
      if (challengeError || !challenge?.id) throw new Error('Could not start your authenticator challenge. Please retry.')
      setFactorId(factor.id)
      setChallengeId(challenge.id)
      setStep('verify')
      return
    }

    const { data: enrollment, error: enrollmentError } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'DukaanWhats administrator',
    })
    if (enrollmentError || !enrollment?.id || !enrollment.totp?.qr_code || !enrollment.totp?.secret) {
      throw new Error('Authenticator setup is unavailable. Contact the project owner to enable TOTP MFA.')
    }
    setFactorId(enrollment.id)
    setQrCode(enrollment.totp.qr_code)
    setSecret(enrollment.totp.secret)
    setStep('enroll')
  }, [])

  useEffect(() => {
    let active = true
    const checkExistingSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (!active || error || !data.session) return
      try {
        const result = await verifyAdmin(data.session.access_token)
        if (!active) return
        if (result === true) router.replace('/admin/payments')
        else if (result === 'mfa_required') await startMfa()
        else await supabase.auth.signOut({ scope: 'local' })
      } catch (reason) {
        if (active) setMessage(reason instanceof Error ? reason.message : 'Could not verify administrator access.')
      }
    }
    void checkExistingSession()
    return () => { active = false }
  }, [router, startMfa])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error || !data.session) throw new Error('Sign-in failed. Check your credentials and try again.')
      const result = await verifyAdmin(data.session.access_token)
      if (result === true) {
        router.replace('/admin/payments')
        return
      }
      if (result === 'mfa_required') {
        await startMfa()
        return
      }
      await supabase.auth.signOut({ scope: 'local' })
      throw new Error('Sign-in failed. Check your credentials and try again.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const verifyMfa = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!factorId || loading) return
    setLoading(true)
    setMessage('')
    try {
      let challenge = challengeId
      if (step === 'enroll') {
        const { data, error } = await supabase.auth.mfa.challenge({ factorId })
        if (error || !data?.id) throw new Error('Could not start the MFA enrollment challenge. Please retry.')
        challenge = data.id
      }
      const { error: verifyError } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge, code: mfaCode.trim() })
      if (verifyError) throw new Error('That authenticator code was not accepted. Check the time on your device and try again.')
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData.session) throw new Error('MFA was verified, but your sign-in session could not be refreshed. Sign in again.')
      const result = await verifyAdmin(sessionData.session.access_token)
      if (result === true) {
        router.replace('/admin/payments')
        return
      }
      if (result === 'mfa_required') throw new Error('The server did not receive an MFA-protected session. Sign in again and retry.')
      await supabase.auth.signOut({ scope: 'local' })
      setStep('credentials')
      throw new Error('This account does not have administrator access.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'MFA verification failed. Please retry.')
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
        <h1 className="mt-9 text-2xl font-bold tracking-tight">{step === 'credentials' ? 'Administrator sign in' : step === 'enroll' ? 'Set up authenticator MFA' : 'Verify your identity'}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">{step === 'credentials'
          ? 'Use your approved administrator account. Sign-in requires a time-based authenticator code.'
          : step === 'enroll'
            ? 'Scan this QR code with an authenticator app, then enter its current six-digit code to finish setup.'
            : 'Enter the current six-digit code from your authenticator app to continue.'}</p>

        {step === 'credentials' ? <form onSubmit={submit} className="mt-7 space-y-4">
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
        </form> : <form onSubmit={verifyMfa} className="mt-7 space-y-4">
          {step === 'enroll' && <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-center">
            <img src={qrCode} alt="Authenticator setup QR code" className="mx-auto h-48 w-48 rounded-xl bg-white p-2" />
            <p className="mt-3 text-left text-xs font-semibold text-zinc-600">If you cannot scan the code, enter this setup key manually:</p>
            <code className="mt-1 block break-all rounded-lg bg-white p-2 text-left text-xs text-zinc-800">{secret}</code>
          </div>}
          <label className="block text-sm font-medium text-zinc-700">Authenticator code
            <input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={mfaCode} onChange={event => setMfaCode(event.target.value.replace(/\D/g, '').slice(0, 6))} className="mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-center font-mono text-lg tracking-[0.35em] outline-none transition focus:border-zinc-500 focus:ring-4 focus:ring-zinc-100" />
          </label>
          {message && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{message}</p>}
          <button type="submit" disabled={loading || mfaCode.length !== 6} className="h-12 w-full rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-60">
            {loading ? 'Verifying…' : step === 'enroll' ? 'Enable MFA and continue' : 'Verify and continue'}
          </button>
          <button type="button" disabled={loading} onClick={async () => { await supabase.auth.signOut({ scope: 'local' }); setStep('credentials'); setMfaCode(''); setMessage('') }} className="h-11 w-full rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50">Cancel and sign out</button>
        </form>}
        <p className="mt-6 text-center text-xs leading-5 text-zinc-400">Administrator access is verified by the server and requires an MFA-protected session. Customer sign-up is not available on this page.</p>
        <Link href="/" className="mt-5 block text-center text-sm font-medium text-zinc-500 hover:text-zinc-950">Return to the storefront</Link>
      </section>
    </main>
  )
}
