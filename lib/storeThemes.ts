export type ThemeCategory = 'food' | 'clothing' | 'tech' | 'shoes' | 'sleek'
export type StoreTheme = {
  id: string
  category: ThemeCategory
  name: string
  tagline: string
  colors: { bg: string; card: string; accent: string; text: string; sub: string }
  badge: string
  tier?: 'standard' | 'advanced'
}

export const STORE_THEMES: StoreTheme[] = [
  // FOOD - 2 themes
  {
    id: 'food-spice',
    category: 'food',
    name: 'Spice Market',
    tagline: 'Warm, spicy, street-food energy',
    colors: { bg: '#FFF8F0', card: '#FFFFFF', accent: '#FF6B35', text: '#1A1A1A', sub: '#8B5E34' },
    badge: '🍛',
    tier: 'standard'
  },
  {
    id: 'food-organic',
    category: 'food',
    name: 'Organic Bowl',
    tagline: 'Clean, farm-fresh, minimal',
    colors: { bg: '#F6F7F4', card: '#FFFFFF', accent: '#87A878', text: '#2B331E', sub: '#6A7B5E' },
    badge: '🥗',
    tier: 'standard'
  },
  // CLOTHING - 2 themes
  {
    id: 'clothing-noor',
    category: 'clothing',
    name: 'Noor Premium',
    tagline: 'Boutique luxury, beige & lime',
    colors: { bg: '#F8F7F5', card: '#FFFFFF', accent: '#E8FF86', text: '#0d0f14', sub: '#6B7280' },
    badge: '👗',
    tier: 'standard'
  },
  {
    id: 'clothing-street',
    category: 'clothing',
    name: 'Street Drop',
    tagline: 'Hypebeast, bold, drop culture',
    colors: { bg: '#0A0A0A', card: '#151515', accent: '#CCFF00', text: '#FFFFFF', sub: '#A1A1AA' },
    badge: '🔥',
    tier: 'standard'
  },
  // TECH - 2 themes
  {
    id: 'tech-electro',
    category: 'tech',
    name: 'Electro Dark',
    tagline: 'Glass, neon, specs-first',
    colors: { bg: '#0d0f14', card: '#151821', accent: '#3B82F6', text: '#FFFFFF', sub: '#94A3B8' },
    badge: '⚡',
    tier: 'standard'
  },
  {
    id: 'tech-clean',
    category: 'tech',
    name: 'Clean Lab',
    tagline: 'Apple-minimal, spec dots',
    colors: { bg: '#FFFFFF', card: '#F8FAFC', accent: '#2563EB', text: '#0F172A', sub: '#64748B' },
    badge: '🔬',
    tier: 'standard'
  },
  // SHOES - 2 themes
  {
    id: 'shoes-street',
    category: 'shoes',
    name: 'Sole Street',
    tagline: 'Sneakerhead, big type, chunky',
    colors: { bg: '#FFFFFF', card: '#FFFFFF', accent: '#FF1A1A', text: '#111111', sub: '#71717A' },
    badge: '👟',
    tier: 'standard'
  },
  {
    id: 'shoes-leather',
    category: 'shoes',
    name: 'Leather Atelier',
    tagline: 'Brown, tan, serif luxury',
    colors: { bg: '#FDF6E3', card: '#FFFFFF', accent: '#D4A574', text: '#3C2415', sub: '#8C6B4A' },
    badge: '🤎',
    tier: 'standard'
  },
  // SLEEK ADVANCED - 3 themes (new)
  {
    id: 'sleek-beige',
    category: 'sleek',
    name: 'Sleek Beige',
    tagline: 'Quiet luxury, warm off-white',
    colors: { bg: '#FAF9F6', card: '#FFFFFF', accent: '#0A0A0A', text: '#0A0A0A', sub: '#8A8A8A' },
    badge: '✦',
    tier: 'advanced'
  },
  {
    id: 'sleek-dark',
    category: 'sleek',
    name: 'Sleek Dark',
    tagline: 'Minimal night, charcoal',
    colors: { bg: '#0F0F0F', card: '#181818', accent: '#FFFFFF', text: '#FFFFFF', sub: '#9A9A9A' },
    badge: '◐',
    tier: 'advanced'
  },
  {
    id: 'sleek-editorial',
    category: 'sleek',
    name: 'Sleek Editorial',
    tagline: 'COS / Aritzia, serif, whitespace',
    colors: { bg: '#FFFFFF', card: '#F6F5F2', accent: '#0A0A0A', text: '#0A0A0A', sub: '#A8A8A8' },
    badge: '—',
    tier: 'advanced'
  },
]

export const getTheme = (id?: string) => STORE_THEMES.find(t => t.id === id) || STORE_THEMES[2]
export const getThemesByCategory = (cat: ThemeCategory) => STORE_THEMES.filter(t => t.category === cat)
export const getStandardThemes = () => STORE_THEMES.filter(t => t.tier !== 'advanced')
export const getAdvancedThemes = () => STORE_THEMES.filter(t => t.tier === 'advanced')
