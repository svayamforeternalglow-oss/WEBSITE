import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "Terms of Service — Svayam Natural",
  description:
    "Terms and conditions for using the Svayam Natural website and services.",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-cream pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <SectionHeader
          title="Terms of Service"
          subtitle="Please read these terms carefully"
        />
        <p className="mb-10 text-sm text-clay-light">
          Last updated: March 2025
        </p>
        <div className="space-y-8 text-clay-light">
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Acceptance of terms
            </h3>
            <p className="leading-relaxed">
              By accessing or using the Svayam Natural website and services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our site or services.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Use of the website
            </h3>
            <p className="leading-relaxed">
              You may use our website for lawful purposes only. You must not misuse the site, attempt to gain unauthorized access, transmit harmful code, or use our services in any way that could damage, disable, or impair the website or others&apos; use of it.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Orders and payment
            </h3>
            <p className="leading-relaxed">
              All orders are subject to acceptance and availability. Prices are in Indian Rupees and are subject to change. You are responsible for providing accurate delivery and payment details. By placing an order, you confirm that you are authorized to use the chosen payment method.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Intellectual property
            </h3>
            <p className="leading-relaxed">
              Content on this website—including text, images, logos, and design—is owned by Svayam Natural or its licensors. You may not copy, modify, or use our content for commercial purposes without our prior written consent.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Limitation of liability
            </h3>
            <p className="leading-relaxed">
              To the fullest extent permitted by law, Svayam Natural shall not be liable for any indirect, incidental, or consequential damages arising from your use of the website or products. Our liability for any claim related to your use of our services is limited to the amount you paid for the relevant order.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Governing law
            </h3>
            <p className="leading-relaxed">
              These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of India.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Changes
            </h3>
            <p className="leading-relaxed">
              We may update these Terms of Service from time to time. The &quot;Last updated&quot; date indicates the latest version. Your continued use of the website after changes constitutes acceptance of the revised terms.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Contact
            </h3>
            <p className="leading-relaxed">
              For questions about these terms, please contact us using the details provided on our website.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
