#!/bin/bash
# ONE-COMMAND INSTALLER FOR DukaanWhats - Run this in github.dev Terminal
# Repo: https://github.com/aakifhabib/DukaanWhats

mkdir -p app/dashboard app/s/\[slug\] lib

cat > package.json <<'EOF'
{
  "name": "dukaanwhats",
  "version": "1.0.0",
  "private": true,
  "scripts": { "dev": "next dev", "build": "next build", "start": "next start" },
  "dependencies": { "next": "^14.2.0", "react": "^18.3.0", "react-dom": "^18.3.0", "firebase": "^10.12.0", "zustand": "^4.5.2" },
  "devDependencies": { "typescript": "^5.0.0", "@types/node": "^20.0.0", "@types/react": "^18.0.0", "tailwindcss": "^3.4.0", "postcss": "^8.0.0", "autoprefixer": "^10.4.0" }
}
EOF

cat > next.config.js <<'EOF'
const nextConfig = { images: { domains: ['firebasestorage.googleapis.com'] } }
module.exports = nextConfig
EOF

cat > tailwind.config.js <<'EOF'
module.exports = { content: ["./app/**/*.{js,ts,jsx,tsx}"], theme: { extend: { colors: { primary: "#00B050" } } }, plugins: [] }
EOF

cat > postcss.config.js <<'EOF'
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }
EOF

cat > .gitignore <<'EOF'
node_modules
.next
.env.local
.env
.DS_Store
EOF

cat > tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "es5", "lib": ["dom","dom.iterable","esnext"], "allowJs": true, "skipLibCheck": true, "strict": true, "noEmit": true, "esModuleInterop": true, "module": "esnext", "moduleResolution": "bundler", "resolveJsonModule": true, "isolatedModules": true, "jsx": "preserve", "incremental": true,
    "plugins": [{"name": "next"}], "paths": {"@/*": ["./*"]}
  },
  "include": ["next-env.d.ts","**/*.ts","**/*.tsx",".next/types/**/*.ts"], "exclude": ["node_modules"]
}
EOF

mkdir -p app
cat > app/globals.css <<'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
body { font-family: Inter, system-ui, sans-serif; }
EOF

cat > app/layout.tsx <<'EOF'
import './globals.css';
export const metadata = { title: 'DukaanWhats - WhatsApp Store Builder', description: 'Turn WhatsApp into a real store in 60 seconds' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
EOF

cat > app/page.tsx <<'EOF'
import Link from 'next/link';
export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <div className="font-black text-xl"><span className="text-green-600">Dukaan</span>Whats</div>
        <Link href="/dashboard" className="bg-zinc-900 text-white px-5 py-2 rounded-full text-sm">Dashboard</Link>
      </nav>
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-block bg-green-50 text-green-600 text-xs font-bold px-3 py-1 rounded-full mb-4">Trusted by 500+ sellers in Islamabad</div>
          <h1 className="text-5xl font-black leading-[1.05]">Turn Your WhatsApp Into A <span className="text-green-600">Real Store</span> in 60 Seconds</h1>
          <p className="mt-5 text-zinc-600 text-lg">One link for your Instagram bio. No website, no commission. Orders come directly on your WhatsApp.</p>
          <div className="mt-8 flex gap-3">
            <Link href="/dashboard" className="bg-green-600 text-white px-7 py-3 rounded-full font-bold">Create My Free Store</Link>
            <a href="#pricing" className="border px-7 py-3 rounded-full font-bold">See Pricing</a>
          </div>
          <div className="mt-6 text-sm text-zinc-500">✔ Free 3 products • ✔ Easypaisa/JazzCash/COD • ✔ No coding</div>
        </div>
        <div className="bg-zinc-900 rounded-[32px] p-4 shadow-2xl">
          <div className="bg-white rounded-[24px] p-5">
            <div className="flex items-center gap-3"><div className="w-10 h-10 bg-green-100 rounded-full"/><div><div className="font-bold">Ayesha Boutique</div><div className="text-xs text-zinc-500">Rawalpindi • Active Now</div></div></div>
            <div className="grid grid-cols-2 gap-3 mt-5">
              {[1,2,3,4].map(i=>(<div key={i} className="border rounded-xl p-2"><div className="bg-zinc-100 h-24 rounded-lg"/><div className="mt-2 text-sm font-bold">Lawn Suit {i}</div><div className="text-green-600 font-bold">Rs. 3,500</div></div>))}
            </div>
            <div className="mt-4 bg-zinc-900 text-white text-center py-3 rounded-full font-bold">Order on WhatsApp</div>
          </div>
        </div>
      </section>
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black text-center">Simple Pricing for Pakistan</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <div className="border rounded-2xl p-6"><h3 className="font-bold">Free</h3><div className="text-3xl font-black mt-2">Rs. 0</div><ul className="mt-4 text-sm space-y-2 text-zinc-600"><li>• 3 products</li><li>• WhatsApp orders</li></ul></div>
          <div className="border-2 border-green-600 rounded-2xl p-6 bg-green-50"><h3 className="font-bold">Starter POPULAR</h3><div className="text-3xl font-black mt-2">Rs. 999 /mo</div><ul className="mt-4 text-sm space-y-2"><li>• 50 products</li><li>• No branding</li></ul></div>
          <div className="border rounded-2xl p-6"><h3 className="font-bold">Pro</h3><div className="text-3xl font-black mt-2">Rs. 1999 /mo</div><ul className="mt-4 text-sm space-y-2"><li>• Unlimited</li><li>• Easypaisa Proof</li></ul></div>
        </div>
      </section>
    </div>
  );
}
EOF

