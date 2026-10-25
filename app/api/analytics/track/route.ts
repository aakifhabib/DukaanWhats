import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { store_slug, event_type, product_id, store_owner_id } = body
    
    if (!store_slug || !event_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const referrer = req.headers.get('referer') || null

    // Get owner id if not provided
    let ownerId = store_owner_id
    if (!ownerId && store_slug) {
      const { data: profile } = await supabase.from('profiles').select('id').eq('store_slug', store_slug).maybeSingle()
      ownerId = profile?.id || null
    }

    const { error } = await supabase.from('store_analytics').insert({
      store_slug,
      event_type,
      product_id: product_id || null,
      store_owner_id: ownerId,
      visitor_ip: ip,
      user_agent: userAgent,
      referrer
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
