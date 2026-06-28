import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Send, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-11 h-11 transition-transform duration-500 ease-out group-hover:scale-105 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Kushvi Closet Logo"
                  width={44}
                  height={44}
                  className="object-contain"
                />
              </div>
              <span className="font-heading tracking-[0.2em] uppercase text-base font-bold text-text-primary group-hover:text-primary-dark transition-colors">
                Kushvi Closet
              </span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed">
              Pinterest-inspired, premium fashion collections delivered to your doorstep. Try garments on you using our virtual AI model avatars and order in 2 clicks.
            </p>
            <div className="flex items-center gap-3">
              <a 
                href="https://instagram.com/kushvi_closet_placeholder" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-background hover:bg-primary/20 text-text-primary hover:text-primary-dark border border-border flex items-center justify-center transition-colors"
                title="Follow us on Instagram"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>

          {/* Catalog Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-text-primary mb-4">
              Shop Collections
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-text-secondary">
              <li>
                <Link href="/shop?category=dresses" className="hover:text-primary-dark transition-colors">
                  Dresses
                </Link>
              </li>
              <li>
                <Link href="/shop?category=tops" className="hover:text-primary-dark transition-colors">
                  Tops
                </Link>
              </li>
              <li>
                <Link href="/shop?category=co-ords" className="hover:text-primary-dark transition-colors">
                  Co-ords
                </Link>
              </li>
              <li>
                <Link href="/shop?category=ethnic" className="hover:text-primary-dark transition-colors">
                  Ethnic wear
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories" className="hover:text-primary-dark transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Help */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-text-primary mb-4">
              Customer Support
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-text-secondary">
              <li>
                <Link href="/orders" className="hover:text-primary-dark transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-primary-dark transition-colors">
                  Delivery Address
                </Link>
              </li>
              <li>
                <span className="block cursor-pointer hover:text-primary-dark transition-colors">
                  Refund & Return Policy
                </span>
              </li>
              <li>
                <span className="block cursor-pointer hover:text-primary-dark transition-colors">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-text-primary mb-4">
              Get 10% Off Your First Order
            </h4>
            <p className="text-text-secondary text-sm mb-4">
              Join our list to receive exclusive offers, new drop alerts, and Pinterest trend updates.
            </p>
            <div className="flex items-center gap-1 bg-background border border-border rounded-input px-3 py-1.5 focus-within:border-primary transition-colors">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-transparent border-0 outline-none text-sm placeholder:text-text-secondary"
              />
              <button className="text-primary-dark hover:text-primary-dark/80 transition-colors p-1" title="Subscribe">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright block */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
          <p>
            &copy; {new Date().getFullYear()} Kushvi Closet. All rights reserved. Sourced under dropshipping fulfillment.
          </p>
          <p className="flex items-center gap-1.5 font-medium text-text-primary">
            Made with <Heart className="w-3.5 h-3.5 text-primary-dark fill-primary" /> in India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
