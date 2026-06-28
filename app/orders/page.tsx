"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/components/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { Order } from "@/types";
import { formatINR, formatDate } from "@/lib/utils";
import { ChevronDown, ChevronUp, Package, MapPin, RefreshCw, ShoppingBag, Eye } from "lucide-react";
import { toast } from "sonner";

export default function OrdersPage() {
  const { user } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string>("");

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/orders?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserOrders();
  }, [user]);

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? "" : id);
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-24 text-center font-body flex flex-col items-center justify-center flex-1">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
            <LockIcon className="w-6 h-6 text-primary-dark" />
          </div>
          <h2 className="font-heading italic text-2xl text-text-primary mb-2">Login to view orders</h2>
          <p className="text-text-secondary text-xs mb-8">Access your e-commerce fashion history by logging into your verified account profile.</p>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body flex-1">
        <h1 className="font-heading italic text-3xl sm:text-4xl text-text-primary mb-8 border-b border-border pb-5">
          Order History
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : orders.length > 0 ? (
          <div className="flex flex-col gap-6 animate-fade-in">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const mainImages = order.items.slice(0, 3).map((it) => it.image || "/placeholder.jpg");
              
              return (
                <div
                  key={order.id}
                  className="bg-surface border border-border rounded-card shadow-soft overflow-hidden transition-all duration-300"
                >
                  
                  {/* Order Card Summary bar */}
                  <div
                    onClick={() => toggleExpandOrder(order.id)}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-background/20 select-none"
                  >
                    <div className="flex flex-col gap-1 text-xs text-text-secondary">
                      <span className="font-bold text-[9px] uppercase tracking-wider">Order Reference</span>
                      <strong className="text-text-primary font-mono text-xs">{order.id}</strong>
                      <span className="mt-0.5">{formatDate(order.created_at)}</span>
                    </div>

                    {/* Previews */}
                    <div className="flex items-center gap-2">
                      {mainImages.map((img, idx) => (
                        <div key={idx} className="relative w-8 h-12 bg-secondary/15 rounded border border-border overflow-hidden">
                          <Image
                            src={img}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-[10px] text-text-secondary font-bold pl-1">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      <strong className="text-sm font-bold text-text-primary">
                        {formatINR(order.total_amount)}
                      </strong>
                    </div>

                    <button className="text-text-secondary hover:text-text-primary p-1 rounded hover:bg-background hidden sm:block">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Expanded Timeline details */}
                  {isExpanded && (
                    <div className="border-t border-border bg-background/30 p-5 sm:p-6 space-y-6 animate-fade-in text-xs">
                      
                      {/* Products table */}
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary mb-3">Garments Details</h4>
                        <div className="border border-border rounded-input overflow-hidden bg-surface divide-y divide-border/60">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="p-3.5 flex gap-4 items-center">
                              <div className="relative w-9 h-12 rounded overflow-hidden bg-secondary/10 flex-shrink-0 border border-border">
                                <Image
                                  src={item.image || "/placeholder.jpg"}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-text-primary truncate">{item.name}</h5>
                                <p className="text-[10px] text-text-secondary mt-0.5">
                                  Size: {item.size} • Color: {item.color} • Qty: {item.qty}
                                </p>
                              </div>
                              <strong className="text-text-primary">{formatINR(item.price * item.qty)}</strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {/* Address */}
                        <div className="bg-surface border border-border rounded-card p-4 shadow-soft">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border pb-2.5 mb-2.5 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-primary-dark" /> Shipping details
                          </h4>
                          <p className="font-semibold text-text-primary">{order.shipping_address.name}</p>
                          <p>{order.shipping_address.phone}</p>
                          <p>{order.shipping_address.line1}</p>
                          {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                          <p>
                            {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                          </p>
                        </div>

                        {/* Shipment Tracking details */}
                        <div className="bg-surface border border-border rounded-card p-4 shadow-soft">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border pb-2.5 mb-2.5 flex items-center gap-1.5">
                            <Package className="w-4 h-4 text-primary-dark" /> Shipment tracker
                          </h4>
                          {order.tracking_number ? (
                            <div className="space-y-2">
                              <p>Status: <strong className="text-primary-dark capitalize">{order.status}</strong></p>
                              <p>Courier ID: <strong className="font-mono text-text-primary">{order.tracking_number}</strong></p>
                              <div className="pt-3">
                                <a
                                  href={`https://www.delhivery.com/track/package/${order.tracking_number}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-dark border border-primary-dark/30 rounded-full px-3 py-1.5 hover:bg-primary/5 uppercase tracking-wider"
                                >
                                  Delhivery Portal <Eye className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          ) : (
                            <p className="text-text-secondary leading-relaxed">
                              Vendor is packing your order under dropship logistics. Tracking ID will update shortly.
                            </p>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface rounded-card border border-border shadow-soft max-w-lg mx-auto flex flex-col items-center justify-center p-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
              <Package className="w-9 h-9 text-primary-dark" />
            </div>
            <h3 className="font-heading italic text-2xl text-text-primary mb-2">No Orders Placed Yet</h3>
            <p className="text-text-secondary text-sm max-w-sm mb-8">
              You haven't ordered any catalog items. Check out our latest Pinterest collections to see virtual try-ons.
            </p>
            <Link
              href="/shop"
              className="px-8 py-3 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-semibold uppercase tracking-wider transition-colors shadow-soft"
            >
              Shop Catalog
            </Link>
          </div>
        )}

      </main>

      <Footer />
    </>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
