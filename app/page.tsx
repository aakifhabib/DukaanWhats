import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'DukaanWhats — A simple online store for WhatsApp sellers',
  description: 'Create a mobile-friendly storefront, share one link, and let customers order from your business on WhatsApp. Start free with DukaanWhats.',
  openGraph: {
    title: 'DukaanWhats — A simple online store for WhatsApp sellers',
    description: 'Create a storefront, share your products, and talk to customers on WhatsApp.',
    type: 'website',
    url: 'https://dukaanwhats.pk',
  },
}

const steps = [
  { number: '01', title: 'Set up your store', text: 'Add your business name, WhatsApp number, and a link customers can remember.' },
  { number: '02', title: 'Add your products', text: 'Upload product photos, set prices, and organize the details customers need.' },
  { number: '03', title: 'Share and chat', text: 'Post your store link. Customers browse, then contact you through WhatsApp.' },
]

const features = [
  { number: '01', title: 'A storefront that is yours', text: 'Give your products a clear, mobile-friendly home that is easy to share anywhere.' },
  { number: '02', title: 'Made for WhatsApp selling', text: 'Keep the customer conversation direct. You stay in control of your orders and replies.' },
  { number: '03', title: 'Room to grow', text: 'Choose a theme, organize product options, and move to a larger plan when you need it.' },
]

