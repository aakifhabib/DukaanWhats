// app/api/payments/jazzcash/init/route.ts - FINAL - Till ID 984837533 -> Alfalah Bank
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { plan_id, billing_cycle, user_id, amount } = await req.json()

    const merchantId = process.env.JC_MERCHANT_ID
    const password = process.env.JC_PASSWORD
    const integritySalt = process.env.JC_INTEGRITY_SALT
    const tillId = '984837533' // Your Till ID - fixed
    const bankName = 'Alfalah Bank'
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://dukaan-whats.vercel.app'}/api/payments/jazzcash/callback`

    // If no merchant creds yet, manual Till mode (still goes to Alfalah after settlement setup)
    if (!merchantId || !password || !integritySalt) {
      return NextResponse.json({
        mode: 'manual_till',
        tillId: tillId,
        bank: bankName,
        amount: amount,
        message: `Pay to Till ID ${tillId} → Auto-settles to your ${bankName}.`,
        instructions: `1. Open JazzCash App → Business → Till ID 2. Enter ${tillId} 3. Amount Rs.${amount} 4. Pay 5. Copy Transaction ID → Paste below. Money auto-transfers to your Alfalah Bank next morning.`,
        settlement_note: `SETUP REQUIRED: In business.jazzcash.com.pk (Till ${tillId}) → Settlement → Add your Alfalah IBAN → Daily Auto. Then all card/JazzCash payments will go to Alfalah Bank.`
      })
    }

    const txnRefNo = `DW${Date.now()}${Math.floor(Math.random()*1000)}`
    const txnDateTime = new Date().toISOString().slice(0,19).replace(/[-:T]/g, '')
    const expiryDateTime = new Date(Date.now() + 30*60*1000).toISOString().slice(0,19).replace(/[-:T]/g, '')

    const payload: Record<string, string> = {
      pp_Version: '2.0',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: merchantId,
      pp_Password: password,
      pp_TxnRefNo: txnRefNo,
      pp_Amount: (amount * 100).toString(),
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: txnDateTime,
      pp_TxnExpiryDateTime: expiryDateTime,
      pp_BillReference: plan_id,
      pp_Description: `DukaanWhats ${plan_id} ${billing_cycle} Till ${tillId} -> Alfalah Bank`,
      pp_ReturnURL: returnUrl,
      ppmpf_1: user_id || '',
      ppmpf_2: plan_id || '',
      ppmpf_3: billing_cycle || '',
      ppmpf_4: tillId,
      ppmpf_5: bankName,
    }

    const sortedKeys = Object.keys(payload).sort()
    let hashString = integritySalt + '&'
    sortedKeys.forEach((key, idx) => {
      hashString += payload[key]
      if (idx < sortedKeys.length - 1) hashString += '&'
    })
    const secureHash = crypto.createHmac('sha256', integritySalt).update(hashString).digest('hex').toUpperCase()
    payload.pp_SecureHash = secureHash

    return NextResponse.json({
      mode: 'hosted_checkout',
      tillId: tillId,
      bank: bankName,
      txnRefNo: txnRefNo,
      actionUrl: 'https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/',
      payload: payload,
      message: `Card payment via Till ${tillId} → Auto-settles to ${bankName}. Card details handled by JazzCash secure page.`
    })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
