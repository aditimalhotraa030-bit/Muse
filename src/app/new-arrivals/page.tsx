import { getProducts } from "@/lib/data";
import PageHeader from "@/components/ui/PageHeader";
import ProductCard from "@/components/ui/ProductCard";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export const revalidate = 60;

export default async function NewArrivalsPage() {
  const productsData = await getProducts({ newArrival: true, productType: 'all' });

  const products = productsData.map((p: any) => ({
    id: p.id,
    name: p.product_name,
    slug: p.slug,
    price: p.discount_price ? Math.round(p.price * (1 - p.discount_price / 100)) : p.price,
    originalPrice: p.discount_price ? p.price : undefined,
    badge: "NEW" as const,
    image: p.cover_image || "",
    images: (Array.isArray(p.gallery_images) && p.gallery_images.length > 0)
      ? p.gallery_images
      : (p.cover_image ? [p.cover_image] : [])
  }));

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
      <PageHeader 
        title="New Arrivals" 
        subtitle="The freshest pieces to join the muse by Kashish family."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "New Arrivals", href: "/new-arrivals" }
        ]} 
      />

      {products.length > 0 ? (
        <div className="mt-8 border-t border-border pt-8">
          <div className="flex items-center justify-between mb-8">
            <p className="text-xs font-medium tracking-wider uppercase text-foreground/60 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Showing {products.length} New {products.length === 1 ? 'Design' : 'Designs'}
            </p>
            <Link 
              href="/shop" 
              className="text-xs font-bold tracking-widest uppercase text-heading hover:text-primary transition-colors"
            >
              View Full Collection &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((product) => (
              <ProductCard 
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                originalPrice={product.originalPrice}
                image={product.image}
                images={product.images}
                badge={product.badge}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-24 md:py-32 border-t border-border mt-8">
          <h2 className="font-serif text-3xl md:text-4xl text-heading mb-6 tracking-wide">
            Coming Soon
          </h2>
          <p className="text-foreground/70 max-w-md mx-auto text-base md:text-lg leading-relaxed mb-10">
            We are currently shooting our newest pieces. Check back shortly to see our latest designs!
          </p>
          <div className="w-16 h-[1px] bg-border mx-auto mb-10"></div>
          <Link href="/shop" className="px-8 py-3 bg-primary text-primary-foreground text-xs font-bold tracking-widest uppercase rounded-full hover:bg-primary-hover transition-colors">
            Shop All Jewelry
          </Link>
        </div>
      )}
    </div>
  );
}
