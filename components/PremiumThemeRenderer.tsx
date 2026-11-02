'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import { SpikePremiumTheme } from './SpikePremiumTheme'
import { ShoeAppPremiumTheme } from './ShoeAppPremiumTheme'
import { TrenzoLuxuryTheme } from './TrenzoLuxuryTheme'
import { SleekBeigePremiumTheme } from './SleekBeigePremiumTheme'
import { SleekDarkPremiumTheme } from './SleekDarkPremiumTheme'
import { SleekEditorialPremiumTheme } from './SleekEditorialPremiumTheme'

/* =====================================================================
   PremiumThemeRenderer
   Single entry point used by the public store page (/s/[slug]) and the dashboard editor preview.

   This file also holds the shared pieces every premium theme builds on:
     1. CONFIG   product helpers, default copy per theme, the editor's field schema
     2. ENGINE   useStore (catalog, cart, wishlist), the full product page, the cart drawer, icons, base CSS
   Each theme file is just a view that receives the prepared store context as `S`.
   ===================================================================== */

/* ============================== 1. CONFIG ============================== */
/* =====================================================================
   PREMIUM THEMES — shared config
   One source of truth for: product helpers, default copy per theme,
   and the editor's field schema (so EVERYTHING in a theme is editable).
   ===================================================================== */

type ThemeId = 'spike-premium' | 'shoe-app-premium' | 'trenzo-luxury' | 'sleek-beige' | 'sleek-dark' | 'sleek-editorial'

/* ----------------------------- product helpers ----------------------------- */
function toList(v: any): string[] {
  if (Array.isArray(v)) return v.map(x => String(x).trim()).filter(Boolean)
  if (typeof v === 'string' && v.trim()) {
    const t = v.trim()
    if (t.startsWith('[')) { try { const a = JSON.parse(t); if (Array.isArray(a)) return a.map((x: any) => String(x).trim()).filter(Boolean) } catch { /* fall through */ } }
    return t.split(',').map(s => s.trim()).filter(Boolean)
  }
  return []
}

export function getImages(p: any): string[] {
  const out: string[] = []
  const push = (u: any) => { if (typeof u === 'string' && u.trim() && !out.includes(u.trim())) out.push(u.trim()) }
  if (Array.isArray(p?.image_urls)) p.image_urls.forEach(push)
  else if (typeof p?.image_urls === 'string' && p.image_urls.trim()) {
    try { const a = JSON.parse(p.image_urls); Array.isArray(a) ? a.forEach(push) : push(p.image_urls) } catch { push(p.image_urls) }
  }
  push(p?.image_url)
  return out
}

/** Normalised product: keeps every original field and adds clean, ready-to-render ones. */
function normalizeProduct(p: any) {
  const images = getImages(p)
  const price = Number(p?.price) || 0
  const orig = Number(p?.original_price) || 0
  const stockRaw = p?.stock
  const stock = stockRaw === undefined || stockRaw === null || stockRaw === '' ? undefined : Number(stockRaw)
  return {
    ...p,
    _raw: p?._raw || p,
    image_url: images[0] || p?.image_url || '',
    images,
    sizes: toList(p?.sizes),
    colors: toList(p?.colors),
    price,
    original_price: orig > price ? orig : 0,
    stock,
    category: p?.category || '',
    description: p?.description || '',
  } as any
}

const discountPct = (p: any): number => (p.original_price > p.price && p.original_price > 0 ? Math.round((1 - p.price / p.original_price) * 100) : 0)
const stockState = (p: any): 'in' | 'low' | 'out' => (p.stock === undefined ? 'in' : p.stock <= 0 ? 'out' : p.stock <= 5 ? 'low' : 'in')
const fmt = (n: number) => Math.round(Number(n) || 0).toLocaleString('en-US')
const splitLines = (s: any): string[] => String(s ?? '').split(/\\n|\n/)

const COLOR_MAP: Record<string, string> = {
  black: '#111111', white: '#FFFFFF', 'off white': '#F5F2EA', offwhite: '#F5F2EA', cream: '#F3EBD8', ivory: '#FFFFF0', beige: '#D8C7A8', sand: '#D9C7A0', tan: '#C19A6B', khaki: '#BDB76B', brown: '#6B4423', chocolate: '#4B2E1E',
  grey: '#8A8A8A', gray: '#8A8A8A', silver: '#C0C0C0', charcoal: '#36454F', red: '#D62828', maroon: '#7B1E2B', burgundy: '#6D1A36', pink: '#F2A1C1', rose: '#E8A0B4', orange: '#F28C28', peach: '#F7B896', yellow: '#F5D327', mustard: '#D4A017', gold: '#C9A227',
  green: '#2E8B57', olive: '#6B7B3A', mint: '#A8E6CF', teal: '#1B8A8F', blue: '#2563EB', navy: '#1B2A49', 'sky blue': '#7EC8E3', skyblue: '#7EC8E3', 'light blue': '#A9D6F5', purple: '#7C3AED', lavender: '#B9A7E8', violet: '#8F5BD8', multi: 'conic-gradient(#D62828,#F5D327,#2E8B57,#2563EB,#7C3AED,#D62828)',
}
function cssColor(name: string): string | null {
  const n = String(name || '').trim().toLowerCase()
  if (!n) return null
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(n)) return n
  if (COLOR_MAP[n]) return COLOR_MAP[n]
  const last = n.split(/[\s/-]+/).pop() || ''
  return COLOR_MAP[last] || null
}

/* ------------------------------ editor schema ------------------------------ */
type FieldType = 'text' | 'textarea' | 'image' | 'chips' | 'list' | 'color' | 'toggle'
export type Field = { key: string; label: string; type: FieldType; placeholder?: string; hint?: string; half?: boolean; items?: { key: string; label: string; placeholder?: string; multiline?: boolean }[]; max?: number }
type Section = { id: string; label: string; sub: string; fields: Field[] }

const t = (key: string, label: string, o: Partial<Field> = {}): Field => ({ key, label, type: 'text', ...o })
const ta = (key: string, label: string, o: Partial<Field> = {}): Field => ({ key, label, type: 'textarea', ...o })
const img = (key: string, label: string, o: Partial<Field> = {}): Field => ({ key, label, type: 'image', ...o })
const tg = (key: string, label: string, o: Partial<Field> = {}): Field => ({ key, label, type: 'toggle', ...o })

const BRAND: Section = { id: 'brand', label: 'Brand', sub: 'Logo, top bar and accent color', fields: [
  img('logoImage', 'Logo image', { hint: 'Optional. Replaces the text logo. Pick from your product photos or upload one.' }),
  t('headerLabel', 'Store name in header', { placeholder: 'Your brand' }),
  tg('showAnnouncement', 'Show announcement bar'),
  t('announcement', 'Announcement text', { placeholder: 'FREE SHIPPING • NEW DROP • COD' }),
  { key: 'accent', label: 'Accent color', type: 'color', hint: 'Used for buttons, badges and highlights across the whole store.' },
] }

const HIGHLIGHTS: Section = { id: 'highlights', label: 'Highlights', sub: 'Stats and trust badges', fields: [
  tg('showStats', 'Show stats'),
  { key: 'stats', label: 'Stats', type: 'list', max: 4, items: [{ key: 'value', label: 'Value', placeholder: '500+' }, { key: 'label', label: 'Label', placeholder: 'Orders' }] },
  { key: 'trustBadges', label: 'Trust badges', type: 'chips', hint: 'Shown on the product page and in the store. Press Enter to add.' },
] }

const COLLECTION: Section = { id: 'collection', label: 'Collection', sub: 'Product grid, filters and badges', fields: [
  t('collectionTitle', 'Section title'),
  t('collectionSubtitle', 'Section subtitle'),
  { key: 'brands', label: 'Filter chips', type: 'chips', hint: 'Customers tap these to filter products. "Sale" and "New" are smart filters.' },
  tg('showSearch', 'Show search', { half: true }),
  tg('showSort', 'Show sorting', { half: true }),
  t('hotBadge', 'Hot badge text', { half: true, placeholder: 'HOT' }),
  t('freeShippingBadge', 'Free shipping badge', { half: true, placeholder: 'FREE SHIPPING' }),
] }

