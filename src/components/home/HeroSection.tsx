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
    <section className="w-full relative overflow-hidden">
      {/* ========================================================================= */}
      {/* MOBILE HERO VIEW (Hidden on md and up)                                   */}
      {/* Styled to match the luxury full-screen reference design                  */}
      {/* ========================================================================= */}
      <div 
        className="block md:hidden relative w-full h-[calc(100svh-4rem)] min-h-[580px] max-h-[820px] overflow-hidden select-none"
        style={{
          background: "radial-gradient(ellipse at 50% 28%, #d4bcab 0%, #ba9f88 40%, #5d3d31 100%)"
        }}
      >
        {/* Model Portrait Layer */}
        <div className="absolute inset-x-0 top-0 h-[560px] flex items-start justify-center pointer-events-none overflow-hidden">
          {/* Soft warm studio lighting accent */}
          <div className="absolute w-[320px] h-[320px] rounded-full bg-[#fde9d7]/35 blur-3xl top-[8%] left-1/2 -translate-x-1/2 pointer-events-none" />
          
          <div className="relative w-full h-[430px] flex items-start justify-center">
            <div className="relative w-full h-full origin-top scale-[1.18] -mt-1">
              <Image 
                src={heroImage || "/hero-model.png"} 
                alt="Muse Fine Jewelry" 
                fill 
                priority 
                sizes="100vw" 
                className="object-contain object-top drop-shadow-[0_15px_35px_rgba(0,0,0,0.3)]" 
              />
            </div>
          </div>
        </div>

        {/* Cinematic Vignette & Bottom Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#120b08] via-[#1a0e0a]/90 via-36% to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/15 to-transparent pointer-events-none z-10" />

        {/* Bottom Content & CTA */}
        <div className="absolute bottom-0 inset-x-0 px-6 pb-8 z-20 flex flex-col justify-end text-left">
          <h1 className="font-serif text-[28px] sm:text-3xl text-[#fefcfb] font-medium leading-[1.16] tracking-tight drop-shadow-md">
            Classic Jewellery Collection
          </h1>
          <p className="text-white/90 text-xs sm:text-sm font-light leading-relaxed mt-2.5 mb-6 max-w-[340px] drop-shadow-sm">
            If you like the idea of highest quality jewellery pieces available for a price as stunning as the sparkle meet your new best friend!
          </p>
          <Link 
            href="/shop" 
            className="w-full py-3.5 sm:py-4 px-6 bg-[#c87355] hover:bg-[#b86446] active:scale-[0.98] text-white font-medium text-sm sm:text-base rounded-[24px] text-center shadow-lg shadow-black/35 transition-all duration-300 block"
          >
            Explore Muse
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP HERO VIEW (md and up)                                             */}
      {/* ========================================================================= */}
      <div 
        className="hidden md:flex w-full relative overflow-hidden items-center min-h-[580px] lg:min-h-[640px]"
        style={{
          background: "radial-gradient(circle at 60% 45%, #dfc5b0 0%, #5f3f33 100%)"
        }}
      >
        {/* Right Image - Shifted to Absolute Right */}
        <div className="absolute right-0 bottom-0 top-0 w-[50%] lg:w-[48%] xl:w-[46%] max-w-[800px] flex items-end justify-end pointer-events-none z-0">
          <div className="relative w-full h-full flex items-end justify-end">
            {/* Subtle champagne glow accent */}
            <div className="absolute inset-x-8 bottom-0 top-1/4 bg-[#f4ccaf]/15 rounded-full blur-3xl pointer-events-none" />
            <Image 
              src={heroImage || "/hero-model.png"} 
              alt="Classic Jewellery Collection" 
              fill 
              priority 
              sizes="(max-width: 1200px) 50vw, 45vw" 
              className="object-contain object-bottom object-right drop-shadow-[0_20px_45px_rgba(0,0,0,0.5)]" 
            />
          </div>
        </div>

        <div className="container mx-auto px-6 md:px-12 relative w-full flex flex-row items-center justify-between min-h-[580px] lg:min-h-[640px] z-10">
          {/* Left Content */}
          <div className="w-[52%] lg:w-[50%] flex flex-col justify-center items-start text-left space-y-6 py-20 lg:py-24">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#f4ccaf] font-medium leading-[1.15] drop-shadow-sm">
              Classic Jewellery Collection
            </h1>
            <p className="text-[#f4ccaf]/90 font-normal leading-relaxed text-base md:text-lg max-w-lg">
              If you like the idea of highest quality jewellery pieces available for a price as stunning as the sparkle meet your new best friend!
            </p>
            <div className="pt-4">
              <Link 
                href="/shop" 
                className="px-9 py-4 bg-[#f4ccaf] text-[#42271d] hover:bg-[#fcd1b4] text-sm font-bold tracking-widest uppercase rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 inline-flex items-center justify-center"
              >
                Shop All
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
