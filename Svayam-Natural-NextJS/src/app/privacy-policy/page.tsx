import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "Privacy Policy — Svayam Natural",
  description:
    "How Svayam Natural collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-cream pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <SectionHeader
          title="Privacy Policy"
          subtitle="Your data and how we use it"
        />
        <p className="mb-10 text-sm text-clay-light">
          Last updated: March 2025
        </p>
        <div className="space-y-8 text-clay-light">
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Information we collect
            </h3>
            <p className="leading-relaxed">
              We collect information you provide when you create an account, place an order, subscribe to updates, or contact us. This may include name, email, phone number, shipping and billing address, and payment-related details. We also collect usage data such as IP address and device information to improve our site and services.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              How we use your information
            </h3>
            <p className="leading-relaxed">
              We use your information to process orders, send order and shipping updates, respond to enquiries, send promotional communications (where you have opted in), improve our website and products, and comply with legal obligations.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Sharing and disclosure
            </h3>
            <p className="leading-relaxed">
              We do not sell your personal data. We may share information with service providers who assist in payment processing, shipping, and analytics, under strict confidentiality. We may disclose information when required by law or to protect our rights and safety.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Security
            </h3>
            <p className="leading-relaxed">
              We use industry-standard measures to protect your data, including encryption and secure channels. Payment details are processed by certified payment gateways; we do not store full card numbers.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Your rights
            </h3>
            <p className="leading-relaxed">
              You may request access to, correction of, or deletion of your personal data where applicable by law. You can unsubscribe from marketing emails at any time. For requests or questions about this policy, please contact us using the details on our website.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Changes
            </h3>
            <p className="leading-relaxed">
              We may update this privacy policy from time to time. The &quot;Last updated&quot; date at the top reflects the latest version. Continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
