'use client'
import JordanJumpmanTheme from './premium/JordanJumpmanTheme'
import EcomGreenTheme from './premium/EcomGreenTheme'
import CarRentalTheme from './premium/CarRentalTheme'
import PlantifyTheme from './premium/PlantifyTheme'
import SlickSoleTheme from './premium/SlickSoleTheme'
import DangilaTheme from './premium/DangilaTheme'
import YellowMinimalTheme from './premium/YellowMinimalTheme'

type Props = {
  themeId: string
  profile: any
  products: any[]
  cart: any[]
  setCart: (c: any[]) => void
  showCart: boolean
  setShowCart: (v: boolean) => void
  onAdd: (p: any) => void
  onOpen: (p: any) => void
  track?: (event: string, id?: string) => void
  selectedProduct: any
  setSelectedProduct: (p: any) => void
}

const THEMES: Record<string, React.ComponentType<any>> = {
  'jordan-jumpman': JordanJumpmanTheme,
  'ecom-green': EcomGreenTheme,
  'car-rental': CarRentalTheme,
  'plantify': PlantifyTheme,
  'slick-sole': SlickSoleTheme,
  'dangila': DangilaTheme,
  'yellow-minimal': YellowMinimalTheme,
  'spike-premium': JordanJumpmanTheme,
  'shoe-app-premium': SlickSoleTheme,
  'trenzo-luxury': DangilaTheme,
}

export function PremiumThemeRenderer({ themeId, ...props }: Props) {
  const Comp = THEMES[themeId]
  if (!Comp) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#F8F7F5] p-6">
        <div className="text-center">
          <div className="text- tracking-widest text-zinc-500">THEME NOT FOUND</div>
          <div className="font-mono font-black text- mt-2">{themeId}</div>
          <div className="text- mt-4 text-zinc-400">Available: {Object.keys(THEMES).join(', ')}</div>
        </div>
      </div>
    )
  }
  return <Comp {...props} />
}

export const PREMIUM_THEME_IDS = Object.keys(THEMES)
export const isPremiumTheme = (id: string) => id in THEMES
