import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
const TILL_ID = '984837533'
const PLAN_PRICES = {
  advanced: { monthly: 899, yearly: 8388 },
  premium: { monthly: 2999, yearly: 29988 },
} as const

const json = (body: unknown, status = 200) => NextResponse.json(body, {
  status,
  headers: { 'Cache-Control': 'private, no-store, max-age=0' },
})

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
    if (!token) return json({ error: 'Sign in before submitting a payment.' }, 401)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anonKey) return json({ error: 'Payment submission is not configured.' }, 503)

    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    })
    const { data: authData, error: authError } = await supabase.auth.getUser(token)
    if (authError || !authData.user) return json({ error: 'Your session expired. Sign in again.' }, 401)

    const body = await request.json().catch(() => null)
    const planId = body?.planId
    const billing = body?.billing
    const transactionId = typeof body?.transactionId === 'string' ? body.transactionId.trim() : ''
    if ((planId !== 'advanced' && planId !== 'premium') || (billing !== 'monthly' && billing !== 'yearly')) {
      return json({ error: 'Choose a valid paid plan and billing cycle.' }, 400)
    }
    if (transactionId.length < 4 || transactionId.length > 80 || !/^[a-zA-Z0-9\-_. ]+$/.test(transactionId)) {
      return json({ error: 'Enter a valid transaction ID (4–80 letters, numbers, spaces, hyphens, underscores, or dots).' }, 400)
    }

    const validPlanId = planId as keyof typeof PLAN_PRICES
    const validBilling = billing as keyof typeof PLAN_PRICES.advanced
    const amount = PLAN_PRICES[validPlanId][validBilling]
    const { error: insertError } = await supabase.from('plan_payments').insert({
      user_id: authData.user.id,
      plan_id: validPlanId,
      amount,
      till_id: TILL_ID,
      txn_id: transactionId,
      status: 'pending',
      billing_cycle: validBilling,
    })
    if (insertError) {
      const duplicate = /duplicate|unique/i.test(insertError.message)
      return json({ error: duplicate ? 'This transaction ID has already been submitted.' : insertError.message }, duplicate ? 409 : 400)
    }
    return json({ success: true, message: 'Payment submitted for verification.' }, 201)
  } catch (error: any) {
    return json({ error: error?.message || 'Payment could not be submitted. Please try again.' }, 500)
  }
}
