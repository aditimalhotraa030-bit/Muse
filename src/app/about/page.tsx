import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Play } from "lucide-react";

const DEFAULT_VIDEO_FEED = [
  {
    video_url: "/videos/reel-0.mp4",
    post_url: "https://www.instagram.com/reel/DdlfvQXzeCc/?stkn=NTFvZW9nbG02d3Fz"
  },
  {
    video_url: "/videos/reel-1.mp4",
    post_url: "https://www.instagram.com/reel/DdgimhUTGF3/?stkn=YWZ0bmtma3lldTY2"
  },
  {
    video_url: "/videos/reel-2.mp4",
    post_url: "https://www.instagram.com/reel/DdoC7SWTzBK/?stkn=MXc0c3RrMXM2ZG5idg=="
  },
  {
    video_url: "/videos/reel-3.mp4",
    post_url: "https://www.instagram.com/reel/DY4FcgxTpoI/?stkn=MWppc3JqYmwzanVuYQ=="
  }
];

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: settingsData } = await supabase.from('storefront_settings').select('*');
  
  let videoFeed = DEFAULT_VIDEO_FEED;
  
  if (settingsData) {
    const feedRow = settingsData.find(row => row.key === 'about_video_grid');
    if (feedRow && feedRow.value) {
      try {
        const parsed = JSON.parse(feedRow.value);
        if (Array.isArray(parsed) && parsed.length === 4) {
          videoFeed = parsed;
        }
      } catch (e) {}
    }
  }

  const hasVideos = videoFeed.some(v => v.video_url !== "");

  return (
    <div className="container mx-auto px-4 md:px-8 py-16 md:py-24 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
        <p className="text-xs font-semibold tracking-[0.2em] text-foreground/70 uppercase mb-6">
          OUR STORY
        </p>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-heading mb-8 leading-tight">
          Modern heirlooms, made for the everyday muse
        </h1>
        <p className="text-foreground/80 leading-relaxed text-sm md:text-base max-w-2xl">
          muse by Kashish began with a simple belief—that beautiful jewelry shouldn't be locked away for special occasions. We design lightweight, premium artificial jewelry that feels as precious as fine jewels, so you can wear your best every single day.
        </p>
      </div>

      {/* Video Grid Hero */}
      <div className="mb-24 w-full">
        {hasVideos ? (
          <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-4 gap-4 pb-4 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {videoFeed.map((item, index) => {
              const targetUrl = item.post_url || "https://instagram.com/musebykashish";
              
              if (!item.video_url) {
                return (
                  <div key={index} className="relative aspect-[9/16] bg-[#f0eae1] rounded-md overflow-hidden shrink-0 w-[75vw] md:w-auto snap-center flex items-center justify-center border border-border">
                    <span className="font-serif text-sm opacity-30 tracking-widest uppercase">Video {index + 1}</span>
                  </div>
                );
              }

              return (
                <Link 
                  key={index} 
                  href={targetUrl} 
                  target="_blank" 
                  className="relative aspect-[9/16] bg-muted rounded-md overflow-hidden group block shrink-0 w-[75vw] md:w-auto snap-center"
                >
                  <video 
                    src={item.video_url} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110 duration-300">
                      <Play className="w-6 h-6 text-white fill-white ml-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="w-full aspect-video md:aspect-[21/9] bg-[#f0eae1] rounded-md border border-border overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
              <span className="font-serif text-xl tracking-widest opacity-50">ABOUT BRAND CAMPAIGN IMAGE</span>
            </div>
          </div>
        )}
      </div>

      {/* Values Section */}
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-serif text-3xl text-heading mb-12">What we stand for</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center">
            <h3 className="font-serif text-xl text-heading mb-4">Timeless Elegance</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              We draw inspiration from classic silhouettes and infuse them with modern minimalism, ensuring every piece outlives fleeting trends.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <h3 className="font-serif text-xl text-heading mb-4">Accessible Luxury</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              By using premium materials and expert craftsmanship without the retail markup, we make luxurious jewelry accessible to everyone.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <h3 className="font-serif text-xl text-heading mb-4">Thoughtful Design</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              From the weight of the earring to the clasp of the necklace, every detail is considered for your absolute comfort.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
