'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PROD_URL = 'https://dukaan-whats.vercel.app'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [storeName, setStoreName] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && mode !== 'forgot') router.push('/dashboard')
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session && mode !== 'forgot') router.push('/dashboard')
    })
    return () => subscription.unsubscribe()
  }, [router, mode])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    setSuccess(false)
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user) {
          const slug = (storeName || email.split('@')[0]).toLowerCase().trim().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
          await supabase.from('profiles').upsert({ id: data.user.id, business_name: storeName || 'My Store', store_slug: slug })
        }
        setMsg('Account created! Redirecting...')
        setTimeout(() => router.push('/dashboard'), 900)
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${PROD_URL}/reset-password`
        })
        if (error) throw error
        setSuccess(true)
        setMsg('Check your email — reset link sent! (expires in 1 hour)')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
      }
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
        .app-shell {
          min-height: 100vh;
          min-height: 100dvh;
          background-color: var(--page-bg);
          background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.08) 1px, transparent 0);
          background-size: 28px 28px;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .top-bar { position: absolute; top: 0; left: 0; right: 0; height: 72px; display: flex; align-items: center; padding: 0 24px; z-index: 20; }
        @media (min-width: 768px) { .top-bar { padding: 0 40px; height: 80px; } }
        .logo-link { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; }
        .logo-mark { width: 32px; height: 32px; background: #0d0f14; border-radius: 10px; display: grid; place-items: center; color: #E8FF86; font-weight: 800; font-size: 18px; }
        .logo-text { font-weight: 650; font-size: 15px; letter-spacing: -0.4px; color: #0d0f14; }
        .logo-text span { font-weight: 400; color: #6b7280; }
        .stage { flex: 1; display: flex; align-items: center; justify-content: center; padding: 88px 16px 40px; }
        .login-wrapper, .login-wrapper * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        .login-wrapper {
          --blob-1-color: #E8FF86;
          --blob-2-color: #25D366;
          --btn-hover-glow: rgba(232,255,134,0.35);
          --input-focus-glow: rgba(37,211,102,0.20);
          position: relative;
          animation: floatUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0; transform: translateY(30px);
        }
        @keyframes floatUp { to { opacity: 1; transform: translateY(0); } }
        .login-card {
          position: relative; width: 340px; background-color: #0d0f14; border-radius: 24px;
          padding: 36px 28px 28px; overflow: hidden;
          box-shadow: 0 24px 48px rgba(0,0,0,0.20), 0 8px 16px rgba(0,0,0,0.10), inset 0 0 0 1px rgba(255,255,255,0.06);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s;
        }
        @media (max-width: 390px) { .login-card { width: 92vw; } }
        @media (min-width: 768px) { .login-card { width: 360px; } }
        .login-wrapper:hover .login-card { transform: translateY(-6px); box-shadow: 0 32px 64px rgba(0,0,0,0.30), 0 12px 24px rgba(0,0,0,0.15); }
        .glow-blob { position: absolute; filter: blur(45px); border-radius: 50%; z-index: 0; opacity: 0.6; animation: pulseGlow 4s infinite alternate ease-in-out; }
        .login-wrapper:hover .glow-blob { opacity: 0.82; filter: blur(40px); }
        .blob-1 { top: -30px; right: -30px; width: 170px; height: 170px; background: var(--blob-1-color); opacity: 0.72; }
        .blob-2 { bottom: -50px; left: -50px; width: 210px; height: 210px; background: var(--blob-2-color); animation-delay: -2s; opacity: 0.58; }
        @keyframes pulseGlow { 0% { transform: scale(0.9); opacity: 0.5; } 100% { transform: scale(1.1); opacity: 0.75; } }
        .dark-overlay { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(5,5,8,0.85) 30%, transparent 100%); z-index: 1; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05); border-radius: inherit; pointer-events: none; }
        .view-container { position: relative; z-index: 10; }
        .form-view { display: flex; flex-direction: column; animation: fadeInView 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeInView { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .header { margin-bottom: 28px; text-align: center; }
        .decorative-dot { width: 2.2em; height: 2.2em; margin: 0 auto 1em auto; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); display: flex; justify-content: center; align-items: center; }
        .decorative-dot::after { content: ""; width: 1.1em; height: 1.1em; background-image: radial-gradient(circle at center, #ffffff 40%, transparent 50%); background-size: 3.5px 3.5px; }
        .title { color: #ffffff; font-size: 22px; font-weight: 600; letter-spacing: -0.5px; margin-bottom: 6px; }
        .subtitle { color: rgba(255,255,255,0.6); font-size: 13px; }
        .input-group { margin-bottom: 14px; position: relative; }
        .input-field {
          width: 100%; padding: 1.05em 1.2em; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10); border-radius: 12px; color: #ffffff;
          font-size: 14px; outline: none; transition: all 0.3s; backdrop-filter: blur(10px);
        }
        .input-field::placeholder { color: rgba(255,255,255,0.4); }
        .input-field:focus { background: rgba(255,255,255,0.07); border-color: rgba(232,255,134,0.5); box-shadow: 0 0 20px var(--input-focus-glow); transform: translateY(-1px); }
        .forgot-link {
          display: block; text-align: right; color: rgba(255,255,255,0.55); font-size: 12px;
          margin-top: -4px; margin-bottom: 18px; cursor: pointer; transition: color 0.2s;
        }
        .forgot-link:hover { color: #E8FF86; text-decoration: underline; text-underline-offset: 3px; }
        .btn-submit {
          width: 100%; padding: 1em; background: #ffffff; color: #0d0f14;
          border: 1px solid rgba(255,255,255,0.2); border-radius: 12px;
          font-size: 14.5px; font-weight: 600; cursor: pointer;
          transition: all 0.3s; margin-top: 8px;
        }
        .btn-submit:hover { background: #E8FF86; transform: translateY(-2px); box-shadow: 0 8px 20px var(--btn-hover-glow); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .signup-prompt { margin-top: 20px; text-align: center; color: rgba(255,255,255,0.5); font-size: 13px; }
        .toggle-link {
          position: relative; color: #ffffff; font-weight: 600; margin-left: 6px; cursor: pointer;
          display: inline-block; transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .toggle-link::after {
          content: ""; position: absolute; left: 50%; bottom: -2px; width: 0; height: 1.5px;
          background: #E8FF86; transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1); transform: translateX(-50%);
        }
        .toggle-link:hover { color: #E8FF86; transform: translateY(-1.5px); }
        .toggle-link:hover::after { width: 100%; }
        .trust-row { margin-top: 18px; display: flex; align-items: center; justify-content: center; gap: 6px; color: rgba(255,255,255,0.4); font-size: 11px; }
        .trust-dot { width: 6px; height: 6px; border-radius: 50%; background: #25D366; box-shadow: 0 0 8px rgba(37,211,102,0.6); animation: pulseDot 2s infinite; }
        @keyframes pulseDot { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .msg { margin-top: 14px; text-align: center; font-size: 12px; min-height: 18px; line-height: 1.4; }
        .msg.error { color: #ff6b6b; }
        .msg.success { color: #E8FF86; }
      `}</style>

      <div className="top-bar">
        <Link href="/" className="logo-link" aria-label="DukaanWhats.pk Home">
          <div className="logo-mark">D</div>
          <div className="logo-text">DukaanWhats<span>.pk</span></div>
        </Link>
      </div>

      <div className="stage">
        <div className="login-wrapper">
          <div className="login-card">
            <div className="glow-blob blob-1" />
            <div className="glow-blob blob-2" />
            <div className="dark-overlay" />

            <div className="view-container">
              <div className="form-view" key={mode}>
                <div className="header">
                  <div className="decorative-dot" />
                  <h1 className="title">
                    {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your store' : 'Reset password'}
                  </h1>
                  <p className="subtitle">
                    {mode === 'login' ? 'Login to DukaanWhats.pk' : mode === 'signup' ? 'Start selling on WhatsApp today' : 'Enter email to get reset link'}
                  </p>
                </div>

                <form onSubmit={handleAuth}>
                  {mode === 'signup' && (
                    <div className="input-group">
                      <input className="input-field" type="text" placeholder="Store name" value={storeName} onChange={e=>setStoreName(e.target.value)} required />
                    </div>
                  )}
                  <div className="input-group">
                    <input className="input-field" type="email" placeholder="Email address" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" />
                  </div>
                  {mode !== 'forgot' && (
                    <div className="input-group">
                      <input className="input-field" type="password" placeholder={mode === 'signup' ? 'Create password' : 'Password'} value={password} onChange={e=>setPassword(e.target.value)} required autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
                    </div>
                  )}

                  {mode === 'login' && (
                    <span className="forgot-link" onClick={()=>{ setMode('forgot'); setMsg(''); setSuccess(false) }}>Forgot password?</span>
                  )}

                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : mode === 'signup' ? 'Create Store' : 'Send Reset Link'}
                  </button>

                  <p className="signup-prompt">
                    {mode === 'login' ? "Don't have account?" : mode === 'signup' ? 'Already have store?' : 'Remember password?'}
                    <span className="toggle-link" onClick={()=>{
                      if (mode === 'forgot') setMode('login')
                      else setMode(mode === 'login' ? 'signup' : 'login')
                      setMsg(''); setSuccess(false)
                    }}>
                      {mode === 'login' ? 'Create Store' : mode === 'signup' ? 'Login' : 'Back to Login'}
                    </span>
                  </p>

                  <div className="trust-row">
                    <span className="trust-dot" />
                    {success ? 'Check inbox • Link expires in 1 hour' : mode === 'forgot' ? 'Link expires in 1 hour • Check spam too' : mode === 'signup' ? 'No credit card • Free 14-day trial' : 'Secured via WhatsApp • 256-bit encrypted'}
                  </div>
                  <div className={`msg ${success ? 'success' : msg ? 'error' : ''}`}>{msg}</div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
