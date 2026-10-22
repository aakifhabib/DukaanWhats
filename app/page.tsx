import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="p-5 flex justify-between max-w-6xl mx-auto">
        <div className="font-black text-xl">DukaanWhats.pk</div>
        <div className="flex gap-4 text-sm"><Link href="/about">About</Link><Link href="/login" className="bg-zinc-900 text-white px-4 py-1 rounded-full">Login</Link></div>
      </nav>
      <div className="max-w-6xl mx-auto p-8 text-center mt-10">
        <h1 className="text-5xl font-black leading-[0.9]">Your Instagram<br/>is not a <span className="text-[#00B050]">Dukaan</span></h1>
        <p className="text-zinc-500 mt-4 max-w-md mx-auto">Create a one-page store in 60 seconds. Orders go straight to your WhatsApp. Built for Pakistan.</p>
        <Link href="/dashboard" className="inline-block mt-6 bg-[#00B050] text-white px-8 py-4 rounded-full font-bold text-lg">Create Free Store →</Link>
        <div className="grid md:grid-cols-3 gap-4 mt-16 text-left">
          <div className="border p-5 rounded-2xl"><b>⚡ 60 Second Setup</b><p className="text-sm text-zinc-500 mt-1">Name + WhatsApp + Products. Done.</p></div>
          <div className="border p-5 rounded-2xl"><b>💬 【entity-WhatsApp¦canonical_name=WhatsApp】 Orders</b><p className="text-sm text-zinc-500 mt-1">No checkout fees. COD + Easypaisa proof.</p></div>
          <div className="border p-5 rounded-2xl"><b>🇵🇰 Made for Pakistan</b><p className="text-sm text-zinc-500 mt-1">Urdu ready, 【entity-JazzCash¦canonical_name=JazzCash】/Easypaisa, Rs.</p></div>
        </div>
      </div>
    </div>
  );
}