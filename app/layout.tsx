import './globals.css';
import { SiteFooter } from '@/components/SiteFooter';
import { AppThemeProvider } from '@/components/AppThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata = {
  title: {
    default: 'DukaanWhats.pk — Your WhatsApp store, made simple',
    template: '%s | DukaanWhats.pk',
  },
  description: 'Create a beautiful online store in minutes. Share your products and receive orders directly on WhatsApp — built for Pakistani sellers.',
  applicationName: 'DukaanWhats.pk',
  openGraph: {
    title: 'DukaanWhats.pk — Your WhatsApp store, made simple',
    description: 'Create a beautiful online store and take orders directly on WhatsApp.',
    siteName: 'DukaanWhats.pk',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppThemeProvider>
          <ThemeToggle />
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
        </AppThemeProvider>
      </body>
    </html>
  );
}
