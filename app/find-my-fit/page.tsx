"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageUploadZone from "@/components/ImageUploadZone";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { Sparkles, Camera, Link as LinkIcon, RefreshCw, AlertCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface ScoredProduct extends Product {
  similarity_score: number;
}

export default function FindMyFit() {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScoredProduct[]>([]);
  const [isMocked, setIsMocked] = useState(false);

  const handleUploadComplete = async (url: string) => {
    setUploadedUrl(url);
    await triggerSearch(url);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    if (!inputUrl.startsWith("http://") && !inputUrl.startsWith("https://")) {
      toast.error("Please enter a valid HTTP or HTTPS image URL");
      return;
    }

    setUploadedUrl(inputUrl);
    setInputUrl("");
    await triggerSearch(inputUrl);
  };

  const triggerSearch = async (imageUrl: string) => {
    setLoading(true);
    setResults([]);
    try {
      const response = await fetch("/api/visual-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_url: imageUrl }),
      });

      const data = await response.json();
      if (data.results) {
        setResults(data.results);
        setIsMocked(data.is_mocked);
        toast.success(`Found ${data.results.length} matches! ✨`);
      } else {
        throw new Error(data.error || "Visual search failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to perform visual search");
      setUploadedUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUploadedUrl(null);
    setResults([]);
    setIsMocked(false);
  };

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-body flex-1">
        
        {/* Header Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Camera className="w-5 h-5 text-primary-dark" />
          </div>
          <h1 className="font-heading italic text-3xl sm:text-4xl text-text-primary mb-4 leading-tight">
            Find What You Saw on Pinterest
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed">
            Upload any outfit inspiration screenshot, crop, or style image. Our Google Vision AI extracts style metrics and matches it against our local catalog in seconds.
          </p>
        </div>

        {/* Upload Block */}
        {!uploadedUrl ? (
          <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-surface border border-border rounded-card p-6 shadow-soft">
              
              <ImageUploadZone
                onUploadComplete={handleUploadComplete}
                bucket="user-uploads"
                className="h-56"
              />

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-surface px-3 text-text-secondary font-semibold">
                    Or paste Image URL
                  </span>
                </div>
              </div>

              {/* URL paste input */}
              <form onSubmit={handleUrlSubmit} className="flex gap-2">
                <div className="relative flex-1 bg-background border border-border rounded-input px-3 py-2.5 flex items-center focus-within:border-primary">
                  <LinkIcon className="w-4 h-4 text-text-secondary mr-2" />
                  <input
                    type="text"
                    placeholder="https://pinterest.com/pin/example.jpg"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="bg-transparent border-0 outline-none w-full text-xs text-text-primary placeholder:text-text-secondary"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-semibold uppercase tracking-wider transition-colors shadow-soft"
                >
                  Analyze
                </button>
              </form>

            </div>
          </div>
        ) : (
          // Analysis details & output results grid
          <div className="space-y-12 animate-fade-in">
            
            <div className="flex flex-col md:flex-row gap-8 items-center justify-center bg-surface border border-border rounded-card p-6 max-w-2xl mx-auto shadow-soft">
              {/* Image source thumbnail */}
              <div className="relative w-36 h-48 bg-secondary/10 border border-border rounded-btn overflow-hidden flex-shrink-0">
                <Image
                  src={uploadedUrl}
                  alt="Inspiration Source"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="text-center md:text-left space-y-4">
                <div>
                  <h3 className="font-heading italic text-xl font-bold text-text-primary">
                    Search Active
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Matching Google Vision tags against our catalog database.
                  </p>
                </div>
                
                <button
                  onClick={handleReset}
                  className="px-5 py-2 border border-border hover:bg-background rounded-btn text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors"
                >
                  Search Another Fit
                </button>

                {isMocked && (
                  <div className="flex items-center gap-1.5 text-[9px] text-primary-dark leading-normal bg-primary/10 border border-primary/20 rounded px-2.5 py-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Visual Search running on simulation bypass (Google Vision API key missing)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Results Grid */}
            <div>
              {loading ? (
                // Loading Stepper
                <div className="flex flex-col items-center justify-center py-20">
                  <RefreshCw className="w-10 h-10 animate-spin text-primary-dark mb-4" />
                  <p className="font-semibold text-sm text-text-primary mb-1">Analyzing Visual Features...</p>
                  <p className="text-xs text-text-secondary">Extracting texture, shades, and outline cuts from the image.</p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-8">
                  <h2 className="font-heading italic text-2xl sm:text-3xl text-text-primary text-center">
                    We found these for you ✨
                  </h2>
                  
                  {/* Pinterest Masonry Layout for Results */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {results.map((product) => (
                      <div key={product.id} className="relative">
                        
                        {/* Similarity Score Badge overlay */}
                        <div className="absolute top-2.5 left-2.5 bg-accent/95 backdrop-blur-sm text-text-primary px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border border-accent/25 z-10 shadow-sm flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-primary-dark fill-primary" />
                          <span>{product.similarity_score}% Match</span>
                        </div>

                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Empty search results
                <div className="text-center py-16">
                  <p className="text-text-secondary text-sm">No matching styles found in our current catalog. try another photo.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      <Footer />
    </>
  );
}
