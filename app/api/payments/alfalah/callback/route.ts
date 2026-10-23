// app/api/payments/alfalah/callback/route.ts
// Bank Alfalah will POST here after card authorized - Money directly to Alfalah Bank
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const data: Record<string, string> = {}
    formData.forEach((value, key) => { data[key] = value.toString() })

    console.log('Alfalah Callback:', data)

    const responseCode = data.responseCode || data.ResponseCode || data.status
    const txnRefNo = data.orderId || data.OrderId || data.txnRefNo
    const amount = data.transactionAmount || data.amount
    const userId = data.ppmpf_1
    const planId = data.ppmpf_2
    const billingCycle = data.ppmpf_3
    const tillId = '984837533'

    // Alfalah success codes: 00, 000, Success
    if (responseCode === '00' || responseCode === '000' || responseCode === 'Success' || responseCode === '200') {
      if (userId && supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        const durationDays = billingCycle === 'yearly' ? 365 : 30
        const expiresAt = new Date(Date.now() + durationDays*24*60*60*1000).toISOString()

        await supabase.from('profiles').update({
          current_plan: planId,
          plan_started_at: new Date().toISOString(),
          plan_expires_at: expiresAt,
          plan_status: 'active'
        }).eq('id', userId)

        await supabase.from('plan_purchases').insert({
          user_id: userId,
          plan_id: planId,
          amount_paid: amount ? parseInt(amount) : 0,
          payment_method: `alfalah_direct_bank_till_${tillId}`,
          transaction_id: txnRefNo,
          status: 'approved',
          billing_cycle: billingCycle,
          billing_months: billingCycle === 'yearly' ? 12 : 1,
          jazzcash_till_id: tillId,
          verified_at: new Date().toISOString(),
          expires_at: expiresAt
        })
      }
      return NextResponse.redirect(new URL(`/dashboard?payment=success&method=alfalah&plan=${planId}&ref=${txnRefNo}`, req.url))
    } else {
      return NextResponse.redirect(new URL(`/dashboard?payment=failed&method=alfalah&code=${responseCode}`, req.url))
    }

  } catch (e: any) {
    console.error(e)
    return NextResponse.redirect(new URL(`/dashboard?payment=error&method=alfalah`, req.url))
  }
}

export async function GET(req: NextRequest) {
  return POST(req)
}
