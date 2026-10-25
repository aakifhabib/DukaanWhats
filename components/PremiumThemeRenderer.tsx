'use client'
import { SpikePremiumTheme } from './premium/SpikePremiumTheme'
import { ShoeAppPremiumTheme } from './premium/ShoeAppPremiumTheme'
import { TrenzoLuxuryTheme } from './premium/TrenzoLuxuryTheme'
import { SleekBeigePremiumTheme } from './premium/SleekBeigePremiumTheme'
import { SleekDarkPremiumTheme } from './premium/SleekDarkPremiumTheme'
import { SleekEditorialPremiumTheme } from './premium/SleekEditorialPremiumTheme'

export function PremiumThemeRenderer({ themeId, profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }: any) {
  const props = { profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }
  if (themeId === 'spike-premium') return <SpikePremiumTheme {...props} />
  if (themeId === 'shoe-app-premium') return <ShoeAppPremiumTheme {...props} />
  if (themeId === 'trenzo-luxury') return <TrenzoLuxuryTheme {...props} />
  if (themeId === 'sleek-beige') return <SleekBeigePremiumTheme {...props} />
  if (themeId === 'sleek-dark') return <SleekDarkPremiumTheme {...props} />
  if (themeId === 'sleek-editorial') return <SleekEditorialPremiumTheme {...props} />
  return null
}
