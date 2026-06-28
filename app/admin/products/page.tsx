"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/components/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Product, ProductCategory } from "@/types";
import { formatINR } from "@/lib/utils";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  ChevronLeft, 
  Filter, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function AdminProductsList() {
  const { user, role } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isMocked, setIsMocked] = useState(false);

  useEffect(() => {
    if (user && role !== "admin") {
      toast.error("Admin role required");
      window.location.href = "/";
      return;
    }
    fetchProducts();
  }, [user, role]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
        // We check if API returns mock data
        if (data.products.some((p: any) => p.id.startsWith("prod-"))) {
          setIsMocked(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Product deleted successfully! 🗑️");
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    }
  };

  // Filter products client-side for immediate responsive feel
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (!user || role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-sm font-semibold uppercase tracking-wider">
        Access Denied
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body flex-1 animate-fade-in">
        
        {/* Back navigation */}
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary-dark uppercase tracking-wider mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading italic text-3xl text-text-primary mb-1">Products Catalog</h1>
            <p className="text-text-secondary text-xs">Total items listed: {filteredProducts.length}</p>
          </div>

          <div className="flex gap-3">
            {isMocked && (
              <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary-dark px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Simulation Mock catalog active</span>
              </div>
            )}
            <Link
              href="/admin/products/new"
              className="flex items-center gap-1.5 px-6 py-2.5 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-bold uppercase tracking-wider transition-colors shadow-soft"
            >
              <Plus className="w-4 h-4" /> Add Product
            </Link>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="bg-surface border border-border rounded-card p-5 shadow-soft mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Search query input */}
          <div className="relative flex items-center bg-background border border-border rounded-input px-3 py-2 focus-within:border-primary transition-colors">
            <Search className="w-4 h-4 text-text-secondary mr-2" />
            <input
              type="text"
              placeholder="Search product name, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 outline-none w-full text-xs text-text-primary placeholder:text-text-secondary"
            />
          </div>

          {/* Category filter dropdown */}
          <div className="relative flex items-center bg-background border border-border rounded-input px-3 py-2 focus-within:border-primary transition-colors">
            <Filter className="w-4 h-4 text-text-secondary mr-2" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-0 outline-none w-full text-xs text-text-primary cursor-pointer uppercase font-semibold tracking-wider"
            >
              <option value="">All Categories</option>
              <option value="dresses">Dresses</option>
              <option value="tops">Tops</option>
              <option value="co-ords">Co-ords</option>
              <option value="ethnic">Ethnic</option>
              <option value="bottoms">Bottoms</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
              }}
              className="text-xs text-primary-dark font-semibold uppercase tracking-wider hover:underline"
            >
              Clear filters
            </button>
          </div>

        </div>

        {/* Products Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="bg-surface border border-border rounded-card shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-background border-b border-border text-text-secondary uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-background/25">
                      {/* Image Thumbnail */}
                      <td className="px-6 py-4">
                        <div className="relative w-10 h-14 bg-secondary/15 border border-border rounded overflow-hidden">
                          <Image
                            src={prod.images?.[0] || "/placeholder.jpg"}
                            alt={prod.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </td>

                      {/* Name & tags */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-text-primary text-sm block">{prod.name}</span>
                        {prod.pinterest_inspired && (
                          <span className="inline-block mt-1 bg-primary/10 border border-primary/20 text-primary-dark text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            Pinterest Trend
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 capitalize font-semibold text-text-secondary">{prod.category}</td>

                      {/* Price */}
                      <td className="px-6 py-4 font-semibold text-text-primary">
                        {formatINR(prod.price)}
                        {prod.original_price && prod.original_price > prod.price && (
                          <span className="block text-[10px] text-text-secondary line-through font-normal mt-0.5">
                            {formatINR(prod.original_price)}
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4 font-medium text-text-primary">
                        {prod.stock_count} units
                      </td>

                      {/* Active Status */}
                      <td className="px-6 py-4">
                        {prod.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-success bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            <CheckCircle className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-text-secondary bg-background border border-border px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            <XCircle className="w-3.5 h-3.5" /> Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/products/${prod.id}/edit`}
                            className="p-1.5 border border-border hover:border-primary-dark text-text-secondary hover:text-primary-dark rounded transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          
                          <button
                            onClick={() => handleDelete(prod.id)}
                            className="p-1.5 border border-border hover:border-error text-text-secondary hover:text-error rounded transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-surface border border-border rounded-card shadow-soft flex flex-col items-center justify-center p-6">
            <h3 className="font-heading italic text-2xl text-text-primary mb-2">No products catalogued</h3>
            <p className="text-text-secondary text-sm max-w-sm mb-6">Create new product catalog entities to publish items live on the shop front page.</p>
            <Link
              href="/admin/products/new"
              className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-semibold uppercase tracking-wider"
            >
              Add Product
            </Link>
          </div>
        )}

      </main>

      <Footer />
    </>
  );
}
