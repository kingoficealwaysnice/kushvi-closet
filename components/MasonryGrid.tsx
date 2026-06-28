"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";

interface MasonryGridProps {
  products: Product[];
}

export default function MasonryGrid({ products }: MasonryGridProps) {
  const [columnsCount, setColumnsCount] = useState(4);

  // Responsive column counts
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w >= 1024) {
        setColumnsCount(4); // Desktop
      } else if (w >= 768) {
        setColumnsCount(3); // Tablet
      } else {
        setColumnsCount(2); // Mobile
      }
    };

    handleResize(); // Initial call
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Split products into column arrays
  const columns: Product[][] = Array.from({ length: columnsCount }, () => []);
  
  products.forEach((product, index) => {
    const colIndex = index % columnsCount;
    columns[colIndex].push(product);
  });

  return (
    <div className="flex gap-4 md:gap-6 w-full align-top">
      {columns.map((columnProducts, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-4 md:gap-6 flex-1">
          {columnProducts.map((product, pIdx) => (
            <ProductCard
              key={product.id}
              product={product}
              index={colIdx + pIdx * columnsCount}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
