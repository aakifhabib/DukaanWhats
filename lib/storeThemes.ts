export type ThemeCategory = 'standard' | 'advanced' | 'premium' | 'basic';
export type ThemeLang = 'EN' | 'UR';

export interface ThemeDef {
  id: string;
  name: string;
  nameUrdu?: string;
  category: ThemeCategory;
  lang: ThemeLang;
  price: string;
  description: string;
  isPremium?: boolean;
  colors: { accent: string; bg: string; text: string; card: string };
  badge: string;
  preview: string;
  features?: string[];
}

export const STORE_THEMES: ThemeDef[] = [
  // ===== 8 STANDARD THEMES: 3 URDU + 5 ENGLISH =====
  // URDU STANDARD (3) - category advanced to show in 8 advanced slot
  {
    id: 'urdu-bazaar',
    name: 'Urdu Bazaar',
    nameUrdu: 'اردو بازار',
    category: 'advanced',
    lang: 'UR',
    price: 'Free',
    description: 'داراز طرز - اردو لیبلز کے ساتھ',
    colors: { accent: '#00B050', bg: '#F8F7F5', text: '#111', card: '#FFFFFF' },
    badge: 'اردو',
    preview: '#00B050',
    features: ['Urdu labels', 'COD', 'Bazaar']
  },
  {
    id: 'urdu-boutique',
    name: 'Urdu Boutique',
    nameUrdu: 'اردو بوتیک',
    category: 'advanced',
    lang: 'UR',
    price: 'Free',
    description: 'خواتین کلیکشن - خوبصورت بوتیک',
    colors: { accent: '#E91E63', bg: '#FFF5F7', text: '#111', card: '#FFFFFF' },
    badge: 'بوتیک',
    preview: '#E91E63',
    features: ['Urdu boutique', 'Elegant']
  },
  {
    id: 'urdu-super',
    name: 'Urdu Super',
    nameUrdu: 'اردو سپر',
    category: 'advanced',
    lang: 'UR',
    price: 'Free',
    description: 'سپر سٹور - روزانہ بازار',
    colors: { accent: '#FF9800', bg: '#FFF8F0', text: '#111', card: '#FFFFFF' },
    badge: 'سپر',
    preview: '#FF9800',
    features: ['Super Urdu', 'Fast']
  },
  // ENGLISH STANDARD (5) - makes total 8 advanced
  {
    id: 'clothing-noor',
    name: 'Noor - Clean',
    category: 'advanced',
    lang: 'EN',
    price: 'Free',
    description: 'Shopify clean minimal - white space',
    colors: { accent: '#111111', bg: '#FAFAF8', text: '#111', card: '#FFFFFF' },
    badge: 'CLEAN',
    preview: '#111111',
    features: ['Minimal', 'Clean']
  },
  {
    id: 'std-grid',
    name: 'Grid',
    category: 'advanced',
    lang: 'EN',
    price: 'Free',
    description: 'Instagram 2-col grid',
    colors: { accent: '#00B050', bg: '#F5F5F5', text: '#111', card: '#FFFFFF' },
    badge: 'GRID',
    preview: '#F5F5F5',
    features: ['2-col', 'Instagram']
  },
  {
    id: 'std-market',
    name: 'Market',
    category: 'advanced',
    lang: 'EN',
    price: 'Free',
    description: 'Etsy marketplace with ratings',
    colors: { accent: '#8B5CF6', bg: '#F8F5FF', text: '#111', card: '#FFFFFF' },
    badge: 'MARKET',
    preview: '#8B5CF6',
    features: ['Ratings', 'Market']
  },
  {
    id: 'clothing-street',
    name: 'Bold Street',
    category: 'advanced',
    lang: 'EN',
    price: 'Free',
    description: 'Streetwear bold - black & neon',
    colors: { accent: '#CCFF00', bg: '#0A0A0A', text: '#FFF', card: '#181818' },
    badge: 'BOLD',
    preview: '#0A0A0A',
    features: ['Bold', 'Streetwear']
  },
  {
    id: 'std-classic',
    name: 'Classic',
    category: 'advanced',
    lang: 'EN',
    price: 'Free',
    description: 'Classic header/footer',
    colors: { accent: '#3B82F6', bg: '#FFFFFF', text: '#111', card: '#FFFFFF' },
    badge: 'CLASSIC',
    preview: '#3B82F6',
    features: ['Header', 'Footer']
  },

  // ===== 5 PREMIUM THEMES: 3 EXISTING UPDATED TO ENGLISH + 2 NEW SLEEK (actually 3 new from your refs = 6 total) =====
  // Keep your existing 3 premium - updated to English sleek
  {
    id: 'sleek-dark',
    name: 'Sleek Dark',
    category: 'premium',
    lang: 'EN',
    price: 'Rs.999/mo',
    description: 'Premium dark luxury - updated English',
    isPremium: true,
    colors: { accent: '#FFFFFF', bg: '#0A0A0A', text: '#FFF', card: '#181818' },
    badge: 'PREMIUM',
    preview: '#0A0A0A',
    features: ['Dark luxury', 'Glass', 'Premium']
  },
  {
    id: 'sleek-beige',
    name: 'Sleek Beige',
    category: 'premium',
    lang: 'EN',
    price: 'Rs.999/mo',
    description: 'Premium beige minimal - updated English',
    isPremium: true,
    colors: { accent: '#111111', bg: '#F8F6F1', text: '#111', card: '#FFFFFF' },
    badge: 'BEIGE',
    preview: '#F8F6F1',
    features: ['Beige', 'Minimal', 'Premium']
  },
  {
    id: 'sleek-editorial',
    name: 'Sleek Editorial',
    category: 'premium',
    lang: 'EN',
    price: 'Rs.999/mo',
    description: 'Premium editorial - updated English',
    isPremium: true,
    colors: { accent: '#111111', bg: '#FFFFFF', text: '#111', card: '#FFFFFF' },
    badge: 'EDITORIAL',
    preview: '#111111',
    features: ['Editorial', 'Serif']
  },
  // ===== 3 NEW PREMIUM SLEEK FROM YOUR 3 REFERENCE IMAGES =====
  {
    id: 'premium-spike',
    name: 'Spike Editorial',
    category: 'premium',
    lang: 'EN',
    price: 'Rs.1999/mo',
    description: 'NEW - SPIKE ref copy - bold editorial, curved LAWN text, Top Brands, Collections grid, parallax animations',
    isPremium: true,
    colors: { accent: '#000000', bg: '#FFFFFF', text: '#000', card: '#FFFFFF' },
    badge: 'SPIKE',
    preview: '#000000',
    features: ['Curved text LAWN', 'Parallax', 'Top Brands', 'Collections', 'Animations']
  },
  {
    id: 'premium-trenzo',
    name: 'Trenzo Luxe',
    category: 'premium',
    lang: 'EN',
    price: 'Rs.1999/mo',
    description: 'NEW - TRENZO ref copy - black luxury, oval capsule image, floating review cards, brand marquee',
    isPremium: true,
    colors: { accent: '#D4AF37', bg: '#0A0A0A', text: '#FFF', card: '#181818' },
    badge: 'LUXE',
    preview: '#0A0A0A',
    features: ['Black luxury', 'Oval image', 'Floating reviews', 'Marquee', 'Gold']
  },
  {
    id: 'premium-minimal-app',
    name: 'Minimal App',
    category: 'premium',
    lang: 'EN',
    price: 'Rs.1999/mo',
    description: 'NEW - Shoe app ref copy - vertical color dots, size selector, EID SALE banner, pastel cards, 3-screen app UI',
    isPremium: true,
    colors: { accent: '#7C3AED', bg: '#E9E7FF', text: '#111', card: '#FFFFFF' },
    badge: 'APP',
    preview: '#7C3AED',
    features: ['App UI', 'Color dots', 'Size selector', 'Pastel cards', 'EID banner']
  }
];

export const getTheme = (id: string) => STORE_THEMES.find(t => t.id === id) || STORE_THEMES[0];
export const getAdvancedThemes = () => STORE_THEMES.filter(t => t.category === 'premium' || t.isPremium);
export const getStandardThemes = () => STORE_THEMES.filter(t => !t.isPremium && t.category !== 'premium');
export const getUrduThemes = () => STORE_THEMES.filter(t => t.lang === 'UR');
export const getEnglishThemes = () => STORE_THEMES.filter(t => t.lang === 'EN');

// Legacy exports for compatibility
export const storeThemes = STORE_THEMES.reduce((acc, t) => ({ ...acc, [t.id]: t }), {} as any);
