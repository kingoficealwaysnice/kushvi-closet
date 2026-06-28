"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, ArrowRight, Download, RefreshCcw, HelpCircle } from "lucide-react";
import ImageUploadZone from "@/components/ImageUploadZone";
import { Product } from "@/types";
import { toast } from "sonner";

interface TryOnPanelProps {
  product: Product;
  onSuccess?: (url: string) => void;
}

const PRESET_AVATARS = [
  {
    id: "preset-1",
    name: "Ananya",
    label: "Beige, Slender (5'6\")",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "preset-2",
    name: "Priya",
    label: "Cocoa, Curvy (5'4\")",
    url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "preset-3",
    name: "Meera",
    label: "Wheat, Petite (5'2\")",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80",
  },
];

export default function TryOnPanel({ product, onSuccess }: TryOnPanelProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectPreset = (url: string, id: string) => {
    setSelectedPreset(id);
    setCustomPhotoUrl(null); // Clear custom upload if preset is chosen
  };

  const handleCustomUpload = (url: string) => {
    setCustomPhotoUrl(url);
    setSelectedPreset(""); // Clear preset if custom photo is uploaded
  };

  const handleTryOn = async () => {
    let targetPersonImage = "";
    if (customPhotoUrl) {
      targetPersonImage = customPhotoUrl;
    } else if (selectedPreset) {
      const preset = PRESET_AVATARS.find((p) => p.id === selectedPreset);
      targetPersonImage = preset?.url || "";
    }

    if (!targetPersonImage) {
      toast.error("Please upload a photo or choose an AI avatar preset");
      return;
    }

    setLoading(true);
    setResultUrl(null);
    try {
      const response = await fetch("/api/try-on", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          garment_image_url: product.images?.[0] || "",
          person_image_url: targetPersonImage,
          category: product.category,
          fallback_image: product.ai_avatar_image, // Use custom catalog avatar as mock tryon result
        }),
      });

      const data = await response.json();
      if (data.output_url) {
        setResultUrl(data.output_url);
        if (onSuccess) onSuccess(data.output_url);
        toast.success("AI Fitting Complete! ✨ Look at you!");
      } else {
        throw new Error(data.error || "Virtual try-on generation failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate AI Try-On");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!resultUrl) return;
    try {
      const response = await fetch(resultUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kushvi-tryon-${product.id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Image download started!");
    } catch (err) {
      toast.error("Download failed. Try right clicking the image and saving.");
    }
  };

  return (
    <div className="border border-primary/20 bg-primary/5 rounded-card overflow-hidden transition-all duration-300 shadow-soft font-body">
      
      {/* Collapsible Panel Trigger Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-dark" />
          <div>
            <h3 className="font-heading italic text-lg font-bold text-text-primary">
              See it on you (AI Try-On)
            </h3>
            <p className="text-xs text-text-secondary">
              Try this outfit on an AI avatar or upload your photo
            </p>
          </div>
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-primary-dark border border-primary-dark/30 rounded-full px-3 py-1 bg-surface hover:bg-primary/10 transition-colors">
          {isOpen ? "Close Panel" : "Open Fitting Room"}
        </div>
      </button>

      {/* Expanded Body Panel */}
      {isOpen && (
        <div className="px-6 pb-6 border-t border-primary/10 bg-surface">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            
            {/* Left Column: Preset Avatars & Upload */}
            <div className="flex flex-col gap-6">
              
              {/* Presets Grid */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary mb-3">
                  1. Choose AI Avatar Preset
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {PRESET_AVATARS.map((avatar) => {
                    const active = selectedPreset === avatar.id;
                    return (
                      <button
                        key={avatar.id}
                        onClick={() => handleSelectPreset(avatar.url, avatar.id)}
                        className={`flex flex-col items-center bg-background border rounded-btn p-2 transition-all hover:border-primary-dark ${
                          active 
                            ? "border-primary-dark ring-2 ring-primary/20 scale-102 bg-primary/5" 
                            : "border-border"
                        }`}
                      >
                        <div className="relative w-12 h-12 rounded-full overflow-hidden mb-2 bg-secondary/20">
                          <Image
                            src={avatar.url}
                            alt={avatar.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-xs font-bold text-text-primary">{avatar.name}</span>
                        <span className="text-[9px] text-text-secondary text-center mt-0.5 leading-none">{avatar.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload Zone */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-text-primary mb-3">
                  OR Upload Your Photo
                </h4>
                <ImageUploadZone
                  onUploadComplete={handleCustomUpload}
                  previewUrl={customPhotoUrl}
                  onClear={() => setCustomPhotoUrl(null)}
                  bucket="user-uploads"
                />
              </div>

              {/* Action Trigger Button */}
              <button
                onClick={handleTryOn}
                disabled={loading || (!selectedPreset && !customPhotoUrl)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-dark text-text-primary hover:text-white font-semibold uppercase tracking-wider rounded-btn transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-soft"
              >
                {loading ? (
                  <>
                    <RefreshCcw className="w-4.5 h-4.5 animate-spin" />
                    <span>Styling Avatar...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Virtual Fit</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </div>

            {/* Right Column: Try-On Output Render Window */}
            <div className="flex flex-col items-center justify-center border border-border bg-background rounded-card p-6 min-h-[300px] relative overflow-hidden">
              
              {loading ? (
                // Loading Skeleton Screen
                <div className="flex flex-col items-center justify-center animate-pulse text-center w-full">
                  <div className="w-48 h-72 bg-border rounded-btn mb-4 relative flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary animate-bounce absolute" />
                  </div>
                  <p className="text-sm font-semibold text-text-primary mb-1">
                    AI Virtual Fitting Room Active
                  </p>
                  <p className="text-xs text-text-secondary max-w-[200px]">
                    Blending garment folds and lighting onto the model. Takes about 5-10 seconds...
                  </p>
                </div>
              ) : resultUrl ? (
                // Success output
                <div className="flex flex-col items-center w-full animate-fade-in">
                  <div className="relative w-48 h-72 rounded-btn shadow-md overflow-hidden bg-secondary/15">
                    <Image
                      src={resultUrl}
                      alt="AI Try-On Result"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex gap-3 mt-4 w-full justify-center">
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-4 py-2 bg-surface hover:bg-background border border-border rounded-btn text-xs font-semibold uppercase tracking-wider text-text-primary transition-colors shadow-soft"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    
                    <button
                      onClick={() => setResultUrl(null)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-surface hover:bg-background border border-border rounded-btn text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors shadow-soft"
                    >
                      <RefreshCcw className="w-3.5 h-3.5" /> Retake
                    </button>
                  </div>

                  <div className="mt-5 text-[10px] text-text-secondary flex items-center gap-1.5 leading-normal text-center bg-primary/5 rounded px-3 py-1.5 border border-primary/20 max-w-[250px]">
                    <HelpCircle className="w-4 h-4 text-primary-dark flex-shrink-0" />
                    <span>Garments are rendered on preset body parameters. Actual fit may vary.</span>
                  </div>
                </div>
              ) : (
                // Empty state initial window
                <div className="flex flex-col items-center justify-center text-center p-6 text-text-secondary">
                  <div className="w-16 h-16 rounded-full bg-border/40 flex items-center justify-center mb-4 border border-border">
                    <Sparkles className="w-6 h-6 text-text-secondary" />
                  </div>
                  <p className="text-sm font-semibold text-text-primary mb-1">
                    AI Mirror Window
                  </p>
                  <p className="text-xs max-w-[200px]">
                    Choose a preset avatar or upload your photo and click "Generate Virtual Fit" to see the output here!
                  </p>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
