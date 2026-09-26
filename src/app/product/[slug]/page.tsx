import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/data";
import ProductDetailClient from "./ProductDetailClient";
import ProductGridSection from "@/components/home/ProductGridSection";
import PageHeader from "@/components/ui/PageHeader";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  // Fetch related products from the same category
  const relatedProductsData = await getProducts({ limit: 4 }); // Simple fallback for now
  
  const relatedProducts = relatedProductsData.map((p: any) => ({
    id: p.id,
    name: p.product_name,
    slug: p.slug,
    price: p.discount_price ? Math.round(p.price * (1 - p.discount_price / 100)) : p.price,
    originalPrice: p.discount_price ? p.price : undefined,
    badge: (p.new_arrival ? "NEW" : undefined) as any,
    image: p.cover_image || ""
  })).filter((p: any) => p.id !== product.id).slice(0, 4);

  // Normalize product data for client
  const clientProduct = {
    id: product.id,
    name: product.product_name,
    slug: product.slug,
    price: product.discount_price ? Math.round(product.price * (1 - product.discount_price / 100)) : product.price,
    originalPrice: product.discount_price ? product.price : undefined,
    rating: 4.8, // Mock for now
    reviews: 120, // Mock for now
    description: product.description || "",
    variants: [],
    material: product.material || "Handcrafted brass.",
    category: product.categories?.name || "Uncategorized",
    care: product.care_instructions || "Keep away from moisture.",
    images: (() => {
      const list: string[] = [];
      if (product.cover_image) list.push(product.cover_image);
      if (Array.isArray(product.gallery_images)) {
        product.gallery_images.forEach((img: string) => {
          if (img && !list.includes(img)) list.push(img);
        });
      }
      return list.length > 0 ? list : [""];
    })()
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
      <ProductDetailClient product={clientProduct} />

      {relatedProducts.length > 0 && (
        <ProductGridSection 
          title="You may also love" 
          subtitle="Curated pairs for the perfect look."
          products={relatedProducts}
          viewAllLink="/shop"
        />
      )}
    </div>
  );
}
