'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/about', label: 'About' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/privacy', label: 'Privacy policy' },
  { href: '/terms', label: 'Terms of service' },
]

export function SiteFooter() {
  const pathname = usePathname()
  // The landing page has its own compact footer; keep the global footer on all other routes.
  if (pathname === '/') return null

  return (
    <footer id="site-footer" className="mt-auto border-t border-black/10 bg-white px-5 py-8 text-[#111] sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 rounded-sm font-bold tracking-tight">
            <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-[10px] bg-black text-sm font-black text-[#E8FF86]">D</span>
            <span>DukaanWhats.pk</span>
          </Link>
          <p className="mt-2 max-w-sm text-xs leading-5 text-zinc-500">A simple WhatsApp storefront for Pakistani sellers. Built in Islamabad, Pakistan.</p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-2">
          {links.map(({ href, label }) => (
            <Link key={href} href={href} className="inline-flex min-h-10 items-center justify-center rounded-full border border-black/10 bg-[#F8F7F5] px-4 text-xs font-semibold hover:border-black hover:bg-black hover:text-white focus-visible:outline-offset-2">
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-1 border-t border-black/[0.06] pt-4 text-[11px] text-zinc-400 sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} DukaanWhats.pk · Islamabad, Pakistan</span>
        <span>Built for local sellers, wherever they are.</span>
      </div>
    </footer>
  )
}
