import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "Shipping Policy — Svayam Natural",
  description:
    "Shipping, delivery timelines, and areas we serve. Learn how we pack and deliver your Svayam Natural orders.",
};

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-cream pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <SectionHeader
          title="Shipping Policy"
          subtitle="How we deliver your orders"
        />
        <p className="mb-10 text-sm text-clay-light">
          Last updated: March 2025
        </p>
        <div className="space-y-8 text-clay-light">
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Processing time
            </h3>
            <p className="leading-relaxed">
              Orders are processed within 2–3 business days (excluding weekends and holidays). You will receive an email confirmation with tracking details once your order is shipped.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Delivery areas
            </h3>
            <p className="leading-relaxed">
              We currently ship across India. Delivery timelines vary by location and carrier—typically 3–7 business days after dispatch. Remote or pin codes serviced by partners may take longer.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Shipping charges
            </h3>
            <p className="leading-relaxed">
              Shipping charges are calculated at checkout based on your address and order weight. Free shipping may apply on orders above a certain value as per ongoing promotions.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Tracking
            </h3>
            <p className="leading-relaxed">
              Use the tracking link in your shipment email or visit our Order Tracking page and enter your order ID to see the current status of your delivery.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Contact
            </h3>
            <p className="leading-relaxed">
              For any shipping-related questions, please reach out via the contact details on our website. We are happy to help.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
