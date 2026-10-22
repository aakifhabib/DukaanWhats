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
      const user = session.user;
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

  const handleImg = (e: any, isEdit=false) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); 
    reader.onload = () => isEdit ? setEditPreview(reader.result as string) : setPreview(reader.result as string);
    reader.readAsDataURL(file);
    isEdit ? setEditImage(file) : setPImage(file);
  };

  const toast = (t: string) => { setMsg(t); setTimeout(()=>setMsg(''), 3000); }

  async function createStore() {
    if (!business || !whatsapp || !slug) return toast('Fill all fields');
    setSaving(true);
    const { data: exists } = await supabase.from('profiles').select('id').eq('store_slug', slug).neq('id', userId).maybeSingle();
    if (exists) { setSaving(false); return toast('Slug already taken'); }
    const { error } = await supabase.from('profiles').upsert({ id: userId, business_name: business, whatsapp_number: whatsapp, store_slug: slug }, { onConflict: 'id' });
    toast(error ? error.message : '✅ Store saved!');
    setSaving(false);
  }

  async function upload(file: File) {
    const name = `${userId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('product-images').upload(name, file);
    if (error) throw error;
    return supabase.storage.from('product-images').getPublicUrl(name).data.publicUrl;
  }

  async function addProduct() {
    if (!pName || !pPrice) return toast('Enter name & price');
    if (!slug) return toast('Save store first');
    setSaving(true);
    try {
      let url = '';
      if (pImage) url = await upload(pImage);
      const { data } = await supabase.from('products').insert({ user_id: userId, name: pName, price: parseInt(pPrice), image_url: url }).select().single();
      setProducts([data, ...products]); setPName(''); setPPrice(''); setPImage(null); setPreview(''); toast('Product added');
    } catch (e: any) { toast(e.message); }
    setSaving(false);
  }

  async function del(id: string) {
    if (!confirm('Delete?')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(products.filter(p=>p.id!==id));
  }

  function openEdit(p: any) { setEditProd(p); setEditName(p.name); setEditPrice(String(p.price)); setEditPreview(p.image_url); }
  
  async function saveEdit() {
    setSaving(true);
    try {
      let url = editProd.image_url;
      if (editImage) url = await upload(editImage);
      const { data } = await supabase.from('products').update({ name: editName, price: parseInt(editPrice), image_url: url }).eq('id', editProd.id).select().single();
      setProducts(products.map(p=>p.id===editProd.id?data:p)); setEditProd(null); toast('Updated');
    } catch (e: any) { toast(e.message); }
    setSaving(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F6F5F2]"><div className="w-8 h-8 border-2 border-black/10 border-t-black rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-[#F6F5F2] text-zinc-900">
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w- mx-auto px-4 h- flex justify-between items-center">
          <div className="flex items-center gap-2.5"><div className="w-8 h-8 bg-black text-white rounded- flex items-center justify-center font-black">D</div><b className="text- tracking-tight">DukaanWhats.pk</b></div>
          <div className="flex gap-2">{slug && <Link href={`/s/${slug}`} target="_blank" className="h-8 px-3.5 bg-zinc-900 text-white rounded-full text- font-bold flex items-center">View Store ↗</Link>}<button onClick={async()=>{await supabase.auth.signOut(); router.push('/login');}} className="h-8 w-8 bg-zinc-100 rounded-full">↪</button></div>
        </div>
      </header>

      <main className="max-w- mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-white border rounded- p-4 flex justify-between items-center"><div><p className="text- font-black tracking-widest opacity-40">PRODUCTS</p><p className="text- font-black">{products.length}</p></div><div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center">📦</div></div>
          <div className="bg-white border rounded- p-4 flex justify-between items-center"><div><p className="text- font-black tracking-widest opacity-40">TOTAL VALUE</p><p className="text- font-black">Rs. {products.reduce((s,p)=>s+Number(p.price),0).toLocaleString()}</p></div><div className="w-10 h-10 bg-[#00B050]/10 rounded-full flex items-center justify-center">💰</div></div>
          <div className="bg-black text-white rounded- p-4"><p className="text- font-black tracking-widest opacity-40">STORE LINK</p><p className="text- font-bold mt-1 truncate">dukaan-whats.vercel.app/s/{slug || 'your-slug'}</p></div>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-4 items-start">
          <div className="space-y-4">
            <div className="bg-white rounded- border p-5">
              <h2 className="font-black text- flex items-center gap-2"><span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-">1</span> Store Identity</h2>
              <div className="mt-5 space-y-3">
                <div><p className="text- font-bold opacity-60 mb-1.5">BUSINESS NAME</p><input value={business} onChange={e=>setBusiness(e.target.value)} placeholder="Ayesha Boutique" className="w-full h- bg-white border-2 border-zinc-200 rounded-xl px-4 text- font-medium outline-none focus:border-black"/></div>
                <div><p className="text- font-bold opacity-60 mb-1.5">WHATSAPP NUMBER</p><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="923001234567" className="w-full h- bg-white border-2 border-zinc-200 rounded-xl px-4 text- font-medium outline-none focus:border-black"/></div>
                <div><p className="text- font-bold opacity-60 mb-1.5">STORE SLUG</p><div className="flex h-"><span className="bg-black text-white px-4 flex items-center rounded-l-xl text- font-bold">/s/</span><input value={slug} onChange={e=>setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-'))} placeholder="ayesha-boutique" className="flex-1 bg-white border-y-2 border-r-2 border-zinc-200 rounded-r-xl px-4 text- font-medium outline-none focus:border-black"/></div></div>
                <button onClick={createStore} disabled={saving} className="w-full h- bg-[#00B050] hover:bg-[#00a048] text-white rounded-full font-black text- mt-2">{saving?'Saving...':'Save Store →'}</button>
              </div>
            </div>

            <div className="bg-white rounded- border p-5">
              <h2 className="font-black text- flex items-center gap-2"><span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-">2</span> Add Product</h2>
              <div className="mt-5 space-y-3">
                <label className="w-full h- border-2 border-dashed border-zinc-300 rounded- flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-zinc-50 transition overflow-hidden relative bg-zinc-50">
                  <input type="file" accept="image/*" onChange={(e)=>handleImg(e,false)} className="hidden"/>
                  {preview ? <><img src={preview} className="w-full h-full object-cover"/><div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-">Tap to change</div></> : <><div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow text-lg">📸</div><p className="font-bold text- mt-2">Upload Product Photo</p><p className="text- opacity-50">Max 5MB</p></>}
                </label>
                <input value={pName} onChange={e=>setPName(e.target.value)} placeholder="Product name" className="w-full h- bg-white border-2 border-zinc-200 rounded-xl px-4 text- font-medium outline-none focus:border-black"/>
                <input value={pPrice} onChange={e=>setPPrice(e.target.value)} type="number" placeholder="Price Rs." className="w-full h- bg-white border-2 border-zinc-200 rounded-xl px-4 text- font-medium outline-none focus:border-black"/>
                <button onClick={addProduct} disabled={saving} className="w-full h- bg-black text-white rounded-full font-black text-">{saving?'Adding...':'+ Add Product'}</button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded- border p-5 min-h-">
            <h2 className="font-black text- mb-4">Your Products — {products.length}</h2>
            {products.length===0 ? <div className="border-2 border-dashed rounded- py-20 text-center opacity-50"><p className="text-3xl">🛍️</p><p className="font-bold text- mt-2">No products yet</p></div> :
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {products.map(p=>(
                  <div key={p.id} className="border-2 border-zinc-100 rounded- p-2 group hover:border-black transition">
                    <div className="aspect-square rounded- overflow-hidden bg-zinc-50 relative"><img src={p.image_url} className="w-full h-full object-cover"/><div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 transition"><button onClick={()=>openEdit(p)} className="w-7 h-7 bg-white rounded-full shadow text-">✎</button><button onClick={()=>del(p.id)} className="w-7 h-7 bg-white rounded-full shadow text-">🗑</button></div></div>
                    <div className="p-2"><p className="font-bold text- truncate">{p.name}</p><p className="text-[#00B050] font-black text-">Rs. {Number(p.price).toLocaleString()}</p></div>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      </main>

      {editProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={()=>setEditProd(null)}/>
          <div className="relative w-full max-w- bg-white rounded- p-5">
            <h3 className="font-black">Edit Product</h3>
            <div className="mt-4 space-y-3">
              <label className="block h- border-2 border-dashed rounded-xl overflow-hidden cursor-pointer bg-zinc-50"><input type="file" accept="image/*" onChange={(e)=>handleImg(e,true)} className="hidden"/>{editPreview ? <img src={editPreview} className="w-full h-full object-cover"/> : <div className="h-full flex items-center justify-center font-bold text-xs">Upload new photo</div>}</label>
              <input value={editName} onChange={e=>setEditName(e.target.value)} className="w-full h- border-2 rounded-xl px-4 text-"/>
              <input value={editPrice} onChange={e=>setEditPrice(e.target.value)} type="number" className="w-full h- border-2 rounded-xl px-4 text-"/>
              <div className="grid grid-cols-2 gap-2"><button onClick={()=>setEditProd(null)} className="h- border-2 rounded-full font-bold text-">Cancel</button><button onClick={saveEdit} className="h- bg-black text-white rounded-full font-bold text-">{saving?'Saving...':'Save'}</button></div>
            </div>
          </div>
        </div>
      )}

      {msg && <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-2.5 rounded-full text- font-bold z-[100]">{msg}</div>}
    </div>
  );
}
