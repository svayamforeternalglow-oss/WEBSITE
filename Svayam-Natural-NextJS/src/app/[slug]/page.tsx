import { redirect, notFound } from 'next/navigation';
import { fetchProductBySlug } from '@/lib/productApi';

export const dynamic = 'force-dynamic';

export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (product) redirect(`/products/${slug}`);
  notFound();
}
