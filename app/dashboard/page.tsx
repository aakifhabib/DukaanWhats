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
  const [editProd, setEditProd] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState('');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/login'); return; }
      const user = session.user; setUserId(user.id);
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) { setBusiness(profile.business_name); setWhatsapp(profile.whatsapp_number); setSlug(profile.store_slug); }
      const { data: prods } = await supabase.from('products').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (prods) setProducts(prods); setLoading(false);
    })();
  }, []);

  const handleImg = (e: any, isEdit=false) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = () => isEdit ? setEditPreview(reader.result as string) : setPreview(reader.result as string); reader.readAsDataURL(file);
    isEdit ? setEditImage(file) : setPImage(file);
  };
  const toast = (t: string) => { setMsg(t); setTimeout(()=>setMsg(''), 3000); }

  async function createStore() {
    if (!business || !whatsapp || !slug) return toast('Fill all fields');
    setSaving(true);
    const { data: exists } = await supabase.from('profiles').select('id').eq('store_slug', slug).neq('id', userId).maybeSingle();
    if (exists) { setSaving(false); return toast('Slug taken'); }
    const { error } = await supabase.from('profiles').upsert({ id: userId, business_name: business, whatsapp_number: whatsapp, store_slug: slug }, { onConflict: 'id' });
    toast(error ? error.message : 'Store saved ✓'); setSaving(false);
  }
  async function upload(file: File) {
    const name = `${userId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('product-images').upload(name, file); if (error) throw error;
    return supabase.storage.from('product-images').getPublicUrl(name).data.publicUrl;
  }
  async function addProduct() {
    if (!pName || !pPrice) return toast('Enter name & price'); if (!slug) return toast('Save store first');
    setSaving(true);
    try {
      let url = ''; if (pImage) url = await upload(pImage);
      const { data } = await supabase.from('products').insert({ user_id: userId, name: pName, price: parseInt(pPrice), image_url: url }).select().single();
      setProducts([data, ...products]); setPName(''); setPPrice(''); setPImage(null); setPreview(''); toast('Added ✓');
    } catch (e: any) { toast(e.message); } setSaving(false);
  }
  async function del(id: string) { if (!confirm('Delete?')) return; await supabase.from('products').delete().eq('id', id); setProducts(products.filter(p=>p.id!==id)); }
  function openEdit(p: any) { setEditProd(p); setEditName(p.name); setEditPrice(String(p.price)); setEditPreview(p.image_url); }
  async function saveEdit() {
    setSaving(true); try {
      let url = editProd.image_url; if (editImage) url = await upload(editImage);
      const { data } = await supabase.from('products').update({ name: editName, price: parseInt(editPrice), image_url: url }).eq('id', editProd.id).select().single();
      setProducts(products.map(p=>p.id===editProd.id?data:p)); setEditProd(null); toast('Updated ✓');
    } catch (e: any) { toast(e.message); } setSaving(false);
  }

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="w-10 h-10 border- border-white/10 border-t-white rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#00B050]/30">
      {/* BG BLOBS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden"><div className="absolute w- h- bg-[#00B050]/15 rounded-full blur- -top- -left-"/><div className="absolute w- h- bg-white/[0.04] rounded-full blur- top-[30%] -right-"/></div>

      <header className="relative z-10 h- px-6 flex items-center justify-between max-w- mx-auto">
        <div className="flex items-center gap-3"><div className="w-9 h-9 bg-white text-black rounded-full flex items-center justify-center font-black text-">D</div><span className="font-black tracking-tight text-">DukaanWhats</span><span className="text-[#00B050] font-black">.pk</span></div>
        <div className="flex items-center gap-2">{slug && <Link href={`/s/${slug}`} target="_blank" className="h- px-6 bg-white text-black rounded-full font-bold text- flex items-center hover:scale-[1.03] transition">View Live →</Link>}<button onClick={async()=>{await supabase.auth.signOut(); router.push('/login');}} className="w- h- bg-white/10 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/15">↗</button></div>
      </header>

      <main className="relative z-10 max-w- mx-auto px-4 md:px-6 pb-20">
        {/* STATS - ALL ROUNDED FULL PILLS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          <div className="h- bg-white text-black rounded-full px-7 flex items-center justify-between"><div><p className="text- font-black tracking-[0.15em] opacity-40">PRODUCTS</p><p className="text- font-black leading-none mt-1">{products.length}</p></div><div className="w- h- bg-black text-white rounded-full flex items-center justify-center">◧</div></div>
          <div className="h- bg-white text-black rounded-full px-7 flex items-center justify-between"><div><p className="text- font-black tracking-[0.15em] opacity-40">TOTAL VALUE</p><p className="text- font-black leading-none mt-1">Rs. {products.reduce((s,p)=>s+Number(p.price),0).toLocaleString()}</p></div><div className="w- h- bg-[#00B050] text-white rounded-full flex items-center justify-center">Rs</div></div>
          <div className="h- bg-[#00B050] text-white rounded-full px-7 flex items-center justify-between"><div className="min-w-0 flex-1"><p className="text- font-black tracking-[0.15em] opacity-70">STORE LINK</p><p className="text- font-bold truncate mt-1">/s/{slug || '...'}</p></div><div className="w- h- bg-white text-black rounded-full flex items-center justify-center ml-3">↗</div></div>
        </div>

        <div className="grid lg:grid-cols-[420px_1fr] gap-4 mt-4 items-start">
          {/* LEFT */}
          <div className="space-y-4">
            <div className="bg-white text-black rounded- p-6 md:p-7">
              <div className="flex items-center gap-3"><div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-black text-">1</div><p className="font-black text-">Store Identity</p><span className="ml-auto text- font-black bg-[#00B050]/10 text-[#00B050] px-3 py-1 rounded-full">AUTO-SAVED</span></div>
              <div className="mt-6 space-y-4">
                <div><p className="text- font-black tracking-wide opacity-50 ml-4 mb-2">BUSINESS NAME</p><input value={business} onChange={e=>setBusiness(e.target.value)} placeholder="Ayesha Boutique" className="w-full h- rounded-full bg-[#F5F5F5] border-0 px-6 text- font-bold text-black placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-black focus:bg-white transition"/></div>
                <div><p className="text- font-black tracking-wide opacity-50 ml-4 mb-2">WHATSAPP NUMBER</p><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="923001234567" className="w-full h- rounded-full bg-[#F5F5F5] border-0 px-6 text- font-bold text-black placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-black focus:bg-white transition"/></div>
                <div><p className="text- font-black tracking-wide opacity-50 ml-4 mb-2">STORE SLUG</p><div className="h- rounded-full bg-[#F5F5F5] flex items-center px-1.5 focus-within:ring-2 focus-within:ring-black focus-within:bg-white transition"><span className="h- bg-black text-white px-4 rounded-full flex items-center font-bold text-">/s/</span><input value={slug} onChange={e=>setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-'))} placeholder="ayesha-boutique" className="flex-1 bg-transparent px-4 text- font-bold outline-none placeholder:text-zinc-400"/></div></div>
                <button onClick={createStore} disabled={saving} className="w-full h- bg-[#00B050] hover:bg-[#009645] text-white rounded-full font-black text- tracking-wide transition active:scale-[0.98]">{saving?'Saving...':'Save Store →'}</button>
              </div>
            </div>

            <div className="bg-white text-black rounded- p-6 md:p-7">
              <div className="flex items-center gap-3"><div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-black text-">2</div><p className="font-black text-">Add Product</p></div>
              <div className="mt-6 space-y-4">
                <label className="group w-full h- rounded- bg-[#F5F5F5] hover:bg-[#EDEDED] border-2 border-dashed border-zinc-300 hover:border-black flex flex-col items-center justify-center cursor-pointer transition relative overflow-hidden">
                  <input type="file" accept="image/*" onChange={(e)=>handleImg(e,false)} className="hidden"/>
                  {preview ? <><img src={preview} className="w-full h-full object-cover"/><div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-black text- rounded-">Tap to change</div></> : <><div className="w-14 h-14 bg-white rounded-full shadow flex items-center justify-center text- group-hover:scale-110 transition">📸</div><p className="font-black text- mt-3">Upload Photo</p><p className="text- font-bold opacity-40 mt-1">Premium quality, up to 5MB</p></>}
                </label>
                <input value={pName} onChange={e=>setPName(e.target.value)} placeholder="Product name" className="w-full h- rounded-full bg-[#F5F5F5] border-0 px-6 text- font-bold text-black placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-black focus:bg-white transition"/>
                <input value={pPrice} onChange={e=>setPPrice(e.target.value)} type="number" placeholder="Price Rs." className="w-full h- rounded-full bg-[#F5F5F5] border-0 px-6 text- font-bold text-black placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-black focus:bg-white transition"/>
                <button onClick={addProduct} disabled={saving} className="w-full h- bg-black hover:bg-zinc-900 text-white rounded-full font-black text- tracking-wide transition active:scale-[0.98]">{saving?'Adding...':'+ Add Product'}</button>
              </div>
            </div>
          </div>

          {/* RIGHT - PRODUCTS */}
          <div className="bg-white text-black rounded- p-6 md:p-7 min-h-">
            <div className="flex items-center justify-between"><p className="font-black text-">Your Products — {products.length}</p><span className="h-8 px-4 bg-black text-white rounded-full text- font-black flex items-center">LIVE STORE</span></div>
            {products.length===0 ? <div className="mt-10 h- rounded- bg-[#F5F5F5] border-2 border-dashed flex flex-col items-center justify-center"><p className="text-4xl">🛍️</p><p className="font-black text- mt-3">No products yet</p><p className="text- opacity-40 font-bold">Add your first product</p></div> :
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
                {products.map(p=>(
                  <div key={p.id} className="group bg-[#F9F9F8] rounded- p-2 hover:bg-white hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)] hover:scale-[1.02] transition-all duration-300">
                    <div className="aspect-square rounded- overflow-hidden bg-white relative"><img src={p.image_url} className="w-full h-full object-cover"/><div className="absolute top-2 right-2 flex gap-1.5"><button onClick={()=>openEdit(p)} className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-">✎</button><button onClick={()=>del(p.id)} className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-">🗑</button></div></div>
                    <div className="px-3 py-3"><p className="font-bold text- leading-tight truncate">{p.name}</p><div className="mt-2 flex items-center justify-between"><span className="text-[#00B050] font-black text-">Rs. {Number(p.price).toLocaleString()}</span><span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-">→</span></div></div>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      </main>

      {editProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={()=>setEditProd(null)}/>
          <div className="relative w-full max-w- bg-white rounded- p-7 text-black animate-[up_0.3s]">
            <h3 className="font-black text-">Edit Product</h3>
            <div className="mt-5 space-y-3">
              <label className="block h- rounded- overflow-hidden cursor-pointer bg-[#F5F5F5] border-2 border-dashed"><input type="file" accept="image/*" onChange={(e)=>handleImg(e,true)} className="hidden"/>{editPreview ? <img src={editPreview} className="w-full h-full object-cover"/> : <div className="h-full flex items-center justify-center font-black text-">Upload new photo</div>}</label>
              <input value={editName} onChange={e=>setEditName(e.target.value)} className="w-full h- rounded-full bg-[#F5F5F5] px-6 text- font-bold outline-none focus:ring-2 focus:ring-black"/>
              <input value={editPrice} onChange={e=>setEditPrice(e.target.value)} type="number" className="w-full h- rounded-full bg-[#F5F5F5] px-6 text- font-bold outline-none focus:ring-2 focus:ring-black"/>
              <div className="grid grid-cols-2 gap-3 pt-2"><button onClick={()=>setEditProd(null)} className="h- rounded-full border-2 font-black text-">Cancel</button><button onClick={saveEdit} className="h- rounded-full bg-black text-white font-black text-">{saving?'Saving...':'Save →'}</button></div>
            </div>
          </div>
        </div>
      )}
      {msg && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full text- font-black shadow-[0_10px_40px_rgba(0,0,0,0.3)] z-[100]">{msg}</div>}
      <style>{`@keyframes up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
