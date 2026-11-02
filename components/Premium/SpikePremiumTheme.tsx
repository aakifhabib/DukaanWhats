'use client'

/* SPIKE — streetwear / neo-brutalist. Heavy type, hard shadows, lime stickers, endless ticker. */
const SKIN = {
  root: 'bg-[#F2F1EC] text-[#0A0A0A]',
  panel: 'bg-[#FBFAF6] text-[#0A0A0A] border-2 border-black rounded-[22px] shadow-[10px_10px_0_#0A0A0A]',
  drawer: 'bg-[#FBFAF6] text-[#0A0A0A] border-l-2 border-black',
  scrim: 'bg-black/55 backdrop-blur-[2px]',
  muted: 'text-black/60', line: 'border-black/15', soft: 'bg-black/[0.05]',
  chip: 'border-black/25 hover:border-black bg-white', chipOn: 'bg-black text-white border-black', chipR: 'rounded-xl',
  btn: 'bg-[var(--pm-accent)] text-black border-2 border-black rounded-xl shadow-[4px_4px_0_#0A0A0A] hover:shadow-[2px_2px_0_#0A0A0A] hover:translate-x-[2px] hover:translate-y-[2px]',
  btnAlt: 'bg-black text-white border-2 border-black rounded-xl',
  input: 'bg-white border-2 border-black/15 focus:border-black rounded-xl',
  title: 'font-[800] tracking-[-0.04em] [font-family:var(--pm-display)]',
  dock: 'bg-[#FBFAF6]/95 backdrop-blur border-black/15',
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=JetBrains+Mono:wght@500;700&display=swap');
.pm-spike{font-family:'Bricolage Grotesque',system-ui,sans-serif;--pm-display:'Bricolage Grotesque',system-ui,sans-serif}
.pm-spike .mono{font-family:'JetBrains Mono',ui-monospace,monospace}
@keyframes pmTick{to{transform:translateX(-50%)}}
`

function Card({ p, i, S }: any) {
  const { Ic, Img, PriceLine, discountPct, stockState } = S.ui
  const pct = discountPct(p)
  const st = stockState(p)
  return (
    <article className="pm-reveal group relative bg-white border-2 border-black rounded-[20px] p-2.5 transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0_#0A0A0A]">
      <div className="relative overflow-hidden rounded-[14px] aspect-square bg-[#EDECE6]">
        <button type="button" onClick={() => S.openProduct(p)} aria-label={`View ${p.name}`} className="absolute inset-0 w-full h-full">
          <Img src={p.images[0]} alt={p.name} className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-105" />
          {p.images[1] && <Img src={p.images[1]} className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}
        </button>
        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
          {i < 2 && st !== 'out' && <span className="h-5 px-2 inline-flex items-center text-[9px] font-black mono bg-[var(--pm-accent)] border border-black rounded-full">{S.c.hotBadge}</span>}
          {pct > 0 && <span className="h-5 px-2 inline-flex items-center text-[9px] font-black mono bg-black text-white rounded-full">−{pct}%</span>}
        </div>
        <button type="button" onClick={() => S.toggleWish(p.id)} aria-label="Save" aria-pressed={S.isWished(p.id)} className={`absolute top-2 right-2 w-8 h-8 grid place-items-center rounded-full border-2 border-black transition ${S.isWished(p.id) ? 'bg-black text-[var(--pm-accent)]' : 'bg-white hover:bg-[var(--pm-accent)]'}`}><Ic.heart c="w-3.5 h-3.5" fill={S.isWished(p.id)} /></button>
        {st === 'out'
          ? <div className="absolute inset-0 bg-white/70 grid place-items-center pointer-events-none"><span className="mono text-[11px] font-bold bg-black text-white px-3 h-7 inline-flex items-center rounded-full">SOLD OUT</span></div>
          : <button type="button" onClick={() => S.quickAdd(p)} aria-label={`Quick add ${p.name}`} className="absolute bottom-2 right-2 w-10 h-10 grid place-items-center rounded-full border-2 border-black bg-[var(--pm-accent)] md:translate-y-14 md:group-hover:translate-y-0 transition-transform duration-300 hover:rotate-90"><Ic.plus c="w-4 h-4" /></button>}
      </div>
      <button type="button" onClick={() => S.openProduct(p)} className="block w-full text-left mt-3 px-0.5">
        <div className="text-[13px] font-bold truncate">{p.name}</div>
        <div className="mt-0.5"><PriceLine p={p} S={S} big="text-[15px]" strike="text-[11px] opacity-45" /></div>
        <div className={`mono mt-1.5 text-[9.5px] tracking-wide ${st === 'low' ? 'text-red-600 font-bold' : 'text-black/45'}`}>{st === 'low' ? `ONLY ${p.stock} LEFT` : p.sizes.length ? `SIZES ${p.sizes.slice(0, 4).join(' / ')}${p.sizes.length > 4 ? '…' : ''}` : `${S.c.freeShippingBadge || 'FREE DELIVERY'} • COD`}</div>
      </button>
    </article>
  )
}

export function SpikePremiumTheme({ S }: { S: any }) {
  const { Ic, Img, SearchBox, SortSelect, Overlays, PM_BASE_CSS, splitLines } = S.ui
  const { c, filtered } = S
  const lines = splitLines(c.heroTitle)
  const ticker = c.tickerText || S.chips.filter((x: string) => x.toLowerCase() !== 'all').join('  ✦  ') || 'FRESH DROPS'
  const first = S.products[0]

  return (
    <div ref={S.rootRef} style={S.cssVars} className={`pm-spike relative min-h-screen antialiased overflow-x-clip ${SKIN.root}`}>
      <style>{PM_BASE_CSS + CSS}</style>

      {c.showAnnouncement && c.announcement && (
        <div className="bg-black text-white h-9 flex items-center overflow-hidden mono text-[10.5px] tracking-[0.14em]">
          <div className="pm-marquee flex whitespace-nowrap gap-10 pr-10">{[0, 1, 2, 3].map(k => <span key={k} className="flex gap-10">{[c.announcement, '✦'].map((t: string, j: number) => <span key={j} className={j ? 'text-[var(--pm-accent)]' : ''}>{t}</span>)}</span>)}</div>
        </div>
      )}

      <header className="sticky top-0 z-30 bg-[#F2F1EC]/85 backdrop-blur-md border-b-2 border-black">
        <div className="max-w-[1320px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3">
          <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-2.5 min-w-0">
            {c.logoImage ? <img src={c.logoImage} alt={c.headerLabel} className="h-9 max-w-[160px] object-contain" /> : <>
              <span className="w-9 h-9 shrink-0 grid place-items-center bg-[var(--pm-accent)] border-2 border-black rounded-[10px] font-[800] text-[16px] -rotate-6">{S.initial}</span>
              <span className="font-[800] text-[18px] md:text-[20px] tracking-[-0.04em] uppercase truncate">{c.headerLabel}</span>
            </>}
          </a>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex mono items-center gap-2 h-8 px-3 rounded-full border-2 border-black bg-white text-[10px] font-bold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />LIVE • {S.products.length} ITEMS</span>
            <button type="button" onClick={e => { S.setSavedOnly(!S.savedOnly); S.scrollTo(e, 'pm-collection') }} aria-label="Saved items" className={`relative w-10 h-10 grid place-items-center rounded-full border-2 border-black transition ${S.savedOnly ? 'bg-black text-[var(--pm-accent)]' : 'bg-white hover:bg-[var(--pm-accent)]'}`}>
              <Ic.heart c="w-4 h-4" fill={S.savedOnly} />{S.wish.length > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-black text-white text-[10px] font-bold">{S.wish.length}</span>}
            </button>
            <button type="button" onClick={S.openCart} className="h-10 pl-4 pr-1.5 inline-flex items-center gap-2.5 rounded-full bg-black text-white text-[13px] font-bold hover:-translate-y-0.5 transition">
              <span className="hidden sm:inline">Cart</span><Ic.bag c="w-4 h-4 sm:hidden" />
              <span className="min-w-[28px] h-7 px-2 grid place-items-center rounded-full bg-[var(--pm-accent)] text-black text-[12px] font-extrabold tabular-nums">{S.cartCount}</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-[1320px] mx-auto px-4 md:px-6 pt-8 md:pt-14 pb-10 grid lg:grid-cols-[1.18fr_0.82fr] gap-10 lg:gap-12 items-center">
        <div>
          <span className="pm-rise mono inline-flex items-center gap-2 h-8 px-3.5 rounded-full border-2 border-black bg-white text-[10.5px] font-bold tracking-widest uppercase"><span className="w-2 h-2 rounded-full bg-[var(--pm-accent)] border border-black animate-pulse" />{c.heroBadge}</span>
          <h1 className="mt-5 text-[clamp(36px,5.6vw,84px)] leading-[0.88] uppercase font-[800] tracking-[-0.055em]">
            {lines.map((l: string, i: number) => (
              <span key={i} className="pm-rise block" style={{ animationDelay: `${120 + i * 110}ms` }}>
                {i === lines.length - 1 && lines.length > 1 ? <span className="inline bg-[var(--pm-accent)] px-2 -mx-2 [box-decoration-break:clone]">{l}</span> : l}
              </span>
            ))}
          </h1>
          <p className="pm-rise mt-6 max-w-[460px] text-[15px] md:text-[16px] leading-[1.5] text-black/65" style={{ animationDelay: '480ms' }}>{c.heroSubtitle}</p>
          <div className="pm-rise mt-7 flex flex-wrap gap-3" style={{ animationDelay: '600ms' }}>
            <button type="button" onClick={e => S.scrollTo(e, 'pm-collection')} className={`h-[52px] px-7 text-[14px] font-bold inline-flex items-center gap-2.5 transition ${SKIN.btn}`}>{c.ctaText}<Ic.arrow c="w-4 h-4" /></button>
            {c.secondaryCta && <button type="button" onClick={S.openCart} className="h-[52px] px-7 text-[14px] font-bold rounded-xl border-2 border-black bg-white hover:bg-black hover:text-white transition">{c.secondaryCta} ({S.cartCount})</button>}
          </div>
          {c.showStats && (
            <div className="pm-rise mt-9 grid grid-cols-3 gap-2.5 max-w-[520px]" style={{ animationDelay: '720ms' }}>
              {(c.stats || []).slice(0, 3).map((s: any, i: number) => (
                <div key={i} className="group bg-white border-2 border-black rounded-2xl p-3.5 hover:bg-[var(--pm-accent)] transition-colors"><div className="text-[22px] md:text-[26px] font-[800] tracking-[-0.04em] leading-none">{s.value}</div><div className="mono mt-1.5 text-[10px] uppercase text-black/50 group-hover:text-black/70">{s.label}</div></div>
              ))}
            </div>
          )}
        </div>

        <div className="relative pm-rise" style={{ animationDelay: '300ms' }}>
          <div className="relative bg-white border-2 border-black rounded-[30px] p-3 md:p-4 rotate-[-2deg] shadow-[12px_12px_0_#0A0A0A] hover:rotate-0 transition-transform duration-500">
            <button type="button" onClick={() => first && S.openProduct(first)} aria-label="Open featured product" className="block w-full">
              <Img src={S.heroImg} alt="" className="pm-float w-full aspect-[4/5] object-cover rounded-[22px]" />
            </button>
            {c.freeShippingBadge && <span className="mono absolute top-7 left-7 h-6 px-2.5 inline-flex items-center rounded-full bg-white border-2 border-black text-[10px] font-bold">{c.freeShippingBadge}</span>}
            <div className="absolute left-6 right-6 bottom-6 bg-black text-white rounded-2xl p-3.5 flex items-center justify-between">
              <div className="min-w-0"><div className="text-[12.5px] font-bold truncate">{c.trendingLabel || c.featuredLabel}</div><div className="mono text-[10px] text-white/55 truncate">{first ? first.name : `${S.products.length} curated drops`}</div></div>
              <span className="w-9 h-9 shrink-0 grid place-items-center rounded-full bg-[var(--pm-accent)] text-black"><Ic.arrow c="w-4 h-4" /></span>
            </div>
          </div>
          <div className="absolute -top-5 -right-2 md:-right-6 rotate-12" aria-hidden>
            <div className="pm-float w-[104px] h-[104px] rounded-full bg-[var(--pm-accent)] border-2 border-black grid place-items-center text-center">
              <span className="text-[15px] leading-[0.95] font-[800] uppercase tracking-[-0.03em] whitespace-pre-line">{splitLines(c.stickerText).join('\n')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER BAND */}
      <div className="my-6 -rotate-1 bg-[var(--pm-accent)] border-y-2 border-black overflow-hidden" aria-hidden>
        <div className="flex whitespace-nowrap py-3 pm-marquee">{[0, 1].map(k => <span key={k} className="flex shrink-0 text-[22px] md:text-[28px] font-[800] uppercase tracking-[-0.03em] pr-10">{Array.from({ length: 6 }).map((_, j) => <span key={j} className="pr-10">{ticker} ✦</span>)}</span>)}</div>
      </div>

      {/* COLLECTION */}
      <section id="pm-collection" className="max-w-[1320px] mx-auto px-4 md:px-6 pt-10 pb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h2 className="text-[34px] md:text-[56px] leading-[0.9] font-[800] tracking-[-0.05em] uppercase">{c.collectionTitle}<span className="text-[var(--pm-accent)] [-webkit-text-stroke:2px_#0A0A0A]"> • {filtered.length}</span></h2>{c.collectionSubtitle && <p className="mono mt-2 text-[11px] uppercase tracking-widest text-black/45">{c.collectionSubtitle}</p>}</div>
          <div className="flex flex-wrap gap-2 items-center">
            {c.showSearch && <SearchBox S={S} className="w-[210px]" inputClass="h-11 rounded-full border-2 border-black bg-white text-[13px]" />}
            {c.showSort && <SortSelect S={S} className="h-11 px-4 rounded-full border-2 border-black bg-white text-[13px] font-semibold" />}
          </div>
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto pm-sb pb-1">
          {S.chips.map((b: string) => <button type="button" key={b} onClick={() => S.setActive(b)} aria-pressed={S.active === b} className={`h-10 shrink-0 px-5 rounded-full border-2 border-black text-[13px] font-bold transition ${S.active === b ? 'bg-black text-white' : 'bg-white hover:bg-[var(--pm-accent)]'}`}>{b}</button>)}
          {S.savedOnly && <button type="button" onClick={() => S.setSavedOnly(false)} className="h-10 shrink-0 px-4 rounded-full border-2 border-black bg-[var(--pm-accent)] text-[13px] font-bold inline-flex items-center gap-2">Saved only <Ic.x c="w-3.5 h-3.5" /></button>}
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {filtered.map((p: any, i: number) => <Card key={p.id} p={p} i={i} S={S} />)}
        </div>
        {filtered.length === 0 && (
          <div className="mt-6 border-2 border-dashed border-black rounded-3xl py-16 text-center bg-white">
            <div className="text-[22px] font-[800] tracking-[-0.03em]">Nothing matches that.</div>
            <button type="button" onClick={() => { S.setQuery(''); S.setActive('All'); S.setSavedOnly(false) }} className={`mt-4 h-11 px-6 text-[13px] font-bold ${SKIN.btn}`}>Clear filters</button>
          </div>
        )}
      </section>

      {/* BENEFITS */}
      {(c.trustBadges || []).length > 0 && (
        <section className="max-w-[1320px] mx-auto px-4 md:px-6 py-12">
          <h3 className="text-[28px] md:text-[40px] leading-[0.95] font-[800] tracking-[-0.05em] uppercase max-w-[560px]">{c.whyTitle}</h3>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {c.trustBadges.slice(0, 4).map((b: string, i: number) => (
              <div key={i} className="pm-reveal bg-white border-2 border-black rounded-3xl p-5 hover:-translate-y-1 hover:shadow-[6px_6px_0_#0A0A0A] transition-all">
                <div className="mono text-[11px] font-bold text-black/40">0{i + 1}</div>
                <div className="mt-8 text-[20px] font-[800] tracking-[-0.03em] leading-[1.05]">{b}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="mt-10 bg-black text-white overflow-hidden">
        <div className="max-w-[1320px] mx-auto px-4 md:px-6 pt-14 pb-6">
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-8 items-start">
            <p className="text-[15px] md:text-[17px] leading-[1.5] text-white/70 max-w-[520px]">{c.footerAbout}</p>
            <div className="mono text-[12px] text-white/60 space-y-1.5 md:text-right">
              {c.instagram && <div>IG — <span className="text-[var(--pm-accent)]">{c.instagram}</span></div>}
              {c.address && <div>{c.address}</div>}
              <div>WhatsApp — {S.profile?.whatsapp_number || ''}</div>
            </div>
          </div>
          <div className="mt-10 text-[clamp(52px,17vw,240px)] leading-[0.8] font-[800] uppercase tracking-[-0.06em] text-transparent [-webkit-text-stroke:2px_var(--pm-accent)] select-none truncate">{c.headerLabel}</div>
          <div className="mono mt-6 pt-5 border-t border-white/15 flex flex-wrap justify-between gap-2 text-[10.5px] text-white/40"><span>{c.footerNote || `© ${S.profile?.business_name || c.headerLabel}`}</span><span>COD • FREE SHIPPING OVER {S.m(Number(c.freeShippingOver) || 0)}</span></div>
        </div>
      </footer>

      <Overlays S={S} skin={SKIN} layout="modal" />
    </div>
  )
}
