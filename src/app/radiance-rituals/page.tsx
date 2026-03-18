import type { Metadata } from "next";
import Link from "next/link";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import SectionHeader from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "Radiance Rituals — Face Yoga",
  description:
    "Discover Face Yoga Radiance Rituals by Chaitanya. Transform your face naturally with guided routines, expert programs, and holistic beauty practices.",
};

const programPlans = [
  {
    name: "Mini Program",
    tier: "starter",
    price: "Coming Soon",
    features: [
      "Introduction to Face Yoga basics",
      "5 foundational exercises",
      "Self-assessment guide",
      "Community access",
    ],
  },
  {
    name: "Silver Plan",
    tier: "silver",
    price: "Coming Soon",
    features: [
      "Complete Face Yoga curriculum",
      "Personalized routine plan",
      "Weekly group sessions",
      "Progress tracking tools",
      "Email support",
    ],
  },
  {
    name: "Golden Plan",
    tier: "golden",
    popular: true,
    price: "Coming Soon",
    features: [
      "Everything in Silver",
      "1-on-1 sessions with Chaitanya",
      "Advanced sculpting techniques",
      "Nutrition & lifestyle guidance",
      "Priority support",
      "Certificate of completion",
    ],
  },
  {
    name: "Platinum Plan",
    tier: "platinum",
    price: "Coming Soon",
    features: [
      "Everything in Golden",
      "Unlimited personal consultations",
      "Custom holistic beauty plan",
      "VIP community membership",
      "Exclusive workshops & retreats",
      "Lifetime access to updates",
    ],
  },
];

const testimonials = [
  {
    name: "Ananya R.",
    designation: "Software Engineer",
    plan: "Golden Plan",
    text: "After just 4 weeks of Face Yoga, my jawline became more defined and my skin started glowing. Chaitanya's guidance made all the difference.",
  },
  {
    name: "Priya M.",
    designation: "Teacher",
    plan: "Silver Plan",
    text: "I was skeptical at first, but the results speak for themselves. My friends keep asking what cream I'm using — it's just Face Yoga!",
  },
  {
    name: "Kavitha S.",
    designation: "Entrepreneur",
    plan: "Platinum Plan",
    text: "The holistic approach covering all 5 aspects of beauty transformed not just my face, but my entire outlook on self-care and confidence.",
  },
];

