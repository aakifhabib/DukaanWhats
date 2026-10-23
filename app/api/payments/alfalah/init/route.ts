// app/api/payments/alfalah/init/route.ts
// Direct Card Payment to Alfalah Bank Account - No JazzCash needed
// Card details handled by Bank Alfalah secure page - PCI DSS
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { plan_id, billing_cycle, user_id, amount } = await req.json()

    // ENV from Vercel - Get from Bank Alfalah Merchant Portal
    const merchantId = process.env.ALFA_MERCHANT_ID
    const storeId = process.env.ALFA_STORE_ID
    const hashKey = process.env.ALFA_HASH_KEY
    const channelId = process.env.ALFA_CHANNEL_ID || '1001'
    const returnUrl = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/alfalah/callback` : 'https://dukaan-whats.vercel.app/api/payments/alfalah/callback'
    const tillId = '984837533'

    // If Alfalah gateway not configured yet, fallback to Till ID that settles to Alfalah
    if (!merchantId || !storeId || !hashKey) {
      return NextResponse.json({
        mode: 'alfalah_settlement_via_till',
        tillId: tillId,
        bank: 'Alfalah',
        amount: amount,
        message: `Till ID ${tillId} is set to auto-settle to your Alfalah bank. Customer pays by card via JazzCash secure page → Money goes to Alfalah next morning. For instant direct Alfalah card payment, add ALFA_MERCHANT_ID, ALFA_STORE_ID, ALFA_HASH_KEY in Vercel Env from Bank Alfalah.`,
        instructions: `1. In JazzCash Business portal (Till ${tillId}), add your Alfalah IBAN in Settlement. 2. Enable daily settlement. 3. Card payments will auto-transfer to Alfalah.`
      })
    }

    // Bank Alfalah IPG - Create transaction
    const txnRefNo = `ALFA${Date.now()}${Math.floor(Math.random()*1000)}`
    const txnAmount = amount.toString()
    
    // Alfalah hash generation as per docs
    const dataToHash = `${storeId}${txnAmount}${txnRefNo}${returnUrl}${hashKey}`
    const secureHash = crypto.createHash('sha256').update(dataToHash).digest('hex').toUpperCase()

    const payload = {
      merchantId: merchantId,
      storeId: storeId,
      channelId: channelId,
      orderId: txnRefNo,
      transactionAmount: txnAmount,
      transactionType: 'SALE',
      currency: 'PKR',
      returnUrl: returnUrl,
      secureHash: secureHash,
      ppmpf_1: user_id || '',
      ppmpf_2: plan_id || '',
      ppmpf_3: billing_cycle || '',
      ppmpf_4: tillId,
      description: `DukaanWhats ${plan_id} ${billing_cycle} - Till ${tillId} Alfalah`
    }

    return NextResponse.json({
      mode: 'alfalah_direct',
      bank: 'Alfalah',
      tillId: tillId,
      txnRefNo: txnRefNo,
      actionUrl: 'https://payments.bankalfalah.com/SSO/SSO/SSO', // Live Alfalah IPG URL
      sandboxUrl: 'https://sandbox.bankalfalah.com/SSO/SSO/SSO', // Test
      payload: payload,
      message: `Direct card payment to Alfalah Bank Account - Till ID ${tillId} linked. Card authorized by Bank Alfalah, money directly to Alfalah account.`
    })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
