"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import toast from "@/lib/toast";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  badge?: "NEW";
  slug: string;
}

export default function ProductCard({ id, name, price, originalPrice, image, images, badge, slug }: ProductCardProps) {
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();

  const imageList = (images && images.length > 0)
    ? images.filter(Boolean)
    : (image ? [image] : []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-slide images only when hovered and more than 1 image exists
  useEffect(() => {
    if (!isHovered || imageList.length <= 1) {
      setCurrentImageIndex(0);
      return;
    }
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % imageList.length);
    }, 1400);

    return () => clearInterval(interval);
  }, [isHovered, imageList.length]);

  const isWishlisted = mounted ? wishlistStore.isInWishlist(id) : false;

  const primaryImage = imageList[0] || image || "";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cartStore.addItem({
      id: `${id}-Standard`,
      productId: id,
      name,
      slug,
      price,
      quantity: 1,
      coverImage: primaryImage,
      variant: { type: "Variant", value: "Standard" }
    });
    toast.cart({
      name,
      image: primaryImage,
      message: "Added to Cart"
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      wishlistStore.removeItem(id);
      toast.wishlist({
        name,
        action: "removed",
        image: primaryImage
      });
    } else {
      wishlistStore.addItem({
        id,
        productId: id,
        name,
        slug,
        price,
        originalPrice,
        image: primaryImage
      });
      toast.wishlist({
        name,
        action: "added",
        image: primaryImage
      });
    }
  };

  return (
    <div 
      className="group relative flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-muted shrink-0">
        <Link href={`/product/${slug}`} className="block relative w-full h-full">
          {imageList.length > 0 ? (
            imageList.map((imgUrl, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                  idx === currentImageIndex ? "opacity-100 z-[1]" : "opacity-0 pointer-events-none z-0"
                }`}
              >
                <Image 
                  src={imgUrl} 
                  alt={`${name} - view ${idx + 1}`} 
                  fill 
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" 
                  className="object-cover transition-transform duration-500 group-hover:scale-105" 
                  priority={idx === 0}
                />
              </div>
            ))
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground transition-transform duration-500 group-hover:scale-105">
              <span className="text-xs">Image Placeholder</span>
            </div>
          )}
        </Link>

        {/* Indicators for multiple images - visible on hover */}
        {imageList.length > 1 && (
          <div className="absolute bottom-2.5 inset-x-0 z-10 flex justify-center items-center gap-1.5 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100">
            {imageList.map((_, dotIdx) => (
              <span
                key={dotIdx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  dotIdx === currentImageIndex 
                    ? "w-4 bg-white shadow-md" 
                    : "w-1.5 bg-white/60 drop-shadow-sm"
                }`}
              />
            ))}
          </div>
        )}
        
        {badge && (
          <span className="absolute top-2 left-2 z-10 px-2 py-1 bg-secondary text-secondary-foreground text-[10px] font-bold tracking-wider rounded-sm pointer-events-none">
            {badge}
          </span>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-foreground hover:text-primary transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? "fill-[#5f3f33] text-[#5f3f33]" : "text-foreground/70 hover:text-primary"}`} />
        </button>
      </div>
      
      <div className="flex flex-col items-center text-center flex-1 pt-3 pb-2">
        <Link href={`/product/${slug}`} className="hover:text-primary transition-colors w-full">
          <h3 className="font-serif text-base sm:text-lg text-heading line-clamp-2 min-h-[2.75rem] sm:min-h-[3.25rem] leading-snug px-1">
            {name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 text-sm mt-1.5">
          <span className="font-medium text-foreground">₹{price.toLocaleString('en-IN')}</span>
          {originalPrice && (
            <span className="text-foreground/50 line-through text-xs">₹{originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
      
      <button 
        onClick={handleAddToCart}
        className="w-full mt-auto py-2.5 rounded-full border border-border text-xs font-medium text-heading hover:border-primary hover:text-primary transition-colors uppercase tracking-wider"
      >
        Add to Cart
      </button>
    </div>
  );
}
