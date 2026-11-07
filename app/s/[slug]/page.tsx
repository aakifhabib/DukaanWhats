import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import StorePageClient from './StorePageClient'

const SITE_URL = 'https://dukaanwhats.pk'

async function getPublicStore(slug: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
  const { data: store } = await client.from('profiles').select('id,business_name,store_slug').eq('store_slug', slug).maybeSingle()
  if (!store) return null
  const { data: seo } = await client.from('profiles').select('seo_title,seo_description').eq('id', store.id).maybeSingle()
  const { data: product } = await client.from('products').select('image_url').eq('user_id', store.id).not('image_url', 'is', null).order('created_at', { ascending: false }).limit(1).maybeSingle()
  return { ...store, ...(seo || {}), cover: product?.image_url || null }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const store = await getPublicStore(slug)
  if (!store) return { title: 'Store not found', robots: { index: false, follow: false } }
  const title = store.seo_title?.trim() || `${store.business_name || 'Online Store'} | DukaanWhats`
  const description = store.seo_description?.trim() || `Browse products from ${store.business_name || 'this store'} and order directly on WhatsApp.`
  const canonical = `${SITE_URL}/s/${encodeURIComponent(slug)}`
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: 'DukaanWhats', type: 'website', ...(store.cover ? { images: [{ url: store.cover, alt: `${store.business_name} products` }] } : {}) },
    twitter: { card: 'summary_large_image', title, description, ...(store.cover ? { images: [store.cover] } : {}) },
  }
}

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <StorePageClient slug={slug} />
}
