import { NextResponse } from 'next/server'

// Legacy gateway callbacks were not cryptographically verified. Never activate
// a plan based solely on client-submitted callback fields.
export async function POST() {
  return NextResponse.json(
    { error: 'This payment callback is disabled until gateway signature verification is configured.' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function GET() {
  return NextResponse.json(
    { error: 'This payment callback is disabled until gateway signature verification is configured.' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  )
}
