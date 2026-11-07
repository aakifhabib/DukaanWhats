import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://dukaanwhats.pk'
  const fixedRoutes = ['', '/about', '/plans', '/pricing', '/privacy', '/terms'].map(path => ({ url: `${base}${path}`, changeFrequency: 'weekly' as const, priority: path === '' ? 1 : 0.6 }))
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return fixedRoutes
  try {
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
    const { data } = await supabase.from('profiles').select('store_slug').not('store_slug', 'is', null).order('store_slug').limit(5000)
    const stores = (data || []).filter(row => typeof row.store_slug === 'string' && /^[a-z0-9-]{3,63}$/.test(row.store_slug)).map(row => ({ url: `${base}/s/${encodeURIComponent(row.store_slug)}`, changeFrequency: 'daily' as const, priority: 0.7 }))
    return [...fixedRoutes, ...stores]
  } catch {
    return fixedRoutes
  }
}
