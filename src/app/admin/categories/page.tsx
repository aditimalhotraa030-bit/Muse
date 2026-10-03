"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Edit, Trash2, Search, Layers } from "lucide-react";
import toast from "@/lib/toast";
import AdminModal from "@/components/admin/AdminModal";
import { compressImageToWebP, formatBytes } from "@/lib/image-compressor";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    display_order: 0,
    image_url: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [imageFile, setImageFile] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
      
    if (data) {
      setCategories(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category? Products in this category will not be deleted.")) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        toast.error("Failed to delete category: " + error.message);
      } else {
        toast.success("Category deleted");
        fetchCategories();
      }
    }
  };

  const openModal = (category?: any) => {
    setImageFile(null);
    setImagePreview("");
    if (category) {
      setEditingId(category.id);
      setFormData({
        name: category.name,
        slug: category.slug,
        display_order: category.display_order || 0,
        image_url: category.image_url || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        slug: "",
        display_order: 0,
        image_url: "",
      });
    }
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await compressImageToWebP(file, { maxWidth: 1000, maxHeight: 1000, quality: 0.82 });
      setImageFile(result.file);
      setImagePreview(result.previewUrl);
      toast.success(
        `Banner converted to WebP (${formatBytes(result.originalSize)} → ${formatBytes(result.compressedSize)}, -${result.savingsPercent}%)`,
        "Image Optimized"
      );
    } catch (err: any) {
      console.error("Failed to compress category image:", err);
      toast.error("Failed to process image: " + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const submitData = { ...formData };
    
    if (imageFile) {
      const fileName = `${Date.now()}-category-${formData.slug || 'img'}.webp`;
      const { error: uploadError } = await supabase.storage
        .from('product-images-muse')
        .upload(fileName, imageFile, {
          contentType: 'image/webp',
          upsert: false
        });
        
      if (uploadError) {
        toast.error("Error uploading image: " + uploadError.message);
        setIsSaving(false);
        return;
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('product-images-muse')
        .getPublicUrl(fileName);
        
      submitData.image_url = publicUrlData.publicUrl;
    }
    
    let saveError;
    let returnedData = null;
    
    if (editingId) {
      const { data, error } = await supabase.from('categories').update(submitData).eq('id', editingId).select();
      saveError = error;
      if (data && data.length > 0) {
        returnedData = data[0];
      }
      if (!saveError) {
        if (!returnedData) {
           toast.error("Update failed (possible permissions issue)");
           setIsSaving(false);
           return;
        }
        toast.success("Category updated!");
      }
    } else {
      const { data, error } = await supabase.from('categories').insert([submitData]).select();
      saveError = error;
      if (data && data.length > 0) {
        returnedData = data[0];
      }
      if (!saveError) toast.success("Category created!");
    }
    
    
    if (saveError) {
      console.error(saveError);
      setErrorMsg(saveError.message || "Failed to save category.");
      toast.error("Failed to save category: " + saveError.message);
    } else {
      setIsModalOpen(false);
      
      // Update local state directly to prevent stale cache issues
      if (returnedData) {
        if (editingId) {
          setCategories(prev => prev.map(c => c.id === editingId ? returnedData : c).sort((a, b) => a.display_order - b.display_order));
        } else {
          setCategories(prev => [...prev, returnedData].sort((a, b) => a.display_order - b.display_order));
        }
      } else {
        fetchCategories(); // Fallback
      }
    }
    
    setIsSaving(false);
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl text-heading mb-1">Categories</h1>
          <p className="text-sm text-foreground/70">Manage product categories (e.g., Earrings, Necklaces).</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold tracking-wider rounded-full hover:bg-primary-hover transition-colors uppercase shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-surface border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-xs uppercase tracking-widest text-foreground/60 font-semibold">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Display Order</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-foreground/50">
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-foreground/50">
                      <Layers className="w-12 h-12 mb-3 stroke-[1]" />
                      <p>No categories found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-heading">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground/70">{category.slug}</td>
                    <td className="px-6 py-4 text-sm text-foreground/70">{category.display_order}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openModal(category)}
                          className="p-2 text-foreground/50 hover:text-primary transition-colors rounded-md hover:bg-primary/10"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-foreground/50 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Edit Category" : "Add Category"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm font-medium">
              {errorMsg}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-heading uppercase tracking-wider mb-2">Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')})}
              className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
              placeholder="e.g. Necklaces"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-heading uppercase tracking-wider mb-2">Slug</label>
            <input 
              type="text" 
              required
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value})}
              className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
              placeholder="e.g. necklaces"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-heading uppercase tracking-wider mb-2">Display Order</label>
            <input 
              type="number" 
              value={formData.display_order}
              onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
              className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-heading uppercase tracking-wider mb-2">Category Image</label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted border border-border shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : formData.image_url ? (
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted border border-border shrink-0">
                  <img src={formData.image_url} alt="Current" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-md bg-muted border border-border flex items-center justify-center text-[10px] text-foreground/50 shrink-0">
                  No Img
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" ref={fileInputRef} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 border border-border rounded-md text-xs font-medium hover:bg-muted transition-colors">
                {imagePreview || formData.image_url ? "Change Image" : "Upload Image"}
              </button>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold tracking-wider rounded-md hover:bg-primary-hover transition-colors uppercase disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Category"}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
