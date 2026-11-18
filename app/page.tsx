'use client'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { TiltSurface } from '@/components/TiltSurface'

export default function LandingPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true
    supabase.auth.getSession()
      .then(({ data }) => { if (active) setLoggedIn(!!data.session) })
      .catch(() => { if (active) setLoggedIn(false) })
      .finally(() => { if (active) setAuthReady(true) })
    return () => { active = false }
  }, []);

  const handleCreate = () => {
    if (!authReady) return
    setMenuOpen(false)
    window.location.href = loggedIn ? '/dashboard' : '/login'
  };

  return (
    <div data-app-page className="min-h-screen bg-[#F8F7F5] text-[#0A0A0A] selection:bg-[#E8FF86] selection:text-black antialiased overflow-x-clip relative w-full max-w-full"
      style={{ fontFamily: `'Instrument Sans', system-ui, -apple-system, sans-serif` }}
    >
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.55] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"), radial-gradient(1200px 600px at 10% -10%, rgba(232,255,134,0.18), transparent 60%), radial-gradient(900px 500px at 90% 10%, rgba(0,0,0,0.06), transparent 60%)`,
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`, backgroundSize: '28px 28px' }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Fragment+Mono&display=swap');
        @keyframes fadeUp { from { opacity:0; transform: translateY(14px); } to { opacity:1; transform: translateY(0); } }
      `}</style>

      <header className="sticky top-0 z-40 border-b border-black/[0.06] w-full"
        style={{ backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', background: 'rgba(248,247,245,0.84)' }}
      >
        <div className="mx-auto flex h-[64px] max-w-[1280px] items-center justify-between px-6 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-[10px] bg-black text-[14px] font-bold tracking-tight text-white">D</div>
            <span className="text-[16px] font-semibold tracking-[-0.02em]">DukaanWhats.pk</span>
            <span className="hidden md:inline-flex ml-3 rounded-[8px] bg-[#E8FF86] px-2 py-[2px] text-[11px] font-medium tracking-wide">LIVE</span>
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-2 md:gap-3">
            <Link href="#how-it-works" className="hidden lg:inline-flex h-10 items-center px-3 text-[13px] font-medium text-zinc-600 transition hover:text-black">How it works</Link>
            <Link href="/pricing" className="group relative hidden md:inline-flex items-center gap-[10px] rounded-full bg-[#0A0A0A] pl-[18px] pr-[6px] py-[6px] text-[13px] font-[550] tracking-[-0.01em] text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }}>
              <span className="absolute inset-[2px] rounded-full bg-[#E8FF86] origin-left scale-x-[0.08] scale-y-[0.36] transition-transform duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100" />
              <span className="relative z-10 flex items-center gap-[10px]"><span className="h-[8px] w-[8px] rounded-full bg-[#E8FF86] transition-colors group-hover:bg-[#0A0A0A]" /><span className="pr-1 transition-colors group-hover:text-[#0A0A0A]">Pricing</span></span>
              <span className="relative z-10 grid h-[28px] w-[28px] place-items-center rounded-full bg-white/[0.08] transition-colors group-hover:bg-[#0A0A0A]"><span className="text-[12px] transition-all group-hover:rotate-45 group-hover:text-[#E8FF86]">↗</span></span>
            </Link>
            <Link href="/s/premiumstore" className="hidden md:inline-flex h-10 items-center rounded-[10px] border border-black/10 bg-white px-5 text-[13px] font-medium hover:bg-black hover:text-white">View Demo</Link>
            <button type="button" onClick={handleCreate} disabled={!authReady} className="hidden h-10 items-center justify-center rounded-[10px] bg-black px-5 text-[13px] font-medium text-white transition hover:scale-[1.02] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 md:inline-flex">{authReady ? loggedIn ? 'Go to Dashboard' : 'Create Store' : 'Loading…'}</button>
            <button type="button" onClick={() => setMenuOpen(open => !open)} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation" className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-black/10 bg-white text-lg md:hidden">
              <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
            </button>
          </nav>
        </div>
        {menuOpen && (
          <nav id="mobile-navigation" aria-label="Mobile navigation" className="absolute inset-x-0 top-full border-b border-black/10 bg-[#F8F7F5] p-4 shadow-[0_18px_35px_-24px_rgba(0,0,0,0.4)] md:hidden">
            <div className="mx-auto grid max-w-[1280px] gap-1">
              <Link href="#how-it-works" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-black/5">How it works</Link>
              <Link href="#features" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-black/5">Features</Link>
              <Link href="/pricing" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-black/5">Pricing and plans</Link>
              <Link href="/s/premiumstore" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-black/5">View demo store</Link>
              <Link href="/about" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-black/5">About DukaanWhats</Link>
              <button type="button" onClick={handleCreate} disabled={!authReady} className="mt-2 flex h-12 items-center justify-center rounded-xl bg-black px-4 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">{authReady ? loggedIn ? 'Open dashboard' : 'Create your free store' : 'Checking account…'}</button>
            </div>
          </nav>
        )}
      </header>

      <main className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-8 w-full">
        <section className="grid gap-10 py-14 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-24">
          <div className="flex flex-col">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-[12.5px] font-medium shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-[#E8FF86] text-[10px]">✦</span>
              NEW: Multi-photo galleries
              <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            </div>

            <h1 className="mt-7 max-w-[560px] text-[40px] font-bold leading-[0.92] tracking-[-0.04em] md:text-[64px]">
              Your WhatsApp store,
              <span className="block text-zinc-400 font-[600]">live in 30 seconds.</span>
            </h1>

            <p className="mt-5 max-w-[440px] text-[18px] leading-[1.5] tracking-[-0.01em] text-zinc-600">
              Create your store, share one link, and receive orders directly on WhatsApp. No coding or commission.
            </p>


            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button onClick={handleCreate} className="group inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-black px-7 text-[15px] font-medium text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)] transition hover:scale-[1.01] active:scale-[0.99]">
                {loggedIn ? 'Open Dashboard' : 'Create Store — Free'}
                <span className="grid h-6 w-6 place-items-center rounded-[8px] bg-white/15 text-white">→</span>
              </button>
              <Link href="/pricing" className="group inline-flex h-[48px] items-center gap-3 rounded-full bg-[#E8FF86] pl-2 pr-7 text-[14px] font-[600] tracking-[-0.01em] text-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_8px_20px_-8px_rgba(232,255,134,0.6)]">
                <span className="grid h-[36px] w-[36px] place-items-center rounded-full bg-black text-[#E8FF86] text-[14px] transition-transform group-hover:rotate-[-12deg]">○</span>
                <span className="flex items-center gap-1.5">Pricing <span className="transition-transform group-hover:translate-x-0.5">↗</span></span>
              </Link>
            </div>


          </div>

          <div className="relative">
            <div aria-hidden="true" className="dw-float pointer-events-none absolute -right-2 top-12 z-0 h-24 w-24 rounded-full bg-[#E8FF86]/35 blur-2xl md:-right-8 md:top-20 md:h-36 md:w-36" />
            <TiltSurface className="mx-auto w-full max-w-[440px] md:mr-0" maxTilt={5}>
            <div className="relative rounded-[28px] border border-black/10 bg-white p-2.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.3)]">
              <div className="rounded-[20px] border border-black/10 bg-[#F8F7F5] p-2">
                <div className="flex items-center gap-1.5 px-3 py-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="h-2.5 w-2.5 rounded-full bg-yellow-400" /><span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  <span className="ml-3 text-[11px] font-mono text-zinc-500">dukaanwhats.pk/s/premiumstore</span>
                  <span className="ml-auto rounded-[8px] bg-black px-2 py-1 text-[10px] font-medium text-white">LIVE</span>
                </div>
                <div className="mt-1 rounded-[16px] bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[15px] font-semibold">Ayesha Boutique</div>
                    <div className="rounded-full bg-[#E8FF86] px-2 py-1 text-[10px] font-medium">● Online</div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="group rounded-[14px] border border-zinc-200/80 bg-white p-2 transition hover:-translate-y-1 hover:shadow-lg">
                      <div className="h-[112px] overflow-hidden rounded-[10px] bg-zinc-100"><img src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=640&q=80" alt="Lawn suit on a model" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div>
                      <div className="mt-2 flex items-start justify-between gap-2"><div><div className="text-[12px] font-medium">Lawn Suit</div><div className="text-[12px] font-bold">Rs. 2,500</div></div><span className="mt-0.5 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-medium text-zinc-500">NEW</span></div>
                    </div>
                    <div className="group rounded-[14px] border border-zinc-200/80 bg-white p-2 transition hover:-translate-y-1 hover:shadow-lg">
                      <div className="h-[112px] overflow-hidden rounded-[10px] bg-zinc-100"><img src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=640&q=80" alt="Folded cotton clothing" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div>
                      <div className="mt-2 flex items-start justify-between gap-2"><div><div className="text-[12px] font-medium">Kurta Set</div><div className="text-[12px] font-bold">Rs. 3,200</div></div><span className="mt-0.5 rounded-full bg-[#E8FF86] px-1.5 py-0.5 text-[9px] font-medium">POPULAR</span></div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <div className="flex-1 h-9 rounded-[10px] bg-black text-white text-[12px] font-medium grid place-items-center">Add to bag</div>
                    <div className="h-9 w-9 grid place-items-center rounded-[10px] border bg-white" aria-hidden="true">♥</div>
                  </div>
                </div>
              </div>
            </div>
            </TiltSurface>
          </div>
        </section>

        <section aria-label="Store benefits" className="mt-4 grid grid-cols-2 overflow-hidden rounded-[20px] border border-black/[0.06] bg-white sm:grid-cols-4">
          {[
            { value: 'Start free', label: 'No setup fee' },
            { value: 'No code', label: 'Easy to manage' },
            { value: 'Direct orders', label: 'Through WhatsApp' },
            { value: 'No commission', label: 'Keep your sales' },
          ].map((item, index) => (
            <div key={item.value} className={`px-4 py-4 text-center ${index % 2 === 0 ? 'border-r' : ''} ${index < 2 ? 'border-b sm:border-b-0' : ''} sm:border-r last:border-r-0`}>
              <div className="text-[13px] font-bold tracking-[-0.02em]">{item.value}</div>
              <div className="mt-0.5 text-[11px] text-zinc-500">{item.label}</div>
            </div>
          ))}
        </section>

        <section id="how-it-works" className="mt-16 md:mt-24">
          <div className="max-w-2xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">How it works</div>
            <h2 className="mt-3 text-[32px] font-bold leading-[0.98] tracking-[-0.045em] md:text-[48px]">From product to first order.</h2>
            <p className="mt-3 max-w-xl text-[15px] leading-6 text-zinc-600">A simple storefront that fits the way you already sell.</p>
          </div>
          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {[
              { n: '01', title: 'Add your products', body: 'Upload photos, set prices, and organize your catalog in minutes.' },
              { n: '02', title: 'Share one link', body: 'Your storefront is ready to share in chats, stories, and your bio.' },
              { n: '03', title: 'Chat and confirm', body: 'Customers browse your catalog, then reach you directly on WhatsApp.' },
            ].map((step, index) => (
              <TiltSurface key={step.n} className="rounded-[22px]" maxTilt={6}>
                <article className={`group relative h-full overflow-hidden rounded-[22px] border border-black/[0.07] p-6 md:p-7 transition duration-300 hover:shadow-[0_22px_48px_-28px_rgba(0,0,0,0.28)] ${index === 1 ? 'bg-[#E8FF86]' : 'bg-white'}`}>
                  <div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-full bg-black text-[11px] font-mono font-semibold text-[#E8FF86]">{step.n}</span><span className="text-2xl transition-transform group-hover:translate-x-1">↗</span></div>
                  <h3 className="mt-8 text-[18px] font-bold tracking-[-0.03em]">{step.title}</h3>
                  <p className="mt-2 text-[13px] leading-5 text-zinc-600">{step.body}</p>
                </article>
              </TiltSurface>
            ))}
          </div>
        </section>

        <section id="features" className="mt-16 md:mt-24">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div><div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Made for small shops</div><h2 className="mt-2 text-[28px] font-bold tracking-[-0.04em] md:text-[38px]">A storefront that does the busywork.</h2></div>
            <Link href="/pricing" className="text-[13px] font-semibold underline underline-offset-4 decoration-zinc-300 hover:decoration-black">Compare plans ↗</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border bg-white p-6">
            <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#E8FF86]">🖼️</div>
            <h3 className="mt-4 text-[16px] font-semibold">Multi-Photo Galleries</h3>
            <p className="mt-2 text-[13px] leading-[1.5] text-zinc-600">Show products from every angle with multiple photos.</p>
          </div>
          <div className="rounded-[20px] border bg-white p-6">
            <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-zinc-900 text-white">💬</div>
            <h3 className="mt-4 text-[16px] font-semibold">WhatsApp orders</h3>
            <p className="mt-2 text-[13px] leading-[1.5] text-zinc-600">Customers contact you directly to place their orders.</p>
          </div>
          <div className="rounded-[20px] border bg-black text-white p-6">
            <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-white/10">⚡</div>
            <h3 className="mt-4 text-[16px] font-semibold">Copy Link in 1 Tap</h3>
            <p className="mt-2 text-[13px] leading-[1.5] text-zinc-400">Share your store link on social media or in chat.</p>
          </div>
          </div>
        </section>

        <section id="final" className="mt-16 pb-10">
          <div className="relative overflow-hidden rounded-[32px] bg-black px-6 py-14 md:px-12 md:py-20 text-white">
            <div className="pointer-events-none absolute right-0 -top-10 h-[360px] w-[360px] rounded-full bg-[#E8FF86] opacity-90" style={{ clipPath: 'ellipse(60% 50% at 60% 40%)' }} />
            <div className="relative z-10 grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-end">
              <div>
                <h2 className="max-w-[560px] text-[38px] font-bold leading-[0.9] tracking-[-0.04em] md:text-[64px]">Ready to sell<br/>on WhatsApp?</h2>
                <p className="mt-4 max-w-[420px] text-[16px] leading-[1.5] text-zinc-300">Create your store and start sharing your products with customers.</p>
              </div>

              <div className="md:text-right flex flex-col items-end gap-3">
                <div className="flex flex-wrap gap-3">
                  <Link href="/pricing" className="group inline-flex h-[56px] items-center gap-3 rounded-full bg-[#E8FF86] pl-2 pr-8 text-[15px] font-[700] tracking-[-0.01em] text-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_14px_30px_-10px_rgba(232,255,134,0.8)]">
                    <span className="grid h-[44px] w-[44px] place-items-center rounded-full bg-black text-[#E8FF86] text-[18px] transition-transform group-hover:rotate-[-12deg] group-hover:scale-110">●</span>
                    <span className="flex items-center gap-2">See Pricing <span className="grid h-6 w-6 place-items-center rounded-full bg-black/10 text-[12px] transition-transform group-hover:translate-x-0.5 group-hover:rotate-45">↗</span></span>
                  </Link>
                  <button onClick={handleCreate} className="group inline-flex h-[56px] items-center justify-center gap-2 rounded-[12px] bg-white px-8 text-[16px] font-semibold text-black shadow-[0_10px_30px_-10px_rgba(255,255,255,0.4)] transition hover:scale-[1.02] active:scale-[0.98]">
                    {loggedIn ? 'Open Dashboard' : 'Create Store — Free'}
                    <span className="grid h-6 w-6 place-items-center rounded-[8px] bg-black text-white">→</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-4 border-t border-black/10 py-7 text-[12px] text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-zinc-900"><span className="grid h-7 w-7 place-items-center rounded-lg bg-black text-[11px] font-bold text-white">D</span><span className="font-semibold">DukaanWhats.pk</span><span className="text-zinc-400">· Made for the way you sell.</span></div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/pricing" className="hover:text-black">Pricing</Link>
            <Link href="/about" className="hover:text-black">About</Link>
            <Link href="/terms" className="hover:text-black">Terms</Link>
            <Link href="/privacy" className="hover:text-black">Privacy</Link>
          </nav>
        </footer>
      </main>
    </div>
  )
}
