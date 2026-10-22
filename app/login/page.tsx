'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email,setEmail]=useState(''); 
  const [pass,setPass]=useState('');
  const [mode,setMode]=useState<'login'|'signup'>('login');
  const [loading,setLoading]=useState(false); 
  const [msg,setMsg]=useState('');
  const [shake,setShake]=useState(false); 
  const [needResend,setNeedResend]=useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const router=useRouter();

  // ✅ NEW: Stay logged in forever - auto redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard');
      } else {
        setCheckingSession(false);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace('/dashboard');
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  async function go() {
    setLoading(true); setMsg(''); setNeedResend(false);
    try{
      if(mode==='signup'){
        const {error}=await supabase.auth.signUp({email,password:pass,options:{emailRedirectTo:`${window.location.origin}/auth/callback`}});
        if(error) throw error;
        setMsg('✅ Account created! Open Gmail → Tap BLUE link "Confirm email address" → Then login here.');
        setNeedResend(true); setMode('login');
      }else{
        const {error}=await supabase.auth.signInWithPassword({email,password:pass});
        if(error){
          if(error.message.toLowerCase().includes('confirm')){ setNeedResend(true); throw new Error('Email not confirmed yet! Open Gmail, tap blue link, then login.'); }
          throw error;
        }
        router.push('/dashboard');
      }
    }catch(e:any){ setMsg('❌ '+e.message); setShake(true); setTimeout(()=>setShake(false),400); }
    setLoading(false);
  }

  async function resend(){
    const {error}=await supabase.auth.resend({type:'signup',email,options:{emailRedirectTo:`${window.location.origin}/auth/callback`}});
    setMsg(error?('❌ '+error.message):'📧 Resent! Check Gmail + Spam folder.');
  }

  if (checkingSession) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div></div>
  }

  return(
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 relative overflow-hidden">
      <div className="absolute w- h- bg-[#00B050]/20 rounded-full blur- -top-56 -left-56 animate-pulse"></div>
      <div className="absolute w- h- bg-[#00B050]/10 rounded-full blur- -bottom-56 -right-56 animate-pulse" style={{animationDelay:'1.2s'}}></div>
      <div className={`bg-white p-8 rounded- shadow-[0_20px_80px_rgba(0,176,80,0.15)] w-full max-w- relative z-10 border border-white/20 ${shake?'animate-[shake_0.35s]':'animate-[up_0.6s]'}`}>
        <style>{`@keyframes up{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
        <div className="w-14 h-14 bg-gradient-to-br from-[#00B050] to-[#008a3e] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#00B050]/20 animate-[float_3s_ease_infinite]">D</div>
        <h1 className="mt-5 text- font-black tracking-tight leading-none">{mode==='login'?'Welcome back':'Join DukaanWhats'}</h1>
        <p className="text- text-zinc-500 mt-2 mb-6 leading-snug">{mode==='login'?'Login to manage store. Email must be confirmed via blue link.':'Create free WhatsApp store. Confirmation email will have blue link to tap.'}</p>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" className="w-full border border-zinc-200 p-4 rounded-2xl text- bg-zinc-50 focus:bg-white focus:border-[#00B050] focus:ring-4 focus:ring-[#00B050]/10 outline-none transition-all"/>
        <input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Password (6+ chars)" className="w-full border border-zinc-200 p-4 rounded-2xl text- bg-zinc-50 focus:bg-white focus:border-[#00B050] focus:ring-4 focus:ring-[#00B050]/10 outline-none mt-3"/>
        <button onClick={go} disabled={loading} className="w-full mt-5 bg-[#0a0a0a] text-white py-4 rounded-full font-bold text- hover:bg-black hover:scale-[1.02] active:scale-[0.97] transition-all disabled:opacity-40 flex justify-center gap-2 items-center">{loading&&<span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>}{mode==='login'?'Login →':'Create Account →'}</button>
        {needResend&&<button onClick={resend} className="w-full mt-3 bg-[#00B050] text-white py-3 rounded-full font-bold text-xs">📧 Resend Confirmation Link</button>}
        <div className="mt-6 text-center"><button onClick={()=>setMode(mode==='login'?'signup':'login')} className="text- font-bold">{mode==='login'?<>No account? <span className="text-[#00B050] underline">Create free</span></>:<>Have account? <span className="text-[#00B050] underline">Login</span></>}</button></div>
        {msg&&<div className="mt-4 bg-zinc-900 text-white text- p-3.5 rounded-2xl text-center leading-snug animate-[up_0.3s]">{msg}</div>}
      </div>
    </div>
  );
}
