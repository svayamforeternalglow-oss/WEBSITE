'use client';

import { useWishlistStore } from '@/lib/wishlist';
import { useToastStore } from '@/lib/toast';
import type { Product } from '@/lib/products';
import { HeartIcon } from './icons';

interface Props {
  product: Product;
  className?: string;
  showText?: boolean;
}

export default function WishlistButton({ product, className = '', showText = false }: Props) {
  const { addItem, removeItem, isInWishlist } = useWishlistStore();
  const addToast = useToastStore((s) => s.addToast);

  const isFavorite = isInWishlist(product.slug);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFavorite) {
      removeItem(product.slug);
      addToast(`${product.name} removed from wishlist`, 'info');
    } else {
      addItem({
        productId: product.slug, // Using slug as ID since we don't have a numeric ID in the static lib
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
      });
      addToast(`${product.name} added to wishlist`, 'success');
    }
  };

  if (showText) {
    return (
      <button
        onClick={toggleWishlist}
        className={`inline-flex items-center gap-2 rounded-lg border-2 px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all ${
          isFavorite
            ? 'border-gold bg-gold/10 text-gold-dark'
            : 'border-forest/20 text-forest hover:border-gold hover:text-gold-dark'
        } ${className}`}
      >
        <HeartIcon className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
        {isFavorite ? 'In Wishlist' : 'Add to Wishlist'}
      </button>
    );
  }

  return (
    <button
      onClick={toggleWishlist}
      className={`group flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${
        isFavorite
          ? 'border-gold bg-gold text-forest'
          : 'border-neutral-300 bg-white text-clay-light hover:border-gold hover:text-gold'
      } ${className}`}
      title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <HeartIcon className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${isFavorite ? 'fill-current' : ''}`} />
    </button>
  );
}
