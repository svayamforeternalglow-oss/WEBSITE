'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/auth';

const sidebarLinks = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Orders', href: '/admin/orders', icon: '📦' },
  { label: 'Products', href: '/admin/products', icon: '🧴' },
  { label: 'Concerns', href: '/admin/concerns', icon: '🎯' },
  { label: 'Site Settings', href: '/admin/settings', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, username, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-neutral-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-forest transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gold/10 px-6 py-5">
          <Link href="/" className="inline-flex">
            <span className="relative block h-[36px] w-[132px] overflow-hidden">
              <Image
                src="/main_logo.png"
                alt="Svayam Natural"
                fill
                sizes="132px"
                className="object-cover object-center"
                priority
              />
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="text-sand/50 hover:text-sand lg:hidden">
            ✕
          </button>
        </div>

        <nav className="flex-1 px-4 py-6">
          <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-sand/30">Dashboard</p>
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className={`mb-1 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-gold/15 text-gold'
                  : 'text-sand/50 hover:bg-sand/5 hover:text-sand'
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gold/10 px-6 py-4">
          <p className="mb-1 text-xs text-sand/40">Signed in as</p>
          <p className="mb-3 text-sm font-semibold text-gold">{username}</p>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-sand/15 py-2 text-xs font-medium text-sand/50 transition-colors hover:border-sand/30 hover:text-sand"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-forest/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b border-neutral-300 bg-white px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-forest lg:hidden"
            aria-label="Open sidebar"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="font-heading text-lg font-bold text-forest">
            {sidebarLinks.find((l) => l.href === pathname)?.label || 'Admin'}
          </h1>
          <Link href="/" className="ml-auto text-sm text-clay hover:text-forest">
            ← Back to Store
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
