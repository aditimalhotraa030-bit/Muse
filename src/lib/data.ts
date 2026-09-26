import { createClient } from './supabase/client';

const supabase = createClient();

// Product Fetching
export async function getProducts(options?: {
  limit?: number;
  featured?: boolean;
  newArrival?: boolean;
  categorySlug?: string;
  productType?: 'jewelry' | 'suit' | 'all';
}) {
  let query = supabase
    .from('products')
    .select('*, product_categories(categories(*)), product_subcategories(subcategories(*))')
    .eq('availability', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (options?.productType && options.productType !== 'all') {
    query = query.eq('product_type', options.productType);
  } else if (!options?.productType) {
    query = query.eq('product_type', 'jewelry');
  }

  if (options?.featured) query = query.eq('featured', true);
  if (options?.newArrival) query = query.eq('new_arrival', true);
  if (options?.limit) query = query.limit(options.limit);

  // Note: For actual category filtering via slug, a more complex join or subquery is needed,
  // or we filter client-side for simplicity in this demo.
  
  const { data, error } = await query;
  if (error) {
    console.error("Error fetching products:", JSON.stringify(error, null, 2));
    return [];
  }
  return data;
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_categories(categories(*)), product_variants(*), product_subcategories(subcategories(*))')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error("Error fetching product:", error);
    }
    return null;
  }
  return data;
}

// Categories Fetching
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  const categoryOrderMap: Record<string, number> = {
    'necklace': 1,
    'earrings': 2,
    'bangles': 3,
    'genz-jewelry': 4,
    'rings': 5,
  };

  return [...data].sort((a, b) => {
    const orderA = categoryOrderMap[a.slug?.toLowerCase()] ?? (a.display_order ?? 99);
    const orderB = categoryOrderMap[b.slug?.toLowerCase()] ?? (b.display_order ?? 99);
    return orderA - orderB;
  });
}

// Subcategories Fetching
export async function getSubcategories() {
  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching subcategories:", error);
    return [];
  }
  return data;
}

// Active Announcement Fetching
export async function getActiveAnnouncement() {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
    console.error("Error fetching announcement:", error);
  }
  return data || null;
}

// Contact Form Submission
export async function submitContactQuery(formData: { name: string; email: string; phone?: string; message: string }) {
  const { data, error } = await supabase
    .from('contact_queries')
    .insert([formData]);

  if (error) {
    console.error("Error submitting contact query:", error);
    return { success: false, error };
  }
  return { success: true, data };
}
