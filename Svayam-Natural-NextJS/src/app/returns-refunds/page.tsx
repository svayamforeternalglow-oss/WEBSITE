import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "Returns & Refunds — Svayam Natural",
  description:
    "Our return and refund policy. Learn how to request a return or refund for your Svayam Natural order.",
};

export default function ReturnsRefundsPage() {
  return (
    <main className="min-h-screen bg-cream pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <SectionHeader
          title="Returns & Refunds"
          subtitle="Our commitment to your satisfaction"
        />
        <p className="mb-10 text-sm text-clay-light">
          Last updated: March 2025
        </p>
        <div className="space-y-8 text-clay-light">
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Return window
            </h3>
            <p className="leading-relaxed">
              You may request a return within 7–14 days of delivery, subject to the product being unused, unopened (where applicable), and in original packaging. Some items may be non-returnable due to hygiene or nature of the product.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              How to return
            </h3>
            <p className="leading-relaxed">
              Contact us with your order ID and reason for return. Once approved, we will share return instructions and, where applicable, a return label or pickup details. Please pack the product securely to avoid damage in transit.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Refunds
            </h3>
            <p className="leading-relaxed">
              Refunds are processed after we receive and inspect the returned item. The amount will be credited to the original payment method within 5–10 business days. For failed or cancelled payments, any amount held will be released as per the bank or payment provider&apos;s policy.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Damaged or wrong items
            </h3>
            <p className="leading-relaxed">
              If you receive a damaged or incorrect item, please notify us within 48 hours of delivery with photos. We will arrange a replacement or full refund as appropriate.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Contact
            </h3>
            <p className="leading-relaxed">
              For return or refund requests, use the contact details on our website. Our team will guide you through the process.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
