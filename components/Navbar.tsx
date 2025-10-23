'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingCart, Menu, X, LogIn, LogOut, User2, UserPlus } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { data: session, status } = useSession();

  // ✅ avoid hydration mismatch: don’t render dynamic bits until mounted
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isAuthed = status === 'authenticated';
  const role = (session?.user as any)?.role;
  const isAdmin = role === 'admin';

  return (
    <nav className="bg-black text-white border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            FREAKTHETIX
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
            <Link href="/shop" className="hover:text-gray-300 transition-colors">Shop</Link>
            <Link href="/catalog" className="hover:text-gray-300 transition-colors">Catalog</Link>
            <Link href="/contact" className="hover:text-gray-300 transition-colors">Contact</Link>
            {isAdmin && (
              <Link href="/admin" className="hover:text-gray-300 transition-colors">Admin</Link>
            )}

            <Link href="/cart" className="hover:text-gray-300 transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              {/* ✅ render badge only after mount to match server HTML */}
              {mounted && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth buttons */}
            {mounted && isAuthed ? (
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 hover:text-gray-300"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="flex items-center gap-2 hover:text-gray-300">
                  <LogIn className="w-4 h-4" /> Login
                </Link>
                <Link href="/signup" className="flex items-center gap-2 hover:text-gray-300">
                  <UserPlus className="w-4 h-4" /> Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-white/10">
          <div className="px-4 py-4 space-y-4">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="block hover:text-gray-300">Home</Link>
            <Link href="/shop" onClick={() => setIsMenuOpen(false)} className="block hover:text-gray-300">Shop</Link>
            <Link href="/catalog" onClick={() => setIsMenuOpen(false)} className="block hover:text-gray-300">Catalog</Link>
            <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="block hover:text-gray-300">Contact</Link>
            {isAdmin && (
              <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="block hover:text-gray-300">Admin</Link>
            )}
            <Link href="/cart" onClick={() => setIsMenuOpen(false)} className="block hover:text-gray-300">
              {/* ✅ mobile label also waits for mount */}
              Cart{mounted && totalItems > 0 ? ` (${totalItems})` : ''}
            </Link>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <User2 className="w-4 h-4" />
                {mounted && isAuthed ? (session?.user?.email || 'Account') : 'Guest'}
              </div>
              {mounted && isAuthed ? (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut();
                  }}
                  className="hover:text-gray-300"
                >
                  Logout
                </button>
              ) : (
                <div className="flex gap-3">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="hover:text-gray-300">
                    Login
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="hover:text-gray-300">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