cat > lib/firebase.ts <<'EOF'
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
EOF

cat > lib/store.ts <<'EOF'
import { create } from 'zustand';
type CartItem = { id: string; name: string; price: number; qty: number; };
type CartStore = { items: CartItem[]; add: (i: CartItem) => void; clear: () => void; total: () => number; };
export const useCart = create<CartStore>((set, get) => ({
  items: [],
  add: (item) => {
    const ex = get().items.find(i => i.id === item.id);
    if (ex) set({ items: get().items.map(i => i.id === item.id ? {...i, qty: i.qty + item.qty} : i) });
    else set({ items: [...get().items, item] });
  },
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
}));
EOF

cat > app/dashboard/page.tsx <<'EOF'
'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
type Product = { id?: string; name: string; price: number; stock: number; image_url?: string; };
export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [businessName, setBusinessName] = useState('Ayesha Boutique');
  const [whatsapp, setWhatsapp] = useState('923001234567');
  const [slug, setSlug] = useState('ayesha-boutique');
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState<Product>({ name: '', price: 3500, stock: 10 });
  const [imageBase64, setImageBase64] = useState('');
  useEffect(() => { onAuthStateChanged(auth, async (u) => { if (!u) { const cred = await signInAnonymously(auth); setUser(cred.user); } else setUser(u); }); }, []);
  useEffect(() => { if (user) loadProducts(); }, [user]);
  function handleImage(e: any) { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setImageBase64(reader.result as string); reader.readAsDataURL(file); }
  async function loadProducts() { const q = query(collection(db, 'products'), where('user_id', '==', user.uid)); const snap = await getDocs(q); setProducts(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))); }
  async function saveProfile() { await setDoc(doc(db, 'profiles', user.uid), { business_name: businessName, whatsapp_number: whatsapp, store_slug: slug, user_id: user.uid }, { merge: true }); alert('Saved! Store: /s/' + slug); }
  async function addProduct() { if (!newProduct.name) return alert('Enter name'); await addDoc(collection(db, 'products'), { ...newProduct, image_url: imageBase64, user_id: user.uid, created_at: new Date() }); setNewProduct({ name: '', price: 3500, stock: 10 }); setImageBase64(''); await loadProducts(); }
  if (!user) return <div className="p-10">Loading...</div>;
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="bg-white border-b p-4 flex justify-between"><div className="font-black">DukaanWhats Dashboard</div><Link href={`/s/${slug}`} target="_blank" className="text-sm bg-black text-white px-4 py-2 rounded-full">View Store</Link></div>
      <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border"><h3 className="font-bold">Store Settings</h3><input value={businessName} onChange={e=>{setBusinessName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,'-'))}} className="w-full border p-2 mt-3 rounded"/><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} className="w-full border p-2 mt-2 rounded"/><input value={slug} onChange={e=>setSlug(e.target.value)} className="w-full border p-2 mt-2 rounded"/><button onClick={saveProfile} className="w-full bg-green-600 text-white py-2 rounded-full mt-3 font-bold">Save</button></div>
          <div className="bg-white p-5 rounded-2xl border"><h3 className="font-bold">Add Product</h3><input type="file" accept="image/*" onChange={handleImage} className="w-full text-xs mt-3"/>{imageBase64 && <img src={imageBase64} className="h-20 mt-2 rounded"/>}<input placeholder="Product name" value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name:e.target.value})} className="w-full border p-2 mt-2 rounded"/><div className="grid grid-cols-2 gap-2 mt-2"><input type="number" value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price: Number(e.target.value)})} className="border p-2 rounded"/><input type="number" value={newProduct.stock} onChange={e=>setNewProduct({...newProduct, stock: Number(e.target.value)})} className="border p-2 rounded"/></div><button onClick={addProduct} className="w-full bg-black text-white py-2 rounded-full mt-3 font-bold">Add Product</button></div>
        </div>
        <div className="md:col-span-2 bg-white p-5 rounded-2xl border"><h3 className="font-bold">Products ({products.length})</h3><div className="grid grid-cols-2 gap-3 mt-4">{products.map(p=>(<div key={p.id} className="border rounded-xl p-2">{p.image_url ? <img src={p.image_url} className="h-24 w-full object-cover rounded"/> : <div className="h-24 bg-zinc-100 rounded"/>}<div className="font-bold text-sm mt-1">{p.name}</div><div className="text-green-600 font-bold">Rs. {p.price}</div></div>))}</div></div>
      </div>
    </div>
  );
}
EOF

