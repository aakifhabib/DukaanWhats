'use client'
import { useEffect, useState } from 'react'

export function DukaanWhatsLoader({ message = "Loading your store..." }: { message?: string }) {
  const [mounted, setMounted] = useState(false)
  useEffect(()=>{ setMounted(true) },[])

  // Website theme colors - matches DukaanWhats branding (beige/black/lime)
  // Replace purple gradient with website theme: #F8F7F5, #E8FF86, #0A0A0A
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F8F7F5] overflow-hidden">
      <style>{`
        .dw-loader {
          --size: 280px;
          --duration: 2.5s;
          --logo-color: #0A0A0A;
          --background: linear-gradient(0deg, rgba(232,255,134,0.25) 0%, rgba(10,10,10,0.08) 100%);
          height: var(--size);
          aspect-ratio: 1;
          position: relative;
          pointer-events: none;
        }
        @media (min-width: 768px) {
          .dw-loader { --size: 400px; }
        }
        .dw-loader .box {
          position: absolute;
          background: var(--background);
          border-radius: 50%;
          box-shadow: rgba(0,0,0,0.25) 0px 10px 20px 0, inset rgba(232,255,134,0.6) 0px 5px 12px -4px;
          animation: ripple var(--duration) infinite ease-in-out;
          inset: var(--inset);
          animation-delay: calc(var(--i) * 0.15s);
          z-index: calc(var(--i) * -1);
          pointer-events: all;
          transition: all 0.3s ease;
          border: 1px solid rgba(10,10,10,0.06);
        }
        .dw-loader .box:last-child { filter: blur(24px); background: linear-gradient(0deg, rgba(232,255,134,0.35) 0%, rgba(248,247,245,0.2) 100%); }
        .dw-loader .box:not(:last-child):hover { filter: brightness(1.15) blur(1px); transform: scale(1.02); }
        .dw-loader .logo {
          position: absolute;
          inset: 0;
          display: grid;
          place-content: center;
          padding: 30%;
        }
        .dw-loader .logo-inner {
          width: 100%;
          aspect-ratio: 1;
          background: #0A0A0A;
          color: white;
          border-radius: 24%;
          display: grid;
          place-items: center;
          font-weight: 900;
          font-size: 42px;
          letter-spacing: -0.04em;
          box-shadow: 0 12px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1);
          animation: color-change var(--duration) infinite ease-in-out;
          position: relative;
        }
        @media (min-width: 768px) {
          .dw-loader .logo-inner { font-size: 56px; border-radius: 26%; }
        }
        .dw-loader .logo-inner::after {
          content: '';
          position: absolute;
          top: -4px;
          right: -4px;
          width: 18%;
          height: 18%;
          background: #E8FF86;
          border-radius: 50%;
          border: 3px solid #F8F7F5;
          animation: pulse-dot 1.5s infinite;
        }
        @keyframes ripple {
          0% { transform: scale(1); box-shadow: rgba(0,0,0,0.15) 0px 10px 20px 0, inset rgba(232,255,134,0.5) 0px 5px 12px -4px; }
          65% { transform: scale(1.35); box-shadow: rgba(0,0,0,0) 0px 0 0 0; }
          100% { transform: scale(1); box-shadow: rgba(0,0,0,0.15) 0px 10px 20px 0, inset rgba(232,255,134,0.5) 0px 5px 12px -4px; }
        }
        @keyframes color-change {
          0% { background: #0A0A0A; color: white; }
          50% { background: #E8FF86; color: #0A0A0A; transform: scale(1.04); }
          100% { background: #0A0A0A; color: white; }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes float-text {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
      `}</style>

      <div className="dw-loader">
        <div className="box" style={{ '--i': 0, '--inset': '0%' } as any}></div>
        <div className="box" style={{ '--i': 1, '--inset': '6%' } as any}></div>
        <div className="box" style={{ '--i': 2, '--inset': '12%' } as any}></div>
        <div className="box" style={{ '--i': 3, '--inset': '18%' } as any}></div>
        <div className="box" style={{ '--i': 4, '--inset': '24%' } as any}></div>
        <div className="box" style={{ '--i': 5, '--inset': '34%' } as any}></div>
        <div className="logo">
          <div className="logo-inner">D</div>
        </div>
      </div>

      <div className="mt-2 flex flex-col items-center">
        <div className="flex items-baseline gap-0">
          <span className="text-[22px] md:text-[28px] font-[800] tracking-[-0.03em]">Dukaan</span>
          <span className="text-[22px] md:text-[28px] font-[800] tracking-[-0.03em] bg-[#0A0A0A] text-white px-1.5 rounded-[8px] ml-1">Whats</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[11px] mono font-bold tracking-[0.18em] text-black/40">DUKAANWHATS.PK</span>
          <span className="w-1 h-1 bg-[#E8FF86] rounded-full animate-pulse" />
          <span className="text-[10px] mono text-black/30">LIVE</span>
        </div>
        <div className="mt-3 text-[11px] md:text-[12px] text-black/50 font-medium animate-[float-text_2s_ease-in-out_infinite]">{message}</div>
        <div className="mt-4 flex items-center gap-1.5">
          <div className="w-1 h-1 bg-black rounded-full animate-[ripple_1s_ease-in-out_infinite]" style={{ animationDelay: '0s' } as any} />
          <div className="w-1 h-1 bg-black rounded-full animate-[ripple_1s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' } as any} />
          <div className="w-1 h-1 bg-black rounded-full animate-[ripple_1s_ease-in-out_infinite]" style={{ animationDelay: '0.4s' } as any} />
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[9px] mono tracking-widest text-black/20">
        <span>✦</span>
        <span>MADE FOR PAKISTAN • COD • FREE SHIPPING</span>
        <span>✦</span>
      </div>
    </div>
  )
}
