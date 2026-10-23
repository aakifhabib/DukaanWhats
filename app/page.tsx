'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Landing() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session)
      setChecking(false)
    })
  }, [])

  return (
    <div style={{minHeight:'100vh',background:'#F8F7F5'}} className="text-zinc-900">
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div style={{borderRadius:10}} className="w-9 h-9 bg-black text-white flex items-center justify-center font-bold">D</div>
            <span className="font-semibold tracking-tight text-">DukaanWhats.pk</span>
          </Link>
          <div className="flex items-center gap-2">
            {!checking && loggedIn ? (
              <Link href="/dashboard" style={{borderRadius:10}} className="h-10 px-5 bg-black text-white text- font-medium flex items-center hover:bg-zinc-800">Go to Dashboard</Link>
            ) : (
              <>
                <Link href="/login" style={{borderRadius:10}} className="h-10 px-4 border bg-white text- font-medium flex items-center hover:bg-zinc-50">Login</Link>
                <Link href="/login" style={{borderRadius:10}} className="h-10 px-5 bg-black text-white text- font-medium flex items-center hover:bg-zinc-800">Create Store</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="max-w-3xl">
          <div style={{borderRadius:999}} className="inline-flex items-center gap-2 bg-white border px-3 py-1 text- font-medium tracking-widest uppercase text-zinc-600">Built for Pakistan — WhatsApp Commerce</div>
          <h1 className="mt-6 text- md:text- font-[750] tracking-tight leading-[0.95]">Your store.<br/>On WhatsApp.<br/><span className="text-zinc-400">In 30 seconds.</span></h1>
          <p className="mt-6 text- md:text- text-zinc-600 leading-relaxed max-w-xl">No coding. No fees. Create a premium store, add products with multiple photos, and take orders directly on WhatsApp.</p>
          <div className="mt-8 flex items-center gap-3">
            <Link href={loggedIn ? "/dashboard" : "/login"} style={{borderRadius:12}} className="h-12 px-7 bg-black text-white text- font-medium flex items-center hover:bg-zinc-800">{loggedIn ? "Open Dashboard" : "Create Your Store — Free"}</Link>
            <Link href="/s/premiumstore" target="_blank" style={{borderRadius:12}} className="h-12 px-6 bg-white border text- font-medium flex items-center hover:bg-zinc-50">View Demo</Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div style={{borderRadius:20}} className="bg-white border p-6"><div className="text- font-semibold uppercase tracking-widest text-zinc-500">Multi-Photo</div><div className="mt-3 text- font-medium leading-snug">Upload up to 5 photos per product. Gallery with arrows & thumbnails.</div></div>
            <div style={{borderRadius:20}} className="bg-white border p-6"><div className="text- font-semibold uppercase tracking-widest text-zinc-500">WhatsApp Orders</div><div className="mt-3 text- font-medium leading-snug">Customer fills name + quantity, you get full order on WhatsApp. No popup block.</div></div>
            <div style={{borderRadius:20}} className="bg-black text-white border p-6"><div className="text- font-semibold uppercase tracking-widest text-zinc-400">Instant Link</div><div className="mt-3 text- font-medium leading-snug">Shareable link: dukaan-whats.vercel.app/s/yourstore — copy in one click.</div></div>
          </div>
        </div>
      </main>

      <footer className="border-t mt-12 py-8 text-center text- text-zinc-500">© {new Date().getFullYear()} DukaanWhats.pk — Built for small businesses in Pakistan</footer>
    </div>
  )
}
