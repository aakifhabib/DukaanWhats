'use client'
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function LandingPage() {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session))
    const t = setTimeout(() => setShowTooltip(false), 4500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  const handleCreate = () => {
    window.location.href = loggedIn ? '/dashboard' : '/login'
  };

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-[#0A0A0A] selection:bg-[#E8FF86] selection:text-black antialiased overflow-x-clip relative w-full max-w-full"
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
        @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      `}</style>

      {toast && (
        <div className="fixed left-1/2 top-4 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-[12px] border border-black/10 bg-black px-4 py-3 text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.4)]">
          <span className="text-[13px] font-medium">{toast}</span>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-black/[0.06] w-full"
        style={{ backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', background: 'rgba(248,247,245,0.84)' }}
      >
        <div className="mx-auto flex h-[64px] max-w-[1280px] items-center justify-between px-6 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-[10px] bg-black text-[14px] font-bold tracking-tight text-white">D</div>
            <span className="text-[16px] font-semibold tracking-[-0.02em]">DukaanWhats.pk</span>
            <span className="hidden md:inline-flex ml-3 rounded-[8px] bg-[#E8FF86] px-2 py-[2px] text-[11px] font-medium tracking-wide">LIVE</span>
          </Link>
          <nav className="flex items-center gap-2">

      {/* Variant 1 - Dark Pill + Lime Arrow - Header */}
      <Link href="/pricing" className="group relative hidden md:inline-flex items-center gap-[10px] rounded-full bg-[#0A0A0A] pl-[18px] pr-[6px] py-[6px] text-[13px] font-[550] tracking-[-0.01em] text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" style={{boxShadow:'inset 0 1px 0 rgba(255,255,255,0.08)'}}>
        <span className="absolute inset-[2px] rounded-full bg-[#E8FF86] origin-left scale-x-[0.08] scale-y-[0.36] group-hover:scale-100 transition-transform duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)]" />
        <span className="relative z-10 flex items-center gap-[10px]">
          <span className="h-[8px] w-[8px] rounded-full bg-[#E8FF86] group-hover:bg-[#0A0A0A] transition-colors" />
          <span className="pr-1 group-hover:text-[#0A0A0A] transition-colors">Pricing</span>
        </span>
        <span className="relative z-10 grid h-[28px] w-[28px] place-items-center rounded-full bg-white/[0.08] group-hover:bg-[#0A0A0A] transition-colors">
          <span className="text-[12px] transition-all group-hover:rotate-45 group-hover:text-[#E8FF86]">↗</span>
        </span>
      </Link>

            <Link href="/s/premiumstore" className="hidden md:inline-flex h-10 items-center rounded-[10px] border border-black/10 bg-white px-5 text-[13px] font-medium hover:bg-black hover:text-white">View Demo</Link>
            <button onClick={handleCreate} className="inline-flex h-10 items-center justify-center rounded-[10px] bg-black px-5 text-[13px] font-medium text-white hover:scale-[1.02] active:scale-[0.98]">{loggedIn ? 'Go to Dashboard' : 'Create Store'}</button>
          </nav>
        </div>
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
              No app downloads. No commission. Just paste your products, get a link, and take orders directly on WhatsApp.
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


            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full bg-zinc-200 border-2 border-white" />
                <div className="h-8 w-8 rounded-full bg-zinc-300 border-2 border-white" />
                <div className="h-8 w-8 rounded-full bg-zinc-900 border-2 border-white grid place-items-center text-white text-[11px]">A</div>
              </div>
              <div className="text-[13px] leading-[1.2]">
                <div className="font-medium">Trusted by 1,200+ stores</div>
                <div className="text-zinc-500">Karachi • Lahore • Islamabad</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative mx-auto max-w-[440px] rounded-[28px] border border-black/10 bg-white p-2.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.3)] md:mr-0">
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
                    <div className="rounded-[14px] border bg-white p-2">
                      <div className="h-[84px] rounded-[10px] bg-gradient-to-br from-zinc-100 to-zinc-200" />
                      <div className="mt-2 text-[12px] font-medium">Lawn Suit</div>
                      <div className="text-[12px] font-bold">Rs. 2,500</div>
                    </div>
                    <div className="rounded-[14px] border bg-white p-2">
                      <div className="h-[84px] rounded-[10px] bg-gradient-to-br from-zinc-100 to-zinc-200" />
                      <div className="mt-2 text-[12px] font-medium">Kurta Set</div>
                      <div className="text-[12px] font-bold">Rs. 3,200</div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 h-9 rounded-[10px] bg-black text-white text-[12px] font-medium">Add to Cart</button>
                    <button className="h-9 w-9 grid place-items-center rounded-[10px] border bg-white">♥</button>
                  </div>
                </div>
              </div>

              {showTooltip && (
                <div className="absolute -right-4 -top-4 z-20 flex items-center gap-2 rounded-[12px] border bg-black px-3 py-2 text-white shadow-xl animate-[float_3s_ease_infinite]">
                  <span className="grid h-6 w-6 place-items-center rounded-[8px] bg-white text-black text-[12px]">🔗</span>
                  <span className="text-[12px] font-medium">Link copied!</span>
                </div>
              )}
            </div>

            <div className="absolute -bottom-6 -left-6 hidden md:flex items-center gap-2 rounded-[12px] border bg-white px-3 py-2 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[12px] font-medium">Aleena just sold 3 suits • Rs. 8,400</span>
            </div>
          </div>
        </section>

        <div className="relative overflow-hidden rounded-[16px] border bg-white py-3">
          <div className="flex animate-[marquee_22s_linear_infinite] gap-8 whitespace-nowrap">
            {['/s/ayesha-boutique','/s/lahore-fabrics','/s/karachi-shoes','/s/islamabad-decor','/s/premiumstore','/s/noor-collection','/s/ayesha-boutique','/s/lahore-fabrics'].map((s,i)=>(
              <span key={i} className="text-[13px] font-mono text-zinc-500">{s}</span>
            ))}
          </div>
        </div>

        <section className="mt-16 grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border bg-white p-6">
            <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#E8FF86]">🖼️</div>
            <h3 className="mt-4 text-[16px] font-semibold">Multi-Photo Galleries</h3>
            <p className="mt-2 text-[13px] leading-[1.5] text-zinc-600">Upload 5 photos per product. Customers swipe, tap thumbnails. Like Daraz, but instant.</p>
          </div>
          <div className="rounded-[20px] border bg-white p-6">
            <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-zinc-900 text-white">💬</div>
            <h3 className="mt-4 text-[16px] font-semibold">No Popup Block</h3>
            <p className="mt-2 text-[13px] leading-[1.5] text-zinc-600">We use window.location.href to WhatsApp — works on every phone. Zero blocked popups.</p>
          </div>
          <div className="rounded-[20px] border bg-black text-white p-6">
            <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-white/10">⚡</div>
            <h3 className="mt-4 text-[16px] font-semibold">Copy Link in 1 Tap</h3>
            <p className="mt-2 text-[13px] leading-[1.5] text-zinc-400">Share in WhatsApp Status, Instagram bio, Facebook. Link never expires.</p>
          </div>
        </section>

        <section id="final" className="mt-16 pb-10">
          <div className="relative overflow-hidden rounded-[32px] bg-black px-6 py-14 md:px-12 md:py-20 text-white">
            <div className="pointer-events-none absolute right-0 -top-10 h-[360px] w-[360px] rounded-full bg-[#E8FF86] opacity-90" style={{ clipPath: 'ellipse(60% 50% at 60% 40%)' }} />
            <div className="relative z-10 grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-[10px] bg-white/10 px-3 py-1.5 text-[12px] font-medium backdrop-blur">● 1,200+ stores live • Free forever for first 50 products</div>
                <h2 className="mt-6 max-w-[560px] text-[38px] font-bold leading-[0.9] tracking-[-0.04em] md:text-[64px]">Ready to sell<br/>on WhatsApp?</h2>
                <p className="mt-4 max-w-[420px] text-[16px] leading-[1.5] text-zinc-300">Create your store in 30 seconds. No app, no fees, no excuses. Your customers are already on WhatsApp.</p>
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
                <div className="mt-1 flex items-center justify-center gap-2 text-[12px] text-zinc-400 md:justify-end">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" /> Takes 30 seconds • No card required
                </div>
              </div>

            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-4 border-t border-black/10 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-[13px]">
            <div className="grid h-7 w-7 place-items-center rounded-[8px] bg-black text-white text-[12px] font-bold">D</div>
            <span className="font-medium">DukaanWhats.pk</span>
            <span className="text-zinc-500">© 2025 — Made for Pakistan</span>
          </div>
          <div className="flex items-center gap-5 text-[12px] text-zinc-500">
            <span className="inline-flex items-center gap-1 rounded-[8px] bg-[#E8FF86] px-2 py-1 text-black font-medium"><span className="h-1.5 w-1.5 rounded-full bg-black" /> All systems operational</span>
          </div>
        </footer>
      </main>
    </div>
  )
}
