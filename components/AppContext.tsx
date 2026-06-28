"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, CartItem, WishlistItem, Product } from "@/types";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";

interface AppContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  cart: CartItem[];
  wishlist: WishlistItem[];
  cartCount: number;
  wishlistCount: number;
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  addToCart: (productId: string, size: string, color: string, qty: number) => Promise<boolean>;
  removeFromCart: (cartId: string) => Promise<boolean>;
  updateCartQty: (cartId: string, qty: number) => Promise<boolean>;
  toggleWishlist: (productId: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isPageLoading: boolean;
  setIsPageLoading: (val: boolean) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [useLocalCartFallback, setUseLocalCartFallback] = useState(false);
  const [useLocalWishlistFallback, setUseLocalWishlistFallback] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const router = useRouter();
  const pathname = usePathname();

  // Load theme from localStorage or system preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("kushvi_theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        setTheme("dark");
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("kushvi_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Route change progress bar trigger
  useEffect(() => {
    setIsPageLoading(true);
    const t = setTimeout(() => setIsPageLoading(false), 500);
    return () => clearTimeout(t);
  }, [pathname]);

  // Auth state listener
  useEffect(() => {
    const fetchProfile = async (userId: string, sessionUser?: any) => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
          if (sessionUser) {
            console.log("Using Supabase session metadata as fallback user profile.");
            const fallbackUser: User = {
              id: sessionUser.id,
              email: sessionUser.email || "",
              full_name: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || "Valued Customer",
              avatar_url: sessionUser.user_metadata?.avatar_url || null,
              role: "customer",
              phone: sessionUser.phone || null,
              created_at: sessionUser.created_at || new Date().toISOString()
            };
            setUser(fallbackUser);
            setRole("customer");
            
            // Set cookies for middleware validation
            if (typeof window !== "undefined") {
              document.cookie = `kushvi_user_id=${fallbackUser.id}; path=/; max-age=604800; SameSite=Lax`;
              document.cookie = `kushvi_user_role=customer; path=/; max-age=604800; SameSite=Lax`;
            }
          } else {
            setUser(null);
            setRole(null);
          }
        } else {
          setUser(data as User);
          setRole(data.role);
          // Set cookies for middleware validation
          if (typeof window !== "undefined") {
            document.cookie = `kushvi_user_id=${data.id}; path=/; max-age=604800; SameSite=Lax`;
            document.cookie = `kushvi_user_role=${data.role}; path=/; max-age=604800; SameSite=Lax`;
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Check if there is a mock user session in localStorage
    const mockUserStr = typeof window !== "undefined" ? localStorage.getItem("kushvi_mock_user") : null;
    if (mockUserStr) {
      try {
        const mockUser = JSON.parse(mockUserStr) as User;
        setUser(mockUser);
        setRole(mockUser.role);
        setLoading(false);
        // Set cookies for mock user
        if (typeof window !== "undefined") {
          document.cookie = `kushvi_user_id=${mockUser.id}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `kushvi_user_role=${mockUser.role}; path=/; max-age=604800; SameSite=Lax`;
        }
        return;
      } catch (e) {
        // Fall through
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id, session.user);
      } else {
        setUser(null);
        setRole(null);
        setCart([]);
        setWishlist([]);
        setLoading(false);
        // Clear cookies
        if (typeof window !== "undefined") {
          document.cookie = "kushvi_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie = "kushvi_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
      }
    });

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user);
      } else {
        setLoading(false);
        // Clear cookies if no session (only if mock user doesn't exist either)
        const mockUserStr = typeof window !== "undefined" ? localStorage.getItem("kushvi_mock_user") : null;
        if (!mockUserStr && typeof window !== "undefined") {
          document.cookie = "kushvi_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie = "kushvi_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch cart & wishlist on user login
  useEffect(() => {
    if (user) {
      refreshCart();
      refreshWishlist();
    }
  }, [user]);

  const refreshCart = async () => {
    if (!user) return;
    
    // Mock user cart fallback or local storage fallback active
    if (user.id.startsWith("mock-") || useLocalCartFallback) {
      const stored = localStorage.getItem(`cart_${user.id}`);
      if (stored) {
        setCart(JSON.parse(stored));
      } else {
        setCart([]);
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from("cart")
        .select(`
          *,
          product:products(*)
        `)
        .eq("user_id", user.id);

      if (error) {
        if (error.code === "PGRST205" || error.message?.includes("Could not find the table")) {
          console.warn("Cart table not found in schema. Switching to localStorage fallback.");
          setUseLocalCartFallback(true);
          const stored = localStorage.getItem(`cart_${user.id}`);
          setCart(stored ? JSON.parse(stored) : []);
        } else {
          console.error("Error refreshing cart:", error);
        }
      } else if (data) {
        setCart(data as unknown as CartItem[]);
      }
    } catch (err) {
      console.error("Error refreshing cart:", err);
    }
  };

  const refreshWishlist = async () => {
    if (!user) return;

    // Mock user wishlist fallback or local storage fallback active
    if (user.id.startsWith("mock-") || useLocalWishlistFallback) {
      const stored = localStorage.getItem(`wishlist_${user.id}`);
      if (stored) {
        setWishlist(JSON.parse(stored));
      } else {
        setWishlist([]);
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from("wishlist")
        .select(`
          *,
          product:products(*)
        `)
        .eq("user_id", user.id);

      if (error) {
        if (error.code === "PGRST205" || error.message?.includes("Could not find the table")) {
          console.warn("Wishlist table not found in schema. Switching to localStorage fallback.");
          setUseLocalWishlistFallback(true);
          const stored = localStorage.getItem(`wishlist_${user.id}`);
          setWishlist(stored ? JSON.parse(stored) : []);
        } else {
          console.error("Error refreshing wishlist:", error);
        }
      } else if (data) {
        setWishlist(data as unknown as WishlistItem[]);
      }
    } catch (err) {
      console.error("Error refreshing wishlist:", err);
    }
  };

  const addToCart = async (productId: string, size: string, color: string, qty: number): Promise<boolean> => {
    if (!user) {
      toast.error("Please login to save your cart!", {
        action: {
          label: "Login",
          onClick: () => router.push("/login"),
        },
      });
      return false;
    }

    // Mock User or local storage fallback active
    if (user.id.startsWith("mock-") || useLocalCartFallback) {
      const existingIdx = cart.findIndex(
        (item) => item.product_id === productId && item.size === size && item.color === color
      );

      let nextCart = [...cart];

      if (existingIdx > -1) {
        nextCart[existingIdx].quantity += qty;
      } else {
        // Fetch product info from mock catalog
        const { MOCK_PRODUCTS } = require("@/lib/mock-data");
        const matchedProduct = MOCK_PRODUCTS.find((p: any) => p.id === productId);
        
        const newItem: CartItem = {
          id: Math.random().toString(),
          user_id: user.id,
          product_id: productId,
          size,
          color,
          quantity: qty,
          created_at: new Date().toISOString(),
          product: matchedProduct
        };
        nextCart.push(newItem);
      }

      localStorage.setItem(`cart_${user.id}`, JSON.stringify(nextCart));
      setCart(nextCart);
      toast.success("Added to cart! ✨");
      return true;
    }

    try {
      // Check existing item in cart
      const existing = cart.find(
        (item) =>
          item.product_id === productId &&
          item.size === size &&
          item.color === color
      );

      if (existing) {
        const { error } = await supabase
          .from("cart")
          .update({ quantity: existing.quantity + qty })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("cart").insert({
          user_id: user.id,
          product_id: productId,
          size,
          color,
          quantity: qty,
        });

        if (error) throw error;
      }

      toast.success("Added to cart! ✨");
      await refreshCart();
      return true;
    } catch (err: any) {
      if (err.code === "PGRST205" || err.message?.includes("Could not find the table")) {
        console.warn("Cart table not found, executing local fallback addToCart");
        setUseLocalCartFallback(true);
        
        const existingIdx = cart.findIndex(
          (item) => item.product_id === productId && item.size === size && item.color === color
        );
        let nextCart = [...cart];
        if (existingIdx > -1) {
          nextCart[existingIdx].quantity += qty;
        } else {
          const { MOCK_PRODUCTS } = require("@/lib/mock-data");
          const matchedProduct = MOCK_PRODUCTS.find((p: any) => p.id === productId);
          const newItem: CartItem = {
            id: Math.random().toString(),
            user_id: user.id,
            product_id: productId,
            size,
            color,
            quantity: qty,
            created_at: new Date().toISOString(),
            product: matchedProduct
          };
          nextCart.push(newItem);
        }
        localStorage.setItem(`cart_${user.id}`, JSON.stringify(nextCart));
        setCart(nextCart);
        toast.success("Added to cart! ✨");
        return true;
      }
      toast.error(err.message || "Could not add to cart");
      return false;
    }
  };

  const removeFromCart = async (cartId: string): Promise<boolean> => {
    if (!user) return false;

    if (user.id.startsWith("mock-") || useLocalCartFallback) {
      const nextCart = cart.filter((item) => item.id !== cartId);
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(nextCart));
      setCart(nextCart);
      toast.success("Removed from cart");
      return true;
    }

    try {
      const { error } = await supabase.from("cart").delete().eq("id", cartId);
      if (error) throw error;

      toast.success("Removed from cart");
      setCart((prev) => prev.filter((item) => item.id !== cartId));
      return true;
    } catch (err: any) {
      if (err.code === "PGRST205" || err.message?.includes("Could not find the table")) {
        setUseLocalCartFallback(true);
        const nextCart = cart.filter((item) => item.id !== cartId);
        localStorage.setItem(`cart_${user.id}`, JSON.stringify(nextCart));
        setCart(nextCart);
        toast.success("Removed from cart");
        return true;
      }
      toast.error(err.message || "Failed to remove item");
      return false;
    }
  };

  const updateCartQty = async (cartId: string, qty: number): Promise<boolean> => {
    if (qty <= 0) return removeFromCart(cartId);
    if (!user) return false;

    if (user.id.startsWith("mock-") || useLocalCartFallback) {
      const nextCart = cart.map((item) => (item.id === cartId ? { ...item, quantity: qty } : item));
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(nextCart));
      setCart(nextCart);
      return true;
    }

    try {
      const { error } = await supabase
        .from("cart")
        .update({ quantity: qty })
        .eq("id", cartId);

      if (error) throw error;
      setCart((prev) =>
        prev.map((item) => (item.id === cartId ? { ...item, quantity: qty } : item))
      );
      return true;
    } catch (err: any) {
      if (err.code === "PGRST205" || err.message?.includes("Could not find the table")) {
        setUseLocalCartFallback(true);
        const nextCart = cart.map((item) => (item.id === cartId ? { ...item, quantity: qty } : item));
        localStorage.setItem(`cart_${user.id}`, JSON.stringify(nextCart));
        setCart(nextCart);
        return true;
      }
      toast.error(err.message || "Failed to update quantity");
      return false;
    }
  };

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    if (!user) {
      toast.error("Please login to save your wishlist!", {
        action: {
          label: "Login",
          onClick: () => router.push("/login"),
        },
      });
      return false;
    }

    const isWishlisted = wishlist.some((item) => item.product_id === productId);

    // Mock Wishlist Toggle or local storage fallback active
    if (user.id.startsWith("mock-") || useLocalWishlistFallback) {
      let nextWishlist = [...wishlist];
      if (isWishlisted) {
        nextWishlist = nextWishlist.filter((item) => item.product_id !== productId);
        toast.success("Removed from wishlist");
      } else {
        const { MOCK_PRODUCTS } = require("@/lib/mock-data");
        const matchedProduct = MOCK_PRODUCTS.find((p: any) => p.id === productId);

        const newItem: WishlistItem = {
          id: Math.random().toString(),
          user_id: user.id,
          product_id: productId,
          created_at: new Date().toISOString(),
          product: matchedProduct
        };
        nextWishlist.push(newItem);
        toast.success("Added to wishlist! ❤️");
      }
      localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(nextWishlist));
      setWishlist(nextWishlist);
      return true;
    }

    try {
      if (isWishlisted) {
        // Optimistic UI update
        const itemToRemove = wishlist.find((item) => item.product_id === productId);
        setWishlist((prev) => prev.filter((item) => item.product_id !== productId));

        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);

        if (error) {
          if (error.code === "PGRST205" || error.message?.includes("Could not find the table")) {
            setUseLocalWishlistFallback(true);
            const nextWishlist = wishlist.filter((item) => item.product_id !== productId);
            localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(nextWishlist));
            setWishlist(nextWishlist);
            toast.success("Removed from wishlist");
            return true;
          }
          // Rollback
          if (itemToRemove) setWishlist((prev) => [...prev, itemToRemove]);
          throw error;
        }
        toast.success("Removed from wishlist");
      } else {
        // Optimistic UI update
        const tempId = Math.random().toString();
        const newItem: WishlistItem = {
          id: tempId,
          user_id: user.id,
          product_id: productId,
          created_at: new Date().toISOString(),
        };
        setWishlist((prev) => [...prev, newItem]);

        const { error, data } = await supabase
          .from("wishlist")
          .insert({
            user_id: user.id,
            product_id: productId,
          })
          .select()
          .single();

        if (error) {
          setWishlist((prev) => prev.filter((item) => item.id !== tempId));
          
          if (error.code === "PGRST205" || error.message?.includes("Could not find the table")) {
            setUseLocalWishlistFallback(true);
            
            const { MOCK_PRODUCTS } = require("@/lib/mock-data");
            const matchedProduct = MOCK_PRODUCTS.find((p: any) => p.id === productId);
            const fallbackItem: WishlistItem = {
              id: Math.random().toString(),
              user_id: user.id,
              product_id: productId,
              created_at: new Date().toISOString(),
              product: matchedProduct
            };
            const nextWishlist = [...wishlist, fallbackItem];
            localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(nextWishlist));
            setWishlist(nextWishlist);
            toast.success("Added to wishlist! ❤️");
            return true;
          }
          throw error;
        }

        toast.success("Added to wishlist! ❤️");
        await refreshWishlist(); // Sync with actual db ID
      }
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to update wishlist");
      return false;
    }
  };

  const logout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("kushvi_mock_user");
      document.cookie = "kushvi_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "kushvi_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setCart([]);
    setWishlist([]);
    toast.success("Logged out successfully");
    router.push("/");
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <AppContext.Provider
      value={{
        user,
        role,
        loading,
        cart,
        wishlist,
        cartCount,
        wishlistCount,
        refreshCart,
        refreshWishlist,
        addToCart,
        removeFromCart,
        updateCartQty,
        toggleWishlist,
        logout,
        isPageLoading,
        setIsPageLoading,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
