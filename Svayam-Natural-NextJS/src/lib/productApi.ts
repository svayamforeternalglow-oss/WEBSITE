import { api } from './api';

/* ---- Backend product shape ---- */
export interface BackendProduct {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number;
  inventory: number;
  images: string[];
  category: string;
  concern: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  // When text‑search is used, Mongo adds a score
  score?: number;
}

/* ---- Merged product (backend commerce + frontend editorial) ---- */
export interface MergedProduct {
  // Commerce (from backend)
  _id: string;
  slug: string;
  name: string;         // mapped from backend title
  description: string;
  price: number;
  originalPrice: number;
  inventory: number;
  image: string;        // first image
  images: string[];
  category: string;
  concern: string;
  isActive: boolean;
  isFeatured: boolean;
  // Editorial (from static data, may be empty for new products)
  tagline: string;
  story: string;
  theme: ProductTheme;
  weight: string;
  sku: string;
  badges: string[];
  concerns: string[];
  ingredients: { name: string; icon: string; description: string }[];
  benefits: { title: string; description: string; icon: string }[];
  howToUse?: string;
}

/* ---- Import editorial data ---- */
import { editorialBySlug, CATEGORY_THEMES, type ProductTheme } from './products';

/* ---- Merge helper ---- */
export function mergeWithEditorial(backendProducts: BackendProduct[]): MergedProduct[] {
  return backendProducts.map((bp) => {
    const editorial = editorialBySlug[bp.slug];
    return {
      _id: bp._id,
      slug: bp.slug,
      name: bp.title,
      description: bp.description,
      price: bp.price,
      originalPrice: bp.originalPrice,
      inventory: bp.inventory,
      image: bp.images?.[0] || '/images/placeholder.jpg',
      images: bp.images || [],
      category: bp.category,
      concern: bp.concern,
      isActive: bp.isActive,
      isFeatured: bp.isFeatured,
      // Editorial — fallback to empty defaults
      tagline: editorial?.tagline || '',
      story: editorial?.story || '',
      theme: editorial?.theme || CATEGORY_THEMES[bp.category] || 'herbal',
      weight: editorial?.weight || '',
      sku: editorial?.sku || '',
      badges: editorial?.badges || [],
      concerns: editorial?.concerns || [],
      ingredients: editorial?.ingredients || [],
      benefits: editorial?.benefits || [],
      howToUse: editorial?.howToUse,
    };
  });
}

export function mergeSingleWithEditorial(bp: BackendProduct): MergedProduct {
  return mergeWithEditorial([bp])[0];
}

/* ---- API calls ---- */
export interface FetchProductsParams {
  search?: string;
  category?: string;
  concern?: string;
  featured?: boolean;
  active?: boolean;
  limit?: number;
  page?: number;
}

export async function fetchProducts(params?: FetchProductsParams): Promise<MergedProduct[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.category) qs.set('category', params.category);
  if (params?.concern) qs.set('concern', params.concern);
  if (params?.featured) qs.set('featured', 'true');
  if (params?.active !== undefined) qs.set('active', String(params.active));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.page) qs.set('page', String(params.page));

  const qsStr = qs.toString();
  const endpoint = `/products${qsStr ? `?${qsStr}` : ''}`;
  const data = await api.get<BackendProduct[]>(endpoint);
  return mergeWithEditorial(Array.isArray(data) ? data : []);
}

export async function fetchProductBySlug(slug: string): Promise<MergedProduct | null> {
  try {
    const data = await api.get<BackendProduct>(`/products/by-slug/${slug}`);
    return data ? mergeSingleWithEditorial(data) : null;
  } catch {
    return null;
  }
}

export async function fetchFeaturedProducts(count = 4): Promise<MergedProduct[]> {
  return fetchProducts({ featured: true, limit: count });
}

export async function fetchProductsBySlugs(slugs: string[]): Promise<MergedProduct[]> {
  // Fetch all active products and filter by slugs client-side
  // (batch slug fetch isn't in the API yet, this is efficient enough for small lists)
  const all = await fetchProducts({ active: true });
  const slugSet = new Set(slugs);
  return all.filter((p) => slugSet.has(p.slug));
}
