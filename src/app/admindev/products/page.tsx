'use client';

import { useState, useMemo } from 'react';
import { useToastStore } from '@/lib/toast';

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

const MOCK_PRODUCTS: Product[] = [
  {
    _id: 'dev-p1',
    name: 'Organic Honey 500g',
    slug: 'organic-honey-500g',
    category: 'honey',
    price: 450,
    originalPrice: 499,
    stock: 25,
    sku: 'HNY-500',
    isActive: true,
    isFeatured: true,
    weight: '500g',
    inStock: true,
    isLowStock: false,
  },
  {
    _id: 'dev-p2',
    name: 'Cold Pressed Coconut Oil 1L',
    slug: 'cold-pressed-coconut-oil-1l',
    category: 'oils',
    price: 599,
    originalPrice: 599,
    stock: 12,
    sku: 'OIL-1L',
    isActive: true,
    isFeatured: false,
    weight: '1L',
    inStock: true,
    isLowStock: false,
  },
  {
    _id: 'dev-p3',
    name: 'Pure Ghee 1kg',
    slug: 'pure-ghee-1kg',
    category: 'ghee',
    price: 899,
    originalPrice: 949,
    stock: 4,
    sku: 'GHE-1K',
    isActive: true,
    isFeatured: true,
    weight: '1kg',
    inStock: true,
    isLowStock: true,
  },
  {
    _id: 'dev-p4',
    name: 'Turmeric Powder 200g',
    slug: 'turmeric-powder-200g',
    category: 'spices',
    price: 199,
    originalPrice: 219,
    stock: 0,
    sku: 'TUR-200',
    isActive: true,
    isFeatured: false,
    weight: '200g',
    inStock: false,
    isLowStock: true,
  },
  {
    _id: 'dev-p5',
    name: 'Organic Jaggery 500g',
    slug: 'organic-jaggery-500g',
    category: 'sweeteners',
    price: 149,
    originalPrice: 149,
    stock: 18,
    sku: 'JAG-500',
    isActive: true,
    isFeatured: false,
    weight: '500g',
    inStock: true,
    isLowStock: false,
  },
  {
    _id: 'dev-p6',
    name: 'Mustard Oil 500ml',
    slug: 'mustard-oil-500ml',
    category: 'oils',
    price: 349,
    originalPrice: 379,
    stock: 3,
    sku: 'OIL-MST-500',
    isActive: true,
    isFeatured: false,
    weight: '500ml',
    inStock: true,
    isLowStock: true,
  },
];

export default function AdminDevProductsPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [products, setProducts] = useState<Product[]>(() => [...MOCK_PRODUCTS]);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const s = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        (p.sku && p.sku.toLowerCase().includes(s)) ||
        p.category.toLowerCase().includes(s)
    );
  }, [products, search]);

  const updateStock = (id: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p._id !== id) return p;
        const stock = Math.max(0, newStock);
        return {
          ...p,
          stock,
          inStock: stock > 0,
          isLowStock: stock > 0 && stock <= 5,
        };
      })
    );
    addToast('Updated (dev only)', 'success');
  };

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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-clay">
                  No products found
                </td>
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
                    <span
                      className={`font-semibold ${
                        product.stock <= 5 ? 'text-red-600' : product.stock <= 15 ? 'text-amber-600' : 'text-green-600'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => {
                        const newStock = prompt(
                          `Update stock for ${product.name} (current: ${product.stock}):`,
                          String(product.stock)
                        );
                        if (newStock !== null && !isNaN(Number(newStock))) {
                          updateStock(product._id, Number(newStock));
                        }
                      }}
                      className="rounded border border-neutral-300 px-2 py-1 text-xs text-forest hover:border-gold hover:text-gold-dark"
                    >
                      Update Stock
                    </button>
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
