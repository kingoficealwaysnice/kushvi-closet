"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Mail, Lock, Sparkles, RefreshCw } from "lucide-react";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (!isSupabaseConfigured) {
      // Mock Login Bypass
      toast.success("Login Bypassed! Welcome to Kushvi Closet ✨");
      const mockUser = {
        id: "mock-customer-id",
        email: email || "aisha@kushvi.com",
        full_name: "Aisha Patel",
        role: "customer",
        phone: "+919876543210",
        avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"
      };
      
      // Save to localStorage for mock session detection
      localStorage.setItem("kushvi_mock_user", JSON.stringify(mockUser));
      // Set cookies for middleware validation
      document.cookie = `kushvi_user_id=${mockUser.id}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `kushvi_user_role=${mockUser.role}; path=/; max-age=604800; SameSite=Lax`;
      // Force reload to let context catch the mock user
      window.location.href = redirectTo;
      setLoading(false);
      return;
    }

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Successfully logged in! Welcome back ✨");
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (!isSupabaseConfigured) {
      // Mock Google Login
      toast.success("Google Login Bypassed! logged in as Aisha Patel ✨");
      const mockUser = {
        id: "mock-customer-id",
        email: "aisha@kushvi.com",
        full_name: "Aisha Patel",
        role: "customer",
        phone: "+919876543210",
        avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100"
      };
      localStorage.setItem("kushvi_mock_user", JSON.stringify(mockUser));
      document.cookie = `kushvi_user_id=${mockUser.id}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `kushvi_user_role=${mockUser.role}; path=/; max-age=604800; SameSite=Lax`;
      window.location.href = redirectTo;
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger Google Login");
    }
  };

  const handleAdminBypass = () => {
    // Helper to log in as mock admin for testing dashboard pages
    toast.success("Admin Role Bypassed! Welcome Admin 👑");
    const mockAdmin = {
      id: "mock-admin-id",
      email: "admin@kushvi.com",
      full_name: "Kushvi Admin",
      role: "admin",
      phone: "+919999999999",
      avatar_url: null
    };
    localStorage.setItem("kushvi_mock_user", JSON.stringify(mockAdmin));
    document.cookie = `kushvi_user_id=${mockAdmin.id}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `kushvi_user_role=${mockAdmin.role}; path=/; max-age=604800; SameSite=Lax`;
    window.location.href = "/admin";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-body">
      
      {/* Brand logo top link */}
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
          Sign in to your account
        </h2>
        <p className="mt-2 text-xs text-text-secondary">
          Or{" "}
          <Link href={`/signup?redirect=${encodeURIComponent(redirectTo)}`} className="font-semibold text-primary-dark hover:text-primary-dark/80 underline">
            create a new styling account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 border border-border rounded-card shadow-soft sm:px-10">
          
          <form className="space-y-6" onSubmit={handleLogin}>
            
            {/* Email field */}
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
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-0 outline-none w-full text-sm text-text-primary"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-primary-dark hover:text-primary-dark/85 font-semibold">
                  Forgot password?
                </Link>
              </div>
              <div className="relative rounded-input border border-border px-3 py-2 flex items-center bg-background focus-within:border-primary">
                <Lock className="w-4 h-4 text-text-secondary mr-2" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-0 outline-none w-full text-sm text-text-primary"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-semibold uppercase tracking-wider shadow-soft disabled:opacity-50 transition-colors"
            >
              {loading ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <span>Sign In</span>}
            </button>

          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface px-3 text-text-secondary font-semibold">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 py-3 border border-border hover:bg-background rounded-btn text-xs font-semibold uppercase tracking-wider text-text-primary transition-colors shadow-soft"
              >
                {/* Google Icon SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.5-1.13 2.76-2.4 3.61v3h3.86c2.26-2.08 3.56-5.14 3.56-8.73z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1c1.98 3.96 6.07 6.61 10.71 6.61z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.6H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.4l3.98-3.11z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.27 2.65 1.29 6.6l3.98 3.11c.95-2.85 3.6-4.96 6.73-4.96z"
                  />
                </svg>
                <span>Google Account</span>
              </button>

              {/* Developer Test Admin Account Bypass */}
              <button
                type="button"
                onClick={handleAdminBypass}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-accent/20 hover:bg-accent/35 border border-accent/30 rounded-btn text-xs font-semibold uppercase tracking-wider text-primary-dark transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary-dark" />
                <span>Bypass Login as Admin (Test)</span>
              </button>

            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
