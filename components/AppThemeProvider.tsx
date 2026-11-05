'use client'

import type { ReactNode } from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  )
}
