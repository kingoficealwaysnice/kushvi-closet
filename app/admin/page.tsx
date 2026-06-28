"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { formatINR, formatDate } from "@/lib/utils";
import { 
  TrendingUp, 
  ShoppingBag, 
  Tag, 
  Users, 
  Plus, 
  ArrowRight, 
  ClipboardList, 
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface DashboardStats {
  ordersCountToday: number;
  revenueToday: number;
  activeProductsCount: number;
  pendingOrdersCount: number;
  newUsersCountToday: number;
}

interface RecentOrder {
  id: string;
  full_name: string;
  total_amount: number;
  status: any;
  created_at: string;
}

export default function AdminDashboard() {
  const { user, role } = useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMocked, setIsMocked] = useState(false);

  useEffect(() => {
    // Role checks
    if (user && role !== "admin") {
      toast.error("Access denied. Admin role required.");
      window.location.href = "/";
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setRecentOrders(data.recentOrders);
          setIsMocked(data.is_mocked);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Double check admin role bypass in client view
  if (!user || role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text-primary text-sm uppercase tracking-wider font-semibold">
        Access Denied
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body flex-1">
        
        {/* Title bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-6 mb-8 gap-4">
          <div>
            <h1 className="font-heading italic text-3xl sm:text-4xl text-text-primary mb-1">
              Admin Workspace
            </h1>
            <p className="text-text-secondary text-xs">
              Monitor daily dropship performance, manage vendors, and update trending catalogs.
            </p>
          </div>

          {isMocked && (
            <div className="flex items-center gap-1.5 text-[10px] text-primary-dark font-medium bg-primary/10 border border-primary/20 rounded-full px-4.5 py-1.5 shadow-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Running on simulation database bypass</span>
            </div>
          )}
        </div>

        {/* Stats metrics grid */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            
            {/* Revenue */}
            <div className="bg-surface border border-border rounded-card p-5 shadow-soft">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-text-secondary uppercase">Revenue Today</span>
                <TrendingUp className="w-4.5 h-4.5 text-primary-dark" />
              </div>
              <strong className="text-xl font-heading italic text-primary-dark block mb-1">
                {formatINR(stats.revenueToday)}
              </strong>
              <span className="text-[10px] text-text-secondary font-medium">UPI payment receipts</span>
            </div>

            {/* Orders */}
            <div className="bg-surface border border-border rounded-card p-5 shadow-soft">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-text-secondary uppercase">Orders Today</span>
                <ShoppingBag className="w-4.5 h-4.5 text-primary-dark" />
              </div>
              <strong className="text-xl font-bold text-text-primary block mb-1">
                {stats.ordersCountToday}
              </strong>
              <span className="text-[10px] text-text-secondary font-medium">Transactions completed</span>
            </div>

            {/* Pending */}
            <div className="bg-surface border border-border rounded-card p-5 shadow-soft">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-text-secondary uppercase">Pending Orders</span>
                <ClipboardList className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <strong className="text-xl font-bold text-text-primary block mb-1">
                {stats.pendingOrdersCount}
              </strong>
              <span className="text-[10px] text-text-secondary font-medium">Awaiting vendor shipping</span>
            </div>

            {/* Active Products */}
            <div className="bg-surface border border-border rounded-card p-5 shadow-soft">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-text-secondary uppercase">Active Styles</span>
                <Tag className="w-4.5 h-4.5 text-primary-dark" />
              </div>
              <strong className="text-xl font-bold text-text-primary block mb-1">
                {stats.activeProductsCount}
              </strong>
              <span className="text-[10px] text-text-secondary font-medium">Live catalog entries</span>
            </div>

            {/* New Users */}
            <div className="bg-surface border border-border rounded-card p-5 shadow-soft">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-text-secondary uppercase">New Registrations</span>
                <Users className="w-4.5 h-4.5 text-primary-dark" />
              </div>
              <strong className="text-xl font-bold text-text-primary block mb-1">
                {stats.newUsersCountToday}
              </strong>
              <span className="text-[10px] text-text-secondary font-medium">Joined dashboard today</span>
            </div>

          </div>
        )}

        {/* Quick actions & Recent orders */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Recent Orders table */}
          <div className="lg:col-span-9 bg-surface border border-border rounded-card shadow-soft overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="font-heading italic text-lg font-bold text-text-primary">Recent Orders</h3>
              <Link href="/admin/orders" className="text-xs font-bold text-primary-dark uppercase tracking-wider hover:underline flex items-center gap-1">
                All Orders <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-background border-b border-border text-text-secondary uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Order ID</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-background/20">
                      <td className="px-6 py-4 font-mono font-bold text-text-primary truncate max-w-[120px]">{ord.id}</td>
                      <td className="px-6 py-4 text-text-primary">{ord.full_name}</td>
                      <td className="px-6 py-4 font-semibold text-text-primary">{formatINR(ord.total_amount)}</td>
                      <td className="px-6 py-4"><OrderStatusBadge status={ord.status} /></td>
                      <td className="px-6 py-4 text-text-secondary">{formatDate(ord.created_at)}</td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-text-secondary">No orders recorded yet today.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions sidebar */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            <div className="bg-surface border border-border rounded-card p-6 shadow-soft space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border pb-3">
                Quick Actions
              </h3>
              
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/admin/products/new"
                  className="w-full py-3 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-semibold uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-colors shadow-soft"
                >
                  <Plus className="w-4 h-4" /> Add New Product
                </Link>

                <Link
                  href="/admin/products"
                  className="w-full py-3 border border-border hover:bg-background rounded-btn text-xs font-semibold uppercase tracking-wider text-center block transition-colors shadow-soft"
                >
                  Manage Products
                </Link>

                <Link
                  href="/admin/orders"
                  className="w-full py-3 border border-border hover:bg-background rounded-btn text-xs font-semibold uppercase tracking-wider text-center block transition-colors shadow-soft"
                >
                  Manage Orders
                </Link>

                <Link
                  href="/admin/vendors"
                  className="w-full py-3 border border-border hover:bg-background rounded-btn text-xs font-semibold uppercase tracking-wider text-center block transition-colors shadow-soft"
                >
                  Vendor Approvals
                </Link>

                <Link
                  href="/admin/users"
                  className="w-full py-3 border border-border hover:bg-background rounded-btn text-xs font-semibold uppercase tracking-wider text-center block transition-colors shadow-soft"
                >
                  User Roles manager
                </Link>
              </div>
            </div>

            {/* Brief instruction box */}
            <div className="bg-primary/5 border border-primary/20 rounded-card p-5 shadow-soft text-xs text-text-secondary leading-normal">
              <strong className="text-primary-dark block mb-1">Logistics Note:</strong>
              When orders transition from <strong>Pending</strong> to <strong>Confirmed</strong>, vendors receive direct dropship packing slips to fulfill shipments under the brand name.
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </>
  );
}
