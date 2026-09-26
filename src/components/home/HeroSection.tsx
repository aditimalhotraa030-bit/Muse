import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export default async function HeroSection() {
  const supabase = await createClient();
  const { data: settingsData } = await supabase.from('storefront_settings').select('*');
  
  let heroImage = "";
  if (settingsData) {
    const heroRow = settingsData.find(row => row.key === 'hero_image');
    if (heroRow) heroImage = heroRow.value;
  }

  return (
    <section 
      className="w-full relative overflow-hidden flex items-center min-h-[500px] md:min-h-[580px] lg:min-h-[640px]"
      style={{
        background: "radial-gradient(circle at 60% 45%, #dfc5b0 0%, #5f3f33 100%)"
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-12 relative w-full flex flex-col md:flex-row items-center justify-between min-h-[500px] md:min-h-[580px] lg:min-h-[640px]">
        {/* Left Content - ON MOBILE: order-2 (BOTTOM), ON DESKTOP: order-1 (LEFT) */}
        <div className="order-2 md:order-1 w-full md:w-[52%] lg:w-[50%] flex flex-col justify-center items-center md:items-start text-center md:text-left space-y-5 md:space-y-6 py-10 sm:py-12 md:py-20 lg:py-24 z-10">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#f4ccaf] font-medium leading-[1.15] drop-shadow-sm">
            Classic Jewellery Collection
          </h1>
          <p className="text-[#f4ccaf]/90 font-normal leading-relaxed text-sm sm:text-base md:text-lg max-w-lg">
            If you like the idea of highest quality jewellery pieces available for a price as stunning as the sparkle meet your new best friend!
          </p>
          <div className="pt-2 md:pt-4 w-full sm:w-auto">
            <Link 
              href="/shop" 
              className="px-9 py-3.5 sm:py-4 bg-[#f4ccaf] text-[#42271d] hover:bg-[#fcd1b4] text-xs sm:text-sm font-bold tracking-widest uppercase rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 inline-flex items-center justify-center w-full sm:w-auto"
            >
              Shop All
            </Link>
          </div>
        </div>

        {/* Right Image - ON MOBILE: order-1 (TOP), ON DESKTOP: order-2 (RIGHT) - FULL LENGTH OF HERO */}
        <div className="order-1 md:order-2 w-full md:w-auto md:absolute md:right-2 lg:right-6 xl:right-16 md:bottom-0 md:top-0 md:w-[48%] lg:w-[46%] xl:w-[44%] max-w-[680px] flex items-end justify-center md:justify-end pointer-events-none">
          <div className="relative w-full max-w-[340px] sm:max-w-[420px] md:max-w-none aspect-square md:aspect-auto md:h-full flex items-end justify-center md:justify-end">
            {/* Subtle champagne glow accent */}
            <div className="absolute inset-x-8 bottom-0 top-1/4 bg-[#f4ccaf]/15 rounded-full blur-3xl pointer-events-none" />
            <Image 
              src={heroImage || "/hero-model.png"} 
              alt="Classic Jewellery Collection" 
              fill 
              priority 
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 50vw, 45vw" 
              className="object-contain object-bottom drop-shadow-[0_20px_45px_rgba(0,0,0,0.5)]" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
