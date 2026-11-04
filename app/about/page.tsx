export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F5] text-[#0A0A0A] antialiased selection:bg-[#E8FF86] selection:text-black">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700;800;900&display=swap'); *{font-family:'Geist',system-ui,sans-serif}`}</style>
      
      {/* Top bar like login - dotted */}
      <div className="h-[72px] border-b bg-white/80 backdrop-blur sticky top-0 z-20 flex items-center">
        <div className="max-w-[720px] w-full mx-auto px-5 md:px-8 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-black text-[#E8FF86] grid place-items-center font-black text-[14px]">D</div>
            <span className="font-black tracking-tight text-[14px]">DukaanWhats.pk</span>
          </a>
          <a href="/" className="h-8 px-4 bg-black text-white rounded-full text-[11px] font-bold grid place-items-center">Back to home</a>
        </div>
      </div>

      <div className="max-w-[720px] mx-auto px-5 md:px-8 py-10 md:py-16">
        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex h-6 px-3 bg-white border rounded-full text-[10px] font-black tracking-widest">ABOUT</div>
          <h1 className="mt-5 text-[32px] md:text-[48px] leading-[0.9] font-black tracking-[-0.04em]">We are building the<br/>easiest way for<br/>Pakistan to sell online.</h1>
          <p className="mt-4 text-[14px] md:text-[15px] leading-[1.6] text-zinc-500 max-w-[520px] mx-auto">A simple way for Pakistani sellers to share products and take orders on WhatsApp.</p>
        </div>

        {/* Mission */}
        <div className="mt-12 grid md:grid-cols-2 gap-4">
          <div className="bg-white border rounded-[24px] p-6 md:p-7">
            <div className="text-[11px] font-black tracking-widest opacity-40">OUR MISSION</div>
            <p className="mt-3 text-[16px] md:text-[18px] leading-[1.3] font-bold tracking-[-0.02em]">Every seller should have a store link, not just a DM inbox.</p>
            <p className="mt-3 text-[13px] leading-[1.6] text-zinc-500">Give customers one link to browse products and start an order.</p>
          </div>
          <div className="bg-black text-white rounded-[24px] p-6 md:p-7 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-[200px] h-[200px] bg-[#E8FF86]/20 rounded-full blur-[40px]" />
            <div className="relative text-[11px] font-black tracking-widest opacity-50">STORY</div>
            <p className="relative mt-3 text-[14px] leading-[1.5] text-white/80">Based in Islamabad, Pakistan, DukaanWhats is built by M Aakif for local sellers.</p>
            <div className="relative mt-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E8FF86] text-black grid place-items-center font-black text-[12px]">MA</div>
              <div><div className="text-[12px] font-bold">M Aakif</div><div className="text-[10px] opacity-60">Solo Founder</div></div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mt-12">
          <div className="text-[11px] font-black tracking-widest opacity-40">VALUES</div>
          <div className="mt-4 grid md:grid-cols-3 gap-3">
            <div className="bg-white border rounded-[20px] p-5"><div className="w-8 h-8 bg-[#F8F7F5] border rounded-full grid place-items-center text-[12px]">◐</div><div className="mt-3 font-bold text-[13px]">Simple</div><div className="mt-1 text-[12px] text-zinc-500 leading-[1.5]">One page. No dashboard maze. Your customer sees products and clicks WhatsApp.</div></div>
            <div className="bg-white border rounded-[20px] p-5"><div className="w-8 h-8 bg-[#F8F7F5] border rounded-full grid place-items-center text-[12px]">♥</div><div className="mt-3 font-bold text-[13px]">Pakistani</div><div className="mt-1 text-[12px] text-zinc-500 leading-[1.5]">Made for local sellers. PKR pricing, Urdu-friendly, COD by default.</div></div>
            <div className="bg-white border rounded-[20px] p-5"><div className="w-8 h-8 bg-[#F8F7F5] border rounded-full grid place-items-center text-[12px]">↗</div><div className="mt-3 font-bold text-[13px]">WhatsApp First</div><div className="mt-1 text-[12px] text-zinc-500 leading-[1.5]">No new app to learn. Orders land where you already live — WhatsApp.</div></div>
          </div>
        </div>

        {/* Footer Menu - names like "about" not "/about" */}
        <div className="mt-16 border-t pt-8">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-[8px] bg-black text-[#E8FF86] grid place-items-center font-black text-[11px]">D</div><span className="font-bold text-[13px]">DukaanWhats.pk</span></div>
              <div className="mt-2 text-[11px] text-zinc-500 max-w-[220px]">Built solo by M Aakif • For Pakistani sellers • Islamabad</div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-[10px] font-black tracking-widest opacity-40">EXPLORE</div>
                <div className="mt-3 space-y-2 text-[13px]">
                  <a href="/about" className="block font-bold hover:opacity-60">About</a>
                  <a href="/pricing" className="block font-bold hover:opacity-60">Pricing</a>
                  <a href="/login" className="block font-bold hover:opacity-60">Login</a>
                  <a href="/dashboard" className="block font-bold hover:opacity-60">Dashboard</a>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-black tracking-widest opacity-40">STORE</div>
                <div className="mt-3 space-y-2 text-[13px]">
                  <a href="/s/demo" className="block font-bold hover:opacity-60">Store demo</a>
                  <a href="/reset-password" className="block font-bold hover:opacity-60">Reset password</a>
                  <a href="mailto:hello@dukaanwhats.pk" className="block font-bold hover:opacity-60">Contact</a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-between text-[11px] text-zinc-400"><span>© 2026 M Aakif • DukaanWhats.pk • Based in Islamabad</span><span className="hidden md:block">Made for Pakistan ♥</span></div>
        </div>
      </div>
    </div>
  )
}
