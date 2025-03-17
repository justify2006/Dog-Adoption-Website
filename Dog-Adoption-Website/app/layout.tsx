import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Paws & Hearts - Dog Adoption Center',
  description: 'Find your perfect furry companion!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-blue-600 text-white">
            <div className="container mx-auto p-4">
              <nav className="flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold">
                  Justin's Dog Adoption Center
                </Link>
                <div className="space-x-6">
                  <Link href="/" className="hover:underline">
                    Home
                  </Link>
                  <Link href="/breeds" className="hover:underline">
                    Breeds
                  </Link>
                  <Link href="/admin" className="hover:underline">
                    Admin Page
                  </Link>
                </div>
              </nav>
            </div>
          </header>

          <main className="flex-grow">
            {children}
          </main>

          <footer className="bg-gray-100">
            <div className="container mx-auto p-4 text-center text-gray-600">
              <p>Justin's Dog Adoption Center. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}