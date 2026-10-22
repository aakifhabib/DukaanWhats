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
    const r = new FileReader(); r.onload = () => isEdit ? setEditPreview(r.result as string) : setPreview(r.result as string); r.readAsDataURL(file);
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
    if (!pName || !pPrice) return toast('Name & price required'); if (!slug) return toast('Save store first');
    setSaving(true); try {
      let url = ''; if (pImage) url = await upload(pImage);
      const { data } = await supabase.from('products').insert({ user_id: userId, name: pName, price: parseInt(pPrice), image_url: url }).select().single();
      setProducts([data, ...products]); setPName(''); setPPrice(''); setPImage(null); setPreview(''); toast('Added ✓');
    } catch (e: any) { toast(e.message); } setSaving(false);
  }
  async function del(id: string) { if (!confirm('Delete product?')) return; await supabase.from('products').delete().eq('id', id); setProducts(products.filter(p=>p.id!==id)); }
  function openEdit(p: any) { setEditProd(p); setEditName(p.name); setEditPrice(String(p.price)); setEditPreview(p.image_url); }
  async function saveEdit() {
    setSaving(true); try {
      let url = editProd.image_url; if (editImage) url = await upload(editImage);
      const { data } = await supabase.from('products').update({ name: editName, price: parseInt(editPrice), image_url: url }).eq('id', editProd.id).select().single();
      setProducts(products.map(p=>p.id===editProd.id?data:p)); setEditProd(null); toast('Updated ✓');
    } catch (e: any) { toast(e.message); } setSaving(false);
  }

  if (loading) return <div className="min-h-screen bg-[#FFFEFB] flex items-center justify-center"><div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-[#FFFEFB] text-[#111]">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w- mx-auto px-5 h- flex justify-between items-center">
          <div className="flex items-center gap-3"><div className="w- h- bg-[#111] text-white rounded-full flex items-center justify-center font-black text-">D</div><span className="font-extrabold text- tracking-tight">DukaanWhats.pk</span></div>
          <div className="flex items-center gap-2">{slug && <Link href={`/s/${slug}`} target="_blank" className="h- px-5 bg-[#111] text-white rounded-full font-bold text-[12.5px] flex items-center gap-1 hover:bg-black transition">View Store ↗</Link>}<button onClick={async()=>{await supabase.auth.signOut(); router.push('/login');}} className="w- h- bg-[#F2F1EF] hover:bg-black hover:text-white rounded-full transition flex items-center justify-center">↗</button></div>
        </div>
      </header>

      <main className="max-w- mx-auto px-4 md:px-6 py-5">
        {/* STATS - CLEAN WHITE CARDS */}
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <div className="bg-white border border-black/[0.06] rounded- p-4 md:p-5"><p className="text- font-extrabold tracking-widest text-black/40">PRODUCTS</p><p className="text- md:text- font-black tracking-tight mt-1">{products.length}</p></div>
          <div className="bg-white border border-black/[0.06] rounded- p-4 md:p-5"><p className="text- font-extrabold tracking-widest text-black/40">TOTAL VALUE</p><p className="text- md:text- font-black tracking-tight mt-1">Rs. {products.reduce((s,p)=>s+Number(p.price),0).toLocaleString()}</p></div>
          <div className="bg-[#111] text-white rounded- p-4 md:p-5 flex flex-col justify-between"><p className="text- font-extrabold tracking-widest text-white/50">STORE LINK</p><p className="text- md:text- font-bold truncate mt-1">/s/{slug || 'your-store'}</p></div>
        </div>

        <div className="grid lg:grid-cols-[400px_1fr] gap-4 mt-4 items-start">
          <div className="space-y-4">
            {/* STORE IDENTITY - HIGH CONTRAST */}
            <div className="bg-white border border-black/[0.06] rounded- p-6">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><div className="w-7 h-7 bg-[#111] text-white rounded-full flex items-center justify-center font-black text-">1</div><h2 className="font-extrabold text-">Store Identity</h2></div><span className="text- font-bold bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/10 px-3 py-1 rounded-full">AUTO-SAVED</span></div>
              
              <div className="mt-6 space-y-4">
                <div><label className="text- font-extrabold tracking-wide text-black/60 ml-1">BUSINESS NAME</label><input value={business} onChange={e=>setBusiness(e.target.value)} placeholder="Ayesha Boutique" className="mt-1.5 w-full h- rounded-full bg-white border border-black/10 px-5 text- font-semibold text-black placeholder:text-black/30 outline-none focus:border-black focus:ring- focus:ring-black/5 transition"/></div>
                <div><label className="text- font-extrabold tracking-wide text-black/60 ml-1">WHATSAPP NUMBER</label><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="923001234567" className="mt-1.5 w-full h- rounded-full bg-white border border-black/10 px-5 text- font-semibold text-black placeholder:text-black/30 outline-none focus:border-black focus:ring- focus:ring-black/5 transition"/></div>
                <div><label className="text- font-extrabold tracking-wide text-black/60 ml-1">STORE SLUG</label><div className="mt-1.5 h- rounded-full bg-white border border-black/10 flex items-center px-1.5 focus-within:border-black focus-within:ring- focus-within:ring-black/5 transition"><span className="h- px-4 bg-[#111] text-white rounded-full flex items-center font-bold text-">/s/</span><input value={slug} onChange={e=>setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-'))} placeholder="ayesha-boutique" className="flex-1 bg-transparent px-3 text- font-semibold text-black placeholder:text-black/30 outline-none"/></div></div>
                
                {/* BUTTON - 100% ROUNDED FULL, NO CORNERS */}
                <button onClick={createStore} disabled={saving} className="w-full h- rounded-full bg-[#111] hover:bg-black text-white font-bold text- tracking-wide transition-all active:scale-[0.98] disabled:opacity-50">{saving?'Saving...':'Save Store →'}</button>
              </div>
            </div>

            <div className="bg-white border border-black/[0.06] rounded- p-6">
              <div className="flex items-center gap-2.5"><div className="w-7 h-7 bg-[#111] text-white rounded-full flex items-center justify-center font-black text-">2</div><h2 className="font-extrabold text-">Add Product</h2></div>
              
              <div className="mt-6 space-y-4">
                <label className="group block w-full h- rounded- bg-[#FAF9F7] border-[1.5px] border-dashed border-black/15 hover:border-black hover:bg-white cursor-pointer transition overflow-hidden relative">
                  <input type="file" accept="image/*" onChange={(e)=>handleImg(e,false)} className="hidden"/>
                  {preview ? <><img src={preview} className="w-full h-full object-cover"/><div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-">Tap to change photo</div></> : 
                  <div className="h-full flex flex-col items-center justify-center"><div className="w-12 h-12 bg-white border border-black/5 rounded-full shadow-sm flex items-center justify-center text- group-hover:scale-105 transition">📸</div><p className="font-bold text- mt-2.5 text-black">Upload Product Photo</p><p className="text- font-medium text-black/40 mt-0.5">PNG, JPG up to 5MB</p></div>}
                </label>

                <input value={pName} onChange={e=>setPName(e.target.value)} placeholder="Product name e.g. Premium Lawn Suit" className="w-full h- rounded-full bg-white border border-black/10 px-5 text- font-semibold text-black placeholder:text-black/30 outline-none focus:border-black focus:ring- focus:ring-black/5 transition"/>
                <input value={pPrice} onChange={e=>setPPrice(e.target.value)} type="number" placeholder="Price — e.g. 2500" className="w-full h- rounded-full bg-white border border-black/10 px-5 text- font-semibold text-black placeholder:text-black/30 outline-none focus:border-black focus:ring- focus:ring-black/5 transition"/>
                
                {/* BUTTON - 100% ROUNDED FULL */}
                <button onClick={addProduct} disabled={saving} className="w-full h- rounded-full bg-[#111] hover:bg-black text-white font-bold text- transition-all active:scale-[0.98] disabled:opacity-50">{saving?'Adding...':'+ Add Product'}</button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-black/[0.06] rounded- p-6 min-h-">
            <div className="flex items-center justify-between"><h2 className="font-extrabold text-">Your Products — {products.length}</h2><span className="h-7 px-3.5 bg-[#F2F1EF] rounded-full text- font-bold flex items-center">LIVE</span></div>
            {products.length===0 ? <div className="mt-8 h- rounded- bg-[#FAF9F7] border border-dashed border-black/10 flex flex-col items-center justify-center"><div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text- border">🛍️</div><p className="font-bold text- mt-3">No products yet</p><p className="text- text-black/40 font-medium mt-1">Your products will appear here</p></div> :
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
                {products.map(p=>(
                  <div key={p.id} className="group bg-[#FAF9F7] hover:bg-white border border-transparent hover:border-black/10 rounded- p-2.5 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-">
                    <div className="aspect-square rounded- overflow-hidden bg-white relative"><img src={p.image_url} className="w-full h-full object-cover"/><div className="absolute top-2 right-2 flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"><button onClick={()=>openEdit(p)} className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text- hover:bg-black hover:text-white">✎</button><button onClick={()=>del(p.id)} className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text- hover:bg-red-500 hover:text-white">✕</button></div></div>
                    <div className="px-1 pt-3 pb-1"><p className="font-semibold text- leading-tight truncate">{p.name}</p><p className="font-black text- mt-1">Rs. {Number(p.price).toLocaleString()}</p></div>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      </main>

      {editProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={()=>setEditProd(null)}/>
          <div className="relative w-full max-w- bg-white rounded- p-6 shadow-2xl">
            <h3 className="font-extrabold text-">Edit Product</h3>
            <div className="mt-5 space-y-3">
              <label className="block h- rounded- overflow-hidden cursor-pointer bg-[#FAF9F7] border border-dashed border-black/15"><input type="file" accept="image/*" onChange={(e)=>handleImg(e,true)} className="hidden"/>{editPreview ? <img src={editPreview} className="w-full h-full object-cover"/> : <div className="h-full flex items-center justify-center font-bold text- text-black/40">Upload new photo</div>}</label>
              <input value={editName} onChange={e=>setEditName(e.target.value)} className="w-full h- rounded-full bg-white border border-black/10 px-5 text- font-semibold outline-none focus:border-black"/>
              <input value={editPrice} onChange={e=>setEditPrice(e.target.value)} type="number" className="w-full h- rounded-full bg-white border border-black/10 px-5 text- font-semibold outline-none focus:border-black"/>
              <div className="grid grid-cols-2 gap-2 pt-2"><button onClick={()=>setEditProd(null)} className="h- rounded-full bg-[#F2F1EF] font-bold text-">Cancel</button><button onClick={saveEdit} className="h- rounded-full bg-[#111] text-white font-bold text-">{saving?'Saving...':'Save Changes'}</button></div>
            </div>
          </div>
        </div>
      )}
      {msg && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#111] text-white px-6 py-3 rounded-full text- font-bold shadow-xl z-[100]">{msg}</div>}
    </div>
  );
}
