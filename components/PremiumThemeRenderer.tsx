'use client'
function FallbackCard({ profile, products, cart, setShowCart, onAdd, onOpen }: any) {
  return (
    <div className="min-h-screen bg-[#F8F7F5] p-4">
      <div className="max-w-[1200px] mx-auto">
        <header className="flex justify-between py-4"><span className="font-black">{profile?.business_name || 'Store'}</span><button onClick={()=>setShowCart(true)} className="bg-black text-white px-4 h-8 rounded-full text-[11px]">Cart ({cart?.length || 0})</button></header>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">{(products||[]).map((p:any)=><div key={p.id} onClick={()=>onOpen(p)} className="bg-white border rounded-[16px] p-3 cursor-pointer"><img src={p.image_url} className="w-full h-[120px] object-cover rounded-[12px]" alt=""/><div className="mt-2 text-[11px] font-bold truncate">{p.name}</div><div className="text-[11px]">Rs. {p.price}</div><button onClick={(e:any)=>{e.stopPropagation(); onAdd(p)}} className="mt-2 w-full h-7 bg-black text-white rounded-full text-[10px]">Add</button></div>)}</div>
      </div>
    </div>
  )
}

export default function PremiumThemeRenderer(props: any) {
  // Self-contained - tries to load real theme if exists, otherwise fallback - NEVER crashes build
  const tid = String(props.themeId || props.profile?.selected_theme || '').toLowerCase()
  try {
    if (tid.includes('spike')) { const C = require('./premium/SpikeTheme').default; return <C {...props} /> } } catch {}
  try {
    if (tid.includes('shoe')) { const C = require('./premium/ShoeAppTheme').default; return <C {...props} /> } } catch {}
  try {
    if (tid.includes('trenzo')) { const C = require('./premium/TrenzoTheme').default; return <C {...props} /> } } catch {}
  try {
    if (tid.includes('beige')) { const C = require('./premium/SleekBeigeTheme').default; return <C {...props} /> } } catch {}
  try {
    if (tid.includes('dark')) { const C = require('./premium/SleekDarkTheme').default; return <C {...props} /> } } catch {}
  try {
    if (tid.includes('editorial')) { const C = require('./premium/SleekEditorialTheme').default; return <C {...props} /> } } catch {}
  try {
    if (tid.includes('jordan') || tid.includes('jumpman')) { 
      try { const C = require('./premium/JordanTheme').default; return <C {...props} /> } catch {}
      const C = require('./premium/JordanJumpmanTheme').default; return <C {...props} />
    } } catch {}
  try { if (tid.includes('ecom') || tid.includes('green')) { const C = require('./premium/EcomGreenTheme').default; return <C {...props} /> } } catch {}
  try { if (tid.includes('car') || tid.includes('rental')) { const C = require('./premium/CarRentalTheme').default; return <C {...props} /> } } catch {}
  try { if (tid.includes('plant')) { const C = require('./premium/PlantifyTheme').default; return <C {...props} /> } } catch {}
  try { if (tid.includes('slick') || tid.includes('sole')) { const C = require('./premium/SlickSoleTheme').default; return <C {...props} /> } } catch {}
  try { if (tid.includes('dangila')) { const C = require('./premium/DangilaTheme').default; return <C {...props} /> } } catch {}
  try { if (tid.includes('yellow')) { const C = require('./premium/YellowMinimalTheme').default; return <C {...props} /> } } catch {}
  return <FallbackCard {...props} />
}

export { PremiumThemeRenderer }
