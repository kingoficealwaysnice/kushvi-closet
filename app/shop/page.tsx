"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MasonryGrid from "@/components/MasonryGrid";
import { Product, ProductCategory } from "@/types";
import { Slider } from "@/components/ui/Slider"; // Custom lightweight slider we'll build
import { 
  Filter, 
  X, 
  ChevronDown, 
  Star, 
  SlidersHorizontal,
  RefreshCw
} from "lucide-react";
import { formatINR } from "@/lib/utils";

// Static filters options
const CATEGORIES: { label: string; value: ProductCategory }[] = [
  { label: "Dresses", value: "dresses" },
  { label: "Tops", value: "tops" },
  { label: "Co-ords", value: "co-ords" },
  { label: "Ethnic", value: "ethnic" },
  { label: "Bottoms", value: "bottoms" },
  { label: "Accessories", value: "accessories" },
];

const SIZES = ["XS", "S", "M", "L", "XL"];

const COLORS = [
  { name: "Blush", hex: "#F2A7BB" },
  { name: "Ivory", hex: "#FFFFF0" },
  { name: "Sage", hex: "#B8D8D8" },
  { name: "Olive", hex: "#808000" },
  { name: "Onyx", hex: "#2C2C2C" },
  { name: "Lavender", hex: "#E6E6FA" }
];

