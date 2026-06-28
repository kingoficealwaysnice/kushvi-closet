"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Upload, 
  Cpu, 
  Shirt, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  Heart,
  ShoppingCart
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import MasonryGrid from "@/components/MasonryGrid";
import { Product, ProductCategory } from "@/types";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";
import { useApp } from "@/components/AppContext";
import { toast } from "sonner";

interface HomeClientProps {
  initialProducts: Product[];
}

const CATEGORIES: { label: string; value: ProductCategory; image: string; count: string }[] = [
  { 
    label: "Dresses", 
    value: "dresses", 
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&auto=format&fit=crop&q=80",
    count: "120+ styles"
  },
  { 
    label: "Tops", 
    value: "tops", 
    image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=300&auto=format&fit=crop&q=80",
    count: "85+ styles"
  },
  { 
    label: "Co-ords", 
    value: "co-ords", 
    image: "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=300&auto=format&fit=crop&q=80",
    count: "40+ styles"
  },
  { 
    label: "Ethnic", 
    value: "ethnic", 
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&auto=format&fit=crop&q=80",
    count: "60+ styles"
  },
  { 
    label: "Bottoms", 
    value: "bottoms", 
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&auto=format&fit=crop&q=80",
    count: "95+ styles"
  },
  { 
    label: "Accessories", 
    value: "accessories", 
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&auto=format&fit=crop&q=80",
    count: "150+ styles"
  },
];

