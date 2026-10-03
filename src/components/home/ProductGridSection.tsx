import Link from "next/link";
import ProductCard from "../ui/ProductCard";

interface ProductGridSectionProps {
  title: string;
  subtitle: string;
  products: any[]; // Using any for now until we define types from Supabase
  viewAllLink: string;
}

export default function ProductGridSection({ title, subtitle, products, viewAllLink }: ProductGridSectionProps) {
  return (
    <section className="container mx-auto px-4 md:px-8 py-16 border-t border-border/50">
      <div className="flex justify-between items-end mb-10 border-b border-border pb-4">
        <div>
          <h2 className="font-serif text-3xl text-heading mb-1">{title}</h2>
          <p className="text-foreground/70 text-sm">{subtitle}</p>
        </div>
        <Link href={viewAllLink} className="text-xs font-bold tracking-widest uppercase text-heading hover:text-primary transition-colors pb-1">
          Shop All
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
    </section>
  );
}