cat > "app/s/[slug]/page.tsx" <<'EOF'
'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useCart } from '@/lib/store';
export default function StorePage({ params }: { params: { slug: string } }) {
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', city: 'Islamabad' });
  const cart = useCart();
  useEffect(() => { async function load() { const q = query(collection(db, 'profiles'), where('store_slug', '==', params.slug)); const snap = await getDocs(q); if (!snap.empty) { const prof = snap.docs[0].data(); setProfile(prof); const pq = query(collection(db, 'products'), where('user_id', '==', prof.user_id)); const psnap = await getDocs(pq); setProducts(psnap.docs.map(d => ({ id: d.id, ...d.data() }))); } setLoading(false); } load(); }, [params.slug]);
  function orderOnWhatsApp() { if (!profile) return; if (!customer.name || !customer.phone) return alert('Enter name and phone'); const itemsText = cart.items.map((i, idx) => `${idx+1}. ${i.name} (x${i.qty}) - Rs. ${i.price * i.qty}`).join('%0A'); const total = cart.total(); const msg = `Salam ${profile.business_name}! 👋%0A%0ANew Order:%0ACustomer: ${customer.name}%0APhone: ${customer.phone}%0AAddress: ${customer.address}, ${customer.city}%0A%0AItems:%0A${itemsText}%0A%0ATotal: Rs. ${total}%0APayment: COD%0A%0APlease confirm.`; const wa = `https://wa.me/${profile.whatsapp_number}?text=${msg}`; window.open(wa, '_blank'); cart.clear(); setShowCheckout(false); }
  if (loading) return <div className="p-10 text-center">Loading store...</div>;
  if (!profile) return <div className="p-10 text-center">Store not found: {params.slug}</div>;
  return (
    <div className="min-h-screen bg-white max-w-md mx-auto border-x">
      <div className="p-5 flex items-center gap-3 border-b"><div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center font-black text-green-600">{profile.business_name[0]}</div><div><div className="font-bold">{profile.business_name}</div><div className="text-xs text-green-600">● Active on WhatsApp</div></div></div>
      <div className="p-4 grid grid-cols-2 gap-3">{products.map(p => (<div key={p.id} className="border rounded-2xl p-2">{p.image_url ? <img src={p.image_url} className="h-28 w-full object-cover rounded-xl"/> : <div className="h-28 bg-zinc-100 rounded-xl"/>}<div className="mt-2 font-bold text-sm">{p.name}</div><div className="text-green-600 font-bold">Rs. {p.price}</div><button onClick={() => cart.add({ id: p.id, name: p.name, price: p.price, qty: 1 })} className="mt-2 w-full bg-zinc-900 text-white py-2 rounded-full text-xs font-bold">Add to Cart</button></div>))}</div>
      {cart.items.length > 0 && (<div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-zinc-900 text-white p-4 flex justify-between items-center"><div><div className="text-xs">Cart ({cart.items.reduce((s,i)=>s+i.qty,0)})</div><div className="font-bold">Rs. {cart.total()}</div></div><button onClick={()=>setShowCheckout(true)} className="bg-green-600 px-5 py-2 rounded-full font-bold text-sm">Order on WhatsApp</button></div>)}
      {showCheckout && (<div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"><div className="bg-white w-full max-w-md rounded-t-[24px] p-6"><h3 className="font-bold text-lg">Checkout</h3><div className="mt-4 space-y-3"><input placeholder="Your Name" value={customer.name} onChange={e=>setCustomer({...customer, name:e.target.value})} className="w-full border rounded-xl p-3"/><input placeholder="Phone 03xx..." value={customer.phone} onChange={e=>setCustomer({...customer, phone:e.target.value})} className="w-full border rounded-xl p-3"/><input placeholder="Full Address" value={customer.address} onChange={e=>setCustomer({...customer, address:e.target.value})} className="w-full border rounded-xl p-3"/><div className="bg-zinc-50 p-3 rounded-xl text-sm">{cart.items.map(i=> <div key={i.id} className="flex justify-between"><span>{i.name} x{i.qty}</span><span>Rs. {i.price*i.qty}</span></div>)}<div className="flex justify-between font-bold border-t mt-2 pt-2"><span>Total</span><span>Rs. {cart.total()}</span></div></div><button onClick={orderOnWhatsApp} className="w-full bg-[#25D366] text-white py-3 rounded-full font-bold">Send Order on WhatsApp</button><button onClick={()=>setShowCheckout(false)} className="w-full border py-3 rounded-full font-bold">Cancel</button></div></div></div>)}
    </div>
  );
}
EOF

cat > .env.local.example <<'EOF'
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
EOF

cat > README.md <<'EOF'
# DukaanWhats - https://github.com/aakifhabib/DukaanWhats
Firebase + Next.js WhatsApp Store Builder. Free version (no Storage needed, uses base64).
## Setup
1. Create Firebase project, enable Anonymous Auth, Firestore (test mode)
2. Copy .env.local.example to .env.local and fill keys
3. npm install && npm run dev
4. Deploy to Vercel (import GitHub repo)
EOF

echo "All files created!"
