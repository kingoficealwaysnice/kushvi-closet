"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Mail, Lock, User as UserIcon, Phone, RefreshCw } from "lucide-react";

function SignupContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      toast.error("Please accept the Terms & Conditions to register");
      return;
    }

    setLoading(true);

    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (!isSupabaseConfigured) {
      // Mock Signup Bypass
      toast.success("Signup Bypassed! styling profile created locally ✨");
      const mockUser = {
        id: "mock-customer-id",
        email: email || "aisha@kushvi.com",
        full_name: name || "Aisha Patel",
        role: "customer",
        phone: phone || "+919876543210",
        avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"
      };

      // Save to localStorage for mock session detection
      localStorage.setItem("kushvi_mock_user", JSON.stringify(mockUser));
      document.cookie = `kushvi_user_id=${mockUser.id}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `kushvi_user_role=${mockUser.role}; path=/; max-age=604800; SameSite=Lax`;
      window.location.href = redirectTo;
      setLoading(false);
      return;
    }

    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone,
            role: "customer",
          },
        },
      });

      if (error) throw error;

      toast.success("Account created successfully! Welcome to Kushvi Closet ✨");
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create account. Check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-body">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center">
        <Link href="/" className="group flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 shadow-md transition-transform duration-300 group-hover:scale-105 flex items-center justify-center bg-white">
            <Image
              src="/logo.png"
              alt="Kushvi Closet Logo"
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          </div>
          <h1 className="font-heading tracking-[0.2em] uppercase text-xl font-bold text-text-primary group-hover:text-primary-dark transition-colors mt-1">
            Kushvi Closet
          </h1>
        </Link>
        <h2 className="mt-6 text-2xl font-bold text-text-primary">
          Create a styling account
        </h2>
        <p className="mt-2 text-xs text-text-secondary">
          Or{" "}
          <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="font-semibold text-primary-dark hover:text-primary-dark/80 underline">
            login to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 border border-border rounded-card shadow-soft sm:px-10">
          
          <form className="space-y-5" onSubmit={handleSignup}>
            
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Full Name
              </label>
              <div className="relative rounded-input border border-border px-3 py-2 flex items-center bg-background focus-within:border-primary">
                <UserIcon className="w-4 h-4 text-text-secondary mr-2" />
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Aisha Patel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent border-0 outline-none w-full text-sm text-text-primary"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Email Address
              </label>
              <div className="relative rounded-input border border-border px-3 py-2 flex items-center bg-background focus-within:border-primary">
                <Mail className="w-4 h-4 text-text-secondary mr-2" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="aisha@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-0 outline-none w-full text-sm text-text-primary"
                />
              </div>
            </div>

            {/* Phone Number (Required for UPI payments pre-filling) */}
            <div>
              <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Phone Number <span className="text-primary-dark font-bold">*</span>
              </label>
              <div className="relative rounded-input border border-border px-3 py-2 flex items-center bg-background focus-within:border-primary">
                <Phone className="w-4 h-4 text-text-secondary mr-2" />
                <input
                  id="phone"
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-transparent border-0 outline-none w-full text-sm text-text-primary"
                />
              </div>
              <p className="text-[10px] text-text-secondary mt-1.5 leading-normal">
                Required to pre-fill your mobile number in Razorpay UPI checkouts.
              </p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                Create Password
              </label>
              <div className="relative rounded-input border border-border px-3 py-2 flex items-center bg-background focus-within:border-primary">
                <Lock className="w-4 h-4 text-text-secondary mr-2" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-0 outline-none w-full text-sm text-text-primary"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
              </div>
              <div className="ml-3 text-xs">
                <label htmlFor="terms" className="text-text-secondary">
                  I accept the{" "}
                  <span className="font-semibold text-primary-dark hover:underline cursor-pointer">
                    Terms & Conditions
                  </span>{" "}
                  and{" "}
                  <span className="font-semibold text-primary-dark hover:underline cursor-pointer">
                    Privacy Policy
                  </span>.
                </label>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-semibold uppercase tracking-wider shadow-soft disabled:opacity-50 transition-colors"
            >
              {loading ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <span>Create Account</span>}
            </button>

          </form>

        </div>
      </div>
      
    </div>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
