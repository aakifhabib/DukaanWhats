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
  // BASIC - 3 themes included with every plan
  { id: 'clothing-noor', name: 'Noor', category: 'clothing', colors: { bg: '#F7F5EF', text: '#24241F', accent: '#656B47', card: '#FCFBF8', border: '#E3E0D7' }, tier: 'basic' },
  { id: 'food-spice', name: 'Spice', category: 'food', colors: { bg: '#F8F4EF', text: '#2B211C', accent: '#A65335', card: '#FCFAF7', border: '#E8DED5' }, tier: 'basic' },
  { id: 'shoes-street', name: 'Street', category: 'shoes', colors: { bg: '#F2F2F0', text: '#242424', accent: '#565656', card: '#FAFAF9', border: '#DFDFDD' }, tier: 'basic' },

  // ADVANCED - 8 themes (Basic plan unlocks the first 3)
  { id: 'clothing-street', name: 'Streetwear', category: 'advanced', colors: { bg: '#F8F7F5', text: '#0A0A0A', accent: '#FF3B30', card: '#FFFFFF', border: '#E5E5E5' }, tier: 'advanced' },
  { id: 'shoes-leather', name: 'Leather Luxe', category: 'advanced', colors: { bg: '#1A1A1A', text: '#FFFFFF', accent: '#D4A574', card: '#2A2A2A', border: '#3A3A3A' }, tier: 'advanced' },
  { id: 'food-bakery', name: 'Bakery', category: 'advanced', colors: { bg: '#FFF8F0', text: '#0A0A0A', accent: '#FF8C42', card: '#FFFFFF', border: '#FFE4CC' }, tier: 'advanced' },
  { id: 'tech-gadget', name: 'Gadget Pro', category: 'advanced', colors: { bg: '#F0F0FF', text: '#0A0A0A', accent: '#6366F1', card: '#FFFFFF', border: '#E0E0FF' }, tier: 'advanced' },
  { id: 'clothing-denim', name: 'Denim', category: 'advanced', colors: { bg: '#E8F0FF', text: '#0A0A0A', accent: '#3B82F6', card: '#FFFFFF', border: '#BFDBFE' }, tier: 'advanced' },
  { id: 'food-organic', name: 'Organic', category: 'advanced', colors: { bg: '#F0F7F0', text: '#0A0A0A', accent: '#22C55E', card: '#FFFFFF', border: '#D1E7D1' }, tier: 'advanced' },
  { id: 'tech-minimal', name: 'Minimal', category: 'advanced', colors: { bg: '#F8F7F5', text: '#0A0A0A', accent: '#0A0A0A', card: '#FFFFFF', border: '#E5E5E5' }, tier: 'advanced' },
  { id: 'tech-electro', name: 'Electro', category: 'advanced', colors: { bg: '#0A0A0A', text: '#FFFFFF', accent: '#E8FF86', card: '#141414', border: '#2A2A2A' }, tier: 'advanced' },

  // PREMIUM - Themes are rendered through PremiumThemeRenderer and the dashboard glass showcase.
  { id: 'sleek-beige', name: 'Sleek Beige', category: 'premium', colors: { bg: '#F5F1EB', text: '#0A0A0A', accent: '#E8FF86', card: '#FFFFFF', border: '#E8E6E1' }, isPremium: true, tier: 'premium' },
  { id: 'sleek-dark', name: 'Sleek Dark', category: 'premium', colors: { bg: '#0A0A0A', text: '#FFFFFF', accent: '#E8FF86', card: '#141414', border: '#2A2A2A' }, isPremium: true, tier: 'premium' },
  { id: 'sleek-editorial', name: 'Editorial', category: 'premium', colors: { bg: '#FCFBF9', text: '#0A0A0A', accent: '#0A0A0A', card: '#FFFFFF', border: '#E8E6E1' }, isPremium: true, tier: 'premium' },
  { id: 'spike-premium', name: 'Spike Pro', category: 'premium', colors: { bg: '#FCFBF9', text: '#0A0A0A', accent: '#0A0A0A', card: '#FFFFFF', border: '#E8E6E1' }, isPremium: true, tier: 'premium' },
  { id: 'shoe-app-premium', name: 'Shoe App Pro', category: 'premium', colors: { bg: '#F2F0FF', text: '#0A0A0A', accent: '#7C3AED', card: '#FFFFFF', border: '#E8E0FF' }, isPremium: true, tier: 'premium' },
  { id: 'trenzo-luxury', name: 'Trenzo Luxury', category: 'premium', colors: { bg: '#0A0A0A', text: '#FFFFFF', accent: '#FFFFFF', card: '#141414', border: '#2A2A2A' }, isPremium: true, tier: 'premium' },
  { id: 'saffron-table', name: 'Saffron Table', category: 'premium', colors: { bg: '#F8F0E3', text: '#291B16', accent: '#C95C3A', card: '#FFFDF8', border: '#E6D7C3' }, isPremium: true, tier: 'premium' },
  { id: 'atelier-bloom', name: 'Atelier Bloom', category: 'premium', colors: { bg: '#F4EFE9', text: '#2B3327', accent: '#718463', card: '#FFFCF7', border: '#E3DCD1' }, isPremium: true, tier: 'premium' },
  { id: 'mono-market', name: 'Mono Market', category: 'premium', colors: { bg: '#F3F3EF', text: '#111111', accent: '#D9FF3F', card: '#FFFFFF', border: '#111111' }, isPremium: true, tier: 'premium' },
  { id: 'noir-gilt', name: 'Noir & Gilt', category: 'premium', colors: { bg: '#0C0A07', text: '#F4EBD6', accent: '#C8A96B', card: '#14110C', border: '#B79A62' }, isPremium: true, tier: 'premium' },
]

export const getTheme = (id: string) => STORE_THEMES.find(t=>t.id===id) || STORE_THEMES[0]

// Dashboard combines the 3 legacy Sleek cards with the 7 Premium renderer themes.
export const getAdvancedThemes = () => STORE_THEMES.filter(t=> ['sleek-beige','sleek-dark','sleek-editorial'].includes(t.id))
export const getPremiumThemes = () => STORE_THEMES.filter(t=> ['spike-premium','shoe-app-premium','trenzo-luxury','saffron-table','atelier-bloom','mono-market','noir-gilt'].includes(t.id))
export const getAllPremiumGlass = () => STORE_THEMES.filter(t=> t.category==='premium' && t.tier==='premium') // All 10 premium themes

export const getBasicThemes = () => STORE_THEMES.filter(t=> t.tier==='basic')
export const getAdvancedList = () => STORE_THEMES.filter(t=> t.tier==='advanced')
