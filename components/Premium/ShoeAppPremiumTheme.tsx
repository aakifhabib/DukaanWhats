'use client'
import { useState, useEffect, useRef } from 'react'

/* SHOE APP — feels like a native shopping app: carousel, brand bubbles, rails, bottom tab bar. */
const SKIN = {
  root: 'bg-[#F3F0FF] text-[#14112B]',
  panel: 'bg-white text-[#14112B] rounded-t-[32px] md:rounded-[32px] shadow-[0_40px_100px_-30px_rgba(76,29,149,0.55)]',
  drawer: 'bg-white text-[#14112B]',
  scrim: 'bg-[#14112B]/50 backdrop-blur-sm',
  muted: 'text-[#14112B]/55', line: 'border-[#14112B]/10', soft: 'bg-[#F3F0FF]',
  chip: 'border-[#14112B]/15 bg-white hover:border-[var(--pm-accent)]', chipOn: 'bg-[var(--pm-accent)] text-white border-[var(--pm-accent)]', chipR: 'rounded-2xl',
  btn: 'bg-[#14112B] text-white rounded-2xl', btnAlt: 'bg-[var(--pm-accent)] text-white rounded-2xl',
  input: 'bg-[#F3F0FF] border border-transparent focus:border-[var(--pm-accent)] rounded-2xl',
  title: 'font-[800] tracking-[-0.03em]',
  dock: 'bg-white/95 backdrop-blur border-[#14112B]/10',
}
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.pm-shoe{font-family:'Plus Jakarta Sans',system-ui,sans-serif}
`

function ShoeCard({ p, S, compact = false }: any) {
  const { Ic, Img, PriceLine, discountPct, stockState } = S.ui
  const pct = discountPct(p)
  const st = stockState(p)
  return (
    <article className={`group relative ${compact ? 'w-[168px] md:w-[210px] shrink-0 snap-start' : ''}`}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] bg-gradient-to-b from-[#EAE4FF] to-[#F7F4FF]">
        <button type="button" onClick={() => S.openProduct(p)} aria-label={`View ${p.name}`} className="absolute inset-0 w-full h-full">
          <Img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.07]" />
        </button>
        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">{S.isHot(p) && <span className="h-6 px-2.5 inline-flex items-center rounded-full bg-[#14112B] text-[#E8FF86] text-[10px] font-bold">{S.c.hotBadge}</span>}{pct > 0 && <span className="h-6 px-2.5 inline-flex items-center rounded-full bg-[var(--pm-accent)] text-white text-[10px] font-bold">−{pct}%</span>}</div>
        <button type="button" onClick={() => S.toggleWish(p.id)} aria-label="Save" aria-pressed={S.isWished(p.id)} className={`absolute top-3 right-3 w-9 h-9 grid place-items-center rounded-full backdrop-blur-md transition active:scale-90 ${S.isWished(p.id) ? 'bg-white text-red-500' : 'bg-white/70 text-[#14112B]'}`}><Ic.heart c="w-4 h-4" fill={S.isWished(p.id)} /></button>
        {st === 'out'
          ? <div className="absolute inset-x-3 bottom-3 h-9 grid place-items-center rounded-full bg-white/90 text-[11px] font-bold pointer-events-none">Sold out</div>
          : <button type="button" onClick={() => S.quickAdd(p)} aria-label={`Quick add ${p.name}`} className="absolute bottom-3 right-3 w-11 h-11 grid place-items-center rounded-full bg-[#14112B] text-white shadow-lg active:scale-90 transition hover:bg-[var(--pm-accent)]"><Ic.plus c="w-5 h-5" /></button>}
      </div>
      <button type="button" onClick={() => S.openProduct(p)} className="block w-full text-left mt-3 px-1">
        <div className="text-[13.5px] font-bold truncate">{p.name}</div>
        <div className="mt-0.5 flex items-center justify-between gap-2"><PriceLine p={p} S={S} big="text-[14.5px]" strike="text-[11px] opacity-45" /></div>
        {st === 'low' && <div className="mt-1 text-[10.5px] font-bold text-red-500">Only {p.stock} left</div>}
        {st !== 'low' && p.sizes.length > 0 && <div className="mt-1 text-[10.5px] text-[#14112B]/45 font-medium truncate">Sizes {p.sizes.join(' · ')}</div>}
      </button>
    </article>
  )
}

export function ShoeAppPremiumTheme({ S }: { S: any }) {
  const { Ic, Img, SearchBox, SortSelect, Overlays, PM_BASE_CSS, splitLines } = S.ui
  const { c, filtered } = S
  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const touch = useRef<number | null>(null)
  const slides = 3
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setSlide(s => (s + 1) % slides), 5200)
    return () => clearInterval(t)
  }, [paused])

  const brands = S.chips.filter((x: string) => x.toLowerCase() !== 'all')
  const trending = S.products.slice(0, 6)
  const focusSearch = (e: React.MouseEvent) => { const d = (e.currentTarget as HTMLElement).ownerDocument; (d.getElementById('pm-app-search') as HTMLInputElement | null)?.focus(); d.getElementById('pm-app-search')?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }

  return (
    <div ref={S.rootRef} style={S.cssVars} className={`pm-shoe relative min-h-screen antialiased overflow-x-clip pb-28 md:pb-10 ${SKIN.root}`}>
      <style>{PM_BASE_CSS + CSS}</style>

      {c.showAnnouncement && c.announcement && (
        <div className="bg-[#14112B] text-white h-8 flex items-center overflow-hidden text-[10.5px] font-semibold tracking-[0.12em]">
          <div className="pm-marquee flex whitespace-nowrap gap-10 pr-10">{Array.from({ length: 8 }).map((_, k) => <span key={k} className="flex items-center gap-10">{c.announcement}<span className="text-[var(--pm-accent)]">●</span></span>)}</div>
        </div>
      )}

      {/* App bar */}
      <header className="sticky top-0 z-30 bg-[#F3F0FF]/80 backdrop-blur-xl">
        <div className="max-w-[1180px] mx-auto px-4 md:px-6 h-[68px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {c.logoImage ? <img src={c.logoImage} alt="" className="h-10 w-10 rounded-2xl object-cover" /> : <span className="w-11 h-11 shrink-0 grid place-items-center rounded-2xl bg-[var(--pm-accent)] text-white font-[800] text-[18px] shadow-[0_10px_24px_-8px_var(--pm-accent)]">{S.initial}</span>}
            <div className="min-w-0"><div className="text-[11.5px] text-[#14112B]/55 font-medium truncate">{c.greeting}</div><div className="text-[16px] font-[800] tracking-[-0.02em] truncate">{c.headerLabel}</div></div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => S.setSavedOnly(!S.savedOnly)} aria-label="Saved items" aria-pressed={S.savedOnly} className={`relative w-11 h-11 grid place-items-center rounded-2xl transition active:scale-95 ${S.savedOnly ? 'bg-[var(--pm-accent)] text-white' : 'bg-white'}`}><Ic.heart c="w-[18px] h-[18px]" fill={S.savedOnly} />{S.wish.length > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-red-500 text-white text-[10px] font-bold">{S.wish.length}</span>}</button>
            <button type="button" onClick={S.openCart} aria-label="Open cart" className="relative w-11 h-11 grid place-items-center rounded-2xl bg-[#14112B] text-white transition active:scale-95"><Ic.bag c="w-[18px] h-[18px]" />{S.cartCount > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-[var(--pm-accent)] text-white text-[10px] font-bold pm-pop">{S.cartCount}</span>}</button>
          </div>
        </div>
      </header>

      <main className="max-w-[1180px] mx-auto px-4 md:px-6">
        {c.showSearch && <SearchBox id="pm-app-search" S={S} className="mt-1" inputClass="h-[52px] rounded-2xl bg-white shadow-[0_10px_30px_-18px_rgba(76,29,149,0.5)] text-[14px] font-medium placeholder:text-[#14112B]/40" icon="w-[18px] h-[18px]" />}

        {/* Hero carousel */}
        <section className="mt-5 relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carousel" aria-label="Highlights">
          <div className="overflow-hidden rounded-[32px]" onTouchStart={e => { touch.current = e.touches[0].clientX }} onTouchEnd={e => { if (touch.current === null) return; const d = e.changedTouches[0].clientX - touch.current; if (Math.abs(d) > 40) setSlide(s => (s + (d < 0 ? 1 : slides - 1)) % slides); touch.current = null }}>
            <div className="flex transition-transform duration-[700ms] ease-[cubic-bezier(.2,.8,.2,1)]" style={{ transform: `translateX(-${slide * 100}%)` }}>
              {/* 1 hero */}
              <div className="w-full shrink-0 relative min-h-[300px] md:min-h-[380px] p-6 md:p-10 grid md:grid-cols-2 items-center overflow-hidden text-white bg-[linear-gradient(135deg,var(--pm-accent),#2E1065_85%)]">
                <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
                <div className="relative z-10">
                  <span className="inline-flex h-7 px-3 items-center rounded-full bg-white/20 backdrop-blur text-[10.5px] font-bold tracking-widest">{c.heroBadge}</span>
                  <h1 className="mt-3 text-[34px] md:text-[56px] leading-[0.98] font-[800] tracking-[-0.04em]">{splitLines(c.heroTitle).map((l: string, i: number) => <span key={i} className="block">{l}</span>)}</h1>
                  <p className="mt-3 text-[13px] md:text-[14.5px] text-white/75 max-w-[360px] leading-[1.5]">{c.heroSubtitle}</p>
                  <div className="mt-5 flex flex-wrap gap-2.5"><button type="button" onClick={e => S.scrollTo(e, 'pm-collection')} className="h-12 px-6 rounded-2xl bg-white text-[#14112B] text-[13.5px] font-bold inline-flex items-center gap-2 active:scale-95 transition hover:gap-3">{c.ctaText}<Ic.right c="w-4 h-4" /></button>{c.secondaryCta && <button type="button" onClick={S.openCart} className="h-12 px-5 rounded-2xl bg-white/15 backdrop-blur text-white text-[13.5px] font-bold active:scale-95 transition hover:bg-white/25">{c.secondaryCta}</button>}</div>
                </div>
                <div className="relative h-[190px] md:h-[300px] mt-4 md:mt-0">
                  {c.featuredLabel && <span className="absolute right-0 top-0 z-10 h-7 px-3 inline-flex items-center rounded-full bg-[#E8FF86] text-[#14112B] text-[10.5px] font-extrabold tracking-wide shadow-lg">{c.featuredLabel}</span>}
                  <div className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 h-full aspect-[4/5] rotate-[8deg]"><Img src={S.heroImg} alt="" className="pm-float w-full h-full object-cover rounded-[28px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]" /></div>
                  <span className="absolute left-0 bottom-3 h-8 px-3 inline-flex items-center gap-1.5 rounded-full bg-white text-[#14112B] text-[11px] font-bold shadow-xl"><Ic.sparkle c="w-3.5 h-3.5 text-[var(--pm-accent)]" />{c.newDropLabel}</span>
                </div>
              </div>
              {/* 2 promo */}
              <div className="w-full shrink-0 relative min-h-[300px] md:min-h-[380px] p-6 md:p-10 flex items-center overflow-hidden text-white bg-[#111AFF]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.28),transparent_55%)]" />
                <div className="relative z-10">
                  <span className="inline-flex h-7 px-3 items-center rounded-full bg-white text-[#111AFF] text-[10.5px] font-extrabold tracking-widest">{c.promoBadge}</span>
                  <div className="mt-3 text-[44px] md:text-[76px] leading-[0.92] font-[800] tracking-[-0.05em]">{splitLines(c.promoTitle).map((l: string, i: number) => <span key={i} className="block">{l}</span>)}</div>
                  <button type="button" onClick={e => { S.setActive('Sale'); S.scrollTo(e, 'pm-collection') }} className="mt-5 h-12 px-6 rounded-2xl bg-[#E8FF86] text-black text-[13.5px] font-bold active:scale-95 transition">{c.promoCta}</button>
                </div>
                <Img src={S.products[1]?.images[0] || S.heroImg} alt="" className="hidden sm:block absolute right-6 md:right-12 bottom-[-18px] h-[88%] aspect-[4/5] object-cover rounded-[28px] -rotate-12 shadow-2xl" />
              </div>
              {/* 3 perks */}
              <div className="w-full shrink-0 relative min-h-[300px] md:min-h-[380px] p-6 md:p-10 flex items-center overflow-hidden bg-[#E8FF86] text-[#14112B]">
                <div className="relative z-10 max-w-[420px]">
                  <span className="inline-flex h-7 px-3 items-center rounded-full bg-[#14112B] text-[#E8FF86] text-[10.5px] font-bold tracking-widest">MEMBERS</span>
                  <div className="mt-3 text-[34px] md:text-[54px] leading-[0.98] font-[800] tracking-[-0.04em]">{splitLines(c.memberPerksTitle).map((l: string, i: number) => <span key={i} className="block">{l}</span>)}</div>
                  <p className="mt-3 text-[13.5px] font-medium opacity-70">{c.memberPerksDesc}</p>
                  <button type="button" onClick={S.openCart} className="mt-5 h-12 px-6 rounded-2xl bg-[#14112B] text-white text-[13.5px] font-bold active:scale-95 transition">{c.memberCta}</button>
                </div>
                <div className="hidden sm:grid absolute right-8 md:right-16 top-1/2 -translate-y-1/2 w-44 h-44 md:w-60 md:h-60 rounded-full border-[14px] border-[#14112B] place-items-center text-[#14112B]"><div className="text-center"><div className="text-[44px] md:text-[64px] font-[800] leading-none tracking-[-0.05em]">7</div><div className="text-[11px] md:text-[13px] font-bold uppercase tracking-widest">day returns</div></div></div>
              </div>
            </div>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex gap-1.5">{Array.from({ length: slides }).map((_, i) => <button key={i} type="button" onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} aria-current={slide === i} className={`h-1.5 rounded-full transition-all duration-500 ${slide === i ? 'w-7 bg-white' : 'w-1.5 bg-white/50'}`} />)}</div>
        </section>

        {/* Brands */}
        {brands.length > 0 && (
          <section className="mt-7">
            <div className="flex gap-4 overflow-x-auto pm-sb pb-1">
              {S.chips.map((b: string) => {
                const on = S.active === b
                return (
                  <button type="button" key={b} onClick={() => S.setActive(b)} aria-pressed={on} className="shrink-0 w-[68px] text-center group">
                    <span className={`mx-auto w-[60px] h-[60px] grid place-items-center rounded-full text-[18px] font-[800] transition-all duration-300 ${on ? 'bg-[var(--pm-accent)] text-white scale-110 shadow-[0_14px_28px_-10px_var(--pm-accent)]' : 'bg-white text-[#14112B] group-hover:scale-105'}`}>{b.toLowerCase() === 'all' ? <Ic.grid c="w-5 h-5" /> : b.charAt(0).toUpperCase()}</span>
                    <span className={`mt-2 block text-[11px] font-semibold truncate ${on ? 'text-[var(--pm-accent)]' : 'text-[#14112B]/55'}`}>{b}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* Trending rail */}
        {trending.length > 1 && !S.query && S.active === 'All' && !S.savedOnly && (
          <section className="mt-7 pm-reveal">
            <div className="flex items-end justify-between"><h2 className="text-[20px] md:text-[24px] font-[800] tracking-[-0.03em]">Trending now</h2><button type="button" onClick={e => S.scrollTo(e, 'pm-collection')} className="text-[12.5px] font-bold text-[var(--pm-accent)]">See all</button></div>
            <div className="mt-4 flex gap-3.5 overflow-x-auto pm-sb snap-x snap-mandatory pb-2 -mx-4 px-4 md:mx-0 md:px-0">{trending.map((p: any) => <ShoeCard key={p.id} p={p} S={S} compact />)}</div>
          </section>
        )}

        {/* All shoes */}
        <section id="pm-collection" className="mt-8">
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div><h2 className="text-[22px] md:text-[28px] font-[800] tracking-[-0.03em]">{c.collectionTitle} <span className="text-[#14112B]/35 font-semibold text-[16px]">{filtered.length}</span></h2>{c.collectionSubtitle && <p className="text-[12.5px] text-[#14112B]/55 mt-0.5">{c.collectionSubtitle}</p>}</div>
            {c.showSort && <SortSelect S={S} className="h-10 px-4 rounded-full bg-white text-[12.5px] font-semibold border border-[#14112B]/10" />}
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3.5 gap-y-6 md:gap-x-5">
            {filtered.map((p: any) => <div key={p.id} className="pm-reveal"><ShoeCard p={p} S={S} /></div>)}
          </div>
          {filtered.length === 0 && <div className="mt-6 rounded-[28px] bg-white py-14 text-center"><div className="text-[18px] font-[800]">No shoes found</div><button type="button" onClick={() => { S.setQuery(''); S.setActive('All'); S.setSavedOnly(false) }} className={`mt-4 h-11 px-6 text-[13px] font-bold ${SKIN.btn}`}>Reset filters</button></div>}
        </section>

        {/* Stats + footer card */}
        <footer className="mt-12 rounded-[32px] bg-[#14112B] text-white p-6 md:p-10">
          {c.showStats && <div className="grid grid-cols-3 gap-3 pb-6 border-b border-white/10">{(c.stats || []).slice(0, 3).map((s: any, i: number) => <div key={i}><div className="text-[24px] md:text-[34px] font-[800] tracking-[-0.04em]">{s.value}</div><div className="text-[11.5px] text-white/50 font-medium">{s.label}</div></div>)}</div>}
          <div className="pt-6 grid md:grid-cols-[1.4fr_1fr] gap-6 items-end">
            <p className="text-[13.5px] md:text-[15px] text-white/65 leading-[1.6] max-w-[520px]">{c.footerAbout}</p>
            <div className="text-[12.5px] text-white/55 space-y-1 md:text-right">{c.instagram && <div>Instagram <b className="text-[#E8FF86]">{c.instagram}</b></div>}{c.address && <div>{c.address}</div>}<div>{c.footerNote || `© ${S.profile?.business_name || c.headerLabel}`}</div></div>
          </div>
        </footer>
      </main>

      {/* Bottom tab bar (mobile) */}
      <nav aria-label="Store" className="md:hidden fixed bottom-3 left-3 right-3 z-40 h-[66px] rounded-[26px] bg-[#14112B]/92 backdrop-blur-xl text-white grid grid-cols-4 shadow-[0_24px_50px_-14px_rgba(20,17,43,0.7)]">
        {[
          { k: 'home', l: 'Home', i: <Ic.home c="w-[21px] h-[21px]" />, f: (e: any) => { (e.currentTarget as HTMLElement).ownerDocument.defaultView?.scrollTo({ top: 0, behavior: 'smooth' }) }, on: false },
          { k: 'search', l: 'Search', i: <Ic.search c="w-[21px] h-[21px]" />, f: focusSearch, on: !!S.query },
          { k: 'saved', l: 'Saved', i: <Ic.heart c="w-[21px] h-[21px]" fill={S.savedOnly} />, f: () => S.setSavedOnly(!S.savedOnly), on: S.savedOnly },
          { k: 'cart', l: 'Cart', i: <Ic.bag c="w-[21px] h-[21px]" />, f: S.openCart, on: false },
        ].map(t => (
          <button type="button" key={t.k} onClick={t.f} aria-label={t.l} className="relative flex flex-col items-center justify-center gap-0.5 active:scale-90 transition">
            <span className={`h-8 w-12 grid place-items-center rounded-full transition-colors duration-300 ${t.on ? 'bg-[var(--pm-accent)]' : ''}`}>{t.i}</span>
            <span className={`text-[10px] font-semibold ${t.on ? 'text-white' : 'text-white/55'}`}>{t.l}</span>
            {t.k === 'cart' && S.cartCount > 0 && <span className="absolute top-1.5 right-[22%] min-w-[17px] h-[17px] px-1 grid place-items-center rounded-full bg-[#E8FF86] text-black text-[9.5px] font-extrabold">{S.cartCount}</span>}
          </button>
        ))}
      </nav>

      <Overlays S={S} skin={SKIN} layout="sheet" />
    </div>
  )
}
