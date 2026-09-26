"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Layers,
  MessageSquare,
  LogOut,
  Menu,
  X,
  MonitorPlay,
  Target,
  Info,
  Scissors
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Storefront", href: "/admin/storefront", icon: MonitorPlay },
  { name: "About Page", href: "/admin/about", icon: Info },
  { name: "Products (Jewelry)", href: "/admin/products", icon: Package },
  { name: "Suits", href: "/admin/suits", icon: Scissors },
  { name: "Categories", href: "/admin/categories", icon: Layers },
  { name: "Subcategories", href: "/admin/subcategories", icon: Target },
  { name: "Contact Queries", href: "/admin/queries", icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {!sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: 0 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-surface border-r border-border flex flex-col shrink-0 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-border">
          <Link href="/admin" className="font-serif text-2xl font-bold tracking-tight text-heading flex items-center gap-2">
            <Image src="/muse-logo.png" priority alt="Logo" width={370} height={337} className="h-10 md:h-12 w-auto object-contain" />
            <span className="text-sm font-normal">admin</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-foreground/70">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-muted hover:text-heading"
                  }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-foreground/70 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-surface border-b border-border flex items-center px-4 md:px-8 shrink-0 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 mr-4 text-foreground/70 hover:bg-muted rounded-md lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <h2 className="font-serif text-xl text-heading hidden sm:block">
              {navItems.find(item => pathname === item.href || pathname.startsWith(`${item.href}/`))?.name || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="text-xs font-bold tracking-widest uppercase text-primary hover:text-primary-hover transition-colors">
              View Storefront
            </Link>
          </div>
        </header>

        {/* Page Content with Animation */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-background relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
