export type ThemeCategory = 'food' | 'clothing' | 'tech' | 'shoes' | 'sleek'
export type StoreTheme = {
  id: string
  name: string
  category: ThemeCategory
  niche: ThemeCategory
  badge: string
  tagline: string
  tier?: 'standard' | 'advanced'
  colors: { bg: string; text: string; card: string; border: string; accent: string; sub?: string }
}
// backward compat aliases
export type Theme = StoreTheme

export const STORE_THEMES: StoreTheme[] = [
  { id: 'food-spice', name: 'Spice Bazaar', category: 'food', niche: 'food', badge: '🌶️', tagline: 'Desi spices', tier: 'standard', colors: { bg: '#FFFBF5', text: '#2D1B0E', card: '#FFFFFF', border: '#FFD6B8', accent: '#FF6B35', sub: '#9A3412' } },
  { id: 'food-organic', name: 'Organic Farm', category: 'food', niche: 'food', badge: '🌿', tagline: 'Fresh farm', tier: 'standard', colors: { bg: '#F6F8F4', text: '#1E2A1A', card: '#FFFFFF', border: '#C5D9B8', accent: '#87A878', sub: '#166534' } },
  { id: 'clothing-noor', name: 'Noor Boutique', category: 'clothing', niche: 'clothing', badge: '✨', tagline: 'Elegant fashion', tier: 'standard', colors: { bg: '#FDF8FF', text: '#1A0E2E', card: '#FFFFFF', border: '#E8D5F2', accent: '#9B59B6', sub: '#6B7280' } },
  { id: 'clothing-street', name: 'Street Culture', category: 'clothing', niche: 'clothing', badge: '🔥', tagline: 'Urban drops', tier: 'standard', colors: { bg: '#0A0A0A', text: '#FFFFFF', card: '#181818', border: '#2A2A2A', accent: '#CCFF00', sub: '#A1A1AA' } },
  { id: 'tech-minimal', name: 'Tech Minimal', category: 'tech', niche: 'tech', badge: '⚡', tagline: 'Gadgets & gear', tier: 'standard', colors: { bg: '#FAFAFA', text: '#0F0F0F', card: '#FFFFFF', border: '#E5E5E5', accent: '#111111', sub: '#6B7280' } },
  { id: 'tech-electro', name: 'Electro Hub', category: 'tech', niche: 'tech', badge: '💻', tagline: 'Future tech', tier: 'standard', colors: { bg: '#0F1117', text: '#E2E8F0', card: '#1A1D27', border: '#2D3748', accent: '#3B82F6', sub: '#94A3B8' } },
  { id: 'shoes-street', name: 'Street Kicks', category: 'shoes', niche: 'shoes', badge: '👟', tagline: 'Hype footwear', tier: 'standard', colors: { bg: '#FFF5F5', text: '#1A0E0E', card: '#FFFFFF', border: '#FFCFCF', accent: '#FF1A1A', sub: '#71717A' } },
  { id: 'shoes-leather', name: 'Leather Craft', category: 'shoes', niche: 'shoes', badge: '🤎', tagline: 'Handmade premium', tier: 'standard', colors: { bg: '#FDF8F0', text: '#2C1810', card: '#FFFFFF', border: '#E8D5C4', accent: '#D4A574', sub: '#8C6B4A' } },
  { id: 'sleek-beige', name: 'Sleek Beige', category: 'sleek', niche: 'sleek', badge: '○', tagline: 'Quiet minimal', tier: 'advanced', colors: { bg: '#FAF9F6', text: '#0F0F0F', card: '#FFFFFF', border: '#E8E4DF', accent: '#111111', sub: '#9CA3AF' } },
  { id: 'sleek-dark', name: 'Sleek Dark', category: 'sleek', niche: 'sleek', badge: '●', tagline: 'Midnight mode', tier: 'advanced', colors: { bg: '#0F0F0F', text: '#FAFAF8', card: '#1A1A1A', border: '#2A2A2A', accent: '#FFFFFF', sub: '#6B7280' } },
  { id: 'sleek-editorial', name: 'Editorial', category: 'sleek', niche: 'sleek', badge: '—', tagline: 'Curated essentials', tier: 'advanced', colors: { bg: '#FFFFFF', text: '#111111', card: '#F8F8F6', border: '#E5E5E3', accent: '#111111', sub: '#737373' } },
]

export function getTheme(id: string): StoreTheme {
  return STORE_THEMES.find(t => t.id === id) || STORE_THEMES[2]
}
export const getThemesByCategory = (cat: ThemeCategory) => STORE_THEMES.filter(t => t.category === cat)
export const getStandardThemes = () => STORE_THEMES.filter(t => t.tier !== 'advanced')
export const getAdvancedThemes = () => STORE_THEMES.filter(t => t.tier === 'advanced')
