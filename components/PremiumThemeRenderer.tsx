'use client'
function Fallback({ profile, products, cart, setCart, setShowCart, showCart, onAdd, onOpen, selectedProduct, setSelectedProduct }: any) {
  const total = cart.reduce((s: number, p: any) => s + p.price, 0)
  const wa = () => { const l = cart.map((p: any) => `• ${p.name}`).join('%0A'); window.open(`https://wa.me/${profile.whatsapp_number}?text=Hi!%0A${l}%0ATotal Rs. ${total}`, '_blank') }
  return (
    <div className="min-h-screen bg-[#F8F7F5] p-4">
      <div className="max-w- mx-auto">
        <header className="flex justify-between py-4"><span className="font-black">{profile.business_name}</span><button onClick={() => setShowCart(true)} className="bg-black text-white px-4 h-8 rounded-full text-">Cart ({cart.length})</button></header>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">{products.map((p: any) => <div key={p.id} onClick={() => onOpen(p)} className="bg-white border rounded- p-3 cursor-pointer"><img src={p.image_url} className="w-full h- object-cover rounded-" /><div className="mt-2 text- font-bold truncate">{p.name}</div><div className="text-">Rs. {p.price}</div><button onClick={(e: any) => { e.stopPropagation(); onAdd(p) }} className="mt-2 w-full h-7 bg-black text-white rounded-full text-">Add</button></div>)}</div>
      </div>
      {showCart && <div className="fixed inset-0 bg-black/40 z-50 flex justify-end"><div className="w-full max-w-sm bg-white h-full flex flex-col"><div className="p-6 border-b flex justify-between"><h3 className="font-bold">Cart</h3><button onClick={() => setShowCart(false)}>✕</button></div><div className="flex-1 overflow-auto p-4">{cart.map((p: any, i: number) => <div key={i} className="flex gap-2 p-2">{p.name}</div>)}</div><div className="p-6 border-t"><button onClick={wa} className="w-full h-12 bg-black text-white rounded-full">Order</button></div></div></div>}
    </div>
  )
}

let SpikeTheme: any = Fallback, ShoeAppTheme: any = Fallback, TrenzoTheme: any = Fallback, SleekBeigeTheme: any = Fallback, SleekDarkTheme: any = Fallback, SleekEditorialTheme: any = Fallback, JordanTheme: any = Fallback, EcomGreenTheme: any = Fallback, CarRentalTheme: any = Fallback, PlantifyTheme: any = Fallback, SlickSoleTheme: any = Fallback, DangilaTheme: any = Fallback, YellowMinimalTheme: any = Fallback
try { SpikeTheme = require('./premium/SpikeTheme').default } catch {}
try { ShoeAppTheme = require('./premium/ShoeAppTheme').default } catch {}
try { TrenzoTheme = require('./premium/TrenzoTheme').default } catch {}
try { SleekBeigeTheme = require('./premium/SleekBeigeTheme').default } catch {}
try { SleekDarkTheme = require('./premium/SleekDarkTheme').default } catch {}
try { SleekEditorialTheme = require('./premium/SleekEditorialTheme').default } catch {}
try { JordanTheme = require('./premium/JordanTheme').default } catch { try { JordanTheme = require('./premium/JordanJumpmanTheme').default } catch {} }
try { EcomGreenTheme = require('./premium/EcomGreenTheme').default } catch {}
try { CarRentalTheme = require('./premium/CarRentalTheme').default } catch {}
try { PlantifyTheme = require('./premium/PlantifyTheme').default } catch {}
try { SlickSoleTheme = require('./premium/SlickSoleTheme').default } catch {}
try { DangilaTheme = require('./premium/DangilaTheme').default } catch {}
try { YellowMinimalTheme = require('./premium/YellowMinimalTheme').default } catch {}

export default function PremiumThemeRenderer(props: any) {
  const tid = (props.themeId || props.profile?.selected_theme || '').toLowerCase()
  if (tid.includes('spike')) return <SpikeTheme {...props} />
  if (tid.includes('shoe')) return <ShoeAppTheme {...props} />
  if (tid.includes('trenzo')) return <TrenzoTheme {...props} />
  if (tid.includes('jordan') || tid.includes('jumpman')) return <JordanTheme {...props} />
  if (tid.includes('ecom') || tid.includes('green')) return <EcomGreenTheme {...props} />
  if (tid.includes('car') || tid.includes('rental')) return <CarRentalTheme {...props} />
  if (tid.includes('plant')) return <PlantifyTheme {...props} />
  if (tid.includes('slick') || tid.includes('sole')) return <SlickSoleTheme {...props} />
  if (tid.includes('dangila')) return <DangilaTheme {...props} />
  if (tid.includes('yellow')) return <YellowMinimalTheme {...props} />
  if (tid.includes('beige')) return <SleekBeigeTheme {...props} />
  if (tid.includes('dark')) return <SleekDarkTheme {...props} />
  if (tid.includes('editorial')) return <SleekEditorialTheme {...props} />
  return <EcomGreenTheme {...props} />
}
