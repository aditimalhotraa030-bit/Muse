import Link from "next/link";
import Image from "next/image";
import { getCategories } from "@/lib/data";

export default async function CategoryRow() {
  const categories = await getCategories();

  if (!categories || categories.length === 0) return null;

  return (
    <section className="container mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="flex justify-between items-end mb-6 md:mb-10 border-b border-border pb-4">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl text-heading mb-1">Shop by Category</h2>
          <p className="text-foreground/70 text-xs md:text-sm">Find your focus.</p>
        </div>
        <Link href="/shop" className="text-xs font-bold tracking-widest uppercase text-heading hover:text-primary transition-colors pb-1">
          View All
        </Link>
      </div>

      <div className="flex items-center overflow-x-auto pb-4 pt-1 snap-x hide-scrollbar gap-5 sm:gap-6 md:gap-4 md:justify-between px-1">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/shop/${cat.slug}`} className="flex flex-col items-center gap-2.5 md:gap-4 group snap-start shrink-0 w-22 sm:w-28 md:w-auto md:flex-1">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-full bg-[#f0eae1] border border-border/50 group-hover:border-primary transition-colors flex items-center justify-center overflow-hidden shadow-sm">
               {cat.image_url ? (
                 <Image src={cat.image_url} alt={cat.name} fill sizes="(max-width: 768px) 96px, 176px" className="object-cover" />
               ) : (
                 <span className="text-[10px] text-foreground/40 font-serif">Img</span>
               )}
            </div>
            <span className="font-serif text-sm md:text-lg text-heading group-hover:text-primary transition-colors text-center">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
