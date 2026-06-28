"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, X, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploadZoneProps {
  onUploadComplete: (url: string) => void;
  bucket?: string;
  className?: string;
  previewUrl?: string | null;
  onClear?: () => void;
}

export default function ImageUploadZone({
  onUploadComplete,
  bucket = "user-uploads",
  className = "",
  previewUrl = null,
  onClear,
}: ImageUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(previewUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    // 1. Validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP)");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    // Set local preview instantly
    const reader = new FileReader();
    reader.onload = () => {
      setLocalPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 2. Upload file
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        onUploadComplete(data.url);
        toast.success("Image uploaded successfully! ✨");
      } else {
        throw new Error(data.error || "Failed to retrieve public URL");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image. Try again.");
      setLocalPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalPreview(null);
    if (onClear) onClear();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={triggerInput}
      className={`relative border-2 border-dashed rounded-card flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
        dragActive
          ? "border-primary bg-primary/5"
          : "border-border bg-surface hover:border-primary-dark/50"
      } ${className}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept="image/*"
        className="hidden"
      />

      {localPreview ? (
        <div className="relative w-full h-48 select-none">
          <Image
            src={localPreview}
            alt="Uploaded preview"
            fill
            className="object-contain rounded-btn"
          />
          {uploading ? (
            <div className="absolute inset-0 bg-background/70 flex flex-col items-center justify-center rounded-btn">
              <RefreshCw className="w-8 h-8 animate-spin text-primary-dark mb-2" />
              <span className="text-xs text-text-primary font-bold uppercase tracking-wider">
                Uploading to Cloud...
              </span>
            </div>
          ) : (
            <div className="absolute top-2 right-2 flex gap-1.5 z-10">
              <div className="bg-success text-white p-1 rounded-full shadow-sm" title="Upload sync completed">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <button
                onClick={handleClear}
                className="bg-surface hover:bg-background text-text-secondary hover:text-error p-1 rounded-full shadow-sm border border-border"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center py-6 select-none font-body">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <UploadCloud className="w-6 h-6 text-primary-dark" />
          </div>
          <p className="text-sm font-semibold text-text-primary mb-1">
            Drag & drop your style inspo image
          </p>
          <p className="text-xs text-text-secondary">
            PNG, JPG, WebP up to 5MB (Click to browse)
          </p>
        </div>
      )}
    </div>
  );
}
