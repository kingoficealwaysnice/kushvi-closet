"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Order } from "@/types";
import { formatINR } from "@/lib/utils";
import { Check, Calendar, ShoppingBag, ArrowRight, RefreshCw } from "lucide-react";
import confetti from "canvas-confetti";

function OrderSuccessContent({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Trigger confetti and fetch order details on mount
  useEffect(() => {
    // Confetti pop!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#F2A7BB", "#C4687E", "#F7E7CE", "#B8D8D8"],
    });

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4 font-body">
        <h2 className="font-heading italic text-3xl mb-4 text-text-primary">Order Not Resolved</h2>
        <p className="text-text-secondary text-sm mb-6 max-w-sm">We couldn't load confirmation details for this Order ID. Payment is confirmed.</p>
        <Link href="/" className="px-6 py-2 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-semibold uppercase tracking-wider">
          Return Home
        </Link>
      </div>
    );
  }

  // Estimated delivery date (5 days from order date)
  const estDate = new Date(new Date(order.created_at).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-16 font-body text-center flex flex-col items-center flex-1">
        
        {/* Animated Checkmark CSS */}
        <div className="w-20 h-20 bg-success/15 border border-success/30 rounded-full flex items-center justify-center mb-6 shadow-soft relative animate-bounce">
          <Check className="w-10 h-10 text-success" />
        </div>

        <h1 className="font-heading italic text-3xl sm:text-4xl text-text-primary mb-3">
          Your order is confirmed! 🎉
        </h1>
        <p className="text-text-secondary text-sm max-w-md mb-8">
          Thank you for shopping with us. We have sent a confirmation email with dropship details and billing receipts.
        </p>

        {/* Order Reference details card */}
        <div className="w-full bg-surface border border-border rounded-card p-6 shadow-soft text-left space-y-6 mb-10">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-2">
            <div>
              <span className="text-[10px] font-bold text-text-secondary uppercase">Order ID</span>
              <p className="text-sm font-mono text-text-primary font-bold">{order.id}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-text-secondary uppercase">Estimated Delivery</span>
              <p className="text-sm text-primary-dark font-bold flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> {estDate}
              </p>
            </div>
          </div>

          {/* Items Summary list */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary mb-3.5">
              Items Summary
            </h3>
            <div className="divide-y divide-border/60">
              {order.items.map((item, index) => (
                <div key={index} className="py-3.5 flex gap-4 items-center">
                  <div className="relative w-10 h-14 rounded overflow-hidden bg-secondary/10 flex-shrink-0 border border-border">
                    <Image
                      src={item.image || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs text-text-primary truncate">{item.name}</h4>
                    <p className="text-[10px] text-text-secondary mt-0.5">
                      Size: {item.size} • Color: {item.color} • Qty: {item.qty}
                    </p>
                  </div>
                  <span className="font-bold text-xs text-text-primary">
                    {formatINR(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="border-t border-border pt-4 flex flex-col gap-2 text-xs text-text-secondary">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span>{order.shipping_fee === 0 ? "FREE" : formatINR(order.shipping_fee)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3.5 items-baseline">
              <strong className="text-text-primary text-sm">Paid Total</strong>
              <strong className="text-base text-primary-dark font-heading italic font-bold">
                {formatINR(order.total_amount)}
              </strong>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="border-t border-border pt-4 text-xs text-text-secondary">
            <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary mb-2">
              Shipping Address
            </h4>
            <p className="font-semibold text-text-primary text-xs">{order.shipping_address.name}</p>
            <p>{order.shipping_address.line1}</p>
            {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
            <p>
              {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
            </p>
          </div>

        </div>

        {/* Steering Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm justify-center">
          <Link
            href="/orders"
            className="flex-1 flex items-center justify-center gap-1.5 py-3.5 border border-primary text-primary-dark hover:bg-primary/5 rounded-btn text-xs font-semibold uppercase tracking-wider transition-colors shadow-soft"
          >
            <ShoppingBag className="w-4 h-4" /> Track Order
          </Link>
          <Link
            href="/shop"
            className="flex-1 flex items-center justify-center gap-1.5 py-3.5 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-bold uppercase tracking-wider transition-colors shadow-soft"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </main>

      <Footer />
    </>
  );
}

export default function OrderSuccess({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <OrderSuccessContent id={params.id} />
    </Suspense>
  );
}
