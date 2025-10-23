'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') || '');
    const email = String(fd.get('email') || '');
    const password = String(fd.get('password') || '');
    const confirm = String(fd.get('confirm') || '');

    if (password !== confirm) {
      alert('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Signup failed');

      // Auto-login
      const login = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (login?.ok) {
        router.push('/');
      } else {
        router.push('/login');
      }
    } catch (err: any) {
      alert(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 border border-white/10 p-6 rounded-md"
      >
        <h1 className="text-2xl font-semibold text-center">Create Account</h1>

        <div>
          <label className="block text-sm mb-1">Full Name</label>
          <input
            name="name"
            required
            className="w-full p-2 text-black"
            placeholder="John Doe"
          />
        </div>

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

        <div>
          <label className="block text-sm mb-1">Confirm Password</label>
          <input
            name="confirm"
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
          {loading ? 'Creating…' : 'Sign Up'}
        </button>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-white underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
