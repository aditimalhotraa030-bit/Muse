"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, ChevronDown, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CartDrawer from "@/components/cart/CartDrawer";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const isCartOpen = useCartStore((state) => state.isCartDrawerOpen);
  const openCart = useCartStore((state) => state.openCart);
  const closeCart = useCartStore((state) => state.closeCart);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(true);
  const cartItems = useCartStore((state) => state.items);
  const [menuData, setMenuData] = useState<any[]>([]);
  
  useEffect(() => {
    setMounted(true);

    const fetchMenu = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('categories')
        .select('*, subcategories(*)')
        .order('display_order', { ascending: true });
        
      if (data) {
        data.forEach(cat => {
          if (cat.subcategories) {
            cat.subcategories.sort((a: any, b: any) => a.display_order - b.display_order);
          }
        });
        setMenuData(data);
      }
    };
    fetchMenu();
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#5f3f33] border-b border-[#4d3228] shadow-sm">
        <div className="container mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          {/* Mobile Menu Button & Logo */}
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-0">
            <button 
              className="lg:hidden text-[#f8f5f2] hover:text-[#f4ccaf] transition-colors p-1"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center shrink-0">
              <Image 
                src="/muse-logo.png" 
                alt="Muse" 
                priority
                width={370} 
                height={337} 
                className="w-auto h-11 sm:h-12 md:h-14 object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 h-full">
            <Link href="/" className="text-sm font-medium text-[#f8f5f2]/90 hover:text-[#f4ccaf] transition-colors">Home</Link>
            
            {/* Shop with Mega Menu */}
            <div className="group h-full flex items-center">
              <Link href="/shop" className="text-sm font-medium text-[#f8f5f2]/90 hover:text-[#f4ccaf] transition-colors flex items-center gap-1 h-full">
                Shop <ChevronDown className="w-4 h-4 text-[#f4ccaf] opacity-75 group-hover:rotate-180 transition-transform duration-300" />
              </Link>
              
              {/* Mega Menu Full Width Dropdown */}
              <div className="absolute top-20 left-0 w-full bg-[#5f3f33] border-t border-b border-[#4d3228] shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 -translate-y-2 group-hover:translate-y-0 z-50">
                <div className="container mx-auto px-4 md:px-8 py-10">
                  <div className="flex flex-wrap gap-12 lg:gap-16">
                    {menuData.map(category => (
                      <div key={category.id} className="space-y-4 min-w-[150px]">
                        <Link href={`/shop/${category.slug}`} className="font-serif text-lg text-[#f4ccaf] hover:text-white transition-colors border-b border-[#734e40] pb-2 block">
                          {category.name}
                        </Link>
                        <ul className="space-y-2">
                          {category.subcategories?.map((sub: any) => (
                            <li key={sub.id}>
                              <Link href={`/shop/${category.slug}/${sub.slug}`} className="text-sm text-[#f8f5f2]/80 hover:text-[#f4ccaf] transition-colors block py-0.5">
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Link href="/suits" className="text-sm font-medium text-[#f8f5f2]/90 hover:text-[#f4ccaf] transition-colors">Suits</Link>
            <Link href="/new-arrivals" className="text-sm font-medium text-[#f8f5f2]/90 hover:text-[#f4ccaf] transition-colors">New Arrivals</Link>
            <Link href="/about" className="text-sm font-medium text-[#f8f5f2]/90 hover:text-[#f4ccaf] transition-colors">About</Link>
            <Link href="/contact" className="text-sm font-medium text-[#f8f5f2]/90 hover:text-[#f4ccaf] transition-colors">Contact</Link>
          </nav>

          {/* Header Right Icons */}
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/wishlist" className="text-[#f8f5f2] hover:text-[#f4ccaf] transition-colors p-1" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
            </Link>
            <button 
              onClick={openCart} 
              className="text-[#f8f5f2] hover:text-[#f4ccaf] transition-colors relative p-1" 
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#f4ccaf] text-[#5f3f33] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Cart Drawer Portal */}
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />

      {/* Mobile Menu Drawer Portal */}
      {mounted && isMobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Drawer */}
          <div 
            className="relative w-[85%] max-w-[340px] h-full bg-background shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-300"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#4d3228] bg-[#5f3f33] shrink-0">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <Image 
                  src="/muse-logo.png" 
                  alt="Muse by Kashish Logo" 
                  width={200} 
                  height={60} 
                  className="h-9 w-auto object-contain"
                />
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="p-2 text-[#f8f5f2]/70 hover:text-white transition-colors rounded-full hover:bg-black/20"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Content */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-between">
              <nav className="flex flex-col">
                <Link 
                  href="/" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="py-3 font-serif text-xl text-heading hover:text-primary transition-colors border-b border-border/30"
                >
                  Home
                </Link>

                {/* Shop with Dropdown of Categories */}
                <div className="py-2.5 border-b border-border/30">
                  <div className="flex items-center justify-between">
                    <Link 
                      href="/shop" 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="font-serif text-xl text-heading hover:text-primary transition-colors flex-1"
                    >
                      Shop
                    </Link>
                    <button 
                      onClick={() => setIsMobileShopOpen(!isMobileShopOpen)} 
                      className="p-1 text-foreground/70 hover:text-heading transition-colors rounded-md"
                      aria-label="Toggle shop categories"
                    >
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isMobileShopOpen ? "rotate-180 text-primary" : ""}`} />
                    </button>
                  </div>

                  {isMobileShopOpen && (
                    <div className="mt-2.5 pl-3 py-1 flex flex-col gap-2 border-l-2 border-primary/30 ml-1">
                      <Link 
                        href="/shop" 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="text-xs font-bold tracking-wider uppercase text-primary hover:underline pb-1"
                      >
                        All Jewelry &rarr;
                      </Link>
                      {menuData.map(category => (
                        <div key={category.id} className="space-y-1">
                          <Link 
                            href={`/shop/${category.slug}`} 
                            onClick={() => setIsMobileMenuOpen(false)} 
                            className="text-sm font-medium text-heading hover:text-primary transition-colors block py-0.5"
                          >
                            {category.name}
                          </Link>
                          {category.subcategories && category.subcategories.length > 0 && (
                            <ul className="pl-3 flex flex-col gap-1 border-l border-border/50 ml-1 py-0.5">
                              {category.subcategories.map((sub: any) => (
                                <li key={sub.id}>
                                  <Link 
                                    href={`/shop/${category.slug}/${sub.slug}`} 
                                    onClick={() => setIsMobileMenuOpen(false)} 
                                    className="text-xs text-foreground/70 hover:text-primary transition-colors block py-0.5"
                                  >
                                    {sub.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Link 
                  href="/suits" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="py-3 font-serif text-xl text-heading hover:text-primary transition-colors border-b border-border/30"
                >
                  Suits
                </Link>
                <Link 
                  href="/new-arrivals" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="py-3 font-serif text-xl text-heading hover:text-primary transition-colors border-b border-border/30"
                >
                  New Arrivals
                </Link>
                <Link 
                  href="/about" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="py-3 font-serif text-xl text-heading hover:text-primary transition-colors border-b border-border/30"
                >
                  About
                </Link>
                <Link 
                  href="/contact" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="py-3 font-serif text-xl text-heading hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </nav>

              {/* Drawer Quick Actions */}
              <div className="pt-6 border-t border-border mt-4 space-y-3 shrink-0">
                <Link 
                  href="/wishlist" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 text-sm font-medium text-heading hover:text-primary transition-colors p-2.5 rounded-lg bg-surface border border-border/60"
                >
                  <Heart className="w-4 h-4 text-primary" />
                  <span>My Wishlist</span>
                </Link>
                <a 
                  href="https://wa.me/919897110086" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#128C7E] transition-colors shadow-sm"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
