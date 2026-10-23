'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [msg, setMsg] = useState('')
  const [valid, setValid] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Handle PKCE code exchange (new Supabase flow: ?code=xxx)
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        
        if (code) {
          // Exchange code for session
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          setValid(true)
          setChecking(false)
          // Clean URL
          window.history.replaceState({}, '', '/reset-password')
          return
        }

        // 2. Handle hash recovery (old flow: #access_token=...&type=recovery)
        // supabase client auto parses hash, so just check session
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          setValid(true)
        } else {
          // Listen for PASSWORD_RECOVERY event
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY' && session) {
              setValid(true)
              setChecking(false)
            }
          })
          // Give it 2 sec to detect
          setTimeout(() => {
            setChecking(false)
            supabase.auth.getSession().then(({ data }) => {
              if (data.session) setValid(true)
              else {
                setValid(false)
                setMsg('Invalid or expired link. Request a new reset link from login page.')
              }
            })
          }, 2000)
          return () => subscription.unsubscribe()
        }
      } catch (e: any) {
        setMsg('Link expired or invalid. Request new one. ' + e.message)
        setValid(false)
      }
      setChecking(false)
    }
    init()
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setMsg('Passwords do not match'); return }
    if (password.length < 6) { setMsg('Password must be at least 6 characters'); return }
    setLoading(true)
    setMsg('')
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setMsg('Password updated! Redirecting to dashboard...')
      setTimeout(() => router.push('/dashboard'), 1000)
    } catch (err: any) {
      setMsg(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="app-shell">
      <style>{`
        :root { --page-bg: #F8F7F5; }
        * { -webkit-font-smoothing: antialiased; }
        .app-shell { min-height: 100vh; min-height: 100dvh; background-color: var(--page-bg); background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.08) 1px, transparent 0); background-size: 28px 28px; display: flex; flex-direction: column; position: relative; }
        .top-bar { position: absolute; top: 0; left: 0; right: 0; height: 72px; display: flex; align-items: center; padding: 0 24px; z-index: 20; }
        @media (min-width: 768px) { .top-bar { padding: 0 40px; height: 80px; } }
        .logo-link { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
        .logo-mark { width: 32px; height: 32px; background: #0d0f14; border-radius: 10px; display: grid; place-items: center; color: #E8FF86; font-weight: 800; font-size: 18px; }
        .logo-text { font-weight: 650; font-size: 15px; color: #0d0f14; }
        .stage { flex: 1; display: flex; align-items: center; justify-content: center; padding: 88px 16px 40px; }
        .login-wrapper, .login-wrapper * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .login-wrapper { --blob-1-color: #E8FF86; --blob-2-color: #25D366; position: relative; animation: floatUp 0.8s forwards; opacity: 0; transform: translateY(30px); }
        @keyframes floatUp { to { opacity: 1; transform: translateY(0); } }
        .login-card { position: relative; width: 340px; background: #0d0f14; border-radius: 24px; padding: 36px 28px 28px; overflow: hidden; box-shadow: 0 24px 48px rgba(0,0,0,0.2); }
        @media (min-width: 768px) { .login-card { width: 360px; } }
        .glow-blob { position: absolute; filter: blur(45px); border-radius: 50%; opacity: 0.6; animation: pulseGlow 4s infinite alternate; }
        .blob-1 { top: -30px; right: -30px; width: 170px; height: 170px; background: var(--blob-1-color); opacity: 0.72; }
        .blob-2 { bottom: -50px; left: -50px; width: 210px; height: 210px; background: var(--blob-2-color); opacity: 0.58; animation-delay: -2s; }
        @keyframes pulseGlow { 0% { transform: scale(0.9); opacity: 0.5; } 100% { transform: scale(1.1); opacity: 0.75; } }
        .dark-overlay { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(5,5,8,0.85) 30%, transparent 100%); pointer-events: none; }
        .view-container { position: relative; z-index: 10; }
        .header { margin-bottom: 28px; text-align: center; }
        .decorative-dot { width: 2.2em; height: 2.2em; margin: 0 auto 1em; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); display: flex; justify-content: center; align-items: center; }
        .decorative-dot::after { content: ""; width: 1.1em; height: 1.1em; background-image: radial-gradient(circle at center, #fff 40%, transparent 50%); background-size: 3.5px 3.5px; }
        .title { color: #fff; font-size: 22px; font-weight: 600; margin-bottom: 6px; }
        .subtitle { color: rgba(255,255,255,0.6); font-size: 13px; }
        .input-field { width: 100%; padding: 1.05em 1.2em; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.10); border-radius: 12px; color: #fff; font-size: 14px; outline: none; transition: all 0.3s; margin-bottom: 14px; }
        .input-field:focus { border-color: rgba(232,255,134,0.5); box-shadow: 0 0 20px rgba(37,211,102,0.2); }
        .input-field::placeholder { color: rgba(255,255,255,0.4); }
        .btn-submit { width: 100%; padding: 1em; background: #fff; color: #0d0f14; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s; margin-top: 8px; border: 1px solid rgba(255,255,255,0.2); }
        .btn-submit:hover { background: #E8FF86; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(232,255,134,0.35); }
        .msg { margin-top: 14px; text-align: center; font-size: 12px; min-height: 18px; }
        .msg.success { color: #E8FF86; }
        .msg.error { color: #ff6b6b; }
        .trust-row { margin-top: 18px; display: flex; align-items: center; justify-content: center; gap: 6px; color: rgba(255,255,255,0.4); font-size: 11px; }
        .trust-dot { width: 6px; height: 6px; border-radius: 50%; background: #25D366; box-shadow: 0 0 8px rgba(37,211,102,0.6); }
      `}</style>

      <div className="top-bar">
        <Link href="/" className="logo-link">
          <div className="logo-mark">D</div>
          <div className="logo-text">DukaanWhats.pk</div>
        </Link>
      </div>

      <div className="stage">
        <div className="login-wrapper">
          <div className="login-card">
            <div className="glow-blob blob-1" />
            <div className="glow-blob blob-2" />
            <div className="dark-overlay" />
            <div className="view-container">
              <div className="header">
                <div className="decorative-dot" />
                <h1 className="title">{checking ? 'Verifying link...' : valid ? 'Set new password' : 'Link invalid'}</h1>
                <p className="subtitle">{checking ? 'Please wait' : valid ? 'Choose a strong password' : 'Request a new link'}</p>
              </div>
              {checking ? (
                <div style={{textAlign:'center', color:'rgba(255,255,255,0.6)', fontSize:'13px', padding:'20px 0'}}>Checking reset link...</div>
              ) : valid ? (
                <form onSubmit={handleReset}>
                  <input className="input-field" type="password" placeholder="New password" value={password} onChange={e=>setPassword(e.target.value)} required />
                  <input className="input-field" type="password" placeholder="Confirm password" value={confirm} onChange={e=>setConfirm(e.target.value)} required />
                  <button type="submit" className="btn-submit" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
                  <div className={`msg ${msg.includes('updated') ? 'success' : msg ? 'error' : ''}`}>{msg}</div>
                  <div className="trust-row"><span className="trust-dot" /> Secured • 256-bit encrypted</div>
                </form>
              ) : (
                <>
                  <div className="msg error">{msg}</div>
                  <div style={{textAlign:'center', marginTop:'20px'}}>
                    <Link href="/login" style={{color:'#E8FF86', fontSize:'13px', textDecoration:'none'}}>Go to Login →</Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
