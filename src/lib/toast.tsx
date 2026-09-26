"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Heart, Check, X, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export type ToastType = 'success' | 'error' | 'cart' | 'wishlist';

export interface ToastMessage {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  image?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

let nextId = 0;
let toasts: ToastMessage[] = [];
let listeners: ((t: ToastMessage[]) => void)[] = [];

const notify = () => {
  listeners.forEach(l => l([...toasts]));
};

export const toast = {
  success: (message: string, title: string = "Success") => {
    const id = ++nextId;
    toasts = [...toasts, { id, type: 'success', title, message }];
    notify();
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      notify();
    }, 3500);
  },
  error: (message: string, title: string = "Notice") => {
    const id = ++nextId;
    toasts = [...toasts, { id, type: 'error', title, message }];
    notify();
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      notify();
    }, 4000);
  },
  cart: (params: { name?: string; message?: string; image?: string }) => {
    const id = ++nextId;
    toasts = [
      ...toasts,
      {
        id,
        type: 'cart',
        title: "Added to Cart",
        message: params.name || params.message || "Item added to your shopping bag",
        image: params.image,
        actionText: "View Cart"
      }
    ];
    notify();
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      notify();
    }, 4000);
  },
  wishlist: (params: { name?: string; action: 'added' | 'removed'; image?: string }) => {
    const id = ++nextId;
    toasts = [
      ...toasts,
      {
        id,
        type: 'wishlist',
        title: params.action === 'added' ? "Added to Wishlist" : "Removed from Wishlist",
        message: params.name || (params.action === 'added' ? "Saved to your favorites" : "Removed from your favorites"),
        image: params.image,
        actionText: params.action === 'added' ? "View Wishlist" : undefined,
        actionHref: params.action === 'added' ? "/wishlist" : undefined
      }
    ];
    notify();
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      notify();
    }, 3500);
  },
  dismiss: (id: number) => {
    toasts = toasts.filter(t => t.id !== id);
    notify();
  }
};

export function Toaster() {
  const [activeToasts, setActiveToasts] = useState<ToastMessage[]>([]);
  const openCart = useCartStore((state) => state.openCart);

  useEffect(() => {
    const listener = (newToasts: ToastMessage[]) => setActiveToasts(newToasts);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  if (activeToasts.length === 0) return null;

  return (
    <div 
      className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:top-6 z-[999999] flex flex-col gap-2.5 pointer-events-none items-center sm:items-end"
      aria-live="polite"
    >
      {activeToasts.map((t) => (
        <div 
          key={t.id} 
          className="pointer-events-auto flex items-center gap-3.5 px-4 py-3 bg-white/95 dark:bg-[#231e1a]/95 backdrop-blur-md rounded-2xl shadow-[0_16px_40px_rgba(60,49,40,0.18)] border border-[#e4dcd3] dark:border-[#40352c] w-full sm:w-auto sm:min-w-[320px] sm:max-w-md transition-all duration-300 animate-in fade-in slide-in-from-top-4"
        >
          {/* Visual Icon / Thumbnail */}
          <div className="shrink-0">
            {t.image ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden relative border border-border/50 bg-muted">
                <Image src={t.image} alt="" fill sizes="40px" className="object-cover" />
              </div>
            ) : t.type === 'cart' ? (
              <div className="w-10 h-10 rounded-full bg-[#f4ccaf]/40 text-[#5f3f33] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              </div>
            ) : t.type === 'wishlist' ? (
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                <Heart className="w-5 h-5 fill-current" />
              </div>
            ) : t.type === 'success' ? (
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Check className="w-5 h-5 stroke-[2.2]" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 stroke-[2]" />
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0 pr-1">
            <h4 className="font-serif text-sm sm:text-base font-semibold text-heading leading-tight">
              {t.title}
            </h4>
            {t.message && (
              <p className="text-xs text-foreground/75 truncate mt-0.5">
                {t.message}
              </p>
            )}
          </div>

          {/* Actions & Close */}
          <div className="flex items-center gap-2 shrink-0">
            {t.actionText && (
              t.type === 'cart' ? (
                <button
                  onClick={() => {
                    openCart();
                    toast.dismiss(t.id);
                  }}
                  className="px-3 py-1.5 bg-[#5f3f33] text-white text-[11px] font-bold tracking-wider uppercase rounded-full hover:bg-[#4a3026] transition-colors shadow-sm"
                >
                  {t.actionText}
                </button>
              ) : t.actionHref ? (
                <Link
                  href={t.actionHref}
                  onClick={() => toast.dismiss(t.id)}
                  className="px-3 py-1.5 border border-[#5f3f33]/40 text-[#5f3f33] hover:bg-[#f4ccaf]/20 text-[11px] font-bold tracking-wider uppercase rounded-full transition-colors"
                >
                  {t.actionText}
                </Link>
              ) : null
            )}

            <button
              onClick={() => toast.dismiss(t.id)}
              className="p-1 text-foreground/40 hover:text-heading transition-colors rounded-full"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default toast;
