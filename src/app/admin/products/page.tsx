'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/auth';
import { useToastStore } from '@/lib/toast';
import { api } from '@/lib/api';

interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice: number;
  stock: number;
  sku: string;
  isActive: boolean;
  isFeatured: boolean;
  weight: string;
  inStock: boolean;
  isLowStock: boolean;
}

interface ProductsResponse {
  success: boolean;
  data: Product[] | { products: Product[]; pagination: { total: number } };
}

export default function AdminProductsPage() {
  const token = useAuthStore((s) => s.token);
  const addToast = useToastStore((s) => s.addToast);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchProducts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get<ProductsResponse>('/products', token);
      const data = res.data;
      setProducts(Array.isArray(data) ? data : (data as { products: Product[] }).products || []);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, addToast]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateStock = async (id: string, newStock: number) => {
    if (!token) return;
    try {
      await api.patch(`/products/${id}/stock`, { stock: newStock }, token);
      addToast('Stock updated', 'success');
      fetchProducts();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update stock', 'error');
    }
  };

  const filtered = search
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  return (
    <div>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-300 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-clay">Total Products</p>
          <p className="mt-1 font-heading text-3xl font-bold text-forest">{products.length}</p>
        </div>
        <div className="rounded-xl border border-neutral-300 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-clay">In Stock</p>
          <p className="mt-1 font-heading text-3xl font-bold text-green-600">
            {products.filter((p) => p.stock > 0).length}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-300 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-clay">Low Stock</p>
          <p className="mt-1 font-heading text-3xl font-bold text-amber-600">
            {products.filter((p) => p.isLowStock).length}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, SKU, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-300 bg-white">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-300 bg-forest text-sand">
              <th className="px-5 py-3.5 font-medium">Product</th>
              <th className="px-5 py-3.5 font-medium">SKU</th>
              <th className="px-5 py-3.5 font-medium">Category</th>
              <th className="px-5 py-3.5 font-medium">Price</th>
              <th className="px-5 py-3.5 font-medium">Stock</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-neutral-200">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 w-20 rounded bg-neutral-200 animate-shimmer" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-clay">No products found</td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product._id} className="border-b border-neutral-200 transition-colors hover:bg-neutral-100/50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-forest">{product.name}</p>
                    <p className="text-xs text-clay">{product.weight}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-clay">{product.sku || '—'}</td>
                  <td className="px-5 py-4 text-clay">{product.category.replace(/-/g, ' ')}</td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-forest">₹{product.price}</span>
                    {product.originalPrice > product.price && (
                      <span className="ml-2 text-xs text-clay line-through">₹{product.originalPrice}</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-semibold ${product.stock <= 5 ? 'text-red-600' : product.stock <= 15 ? 'text-amber-600' : 'text-green-600'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newStock = prompt(`Update stock for ${product.name} (current: ${product.stock}):`, String(product.stock));
                          if (newStock !== null && !isNaN(Number(newStock))) {
                            updateStock(product._id, Number(newStock));
                          }
                        }}
                        className="rounded border border-neutral-300 px-2 py-1 text-xs text-forest hover:border-gold hover:text-gold-dark"
                      >
                        Update Stock
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
