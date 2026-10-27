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
          <p className="mt-4 text-[14px] md:text-[15px] leading-[1.6] text-zinc-500 max-w-[520px] mx-auto">DukaanWhats.pk helps Instagram sellers turn their Instagram into a real store in 60 seconds. No website. No coding. Orders go straight to WhatsApp.</p>
        </div>

        {/* Mission */}
        <div className="mt-12 grid md:grid-cols-2 gap-4">
          <div className="bg-white border rounded-[24px] p-6 md:p-7">
            <div className="text-[11px] font-black tracking-widest opacity-40">OUR MISSION</div>
            <p className="mt-3 text-[16px] md:text-[18px] leading-[1.3] font-bold tracking-[-0.02em]">Every seller in Pakistan should have a store link, not just a DM.</p>
            <p className="mt-3 text-[13px] leading-[1.6] text-zinc-500">We saw thousands of sellers losing orders at 2am because they were copy-pasting in DMs. We wanted to give them a link they can put in bio that actually works.</p>
          </div>
          <div className="bg-black text-white rounded-[24px] p-6 md:p-7 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-[200px] h-[200px] bg-[#E8FF86]/20 rounded-full blur-[40px]" />
            <div className="relative text-[11px] font-black tracking-widest opacity-50">STORY</div>
            <p className="relative mt-3 text-[14px] leading-[1.5] text-white/80">Started in Karachi. One person. No team. Built for the sellers I saw on my own feed.</p>
            <div className="relative mt-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E8FF86] text-black grid place-items-center font-black text-[12px]">MA</div>
              <div><div className="text-[12px] font-bold">M Aakif</div><div className="text-[10px] opacity-60">Solo Founder</div></div>
            </div>
          </div>
        </div>

        {/* Numbers */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-white border rounded-[20px] p-4"><div className="text-[20px] font-black">500K+</div><div className="text-[10px] font-bold tracking-widest text-zinc-500 mt-1">SELLERS INSPIRED</div></div>
          <div className="bg-white border rounded-[20px] p-4"><div className="text-[20px] font-black">60s</div><div className="text-[10px] font-bold tracking-widest text-zinc-500 mt-1">TO LAUNCH</div></div>
          <div className="bg-[#E8FF86] border border-black/10 rounded-[20px] p-4"><div className="text-[20px] font-black text-black">COD</div><div className="text-[10px] font-bold tracking-widest text-black/60 mt-1">READY</div></div>
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

        {/* Founder */}
        <div className="mt-12 bg-white border rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row gap-6">
          <div className="w-[64px] h-[64px] rounded-[18px] bg-black text-[#E8FF86] grid place-items-center font-black text-[22px] relative">MA<div className="absolute -top-1 -right-1 w-3 h-3 bg-[#E8FF86] rounded-full border-2 border-black animate-pulse" /></div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2"><span className="font-black text-[18px]">M Aakif</span><span className="h-6 px-2.5 bg-black text-white rounded-full text-[10px] font-bold grid place-items-center tracking-widest">SOLO FOUNDER</span></div>
            <div className="text-[11px] font-bold tracking-widest text-zinc-400 mt-1">KARACHI • BUILT EVERYTHING ALONE</div>
            <p className="mt-3 text-[13px] leading-[1.6] text-zinc-600">I designed, built and launched DukaanWhats.pk by myself. From the first sketch to the last theme, every pixel and every order flow is my work. No team, no funding — just a problem I wanted to solve for sellers around me.</p>
            <div className="mt-4 flex gap-2 text-[11px]">
              <span className="h-7 px-3 bg-[#F8F7F5] border rounded-full grid place-items-center">Karachi</span>
              <span className="h-7 px-3 bg-[#E8FF86] border border-black/10 rounded-full grid place-items-center font-bold text-black">100% Solo Built</span>
            </div>
          </div>
        </div>

        {/* Footer Menu - names like "about" not "/about" */}
        <div className="mt-16 border-t pt-8">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-[8px] bg-black text-[#E8FF86] grid place-items-center font-black text-[11px]">D</div><span className="font-bold text-[13px]">DukaanWhats.pk</span></div>
              <div className="mt-2 text-[11px] text-zinc-500 max-w-[220px]">Built solo by M Aakif • For Pakistani sellers • Karachi</div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-[10px] font-black tracking-widest opacity-40">EXPLORE</div>
                <div className="mt-3 space-y-2 text-[13px]">
                  <a href="/about" className="block hover:opacity-60"><span className="font-bold">about</span> <span className="text-zinc-400">— our story</span></a>
                  <a href="/pricing" className="block hover:opacity-60"><span className="font-bold">pricing</span> <span className="text-zinc-400">— plans</span></a>
                  <a href="/login" className="block hover:opacity-60"><span className="font-bold">login</span> <span className="text-zinc-400">— sign in</span></a>
                  <a href="/dashboard" className="block hover:opacity-60"><span className="font-bold">dashboard</span> <span className="text-zinc-400">— manage store</span></a>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-black tracking-widest opacity-40">STORE</div>
                <div className="mt-3 space-y-2 text-[13px]">
                  <a href="/s/demo" className="block hover:opacity-60"><span className="font-bold">store demo</span> <span className="text-zinc-400">— live example</span></a>
                  <a href="/reset-password" className="block hover:opacity-60"><span className="font-bold">reset password</span> <span className="text-zinc-400">— help</span></a>
                  <div className="block"><span className="font-bold">contact</span> <span className="text-zinc-400">— hello@dukaanwhats.pk</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-between text-[11px] text-zinc-400"><span>© 2026 M Aakif • DukaanWhats.pk • Built solo in Karachi</span><span className="hidden md:block">Made for Pakistan ♥</span></div>
        </div>
      </div>
    </div>
  )
}
