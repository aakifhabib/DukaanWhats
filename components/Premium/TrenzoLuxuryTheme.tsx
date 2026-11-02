'use client'
import { useState } from 'react'

/* TRENZO — quiet luxury. Near-black, champagne gold, serif display, arched imagery, hairlines. */
const SKIN = {
  root: 'bg-[#0B0B0C] text-[#F2EDE4]',
  panel: 'bg-[#121213] text-[#F2EDE4] border border-white/10',
  drawer: 'bg-[#101011] text-[#F2EDE4] border-l border-white/10',
  scrim: 'bg-black/75 backdrop-blur-sm',
  muted: 'text-[#F2EDE4]/55', line: 'border-white/12', soft: 'bg-white/[0.05]',
  chip: 'border-white/20 hover:border-[var(--pm-accent)]', chipOn: 'border-[var(--pm-accent)] text-[var(--pm-accent)] bg-[var(--pm-accent)]/10', chipR: 'rounded-none',
  btn: 'bg-[var(--pm-accent)] text-black uppercase tracking-[0.16em] text-[12px] rounded-none hover:brightness-110',
  btnAlt: 'border border-[var(--pm-accent)] text-[var(--pm-accent)] rounded-none hover:bg-[var(--pm-accent)] hover:text-black',
  input: 'bg-transparent border-0 border-b border-white/25 focus:border-[var(--pm-accent)] rounded-none',
  title: '[font-family:var(--pm-display)] font-medium tracking-[-0.01em]',
  dock: 'bg-[#0B0B0C]/95 backdrop-blur border-white/10',
}
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap');
.pm-trenzo{font-family:'Jost',system-ui,sans-serif;--pm-display:'Cormorant Garamond',Georgia,serif}
.pm-trenzo .serif{font-family:var(--pm-display)}
@keyframes pmLine{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}51%{transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
`

function Piece({ p, S }: any) {
  const { Ic, Img, discountPct, stockState } = S.ui
  const pct = discountPct(p)
  const st = stockState(p)
  return (
    <article className="pm-reveal group">
      <div className="relative aspect-[3/4] overflow-hidden bg-white/[0.04]">
        <button type="button" onClick={() => S.openProduct(p)} aria-label={`View ${p.name}`} className="absolute inset-0 w-full h-full">
          <Img src={p.images[0]} alt={p.name} className={`w-full h-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.06] ${st === 'out' ? 'opacity-40 grayscale' : ''}`} />
          <span className="absolute inset-x-0 bottom-0 h-14 grid place-items-center bg-black/55 backdrop-blur-sm text-[11px] uppercase tracking-[0.28em] translate-y-full group-hover:translate-y-0 transition-transform duration-500">View piece</span>
        </button>
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {S.isHot(p) && <span className="h-6 px-2.5 inline-flex items-center text-[9.5px] uppercase tracking-[0.2em] border border-[var(--pm-accent)] text-[var(--pm-accent)] bg-black/50 backdrop-blur">{S.c.hotBadge}</span>}
          {st === 'out' && <span className="h-6 px-2.5 inline-flex items-center text-[9.5px] uppercase tracking-[0.2em] bg-white text-black">Sold out</span>}
          {pct > 0 && <span className="h-6 px-2.5 inline-flex items-center text-[9.5px] uppercase tracking-[0.2em] bg-[var(--pm-accent)] text-black">−{pct}%</span>}
        </div>
        <button type="button" onClick={() => S.toggleWish(p.id)} aria-label="Save" aria-pressed={S.isWished(p.id)} className={`absolute top-3 right-3 w-9 h-9 grid place-items-center rounded-full border border-white/25 backdrop-blur-md transition ${S.isWished(p.id) ? 'text-[var(--pm-accent)] bg-black/60' : 'text-white bg-black/30 hover:bg-black/60'}`}><Ic.heart c="w-4 h-4" fill={S.isWished(p.id)} /></button>
      </div>
      <button type="button" onClick={() => S.openProduct(p)} className="block w-full text-left mt-4">
        <div className="text-[10px] uppercase tracking-[0.28em] text-[#F2EDE4]/45">{p.category || 'Piece'}</div>
        <div className="serif text-[22px] md:text-[24px] leading-[1.1] mt-1.5 group-hover:text-[var(--pm-accent)] transition-colors">{p.name}</div>
        <div className="mt-2 flex items-baseline gap-2.5 text-[14px] tabular-nums"><span className="text-[var(--pm-accent)]">{S.m(p.price)}</span>{p.original_price > 0 && <span className="line-through text-white/30 text-[12px]">{S.m(p.original_price)}</span>}</div>
      </button>
    </article>
  )
}

export function TrenzoLuxuryTheme({ S }: { S: any }) {
  const { Ic, Img, SearchBox, SortSelect, Overlays, PM_BASE_CSS, splitLines } = S.ui
  const { c, filtered } = S
  const [story, setStory] = useState(0)
  const stories: any[] = Array.isArray(c.stories) && c.stories.length ? c.stories : []
  const lines = splitLines(c.heroTitle)
  const seal = `${c.eyebrow} • ${c.eyebrow} • `
  const first = S.products[0]
  const roman = ['I', 'II', 'III', 'IV']
  const conciergeLink = () => window.open(`https://wa.me/${S.digits}?text=${encodeURIComponent(`Hello ${S.profile?.business_name || ''}, I would like some help with a private order.`)}`, '_blank')

  return (
    <div ref={S.rootRef} style={S.cssVars} className={`pm-trenzo relative min-h-screen antialiased overflow-x-clip ${SKIN.root}`}>
      <style>{PM_BASE_CSS + CSS}</style>

      {c.showAnnouncement && c.announcement && <div className="h-9 grid place-items-center text-[10px] uppercase tracking-[0.34em] text-[var(--pm-accent)] border-b border-white/10 px-4 truncate">✦&nbsp;&nbsp;{c.announcement}&nbsp;&nbsp;✦</div>}

      <header className="sticky top-0 z-30 bg-[#0B0B0C]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1360px] mx-auto px-5 md:px-8 h-[72px] grid grid-cols-[1fr_auto_1fr] items-center">
          <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.26em]" aria-label="Sections">
            <button type="button" onClick={e => S.scrollTo(e, 'pm-collection')} className="hover:text-[var(--pm-accent)] transition-colors">Collection</button>
            {stories.length > 0 && <button type="button" onClick={e => S.scrollTo(e, 'pm-maison')} className="hover:text-[var(--pm-accent)] transition-colors">Maison</button>}
            <button type="button" onClick={e => S.scrollTo(e, 'pm-concierge')} className="hover:text-[var(--pm-accent)] transition-colors">Concierge</button>
          </nav>
          <div className="md:hidden" />
          <a href="#" onClick={e => e.preventDefault()} className="justify-self-center serif text-[22px] md:text-[28px] tracking-[0.34em] uppercase font-medium whitespace-nowrap">{c.logoImage ? <img src={c.logoImage} alt={c.headerLabel} className="h-9 max-w-[200px] object-contain" /> : <>✦ {c.headerLabel}</>}</a>
          <div className="flex items-center justify-end gap-1.5">
            <button type="button" onClick={() => S.setSavedOnly(!S.savedOnly)} aria-label="Saved pieces" aria-pressed={S.savedOnly} className={`relative w-10 h-10 grid place-items-center transition ${S.savedOnly ? 'text-[var(--pm-accent)]' : 'hover:text-[var(--pm-accent)]'}`}><Ic.heart c="w-[19px] h-[19px]" fill={S.savedOnly} />{S.wish.length > 0 && <span className="absolute top-1 right-0 min-w-[16px] h-4 px-1 grid place-items-center rounded-full bg-[var(--pm-accent)] text-black text-[9px] font-bold">{S.wish.length}</span>}</button>
            <button type="button" onClick={S.openCart} aria-label="Open cart" className="relative h-10 pl-2 pr-1 inline-flex items-center gap-2 hover:text-[var(--pm-accent)] transition-colors"><Ic.bag c="w-[19px] h-[19px]" /><span className="text-[11px] uppercase tracking-[0.22em] hidden sm:inline">Bag</span><span className="min-w-[22px] h-[22px] px-1 grid place-items-center rounded-full border border-[var(--pm-accent)] text-[var(--pm-accent)] text-[11px] tabular-nums">{S.cartCount}</span></button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative max-w-[1360px] mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 lg:gap-8 items-center min-h-[calc(100vh-110px)]">
        <div>
          <div className="pm-rise flex items-center gap-4 text-[10.5px] uppercase tracking-[0.34em] text-[var(--pm-accent)]"><span className="w-12 h-px bg-[var(--pm-accent)]" />{c.eyebrow}</div>
          <h1 className="serif mt-7 text-[clamp(46px,7.4vw,112px)] leading-[0.93] font-light tracking-[-0.025em]">
            {lines.map((l: string, i: number) => <span key={i} className={`pm-rise block ${i === 1 ? 'italic text-[var(--pm-accent)] pl-[0.6em]' : ''}`} style={{ animationDelay: `${160 + i * 140}ms` }}>{l}</span>)}
          </h1>
          <p className="pm-rise mt-8 max-w-[440px] text-[15px] leading-[1.75] text-[#F2EDE4]/60" style={{ animationDelay: '620ms' }}>{c.heroSubtitle}</p>
          <div className="pm-rise mt-10 flex flex-wrap gap-4" style={{ animationDelay: '760ms' }}>
            <button type="button" onClick={e => S.scrollTo(e, 'pm-collection')} className={`h-[54px] px-9 inline-flex items-center gap-3 font-medium transition ${SKIN.btn}`}>{c.ctaText}<Ic.right c="w-4 h-4" /></button>
            {c.secondaryCta && <button type="button" onClick={conciergeLink} className={`h-[54px] px-9 text-[12px] uppercase tracking-[0.16em] transition ${SKIN.btnAlt}`}>{c.secondaryCta}</button>}
          </div>
          <div className="mt-14 hidden md:flex items-center gap-3 text-[10px] uppercase tracking-[0.34em] text-white/40"><span className="relative w-px h-12 bg-white/15 overflow-hidden"><span className="absolute inset-0 bg-[var(--pm-accent)]" style={{ animation: 'pmLine 2.4s ease-in-out infinite' }} /></span>Scroll</div>
        </div>

        <div className="relative mx-auto w-[min(82vw,430px)] pm-rise" style={{ animationDelay: '300ms' }}>
          <div className="absolute -inset-4 rounded-t-[999px] border border-[var(--pm-accent)]/40" aria-hidden />
          <button type="button" onClick={() => first && S.openProduct(first)} aria-label="Open featured piece" className="relative block w-full aspect-[3/4] rounded-t-[999px] overflow-hidden bg-white/5">
            <Img src={S.heroImg} alt="" className="pm-ken w-full h-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            {c.heroBadge && <span className="absolute top-7 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.34em] text-white/85 whitespace-nowrap">{c.heroBadge}</span>}
            <span className="absolute left-0 right-0 bottom-6 px-6 text-left"><span className="block text-[10px] uppercase tracking-[0.3em] text-[var(--pm-accent)]">{c.featuredLabel}</span><span className="serif block text-[24px] leading-tight mt-1">{first?.name || ''}</span></span>
          </button>
          <svg viewBox="0 0 120 120" className="pm-spin absolute -left-8 md:-left-14 top-24 w-[104px] h-[104px] md:w-[124px] md:h-[124px] text-[var(--pm-accent)]" aria-hidden>
            <defs><path id="pmSeal" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" /></defs>
            <circle cx="60" cy="60" r="58" fill="#0B0B0C" stroke="currentColor" strokeOpacity=".5" />
            <text fontSize="8.5" letterSpacing="2.6" fill="currentColor"><textPath href="#pmSeal">{seal.toUpperCase()}</textPath></text>
            <text x="60" y="68" textAnchor="middle" fontSize="26" fill="currentColor">✦</text>
          </svg>
        </div>
      </section>

      {c.showStats && (
        <div className="border-y border-white/10"><div className="max-w-[1360px] mx-auto px-5 md:px-8 grid grid-cols-3 divide-x divide-white/10">{(c.stats || []).slice(0, 3).map((s: any, i: number) => <div key={i} className="py-7 md:py-9 text-center"><div className="serif text-[34px] md:text-[52px] leading-none text-[var(--pm-accent)]">{s.value}</div><div className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/45">{s.label}</div></div>)}</div></div>
      )}

      {/* MAISON */}
      {stories.length > 0 && (
        <section id="pm-maison" className="max-w-[1360px] mx-auto px-5 md:px-8 py-24 md:py-32 grid lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-20 items-center">
          <div className="pm-reveal relative aspect-[4/5] max-w-[460px] w-full overflow-hidden"><Img src={S.heroImg2} alt="" className="pm-ken w-full h-full object-cover" /><div className="absolute inset-4 border border-white/25 pointer-events-none" /></div>
          <div className="pm-reveal">
            <div className="text-[10.5px] uppercase tracking-[0.34em] text-[var(--pm-accent)]">{c.storiesTitle}</div>
            <div className="mt-8 flex gap-2 flex-wrap" role="tablist">{stories.map((s: any, i: number) => <button type="button" role="tab" aria-selected={story === i} key={i} onClick={() => setStory(i)} className={`serif h-11 px-5 text-[17px] border transition ${story === i ? 'border-[var(--pm-accent)] text-[var(--pm-accent)] bg-[var(--pm-accent)]/10' : 'border-white/15 text-white/55 hover:border-white/40'}`}>{roman[i] || i + 1}. {s.title}</button>)}</div>
            <div key={story} className="pm-fade mt-10"><div className="serif text-[clamp(34px,4.6vw,64px)] leading-[1] font-light">{stories[story]?.title}</div><p className="mt-5 text-[16px] md:text-[17px] leading-[1.8] text-[#F2EDE4]/60 max-w-[520px]">{stories[story]?.desc}</p></div>
          </div>
        </section>
      )}

      {/* COLLECTION */}
      <section id="pm-collection" className="max-w-[1360px] mx-auto px-5 md:px-8 pb-24 pt-6">
        <div className="text-center"><div className="text-[10.5px] uppercase tracking-[0.34em] text-[var(--pm-accent)]">{c.collectionSubtitle}</div><h2 className="serif mt-3 text-[clamp(40px,5.4vw,76px)] leading-none font-light">{c.collectionTitle}</h2></div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-y border-white/10 py-4">
          {S.chips.map((b: string) => <button type="button" key={b} onClick={() => S.setActive(b)} aria-pressed={S.active === b} className={`relative text-[11px] uppercase tracking-[0.26em] py-1.5 transition-colors ${S.active === b ? 'text-[var(--pm-accent)]' : 'text-white/50 hover:text-white'}`}>{b}<span className={`absolute left-0 right-0 -bottom-0.5 h-px bg-[var(--pm-accent)] transition-transform duration-500 origin-left ${S.active === b ? 'scale-x-100' : 'scale-x-0'}`} /></button>)}
        </div>
        <div className="mt-6 flex flex-wrap gap-6 items-end justify-between">
          {c.showSearch ? <SearchBox S={S} className="w-full sm:w-[300px]" inputClass={`h-11 text-[13px] ${SKIN.input}`} /> : <span />}
          <div className="flex items-center gap-5 text-[11px] uppercase tracking-[0.22em] text-white/45"><span>{filtered.length} pieces</span>{c.showSort && <SortSelect S={S} className="h-10 bg-transparent border-b border-white/25 text-[11px] uppercase tracking-[0.18em] text-white" />}</div>
        </div>
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-14">{filtered.map((p: any) => <Piece key={p.id} p={p} S={S} />)}</div>
        {filtered.length === 0 && <div className="py-24 text-center"><div className="serif text-[32px]">Nothing found</div><button type="button" onClick={() => { S.setQuery(''); S.setActive('All'); S.setSavedOnly(false) }} className={`mt-6 h-12 px-8 ${SKIN.btnAlt} text-[12px] uppercase tracking-[0.18em]`}>Clear filters</button></div>}
      </section>

      {/* CONCIERGE */}
      <section id="pm-concierge" className="border-y border-[var(--pm-accent)]/30 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_70%)]">
        <div className="max-w-[900px] mx-auto px-5 py-24 md:py-32 text-center pm-reveal">
          <div className="text-[var(--pm-accent)] text-[26px]">✦</div>
          <h3 className="serif mt-4 text-[clamp(36px,5.4vw,72px)] leading-[1.02] font-light">{splitLines(c.conciergeTitle).map((l: string, i: number) => <span key={i} className={`block ${i === 1 ? 'italic text-[var(--pm-accent)]' : ''}`}>{l}</span>)}</h3>
          <p className="mt-6 max-w-[520px] mx-auto text-[15px] leading-[1.8] text-white/55">{c.conciergeText}</p>
          <button type="button" onClick={conciergeLink} className={`mt-10 h-[54px] px-10 inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] transition ${SKIN.btnAlt}`}><Ic.chat c="w-4 h-4" />{c.conciergeCta}</button>
        </div>
      </section>

      <footer className="max-w-[1360px] mx-auto px-5 md:px-8 py-16 grid md:grid-cols-[1.4fr_1fr_1fr] gap-10 text-[13px] text-white/55">
        <div><div className="serif text-[26px] tracking-[0.3em] uppercase text-[#F2EDE4]">✦ {c.headerLabel}</div><p className="mt-4 max-w-[360px] leading-[1.8]">{c.footerAbout}</p></div>
        <div className="space-y-2"><div className="text-[10px] uppercase tracking-[0.3em] text-[var(--pm-accent)] mb-3">Contact</div>{c.instagram && <div>{c.instagram}</div>}{c.address && <div>{c.address}</div>}<div>{S.profile?.whatsapp_number}</div></div>
        <div className="space-y-2"><div className="text-[10px] uppercase tracking-[0.3em] text-[var(--pm-accent)] mb-3">Service</div>{(c.trustBadges || []).map((b: string, i: number) => <div key={i}>{b}</div>)}</div>
        <div className="md:col-span-3 pt-6 border-t border-white/10 text-[11px] tracking-[0.12em] text-white/35">{c.footerNote || `© ${S.profile?.business_name || c.headerLabel}`}</div>
      </footer>

      <Overlays S={S} skin={SKIN} layout="full" />
    </div>
  )
}
