'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Dashboard() {
  const [business, setBusiness] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [slug, setSlug] = useState('');
  const [profileId, setProfileId] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pImage, setPImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const savedId = localStorage.getItem('dw_profileId');
    if (savedId) {
      setProfileId(savedId);
      loadProducts(savedId);
      setBusiness(localStorage.getItem('dw_business') || '');
      setWhatsapp(localStorage.getItem('dw_whatsapp') || '');
      setSlug(localStorage.getItem('dw_slug') || '');
    }
  }, []);

  async function loadProducts(pid: string) {
    const { data } = await supabase.from('products').select('*').eq('user_id', pid).order('created_at', { ascending: false });
    if (data) setProducts(data);
  }

  function handleImage(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPImage(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function createStore() {
    if (!business || !whatsapp || !slug) return setMsg('Fill all fields');
    if (!/^923\d{9}$/.test(whatsapp)) return setMsg('WhatsApp must be 923XXXXXXXXX');
    setLoading(true);
    const { data: exists } = await supabase.from('profiles').select('id').eq('store_slug', slug).maybeSingle();
    if (exists && exists.id !== profileId) { setLoading(false); return setMsg('Slug taken! Try ' + slug + '-2'); }
    let result;
    if (profileId) {
      result = await supabase.from('profiles').update({ business_name: business, whatsapp_number: whatsapp, store_slug: slug }).eq('id', profileId).select().single();
    } else {
      result = await supabase.from('profiles').insert({ business_name: business, whatsapp_number: whatsapp, store_slug: slug }).select().single();
    }
    if (result.error) { setMsg(result.error.message); setLoading(false); return; }
    setProfileId(result.data.id);
    localStorage.setItem('dw_profileId', result.data.id);
    localStorage.setItem('dw_business', business);
    localStorage.setItem('dw_whatsapp', whatsapp);
    localStorage.setItem('dw_slug', slug);
    setMsg('Store saved! /s/' + slug);
    setLoading(false);
  }

  async function addProduct() {
    if (!pName || !pPrice) return setMsg('Enter name and price');
    if (!profileId) return setMsg('Create store first');
    setLoading(true);
    let imageUrl = '';
    if (pImage) {
      const fileName = Date.now() + '-' + pImage.name.replace(/[^a-zA-Z0-9.]/g, '-');
      const { error } = await supabase.storage.from('product-images').upload(fileName, pImage);
      if (error) { setMsg(error.message); setLoading(false); return; }
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }
    const { data, error } = await supabase.from('products').insert({ user_id: profileId, name: pName, price: parseInt(pPrice), image_url: imageUrl }).select().single();
    if (error) setMsg(error.message);
    else { setProducts([data, ...products]); setPName(''); setPPrice(''); setPImage(null); setPreview(''); setMsg('Product added!'); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-zinc-900">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-black text-xl">DukaanWhats<span className="text-[#00B050]">.pk</span></div>
          {slug && <Link href={`/s/${slug}`} target="_blank" className="bg-zinc-900 text-white px-5 py-2 rounded-full text-sm font-bold">View Store ↗</Link>}
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6 grid lg:grid-cols-3 gap-6 mt-2">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[24px] p-6 border shadow-sm">
            <div className="flex items-center gap-2 mb-5"><div className="w-8 h-8 bg-zinc-900 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div><h2 className="font-bold">Store Settings</h2></div>
            <div className="space-y-4">
              <div><label className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Business Name</label><input value={business} onChange={e=>setBusiness(e.target.value)} placeholder="Ayesha Boutique" className="w-full mt-1.5 border border-zinc-200 focus:border-zinc-900 rounded-xl p-3.5 text-sm outline-none"/></div>
              <div><label className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">WhatsApp (923...)</label><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="923001234567" className="w-full mt-1.5 border border-zinc-200 focus:border-zinc-900 rounded-xl p-3.5 text-sm outline-none"/></div>
              <div><label className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Store Link</label><div className="flex mt-1.5"><span className="bg-zinc-100 border border-r-0 border-zinc-200 rounded-l-xl px-3 py-3.5 text-xs text-zinc-500">/s/</span><input value={slug} onChange={e=>setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-'))} placeholder="ayesha-boutique" className="w-full border border-zinc-200 focus:border-zinc-900 rounded-r-xl p-3.5 text-sm outline-none"/></div></div>
              <button onClick={createStore} disabled={loading} className="w-full bg-[#00B050] hover:bg-[#009645] text-white py-3.5 rounded-full font-bold text-sm transition disabled:opacity-50">{loading?'Saving...':'Save Store'}</button>
            </div>
          </div>
          <div className="bg-white rounded-[24px] p-6 border shadow-sm">
            <div className="flex items-center gap-2 mb-5"><div className="w-8 h-8 bg-zinc-900 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div><h2 className="font-bold">Add Product</h2></div>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Product Photo</label>
                <label className="mt-1.5 w-full border-2 border-dashed border-zinc-200 hover:border-zinc-900 rounded-[16px] p-6 flex flex-col items-center justify-center cursor-pointer bg-zinc-50/50 hover:bg-white transition group">
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden"/>
                  {preview ? <div className="relative"><img src={preview} className="w-32 h-32 object-cover rounded-xl shadow"/><div className="absolute -top-2 -right-2 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded-full">CHANGE</div></div> : <><div className="w-12 h-12 bg-white border shadow-sm rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition">📸</div><p className="text-sm font-bold mt-3">Tap to upload photo</p><p className="text-[11px] text-zinc-400 mt-1">PNG, JPG up to 5MB</p></>}
                </label>
              </div>
              <input placeholder="Product Name e.g. Lawn Suit Premium" value={pName} onChange={e=>setPName(e.target.value)} className="w-full border border-zinc-200 focus:border-zinc-900 rounded-xl p-3.5 text-sm outline-none"/>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Price Rs. 3500" type="number" value={pPrice} onChange={e=>setPPrice(e.target.value)} className="border border-zinc-200 focus:border-zinc-900 rounded-xl p-3.5 text-sm outline-none"/>
                <div className="border border-zinc-200 rounded-xl p-3.5 text-sm bg-zinc-50 text-zinc-500 text-center">Stock: In Stock</div>
              </div>
              <button onClick={addProduct} disabled={loading} className="w-full bg-zinc-900 hover:bg-black text-white py-3.5 rounded-full font-bold text-sm transition disabled:opacity-50">+ Add Product</button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[24px] p-6 border shadow-sm min-h-[500px]">
            <div className="flex justify-between items-center mb-6"><h2 className="font-bold text-lg">Your Products</h2><span className="text-xs bg-zinc-900 text-white px-3 py-1 rounded-full">{products.length} items</span></div>
            {products.length===0 ? <div className="text-center py-20 border-2 border-dashed border-zinc-100 rounded-[20px]"><div className="text-4xl">🛍️</div><p className="font-bold mt-4">No products yet</p><p className="text-xs text-zinc-400 mt-1">Add your first product to see it here</p></div> :
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map(p=>(
                <div key={p.id} className="group border border-zinc-100 hover:border-zinc-900 hover:shadow-xl rounded-[16px] p-3 transition-all bg-white">
                  <div className="relative overflow-hidden rounded-xl bg-zinc-50 aspect-square">{p.image_url ? <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-105 transition duration-700"/> : <div className="w-full h-full flex items-center justify-center text-2xl">👗</div>}</div>
                  <div className="mt-3"><div className="font-bold text-sm truncate">{p.name}</div><div className="text-[#00B050] font-black text-sm mt-1">Rs. {Number(p.price).toLocaleString()}</div></div>
                </div>
              ))}
            </div>}
          </div>
        </div>
      </main>
      {msg && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl z-50">{msg}</div>}
    </div>
  );
}
