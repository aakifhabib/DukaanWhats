export type StoreTheme = {
  id: string
  name: string
  niche: 'food' | 'clothing' | 'tech' | 'shoes' | 'sleek'
  badge: string
  tagline: string
  colors: { bg: string; text: string; card: string; border: string; accent: string }
}

export const STORE_THEMES: StoreTheme[] = [
  { id: 'food-spice', name: 'Spice Bazaar', niche: 'food', badge: '🌶️', tagline: 'Desi spices & flavors', colors: { bg: '#FFFBF5', text: '#2D1B0E', card: '#FFFFFF', border: '#FFD6B8', accent: '#FF6B35' } },
  { id: 'food-organic', name: 'Organic Farm', niche: 'food', badge: '🌿', tagline: 'Fresh from farm', colors: { bg: '#F6F8F4', text: '#1E2A1A', card: '#FFFFFF', border: '#C5D9B8', accent: '#87A878' } },
  { id: 'clothing-noor', name: 'Noor Boutique', niche: 'clothing', badge: '✨', tagline: 'Elegant fashion', colors: { bg: '#FDF8FF', text: '#1A0E2E', card: '#FFFFFF', border: '#E8D5F2', accent: '#9B59B6' } },
  { id: 'clothing-street', name: 'Street Culture', niche: 'clothing', badge: '🔥', tagline: 'Urban drops', colors: { bg: '#0A0A0A', text: '#FFFFFF', card: '#181818', border: '#2A2A2A', accent: '#CCFF00' } },
  { id: 'tech-minimal', name: 'Tech Minimal', niche: 'tech', badge: '⚡', tagline: 'Gadgets & gear', colors: { bg: '#FAFAFA', text: '#0F0F0F', card: '#FFFFFF', border: '#E5E5E5', accent: '#111111' } },
  { id: 'tech-electro', name: 'Electro Hub', niche: 'tech', badge: '💻', tagline: 'Future tech', colors: { bg: '#0F1117', text: '#E2E8F0', card: '#1A1D27', border: '#2D3748', accent: '#3B82F6' } },
  { id: 'shoes-street', name: 'Street Kicks', niche: 'shoes', badge: '👟', tagline: 'Hype footwear', colors: { bg: '#FFF5F5', text: '#1A0E0E', card: '#FFFFFF', border: '#FFCFCF', accent: '#FF1A1A' } },
  { id: 'shoes-leather', name: 'Leather Craft', niche: 'shoes', badge: '🤎', tagline: 'Handmade premium', colors: { bg: '#FDF8F0', text: '#2C1810', card: '#FFFFFF', border: '#E8D5C4', accent: '#D4A574' } },
  { id: 'sleek-beige', name: 'Sleek Beige', niche: 'sleek', badge: '○', tagline: 'Quiet minimal', colors: { bg: '#FAF9F6', text: '#0F0F0F', card: '#FFFFFF', border: '#E8E4DF', accent: '#111111' } },
  { id: 'sleek-dark', name: 'Sleek Dark', niche: 'sleek', badge: '●', tagline: 'Midnight mode', colors: { bg: '#0F0F0F', text: '#FAFAF8', card: '#1A1A1A', border: '#2A2A2A', accent: '#FFFFFF' } },
  { id: 'sleek-editorial', name: 'Editorial', niche: 'sleek', badge: '—', tagline: 'Curated essentials', colors: { bg: '#FFFFFF', text: '#111111', card: '#F8F8F6', border: '#E5E5E3', accent: '#111111' } },
]

export function getTheme(id: string): StoreTheme {
  return STORE_THEMES.find(t => t.id === id) || STORE_THEMES[0]
}
