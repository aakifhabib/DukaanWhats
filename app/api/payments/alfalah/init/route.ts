import { NextResponse } from 'next/server'

// Disable the legacy browser-facing integration until its server-side payment
// creation, amount validation, and callback signature checks are implemented.
export async function POST() {
  return NextResponse.json(
    { error: 'Direct card checkout is temporarily unavailable. Use the manual payment submission flow.' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  )
}
