import InstagramIcon from "@/components/icons/InstagramIcon";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_INSTAGRAM_FEED = [
  {
    image_url: "/instagram/post-0.webp",
    post_url: "https://www.instagram.com/p/DdT5ssnE5jA/?img_index=4&stkn=eHVyanh0Y3plZzRr"
  },
  {
    image_url: "/instagram/post-1.webp",
    post_url: "https://www.instagram.com/p/DdJZUDgE4Vt/?stkn=amowaWR5NjRnamd3"
  },
  {
    image_url: "/instagram/post-2.webp",
    post_url: "https://www.instagram.com/p/DWwLa3rk0r3/?stkn=MW5vb2t6M2EzYnN1dA=="
  },
  {
    image_url: "/instagram/post-3-emerald.webp",
    post_url: "https://www.instagram.com/p/DWlylDEE5yL/?stkn=ZXVmMm5xOW45YzZ4"
  },
  {
    image_url: "/instagram/post-4.webp",
    post_url: "https://www.instagram.com/p/DW6KL4pCa4G/?stkn=eTZuamsyaXY0cXgx"
  }
];

export default async function InstagramGallery() {
  const supabase = await createClient();
  const { data: settingsData } = await supabase.from('storefront_settings').select('*');
  
  let instagramFeed = DEFAULT_INSTAGRAM_FEED;
  
  if (settingsData) {
    const feedRow = settingsData.find(row => row.key === 'instagram_feed_data');
    if (feedRow && feedRow.value) {
      try {
        const parsed = JSON.parse(feedRow.value);
        if (Array.isArray(parsed) && parsed.length === 5) {
          instagramFeed = parsed;
        }
      } catch (e) {}
    }
  }

  return (
    <section className="py-16">
      <div className="text-center mb-10">
        <a 
          href="https://www.instagram.com/musebykashish.co/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-block hover:opacity-80 transition-opacity"
        >
          <h2 className="font-serif text-3xl text-heading mb-2">@musebykashish.co</h2>
        </a>
        <p className="text-foreground/70 text-sm">Tag us on the feed to get featured.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-0">
        {instagramFeed.map((item, index) => {
          const hasImage = !!item.image_url;
          const targetUrl = item.post_url || "https://www.instagram.com/musebykashish.co/";
          
          return (
            <Link key={index} href={targetUrl} target="_blank" rel="noopener noreferrer" className="group relative aspect-square bg-muted overflow-hidden block">
              {hasImage ? (
                <Image 
                  src={item.image_url} 
                  alt={`Instagram ${index + 1}`} 
                  fill 
                  sizes="(max-width: 768px) 50vw, 20vw" 
                  className="object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              ) : (
                <div className="absolute inset-0 bg-[#e4dcd3] flex items-center justify-center text-muted-foreground/50 transition-transform duration-700 group-hover:scale-110">
                  <span className="font-serif text-sm">Post {index + 1}</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
                <InstagramIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