const PRODUCT: Section = { id: 'product', label: 'Product page', sub: 'What customers see after tapping a product', fields: [
  ta('deliveryNote', 'Delivery info'),
  ta('returnNote', 'Returns info'),
  ta('sizeGuide', 'Size guide text', { hint: 'Shown when customers tap "Size guide" on a product with sizes.' }),
  tg('showSimilar', 'Show "You may also like"'),
] }

const CART: Section = { id: 'cart', label: 'Cart & checkout', sub: 'Cart wording and the WhatsApp order', fields: [
  t('cartTitle', 'Cart title', { half: true }),
  t('cartEmpty', 'Empty cart message', { half: true }),
  t('orderButton', 'Order button text', { half: true }),
  t('orderIntro', 'WhatsApp message heading', { half: true, placeholder: 'New order' }),
  t('freeShippingOver', 'Free shipping over', { half: true, placeholder: '5000', hint: 'Shows a progress bar in the cart. Leave 0 to hide.' }),
  t('currency', 'Currency label', { half: true, placeholder: 'Rs.' }),
] }

const FOOTER: Section = { id: 'footer', label: 'Footer', sub: 'About text and contact details', fields: [
  ta('footerAbout', 'About your store'),
  t('instagram', 'Instagram handle', { half: true, placeholder: '@yourbrand' }),
  t('address', 'Address / city', { half: true }),
  t('footerNote', 'Footer note', { placeholder: '© Your Brand. All rights reserved.' }),
] }

const heroFields = (extra: Field[] = [], second = false): Field[] => [
  t('heroBadge', 'Badge'),
  ta('heroTitle', 'Headline', { hint: 'Use \\n for a line break.' }),
  ta('heroSubtitle', 'Subtitle'),
  t('ctaText', 'Main button', { half: true }),
  t('secondaryCta', 'Second button', { half: true }),
  img('heroImage', 'Header image', { hint: 'Choose any photo from your product gallery, upload a new one, or paste a link.' }),
  ...(second ? [img('heroImage2', 'Second image', { hint: 'Optional. Defaults to your second product photo.' })] : []),
  t('featuredLabel', 'Featured label'),
  ...extra,
]

const EXTRA: Record<ThemeId, Section> = {
  'spike-premium': { id: 'street', label: 'Street style', sub: 'Sticker, trending card and ticker', fields: [
    ta('stickerText', 'Sticker text', { hint: 'Use \\n for a line break.' }),
    t('trendingLabel', 'Trending card title'),
    t('tickerText', 'Scrolling strip text', { hint: 'Repeats across the black strip. Leave empty to use your filter chips.' }),
    t('whyTitle', 'Benefits title'),
  ] },
  'shoe-app-premium': { id: 'app', label: 'App cards', sub: 'Greeting, promo and member perks', fields: [
    t('greeting', 'Greeting'),
    t('newDropLabel', 'New drop label'),
    t('promoBadge', 'Promo badge', { half: true }),
    t('promoCta', 'Promo button', { half: true }),
    ta('promoTitle', 'Promo title', { hint: 'Use \\n for a line break.' }),
    ta('memberPerksTitle', 'Perks title', { hint: 'Use \\n for a line break.' }),
    t('memberPerksDesc', 'Perks description'),
    t('memberCta', 'Perks button'),
  ] },
  'trenzo-luxury': { id: 'maison', label: 'The Maison', sub: 'Eyebrow, stories and concierge', fields: [
    t('eyebrow', 'Eyebrow'),
    t('storiesTitle', 'Stories title'),
    { key: 'stories', label: 'Brand stories', type: 'list', max: 4, items: [{ key: 'title', label: 'Title' }, { key: 'desc', label: 'Description', multiline: true }] },
    t('conciergeTitle', 'Concierge title'),
    ta('conciergeText', 'Concierge text'),
    t('conciergeCta', 'Concierge button'),
  ] },
  'sleek-beige': { id: 'lookbook', label: 'Lookbook', sub: 'Lookbook banner and reviews', fields: [
    t('lookbookTitle', 'Lookbook title'),
    ta('lookbookText', 'Lookbook text'),
    img('lookbookImage', 'Lookbook image', { hint: 'Defaults to a product photo.' }),
    { key: 'testimonials', label: 'Customer reviews', type: 'list', max: 4, items: [{ key: 'name', label: 'Name' }, { key: 'text', label: 'Review', multiline: true }] },
  ] },
  'sleek-dark': { id: 'system', label: 'System', sub: 'Status line, inventory and features', fields: [
    t('statusLine', 'Status line'),
    t('hudLabel', 'Inventory label'),
    { key: 'features', label: 'Feature cards', type: 'list', max: 4, items: [{ key: 'title', label: 'Title' }, { key: 'desc', label: 'Description', multiline: true }] },
  ] },
  'sleek-editorial': { id: 'editorial', label: 'Editorial', sub: 'Issue line, editor’s letter and quote', fields: [
    t('issueLabel', 'Issue line'),
    t('editorLetterTitle', 'Letter title'),
    ta('editorLetter', 'Editor’s letter'),
    ta('pullQuote', 'Pull quote'),
    t('pullQuoteBy', 'Quote credit'),
  ] },
}

export function buildSchema(themeId: string): Section[] {
  const id = (EXTRA[themeId as ThemeId] ? themeId : 'spike-premium') as ThemeId
  const second = id === 'sleek-beige' || id === 'sleek-editorial' || id === 'trenzo-luxury'
  const hero: Section = { id: 'hero', label: 'Hero', sub: 'Headline, buttons and header image', fields: heroFields([], second) }
  return [BRAND, hero, EXTRA[id], HIGHLIGHTS, COLLECTION, PRODUCT, CART, FOOTER]
}

/* -------------------------------- defaults -------------------------------- */
const COMMON: Record<string, any> = {
  logoImage: '', headerLabel: '', showAnnouncement: true, announcement: '', accent: '#E8FF86',
  heroBadge: '', heroTitle: '', heroSubtitle: '', ctaText: 'Shop now', secondaryCta: 'View cart', heroImage: '', heroImage2: '', featuredLabel: 'Featured',
  showStats: true, stats: [{ value: '500+', label: 'Orders' }, { value: '4.9★', label: 'Rating' }, { value: 'COD', label: 'Available' }],
  trustBadges: ['Free delivery', '7-day returns', 'Cash on delivery'],
  collectionTitle: 'Collection', collectionSubtitle: '', brands: ['All', 'New', 'Sale'], showSearch: true, showSort: true, hotBadge: 'HOT', freeShippingBadge: 'FREE SHIPPING',
  deliveryNote: 'Ships within 24 hours. Cash on delivery available nationwide.',
  returnNote: '7-day easy returns on unworn items with tags attached.',
  sizeGuide: 'Choose your usual size. Between sizes? Go one size up for comfort.',
  showSimilar: true,
  cartTitle: 'Your cart', cartEmpty: 'Your cart is empty', orderButton: 'Order on WhatsApp', orderIntro: 'New order', freeShippingOver: '5000', currency: 'Rs.',
  footerAbout: 'Quality products, delivered to your door with cash on delivery.', instagram: '', address: '', footerNote: '',
}

