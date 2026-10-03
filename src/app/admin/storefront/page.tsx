"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Image as ImageIcon, Save, Upload, Plus, X, Link as LinkIcon } from "lucide-react";
import toast from "@/lib/toast";
import { compressImageToWebP, formatBytes } from "@/lib/image-compressor";

type Hotspot = {
  id: string;
  x: number;
  y: number;
  product_id: string;
};

type Product = {
  id: string;
  product_name: string;
};

type InstagramFeedItem = {
  image_url: string;
  post_url: string;
};

export default function StorefrontSettingsPage() {
  const [settings, setSettings] = useState({
    hero_image: "",
    campaign_image: "",
    shop_the_look_data: [] as Hotspot[],
    instagram_feed_data: Array(5).fill({ image_url: "", post_url: "" }) as InstagramFeedItem[]
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const supabase = createClient();

  // Local state for image previews
  const [heroImageFile, setHeroImageFile] = useState<Blob | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string>("");
  const heroInputRef = useRef<HTMLInputElement>(null);

  const [campaignImageFile, setCampaignImageFile] = useState<Blob | null>(null);
  const [campaignImagePreview, setCampaignImagePreview] = useState<string>("");
  const campaignInputRef = useRef<HTMLInputElement>(null);

  const [hotspots, setHotspots] = useState<Hotspot[]>([]);

  const [instagramFeed, setInstagramFeed] = useState<InstagramFeedItem[]>(Array(5).fill({ image_url: "", post_url: "" }));
  const [instagramFiles, setInstagramFiles] = useState<(Blob | null)[]>(Array(5).fill(null));
  const [instagramPreviews, setInstagramPreviews] = useState<string[]>(Array(5).fill(""));
  const instagramInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    fetchSettingsAndProducts();
  }, []);

  const fetchSettingsAndProducts = async () => {
    setLoading(true);
    
    // Fetch products for dropdown
    const { data: productsData } = await supabase.from('products').select('id, product_name').order('product_name');
    if (productsData) setProducts(productsData);

    // Fetch settings
    const { data, error } = await supabase.from('storefront_settings').select('*');
    if (data) {
      const newSettings = { ...settings };
      let initialHotspots: Hotspot[] = [];
      let initialInstagramFeed = Array(5).fill({ image_url: "", post_url: "" });

      data.forEach(row => {
        if (row.key === 'hero_image') newSettings.hero_image = row.value;
        if (row.key === 'campaign_image') newSettings.campaign_image = row.value;
        if (row.key === 'shop_the_look_data') {
          try {
            initialHotspots = JSON.parse(row.value);
            newSettings.shop_the_look_data = initialHotspots;
          } catch (e) {}
        }
        if (row.key === 'instagram_feed_data') {
          try {
            const parsed = JSON.parse(row.value);
            if (Array.isArray(parsed) && parsed.length === 5) {
              initialInstagramFeed = parsed;
              newSettings.instagram_feed_data = parsed;
            }
          } catch (e) {}
        }
      });
      setSettings(newSettings);
      setHotspots(initialHotspots);
      setInstagramFeed(initialInstagramFeed);
    }
    setLoading(false);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'campaign') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const isHero = type === 'hero';
      const result = await compressImageToWebP(file, {
        maxWidth: isHero ? 1920 : 1600,
        maxHeight: isHero ? 1920 : 1600,
        quality: isHero ? 0.85 : 0.82
      });

      if (type === 'hero') {
        setHeroImageFile(result.file);
        setHeroImagePreview(result.previewUrl);
      } else {
        setCampaignImageFile(result.file);
        setCampaignImagePreview(result.previewUrl);
      }

      toast.success(
        `${isHero ? 'Hero' : 'Campaign'} image converted to WebP (${formatBytes(result.originalSize)} → ${formatBytes(result.compressedSize)}, -${result.savingsPercent}%)`,
        "Image Optimized"
      );
    } catch (err: any) {
      console.error(`Failed to compress ${type} image:`, err);
      toast.error("Failed to process image: " + err.message);
    }
  };

  const handleInstagramImageChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await compressImageToWebP(file, {
        maxWidth: 800,
        maxHeight: 800,
        squareCrop: true,
        quality: 0.82
      });

      const newFiles = [...instagramFiles];
      newFiles[index] = result.file;
      setInstagramFiles(newFiles);

      const newPreviews = [...instagramPreviews];
      newPreviews[index] = result.previewUrl;
      setInstagramPreviews(newPreviews);

      toast.success(
        `Instagram photo #${index + 1} cropped & converted to WebP (${formatBytes(result.originalSize)} → ${formatBytes(result.compressedSize)}, -${result.savingsPercent}%)`,
        "Image Optimized"
      );
    } catch (err: any) {
      console.error(`Failed to compress Instagram image #${index + 1}:`, err);
      toast.error("Failed to process image: " + err.message);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newHotspot: Hotspot = {
      id: Date.now().toString(),
      x,
      y,
      product_id: "" // Empty initially
    };
    
    setHotspots([...hotspots, newHotspot]);
  };

  const updateHotspotProduct = (id: string, product_id: string) => {
    setHotspots(hotspots.map(h => h.id === id ? { ...h, product_id } : h));
  };

  const removeHotspot = (id: string) => {
    setHotspots(hotspots.filter(h => h.id !== id));
  };

  const updateInstagramPostUrl = (index: number, url: string) => {
    const newFeed = [...instagramFeed];
    newFeed[index] = { ...newFeed[index], post_url: url };
    setInstagramFeed(newFeed);
  };

  const removeInstagramImage = (index: number) => {
    const newFeed = [...instagramFeed];
    newFeed[index] = { image_url: "", post_url: "" };
    setInstagramFeed(newFeed);
    
    const newFiles = [...instagramFiles];
    newFiles[index] = null;
    setInstagramFiles(newFiles);
    
    const newPreviews = [...instagramPreviews];
    newPreviews[index] = "";
    setInstagramPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    let updatedHeroUrl = settings.hero_image;
    let updatedCampaignUrl = settings.campaign_image;
    let updatedInstagramFeed = [...instagramFeed];

    // Upload Hero Image
    if (heroImageFile) {
      const fileName = `${Date.now()}-hero.webp`;
      const { error: uploadError } = await supabase.storage
        .from('product-images-muse')
        .upload(fileName, heroImageFile, { contentType: 'image/webp' });
        
      if (uploadError) {
        toast.error("Error uploading hero image: " + uploadError.message);
        setIsSaving(false);
        return;
      }
      const { data } = supabase.storage.from('product-images-muse').getPublicUrl(fileName);
      updatedHeroUrl = data.publicUrl;
    }

    // Upload Campaign Image
    if (campaignImageFile) {
      const fileName = `${Date.now()}-campaign.webp`;
      const { error: uploadError } = await supabase.storage
        .from('product-images-muse')
        .upload(fileName, campaignImageFile, { contentType: 'image/webp' });
        
      if (uploadError) {
        toast.error("Error uploading campaign image: " + uploadError.message);
        setIsSaving(false);
        return;
      }
      const { data } = supabase.storage.from('product-images-muse').getPublicUrl(fileName);
      updatedCampaignUrl = data.publicUrl;
    }

    // Upload Instagram Images
    for (let i = 0; i < 5; i++) {
      if (instagramFiles[i]) {
        const fileName = `${Date.now()}-insta-${i}.webp`;
        const { error: uploadError } = await supabase.storage
          .from('product-images-muse')
          .upload(fileName, instagramFiles[i]!, { contentType: 'image/webp' });
          
        if (uploadError) {
          toast.error(`Error uploading Instagram image ${i + 1}: ` + uploadError.message);
        } else {
          const { data } = supabase.storage.from('product-images-muse').getPublicUrl(fileName);
          updatedInstagramFeed[i] = { ...updatedInstagramFeed[i], image_url: data.publicUrl };
        }
      }
    }

    // Save to database
    const { error } = await supabase.from('storefront_settings').upsert([
      { key: 'hero_image', value: updatedHeroUrl },
      { key: 'campaign_image', value: updatedCampaignUrl },
      { key: 'shop_the_look_data', value: JSON.stringify(hotspots) },
      { key: 'instagram_feed_data', value: JSON.stringify(updatedInstagramFeed) }
    ]);
    
    if (error) {
      toast.error("Failed to save settings: " + error.message);
    } else {
      setSettings({ 
        hero_image: updatedHeroUrl, 
        campaign_image: updatedCampaignUrl,
        shop_the_look_data: hotspots,
        instagram_feed_data: updatedInstagramFeed
      });
      setHeroImageFile(null);
      setCampaignImageFile(null);
      setInstagramFiles(Array(5).fill(null));
      toast.success("Storefront settings saved successfully!");
    }
    setIsSaving(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-foreground/50">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-serif text-3xl text-heading mb-1">Storefront Settings</h1>
        <p className="text-sm text-foreground/70">Manage your homepage banners and campaigns.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* Hero Banner */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <h2 className="font-serif text-xl text-heading mb-4 border-b border-border pb-2">Main Hero Banner</h2>
          <p className="text-sm text-foreground/70 mb-4">This is the large image displayed at the very top of your homepage.</p>
          
          <div className="space-y-4">
            <div className="relative aspect-video md:aspect-[21/9] bg-muted rounded-md overflow-hidden border border-border flex items-center justify-center">
              {(heroImagePreview || settings.hero_image) ? (
                <img 
                  src={heroImagePreview || settings.hero_image} 
                  alt="Hero Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-foreground/50 flex flex-col items-center">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm">No image uploaded</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleImageChange(e, 'hero')} 
                className="hidden" 
                ref={heroInputRef} 
              />
              <button 
                type="button" 
                onClick={() => heroInputRef.current?.click()} 
                className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-md text-sm font-medium transition-colors"
              >
                <Upload className="w-4 h-4" />
                {heroImagePreview || settings.hero_image ? "Change Hero Image" : "Upload Hero Image"}
              </button>
            </div>
          </div>
        </div>

        {/* Campaign Banner & Shop the Look */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <h2 className="font-serif text-xl text-heading mb-4 border-b border-border pb-2">"Shop The Look" Campaign</h2>
          <p className="text-sm text-foreground/70 mb-4">Click anywhere on the image to drop a pin, then assign a product to it below.</p>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="space-y-4 w-full md:w-1/2">
              <div 
                className="relative aspect-[3/4] md:aspect-[4/5] bg-muted rounded-md overflow-hidden border border-border flex items-center justify-center cursor-crosshair group"
                onClick={handleImageClick}
              >
                {(campaignImagePreview || settings.campaign_image) ? (
                  <img 
                    src={campaignImagePreview || settings.campaign_image} 
                    alt="Campaign Preview" 
                    className="w-full h-full object-cover pointer-events-none"
                  />
                ) : (
                  <div className="text-center text-foreground/50 flex flex-col items-center pointer-events-none">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-sm">No image uploaded</span>
                  </div>
                )}
                
                {/* Overlay Text */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="text-white font-medium text-sm px-4 py-2 bg-black/50 rounded-full backdrop-blur">Click to place pin</span>
                </div>

                {/* Render Hotspots */}
                {hotspots.map((hotspot, index) => (
                  <div 
                    key={hotspot.id}
                    className="absolute w-6 h-6 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg border border-border/50 text-xs font-bold text-heading pointer-events-none"
                    style={{ left: `calc(${hotspot.x}% - 12px)`, top: `calc(${hotspot.y}% - 12px)` }}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageChange(e, 'campaign')} 
                  className="hidden" 
                  ref={campaignInputRef} 
                />
                <button 
                  type="button" 
                  onClick={() => campaignInputRef.current?.click()} 
                  className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-md text-sm font-medium transition-colors w-full justify-center"
                >
                  <Upload className="w-4 h-4" />
                  {campaignImagePreview || settings.campaign_image ? "Change Image" : "Upload Image"}
                </button>
              </div>
            </div>

            {/* Hotspot List */}
            <div className="w-full md:w-1/2 space-y-4">
              <h3 className="font-medium text-heading">Mapped Products</h3>
              {hotspots.length === 0 ? (
                <p className="text-sm text-foreground/50 bg-muted p-4 rounded-md text-center">No pins placed yet. Click the image to add one.</p>
              ) : (
                <div className="space-y-3">
                  {hotspots.map((hotspot, index) => (
                    <div key={hotspot.id} className="flex gap-3 items-center p-3 border border-border rounded-md bg-muted/30">
                      <div className="w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                        {index + 1}
                      </div>
                      <select
                        value={hotspot.product_id}
                        onChange={(e) => updateHotspotProduct(hotspot.id, e.target.value)}
                        className="flex-1 w-full p-2 bg-background border border-border rounded-md text-sm text-foreground"
                        required
                      >
                        <option value="">Select a product...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.product_name}</option>
                        ))}
                      </select>
                      <button 
                        type="button"
                        onClick={() => removeHotspot(hotspot.id)}
                        className="p-2 text-foreground/50 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Remove pin"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instagram Gallery */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <h2 className="font-serif text-xl text-heading mb-4 border-b border-border pb-2">Instagram / Social Feed</h2>
          <p className="text-sm text-foreground/70 mb-6">Upload up to 5 images to show in the social feed section at the bottom of the homepage.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[0, 1, 2, 3, 4].map((index) => {
              const currentUrl = instagramPreviews[index] || instagramFeed[index].image_url;
              return (
                <div key={index} className="space-y-3">
                  <div className="relative aspect-square bg-muted rounded-md border border-border overflow-hidden flex items-center justify-center group">
                    {currentUrl ? (
                      <img src={currentUrl} alt={`Feed ${index + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-foreground/40">
                        <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                        <span className="text-xs">Post {index + 1}</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={(el) => { instagramInputRefs.current[index] = el; }}
                        onChange={(e) => handleInstagramImageChange(e, index)}
                      />
                      <button 
                        type="button"
                        onClick={() => instagramInputRefs.current[index]?.click()}
                        className="bg-white text-heading text-xs px-3 py-1.5 rounded-full font-medium hover:scale-105 transition-transform"
                      >
                        Upload
                      </button>
                      {currentUrl && (
                        <button 
                          type="button"
                          onClick={() => removeInstagramImage(index)}
                          className="text-white text-xs hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <LinkIcon className="h-3 w-3 text-foreground/40" />
                    </div>
                    <input
                      type="url"
                      placeholder="Instagram URL"
                      value={instagramFeed[index].post_url}
                      onChange={(e) => updateInstagramPostUrl(index, e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 bg-background border border-border rounded-md text-xs text-foreground placeholder:text-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 pb-12">
          <button 
            type="submit" 
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-sm font-bold tracking-wider rounded-md hover:bg-primary-hover transition-colors uppercase disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Storefront Settings"}
          </button>
        </div>

      </form>
    </div>
  );
}
