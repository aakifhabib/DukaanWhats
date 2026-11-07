import { NextResponse } from 'next/server'
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const json = (body: unknown, status = 200) => NextResponse.json(body, {
  status,
  headers: { 'Cache-Control': 'private, no-store, max-age=0' },
})

async function authorize(request: Request): Promise<
  | { user: User; admin: SupabaseClient }
  | { response: NextResponse }
> {
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) return { response: json({ error: 'Sign in with an administrator account.' }, 401) }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anonKey || !serviceKey) {
    return { response: json({ error: 'Admin data is not configured. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or the legacy anon-key variable), and the server-only SUPABASE_SERVICE_ROLE_KEY.' }, 503) }
  }

  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const { data, error } = await authClient.auth.getUser(token)
  if (error || !data.user) return { response: json({ error: 'Your session expired. Sign in again.' }, 401) }

  const emails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
  if (!emails.length) return { response: json({ error: 'Admin access is not configured.' }, 503) }
  if (!data.user.email || !emails.includes(data.user.email.toLowerCase())) {
    return { response: json({ error: 'This account does not have administrator access.' }, 403) }
  }
  let claims: any = {}
  try { claims = JSON.parse(Buffer.from(token.split('.')[1] || '', 'base64url').toString('utf8')) } catch { /* getUser above already validates the token; fail closed below */ }
  if (claims.aal !== 'aal2') return { response: json({ error: 'Complete administrator multi-factor verification.', code: 'mfa_required' }, 403) }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  return { user: data.user, admin }
}

export async function GET(request: Request) {
  try {
    const auth = await authorize(request)
    if ('response' in auth) return auth.response
    const { admin } = auth
    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') || 'payments'
    if (view === 'verify') return json({ ok: true })

    if (view === 'users') {
      const requestedPage = Number(searchParams.get('page')) || 1
      const page = Math.min(100000, Math.max(1, Math.floor(requestedPage)))
      const perPage = 50
      const { data: authData, error: usersError } = await admin.auth.admin.listUsers({ page, perPage: perPage + 1 })
      if (usersError) return json({ error: usersError.message }, 500)
      const hasMore = authData.users.length > perPage
      const users = authData.users.slice(0, perPage)
      const ids = users.map(user => user.id)
      const { data: profiles, error: profilesError } = ids.length
        ? await admin.from('profiles').select('id,business_name,whatsapp_number,store_slug,current_plan').in('id', ids)
        : { data: [], error: null }
      if (profilesError) return json({ error: `Could not load user profiles: ${profilesError.message}` }, 500)

      const profileById = new Map((profiles || []).map(profile => [profile.id, profile]))
      return json({
        users: users.map(user => ({
          id: user.id,
          email: user.email || '',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          email_confirmed_at: user.email_confirmed_at,
          profile: profileById.get(user.id) || null,
        })),
        hasMore,
        page,
        perPage,
      })
    }

    if (view !== 'payments') return json({ error: 'Unknown admin view.' }, 400)
    const requestedPage = Number(searchParams.get('page')) || 1
    const page = Math.min(100000, Math.max(1, Math.floor(requestedPage)))
    const perPage = 50
    const status = searchParams.get('status') || 'pending'
    if (!['pending', 'approved', 'rejected', 'all'].includes(status)) return json({ error: 'Unknown payment status filter.' }, 400)
    let paymentsQuery = admin
      .from('plan_payments')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
    if (status !== 'all') paymentsQuery = paymentsQuery.eq('status', status)
    const [{ data: payments, count, error: paymentsError }, { count: pendingCount, error: pendingError }] = await Promise.all([
      paymentsQuery.range((page - 1) * perPage, page * perPage - 1),
      admin.from('plan_payments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ])
    if (paymentsError) return json({ error: `Could not load payments: ${paymentsError.message}` }, 500)
    if (pendingError) return json({ error: `Could not count pending payments: ${pendingError.message}` }, 500)

    const userIds = [...new Set((payments || []).map(payment => payment.user_id).filter(Boolean))]
    const { data: profiles, error: profilesError } = userIds.length
      ? await admin.from('profiles').select('id,business_name,whatsapp_number,store_slug,current_plan').in('id', userIds)
      : { data: [], error: null }
    if (profilesError) return json({ error: `Could not load payment owners: ${profilesError.message}` }, 500)

    const profileById = new Map((profiles || []).map(profile => [profile.id, profile]))
    return json({
      payments: (payments || []).map(payment => ({ ...payment, profiles: profileById.get(payment.user_id) || null })),
      page,
      perPage,
      total: count || 0,
      hasMore: page * perPage < (count || 0),
      pendingCount: pendingCount || 0,
    })
  } catch {
    return json({ error: 'Admin request failed.' }, 500)
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await authorize(request)
    if ('response' in auth) return auth.response
    const { admin } = auth
    const body = await request.json().catch(() => null)
    const paymentId = typeof body?.paymentId === 'string' ? body.paymentId : ''
    const status = body?.status
    if (!paymentId || !['approved', 'rejected'].includes(status)) {
      return json({ error: 'Provide a payment ID and an approved or rejected status.' }, 400)
    }

    const { data: payment, error: reviewError } = await admin.rpc('review_plan_payment', {
      p_payment_id: paymentId,
      p_status: status,
    })
    if (reviewError) {
      const message = reviewError.message || 'Payment review failed.'
      const responseStatus = reviewError.code === 'P0002' ? 404
        : reviewError.code === '23505' ? 409
          : reviewError.code === '22023' ? 400
            : 500
      return json({ error: message }, responseStatus)
    }
    if (!payment) return json({ error: 'Payment review returned no result. Refresh and try again.' }, 500)
    return json({ payment })
  } catch (error: any) {
    return json({ error: error?.message || 'Payment update failed.' }, 500)
  }
}
