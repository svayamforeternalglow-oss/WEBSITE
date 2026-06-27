import type { Metadata } from "next";
import SectionHeader from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "Sustainability — Svayam Natural",
  description:
    "Our commitment to sustainable, eco-friendly practices in sourcing, packaging, and production.",
};

export default function SustainabilityPage() {
  return (
    <main className="min-h-screen bg-cream pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <SectionHeader
          title="Sustainability"
          subtitle="Our commitment to the planet"
        />
        <p className="mb-10 text-sm text-clay-light">
          Rooted in nature, guided by tradition.
        </p>
        <div className="space-y-8 text-clay-light">
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Mindful Sourcing
            </h3>
            <p className="leading-relaxed">
              We source our ingredients from trusted, ethical growers who share our respect for the land. Every herb, oil, and botanical is chosen not only for its potency but for the sustainability of its harvest. We prioritise partnerships that support regenerative agriculture and fair-trade practices.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Eco-Conscious Packaging
            </h3>
            <p className="leading-relaxed">
              Our packaging is designed with the environment in mind. Wherever possible, we use glass, paper, and other materials that can be reused, recycled, or returned to the earth. We continue to reduce plastic and explore innovative alternatives that leave a lighter footprint.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Small-Batch Production
            </h3>
            <p className="leading-relaxed">
              Every product is made in small batches to minimise waste and ensure the highest quality. By crafting intentionally, we reduce overproduction and the energy burden of large-scale manufacturing. This approach also allows us to maintain the freshness and potency of every formulation.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Cruelty-Free & Clean
            </h3>
            <p className="leading-relaxed">
              We never test on animals. Our formulations are free from synthetic fragrances, parabens, sulphates, and other harsh chemicals — kind to your body and the ecosystem. We believe true beauty should never come at the cost of another being.
            </p>
          </section>
          <section>
            <h3 className="mb-3 font-heading text-lg font-semibold text-forest">
              Continuous Improvement
            </h3>
            <p className="leading-relaxed">
              Sustainability is not a destination but an ongoing practice. We regularly review our supply chain, packaging choices, and operations to identify areas where we can do better. We welcome feedback from our community as we strive toward a more harmonious relationship with nature.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
