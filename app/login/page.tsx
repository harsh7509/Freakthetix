'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const sp = useSearchParams();
  const error = sp.get('error');
  const router = useRouter();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') || '');
    const password = String(form.get('password') || '');

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: '/',
    });

    setLoading(false);

    if (res?.ok) {
      router.push('/');
    } else {
      alert(res?.error || 'Login failed');
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 border border-white/10 p-6 rounded-md"
      >
        <h1 className="text-2xl font-semibold text-center">Login</h1>

        {error && (
          <p className="text-sm text-red-400 text-center">
            {error === 'CredentialsSignin'
              ? 'Invalid email or password'
              : error}
          </p>
        )}

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full p-2 text-black"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            name="password"
            type="password"
            required
            className="w-full p-2 text-black"
            placeholder="••••••••"
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-white text-black py-2 font-medium hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <p className="text-center text-sm text-gray-400">
          Don’t have an account?{' '}
          <Link href="/signup" className="text-white underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
