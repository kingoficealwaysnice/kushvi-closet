"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { User, UserRole } from "@/types";
import { 
  ChevronLeft, 
  RefreshCw, 
  Search, 
  UserCheck, 
  UserPlus, 
  UserMinus, 
  Users,
  Shield,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

export default function AdminUsersList() {
  const { user: currentUser, role: currentRole } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMocked, setIsMocked] = useState(false);

  useEffect(() => {
    if (currentUser && currentRole !== "admin") {
      toast.error("Admin role required");
      window.location.href = "/";
      return;
    }
    fetchUsers();
  }, [currentUser, currentRole]);

  const fetchUsers = async () => {
    setLoading(true);

    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (!isSupabaseConfigured) {
      // Mock user records
      const mockUsers: User[] = [
        {
          id: "mock-customer-id",
          email: "aisha@kushvi.com",
          full_name: "Aisha Patel",
          role: "customer",
          phone: "+919876543210",
          avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "mock-admin-id",
          email: "admin@kushvi.com",
          full_name: "Kushvi Admin",
          role: "admin",
          phone: "+919999999999",
          avatar_url: null,
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "mock-vend-1",
          email: "gilded@weaves.in",
          full_name: "Gilded Weaves Retail",
          role: "vendor",
          phone: "+918888888888",
          avatar_url: null,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setUsers(mockUsers);
      setIsMocked(true);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setUsers(data as User[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    if (!window.confirm(`Are you sure you want to promote/change user role to: ${newRole.toUpperCase()}?`)) return;

    if (isMocked) {
      toast.success(`Mock user role updated to ${newRole.toUpperCase()}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      return;
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      toast.success(`User role updated to ${newRole.toUpperCase()} successfully! ✨`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to modify user role");
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    return (
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (!currentUser || currentRole !== "admin") {
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
            <h1 className="font-heading italic text-3xl text-text-primary mb-1">User Registrations</h1>
            <p className="text-text-secondary text-xs">Total styling users: {filteredUsers.length}</p>
          </div>

          {isMocked && (
            <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary-dark px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Simulation database active</span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="bg-surface border border-border rounded-card p-5 shadow-soft mb-8 flex gap-4">
          <div className="relative flex-1 flex items-center bg-background border border-border rounded-input px-3 py-2.5 focus-within:border-primary">
            <Search className="w-4 h-4 text-text-secondary mr-2" />
            <input
              type="text"
              placeholder="Search user name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 outline-none w-full text-xs text-text-primary placeholder:text-text-secondary"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-primary-dark font-semibold uppercase tracking-wider hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="bg-surface border border-border rounded-card shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-background border-b border-border text-text-secondary uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">User Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Role Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-background/25">
                      <td className="px-6 py-4 font-semibold text-text-primary text-sm flex items-center gap-2">
                        <Users className="w-4.5 h-4.5 text-primary" /> {u.full_name}
                      </td>
                      <td className="px-6 py-4 text-text-primary font-mono">{u.email}</td>
                      <td className="px-6 py-4 text-text-secondary">{u.phone || "NA"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                          u.role === "admin" 
                            ? "bg-purple-100 border-purple-200 text-purple-800" 
                            : u.role === "vendor" 
                            ? "bg-blue-100 border-blue-200 text-blue-800" 
                            : "bg-background border-border text-text-secondary"
                        }`}>
                          {u.role === "admin" ? <ShieldCheck className="w-3.5 h-3.5" /> : u.role === "vendor" ? <Shield className="w-3.5 h-3.5" /> : null}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">{formatDate(u.created_at)}</td>
                      
                      {/* Promoters */}
                      <td className="px-6 py-4 text-right">
                        {u.id !== currentUser.id && (
                          <div className="flex justify-end gap-2 text-[9px] font-bold uppercase tracking-wider">
                            {u.role !== "vendor" && (
                              <button
                                onClick={() => handleChangeRole(u.id, "vendor")}
                                className="px-2.5 py-1 bg-surface border border-border hover:border-primary text-primary-dark rounded transition-colors"
                              >
                                Promote to Vendor
                              </button>
                            )}
                            {u.role !== "admin" && (
                              <button
                                onClick={() => handleChangeRole(u.id, "admin")}
                                className="px-2.5 py-1 bg-surface border border-border hover:border-primary text-primary-dark rounded transition-colors"
                              >
                                Promote to Admin
                              </button>
                            )}
                            {u.role !== "customer" && (
                              <button
                                onClick={() => handleChangeRole(u.id, "customer")}
                                className="px-2.5 py-1 bg-surface border border-border hover:border-error text-error rounded transition-colors"
                              >
                                Demote to Customer
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-surface border border-border rounded-card shadow-soft text-text-secondary">
            No registered users found.
          </div>
        )}

      </main>

      <Footer />
    </>
  );
}