const DEFAULTS: Record<ThemeId, Record<string, any>> = {
  'spike-premium': {
    accent: '#E8FF86', headerLabel: 'SPIKE', announcement: 'FREE SHIPPING OVER RS. 5000 • NEW DROP LIVE • COD AVAILABLE',
    heroBadge: 'NEW DROP • LIVE • COD', heroTitle: 'THE JOURNEY\nBEGINS WITH\nTHE PERFECT PAIR', heroSubtitle: 'Unmatched comfort. Unapologetic style. Find the stride that is yours.',
    ctaText: 'Shop the drop', secondaryCta: 'Open cart', featuredLabel: 'Trending now',
    stickerText: 'NEW\nDROP', trendingLabel: 'Trending now', tickerText: '', whyTitle: 'Why people love us',
    collectionTitle: 'The collection', collectionSubtitle: 'Premium curated drops', brands: ['All', 'Nike', 'Adidas', 'Puma', 'New Balance', 'Sale'],
    footerAbout: 'Fresh kicks and everyday essentials, delivered across Pakistan with cash on delivery.',
  },
  'shoe-app-premium': {
    accent: '#7C3AED', headerLabel: 'Shoe App', announcement: 'LIVE • COD • FREE SHIPPING OVER RS. 5000',
    greeting: 'Hey there 👋', newDropLabel: 'NEW DROP', heroBadge: 'JUST LANDED', heroTitle: 'Step into\nyour next pair', heroSubtitle: 'Fresh drops, easy returns and cash on delivery. Your sneaker app, always open.',
    ctaText: 'Browse shoes', secondaryCta: 'My cart', featuredLabel: 'Top pick',
    promoBadge: 'BLACK FRIDAY', promoTitle: 'GET UP TO\n50% OFF', promoCta: 'Shop sale', memberPerksTitle: 'Free shipping\n+ 7 days return', memberPerksDesc: 'Early access to drops, COD and priority support.', memberCta: 'Join free',
    collectionTitle: 'All shoes', collectionSubtitle: 'Fresh from the shelf', brands: ['All', 'Nike', 'Adidas', 'New', 'Sale'],
    footerAbout: 'Your favourite sneakers, one tap away. Fast delivery and easy returns.',
  },
  'trenzo-luxury': {
    accent: '#C9A96B', headerLabel: 'TRENZO', announcement: 'COMPLIMENTARY SHIPPING • CONCIERGE ON WHATSAPP • HAND-FINISHED',
    eyebrow: 'EST. 2018 • LUXURY CURATED', heroBadge: 'The Collection', heroTitle: 'A reflection\nof personal\nstyling', heroSubtitle: 'A curated collection of hand-finished pieces, ethically sourced and made to be kept for years.',
    ctaText: 'Explore the collection', secondaryCta: 'Private concierge', featuredLabel: 'Featured piece',
    storiesTitle: 'The Maison', stories: [{ title: 'Craftsmanship', desc: 'Hand-stitched over 48 hours from premium hide.' }, { title: 'Heritage', desc: 'Since 2018, curated for modern icons.' }, { title: 'Sustainability', desc: 'Ethically sourced and carbon neutral.' }],
    conciergeTitle: 'Private shopping,\non WhatsApp', conciergeText: 'Speak with our concierge for sizing, styling advice and bespoke requests.', conciergeCta: 'Begin a conversation',
    collectionTitle: 'Curated pieces', collectionSubtitle: 'Hand-finished • Ethically sourced', brands: ['All', 'New', 'Sale'],
    footerAbout: 'Quiet luxury for the considered wardrobe. Every piece is inspected by hand before it leaves our atelier.',
  },
  'sleek-beige': {
    accent: '#B5603A', headerLabel: 'Beige Studio', announcement: 'FREE SHIPPING • NEW ARRIVALS • COD AVAILABLE',
    heroBadge: 'The warm edit', heroTitle: 'Warm minimal\nluxury for\neveryday life', heroSubtitle: 'Soft tones, natural texture and a thoughtful stitch, made for people who value calm.',
    ctaText: 'Shop the edit', secondaryCta: 'View cart', featuredLabel: 'Customer favourite',
    lookbookTitle: 'The Autumn Lookbook', lookbookText: 'Layered neutrals, relaxed silhouettes and quiet details for slower, softer days.',
    testimonials: [{ name: 'Ayesha K.', text: 'The quality is unreal. Soft, warm and exactly like the photos.' }, { name: 'Hamza R.', text: 'Fast delivery and the fit was perfect. Will order again.' }, { name: 'Sana M.', text: 'Beautiful packaging and such a calm, premium feel.' }],
    collectionTitle: 'Shop the edit', collectionSubtitle: 'Soft, warm, considered', brands: ['All', 'New', 'Sale'],
    footerAbout: 'A small studio making calm, considered pieces. Thank you for supporting independent fashion.',
  },
  'sleek-dark': {
    accent: '#E8FF86', headerLabel: 'NOIR/STORE', announcement: 'DARK MODE • 24H DISPATCH • COD • FREE SHIPPING',
    statusLine: 'ALL SYSTEMS LIVE', heroBadge: 'DROP 001 • ONLINE', heroTitle: 'Noir luxury,\nmidnight\nicon.', heroSubtitle: 'Deep black, subtle glow and a precise finish. Built for night, worn with intent.',
    ctaText: 'Enter the drop', secondaryCta: 'Open cart', featuredLabel: 'Featured unit', hudLabel: 'LIVE INVENTORY',
    features: [{ title: '24H dispatch', desc: 'Every order leaves our warehouse within a day.' }, { title: 'Cash on delivery', desc: 'Inspect it first. Pay when it arrives.' }, { title: '7-day returns', desc: 'Not right? Send it back, no questions asked.' }],
    collectionTitle: 'Inventory', collectionSubtitle: 'Live stock levels', brands: ['All', 'New', 'Sale'],
    footerAbout: 'Dark, sharp and built to last. Limited drops, shipped fast.',
  },
  'sleek-editorial': {
    accent: '#C8321E', headerLabel: '', announcement: 'THE MINIMAL EDITION • FREE SHIPPING • COD AVAILABLE',
    issueLabel: 'Issue Nº 07 — The Minimal Edition', heroBadge: 'Cover story', heroTitle: 'Less, but\nbetter.', heroSubtitle: 'An edit of clean lines and intentional whitespace: pieces that say more by saying less.',
    ctaText: 'Read the edit', secondaryCta: 'Open cart', featuredLabel: 'Pictured',
    editorLetterTitle: 'A note from the editor', editorLetter: 'This season we stripped everything back. Fewer pieces, better materials, and a finish you can feel. Each item in this issue was chosen because it earns its place, and because we would wear it ourselves.\n\nTake your time. Read the edit, find the piece that speaks to you, and order in a few taps. We will take care of the rest.',
    pullQuote: 'Luxury is not about more. It is about meaning.', pullQuoteBy: 'The Editors',
    collectionTitle: 'The index', collectionSubtitle: 'Every piece in this issue', brands: ['All', 'New', 'Sale'],
    footerAbout: 'An independent store with an editorial eye. Printed on nothing, delivered to everywhere.',
  },
}

/* --------------------------- content resolution --------------------------- */
export function resolveContent(themeId: string, profile: any): Record<string, any> {
  const id = (DEFAULTS[themeId as ThemeId] ? themeId : 'spike-premium') as ThemeId
  const raw = profile?.premium_custom || {}
  const legacy: Record<string, any> = {}
  if (!raw.heroTitle && raw.spikeTitle) legacy.heroTitle = raw.spikeTitle
  if (!raw.heroSubtitle && raw.spikeSub) legacy.heroSubtitle = raw.spikeSub
  if (!raw.brands) { const b = raw.filters || raw.spikeBrands; if (Array.isArray(b) && b.length) legacy.brands = b }
  if (!raw.heroBadge && raw.badge) legacy.heroBadge = raw.badge
  if (!raw.stats && (raw.statsOrders || raw.statsRating || raw.statsCod)) {
    legacy.stats = [{ value: raw.statsOrders || '500+', label: 'Orders' }, { value: raw.statsRating || '4.9★', label: 'Rating' }, { value: raw.statsCod || 'COD', label: 'Available' }]
  }
  const clean: Record<string, any> = {}
  Object.keys(raw).forEach(k => { const v = raw[k]; if (!(v === '' || v === null || v === undefined || (Array.isArray(v) && v.length === 0))) clean[k] = v })
  const out: Record<string, any> = { ...COMMON, ...DEFAULTS[id], ...legacy, ...clean }
  if (!Array.isArray(out.brands) || out.brands.length === 0) out.brands = ['All']
  if (!out.headerLabel) out.headerLabel = profile?.business_name || 'Store'
  return out
}

/* ============================== 2. ENGINE ============================== */
/* =====================================================================
   Skin: the only thing that differs between the product page / cart of
   each theme. Everything else (data, logic, features) is shared.
   ===================================================================== */
