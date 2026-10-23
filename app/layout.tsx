import './globals.css';
export const metadata = { title: 'DukaanWhats - WhatsApp Store Builder', description: 'Turn WhatsApp into a real store in 60 seconds' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}