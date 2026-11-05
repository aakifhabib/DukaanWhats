'use client'

import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const nextMode = isDark ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(nextMode)}
      aria-label={`Switch to ${nextMode} mode`}
      title={`Switch to ${nextMode} mode`}
      className="site-theme-toggle fixed right-4 top-[calc(env(safe-area-inset-top)+5rem)] z-[95] inline-flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-black/10 bg-white/95 text-xs font-semibold text-zinc-800 shadow-lg backdrop-blur transition hover:border-black hover:bg-black hover:text-white sm:w-auto sm:px-4"
    >
      {isDark ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z"/></svg>
      )}
      <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
