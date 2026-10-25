'use client'

export function DukaanWhatsLoader({ message = "" }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0A0A0A] overflow-hidden">
      <style>{`
        .dw-loader {
          --size: 300px;
          --duration: 2.5s;
          --background: linear-gradient(0deg, rgba(232,255,134,0.32) 0%, rgba(20,20,20,0.9) 100%);
          height: var(--size);
          aspect-ratio: 1;
          position: relative;
        }
        @media (min-width: 768px) { .dw-loader { --size: 420px; } }
        .dw-loader .box {
          position: absolute;
          background: var(--background);
          border-radius: 50%;
          box-shadow: rgba(0,0,0,0.6) 0px 10px 24px 0, inset rgba(232,255,134,0.7) 0px 6px 14px -4px;
          animation: ripple var(--duration) infinite ease-in-out;
          inset: var(--inset);
          animation-delay: calc(var(--i) * 0.18s);
          z-index: calc(var(--i) * -1);
          border: 1px solid rgba(232,255,134,0.18);
        }
        .dw-loader .box:last-child { 
          filter: blur(20px); 
          background: linear-gradient(0deg, rgba(232,255,134,0.45) 0%, rgba(232,255,134,0.12) 100%);
        }
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
          background: #E8FF86;
          color: #0A0A0A;
          border-radius: 26%;
          display: grid;
          place-items: center;
          font-weight: 900;
          font-size: 48px;
          letter-spacing: -0.05em;
          box-shadow: 0 16px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(232,255,134,0.3);
          animation: color-change var(--duration) infinite ease-in-out;
          position: relative;
        }
        @media (min-width: 768px) { .dw-loader .logo-inner { font-size: 62px; } }
        .dw-loader .logo-inner::after {
          content: '';
          position: absolute;
          top: -3px;
          right: -3px;
          width: 16%;
          height: 16%;
          background: #0A0A0A;
          border-radius: 50%;
          border: 3px solid #E8FF86;
          animation: pulse-dot 1.5s infinite;
        }
        @keyframes ripple {
          0% { transform: scale(1); box-shadow: rgba(0,0,0,0.6) 0px 10px 24px 0, inset rgba(232,255,134,0.6) 0px 6px 14px -4px; }
          65% { transform: scale(1.38); box-shadow: rgba(0,0,0,0) 0px 0 0 0; }
          100% { transform: scale(1); box-shadow: rgba(0,0,0,0.6) 0px 10px 24px 0, inset rgba(232,255,134,0.6) 0px 6px 14px -4px; }
        }
        @keyframes color-change {
          0% { background: #E8FF86; color: #0A0A0A; transform: scale(1); }
          50% { background: #0A0A0A; color: #E8FF86; transform: scale(1.06); box-shadow: 0 16px 32px rgba(0,0,0,0.5), 0 0 0 2px #E8FF86; }
          100% { background: #E8FF86; color: #0A0A0A; }
        }
        @keyframes pulse-dot { 0%,100%{transform:scale(1)} 50%{transform:scale(1.25)} }
      `}</style>

      <div className="dw-loader">
        <div className="box" style={{ '--i': 0, '--inset': '0%' } as any}></div>
        <div className="box" style={{ '--i': 1, '--inset': '7%' } as any}></div>
        <div className="box" style={{ '--i': 2, '--inset': '14%' } as any}></div>
        <div className="box" style={{ '--i': 3, '--inset': '21%' } as any}></div>
        <div className="box" style={{ '--i': 4, '--inset': '28%' } as any}></div>
        <div className="box" style={{ '--i': 5, '--inset': '36%' } as any}></div>
        <div className="logo">
          <div className="logo-inner">D</div>
        </div>
      </div>
    </div>
  )
}
