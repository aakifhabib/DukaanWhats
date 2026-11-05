import StorePageClient from './StorePageClient'

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <StorePageClient slug={slug} />
}
