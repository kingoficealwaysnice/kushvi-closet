"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddressCard from "@/components/AddressCard";
import { Address } from "@/types";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  User as UserIcon, 
  MapPin, 
  Lock, 
  Plus, 
  RefreshCw, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  Phone 
} from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const { user, logout } = useApp();

  // Selected tab
  const [activeTab, setActiveTab] = useState<"details" | "addresses" | "password">("details");

  // Profile states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Address states
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Address form fields
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrLine2, setAddrLine2] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPincode, setAddrPincode] = useState("");
  const [addrSaving, setAddrSaving] = useState(false);

  // Password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Set initial details
  useEffect(() => {
    if (user) {
      setName(user.full_name || "");
      setPhone(user.phone || "");
      setAvatarUrl(user.avatar_url || "");
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    setLoadingAddresses(true);

    if (user.id.startsWith("mock-")) {
      const stored = localStorage.getItem(`addresses_${user.id}`);
      if (stored) setAddresses(JSON.parse(stored));
      setLoadingAddresses(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) setAddresses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdatingProfile(true);

    if (user.id.startsWith("mock-")) {
      const updatedMock = {
        ...user,
        full_name: name,
        phone: phone,
        avatar_url: avatarUrl,
      };
      localStorage.setItem("kushvi_mock_user", JSON.stringify(updatedMock));
      toast.success("Mock profile details updated! (Refresh page to see updates in header)");
      setUpdatingProfile(false);
      return;
    }

    try {
      // 1. Update public users table
      const { error: dbErr } = await supabase
        .from("users")
        .update({ full_name: name, phone, avatar_url: avatarUrl })
        .eq("id", user.id);

      if (dbErr) throw dbErr;

      // 2. Update auth metadata
      const { error: authErr } = await supabase.auth.updateUser({
        data: { full_name: name, phone, avatar_url: avatarUrl },
      });

      if (authErr) throw authErr;

      toast.success("Profile details saved successfully! ✨");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile details");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files[0] === null || !user) return;
    const file = e.target.files[0];
    
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "user-uploads");

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.url) {
        setAvatarUrl(data.url);
        toast.success("Profile picture uploaded!");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Upload avatar failed");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Address updates
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!addrPincode || addrPincode.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit Indian PIN code");
      return;
    }

    setAddrSaving(true);

    const addrBody: Omit<Address, "id"> = {
      user_id: user.id,
      name: addrName,
      phone: addrPhone,
      line1: addrLine1,
      line2: addrLine2 || null,
      city: addrCity,
      state: addrState,
      pincode: addrPincode,
      is_default: addresses.length === 0 ? true : false,
    };

    if (user.id.startsWith("mock-")) {
      let updated;
      if (editingAddress) {
        updated = addresses.map((a) =>
          a.id === editingAddress.id ? { ...a, ...addrBody } : a
        );
      } else {
        const withId: Address = {
          ...addrBody,
          id: `addr_mock_${Date.now()}`
        };
        updated = [...addresses, withId];
      }
      setAddresses(updated);
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updated));
      toast.success("Billing address updated!");
      resetAddressForm();
      setAddrSaving(false);
      return;
    }

    try {
      if (editingAddress) {
        const { error } = await supabase
          .from("addresses")
          .update(addrBody)
          .eq("id", editingAddress.id);

        if (error) throw error;
        toast.success("Address updated successfully!");
      } else {
        const { error } = await supabase
          .from("addresses")
          .insert(addrBody);

        if (error) throw error;
        toast.success("Address added successfully!");
      }
      resetAddressForm();
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.message || "Failed to save address");
    } finally {
      setAddrSaving(false);
    }
  };

  const handleEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddrName(addr.name);
    setAddrPhone(addr.phone);
    setAddrLine1(addr.line1);
    setAddrLine2(addr.line2 || "");
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrPincode(addr.pincode);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this delivery address?")) return;

    if (user && user.id.startsWith("mock-")) {
      const updated = addresses.filter((a) => a.id !== id);
      setAddresses(updated);
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updated));
      toast.success("Address deleted");
      return;
    }

    try {
      const { error } = await supabase.from("addresses").delete().eq("id", id);
      if (error) throw error;
      toast.success("Address deleted successfully");
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.message || "Delete address failed");
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    if (user && user.id.startsWith("mock-")) {
      const updated = addresses.map((a) => ({
        ...a,
        is_default: a.id === id,
      }));
      setAddresses(updated);
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updated));
      toast.success("Default address updated");
      return;
    }

    try {
      // 1. Clear all defaults for this user
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user?.id);

      // 2. Set this ID to default
      const { error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", id);

      if (error) throw error;
      toast.success("Default address updated! ✨");
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.message || "Failed to update default address");
    }
  };

  const resetAddressForm = () => {
    setEditingAddress(null);
    setAddrName("");
    setAddrPhone("");
    setAddrLine1("");
    setAddrLine2("");
    setAddrCity("");
    setAddrState("");
    setAddrPincode("");
    setShowAddressForm(false);
  };

  // Password reset
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setUpdatingPassword(true);

    if (user && user.id.startsWith("mock-")) {
      toast.success("Mock password update complete! Bypassed actual auth check.");
      setNewPassword("");
      setConfirmPassword("");
      setUpdatingPassword(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Password updated successfully! Keep it safe.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body flex-1">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Tabs Selector */}
          <aside className="md:col-span-3 bg-surface border border-border rounded-card p-6 shadow-soft space-y-6">
            
            <div className="flex flex-col items-center text-center pb-4 border-b border-border">
              <div className="relative w-20 h-20 bg-primary/20 border border-primary text-primary-dark rounded-full overflow-hidden flex items-center justify-center font-bold text-2xl uppercase mb-3">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span>{name.charAt(0)}</span>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                  </div>
                )}
              </div>

              {/* Avatar file upload handler */}
              <label className="cursor-pointer text-[10px] font-bold text-primary-dark uppercase tracking-wider hover:underline flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" /> Upload photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>

              <h3 className="font-heading italic text-lg font-bold text-text-primary mt-4 line-clamp-1">{name}</h3>
              <span className="text-[10px] bg-primary/10 border border-primary/20 rounded px-2.5 py-0.5 text-primary-dark font-bold uppercase tracking-wider mt-1.5 inline-block">
                Role: {user.role}
              </span>
            </div>

            <nav className="flex flex-col gap-1 text-sm font-semibold uppercase tracking-wider">
              <button
                onClick={() => setActiveTab("details")}
                className={`w-full text-left py-2 px-3 rounded-btn transition-colors flex items-center gap-2 ${
                  activeTab === "details"
                    ? "bg-primary/10 text-primary-dark font-bold"
                    : "text-text-secondary hover:bg-background"
                }`}
              >
                <UserIcon className="w-4 h-4" /> Personal Info
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full text-left py-2 px-3 rounded-btn transition-colors flex items-center gap-2 ${
                  activeTab === "addresses"
                    ? "bg-primary/10 text-primary-dark font-bold"
                    : "text-text-secondary hover:bg-background"
                }`}
              >
                <MapPin className="w-4 h-4" /> Saved Addresses
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`w-full text-left py-2 px-3 rounded-btn transition-colors flex items-center gap-2 ${
                  activeTab === "password"
                    ? "bg-primary/10 text-primary-dark font-bold"
                    : "text-text-secondary hover:bg-background"
                }`}
              >
                <Lock className="w-4 h-4" /> Change Password
              </button>
            </nav>

            <div className="border-t border-border pt-4">
              <button
                onClick={logout}
                className="w-full py-2.5 border border-error text-error hover:bg-error/5 rounded-btn text-xs font-semibold uppercase tracking-wider text-center"
              >
                Sign Out
              </button>
            </div>

          </aside>

          {/* Right Panel: Content Box */}
          <section className="md:col-span-9 bg-surface border border-border rounded-card p-6 sm:p-8 shadow-soft">
            
            {/* Details Form */}
            {activeTab === "details" && (
              <form onSubmit={handleUpdateProfile} className="space-y-6 animate-fade-in">
                <h3 className="font-heading italic text-2xl font-bold text-text-primary border-b border-border pb-4">
                  Profile Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Full Name</label>
                    <div className="relative rounded-input border border-border bg-background px-3 py-2 flex items-center focus-within:border-primary">
                      <UserIcon className="w-4 h-4 text-text-secondary mr-2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-transparent border-0 outline-none w-full text-sm text-text-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Phone Number</label>
                    <div className="relative rounded-input border border-border bg-background px-3 py-2 flex items-center focus-within:border-primary">
                      <Phone className="w-4 h-4 text-text-secondary mr-2" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-transparent border-0 outline-none w-full text-sm text-text-primary"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Email Address (Read Only)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full border border-border bg-background/50 rounded-input px-3 py-2 text-sm text-text-secondary cursor-not-allowed"
                  />
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="px-6 py-3 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2 shadow-soft"
                  >
                    {updatingProfile ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : null}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            )}

            {/* Addresses manager */}
            {activeTab === "addresses" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center border-b border-border pb-4">
                  <h3 className="font-heading italic text-2xl font-bold text-text-primary">
                    Manage Addresses
                  </h3>
                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary-dark border border-primary-dark/30 rounded-full px-3.5 py-1.5 hover:bg-primary/10 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Address
                    </button>
                  )}
                </div>

                {/* Add/Edit Form */}
                {showAddressForm && (
                  <form onSubmit={handleSaveAddress} className="bg-background border border-border rounded-card p-6 space-y-4 animate-fade-in">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border/75 pb-2">
                      {editingAddress ? "Edit Address details" : "Add Address details"}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Contact Name</label>
                        <input
                          type="text"
                          required
                          value={addrName}
                          onChange={(e) => setAddrName(e.target.value)}
                          className="w-full border border-border bg-surface rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={addrPhone}
                          onChange={(e) => setAddrPhone(e.target.value)}
                          className="w-full border border-border bg-surface rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Address Line 1</label>
                      <input
                        type="text"
                        required
                        value={addrLine1}
                        onChange={(e) => setAddrLine1(e.target.value)}
                        className="w-full border border-border bg-surface rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        value={addrLine2}
                        onChange={(e) => setAddrLine2(e.target.value)}
                        className="w-full border border-border bg-surface rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          className="w-full border border-border bg-surface rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">State</label>
                        <input
                          type="text"
                          required
                          value={addrState}
                          onChange={(e) => setAddrState(e.target.value)}
                          className="w-full border border-border bg-surface rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Pincode</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={addrPincode}
                          onChange={(e) => setAddrPincode(e.target.value)}
                          className="w-full border border-border bg-surface rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={resetAddressForm}
                        className="px-4 py-2 border border-border bg-surface hover:bg-background rounded-btn text-xs font-semibold uppercase tracking-wider text-text-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={addrSaving}
                        className="px-6 py-2 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                      >
                        {addrSaving ? "Saving..." : "Save Address"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Display grid */}
                {loadingAddresses ? (
                  <div className="flex justify-center p-10 animate-spin">
                    <RefreshCw className="w-6 h-6 text-primary" />
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {addresses.map((addr) => (
                      <AddressCard
                        key={addr.id}
                        address={addr}
                        onEdit={handleEditAddress}
                        onDelete={handleDeleteAddress}
                        onSetDefault={handleSetDefaultAddress}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-border border-dashed rounded-card">
                    <p className="text-sm text-text-secondary mb-4">You haven't saved any billing addresses.</p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="px-6 py-2 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-semibold uppercase tracking-wider"
                    >
                      Add Address Now
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* Change Password Form */}
            {activeTab === "password" && (
              <form onSubmit={handleUpdatePassword} className="space-y-6 animate-fade-in">
                <h3 className="font-heading italic text-2xl font-bold text-text-primary border-b border-border pb-4">
                  Change Password
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2">New Password</label>
                    <div className="relative rounded-input border border-border bg-background px-3 py-2 flex items-center focus-within:border-primary">
                      <Lock className="w-4 h-4 text-text-secondary mr-2" />
                      <input
                        type="password"
                        required
                        placeholder="Min 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-transparent border-0 outline-none w-full text-sm text-text-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Confirm Password</label>
                    <div className="relative rounded-input border border-border bg-background px-3 py-2 flex items-center focus-within:border-primary">
                      <Lock className="w-4 h-4 text-text-secondary mr-2" />
                      <input
                        type="password"
                        required
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-transparent border-0 outline-none w-full text-sm text-text-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="px-6 py-3 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2 shadow-soft"
                  >
                    {updatingPassword ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : null}
                    <span>Change Password</span>
                  </button>
                </div>
              </form>
            )}

          </section>

        </div>

      </main>

      <Footer />
    </>
  );
}
