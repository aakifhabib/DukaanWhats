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
    toast(error ? error.message : 'Store saved'); setSaving(false);
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
      setProducts([data, ...products]); setPName(''); setPPrice(''); setPImage(null); setPreview(''); toast('Product added');
    } catch (e: any) { toast(e.message); } setSaving(false);
  }
  async function del(id: string) { if (!confirm('Delete?')) return; await supabase.from('products').delete().eq('id', id); setProducts(products.filter(p=>p.id!==id)); }
  function openEdit(p: any) { setEditProd(p); setEditName(p.name); setEditPrice(String(p.price)); setEditPreview(p.image_url); }
  async function saveEdit() {
    setSaving(true); try {
      let url = editProd.image_url; if (editImage) url = await upload(editImage);
      const { data } = await supabase.from('products').update({ name: editName, price: parseInt(editPrice), image_url: url }).eq('id', editProd.id).select().single();
      setProducts(products.map(p=>p.id===editProd.id?data:p)); setEditProd(null); toast('Updated');
    } catch (e: any) { toast(e.message); } setSaving(false);
  }

  if (loading) return <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center"><div className="w-7 h-7 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-zinc-900">
      <header className="bg-white border-b border-zinc-200/80 sticky top-0 z-20">
        <div className="max-w- mx-auto px-5 h- flex justify-between items-center">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-zinc-900 text-white rounded- flex items-center justify-center font-bold text-">D</div><span className="font-bold text- tracking-tight">DukaanWhats.pk</span></div>
          <div className="flex items-center gap-2.5">{slug && <Link href={`/s/${slug}`} target="_blank" className="h-9 px-4 bg-zinc-900 text-white rounded- text- font-medium flex items-center hover:bg-black transition">View Store</Link>}<button onClick={async()=>{await supabase.auth.signOut(); router.push('/login');}} className="h-9 w-9 bg-zinc-100 hover:bg-zinc-200 rounded- flex items-center justify-center transition">↗</button></div>
        </div>
      </header>

      <main className="max-w- mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-zinc-200 rounded- p-4"><p className="text- font-semibold tracking-wide text-zinc-400 uppercase">Products</p><p className="text- font-bold tracking-tight mt-1">{products.length}</p></div>
          <div className="bg-white border border-zinc-200 rounded- p-4"><p className="text- font-semibold tracking-wide text-zinc-400 uppercase">Total Value</p><p className="text- font-bold tracking-tight mt-1">Rs. {products.reduce((s,p)=>s+Number(p.price),0).toLocaleString()}</p></div>
          <div className="bg-zinc-900 text-white rounded- p-4"><p className="text- font-semibold tracking-wide text-white/50 uppercase">Store Link</p><p className="text- font-medium truncate mt-1">/s/{slug || '...'}</p></div>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-5 mt-5 items-start">
          <div className="space-y-5">
            <div className="bg-white border border-zinc-200 rounded- shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="p-6 pb-4 border-b border-zinc-100 flex items-center justify-between"><h2 className="font-semibold text-">Store Identity</h2><span className="text- font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200">Saved</span></div>
              <div className="p-6 space-y-4">
                <div><label className="text- font-medium text-zinc-600">Business Name</label><input value={business} onChange={e=>setBusiness(e.target.value)} placeholder="Ayesha Boutique" className="mt-1.5 w-full h- rounded- bg-zinc-50 border border-zinc-200 px-4 text- font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"/></div>
                <div><label className="text- font-medium text-zinc-600">WhatsApp Number</label><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="923001234567" className="mt-1.5 w-full h- rounded- bg-zinc-50 border border-zinc-200 px-4 text- font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"/></div>
                <div><label className="text- font-medium text-zinc-600">Store Slug</label><div className="mt-1.5 h- rounded- bg-zinc-50 border border-zinc-200 flex items-center pl-3 pr-1 focus-within:bg-white focus-within:border-zinc-900 focus-within:ring-1 focus-within:ring-zinc-900 transition"><span className="text- font-medium text-zinc-500 mr-1">/s/</span><input value={slug} onChange={e=>setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-'))} placeholder="ayesha-boutique" className="flex-1 bg-transparent text- font-medium outline-none placeholder:text-zinc-400"/></div></div>
                <div className="pt-2 flex justify-end"><button onClick={createStore} disabled={saving} className="h- px-5 bg-zinc-900 hover:bg-black text-white rounded- text- font-medium transition disabled:opacity-50">{saving?'Saving...':'Save Store'}</button></div>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded- shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="p-6 pb-4 border-b border-zinc-100"><h2 className="font-semibold text-">Add Product</h2></div>
              <div className="p-6 space-y-4">
                <label className="block w-full h- rounded- bg-zinc-50 border border-dashed border-zinc-300 hover:border-zinc-900 hover:bg-white cursor-pointer transition flex flex-col items-center justify-center group">
                  <input type="file" accept="image/*" onChange={(e)=>handleImg(e,false)} className="hidden"/>
                  {preview ? <img src={preview} className="w-full h-full object-cover rounded-"/> : <><div className="w-10 h-10 bg-white border border-zinc-200 rounded- flex items-center justify-center text- group-hover:scale-105 transition">+</div><p className="text- font-medium mt-2">Upload photo</p><p className="text- text-zinc-500">JPG, PNG up to 5MB</p></>}
                </label>
                <input value={pName} onChange={e=>setPName(e.target.value)} placeholder="Product name" className="w-full h- rounded- bg-zinc-50 border border-zinc-200 px-4 text- font-medium outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"/>
                <input value={pPrice} onChange={e=>setPPrice(e.target.value)} type="number" placeholder="Price Rs." className="w-full h- rounded- bg-zinc-50 border border-zinc-200 px-4 text- font-medium outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition"/>
                <div className="flex justify-end"><button onClick={addProduct} disabled={saving} className="h- px-5 bg-zinc-900 hover:bg-black text-white rounded- text- font-medium transition disabled:opacity-50">{saving?'Adding...':'Add Product'}</button></div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded- shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="p-6 flex items-center justify-between border-b border-zinc-100"><h2 className="font-semibold text-">Products — {products.length}</h2></div>
            {products.length===0 ? <div className="p-12 flex flex-col items-center justify-center text-center"><div className="w-12 h-12 bg-zinc-50 rounded- flex items-center justify-center">🛍️</div><p className="font-medium text- mt-3">No products yet</p><p className="text- text-zinc-500">Add your first product to get started</p></div> :
              <div className="p-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                {products.map(p=>(
                  <div key={p.id} className="group border border-zinc-200 rounded- overflow-hidden hover:border-zinc-300 hover:shadow-sm transition">
                    <div className="aspect-square bg-zinc-50 relative"><img src={p.image_url} className="w-full h-full object-cover"/><div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition"><button onClick={()=>openEdit(p)} className="h-7 w-7 bg-white border border-zinc-200 rounded- flex items-center justify-center text- hover:bg-zinc-900 hover:text-white hover:border-zinc-900">✎</button><button onClick={()=>del(p.id)} className="h-7 w-7 bg-white border border-zinc-200 rounded- flex items-center justify-center text- hover:bg-red-500 hover:text-white hover:border-red-500">✕</button></div></div>
                    <div className="p-3"><p className="text- font-medium truncate">{p.name}</p><p className="text- font-semibold mt-0.5">Rs. {Number(p.price).toLocaleString()}</p></div>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      </main>

      {editProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={()=>setEditProd(null)}/>
          <div className="relative w-full max-w- bg-white rounded- p-6 shadow-xl border border-zinc-200">
            <h3 className="font-semibold text-">Edit Product</h3>
            <div className="mt-5 space-y-3">
              <label className="block h- rounded- overflow-hidden cursor-pointer bg-zinc-50 border border-dashed border-zinc-300"><input type="file" accept="image/*" onChange={(e)=>handleImg(e,true)} className="hidden"/>{editPreview ? <img src={editPreview} className="w-full h-full object-cover"/> : <div className="h-full flex items-center justify-center text- text-zinc-500">Upload new photo</div>}</label>
              <input value={editName} onChange={e=>setEditName(e.target.value)} className="w-full h- rounded- bg-zinc-50 border border-zinc-200 px-4 text- font-medium outline-none focus:bg-white focus:border-zinc-900"/>
              <input value={editPrice} onChange={e=>setEditPrice(e.target.value)} type="number" className="w-full h- rounded- bg-zinc-50 border border-zinc-200 px-4 text- font-medium outline-none focus:bg-white focus:border-zinc-900"/>
              <div className="flex justify-end gap-2 pt-2"><button onClick={()=>setEditProd(null)} className="h-10 px-4 bg-zinc-100 hover:bg-zinc-200 rounded- text- font-medium">Cancel</button><button onClick={saveEdit} className="h-10 px-5 bg-zinc-900 text-white rounded- text- font-medium">{saving?'Saving...':'Save'}</button></div>
            </div>
          </div>
        </div>
      )}
      {msg && <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-4 py-2.5 rounded- text- font-medium shadow-lg z-[100]">{msg}</div>}
    </div>
  );
}
