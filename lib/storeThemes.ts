export type ThemeCategory = 'standard' | 'premium' | 'advanced';
export type ThemeLang = 'EN' | 'UR';
export type ThemeId = 
  // 8 Standard: 3 Urdu + 5 English
  | 'urdu-bazaar' | 'urdu-boutique' | 'urdu-super'
  | 'std-clean' | 'std-grid' | 'std-market' | 'std-bold' | 'std-classic'
  // 5 Premium: 3 existing updated to English + 2 new from your designs
  | 'premium-bazaar' | 'premium-minimal' | 'premium-pro' | 'premium-spike' | 'premium-trenzo' | 'premium-minimal-app';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  nameUrdu?: string;
  category: ThemeCategory;
  lang: ThemeLang;
  price: string;
  description: string;
  previewColor: string;
  isPremium: boolean;
  features: string[];
}

export const storeThemes: Record<ThemeId, ThemeConfig> = {
  // STANDARD - URDU (3)
  'urdu-bazaar': {
    id: 'urdu-bazaar',
    name: 'Urdu Bazaar',
    nameUrdu: 'اردو بازار',
    category: 'standard',
    lang: 'UR',
    price: 'Free',
    description: 'Daraz style with Urdu labels - نیا کلیکشن، کارٹ',
    previewColor: '#00B050',
    isPremium: false,
    features: ['Urdu labels', 'COD', '2-col grid']
  },
  'urdu-boutique': {
    id: 'urdu-boutique',
    name: 'Urdu Boutique',
    nameUrdu: 'اردو بوتیک',
    category: 'standard',
    lang: 'UR',
    price: 'Free',
    description: 'خواتین کلیکشن - Elegant boutique Urdu',
    previewColor: '#E91E63',
    isPremium: false,
    features: ['Urdu headings', 'Elegant', 'Lookbook']
  },
  'urdu-super': {
    id: 'urdu-super',
    name: 'Urdu Super',
    nameUrdu: 'اردو سپر',
    category: 'standard',
    lang: 'UR',
    price: 'Free',
    description: 'Supermarket style Urdu - everyday bazaar',
    previewColor: '#FF9800',
    isPremium: false,
    features: ['Grocery style', 'Urdu categories', 'Fast']
  },
  // STANDARD - ENGLISH (5)
  'std-clean': {
    id: 'std-clean',
    name: 'Clean',
    category: 'standard',
    lang: 'EN',
    price: 'Free',
    description: 'Shopify clean - minimal white, big whitespace',
    previewColor: '#FFFFFF',
    isPremium: false,
    features: ['Minimal', 'Whitespace', 'Shopify style']
  },
  'std-grid': {
    id: 'std-grid',
    name: 'Grid',
    category: 'standard',
    lang: 'EN',
    price: 'Free',
    description: 'Instagram shop 2-col grid, quick add',
    previewColor: '#F5F5F5',
    isPremium: false,
    features: ['2-col grid', 'Quick add', 'Instagram']
  },
  'std-market': {
    id: 'std-market',
    name: 'Market',
    category: 'standard',
    lang: 'EN',
    price: 'Free',
    description: 'Etsy marketplace with ratings & reviews',
    previewColor: '#8B5CF6',
    isPremium: false,
    features: ['Ratings', 'Reviews', 'Marketplace']
  },
  'std-bold': {
    id: 'std-bold',
    name: 'Bold',
    category: 'standard',
    lang: 'EN',
    price: 'Free',
    description: 'Streetwear - bold typography, black & neon',
    previewColor: '#111111',
    isPremium: false,
    features: ['Bold type', 'Streetwear', 'Black']
  },
  'std-classic': {
    id: 'std-classic',
    name: 'Classic',
    category: 'standard',
    lang: 'EN',
    price: 'Free',
    description: 'Traditional header/footer ecom',
    previewColor: '#3B82F6',
    isPremium: false,
    features: ['Header nav', 'Footer', 'Classic']
  },
  // PREMIUM - 3 EXISTING UPDATED TO ENGLISH (kept as-is but polished)
  'premium-bazaar': {
    id: 'premium-bazaar',
    name: 'Bazaar Pro',
    category: 'premium',
    lang: 'EN',
    price: 'Rs.999/mo',
    description: 'Premium Daraz with animations, stock bars, trust badges',
    previewColor: '#00B050',
    isPremium: true,
    features: ['Animations', 'Stock bars', 'Trust badges', 'Fast delivery']
  },
  'premium-minimal': {
    id: 'premium-minimal',
    name: 'Minimal Pro',
    category: 'premium',
    lang: 'EN',
    price: 'Rs.999/mo',
    description: 'Premium boutique lookbook - luxury editorial',
    previewColor: '#FAFAF8',
    isPremium: true,
    features: ['Lookbook', 'Editorial', 'Luxury']
  },
  'premium-pro': {
    id: 'premium-pro',
    name: 'Superstore Pro',
    category: 'premium',
    lang: 'EN',
    price: 'Rs.999/mo',
    description: 'Sidebar filters + verified badges + mega menu',
    previewColor: '#18181B',
    isPremium: true,
    features: ['Filters', 'Verified', 'Mega menu']
  },
  // PREMIUM - 2 NEW SLEEK DESIGNS FROM YOUR REFERENCES
  'premium-spike': {
    id: 'premium-spike',
    name: 'Spike Editorial',
    category: 'advanced',
    lang: 'EN',
    price: 'Rs.1999/mo',
    description: 'NEW - Bold editorial like your SPIKE ref - curved LAWN text, Top Brands, Collections grid, parallax',
    previewColor: '#000000',
    isPremium: true,
    features: ['Curved text', 'Parallax', 'Editorial', 'Brand row', 'Collections']
  },
  'premium-trenzo': {
    id: 'premium-trenzo',
    name: 'Trenzo Luxe',
    category: 'advanced',
    lang: 'EN',
    price: 'Rs.1999/mo',
    description: 'NEW - Luxury black like your TRENZO ref - oval image, floating reviews, brand marquee',
    previewColor: '#0A0A0A',
    isPremium: true,
    features: ['Black luxury', 'Oval image', 'Floating reviews', 'Brand marquee', 'Gold accents']
  },
  'premium-minimal-app': {
    id: 'premium-minimal-app',
    name: 'Minimal App',
    category: 'advanced',
    lang: 'EN',
    price: 'Rs.1999/mo',
    description: 'NEW - Mobile app like your shoe app ref - color dots, size, BLACK FRIDAY banner, pastel cards',
    previewColor: '#7C3AED',
    isPremium: true,
    features: ['App UI', 'Color swatches', 'Size selector', 'Pastel cards', 'EID SALE banner']
  }
};

export const getThemesByCategory = (cat: ThemeCategory) => Object.values(storeThemes).filter(t => t.category === cat);
export const getThemesByLang = (lang: ThemeLang) => Object.values(storeThemes).filter(t => t.lang === lang);
export const getStandardThemes = () => Object.values(storeThemes).filter(t => t.category === 'standard');
export const getPremiumThemes = () => Object.values(storeThemes).filter(t => t.isPremium);
export const getUrduThemes = () => getThemesByLang('UR');
export const getEnglishThemes = () => getThemesByLang('EN');