type Skin = {
  root: string; panel: string; drawer: string; scrim: string; muted: string; line: string; soft: string
  chip: string; chipOn: string; chipR: string; btn: string; btnAlt: string; input: string; title: string; dock: string
}

/* -------------------------------- icons -------------------------------- */
const sv = (d: React.ReactNode, w = 1.8) => ({ c = 'w-4 h-4', fill = false }: { c?: string; fill?: boolean }) => (
  <svg className={c} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden>{d}</svg>
)
const Ic = {
  cart: sv(<><path d="M6 7h13l-1.3 8.2a2 2 0 0 1-2 1.8H9a2 2 0 0 1-2-1.6L5.5 4H3" /><circle cx="9.5" cy="20" r="1" /><circle cx="17" cy="20" r="1" /></>),
  bag: sv(<><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>),
  heart: sv(<path d="M12 20s-7.5-4.6-9-9.2C2 7.600 4 5 6.800 5c1.800 0 3.300 1 5.200 3 1.900-2 3.400-3 5.200-3C20 5 22 7.600 21 10.800 19.500 15.400 12 20 12 20Z" />),
  search: sv(<><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.200-4.200" /></>),
  x: sv(<path d="M18 6 6 18M6 6l12 12" />, 2),
  arrow: sv(<path d="M7 17 17 7M8 7h9v9" />, 2),
  right: sv(<path d="M5 12h14M13 6l6 6-6 6" />, 2),
  left: sv(<path d="M19 12H5M11 6l-6 6 6 6" />, 2),
  plus: sv(<path d="M12 5v14M5 12h14" />, 2),
  minus: sv(<path d="M5 12h14" />, 2),
  check: sv(<path d="m5 12.500 4.500 4.500L19 7.500" />, 2.4),
  share: sv(<><circle cx="18" cy="5" r="2.500" /><circle cx="6" cy="12" r="2.500" /><circle cx="18" cy="19" r="2.500" /><path d="m8.200 10.800 7.600-4.600M8.200 13.200l7.600 4.600" /></>),
  truck: sv(<><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.600" /><circle cx="17" cy="18" r="1.600" /></>),
  undo: sv(<><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></>),
  star: sv(<path d="m12 3 2.700 5.600 6.100.9-4.400 4.300 1 6.100L12 17l-5.400 2.900 1-6.100L3.200 9.500l6.100-.9L12 3Z" />),
  chev: sv(<path d="m6 9 6 6 6-6" />, 2),
  grid: sv(<><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></>),
  list: sv(<path d="M4 6h16M4 12h16M4 18h16" />, 2),
  home: sv(<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4v-9Z" />),
  ruler: sv(<><path d="m3 17 14-14 4 4L7 21l-4-4Z" /><path d="m8 8 2 2M11 5l2 2M5 11l2 2" /></>),
  chat: sv(<path d="M4 5h16v11H9l-5 4V5Z" />),
  sparkle: sv(<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3" />),
}

/* ------------------------------ small pieces ------------------------------ */
function Img({ src, alt = '', className = '', style }: { src?: string; alt?: string; className?: string; style?: React.CSSProperties }) {
  const [bad, setBad] = useState(false)
  useEffect(() => setBad(false), [src])
  if (!src || bad) {
    return (
      <div className={`${className} grid place-items-center bg-gradient-to-br from-black/[0.04] to-black/[0.14] text-current opacity-80`} style={style} role="img" aria-label={alt || 'No image'}>
        <svg className="w-8 h-8 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.600" /><path d="m21 16-5-5-9 9" /></svg>
      </div>
    )
  }
  return <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setBad(true)} className={className} style={style} />
}

function Swatch({ name, on, onClick, size = 'w-8 h-8', skin }: { name: string; on: boolean; onClick: () => void; size?: string; skin: Skin }) {
  const css = cssColor(name)
  if (!css) return <button type="button" onClick={onClick} aria-pressed={on} className={`h-9 px-3.5 text-[12px] font-semibold border transition ${skin.chipR} ${on ? skin.chipOn : skin.chip}`}>{name}</button>
  return (
    <button type="button" onClick={onClick} aria-label={name} aria-pressed={on} title={name} className={`relative ${size} rounded-full border border-black/15 transition-transform hover:scale-110 ${on ? 'scale-110' : ''}`} style={{ background: css }}>
      {on && <span className="absolute -inset-[3px] rounded-full border-2" style={{ borderColor: 'var(--pm-accent)' }} />}
    </button>
  )
}

function PriceLine({ p, S, className = '', big = 'text-[18px]', strike = 'text-[12px] opacity-50' }: { p: any; S: any; className?: string; big?: string; strike?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-2 flex-wrap ${className}`}>
      <span className={`font-extrabold tabular-nums ${big}`}>{S.m(p.price)}</span>
      {p.original_price > 0 && <span className={`line-through tabular-nums ${strike}`}>{S.m(p.original_price)}</span>}
    </span>
  )
}

const SearchBox = ({ S, className = '', inputClass = '', icon = 'w-4 h-4', id }: any) => (
  <label className={`relative flex items-center ${className}`}>
    <span className="absolute left-3.5 pointer-events-none opacity-60"><Ic.search c={icon} /></span>
    <input id={id} value={S.query} onChange={e => S.setQuery(e.target.value)} placeholder="Search products" aria-label="Search products" className={`w-full pl-10 pr-3 outline-none ${inputClass}`} />
  </label>
)
const SortSelect = ({ S, className = '' }: any) => (
  <select value={S.sort} onChange={e => S.setSort(e.target.value)} aria-label="Sort products" className={`outline-none cursor-pointer ${className}`}>
    <option value="featured">Featured</option>
    <option value="price-asc">Price: low to high</option>
    <option value="price-desc">Price: high to low</option>
    <option value="name">Name A–Z</option>
  </select>
)

/* =====================================================================
   useStore — everything a theme needs (content, catalog, cart, wishlist)
   ===================================================================== */
function useStore(props: any, themeId: string) {
  const { profile, products: rawProducts, cart: rawCart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct, onRemove } = props
  const cart: any[] = rawCart || []
  const rootRef = useRef<HTMLDivElement>(null)
  const c = useMemo(() => resolveContent(themeId, profile), [themeId, profile])
  const products = useMemo(() => (rawProducts || []).map(normalizeProduct), [rawProducts])

  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('featured')
  const [active, setActive] = useState('All')
  const [savedOnly, setSavedOnly] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimer = useRef<any>(null)

  /* wishlist (per store, remembered on this device) */
  const wishKey = `pm-wish-${profile?.store_slug || profile?.id || 'store'}`
  const [wish, setWish] = useState<string[]>([])
  useEffect(() => { try { const v = localStorage.getItem(wishKey); setWish(v ? JSON.parse(v) : []) } catch { setWish([]) } }, [wishKey])
  const toggleWish = (id: string) => setWish(prev => {
    const n = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    try { localStorage.setItem(wishKey, JSON.stringify(n)) } catch { /* private mode */ }
    return n
  })

  /* catalog */
  const chips = useMemo(() => { const b = (c.brands as any[]).map(x => String(x)); return b.some(x => x.toLowerCase() === 'all') ? b : ['All', ...b] }, [c.brands])
  const matchChip = (p: any, chip: string) => {
    const k = chip.trim().toLowerCase()
    if (!k || k === 'all') return true
    if (k === 'sale') return discountPct(p) > 0 || /sale/i.test(`${p.name} ${p.category}`)
    if (k === 'new') return products.indexOf(p) < 4
    return `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(k)
  }
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = products.filter((p: any) => matchChip(p, active) && (!q || `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q)) && (!savedOnly || wish.includes(p.id)))
    if (sort === 'price-asc') list = [...list].sort((a: any, b: any) => a.price - b.price)
    else if (sort === 'price-desc') list = [...list].sort((a: any, b: any) => b.price - a.price)
    else if (sort === 'name') list = [...list].sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)))
    return list
  }, [products, active, query, sort, savedOnly, wish])

  /* cart */
  const cartCount = cart.length
  const cartTotal = cart.reduce((s: number, p: any) => s + (Number(p.price) || 0), 0)
  const lines = useMemo(() => {
    const m = new Map<string, any>()
    cart.forEach((it: any, idx: number) => {
      const k = `${it.id}|${it.selectedSize || ''}|${it.selectedColor || ''}`
      const e = m.get(k)
      if (e) { e.qty += 1; e.idxs.push(idx) }
      else m.set(k, { key: k, item: normalizeProduct(it), raw: it, size: it.selectedSize || '', color: it.selectedColor || '', qty: 1, idxs: [idx] })
    })
    return Array.from(m.values())
  }, [cart])

  const openCart = () => { setCartOpen(true); if (setShowCart) setShowCart(true) }
  const closeCart = () => { setCartOpen(false); if (setShowCart) setShowCart(false) }
  const flash = (msg: string) => { setToast(msg); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 2600) }
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const sel = useMemo(() => (selectedProduct ? normalizeProduct(selectedProduct) : null), [selectedProduct])
  const openProduct = (p: any) => { if (onOpen) onOpen(p._raw || p) }
  const closeProduct = () => { if (setSelectedProduct) setSelectedProduct(null) }
  const addToCart = (p: any, qty = 1, o: { size?: string; color?: string } = {}) => {
    if (onAdd) onAdd({ ...(p._raw || p), selectedSize: o.size || '', selectedColor: o.color || '' }, qty)
    flash(`${p.name} added to cart`)
  }
  const quickAdd = (p: any) => {
    if (stockState(p) === 'out') { flash('Sorry, this item is sold out'); return }
    if (p.sizes.length || p.colors.length) openProduct(p)
    else addToCart(p, 1)
  }
  const changeQty = (l: any, d: number) => {
    if (d > 0 && onAdd) onAdd(l.raw, 1)
    if (d < 0 && onRemove) onRemove(l.idxs[l.idxs.length - 1])
  }

  const m = (n: number) => `${c.currency || 'Rs.'} ${fmt(n)}`
  const digits = String(profile?.whatsapp_number || '').replace(/\D/g, '')
  const storeUrl = typeof window !== 'undefined' ? (profile?.store_slug ? `${window.location.origin}/s/${profile.store_slug}` : window.location.href) : ''
  const scrollTo = (e: React.MouseEvent, id: string) => { (e.currentTarget as HTMLElement).ownerDocument.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const heroImg = c.heroImage || products[0]?.images[0] || ''
  const heroImg2 = c.heroImage2 || products[1]?.images[0] || products[0]?.images[1] || heroImg
  const initial = String(c.headerLabel || profile?.business_name || 'S').trim().charAt(0).toUpperCase()

  return {
    c, profile, products, filtered, chips, active, setActive, query, setQuery, sort, setSort, savedOnly, setSavedOnly,
    wish, toggleWish, isWished: (id: string) => wish.includes(id),
    cart, cartCount, cartTotal, lines, cartOpen, openCart, closeCart, changeQty, canRemove: !!onRemove,
    sel, openProduct, closeProduct, addToCart, quickAdd, track, toast, flash, onAdd,
    ui: UI,
    isHot: (p: any) => products.indexOf(p) < 2 && stockState(p) !== 'out',
    m, digits, storeUrl, scrollTo, heroImg, heroImg2, initial, rootRef, lines2: lines,
    cssVars: { ['--pm-accent' as any]: c.accent || '#E8FF86' } as React.CSSProperties,
  } as any
}

/* =====================================================================
   Gallery (carousel with swipe + thumbs, or stacked)
   ===================================================================== */
function Gallery({ p, skin, mode, onZoom }: { p: any; skin: Skin; mode: 'carousel' | 'stack'; onZoom: (i: number) => void }) {
  const images: string[] = p.images.length ? p.images : ['']
  const [i, setI] = useState(0)
  const touch = useRef<number | null>(null)
  const go = (d: number) => setI(x => (x + d + images.length) % images.length)
  const pct = discountPct(p)

  if (mode === 'stack') {
    return (
      <div className="flex lg:grid gap-2 lg:gap-3 overflow-x-auto lg:overflow-visible snap-x snap-mandatory pm-sb">
        {images.map((u, k) => (
          <button type="button" key={k} onClick={() => onZoom(k)} aria-label={`Zoom image ${k + 1}`} className="relative shrink-0 w-[86%] sm:w-[60%] lg:w-full snap-center aspect-[4/5] overflow-hidden group cursor-zoom-in">
            <Img src={u} alt={p.name} className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.04]" />
            {k === 0 && pct > 0 && <span className="absolute top-3 left-3 h-6 px-2.5 inline-flex items-center text-[11px] font-bold bg-[var(--pm-accent)] text-black">−{pct}%</span>}
          </button>
        ))}
      </div>
    )
  }
  return (
    <div className="select-none">
      <div
        className="relative aspect-square md:aspect-[4/5] overflow-hidden group cursor-zoom-in"
        onTouchStart={e => { touch.current = e.touches[0].clientX }}
        onTouchEnd={e => { if (touch.current === null) return; const d = e.changedTouches[0].clientX - touch.current; if (Math.abs(d) > 40) go(d < 0 ? 1 : -1); touch.current = null }}
        onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--zx', `${((e.clientX - r.left) / r.width) * 100}%`); e.currentTarget.style.setProperty('--zy', `${((e.clientY - r.top) / r.height) * 100}%`) }}
      >
        <button type="button" onClick={() => onZoom(i)} aria-label="Zoom image" className="absolute inset-0 w-full h-full">
          <Img key={i} src={images[i]} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 pm-fade md:group-hover:scale-[1.8]" style={{ transformOrigin: 'var(--zx,50%) var(--zy,50%)' }} />
        </button>
        {pct > 0 && <span className="absolute top-3 left-3 h-6 px-2.5 inline-flex items-center text-[11px] font-bold bg-[var(--pm-accent)] text-black pointer-events-none">−{pct}%</span>}
        {images.length > 1 && (
          <>
            <span className="absolute top-3 right-3 h-6 px-2.5 inline-flex items-center text-[10px] font-semibold bg-black/55 text-white backdrop-blur pointer-events-none rounded-full tabular-nums">{i + 1}/{images.length}</span>
            <button type="button" aria-label="Previous image" onClick={() => go(-1)} className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 text-black grid place-items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition shadow"><Ic.left c="w-4 h-4" /></button>
            <button type="button" aria-label="Next image" onClick={() => go(1)} className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 text-black grid place-items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition shadow"><Ic.right c="w-4 h-4" /></button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pm-sb px-0.5 pb-1">
          {images.map((u, k) => (
            <button type="button" key={k} onClick={() => setI(k)} aria-label={`Show image ${k + 1}`} aria-current={k === i} className={`w-16 h-16 shrink-0 overflow-hidden border-2 transition ${skin.chipR} ${k === i ? 'border-[var(--pm-accent)] opacity-100' : 'border-transparent opacity-55 hover:opacity-100'}`}>
              <Img src={u} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* =====================================================================
   ProductDetail — full product page: gallery, price/discount, stock,
   description, colors, sizes + guide, qty, delivery/returns, similar
   ===================================================================== */
function ProductDetail({ S, skin, layout }: { S: any; skin: Skin; layout: 'modal' | 'sheet' | 'full' }) {
  const p = S.sel
  const c = S.c
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState('')
  const [color, setColor] = useState<string>(p.colors[0] || '')
  const [qty, setQty] = useState(1)
  const [err, setErr] = useState(false)
  const [more, setMore] = useState(false)
  const [guide, setGuide] = useState(false)
  const [tab, setTab] = useState<'delivery' | 'returns' | 'details'>('delivery')
  const [zoom, setZoom] = useState<number | null>(null)
  const st = stockState(p)
  const out = st === 'out'
  const max = p.stock !== undefined ? Math.max(1, p.stock) : 99
  const pct = discountPct(p)
  const long = String(p.description).length > 180

  useEffect(() => {
    const doc = ref.current?.ownerDocument
    if (!doc) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (zoomRef.current !== null) setZoom(null); else S.closeProduct() } }
    doc.addEventListener('keydown', onKey)
    const prev = doc.body.style.overflow
    doc.body.style.overflow = 'hidden'
    return () => { doc.removeEventListener('keydown', onKey); doc.body.style.overflow = prev }
  }, [])
  const zoomRef = useRef<number | null>(null)
  zoomRef.current = zoom

  const submit = (direct: boolean) => {
    if (out) return
    if (p.sizes.length && !size) {
      setErr(true); setTimeout(() => setErr(false), 700)
      ref.current?.querySelector('[data-sizes]')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return
    }
    S.addToCart(p, qty, { size, color })
    S.closeProduct()
    if (direct) setTimeout(S.openCart, 260)
  }

  const similar = useMemo(() => {
    const others = S.products.filter((x: any) => x.id !== p.id)
    const same = others.filter((x: any) => p.category && x.category === p.category)
    return [...same, ...others.filter((x: any) => !same.includes(x))].slice(0, 4)
  }, [S.products, p.id, p.category])

  const shareHref = `https://wa.me/?text=${encodeURIComponent(`${p.name} — ${S.m(p.price)}\n${S.storeUrl}`)}`
  const rows: [string, string][] = [
    ['Category', p.category || 'General'],
    ['Availability', out ? 'Sold out' : p.stock !== undefined && p.stock <= 20 ? `${p.stock} in stock` : 'In stock'],
    ...(p.sizes.length ? [['Sizes', p.sizes.join(', ')] as [string, string]] : []),
    ...(p.colors.length ? [['Colors', p.colors.join(', ')] as [string, string]] : []),
    ['Payment', 'Cash on delivery'],
  ]

  const closeBtn = (
    <button type="button" onClick={S.closeProduct} aria-label="Close" className={`w-9 h-9 grid place-items-center border ${skin.line} ${skin.chipR} hover:opacity-70 transition`}><Ic.x c="w-4 h-4" /></button>
  )

  const info = (
    <div className="flex flex-col gap-5 p-5 md:p-7">
      <div className="flex items-center justify-between gap-3">
        <div className={`flex items-center gap-2 text-[11px] flex-wrap ${skin.muted}`}>
          {p.category && <span className={`px-2.5 h-6 inline-flex items-center border ${skin.line} ${skin.chipR}`}>{p.category}</span>}
          <span className="inline-flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${st === 'out' ? 'bg-red-500' : st === 'low' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            {st === 'out' ? 'Sold out' : st === 'low' ? `Only ${p.stock} left` : 'In stock'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => S.toggleWish(p.id)} aria-label={S.isWished(p.id) ? 'Remove from saved' : 'Save'} aria-pressed={S.isWished(p.id)} className={`w-9 h-9 grid place-items-center border ${skin.line} ${skin.chipR} transition hover:opacity-70 ${S.isWished(p.id) ? 'text-red-500' : ''}`}><Ic.heart c="w-4 h-4" fill={S.isWished(p.id)} /></button>
          <a href={shareHref} target="_blank" rel="noreferrer" aria-label="Share on WhatsApp" className={`w-9 h-9 grid place-items-center border ${skin.line} ${skin.chipR} transition hover:opacity-70`}><Ic.share c="w-4 h-4" /></a>
          {layout !== 'full' && closeBtn}
        </div>
      </div>

      <div>
        <h2 className={`text-[26px] md:text-[32px] leading-[1.05] ${skin.title}`}>{p.name}</h2>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <PriceLine p={p} S={S} big="text-[24px]" strike="text-[14px] opacity-50" />
          {pct > 0 && <span className="h-6 px-2.5 inline-flex items-center text-[11px] font-bold bg-[var(--pm-accent)] text-black rounded-full">Save {pct}%</span>}
          {c.freeShippingBadge && <span className={`h-6 px-2.5 inline-flex items-center gap-1.5 text-[10.5px] font-semibold border ${skin.line} rounded-full`}><Ic.truck c="w-3 h-3" />{c.freeShippingBadge}</span>}
        </div>
        {pct > 0 && <div className={`mt-1 text-[12px] ${skin.muted}`}>You save {S.m(p.original_price - p.price)}</div>}
      </div>

      {p.description && (
        <div>
          <p className={`text-[13.5px] leading-[1.65] ${skin.muted} ${long && !more ? 'line-clamp-4' : ''}`}>{p.description}</p>
          {long && <button type="button" onClick={() => setMore(!more)} className="mt-1.5 text-[12px] font-semibold underline underline-offset-4">{more ? 'Show less' : 'Read more'}</button>}
        </div>
      )}

      {p.colors.length > 0 && (
        <div>
          <div className="text-[12px] font-semibold mb-2.5">Color: <span className={`font-normal ${skin.muted}`}>{color}</span></div>
          <div className="flex flex-wrap gap-2.5">{p.colors.map((n: string) => <Swatch key={n} name={n} on={color === n} onClick={() => setColor(n)} skin={skin} />)}</div>
        </div>
      )}

      {p.sizes.length > 0 && (
        <div data-sizes className={err ? 'pm-shake' : ''}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-[12px] font-semibold">Size: <span className={`font-normal ${err ? 'text-red-500' : skin.muted}`}>{size || (err ? 'Please choose a size' : 'Select')}</span></div>
            <button type="button" onClick={() => setGuide(!guide)} className={`inline-flex items-center gap-1.5 text-[12px] underline underline-offset-4 ${skin.muted}`}><Ic.ruler c="w-3.5 h-3.5" />Size guide</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {p.sizes.map((s: string) => (
              <button type="button" key={s} onClick={() => setSize(s)} aria-pressed={size === s} className={`min-w-[46px] h-10 px-3.5 text-[13px] font-semibold border transition ${skin.chipR} ${size === s ? skin.chipOn : skin.chip} ${err && !size ? 'border-red-400' : ''}`}>{s}</button>
            ))}
          </div>
          {guide && <div className={`mt-3 p-3.5 text-[12.5px] leading-[1.6] pm-fade ${skin.soft} ${skin.chipR}`}>{c.sizeGuide}</div>}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className={`inline-flex items-center border ${skin.line} ${skin.chipR}`}>
          <button type="button" aria-label="Decrease quantity" onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 grid place-items-center hover:opacity-60"><Ic.minus c="w-4 h-4" /></button>
          <span className="w-9 text-center font-bold tabular-nums">{qty}</span>
          <button type="button" aria-label="Increase quantity" onClick={() => setQty(q => Math.min(max, q + 1))} className="w-10 h-10 grid place-items-center hover:opacity-60"><Ic.plus c="w-4 h-4" /></button>
        </div>
        {p.stock !== undefined && p.stock > 0 && p.stock <= 20 && <span className={`text-[12px] ${skin.muted}`}>{p.stock} available</span>}
      </div>

      <div>
        <div className={`flex border-b ${skin.line}`}>
          {(['delivery', 'returns', 'details'] as const).map(k => (
            <button type="button" key={k} onClick={() => setTab(k)} className={`px-3.5 h-10 text-[12px] font-semibold capitalize -mb-px border-b-2 transition ${tab === k ? 'border-[var(--pm-accent)]' : `border-transparent ${skin.muted}`}`}>{k}</button>
          ))}
        </div>
        <div className={`pt-3.5 text-[13px] leading-[1.65] ${skin.muted} pm-fade`} key={tab}>
          {tab === 'delivery' && c.deliveryNote}
          {tab === 'returns' && c.returnNote}
          {tab === 'details' && <dl className="grid grid-cols-[110px_1fr] gap-y-2">{rows.map(([k, v]) => <div key={k} className="contents"><dt className="opacity-60">{k}</dt><dd className="font-medium text-current">{v}</dd></div>)}</dl>}
        </div>
      </div>

      {(c.trustBadges || []).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {c.trustBadges.map((b: string, i: number) => <span key={i} className={`h-8 px-3 inline-flex items-center gap-1.5 text-[11.5px] font-medium border ${skin.line} ${skin.chipR}`}>{i === 0 ? <Ic.truck c="w-3.5 h-3.5" /> : i === 1 ? <Ic.undo c="w-3.5 h-3.5" /> : <Ic.check c="w-3.5 h-3.5" />}{b}</span>)}
        </div>
      )}

      {c.showSimilar && similar.length > 0 && (
        <div className={`pt-5 border-t ${skin.line}`}>
          <div className="text-[13px] font-bold mb-3">You may also like</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {similar.map((x: any) => (
              <button type="button" key={x.id} onClick={() => S.openProduct(x)} className="text-left group">
                <div className={`aspect-square overflow-hidden ${skin.chipR} ${skin.soft}`}><Img src={x.images[0]} alt={x.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
                <div className="mt-1.5 text-[12px] font-semibold truncate">{x.name}</div>
                <div className={`text-[11.5px] ${skin.muted} tabular-nums`}>{S.m(x.price)}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const dock = (
    <div className={`sticky bottom-0 z-10 px-5 md:px-7 py-3.5 border-t ${skin.dock}`}>
      <div className="grid grid-cols-[1fr_auto] gap-2.5">
        <button type="button" disabled={out} onClick={() => submit(false)} className={`h-12 px-5 text-[13.5px] font-bold transition active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none ${skin.btn}`}>
          {out ? 'Sold out' : `Add to cart · ${S.m(p.price * qty)}`}
        </button>
        <button type="button" disabled={out} onClick={() => submit(true)} className={`h-12 px-5 text-[13px] font-bold inline-flex items-center gap-2 transition active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none ${skin.btnAlt}`}>
          <Ic.chat c="w-4 h-4" /><span className="hidden sm:inline">Order now</span>
        </button>
      </div>
    </div>
  )

  const lightbox = zoom !== null && (
    <div className="fixed inset-0 z-[160] bg-black/92 flex items-center justify-center pm-fade" onClick={() => setZoom(null)} role="dialog" aria-label="Image viewer">
      <img src={p.images[zoom]} alt={p.name} className="max-w-[94vw] max-h-[90vh] object-contain" />
      <button type="button" aria-label="Close viewer" className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 text-white grid place-items-center"><Ic.x c="w-5 h-5" /></button>
      {p.images.length > 1 && <>
        <button type="button" aria-label="Previous" onClick={e => { e.stopPropagation(); setZoom((zoom - 1 + p.images.length) % p.images.length) }} className="absolute left-3 w-11 h-11 rounded-full bg-white/15 text-white grid place-items-center"><Ic.left c="w-5 h-5" /></button>
        <button type="button" aria-label="Next" onClick={e => { e.stopPropagation(); setZoom((zoom + 1) % p.images.length) }} className="absolute right-3 w-11 h-11 rounded-full bg-white/15 text-white grid place-items-center"><Ic.right c="w-5 h-5" /></button>
      </>}
    </div>
  )

  if (layout === 'full') {
    return (
      <div ref={ref} role="dialog" aria-modal="true" aria-label={p.name} className={`fixed inset-0 z-[120] overflow-y-auto pm-fade ${skin.root}`}>
        <div className="grid lg:grid-cols-[1.1fr_1fr] min-h-full">
          <div className="relative p-3 lg:p-6"><Gallery p={p} skin={skin} mode="stack" onZoom={setZoom} /></div>
          <div className="relative lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between px-5 md:px-7 pt-5">
              <button type="button" onClick={S.closeProduct} className="inline-flex items-center gap-2 text-[12.5px] font-semibold hover:opacity-70"><Ic.left c="w-4 h-4" />Back to store</button>
              <button type="button" onClick={S.openCart} className="inline-flex items-center gap-2 text-[12.5px] font-semibold hover:opacity-70"><Ic.bag c="w-4 h-4" />Cart ({S.cartCount})</button>
            </div>
            <div className="flex-1">{info}</div>
            {dock}
          </div>
        </div>
        {lightbox}
      </div>
    )
  }

  const sheet = layout === 'sheet'
  return (
    <div className={`fixed inset-0 z-[120] flex ${sheet ? 'items-end md:items-center' : 'items-center'} justify-center md:p-6 ${sheet ? '' : 'p-3'} ${skin.scrim} pm-fade`} onClick={S.closeProduct}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={p.name} onClick={e => e.stopPropagation()} className={`relative w-full max-w-[1060px] max-h-[94vh] md:max-h-[90vh] overflow-y-auto md:overflow-hidden grid md:grid-cols-[1.05fr_1fr] ${sheet ? 'pm-sheet md:pm-pop' : 'pm-pop'} ${skin.panel}`}>
        {sheet && <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-black/20 z-10" />}
        <div className="p-3 md:p-5 md:overflow-y-auto md:max-h-[90vh]"><Gallery p={p} skin={skin} mode="carousel" onZoom={setZoom} /></div>
        <div className="flex flex-col md:max-h-[90vh] md:overflow-y-auto">
          <div className="flex-1">{info}</div>
          {dock}
        </div>
      </div>
      {lightbox}
    </div>
  )
}

/* =====================================================================
   CartDrawer — grouped lines, qty, free-shipping progress, WhatsApp order
   ===================================================================== */
function CartDrawer({ S, skin }: { S: any; skin: Skin }) {
  const c = S.c
  const ref = useRef<HTMLDivElement>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [err, setErr] = useState('')
  const open = S.cartOpen
  const thr = Number(c.freeShippingOver) || 0
  const left = Math.max(0, thr - S.cartTotal)
  const pct = thr ? Math.min(100, (S.cartTotal / thr) * 100) : 0

  useEffect(() => {
    if (!open) return
    const doc = ref.current?.ownerDocument
    if (!doc) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') S.closeCart() }
    doc.addEventListener('keydown', onKey)
    return () => doc.removeEventListener('keydown', onKey)
  }, [open])

  const order = () => {
    if (!S.profile || S.cartCount === 0) return
    if (!name.trim()) { setErr('Please enter your name'); return }
    if (!address.trim()) { setErr('Please enter your delivery address'); return }
    setErr('')
    S.lines.forEach((l: any) => S.track?.('whatsapp_click', l.item.id))
    const rows = S.lines.map((l: any, i: number) => `${i + 1}. ${l.item.name}${l.size ? ` — Size ${l.size}` : ''}${l.color ? ` — ${l.color}` : ''} × ${l.qty} — ${S.m(l.item.price * l.qty)}`)
    const msg = [`Hi ${S.profile.business_name || ''}!`, `*${c.orderIntro || 'New order'}*`, '', ...rows, '', `Total: ${S.m(S.cartTotal)}${thr && left === 0 ? ' (free shipping)' : ''}`, `Name: ${name.trim()}`, phone.trim() ? `Phone: ${phone.trim()}` : '', `Address: ${address.trim()}`, note.trim() ? `Note: ${note.trim()}` : '', `Store: ${S.storeUrl}`].filter((x, i, a) => x !== '' || (a[i - 1] !== '' && i < a.length - 1)).join('\n')
    window.open(`https://wa.me/${S.digits}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div ref={ref} className={`fixed inset-0 z-[130] ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div className={`absolute inset-0 transition-opacity duration-300 ${skin.scrim} ${open ? 'opacity-100' : 'opacity-0'}`} onClick={S.closeCart} />
      <aside role="dialog" aria-modal="true" aria-label="Cart" className={`absolute right-0 top-0 bottom-0 w-full max-w-[420px] flex flex-col transition-transform duration-[450ms] ease-[cubic-bezier(.2,.8,.2,1)] ${open ? 'translate-x-0' : 'translate-x-full'} ${skin.drawer}`}>
        <div className={`px-5 h-16 shrink-0 flex items-center justify-between border-b ${skin.line}`}>
          <h3 className={`text-[17px] ${skin.title}`}>{c.cartTitle} <span className={`text-[13px] font-medium ${skin.muted}`}>({S.cartCount})</span></h3>
          <button type="button" onClick={S.closeCart} aria-label="Close cart" className={`w-9 h-9 grid place-items-center border ${skin.line} ${skin.chipR} hover:opacity-70`}><Ic.x c="w-4 h-4" /></button>
        </div>

        {thr > 0 && S.cartCount > 0 && (
          <div className={`px-5 py-3.5 border-b ${skin.line}`}>
            <div className="text-[12.5px] font-medium">{left === 0 ? '🎉 You unlocked free shipping' : <>Add <b>{S.m(left)}</b> more for free shipping</>}</div>
            <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${skin.soft}`}><div className="h-full rounded-full bg-[var(--pm-accent)] transition-all duration-700" style={{ width: `${pct}%` }} /></div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {S.lines.map((l: any) => (
            <div key={l.key} className={`flex gap-3 p-3 border ${skin.line} ${skin.chipR} pm-fade`}>
              <Img src={l.item.images[0]} alt={l.item.name} className={`w-[72px] h-[72px] object-cover shrink-0 ${skin.chipR}`} />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold truncate">{l.item.name}</div>
                <div className={`mt-0.5 text-[11.5px] ${skin.muted}`}>{[l.size && `Size ${l.size}`, l.color].filter(Boolean).join(' · ') || 'Standard'}</div>
                <div className="mt-2 flex items-center justify-between">
                  <div className={`inline-flex items-center border ${skin.line} ${skin.chipR}`}>
                    {S.canRemove && <button type="button" aria-label="Remove one" onClick={() => S.changeQty(l, -1)} className="w-8 h-8 grid place-items-center hover:opacity-60"><Ic.minus c="w-3.5 h-3.5" /></button>}
                    <span className={`${S.canRemove ? 'w-7' : 'px-3'} text-center text-[12.5px] font-bold tabular-nums`}>{S.canRemove ? l.qty : `× ${l.qty}`}</span>
                    <button type="button" aria-label="Add one" onClick={() => S.changeQty(l, 1)} className="w-8 h-8 grid place-items-center hover:opacity-60"><Ic.plus c="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="text-[13px] font-bold tabular-nums">{S.m(l.item.price * l.qty)}</div>
                </div>
              </div>
            </div>
          ))}
          {S.cartCount === 0 && (
            <div className="py-20 text-center">
              <div className={`w-14 h-14 mx-auto grid place-items-center border ${skin.line} rounded-full ${skin.muted}`}><Ic.bag c="w-6 h-6" /></div>
              <div className="mt-4 text-[14px] font-semibold">{c.cartEmpty}</div>
              <button type="button" onClick={S.closeCart} className="mt-3 text-[12.5px] underline underline-offset-4">Continue shopping</button>
            </div>
          )}
        </div>

        {S.cartCount > 0 && (
          <div className={`px-5 py-4 border-t space-y-2.5 ${skin.line}`}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name *" aria-label="Full name" className={`w-full h-11 px-3.5 text-[13px] outline-none ${skin.input}`} />
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone (optional)" inputMode="tel" aria-label="Phone" className={`w-full h-11 px-3.5 text-[13px] outline-none ${skin.input}`} />
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Delivery address *" aria-label="Address" className={`w-full h-11 px-3.5 text-[13px] outline-none ${skin.input}`} />
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note for the seller (optional)" aria-label="Note" className={`w-full h-11 px-3.5 text-[13px] outline-none ${skin.input}`} />
            {err && <div role="alert" className="text-[12px] font-medium text-red-500 pm-fade">{err}</div>}
            <div className="flex items-center justify-between pt-1">
              <span className={`text-[12.5px] ${skin.muted}`}>Total{thr > 0 && left === 0 ? ' · free shipping' : ''}</span>
              <span className="text-[20px] font-extrabold tabular-nums">{S.m(S.cartTotal)}</span>
            </div>
            <button type="button" onClick={order} className={`w-full h-12 text-[13.5px] font-bold inline-flex items-center justify-center gap-2 transition active:scale-[0.98] ${skin.btn}`}><Ic.chat c="w-4 h-4" />{c.orderButton}</button>
          </div>
        )}
      </aside>
    </div>
  )
}

/* ------------------------------ toast + overlays ------------------------------ */
function Overlays({ S, skin, layout }: { S: any; skin: Skin; layout: 'modal' | 'sheet' | 'full' }) {
  return (
    <>
      {S.sel && <ProductDetail key={S.sel.id} S={S} skin={skin} layout={layout} />}
      <CartDrawer S={S} skin={skin} />
      <div aria-live="polite" className={`fixed left-1/2 -translate-x-1/2 bottom-20 md:bottom-6 z-[150] transition-all duration-500 ease-[cubic-bezier(.2,.9,.25,1.2)] ${S.toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button type="button" onClick={S.openCart} className="h-11 pl-4 pr-3 rounded-full bg-[#0A0A0A] text-white text-[12.5px] font-medium inline-flex items-center gap-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.5)] max-w-[92vw]">
          <span className="w-5 h-5 rounded-full bg-[var(--pm-accent)] text-black grid place-items-center shrink-0"><Ic.check c="w-3 h-3" /></span>
          <span className="truncate">{S.toast}</span>
          <span className="shrink-0 h-7 px-2.5 rounded-full bg-white/15 inline-flex items-center text-[11px] font-semibold">View cart</span>
        </button>
      </div>
    </>
  )
}

/* ----------------------------------- CSS ----------------------------------- */
const PM_BASE_CSS = `
@keyframes pmFade{from{opacity:0}to{opacity:1}}
@keyframes pmPop{from{opacity:0;transform:translateY(22px) scale(.97)}to{opacity:1;transform:none}}
@keyframes pmSheet{from{transform:translateY(100%)}to{transform:none}}
@keyframes pmRise{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}
@keyframes pmMarquee{to{transform:translateX(-50%)}}
@keyframes pmFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes pmShake{0%,100%{transform:none}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
@keyframes pmSpin{to{transform:rotate(1turn)}}
@keyframes pmKen{from{transform:scale(1)}to{transform:scale(1.09)}}
@keyframes pmPulse{0%,100%{opacity:1}50%{opacity:.45}}
@keyframes pmShine{from{transform:translateX(-120%)}to{transform:translateX(220%)}}
.pm-fade{animation:pmFade .3s ease both}
.pm-pop{animation:pmPop .45s cubic-bezier(.2,.8,.2,1) both}
.pm-sheet{animation:pmSheet .5s cubic-bezier(.2,.8,.2,1) both}
.pm-rise{animation:pmRise .8s cubic-bezier(.2,.8,.2,1) both}
.pm-marquee{animation:pmMarquee 32s linear infinite;width:max-content}
.pm-float{animation:pmFloat 6s ease-in-out infinite}
.pm-shake{animation:pmShake .5s ease}
.pm-spin{animation:pmSpin 24s linear infinite}
.pm-ken{animation:pmKen 16s ease-in-out infinite alternate}
.pm-sb{scrollbar-width:none}.pm-sb::-webkit-scrollbar{display:none}
.pm-reveal{opacity:1}
@supports (animation-timeline: view()){.pm-reveal{animation:pmRise linear both;animation-timeline:view();animation-range:entry 0% entry 42%}}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}}
`

/* Everything a theme view needs, handed over via the store context (S.ui) so theme files stay self-contained. */
const UI = { Ic, Img, PriceLine, SearchBox, SortSelect, Overlays, PM_BASE_CSS, splitLines, discountPct, stockState }

/* ============================== 3. RENDERER ============================== */
const THEME_VIEWS: Record<string, (p: { S: any }) => any> = {
  'spike-premium': SpikePremiumTheme,
  'shoe-app-premium': ShoeAppPremiumTheme,
  'trenzo-luxury': TrenzoLuxuryTheme,
  'sleek-beige': SleekBeigePremiumTheme,
  'sleek-dark': SleekDarkPremiumTheme,
  'sleek-editorial': SleekEditorialPremiumTheme,
}

function ThemeHost({ View, themeId, ...rest }: any) {
  const S = useStore(rest, themeId)
  return <View S={S} />
}

/* Props are unchanged from before. `onRemove(index)` is new and optional: it lets customers remove items in the cart. */
export function PremiumThemeRenderer({ themeId, profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct, onRemove }: any) {
  const View = THEME_VIEWS[themeId]
  if (!View) return null
  // key: switching theme in the editor starts that theme fresh (filters, search, open product reset)
  return <ThemeHost key={themeId} View={View} themeId={themeId} profile={profile} products={products} cart={cart} setShowCart={setShowCart} onAdd={onAdd} onOpen={onOpen} track={track} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} onRemove={onRemove} />
}
