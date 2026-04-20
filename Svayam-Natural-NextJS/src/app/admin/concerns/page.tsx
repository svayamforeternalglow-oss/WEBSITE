'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/auth';
import { useToastStore } from '@/lib/toast';
import { api } from '@/lib/api';

interface ConcernItem {
  _id: string;
  name: string;
  slug: string;
  image: string;
  isActive: boolean;
}

interface ProductItem {
  _id: string;
  title: string;
  slug: string;
  category: string;
  concern: string;
  price: number;
  images?: string[];
  isActive?: boolean;
}

export default function AdminConcernsPage() {
  const token = useAuthStore((s) => s.token);
  const addToast = useToastStore((s) => s.addToast);

  const [concerns, setConcerns] = useState<ConcernItem[]>([]);
  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Concern form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConcern, setEditingConcern] = useState<ConcernItem | null>(null);
  const [formData, setFormData] = useState({ name: '', image: '', isActive: true });

  // Product assignment state
  const [selectedConcern, setSelectedConcern] = useState<ConcernItem | null>(null);
  const [concernProducts, setConcernProducts] = useState<ProductItem[]>([]);
  const [isProductPanelOpen, setIsProductPanelOpen] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const fetchConcerns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<ConcernItem[]>('/taxonomy/concerns');
      setConcerns(Array.isArray(data) ? data : []);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to fetch concerns', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchAllProducts = useCallback(async () => {
    try {
      const res = await api.get<ProductItem[]>('/products');
      const list = Array.isArray(res) ? res : [];
      setAllProducts(list);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchConcerns();
    fetchAllProducts();
  }, [fetchConcerns, fetchAllProducts]);

  // ─── Concern CRUD ─────────────────────────────────────

  const openAddForm = () => {
    setEditingConcern(null);
    setFormData({ name: '', image: '', isActive: true });
    setIsFormOpen(true);
  };

  const openEditForm = (c: ConcernItem) => {
    setEditingConcern(c);
    setFormData({ name: c.name, image: c.image || '', isActive: c.isActive });
    setIsFormOpen(true);
  };

  const handleSaveConcern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      if (editingConcern) {
        await api.put(`/taxonomy/concerns/${editingConcern._id}`, formData, token);
        addToast('Concern updated', 'success');
      } else {
        await api.post('/taxonomy/concerns', formData, token);
        addToast('Concern created', 'success');
      }
      setIsFormOpen(false);
      fetchConcerns();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to save concern', 'error');
    }
  };

  const deleteConcern = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this concern?')) return;
    try {
      await api.delete(`/taxonomy/concerns/${id}`, token);
      addToast('Concern deleted', 'success');
      fetchConcerns();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to delete concern', 'error');
    }
  };

  // ─── Product Assignment ───────────────────────────────

  const openProductPanel = async (concern: ConcernItem) => {
    setSelectedConcern(concern);
    setIsProductPanelOpen(true);
    setLoadingProducts(true);
    setProductSearch('');
    try {
      const products = await api.get<ProductItem[]>(`/taxonomy/concerns/${concern._id}/products`, token || undefined);
      setConcernProducts(Array.isArray(products) ? products : []);
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to load products', 'error');
      setConcernProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const addProductToConcern = async (productId: string) => {
    if (!token || !selectedConcern) return;
    try {
      const res = await api.put<{ products: ProductItem[] }>(
        `/taxonomy/concerns/${selectedConcern._id}/products`,
        { addProductIds: [productId] },
        token
      );
      setConcernProducts(res.products || []);
      addToast('Product added to concern', 'success');
      fetchAllProducts(); // refresh product concern data
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to add product', 'error');
    }
  };

  const removeProductFromConcern = async (productId: string) => {
    if (!token || !selectedConcern) return;
    try {
      const res = await api.put<{ products: ProductItem[] }>(
        `/taxonomy/concerns/${selectedConcern._id}/products`,
        { removeProductIds: [productId] },
        token
      );
      setConcernProducts(res.products || []);
      addToast('Product removed from concern', 'success');
      fetchAllProducts();
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to remove product', 'error');
    }
  };

  // Products already assigned to this concern
  const assignedIds = new Set(concernProducts.map((p) => p._id));

  // Available products (not yet in this concern), filtered by search
  const availableProducts = allProducts.filter((p) => {
    if (assignedIds.has(p._id)) return false;
    if (productSearch) {
      return (p.title || '').toLowerCase().includes(productSearch.toLowerCase());
    }
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-forest">Shop By Concern</h2>
          <p className="mt-1 text-sm text-clay">Manage concern categories and assign products to each concern.</p>
        </div>
        <button
          onClick={openAddForm}
          className="rounded-lg bg-forest px-6 py-2.5 text-sm font-semibold text-sand hover:bg-forest-dark transition-colors"
        >
          + Add Concern
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-300 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-clay">Total Concerns</p>
          <p className="mt-1 font-heading text-3xl font-bold text-forest">{concerns.length}</p>
        </div>
        <div className="rounded-xl border border-neutral-300 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-clay">Active</p>
          <p className="mt-1 font-heading text-3xl font-bold text-green-600">
            {concerns.filter((c) => c.isActive).length}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-300 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-clay">Total Products</p>
          <p className="mt-1 font-heading text-3xl font-bold text-gold-dark">{allProducts.length}</p>
        </div>
      </div>

      {/* Concerns Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl border border-neutral-300 bg-white animate-shimmer" />
          ))}
        </div>
      ) : concerns.length === 0 ? (
        <div className="rounded-xl border border-neutral-300 bg-white py-16 text-center text-clay">
          <p className="text-lg font-medium">No concerns yet</p>
          <p className="mt-1 text-sm">Create your first concern to start categorizing products.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {concerns.map((concern) => {
            // Count products using this concern
            const productCount = allProducts.filter((p) =>
              p.concern && p.concern.toLowerCase().split(',').map(c => c.trim()).includes(concern.name.toLowerCase())
            ).length;

            return (
              <div
                key={concern._id}
                className={`group rounded-xl border bg-white p-5 transition-all hover:shadow-md ${
                  concern.isActive ? 'border-neutral-300' : 'border-red-200 opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Image */}
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                    {concern.image ? (
                      <img src={concern.image} alt={concern.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl text-neutral-300">🎯</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-lg font-bold text-forest">{concern.name}</h3>
                    <p className="text-xs text-clay">Slug: {concern.slug}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        concern.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {concern.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-clay">{productCount} product{productCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-3">
                  <button
                    onClick={() => openProductPanel(concern)}
                    className="flex-1 rounded-lg border border-gold/30 bg-gold/5 px-3 py-2 text-xs font-semibold text-gold-dark hover:bg-gold/15 transition-colors"
                  >
                    📦 Manage Products
                  </button>
                  <button
                    onClick={() => openEditForm(concern)}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteConcern(concern._id)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Add/Edit Concern Modal ─────────────────────── */}
      {isFormOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-forest/40 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 bg-forest text-sand">
              <h2 className="font-heading text-lg font-bold">
                {editingConcern ? 'Edit Concern' : 'Add New Concern'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-2xl hover:text-gold-dark">&times;</button>
            </div>

            <form onSubmit={handleSaveConcern} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-forest mb-1">Concern Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Acne & Oil Control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                />
                <p className="mt-1 text-xs text-clay">Slug will be auto-generated from the name.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-forest mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="/images/concerns/acne.png"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                />
                {formData.image && (
                  <div className="mt-2 h-20 w-20 overflow-hidden rounded-lg border border-neutral-200">
                    <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`h-6 w-11 rounded-full transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-neutral-300'} relative`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${formData.isActive ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                  <span className="text-sm font-medium text-forest">Active</span>
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-clay hover:text-forest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gold px-6 py-2 text-sm font-bold text-forest shadow-md hover:bg-gold-dark hover:shadow-lg transition-all"
                >
                  {editingConcern ? 'Save Changes' : 'Create Concern'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ─── Product Assignment Panel ───────────────────── */}
      {isProductPanelOpen && selectedConcern && (
        <>
          <div className="fixed inset-0 z-50 bg-forest/40 backdrop-blur-sm" onClick={() => setIsProductPanelOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 bg-forest text-sand">
              <div>
                <h2 className="font-heading text-lg font-bold">
                  Manage Products
                </h2>
                <p className="text-sm text-sand/60">{selectedConcern.name}</p>
              </div>
              <button onClick={() => setIsProductPanelOpen(false)} className="text-2xl hover:text-gold-dark">&times;</button>
            </div>

            <div className="p-6">
              {/* Assigned products */}
              <div className="mb-6">
                <h3 className="font-heading text-sm font-bold text-forest uppercase tracking-wider mb-3">
                  Assigned Products ({concernProducts.length})
                </h3>
                {loadingProducts ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 rounded-lg bg-neutral-200 animate-shimmer" />
                    ))}
                  </div>
                ) : concernProducts.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-neutral-300 py-6 text-center text-sm text-clay">
                    No products assigned yet. Add products below.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {concernProducts.map((p) => (
                      <div key={p._id} className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-neutral-200">
                          <img
                            src={p.images?.[0] || '/images/All-Products.jpeg'}
                            alt={p.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-forest truncate">{p.title}</p>
                          <p className="text-xs text-clay">{p.category} • ₹{p.price}</p>
                        </div>
                        <button
                          onClick={() => removeProductFromConcern(p._id)}
                          className="flex-shrink-0 rounded border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs font-semibold uppercase tracking-wider text-clay">Add Products</span>
                </div>
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search products to add..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="mb-4 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-gold"
              />

              {/* Available products */}
              <div className="max-h-[350px] overflow-y-auto space-y-2">
                {availableProducts.length === 0 ? (
                  <p className="py-4 text-center text-sm text-clay">
                    {productSearch ? 'No matching products found.' : 'All products are already assigned.'}
                  </p>
                ) : (
                  availableProducts.map((p) => (
                    <div key={p._id} className="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2 hover:bg-neutral-50 transition-colors">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-neutral-200">
                        <img
                          src={p.images?.[0] || '/images/All-Products.jpeg'}
                          alt={p.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-forest truncate">{p.title}</p>
                        <p className="text-xs text-clay">{p.category} • ₹{p.price}</p>
                      </div>
                      <button
                        onClick={() => addProductToConcern(p._id)}
                        className="flex-shrink-0 rounded border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
