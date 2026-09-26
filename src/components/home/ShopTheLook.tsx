import Link from "next/link";
import Image from "next/image";
import { Plus, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function ShopTheLook() {
  const supabase = await createClient();
  
  // 1. Fetch settings (campaign image and hotspot data)
  const { data: settingsData } = await supabase.from('storefront_settings').select('*');
  
  let campaignImage = "";
  let hotspots: { id: string, x: number, y: number, product_id: string }[] = [];
  
  if (settingsData) {
    const campaignRow = settingsData.find(row => row.key === 'campaign_image');
    if (campaignRow) campaignImage = campaignRow.value;
    
    const hotspotRow = settingsData.find(row => row.key === 'shop_the_look_data');
    if (hotspotRow && hotspotRow.value) {
      try {
        hotspots = JSON.parse(hotspotRow.value);
      } catch (e) {
        console.error("Failed to parse shop_the_look_data");
      }
    }
  }

  // 2. Fetch the actual mapped products
  const productIds = hotspots.map(h => h.product_id).filter(Boolean);
  let mappedProducts: any[] = [];
  
  if (productIds.length > 0) {
    const { data: productsData } = await supabase
      .from('products')
      .select('id, product_name, price, discount_price, cover_image, slug')
      .in('id', productIds);
      
    if (productsData) {
      mappedProducts = productsData;
    }
  }

  // If no mapped products and no image, maybe don't show the section or show placeholder
  if (!campaignImage && mappedProducts.length === 0) {
    return null; // or keep placeholder
  }

  return (
    <section className="container mx-auto px-4 md:px-8 py-16">
      <div className="mb-12">
        <h2 className="font-serif text-3xl text-heading mb-2">Shop the Look</h2>
        <p className="text-foreground/70 text-sm">Our design team's favorites for the perfect stack.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Master Image */}
        <div className="relative aspect-[3/4] md:aspect-square lg:aspect-[4/5] bg-muted rounded-md overflow-hidden w-full group">
          {campaignImage ? (
            <Image 
              src={campaignImage} 
              alt="Campaign" 
              fill 
              sizes="(max-width: 1024px) 100vw, 50vw" 
              className="object-cover" 
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#e4dcd3]">
               <span className="font-serif text-lg opacity-50">Campaign Image Placeholder</span>
            </div>
          )}

          {/* Dynamic Hotspots */}
          {hotspots.map((hotspot) => {
            const product = mappedProducts.find(p => p.id === hotspot.product_id);
            if (!product) return null;
            
            return (
              <Link 
                href={`/product/${product.slug}`} 
                key={hotspot.id}
                className="absolute w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform group/pin"
                style={{ left: `calc(${hotspot.x}% - 16px)`, top: `calc(${hotspot.y}% - 16px)` }}
              >
                <Plus className="w-5 h-5 text-heading" />
                
                {/* Tooltip */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-surface border border-border rounded-md shadow-xl px-3 py-2 w-48 opacity-0 invisible group-hover/pin:opacity-100 group-hover/pin:visible transition-all z-20 pointer-events-none">
                  <p className="text-sm font-serif font-medium text-heading truncate">{product.product_name}</p>
                  <p className="text-xs text-foreground/70 font-medium">₹{(product.discount_price ? Math.round(product.price * (1 - product.discount_price / 100)) : product.price).toLocaleString('en-IN')}</p>
                </div>
              </Link>
            )
          })}
          
          <div className="absolute bottom-6 left-6 bg-background/90 backdrop-blur px-4 py-2 rounded-sm border border-border/50">
             <p className="font-serif text-heading text-sm">The Bridal Bliss Look</p>
             <p className="text-[10px] text-foreground/70 uppercase tracking-widest mt-0.5">{mappedProducts.length} products in this look</p>
          </div>
        </div>

        {/* Dynamic Product List */}
        <div className="flex flex-col justify-center gap-6">
          {mappedProducts.length === 0 ? (
            <div className="text-center p-12 bg-surface border border-border rounded-md">
              <p className="text-foreground/70">Products for this look haven't been mapped yet.</p>
            </div>
          ) : (
            mappedProducts.map((item) => (
              <div key={item.id} className="flex gap-6 items-center p-4 border border-border rounded-md hover:border-primary/50 transition-colors group bg-surface">
                <Link href={`/product/${item.slug}`} className="w-20 h-24 bg-muted rounded-sm shrink-0 overflow-hidden relative flex items-center justify-center">
                  {item.cover_image ? (
                    <Image src={item.cover_image} alt={item.product_name} fill sizes="80px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-foreground/30" />
                  )}
                </Link>
                <div className="flex-1">
                  <Link href={`/product/${item.slug}`} className="font-serif text-lg text-heading group-hover:text-primary transition-colors line-clamp-2">
                    {item.product_name}
                  </Link>
                  <p className="text-sm font-medium text-foreground mt-1">₹{(item.discount_price ? Math.round(item.price * (1 - item.discount_price / 100)) : item.price).toLocaleString('en-IN')}</p>
                </div>
                <Link href={`/product/${item.slug}`} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors shrink-0">
                  <Plus className="w-4 h-4" />
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