export default function LandingPage() {
  return (
    <div data-app-page className="min-h-screen overflow-hidden bg-[#f7f8f4] text-zinc-900 selection:bg-[#E8FF86] selection:text-zinc-900">
      <header className="relative z-20 border-b border-[#17221d]/[0.08] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="DukaanWhats home" className="flex items-center gap-3 rounded-sm">
            <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#17221d] text-lg font-bold text-[#d7f36b]">D</span>
            <span className="hidden text-[17px] font-bold tracking-[-0.04em] min-[360px]:inline">DukaanWhats</span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
            <Link href="#how-it-works" className="text-sm font-medium text-[#5f6b64] transition hover:text-zinc-900">How it works</Link>
            <Link href="#features" className="text-sm font-medium text-[#5f6b64] transition hover:text-zinc-900">Features</Link>
            <Link href="/pricing" className="text-sm font-medium text-[#5f6b64] transition hover:text-zinc-900">Pricing</Link>
            <Link href="/s/premiumstore" className="text-sm font-medium text-[#5f6b64] transition hover:text-zinc-900">Demo store</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="hidden min-h-11 items-center rounded-full px-4 text-sm font-semibold text-zinc-600 transition hover:bg-black/[0.05] sm:inline-flex">Sign in</Link>
            <details className="group relative md:hidden">
              <summary aria-label="Open navigation menu" className="flex min-h-11 cursor-pointer list-none items-center rounded-full border border-[#17221d]/10 bg-white/70 px-4 text-sm font-semibold text-zinc-700 marker:hidden focus-visible:outline-offset-4">
                <span className="min-[360px]:hidden" aria-hidden="true">☰</span><span className="hidden min-[360px]:inline">Menu</span><span aria-hidden="true" className="ml-2 hidden text-xs transition-transform group-open:rotate-180 min-[360px]:inline">⌄</span>
              </summary>
              <nav aria-label="Mobile navigation" className="absolute right-0 top-[calc(100%+0.6rem)] z-30 grid w-52 gap-1 rounded-2xl border border-[#17221d]/10 bg-white p-2 shadow-xl">
                <Link href="#how-it-works" className="rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50">How it works</Link>
                <Link href="#features" className="rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Features</Link>
                <Link href="/pricing" className="rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Pricing</Link>
                <Link href="/s/premiumstore" className="rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Demo store</Link>
              </nav>
            </details>
            <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#17221d] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#293930] focus-visible:outline-offset-4">
              <span className="hidden sm:inline">Create your store</span><span className="hidden min-[360px]:inline sm:hidden">Start free</span><span className="min-[360px]:hidden">Start</span><span aria-hidden="true" className="ml-2 text-[#d7f36b]">↗</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate">
          <div aria-hidden="true" className="pointer-events-none absolute -right-44 -top-24 -z-10 h-[520px] w-[520px] rounded-full bg-[#e7f4c6] blur-3xl sm:-right-20" />
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1fr_0.9fr] lg:gap-16 lg:pb-28 lg:pt-24">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#17221d]/10 bg-white/80 px-3.5 py-2 text-xs font-semibold text-zinc-600 shadow-sm">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#86a42c]" />
                A simpler way to sell online
              </div>
              <h1 className="mt-7 text-[clamp(42px,7vw,76px)] font-semibold leading-[0.98] tracking-[-0.065em] text-zinc-900">
                Your products.<br />
                <span className="text-zinc-600">One easy link.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8">
                Create a clean online storefront, share it with customers, and continue the conversation on WhatsApp. No code needed.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/login" className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#17221d] px-7 text-[15px] font-semibold text-white shadow-[0_12px_30px_-16px_rgba(23,34,29,.65)] transition hover:-translate-y-0.5 hover:bg-[#293930] focus-visible:outline-offset-4">
                  Start with the free plan <span aria-hidden="true" className="ml-3 text-[#d7f36b]">→</span>
                </Link>
                <Link href="/s/premiumstore" className="inline-flex min-h-14 items-center justify-center rounded-full border border-[#17221d]/15 bg-white/70 px-7 text-[15px] font-semibold text-zinc-800 transition hover:border-[#17221d]/35 hover:bg-white focus-visible:outline-offset-4">
                  Explore the demo
                </Link>
              </div>
              <p className="mt-4 text-xs leading-5 text-zinc-500">Start free · No coding · No sales commission</p>
            </div>

            <div className="relative mx-auto w-full max-w-[510px] lg:ml-auto">
              <div aria-hidden="true" className="absolute -inset-4 rounded-[36px] bg-[#e5eddb] sm:-inset-6" />
              <div className="relative rounded-[28px] border border-[#17221d]/10 bg-white p-3 shadow-[0_28px_70px_-40px_rgba(23,34,29,.45)] sm:p-4">
                <div className="flex items-center gap-2 rounded-[18px] bg-zinc-50 px-4 py-3">
                  <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#e6a39a]" />
                  <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#e3c46f]" />
                  <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#9ebc84]" />
                  <span className="ml-auto rounded-full bg-white px-3 py-1 text-[10px] font-medium text-[#768078]">Sample storefront</span>
                </div>
                <div className="px-4 pb-4 pt-5 sm:px-6 sm:pb-6 sm:pt-7">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-2xl bg-[#E8FF86] text-sm font-bold text-zinc-900">N</span>
                      <div>
                        <div className="text-sm font-bold tracking-tight text-zinc-900">Nura Studio</div>
                        <div className="mt-0.5 text-[11px] text-zinc-500">Everyday pieces, thoughtfully made</div>
                      </div>
                    </div>
                    <span className="rounded-full border border-[#17221d]/10 px-3 py-1.5 text-[10px] font-semibold text-zinc-600">STORE</span>
                  </div>

                  <div className="mt-7 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">The collection</p>
                      <h2 className="mt-1 text-2xl font-semibold tracking-[-0.05em] text-zinc-900">Made for your day.</h2>
                    </div>
                    <span className="pb-1 text-xs text-zinc-400">View all <span aria-hidden="true">↗</span></span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <article className="overflow-hidden rounded-[18px] border border-[#17221d]/[0.07] bg-white">
                      <div aria-hidden="true" className="relative grid aspect-[1.05] place-items-center overflow-hidden bg-[#e9e5dc]">
                        <span className="absolute -left-5 -top-8 h-36 w-36 rounded-full bg-[#d5a88d]/50 blur-2xl" />
                        <span className="relative grid h-28 w-20 place-items-center rounded-[42%_42%_22%_22%] bg-[#b77f63] shadow-[inset_-12px_-6px_20px_rgba(59,34,21,.15)]"><span className="absolute -top-3 h-8 w-12 rounded-full border-[6px] border-[#dfb69b]" /></span>
                        <span className="absolute bottom-3 left-3 rounded-full bg-white/80 px-2.5 py-1 text-[9px] font-semibold text-[#5c5149]">NEW ARRIVAL</span>
                      </div>
                      <div className="p-3.5">
                        <h3 className="text-xs font-semibold text-[#26332b]">Linen co-ord</h3>
                        <p className="mt-1 text-xs text-[#7d867e]">Rs. 3,200</p>
                      </div>
                    </article>
                    <article className="overflow-hidden rounded-[18px] border border-[#17221d]/[0.07] bg-white">
                      <div aria-hidden="true" className="relative grid aspect-[1.05] place-items-center overflow-hidden bg-[#e4e8dc]">
                        <span className="absolute -right-8 top-2 h-36 w-36 rounded-full bg-[#a8b48a]/50 blur-2xl" />
                        <span className="relative grid h-28 w-20 place-items-center rounded-[42%_42%_22%_22%] bg-[#77815e] shadow-[inset_-12px_-6px_20px_rgba(30,40,24,.16)]"><span className="absolute -top-3 h-8 w-12 rounded-full border-[6px] border-[#a6ae8c]" /></span>
                        <span className="absolute bottom-3 left-3 rounded-full bg-white/80 px-2.5 py-1 text-[9px] font-semibold text-[#5c6252]">BESTSELLER</span>
                      </div>
                      <div className="p-3.5">
                        <h3 className="text-xs font-semibold text-[#26332b]">Soft cotton shirt</h3>
                        <p className="mt-1 text-xs text-[#7d867e]">Rs. 2,450</p>
                      </div>
                    </article>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 rounded-[16px] bg-zinc-50 p-3.5">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Your store link</p>
                      <p className="mt-1 truncate text-xs font-medium text-[#334037]">dukaanwhats.pk/s/your-store</p>
                    </div>
                    <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-sm text-zinc-700">↗</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-[#17221d]/10 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-600 shadow-lg sm:flex">
                <span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded-full bg-[#E8FF86] text-[11px]">✓</span>
                Ready to share with customers
              </div>
            </div>
          </div>
        </section>

        <section aria-label="DukaanWhats benefits" className="border-y border-[#17221d]/[0.08] bg-white/65">
          <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[#17221d]/[0.08] px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
            <div className="flex items-center gap-3 py-5 sm:justify-center sm:py-6"><span aria-hidden="true" className="text-[#799338]">✦</span><span className="text-sm font-semibold text-zinc-700">A free plan to get started</span></div>
            <div className="flex items-center gap-3 py-5 sm:justify-center sm:py-6"><span aria-hidden="true" className="text-[#799338]">✦</span><span className="text-sm font-semibold text-zinc-700">Your customers, your conversation</span></div>
            <div className="flex items-center gap-3 py-5 sm:justify-center sm:py-6"><span aria-hidden="true" className="text-[#799338]">✦</span><span className="text-sm font-semibold text-zinc-700">No commission on your sales</span></div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-600">A short path to online</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.05em] text-zinc-900 sm:text-5xl">Everything starts with one shareable store.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-600">Keep the setup simple and the customer experience familiar.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.number} className={`rounded-[24px] border p-6 sm:p-7 ${index === 1 ? 'border-[#d4e7a5] bg-zinc-50' : 'border-[#17221d]/[0.09] bg-white'}`}>
                <p className="text-xs font-bold tracking-[0.16em] text-zinc-500">{step.number}</p>
                <h3 className="mt-8 text-xl font-semibold tracking-[-0.03em] text-zinc-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600">{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="features" className="border-y border-[#17221d]/[0.08] bg-zinc-50">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
            <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-600">Made for small businesses</p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.05em] text-zinc-900 sm:text-4xl">The essentials, without the extra complexity.</h2>
              </div>
              <p className="max-w-xl text-base leading-7 text-zinc-600 md:justify-self-end">Build a storefront around the way you already sell, with room to add more tools as your business grows.</p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {features.map(feature => (
                <article key={feature.number} className="rounded-[22px] border border-[#17221d]/[0.08] bg-white p-6 sm:p-7">
                  <span className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#17221d] text-[11px] font-bold text-[#d7f36b]">{feature.number}</span>
                  <h3 className="mt-7 text-lg font-semibold tracking-[-0.03em] text-zinc-900">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid gap-8 rounded-[28px] bg-[#17221d] p-7 text-white sm:p-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d7f36b]">Start small. Grow at your pace.</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">A free place to begin selling.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">The Basic plan includes up to 5 products and 1 image per product. Compare plans to see which tools fit your shop.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Link href="/pricing" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#E8FF86] px-6 text-sm font-bold text-zinc-900 transition hover:bg-[#e4f98e]">Compare plans <span aria-hidden="true" className="ml-2">↗</span></Link>
              <Link href="/login" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/[0.06]">Create your store</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#17221d]/[0.08] bg-white/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-[11px] bg-[#17221d] text-xs font-bold text-[#d7f36b]">D</span>
            <span className="text-sm font-bold text-zinc-800">DukaanWhats</span>
            <span className="text-xs text-zinc-400">· Built in Pakistan</span>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-zinc-600">
            <Link href="/about" className="hover:text-zinc-900">About</Link>
            <Link href="/pricing" className="hover:text-zinc-900">Pricing</Link>
            <Link href="/terms" className="hover:text-zinc-900">Terms</Link>
            <Link href="/privacy" className="hover:text-zinc-900">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
