import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: {
    default: 'ElevateCRM',
    template: '%s | ElevateCRM',
  },
  description: 'India\'s AI-Powered CRM — Built for Indian Sales Teams',
  keywords: ['CRM', 'AI', 'Sales', 'Leads', 'Pipeline', 'India', 'Indian CRM', 'Sales CRM India'],
  authors: [{ name: 'ElevateCRM' }],
  openGraph: {
    title: 'ElevateCRM — India\'s Smart Sales CRM',
    description: 'India\'s AI-Powered CRM — Built for Indian Sales Teams',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
