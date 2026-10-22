'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function StorePage({ params }: { params: { slug: string } }) {
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cAddr, setCAddr] = useState('');

  useEffect(() => {
    (async () => {
      const { data: prof } = await supabase.from('profiles').select('*').eq('store_slug', params.slug).single();
      if (prof) {
        setProfile(prof);
        const { data: prods } = await supabase.from('products').select('*').eq('user_id', prof.id);
        if (prods) setProducts(prods);
      }
    })();
  }, [params.slug]);

  function addToCart(p: any) {
    const ex = cart.find(c => c.id === p.id);
    if (ex) setCart(cart.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c));
    else setCart([...cart, { ...p, qty: 1 }]);
    setShowCart(true);
  }
  function total() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }

  function orderWA() {
    if (!cName || !cPhone) { alert('Enter Name & Phone'); return; }
    const items = cart.map(i => `${i.name} x${i.qty} = Rs.${i.price * i.qty}`).join('%0A');
    const text = `Salam ${profile.business_name}!%0A%0A*New Order*%0A${items}%0A%0ATotal: Rs.${total()}%0AName: ${cName}%0APhone: ${cPhone}%0AAddr: ${cAddr}`;
    const url = `https://wa.me/${profile.whatsapp_number}?text=${text}`;
    // FIX: 100% popup-proof method
    window.location.href = url;
  }

  if (!profile) return <div className="p-10 text-center">Store not found: {params.slug}</div>;

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <header className="bg-white border-b sticky top-0 z-10"><div className="max-w-md mx-auto p-4 flex justify-between"><div className="font-black">{profile.business_name}</div><button onClick={()=>setShowCart(true)} className="bg-zinc-900 text-white w-10 h-10 rounded-full">🛒 {cart.reduce((s,i)=>s+i.qty,0)}</button></div></header>
      <main className="max-w-md mx-auto p-4 grid grid-cols-2 gap-3">
        {products.map(p=>(
          <div key={p.id} className="bg-white border rounded- p-3">
            <div className="aspect-square bg-zinc-50 rounded-xl overflow-hidden">{p.image_url && <img src={p.image_url} className="w-full h-full object-cover"/>}</div>
            <div className="font-bold text-sm mt-2">{p.name}</div><div className="text-green-600 font-black">Rs. {p.price}</div>
            <button onClick={()=>addToCart(p)} className="w-full mt-2 bg-zinc-900 text-white py-2 rounded-full text-xs font-bold">ADD TO CART</button>
          </div>
        ))}
      </main>
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end"><div className="absolute inset-0 bg-black/40" onClick={()=>setShowCart(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full flex flex-col">
            <div className="p-4 border-b flex justify-between"><h2 className="font-black">Cart</h2><button onClick={()=>setShowCart(false)}>✕</button></div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {cart.map(i=>(<div key={i.id} className="flex gap-3 border rounded-xl p-3"><div className="flex-1">{i.name} x{i.qty}</div><div>Rs. {i.price*i.qty}</div></div>))}
              <div className="space-y-2 mt-4 pt-4 border-t">
                <input value={cName} onChange={e=>setCName(e.target.value)} placeholder="Your Name" className="w-full border rounded-xl p-3 text-sm"/>
                <input value={cPhone} onChange={e=>setCPhone(e.target.value)} placeholder="Phone 03xx" className="w-full border rounded-xl p-3 text-sm"/>
                <input value={cAddr} onChange={e=>setCAddr(e.target.value)} placeholder="Address" className="w-full border rounded-xl p-3 text-sm"/>
              </div>
            </div>
            <div className="p-4 border-t"><div className="flex justify-between font-black mb-3"><span>Total</span><span>Rs. {total()}</span></div><button onClick={orderWA} className="w-full bg-[#25D366] text-white py-4 rounded-full font-black">ORDER ON WHATSAPP</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
