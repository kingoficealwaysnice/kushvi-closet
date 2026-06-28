"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { formatINR } from "@/lib/utils";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Ticket, Check } from "lucide-react";
import { Product } from "@/types";
import { toast } from "sonner";

export default function CartPage() {
  const { user, cart, updateCartQty, removeFromCart, cartCount } = useApp();
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const router = useRouter();

  // Subtotal calculations
  const subtotal = cart.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const shippingThreshold = 499;
  const shippingFee = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 99;
  const discountAmount = subtotal * appliedDiscount;
  const total = subtotal + shippingFee - discountAmount;

  // Fetch recommendations (random 4 products)
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch("/api/products?limit=4");
        const data = await res.json();
        if (data.products) {
          // Filter out products already in cart
          const cartIds = cart.map((item) => item.product_id);
          const filtered = data.products.filter((p: Product) => !cartIds.includes(p.id));
          setRecommendations(filtered.slice(0, 4));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecommendations();
  }, [cart]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess(false);

    const code = couponCode.trim().toUpperCase();
    if (code === "PIN10" || code === "KUSHVI10") {
      setAppliedDiscount(0.1); // 10% Off
      setCouponSuccess(true);
      toast.success("Coupon code applied successfully! 🎉");
    } else if (code === "FREE500" && subtotal >= 2500) {
      setAppliedDiscount(0.15); // 15% Off
      setCouponSuccess(true);
      toast.success("Super coupon applied! 15% discount active!");
    } else {
      setCouponError("Invalid coupon code or minimum amount not met");
      setAppliedDiscount(0);
    }
  };

  const handleCheckoutRedirect = () => {
    if (!user) {
      toast.error("Please login to proceed to checkout!");
      router.push(`/login?redirect=/checkout`);
      return;
    }
    // Save coupon details if any to session storage for checkout use
    if (appliedDiscount > 0) {
      sessionStorage.setItem("applied_discount_percent", appliedDiscount.toString());
      sessionStorage.setItem("applied_coupon_code", couponCode.trim().toUpperCase());
    } else {
      sessionStorage.removeItem("applied_discount_percent");
      sessionStorage.removeItem("applied_coupon_code");
    }
    router.push("/checkout");
  };

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body flex-1">
        <h1 className="font-heading italic text-3xl sm:text-4xl text-text-primary mb-8 border-b border-border pb-5">
          Shopping Bag
        </h1>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Items List */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              
              {/* Free Shipping Progress Tracker */}
              {subtotal < shippingThreshold && (
                <div className="bg-primary/5 border border-primary/20 rounded-card p-4 text-xs text-text-secondary flex flex-col gap-2 shadow-soft">
                  <p>
                    Add <strong>{formatINR(shippingThreshold - subtotal)}</strong> more to unlock <strong>FREE Shipping</strong> (Save ₹99)
                  </p>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-dark transition-all duration-500" 
                      style={{ width: `${(subtotal / shippingThreshold) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {subtotal >= shippingThreshold && (
                <div className="bg-success/10 border border-success/20 text-text-primary rounded-card p-4 text-xs flex items-center gap-2 shadow-soft">
                  <Check className="w-4 h-4 text-success" />
                  <span>Congratulations! Your order qualifies for <strong>FREE Shipping</strong>.</span>
                </div>
              )}

              {/* Items Table Card */}
              <div className="bg-surface border border-border rounded-card shadow-soft overflow-hidden">
                <div className="divide-y divide-border">
                  {cart.map((item) => {
                    const price = item.product?.price || 0;
                    const mainImg = item.product?.images?.[0] || "/placeholder.jpg";
                    return (
                      <div key={item.id} className="p-4 sm:p-6 flex gap-4 sm:gap-6 items-center">
                        
                        {/* Image */}
                        <div className="relative w-20 h-28 flex-shrink-0 bg-secondary/15 rounded-btn border border-border overflow-hidden">
                          <Link href={`/product/${item.product_id}`}>
                            <Image
                              src={mainImg}
                              alt={item.product?.name || "Garment"}
                              fill
                              className="object-cover"
                            />
                          </Link>
                        </div>

                        {/* Description */}
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="max-w-xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                              {item.product?.category}
                            </span>
                            <Link href={`/product/${item.product_id}`} className="hover:text-primary-dark transition-colors font-medium text-sm text-text-primary line-clamp-1 block mt-0.5">
                              {item.product?.name}
                            </Link>
                            
                            <div className="flex flex-wrap gap-2 text-xs text-text-secondary mt-1.5">
                              <span className="bg-background px-2.5 py-0.5 rounded border border-border">Size: <strong>{item.size}</strong></span>
                              <span className="bg-background px-2.5 py-0.5 rounded border border-border flex items-center gap-1.5">
                                Color: <strong>{item.color}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Stepper & Price */}
                          <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10">
                            
                            {/* Stepper */}
                            <div className="flex items-center bg-background border border-border rounded-input">
                              <button
                                onClick={() => updateCartQty(item.id, item.quantity - 1)}
                                className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center font-semibold text-xs select-none">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQty(item.id, item.quantity + 1)}
                                className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Total Price */}
                            <div className="text-right min-w-[70px]">
                              <span className="text-sm font-bold text-text-primary">
                                {formatINR(price * item.quantity)}
                              </span>
                              {item.quantity > 1 && (
                                <span className="block text-[10px] text-text-secondary mt-0.5">
                                  ({formatINR(price)} each)
                                </span>
                              )}
                            </div>

                            {/* Delete button */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-text-secondary hover:text-error p-1 rounded hover:bg-error/5 transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>

                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column: Order Summary (Sticky) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-6">
              
              {/* Summary details */}
              <div className="bg-surface border border-border rounded-card p-6 shadow-soft font-body">
                <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border pb-4 mb-4">
                  Order Summary
                </h3>

                <div className="flex flex-col gap-3.5 text-sm text-text-secondary border-b border-border pb-4 mb-4">
                  <div className="flex justify-between">
                    <span>Bag Subtotal ({cartCount} items)</span>
                    <span className="text-text-primary font-medium">{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span>{shippingFee === 0 ? "FREE" : formatINR(shippingFee)}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Promo Coupon Discount</span>
                      <span>-{formatINR(discountAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-baseline mb-6">
                  <span className="text-sm font-bold text-text-primary">Total Amount</span>
                  <span className="text-xl font-extrabold text-primary-dark font-heading italic">
                    {formatINR(total)}
                  </span>
                </div>

                {/* Checkout Trigger */}
                <button
                  onClick={handleCheckoutRedirect}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-semibold uppercase tracking-wider shadow-soft transition-colors"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Coupon inputs */}
              <div className="bg-surface border border-border rounded-card p-6 shadow-soft">
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary mb-3">
                  Apply Coupon Code
                </h4>
                
                <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-2">
                  <div className="relative flex-1 bg-background border border-border rounded-input px-3 py-1.5 flex items-center focus-within:border-primary">
                    <Ticket className="w-4 h-4 text-text-secondary mr-2" />
                    <input
                      type="text"
                      placeholder="e.g. PIN10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="bg-transparent border-0 outline-none w-full text-xs uppercase text-text-primary"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-primary hover:bg-primary/5 text-primary-dark rounded-btn text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    Apply
                  </button>
                </form>

                {couponError && (
                  <p className="text-[10px] text-error font-medium">{couponError}</p>
                )}
                {couponSuccess && (
                  <p className="text-[10px] text-success font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Coupon applied! Enjoy 10% discount.
                  </p>
                )}

                <div className="bg-background border border-border/70 rounded p-2.5 text-[10px] text-text-secondary mt-3">
                  <span className="font-bold text-text-primary block mb-0.5">Available Offers:</span>
                  - Use code <strong>PIN10</strong> for flat 10% off storewide.<br />
                  - Use code <strong>FREE500</strong> for 15% off on orders above ₹2500.
                </div>
              </div>

            </div>

          </div>
        ) : (
          // Empty State
          <div className="text-center py-20 bg-surface rounded-card border border-border shadow-soft max-w-lg mx-auto flex flex-col items-center justify-center p-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
              <ShoppingBag className="w-9 h-9 text-primary-dark" />
            </div>
            <h3 className="font-heading italic text-2xl text-text-primary mb-2">Your Bag is Empty</h3>
            <p className="text-text-secondary text-sm max-w-sm mb-8 leading-relaxed">
              Looks like you haven't pinned any styling matching this catalog yet. Head back and explore our collections.
            </p>
            <Link
              href="/shop"
              className="px-8 py-3 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-semibold uppercase tracking-wider transition-colors shadow-soft"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {/* You Might Like recommendations */}
        {recommendations.length > 0 && (
          <section className="border-t border-border pt-12 mt-16">
            <h3 className="font-heading italic text-2xl sm:text-3xl text-text-primary mb-8">
              Suggested For You
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </>
  );
}
