'use client'

/* SLEEK BEIGE — warm boutique. Soft serif, terracotta, organic shapes, staggered grid. */
const SKIN = {
  root: 'bg-[#F3EEE6] text-[#2B2118]',
  panel: 'bg-[#FBF8F3] text-[#2B2118] rounded-[34px] shadow-[0_40px_90px_-30px_rgba(60,40,20,0.5)]',
  drawer: 'bg-[#FBF8F3] text-[#2B2118]',
  scrim: 'bg-[#2B2118]/45 backdrop-blur-sm',
  muted: 'text-[#2B2118]/60', line: 'border-[#2B2118]/12', soft: 'bg-[#EFE7DB]',
  chip: 'border-[#2B2118]/18 bg-white/60 hover:border-[var(--pm-accent)]', chipOn: 'bg-[var(--pm-accent)] text-white border-[var(--pm-accent)]', chipR: 'rounded-full',
  btn: 'bg-[#2B2118] text-[#FBF8F3] rounded-full hover:bg-[var(--pm-accent)]', btnAlt: 'bg-[var(--pm-accent)] text-white rounded-full hover:brightness-110',
  input: 'bg-white/70 border border-[#2B2118]/12 focus:border-[var(--pm-accent)] rounded-2xl',
  title: '[font-family:var(--pm-display)] font-medium tracking-[-0.02em]',
  dock: 'bg-[#FBF8F3]/95 backdrop-blur border-[#2B2118]/10',
}
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400;1,9..144,500&family=DM+Sans:wght@400;500;600;700&display=swap');
.pm-beige{font-family:'DM Sans',system-ui,sans-serif;--pm-display:'Fraunces',Georgia,serif}
.pm-beige .serif{font-family:var(--pm-display)}
`

function Item({ p, S }: any) {
  const { Ic, Img, PriceLine, discountPct, stockState } = S.ui
  const pct = discountPct(p)
  const st = stockState(p)
  return (
    <article className="pm-reveal group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[30px] bg-[#E8DFD1] shadow-[0_20px_40px_-26px_rgba(60,40,20,0.55)]">
        <button type="button" onClick={() => S.openProduct(p)} aria-label={`View ${p.name}`} className="absolute inset-0 w-full h-full">
          <Img src={p.images[0]} alt={p.name} className={`w-full h-full object-cover transition-transform duration-[1100ms] group-hover:scale-[1.06] ${st === 'out' ? 'opacity-50' : ''}`} />
        </button>
        <div className="absolute top-3.5 left-3.5 flex gap-1.5 pointer-events-none">
          {S.isHot(p) && <span className="h-7 px-3 inline-flex items-center rounded-full bg-[var(--pm-accent)] text-white text-[11px] font-bold">{S.c.hotBadge}</span>}
          {pct > 0 && <span className="h-7 px-3 inline-flex items-center rounded-full bg-white/90 backdrop-blur text-[11px] font-bold text-[var(--pm-accent)]">−{pct}%</span>}
          {st === 'out' && <span className="h-7 px-3 inline-flex items-center rounded-full bg-[#2B2118] text-white text-[11px] font-semibold">Sold out</span>}
        </div>
        <button type="button" onClick={() => S.toggleWish(p.id)} aria-label="Save" title={S.isWished(p.id) ? 'Remove from saved items' : 'Save this product'} aria-pressed={S.isWished(p.id)} className={`absolute top-3.5 right-3.5 w-10 h-10 grid place-items-center rounded-full bg-white/80 backdrop-blur transition hover:scale-110 ${S.isWished(p.id) ? 'text-[var(--pm-accent)]' : 'text-[#2B2118]'}`}><Ic.heart c="w-[18px] h-[18px]" fill={S.isWished(p.id)} /></button>
        {st !== 'out' && <button type="button" onClick={() => S.quickAdd(p)} className="absolute left-3.5 right-3.5 bottom-3.5 h-11 rounded-full bg-white/90 backdrop-blur text-[13px] font-semibold inline-flex items-center justify-center gap-2 md:translate-y-[140%] md:group-hover:translate-y-0 transition-transform duration-500 hover:bg-[#2B2118] hover:text-white"><Ic.plus c="w-4 h-4" />{p.sizes.length || p.colors.length ? 'Choose options' : 'Add to bag'}</button>}
      </div>
      <button type="button" onClick={() => S.openProduct(p)} className="block w-full text-left mt-4 px-1.5">
        <div className="flex items-start justify-between gap-3"><div className="serif text-[19px] md:text-[21px] leading-[1.15] font-medium">{p.name}</div></div>
        <div className="mt-1.5 flex items-center justify-between gap-2"><PriceLine p={p} S={S} big="text-[15px] text-[var(--pm-accent)]" strike="text-[12px] opacity-45" />{st === 'low' && <span className="text-[11px] font-semibold text-[var(--pm-accent)]">Only {p.stock} left</span>}</div>
        {(p.colors.length > 0) && <div className="mt-2 text-[12px] text-[#2B2118]/50 truncate">{p.colors.join(' · ')}</div>}
      </button>
    </article>
  )
}

export function SleekBeigePremiumTheme({ S }: { S: any }) {
  const { Ic, Img, SearchBox, SortSelect, Overlays, PM_BASE_CSS, splitLines } = S.ui
  const { c, filtered } = S
  const lines = splitLines(c.heroTitle)
  const reviews: any[] = Array.isArray(c.testimonials) ? c.testimonials : []
  const lookImg = c.lookbookImage || S.products[2]?.images[0] || S.heroImg2
  const avatars = S.products.slice(0, 4).map((p: any) => p.images[0])

  return (
    <div ref={S.rootRef} style={S.cssVars} className={`pm-beige relative min-h-screen antialiased overflow-x-clip ${SKIN.root}`}>
      <style>{PM_BASE_CSS + CSS}</style>

      {c.showAnnouncement && c.announcement && <div className="h-9 grid place-items-center bg-[var(--pm-accent)] text-white text-[11px] font-medium tracking-[0.14em] px-4 truncate">{c.announcement}</div>}

      <header className="sticky top-3 z-30 px-3 mt-3">
        <div className="max-w-[1120px] mx-auto h-[62px] pl-5 pr-2.5 rounded-full bg-white/75 backdrop-blur-xl border border-white shadow-[0_14px_40px_-22px_rgba(60,40,20,0.6)] flex items-center justify-between gap-3">
          <a href="#" onClick={e => e.preventDefault()} className="serif text-[21px] md:text-[24px] font-medium tracking-[-0.02em] truncate">{c.logoImage ? <img src={c.logoImage} alt={c.headerLabel} className="h-8 max-w-[150px] object-contain" /> : c.headerLabel}</a>
          <nav className="hidden md:flex items-center gap-1 text-[13.5px] font-medium" aria-label="Sections">
            {[['Shop', 'pm-collection'], ...(reviews.length ? [['Lookbook', 'pm-lookbook'], ['Reviews', 'pm-reviews']] : [['Lookbook', 'pm-lookbook']])].map(([l, id]) => <button type="button" key={id} onClick={e => S.scrollTo(e, id)} className="h-10 px-4 rounded-full hover:bg-[#2B2118]/[0.06] transition">{l}</button>)}
          </nav>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => S.setSavedOnly(!S.savedOnly)} aria-label="Saved" title={S.savedOnly ? 'Show all products' : 'Filter to saved items'} aria-pressed={S.savedOnly} className={`relative w-11 h-11 grid place-items-center rounded-full transition ${S.savedOnly ? 'bg-[var(--pm-accent)] text-white' : 'hover:bg-[#2B2118]/[0.06]'}`}><Ic.heart c="w-[19px] h-[19px]" fill={S.savedOnly} />{S.wish.length > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 grid place-items-center rounded-full bg-[#2B2118] text-white text-[9px] font-bold">{S.wish.length}</span>}</button>
            <button type="button" onClick={S.openCart} className="h-11 pl-4 pr-2 rounded-full bg-[#2B2118] text-[#FBF8F3] inline-flex items-center gap-2.5 text-[13px] font-semibold hover:bg-[var(--pm-accent)] transition"><Ic.bag c="w-[17px] h-[17px]" /><span className="hidden sm:inline">Bag</span><span className="min-w-[26px] h-[26px] px-1.5 grid place-items-center rounded-full bg-white/20 text-[12px] tabular-nums">{S.cartCount}</span></button>
          </div>
        </div>
      </header>

      {/* HERO collage */}
      <section className="max-w-[1180px] mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-14 grid lg:grid-cols-[1fr_0.95fr] gap-14 items-center">
        <div>
          <span className="pm-rise inline-flex items-center gap-2 h-9 px-4 rounded-full bg-white/70 border border-white text-[12.5px] font-medium"><span className="w-2 h-2 rounded-full bg-[var(--pm-accent)]" />{c.heroBadge}</span>
          <h1 className="serif mt-6 text-[clamp(42px,6.2vw,92px)] leading-[0.98] font-medium tracking-[-0.035em]">{lines.map((l: string, i: number) => <span key={i} className={`pm-rise block ${i === 1 ? 'italic font-normal text-[var(--pm-accent)]' : ''}`} style={{ animationDelay: `${120 + i * 120}ms` }}>{l}</span>)}</h1>
          <p className="pm-rise mt-6 max-w-[440px] text-[16px] leading-[1.7] text-[#2B2118]/65" style={{ animationDelay: '520ms' }}>{c.heroSubtitle}</p>
          <div className="pm-rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: '640ms' }}>
            <button type="button" onClick={e => S.scrollTo(e, 'pm-collection')} className={`h-[54px] px-8 text-[14px] font-semibold inline-flex items-center gap-2.5 transition ${SKIN.btn}`}>{c.ctaText}<Ic.right c="w-4 h-4" /></button>
            {c.secondaryCta && <button type="button" onClick={S.openCart} className="h-[54px] px-8 text-[14px] font-semibold rounded-full border border-[#2B2118]/25 hover:bg-white/70 transition">{c.secondaryCta}</button>}
          </div>
          {c.showStats && <div className="pm-rise mt-10 flex items-center gap-4" style={{ animationDelay: '760ms' }}>
            <div className="flex -space-x-3">{avatars.map((u: string, i: number) => <Img key={i} src={u} className="w-11 h-11 rounded-full object-cover border-[3px] border-[#F3EEE6]" />)}</div>
            <div><div className="flex items-center gap-1 text-[var(--pm-accent)]">{[0, 1, 2, 3, 4].map(i => <Ic.star key={i} c="w-3.5 h-3.5" fill />)}<span className="ml-1.5 text-[13px] font-bold text-[#2B2118]">{c.stats?.[1]?.value}</span></div><div className="text-[12.5px] text-[#2B2118]/55 mt-0.5">{c.stats?.[0]?.value} {String(c.stats?.[0]?.label || '').toLowerCase()} • {c.stats?.[2]?.value} {String(c.stats?.[2]?.label || '').toLowerCase()}</div></div>
          </div>}
        </div>

        <div className="relative mx-auto w-full max-w-[520px] pm-rise" style={{ animationDelay: '280ms' }}>
          <div className="absolute -z-0 -top-8 -right-8 w-[78%] aspect-square rounded-full bg-[var(--pm-accent)]/25 blur-3xl" aria-hidden />
          <div className="relative aspect-[4/5] rounded-[44px] rounded-bl-[170px] overflow-hidden shadow-[0_40px_80px_-30px_rgba(60,40,20,0.6)]"><Img src={S.heroImg} alt="" className="pm-ken w-full h-full object-cover" /></div>
          <div className="absolute -bottom-8 -left-6 md:-left-12 w-[42%] aspect-square rounded-full overflow-hidden border-[8px] border-[#F3EEE6] shadow-xl"><Img src={S.heroImg2} alt="" className="w-full h-full object-cover" /></div>
          <div className="absolute top-8 -right-3 md:-right-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white p-3.5 pr-5 shadow-xl pm-float"><div className="text-[10px] uppercase tracking-[0.18em] text-[var(--pm-accent)] font-bold">{c.featuredLabel}</div><div className="serif text-[17px] leading-tight mt-0.5 max-w-[150px] truncate">{S.products[0]?.name}</div><div className="text-[12.5px] font-bold mt-0.5">{S.products[0] ? S.m(S.products[0].price) : ''}</div></div>
        </div>
      </section>

      {(c.trustBadges || []).length > 0 && (
        <div className="max-w-[1180px] mx-auto px-5 md:px-8"><div className="rounded-full bg-white/60 border border-white py-4 px-6 flex flex-wrap items-center justify-center gap-x-9 gap-y-3 text-[13px] font-medium">{c.trustBadges.map((b: string, i: number) => <span key={i} className="inline-flex items-center gap-2.5"><span className="w-7 h-7 grid place-items-center rounded-full bg-[var(--pm-accent)]/12 text-[var(--pm-accent)]">{i === 0 ? <Ic.truck c="w-3.5 h-3.5" /> : i === 1 ? <Ic.undo c="w-3.5 h-3.5" /> : <Ic.check c="w-3.5 h-3.5" />}</span>{b}</span>)}</div></div>
      )}

      {/* COLLECTION — staggered columns */}
      <section id="pm-collection" className="max-w-[1180px] mx-auto px-5 md:px-8 pt-24 pb-10">
        <div className="text-center"><div className="text-[12.5px] font-semibold text-[var(--pm-accent)]">{c.collectionSubtitle}</div><h2 className="serif mt-2 text-[clamp(36px,4.8vw,64px)] leading-[1] font-medium tracking-[-0.03em]">{c.collectionTitle}</h2></div>
        <div className="mt-8 flex flex-wrap justify-center gap-2">{S.chips.map((b: string) => <button type="button" key={b} onClick={() => S.setActive(b)} aria-pressed={S.active === b} className={`h-11 px-6 text-[13.5px] font-semibold border transition-all ${S.active === b ? SKIN.chipOn : SKIN.chip} rounded-full`}>{b}</button>)}</div>
        <div className="mt-5 flex flex-wrap justify-center gap-3">{c.showSearch && <SearchBox S={S} className="w-full sm:w-[280px]" inputClass={`h-11 text-[13.5px] ${SKIN.input}`} />}{c.showSort && <SortSelect S={S} className="h-11 px-4 rounded-2xl bg-white/70 border border-[#2B2118]/12 text-[13px] font-medium" />}</div>
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-10 lg:[&>*:nth-child(4n+2)]:mt-14 lg:[&>*:nth-child(4n+4)]:mt-14">{filtered.map((p: any) => <Item key={p.id} p={p} S={S} />)}</div>
        {filtered.length === 0 && <div className="py-20 text-center rounded-[34px] bg-white/60 mt-8"><div className="serif text-[28px]">Nothing here yet</div><button type="button" onClick={() => { S.setQuery(''); S.setActive('All'); S.setSavedOnly(false) }} className={`mt-5 h-12 px-7 text-[13.5px] font-semibold ${SKIN.btn}`}>Clear filters</button></div>}
      </section>

      {/* LOOKBOOK */}
      <section id="pm-lookbook" className="max-w-[1180px] mx-auto px-5 md:px-8 py-16 pm-reveal">
        <div className="relative rounded-[44px] overflow-hidden min-h-[420px] md:min-h-[520px] flex items-end">
          <Img src={lookImg} alt="" className="absolute inset-0 w-full h-full object-cover pm-ken" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2B2118]/85 via-[#2B2118]/25 to-transparent" />
          <div className="relative p-8 md:p-14 max-w-[620px] text-[#FBF8F3]"><div className="text-[12px] uppercase tracking-[0.22em] opacity-80">Lookbook</div><h3 className="serif mt-3 text-[clamp(34px,4.6vw,62px)] leading-[1.02] font-medium tracking-[-0.03em]">{c.lookbookTitle}</h3><p className="mt-4 text-[15px] leading-[1.7] opacity-80">{c.lookbookText}</p><button type="button" onClick={e => S.scrollTo(e, 'pm-collection')} className="mt-7 h-12 px-7 rounded-full bg-[#FBF8F3] text-[#2B2118] text-[13.5px] font-semibold inline-flex items-center gap-2 hover:gap-3.5 transition-all">Shop the look<Ic.right c="w-4 h-4" /></button></div>
        </div>
      </section>

      {/* REVIEWS */}
      {reviews.length > 0 && (
        <section id="pm-reviews" className="max-w-[1180px] mx-auto px-5 md:px-8 pb-20">
          <h3 className="serif text-center text-[clamp(30px,3.8vw,48px)] font-medium tracking-[-0.03em]">Kind words</h3>
          <div className="mt-10 grid md:grid-cols-3 gap-5">{reviews.slice(0, 4).map((r: any, i: number) => (
            <figure key={i} className="pm-reveal relative bg-white/75 border border-white rounded-[30px] p-7 shadow-[0_24px_50px_-34px_rgba(60,40,20,0.6)] hover:-translate-y-1.5 transition-transform duration-500">
              <div className="serif text-[64px] leading-none text-[var(--pm-accent)]/35 absolute top-4 right-6" aria-hidden>”</div>
              <div className="flex gap-0.5 text-[var(--pm-accent)]">{[0, 1, 2, 3, 4].map(k => <Ic.star key={k} c="w-4 h-4" fill />)}</div>
              <blockquote className="mt-4 text-[15px] leading-[1.7] text-[#2B2118]/80">{r.text}</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 text-[13px] font-semibold"><span className="w-9 h-9 rounded-full bg-[var(--pm-accent)] text-white grid place-items-center">{String(r.name || '?').charAt(0)}</span>{r.name}</figcaption>
            </figure>))}</div>
        </section>
      )}

      <footer className="bg-[#2B2118] text-[#F3EEE6] rounded-t-[48px]">
        <div className="max-w-[1180px] mx-auto px-5 md:px-8 py-14 grid md:grid-cols-[1.4fr_1fr] gap-8 items-end">
          <div><div className="serif text-[34px] font-medium tracking-[-0.03em]">{c.headerLabel}</div><p className="mt-3 max-w-[420px] text-[14.5px] leading-[1.7] text-[#F3EEE6]/65">{c.footerAbout}</p></div>
          <div className="text-[13px] text-[#F3EEE6]/60 space-y-1.5 md:text-right">{c.instagram && <div className="text-[var(--pm-accent)] font-semibold">{c.instagram}</div>}{c.address && <div>{c.address}</div>}<div>{S.profile?.whatsapp_number}</div><div className="pt-3 text-[11.5px] text-[#F3EEE6]/40">{c.footerNote || `© ${S.profile?.business_name || c.headerLabel}`}</div></div>
        </div>
      </footer>

      <Overlays S={S} skin={SKIN} layout="modal" />
    </div>
  )
}
