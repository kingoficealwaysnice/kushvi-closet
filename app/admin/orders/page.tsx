"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/components/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { Order, OrderStatus } from "@/types";
import { formatINR, formatDate } from "@/lib/utils";
import { 
  ChevronLeft, 
  RefreshCw, 
  Search, 
  Filter, 
  Eye, 
  X, 
  MapPin, 
  CreditCard, 
  Truck,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function AdminOrdersList() {
  const { user, role } = useApp();

  // List states
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isMocked, setIsMocked] = useState(false);

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(false);

  // Edit states inside modal
  const [editStatus, setEditStatus] = useState<OrderStatus>("pending");
  const [editTracking, setEditTracking] = useState("");

  useEffect(() => {
    if (user && role !== "admin") {
      toast.error("Admin role required");
      window.location.href = "/";
      return;
    }
    fetchOrders();
  }, [user, role]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
        if (data.some((ord: any) => ord.id.startsWith("ord_"))) {
          setIsMocked(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditTracking(order.tracking_number || "");
    setModalOpen(true);
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdatingOrder(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          tracking_number: editTracking.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Order resolved & status updated! 📦");
        
        // Sync local list state
        setOrders((prev) =>
          prev.map((ord) =>
            ord.id === selectedOrder.id
              ? { ...ord, status: editStatus, tracking_number: editTracking.trim() || null }
              : ord
          )
        );
        setModalOpen(false);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update order status");
    } finally {
      setUpdatingOrder(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch = 
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.shipping_address.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.payment_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord as any).email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "" || ord.status === statusFilter;

    return matchesSearch && matchesStatus;
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
        
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary-dark uppercase tracking-wider mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Title bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading italic text-3xl text-text-primary mb-1 font-bold">Manage Orders</h1>
            <p className="text-text-secondary text-xs">Awaiting dropship fulfillments: {filteredOrders.filter(o => o.status === "pending" || o.status === "confirmed").length} orders</p>
          </div>

          {isMocked && (
            <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary-dark px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Simulation database active</span>
            </div>
          )}
        </div>

        {/* Filter bar */}
        <div className="bg-surface border border-border rounded-card p-5 shadow-soft mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="relative flex items-center bg-background border border-border rounded-input px-3 py-2 focus-within:border-primary">
            <Search className="w-4 h-4 text-text-secondary mr-2" />
            <input
              type="text"
              placeholder="Search Order ID, Customer name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 outline-none w-full text-xs text-text-primary placeholder:text-text-secondary"
            />
          </div>

          <div className="relative flex items-center bg-background border border-border rounded-input px-3 py-2 focus-within:border-primary">
            <Filter className="w-4 h-4 text-text-secondary mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-0 outline-none w-full text-xs text-text-primary uppercase font-bold tracking-wider cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("");
              }}
              className="text-xs text-primary-dark font-semibold uppercase tracking-wider hover:underline"
            >
              Clear filters
            </button>
          </div>

        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="bg-surface border border-border rounded-card shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-background border-b border-border text-text-secondary uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Items Count</th>
                    <th className="px-6 py-4">Paid Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">View details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredOrders.map((ord) => (
                    <tr 
                      key={ord.id} 
                      onClick={() => handleRowClick(ord)}
                      className="hover:bg-background/25 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-text-primary truncate max-w-[120px]">
                        {ord.id}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">{formatDate(ord.created_at)}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-text-primary block">{ord.shipping_address.name}</span>
                        <span className="text-[10px] text-text-secondary block mt-0.5">{(ord as any).email}</span>
                      </td>
                      <td className="px-6 py-4 text-text-primary font-medium">
                        {ord.items.reduce((sum, item) => sum + item.qty, 0)} items
                      </td>
                      <td className="px-6 py-4 font-bold text-text-primary">
                        {formatINR(ord.total_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={ord.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1 border border-border hover:border-primary-dark hover:text-primary-dark rounded transition-colors text-text-secondary">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-surface border border-border rounded-card shadow-soft text-text-secondary">
            No orders found matching search criteria.
          </div>
        )}

      </main>

      {/* Order Details Modal Overlay */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/45 backdrop-blur-sm animate-fade-in font-body">
          <div className="bg-surface border border-border rounded-card max-w-2xl w-full overflow-hidden shadow-soft max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-heading italic text-xl font-bold text-text-primary">Order Sheet</h3>
                <span className="text-[10px] font-mono font-bold text-text-secondary">{selectedOrder.id}</span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-background rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-text-secondary leading-normal">
              
              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-background p-4 rounded-btn border border-border">
                <div>
                  <h4 className="font-bold text-[9px] uppercase tracking-wider text-text-primary mb-1">Customer Info</h4>
                  <p className="font-semibold text-text-primary text-sm">{selectedOrder.shipping_address.name}</p>
                  <p>{selectedOrder.shipping_address.phone}</p>
                  <p className="break-all">{(selectedOrder as any).email}</p>
                </div>
                <div>
                  <h4 className="font-bold text-[9px] uppercase tracking-wider text-text-primary mb-1">Payment info</h4>
                  <p className="font-semibold text-text-primary flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" /> Razorpay Gate
                  </p>
                  <p>Transaction ID: <span className="font-mono">{selectedOrder.payment_id}</span></p>
                  <p>Status: <strong className="text-success uppercase">{selectedOrder.payment_status}</strong></p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="font-bold text-[9px] uppercase tracking-wider text-text-primary mb-2.5">Purchased Garments</h4>
                <div className="border border-border rounded-input overflow-hidden bg-surface divide-y divide-border/60">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex gap-4 items-center">
                      <div className="relative w-8 h-12 bg-secondary/10 border border-border rounded overflow-hidden flex-shrink-0">
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
                      <span className="font-bold text-text-primary">{formatINR(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Shipping address details */}
                <div>
                  <h4 className="font-bold text-[9px] uppercase tracking-wider text-text-primary mb-2.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary-dark" /> Shipping Address
                  </h4>
                  <div className="bg-surface border border-border rounded-card p-4 leading-relaxed">
                    <p className="font-semibold text-text-primary">{selectedOrder.shipping_address.name}</p>
                    <p>{selectedOrder.shipping_address.phone}</p>
                    <p>{selectedOrder.shipping_address.line1}</p>
                    {selectedOrder.shipping_address.line2 && <p>{selectedOrder.shipping_address.line2}</p>}
                    <p>
                      {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}
                    </p>
                  </div>
                </div>

                {/* Status and Tracking form */}
                <form onSubmit={handleUpdateOrder} className="space-y-4">
                  <h4 className="font-bold text-[9px] uppercase tracking-wider text-text-primary flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-primary-dark" /> Dispatch Update
                  </h4>

                  <div className="bg-surface border border-border rounded-card p-4 space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold text-text-secondary uppercase mb-1">Fulfillment Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                        className="w-full border border-border bg-background rounded-input p-2 text-xs outline-none focus:border-primary text-text-primary cursor-pointer uppercase font-bold tracking-wider"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-text-secondary uppercase mb-1">Courier Tracking ID (Delhivery)</label>
                      <input
                        type="text"
                        placeholder="e.g. SF987654321IN"
                        value={editTracking}
                        onChange={(e) => setEditTracking(e.target.value)}
                        className="w-full border border-border bg-background rounded-input p-2 text-xs outline-none focus:border-primary text-text-primary font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updatingOrder}
                      className="w-full py-2 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-[10px] font-bold uppercase tracking-wider shadow-soft transition-colors flex items-center justify-center gap-1"
                    >
                      {updatingOrder ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                      <span>Save Dispatch Updates</span>
                    </button>
                  </div>
                </form>
              </div>

            </div>

          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
