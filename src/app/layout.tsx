import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'DataPipe — ETL Pipeline Dashboard',
  description: 'Build, run, and monitor data transform pipelines',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-sm">
            <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
              <div className="flex items-center gap-5">
                <Link href="/" className="text-lg font-bold text-brand-700">
                  DataPipe
                </Link>
                <nav className="flex items-center gap-3 text-sm">
                  <Link href="/" className="text-gray-500 hover:text-gray-900">
                    Dashboard
                  </Link>
                  <Link href="/pipelines/new" className="text-gray-500 hover:text-gray-900">
                    New Pipeline
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
