import { getProducts } from "@/lib/data";
import HeroSection from "@/components/home/HeroSection";
import ProductGridSection from "@/components/home/ProductGridSection";
import CategoryRow from "@/components/home/CategoryRow";
import CollectionRow from "@/components/home/CollectionRow";
import FeaturesSection from "@/components/home/FeaturesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import InstagramGallery from "@/components/home/InstagramGallery";
import ContactCTASection from "@/components/home/ContactCTASection";
import ShopTheLook from "@/components/home/ShopTheLook";

export const revalidate = 60;

export default async function Home() {
  const newArrivalsData = await getProducts({ newArrival: true, limit: 4 });
  const bestSellersData = await getProducts({ bestSeller: true, limit: 4 });

  const mapToCard = (p: any) => ({
    id: p.id,
    name: p.product_name,
    slug: p.slug,
    price: p.discount_price ? Math.round(p.price * (1 - p.discount_price / 100)) : p.price,
    originalPrice: p.discount_price ? p.price : undefined,
    badge: (p.new_arrival ? "NEW" : p.best_seller ? "BESTSELLER" : undefined) as any,
    image: p.cover_image || ""
  });

  const newArrivals = newArrivalsData.map(mapToCard);
  const bestSellers = bestSellersData.map(mapToCard);

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      
      {newArrivals.length > 0 && (
        <ProductGridSection 
          title="New Arrivals" 
          subtitle="The latest additions to our curated collection of fine jewelry."
          products={newArrivals}
          viewAllLink="/new-arrivals"
        />
      )}

      <CategoryRow />
      <ShopTheLook />
      <CollectionRow />

      {bestSellers.length > 0 && (
        <ProductGridSection 
          title="Best Sellers" 
          subtitle="Our most loved pieces, chosen by you."
          products={bestSellers}
          viewAllLink="/best-sellers"
        />
      )}

      <FeaturesSection />
      <TestimonialsSection />
      <InstagramGallery />
      <ContactCTASection />
    </div>
  );
}
