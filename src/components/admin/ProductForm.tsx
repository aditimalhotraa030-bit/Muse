"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, Upload, ArrowLeft, ArrowRight } from "lucide-react";
import toast from "@/lib/toast";

interface ProductFormProps {
  initialData?: any;
  productType?: 'jewelry' | 'suit';
}

interface ProductImageItem {
  id: string;
  url: string;
  file?: Blob;
  isExisting?: boolean;
}

export default function ProductForm({ initialData, productType = 'jewelry' }: ProductFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    product_name: "",
    slug: "",
    sku: "",
    price: 0,
    discount_price: 0,
    stock_quantity: 0,
    availability: true,
    new_arrival: false,
    best_seller: false,
    description: "",
    material: "",
    care_instructions: "",
    category_ids: [] as string[],
    subcategory_ids: [] as string[],
    cover_image: "",
    product_type: productType
  });

  // Multiple product images state
  const [galleryItems, setGalleryItems] = useState<ProductImageItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchSubcategories() {
      if (formData.category_ids.length > 0) {
        const { data } = await supabase.from('subcategories').select('id, name').in('category_id', formData.category_ids);
        if (data) {
          setSubcategories(data);
          const validSubIds = data.map(s => s.id);
          setFormData(prev => ({
            ...prev,
            subcategory_ids: prev.subcategory_ids.filter(id => validSubIds.includes(id))
          }));
        }
      } else {
        setSubcategories([]);
        setFormData(prev => ({ ...prev, subcategory_ids: [] }));
      }
    }
    fetchSubcategories();
  }, [formData.category_ids.join(','), supabase]);

  useEffect(() => {
    async function fetchData() {
      const { data: catsData } = await supabase.from('categories').select('id, name');
      if (catsData) setCategories(catsData);
      
      if (initialData) {
        setFormData({
          product_name: initialData.product_name || "",
          slug: initialData.slug || "",
          sku: initialData.sku || "",
          price: initialData.price || 0,
          discount_price: initialData.discount_price || 0,
          stock_quantity: initialData.stock_quantity || 0,
          availability: initialData.availability ?? true,
          new_arrival: initialData.new_arrival || false,
          best_seller: initialData.best_seller || false,
          description: initialData.description || "",
          material: initialData.material || "",
          care_instructions: initialData.care_instructions || "",
          category_ids: initialData.category_ids || [],
          subcategory_ids: initialData.subcategory_ids || [],
          cover_image: initialData.cover_image || "",
          product_type: initialData.product_type || productType
        });

        // Initialize multiple images from existing product data
        const initialImages: ProductImageItem[] = [];
        const seenUrls = new Set<string>();

        if (initialData.cover_image) {
          initialImages.push({
            id: `cover-${Date.now()}`,
            url: initialData.cover_image,
            isExisting: true
          });
          seenUrls.add(initialData.cover_image);
        }

        if (Array.isArray(initialData.gallery_images)) {
          initialData.gallery_images.forEach((imgUrl: string, idx: number) => {
            if (imgUrl && !seenUrls.has(imgUrl)) {
              initialImages.push({
                id: `gallery-${idx}-${Date.now()}`,
                url: imgUrl,
                isExisting: true
              });
              seenUrls.add(imgUrl);
            }
          });
        }

        setGalleryItems(initialImages);
      }
      setLoading(false);
    }
    fetchData();
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (name === 'product_name' && !initialData) {
      setFormData(prev => ({ 
        ...prev, 
        product_name: value,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      }));
    }
  };

  const handleCategoryToggle = (id: string) => {
    setFormData(prev => {
      const newIds = prev.category_ids.includes(id) 
        ? prev.category_ids.filter(c => c !== id) 
        : [...prev.category_ids, id];
      return { ...prev, category_ids: newIds };
    });
  };

  const handleSubcategoryToggle = (id: string) => {
    setFormData(prev => {
      const newIds = prev.subcategory_ids.includes(id) 
        ? prev.subcategory_ids.filter(c => c !== id) 
        : [...prev.subcategory_ids, id];
      return { ...prev, subcategory_ids: newIds };
    });
  };

  // Helper to convert images client-side to WebP for fast performance
  const processImageToWebP = (file: File): Promise<{ blob: Blob; previewUrl: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const MAX_WIDTH = 1400;
          const MAX_HEIGHT = 1400;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            if (width > height) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            } else {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve({ blob, previewUrl: URL.createObjectURL(blob) });
                } else {
                  reject(new Error("Canvas toBlob failed"));
                }
              },
              "image/webp",
              0.84
            );
          } else {
            reject(new Error("Canvas context not available"));
          }
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Multiple files selection handler
  const handleMultipleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: ProductImageItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const { blob, previewUrl } = await processImageToWebP(file);
        newItems.push({
          id: `new-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
          url: previewUrl,
          file: blob,
          isExisting: false
        });
      } catch (err) {
        console.error("Error processing image file:", err);
      }
    }

    setGalleryItems(prev => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const setPrimaryImage = (index: number) => {
    if (index === 0) return;
    setGalleryItems(prev => {
      const updated = [...prev];
      const [selected] = updated.splice(index, 1);
      updated.unshift(selected);
      return updated;
    });
  };

  const removeImage = (index: number) => {
    setGalleryItems(prev => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: 'prev' | 'next') => {
    const targetIndex = direction === 'prev' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryItems.length) return;
    setGalleryItems(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Clean up empty foreign keys
    const submitData = { ...formData };
    const categoryIds = submitData.category_ids;
    const subcategoryIds = submitData.subcategory_ids;
    delete (submitData as any).category_ids;
    delete (submitData as any).subcategory_ids;

    delete (submitData as any).collection_id;
    if (!submitData.discount_price) delete (submitData as any).discount_price;

    // Upload any new image files and collect all URLs in order
    const finalImageUrls: string[] = [];

    for (let i = 0; i < galleryItems.length; i++) {
      const item = galleryItems[i];
      if (item.isExisting && item.url) {
        finalImageUrls.push(item.url);
      } else if (item.file) {
        const fileName = `${Date.now()}-${i}-${formData.slug || 'product'}.webp`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images-muse')
          .upload(fileName, item.file, {
            contentType: 'image/webp',
            upsert: false
          });
          
        if (uploadError) {
          console.error(uploadError);
          toast.error(`Error uploading image #${i + 1}: ` + uploadError.message);
          setIsSaving(false);
          return;
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('product-images-muse')
          .getPublicUrl(fileName);
          
        finalImageUrls.push(publicUrlData.publicUrl);
      }
    }

    submitData.cover_image = finalImageUrls[0] || "";
    (submitData as any).gallery_images = finalImageUrls;

    let productId = initialData?.id;

    if (initialData?.id) {
      const { error } = await supabase.from('products').update(submitData).eq('id', initialData.id);
      if (error) {
        console.error(error);
        toast.error("Error saving product: " + error.message);
        setIsSaving(false);
        return;
      }
      toast.success("Product updated successfully!");
    } else {
      const { data, error } = await supabase.from('products').insert([submitData]).select('id').single();
      if (error) {
        console.error(error);
        toast.error("Error creating product: " + error.message);
        setIsSaving(false);
        return;
      }
      productId = data.id;
      toast.success("Product created successfully!");
    }

    // Update junction tables
    if (productId) {
      await supabase.from('product_categories').delete().eq('product_id', productId);
      await supabase.from('product_subcategories').delete().eq('product_id', productId);
      
      if (categoryIds.length > 0) {
        await supabase.from('product_categories').insert(
          categoryIds.map(cid => ({ product_id: productId, category_id: cid }))
        );
      }
      if (subcategoryIds.length > 0) {
        await supabase.from('product_subcategories').insert(
          subcategoryIds.map(sid => ({ product_id: productId, subcategory_id: sid }))
        );
      }
    }

    if (productType === 'suit') {
      router.push('/admin/suits');
    } else {
      router.push('/admin/products');
    }
    setIsSaving(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-foreground/50 animate-pulse">Loading form data...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-surface border border-border p-6 rounded-xl shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Basic Info */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="font-serif text-xl border-b border-border pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-heading uppercase tracking-wider mb-2">Product Name</label>
              <input required name="product_name" value={formData.product_name} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-md" />
            </div>
            <div>
              <label className="block text-xs font-bold text-heading uppercase tracking-wider mb-2">Slug</label>
              <input required name="slug" value={formData.slug} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-md" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-heading uppercase tracking-wider mb-2">Description</label>
            <textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-md" />
          </div>
        </div>

        {/* Multiple Product Images Gallery */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-2 gap-2">
            <div>
              <h3 className="font-serif text-xl">Product Images (Multiple Views)</h3>
              <p className="text-xs text-foreground/60">Upload 1 or more images for customer slider views. The first image will be the primary cover.</p>
            </div>
            <div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleMultipleImagesChange}
                className="hidden"
                ref={fileInputRef}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold tracking-wider rounded-md hover:bg-primary-hover transition-colors uppercase shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Upload Images
              </button>
            </div>
          </div>

          {galleryItems.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 sm:p-12 text-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/20 group"
            >
              <Upload className="w-10 h-10 text-foreground/40 group-hover:text-primary mx-auto mb-3 transition-colors" />
              <p className="text-sm font-medium text-heading">Click to upload 1 or more product photos</p>
              <p className="text-xs text-foreground/50 mt-1 max-w-md mx-auto">
                You can select multiple photos at once. Photos are automatically converted to optimized WebP format for fast customer loading.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {galleryItems.map((item, idx) => (
                <div 
                  key={item.id} 
                  className={`relative aspect-[4/5] rounded-xl overflow-hidden border-2 bg-muted group transition-all ${
                    idx === 0 
                      ? 'border-primary ring-2 ring-primary/20 shadow-md' 
                      : 'border-border hover:border-border/80'
                  }`}
                >
                  <img src={item.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />

                  {/* Primary Cover Badge */}
                  {idx === 0 ? (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow uppercase tracking-wider">
                      Cover
                    </div>
                  ) : (
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </div>
                  )}

                  {/* Action overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="p-1.5 rounded-full bg-red-600/90 text-white hover:bg-red-700 transition-colors"
                        title="Delete image"
                        aria-label="Delete image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(idx)}
                          className="w-full py-1 text-[10px] font-bold bg-white text-heading hover:bg-primary hover:text-white rounded transition-colors uppercase tracking-wider shadow"
                        >
                          Make Cover
                        </button>
                      )}
                      <div className="flex justify-between gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveImage(idx, 'prev')}
                          className="flex-1 py-1 text-xs bg-white/20 hover:bg-white/40 text-white rounded disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center"
                          title="Move earlier"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === galleryItems.length - 1}
                          onClick={() => moveImage(idx, 'next')}
                          className="flex-1 py-1 text-xs bg-white/20 hover:bg-white/40 text-white rounded disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center"
                          title="Move later"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add More Tile */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[4/5] rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/10 hover:bg-muted/30 flex flex-col items-center justify-center text-foreground/60 hover:text-primary transition-colors gap-2 cursor-pointer"
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs font-semibold uppercase tracking-wider">Add More</span>
              </button>
            </div>
          )}
        </div>

        {/* Pricing & Inventory */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="font-serif text-xl border-b border-border pb-2">Pricing & Inventory</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-heading uppercase tracking-wider mb-2">Price (₹)</label>
              <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-md" />
            </div>
            <div>
              <label className="block text-xs font-bold text-heading uppercase tracking-wider mb-2">Discount (%)</label>
              <input type="number" name="discount_price" value={formData.discount_price || ''} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-md" />
            </div>
            <div>
              <label className="block text-xs font-bold text-heading uppercase tracking-wider mb-2">Sale Price (₹)</label>
              <div className="w-full px-4 py-2 bg-muted border border-border rounded-md text-foreground/70 font-medium">
                {formData.discount_price ? Math.round(formData.price * (1 - formData.discount_price / 100)) : formData.price}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-heading uppercase tracking-wider mb-2">SKU</label>
              <input required name="sku" value={formData.sku} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-md" />
            </div>
            <div>
              <label className="block text-xs font-bold text-heading uppercase tracking-wider mb-2">Stock Qty</label>
              <input required type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-md" />
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="font-serif text-xl border-b border-border pb-2">Organization & Details</h3>
          
          {productType === 'jewelry' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categories */}
              <div className="bg-background border border-border p-4 rounded-md">
                <label className="block text-xs font-bold text-heading uppercase tracking-wider mb-3 border-b border-border pb-2">Categories (Select multiple)</label>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                  {categories.map(c => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-muted rounded transition-colors">
                      <input 
                        type="checkbox" 
                        checked={formData.category_ids.includes(c.id)} 
                        onChange={() => handleCategoryToggle(c.id)}
                        className="w-4 h-4 accent-primary" 
                      />
                      <span className="text-sm">{c.name}</span>
                    </label>
                  ))}
                  {categories.length === 0 && <span className="text-xs text-foreground/50">No categories found.</span>}
                </div>
              </div>

              {/* Subcategories */}
              <div className="bg-background border border-border p-4 rounded-md">
                <label className="block text-xs font-bold text-heading uppercase tracking-wider mb-3 border-b border-border pb-2">Subcategories (Select multiple)</label>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                  {subcategories.map(s => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-muted rounded transition-colors">
                      <input 
                        type="checkbox" 
                        checked={formData.subcategory_ids.includes(s.id)} 
                        onChange={() => handleSubcategoryToggle(s.id)}
                        className="w-4 h-4 accent-primary" 
                      />
                      <span className="text-sm">{s.name}</span>
                    </label>
                  ))}
                  {subcategories.length === 0 && (
                    <span className="text-xs text-foreground/50">
                      {formData.category_ids.length > 0 ? "No subcategories found for selected categories." : "Select at least one category first."}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-heading uppercase tracking-wider mb-2">Material</label>
              <input name="material" value={formData.material} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-md" />
            </div>
            <div>
              <label className="block text-xs font-bold text-heading uppercase tracking-wider mb-2">Care Instructions</label>
              <input name="care_instructions" value={formData.care_instructions} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-border rounded-md" />
            </div>
          </div>
        </div>

        {/* Status Flags */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="font-serif text-xl border-b border-border pb-2">Status & Badges</h3>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="availability" checked={formData.availability} onChange={handleChange} className="w-4 h-4 accent-primary" />
              <span className="text-sm font-medium">Active (Visible in store)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="new_arrival" checked={formData.new_arrival} onChange={handleChange} className="w-4 h-4 accent-primary" />
              <span className="text-sm font-medium">New Arrival</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-border">
        <button type="button" onClick={() => router.back()} className="px-6 py-3 text-sm font-medium hover:bg-muted rounded-md transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isSaving} className="px-8 py-3 bg-primary text-primary-foreground text-xs font-bold tracking-wider rounded-md hover:bg-primary-hover transition-colors uppercase disabled:opacity-50 shadow-sm">
          {isSaving ? "Saving..." : (initialData ? "Save Changes" : "Create Product")}
        </button>
      </div>
    </form>
  );
}