const RATINGS = [4, 3, 2];

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();

  // Filters State
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("newest");

  // Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Mobile drawer state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Parse filters from URL on load
  useEffect(() => {
    const categoriesParam = searchParams.get("category");
    if (categoriesParam) {
      setSelectedCategories(categoriesParam.split(",") as ProductCategory[]);
    } else {
      setSelectedCategories([]);
    }

    const sizesParam = searchParams.get("sizes");
    if (sizesParam) {
      setSelectedSizes(sizesParam.split(","));
    } else {
      setSelectedSizes([]);
    }

    const colorsParam = searchParams.get("colors");
    if (colorsParam) {
      setSelectedColors(colorsParam.split(","));
    } else {
      setSelectedColors([]);
    }

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice && maxPrice) {
      setPriceRange([parseInt(minPrice), parseInt(maxPrice)]);
    } else {
      setPriceRange([0, 5000]);
    }

    const ratingParam = searchParams.get("rating");
    if (ratingParam) {
      setSelectedRating(parseInt(ratingParam));
    } else {
      setSelectedRating(null);
    }

    const sortParam = searchParams.get("sort");
    if (sortParam) {
      setSortBy(sortParam);
    } else {
      setSortBy("newest");
    }

    // Reset pagination and reload products when URL search parameters change
    setOffset(0);
    setProducts([]);
    setHasMore(true);
  }, [searchParamsStr]);

  // Fetch products
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const queryParts: string[] = [];
        
        // Add URL search
        const search = searchParams.get("search");
        if (search) queryParts.push(`search=${encodeURIComponent(search)}`);

        // Add Category
        if (selectedCategories.length > 0) {
          queryParts.push(`category=${selectedCategories.join(",")}`);
        }

        // Add Sizes
        if (selectedSizes.length > 0) {
          selectedSizes.forEach((s) => queryParts.push(`sizes=${s}`));
        }

        // Add Colors
        if (selectedColors.length > 0) {
          selectedColors.forEach((c) => queryParts.push(`colors=${c}`));
        }

        // Add Price Range
        queryParts.push(`minPrice=${priceRange[0]}`);
        queryParts.push(`maxPrice=${priceRange[1]}`);

        // Add Rating
        if (selectedRating) {
          queryParts.push(`rating=${selectedRating}`);
        }

        // Add Sort
        queryParts.push(`sort=${sortBy}`);

        // Add Pagination
        queryParts.push(`limit=12`);
        queryParts.push(`offset=${offset}`);

        const url = `/api/products?${queryParts.join("&")}`;
        const res = await fetch(url);
        const result = await res.json();

        if (result.products) {
          if (offset === 0) {
            setProducts(result.products);
          } else {
            setProducts((prev) => [...prev, ...result.products]);
          }
          setTotalCount(result.totalCount);
          if (result.products.length < 12) {
            setHasMore(false);
          }
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedCategories, priceRange, selectedSizes, selectedColors, selectedRating, sortBy, offset, searchParamsStr]);

  const updateURL = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    router.push(`/shop?${params.toString()}`);
  };

  // Helper togglers
  const handleCategoryToggle = (category: ProductCategory) => {
    let next;
    if (selectedCategories.includes(category)) {
      next = selectedCategories.filter((c) => c !== category);
    } else {
      next = [...selectedCategories, category];
    }
    updateURL({ category: next.length > 0 ? next.join(",") : null });
  };

  const handleSizeToggle = (size: string) => {
    let next;
    if (selectedSizes.includes(size)) {
      next = selectedSizes.filter((s) => s !== size);
    } else {
      next = [...selectedSizes, size];
    }
    updateURL({ sizes: next.length > 0 ? next.join(",") : null });
  };

  const handleColorToggle = (colorName: string) => {
    let next;
    if (selectedColors.includes(colorName)) {
      next = selectedColors.filter((c) => c !== colorName);
    } else {
      next = [...selectedColors, colorName];
    }
    updateURL({ colors: next.length > 0 ? next.join(",") : null });
  };

  const clearFilters = () => {
    router.push("/shop");
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setOffset((prev) => prev + 12);
    }
  };

  const activeChips = [
    ...selectedCategories.map((c) => ({ type: "category", label: c, value: c })),
    ...selectedSizes.map((s) => ({ type: "sizes", label: `Size: ${s}`, value: s })),
    ...selectedColors.map((c) => ({ type: "colors", label: `Color: ${c}`, value: c })),
    ...(selectedRating ? [{ type: "rating", label: `${selectedRating}★ & above`, value: selectedRating }] : []),
    ...((priceRange[0] > 0 || priceRange[1] < 5000) ? [{ type: "price", label: `${formatINR(priceRange[0])} - ${formatINR(priceRange[1])}`, value: "price" }] : []),
  ];

  const removeChip = (chip: { type: string; value: any }) => {
    if (chip.type === "category") {
      const next = selectedCategories.filter((c) => c !== chip.value);
      updateURL({ category: next.length > 0 ? next.join(",") : null });
    } else if (chip.type === "sizes") {
      const next = selectedSizes.filter((s) => s !== chip.value);
      updateURL({ sizes: next.length > 0 ? next.join(",") : null });
    } else if (chip.type === "colors") {
      const next = selectedColors.filter((c) => c !== chip.value);
      updateURL({ colors: next.length > 0 ? next.join(",") : null });
    } else if (chip.type === "rating") {
      updateURL({ rating: null });
    } else if (chip.type === "price") {
      updateURL({ minPrice: null, maxPrice: null });
    }
  };

  // Render Star ratings in filters
  const renderStars = (num: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-3.5 h-3.5 ${i < num ? "fill-primary text-primary-dark" : "text-border"}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body">
        
        {/* Luxurious Store Brand Banner */}
        <div className="bg-gradient-to-br from-[#F7E7CE]/30 via-surface to-[#F2A7BB]/15 border-2 border-primary/20 rounded-card p-6 md:p-10 mb-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-soft relative overflow-hidden backdrop-blur-sm">
          {/* Glowing brand seal watermark background */}
          <div className="absolute right-[-10%] top-[-20%] opacity-[0.03] pointer-events-none transform rotate-[15deg]">
            <Image
              src="/logo.png"
              alt="Watermark decoration"
              width={400}
              height={400}
              className="object-contain"
            />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left relative z-10">
            {/* Elegant wax-seal style logo container */}
            <div className="relative w-28 h-28 rounded-full bg-white/70 backdrop-blur-sm border-2 border-primary/30 shadow-[0_8px_32px_rgba(242,167,187,0.12)] flex-shrink-0 flex items-center justify-center p-3 hover:rotate-[6deg] hover:scale-105 transition-all duration-500 ease-out">
              <Image
                src="/logo.png"
                alt="Kushvi Closet Seal Logo"
                width={92}
                height={92}
                className="object-contain"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-dark mb-2 block">
                Maison de la Mode
              </span>
              <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-wider text-text-primary mb-3">
                Kushvi Closet
              </h1>
              <p className="text-text-secondary text-xs sm:text-sm max-w-xl leading-relaxed font-light">
                Bridging Pinterest moodboards and premium designer boutique apparel. Experience custom visual search and real-time high-fidelity virtual try-ons.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2 min-w-[170px] border-t md:border-t-0 md:border-l border-border pt-5 md:pt-0 md:pl-8 relative z-10">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-secondary">
              Boutique Inventory
            </span>
            <span className="text-base font-bold text-text-primary font-heading italic tracking-wide">
              {totalCount} Curated Fits
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-bold text-primary-dark uppercase tracking-widest mt-1">
              Complimentary Delivery
            </span>
          </div>
        </div>

        {/* Header Title / Stats info */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 mb-8">
          <div>
            <h2 className="font-heading italic text-2xl text-text-primary mb-1">
              The Collection
            </h2>
            <p className="text-text-secondary text-xs">
              Showing {products.length} of {totalCount} Pinterest-curated fashion pieces
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0 justify-between md:justify-end">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-1.5 px-4 py-2 glass-container rounded-btn text-xs font-semibold uppercase tracking-wider text-text-primary hover:bg-background"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>

            {/* Sort by Dropdown */}
            <div className="flex items-center gap-2 glass-container rounded-btn px-3 py-2 text-xs font-semibold uppercase tracking-wider relative shadow-soft">
              <span className="text-text-secondary">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => updateURL({ sort: e.target.value })}
                className="bg-transparent border-0 outline-none text-text-primary cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low-High</option>
                <option value="price-desc">Price: High-Low</option>
                <option value="popular">Popular</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          
          {/* Desktop Left Sidebar Filters */}
          <aside className="hidden md:block w-64 flex-shrink-0 animate-fade-in">
            <div className="sticky top-24 flex flex-col gap-8">
              
              {/* Reset action header */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider flex items-center gap-2">
                  <Filter className="w-4.5 h-4.5 text-primary-dark" /> Filters
                </h3>
                {activeChips.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary-dark hover:text-primary-dark/80 font-semibold uppercase tracking-wider"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Category checkbox list */}
              <div className="border-t border-border pt-5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary mb-4">
                  Categories
                </h4>
                <div className="flex flex-col gap-2.5">
                  {CATEGORIES.map((cat) => (
                    <label key={cat.value} className="flex items-center gap-2.5 text-sm text-text-secondary hover:text-text-primary cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.value)}
                        onChange={() => handleCategoryToggle(cat.value)}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price slider */}
              <div className="border-t border-border pt-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary">
                    Price Range
                  </h4>
                  <span className="text-xs font-semibold text-primary-dark">
                    {formatINR(priceRange[0])} - {formatINR(priceRange[1])}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={5000}
                  step={100}
                  value={priceRange}
                  onValueChange={(val) => setPriceRange(val)}
                  onValueCommit={(val) => updateURL({ minPrice: val[0].toString(), maxPrice: val[1].toString() })}
                />
              </div>

              {/* Sizes check selector pills */}
              <div className="border-t border-border pt-5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary mb-4">
                  Sizes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((size) => {
                    const active = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeToggle(size)}
                        className={`w-9 h-9 border rounded-full text-xs font-semibold uppercase tracking-wider flex items-center justify-center transition-all ${
                          active
                            ? "bg-primary border-primary text-text-primary font-bold scale-105"
                            : "border-border text-text-secondary hover:border-primary-dark"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors dots */}
              <div className="border-t border-border pt-5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary mb-4">
                  Colors
                </h4>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((col) => {
                    const active = selectedColors.includes(col.name);
                    return (
                      <button
                        key={col.name}
                        onClick={() => handleColorToggle(col.name)}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all relative ${
                          active 
                            ? "border-primary-dark scale-125 ring-2 ring-primary/20" 
                            : "border-border hover:scale-110"
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      >
                        {active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-text-primary block" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ratings star selector */}
              <div className="border-t border-border pt-5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary mb-4">
                  Rating
                </h4>
                <div className="flex flex-col gap-2.5">
                  {RATINGS.map((rate) => {
                    const active = selectedRating === rate;
                    return (
                      <button
                        key={rate}
                        onClick={() => updateURL({ rating: active ? null : rate.toString() })}
                        className={`flex items-center gap-2 text-sm text-left transition-colors ${
                          active ? "text-primary-dark font-semibold" : "text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {renderStars(rate)}
                        <span>& Above</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </aside>

          {/* Right Main Catalog Body */}
          <div className="flex-1">
            
            {/* Active filters display chips */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center mb-6 animate-fade-in">
                <span className="text-xs text-text-secondary uppercase tracking-widest font-semibold mr-1">
                  Active Filters:
                </span>
                {activeChips.map((chip, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 glass-container rounded-full px-3 py-1 text-xs text-text-primary shadow-soft"
                  >
                    <span className="capitalize">{chip.label}</span>
                    <button
                      onClick={() => removeChip(chip)}
                      className="text-text-secondary hover:text-error rounded-full p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Catalog Grid Display */}
            {products.length > 0 ? (
              <div className="flex flex-col gap-10">
                <MasonryGrid products={products} />

                {/* Pagination Load More */}
                {hasMore && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="flex items-center gap-2 px-8 py-3 bg-surface border border-border text-text-primary hover:text-primary-dark hover:border-primary rounded-btn text-xs font-semibold uppercase tracking-wider transition-colors shadow-soft disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-primary-dark" />
                          <span>Loading...</span>
                        </>
                      ) : (
                        <span>Load More Styles</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Empty search state
              !loading && (
                <div className="text-center py-20 px-4 glass-container rounded-card shadow-soft flex flex-col items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-secondary/25 border border-secondary flex items-center justify-center mb-6">
                    <Filter className="w-10 h-10 text-primary-dark/65" />
                  </div>
                  <h3 className="font-heading italic text-2xl text-text-primary mb-2">
                    No Matching Fits Found
                  </h3>
                  <p className="text-text-secondary text-sm max-w-sm mb-8">
                    We couldn't find matches matching your filter options. Try adjusting filters or searching other tags.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    View All Products
                  </button>
                </div>
              )
            )}

            {/* Skeleton initial loading indicators */}
            {loading && products.length === 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-surface rounded-card border border-border p-4 shadow-soft flex flex-col gap-4 animate-pulse">
                    <div className="bg-border rounded-btn aspect-[3/4] w-full" />
                    <div className="h-4 bg-border rounded w-2/3" />
                    <div className="h-3 bg-border rounded w-1/2" />
                    <div className="h-5 bg-border rounded w-1/3 mt-2" />
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Mobile Drawer Slide-in filters overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-text-primary/40 backdrop-blur-sm animate-fade-in flex justify-end">
          <div className="w-80 glass-container border-y-0 border-r-0 rounded-none h-full p-6 shadow-soft overflow-y-auto flex flex-col justify-between">
            <div className="flex flex-col gap-6">
              
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary-dark" /> Filters
                </h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 hover:bg-border/30 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary mb-3">
                  Categories
                </h4>
                <div className="flex flex-col gap-2">
                  {CATEGORIES.map((cat) => (
                    <label key={cat.value} className="flex items-center gap-2 text-sm text-text-secondary">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.value)}
                        onChange={() => handleCategoryToggle(cat.value)}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary">
                    Price Range
                  </h4>
                  <span className="text-xs font-semibold text-primary-dark">
                    {formatINR(priceRange[0])} - {formatINR(priceRange[1])}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={5000}
                  step={100}
                  value={priceRange}
                  onValueChange={(val) => setPriceRange(val)}
                  onValueCommit={(val) => updateURL({ minPrice: val[0].toString(), maxPrice: val[1].toString() })}
                />
              </div>

              {/* Sizes */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary mb-3">
                  Sizes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((size) => {
                    const active = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeToggle(size)}
                        className={`w-9 h-9 border rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                          active ? "bg-primary border-primary text-text-primary font-bold" : "border-border text-text-secondary"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary mb-3">
                  Colors
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {COLORS.map((col) => {
                    const active = selectedColors.includes(col.name);
                    return (
                      <button
                        key={col.name}
                        onClick={() => handleColorToggle(col.name)}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all relative ${
                          active ? "border-primary-dark scale-110" : "border-border"
                        }`}
                        style={{ backgroundColor: col.hex }}
                      >
                        {active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="mt-8 border-t border-border pt-4 flex gap-4">
              <button
                onClick={() => {
                  clearFilters();
                  setMobileFiltersOpen(false);
                }}
                className="flex-1 py-3 border border-border text-text-primary hover:bg-background rounded-btn text-xs font-semibold uppercase tracking-wider text-center"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-3 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-semibold uppercase tracking-wider text-center"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
