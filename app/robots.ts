import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/dashboard', '/api', '/auth', '/reset-password'] }],
    sitemap: 'https://dukaanwhats.pk/sitemap.xml',
    host: 'https://dukaanwhats.pk',
  }
}
