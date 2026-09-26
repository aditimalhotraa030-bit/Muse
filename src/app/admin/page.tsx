"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Package, Layers, Scissors, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    suits: 0,
    categories: 0,
    queries: 0
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      const [
        { count: productsCount },
        { count: suitsCount },
        { count: categoriesCount },
        { count: queriesCount }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('product_type', 'jewelry'),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('product_type', 'suit'),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('contact_queries').select('*', { count: 'exact', head: true }).eq('status', 'Pending')
      ]);

      setStats({
        products: productsCount || 0,
        suits: suitsCount || 0,
        categories: categoriesCount || 0,
        queries: queriesCount || 0
      });
      setLoading(false);
    }
    
    fetchStats();
  }, []);

  const statCards = [
    { title: "Jewelry Products", value: stats.products, icon: Package, href: "/admin/products" },
    { title: "Suits", value: stats.suits, icon: Scissors, href: "/admin/suits" },
    { title: "Categories", value: stats.categories, icon: Layers, href: "/admin/categories" },
    { title: "Pending Queries", value: stats.queries, icon: MessageSquare, href: "/admin/queries" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-heading mb-2">Welcome back, Admin.</h1>
        <p className="text-foreground/70">Here's an overview of your store today.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-surface border border-border p-6 rounded-xl animate-pulse h-32"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <Link 
              key={index} 
              href={stat.href}
              className="bg-surface border border-border p-6 rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-primary">
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-heading mb-1">{stat.value}</h3>
                <p className="text-sm text-foreground/70 font-medium">{stat.title}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl p-8 mt-8">
        <h2 className="font-serif text-2xl text-heading mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/products/new" className="px-6 py-3 bg-primary text-primary-foreground text-xs font-bold tracking-wider rounded-full hover:bg-primary-hover transition-colors uppercase">
            Add New Product
          </Link>
        </div>
      </div>
    </div>
  );
}
