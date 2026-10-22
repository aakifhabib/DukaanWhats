'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const [msg, setMsg] = useState('Confirming your email...');

  useEffect(() => {
    async function handle() {
      // Supabase puts code in URL after email click
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setMsg('❌ ' + error.message);
        return;
      }
      // If session exists after email click
      if (data.session) {
        setMsg('✅ Email confirmed! Redirecting to dashboard...');
        setTimeout(()=>router.push('/dashboard'), 1500);
      } else {
        // Try to exchange code
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code) {
          const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exErr) setMsg('❌ ' + exErr.message);
          else {
            setMsg('✅ Email confirmed! Redirecting...');
            setTimeout(()=>router.push('/dashboard'), 1500);
          }
        } else {
          setMsg('✅ Email confirmed! Now you can login.');
          setTimeout(()=>router.push('/login'), 2000);
        }
      }
    }
    handle();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
      <div className="bg-white p-8 rounded- w-full max-w-sm text-center">
        <div className="w-12 h-12 bg-[#00B050] rounded-2xl mx-auto flex items-center justify-center text-white font-black mb-4 animate-pulse">D</div>
        <p className="font-bold text-sm">{msg}</p>
      </div>
    </div>
  );
}