"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Sparkles, ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { useApp } from "@/components/AppContext";
import { formatINR, calculateDiscount } from "@/lib/utils";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { wishlist, toggleWishlist, addToCart } = useApp();
  const [hovered, setHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showQuickSizes, setShowQuickSizes] = useState(false);

  const isWishlisted = wishlist.some((item) => item.product_id === product.id);
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discount = hasDiscount ? calculateDiscount(product.price, product.original_price) : 0;

  // Decide image aspect ratio based on index for natural Pinterest masonry feel
  const aspectClass = index % 3 === 0 ? "aspect-[3/4]" : index % 3 === 1 ? "aspect-[2/3]" : "aspect-[4/5]";

  // Image source (toggle to second image on hover if available)
  const mainImage = product.images?.[0] || "/placeholder.jpg";
  const hoverImage = product.images?.[1] || mainImage;

  const handleQuickAdd = async (size: string) => {
    setAddingToCart(true);
    const defaultColor = product.colors?.[0]?.name || "Standard";
    const success = await addToCart(product.id, size, defaultColor, 1);
    setAddingToCart(false);
    setShowQuickSizes(false);
  };

  return (
    <div
      className="group relative flex flex-col bg-surface rounded-card border border-border shadow-soft overflow-hidden hover:translate-y-[-4px] transition-all duration-300 animate-fade-in font-body"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setShowQuickSizes(false);
      }}
    >
      {/* Image Container */}
      <div className={`relative w-full ${aspectClass} overflow-hidden bg-secondary/10`}>
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <Image
            src={hovered ? hoverImage : mainImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {/* AI Try-On Badge */}
        {product.ai_avatar_image && (
          <div className="absolute top-3 left-3 bg-accent/90 backdrop-blur-sm border border-accent/20 text-text-primary px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3 h-3 text-primary-dark" />
            <span>AI Try-On</span>
          </div>
        )}

        {/* Pinterest Sourced Tag */}
        {product.pinterest_inspired && (
          <div className="absolute top-3 right-12 bg-primary/95 text-text-primary px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">
            Trending
          </div>
        )}

        {/* Wishlist Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 shadow-sm ${
            isWishlisted
              ? "bg-primary text-white scale-110"
              : "bg-surface/80 text-text-secondary hover:text-error hover:bg-surface"
          }`}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-white" : ""}`} />
        </button>

        {/* Hover Action Overlays */}
        {hovered && (
          <div className="absolute inset-0 bg-text-primary/10 flex flex-col justify-end p-4 transition-all duration-300 pointer-events-none">
            <div className="flex flex-col gap-2 w-full pointer-events-auto">
              
              {/* Quick Add / Try On Buttons */}
              <div className="flex gap-2">
                <Link
                  href={`/product/${product.id}?tryon=true`}
                  className="flex-1 text-center py-2 bg-surface hover:bg-primary/10 text-primary-dark text-xs font-semibold uppercase tracking-wider rounded-btn shadow-md hover:scale-102 active:scale-98 transition-all duration-200"
                >
                  Try On
                </Link>

                <button
                  onClick={() => setShowQuickSizes(true)}
                  className="p-2 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn shadow-md transition-colors"
                  title="Quick Add to Cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Size Selector Popup Overlay */}
        {showQuickSizes && (
          <div className="absolute inset-0 bg-surface/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-10 animate-fade-in">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
              Select Size
            </h4>
            <div className="flex flex-wrap gap-2 justify-center max-w-[80%]">
              {product.sizes && product.sizes.length > 0 ? (
                product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleQuickAdd(size)}
                    disabled={addingToCart}
                    className="w-10 h-10 border border-border hover:border-primary-dark hover:bg-primary/5 rounded-full text-xs font-semibold flex items-center justify-center text-text-primary hover:text-primary-dark transition-all disabled:opacity-50"
                  >
                    {size}
                  </button>
                ))
              ) : (
                <span className="text-xs text-text-secondary">One Size Only</span>
              )}
            </div>
            <button
              onClick={() => setShowQuickSizes(false)}
              className="mt-4 text-xs font-semibold text-text-secondary hover:text-primary-dark uppercase tracking-wider"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Description Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1 block">
            {product.category}
          </span>
          <Link href={`/product/${product.id}`}>
            <h3 className="text-sm font-medium text-text-primary line-clamp-1 hover:text-primary-dark transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-sm font-semibold text-text-primary">
            {formatINR(product.price)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-xs text-text-secondary line-through">
                {formatINR(product.original_price!)}
              </span>
              <span className="text-[10px] font-bold text-primary-dark bg-primary/10 px-1.5 py-0.5 rounded">
                -{discount}%
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
