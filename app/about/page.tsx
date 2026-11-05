import Link from 'next/link'

const principles = [
  {
    number: '01',
    title: 'Easy to start',
    text: 'Create a shareable storefront, add your products and put the link in your social profiles. No coding or separate shopping app is required.',
  },
  {
    number: '02',
    title: 'WhatsApp at the centre',
    text: 'Customers can browse first and then start an order with you on WhatsApp, where many local sellers already talk to their customers.',
  },
  {
    number: '03',
    title: 'Made for local selling',
    text: 'DukaanWhats is designed around Pakistani sellers, with rupee pricing and a simple direct-to-seller ordering flow.',
  },
]

export default function AboutPage() {
  return (
    <div data-app-page className="min-h-screen bg-[#F8F7F5] text-[#0A0A0A]">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="inline-flex items-center gap-2.5 rounded-sm font-black tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-black text-sm text-[#E8FF86]">D</span>
            DukaanWhats.pk
          </Link>
          <Link href="/pricing" className="rounded-full bg-black px-4 py-2.5 text-xs font-bold text-white hover:bg-zinc-800">View pricing</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
        <section className="max-w-3xl">
          <div className="inline-flex rounded-full border border-black/10 bg-white px-3 py-1.5 text-[10px] font-black tracking-[0.18em]">ABOUT DUKAANWHATS</div>
          <h1 className="mt-6 text-4xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl">A simpler way for Pakistan to sell online.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8">DukaanWhats helps independent sellers turn a product list into a clean online storefront, then continue the conversation and order on WhatsApp.</p>
        </section>

        <section className="mt-12 grid gap-5 md:mt-16 md:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[28px] border border-black/[0.06] bg-white p-6 sm:p-9">
            <p className="text-[10px] font-black tracking-[0.18em] text-zinc-400">THE STORY</p>
            <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">Built in Islamabad, for sellers across Pakistan.</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-zinc-600">
              <p>I’m M Aakif, an independent maker based in Islamabad. I built DukaanWhats to make it easier for local businesses to present their products without needing to set up and maintain a complicated online shop.</p>
              <p>For many small sellers, social media is already where customers discover products and WhatsApp is where questions and orders happen. DukaanWhats connects those steps with one storefront link: customers can browse a catalogue, choose what they want and start a conversation with the seller.</p>
              <p>The goal is practical: help sellers get online with less friction, keep the buying conversation direct, and give each business a page that feels like its own.</p>
            </div>
          </article>
          <aside className="relative overflow-hidden rounded-[28px] bg-black p-7 text-white sm:p-9">
            <div aria-hidden="true" className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#E8FF86]/20 blur-3xl" />
            <div className="relative">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#E8FF86] text-sm font-black text-black">MA</div>
              <p className="mt-7 text-[10px] font-bold tracking-[0.18em] text-white/50">FOUNDER & BUILDER</p>
              <h2 className="mt-2 text-2xl font-black">M Aakif</h2>
              <p className="mt-4 text-sm leading-7 text-white/70">Building DukaanWhats from Islamabad with a focus on useful, approachable tools for Pakistani sellers.</p>
              <p className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs text-white/75"><span className="h-2 w-2 rounded-full bg-[#E8FF86]" /> Islamabad, Pakistan</p>
            </div>
          </aside>
        </section>

        <section className="mt-16 sm:mt-20">
          <div className="max-w-xl">
            <p className="text-[10px] font-black tracking-[0.18em] text-zinc-400">HOW IT WORKS</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">From products to a WhatsApp conversation.</h2>
          </div>
          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {[
              ['01', 'Set up your page', 'Choose a store name and add the products you want customers to see.'],
              ['02', 'Share one link', 'Put your store link on Instagram, WhatsApp Status or anywhere customers find you.'],
              ['03', 'Talk directly', 'A customer can start an order conversation with you on WhatsApp. You manage payment and fulfilment directly.'],
            ].map(([number, title, text]) => (
              <article key={number} className="rounded-[22px] border border-black/[0.06] bg-white p-6">
                <div className="text-xs font-black text-zinc-300">{number}</div>
                <h3 className="mt-5 text-lg font-extrabold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <p className="text-[10px] font-black tracking-[0.18em] text-zinc-400">WHAT MATTERS TO US</p>
          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {principles.map(({ number, title, text }) => (
              <article key={number} className="rounded-[22px] border border-black/[0.06] bg-white p-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8FF86] text-xs font-black">{number}</div>
                <h3 className="mt-5 text-lg font-extrabold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 flex flex-col items-start justify-between gap-6 rounded-[28px] bg-[#E8FF86] p-7 sm:mt-20 sm:flex-row sm:items-center sm:p-10">
          <div>
            <p className="text-[10px] font-black tracking-[0.18em]">READY WHEN YOU ARE</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Give your products a home online.</h2>
            <p className="mt-2 text-sm text-black/65">Start with the free plan, then choose a plan that fits your store.</p>
          </div>
          <Link href="/login?signup=true" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-black px-6 text-sm font-bold text-white hover:bg-zinc-800">Create your store <span aria-hidden="true" className="ml-2">↗</span></Link>
        </section>
      </main>
    </div>
  )
}
