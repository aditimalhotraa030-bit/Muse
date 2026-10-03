import { getProducts } from "@/lib/data";
import PageHeader from "@/components/ui/PageHeader";
import ShopClientSideFilter from "../shop/ShopClientSideFilter";

export default async function SuitsPage() {
  const productsData = await getProducts({ productType: 'suit' });

  const products = productsData.map((p: any) => {
    return {
      id: p.id,
      name: p.product_name,
      slug: p.slug,
      price: p.discount_price ? Math.round(p.price * (1 - p.discount_price / 100)) : p.price,
      originalPrice: p.discount_price ? p.price : undefined,
      badge: (p.new_arrival ? "NEW" : undefined) as any,
      image: p.cover_image || "",
      images: (Array.isArray(p.gallery_images) && p.gallery_images.length > 0)
        ? p.gallery_images
        : (p.cover_image ? [p.cover_image] : []),
      categorySlugs: [], // Optionally fetch categories if suits use them
      subcategorySlugs: [],
    };
  });

  // For suits, we may not have categories initially, so we just use an "All" category.
  const categories = [{ name: "All Suits", slug: "all", subcategories: [] }];

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
      <PageHeader 
        title="Shop Suits" 
        subtitle="Discover our exclusive premium suits line."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Suits", href: "/suits" }
        ]} 
      />

      <ShopClientSideFilter 
        products={products} 
        categories={categories} 
        categoryParam={"all"}
        subcategoryParam={""}
      />
    </div>
  );
}
