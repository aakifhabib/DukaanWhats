'use client'
import { useState, useEffect, useMemo, useRef } from 'react'

/* =====================================================================
   PremiumThemeRenderer
   Single entry point used by the public store page (/s/[slug]) and the dashboard editor preview.

   This file also holds the shared pieces every premium theme builds on:
     1. CONFIG   product helpers, default copy per theme, the editor's field schema
     2. ENGINE   useStore (catalog, cart, wishlist), the full product page, the cart drawer, icons, base CSS
   The six theme views (section 3) are plain components that receive the prepared store context as `S`.
   ===================================================================== */

/* ============================== 1. CONFIG ============================== */
/* =====================================================================
   PREMIUM THEMES — shared config
   One source of truth for: product helpers, default copy per theme,
   and the editor's field schema (so EVERYTHING in a theme is editable).
   ===================================================================== */

type ThemeId = 'spike-premium' | 'shoe-app-premium' | 'trenzo-luxury' | 'sleek-beige' | 'sleek-dark' | 'sleek-editorial' | 'saffron-table' | 'atelier-bloom' | 'mono-market'

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
  'saffron-table': { id: 'table', label: 'The table', sub: 'Menu intro and house special', fields: [
    t('menuEyebrow', 'Menu eyebrow'),
    t('dishNote', 'Featured dish note'),
    t('specialTitle', 'House special title'),
    ta('specialText', 'House special description'),
    t('specialButton', 'House special button'),
  ] },
  'atelier-bloom': { id: 'atelier', label: 'Atelier notes', sub: 'Studio story and collection notes', fields: [
    t('journalEyebrow', 'Collection label'),
    t('manifestoTitle', 'Studio heading'),
    ta('manifestoText', 'Studio story'),
    t('craftTitle', 'Craft note title'),
    ta('craftText', 'Craft note'),
    img('storyImage', 'Story image', { hint: 'Optional second image for the studio story section.' }),
  ] },
  'mono-market': { id: 'mono', label: 'Drop details', sub: 'Drop label, ticker and manifesto', fields: [
    t('dropNumber', 'Drop number'),
    t('tickerText', 'Ticker text'),
    t('manifestoTitle', 'Manifesto heading'),
    ta('manifestoText', 'Manifesto text'),
    t('specLine', 'Edition detail'),
  ] },
}

export function buildSchema(themeId: string): Section[] {
  const id = (EXTRA[themeId as ThemeId] ? themeId : 'spike-premium') as ThemeId
  const second = ['sleek-beige', 'sleek-editorial', 'trenzo-luxury', 'saffron-table', 'atelier-bloom'].includes(id)
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
  'saffron-table': {
    accent: '#C95C3A', headerLabel: 'SAFFRON TABLE', announcement: 'FRESHLY MADE • LOCAL DELIVERY • ORDER ON WHATSAPP',
    heroBadge: 'FROM OUR KITCHEN', heroTitle: 'Good food,\nshared well.', heroSubtitle: 'A menu made with care, packed fresh and brought to your table.',
    ctaText: 'Explore the menu', secondaryCta: 'Open your bag', featuredLabel: 'Today’s pick',
    menuEyebrow: 'MADE FRESH DAILY', dishNote: 'Made fresh when you order', showStats: false, stats: [], trustBadges: ['Made fresh', 'Local delivery', 'Cash on delivery'],
    specialTitle: 'A little something special', specialText: 'Prepared in small batches with ingredients we are proud to serve.', specialButton: 'Ask about today’s menu',
    collectionTitle: 'Order from the menu', collectionSubtitle: 'Fresh from our kitchen', brands: ['All', 'Meals', 'Sides', 'Drinks', 'Desserts'],
    footerAbout: 'Fresh food, thoughtfully made and delivered with care.', deliveryNote: 'Freshly prepared. Delivery times are confirmed on WhatsApp.',
  },
  'atelier-bloom': {
    accent: '#718463', headerLabel: 'ATELIER BLOOM', announcement: 'SMALL BATCH • NATURAL MATERIALS • MADE TO KEEP',
    heroBadge: 'A SLOWER KIND OF BEAUTY', heroTitle: 'Made by hand.\nMade to last.', heroSubtitle: 'Thoughtful objects and soft essentials, chosen for the way they make everyday life feel.',
    ctaText: 'Explore the collection', secondaryCta: 'View bag', featuredLabel: 'Studio favourite',
    journalEyebrow: 'NOTES FROM THE STUDIO', manifestoTitle: 'Objects with a softer story', manifestoText: 'We believe the things we keep should be made with care. Each piece is selected for its material, its maker and the small joy it brings to an ordinary day.',
    craftTitle: 'Made slowly, chosen carefully', craftText: 'Small-batch pieces, natural textures and considered details. We share the story behind every item so you can choose with confidence.',
    collectionTitle: 'The collection', collectionSubtitle: 'A considered edit for everyday living', brands: ['All', 'New', 'Home', 'Wear', 'Sale'],
    footerAbout: 'A small independent studio for thoughtful things and everyday rituals.', showStats: false, stats: [], trustBadges: ['WhatsApp ordering', 'Cash on delivery'],
  },
  'mono-market': {
    accent: '#D9FF3F', headerLabel: 'MONO / MARKET', announcement: 'DROP 01 — LIMITED RELEASE — WORLDWIDE ENERGY, LOCAL DELIVERY',
    heroBadge: 'IN STOCK / READY TO SHIP', heroTitle: 'Less noise.\nBetter gear.', heroSubtitle: 'A tightly edited lineup of useful things, selected for form, function and staying power.',
    ctaText: 'Shop the drop', secondaryCta: 'Open bag', featuredLabel: 'Staff pick',
    dropNumber: 'DROP 001 / 2026', tickerText: 'DESIGNED FOR DAILY USE • NO FILLER • GOOD THINGS ONLY', manifestoTitle: 'Buy less. Choose better.', manifestoText: 'Every item earns its place. Clear specs, honest pricing and no clutter between you and the product.', specLine: 'CURATED GOODS / DELIVERED LOCALLY',
    collectionTitle: 'Available now', collectionSubtitle: 'Selected stock / updated regularly', brands: ['All', 'New', 'Essentials', 'Sale'],
    footerAbout: 'A focused edit of practical, well-made goods. Nothing extra.', showStats: false, stats: [], trustBadges: ['WhatsApp ordering', 'Cash on delivery'],
  },
}

