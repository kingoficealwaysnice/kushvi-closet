"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/components/AppContext";
import { 
  Search, 
  Sparkles, 
  Heart, 
  ShoppingBag, 
  User as UserIcon, 
  Menu, 
  X, 
  LogOut, 
  ChevronDown,
  LayoutDashboard,
  ShoppingBag as AdminOrdersIcon,
  Sun,
  Moon
} from "lucide-react";
import Image from "next/image";

import { Suspense } from "react";
import { motion } from "framer-motion";
const MotionLink = motion(Link);

function NavbarContent() {
  const { user, role, cartCount, wishlistCount, logout, isPageLoading, theme, toggleTheme } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sync search input with URL search param
  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Listen to scroll to add background blur/shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/shop");
    }
  };

  return (
    <>
      {/* Top Pink Loading Bar */}
      {isPageLoading && (
        <div className="fixed top-0 left-0 right-0 h-[3px] bg-primary z-[9999] overflow-hidden">
          <div className="h-full bg-primary-dark loading-progress" />
        </div>
      )}

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass-container border-t-0 border-x-0 rounded-none shadow-soft py-3"
            : "bg-transparent py-5 border-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="relative w-10 h-10 transition-transform duration-500 ease-out group-hover:scale-105 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Kushvi Closet Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <span className="font-heading tracking-[0.2em] uppercase text-base font-bold text-text-primary group-hover:text-primary-dark transition-colors">
              Kushvi Closet
            </span>
          </Link>

          {/* Search Bar - Center (Desktop) */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex items-center flex-1 max-w-md relative glass-container rounded-input px-3 py-1.5 focus-within:border-primary transition-colors shadow-soft"
          >
            <input
              type="text"
              placeholder="Search trending styles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-0 outline-none text-sm text-text-primary placeholder:text-text-secondary"
            />
            <button type="submit" className="text-text-secondary hover:text-primary-dark transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Icons Grid (Right) */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            
            {/* Search toggler for mobile */}
            <Link 
              href="/shop" 
              className="md:hidden p-2 text-text-primary hover:text-primary-dark transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* AI Find */}
            <MotionLink
              href="/find-my-fit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 450, damping: 18 }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary-dark rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200"
              title="Find matching clothes using AI"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Find</span>
            </MotionLink>

            {/* Wishlist */}
            <MotionLink
              href="/wishlist"
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="p-2 text-text-primary hover:text-primary-dark transition-colors relative"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-dark text-white font-body font-bold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-background">
                  {wishlistCount}
                </span>
              )}
            </MotionLink>

            {/* Cart Bag */}
            <MotionLink
              href="/cart"
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="p-2 text-text-primary hover:text-primary-dark transition-colors relative"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-text-primary font-body font-bold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-background">
                  {cartCount}
                </span>
              )}
            </MotionLink>
 
            {/* Theme Toggle Switch */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.15, rotate: 15 }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 12 }}
              className="p-2 text-text-primary hover:text-primary-dark transition-all duration-300"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
            </motion.button>

            {/* Profile / Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1 p-1 hover:bg-border/30 rounded-full transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary text-primary-dark overflow-hidden flex items-center justify-center relative">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.full_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold uppercase">{user.full_name.charAt(0)}</span>
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-card shadow-soft py-2 z-50 animate-fade-in font-body">
                    <div className="px-4 py-2 border-b border-border text-xs text-text-secondary break-all">
                      Logged in as <strong className="text-text-primary block truncate">{user.full_name}</strong>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-background transition-colors"
                    >
                      <UserIcon className="w-4 h-4" /> My Profile
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-background transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" /> My Orders
                    </Link>

                    {/* Admin Dashboard Option */}
                    {role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-primary-dark font-medium hover:bg-background transition-colors border-t border-border"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-background transition-colors border-t border-border text-left"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 border border-primary hover:bg-primary/5 text-primary-dark rounded-btn text-xs font-semibold uppercase tracking-wider transition-all duration-200"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-text-primary hover:text-primary-dark transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>
      </header>

      {/* Spacer to avoid content being hidden under navbar */}
      <div className="h-16" />

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-text-primary/40 backdrop-blur-sm transition-opacity">
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-background border-l border-border shadow-soft p-6 flex flex-col justify-between z-50 animate-fade-in font-body">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-heading italic text-xl font-bold tracking-wide">
                  Kushvi Closet
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleTheme}
                    className="p-2 text-text-primary hover:text-primary-dark transition-all duration-300"
                    title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                  >
                    {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
                  </button>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 hover:bg-border/30 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-6 border border-border bg-surface rounded-input px-3 py-2">
                <input
                  type="text"
                  placeholder="Search styles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 outline-none text-sm placeholder:text-text-secondary"
                />
                <button type="submit" className="text-text-secondary">
                  <Search className="w-4 h-4" />
                </button>
              </form>

              <nav className="flex flex-col gap-4">
                <Link
                  href="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg text-text-primary hover:text-primary-dark transition-colors py-1 border-b border-border/55"
                >
                  Shop Catalog
                </Link>
                <Link
                  href="/find-my-fit"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg text-primary-dark font-medium hover:text-primary-dark transition-colors py-1 border-b border-border/55 flex items-center gap-2"
                >
                  <Sparkles className="w-4.5 h-4.5" /> AI Visual Search
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg text-text-primary hover:text-primary-dark transition-colors py-1 border-b border-border/55"
                >
                  My Wishlist
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg text-text-primary hover:text-primary-dark transition-colors py-1 border-b border-border/55"
                >
                  My Cart
                </Link>
                {user && (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg text-text-primary hover:text-primary-dark transition-colors py-1 border-b border-border/55"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg text-text-primary hover:text-primary-dark transition-colors py-1 border-b border-border/55"
                    >
                      My Orders
                    </Link>
                    {role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-lg text-primary-dark hover:text-primary-dark transition-colors py-1 border-b border-border/55 font-bold"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                  </>
                )}
              </nav>
            </div>

            <div>
              {user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-error hover:bg-error/5 text-error rounded-btn text-sm font-semibold uppercase tracking-wider transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-sm font-semibold uppercase tracking-wider transition-colors"
                >
                  <UserIcon className="w-4 h-4" /> Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={
      <div className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <span className="font-heading italic text-2xl font-bold tracking-wide text-text-primary">
          Kushvi Closet
        </span>
        <div className="w-32 h-8 bg-border/40 rounded-btn animate-pulse" />
      </div>
    }>
      <NavbarContent />
    </Suspense>
  );
}
