'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.svayamnatural.com/api/v1';
const DEFAULT_MESSAGE = 'Welcome to Svayam Natural - our new website is live.';

const TONE_STYLES: Record<string, { container: string; flair: string; link: string }> = {
  info: {
    container: 'bg-forest text-sand',
    flair: 'bg-sand/15 text-sand',
    link: 'text-sand/90 hover:text-sand',
  },
  warning: {
    container: 'bg-amber-950 text-amber-100',
    flair: 'bg-amber-500/20 text-amber-100',
    link: 'text-amber-100/90 hover:text-amber-100',
  },
  urgent: {
    container: 'bg-red-950 text-red-100',
    flair: 'bg-red-500/20 text-red-100',
    link: 'text-red-100/90 hover:text-red-100',
  },
};

type BannerConfig = {
  text: string;
  link: string;
  flair: string;
  tone: string;
};

const EMPTY_CONFIG: BannerConfig = {
  text: '',
  link: '',
  flair: '',
  tone: 'info',
};

export default function TopBanner() {
  const [config, setConfig] = useState<BannerConfig>(EMPTY_CONFIG);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/site-config`);
        if (!res.ok) throw new Error('API not available');
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) throw new Error('Not JSON');
        const data = await res.json();
        if (data.success) {
          const map = data.data.map || {};
          setConfig({
            text: map.announcement_bar_text || '',
            link: map.announcement_bar_link || '',
            flair: map.announcement_bar_flair || '',
            tone: map.announcement_bar_tone || 'info',
          });
        }
      } catch {
        // Keep defaults when remote config is unavailable.
      }
    })();
  }, []);

  const message = config.text?.trim() ? config.text.trim() : DEFAULT_MESSAGE;
  const tone = (config.tone || 'info').toLowerCase();
  const styles = TONE_STYLES[tone] || TONE_STYLES.info;
  const flair = config.flair?.trim();

  const content = useMemo(() => {
    if (config.link?.trim()) {
      return (
        <Link href={config.link} className={`inline-flex items-center gap-2 ${styles.link}`}>
          <span>{message}</span>
        </Link>
      );
    }

    return <span>{message}</span>;
  }, [config.link, message, styles.link]);

  return (
    <div className={`px-4 py-2 text-center text-[11px] sm:text-xs font-semibold tracking-wider ${styles.container}`}>
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-2">
        {flair && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] ${styles.flair}`}>
            {flair}
          </span>
        )}
        {content}
      </div>
    </div>
  );
}
