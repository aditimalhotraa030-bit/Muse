import { getProducts, getCategories, getSubcategories } from "@/lib/data";
import PageHeader from "@/components/ui/PageHeader";
import ShopClientSideFilter from "../ShopClientSideFilter";

export const revalidate = 60;

export default async function ShopPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];
  const categoryParam = slug[0] || "all";
  const subcategoryParam = slug[1] || "";

  const productsData = await getProducts();
  const categoriesData = await getCategories();

  const products = productsData.map((p: any) => {
    const pCats = p.product_categories?.map((pc: any) => pc.categories) || [];
    const pSubcats = p.product_subcategories?.map((ps: any) => ps.subcategories) || [];

    return {
      id: p.id,
      name: p.product_name,
      slug: p.slug,
      price: p.discount_price ? Math.round(p.price * (1 - p.discount_price / 100)) : p.price,
      originalPrice: p.discount_price ? p.price : undefined,
      badge: (p.new_arrival ? "NEW" : undefined) as any,
      image: p.cover_image || "",
      categorySlugs: pCats.map((c: any) => c?.slug).filter(Boolean),
      subcategorySlugs: pSubcats.map((s: any) => s?.slug).filter(Boolean),
    };
  });

  // Fetch subcategories
  const subcategoriesData = await getSubcategories();

  // Build full categories structure
  const categoriesList = categoriesData.map((c: any) => ({
    name: c.name,
    slug: c.slug,
    subcategories: subcategoriesData?.filter((sub: any) => sub.category_id === c.id).map((sub: any) => ({
      name: sub.name,
      slug: sub.slug
    })) || []
  }));

  const categories = [{ name: "All", slug: "all", subcategories: [] }, ...categoriesList];

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
      <PageHeader 
        title="Shop All Jewelry" 
        subtitle="Discover handcrafted jewelry designed for every occasion."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" }
        ]} 
      />

      <ShopClientSideFilter 
        products={products} 
        categories={categories} 
        categoryParam={categoryParam}
        subcategoryParam={subcategoryParam}
      />
    </div>
  );
}
