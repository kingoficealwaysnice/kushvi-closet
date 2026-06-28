"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Vendor } from "@/types";
import { 
  ChevronLeft, 
  RefreshCw, 
  Check, 
  X, 
  Eye, 
  Store, 
  Briefcase, 
  MapPin, 
  CreditCard 
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

export default function AdminVendorsList() {
  const { user, role } = useApp();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user && role !== "admin") {
      toast.error("Admin role required");
      window.location.href = "/";
      return;
    }
    fetchVendors();
  }, [user, role]);

  const fetchVendors = async () => {
    setLoading(true);

    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (!isSupabaseConfigured) {
      // Return mock vendor applications
      const mockApplications: Vendor[] = [
        {
          id: "mock-vend-1",
          shop_name: "Gilded Weaves India",
          gst_number: "29AAAAA1111A1Z1",
          bank_details: {
            account_number: "50200012345678",
            ifsc_code: "HDFC0000123",
            bank_name: "HDFC Bank Ltd",
            holder_name: "Gilded Weaves Retail"
          },
          pincode_serviceable: ["560103", "560102", "560034"],
          rating: 4.8,
          total_orders_fulfilled: 120,
          is_approved: false,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "mock-vend-2",
          shop_name: "Pastel Couture Labs",
          gst_number: "07BBBBB2222B2Z2",
          bank_details: {
            account_number: "918020012345678",
            ifsc_code: "ICIC0000999",
            bank_name: "ICICI Bank Ltd",
            holder_name: "Pastel Couture Labs Pvt"
          },
          pincode_serviceable: ["110001", "110020", "110048"],
          rating: 5.0,
          total_orders_fulfilled: 380,
          is_approved: true,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setVendors(mockApplications);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("vendors")
        .select(`
          *,
          user:users(full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setVendors(data as unknown as Vendor[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveApplication = async (vendorId: string, approve: boolean) => {
    if (!window.confirm(`Are you sure you want to ${approve ? "APPROVE" : "REJECT"} this vendor shop application?`)) return;

    setActionLoading(true);

    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (!isSupabaseConfigured) {
      toast.success(`Mock vendor application ${approve ? "approved" : "rejected"}!`);
      setVendors((prev) =>
        prev.map((v) => (v.id === vendorId ? { ...v, is_approved: approve } : v))
      );
      setModalOpen(false);
      setActionLoading(false);
      return;
    }

    try {
      if (approve) {
        // 1. Set is_approved to true in vendors table
        const { error: vErr } = await supabase
          .from("vendors")
          .update({ is_approved: true })
          .eq("id", vendorId);
        if (vErr) throw vErr;

        // 2. Promote role to 'vendor' in users table
        const { error: uErr } = await supabase
          .from("users")
          .update({ role: "vendor" })
          .eq("id", vendorId);
        if (uErr) throw uErr;

        toast.success("Vendor application approved successfully! 👑");
      } else {
        // Rejecting deletes the application from vendors table
        const { error: vErr } = await supabase
          .from("vendors")
          .delete()
          .eq("id", vendorId);
        if (vErr) throw vErr;

        toast.success("Vendor application rejected and deleted!");
      }
      setModalOpen(false);
      fetchVendors();
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

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

        <h1 className="font-heading italic text-3xl text-text-primary mb-8 border-b border-border pb-5">
          Vendor Applications
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : vendors.length > 0 ? (
          <div className="bg-surface border border-border rounded-card shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-background border-b border-border text-text-secondary uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">Shop Name</th>
                    <th className="px-6 py-4">GST Number</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date Filed</th>
                    <th className="px-6 py-4 text-right">Fulfillment checks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {vendors.map((vend) => (
                    <tr 
                      key={vend.id}
                      onClick={() => {
                        setSelectedVendor(vend);
                        setModalOpen(true);
                      }}
                      className="hover:bg-background/20 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-text-primary text-sm flex items-center gap-2">
                        <Store className="w-4.5 h-4.5 text-primary-dark" /> {vend.shop_name}
                      </td>
                      <td className="px-6 py-4 text-text-primary font-mono">{vend.gst_number || "NA"}</td>
                      <td className="px-6 py-4">
                        {vend.is_approved ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-success bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Pending Review
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">{formatDate(vend.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1 border border-border text-text-secondary hover:text-primary-dark hover:border-primary-dark rounded transition-colors">
                          <Eye className="w-4.5 h-4.5" />
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
            No vendor partner applications filed yet.
          </div>
        )}

      </main>

      {/* Vendor details modal */}
      {modalOpen && selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/45 backdrop-blur-sm animate-fade-in font-body">
          <div className="bg-surface border border-border rounded-card max-w-md w-full overflow-hidden shadow-soft">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-heading italic text-xl font-bold text-text-primary flex items-center gap-2">
                <Store className="w-5 h-5 text-primary-dark" /> Shop Registration
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-background rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 text-xs text-text-secondary leading-normal">
              
              <div>
                <h4 className="font-bold text-[9px] uppercase tracking-wider text-text-primary mb-1">Company Details</h4>
                <p className="font-semibold text-text-primary text-sm">{selectedVendor.shop_name}</p>
                <p className="font-mono mt-1">GSTIN: {selectedVendor.gst_number || "NA"}</p>
                {selectedVendor.user && (
                  <p className="mt-1">Filed by: {selectedVendor.user.full_name} ({selectedVendor.user.email})</p>
                )}
              </div>

              {/* Serviceable Pincodes */}
              <div>
                <h4 className="font-bold text-[9px] uppercase tracking-wider text-text-primary mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary-dark" /> Serviceable Pincodes
                </h4>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto bg-background p-2 border border-border rounded">
                  {selectedVendor.pincode_serviceable && selectedVendor.pincode_serviceable.length > 0 ? (
                    selectedVendor.pincode_serviceable.map((p) => (
                      <span key={p} className="bg-surface border border-border rounded px-2 py-0.5 font-mono text-[10px] text-text-primary">{p}</span>
                    ))
                  ) : (
                    <span>All Pincodes Active</span>
                  )}
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <h4 className="font-bold text-[9px] uppercase tracking-wider text-text-primary mb-1.5 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-primary-dark" /> Settlement Account
                </h4>
                {selectedVendor.bank_details ? (
                  <div className="bg-background border border-border rounded p-3 leading-normal space-y-1">
                    <p>Holder: <strong className="text-text-primary">{selectedVendor.bank_details.holder_name || "NA"}</strong></p>
                    <p>Account: <strong className="text-text-primary font-mono">{selectedVendor.bank_details.account_number || "NA"}</strong></p>
                    <p>IFSC: <strong className="text-text-primary font-mono">{selectedVendor.bank_details.ifsc_code || "NA"}</strong></p>
                    <p>Bank: <span>{selectedVendor.bank_details.bank_name || "NA"}</span></p>
                  </div>
                ) : (
                  <p className="text-text-secondary">Settlement details not provided.</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="border-t border-border pt-4 flex gap-3">
                {!selectedVendor.is_approved ? (
                  <>
                    <button
                      onClick={() => handleResolveApplication(selectedVendor.id, false)}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 border border-error text-error hover:bg-error/5 rounded-btn text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => handleResolveApplication(selectedVendor.id, true)}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-soft transition-colors"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                  </>
                ) : (
                  <div className="w-full text-center text-success font-semibold py-2.5 bg-green-50 rounded border border-green-200 uppercase tracking-widest text-[10px] flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" /> Application approved
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
