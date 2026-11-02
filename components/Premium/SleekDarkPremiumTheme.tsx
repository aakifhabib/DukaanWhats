'use client'
import { useState, useEffect } from 'react'

/* SLEEK DARK — tech noir. Grid-lines, neon accent, HUD frames, live stock, spotlight cards. */
const SKIN = {
  root: 'bg-[#06070A] text-[#E9ECEF]',
  panel: 'bg-[#0D1014] text-[#E9ECEF] border border-white/10 rounded-2xl shadow-[0_40px_100px_-30px_#000]',
  drawer: 'bg-[#0B0D11] text-[#E9ECEF] border-l border-white/10',
  scrim: 'bg-black/75 backdrop-blur-md',
  muted: 'text-[#E9ECEF]/55', line: 'border-white/10', soft: 'bg-white/[0.05]',
  chip: 'border-white/15 hover:border-[var(--pm-accent)] bg-white/[0.03]', chipOn: 'border-[var(--pm-accent)] bg-[var(--pm-accent)] text-black', chipR: 'rounded-lg',
  btn: 'bg-[var(--pm-accent)] text-black rounded-lg uppercase tracking-[0.08em] text-[12.5px] hover:brightness-110 shadow-[0_0_30px_-8px_var(--pm-accent)]',
  btnAlt: 'border border-white/20 rounded-lg hover:border-[var(--pm-accent)] hover:text-[var(--pm-accent)]',
  input: 'bg-white/[0.05] border border-white/12 focus:border-[var(--pm-accent)] rounded-lg',
  title: '[font-family:var(--pm-display)] font-bold tracking-[-0.03em]',
  dock: 'bg-[#0D1014]/95 backdrop-blur border-white/10',
}
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
.pm-dark{font-family:'Space Grotesk',system-ui,sans-serif;--pm-display:'Space Grotesk',system-ui,sans-serif}
.pm-dark .mono{font-family:'IBM Plex Mono',ui-monospace,monospace}
.pm-dark .gridbg{background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:56px 56px;-webkit-mask-image:radial-gradient(ellipse at 50% 30%,#000 25%,transparent 75%);mask-image:radial-gradient(ellipse at 50% 30%,#000 25%,transparent 75%)}
.pm-dark .spot{position:relative}
.pm-dark .spot::before{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .35s;background:radial-gradient(260px circle at var(--x,50%) var(--y,50%),color-mix(in srgb,var(--pm-accent) 22%,transparent),transparent 70%)}
.pm-dark .spot:hover::before{opacity:1}
@keyframes pmScan{0%{transform:translateY(-10%)}100%{transform:translateY(110%)}}
@keyframes pmBlink{50%{opacity:0}}
`

const track = (e: React.MouseEvent<HTMLElement>) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`) }

function Counter({ value }: { value: string }) {
  const m = String(value).match(/^(\D*)(\d[\d,.]*)(.*)$/)
  const target = m ? parseFloat(m[2].replace(/,/g, '')) : NaN
  const [n, setN] = useState(0)
  useEffect(() => {
    if (isNaN(target)) return
    let raf = 0; const t0 = performance.now()
    const tick = (t: number) => { const p = Math.min(1, (t - t0) / 1400); setN(target * (1 - Math.pow(1 - p, 4))); if (p < 1) raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])
  if (!m || isNaN(target)) return <>{value}</>
  const dec = m[2].includes('.') ? (m[2].split('.')[1] || '').length : 0
  return <>{m[1]}{n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })}{m[3]}</>
}

function StockBar({ p }: { p: any }) {
  if (p.stock === undefined) return null
  const pct = Math.max(4, Math.min(100, (p.stock / 40) * 100))
  const low = p.stock <= 5
  return <div className="flex items-center gap-2.5 mono text-[10px]"><span className="h-1 flex-1 rounded-full bg-white/10 overflow-hidden"><span className={`block h-full rounded-full ${low ? 'bg-red-500' : 'bg-[var(--pm-accent)]'}`} style={{ width: `${pct}%` }} /></span><span className={low ? 'text-red-400' : 'text-white/45'}>{p.stock <= 0 ? 'OUT' : `${p.stock} LEFT`}</span></div>
}

