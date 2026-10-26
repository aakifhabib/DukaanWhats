'use client'
import { useState } from 'react'

function Fallback({ profile, products, cart, setCart, setShowCart, showCart, onAdd, onOpen, selectedProduct, setSelectedProduct }: any) {
  const total = cart.reduce((s: number, p: any) => s + p.price, 0)
  return (
    <div className="min-h-screen bg-[#F8F7F5] p-4">
      <div className="max-w-[1200px] mx-auto">
        <header className="flex justify-between py-4"><span className="font-black">{profile?.business_name}</span><button onClick={()=>setShowCart(true)} className="bg-black text-white px-4 h-8 rounded-full text-[11px]">Cart ({cart?.length})</button></header>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">{products.map((p:any)=><div key={p.id} onClick={()=>onOpen(p)} className="bg-white border rounded-[16px] p-3 cursor-pointer"><img src={p.image_url} className="w-full h-[120px] object-cover rounded-[12px]" alt=""/><div className="mt-2 text-[11px] font-bold">{p.name}</div><div className="text-[11px]">Rs. {p.price}</div></div>)}</div>
      </div>
    </div>
  )
}

// ORIGINAL 6 ONLY - using require with try so missing file never breaks build
let SpikeTheme: any = Fallback, ShoeAppTheme: any = Fallback, TrenzoTheme: any = Fallback, SleekBeigeTheme: any = Fallback, SleekDarkTheme: any = Fallback, SleekEditorialTheme: any = Fallback
try { SpikeTheme = require('./premium/SpikeTheme').default } catch {}
try { ShoeAppTheme = require('./premium/ShoeAppTheme').default } catch {}
try { TrenzoTheme = require('./premium/TrenzoTheme').default } catch {}
try { SleekBeigeTheme = require('./premium/SleekBeigeTheme').default } catch {}
try { SleekDarkTheme = require('./premium/SleekDarkTheme').default } catch {}
try { SleekEditorialTheme = require('./premium/SleekEditorialTheme').default } catch {}

export default function PremiumThemeRenderer(props: any) {
  const tid = String(props.themeId || props.profile?.selected_theme || '').toLowerCase()
  if (tid.includes('spike')) return <SpikeTheme {...props} />
  if (tid.includes('shoe-app')) return <ShoeAppTheme {...props} />
  if (tid.includes('trenzo')) return <TrenzoTheme {...props} />
  if (tid.includes('beige')) return <SleekBeigeTheme {...props} />
  if (tid.includes('dark')) return <SleekDarkTheme {...props} />
  if (tid.includes('editorial')) return <SleekEditorialTheme {...props} />
  return <Fallback {...props} />
}

export const PremiumThemeRenderer2 = PremiumThemeRenderer
export { PremiumThemeRenderer as PremiumThemeRendererComponent }
