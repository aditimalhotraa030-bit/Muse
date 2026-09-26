"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function CartDrawer({ isOpen: controlledIsOpen, onClose: controlledOnClose }: CartDrawerProps = {}) {
  const [mounted, setMounted] = useState(false);
  const cartStore = useCartStore();

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : cartStore.isCartDrawerOpen;
  const onClose = controlledOnClose || cartStore.closeCart;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling on mobile when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle WhatsApp Checkout
  const handleCheckout = () => {
    let message = "Hello muse by Kashish,\n\nI would like to place an order.\n\nProducts:\n";
    
    cartStore.items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `SKU: ${item.id}\n`;
      if (item.variant) {
        message += `Variant: ${item.variant.value}\n`;
      }
      message += `Quantity: ${item.quantity}\n`;
      message += `Price: ₹${item.price.toLocaleString('en-IN')}\n`;
      message += `Link: https://musebykashish.com/product/${item.slug}\n\n`;
    });

    message += `Cart Total: ₹${cartStore.getCartTotal().toLocaleString('en-IN')}\n\n`;
    message += "Please confirm availability and share the payment details. Thank you.";

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/919897110086?text=${encodedMessage}`, '_blank');
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex justify-end h-[100dvh] max-h-[100dvh] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div 
        className="relative w-full sm:w-[420px] max-w-full h-[100dvh] max-h-[100dvh] bg-background shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl text-heading">Cart</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {cartStore.items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-foreground/70 hover:text-heading transition-colors rounded-full hover:bg-muted"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 flex flex-col overscroll-contain">
          {cartStore.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 text-foreground/60 py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-primary/60">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div>
                <p className="font-serif text-lg text-heading mb-1">Your cart is empty</p>
                <p className="text-xs text-foreground/70">Looks like you haven't added any jewelry yet.</p>
              </div>
              <button 
                onClick={onClose} 
                className="mt-2 px-8 py-3 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-full hover:bg-primary-hover transition-colors shadow-sm"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {cartStore.items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-border/50 pb-5 last:border-0 last:pb-0">
                  <div className="w-20 h-24 bg-muted rounded-md shrink-0 overflow-hidden relative border border-border/40">
                    {item.coverImage ? (
                      <Image 
                        src={item.coverImage} 
                        alt={item.name} 
                        fill 
                        sizes="80px" 
                        className="object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground/50 font-serif">
                        Img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link 
                          href={`/product/${item.slug}`} 
                          onClick={onClose} 
                          className="font-serif text-base text-heading leading-tight hover:text-primary transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button 
                          onClick={() => cartStore.removeItem(item.id)} 
                          className="text-foreground/40 hover:text-destructive transition-colors p-1 -mr-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {item.variant && (
                        <p className="text-[11px] text-foreground/70 mt-0.5">{item.variant.type}: {item.variant.value}</p>
                      )}
                      <p className="text-sm font-semibold text-foreground mt-1.5">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center border border-border rounded-full overflow-hidden bg-background">
                        <button 
                          onClick={() => cartStore.updateQuantity(item.id, item.quantity - 1)} 
                          className="p-1.5 px-2.5 text-foreground/70 hover:bg-muted hover:text-heading transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold w-5 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => cartStore.updateQuantity(item.id, item.quantity + 1)} 
                          className="p-1.5 px-2.5 text-foreground/70 hover:bg-muted hover:text-heading transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartStore.items.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-border bg-surface shrink-0 space-y-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <div className="flex justify-between items-center">
              <span className="font-serif text-base text-heading">Subtotal</span>
              <span className="font-serif text-xl font-bold text-heading">₹{cartStore.getCartTotal().toLocaleString('en-IN')}</span>
            </div>
            <p className="text-[11px] text-foreground/60 text-center">Shipping & taxes calculated at checkout</p>
            <button 
              onClick={handleCheckout}
              className="w-full py-3.5 bg-[#25D366] text-white text-xs font-bold tracking-wider rounded-full hover:bg-[#128C7E] transition-colors uppercase flex items-center justify-center gap-2 shadow-sm"
            >
              Order on WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