export default function HomeClient({ initialProducts }: HomeClientProps) {
  const router = useRouter();
  const { wishlist, toggleWishlist, addToCart } = useApp();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch products client-side to ensure the absolute latest catalog is displayed
  useEffect(() => {
    async function loadLatestProducts() {
      try {
        const res = await fetch("/api/products?limit=24");
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Failed to load products client-side, using server initial props", err);
      }
    }
    loadLatestProducts();
  }, []);

  const featuredProducts = products.filter(p => p.is_featured).slice(0, 8);
  const trendingProducts = products.slice(0, 12);

  // Horizontal scroll controls
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-background via-secondary/15 to-accent/15 overflow-hidden py-16 lg:py-24 font-body">
        
        {/* Subtle Decorative Gradient Blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent/20 blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Intro Text Column */}
            <div className="lg:col-span-6 flex flex-col items-start text-left space-y-6 lg:space-y-8">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/15 border border-primary/20 text-xs font-bold uppercase tracking-wider text-primary-dark shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI-Powered Styling Marketplace</span>
              </div>

              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-text-primary leading-[1.08]">
                Wear What <br />
                <span className="italic text-primary-dark font-normal">You Pin</span>
              </h1>

              <p className="text-text-secondary text-base sm:text-lg max-w-lg leading-relaxed">
                Found the perfect outfit on Pinterest? Upload it here. Our AI instantly matches it to catalog pieces and lets you try them on an AI Avatar.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                  href="/find-my-fit"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-bold uppercase tracking-widest shadow-soft transition-all duration-300 hover:scale-105 active:scale-95 group"
                >
                  <Sparkles className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform" />
                  <span>Find My Fit</span>
                </Link>

                <Link
                  href="/shop"
                  className="flex items-center justify-center gap-1.5 px-8 py-4 bg-surface hover:bg-background border border-border text-text-primary hover:text-primary-dark rounded-btn text-xs font-bold uppercase tracking-widest shadow-soft transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Trust Badge Indicators */}
              <div className="pt-4 flex items-center gap-6 border-t border-border w-full max-w-md">
                <div>
                  <h4 className="text-xl font-heading font-bold text-text-primary">10k+</h4>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Happy Customers</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <h4 className="text-xl font-heading font-bold text-text-primary">24h</h4>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">AI Try-On Delivery</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <h4 className="text-xl font-heading font-bold text-text-primary">Free</h4>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">Shipping India-wide</p>
                </div>
              </div>

            </div>

            {/* Right Pinterest-Core Polaroid Collage Column */}
            <div className="lg:col-span-6 relative w-full h-[580px] sm:h-[650px] flex items-center justify-center pointer-events-none lg:pointer-events-auto">
              
              {/* Floating aesthetic collage grid */}
              
              {/* Polaroid 1 (Top Left) */}
              <div className="absolute top-[8%] left-[2%] w-[150px] sm:w-[190px] bg-surface p-2 pb-6 sm:p-3 sm:pb-8 rounded-lg shadow-soft rotate-[-6deg] hover:rotate-[0deg] hover:scale-105 transition-all duration-300 border border-border pointer-events-auto">
                <div className="relative w-full aspect-[4/5] bg-secondary/15 rounded-md overflow-hidden mb-2">
                  <Image 
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80"
                    alt="Aesthetic style mood 1"
                    fill
                    className="object-cover"
                  />
                  {/* Tape */}
                  <div className="absolute top-[-8px] left-[35%] w-[40px] h-[16px] bg-secondary/60 backdrop-blur-sm shadow-sm rotate-[12deg]" />
                </div>
                <span className="font-heading italic text-xs text-text-secondary block text-center">Blush Satin</span>
              </div>

              {/* Polaroid 2 (Top Right) */}
              <div className="absolute top-[3%] right-[8%] w-[160px] sm:w-[210px] bg-surface p-2 pb-6 sm:p-3 sm:pb-8 rounded-lg shadow-soft rotate-[4deg] hover:rotate-[0deg] hover:scale-105 transition-all duration-300 border border-border pointer-events-auto">
                <div className="relative w-full aspect-[3/4] bg-secondary/15 rounded-md overflow-hidden mb-2">
                  <Image 
                    src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&auto=format&fit=crop&q=80"
                    alt="Aesthetic style mood 2"
                    fill
                    className="object-cover"
                  />
                  {/* Tape */}
                  <div className="absolute top-[-8px] left-[38%] w-[45px] h-[18px] bg-accent/50 backdrop-blur-sm shadow-sm rotate-[-8deg]" />
                </div>
                <span className="font-heading italic text-xs text-text-secondary block text-center">Linen Drape</span>
              </div>

              {/* Polaroid 3 (Center) */}
              <div className="absolute top-[28%] left-[25%] sm:left-[28%] w-[180px] sm:w-[240px] bg-surface p-2.5 pb-7 sm:p-3.5 sm:pb-10 rounded-lg shadow-soft rotate-[-2deg] hover:rotate-[0deg] hover:scale-105 transition-all duration-300 border border-border z-20 pointer-events-auto">
                <div className="relative w-full aspect-[4/5] bg-secondary/15 rounded-md overflow-hidden mb-2">
                  <Image 
                    src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=80"
                    alt="Aesthetic style mood 3"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-primary/95 text-text-primary px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">
                    Trending
                  </div>
                  {/* Tape */}
                  <div className="absolute top-[-10px] left-[35%] w-[55px] h-[20px] bg-primary/40 backdrop-blur-sm shadow-sm rotate-[4deg]" />
                </div>
                <span className="font-heading italic text-sm text-text-primary block text-center font-bold">Kushvi Rose</span>
              </div>

              {/* Polaroid 4 (Bottom Left) */}
              <div className="absolute bottom-[4%] left-[0%] w-[140px] sm:w-[180px] bg-surface p-2 pb-6 sm:p-3 sm:pb-8 rounded-lg shadow-soft rotate-[7deg] hover:rotate-[0deg] hover:scale-105 transition-all duration-300 border border-border pointer-events-auto">
                <div className="relative w-full aspect-[3/4] bg-secondary/15 rounded-md overflow-hidden mb-2">
                  <Image 
                    src="https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=400&auto=format&fit=crop&q=80"
                    alt="Aesthetic style mood 4"
                    fill
                    className="object-cover"
                  />
                  {/* Tape */}
                  <div className="absolute top-[-8px] left-[30%] w-[38px] h-[15px] bg-accent/60 backdrop-blur-sm shadow-sm rotate-[-12deg]" />
                </div>
                <span className="font-heading italic text-xs text-text-secondary block text-center">Sage Co-ord</span>
              </div>

              {/* Polaroid 5 (Bottom Right) */}
              <div className="absolute bottom-[2%] right-[5%] w-[150px] sm:w-[200px] bg-surface p-2 pb-6 sm:p-3 sm:pb-8 rounded-lg shadow-soft rotate-[-5deg] hover:rotate-[0deg] hover:scale-105 transition-all duration-300 border border-border pointer-events-auto">
                <div className="relative w-full aspect-[4/5] bg-secondary/15 rounded-md overflow-hidden mb-2">
                  <Image 
                    src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&auto=format&fit=crop&q=80"
                    alt="Aesthetic style mood 5"
                    fill
                    className="object-cover"
                  />
                  {/* Tape */}
                  <div className="absolute top-[-8px] left-[35%] w-[42px] h-[17px] bg-secondary/65 backdrop-blur-sm shadow-sm rotate-[6deg]" />
                </div>
                <span className="font-heading italic text-xs text-text-secondary block text-center">Dream Satin</span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-surface py-20 font-body border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-xl mx-auto mb-16">
            <h2 className="font-heading italic text-3xl sm:text-4xl text-text-primary mb-3">
              The 3-Step Styling Journey
            </h2>
            <p className="text-text-secondary text-sm">
              Discover style, fit it virtually, and checkout under one unified experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            
            {/* Step 1 */}
            <div className="group flex flex-col items-center p-6 bg-background rounded-card border border-border hover:translate-y-[-4px] hover:shadow-soft transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/30 transition-all duration-300">
                <Upload className="w-7 h-7 text-primary-dark" />
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary mb-3">
                1. Upload Inspiration
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
                Take a screenshot of any outfit you love on Pinterest and drop it into <span className="font-bold text-primary-dark">Find My Fit</span>.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group flex flex-col items-center p-6 bg-background rounded-card border border-border hover:translate-y-[-4px] hover:shadow-soft transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-accent/30 border border-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent/40 transition-all duration-300">
                <Cpu className="w-7 h-7 text-primary-dark" />
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary mb-3">
                2. AI Catalog Match
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
                Our advanced visual tags search matches your upload directly to high-quality catalog items.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group flex flex-col items-center p-6 bg-background rounded-card border border-border hover:translate-y-[-4px] hover:shadow-soft transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-secondary border border-secondary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-secondary/70 transition-all duration-300">
                <Shirt className="w-7 h-7 text-primary-dark" />
              </div>
              <h3 className="font-heading text-lg font-bold text-text-primary mb-3">
                3. Virtual Try-On
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
                Visualize catalog clothes on preset avatars or model yourself instantly before ordering with Razorpay UPI.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Moodboard Favorites (Featured Products Scroll) */}
      <section className="bg-background py-20 font-body overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-[10px] font-bold uppercase tracking-wider text-text-primary shadow-sm mb-3">
                <TrendingUp className="w-3.5 h-3.5 text-primary-dark" />
                <span>Trending Right Now</span>
              </div>
              <h2 className="font-heading italic text-3xl sm:text-4xl text-text-primary">
                Moodboard Favorites
              </h2>
            </div>
            
            {/* Scroll navigation arrows */}
            <div className="flex gap-2.5 mt-4 sm:mt-0">
              <button
                onClick={scrollLeft}
                className="p-3 bg-surface hover:bg-primary/10 border border-border rounded-full shadow-soft hover:scale-105 active:scale-95 transition-all text-text-primary hover:text-primary-dark"
                title="Scroll Left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollRight}
                className="p-3 bg-surface hover:bg-primary/10 border border-border rounded-full shadow-soft hover:scale-105 active:scale-95 transition-all text-text-primary hover:text-primary-dark"
                title="Scroll Right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Horizontal scrollable items list */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-none snap-x snap-mandatory cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <div key={product.id} className="w-[280px] sm:w-[320px] shrink-0 snap-start">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              [...Array(4)].map((_, i) => (
                <div key={i} className="w-[280px] sm:w-[320px] shrink-0 bg-surface rounded-card border border-border p-4 shadow-soft animate-pulse flex flex-col gap-3">
                  <div className="bg-border rounded aspect-[3/4] w-full" />
                  <div className="h-4 bg-border rounded w-2/3" />
                  <div className="h-5 bg-border rounded w-1/3 mt-2" />
                </div>
              ))
            )}
          </div>

        </div>
      </section>

      {/* Category Pills Grid */}
      <section className="bg-surface py-20 font-body border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-xl mx-auto text-center mb-16">
            <h2 className="font-heading italic text-3xl sm:text-4xl text-text-primary mb-3">
              Shop The Aesthetic
            </h2>
            <p className="text-text-secondary text-sm">
              Filter by core wardrobe elements inspired directly by Pinterest mood boards
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {CATEGORIES.map((cat) => (
              <Link 
                href={`/shop?category=${cat.value}`}
                key={cat.value} 
                className="group flex flex-col items-center bg-background border border-border hover:border-primary-dark/45 p-4 rounded-card shadow-soft hover:shadow-md transition-all duration-300 hover:scale-102"
              >
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-all mb-4">
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    className="object-cover group-hover:scale-108 transition-transform duration-500"
                    sizes="96px"
                  />
                </div>
                <h3 className="font-heading font-bold text-text-primary group-hover:text-primary-dark transition-colors">
                  {cat.label}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mt-1">
                  {cat.count}
                </span>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* Trending This Week Section */}
      <section className="bg-background py-20 font-body">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 mb-12">
            <div>
              <h2 className="font-heading italic text-3xl sm:text-4xl text-text-primary mb-2">
                Trending This Week
              </h2>
              <p className="text-text-secondary text-sm">
                Explore the top catalog pieces matching today's trending Pinterest outfits
              </p>
            </div>
            <Link
              href="/shop"
              className="flex items-center gap-1.5 mt-4 md:mt-0 text-xs font-bold uppercase tracking-wider text-primary-dark hover:text-primary-dark/80 group"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Masonry grid display of 12 trending items */}
          {trendingProducts.length > 0 ? (
            <MasonryGrid products={trendingProducts} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-surface rounded-card border border-border p-4 shadow-soft flex flex-col gap-4">
                  <div className="bg-border rounded aspect-[3/4] w-full" />
                  <div className="h-4 bg-border rounded w-2/3" />
                  <div className="h-5 bg-border rounded w-1/3 mt-2" />
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Banner / CTA Section */}
      <section className="bg-gradient-to-br from-primary/25 to-secondary/35 border-t border-border py-20 font-body relative overflow-hidden">
        
        {/* Abstract design elements */}
        <div className="absolute top-[-40px] left-[-40px] w-48 h-48 rounded-full border-4 border-primary/20 pointer-events-none" />
        <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 rounded-full bg-accent/20 blur-[90px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center">
          
          <div className="w-16 h-16 rounded-full bg-surface shadow-soft flex items-center justify-center mb-6 animate-bounce">
            <Sparkles className="w-7 h-7 text-primary-dark" />
          </div>

          <h2 className="font-heading italic text-4xl sm:text-5xl text-text-primary mb-6 leading-tight max-w-2xl">
            Have a Specific Look in Mind?
          </h2>

          <p className="text-text-secondary text-base sm:text-lg max-w-xl mb-10 leading-relaxed">
            Drag in screenshots of any outfits you've pinned or photographed. Let our AI search engine find the perfect match in Kushvi Closet.
          </p>

          <Link
            href="/find-my-fit"
            className="inline-flex items-center gap-2 px-10 py-4 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-bold uppercase tracking-widest shadow-soft transition-all duration-300 hover:scale-105 active:scale-95 group"
          >
            <Upload className="w-4.5 h-4.5 group-hover:translate-y-[-2px] transition-transform" />
            <span>Try Visual Search</span>
          </Link>

        </div>
      </section>

      <Footer />
    </>
  );
}
