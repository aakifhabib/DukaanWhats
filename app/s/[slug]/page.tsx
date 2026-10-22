'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function StorePage({ params }: { params: { slug: string } }) {
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data: prof } = await supabase.from('profiles').select('*').eq('store_slug', params.slug).single();
      if (prof) {
        setProfile(prof);
        const { data: prods } = await supabase.from('products').select('*').eq('user_id', prof.id).order('created_at', { ascending: false });
        if (prods) setProducts(prods);
      }
      setLoading(false);
    }
    load();
  }, [params.slug]);

  function addToCart(p: any) {
    const ex = cart.find(c => c.id === p.id);
    if (ex) setCart(cart.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c));
    else setCart([...cart, { ...p, qty: 1 }]);
    setShowCart(true);
  }
  function updateQty(id: string, delta: number) {
    setCart(cart.map(c => {
      if (c.id === id) {
        const newQty = c.qty + delta;
        return newQty <= 0 ? null : { ...c, qty: newQty };
      }
      return c;
    }).filter(Boolean) as any[]);
  }
  function total() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
  function itemCount() { return cart.reduce((s, i) => s + i.qty, 0); }

  function orderWA() {
    if (cart.length === 0) return;
    const name = prompt('Your Name?') || 'Customer';
    const phone = prompt('Your Phone 03xx?') || '';
    const addr = prompt('Delivery Address?') || '';
    if (!name || !phone) return alert('Please enter name and phone');
    const items = cart.map(i => `${i.name} x${i.qty} = Rs.${i.price * i.qty}`).join('%0A');
    const msg = `Salam ${profile.business_name}!%0A%0A*New Order*%0A%0A${items}%0A%0A*Total: Rs.${total()}*%0A%0ACustomer: ${name}%0APhone: ${phone}%0AAddress: ${addr}%0A%0APlease confirm.`;
    const waUrl = `https://wa.me/${profile.whatsapp_number}?text=${msg}`;
    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full"></div></div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center flex-col gap-4"><p>Store {params.slug} not found</p><Link href="/" className="underline">Home</Link></div>;

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <header className="bg-white border-b sticky top-0 z-20 backdrop-blur-lg bg-white/80">
        <div className="max-w-md mx-auto px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 text-white rounded-full flex items-center justify-center font-black">{profile.business_name[0].toUpperCase()}</div>
            <div><div className="font-black text-sm leading-none">{profile.business_name}</div><div className="flex items-center gap-1 mt-1"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div><span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">Active on WhatsApp</span></div></div>
          </div>
          <button onClick={() => setShowCart(true)} className="relative bg-zinc-900 text-white w-10 h-10 rounded-full flex items-center justify-center">🛒{itemCount() > 0 && <span className="absolute -top-1 -right-1 bg-[#00B050] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">{itemCount()}</span>}</button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5">
        <div className="bg-white rounded-[16px] border p-3 flex items-center gap-3 shadow-sm">
          <span className="text-zinc-400">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search in ${profile.business_name}...`} className="flex-1 text-sm outline-none placeholder:text-zinc-400"/>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4"><h2 className="font-black text-lg">All Products</h2><span className="text-xs bg-zinc-900 text-white px-3 py-1 rounded-full">{filtered.length} items</span></div>
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(p => (
              <div key={p.id} className="group bg-white border border-zinc-100 hover:border-zinc-900 rounded-[20px] p-3 transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="relative aspect-square overflow-hidden rounded-[14px] bg-zinc-50">{p.image_url ? <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-700"/> : <div className="w-full h-full flex flex-col items-center justify-center gap-2"><span className="text-3xl">👗</span><span className="text-[10px] text-zinc-400 font-bold">NO PHOTO</span></div>}<button className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-xs shadow">♡</button></div>
                <div className="mt-3"><div className="font-bold text-[13px] leading-tight line-clamp-2 min-h-[32px]">{p.name}</div><div className="flex justify-between items-center mt-2"><div className="text-[#00B050] font-black text-sm">Rs. {Number(p.price).toLocaleString()}</div><div className="text-[10px] text-zinc-400 font-bold uppercase">In Stock</div></div><button onClick={() => addToCart(p)} className="mt-3 w-full bg-zinc-900 group-hover:bg-black text-white py-2.5 rounded-full text-xs font-black tracking-wider transition">ADD TO CART</button></div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && <div className="text-center py-20"><div className="text-4xl">🔍</div><p className="font-bold mt-3">No products found</p><p className="text-xs text-zinc-400">Try different search</p></div>}
        </div>
      </main>

      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right">
            <div className="p-6 border-b flex justify-between items-center"><h2 className="font-black text-lg">Your Cart ({itemCount()})</h2><button onClick={() => setShowCart(false)} className="w-8 h-8 bg-zinc-100 rounded-full">✕</button></div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {cart.length === 0 ? <div className="text-center py-20"><div className="text-4xl">🛒</div><p className="font-bold mt-3">Cart is empty</p><p className="text-xs text-zinc-400 mt-1">Add some products to order</p></div> :
                cart.map(item => (
                  <div key={item.id} className="flex gap-3 border border-zinc-100 rounded-2xl p-3">
                    <img src={item.image_url || ''} className="w-16 h-16 rounded-xl object-cover bg-zinc-50"/>
                    <div className="flex-1"><div className="font-bold text-sm">{item.name}</div><div className="text-[#00B050] font-bold text-sm mt-1">Rs. {item.price}</div><div className="flex items-center gap-2 mt-2"><button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 bg-zinc-100 rounded-full text-sm font-bold">-</button><span className="text-sm font-bold w-6 text-center">{item.qty}</span><button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 bg-zinc-900 text-white rounded-full text-sm font-bold">+</button></div></div>
                    <div className="text-right"><div className="font-black text-sm">Rs. {item.price * item.qty}</div></div>
                  </div>
                ))
              }
            </div>
            {cart.length > 0 && (
              <div className="p-6 border-t bg-zinc-50">
                <div className="flex justify-between font-black text-lg mb-4"><span>Total</span><span>Rs. {total().toLocaleString()}</span></div>
                <button onClick={orderWA} className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white py-4 rounded-full font-black text-sm tracking-wider flex items-center justify-center gap-2 transition"><span>📱</span> ORDER ON WHATSAPP</button>
                <p className="text-[10px] text-center text-zinc-400 mt-3">You will be redirected to WhatsApp to confirm order</p>
              </div>
            )}
          </div>
        </div>
      )}

      {cart.length > 0 && !showCart && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 z-30">
          <div className="bg-zinc-900 text-white rounded-full p-2 flex items-center justify-between shadow-2xl">
            <div className="pl-4"><div className="text-[11px] opacity-70 font-bold uppercase tracking-wider">{itemCount()} items</div><div className="font-black">Rs. {total().toLocaleString()}</div></div>
            <button onClick={() => setShowCart(true)} className="bg-white text-zinc-900 px-6 py-3 rounded-full font-black text-sm">VIEW CART</button>
          </div>
        </div>
      )}
    </div>
  );
}