/* --------------------------- content resolution --------------------------- */
export function resolveContent(themeId: string, profile: any): Record<string, any> {
  const id = (DEFAULTS[themeId as ThemeId] ? themeId : 'spike-premium') as ThemeId
  const stored = profile?.premium_custom || {}
  const themeBuckets = stored.themes
  // Keep each Premium theme's edits independent, while continuing to read older flat saves.
  const raw = themeBuckets && Object.keys(themeBuckets).length
    ? (themeBuckets[id] || {})
    : stored
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
function sv(d: React.ReactNode, w = 1.8) {
  function Icon({ c = 'w-4 h-4', fill = false }: { c?: string; fill?: boolean }) {
    return <svg className={c} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden>{d}</svg>
  }
  return Icon
}
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
    <button type="button" onClick={S.closeProduct} aria-label="Close" title="Close product details" className={`w-9 h-9 grid place-items-center border ${skin.line} ${skin.chipR} hover:opacity-70 transition`}><Ic.x c="w-4 h-4" /></button>
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
      <button type="button" aria-label="Close viewer" title="Close image viewer" className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 text-white grid place-items-center"><Ic.x c="w-5 h-5" /></button>
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
          <button type="button" onClick={S.closeCart} aria-label="Close cart" title="Close shopping bag" className={`w-9 h-9 grid place-items-center border ${skin.line} ${skin.chipR} hover:opacity-70`}><Ic.x c="w-4 h-4" /></button>
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
@keyframes pmMonoSlide{to{transform:translateX(-25%)}}
.pm-mono-marquee{animation:pmMonoSlide 30s linear infinite}
@media(prefers-reduced-motion:reduce){.pm-mono-marquee{animation:none}}
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


/* ============================== 3. THEME VIEWS ============================== */
/* ---------- SpikePremiumTheme ---------- */
/* SPIKE — streetwear / neo-brutalist. Heavy type, hard shadows, lime stickers, endless ticker. */
const SPIKE_SKIN = {
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

const SPIKE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=JetBrains+Mono:wght@500;700&display=swap');
.pm-spike{font-family:'Bricolage Grotesque',system-ui,sans-serif;--pm-display:'Bricolage Grotesque',system-ui,sans-serif}
.pm-spike .mono{font-family:'JetBrains Mono',ui-monospace,monospace}
@keyframes pmTick{to{transform:translateX(-50%)}}
`

function Card({ p, i, S }: any) {
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
          : <button type="button" onClick={() => S.quickAdd(p)} aria-label={`Quick add ${p.name}`} title="Add this product to your bag" className="absolute bottom-2 right-2 w-10 h-10 grid place-items-center rounded-full border-2 border-black bg-[var(--pm-accent)] md:translate-y-14 md:group-hover:translate-y-0 transition-transform duration-300 hover:rotate-90"><Ic.plus c="w-4 h-4" /></button>}
      </div>
      <button type="button" onClick={() => S.openProduct(p)} className="block w-full text-left mt-3 px-0.5">
        <div className="text-[13px] font-bold truncate">{p.name}</div>
        <div className="mt-0.5"><PriceLine p={p} S={S} big="text-[15px]" strike="text-[11px] opacity-45" /></div>
        <div className={`mono mt-1.5 text-[9.5px] tracking-wide ${st === 'low' ? 'text-red-600 font-bold' : 'text-black/45'}`}>{st === 'low' ? `ONLY ${p.stock} LEFT` : p.sizes.length ? `SIZES ${p.sizes.slice(0, 4).join(' / ')}${p.sizes.length > 4 ? '…' : ''}` : `${S.c.freeShippingBadge || 'FREE DELIVERY'} • COD`}</div>
      </button>
    </article>
  )
}

function SpikePremiumTheme({ S }: { S: any }) {
  const { c, filtered } = S
  const lines = splitLines(c.heroTitle)
  const ticker = c.tickerText || S.chips.filter((x: string) => x.toLowerCase() !== 'all').join('  ✦  ') || 'FRESH DROPS'
  const first = S.products[0]

  return (
    <div ref={S.rootRef} style={S.cssVars} className={`pm-spike relative min-h-screen antialiased overflow-x-clip ${SPIKE_SKIN.root}`}>
      <style>{PM_BASE_CSS + SPIKE_CSS}</style>

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
            <button type="button" onClick={e => { S.setSavedOnly(!S.savedOnly); S.scrollTo(e, 'pm-collection') }} aria-label="Saved items" title={S.savedOnly ? 'Show all products' : 'Filter to saved items'} className={`relative w-10 h-10 grid place-items-center rounded-full border-2 border-black transition ${S.savedOnly ? 'bg-black text-[var(--pm-accent)]' : 'bg-white hover:bg-[var(--pm-accent)]'}`}>
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
            <button type="button" onClick={e => S.scrollTo(e, 'pm-collection')} className={`h-[52px] px-7 text-[14px] font-bold inline-flex items-center gap-2.5 transition ${SPIKE_SKIN.btn}`}>{c.ctaText}<Ic.arrow c="w-4 h-4" /></button>
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
            <button type="button" onClick={() => { S.setQuery(''); S.setActive('All'); S.setSavedOnly(false) }} className={`mt-4 h-11 px-6 text-[13px] font-bold ${SPIKE_SKIN.btn}`}>Clear filters</button>
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

      <Overlays S={S} skin={SPIKE_SKIN} layout="modal" />
    </div>
  )
}

/* ---------- ShoeAppPremiumTheme ---------- */
/* SHOE APP — feels like a native shopping app: carousel, brand bubbles, rails, bottom tab bar. */
const SHOE_SKIN = {
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
const SHOE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.pm-shoe{font-family:'Plus Jakarta Sans',system-ui,sans-serif}
`

function ShoeCard({ p, S, compact = false }: any) {
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
          : <button type="button" onClick={() => S.quickAdd(p)} aria-label={`Quick add ${p.name}`} title="Add this product to your bag" className="absolute bottom-3 right-3 w-11 h-11 grid place-items-center rounded-full bg-[#14112B] text-white shadow-lg active:scale-90 transition hover:bg-[var(--pm-accent)]"><Ic.plus c="w-5 h-5" /></button>}
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

function ShoeAppPremiumTheme({ S }: { S: any }) {
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
    <div ref={S.rootRef} style={S.cssVars} className={`pm-shoe relative min-h-screen antialiased overflow-x-clip pb-28 md:pb-10 ${SHOE_SKIN.root}`}>
      <style>{PM_BASE_CSS + SHOE_CSS}</style>

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
            <button type="button" onClick={() => S.setSavedOnly(!S.savedOnly)} aria-label="Saved items" title={S.savedOnly ? 'Show all products' : 'Filter to saved items'} aria-pressed={S.savedOnly} className={`relative w-11 h-11 grid place-items-center rounded-2xl transition active:scale-95 ${S.savedOnly ? 'bg-[var(--pm-accent)] text-white' : 'bg-white'}`}><Ic.heart c="w-[18px] h-[18px]" fill={S.savedOnly} />{S.wish.length > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-red-500 text-white text-[10px] font-bold">{S.wish.length}</span>}</button>
            <button type="button" onClick={S.openCart} aria-label="Open cart" title="Open your shopping bag" className="relative w-11 h-11 grid place-items-center rounded-2xl bg-[#14112B] text-white transition active:scale-95"><Ic.bag c="w-[18px] h-[18px]" />{S.cartCount > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-[var(--pm-accent)] text-white text-[10px] font-bold pm-pop">{S.cartCount}</span>}</button>
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
          {filtered.length === 0 && <div className="mt-6 rounded-[28px] bg-white py-14 text-center"><div className="text-[18px] font-[800]">No shoes found</div><button type="button" onClick={() => { S.setQuery(''); S.setActive('All'); S.setSavedOnly(false) }} className={`mt-4 h-11 px-6 text-[13px] font-bold ${SHOE_SKIN.btn}`}>Reset filters</button></div>}
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

      <Overlays S={S} skin={SHOE_SKIN} layout="sheet" />
    </div>
  )
}

/* ---------- TrenzoLuxuryTheme ---------- */
/* TRENZO — quiet luxury. Near-black, champagne gold, serif display, arched imagery, hairlines. */
const TRENZO_SKIN = {
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
const TRENZO_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap');
.pm-trenzo{font-family:'Jost',system-ui,sans-serif;--pm-display:'Cormorant Garamond',Georgia,serif}
.pm-trenzo .serif{font-family:var(--pm-display)}
@keyframes pmLine{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}51%{transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
`

function Piece({ p, S }: any) {
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

function TrenzoLuxuryTheme({ S }: { S: any }) {
  const { c, filtered } = S
  const [story, setStory] = useState(0)
  const stories: any[] = Array.isArray(c.stories) && c.stories.length ? c.stories : []
  const lines = splitLines(c.heroTitle)
  const seal = `${c.eyebrow} • ${c.eyebrow} • `
  const first = S.products[0]
  const roman = ['I', 'II', 'III', 'IV']
  const conciergeLink = () => window.open(`https://wa.me/${S.digits}?text=${encodeURIComponent(`Hello ${S.profile?.business_name || ''}, I would like some help with a private order.`)}`, '_blank')

  return (
    <div ref={S.rootRef} style={S.cssVars} className={`pm-trenzo relative min-h-screen antialiased overflow-x-clip ${TRENZO_SKIN.root}`}>
      <style>{PM_BASE_CSS + TRENZO_CSS}</style>

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
            <button type="button" onClick={() => S.setSavedOnly(!S.savedOnly)} aria-label="Saved pieces" title={S.savedOnly ? 'Show all products' : 'Filter to saved items'} aria-pressed={S.savedOnly} className={`relative w-10 h-10 grid place-items-center transition ${S.savedOnly ? 'text-[var(--pm-accent)]' : 'hover:text-[var(--pm-accent)]'}`}><Ic.heart c="w-[19px] h-[19px]" fill={S.savedOnly} />{S.wish.length > 0 && <span className="absolute top-1 right-0 min-w-[16px] h-4 px-1 grid place-items-center rounded-full bg-[var(--pm-accent)] text-black text-[9px] font-bold">{S.wish.length}</span>}</button>
            <button type="button" onClick={S.openCart} aria-label="Open cart" title="Open your shopping bag" className="relative h-10 pl-2 pr-1 inline-flex items-center gap-2 hover:text-[var(--pm-accent)] transition-colors"><Ic.bag c="w-[19px] h-[19px]" /><span className="text-[11px] uppercase tracking-[0.22em] hidden sm:inline">Bag</span><span className="min-w-[22px] h-[22px] px-1 grid place-items-center rounded-full border border-[var(--pm-accent)] text-[var(--pm-accent)] text-[11px] tabular-nums">{S.cartCount}</span></button>
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
            <button type="button" onClick={e => S.scrollTo(e, 'pm-collection')} className={`h-[54px] px-9 inline-flex items-center gap-3 font-medium transition ${TRENZO_SKIN.btn}`}>{c.ctaText}<Ic.right c="w-4 h-4" /></button>
            {c.secondaryCta && <button type="button" onClick={conciergeLink} className={`h-[54px] px-9 text-[12px] uppercase tracking-[0.16em] transition ${TRENZO_SKIN.btnAlt}`}>{c.secondaryCta}</button>}
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
          {c.showSearch ? <SearchBox S={S} className="w-full sm:w-[300px]" inputClass={`h-11 text-[13px] ${TRENZO_SKIN.input}`} /> : <span />}
          <div className="flex items-center gap-5 text-[11px] uppercase tracking-[0.22em] text-white/45"><span>{filtered.length} pieces</span>{c.showSort && <SortSelect S={S} className="h-10 bg-transparent border-b border-white/25 text-[11px] uppercase tracking-[0.18em] text-white" />}</div>
        </div>
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-14">{filtered.map((p: any) => <Piece key={p.id} p={p} S={S} />)}</div>
        {filtered.length === 0 && <div className="py-24 text-center"><div className="serif text-[32px]">Nothing found</div><button type="button" onClick={() => { S.setQuery(''); S.setActive('All'); S.setSavedOnly(false) }} className={`mt-6 h-12 px-8 ${TRENZO_SKIN.btnAlt} text-[12px] uppercase tracking-[0.18em]`}>Clear filters</button></div>}
      </section>

      {/* CONCIERGE */}
      <section id="pm-concierge" className="border-y border-[var(--pm-accent)]/30 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_70%)]">
        <div className="max-w-[900px] mx-auto px-5 py-24 md:py-32 text-center pm-reveal">
          <div className="text-[var(--pm-accent)] text-[26px]">✦</div>
          <h3 className="serif mt-4 text-[clamp(36px,5.4vw,72px)] leading-[1.02] font-light">{splitLines(c.conciergeTitle).map((l: string, i: number) => <span key={i} className={`block ${i === 1 ? 'italic text-[var(--pm-accent)]' : ''}`}>{l}</span>)}</h3>
          <p className="mt-6 max-w-[520px] mx-auto text-[15px] leading-[1.8] text-white/55">{c.conciergeText}</p>
          <button type="button" onClick={conciergeLink} className={`mt-10 h-[54px] px-10 inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.2em] transition ${TRENZO_SKIN.btnAlt}`}><Ic.chat c="w-4 h-4" />{c.conciergeCta}</button>
        </div>
      </section>

      <footer className="max-w-[1360px] mx-auto px-5 md:px-8 py-16 grid md:grid-cols-[1.4fr_1fr_1fr] gap-10 text-[13px] text-white/55">
        <div><div className="serif text-[26px] tracking-[0.3em] uppercase text-[#F2EDE4]">✦ {c.headerLabel}</div><p className="mt-4 max-w-[360px] leading-[1.8]">{c.footerAbout}</p></div>
        <div className="space-y-2"><div className="text-[10px] uppercase tracking-[0.3em] text-[var(--pm-accent)] mb-3">Contact</div>{c.instagram && <div>{c.instagram}</div>}{c.address && <div>{c.address}</div>}<div>{S.profile?.whatsapp_number}</div></div>
        <div className="space-y-2"><div className="text-[10px] uppercase tracking-[0.3em] text-[var(--pm-accent)] mb-3">Service</div>{(c.trustBadges || []).map((b: string, i: number) => <div key={i}>{b}</div>)}</div>
        <div className="md:col-span-3 pt-6 border-t border-white/10 text-[11px] tracking-[0.12em] text-white/35">{c.footerNote || `© ${S.profile?.business_name || c.headerLabel}`}</div>
      </footer>

      <Overlays S={S} skin={TRENZO_SKIN} layout="full" />
    </div>
  )
}

/* ---------- SleekBeigePremiumTheme ---------- */
/* SLEEK BEIGE — warm boutique. Soft serif, terracotta, organic shapes, staggered grid. */
const BEIGE_SKIN = {
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
const BEIGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400;1,9..144,500&family=DM+Sans:wght@400;500;600;700&display=swap');
.pm-beige{font-family:'DM Sans',system-ui,sans-serif;--pm-display:'Fraunces',Georgia,serif}
.pm-beige .serif{font-family:var(--pm-display)}
`

function Item({ p, S }: any) {
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
        <button type="button" onClick={() => S.toggleWish(p.id)} aria-label="Save" aria-pressed={S.isWished(p.id)} className={`absolute top-3.5 right-3.5 w-10 h-10 grid place-items-center rounded-full bg-white/80 backdrop-blur transition hover:scale-110 ${S.isWished(p.id) ? 'text-[var(--pm-accent)]' : 'text-[#2B2118]'}`}><Ic.heart c="w-[18px] h-[18px]" fill={S.isWished(p.id)} /></button>
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

function SleekBeigePremiumTheme({ S }: { S: any }) {
  const { c, filtered } = S
  const lines = splitLines(c.heroTitle)
  const reviews: any[] = Array.isArray(c.testimonials) ? c.testimonials : []
  const lookImg = c.lookbookImage || S.products[2]?.images[0] || S.heroImg2
  const avatars = S.products.slice(0, 4).map((p: any) => p.images[0])

  return (
    <div ref={S.rootRef} style={S.cssVars} className={`pm-beige relative min-h-screen antialiased overflow-x-clip ${BEIGE_SKIN.root}`}>
      <style>{PM_BASE_CSS + BEIGE_CSS}</style>

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
            <button type="button" onClick={e => S.scrollTo(e, 'pm-collection')} className={`h-[54px] px-8 text-[14px] font-semibold inline-flex items-center gap-2.5 transition ${BEIGE_SKIN.btn}`}>{c.ctaText}<Ic.right c="w-4 h-4" /></button>
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
        <div className="mt-8 flex flex-wrap justify-center gap-2">{S.chips.map((b: string) => <button type="button" key={b} onClick={() => S.setActive(b)} aria-pressed={S.active === b} className={`h-11 px-6 text-[13.5px] font-semibold border transition-all ${S.active === b ? BEIGE_SKIN.chipOn : BEIGE_SKIN.chip} rounded-full`}>{b}</button>)}</div>
        <div className="mt-5 flex flex-wrap justify-center gap-3">{c.showSearch && <SearchBox S={S} className="w-full sm:w-[280px]" inputClass={`h-11 text-[13.5px] ${BEIGE_SKIN.input}`} />}{c.showSort && <SortSelect S={S} className="h-11 px-4 rounded-2xl bg-white/70 border border-[#2B2118]/12 text-[13px] font-medium" />}</div>
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-10 lg:[&>*:nth-child(4n+2)]:mt-14 lg:[&>*:nth-child(4n+4)]:mt-14">{filtered.map((p: any) => <Item key={p.id} p={p} S={S} />)}</div>
        {filtered.length === 0 && <div className="py-20 text-center rounded-[34px] bg-white/60 mt-8"><div className="serif text-[28px]">Nothing here yet</div><button type="button" onClick={() => { S.setQuery(''); S.setActive('All'); S.setSavedOnly(false) }} className={`mt-5 h-12 px-7 text-[13.5px] font-semibold ${BEIGE_SKIN.btn}`}>Clear filters</button></div>}
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

      <Overlays S={S} skin={BEIGE_SKIN} layout="modal" />
    </div>
  )
}

/* ---------- SleekDarkPremiumTheme ---------- */
/* SLEEK DARK — tech noir. Grid-lines, neon accent, HUD frames, live stock, spotlight cards. */
const DARK_SKIN = {
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
const DARK_CSS = `
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

const trackPointer = (e: React.MouseEvent<HTMLElement>) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`) }

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

function SleekDarkPremiumTheme({ S }: { S: any }) {
  const { c, filtered } = S
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const lines = splitLines(c.heroTitle)
  const features: any[] = Array.isArray(c.features) ? c.features : []
  const first = S.products[0]

  return (
    <div ref={S.rootRef} style={S.cssVars} className={`pm-dark relative min-h-screen antialiased overflow-x-clip ${DARK_SKIN.root}`}>
      <style>{PM_BASE_CSS + DARK_CSS}</style>

      <div className="mono h-9 border-b border-white/10 px-4 md:px-6 flex items-center justify-between text-[10.5px] text-white/50 tracking-wider">
        <span className="inline-flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--pm-accent)] animate-pulse shadow-[0_0_10px_var(--pm-accent)]" />{c.statusLine}</span>
        {c.showAnnouncement && c.announcement && <span className="hidden md:block truncate max-w-[60%] text-[var(--pm-accent)]/80">{c.announcement}</span>}
        <span>{S.products.length} UNITS</span>
      </div>

      <header className="sticky top-0 z-30 bg-[#06070A]/75 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1320px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-3">
          <a href="#" onClick={e => e.preventDefault()} className="flex items-center gap-3 min-w-0">{c.logoImage ? <img src={c.logoImage} alt={c.headerLabel} className="h-8 max-w-[160px] object-contain" /> : <><span className="w-8 h-8 grid place-items-center rounded-lg bg-[var(--pm-accent)] text-black font-bold text-[15px]">{S.initial}</span><span className="mono text-[13px] font-semibold tracking-[0.12em] uppercase truncate">[ {c.headerLabel} ]</span></>}</a>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => S.setSavedOnly(!S.savedOnly)} aria-label="Saved" title={S.savedOnly ? 'Show all products' : 'Filter to saved items'} aria-pressed={S.savedOnly} className={`relative w-10 h-10 grid place-items-center rounded-lg border transition ${S.savedOnly ? 'border-[var(--pm-accent)] text-[var(--pm-accent)] bg-[var(--pm-accent)]/10' : 'border-white/12 hover:border-white/30'}`}><Ic.heart c="w-4 h-4" fill={S.savedOnly} />{S.wish.length > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 grid place-items-center rounded-full bg-[var(--pm-accent)] text-black text-[9.5px] font-bold">{S.wish.length}</span>}</button>
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
              <button type="button" onClick={e => S.scrollTo(e, 'pm-collection')} className={`h-[52px] px-8 font-bold inline-flex items-center gap-2.5 transition active:scale-[0.98] ${DARK_SKIN.btn}`}>{c.ctaText}<Ic.arrow c="w-4 h-4" /></button>
              {c.secondaryCta && <button type="button" onClick={S.openCart} className={`h-[52px] px-8 text-[13px] font-semibold transition ${DARK_SKIN.btnAlt}`}>{c.secondaryCta}</button>}
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
            <div key={i} onMouseMove={trackPointer} className="spot pm-reveal rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[var(--pm-accent)]/40">
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
          <div><div className="mono text-[11px] tracking-[0.2em] text-[var(--pm-accent)]">{'//'} {c.hudLabel}</div><h2 className="mt-2 text-[clamp(30px,4.2vw,56px)] leading-none font-bold tracking-[-0.04em]">{c.collectionTitle} <span className="mono text-[0.4em] align-top text-white/35 font-medium">[{filtered.length}]</span></h2>{c.collectionSubtitle && <p className="mono mt-2 text-[11.5px] text-white/40">{c.collectionSubtitle}</p>}</div>
          <div className="flex flex-wrap gap-2.5 items-center">
            {c.showSearch && <SearchBox S={S} className="w-[210px]" inputClass={`h-10 text-[13px] ${DARK_SKIN.input}`} />}
            {c.showSort && <SortSelect S={S} className="mono h-10 px-3 rounded-lg bg-white/[0.05] border border-white/12 text-[12px]" />}
            <div className="inline-flex rounded-lg border border-white/12 overflow-hidden" role="group" aria-label="View">{(['grid', 'list'] as const).map(v => <button key={v} type="button" onClick={() => setView(v)} aria-pressed={view === v} aria-label={`${v} view`} className={`w-10 h-10 grid place-items-center transition ${view === v ? 'bg-[var(--pm-accent)] text-black' : 'hover:bg-white/10'}`}>{v === 'grid' ? <Ic.grid c="w-4 h-4" /> : <Ic.list c="w-4 h-4" />}</button>)}</div>
          </div>
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto pm-sb pb-1">{S.chips.map((b: string) => <button type="button" key={b} onClick={() => S.setActive(b)} aria-pressed={S.active === b} className={`mono h-9 shrink-0 px-4 text-[12px] border transition ${S.active === b ? DARK_SKIN.chipOn : DARK_SKIN.chip} rounded-lg`}>{b}</button>)}</div>

        {view === 'grid' ? (
          <div className="mt-7 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((p: any, i: number) => {
              const pct = discountPct(p); const st = stockState(p)
              return (
                <article key={p.id} onMouseMove={trackPointer} className="spot pm-reveal group rounded-2xl border border-white/10 bg-[#0B0D11] p-2.5 transition hover:border-[var(--pm-accent)]/45 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_var(--pm-accent)]">
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
                      <button type="button" disabled={st === 'out'} onClick={() => S.quickAdd(p)} aria-label={`Add ${p.name}`} title="Add this product to your bag" className="w-9 h-9 grid place-items-center rounded-lg border border-white/15 hover:bg-[var(--pm-accent)] hover:text-black hover:border-[var(--pm-accent)] disabled:opacity-30 disabled:pointer-events-none transition"><Ic.plus c="w-4 h-4" /></button></div>
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
                <div key={p.id} onMouseMove={trackPointer} className="spot pm-reveal group grid grid-cols-[64px_1fr_auto] md:grid-cols-[72px_1.4fr_1fr_140px_120px_48px] items-center gap-4 py-3.5 px-2 hover:bg-white/[0.03] transition">
                  <button type="button" onClick={() => S.openProduct(p)} className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-lg overflow-hidden bg-white/5"><Img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /></button>
                  <button type="button" onClick={() => S.openProduct(p)} className="text-left min-w-0"><div className="text-[14.5px] font-semibold truncate">{p.name}</div><div className="mono text-[10.5px] text-white/40 mt-0.5">#{String(i + 1).padStart(3, '0')} · {p.category || 'UNIT'}</div></button>
                  <div className="hidden md:block"><StockBar p={p} /></div>
                  <div className="hidden md:block mono text-[11px] text-white/40 truncate">{p.sizes.length ? p.sizes.join(' / ') : '—'}</div>
                  <div className="mono text-right md:text-left"><div className="text-[15px] font-semibold text-[var(--pm-accent)]">{S.m(p.price)}</div>{p.original_price > 0 && <div className="text-[10.5px] line-through text-white/30">{S.m(p.original_price)}</div>}</div>
                  <button type="button" disabled={st === 'out'} onClick={() => S.quickAdd(p)} aria-label={`Add ${p.name}`} title="Add this product to your bag" className="hidden md:grid w-10 h-10 place-items-center rounded-lg border border-white/15 hover:bg-[var(--pm-accent)] hover:text-black disabled:opacity-30 transition"><Ic.plus c="w-4 h-4" /></button>
                </div>
              )
            })}
          </div>
        )}
        {filtered.length === 0 && <div className="mono mt-8 rounded-2xl border border-dashed border-white/20 py-16 text-center text-white/50">&gt; NO UNITS MATCH QUERY<br /><button type="button" onClick={() => { S.setQuery(''); S.setActive('All'); S.setSavedOnly(false) }} className={`mt-5 h-11 px-6 font-bold ${DARK_SKIN.btn}`}>RESET</button></div>}
      </section>

      <footer className="border-t border-white/10 mono text-[12px] text-white/50">
        <div className="max-w-[1320px] mx-auto px-4 md:px-6 py-12 grid md:grid-cols-[1.4fr_1fr] gap-8">
          <div><div className="text-[var(--pm-accent)]">&gt; about --{String(c.headerLabel).toLowerCase().replace(/\s+/g, '-')}</div><p className="mt-3 max-w-[460px] leading-[1.8] text-white/55">{c.footerAbout}</p></div>
          <div className="space-y-1.5 md:text-right">{c.instagram && <div>ig: <span className="text-[var(--pm-accent)]">{c.instagram}</span></div>}{c.address && <div>loc: {c.address}</div>}<div>wa: {S.profile?.whatsapp_number}</div><div className="pt-3 text-white/30">{c.footerNote || `© ${S.profile?.business_name || c.headerLabel}`}</div></div>
        </div>
      </footer>

      <Overlays S={S} skin={DARK_SKIN} layout="modal" />
    </div>
  )
}

/* ---------- SleekEditorialPremiumTheme ---------- */
/* SLEEK EDITORIAL — a print magazine. Masthead, rules, numbered index, cursor-following image preview. */
const EDITORIAL_SKIN = {
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
const EDITORIAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600;700&display=swap');
.pm-edit{font-family:'Inter Tight',system-ui,sans-serif;--pm-display:'Instrument Serif',Georgia,serif}
.pm-edit .serif{font-family:var(--pm-display)}
.pm-edit .dropcap::first-letter{font-family:var(--pm-display);float:left;font-size:4.6em;line-height:.82;padding:.06em .1em 0 0;color:var(--pm-accent)}
.pm-edit .rule3{border-top:1px solid #111;border-bottom:3px double #111}
`

function SleekEditorialPremiumTheme({ S }: { S: any }) {
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
    <div ref={S.rootRef} style={S.cssVars} className={`pm-edit relative min-h-screen antialiased overflow-x-clip ${EDITORIAL_SKIN.root}`}>
      <style>{PM_BASE_CSS + EDITORIAL_CSS}</style>

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
              <button type="button" onClick={e => S.scrollTo(e, 'pm-collection')} className={`h-[52px] px-8 inline-flex items-center justify-center gap-3 transition ${EDITORIAL_SKIN.btn}`}>{c.ctaText}<Ic.right c="w-4 h-4" /></button>
              {c.secondaryCta && <button type="button" onClick={S.openCart} className={`h-[52px] px-8 transition ${EDITORIAL_SKIN.btnAlt}`}>{c.secondaryCta}</button>}
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
          <div className="flex items-center gap-5">{c.showSearch && <SearchBox S={S} className="w-[180px]" inputClass={`h-9 text-[13px] ${EDITORIAL_SKIN.input}`} />}{c.showSort && <SortSelect S={S} className="h-9 bg-transparent border-b border-black text-[11px] uppercase tracking-[0.16em]" />}</div>
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
        {filtered.length === 0 && <div className="py-24 text-center"><div className="serif text-[40px]">Nothing in this issue matches.</div><button type="button" onClick={() => { S.setQuery(''); S.setActive('All'); S.setSavedOnly(false) }} className={`mt-6 h-12 px-8 ${EDITORIAL_SKIN.btn}`}>Clear filters</button></div>}
      </section>

      {/* FEATURE SPREADS */}
      {feature.length > 0 && <section className="max-w-[1320px] mx-auto px-4 md:px-8 pt-24 space-y-20 md:space-y-28">{feature.map((p: any, i: number) => {
        const st = stockState(p)
        return (
          <article key={p.id} className={`pm-reveal grid md:grid-cols-12 gap-8 md:gap-12 items-center`}>
            <button type="button" onClick={() => S.openProduct(p)} aria-label={`View ${p.name}`} className={`md:col-span-6 block overflow-hidden group ${i % 2 ? 'md:order-2' : ''}`}><Img src={p.images[0]} alt={p.name} className="w-full aspect-[4/5] object-cover transition-transform duration-[1600ms] group-hover:scale-[1.05]" /></button>
            <div className="md:col-span-5 md:col-start-8"><div className="text-[11px] uppercase tracking-[0.3em] text-[var(--pm-accent)] font-semibold">Spread {String(i + 1).padStart(2, '0')} — {p.category || 'Featured'}</div><h3 className="serif mt-4 text-[clamp(40px,5.2vw,78px)] leading-[0.95] tracking-[-0.03em]">{p.name}</h3><p className="mt-5 text-[15px] leading-[1.75] text-black/65 line-clamp-4">{p.description || c.heroSubtitle}</p><div className="mt-6 flex items-baseline gap-3 tabular-nums"><span className="text-[24px] font-semibold">{S.m(p.price)}</span>{p.original_price > 0 && <span className="line-through text-black/35">{S.m(p.original_price)}</span>}</div><div className="mt-7 flex gap-3"><button type="button" onClick={() => S.openProduct(p)} className={`h-12 px-7 ${EDITORIAL_SKIN.btn}`}>Read more</button><button type="button" disabled={st === 'out'} onClick={() => S.quickAdd(p)} className={`h-12 px-7 disabled:opacity-30 ${EDITORIAL_SKIN.btnAlt}`}>{st === 'out' ? 'Sold out' : 'Add to bag'}</button></div></div>
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

      <Overlays S={S} skin={EDITORIAL_SKIN} layout="full" />
    </div>
  )
}

/* ============================== 4. RENDERER ============================== */
/* ============================== NEW PREMIUM VIEWS ============================== */
function NewThemeCatalog({ S, variant }: { S: any; variant: 'saffron' | 'atelier' | 'mono' }) {
  const { c, filtered } = S
  const cardStyle = variant === 'saffron'
    ? 'rounded-[24px] border border-[#E6D7C3] bg-[#FFFCF7] shadow-[0_12px_30px_-24px_rgba(58,35,24,.45)]'
    : variant === 'atelier'
      ? 'rounded-[28px] border border-[#E3DCD1] bg-[#FFFCF7]'
      : 'rounded-none border-2 border-black bg-white shadow-[5px_5px_0_#111]'
  const imageStyle = variant === 'saffron' ? 'aspect-[4/3] rounded-[20px]' : variant === 'atelier' ? 'aspect-[4/5] rounded-t-[999px]' : 'aspect-[4/5] rounded-none'
  const gridStyle = variant === 'atelier' ? 'grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-7 lg:grid-cols-3' : variant === 'mono' ? 'grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 md:gap-5' : 'grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4'

  return (
    <section id="pm-collection" className="mx-auto max-w-[1320px] scroll-mt-24 px-4 py-14 sm:px-6 md:py-20">
      <div className={`flex flex-col gap-5 border-b pb-5 sm:flex-row sm:items-end sm:justify-between ${variant === 'mono' ? 'border-black' : variant === 'atelier' ? 'border-[#D7D2C6]' : 'border-[#E6D7C3]'}`}>
        <div className="min-w-0">
          <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${variant === 'saffron' ? 'text-[#C95C3A]' : variant === 'atelier' ? 'text-[#718463]' : 'text-zinc-500'}`}>{variant === 'saffron' ? c.menuEyebrow : variant === 'atelier' ? c.journalEyebrow : c.dropNumber}</p>
          <h2 className={`${variant === 'atelier' ? 'font-serif font-normal tracking-[-0.04em]' : variant === 'mono' ? 'font-mono font-black uppercase tracking-[-0.06em]' : 'font-bold tracking-[-0.04em]'} mt-2 text-3xl sm:text-4xl`}>{c.collectionTitle}</h2>
          <p className="mt-2 max-w-xl text-sm opacity-65">{c.collectionSubtitle}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {c.showSearch && <SearchBox S={S} className="w-full sm:w-52" inputClass={`h-11 rounded-xl border px-3 text-sm ${variant === 'mono' ? 'border-black bg-white font-mono' : variant === 'atelier' ? 'border-[#D7D2C6] bg-white' : 'border-[#E6D7C3] bg-[#FFFCF7]'}`} />}
          {c.showSort && <SortSelect S={S} className={`h-11 rounded-xl border px-3 text-sm ${variant === 'mono' ? 'border-black bg-white font-mono' : variant === 'atelier' ? 'border-[#D7D2C6] bg-white' : 'border-[#E6D7C3] bg-[#FFFCF7]'}`} />}
        </div>
      </div>
      <div className="pm-sb -mx-1 mt-5 flex gap-2 overflow-x-auto px-1 pb-2" role="group" aria-label="Filter products">
        {S.chips.map((chip: string) => <button key={chip} type="button" onClick={() => S.setActive(chip)} aria-pressed={S.active === chip} className={`shrink-0 px-4 py-2 text-xs font-semibold transition ${variant === 'mono' ? `border-2 border-black ${S.active === chip ? 'bg-[#D9FF3F] text-black' : 'bg-white hover:bg-[#D9FF3F]'}` : variant === 'atelier' ? `rounded-full border ${S.active === chip ? 'border-[#718463] bg-[#718463] text-white' : 'border-[#D7D2C6] bg-transparent hover:bg-white'}` : `rounded-full border ${S.active === chip ? 'border-[#291B16] bg-[#291B16] text-white' : 'border-[#E6D7C3] bg-white hover:bg-[#F5E9D5]'}`}`}>{chip}</button>)}
        {S.savedOnly && <button type="button" onClick={() => S.setSavedOnly(false)} className="shrink-0 rounded-full border border-black px-4 py-2 text-xs font-semibold">Saved only ×</button>}
      </div>
      {filtered.length ? <div className={`mt-5 grid ${gridStyle}`}>
        {filtered.map((p: any, index: number) => {
          const discount = discountPct(p)
          const stock = stockState(p)
          return (
            <article key={p.id} className={`group min-w-0 p-2 transition ${cardStyle} ${variant === 'atelier' ? 'hover:-translate-y-1' : ''}`}>
              <div className={`relative overflow-hidden bg-black/5 ${imageStyle}`}>
                <button type="button" onClick={() => S.openProduct(p)} aria-label={`View ${p.name}`} className="absolute inset-0 z-[1] h-full w-full"><Img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" /></button>
                <div className="pointer-events-none absolute left-2 top-2 z-[2] flex flex-col gap-1">
                  {S.isHot(p) && <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${variant === 'mono' ? 'pm-accent-fill bg-[#D9FF3F] text-black' : variant === 'atelier' ? 'pm-accent-fill bg-[#718463] text-white' : 'pm-accent-fill bg-[#C95C3A] text-white'}`}>{c.hotBadge}</span>}
                  {discount > 0 && <span className="w-fit rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-black">-{discount}%</span>}
                  {stock === 'out' && <span className="rounded-full bg-black px-2.5 py-1 text-[9px] font-bold text-white">Sold out</span>}
                </div>
                <button type="button" onClick={() => S.toggleWish(p.id)} aria-label={S.isWished(p.id) ? 'Remove from saved items' : 'Save this product'} title={S.isWished(p.id) ? 'Remove from saved items' : 'Save this product'} aria-pressed={S.isWished(p.id)} className={`absolute right-2 top-2 z-[3] grid h-9 w-9 place-items-center rounded-full bg-white/90 text-zinc-800 shadow-sm transition hover:scale-105 ${variant === 'mono' ? 'border border-black' : ''}`}><Ic.heart c="h-4 w-4" fill={S.isWished(p.id)} /></button>
                {stock !== 'out' && <button type="button" onClick={() => S.quickAdd(p)} aria-label={`Add ${p.name} to bag`} title="Add to bag" className={`absolute bottom-2 right-2 z-[3] grid h-10 w-10 place-items-center rounded-full shadow-md transition hover:scale-105 ${variant === 'saffron' ? 'pm-accent-fill bg-[#C95C3A] text-white' : variant === 'atelier' ? 'pm-accent-fill bg-[#718463] text-white' : 'pm-accent-fill border-2 border-black bg-[#D9FF3F] text-black'}`}><Ic.plus c="h-4 w-4" /></button>}
              </div>
              <button type="button" onClick={() => S.openProduct(p)} className={`block w-full min-w-0 px-1 pb-1 pt-3 text-left ${variant === 'mono' ? 'font-mono' : ''}`}>
                <span className="block truncate text-[10px] uppercase tracking-[0.14em] opacity-50">{p.category || 'Featured'}</span>
                <span className="mt-1 block truncate text-sm font-bold sm:text-base">{p.name}</span>
                <span className="mt-1 block"><PriceLine p={p} S={S} big="text-[13px] sm:text-[14px]" strike="text-[10px] opacity-45" /></span>
                {stock === 'low' && <span className="mt-1 block text-[10px] font-semibold text-red-600">Only {p.stock} left</span>}
              </button>
              <button type="button" onClick={() => S.quickAdd(p)} disabled={stock === 'out'} className={`mt-1 h-10 w-full px-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${variant === 'saffron' ? 'rounded-xl bg-[#F3E6D3] text-[#43271E] hover:bg-[#E9D5B8]' : variant === 'atelier' ? 'rounded-full border border-[#D7D2C6] hover:border-[#718463] hover:bg-[#718463] hover:text-white' : 'border-2 border-black bg-white hover:bg-[#D9FF3F]'}`}>{stock === 'out' ? 'Sold out' : 'Add to bag'}</button>
            </article>
          )
        })}
      </div> : <div className={`mt-8 border p-10 text-center ${variant === 'mono' ? 'border-2 border-black bg-white font-mono' : 'rounded-3xl border-zinc-200 bg-white/70'}`}><p className="font-semibold">{S.products.length ? 'No products match these filters.' : 'Products will be here soon.'}</p><button type="button" onClick={() => { S.setQuery(''); S.setActive('All'); S.setSavedOnly(false) }} className="mt-3 text-sm font-semibold underline underline-offset-4">Clear filters</button></div>}
    </section>
  )
}


function NewThemeHighlights({ S, variant }: { S: any; variant: 'saffron' | 'atelier' | 'mono' }) {
  const { c } = S
  const stats = c.showStats && Array.isArray(c.stats) ? c.stats.slice(0, 3) : []
  const badges = Array.isArray(c.trustBadges) ? c.trustBadges.filter(Boolean).slice(0, 4) : []
  if (!stats.length && !badges.length) return null
  const border = variant === 'saffron' ? 'border-[#E6D7C3]' : variant === 'atelier' ? 'border-[#D7D2C6]' : 'border-black'
  const muted = variant === 'saffron' ? 'text-[#291B16]/60' : variant === 'atelier' ? 'text-[#2B3327]/60' : 'text-black/55'
  return (
    <section className={`flex flex-col gap-4 border-y py-4 sm:flex-row sm:items-center sm:justify-between ${border}`} aria-label="Store information">
      {stats.length > 0 && <div className="grid flex-1 grid-cols-3 divide-x divide-black/10">{stats.map((item: any, i: number) => <div key={i} className="px-3 text-center first:pl-0 last:pr-0"><div className="text-base font-bold leading-none">{item.value}</div><div className={`mt-1 text-[9px] uppercase tracking-[.12em] ${muted}`}>{item.label}</div></div>)}</div>}
      {badges.length > 0 && <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">{badges.map((badge: string, i: number) => <span key={`${badge}-${i}`} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-semibold ${border} ${muted}`}><Ic.check c={`h-3 w-3 ${variant === 'saffron' ? 'text-[#C95C3A]' : variant === 'atelier' ? 'text-[#718463]' : 'text-black'}`} />{badge}</span>)}</div>}
    </section>
  )
}

const SAFFRON_SKIN: Skin = {
  root: 'bg-[#F8F0E3] text-[#291B16]', panel: 'bg-[#FFFDF8] text-[#291B16] rounded-[28px]', drawer: 'bg-[#FFFDF8] text-[#291B16]', scrim: 'bg-[#291B16]/55 backdrop-blur-sm',
  muted: 'text-[#291B16]/55', line: 'border-[#E6D7C3]', soft: 'bg-[#F4E8D5]', chip: 'border-[#D9C5AB] bg-white', chipOn: 'bg-[#291B16] text-white border-[#291B16]', chipR: 'rounded-full',
  btn: 'bg-[#C95C3A] text-white rounded-full hover:bg-[#A94329]', btnAlt: 'border border-[#C95C3A] text-[#A94329] rounded-full hover:bg-[#C95C3A] hover:text-white', input: 'bg-white border border-[#E6D7C3] rounded-xl', title: 'font-bold tracking-[-0.04em]', dock: 'bg-[#FFFDF8]/95 backdrop-blur border-[#E6D7C3]',
}

function SaffronTableTheme({ S }: { S: any }) {
  const { c, products } = S
  const first = products[0]
  const lines = splitLines(c.heroTitle)
  return (
    <div ref={S.rootRef} style={S.cssVars} className="pm-saffron min-h-screen overflow-x-clip bg-[#F8F0E3] text-[#291B16] antialiased">
      <style>{PM_BASE_CSS + `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght,SOFT,WONK@9..144,400,20,1;9..144,500,20,1;9..144,600,20,1&display=swap');.pm-saffron{font-family:'DM Sans',sans-serif}.pm-saffron .food-serif{font-family:'Fraunces',Georgia,serif}.pm-saffron .pm-accent-fill{background:var(--pm-accent)!important}.pm-saffron .pm-accent-text{color:var(--pm-accent)!important}`}</style>
      {c.showAnnouncement && c.announcement && <div className="bg-[#291B16] px-4 py-2 text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-[#F8E7CA] sm:text-[10px]">{c.announcement}</div>}
      <header className="sticky top-0 z-30 border-b border-[#E6D7C3] bg-[#F8F0E3]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between gap-3 px-4 sm:px-6">
          <a href="#top" className="flex min-w-0 items-center gap-2.5"><span className="grid h-9 w-9 shrink-0 place-items-center pm-accent-fill rounded-full bg-[#C95C3A] text-lg text-white">✿</span><span className="truncate text-sm font-bold tracking-[-0.03em] sm:text-base">{c.headerLabel}</span></a>
          <nav className="hidden items-center gap-6 text-xs font-semibold text-[#291B16]/65 md:flex"><a href="#pm-collection" className="hover:text-[#C95C3A]">{c.collectionTitle}</a><a href="#saffron-special" className="hover:text-[#C95C3A]">{c.specialTitle}</a></nav>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => S.setSavedOnly(!S.savedOnly)} aria-label="Filter to saved products" title={S.savedOnly ? 'Show all products' : 'Filter to saved products'} className="grid h-10 w-10 place-items-center rounded-full hover:bg-white"><Ic.heart c="h-[18px] w-[18px]" fill={S.savedOnly} /></button>
            <button type="button" onClick={S.openCart} aria-label="Open shopping bag" title="Open shopping bag" className="inline-flex h-10 items-center gap-2 rounded-full bg-[#291B16] px-3 text-xs font-bold text-white"><Ic.bag c="h-4 w-4" /><span className="hidden sm:inline">Bag</span><span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#E8FF86] px-1 text-[10px] text-black">{S.cartCount}</span></button>
          </div>
        </div>
      </header>
      <main id="top" className="mx-auto max-w-[1320px] px-4 sm:px-6">
        <section className="grid gap-8 py-10 sm:py-14 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-14 lg:py-20">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -left-5 top-1/4 h-28 w-28 rounded-full bg-[#E5B675]/30 blur-2xl" aria-hidden />
            <div className="relative inline-flex items-center gap-2 rounded-full border border-[#DCC7AA] bg-[#FFFCF7] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em]"><span className="pm-accent-fill h-1.5 w-1.5 rounded-full bg-[#C95C3A]" />{c.heroBadge}</div>
            <h1 className="food-serif mt-5 text-[clamp(52px,8vw,100px)] leading-[.92] tracking-[-.055em]">{lines.map((line: string, i: number) => <span key={i} className={`block ${i === 1 ? 'pm-accent-text italic text-[#C95C3A]' : ''}`}>{line}</span>)}</h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-[#291B16]/65 sm:text-base">{c.heroSubtitle}</p>
            <div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={e => S.scrollTo(e, 'pm-collection')} className={`h-12 px-6 text-sm font-bold pm-accent-fill ${SAFFRON_SKIN.btn}`}>{c.ctaText} <Ic.right c="ml-2 inline h-4 w-4" /></button>{c.secondaryCta && <button type="button" onClick={S.openCart} className={`h-12 px-6 text-sm font-bold ${SAFFRON_SKIN.btnAlt}`}>{c.secondaryCta}</button>}</div>
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-semibold text-[#291B16]/55"><span className="inline-flex items-center gap-1.5"><Ic.truck c="h-4 w-4 text-[#C95C3A]" />{c.deliveryNote}</span><span className="inline-flex items-center gap-1.5"><Ic.check c="h-4 w-4 text-[#C95C3A]" />{c.dishNote}</span></div>
          </div>
          <div className="relative order-1 mx-auto w-full max-w-[520px] lg:order-2">
            <div className="absolute -inset-3 rotate-2 rounded-[42%_42%_24px_24px] border border-[#D9B991]" aria-hidden />
            <button type="button" onClick={() => first && S.openProduct(first)} aria-label={first ? `View ${first.name}` : c.featuredLabel} className="relative block w-full overflow-hidden rounded-[42%_42%_24px_24px] bg-[#E6D7C3]">
              <Img src={S.heroImg} alt={first?.name || c.featuredLabel} className="aspect-[4/4.3] w-full object-cover transition duration-700 hover:scale-[1.03]" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#291B16]/80 to-transparent px-5 pb-6 pt-16 text-left text-white"><span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#F5D4A5]">{c.featuredLabel}</span><span className="mt-1 block text-xl font-bold">{first?.name || c.headerLabel}</span>{first && <span className="mt-1 block text-sm">{S.m(first.price)}</span>}</span>
            </button>
            <span className="absolute -bottom-3 -left-2 grid h-16 w-16 rotate-[-9deg] place-items-center pm-accent-fill rounded-full bg-[#C95C3A] text-center text-[8px] font-bold uppercase leading-tight tracking-[0.12em] text-white shadow-lg">{c.menuEyebrow}</span>
          </div>
        </section>
        <NewThemeHighlights S={S} variant="saffron" />
        <NewThemeCatalog S={S} variant="saffron" />
        <section id="saffron-special" className="mx-auto mb-16 grid max-w-[1320px] overflow-hidden rounded-[28px] bg-[#291B16] text-white md:grid-cols-2">
          <div className="flex flex-col justify-center p-6 sm:p-10 md:p-12"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8B97B]">{c.menuEyebrow}</div><h2 className="food-serif mt-3 text-4xl leading-tight sm:text-5xl">{c.specialTitle}</h2><p className="mt-4 max-w-lg text-sm leading-7 text-white/65">{c.specialText}</p><a href="#pm-collection" className="pm-accent-fill mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#C95C3A] px-5 py-3 text-xs font-bold text-white">{c.specialButton}<Ic.right c="h-4 w-4" /></a></div>
          <div className="min-h-[240px] bg-[#503126]"><Img src={S.heroImg2} alt="" className="h-full min-h-[240px] w-full object-cover opacity-90" /></div>
        </section>
      </main>
      <footer className="border-t border-[#E6D7C3] bg-[#F3E8D7] px-4 py-9"><div className="mx-auto flex max-w-[1320px] flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><div className="font-bold">{c.headerLabel}</div><p className="mt-2 max-w-md text-xs leading-6 text-[#291B16]/60">{c.footerAbout}</p></div><div className="text-xs text-[#291B16]/60">{c.address && <span>{c.address} · </span>}WhatsApp {S.profile?.whatsapp_number}</div></div><div className="mx-auto mt-7 max-w-[1320px] border-t border-[#291B16]/10 pt-4 text-[10px] text-[#291B16]/40">{c.footerNote || `© ${S.profile?.business_name || c.headerLabel}`}</div></footer>
      <Overlays S={S} skin={SAFFRON_SKIN} layout="sheet" />
    </div>
  )
}

const ATELIER_SKIN: Skin = {
  root: 'bg-[#F4EFE9] text-[#2B3327]', panel: 'bg-[#FFFCF7] text-[#2B3327] rounded-[28px]', drawer: 'bg-[#FFFCF7] text-[#2B3327]', scrim: 'bg-[#263222]/50 backdrop-blur-sm',
  muted: 'text-[#2B3327]/55', line: 'border-[#E3DCD1]', soft: 'bg-[#ECE6DC]', chip: 'border-[#CFC9BC] bg-transparent', chipOn: 'bg-[#718463] text-white border-[#718463]', chipR: 'rounded-full',
  btn: 'bg-[#718463] text-white rounded-full hover:bg-[#536746]', btnAlt: 'border border-[#718463] text-[#536746] rounded-full hover:bg-[#718463] hover:text-white', input: 'bg-white border border-[#E3DCD1] rounded-full', title: 'font-serif font-normal tracking-[-0.04em]', dock: 'bg-[#FFFCF7]/95 backdrop-blur border-[#E3DCD1]',
}

function AtelierBloomTheme({ S }: { S: any }) {
  const { c, products } = S
  const lines = splitLines(c.heroTitle)
  const first = products[0]
  const storyImg = c.storyImage || S.heroImg2
  return (
    <div ref={S.rootRef} style={S.cssVars} className="pm-atelier min-h-screen overflow-x-clip bg-[#F4EFE9] text-[#2B3327] antialiased">
      <style>{PM_BASE_CSS + `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');.pm-atelier{font-family:'DM Sans',sans-serif}.pm-atelier .atelier-serif{font-family:'Playfair Display',Georgia,serif}.pm-atelier .pm-accent-fill{background:var(--pm-accent)!important}.pm-atelier .pm-accent-text{color:var(--pm-accent)!important}`}</style>
      {c.showAnnouncement && c.announcement && <div className="px-4 py-2 text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-[#536746]">{c.announcement}</div>}
      <header className="sticky top-0 z-30 border-y border-[#E3DCD1] bg-[#F4EFE9]/90 backdrop-blur-xl"><div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-3"><span className="atelier-serif text-2xl pm-accent-text italic text-[#718463]">a.</span><span className="text-xs font-semibold uppercase tracking-[0.2em]">{c.headerLabel}</span></a>
        <nav className="hidden gap-7 text-[11px] uppercase tracking-[0.14em] md:flex"><a href="#pm-collection" className="hover:text-[#718463]">{c.collectionTitle}</a><a href="#atelier-story" className="hover:text-[#718463]">{c.manifestoTitle}</a></nav>
        <div className="flex items-center gap-1"><button type="button" onClick={() => S.setSavedOnly(!S.savedOnly)} aria-label="Saved pieces" title={S.savedOnly ? 'Show all products' : 'Filter to saved pieces'} className="grid h-10 w-10 place-items-center rounded-full hover:bg-white"><Ic.heart c="h-[18px] w-[18px]" fill={S.savedOnly} /></button><button type="button" onClick={S.openCart} aria-label="Open bag" title="Open shopping bag" className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-xs font-semibold hover:bg-white"><Ic.bag c="h-4 w-4" />{S.cartCount}</button></div>
      </div></header>
      <main id="top" className="mx-auto max-w-[1320px] px-4 sm:px-6">
        <section className="relative grid min-h-[620px] items-center gap-8 py-12 md:grid-cols-2 md:py-16">
          <div className="absolute right-[8%] top-[8%] h-40 w-40 rounded-full bg-[#D7DEC9]/60 blur-2xl" aria-hidden />
          <div className="relative z-10 order-2 md:order-1 md:pl-8"><div className="text-[10px] font-semibold uppercase tracking-[0.24em] pm-accent-text text-[#718463]">{c.heroBadge}</div><h1 className="atelier-serif mt-6 text-[clamp(48px,7.2vw,88px)] leading-[1.06] tracking-[-0.045em]">{lines.map((line: string, i: number) => <span key={i} className={`block ${i === 1 ? 'pm-accent-text italic text-[#718463]' : ''}`}>{line}</span>)}</h1><p className="mt-6 max-w-md text-sm leading-7 text-[#2B3327]/65">{c.heroSubtitle}</p><div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={e => S.scrollTo(e, 'pm-collection')} className={`h-12 px-6 text-xs font-semibold pm-accent-fill ${ATELIER_SKIN.btn}`}>{c.ctaText}<Ic.right c="ml-2 inline h-4 w-4" /></button>{c.secondaryCta && <button type="button" onClick={S.openCart} className={`h-12 px-6 text-xs font-semibold ${ATELIER_SKIN.btnAlt}`}>{c.secondaryCta}</button>}</div></div>
          <div className="relative order-1 mx-auto w-full max-w-[520px] md:order-2"><div className="absolute -right-3 -top-5 h-32 w-32 rounded-full border border-[#AAB69B]" aria-hidden /><button type="button" onClick={() => first && S.openProduct(first)} aria-label={first ? `View ${first.name}` : c.featuredLabel} className="relative z-10 block w-full overflow-hidden rounded-t-[999px] bg-[#E3DCD1]"><Img src={S.heroImg} alt={first?.name || ''} className="aspect-[4/5] w-full object-cover transition duration-700 hover:scale-[1.035]" /></button><div className="absolute -bottom-5 -left-4 z-20 pm-accent-fill rounded-full bg-[#718463] px-5 py-3 text-[9px] font-bold uppercase tracking-[0.17em] text-white shadow-lg">{c.featuredLabel}</div></div>
        </section>
        <NewThemeHighlights S={S} variant="atelier" />
        <section id="atelier-story" className="grid gap-8 border-y border-[#D7D2C6] py-12 md:grid-cols-[.85fr_1.15fr] md:items-center md:gap-16 md:py-16"><div className="relative mx-auto w-full max-w-[390px]"><div className="absolute -inset-3 rounded-t-[999px] border border-[#AAB69B]" aria-hidden /><Img src={storyImg} alt="" className="relative aspect-[4/5] w-full rounded-t-[999px] object-cover" /></div><div className="max-w-xl"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#718463]">{c.journalEyebrow}</div><h2 className="atelier-serif mt-4 text-4xl leading-tight sm:text-5xl">{c.manifestoTitle}</h2><p className="mt-5 text-sm leading-7 text-[#2B3327]/65">{c.manifestoText}</p><div className="mt-8 border-t border-[#D7D2C6] pt-5"><div className="text-xs font-semibold">{c.craftTitle}</div><p className="mt-2 text-xs leading-6 text-[#2B3327]/60">{c.craftText}</p></div></div></section>
        <NewThemeCatalog S={S} variant="atelier" />
      </main>
      <footer className="border-t border-[#D7D2C6] px-4 py-9"><div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-4 sm:flex-row"><div><div className="atelier-serif text-xl">{c.headerLabel}</div><p className="mt-2 max-w-md text-xs leading-6 text-[#2B3327]/60">{c.footerAbout}</p></div><div className="self-end text-xs text-[#2B3327]/55">{c.instagram && <span>{c.instagram} · </span>}{c.address}{S.profile?.whatsapp_number && <div className="mt-1">WhatsApp {S.profile.whatsapp_number}</div>}</div></div><div className="mx-auto mt-7 max-w-[1320px] border-t border-[#D7D2C6] pt-4 text-[10px] text-[#2B3327]/45">{c.footerNote || `© ${S.profile?.business_name || c.headerLabel}`}</div></footer>
      <Overlays S={S} skin={ATELIER_SKIN} layout="full" />
    </div>
  )
}

const MONO_SKIN: Skin = {
  root: 'bg-[#F3F3EF] text-[#111111]', panel: 'bg-white text-black border-2 border-black rounded-none shadow-[8px_8px_0_#D9FF3F]', drawer: 'bg-[#F3F3EF] text-black border-l-2 border-black', scrim: 'bg-black/60',
  muted: 'text-black/55', line: 'border-black/20', soft: 'bg-black/[0.04]', chip: 'border-2 border-black bg-white', chipOn: 'bg-[#D9FF3F] text-black border-black', chipR: 'rounded-none',
  btn: 'bg-[#D9FF3F] text-black border-2 border-black rounded-none shadow-[4px_4px_0_#111] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#111]', btnAlt: 'bg-black text-white border-2 border-black rounded-none', input: 'bg-white border-2 border-black rounded-none', title: 'font-mono font-black uppercase tracking-[-0.06em]', dock: 'bg-[#F3F3EF]/95 backdrop-blur border-black',
}

function MonoMarketTheme({ S }: { S: any }) {
  const { c, products } = S
  const lines = splitLines(c.heroTitle)
  const first = products[0]
  const tickerText = c.tickerText || c.dropNumber
  return (
    <div ref={S.rootRef} style={S.cssVars} className="pm-mono min-h-screen overflow-x-clip bg-[#F3F3EF] text-[#111] antialiased">
      <style>{PM_BASE_CSS + `@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap');.pm-mono{font-family:'Space Grotesk',sans-serif;background-image:linear-gradient(rgba(0,0,0,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.045) 1px,transparent 1px);background-size:24px 24px}.pm-mono .mono-type{font-family:'DM Mono',monospace}.pm-mono .pm-accent-fill{background:var(--pm-accent)!important;border-color:var(--pm-accent)!important}.pm-mono .pm-accent-text{color:var(--pm-accent)!important}.pm-mono .pm-accent-hover:hover{color:var(--pm-accent)!important;border-color:var(--pm-accent)!important}`}</style>
      {c.showAnnouncement && c.announcement && <div className="bg-[#D9FF3F] px-4 py-2 text-center font-mono text-[9px] font-bold uppercase tracking-[0.16em] sm:text-[10px]">{c.announcement}</div>}
      <header className="sticky top-0 z-30 border-b-2 border-black bg-[#F3F3EF]/95 backdrop-blur-xl"><div className="mx-auto flex h-[66px] max-w-[1320px] items-center justify-between px-4 sm:px-6"><a href="#top" className="mono-type text-sm font-bold tracking-[-0.06em]">{c.headerLabel}</a><div className="hidden items-center gap-6 text-[10px] font-bold uppercase tracking-[0.13em] md:flex"><a href="#pm-collection">{c.collectionTitle}</a><a href="#mono-manifesto">{c.manifestoTitle}</a></div><div className="flex items-center gap-2"><button type="button" onClick={() => S.setSavedOnly(!S.savedOnly)} title={S.savedOnly ? 'Show all products' : 'Filter saved products'} aria-label="Filter saved products" className="grid h-9 w-9 place-items-center border-2 border-black bg-white"><Ic.heart c="h-4 w-4" fill={S.savedOnly} /></button><button type="button" onClick={S.openCart} title="Open shopping bag" aria-label="Open shopping bag" className="inline-flex h-9 items-center gap-2 border-2 border-black bg-black px-3 text-xs font-bold text-white"><Ic.bag c="h-4 w-4" /><span>{S.cartCount}</span></button></div></div></header>
      <main id="top" className="mx-auto max-w-[1320px] px-4 sm:px-6">
        <section className="grid gap-4 py-6 md:grid-cols-12 md:py-10">
          <div className="relative flex min-h-[390px] flex-col justify-between overflow-hidden border-2 border-black bg-[#111] p-5 text-white sm:min-h-[510px] sm:p-10 md:col-span-8">
            <div className="absolute right-[-5%] top-[8%] select-none text-[clamp(180px,34vw,440px)] font-black leading-none text-[#D9FF3F]/10" aria-hidden>01</div>
            <div className="relative flex items-center justify-between gap-3"><span className="mono-type inline-flex border border-[#D9FF3F] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] pm-accent-text text-[#D9FF3F]">{c.dropNumber}</span><span className="mono-type text-[9px] uppercase tracking-[0.14em] text-white/55">{c.heroBadge}</span></div>
            <div className="relative z-10 max-w-3xl"><h1 className="text-[clamp(52px,10vw,120px)] font-bold uppercase leading-[.84] tracking-[-.09em]">{lines.map((line: string, i: number) => <span key={i} className={`block ${i === 1 ? 'pm-accent-text text-[#D9FF3F]' : ''}`}>{line}</span>)}</h1><p className="mt-6 max-w-xl text-sm leading-6 text-white/60">{c.heroSubtitle}</p><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={e => S.scrollTo(e, 'pm-collection')} className={`h-12 px-5 text-xs font-bold uppercase pm-accent-fill ${MONO_SKIN.btn}`}>{c.ctaText}<Ic.right c="ml-2 inline h-4 w-4" /></button>{c.secondaryCta && <button type="button" onClick={S.openCart} className="h-12 border-2 border-white/40 px-5 text-xs font-bold uppercase hover:border-[#D9FF3F] pm-accent-hover text-[#D9FF3F]">{c.secondaryCta}</button>}</div></div>
            <div className="relative mt-8 flex items-center justify-between border-t border-white/20 pt-3 mono-type text-[9px] uppercase tracking-[0.12em] text-white/45"><span>{c.specLine}</span><span>{c.currency} / {products.length} items</span></div>
          </div>
          <button type="button" onClick={() => first && S.openProduct(first)} aria-label={first ? `View ${first.name}` : c.featuredLabel} className="group relative min-h-[320px] overflow-hidden border-2 border-black bg-white md:col-span-4 md:min-h-0"><Img src={S.heroImg} alt={first?.name || ''} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"/><span className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"/><span className="absolute left-4 top-4 pm-accent-fill border-2 border-black bg-[#D9FF3F] px-2 py-1 mono-type text-[9px] font-bold uppercase">{c.featuredLabel}</span><span className="absolute bottom-4 left-4 right-4 text-left text-white"><span className="mono-type block text-[9px] uppercase tracking-wider pm-accent-text text-[#D9FF3F]">{c.dropNumber}</span><span className="mt-1 block text-xl font-bold">{first?.name}</span>{first && <span className="mt-1 block text-sm">{S.m(first.price)}</span>}</span></button>
        </section>
        <NewThemeHighlights S={S} variant="mono" />
        <div className="relative overflow-hidden border-y-2 border-black bg-white py-2"><div className="pm-mono-marquee flex min-w-max gap-10 mono-type text-[10px] font-bold uppercase tracking-[.15em]">{[0,1,2,3].map(i => <span key={i} className="flex gap-10">{tickerText}<span className="text-[#718463]">◆</span></span>)}</div></div>
        <NewThemeCatalog S={S} variant="mono" />
        <section id="mono-manifesto" className="mb-14 grid border-2 border-black pm-accent-fill bg-[#D9FF3F] md:grid-cols-[.72fr_1.28fr]"><div className="border-b-2 border-black p-5 mono-type text-[10px] font-bold uppercase tracking-[.14em] md:border-b-0 md:border-r-2">{c.dropNumber}<br/><span className="mt-2 inline-block">{products.length} ITEMS / SELECTED STOCK</span></div><div className="p-6 sm:p-10"><h2 className="text-3xl font-bold uppercase leading-none tracking-[-.07em] sm:text-5xl">{c.manifestoTitle}</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-black/70">{c.manifestoText}</p></div></section>
      </main>
      <footer className="border-t-2 border-black bg-white px-4 py-8"><div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-4 sm:flex-row"><div><div className="mono-type text-sm font-bold uppercase">{c.headerLabel}</div><p className="mt-2 max-w-lg text-xs leading-6 text-black/60">{c.footerAbout}</p></div><div className="mono-type self-end text-[10px] uppercase">{c.address}{S.profile?.whatsapp_number && <div className="mt-1">WA {S.profile.whatsapp_number}</div>}</div></div><div className="mx-auto mt-7 max-w-[1320px] border-t border-black/15 pt-4 mono-type text-[9px] text-black/45">{c.footerNote || `© ${S.profile?.business_name || c.headerLabel}`}</div></footer>
      <Overlays S={S} skin={MONO_SKIN} layout="full" />
    </div>
  )
}


const THEME_VIEWS: Record<string, (p: { S: any }) => any> = {
  'spike-premium': SpikePremiumTheme,
  'shoe-app-premium': ShoeAppPremiumTheme,
  'trenzo-luxury': TrenzoLuxuryTheme,
  'sleek-beige': SleekBeigePremiumTheme,
  'sleek-dark': SleekDarkPremiumTheme,
  'sleek-editorial': SleekEditorialPremiumTheme,
  'saffron-table': SaffronTableTheme,
  'atelier-bloom': AtelierBloomTheme,
  'mono-market': MonoMarketTheme,
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
