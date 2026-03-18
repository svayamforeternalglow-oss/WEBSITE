'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/lib/auth';
import { useToastStore } from '@/lib/toast';
import { api } from '@/lib/api';

interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    username: string;
    role: string;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const addToast = useToastStore((s) => s.addToast);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      addToast('Username and password are required', 'error');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post<LoginResponse>('/auth/admin-login', { username, password });
      login(data.token, data.username, data.role);
      addToast('Welcome back!', 'success');
      router.push('/admin/orders');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-forest px-6">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Image src="/Svayam_Logo1.png" alt="Svayam Natural" width={200} height={70} className="mx-auto mb-6 h-14 w-auto" />
          <h1 className="font-heading text-2xl font-bold text-sand">Admin Portal</h1>
          <p className="mt-2 text-sm text-sand/50">Sign in to manage orders and products</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gold/20 bg-forest-dark/50 p-8 backdrop-blur">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-sand/60">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-gold/20 bg-forest/60 px-4 py-3 text-sand placeholder-sand/30 outline-none transition-colors focus:border-gold"
              placeholder="Enter username"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-sand/60">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gold/20 bg-forest/60 px-4 py-3 text-sand placeholder-sand/30 outline-none transition-colors focus:border-gold"
              placeholder="Enter password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gold py-3.5 font-semibold text-forest transition-colors hover:bg-gold-dark disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </section>
  );
}
