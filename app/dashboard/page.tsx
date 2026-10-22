'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [userChecked, setUserChecked] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const [business, setBusiness] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [slug, setSlug] = useState('');
  const [profileId, setProfileId] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pImage, setPImage] = useState<File | null>(null);
  const [easypaisaNum, setEasypaisaNum] = useState('');
  const [easypaisaName, setEasypaisaName] = useState('');
  const [payCod, setPayCod] = useState(true);
  const [payEasypaisa, setPayEasypaisa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/login');
      } else {
        setUserChecked(true);
        setUserEmail(data.session.user.email || '');
        const savedId = localStorage.getItem('dw_profileId');
        const savedBusiness = localStorage.getItem('dw_business');
        const savedWa = localStorage.getItem('dw_whatsapp');
        const savedSlug = localStorage.getItem('dw_slug');
        if (savedId) setProfileId(savedId);
        if (savedBusiness) setBusiness(savedBusiness);
        if (savedWa) setWhatsapp(savedWa);
        if (savedSlug) setSlug(savedSlug);
        if (savedId) loadProducts(savedId);
      }
    }
    checkUser();
  }, [router]);

  async function loadProducts(pid: string) {
    const { data } = await supabase.from('products').select('*').eq('user_id', pid).order('created_at', { ascending: false });
    if (data) setProducts(data);
  }

  async function createStore() {
    if (!business || !whatsapp || !slug) return setMsg('Fill all fields');
    if (!whatsapp.match(/^923[0-9]{9}$/)) return setMsg('WhatsApp must be 923001234567 format');
    if (!slug.match(/^[a-z0-9-]+$/)) return setMsg('Slug only lowercase a-z 0-9 and -');
    setLoading(true); setMsg('');
    const { data: exists } = await supabase.from('profiles').select('id').eq('store_slug', slug).maybeSingle();
    if (exists && exists.id !== profileId) { setLoading(false); return setMsg('Slug taken! Try ' + slug + '-shop'); }
    
    const { data: userData } = await supabase.auth.getUser();
    const payload: any = { 
      business_name: business, 
      whatsapp_number: whatsapp, 
      store_slug: slug,
      payment_cod: payCod,
      payment_easypaisa: payEasypaisa,
      easypaisa_number: easypaisaNum,
      easypaisa_name: easypaisaName,
      owner_email: userEmail,
      auth_user_id: userData.user?.id
    };

    let result;
    if (profileId) {
      result = await supabase.from('profiles').update(payload).eq('id', profileId).select().single();
    } else {
      result = await supabase.from('profiles').insert(payload).select().single();
    }

    if (result.error) { setMsg(result.error.message); setLoading(false); return; }
    setProfileId(result.data.id);
    localStorage.setItem('dw_profileId', result.data.id);
    localStorage.setItem('dw_business', business);
    localStorage.setItem('dw_whatsapp', whatsapp);
    localStorage.setItem('dw_slug', slug);
    setMsg('Store Saved! Link: /s/' + slug);
    setLoading(false);
  }

  async function updatePayments() {
    if (!profileId) return setMsg('Create store first');
    setLoading(true);
    const { error } = await supabase.from('profiles').update({
      payment_cod: payCod,
      payment_easypaisa: payEasypaisa,
      easypaisa_number: easypaisaNum,
      easypaisa_name: easypaisaName
    }).eq('id', profileId);
    if (error) setMsg(error.message); else setMsg('Payment settings saved!');
    setLoading(false);
  }

  async function addProduct() {
    if (!pName || !pPrice) return setMsg('Enter name and price');
    if (!profileId) return setMsg('Create store first');
    setLoading(true);
    let imageUrl = '';
    if (pImage) {
      const fileName = Date.now() + '-' + pImage.name.replace(/[^a-zA-Z0-9.]/g,'-');
      const { error: upError } = await supabase.storage.from('product-images').upload(fileName, pImage);
      if (upError) { setMsg(upError.message); setLoading(false); return; }
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }
    const { data, error } = await supabase.from('products').insert({ user_id: profileId, name: pName, price: parseInt(pPrice), image_url: imageUrl }).select().single();
    if (error) setMsg(error.message);
    else { setProducts([data, ...products]); setPName(''); setPPrice(''); setPImage(null); setMsg('Product added!'); }
    setLoading(false);
  }

  async function deleteProduct(id: string) {
    await supabase.from('products').delete().eq('id', id);
    setProducts(products.filter(p => p.id !== id));
  }

  if (!userChecked) return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><div className="bg-white p-6 rounded-2xl shadow text-sm">Checking login... If stuck, go to /login</div></div>;

  return (
    <div className="min-h-screen bg-zinc-50 p-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-black">DukaanWhats.pk</h1>
        <button onClick={async()=>{ await supabase.auth.signOut(); localStorage.clear(); router.push('/login'); }} className="text- bg-white border px-3 py-1 rounded-full">Logout {userEmail.slice(0,6)}</button>
      </div>
      <p className="text-xs text-zinc-500 mb-4">Logged in as: {userEmail}</p>

      <div className="bg-white rounded-2xl p-4 shadow mb-4">
        <h2 className="font-bold mb-2">1. Your Store Info</h2>
        <input placeholder="Business Name e.g. Ayesha Boutique" value={business} onChange={e=>setBusiness(e.target.value)} className="w-full border p-3 rounded-xl mb-2 text-sm"/>
        <input placeholder="WhatsApp 923001234567" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} className="w-full border p-3 rounded-xl mb-2 text-sm"/>
        <input placeholder="Store Slug e.g. ayesha-boutique" value={slug} onChange={e=>setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-'))} className="w-full border p-3 rounded-xl mb-2 text-sm"/>
        <button onClick={createStore} disabled={loading} className="w-full bg-[#00B050] text-white py-3 rounded-full font-bold text-sm">{loading?'Saving...':'Save Store'}</button>
        {profileId && <div className="mt-3 text-xs bg-green-50 p-3 rounded-xl border border-green-200"><div className="font-bold">Your Live Link:</div><a href={`/s/${slug}`} className="text-[#00B050] underline font-bold break-all">/s/{slug}</a></div>}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow mb-4">
        <h2 className="font-bold mb-2">2. Payments (FREE)</h2>
        <label className="flex items-center gap-2 text-sm mb-3 p-2 border rounded-xl"><input type="checkbox" checked={payCod} onChange={e=>setPayCod(e.target.checked)} className="w-4 h-4"/> Cash on Delivery (COD)</label>
        <label className="flex items-center gap-2 text-sm mb-3 p-2 border rounded-xl"><input type="checkbox" checked={payEasypaisa} onChange={e=>setPayEasypaisa(e.target.checked)} className="w-4 h-4"/> Easypaisa / 【entity-JazzCash¦canonical_name=JazzCash】</label>
        {payEasypaisa && (
          <>
            <input placeholder="Account Title e.g. AAKIF HABIB" value={easypaisaName} onChange={e=>setEasypaisaName(e.target.value)} className="w-full border p-3 rounded-xl mb-2 text-sm"/>
            <input placeholder="Easypaisa Number 92300XXXXXXX" value={easypaisaNum} onChange={e=>setEasypaisaNum(e.target.value)} className="w-full border p-3 rounded-xl mb-2 text-sm"/>
          </>
        )}
        <button onClick={updatePayments} disabled={loading} className="w-full bg-zinc-900 text-white py-2 rounded-full font-bold text-sm">Save Payment Settings</button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow mb-4">
        <h2 className="font-bold mb-2">3. Add Product</h2>
        <input placeholder="Product Name" value={pName} onChange={e=>setPName(e.target.value)} className="w-full border p-3 rounded-xl mb-2 text-sm"/>
        <input placeholder="Price Rs." type="number" value={pPrice} onChange={e=>setPPrice(e.target.value)} className="w-full border p-3 rounded-xl mb-2 text-sm"/>
        <input type="file" accept="image/*" onChange={e=>setPImage(e.target.files?.[0]||null)} className="w-full text-xs mb-2 border p-2 rounded-xl"/>
        <button onClick={addProduct} disabled={loading} className="w-full bg-zinc-900 text-white py-3 rounded-full font-bold text-sm">+ Add Product</button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow">
        <h2 className="font-bold mb-2">Your Products ({products.length})</h2>
        {products.length===0 && <p className="text-xs text-zinc-400">No products yet.</p>}
        {products.map(p=>(
          <div key={p.id} className="flex gap-3 border-b py-3 items-center">
            {p.image_url? <img src={p.image_url} className="w-14 h-14 rounded-xl object-cover"/> : <div className="w-14 h-14 bg-zinc-100 rounded-xl flex items-center justify-center">👗</div>}
            <div className="flex-1"><div className="font-bold text-sm">{p.name}</div><div className="text-[#00B050] text-sm font-bold">Rs. {p.price}</div></div>
            <button onClick={()=>deleteProduct(p.id)} className="text-red-500 text-xs font-bold px-2">Delete</button>
          </div>
        ))}
      </div>

      {msg && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-5 py-3 rounded-full text-xs font-bold shadow-lg z-50 max-w-[90%] text-center">{msg}</div>}
    </div>
  );
}