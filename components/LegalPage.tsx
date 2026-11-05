import type { ReactNode } from 'react'
import Link from 'next/link'

export function LegalPage({ title, summary, children }: { title: string; summary: string; children: ReactNode }) {
  return (
    <div data-app-page className="min-h-screen bg-[#F8F7F5] text-[#111]">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex h-[68px] max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="inline-flex items-center gap-2.5 rounded-sm font-black tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-black text-sm text-[#E8FF86]">D</span>
            DukaanWhats.pk
          </Link>
          <Link href="/about" className="text-xs font-semibold text-zinc-600 underline-offset-4 hover:text-black hover:underline">About us</Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
        <article className="mx-auto max-w-3xl rounded-[28px] border border-black/[0.06] bg-white p-6 sm:p-10">
          <p className="text-[10px] font-black tracking-[0.18em] text-zinc-400">DUKAANWHATS.PK · LEGAL</p>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.045em] sm:text-5xl">{title}</h1>
          <p className="mt-4 text-base leading-7 text-zinc-600">{summary}</p>
          <p className="mt-4 text-xs text-zinc-400">Effective date: November 4, 2026</p>
          <div className="mt-9 divide-y divide-black/[0.07]">{children}</div>
          <p className="mt-9 rounded-2xl bg-[#F8F7F5] p-4 text-sm leading-6 text-zinc-600">Questions? Contact us at <a className="font-semibold text-black underline underline-offset-4" href="mailto:hello@dukaanwhats.pk">hello@dukaanwhats.pk</a>.</p>
        </article>
      </main>
    </div>
  )
}
