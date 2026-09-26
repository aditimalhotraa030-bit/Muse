"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";

interface ShopClientSideFilterProps {
  products: any[];
  categories: any[];
  categoryParam: string;
  subcategoryParam: string;
}

export default function ShopClientSideFilter({ products, categories, categoryParam, subcategoryParam }: ShopClientSideFilterProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<string>("featured");

  // Get active category object to find subcategories
  const activeCategoryObj = categories.find(c => c.slug === categoryParam);

  // Filter products
  let filteredProducts = products;
  
  if (categoryParam !== "all") {
    filteredProducts = filteredProducts.filter(p => p.categorySlugs?.includes(categoryParam));
  }
  
  if (subcategoryParam) {
    filteredProducts = filteredProducts.filter(p => p.subcategorySlugs?.includes(subcategoryParam));
  }

  // Sort filtered products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case "price-asc":
        return list.sort((a, b) => a.price - b.price);
      case "price-desc":
        return list.sort((a, b) => b.price - a.price);
      case "newest":
        return list.sort((a, b) => {
          if (a.badge === "NEW" && b.badge !== "NEW") return -1;
          if (b.badge === "NEW" && a.badge !== "NEW") return 1;
          return 0;
        });
      case "name-asc":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "featured":
      default:
        return list;
    }
  }, [filteredProducts, sortBy]);

  const handleCategoryClick = (slug: string) => {
    if (slug === 'all') {
      router.push(`/shop`);
    } else {
      router.push(`/shop/${slug}`);
    }
  };

  const handleSubcategoryClick = (slug: string) => {
    if (slug === 'all') {
      router.push(`/shop/${categoryParam}`);
    } else {
      router.push(`/shop/${categoryParam}/${slug}`);
    }
  };

  return (
    <>
      {/* Category Pills */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar snap-x">
        {categories.map((category) => (
          <button
            key={category.slug}
            onClick={() => handleCategoryClick(category.slug)}
            className={`shrink-0 snap-center px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border ${
              categoryParam === category.slug
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-transparent border-border text-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Subcategory Pills */}
      {activeCategoryObj && activeCategoryObj.subcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 hide-scrollbar snap-x mt-2">
          <button
            onClick={() => handleSubcategoryClick('all')}
            className={`shrink-0 snap-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border ${
              !subcategoryParam
                ? "bg-foreground border-foreground text-background"
                : "bg-transparent border-border text-foreground hover:border-foreground"
            }`}
          >
            All {activeCategoryObj.name}
          </button>
          {activeCategoryObj.subcategories.map((sub: any) => (
            <button
              key={sub.slug}
              onClick={() => handleSubcategoryClick(sub.slug)}
              className={`shrink-0 snap-center px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                subcategoryParam === sub.slug
                  ? "bg-foreground border-foreground text-background"
                  : "bg-transparent border-border text-foreground hover:border-foreground"
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* spacer if no subcategories */}
      {(!activeCategoryObj || activeCategoryObj.subcategories.length === 0) && (
        <div className="mb-8"></div>
      )}

      <div className="flex justify-between items-center py-4 border-b border-border mb-8">
        <span className="text-sm text-foreground/70">{sortedProducts.length} products</span>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-foreground/70">Sorted by</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            className="bg-transparent border-none text-xs sm:text-sm text-heading font-medium outline-none cursor-pointer p-0 pr-4"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">New Arrivals</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
        {sortedProducts.map((product) => (
          <ProductCard 
            key={product.id}
            id={product.id}
            name={product.name}
            slug={product.slug}
            price={product.price}
            originalPrice={product.originalPrice}
            image={product.image}
            badge={product.badge}
          />
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center text-foreground/60">
            No products found in this category.
          </div>
        )}
      </div>
    </>
  );
}
