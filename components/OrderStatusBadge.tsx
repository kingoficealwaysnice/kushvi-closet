"use client";

import React from "react";
import { OrderStatus } from "@/types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const styles: Record<OrderStatus, { bg: string; text: string; label: string }> = {
    pending: {
      bg: "bg-amber-100 border-amber-200",
      text: "text-amber-800",
      label: "Pending",
    },
    confirmed: {
      bg: "bg-blue-100 border-blue-200",
      text: "text-blue-800",
      label: "Confirmed",
    },
    shipped: {
      bg: "bg-purple-100 border-purple-200",
      text: "text-purple-800",
      label: "Shipped",
    },
    delivered: {
      bg: "bg-green-100 border-green-200",
      text: "text-green-800",
      label: "Delivered",
    },
    cancelled: {
      bg: "bg-red-100 border-red-200",
      text: "text-red-800",
      label: "Cancelled",
    },
  };

  const style = styles[status] || styles.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}
