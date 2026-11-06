'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function FloatingLogoutButton() {
  const pathname = usePathname()
  const router = useRouter()
  const [hasSession, setHasSession] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active) setHasSession(Boolean(data.session))
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setHasSession(Boolean(session))
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const isAuthenticatedArea = pathname === '/dashboard' || pathname.startsWith('/dashboard/') || pathname === '/admin' || pathname.startsWith('/admin/')
  if (!hasSession || !isAuthenticatedArea) return null

  const logout = async () => {
    if (signingOut) return
    setSigningOut(true)
    setError('')
    try {
      const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' })
      if (signOutError) throw signOutError
      setHasSession(false)
      router.replace('/login')
      router.refresh()
    } catch {
      setError('Could not sign out. Please try again.')
      setSigningOut(false)
    }
  }

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] right-4 z-[96] flex flex-col items-end gap-2 sm:bottom-7 sm:right-7">
      {error && <p role="alert" className="max-w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-medium text-red-700 shadow-lg">{error}</p>}
      <button
        type="button"
        onClick={logout}
        disabled={signingOut}
        aria-label={signingOut ? 'Signing out' : 'Log out'}
        className="group inline-flex min-h-12 items-center gap-2.5 rounded-full border border-white/15 bg-zinc-950 px-4 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(0,0,0,.25)] transition duration-200 hover:-translate-y-1 hover:bg-zinc-800 hover:shadow-[0_16px_36px_rgba(0,0,0,.3)] active:scale-95 disabled:cursor-wait disabled:opacity-70"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 17l5-5-5-5M15 12H3" />
          <path d="M12 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
        </svg>
        <span>{signingOut ? 'Signing out…' : 'Log out'}</span>
      </button>
    </div>
  )
}
