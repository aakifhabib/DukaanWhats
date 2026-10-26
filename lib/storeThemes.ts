export type ThemeCategory = 'clothing'|'food'|'tech'|'shoes'|'advanced'|'premium'
export type ThemeDef = { 
  id: string; 
  name: string; 
  category: ThemeCategory; 
  colors: { bg: string; text: string; accent: string; card: string; border: string; badge?: string }; 
  isPremium?: boolean; 
  tier?: 'basic'|'advanced'|'premium' 
}

export const STORE_THEMES: ThemeDef[] = [
  // STANDARD - Free
  { id: 'clothing-noor', name: 'Noor', category: 'clothing', colors: { bg: '#FFFBF5', text: '#0A0A0A', accent: '#E8FF86', card: '#FFFFFF', border: '#E8E6E1' }, tier: 'basic' },
  { id: 'food-spice', name: 'Spice', category: 'food', colors: { bg: '#FFFBF5', text: '#0A0A0A', accent: '#FF6B35', card: '#FFFFFF', border: '#FFE4D6' }, tier: 'basic' },
  { id: 'food-organic', name: 'Organic', category: 'food', colors: { bg: '#F0F7F0', text: '#0A0A0A', accent: '#22C55E', card: '#FFFFFF', border: '#D1E7D1' }, tier: 'basic' },
  { id: 'tech-minimal', name: 'Minimal', category: 'tech', colors: { bg: '#F8F7F5', text: '#0A0A0A', accent: '#0A0A0A', card: '#FFFFFF', border: '#E5E5E5' }, tier: 'basic' },
  { id: 'tech-electro', name: 'Electro', category: 'tech', colors: { bg: '#0A0A0A', text: '#FFFFFF', accent: '#E8FF86', card: '#141414', border: '#2A2A2A' }, tier: 'basic' },
  { id: 'shoes-street', name: 'Street', category: 'shoes', colors: { bg: '#F5F5F5', text: '#0A0A0A', accent: '#FF3B30', card: '#FFFFFF', border: '#E5E5E5' }, tier: 'basic' },

  // ADVANCED - 5 themes (Basic gets 3)
  { id: 'clothing-street', name: 'Streetwear', category: 'advanced', colors: { bg: '#F8F7F5', text: '#0A0A0A', accent: '#FF3B30', card: '#FFFFFF', border: '#E5E5E5' }, tier: 'advanced' },
  { id: 'shoes-leather', name: 'Leather Luxe', category: 'advanced', colors: { bg: '#1A1A1A', text: '#FFFFFF', accent: '#D4A574', card: '#2A2A2A', border: '#3A3A3A' }, tier: 'advanced' },
  { id: 'food-bakery', name: 'Bakery', category: 'advanced', colors: { bg: '#FFF8F0', text: '#0A0A0A', accent: '#FF8C42', card: '#FFFFFF', border: '#FFE4CC' }, tier: 'advanced' },
  { id: 'tech-gadget', name: 'Gadget Pro', category: 'advanced', colors: { bg: '#F0F0FF', text: '#0A0A0A', accent: '#6366F1', card: '#FFFFFF', border: '#E0E0FF' }, tier: 'advanced' },
  { id: 'clothing-denim', name: 'Denim', category: 'advanced', colors: { bg: '#E8F0FF', text: '#0A0A0A', accent: '#3B82F6', card: '#FFFFFF', border: '#BFDBFE' }, tier: 'advanced' },

  // PREMIUM GLASS - 6 themes (Premium only) - These are now FULL COMPONENTS in /components/premium/
  // Keep IDs here for dashboard glass cards to show, but rendering is via PremiumThemeRenderer
  { id: 'sleek-beige', name: 'Sleek Beige', category: 'premium', colors: { bg: '#F5F1EB', text: '#0A0A0A', accent: '#E8FF86', card: '#FFFFFF', border: '#E8E6E1' }, isPremium: true, tier: 'premium' },
  { id: 'sleek-dark', name: 'Sleek Dark', category: 'premium', colors: { bg: '#0A0A0A', text: '#FFFFFF', accent: '#E8FF86', card: '#141414', border: '#2A2A2A' }, isPremium: true, tier: 'premium' },
  { id: 'sleek-editorial', name: 'Editorial', category: 'premium', colors: { bg: '#FCFBF9', text: '#0A0A0A', accent: '#0A0A0A', card: '#FFFFFF', border: '#E8E6E1' }, isPremium: true, tier: 'premium' },
  { id: 'spike-premium', name: 'Spike Pro', category: 'premium', colors: { bg: '#FCFBF9', text: '#0A0A0A', accent: '#0A0A0A', card: '#FFFFFF', border: '#E8E6E1' }, isPremium: true, tier: 'premium' },
  { id: 'shoe-app-premium', name: 'Shoe App Pro', category: 'premium', colors: { bg: '#F2F0FF', text: '#0A0A0A', accent: '#7C3AED', card: '#FFFFFF', border: '#E8E0FF' }, isPremium: true, tier: 'premium' },
  { id: 'trenzo-luxury', name: 'Trenzo Luxury', category: 'premium', colors: { bg: '#0A0A0A', text: '#FFFFFF', accent: '#FFFFFF', card: '#141414', border: '#2A2A2A' }, isPremium: true, tier: 'premium' },
]

export const getTheme = (id: string) => STORE_THEMES.find(t=>t.id===id) || STORE_THEMES[0]

// For dashboard glass container - 3 sleek = old glass, now we merge all 6
export const getAdvancedThemes = () => STORE_THEMES.filter(t=> ['sleek-beige','sleek-dark','sleek-editorial'].includes(t.id))
export const getPremiumThemes = () => STORE_THEMES.filter(t=> ['spike-premium','shoe-app-premium','trenzo-luxury'].includes(t.id))
export const getAllPremiumGlass = () => STORE_THEMES.filter(t=> t.category==='premium' && t.tier==='premium') // All 6 glass

export const getStandardThemes = () => STORE_THEMES.filter(t=> t.tier==='basic')
export const getAdvancedList = () => STORE_THEMES.filter(t=> t.tier==='advanced')
