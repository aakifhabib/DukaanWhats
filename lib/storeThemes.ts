export type ThemeCategory = 'food' | 'clothing' | 'tech' | 'shoes' | 'sleek' | 'advanced' | 'premium'
export type StoreTheme = {
  id: string
  name: string
  category: ThemeCategory
  niche: ThemeCategory
  badge: string
  tagline: string
  tier?: 'standard' | 'advanced' | 'premium'
  colors: { bg: string; text: string; card: string; border: string; accent: string; sub?: string }
}
export type Theme = StoreTheme

export const STORE_THEMES: StoreTheme[] = [
  // STANDARD - 8 themes (free)
  { id: 'food-spice', name: 'Spice Bazaar', category: 'food', niche: 'food', badge: '🌶️', tagline: 'Desi spices', tier: 'standard', colors: { bg: '#FFFBF5', text: '#2D1B0E', card: '#FFFFFF', border: '#FFD6B8', accent: '#FF6B35', sub: '#9A3412' } },
  { id: 'food-organic', name: 'Organic Farm', category: 'food', niche: 'food', badge: '🌿', tagline: 'Fresh farm', tier: 'standard', colors: { bg: '#F6F8F4', text: '#1E2A1A', card: '#FFFFFF', border: '#C5D9B8', accent: '#87A878', sub: '#166534' } },
  { id: 'clothing-noor', name: 'Noor Boutique', category: 'clothing', niche: 'clothing', badge: '✨', tagline: 'Elegant fashion', tier: 'standard', colors: { bg: '#FDF8FF', text: '#1A0E2E', card: '#FFFFFF', border: '#E8D5F2', accent: '#9B59B6', sub: '#6B7280' } },
  { id: 'clothing-street', name: 'Street Culture', category: 'clothing', niche: 'clothing', badge: '🔥', tagline: 'Urban drops', tier: 'standard', colors: { bg: '#0A0A0A', text: '#FFFFFF', card: '#181818', border: '#2A2A2A', accent: '#CCFF00', sub: '#A1A1AA' } },
  { id: 'tech-minimal', name: 'Tech Minimal', category: 'tech', niche: 'tech', badge: '⚡', tagline: 'Gadgets & gear', tier: 'standard', colors: { bg: '#FAFAFA', text: '#0F0F0F', card: '#FFFFFF', border: '#E5E5E5', accent: '#111111', sub: '#6B7280' } },
  { id: 'tech-electro', name: 'Electro Hub', category: 'tech', niche: 'tech', badge: '💻', tagline: 'Future tech', tier: 'standard', colors: { bg: '#0F1117', text: '#E2E8F0', card: '#1A1D27', border: '#2D3748', accent: '#3B82F6', sub: '#94A3B8' } },
  { id: 'shoes-street', name: 'Street Kicks', category: 'shoes', niche: 'shoes', badge: '👟', tagline: 'Hype footwear', tier: 'standard', colors: { bg: '#FFF5F5', text: '#1A0E0E', card: '#FFFFFF', border: '#FFCFCF', accent: '#FF1A1A', sub: '#71717A' } },
  { id: 'shoes-leather', name: 'Leather Craft', category: 'shoes', niche: 'shoes', badge: '🤎', tagline: 'Handmade premium', tier: 'standard', colors: { bg: '#FDF8F0', text: '#2C1810', card: '#FFFFFF', border: '#E8D5C4', accent: '#D4A574', sub: '#8C6B4A' } },

  // ADVANCED GLASS THEMES - 3 original sleek
  { id: 'sleek-beige', name: 'Sleek Beige', category: 'advanced', niche: 'advanced', badge: '○', tagline: 'Quiet minimal luxury', tier: 'advanced', colors: { bg: '#FAF9F6', text: '#0F0F0F', card: '#FFFFFF', border: '#E8E4DF', accent: '#111111', sub: '#9CA3AF' } },
  { id: 'sleek-dark', name: 'Sleek Dark', category: 'advanced', niche: 'advanced', badge: '●', tagline: 'Midnight minimal', tier: 'advanced', colors: { bg: '#0F0F0F', text: '#FAFAF8', card: '#1A1A1A', border: '#2A2A2A', accent: '#FFFFFF', sub: '#6B7280' } },
  { id: 'sleek-editorial', name: 'Editorial', category: 'advanced', niche: 'advanced', badge: '—', tagline: 'Curated essentials', tier: 'advanced', colors: { bg: '#FFFFFF', text: '#111111', card: '#F8F8F6', border: '#E5E5E3', accent: '#111111', sub: '#737373' } },

  // ADVANCED GLASS THEMES - 7 NEW PREMIUM (your 7 references) - ALL ADDED TO GLASS THEMES
  { id: 'jordan-jumpman', name: 'Jumpman Pro', category: 'advanced', niche: 'shoes', badge: 'JORDAN', tagline: 'Jump man Basketball • 2021 PF', tier: 'advanced', colors: { bg: '#0A0A0A', text: '#FFFFFF', card: '#141414', border: '#222222', accent: '#FF0033', sub: '#8A8A8A' } },
  { id: 'ecom-green', name: 'Ecom Green', category: 'advanced', niche: 'tech', badge: 'Ecom', tagline: 'Full Design Templates • FREE', tier: 'advanced', colors: { bg: '#E8F5E9', text: '#0F0F0F', card: '#FFFFFF', border: '#C8E6C9', accent: '#00C853', sub: '#4CAF50' } },
  { id: 'car-rental', name: 'Car Rental Pro', category: 'advanced', niche: 'tech', badge: 'Cars', tagline: 'Experience the road like never before', tier: 'advanced', colors: { bg: '#5B3CF6', text: '#FFFFFF', card: '#FFFFFF', border: '#7C5CFF', accent: '#FF8C00', sub: '#A78BFA' } },
  { id: 'plantify', name: 'Plantify', category: 'advanced', niche: 'food', badge: 'Plant', tagline: 'Happiness blooms from within', tier: 'advanced', colors: { bg: '#0F3D2E', text: '#FFFFFF', card: '#FFFFFF', border: '#1A5A42', accent: '#2D6A4F', sub: '#B7E4C7' } },
  { id: 'slick-sole', name: 'Slick Sole', category: 'advanced', niche: 'shoes', badge: 'SLICK', tagline: 'Find Your Sole Mate With Us', tier: 'advanced', colors: { bg: '#FAFAFA', text: '#0F0F0F', card: '#FFFFFF', border: '#E5E5E5', accent: '#0A0A0A', sub: '#9CA3AF' } },
  { id: 'dangila', name: 'Dangila Beauty', category: 'advanced', niche: 'clothing', badge: 'D', tagline: 'Natural Inner Beauty', tier: 'advanced', colors: { bg: '#F5E6D3', text: '#2D1810', card: '#FFFFFF', border: '#E8D5C4', accent: '#8B5A3C', sub: '#A68A6D' } },
  { id: 'yellow-minimal', name: 'Yellow Minimal', category: 'advanced', niche: 'tech', badge: '⚡', tagline: 'E-commerce Clean and minimal', tier: 'advanced', colors: { bg: '#FFCC00', text: '#0F0F0F', card: '#FFFFFF', border: '#FFD93D', accent: '#0A0A0A', sub: '#666666' } },
]

export function getTheme(id: string): StoreTheme {
  return STORE_THEMES.find(t => t.id === id) || STORE_THEMES[2]
}
export const getThemesByCategory = (cat: ThemeCategory) => STORE_THEMES.filter(t => t.category === cat)
export const getStandardThemes = () => STORE_THEMES.filter(t => t.tier === 'standard')
export const getAdvancedThemes = () => STORE_THEMES.filter(t => t.category === 'advanced' || t.tier === 'advanced')
export const getPremiumThemes = () => STORE_THEMES.filter(t => t.tier === 'advanced')
export const getAllThemes = () => STORE_THEMES
