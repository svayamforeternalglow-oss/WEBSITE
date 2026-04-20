'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';
import { useToastStore } from '@/lib/toast';
import { api } from '@/lib/api';

interface SignupResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

export default function SignupPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const addToast = useToastStore((s) => s.addToast);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      addToast('All fields are required', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = await api.post<SignupResponse>('/users/register', { name, email, password });
      login(data.token, data.name, data.role);
      addToast('Account created successfully!', 'success');
      router.push('/');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-forest px-6">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link href="/" className="mx-auto mb-6 inline-flex">
            <span className="relative block h-[48px] w-[176px] overflow-hidden">
              <Image
                src="/main_logo.png"
                alt="Svayam Natural"
                fill
                sizes="176px"
                className="object-cover object-center"
                priority
              />
            </span>
          </Link>
          <h1 className="font-heading text-2xl font-bold text-sand">Create Account</h1>
          <p className="mt-2 text-sm text-sand/50">Join Svayam Natural today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gold/20 bg-forest-dark/50 p-8 backdrop-blur">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-sand/60">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gold/20 bg-forest/60 px-4 py-3 text-sand placeholder-sand/30 outline-none transition-colors focus:border-gold"
              placeholder="Enter your name"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-sand/60">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gold/20 bg-forest/60 px-4 py-3 text-sand placeholder-sand/30 outline-none transition-colors focus:border-gold"
              placeholder="Enter email"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-sand/60">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gold/20 bg-forest/60 px-4 py-3 text-sand placeholder-sand/30 outline-none transition-colors focus:border-gold"
              placeholder="Create password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gold py-3.5 font-semibold text-forest transition-colors hover:bg-gold-dark disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
          
          <p className="text-center text-sm text-sand/60">
            Already have an account?{' '}
            <Link href="/login" className="text-gold hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
