'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type StoreLanguage = 'en' | 'ur'

type StoreLocaleContextValue = {
  language: StoreLanguage
  setLanguage: (language: StoreLanguage) => void
  t: (key: string) => string
}

const COPY: Record<StoreLanguage, Record<string, string>> = {
  en: {
    browse: 'Browse products', discover: 'Discover', intro: 'Browse products and message us to order.', products: 'Products', search: 'Search products', featured: 'Featured', newest: 'Newest', lowPrice: 'Price: low to high', highPrice: 'Price: high to low', noImage: 'No image yet', collection: 'Collection', sale: 'SALE', noMatches: 'No matches this time', comingSoon: 'The collection is on its way', tryDifferent: 'Try a different search or category.', clearFilters: 'Clear filters', contactWhatsApp: 'Contact on WhatsApp',
    bag: 'Bag', shoppingBag: 'Shopping bag', addToBag: 'Add to bag', addToCart: 'Add to cart', soldOut: 'Sold out', keepBrowsing: 'Keep browsing', remove: 'Remove', subtotal: 'Subtotal', total: 'Total', inStock: 'In stock', chooseSize: 'Please choose a size', selectSize: 'Select size', sizeGuide: 'Size guide', color: 'Color', continueShopping: 'Continue shopping', cart: 'Cart',
    continueWhatsApp: 'Continue on WhatsApp', whatsappUnavailable: 'WhatsApp number unavailable', emptyBag: 'Your bag is waiting', exploreProducts: 'Explore products',
    availableSizes: 'Available sizes', availableColors: 'Available colours', delivery: 'Delivery', pickup: 'Pickup', customerName: 'Your name', phone: 'WhatsApp / phone number',
    deliveryArea: 'Delivery area', address: 'Delivery address', notes: 'Order notes (optional)', placeOrder: 'Place order request', submitting: 'Submitting…', orderSaved: 'Request saved',
    orderNext: 'Your request is saved. Continue on WhatsApp to confirm details with the seller.', openWhatsApp: 'Continue on WhatsApp', language: 'Language', deliveryFee: 'Delivery fee', deliveryConfirm: 'Delivery and final details can be confirmed in chat.',
  },
  ur: {
    browse: 'مصنوعات دیکھیں', discover: 'ہماری دکان دیکھیں', intro: 'مصنوعات دیکھیں اور آرڈر کے لیے ہمیں پیغام بھیجیں۔', products: 'مصنوعات', search: 'مصنوعات تلاش کریں', featured: 'نمایاں', newest: 'تازہ ترین', lowPrice: 'کم قیمت پہلے', highPrice: 'زیادہ قیمت پہلے', noImage: 'تصویر جلد دستیاب ہوگی', collection: 'کلیکشن', sale: 'سیل', noMatches: 'کوئی نتیجہ نہیں ملا', comingSoon: 'کلیکشن جلد آرہا ہے', tryDifferent: 'دوسری تلاش یا کیٹیگری آزمائیں۔', clearFilters: 'فلٹر صاف کریں', contactWhatsApp: 'واٹس ایپ پر رابطہ کریں',
    bag: 'بیگ', shoppingBag: 'خریداری کا بیگ', addToBag: 'بیگ میں شامل کریں', addToCart: 'کارٹ میں شامل کریں', soldOut: 'دستیاب نہیں', keepBrowsing: 'خریداری جاری رکھیں', remove: 'حذف کریں', subtotal: 'ذیلی رقم', total: 'کل رقم', inStock: 'دستیاب', chooseSize: 'براہ کرم سائز منتخب کریں', selectSize: 'سائز منتخب کریں', sizeGuide: 'سائز گائیڈ', color: 'رنگ', continueShopping: 'خریداری جاری رکھیں', cart: 'کارٹ',
    continueWhatsApp: 'واٹس ایپ پر جاری رکھیں', whatsappUnavailable: 'واٹس ایپ نمبر دستیاب نہیں', emptyBag: 'آپ کا بیگ خالی ہے', exploreProducts: 'مصنوعات دیکھیں',
    availableSizes: 'دستیاب سائز', availableColors: 'دستیاب رنگ', delivery: 'ڈیلیوری', pickup: 'خود وصول کریں', customerName: 'آپ کا نام', phone: 'واٹس ایپ / فون نمبر',
    deliveryArea: 'ڈیلیوری کا علاقہ', address: 'ڈیلیوری کا پتہ', notes: 'آرڈر کی تفصیل (اختیاری)', placeOrder: 'آرڈر کی درخواست بھیجیں', submitting: 'بھیجا جا رہا ہے…', orderSaved: 'درخواست محفوظ ہوگئی',
    orderNext: 'آپ کی درخواست محفوظ ہے۔ تفصیلات کی تصدیق کے لیے واٹس ایپ پر جائیں۔', openWhatsApp: 'واٹس ایپ پر جاری رکھیں', language: 'زبان', deliveryFee: 'ڈیلیوری فیس', deliveryConfirm: 'ڈیلیوری اور دیگر تفصیلات چیٹ میں طے کی جائیں گی۔',
  },
}

const StoreLocaleContext = createContext<StoreLocaleContextValue | null>(null)

export function StoreLocaleProvider({ initialLanguage, children }: { initialLanguage: StoreLanguage; children: ReactNode }) {
  const [language, setLanguage] = useState<StoreLanguage>(initialLanguage === 'ur' ? 'ur' : 'en')
  const value = useMemo(() => ({ language, setLanguage, t: (key: string) => COPY[language][key] || COPY.en[key] || key }), [language])
  return <StoreLocaleContext.Provider value={value}><div lang={language} dir={language === 'ur' ? 'rtl' : 'ltr'} className={language === 'ur' ? 'font-[Noto_Nastaliq_Urdu,serif]' : ''}>{children}</div></StoreLocaleContext.Provider>
}

export function useStoreLocale() {
  const value = useContext(StoreLocaleContext)
  if (!value) throw new Error('Store locale must be used within StoreLocaleProvider.')
  return value
}

export function useOptionalStoreLocale() {
  const value = useContext(StoreLocaleContext)
  return value || { language: 'en' as StoreLanguage, setLanguage: (_language: StoreLanguage) => {}, t: (key: string) => COPY.en[key] || key }
}

export function StoreLanguageToggle() {
  const { language, setLanguage, t } = useStoreLocale()
  const next = language === 'en' ? 'ur' : 'en'
  return <button type="button" onClick={() => setLanguage(next)} aria-label={`${t('language')}: ${next === 'ur' ? 'اردو' : 'English'}`} className="fixed left-4 top-4 z-[80] rounded-full border border-black/10 bg-white/90 px-3 py-2 text-xs font-bold text-black shadow-lg backdrop-blur transition hover:-translate-y-0.5">{language === 'en' ? 'اردو' : 'English'}</button>
}
