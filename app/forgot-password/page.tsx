"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Mail, RefreshCw, ChevronLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (!isSupabaseConfigured) {
      // Mock reset
      toast.success("Password reset simulated successfully!");
      setSent(true);
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/profile?reset=true`,
      });

      if (error) throw error;

      setSent(true);
      toast.success("Styling recovery link sent! Check your inbox.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-body">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="font-heading italic text-4xl font-bold tracking-wide text-text-primary hover:text-primary-dark transition-colors">
          Kushvi Closet
        </Link>
        <h2 className="mt-6 text-2xl font-bold text-text-primary">
          Recover your password
        </h2>
        <p className="mt-2 text-xs text-text-secondary">
          Enter your email to receive a secure recovery code.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 border border-border rounded-card shadow-soft sm:px-10">
          
          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary-dark" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">Check Your Inbox</h3>
              <p className="text-xs text-text-secondary leading-relaxed max-w-xs mx-auto mb-6">
                We've sent a secure password reset link to <strong>{email}</strong>. Click the link to define a new password.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary-dark hover:text-primary-dark/80 uppercase tracking-wider underline"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleReset}>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-semibold uppercase tracking-wider shadow-soft disabled:opacity-50 transition-colors"
              >
                {loading ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <span>Send Reset Link</span>}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-primary-dark uppercase tracking-wider"
                >
                  <ChevronLeft className="w-4 h-4" /> Return to Login
                </Link>
              </div>
            </form>
          )}

        </div>
      </div>
      
    </div>
  );
}
