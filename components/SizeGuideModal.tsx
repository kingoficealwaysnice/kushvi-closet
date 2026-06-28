"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MEASUREMENTS_INCHES = [
  { size: "XS", chest: "32", waist: "25", hip: "35" },
  { size: "S", chest: "34", waist: "27", hip: "37" },
  { size: "M", chest: "36", waist: "29", hip: "39" },
  { size: "L", chest: "38", waist: "31", hip: "41" },
  { size: "XL", chest: "40", waist: "33", hip: "43" },
];

const MEASUREMENTS_CM = [
  { size: "XS", chest: "81", waist: "64", hip: "89" },
  { size: "S", chest: "86", waist: "69", hip: "94" },
  { size: "M", chest: "91", waist: "74", hip: "99" },
  { size: "L", chest: "97", waist: "79", hip: "104" },
  { size: "XL", chest: "102", waist: "84", hip: "109" },
];

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  const [unit, setUnit] = useState<"in" | "cm">("in");

  if (!isOpen) return null;

  const data = unit === "in" ? MEASUREMENTS_INCHES : MEASUREMENTS_CM;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/45 backdrop-blur-sm animate-fade-in font-body">
      <div className="bg-surface rounded-card border border-border shadow-soft max-w-md w-full overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-heading italic text-xl font-bold text-text-primary">
            Size Guide
          </h3>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-background rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-text-secondary text-sm mb-6">
            Find your perfect fit. Grab a measuring tape and check your dimensions against our reference chart.
          </p>

          {/* Unit Toggle */}
          <div className="flex bg-background p-1 rounded-btn border border-border mb-6 max-w-[150px] mx-auto">
            <button
              onClick={() => setUnit("in")}
              className={`flex-1 py-1.5 rounded-input text-xs font-semibold uppercase tracking-wider text-center transition-all ${
                unit === "in" 
                  ? "bg-surface shadow-md text-primary-dark" 
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Inches
            </button>
            <button
              onClick={() => setUnit("cm")}
              className={`flex-1 py-1.5 rounded-input text-xs font-semibold uppercase tracking-wider text-center transition-all ${
                unit === "cm" 
                  ? "bg-surface shadow-md text-primary-dark" 
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              CM
            </button>
          </div>

          {/* Sizing Table */}
          <div className="overflow-x-auto border border-border rounded-input">
            <table className="w-full text-sm text-left">
              <thead className="bg-background text-text-secondary text-xs uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold">Size</th>
                  <th className="px-4 py-3 font-semibold">Chest</th>
                  <th className="px-4 py-3 font-semibold">Waist</th>
                  <th className="px-4 py-3 font-semibold">Hips</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((row) => (
                  <tr key={row.size} className="hover:bg-background/40 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-text-primary">{row.size}</td>
                    <td className="px-4 py-3.5 text-text-secondary">{row.chest} {unit}</td>
                    <td className="px-4 py-3.5 text-text-secondary">{row.waist} {unit}</td>
                    <td className="px-4 py-3.5 text-text-secondary">{row.hip} {unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-[10px] text-text-secondary leading-relaxed bg-primary/5 border border-primary/20 rounded-input p-3">
            <strong className="text-primary-dark block mb-1">Fitting Tip:</strong>
            If your measurements are between sizes, we recommend ordering one size up for a comfortable, relaxed Pinterest-style drape.
          </div>
        </div>

      </div>
    </div>
  );
}
