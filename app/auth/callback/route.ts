import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next')

  // Recovery / reset password should go to /reset-password
  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // If it's a password recovery, go to reset-password
      if (type === 'recovery' || next === 'recovery' || request.url.includes('recovery')) {
        return NextResponse.redirect(new URL('/reset-password', request.url))
      }
      // For recovery from new flow, also check hash
      return NextResponse.redirect(new URL('/reset-password', request.url))
    }
  }

  // Fallback: if no code or error, go to reset-password anyway to show error message
  return NextResponse.redirect(new URL('/reset-password', request.url))
}
