"use client";

import React from "react";
import { Address } from "@/types";
import { MapPin, Phone, Trash2, Edit3, CheckCircle } from "lucide-react";

interface AddressCardProps {
  address: Address;
  onEdit?: (address: Address) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  selectable?: boolean;
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isSelected = false,
  onSelect,
  selectable = false,
}: AddressCardProps) {
  const handleCardClick = () => {
    if (selectable && onSelect) {
      onSelect();
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`border rounded-card p-5 bg-surface relative shadow-soft transition-all duration-300 font-body ${
        selectable ? "cursor-pointer" : ""
      } ${
        isSelected
          ? "border-primary-dark ring-2 ring-primary/20 scale-102"
          : "border-border hover:border-primary/40"
      }`}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4 bg-primary text-text-primary p-0.5 rounded-full" title="Selected address">
          <CheckCircle className="w-4.5 h-4.5" />
        </div>
      )}

      {/* Title / Name */}
      <div className="flex items-start gap-2.5 mb-2.5">
        <MapPin className="w-5 h-5 text-primary-dark mt-0.5" />
        <div>
          <h4 className="font-semibold text-sm text-text-primary flex items-center gap-2">
            {address.name}
            {address.is_default && (
              <span className="bg-primary/10 border border-primary/20 text-primary-dark font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Default
              </span>
            )}
          </h4>
          <span className="flex items-center gap-1.5 text-xs text-text-secondary mt-1">
            <Phone className="w-3.5 h-3.5" /> {address.phone}
          </span>
        </div>
      </div>

      {/* Address text details */}
      <div className="pl-7 text-xs text-text-secondary leading-relaxed mb-4">
        <p>{address.line1}</p>
        {address.line2 && <p>{address.line2}</p>}
        <p>
          {address.city}, {address.state} - <strong>{address.pincode}</strong>
        </p>
      </div>

      {/* Action Buttons */}
      {!selectable && (onEdit || onDelete || onSetDefault) && (
        <div className="border-t border-border/75 pt-3.5 flex justify-between items-center gap-3">
          
          {onSetDefault && !address.is_default && (
            <button
              onClick={() => onSetDefault(address.id)}
              className="text-[10px] font-bold uppercase tracking-wider text-primary-dark hover:underline"
            >
              Set as Default
            </button>
          )}

          <div className="flex items-center gap-3.5 ml-auto">
            {onEdit && (
              <button
                onClick={() => onEdit(address)}
                className="text-text-secondary hover:text-primary-dark transition-colors p-1"
                title="Edit Address"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(address.id)}
                className="text-text-secondary hover:text-error transition-colors p-1"
                title="Delete Address"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