export function SleekDarkPremiumTheme({ S }: { S: any }) {
  const { Ic, Img, SearchBox, SortSelect, Overlays, PM_BASE_CSS, splitLines, discountPct, stockState } = S.ui
  const { c, filtered } = S
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const lines = splitLines(c.heroTitle)
  const features: any[] = Array.isArray(c.features) ? c.features : []
  const first = S.products[0]

  return (
    <div ref={S.rootRef} style={S.cssVars} className={`pm-dark relative min-h-screen antialiased overflow-x-clip ${SKIN.root}`}>
      <style>{PM_BASE_CSS + CSS}</style>

      <div className="mono h-9 border-b border-white/10 px-4 md:px-6 flex items-center justify-between text-[10.5px] text-white/50 tracking-wider">
        <span className="inline-flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--pm-accent)] animate-pulse shadow-[0_0_10px_var(--pm-accent)]" />{c.statusLine}</span>
        {c.showAnnouncement && c.announcement && <span className="hidden md:block truncate max-w-[60%] text-[var(--pm-accent)]/80">{c.announcement}</span>}
        <span>{S.products.length} UNITS</span>
      </div>

      <header className="sticky top-0 z-30 bg-[#06070A]/75 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1320px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3">
          <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-3 min-w-0">{c.logoImage ? <img src={c.logoImage} alt={c.headerLabel} className="h-8 max-w-[160px] object-contain" /> : <><span className="w-8 h-8 grid place-items-center rounded-lg bg-[var(--pm-accent)] text-black font-bold text-[15px]">{S.initial}</span><span className="mono text-[13px] font-semibold tracking-[0.12em] uppercase truncate">[ {c.headerLabel} ]</span></>}</a>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => S.setSavedOnly(!S.savedOnly)} aria-label="Saved" aria-pressed={S.savedOnly} className={`relative w-10 h-10 grid place-items-center rounded-lg border transition ${S.savedOnly ? 'border-[var(--pm-accent)] text-[var(--pm-accent)] bg-[var(--pm-accent)]/10' : 'border-white/12 hover:border-white/30'}`}><Ic.heart c="w-4 h-4" fill={S.savedOnly} />{S.wish.length > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 grid place-items-center rounded-full bg-[var(--pm-accent)] text-black text-[9.5px] font-bold">{S.wish.length}</span>}</button>
            <button type="button" onClick={S.openCart} className="mono h-10 px-4 rounded-lg border border-[var(--pm-accent)]/60 text-[var(--pm-accent)] text-[12px] font-semibold tracking-wider inline-flex items-center gap-2 hover:bg-[var(--pm-accent)] hover:text-black transition"><Ic.bag c="w-4 h-4" />CART[{S.cartCount}]</button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden" onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`) }}>
        <div className="gridbg absolute inset-0 pointer-events-none" aria-hidden />
        <div className="absolute inset-0 pointer-events-none opacity-70" style={{ background: 'radial-gradient(520px circle at var(--mx,70%) var(--my,20%), color-mix(in srgb, var(--pm-accent) 14%, transparent), transparent 65%)' }} aria-hidden />
        <div className="relative max-w-[1320px] mx-auto px-4 md:px-6 pt-14 md:pt-24 pb-16 md:pb-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <div>
            <span className="pm-rise mono inline-flex items-center gap-2 h-8 px-3.5 rounded-lg border border-[var(--pm-accent)]/40 bg-[var(--pm-accent)]/[0.07] text-[var(--pm-accent)] text-[11px] tracking-[0.14em] uppercase">▌{c.heroBadge}</span>
            <h1 className="mt-6 text-[clamp(42px,7vw,104px)] leading-[0.92] font-bold tracking-[-0.045em]">
              {lines.map((l: string, i: number) => <span key={i} className={`pm-rise block pb-[0.1em] -mb-[0.06em] ${i === lines.length - 1 && lines.length > 1 ? 'text-[var(--pm-accent)] [text-shadow:0_0_42px_var(--pm-accent)]' : 'bg-gradient-to-b from-white to-white/45 bg-clip-text text-transparent'}`} style={{ animationDelay: `${140 + i * 120}ms` }}>{l}</span>)}
            </h1>
            <p className="pm-rise mt-7 max-w-[460px] text-[16px] leading-[1.65] text-white/55" style={{ animationDelay: '560ms' }}>{c.heroSubtitle}<span className="mono text-[var(--pm-accent)]" style={{ animation: 'pmBlink 1s steps(1) infinite' }}>▍</span></p>
            <div className="pm-rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: '680ms' }}>
              <button type="button" onClick={e => S.scrollTo(e, 'pm-collection')} className={`h-[52px] px-8 font-bold inline-flex items-center gap-2.5 transition active:scale-[0.98] ${SKIN.btn}`}>{c.ctaText}<Ic.arrow c="w-4 h-4" /></button>
              {c.secondaryCta && <button type="button" onClick={S.openCart} className={`h-[52px] px-8 text-[13px] font-semibold transition ${SKIN.btnAlt}`}>{c.secondaryCta}</button>}
            </div>
            {c.showStats && <div className="pm-rise mt-12 grid grid-cols-3 max-w-[520px] border-t border-white/10" style={{ animationDelay: '800ms' }}>{(c.stats || []).slice(0, 3).map((s: any, i: number) => <div key={i} className="pt-5 pr-3"><div className="mono text-[26px] md:text-[32px] font-semibold text-white tabular-nums"><Counter value={s.value} /></div><div className="mono mt-1 text-[10.5px] tracking-widest uppercase text-white/40">{s.label}</div></div>)}</div>}
          </div>

          <div className="relative pm-rise" style={{ animationDelay: '300ms' }}>
            <button type="button" onClick={() => first && S.openProduct(first)} aria-label="Open featured unit" className="relative block w-full max-w-[460px] mx-auto aspect-[4/5] p-3 group">
              <span className="absolute inset-0 rounded-2xl border border-white/10 bg-white/[0.02]" />
              {['top-0 left-0 border-t-2 border-l-2 rounded-tl-xl', 'top-0 right-0 border-t-2 border-r-2 rounded-tr-xl', 'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl', 'bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl'].map(k => <span key={k} className={`absolute w-8 h-8 border-[var(--pm-accent)] ${k}`} />)}
              <span className="relative block w-full h-full rounded-xl overflow-hidden">
                <Img src={S.heroImg} alt="" className="w-full h-full object-cover pm-ken" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
                <span className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[var(--pm-accent)]/15 to-transparent" style={{ animation: 'pmScan 4.2s linear infinite' }} />
                <span className="mono absolute top-3 left-3 text-[10px] tracking-wider bg-black/60 backdrop-blur px-2 h-6 inline-flex items-center rounded">{c.featuredLabel}</span>
                <span className="mono absolute bottom-3 left-3 right-3 flex items-end justify-between text-[10.5px]"><span><span className="block text-white/50">UNIT / 001</span><span className="block text-[13px] text-white font-medium truncate max-w-[200px]">{first?.name}</span></span>{first && <span className="text-[var(--pm-accent)] text-[15px] font-semibold">{S.m(first.price)}</span>}</span>
              </span>
            </button>
          </div>
        </div>
      </section>

      {features.length > 0 && (
        <section className="max-w-[1320px] mx-auto px-4 md:px-6 pb-20 grid md:grid-cols-3 gap-4">
          {features.slice(0, 4).map((f: any, i: number) => (
            <div key={i} onMouseMove={track} className="spot pm-reveal rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[var(--pm-accent)]/40">
              <div className="mono text-[11px] text-[var(--pm-accent)]">0{i + 1} /</div>
              <div className="mt-10 text-[20px] font-semibold tracking-[-0.02em]">{f.title}</div>
              <p className="mt-2 text-[14px] leading-[1.6] text-white/50">{f.desc}</p>
            </div>
          ))}
        </section>
      )}

      {/* INVENTORY */}
      <section id="pm-collection" className="max-w-[1320px] mx-auto px-4 md:px-6 pb-20">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-white/10 pb-6">
          <div><div className="mono text-[11px] tracking-[0.2em] text-[var(--pm-accent)]">// {c.hudLabel}</div><h2 className="mt-2 text-[clamp(30px,4.2vw,56px)] leading-none font-bold tracking-[-0.04em]">{c.collectionTitle} <span className="mono text-[0.4em] align-top text-white/35 font-medium">[{filtered.length}]</span></h2>{c.collectionSubtitle && <p className="mono mt-2 text-[11.5px] text-white/40">{c.collectionSubtitle}</p>}</div>
          <div className="flex flex-wrap gap-2.5 items-center">
            {c.showSearch && <SearchBox S={S} className="w-[210px]" inputClass={`h-10 text-[13px] ${SKIN.input}`} />}
            {c.showSort && <SortSelect S={S} className="mono h-10 px-3 rounded-lg bg-white/[0.05] border border-white/12 text-[12px]" />}
            <div className="inline-flex rounded-lg border border-white/12 overflow-hidden" role="group" aria-label="View">{(['grid', 'list'] as const).map(v => <button key={v} type="button" onClick={() => setView(v)} aria-pressed={view === v} aria-label={`${v} view`} className={`w-10 h-10 grid place-items-center transition ${view === v ? 'bg-[var(--pm-accent)] text-black' : 'hover:bg-white/10'}`}>{v === 'grid' ? <Ic.grid c="w-4 h-4" /> : <Ic.list c="w-4 h-4" />}</button>)}</div>
          </div>
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto pm-sb pb-1">{S.chips.map((b: string) => <button type="button" key={b} onClick={() => S.setActive(b)} aria-pressed={S.active === b} className={`mono h-9 shrink-0 px-4 text-[12px] border transition ${S.active === b ? SKIN.chipOn : SKIN.chip} rounded-lg`}>{b}</button>)}</div>

        {view === 'grid' ? (
          <div className="mt-7 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((p: any, i: number) => {
              const pct = discountPct(p); const st = stockState(p)
              return (
                <article key={p.id} onMouseMove={track} className="spot pm-reveal group rounded-2xl border border-white/10 bg-[#0B0D11] p-2.5 transition hover:border-[var(--pm-accent)]/45 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_var(--pm-accent)]">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-white/5">
                    <button type="button" onClick={() => S.openProduct(p)} aria-label={`View ${p.name}`} className="absolute inset-0 w-full h-full"><Img src={p.images[0]} alt={p.name} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.07] ${st === 'out' ? 'opacity-35 grayscale' : ''}`} /></button>
                    <span className="mono absolute top-2 left-2 text-[9.5px] tracking-wider bg-black/65 backdrop-blur px-1.5 h-5 inline-flex items-center rounded">#{String(i + 1).padStart(3, '0')}</span>
                    {S.isHot(p) && <span className="mono absolute bottom-2 right-2 text-[10px] font-bold bg-white text-black px-1.5 h-5 inline-flex items-center rounded">{S.c.hotBadge}</span>}
                    {pct > 0 && <span className="mono absolute bottom-2 left-2 text-[10px] font-bold bg-[var(--pm-accent)] text-black px-1.5 h-5 inline-flex items-center rounded">−{pct}%</span>}
                    <button type="button" onClick={() => S.toggleWish(p.id)} aria-label="Save" aria-pressed={S.isWished(p.id)} className={`absolute top-2 right-2 w-8 h-8 grid place-items-center rounded-lg bg-black/60 backdrop-blur transition ${S.isWished(p.id) ? 'text-[var(--pm-accent)]' : 'text-white hover:text-[var(--pm-accent)]'}`}><Ic.heart c="w-3.5 h-3.5" fill={S.isWished(p.id)} /></button>
                  </div>
                  <div className="pt-3 px-1 pb-1">
                    <button type="button" onClick={() => S.openProduct(p)} className="block w-full text-left"><div className="text-[13.5px] font-semibold truncate">{p.name}</div><div className="mono mt-1 text-[10.5px] text-white/40 truncate">{p.category || 'UNIT'}{p.sizes.length ? ` · ${p.sizes.length} sizes` : ''}</div></button>
                    <div className="mt-2.5"><StockBar p={p} /></div>
                    <div className="mt-3 flex items-center justify-between"><div className="mono"><span className="text-[15px] font-semibold text-[var(--pm-accent)]">{S.m(p.price)}</span>{p.original_price > 0 && <span className="ml-2 text-[10.5px] line-through text-white/30">{S.m(p.original_price)}</span>}</div>
                      <button type="button" disabled={st === 'out'} onClick={() => S.quickAdd(p)} aria-label={`Add ${p.name}`} className="w-9 h-9 grid place-items-center rounded-lg border border-white/15 hover:bg-[var(--pm-accent)] hover:text-black hover:border-[var(--pm-accent)] disabled:opacity-30 disabled:pointer-events-none transition"><Ic.plus c="w-4 h-4" /></button></div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="mt-7 divide-y divide-white/10 border-y border-white/10">
            {filtered.map((p: any, i: number) => {
              const st = stockState(p)
              return (
                <div key={p.id} onMouseMove={track} className="spot pm-reveal group grid grid-cols-[64px_1fr_auto] md:grid-cols-[72px_1.4fr_1fr_140px_120px_48px] items-center gap-4 py-3.5 px-2 hover:bg-white/[0.03] transition">
                  <button type="button" onClick={() => S.openProduct(p)} className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-lg overflow-hidden bg-white/5"><Img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /></button>
                  <button type="button" onClick={() => S.openProduct(p)} className="text-left min-w-0"><div className="text-[14.5px] font-semibold truncate">{p.name}</div><div className="mono text-[10.5px] text-white/40 mt-0.5">#{String(i + 1).padStart(3, '0')} · {p.category || 'UNIT'}</div></button>
                  <div className="hidden md:block"><StockBar p={p} /></div>
                  <div className="hidden md:block mono text-[11px] text-white/40 truncate">{p.sizes.length ? p.sizes.join(' / ') : '—'}</div>
                  <div className="mono text-right md:text-left"><div className="text-[15px] font-semibold text-[var(--pm-accent)]">{S.m(p.price)}</div>{p.original_price > 0 && <div className="text-[10.5px] line-through text-white/30">{S.m(p.original_price)}</div>}</div>
                  <button type="button" disabled={st === 'out'} onClick={() => S.quickAdd(p)} aria-label={`Add ${p.name}`} className="hidden md:grid w-10 h-10 place-items-center rounded-lg border border-white/15 hover:bg-[var(--pm-accent)] hover:text-black disabled:opacity-30 transition"><Ic.plus c="w-4 h-4" /></button>
                </div>
              )
            })}
          </div>
        )}
        {filtered.length === 0 && <div className="mono mt-8 rounded-2xl border border-dashed border-white/20 py-16 text-center text-white/50">&gt; NO UNITS MATCH QUERY<br /><button type="button" onClick={() => { S.setQuery(''); S.setActive('All'); S.setSavedOnly(false) }} className={`mt-5 h-11 px-6 font-bold ${SKIN.btn}`}>RESET</button></div>}
      </section>

      <footer className="border-t border-white/10 mono text-[12px] text-white/50">
        <div className="max-w-[1320px] mx-auto px-4 md:px-6 py-12 grid md:grid-cols-[1.4fr_1fr] gap-8">
          <div><div className="text-[var(--pm-accent)]">&gt; about --{String(c.headerLabel).toLowerCase().replace(/\s+/g, '-')}</div><p className="mt-3 max-w-[460px] leading-[1.8] text-white/55">{c.footerAbout}</p></div>
          <div className="space-y-1.5 md:text-right">{c.instagram && <div>ig: <span className="text-[var(--pm-accent)]">{c.instagram}</span></div>}{c.address && <div>loc: {c.address}</div>}<div>wa: {S.profile?.whatsapp_number}</div><div className="pt-3 text-white/30">{c.footerNote || `© ${S.profile?.business_name || c.headerLabel}`}</div></div>
        </div>
      </footer>

      <Overlays S={S} skin={SKIN} layout="modal" />
    </div>
  )
}