export default function RadianceRitualsPage() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest via-forest-dark to-forest pt-32 pb-24 lg:pt-40 lg:pb-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-gold)_0%,transparent_60%)] opacity-[0.06]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-gold/[0.04] blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <AnimateOnScroll animation="fadeInUp">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.08] px-4 py-1.5 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold-light">
                  Face Yoga by Chaitanya
                </span>
              </div>
              <h1 className="mb-6 font-heading text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                Radiance Rituals
              </h1>
              <p className="mb-4 font-accent text-xl italic text-gold-light/80 md:text-2xl">
                Uplifting countless faces globally, the natural way
              </p>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-sand/60">
                Spreading natural beauty across millions of faces, globally.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <a
                  href="#programs"
                  className="group inline-flex items-center gap-3 rounded-full bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-wider text-forest transition-all duration-300 hover:bg-gold-light hover:shadow-[0_0_40px_rgba(194,162,93,0.3)]"
                >
                  Explore Programs
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
                <a
                  href="#quiz"
                  className="rounded-full border border-gold/40 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-gold transition-all duration-300 hover:border-gold hover:bg-gold hover:text-forest"
                >
                  Take the Quiz
                </a>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ─── About / Founder Story ─── */}
      <section className="bg-cream py-24 lg:py-28" id="about">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <AnimateOnScroll animation="fadeInUp">
            <SectionHeader
              title="About Us"
              subtitle="The story behind Radiance Rituals"
            />
          </AnimateOnScroll>

          <div className="grid items-start gap-12 lg:grid-cols-5 lg:gap-16">
            {/* Photo placeholder */}
            <div className="lg:col-span-2">
              <AnimateOnScroll animation="fadeIn" delay={100}>
                <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-3xl bg-gradient-to-br from-forest/10 via-sage/30 to-gold/10">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-forest/10">
                      <svg className="h-10 w-10 text-forest/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <circle cx="12" cy="8" r="4" />
                        <path d="M5 20c0-4 3.5-7 7-7s7 3 7 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-forest/50">
                      Chaitanya Tambat
                    </p>
                    <p className="mt-1 text-xs text-clay-light">
                      Founder & Chief Instructor
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>

            {/* Story text */}
            <div className="lg:col-span-3">
              <AnimateOnScroll animation="fadeInUp" delay={200}>
                <div className="space-y-6">
                  <p className="text-base leading-relaxed text-clay-light">
                    Welcome to Face Yoga Radiance Rituals! I&rsquo;m Chaitanya,
                    the founder and chief instructor of Face Yoga Radiance Rituals
                    and I&rsquo;m thrilled to share my journey with you. My goal
                    is to help you embrace and carry your inner beauty with
                    confidence, every single day.
                  </p>
                  <p className="text-base leading-relaxed text-clay-light">
                    Growing up, my mother was my greatest inspiration. To me, she
                    embodied beauty in its purest form. I would watch her
                    diligently follow her beauty routines, often tagging along to
                    the salon, believing that beauty treatments were the key to
                    enhancing one&rsquo;s appearance. However, as I matured, I
                    realized that true beauty comes from within. No amount of
                    chemical products could provide the lasting radiance I sought.
                    This realization sparked a journey of exploration that led me
                    to yoga.
                  </p>
                  <p className="text-base leading-relaxed text-clay-light">
                    For the past 15 years, I&rsquo;ve immersed myself in the
                    practice of yoga, discovering its profound impact on my
                    physical, mental and emotional well-being. I began to wonder:
                    could this transformative practice also benefit our faces? And
                    thus, the idea of Radiance Rituals was born. I delved into the
                    anatomy and physiology of the face, learning that just as we
                    train our bodies at the gym, we can also sculpt our facial
                    muscles naturally. The results were incredible! After weeks of
                    practice, friends and family began to notice not just a
                    youthful glow, but a newfound definition in my expressions.
                  </p>
                  <blockquote className="border-l-4 border-gold/40 pl-6 font-accent text-lg italic text-forest/70">
                    &ldquo;I firmly believe that the human body is the ultimate
                    canvas of beauty, waiting to be expressed when we channelize
                    our energies properly. True beauty is natural, much like a
                    breathtaking vibrant sunrise.&rdquo;
                  </blockquote>
                  <p className="text-base leading-relaxed text-clay-light">
                    In 2022, I officially launched Face Yoga Radiance Rituals,
                    incorporating the practice into the five aspects of beauty. In
                    our inaugural year, we witnessed the incredible transformation
                    of over 1,000 faces, each journey marked by a renewed sense of
                    confidence and a vibrant appreciation for their own unique
                    beauty. Today, more than 5,000 individuals have unlocked the
                    transformative magic of Face Yoga, embarking on a path of
                    self-discovery and empowerment that continues to inspire and
                    uplift.
                  </p>
                  <p className="font-medium text-forest">
                    Are you ready to explore your inner beauty? Join us on this
                    beautiful journey and let your true self shine.
                  </p>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Quiz CTA ─── */}
      <section className="relative overflow-hidden bg-forest py-20" id="quiz">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-gold)_0%,transparent_70%)] opacity-[0.04]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-10">
          <AnimateOnScroll animation="fadeInUp">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/20 bg-gold/[0.08]">
              <svg className="h-8 w-8 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <circle cx="12" cy="17" r="0.5" fill="currentColor" />
              </svg>
            </div>
            <h2 className="mb-4 font-heading text-3xl font-bold text-white md:text-4xl">
              Take a Quick Quiz!
            </h2>
            <p className="mb-8 text-sand/60">
              Discover your personalized Face Yoga routine with a short
              questionnaire. Get a free video tutorial tailored to your results.
            </p>
            <a
              href="#"
              className="group inline-flex items-center gap-3 rounded-full bg-gold px-10 py-4 text-sm font-bold uppercase tracking-wider text-forest transition-all duration-300 hover:bg-gold-light hover:shadow-[0_0_40px_rgba(194,162,93,0.3)]"
            >
              Start the Quiz
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ─── Science Behind Face Yoga ─── */}
      <section className="bg-neutral-100 py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <AnimateOnScroll animation="fadeInUp">
            <SectionHeader
              title="Science Behind Face Yoga"
              subtitle="Understanding how facial exercises transform your appearance"
            />
          </AnimateOnScroll>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Facial Muscle Training",
                description:
                  "Your face has over 40 muscles. Just like body workouts tone your physique, targeted facial exercises strengthen and sculpt these muscles, creating natural definition and lift.",
                icon: (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                ),
              },
              {
                title: "Blood Circulation",
                description:
                  "Face Yoga stimulates blood flow to the skin's surface, delivering oxygen and nutrients that promote cell renewal. This natural process creates the coveted 'inner glow' without any products.",
                icon: (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M12 2C6.5 2 2 6.5 2 12c5-1 8-4 10-10z" />
                    <path d="M12 2c5.5 0 10 4.5 10 10-5-1-8-4-10-10z" />
                    <path d="M12 2v20" />
                  </svg>
                ),
              },
              {
                title: "Collagen & Elasticity",
                description:
                  "Regular practice stimulates collagen production and improves skin elasticity naturally. Studies show consistent facial exercises can reduce signs of ageing by years.",
                icon: (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                    <path d="M5 14l1 3 3 1-1-3-3-1z" />
                    <path d="M19 14l-1 3-3 1 1-3 3-1z" />
                  </svg>
                ),
              },
              {
                title: "Face Yoga Effectively Relieves Stress and Significantly Reduces Insomnia",
                description:
                  "The mindful, rhythmic movements of Face Yoga activate the parasympathetic nervous system, calming the mind and body. Regular practice has been shown to lower cortisol levels and improve sleep quality, helping you unwind and rest more deeply.",
                icon: (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M12 3v18M3 12h18" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <AnimateOnScroll key={item.title} animation="fadeInUp" delay={i * 120}>
                <div className="group rounded-2xl border border-neutral-300 bg-white p-8 transition-all duration-400 hover:-translate-y-1 hover:border-gold/30 hover:shadow-[0_16px_48px_rgba(194,162,93,0.06)]">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-forest/10 bg-forest/[0.04] text-forest transition-all duration-300 group-hover:border-gold/30 group-hover:bg-gold/[0.06] group-hover:text-gold-dark">
                    {item.icon}
                  </div>
                  <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-clay-light">
                    {item.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Experience Face Yoga ─── */}
      <section className="bg-cream py-24 lg:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
          <AnimateOnScroll animation="fadeInUp">
            <h2 className="mb-4 font-heading text-3xl font-bold text-forest md:text-4xl">
              Experience Face Yoga with Me!
            </h2>
            <p className="mb-3 font-accent text-xl italic text-gold-dark">
              For Free!
            </p>
            <p className="mx-auto mb-10 max-w-lg text-sm leading-relaxed text-clay-light">
              Watch a guided session and feel the difference. Your journey to
              natural radiance starts with a single practice.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fadeIn" delay={200}>
            <div className="relative mx-auto aspect-video max-w-2xl overflow-hidden rounded-2xl border border-neutral-300 bg-forest/[0.03]">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 transition-all hover:bg-gold/20">
                  <svg className="ml-1 h-8 w-8 text-gold" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-clay-light">
                  Video coming soon
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ─── Meet Your Expert ─── */}
      <section className="bg-neutral-100 py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <AnimateOnScroll animation="fadeInUp">
            <SectionHeader
              title="Meet Your Expert"
              subtitle="Guided by passion, driven by transformation"
            />
          </AnimateOnScroll>

          <AnimateOnScroll animation="fadeIn" delay={150}>
            <div className="mx-auto max-w-3xl rounded-3xl border border-neutral-300 bg-white p-10 text-center md:p-14">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-forest/10 to-sage/30">
                <svg className="h-12 w-12 text-forest/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5 20c0-4 3.5-7 7-7s7 3 7 7" />
                </svg>
              </div>
              <h3 className="mb-1 font-heading text-2xl font-bold text-forest">
                Chaitanya Tambat
              </h3>
              <p className="mb-6 text-sm text-clay-light">
                Founder & Chief Instructor, Face Yoga Radiance Rituals
              </p>
              <p className="font-accent text-lg italic leading-relaxed text-forest/70">
                15+ years of yoga practice. 5,000+ faces transformed. A mission
                to help every individual discover their unique, natural, and
                everlasting beauty.
              </p>
              <div className="mx-auto mt-6 h-[1px] w-20 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
              <p className="mt-6 text-sm text-clay-light">
                Detailed instructor profile coming soon.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="bg-cream py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <AnimateOnScroll animation="fadeInUp">
            <SectionHeader
              title="Transformations"
              subtitle="Real stories from our Radiance Rituals community"
            />
          </AnimateOnScroll>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <AnimateOnScroll key={t.name} animation="fadeInUp" delay={i * 120}>
                <div className="relative rounded-2xl border border-neutral-300 bg-white p-8 transition-all duration-400 hover:-translate-y-1 hover:border-gold/20 hover:shadow-[0_16px_48px_rgba(194,162,93,0.06)]">
                  <svg className="mb-4 h-8 w-8 text-gold/40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.3 4.2c-.1-.2-.4-.3-.6-.1L6 7.5C4.8 8.5 4 10 4 11.5 4 14 6 16 8.5 16c1.4 0 2.5-1.1 2.5-2.5S9.9 11 8.5 11c-.2 0-.3 0-.5.1C8.4 9.2 9.6 7.8 11.2 7c.2-.1.3-.3.1-.5l-1-2.3zM20.3 4.2c-.1-.2-.4-.3-.6-.1L15 7.5c-1.2 1-2 2.5-2 4 0 2.5 2 4.5 4.5 4.5 1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5c-.2 0-.3 0-.5.1.4-1.9 1.6-3.3 3.2-4.1.2-.1.3-.3.1-.5l-1-2.3z" />
                  </svg>
                  <p className="mb-6 font-accent text-base leading-relaxed italic text-forest/70">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <p className="mb-1 inline-block rounded-full bg-sage/20 px-3 py-1 text-[11px] font-medium tracking-wider text-forest/60">
                    {t.plan}
                  </p>
                  <div className="mt-4 flex items-center gap-3 border-t border-neutral-300 pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest font-heading text-sm font-bold text-sand">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-forest">
                        {t.name}
                      </p>
                      <p className="text-xs text-clay-light">
                        {t.designation}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Program Plans ─── */}
      <section className="bg-neutral-100 py-24 lg:py-28" id="programs">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <AnimateOnScroll animation="fadeInUp">
            <SectionHeader
              title="Program Plans"
              subtitle="Choose the journey that fits your goals — highlighting the 5 aspects of beauty"
            />
          </AnimateOnScroll>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {programPlans.map((plan, i) => (
              <AnimateOnScroll key={plan.name} animation="fadeInUp" delay={i * 100}>
                <div
                  className={`relative flex h-full flex-col rounded-2xl border p-8 transition-all duration-400 hover:-translate-y-1 ${
                    plan.popular
                      ? "border-gold/40 bg-white shadow-[0_8px_40px_rgba(194,162,93,0.1)]"
                      : "border-neutral-300 bg-white hover:border-gold/20 hover:shadow-[0_16px_48px_rgba(194,162,93,0.06)]"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-forest">
                      Most Popular
                    </span>
                  )}
                  <h3 className="mb-2 font-heading text-xl font-bold text-forest">
                    {plan.name}
                  </h3>
                  <p className="mb-6 text-2xl font-bold text-gold-dark">
                    {plan.price}
                  </p>
                  <ul className="mb-8 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-clay-light"
                      >
                        <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-sage" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full rounded-lg py-3 text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                      plan.popular
                        ? "bg-gold text-forest hover:bg-gold-dark"
                        : "border border-forest/20 text-forest hover:border-forest hover:bg-forest hover:text-sand"
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WhatsApp CTA ─── */}
      <section className="relative overflow-hidden bg-forest py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--color-gold)_0%,transparent_60%)] opacity-[0.05]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-10">
          <AnimateOnScroll animation="fadeInUp">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366]/10">
              <svg className="h-8 w-8 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <h2 className="mb-4 font-heading text-3xl font-bold text-white md:text-4xl">
              Join Our Community
            </h2>
            <p className="mb-4 font-accent text-lg italic text-gold-light/80">
              Join us in celebrating this remarkable journey toward self-love and
              holistic well-being!
            </p>
            <p className="mb-8 text-sand/50">
              Connect with fellow practitioners, get daily tips, and be part of
              the Radiance Rituals family.
            </p>
            <a
              href="https://chat.whatsapp.com/PLACEHOLDER"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 rounded-full bg-[#25D366] px-10 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(37,211,102,0.3)]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Join WhatsApp Group
            </a>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="bg-sand py-20">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <AnimateOnScroll animation="fadeInUp">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-clay-light">
              Your Transformation Awaits
            </p>
            <h2 className="mb-6 font-heading text-3xl font-bold text-forest md:text-4xl">
              Let Your True Self Shine
            </h2>
            <p className="mx-auto mb-10 max-w-md font-accent text-lg italic text-clay-light">
              You deserve to express your unique, natural, and everlasting
              beauty. Let&rsquo;s embark on this transformative path together!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="#programs"
                className="group inline-flex items-center gap-3 rounded-full bg-forest px-10 py-4 text-sm font-semibold uppercase tracking-wider text-sand transition-all duration-300 hover:bg-forest-dark hover:shadow-[0_8px_40px_rgba(15,46,31,0.2)]"
              >
                View Programs
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <Link
                href="/products"
                className="rounded-full border border-forest/20 px-10 py-4 text-sm font-semibold uppercase tracking-wider text-forest transition-all duration-300 hover:border-forest hover:bg-forest hover:text-sand"
              >
                Shop Products
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
