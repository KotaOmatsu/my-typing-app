import AuthProvider from '../components/AuthProvider';
import Header from '../components/Header';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Precision Typing',
  description: '正確性を重視した日本語タイピング練習アプリ',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider session={session}>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
