"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductForm from "@/components/ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewProductPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 animate-fade-in font-body">
        
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary-dark uppercase tracking-wider mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Products List
        </Link>

        <ProductForm />
      </main>
      <Footer />
    </>
  );
}
