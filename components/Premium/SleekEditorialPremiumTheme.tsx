'use client'
import { useState } from 'react'

/* SLEEK EDITORIAL — a print magazine. Masthead, rules, numbered index, cursor-following image preview. */
const SKIN = {
  root: 'bg-[#FBFAF7] text-[#111111]',
  panel: 'bg-[#FBFAF7] text-[#111111]',
  drawer: 'bg-[#FBFAF7] text-[#111111] border-l border-black',
  scrim: 'bg-black/45',
  muted: 'text-black/55', line: 'border-black/15', soft: 'bg-black/[0.045]',
  chip: 'border-black/25 hover:bg-black hover:text-white', chipOn: 'bg-black text-white border-black', chipR: 'rounded-none',
  btn: 'bg-black text-white uppercase tracking-[0.16em] text-[12px] rounded-none hover:bg-[var(--pm-accent)]',
  btnAlt: 'border border-black rounded-none uppercase tracking-[0.14em] text-[12px] hover:bg-black hover:text-white',
  input: 'bg-transparent border-0 border-b border-black rounded-none focus:border-[var(--pm-accent)]',
  title: '[font-family:var(--pm-display)] font-normal tracking-[-0.025em]',
  dock: 'bg-[#FBFAF7]/95 backdrop-blur border-black/15',
}
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600;700&display=swap');
.pm-edit{font-family:'Inter Tight',system-ui,sans-serif;--pm-display:'Instrument Serif',Georgia,serif}
.pm-edit .serif{font-family:var(--pm-display)}
.pm-edit .dropcap::first-letter{font-family:var(--pm-display);float:left;font-size:4.6em;line-height:.82;padding:.06em .1em 0 0;color:var(--pm-accent)}
.pm-edit .rule3{border-top:1px solid #111;border-bottom:3px double #111}
`

export function SleekEditorialPremiumTheme({ S }: { S: any }) {
  const { Ic, Img, SearchBox, SortSelect, Overlays, PM_BASE_CSS, splitLines, discountPct, stockState } = S.ui
  const { c, filtered } = S
  const [peek, setPeek] = useState<{ p: any; x: number; y: number } | null>(null)
  const lines = splitLines(c.heroTitle)
  const first = S.products[0]
  const issue = S.products.slice(0, 4)
  const feature = filtered.slice(0, 3)
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const paras = String(c.editorLetter || '').split(/\n\n|\\n\\n/).filter(Boolean)
  const fine = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(hover:hover)').matches : true

  return (
    <div ref={S.rootRef} style={S.cssVars} className={`pm-edit relative min-h-screen antialiased overflow-x-clip ${SKIN.root}`}>
      <style>{PM_BASE_CSS + CSS}</style>

      {c.showAnnouncement && c.announcement && <div className="h-9 grid place-items-center border-b border-black/15 text-[10.5px] uppercase tracking-[0.3em] px-4 truncate">{c.announcement}</div>}

      {/* MASTHEAD */}
      <div className="max-w-[1320px] mx-auto px-4 md:px-8 pt-5">
        <div className="flex items-center justify-between text-[10.5px] uppercase tracking-[0.22em] text-black/60"><span className="hidden sm:block" suppressHydrationWarning>{today}</span><span className="text-[var(--pm-accent)] font-semibold">{c.issueLabel}</span><button type="button" onClick={S.openCart} className="inline-flex items-center gap-2 hover:text-[var(--pm-accent)] transition"><Ic.bag c="w-4 h-4" />Bag ({S.cartCount})</button></div>
        <div className="py-4 md:py-6 text-center">
          <a href="#" onClick={e => e.preventDefault()}>{c.logoImage ? <img src={c.logoImage} alt={c.headerLabel} className="h-14 md:h-20 mx-auto object-contain" /> : <span className="serif block text-[clamp(48px,11vw,168px)] leading-[0.88] tracking-[-0.045em]">{c.headerLabel}</span>}</a>
        </div>
      </div>
      <nav className="sticky top-0 z-30 bg-[#FBFAF7]/92 backdrop-blur-md" aria-label="Filters">
        <div className="max-w-[1320px] mx-auto px-4 md:px-8"><div className="rule3 h-[46px] flex items-center justify-between gap-4">
          <div className="flex gap-x-6 overflow-x-auto pm-sb text-[11px] uppercase tracking-[0.22em]">{S.chips.map((b: string) => <button type="button" key={b} onClick={e => { S.setActive(b); S.scrollTo(e, 'pm-collection') }} aria-pressed={S.active === b} className={`shrink-0 py-1 border-b transition ${S.active === b ? 'border-[var(--pm-accent)] text-[var(--pm-accent)]' : 'border-transparent hover:border-black'}`}>{b}</button>)}</div>
          <button type="button" onClick={() => S.setSavedOnly(!S.savedOnly)} aria-pressed={S.savedOnly} className={`shrink-0 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] transition ${S.savedOnly ? 'text-[var(--pm-accent)]' : 'hover:text-[var(--pm-accent)]'}`}><Ic.heart c="w-4 h-4" fill={S.savedOnly} /><span className="hidden sm:inline">Saved</span> {S.wish.length > 0 && `(${S.wish.length})`}</button>
        </div></div>
      </nav>

      {/* COVER STORY */}
      <section className="max-w-[1320px] mx-auto px-4 md:px-8 pt-10 md:pt-14 grid lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-7">
          <div className="pm-rise text-[11px] uppercase tracking-[0.3em] text-[var(--pm-accent)] font-semibold flex items-center gap-3"><span className="w-10 h-px bg-[var(--pm-accent)]" />{c.heroBadge}</div>
          <h1 className="serif mt-5 text-[clamp(60px,10.5vw,176px)] leading-[0.84] tracking-[-0.04em]">{lines.map((l: string, i: number) => <span key={i} className={`pm-rise block ${i === 1 ? 'italic text-[var(--pm-accent)]' : ''}`} style={{ animationDelay: `${120 + i * 140}ms` }}>{l}</span>)}</h1>
          <div className="pm-rise mt-8 grid sm:grid-cols-[1fr_auto] gap-6 items-end" style={{ animationDelay: '520ms' }}>
            <p className="serif text-[22px] md:text-[26px] leading-[1.25] max-w-[540px] text-black/75">{c.heroSubtitle}</p>
            <div className="flex flex-col gap-2.5">
              <button type="button" onClick={e => S.scrollTo(e, 'pm-collection')} className={`h-[52px] px-8 inline-flex items-center justify-center gap-3 transition ${SKIN.btn}`}>{c.ctaText}<Ic.right c="w-4 h-4" /></button>
              {c.secondaryCta && <button type="button" onClick={S.openCart} className={`h-[52px] px-8 transition ${SKIN.btnAlt}`}>{c.secondaryCta}</button>}
            </div>
          </div>
        </div>
        <figure className="lg:col-span-5 pm-rise" style={{ animationDelay: '240ms' }}>
          <button type="button" onClick={() => first && S.openProduct(first)} aria-label="Open pictured product" className="relative block w-full overflow-hidden group cursor-pointer"><Img src={S.heroImg} alt="" className="w-full aspect-[4/5] object-cover transition-transform duration-[1600ms] group-hover:scale-[1.04]" /></button>
          <figcaption className="mt-3 flex items-baseline justify-between gap-4 text-[11px] uppercase tracking-[0.2em] border-t border-black pt-3"><span><span className="text-[var(--pm-accent)] font-semibold">{c.featuredLabel}</span> — {first?.name}</span>{first && <span className="tabular-nums">{S.m(first.price)}</span>}</figcaption>
        </figure>
      </section>

      {c.showStats && (c.stats || []).length > 0 && <section className="max-w-[1320px] mx-auto px-4 md:px-8 mt-14"><div className="grid grid-cols-3 border-y border-black/15 divide-x divide-black/15">{(c.stats || []).slice(0, 3).map((s: any, i: number) => <div key={i} className="py-6 md:py-8 text-center"><div className="serif text-[40px] md:text-[72px] leading-none tracking-[-0.03em]">{s.value}</div><div className="mt-2 text-[10.5px] uppercase tracking-[0.3em] text-black/50">{s.label}</div></div>)}</div></section>}

      {/* IN THIS ISSUE */}
      {issue.length > 0 && <section className="max-w-[1320px] mx-auto px-4 md:px-8 mt-16"><div className="rule3 py-3 text-[11px] uppercase tracking-[0.3em] flex justify-between"><span className="font-semibold">In this issue</span><span className="text-black/45">{S.products.length} pieces</span></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-black/15 border-b border-black/15">{issue.map((p: any, i: number) => <button type="button" key={p.id} onClick={() => S.openProduct(p)} className="group text-left p-4 md:p-6 hover:bg-black hover:text-white transition-colors duration-500"><div className="serif text-[44px] md:text-[64px] leading-none text-[var(--pm-accent)]">{String(i + 1).padStart(2, '0')}</div><div className="mt-6 text-[14px] md:text-[15px] font-semibold leading-snug line-clamp-2">{p.name}</div><div className="mt-1 text-[12px] tabular-nums opacity-60">{S.m(p.price)}</div></button>)}</div></section>}

      {/* LETTER + PULL QUOTE */}
      <section className="max-w-[1320px] mx-auto px-4 md:px-8 py-20 md:py-28 grid lg:grid-cols-12 gap-10 lg:gap-16 pm-reveal">
        <blockquote className="lg:col-span-6"><span className="serif block text-[120px] leading-[0.5] text-[var(--pm-accent)]" aria-hidden>“</span><p className="serif text-[clamp(34px,4.8vw,70px)] leading-[1.02] tracking-[-0.025em]">{c.pullQuote}</p><footer className="mt-6 text-[11px] uppercase tracking-[0.3em] text-black/55">— {c.pullQuoteBy}</footer></blockquote>
        <div className="lg:col-span-6 lg:pt-6"><div className="text-[11px] uppercase tracking-[0.3em] font-semibold border-b border-black pb-3">{c.editorLetterTitle}</div><div className="mt-5 text-[15px] leading-[1.8] text-black/75 md:columns-2 gap-9 [&>p]:mb-4">{paras.map((t: string, i: number) => <p key={i} className={i === 0 ? 'dropcap' : ''}>{t}</p>)}</div></div>
      </section>

      {/* THE INDEX */}
      <section id="pm-collection" className="max-w-[1320px] mx-auto px-4 md:px-8">
        <div className="rule3 py-3 flex flex-wrap items-center justify-between gap-4">
          <div><span className="text-[11px] uppercase tracking-[0.3em] font-semibold">{c.collectionTitle}</span>{c.collectionSubtitle && <span className="ml-4 text-[11px] uppercase tracking-[0.2em] text-black/45 hidden sm:inline">{c.collectionSubtitle}</span>}</div>
          <div className="flex items-center gap-5">{c.showSearch && <SearchBox S={S} className="w-[180px]" inputClass={`h-9 text-[13px] ${SKIN.input}`} />}{c.showSort && <SortSelect S={S} className="h-9 bg-transparent border-b border-black text-[11px] uppercase tracking-[0.16em]" />}</div>
        </div>
        <div onMouseLeave={() => setPeek(null)}>
          {filtered.map((p: any, i: number) => {
            const pct = discountPct(p); const st = stockState(p)
            return (
              <div key={p.id} onMouseMove={e => fine && setPeek({ p, x: e.clientX, y: e.clientY })} className="group grid grid-cols-[34px_56px_1fr_auto] md:grid-cols-[64px_1fr_190px_150px_44px] items-center gap-3 md:gap-6 py-4 md:py-6 border-b border-black/15 hover:bg-black/[0.035] transition-colors">
                <span className="serif text-[22px] md:text-[34px] text-black/35 group-hover:text-[var(--pm-accent)] transition-colors tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <button type="button" onClick={() => S.openProduct(p)} aria-label={`View ${p.name}`} className="md:hidden"><Img src={p.images[0]} alt="" className="w-14 h-[70px] object-cover" /></button>
                <button type="button" onClick={() => S.openProduct(p)} className="text-left min-w-0 md:col-start-2"><span className="serif block text-[24px] md:text-[clamp(30px,3.6vw,52px)] leading-[1] tracking-[-0.02em] truncate group-hover:italic group-hover:translate-x-2 transition-all duration-500">{p.name}{S.isHot(p) && <sup className="ml-3 align-top text-[10px] not-italic font-sans font-semibold uppercase tracking-[0.2em] text-[var(--pm-accent)]">{S.c.hotBadge}</sup>}</span><span className="md:hidden block mt-1 text-[11px] uppercase tracking-[0.16em] text-black/50">{p.category}</span></button>
                <span className="hidden md:block text-[11px] uppercase tracking-[0.2em] text-black/50">{p.category || '—'}{st === 'low' && <span className="block text-[var(--pm-accent)] font-semibold mt-1">Only {p.stock} left</span>}{st === 'out' && <span className="block text-black font-semibold mt-1">Sold out</span>}</span>
                <span className="text-right md:text-left tabular-nums text-[14px] md:text-[16px]">{S.m(p.price)}{pct > 0 && <span className="block text-[11px] text-black/40 line-through">{S.m(p.original_price)}</span>}</span>
                <button type="button" disabled={st === 'out'} onClick={() => S.quickAdd(p)} aria-label={`Add ${p.name}`} title="Add this product to your bag" className="hidden md:grid w-11 h-11 place-items-center border border-black hover:bg-black hover:text-white disabled:opacity-30 transition"><Ic.plus c="w-4 h-4" /></button>
              </div>
            )
          })}
        </div>
        {filtered.length === 0 && <div className="py-24 text-center"><div className="serif text-[40px]">Nothing in this issue matches.</div><button type="button" onClick={() => { S.setQuery(''); S.setActive('All'); S.setSavedOnly(false) }} className={`mt-6 h-12 px-8 ${SKIN.btn}`}>Clear filters</button></div>}
      </section>

      {/* FEATURE SPREADS */}
      {feature.length > 0 && <section className="max-w-[1320px] mx-auto px-4 md:px-8 pt-24 space-y-20 md:space-y-28">{feature.map((p: any, i: number) => {
        const st = stockState(p)
        return (
          <article key={p.id} className={`pm-reveal grid md:grid-cols-12 gap-8 md:gap-12 items-center`}>
            <button type="button" onClick={() => S.openProduct(p)} aria-label={`View ${p.name}`} className={`md:col-span-6 block overflow-hidden group ${i % 2 ? 'md:order-2' : ''}`}><Img src={p.images[0]} alt={p.name} className="w-full aspect-[4/5] object-cover transition-transform duration-[1600ms] group-hover:scale-[1.05]" /></button>
            <div className="md:col-span-5 md:col-start-8"><div className="text-[11px] uppercase tracking-[0.3em] text-[var(--pm-accent)] font-semibold">Spread {String(i + 1).padStart(2, '0')} — {p.category || 'Featured'}</div><h3 className="serif mt-4 text-[clamp(40px,5.2vw,78px)] leading-[0.95] tracking-[-0.03em]">{p.name}</h3><p className="mt-5 text-[15px] leading-[1.75] text-black/65 line-clamp-4">{p.description || c.heroSubtitle}</p><div className="mt-6 flex items-baseline gap-3 tabular-nums"><span className="text-[24px] font-semibold">{S.m(p.price)}</span>{p.original_price > 0 && <span className="line-through text-black/35">{S.m(p.original_price)}</span>}</div><div className="mt-7 flex gap-3"><button type="button" onClick={() => S.openProduct(p)} className={`h-12 px-7 ${SKIN.btn}`}>Read more</button><button type="button" disabled={st === 'out'} onClick={() => S.quickAdd(p)} className={`h-12 px-7 disabled:opacity-30 ${SKIN.btnAlt}`}>{st === 'out' ? 'Sold out' : 'Add to bag'}</button></div></div>
          </article>)
      })}</section>}

      {/* COLOPHON */}
      <footer className="mt-28 border-t-[3px] border-double border-black">
        <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-12 grid md:grid-cols-[1.4fr_1fr_1fr] gap-10 text-[13px] text-black/65">
          <div><div className="serif text-[40px] leading-none text-black tracking-[-0.03em]">{c.headerLabel}</div><p className="mt-4 max-w-[380px] leading-[1.75]">{c.footerAbout}</p></div>
          <div className="space-y-1.5"><div className="text-[10.5px] uppercase tracking-[0.3em] text-[var(--pm-accent)] font-semibold mb-3">Colophon</div>{c.instagram && <div>{c.instagram}</div>}{c.address && <div>{c.address}</div>}<div>{S.profile?.whatsapp_number}</div></div>
          <div className="space-y-1.5"><div className="text-[10.5px] uppercase tracking-[0.3em] text-[var(--pm-accent)] font-semibold mb-3">Service</div>{(c.trustBadges || []).map((b: string, i: number) => <div key={i}>{b}</div>)}</div>
        </div>
        <div className="border-t border-black/15 py-4 text-center text-[10.5px] uppercase tracking-[0.26em] text-black/40">{c.footerNote || `© ${S.profile?.business_name || c.headerLabel}`}</div>
      </footer>

      {/* cursor-following image preview for the index */}
      {peek && !S.sel && <div aria-hidden className="hidden md:block fixed z-40 pointer-events-none w-[230px] aspect-[4/5] overflow-hidden border border-black shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] pm-fade" style={{ left: Math.min(peek.x + 28, (S.rootRef.current?.ownerDocument.defaultView?.innerWidth || 1200) - 260), top: Math.max(12, peek.y - 150) }}><Img src={peek.p.images[0]} alt="" className="w-full h-full object-cover" /></div>}

      <Overlays S={S} skin={SKIN} layout="full" />
    </div>
  )
}
