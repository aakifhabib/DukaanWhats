import './globals.css';

export const metadata = {
  title: 'DukaanWhats.pk',
  description: 'Free WhatsApp store builder'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
