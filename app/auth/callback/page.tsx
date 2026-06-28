"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { RefreshCw } from "lucide-react";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirectPath = searchParams.get("redirect") || "/";
    let isRedirecting = false;

    const performRedirect = async (sessionUser: any) => {
      if (isRedirecting) return;
      isRedirecting = true;
      
      console.log("Auth callback: session established for user:", sessionUser.email);
      
      try {
        // Fetch user profile from database to determine role
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", sessionUser.id)
          .single();

        const role = (!error && data?.role) ? data.role : "customer";
        
        // Write cookies
        document.cookie = `kushvi_user_id=${sessionUser.id}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `kushvi_user_role=${role}; path=/; max-age=604800; SameSite=Lax`;
        
        console.log(`Auth callback: sync cookies set (role: ${role}). Redirecting to: ${redirectPath}`);
      } catch (err) {
        console.error("Auth callback cookie sync error:", err);
        document.cookie = `kushvi_user_id=${sessionUser.id}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `kushvi_user_role=customer; path=/; max-age=604800; SameSite=Lax`;
      } finally {
        // Use window.location.href for robust top-level reload to let middleware capture cookies
        window.location.href = redirectPath;
      }
    };

    // 1. Reactive listener to capture session immediately as soon as SDK exchanges code
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth callback state changed:", event, session?.user ? "User active" : "No user");
      if (session?.user) {
        await performRedirect(session.user);
      }
    });

    // 2. Direct session check on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        performRedirect(session.user);
      }
    });

    // 3. Safety fallback timeout (5 seconds)
    const safetyTimeout = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.user && !isRedirecting) {
          console.warn("Auth callback timed out without session. Returning to login.");
          window.location.href = `/login?redirect=${encodeURIComponent(redirectPath)}`;
        }
      });
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-sm">
        <div className="relative flex justify-center">
          {/* Pulsing luxurious ambient background glow */}
          <div className="absolute inset-0 -m-6 bg-primary/10 rounded-full blur-xl animate-pulse" />
          <div className="relative w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center bg-surface shadow-soft">
            <RefreshCw className="w-6 h-6 animate-spin text-primary-dark" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="font-heading tracking-widest text-lg uppercase font-bold text-text-primary">
            Maison Kushvi
          </h2>
          <p className="text-xs text-text-secondary font-medium tracking-wide">
            Finalizing your secure login and styling profile...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
