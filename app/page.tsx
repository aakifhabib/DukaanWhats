'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard');
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="p-5 flex justify-between max-w-6xl mx-auto items-center">
        <div className="font-black text-xl tracking-tight">DukaanWhats<span className="text-[#00B050]">.pk</span></div>
        <div className="flex gap-4 text-sm items-center"><Link href="/about" className="font-bold text-zinc-600 hover:text-black">About</Link><Link href="/login" className="bg-zinc-900 text-white px-5 py-2 rounded-full font-bold">Login</Link></div>
      </nav>
      <div className="max-w-6xl mx-auto p-8 text-center mt-10">
        <h1 className="text-5xl md:text-6xl font-black leading-[0.9] tracking-tight">Your Instagram<br/>is not a <span className="text-[#00B050]">Dukaan</span></h1>
        <p className="text-zinc-500 mt-4 max-w-md mx-auto text- leading-snug">Create a one-page store in 60 seconds. Orders go straight to your WhatsApp. Built for Pakistan.</p>
        <Link href="/login" className="inline-block mt-6 bg-[#00B050] hover:bg-[#009645] text-white px-8 py-4 rounded-full font-bold text- transition">Create Free Store →</Link>
        <div className="grid md:grid-cols-3 gap-4 mt-16 text-left">
          <div className="border border-zinc-100 bg-zinc-50/50 p-5 rounded-2xl"><b className="text-">⚡ 60 Second Setup</b><p className="text- text-zinc-500 mt-1">Name + WhatsApp + Products. Done.</p></div>
          <div className="border border-zinc-100 bg-zinc-50/50 p-5 rounded-2xl"><b className="text-">💬 WhatsApp Orders</b><p className="text- text-zinc-500 mt-1">No checkout fees. COD + Easypaisa proof.</p></div>
          <div className="border border-zinc-100 bg-zinc-50/50 p-5 rounded-2xl"><b className="text-">🇵🇰 Made for Pakistan</b><p className="text- text-zinc-500 mt-1">Urdu ready, JazzCash/Easypaisa, Rs.</p></div>
        </div>
      </div>
    </div>
  );
}
