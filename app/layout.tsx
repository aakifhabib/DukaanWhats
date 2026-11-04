import './globals.css';

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
