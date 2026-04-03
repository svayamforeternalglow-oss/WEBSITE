'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/auth';
import { useToastStore } from '@/lib/toast';
import { api } from '@/lib/api';

interface Product {
  _id: string;
  name?: string;
  title?: string;
  slug?: string;
  category: string;
  concern?: string;
  price: number;
  originalPrice?: number;
  stock?: number;
  inventory?: number;
  sku?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  weight?: string;
  inStock?: boolean;
  isLowStock?: boolean;
  description?: string;
  images?: string[];
}

interface TaxonomyItem {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export default function AdminProductsPage() {
  const token = useAuthStore((s) => s.token);
  const addToast = useToastStore((s) => s.addToast);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<TaxonomyItem[]>([]);
  const [concerns, setConcerns] = useState<TaxonomyItem[]>([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    price: 0,
    originalPrice: 0,
    inventory: 0,
    category: '',
    concern: '',
    description: '',
    images: '',
    isActive: true,
    isFeatured: false,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/products');
      if (Array.isArray(res)) {
         setProducts(res);
      } else if (res && Array.isArray(res.data)) {
         setProducts(res.data);
      } else if (res && (res as any).products) {
         setProducts((res as any).products);
      } else {
         setProducts([]);
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchTaxonomy = useCallback(async () => {
    try {
      const [cats, cons] = await Promise.all([
        api.get<TaxonomyItem[]>('/taxonomy/categories'),
        api.get<TaxonomyItem[]>('/taxonomy/concerns'),
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setConcerns(Array.isArray(cons) ? cons : []);
    } catch {
      // Taxonomy fetch is non-critical
    }
  }, []);

  useEffect(() => { fetchProducts(); fetchTaxonomy(); }, [fetchProducts, fetchTaxonomy]);

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

  const deleteProduct = async (id: string) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`, token);
      addToast('Product deleted', 'success');
      fetchProducts();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to delete product', 'error');
    }
  };

  const toggleFeatured = async (product: Product) => {
    if (!token) return;
    try {
      await api.put(`/products/${product._id}`, { isFeatured: !product.isFeatured }, token);
      addToast(`${product.title || product.name} ${product.isFeatured ? 'removed from' : 'added to'} featured`, 'success');
      fetchProducts();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update', 'error');
    }
  };

  const toggleActive = async (product: Product) => {
    if (!token) return;
    try {
      await api.put(`/products/${product._id}`, { isActive: !product.isActive }, token);
      addToast(`${product.title || product.name} ${product.isActive ? 'deactivated' : 'activated'}`, 'success');
      fetchProducts();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to update', 'error');
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '', price: 0, originalPrice: 0, inventory: 0, category: '', concern: '', description: '', images: '', isActive: true, isFeatured: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      title: p.title || p.name || '',
      price: p.price || 0,
      originalPrice: p.originalPrice || 0,
      inventory: p.inventory !== undefined ? p.inventory : (p.stock || 0),
      category: p.category || '',
      concern: p.concern || '',
      description: p.description || '',
      images: p.images ? p.images.join(', ') : '',
      isActive: p.isActive !== undefined ? p.isActive : true,
      isFeatured: p.isFeatured || false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    try {
      const payload = {
        ...formData,
        images: formData.images.split(',').map(i => i.trim()).filter(Boolean)
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload, token);
        addToast('Product updated successfully', 'success');
      } else {
        await api.post('/products', payload, token); 
        addToast('Product created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to save product', 'error');
    }
  };

  const filtered = search
    ? products.filter((p) => {
        const titleMatch = (p.title || p.name || '').toLowerCase().includes(search.toLowerCase());
        const catMatch = (p.category || '').toLowerCase().includes(search.toLowerCase());
        return titleMatch || catMatch;
      })
    : products;

  return (
    <div>
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-neutral-300 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-clay">Total Products</p>
          <p className="mt-1 font-heading text-3xl font-bold text-forest">{products.length}</p>
        </div>
        <div className="rounded-xl border border-neutral-300 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-clay">Active</p>
          <p className="mt-1 font-heading text-3xl font-bold text-green-600">
            {products.filter((p) => p.isActive !== false).length}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-300 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-clay">Featured</p>
          <p className="mt-1 font-heading text-3xl font-bold text-gold-dark">
            {products.filter((p) => p.isFeatured).length}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-300 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-clay">Out of Stock</p>
          <p className="mt-1 font-heading text-3xl font-bold text-red-600">
            {products.filter((p) => ((p.inventory !== undefined ? p.inventory : p.stock) || 0) <= 0).length}
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold"
        />
        <button
          onClick={openAddModal}
          className="rounded-lg bg-forest px-6 py-2.5 text-sm font-semibold text-sand hover:bg-forest-dark transition-colors"
        >
          + Add New Product
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-300 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-300 bg-forest text-sand">
              <th className="px-4 py-3.5 font-medium">Image</th>
              <th className="px-4 py-3.5 font-medium">Product</th>
              <th className="px-4 py-3.5 font-medium">Category</th>
              <th className="px-4 py-3.5 font-medium">Price</th>
              <th className="px-4 py-3.5 font-medium">Stock</th>
              <th className="px-4 py-3.5 font-medium text-center">Active</th>
              <th className="px-4 py-3.5 font-medium text-center">Featured</th>
              <th className="px-4 py-3.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-neutral-200">
                  {[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 w-20 rounded bg-neutral-200 animate-shimmer" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-clay">No products found</td>
              </tr>
            ) : (
              filtered.map((product) => {
                const title = product.title || product.name || 'Unnamed Product';
                const stock = product.inventory !== undefined ? product.inventory : (product.stock || 0);
                const image = product.images && product.images.length > 0 ? product.images[0] : '/images/placeholder.jpg';
                
                return (
                  <tr key={product._id} className={`border-b border-neutral-200 transition-colors hover:bg-neutral-100/50 ${product.isActive === false ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="h-12 w-12 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
                        <img src={image} alt={title} className="h-full w-full object-cover" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-forest">{title}</p>
                      <p className="text-xs text-clay max-w-[250px] truncate">{product.description}</p>
                    </td>
                    <td className="px-4 py-4 text-clay">{product.category}</td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-forest">₹{product.price}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="ml-1 text-xs text-clay-light line-through">₹{product.originalPrice}</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-semibold ${stock <= 5 ? 'text-red-600' : stock <= 15 ? 'text-amber-600' : 'text-green-600'}`}>
                        {stock}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => toggleActive(product)}
                        className={`h-6 w-11 rounded-full transition-colors ${product.isActive !== false ? 'bg-green-500' : 'bg-neutral-300'} relative`}
                        title={product.isActive !== false ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                      >
                        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${product.isActive !== false ? 'left-[22px]' : 'left-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => toggleFeatured(product)}
                        className={`text-lg transition-transform hover:scale-110 ${product.isFeatured ? 'text-gold' : 'text-neutral-300 hover:text-gold/50'}`}
                        title={product.isFeatured ? 'Featured — click to remove' : 'Not featured — click to feature'}
                      >
                        ★
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            const newStock = prompt(`Quick update stock for ${title}:`, String(stock));
                            if (newStock !== null && !isNaN(Number(newStock))) {
                              updateStock(product._id, Number(newStock));
                            }
                          }}
                          className="rounded border border-neutral-300 px-2 py-1.5 text-xs font-medium text-forest hover:border-gold hover:text-gold-dark transition-colors"
                        >
                          Stock
                        </button>
                        <button
                          onClick={() => openEditModal(product)}
                          className="rounded border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(product._id)}
                          className="rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-out Form Modal */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-forest/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 bg-forest text-sand">
              <h2 className="font-heading text-lg font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-2xl hover:text-gold-dark">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-forest mb-1">Title / Name *</label>
                <input 
                  required type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-forest mb-1">Price (₹) *</label>
                  <input 
                    required type="number" min="0" step="0.01"
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-forest mb-1">MRP (₹)</label>
                  <input 
                    type="number" min="0" step="0.01"
                    value={formData.originalPrice} 
                    onChange={e => setFormData({...formData, originalPrice: Number(e.target.value)})}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-forest mb-1">Stock *</label>
                  <input 
                    required type="number" min="0"
                    value={formData.inventory} 
                    onChange={e => setFormData({...formData, inventory: Number(e.target.value)})}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-forest mb-1">Category *</label>
                  {categories.length > 0 ? (
                    <select
                      required
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-gold"
                    >
                      <option value="">Select category</option>
                      {categories.map(c => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      required type="text"
                      placeholder="e.g. hair-care"
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-gold"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-forest mb-1">Concern</label>
                  {concerns.length > 0 ? (
                    <select
                      value={formData.concern}
                      onChange={e => setFormData({...formData, concern: e.target.value})}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-gold"
                    >
                      <option value="">Select concern</option>
                      {concerns.map(c => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      placeholder="e.g. Acne"
                      value={formData.concern} 
                      onChange={e => setFormData({...formData, concern: e.target.value})}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-gold"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-forest mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-forest mb-1">Image URLs (comma separated)</label>
                <textarea 
                  rows={2}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  value={formData.images} 
                  onChange={e => setFormData({...formData, images: e.target.value})}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-clay outline-none focus:border-gold"
                />
              </div>

              {/* Toggle switches */}
              <div className="flex items-center gap-8 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                    className={`h-6 w-11 rounded-full transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-neutral-300'} relative`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${formData.isActive ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                  <span className="text-sm font-medium text-forest">Active</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, isFeatured: !formData.isFeatured})}
                    className={`h-6 w-11 rounded-full transition-colors ${formData.isFeatured ? 'bg-gold' : 'bg-neutral-300'} relative`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${formData.isFeatured ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                  <span className="text-sm font-medium text-forest">Featured</span>
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-clay hover:text-forest"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="rounded-lg bg-gold px-6 py-2 text-sm font-bold text-forest shadow-md hover:bg-gold-dark hover:shadow-lg transition-all"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>

            </form>
          </div>
        </>
      )}
    </div>
  );
}
