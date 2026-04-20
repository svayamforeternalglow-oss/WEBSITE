"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ComingSoonPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-forest p-6 text-center">
      <Link href="/" className="mb-12 inline-flex">
        <span className="relative block h-[48px] w-[176px] overflow-hidden sm:h-[58px] sm:w-[212px]">
          <Image
            src="/main_logo.png"
            alt="Svayam Natural"
            fill
            sizes="(max-width: 639px) 176px, 212px"
            className="object-cover object-center"
            priority
          />
        </span>
      </Link>

      <div className="mx-auto w-full max-w-lg rounded-2xl border border-gold/20 bg-forest-dark/50 p-10 pb-12 shadow-2xl backdrop-blur">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
          <svg className="h-8 w-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        
        <h1 className="mb-4 font-heading text-3xl font-bold text-sand sm:text-4xl">
          Coming Soon
        </h1>
        
        <p className="mb-8 font-accent text-lg italic tracking-wide text-sand/60">
          We are currently crafting this experience for you. Please check back later.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={() => router.back()}
            className="rounded-full border border-gold/30 px-8 py-3 text-sm font-semibold tracking-widest text-gold transition-all hover:bg-gold/10"
          >
            GO BACK
          </button>
          <Link
            href="/"
            className="rounded-full bg-gold px-8 py-3 text-sm font-semibold tracking-widest text-forest transition-all hover:bg-gold-light"
          >
            RETURN HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
