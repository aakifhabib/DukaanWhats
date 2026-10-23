export type ThemeCategory = 'food' | 'clothing' | 'tech' | 'shoes'
export type StoreTheme = {
  id: string
  category: ThemeCategory
  name: string
  tagline: string
  colors: { bg: string; card: string; accent: string; text: string; sub: string }
  badge: string
}

export const STORE_THEMES: StoreTheme[] = [
  {
    id: 'food-spice',
    category: 'food',
    name: 'Spice Market',
    tagline: 'Warm, spicy, street-food energy',
    colors: { bg: '#FFF8F0', card: '#FFFFFF', accent: '#FF6B35', text: '#1A1A1A', sub: '#8B5E34' },
    badge: '🍛'
  },
  {
    id: 'food-organic',
    category: 'food',
    name: 'Organic Bowl',
    tagline: 'Clean, farm-fresh, minimal',
    colors: { bg: '#F6F7F4', card: '#FFFFFF', accent: '#87A878', text: '#2B331E', sub: '#6A7B5E' },
    badge: '🥗'
  },
  {
    id: 'clothing-noor',
    category: 'clothing',
    name: 'Noor Premium',
    tagline: 'Boutique luxury, beige & lime',
    colors: { bg: '#F8F7F5', card: '#FFFFFF', accent: '#E8FF86', text: '#0d0f14', sub: '#6B7280' },
    badge: '👗'
  },
  {
    id: 'clothing-street',
    category: 'clothing',
    name: 'Street Drop',
    tagline: 'Hypebeast, bold, drop culture',
    colors: { bg: '#0A0A0A', card: '#151515', accent: '#CCFF00', text: '#FFFFFF', sub: '#A1A1AA' },
    badge: '🔥'
  },
  {
    id: 'tech-electro',
    category: 'tech',
    name: 'Electro Dark',
    tagline: 'Glass, neon, specs-first',
    colors: { bg: '#0d0f14', card: '#151821', accent: '#3B82F6', text: '#FFFFFF', sub: '#94A3B8' },
    badge: '⚡'
  },
  {
    id: 'tech-clean',
    category: 'tech',
    name: 'Clean Lab',
    tagline: 'Apple-minimal, spec dots',
    colors: { bg: '#FFFFFF', card: '#F8FAFC', accent: '#2563EB', text: '#0F172A', sub: '#64748B' },
    badge: '🔬'
  },
  {
    id: 'shoes-street',
    category: 'shoes',
    name: 'Sole Street',
    tagline: 'Sneakerhead, big type, chunky',
    colors: { bg: '#FFFFFF', card: '#FFFFFF', accent: '#FF1A1A', text: '#111111', sub: '#71717A' },
    badge: '👟'
  },
  {
    id: 'shoes-leather',
    category: 'shoes',
    name: 'Leather Atelier',
    tagline: 'Brown, tan, serif luxury',
    colors: { bg: '#FDF6E3', card: '#FFFFFF', accent: '#D4A574', text: '#3C2415', sub: '#8C6B4A' },
    badge: '🤎'
  },
]

export const getTheme = (id?: string) => STORE_THEMES.find(t => t.id === id) || STORE_THEMES[2]
export const getThemesByCategory = (cat: ThemeCategory) => STORE_THEMES.filter(t => t.category === cat)
