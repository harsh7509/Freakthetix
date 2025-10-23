import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/lib/cart-context';
import ClientSessionProvider from '@/components/ClientSessionProvider'; // 👈 new import

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Freakthetix - Premium Streetwear',
  description: 'Premium streetwear for the modern generation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white min-h-screen flex flex-col`}>
        <ClientSessionProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </ClientSessionProvider>
      </body>
    </html>
  );
}
