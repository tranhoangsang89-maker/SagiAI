import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://sagi-ai.vercel.app'),
  title: 'Sagi - Đại sứ số AI | Sang Citizen',
  description: 'Trợ lý ảo AI B2B Lean System - Giải pháp tự động hóa và chăm sóc khách hàng 24/7 từ Sang Citizen.',
  openGraph: {
    title: 'Sagi - Đại sứ số AI | Sang Citizen',
    description: 'Trợ lý ảo AI B2B Lean System - Giải pháp tự động hóa và chăm sóc khách hàng 24/7 từ Sang Citizen.',
    url: 'https://sagi-ai.vercel.app',
    siteName: 'Sagi AI Workspace',
    images: [
      {
        url: '/avatar.jpeg',
        width: 1200,
        height: 630,
        alt: 'Sagi - Đại sứ số AI',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sagi - Đại sứ số AI | Sang Citizen',
    description: 'Trợ lý ảo AI B2B Lean System - Giải pháp tự động hóa và chăm sóc khách hàng 24/7 từ Sang Citizen.',
    images: ['/avatar.jpeg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
