// app/api/payments/jazzcash/callback/route.ts - FINAL - Till 984837533 -> Alfalah Bank
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const data: Record<string, string> = {}
    formData.forEach((value, key) => { data[key] = value.toString() })

    console.log('JazzCash -> Alfalah Callback:', data)

    const responseCode = data.pp_ResponseCode
    const txnRefNo = data.pp_TxnRefNo
    const amount = data.pp_Amount
    const userId = data.ppmpf_1
    const planId = data.ppmpf_2
    const billingCycle = data.ppmpf_3
    const tillId = '984837533'
    const bankName = 'Alfalah Bank'

    if (responseCode === '000' || responseCode === '200') {
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
          amount_paid: amount ? parseInt(amount)/100 : 0,
          payment_method: `jazzcash_till_${tillId}_to_${bankName.replace(' ','_').toLowerCase()}`,
          transaction_id: txnRefNo,
          status: 'approved',
          billing_cycle: billingCycle,
          billing_months: billingCycle === 'yearly' ? 12 : 1,
          jazzcash_till_id: tillId,
          verified_at: new Date().toISOString(),
          expires_at: expiresAt
        })
      }
      return NextResponse.redirect(new URL(`/dashboard?payment=success&bank=alfalah&till=${tillId}&plan=${planId}&ref=${txnRefNo}`, req.url))
    } else {
      return NextResponse.redirect(new URL(`/dashboard?payment=failed&bank=alfalah&code=${responseCode}`, req.url))
    }

  } catch (e: any) {
    console.error(e)
    return NextResponse.redirect(new URL(`/dashboard?payment=error&bank=alfalah`, req.url))
  }
}

export async function GET(req: NextRequest) {
  return POST(req)
}
