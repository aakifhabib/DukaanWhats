'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [userId, setUserId] = useState('');
  const [business, setBusiness] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [slug, setSlug] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pImage, setPImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  // Edit state
  const [editProd, setEditProd] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState('');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) {
        setBusiness(profile.business_name);
        setWhatsapp(profile.whatsapp_number);
        setSlug(profile.store_slug);
      }
      const { data: prods } = await supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (prods) setProducts(prods);
      setLoading(false);
    })();
  }, []);

  function handleImage(e: any, isEdit = false) {
    const file = e.target.files?.[0]; if (!file) return;
    if (isEdit) {
      setEditImage(file);
      const r = new FileReader(); r.onload = () => setEditPreview(r.result as string); r.readAsDataURL(file);
    } else {
      setPImage(file);
      const r = new FileReader(); r.onload = () => setPreview(r.result as string); r.readAsDataURL(file);
    }
  }

  async function createStore() {
    if (!business || !whatsapp || !slug) return toast('Fill all fields');
    if (!/^923\d{9}$/.test(whatsapp)) return toast('WhatsApp must be 923XXXXXXXXX');
    setSaving(true);
    const { data: exists } = await supabase.from('profiles').select('id').eq('store_slug', slug).neq('id', userId).maybeSingle();
    if (exists) { setSaving(false); return toast('Slug taken! Try another'); }
    const { error } = await supabase.from('profiles').upsert({ id: userId, business_name: business, whatsapp_number: whatsapp, store_slug: slug }, { onConflict: 'id' });
    if (error) toast(error.message); else toast('Store saved! /s/' + slug);
    setSaving(false);
  }

  async function uploadImage(file: File) {
    const fileName = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
    const { error } = await supabase.storage.from('product-images').upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function addProduct() {
    if (!pName || !pPrice) return toast('Enter name and price');
    if (!slug) return toast('Save store first');
    setSaving(true);
    try {
      let imageUrl = '';
      if (pImage) imageUrl = await uploadImage(pImage);
      const { data, error } = await supabase.from('products').insert({ user_id: userId, name: pName, price: parseInt(pPrice), image_url: imageUrl }).select().single();
      if (error) throw error;
      setProducts([data, ...products]); setPName(''); setPPrice(''); setPImage(null); setPreview(''); toast('Product added!');
    } catch (e: any) { toast(e.message); }
    setSaving(false);
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast(error.message); else { setProducts(products.filter(p => p.id !== id)); toast('Deleted'); }
  }

  function openEdit(p: any) {
    setEditProd(p); setEditName(p.name); setEditPrice(String(p.price)); setEditPreview(p.image_url || ''); setEditImage(null);
  }

  async function saveEdit() {
    if (!editProd) return;
    setSaving(true);
    try {
      let imageUrl = editProd.image_url;
      if (editImage) imageUrl = await uploadImage(editImage);
      const { data, error } = await supabase.from('products').update({ name: editName, price: parseInt(editPrice), image_url: imageUrl }).eq('id', editProd.id).select().single();
      if (error) throw error;
      setProducts(products.map(p => p.id === editProd.id ? data : p));
      setEditProd(null); toast('Product updated!');
    } catch (e: any) { toast(e.message); }
    setSaving(false);
  }

  function toast(t: string) { setMsg(t); setTimeout(() => setMsg(''), 3000); }

  if (loading) return <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF9]"><div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"/><p className="mt-3 text-sm font-bold text-zinc-500">Loading your Dukaan...</p></div>;

  const totalValue = products.reduce((s, p) => s + Number(p.price), 0);

  return (
    <div className="min-h-screen bg-[#FCFCF9] text-zinc-900 selection:bg-[#00B050]/20">
      <header className="bg-white/80 backdrop-blur-xl border-b border-zinc-100 sticky top-0 z-20">
        <div className="max-w- mx-auto px-6 h- flex justify-between items-center">
          <div className="flex items-center gap-3"><div className="w-9 h-9 bg-zinc-900 rounded-xl flex items-center justify-center text-white font-black">D</div><span className="font-black text- tracking-tight">DukaanWhats<span className="text-[#00B050]">.pk</span></span><span className="ml-3 hidden md:block text- font-bold tracking-widest text-zinc-400 bg-zinc-50 border px-2.5 py-1 rounded-full">PRO SELLER</span></div>
          <div className="flex items-center gap-2">
            {slug && <Link href={`/s/${slug}`} target="_blank" className="h-9 px-4 bg-white border border-zinc-200 rounded-full text- font-bold hover:bg-zinc-50 flex items-center">View Store ↗</Link>}
            <Link href="/login" className="h-9 w-9 bg-zinc-900 text-white rounded-full flex items-center justify-center">⎋</Link>
          </div>
        </div>
      </header>

      <main className="max-w- mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-zinc-100 rounded- p-5"><p className="text- font-black tracking-widest text-zinc-400">PRODUCTS</p><p className="text- font-black mt-1">{products.length}</p></div>
          <div className="bg-white border border-zinc-100 rounded- p-5"><p className="text- font-black tracking-widest text-zinc-400">TOTAL VALUE</p><p className="text- font-black mt-1">Rs. {totalValue.toLocaleString()}</p></div>
          <div className="bg-zinc-900 text-white rounded- p-5"><p className="text- font-black tracking-widest text-zinc-400">STORE LINK</p><p className="text- font-bold mt-2 truncate">dukaan-whats.vercel.app/s/{slug || '...'}</p></div>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
          {/* Left */}
          <div className="space-y-6 lg:sticky lg:top-">
            <div className="bg-white rounded- border border-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-6">
              <div className="flex items-center gap-3 mb-6"><div className="w-7 h-7 bg-zinc-900 text-white rounded-full flex items-center justify-center text- font-bold">1</div><h2 className="font-black text-">Store Identity</h2><span className="ml-auto text- font-bold bg-[#00B050]/10 text-[#00B050] px-2 py-1 rounded-full">AUTO-SAVED TO LOGIN</span></div>
              <div className="space-y-4">
                <div><label className="text- font-black tracking-widest text-zinc-400">BUSINESS NAME</label><input value={business} onChange={e=>setBusiness(e.target.value)} placeholder="Ayesha Boutique" className="mt-2 w-full h- bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-zinc-900 rounded- px-4 text- font-medium outline-none transition"/></div>
                <div><label className="text- font-black tracking-widest text-zinc-400">WHATSAPP NUMBER</label><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="923001234567" className="mt-2 w-full h- bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-zinc-900 rounded- px-4 text- font-medium outline-none transition"/></div>
                <div><label className="text- font-black tracking-widest text-zinc-400">STORE SLUG</label><div className="mt-2 flex h-"><span className="h-full bg-zinc-900 text-white text- font-bold px-4 flex items-center rounded-l-">/s/</span><input value={slug} onChange={e=>setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-'))} placeholder="ayesha-boutique" className="flex-1 bg-zinc-50 border-y border-r border-zinc-100 focus:bg-white focus:border-zinc-900 rounded-r- px-4 text- font-medium outline-none transition"/></div></div>
                <button onClick={createStore} disabled={saving} className="w-full h- bg-[#00B050] hover:bg-[#009645] text-white rounded-full font-black text- tracking-wide transition disabled:opacity-50">{saving ? 'Saving...' : 'Save Store →'}</button>
              </div>
            </div>

            <div className="bg-white rounded- border border-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-6">
              <div className="flex items-center gap-3 mb-6"><div className="w-7 h-7 bg-zinc-900 text-white rounded-full flex items-center justify-center text- font-bold">2</div><h2 className="font-black text-">Add Product</h2></div>
              <div className="space-y-4">
                <label className="group relative w-full h- border-2 border-dashed border-zinc-200 hover:border-zinc-900 rounded- bg-[#FCFCF9] hover:bg-white flex flex-col items-center justify-center cursor-pointer transition overflow-hidden">
                  <input type="file" accept="image/*" onChange={(e)=>handleImage(e,false)} className="hidden"/>
                  {preview ? <><img src={preview} className="w-full h-full object-cover"/><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text- font-black transition">CLICK TO CHANGE</div></> : <><div className="w-12 h-12 bg-white border border-zinc-100 shadow-sm rounded-full flex items-center justify-center text-xl">📸</div><p className="text- font-black mt-3">Upload Product Photo</p><p className="text- text-zinc-400 mt-1">Premium quality, up to 5MB</p></>}
                </label>
                <input value={pName} onChange={e=>setPName(e.target.value)} placeholder="Product name e.g. Premium Lawn Suit" className="w-full h- bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-zinc-900 rounded- px-4 text- font-medium outline-none"/>
                <input value={pPrice} onChange={e=>setPPrice(e.target.value)} type="number" placeholder="Price Rs. 3500" className="w-full h- bg-zinc-50 border border-zinc-100 focus:bg-white focus:border-zinc-900 rounded- px-4 text- font-medium outline-none"/>
                <button onClick={addProduct} disabled={saving} className="w-full h- bg-zinc-900 hover:bg-black text-white rounded-full font-black text- transition disabled:opacity-50">+ Add to Store</button>
              </div>
            </div>
          </div>

          {/* Right - Products */}
          <div className="bg-white rounded- border border-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-7 min-h-">
            <div className="flex items-center justify-between mb-8"><h2 className="font-black text-">Your Products</h2><div className="flex items-center gap-2"><span className="text- font-black tracking-widest bg-zinc-900 text-white px-3 py-1.5 rounded-full">{products.length} ITEMS</span></div></div>
            {products.length === 0 ? (
              <div className="border-2 border-dashed border-zinc-100 rounded- py-24 text-center"><div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-3xl">🛍️</div><p className="font-black mt-4">No products yet</p><p className="text- text-zinc-400 mt-1">Add your first product from left panel</p></div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map(p => (
                  <div key={p.id} className="group relative bg-[#FCFCF9] border border-zinc-100 hover:border-zinc-900 hover:bg-white rounded- p-3 transition-all hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1">
                    <div className="relative aspect-[4/5] rounded- overflow-hidden bg-white border border-zinc-50">
                      {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-[1.05] transition duration-700"/> : <div className="w-full h-full flex items-center justify-center text-3xl">👗</div>}
                      <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={()=>openEdit(p)} className="w-8 h-8 bg-white shadow border rounded-full flex items-center justify-center hover:bg-zinc-900 hover:text-white transition">✎</button>
                        <button onClick={()=>deleteProduct(p.id)} className="w-8 h-8 bg-white shadow border rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition">🗑</button>
                      </div>
                    </div>
                    <div className="p-2.5"><div className="font-bold text- leading-tight truncate">{p.name}</div><div className="flex items-center justify-between mt-2"><span className="text-[#00B050] font-black text-">Rs. {Number(p.price).toLocaleString()}</span><span className="text- font-bold bg-zinc-900 text-white px-2 py-1 rounded-full">IN STOCK</span></div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {editProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md" onClick={()=>setEditProd(null)}/>
          <div className="relative w-full max-w- bg-white rounded- p-7 shadow-2xl animate-[scaleIn_0.2s]">
            <div className="flex justify-between items-center mb-6"><h3 className="font-black text-">Edit Product</h3><button onClick={()=>setEditProd(null)} className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center">✕</button></div>
            <div className="space-y-4">
              <label className="block w-full h- border-2 border-dashed rounded- overflow-hidden cursor-pointer bg-zinc-50 flex items-center justify-center">
                <input type="file" accept="image/*" onChange={(e)=>handleImage(e,true)} className="hidden"/>
                {editPreview ? <img src={editPreview} className="w-full h-full object-cover"/> : <span className="text-sm font-bold">📸 Upload new photo</span>}
              </label>
              <input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Product name" className="w-full h- border rounded-xl px-4 text-sm"/>
              <input value={editPrice} onChange={e=>setEditPrice(e.target.value)} type="number" placeholder="Price" className="w-full h- border rounded-xl px-4 text-sm"/>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={()=>setEditProd(null)} className="h- border rounded-full font-bold text-sm">Cancel</button>
                <button onClick={saveEdit} disabled={saving} className="h- bg-zinc-900 text-white rounded-full font-bold text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {msg && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-3 rounded-full text- font-bold shadow-2xl z-[100] animate-[slideUp_0.3s]">{msg}</div>}
    </div>
  );
}
