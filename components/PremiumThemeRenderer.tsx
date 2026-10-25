'use client'
import { SpikePremiumTheme } from './premium/SpikePremiumTheme'
import { ShoeAppPremiumTheme } from './premium/ShoeAppPremiumTheme'
import { TrenzoLuxuryTheme } from './premium/TrenzoLuxuryTheme'

export function PremiumThemeRenderer({ themeId, profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }: any) {
  const props = { profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }
  if (themeId === 'spike-premium') return <SpikePremiumTheme {...props} />
  if (themeId === 'shoe-app-premium') return <ShoeAppPremiumTheme {...props} />
  if (themeId === 'trenzo-luxury') return <TrenzoLuxuryTheme {...props} />
  return null
}
