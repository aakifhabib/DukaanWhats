'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function StorePage({ params }: { params: { slug: string } }) {
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: prof } = await supabase.from('profiles').select('*').eq('store_slug', params.slug).single();
      if (prof) {
        setProfile(prof);
        const { data: prods } = await supabase.from('products').select('*').eq('user_id', prof.id);
        if (prods) setProducts(prods);
      }
      setLoading(false);
    }
    load();
  }, [params.slug]);

  function addToCart(p: any) {
    const ex = cart.find(c=>c.id===p.id);
    if(ex) setCart(cart.map(c=>c.id===p.id?{...c, qty:c.qty+1}:c));
    else setCart([...cart, {...p, qty:1}]);
  }
  function total(){ return cart.reduce((s,i)=>s+i.price*i.qty,0); }
  function orderWA(){
    if(cart.length===0) return;
    const name = prompt('Your Name?')||'Customer';
    const phone = prompt('Your Phone?')||'';
    const items = cart.map(i=>`${i.name} x${i.qty} = Rs.${i.price*i.qty}`).join('%0A');
    const msg = `Salam ${profile.business_name}!%0ANew Order:%0A${items}%0ATotal Rs.${total()}%0ACustomer: ${name} ${phone}`;
    window.open(`https://wa.me/${profile.whatsapp_number}?text=${msg}`, '_blank');
  }

  if(loading) return <div className="p-10 text-center">Loading {params.slug}...</div>;
  if(!profile) return <div className="p-10 text-center">Store {params.slug} not found<br/><Link href="/" className="underline">Home</Link></div>;

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto border-x pb-20">
      <div className="p-5 border-b flex gap-3 sticky top-0 bg-white">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center font-black text-[#00B050]">{profile.business_name[0]}</div>
        <div><div className="font-bold">{profile.business_name}</div><div className="text-xs text-green-600">Active on WhatsApp</div></div>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        {products.map(p=>(
          <div key={p.id} className="border rounded-2xl p-2">
            {p.image_url? <img src={p.image_url} className="h-28 w-full object-cover rounded-xl"/> : <div className="h-28 bg-zinc-100 rounded-xl flex items-center justify-center">👗</div>}
            <div className="font-bold text-sm mt-2">{p.name}</div>
            <div className="text-[#00B050] font-bold">Rs. {p.price}</div>
            <button onClick={()=>addToCart(p)} className="mt-2 w-full bg-zinc-900 text-white py-2 rounded-full text-xs font-bold">Add to Cart</button>
          </div>
        ))}
      </div>
      {cart.length>0 && <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-zinc-900 text-white p-4 flex justify-between"><div className="font-bold">Rs. {total()} ({cart.reduce((s,i)=>s+i.qty,0)} items)</div><button onClick={orderWA} className="bg-[#00B050] px-5 py-2 rounded-full font-bold text-sm">WhatsApp Order</button></div>}
    </div>
  );
}