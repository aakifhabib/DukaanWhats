'use client'
import Link from 'next/link'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#07052e] text-white relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        .card {
          height: 380px;
          width: 280px;
          background-image: linear-gradient(to top, #210c93, #0d117a, #011160, #010e47, #07052e);
          box-shadow: rgba(0, 0, 0, 0.24) -20px 30px 10px;
          transform-style: preserve-3d;
          transform: perspective(400px) rotateX(60deg) rotateZ(-30deg);
          border-radius: 16px;
          transition: transform 2s, filter 0.6s ease, opacity 0.6s ease, box-shadow 0.6s ease;
          position: relative;
          overflow: hidden;
          filter: brightness(0.55) saturate(0.7);
          opacity: 0.7;
        }
        .card:hover {
          transform: perspective(800px) rotateY(19deg) rotateX(8deg) translateZ(30px) scale(1.02);
          filter: brightness(1) saturate(1);
          opacity: 1;
        }
        .card-basic {
          background: linear-gradient(to top, #1a1a2e, #16213e, #0f3460);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .card-basic:hover {
          box-shadow: rgba(0,0,0,0.4) -20px 40px 20px, 0 0 30px rgba(15,52,96,0.3);
        }
        .card-advanced {
          background-image: linear-gradient(to top, #210c93, #0d117a, #011160, #010e47, #07052e);
          border: 1px solid rgba(105,70,255,0.3);
        }
        .card-advanced:hover {
          box-shadow: rgba(0,0,0,0.5) -20px 40px 30px, 0 0 50px rgba(105,70,255,0.5);
        }
        .card-premium {
          background: linear-gradient(to top, #2e1a07, #5c3a12, #8a5a1a, #d4a574);
          border: 1px solid rgba(212,165,116,0.3);
        }
        .card-premium:hover {
          box-shadow: rgba(0,0,0,0.5) -20px 40px 30px, 0 0 40px rgba(212,165,116,0.4);
        }
        @media (max-width: 900px) {
          .card {
            width: 100%;
            max-width: 320px;
            height: 420px;
            transform: perspective(600px) rotateX(10deg) rotateZ(-2deg);
          }
          .card:hover {
            transform: perspective(800px) rotateY(10deg) rotateX(5deg) translateZ(20px);
          }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-[#210c93]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-[#0d117a]/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[10px] tracking-[0.2em] uppercase font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8FF86] animate-pulse" />
            PRICING
          </div>
          <h1 className="text-[36px] md:text-[56px] font-bold tracking-tight leading-[0.9] max-w-3xl mx-auto">
            Choose your <span className="text-white/40">growth</span> plan
          </h1>
          <p className="text-[14px] md:text-[15px] text-white/50 mt-4 max-w-xl mx-auto leading-relaxed">
            Start free, scale when you sell. No commission, WhatsApp native. Your store in 2 minutes.
          </p>
          <div className="mt-6 text-[11px] text-white/30 tracking-wide">Hover cards to reveal • Cards fade dark before hover</div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-8">
          
          <div className="card card-basic p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/50 font-medium">BASIC</span>
              <span className="w-2 h-2 rounded-full bg-white/20" />
            </div>
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-[12px] text-white/50">Rs.</span>
                <span className="text-[40px] font-bold leading-none">0</span>
                <span className="text-[12px] text-white/40">/mo</span>
              </div>
              <div className="text-[12px] text-white/40 mt-1">For the first sale</div>
            </div>
            <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
            <ul className="space-y-2.5 flex-1">
              <li className="flex items-center gap-2 text-[12px] text-white/70"><span className="text-[#E8FF86]">—</span> 1 store</li>
              <li className="flex items-center gap-2 text-[12px] text-white/70"><span className="text-[#E8FF86]">—</span> 20 products</li>
              <li className="flex items-center gap-2 text-[12px] text-white/70"><span className="text-[#E8FF86]">—</span> WhatsApp orders</li>
              <li className="flex items-center gap-2 text-[12px] text-white/70"><span className="text-[#E8FF86]">—</span> 1 theme</li>
            </ul>
            <Link href="/dashboard" className="mt-6 h-10 rounded-full border border-white/20 flex items-center justify-center text-[11px] tracking-[0.15em] uppercase font-medium hover:bg-white hover:text-black transition-all">
              Start Free →
            </Link>
          </div>

          <div className="card card-advanced p-6 flex flex-col md:scale-[1.08] md:-translate-y-4 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#E8FF86] text-black text-[9px] tracking-[0.15em] uppercase font-bold flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-black animate-pulse" /> MOST POPULAR
            </div>
            <div className="flex items-center justify-between mb-4 mt-2">
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/50 font-medium">ADVANCED</span>
              <span className="text-[14px]">⚡</span>
            </div>
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-[12px] text-white/50">Rs.</span>
                <span className="text-[40px] font-bold leading-none">999</span>
                <span className="text-[12px] text-white/40">/mo</span>
              </div>
              <div className="text-[12px] text-white/60 mt-1">Where stores scale</div>
            </div>
            <div className="h-[1px] bg-gradient-to-r from-transparent via-[#E8FF86]/20 to-transparent mb-4" />
            <ul className="space-y-2.5 flex-1">
              <li className="flex items-center gap-2 text-[12px] text-white/80"><span className="text-[#E8FF86]">—</span> 3 stores</li>
              <li className="flex items-center gap-2 text-[12px] text-white/80"><span className="text-[#E8FF86]">—</span> 100 products</li>
              <li className="flex items-center gap-2 text-[12px] text-white/80"><span className="text-[#E8FF86]">—</span> All 8 themes</li>
              <li className="flex items-center gap-2 text-[12px] text-white/80"><span className="text-[#E8FF86]">—</span> Analytics + domain</li>
            </ul>
            <Link href="/dashboard" className="mt-6 h-10 rounded-full bg-[#E8FF86] text-black flex items-center justify-center text-[11px] tracking-[0.15em] uppercase font-bold hover:bg-[#dfff6b] transition-all">
              Go Advanced
            </Link>
          </div>

          <div className="card card-premium p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/50 font-medium">PREMIUM</span>
              <span className="text-[14px]">👑</span>
            </div>
            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-[12px] text-white/50">Rs.</span>
                <span className="text-[40px] font-bold leading-none">2499</span>
                <span className="text-[12px] text-white/40">/mo</span>
              </div>
              <div className="text-[12px] text-[#d4a574]/80 mt-1">Without limits</div>
            </div>
            <div className="h-[1px] bg-gradient-to-r from-transparent via-[#d4a574]/20 to-transparent mb-4" />
            <ul className="space-y-2.5 flex-1">
              <li className="flex items-center gap-2 text-[12px] text-white/70"><span className="text-[#d4a574]">—</span> Unlimited stores</li>
              <li className="flex items-center gap-2 text-[12px] text-white/70"><span className="text-[#d4a574]">—</span> All 11 themes (sleek)</li>
              <li className="flex items-center gap-2 text-[12px] text-white/70"><span className="text-[#d4a574]">—</span> Glass animations</li>
              <li className="flex items-center gap-2 text-[12px] text-white/70"><span className="text-[#d4a574]">—</span> Priority + no brand</li>
            </ul>
            <Link href="/dashboard" className="mt-6 h-10 rounded-full bg-gradient-to-r from-[#d4a574] to-[#f5d6a8] text-black flex items-center justify-center text-[11px] tracking-[0.15em] uppercase font-bold hover:opacity-90 transition-all">
              Go Premium
            </Link>
          </div>

        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-white/30">
            <span className="w-4 h-[1px] bg-white/20" />
            All plans include WhatsApp checkout
            <span className="w-4 h-[1px] bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  )
}
