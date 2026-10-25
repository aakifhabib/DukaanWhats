'use client'
import { SpikePremiumTheme } from './premium/SpikePremiumTheme'
import { ShoeAppPremiumTheme } from './premium/ShoeAppPremiumTheme'
import { TrenzoLuxuryTheme } from './premium/TrenzoLuxuryTheme'

export function PremiumThemeRenderer({ themeId, profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }: any) {
  // Expose cart setter for removal in themes (for production cart removal)
  if(typeof window !== 'undefined'){
    (window as any).__setCartParent = (newCart:any) => {
      // Try to update parent cart via custom event
      const event = new CustomEvent('dukaan-cart-update', {detail: newCart})
      window.dispatchEvent(event)
    }
  }
  const props = { profile, products, cart, setShowCart, onAdd, onOpen, track, selectedProduct, setSelectedProduct }
  if (themeId === 'spike-premium') return <SpikePremiumTheme {...props} />
  if (themeId === 'shoe-app-premium') return <ShoeAppPremiumTheme {...props} />
  if (themeId === 'trenzo-luxury') return <TrenzoLuxuryTheme {...props} />
  return null
}
