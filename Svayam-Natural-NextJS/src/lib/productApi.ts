import { api } from './api';
import {
  editorialBySlug,
  CATEGORY_THEMES,
  normalizeConcernQuery,
  type Product,
  type ProductTheme,
} from './products';

/* ---- Backend product shape ---- */
export interface BackendProduct {
  _id: string;
  title: string;
  slug: string;
  description: string;
  story?: string;
  howToUse?: string;
  price: number;
  originalPrice: number;
  inventory: number;
  images: string[];
  category: string;
  concern: string;
  isActive: boolean;
  isFeatured: boolean;
  isSeasonal?: boolean;
  seasonalRank?: number;
  sku?: string;
  weight?: string;
  ingredients?: { name: string; icon?: string; description?: string }[];
  benefits?: { title: string; icon?: string; description?: string }[];
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
  isSeasonal: boolean;
  seasonalRank: number;
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

/* ---- Merge helper ---- */
function editorialImageGallery(editorial: Product | undefined): string[] {
  if (!editorial) return [];
  if (editorial.images?.length) return editorial.images.filter(Boolean);
  if (editorial.image) return [editorial.image];
  return [];
}

export function mergeWithEditorial(backendProducts: BackendProduct[]): MergedProduct[] {
  return backendProducts.map((bp) => {
    const editorial = editorialBySlug[bp.slug];
    const backendImages = (bp.images || []).filter(Boolean);
    const staticGallery = editorialImageGallery(editorial);
    const images =
      backendImages.length > 0 ? backendImages : (staticGallery.length > 0 ? staticGallery : ['/images/All-Products.jpeg']);
    const image = images[0] || '/images/All-Products.jpeg';
    const backendSku = typeof bp.sku === 'string' && bp.sku.trim() ? bp.sku.trim() : '';
    const backendWeight = typeof bp.weight === 'string' && bp.weight.trim() ? bp.weight.trim() : '';
    const backendStory = typeof bp.story === 'string' && bp.story.trim() ? bp.story.trim() : '';
    const backendHowToUse = typeof bp.howToUse === 'string' && bp.howToUse.trim() ? bp.howToUse.trim() : '';
    const backendIngredients = Array.isArray(bp.ingredients) && bp.ingredients.length > 0
      ? bp.ingredients
          .filter((ing) => Boolean(ing?.name))
          .map((ing) => ({
            name: ing.name,
            icon: ing.icon || '',
            description: ing.description || '',
          }))
      : undefined;
    const backendBenefits = Array.isArray(bp.benefits) && bp.benefits.length > 0
      ? bp.benefits
          .filter((benefit) => Boolean(benefit?.title))
          .map((benefit) => ({
            title: benefit.title,
            icon: benefit.icon || '',
            description: benefit.description || '',
          }))
      : undefined;
    // Parse comma-separated concerns from backend into array
    const backendConcerns = bp.concern
      ? bp.concern
          .split(',')
          .map((c) => normalizeConcernQuery(c.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')))
          .filter(Boolean)
      : [];
    const editorialConcerns = (editorial?.concerns || []).map((c) => normalizeConcernQuery(c)).filter(Boolean);
    const displayName =
      bp.title?.trim() ? bp.title.trim() : (editorial?.name || bp.title);
    const displayDescription =
      bp.description?.trim() ? bp.description.trim() : (editorial?.description || bp.description);
    return {
      _id: bp._id,
      slug: bp.slug,
      name: displayName,
      description: displayDescription,
      price: bp.price,
      originalPrice: bp.originalPrice,
      inventory: bp.inventory,
      image,
      images,
      category: bp.category,
      concern: bp.concern,
      isActive: bp.isActive,
      isFeatured: bp.isFeatured,
      isSeasonal: Boolean(bp.isSeasonal),
      seasonalRank: bp.seasonalRank ?? 0,
      // Editorial — fallback to empty defaults
      tagline: editorial?.tagline || '',
      story: backendStory || editorial?.story || '',
      theme: editorial?.theme || CATEGORY_THEMES[bp.category] || 'herbal',
      weight: backendWeight || editorial?.weight || '',
      sku: backendSku || editorial?.sku || '',
      badges: editorial?.badges || [],
      // Prefer backend concerns if they exist, otherwise fall back to editorial
      concerns: backendConcerns.length > 0 ? backendConcerns : editorialConcerns,
      ingredients: backendIngredients || editorial?.ingredients || [],
      benefits: backendBenefits || editorial?.benefits || [],
      howToUse: backendHowToUse || editorial?.howToUse,
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
  seasonal?: boolean;
  active?: boolean;
  limit?: number;
  page?: number;
}

export async function fetchProducts(params?: FetchProductsParams): Promise<MergedProduct[]> {
  const qs = new URLSearchParams();
  if (params?.search?.trim()) qs.set('search', params.search.trim());
  if (params?.category) qs.set('category', params.category);
  if (params?.concern) {
    const concern = normalizeConcernQuery(params.concern);
    if (concern) {
      qs.set('concern', concern);
    }
  }
  if (params?.featured) qs.set('featured', 'true');
  if (params?.seasonal) qs.set('seasonal', 'true');
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
  } catch (err) {
    if (typeof window !== 'undefined') console.warn('[fetchProductBySlug] Failed for "' + slug + '":', err);
    return null;
  }
}

export async function fetchFeaturedProducts(count = 4): Promise<MergedProduct[]> {
  return fetchProducts({ featured: true, limit: count });
}

export async function fetchSeasonalProducts(count = 8): Promise<MergedProduct[]> {
  return fetchProducts({ seasonal: true, limit: count });
}

export async function fetchProductsBySlugs(slugs: string[]): Promise<MergedProduct[]> {
  // Fetch all active products and filter by slugs client-side
  // (batch slug fetch isn't in the API yet, this is efficient enough for small lists)
  const all = await fetchProducts({ active: true });
  const slugSet = new Set(slugs);
  return all.filter((p) => slugSet.has(p.slug));
}
