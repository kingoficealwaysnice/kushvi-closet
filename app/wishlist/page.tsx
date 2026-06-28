"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useApp } from "@/components/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatINR } from "@/lib/utils";
import { Heart, ShoppingCart, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function WishlistPage() {
  const { user, wishlist, toggleWishlist, addToCart } = useApp();
  const [movingId, setMovingId] = useState("");

  const handleMoveToCart = async (productId: string, wishlistId: string) => {
    setMovingId(productId);
    // Move to cart with default S size, Blush/Standard color
    const success = await addToCart(productId, "S", "Standard", 1);
    if (success) {
      // Remove from wishlist
      await toggleWishlist(productId);
      toast.success("Moved to Shopping Bag! 🛍️");
    }
    setMovingId("");
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-24 text-center font-body flex flex-col items-center justify-center flex-1">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
            <Heart className="w-6 h-6 text-primary-dark" />
          </div>
          <h2 className="font-heading italic text-2xl text-text-primary mb-2">Login to view wishlist</h2>
          <p className="text-text-secondary text-xs mb-8">Synchronize and view your curated Pinterest styling wishlist across all active devices.</p>
          <Link href="/login" className="w-full py-3 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-bold uppercase tracking-wider text-center transition-colors">
            Login Now
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body flex-1">
        <h1 className="font-heading italic text-3xl sm:text-4xl text-text-primary mb-8 border-b border-border pb-5">
          Curated Wishlist
        </h1>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
            {wishlist.map((item) => {
              if (!item.product) return null;
              const product = item.product;
              const mainImg = product.images?.[0] || "/placeholder.jpg";
              const isMoving = movingId === product.id;

              return (
                <div
                  key={item.id}
                  className="bg-surface border border-border rounded-card overflow-hidden shadow-soft flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300"
                >
                  
                  {/* Image container */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-secondary/10">
                    <Link href={`/product/${product.id}`}>
                      <Image
                        src={mainImg}
                        alt={product.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-2.5 right-2.5 bg-primary text-white p-2 rounded-full shadow-sm"
                      title="Remove"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  {/* Info details */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary">
                        {product.category}
                      </span>
                      <Link href={`/product/${product.id}`} className="hover:text-primary-dark transition-colors font-medium text-sm text-text-primary line-clamp-1 block mt-0.5">
                        {product.name}
                      </Link>
                      <strong className="block text-sm text-text-primary mt-1">
                        {formatINR(product.price)}
                      </strong>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMoveToCart(product.id, item.id)}
                        disabled={isMoving}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-primary text-primary-dark hover:bg-primary/5 rounded-btn text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                      >
                        {isMoving ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShoppingCart className="w-3.5 h-3.5" />
                        )}
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface rounded-card border border-border shadow-soft max-w-lg mx-auto flex flex-col items-center justify-center p-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
              <Heart className="w-9 h-9 text-primary-dark fill-primary" />
            </div>
            <h3 className="font-heading italic text-2xl text-text-primary mb-2">Wishlist is Empty</h3>
            <p className="text-text-secondary text-sm max-w-sm mb-8">
              Curate your favorite Pinterest fashion inspirations! Add items to your wishlist while browsing the shop catalog.
            </p>
            <Link
              href="/shop"
              className="px-8 py-3 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-semibold uppercase tracking-wider transition-colors shadow-soft"
            >
              Discover Styles
            </Link>
          </div>
        )}

      </main>

      <Footer />
    </>
  );
}
