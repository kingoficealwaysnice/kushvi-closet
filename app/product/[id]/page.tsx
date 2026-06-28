"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TryOnPanel from "@/components/TryOnPanel";
import SizeGuideModal from "@/components/SizeGuideModal";
import ProductCard from "@/components/ProductCard";
import { Product, Review } from "@/types";
import { supabase } from "@/lib/supabase";
import { formatINR, calculateDiscount } from "@/lib/utils";
import { 
  Heart, 
  ShoppingCart, 
  Sparkles, 
  Star, 
  Plus, 
  Minus, 
  ChevronRight, 
  ArrowRight,
  Info,
  CheckCircle2,
  RefreshCw,
  Camera
} from "lucide-react";
import { toast } from "sonner";

// Static mock reviews for beautiful display fallback
const MOCK_REVIEWS = [
  {
    id: "rev-1",
    rating: 5,
    comment: "This is hands down the prettiest outfit I own now! The fabric is soft satin, flows beautifully, and the blush shade matches the photos perfectly. Got so many compliments at brunch! 💕",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    user: { full_name: "Riya Sharma", avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" }
  },
  {
    id: "rev-2",
    rating: 4,
    comment: "Very elegant drape. Sizing is accurate (I got an M). The only tiny issue is it needs gentle handwashing, but otherwise, absolute luxury feel! 10/10 recommendation.",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    user: { full_name: "Sneha Patel", avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" }
  }
];

function ProductDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const { user, cart, wishlist, addToCart, toggleWishlist, refreshCart } = useApp();

  // Page states
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery states
  const [activeTab, setActiveTab] = useState<"gallery" | "ai_avatar">("gallery");
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Selectors
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  // Modals / Panels
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  // Review states
  const [canReview, setCanReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const isWishlisted = wishlist.some((item) => item.product_id === id);

  // Fetch product, reviews, and related items
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        // 1. Fetch main product
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const data = (await res.json()) as Product;
        setProduct(data);
        setSelectedImage(data.images?.[0] || "");
        setSelectedColor(data.colors?.[0]?.name || "");
        setSelectedSize(data.sizes?.[0] || "");

        // 2. Fetch reviews
        const { data: revs, error: revErr } = await supabase
          .from("reviews")
          .select("*, user:users(full_name, avatar_url)")
          .eq("product_id", id);

        if (!revErr && revs && revs.length > 0) {
          setReviews(revs as unknown as Review[]);
        } else {
          setReviews(MOCK_REVIEWS as unknown as Review[]);
        }

        // 3. Fetch related products (same category)
        const relRes = await fetch(`/api/products?category=${data.category}&limit=4`);
        const relData = await relRes.json();
        if (relData.products) {
          setRelatedProducts(relData.products.filter((p: Product) => p.id !== id));
        }

        // 4. Check if user can review this product (has delivered order with it)
        if (user) {
          const { data: orders, error: orderErr } = await supabase
            .from("orders")
            .select("items, status")
            .eq("user_id", user.id)
            .eq("status", "delivered");

          if (!orderErr && orders) {
            const bought = orders.some((ord) => 
              ord.items.some((item: any) => item.product_id === id)
            );
            setCanReview(bought);
          }
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4 font-body">
        <h2 className="font-heading italic text-3xl mb-4 text-text-primary">Style Not Found</h2>
        <p className="text-text-secondary text-sm mb-6 max-w-sm">We couldn't retrieve details for this garment ID. Sourcing routes might be offline.</p>
        <Link href="/shop" className="px-6 py-2 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-semibold uppercase tracking-wider">
          Back to Shop
        </Link>
      </div>
    );
  }

  const discount = product.original_price ? calculateDiscount(product.price, product.original_price) : 0;
  const isOutOfStock = product.stock_count <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast.error("Sorry, this item is currently out of stock!");
      return;
    }
    const success = await addToCart(product.id, selectedSize, selectedColor, quantity);
    if (success) {
      toast.success("Item added to cart successfully! 🛍️");
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) {
      toast.error("Sorry, this item is out of stock!");
      return;
    }
    const success = await addToCart(product.id, selectedSize, selectedColor, quantity);
    if (success) {
      router.push("/cart");
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmittingReview(true);
    try {
      const { error, data } = await supabase
        .from("reviews")
        .insert({
          product_id: product.id,
          user_id: user.id,
          rating: reviewRating,
          comment: reviewComment,
        })
        .select("*, user:users(full_name, avatar_url)")
        .single();

      if (error) throw error;

      toast.success("Thank you for your feedback! ✨");
      if (data) {
        setReviews((prev) => [data as unknown as Review, ...prev]);
      }
      setReviewComment("");
      setCanReview(false); // Can submit only one review per purchase
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Review calculations
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "5.0";

  const ratingCounts = [0, 0, 0, 0, 0]; // 5 to 1 star count
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingCounts[5 - r.rating]++;
    }
  });

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body flex-1">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-text-secondary mb-8 uppercase tracking-widest font-semibold">
          <Link href="/" className="hover:text-primary-dark transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-border" />
          <Link href="/shop" className="hover:text-primary-dark transition-colors">Shop</Link>
          <ChevronRight className="w-3 h-3 text-border" />
          <Link href={`/shop?category=${product.category}`} className="hover:text-primary-dark transition-colors">{product.category}</Link>
          <ChevronRight className="w-3 h-3 text-border" />
          <span className="text-text-primary text-ellipsis max-w-[120px] truncate">{product.name}</span>
        </nav>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start mb-16">
          
          {/* Left Column: Image Gallery Tabs */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Gallery Tabs */}
            <div className="flex border-b border-border mb-2">
              <button
                onClick={() => setActiveTab("gallery")}
                className={`py-3 px-6 text-sm font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === "gallery"
                    ? "border-primary-dark text-primary-dark font-bold"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Catalog Gallery
              </button>
              
              {product.ai_avatar_image && (
                <button
                  onClick={() => setActiveTab("ai_avatar")}
                  className={`py-3 px-6 text-sm font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === "ai_avatar"
                      ? "border-primary-dark text-primary-dark font-bold"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-primary-dark" /> See on AI Avatar
                </button>
              )}
            </div>

            {/* Display Window */}
            {activeTab === "gallery" ? (
              <div className="flex flex-col gap-4">
                <div className="relative w-full aspect-[3/4] bg-secondary/10 rounded-card border border-border overflow-hidden group shadow-soft">
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-102 transition-transform duration-500"
                    priority
                  />
                </div>

                {/* Thumbnails below */}
                <div className="grid grid-cols-5 gap-3">
                  {product.images && product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      className={`relative aspect-[3/4] rounded-btn border bg-secondary/10 overflow-hidden shadow-soft ${
                        selectedImage === img 
                          ? "border-primary-dark ring-2 ring-primary/20 scale-102" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} thumb ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // AI Avatar view
              <div className="relative w-full aspect-[3/4] bg-secondary/15 rounded-card border border-border overflow-hidden shadow-soft flex items-center justify-center">
                {product.ai_avatar_image ? (
                  <Image
                    src={product.ai_avatar_image}
                    alt={`${product.name} on model avatar`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-sm text-text-secondary">AI avatar garment visual missing</span>
                )}
              </div>
            )}

          </div>

          {/* Right Column: Garment Selector UI */}
          <div className="lg:col-span-5 flex flex-col gap-6 animate-fade-in">
            
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary-dark bg-primary/10 border border-primary/20 rounded px-2.5 py-1 inline-block mb-3">
                {product.pinterest_inspired ? "Pinterest Trending" : "Designer Collection"}
              </span>
              <h2 className="font-heading italic text-3xl sm:text-4xl text-text-primary leading-tight mb-2">
                {product.name}
              </h2>
              
              {/* Stars summary */}
              <div className="flex items-center gap-1.5 text-sm text-text-secondary mt-1">
                <div className="flex items-center text-primary-dark">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(parseFloat(averageRating)) ? "fill-primary text-primary-dark" : "text-border"}`}
                    />
                  ))}
                </div>
                <span>({averageRating})</span>
                <span className="text-border">|</span>
                <span className="underline cursor-pointer">{totalReviews} customer reviews</span>
              </div>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3.5 py-4 border-y border-border">
              <span className="text-2xl font-bold text-text-primary">
                {formatINR(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-base text-text-secondary line-through">
                    {formatINR(product.original_price)}
                  </span>
                  <span className="text-xs font-bold text-primary-dark bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Colors Selectors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary mb-3">
                  Color: <span className="font-normal text-text-secondary capitalize">{selectedColor}</span>
                </h4>
                <div className="flex items-center gap-3">
                  {product.colors.map((col) => {
                    const active = selectedColor === col.name;
                    return (
                      <button
                        key={col.name}
                        onClick={() => setSelectedColor(col.name)}
                        className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                          active
                            ? "border-primary-dark scale-110 ring-2 ring-primary/20"
                            : "border-border hover:scale-105"
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
            )}

            {/* Sizes Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary">
                    Select Size
                  </h4>
                  <button
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-xs font-bold text-primary-dark hover:text-primary-dark/80 underline uppercase tracking-wider"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex gap-2">
                  {product.sizes.map((size) => {
                    const active = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-11 h-11 rounded-full border text-xs font-bold flex items-center justify-center transition-all uppercase tracking-wider ${
                          active
                            ? "bg-primary border-primary text-text-primary scale-105"
                            : "border-border text-text-secondary hover:border-primary-dark"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock tracker indicator */}
            {!isOutOfStock && product.stock_count < 5 && (
              <div className="flex items-center gap-2 text-xs text-primary-dark bg-primary/5 border border-primary/20 rounded px-3 py-2">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>Only <strong>{product.stock_count} units left</strong> in stock! Grab it now.</span>
              </div>
            )}

            {/* Quantity selector & buttons */}
            <div className="flex flex-col gap-4">
              
              {!isOutOfStock && (
                <div className="flex items-center gap-4">
                  <span className="font-bold text-xs uppercase tracking-wider text-text-primary">
                    Quantity:
                  </span>
                  <div className="flex items-center bg-background border border-border rounded-input">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                      title="Decrease"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-semibold text-sm select-none">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_count, quantity + 1))}
                      className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                      title="Increase"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 border border-primary text-primary-dark hover:bg-primary/5 rounded-btn text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-bold uppercase tracking-wider transition-all shadow-soft disabled:opacity-40"
                >
                  Buy Now
                </button>
                
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3.5 border rounded-btn transition-colors ${
                    isWishlisted 
                      ? "bg-primary border-primary text-white" 
                      : "border-border text-text-secondary hover:text-error hover:bg-background"
                  }`}
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-white" : ""}`} />
                </button>
              </div>

              {isOutOfStock && (
                <div className="text-center font-semibold py-3 bg-error/15 text-error rounded-btn text-sm border border-error/25">
                  Temporarily Out of Stock
                </div>
              )}
            </div>

            {/* Collapsible description */}
            <div className="border-t border-border pt-4">
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="w-full flex justify-between items-center text-left py-2 font-bold text-xs uppercase tracking-wider text-text-primary focus:outline-none"
              >
                <span>Garment details</span>
                <span>{descExpanded ? "-" : "+"}</span>
              </button>
              {descExpanded && (
                <div className="text-sm text-text-secondary leading-relaxed pt-2 pb-4 animate-fade-in">
                  <p className="mb-3">{product.description || "Premium fabric, custom tailored drape styled under dropshipping collections."}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {product.tags && product.tags.map((tag) => (
                      <span key={tag} className="bg-background border border-border rounded px-2.5 py-0.5 text-xs text-text-secondary">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Vendor Tag */}
            <div className="bg-background border border-border rounded-card p-4 text-xs text-text-secondary flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-text-primary block mb-0.5">Verified Dropship Seller</strong>
                Ships under our brand name • Delivered to your door in 4-6 days with Razorpay secure packaging.
              </div>
            </div>

          </div>

        </div>

        {/* AI Try On Collapsible Section */}
        <div className="mb-16">
          <TryOnPanel product={product} />
        </div>

        {/* Customer Reviews Section */}
        <section className="border-t border-border pt-12 mb-16">
          <h3 className="font-heading italic text-2xl sm:text-3xl text-text-primary mb-8">
            Customer Feedback
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-10">
            
            {/* Reviews Chart Breakdowns */}
            <div className="md:col-span-4 bg-surface border border-border rounded-card p-6 shadow-soft">
              <div className="text-center mb-6">
                <span className="text-5xl font-extrabold text-text-primary font-heading italic block mb-1">
                  {averageRating}
                </span>
                <div className="flex justify-center text-primary-dark mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4.5 h-4.5 ${i < Math.round(parseFloat(averageRating)) ? "fill-primary text-primary-dark" : "text-border"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-text-secondary uppercase tracking-widest font-semibold">
                  Based on {totalReviews} reviews
                </span>
              </div>

              {/* Progress bars */}
              <div className="flex flex-col gap-2">
                {ratingCounts.map((count, index) => {
                  const stars = 5 - index;
                  const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3 text-xs text-text-secondary">
                      <span className="w-3 text-right font-bold">{stars}★</span>
                      <div className="flex-1 h-2 bg-background border border-border rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="w-6 text-right font-medium">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews list */}
            <div className="md:col-span-8 flex flex-col gap-6">
              
              {/* Form to submit reviews */}
              {canReview && (
                <form onSubmit={submitReview} className="bg-surface border border-border rounded-card p-6 shadow-soft animate-fade-in">
                  <h4 className="font-heading italic text-lg font-bold text-text-primary mb-4">
                    Leave a Review
                  </h4>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-primary-dark hover:scale-110 transition-transform"
                        >
                          <Star className={`w-5 h-5 ${star <= reviewRating ? "fill-primary text-primary-dark" : "text-border"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <textarea
                      required
                      placeholder="Share your thoughts on the fitting, fabric texture, and style..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      className="w-full border border-border rounded-input p-3 text-sm focus:border-primary outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex items-center gap-1.5 px-6 py-2 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                  >
                    {submittingReview ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    <span>Submit Review</span>
                  </button>
                </form>
              )}

              <div className="divide-y divide-border">
                {reviews.map((rev) => (
                  <div key={rev.id} className="py-6 first:pt-0">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-primary/20 border border-primary text-primary-dark flex items-center justify-center font-bold text-xs uppercase">
                          {rev.user?.avatar_url ? (
                            <Image
                              src={rev.user.avatar_url}
                              alt={rev.user.full_name || "Reviewer"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span>{(rev.user?.full_name || "C").charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <strong className="text-sm font-semibold text-text-primary">{rev.user?.full_name || "Valued Customer"}</strong>
                          <span className="text-[10px] text-text-secondary block mt-0.5">
                            Verified Purchase • {new Date(rev.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex text-primary-dark">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-primary text-primary-dark" : "text-border"}`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-text-secondary leading-relaxed pl-10">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </section>

        {/* You Might Also Like Carousel */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-border pt-12">
            <h3 className="font-heading italic text-2xl sm:text-3xl text-text-primary mb-8">
              You Might Also Like
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProd) => (
                <ProductCard key={relProd.id} product={relProd} />
              ))}
            </div>
          </section>
        )}

      </main>

      <SizeGuideModal 
        isOpen={sizeGuideOpen} 
        onClose={() => setSizeGuideOpen(false)} 
      />

      <Footer />
    </>
  );
}

export default function ProductDetail({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ProductDetailContent id={params.id} />
    </Suspense>
  );
}
