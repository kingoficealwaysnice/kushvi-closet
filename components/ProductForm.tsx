"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Product, ColorOption, ProductCategory } from "@/types";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  Upload, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Sparkles, 
  RefreshCw, 
  X, 
  ChevronLeft 
} from "lucide-react";

interface ProductFormProps {
  productId?: string; // If provided, we are in Edit mode
}

const CATEGORIES: ProductCategory[] = ["tops", "dresses", "co-ords", "bottoms", "ethnic", "accessories"];
const SIZES = ["XS", "S", "M", "L", "XL"];

// Mock Vendors for list assignment
const MOCK_VENDORS = [
  { id: "vend-1", shop_name: "Gilded Weaves India" },
  { id: "vend-2", shop_name: "Pastel Couture Labs" },
  { id: "vend-3", shop_name: "Boho Drapes Delhi" }
];

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const isEditMode = !!productId;

  // Form states
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState<ProductCategory>("tops");
  const [stockCount, setStockCount] = useState("10");
  const [vendorId, setVendorId] = useState("vend-1");

  // Arrays/JSON
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L"]);
  const [colors, setColors] = useState<ColorOption[]>([{ name: "Blush", hex: "#F2A7BB" }]);
  const [colorNameInput, setColorNameInput] = useState("");
  const [colorHexInput, setColorHexInput] = useState("#F2A7BB");

  // Product images (up to 6)
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImageIdx, setUploadingImageIdx] = useState<number | null>(null);

  // AI Avatar Garment Try-On
  const [aiAvatarImage, setAiAvatarImage] = useState<string | null>(null);
  const [generatingAvatar, setGeneratingAvatar] = useState(false);
  const [avatarGarmentUrl, setAvatarGarmentUrl] = useState<string | null>(null);

  // Status flags
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [pinterestInspired, setPinterestInspired] = useState(false);

  // Fetch product if in Edit Mode
  useEffect(() => {
    if (isEditMode && productId) {
      const fetchProduct = async () => {
        setFetching(true);
        try {
          const res = await fetch(`/api/products/${productId}`);
          if (!res.ok) throw new Error("Garment not found");
          const prod = (await res.json()) as Product;

          setName(prod.name);
          setDescription(prod.description || "");
          setPrice(prod.price.toString());
          setOriginalPrice(prod.original_price?.toString() || "");
          setCategory(prod.category);
          setStockCount(prod.stock_count.toString());
          setVendorId(prod.vendor_id || "vend-1");
          setTags(prod.tags || []);
          setSizes(prod.sizes || []);
          setColors(prod.colors || []);
          setImages(prod.images || []);
          setAiAvatarImage(prod.ai_avatar_image);
          setIsActive(prod.is_active);
          setIsFeatured(prod.is_featured);
          setPinterestInspired(prod.pinterest_inspired);
        } catch (err: any) {
          toast.error(err.message || "Failed to load product details");
          router.push("/admin/products");
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [isEditMode, productId]);

  // Handle uploading individual image slots
  const handleImageUploadSlot = async (e: React.ChangeEvent<HTMLInputElement>, slotIdx: number) => {
    if (!e.target.files || e.target.files[0] === null) return;
    const file = e.target.files[0];

    setUploadingImageIdx(slotIdx);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "product-images");

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.url) {
        setImages((prev) => {
          const next = [...prev];
          next[slotIdx] = data.url;
          return next;
        });
        toast.success(`Image ${slotIdx + 1} uploaded!`);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploadingImageIdx(null);
    }
  };

  // Delete image from list
  const handleDeleteImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Reordering controls
  const handleMoveImage = (idx: number, direction: "left" | "right") => {
    const nextIdx = direction === "left" ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= images.length) return;

    setImages((prev) => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[nextIdx];
      next[nextIdx] = temp;
      return next;
    });
  };

  // Size toggling
  const handleSizeToggle = (size: string) => {
    if (sizes.includes(size)) {
      setSizes((prev) => prev.filter((s) => s !== size));
    } else {
      setSizes((prev) => [...prev, size]);
    }
  };

  // Color options managers
  const handleAddColor = () => {
    if (!colorNameInput.trim()) {
      toast.error("Please enter a color name");
      return;
    }
    const colorObj: ColorOption = {
      name: colorNameInput.trim(),
      hex: colorHexInput,
    };
    setColors((prev) => [...prev, colorObj]);
    setColorNameInput("");
  };

  const handleRemoveColor = (name: string) => {
    setColors((prev) => prev.filter((c) => c.name !== name));
  };

  // Tags list chips builders
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim().toLowerCase())) {
        setTags((prev) => [...prev, tagInput.trim().toLowerCase()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  // AI Avatar Garment Fitting generator
  const handleAvatarGarmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files[0] === null) return;
    const file = e.target.files[0];
    
    setGeneratingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "product-images");

      const uploadRes = await fetch("/api/upload-image", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();

      if (uploadData.url) {
        setAvatarGarmentUrl(uploadData.url);
        
        // Call try-on generator using preset avatar model url
        // Preset model: Aisha Patel (preset-1 equivalent / standard slender model)
        const tryRes = await fetch("/api/try-on", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            garment_image_url: uploadData.url,
            person_image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800",
            category,
          }),
        });
        const tryData = await tryRes.json();

        if (tryData.output_url) {
          setAiAvatarImage(tryData.output_url);
          toast.success("AI avatar clothing generated successfully! ✨");
        } else {
          throw new Error(tryData.error);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate AI garment avatar");
    } finally {
      setGeneratingAvatar(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error("Please upload at least 1 image for the product cover photo");
      return;
    }

    if (sizes.length === 0) {
      toast.error("Please choose at least 1 size");
      return;
    }

    setLoading(true);

    const productData = {
      name,
      description: description.trim() || null,
      price: parseFloat(price),
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      category,
      tags,
      sizes,
      colors,
      images,
      ai_avatar_image: aiAvatarImage,
      stock_count: parseInt(stockCount),
      vendor_id: vendorId,
      is_active: isActive,
      is_featured: isFeatured,
      pinterest_inspired: pinterestInspired,
    };

    try {
      const url = isEditMode ? `/api/products/${productId}` : "/api/products";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isEditMode ? "Garment updated successfully! ✨" : "New garment added successfully! ✨");
        router.push("/admin/products");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save product catalog entity");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8 font-body max-w-4xl mx-auto">
      
      {/* Title / Save actions header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h2 className="font-heading italic text-2xl font-bold text-text-primary">
            {isEditMode ? "Edit Garment details" : "Add New Garment to Catalog"}
          </h2>
          <p className="text-text-secondary text-xs mt-1">Configure layout imagery, sizes, color tags and try-on properties.</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-5 py-2 border border-border hover:bg-background rounded-btn text-xs font-semibold uppercase tracking-wider text-text-secondary"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-soft"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
            <span>{isEditMode ? "Update Garment" : "Publish Garment"}</span>
          </button>
        </div>
      </div>

      {/* Main grids */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column details (8 cols) */}
        <div className="md:col-span-8 space-y-6">
          
          {/* General details */}
          <div className="bg-surface border border-border rounded-card p-6 shadow-soft space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border pb-2.5">
              General Info
            </h3>

            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">Garment Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sage Meadows Linen Co-ord"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-border bg-background rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">Garment Description</label>
              <textarea
                placeholder="Write sizing details, wash instructions, fabric texture..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full border border-border bg-background rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full border border-border bg-background rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary uppercase font-bold tracking-wider cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">Dropship Vendor Assignment</label>
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="w-full border border-border bg-background rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary cursor-pointer font-medium"
                >
                  {MOCK_VENDORS.map((v) => (
                    <option key={v.id} value={v.id}>{v.shop_name}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* Pricing & Stock */}
          <div className="bg-surface border border-border rounded-card p-6 shadow-soft space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border pb-2.5">
              Price & Stock details
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">Selling Price (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="1899"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-border bg-background rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">Original Price / MRP (₹)</label>
                <input
                  type="number"
                  placeholder="2499"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="w-full border border-border bg-background rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1.5">In-Stock Count</label>
                <input
                  type="number"
                  required
                  placeholder="10"
                  value={stockCount}
                  onChange={(e) => setStockCount(e.target.value)}
                  className="w-full border border-border bg-background rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary"
                />
              </div>
            </div>
          </div>

          {/* Images Upload slot manager (Up to 6) */}
          <div className="bg-surface border border-border rounded-card p-6 shadow-soft space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border pb-2.5">
              Garment Images Gallery (Up to 6)
            </h3>
            
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {[...Array(6)].map((_, idx) => {
                const imgUrl = images[idx];
                const isUploading = uploadingImageIdx === idx;
                return (
                  <div key={idx} className="relative aspect-[3/4] bg-background border border-border rounded-btn overflow-hidden group flex flex-col items-center justify-center">
                    
                    {imgUrl ? (
                      <>
                        <Image
                          src={imgUrl}
                          alt={`Garment slot ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-text-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5 z-10">
                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(idx)}
                            className="bg-surface/90 hover:bg-surface text-error rounded-full p-1 self-end"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Reordering indicators */}
                          <div className="flex justify-between w-full">
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, "left")}
                              disabled={idx === 0}
                              className="bg-surface/90 text-text-primary hover:text-primary-dark p-1 rounded-full disabled:opacity-40"
                              title="Move Left"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, "right")}
                              disabled={idx === images.length - 1}
                              className="bg-surface/90 text-text-primary hover:text-primary-dark p-1 rounded-full disabled:opacity-40"
                              title="Move Right"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Add image upload slot
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-2 text-center text-text-secondary hover:text-primary-dark">
                        {isUploading ? (
                          <RefreshCw className="w-5 h-5 animate-spin text-primary-dark" />
                        ) : (
                          <>
                            <Upload className="w-5 h-5 mb-1 text-text-secondary" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Slot {idx + 1}</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploading}
                          onChange={(e) => handleImageUploadSlot(e, idx)}
                          className="hidden"
                        />
                      </label>
                    )}

                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-text-secondary">
              Slot 1 is treated as the cover image. Hover on uploaded images to reorder or remove slots.
            </p>
          </div>

        </div>

        {/* Right Column details (4 cols) */}
        <div className="md:col-span-4 space-y-6">
          
          {/* AI Avatar generator slot */}
          <div className="bg-surface border border-border rounded-card p-6 shadow-soft space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border pb-2.5">
              AI Avatar Garment Generator
            </h3>

            {aiAvatarImage ? (
              <div className="relative aspect-[3/4] bg-background border border-border rounded-btn overflow-hidden flex flex-col items-center justify-center">
                <Image
                  src={aiAvatarImage}
                  alt="AI Avatar preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setAiAvatarImage(null)}
                  className="absolute top-2 right-2 bg-surface hover:bg-background border border-border p-1.5 rounded-full text-error shadow-sm z-10"
                  title="Remove AI Avatar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-btn p-6 text-center">
                <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-5 h-5 text-primary-dark" />
                </div>
                <h4 className="text-xs font-bold text-text-primary mb-1">Generate Outfit on Model</h4>
                <p className="text-[10px] text-text-secondary leading-relaxed mb-4">
                  Upload a cropped, clean flat lay photo of the garment to style it on a virtual AI avatar.
                </p>

                <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-text-primary hover:text-white rounded-btn text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-soft transition-colors">
                  {generatingAvatar ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Styling Avatar...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Select & Style</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={generatingAvatar}
                    onChange={handleAvatarGarmentUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Size choices checkboxes */}
          <div className="bg-surface border border-border rounded-card p-6 shadow-soft space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border pb-2.5">
              Sizing Checklist
            </h3>

            <div className="flex flex-wrap gap-2.5">
              {SIZES.map((size) => {
                const active = sizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeToggle(size)}
                    className={`w-10 h-10 border rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-all ${
                      active
                        ? "bg-primary border-primary text-text-primary scale-105"
                        : "border-border text-text-secondary hover:border-primary-dark"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color swatches adding */}
          <div className="bg-surface border border-border rounded-card p-6 shadow-soft space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border pb-2.5">
              Colors Swatches
            </h3>

            {/* Existing swatches */}
            <div className="flex flex-wrap gap-2.5">
              {colors.map((col) => (
                <div
                  key={col.name}
                  className="flex items-center gap-1.5 bg-background border border-border rounded-full pl-2.5 pr-1.5 py-1 text-xs text-text-primary font-medium"
                >
                  <span className="w-2.5 h-2.5 rounded-full border border-border" style={{ backgroundColor: col.hex }} />
                  <span className="capitalize">{col.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(col.name)}
                    className="text-text-secondary hover:text-error rounded-full p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add color selector panel */}
            <div className="border-t border-border pt-4 flex gap-2">
              <input
                type="text"
                placeholder="e.g. Blush"
                value={colorNameInput}
                onChange={(e) => setColorNameInput(e.target.value)}
                className="w-full border border-border bg-background rounded-input px-2 py-1 text-xs outline-none focus:border-primary text-text-primary"
              />
              <input
                type="color"
                value={colorHexInput}
                onChange={(e) => setColorHexInput(e.target.value)}
                className="w-10 h-7 border border-border rounded cursor-pointer p-0 bg-transparent"
              />
              <button
                type="button"
                onClick={handleAddColor}
                className="p-1.5 border border-primary hover:bg-primary/5 text-primary-dark rounded-btn"
                title="Add Swatch"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tags manager */}
          <div className="bg-surface border border-border rounded-card p-6 shadow-soft space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border pb-2.5">
              Tag List
            </h3>

            {/* Chips list */}
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 bg-background border border-border rounded px-2.5 py-0.5 text-xs text-text-secondary"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-text-secondary hover:text-error"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div>
              <input
                type="text"
                placeholder="Press Enter to add tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full border border-border bg-background rounded-input p-2.5 text-xs outline-none focus:border-primary text-text-primary"
              />
            </div>
          </div>

          {/* Configuration flags */}
          <div className="bg-surface border border-border rounded-card p-6 shadow-soft space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-text-primary border-b border-border pb-2.5">
              Publish Settings
            </h3>

            <div className="flex flex-col gap-3.5">
              <label className="flex items-center gap-3 text-xs text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <span className="font-semibold text-text-primary uppercase tracking-wider">Garment Active (Publish)</span>
              </label>

              <label className="flex items-center gap-3 text-xs text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <span className="font-semibold text-text-primary uppercase tracking-wider">Featured on Home Carousel</span>
              </label>

              <label className="flex items-center gap-3 text-xs text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={pinterestInspired}
                  onChange={(e) => setPinterestInspired(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <span className="font-semibold text-text-primary uppercase tracking-wider">Pinterest-Inspired Trending</span>
              </label>
            </div>
          </div>

        </div>

      </div>

    </form>
  );
}
