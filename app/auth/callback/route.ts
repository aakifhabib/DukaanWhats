import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const source = new URL(request.url)
  const code = source.searchParams.get('code')
  if (!code) return NextResponse.redirect(new URL('/login?authError=missing_code', source.origin))

  // Exchange PKCE codes in the browser so Supabase can persist the session there.
  const destination = new URL('/auth/complete', source.origin)
  destination.searchParams.set('code', code)
  for (const key of ['type', 'next']) {
    const value = source.searchParams.get(key)
    if (value) destination.searchParams.set(key, value)
  }
  return NextResponse.redirect(destination)
}
