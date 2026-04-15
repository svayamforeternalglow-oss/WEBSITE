'use client';

import { useCartStore } from '@/lib/cart';
import { useToastStore } from '@/lib/toast';

interface CartProductData {
  slug: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  weight?: string;
  sku?: string;
}

interface Props {
  product: CartProductData;
  variant?: 'primary' | 'cta';
  className?: string;
}

export default function AddToCartButton({ product, variant = 'primary', className = '' }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const addToast = useToastStore((s) => s.addToast);

  const handleAdd = () => {
    addItem({
      productId: product.slug,
      slug: product.slug,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      weight: product.weight || '',
      sku: product.sku || '',
    });
    addToast(`${product.name} added to cart`, 'success');
    openCart();
  };

  if (variant === 'cta') {
    return (
      <button
        onClick={handleAdd}
        className={`rounded-lg bg-gradient-to-r from-gold to-gold-dark px-10 py-4 text-sm font-bold uppercase tracking-wider text-forest transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gold/30 ${className}`}
      >
        Add to Cart — ₹{product.price}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`rounded-lg bg-gradient-to-r from-gold to-gold-dark px-10 py-4 text-sm font-bold uppercase tracking-wider text-forest transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gold/30 ${className}`}
    >
      Add to Cart
    </button>
  );
}
