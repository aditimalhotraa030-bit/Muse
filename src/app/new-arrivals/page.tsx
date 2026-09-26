import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

export default function NewArrivalsPage() {
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
    </div>
  );
}
