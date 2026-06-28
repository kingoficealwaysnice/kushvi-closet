import { Product } from "@/types";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Rose Whisper Silk Maxi Dress",
    description: "An elegant, flowy silk maxi dress with delicate spaghetti straps and a tiered skirt. Perfect for summer afternoons and sunset dinners. Sourced directly from Pinterest trends.",
    price: 1899,
    original_price: 2499,
    category: "dresses",
    tags: ["boho", "pastel", "summer", "maxi", "silk"],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Blush", hex: "#F2A7BB" },
      { name: "Ivory", hex: "#FFFFF0" }
    ],
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80"
    ],
    ai_avatar_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80",
    stock_count: 8,
    vendor_id: "vend-1",
    is_active: true,
    is_featured: true,
    pinterest_inspired: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-2",
    name: "Sage Meadows Linen Co-ord",
    description: "Breathable pure linen two-piece co-ord set featuring a button-down shirt and relaxed-fit trousers. Unbelievably comfortable and chic for casual workspace and brunch.",
    price: 2299,
    original_price: 2999,
    category: "co-ords",
    tags: ["linen", "co-ord", "pastel", "sage", "summer"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Sage", hex: "#B8D8D8" },
      { name: "Ivory", hex: "#FFFFF0" }
    ],
    images: [
      "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=800&auto=format&fit=crop&q=80"
    ],
    ai_avatar_image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    stock_count: 4,
    vendor_id: "vend-2",
    is_active: true,
    is_featured: true,
    pinterest_inspired: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-3",
    name: "Ivory Dream Satin Crop Top",
    description: "Luxurious heavy-weight satin top with a cowl neckline and crossover tie-back. Effortlessly catches the light, elevating any high-rise denim look.",
    price: 999,
    original_price: 1499,
    category: "tops",
    tags: ["crop", "satin", "ivory", "chic"],
    sizes: ["XS", "S", "M"],
    colors: [
      { name: "Ivory", hex: "#FFFFF0" },
      { name: "Onyx", hex: "#2C2C2C" }
    ],
    images: [
      "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80"
    ],
    ai_avatar_image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80",
    stock_count: 12,
    vendor_id: "vend-1",
    is_active: true,
    is_featured: false,
    pinterest_inspired: true,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-4",
    name: "Peach Sorbet Tiered Skirt",
    description: "Flowy, high-waisted cotton tiered midi skirt with a soft elasticated waistband. Adds a whimsical, feminine touch to your day wear.",
    price: 1499,
    original_price: 1999,
    category: "bottoms",
    tags: ["skirt", "tiered", "pastel", "cotton", "boho"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Blush", hex: "#F2A7BB" }
    ],
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80"
    ],
    ai_avatar_image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
    stock_count: 2,
    vendor_id: "vend-3",
    is_active: true,
    is_featured: true,
    pinterest_inspired: false,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-5",
    name: "Lavender Haze Georgette Anarkali",
    description: "Stunning georgette Anarkali suit set with heavy embroidery on the yoke and a matching organza dupatta. Ideal for festivals and pre-wedding events.",
    price: 3499,
    original_price: 4999,
    category: "ethnic",
    tags: ["ethnic", "anarkali", "lavender", "embroidery", "festive"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Lavender", hex: "#E6E6FA" }
    ],
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80"
    ],
    ai_avatar_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80",
    stock_count: 15,
    vendor_id: "vend-2",
    is_active: true,
    is_featured: true,
    pinterest_inspired: true,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-6",
    name: "Olive Garden Classic Blazer",
    description: "An oversized double-breasted blazer with structured shoulders and pockets. Styled perfectly for a business-casual Pinterest outfit.",
    price: 2899,
    original_price: 3799,
    category: "tops",
    tags: ["blazer", "casual", "olive", "outerwear", "autumn"],
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Olive", hex: "#808000" }
    ],
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=800&auto=format&fit=crop&q=80"
    ],
    ai_avatar_image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=80",
    stock_count: 5,
    vendor_id: "vend-1",
    is_active: true,
    is_featured: false,
    pinterest_inspired: true,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-7",
    name: "Onyx Nights Side Slit Slip Dress",
    description: "A premium bias-cut black slip dress made from heavy silk satin, featuring a cowl neckline and an adjustable thigh-high slit.",
    price: 1999,
    original_price: 2799,
    category: "dresses",
    tags: ["black", "dress", "satin", "slip", "night"],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Onyx", hex: "#2C2C2C" }
    ],
    images: [
      "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80"
    ],
    ai_avatar_image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80",
    stock_count: 3,
    vendor_id: "vend-3",
    is_active: true,
    is_featured: true,
    pinterest_inspired: false,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-8",
    name: "Baroque Pearl Droplet Earrings",
    description: "Artisanal gold-plated statement earrings featuring dangling natural freshwater baroque pearls. Highly coveted on Pinterest mood boards.",
    price: 499,
    original_price: 799,
    category: "accessories",
    tags: ["pearl", "earrings", "jewelry", "baroque", "vintage"],
    sizes: ["One Size"],
    colors: [
      { name: "Ivory", hex: "#FFFFF0" }
    ],
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1590548784585-645d8b7f3a2a?w=800&auto=format&fit=crop&q=80"
    ],
    ai_avatar_image: null,
    stock_count: 20,
    vendor_id: "vend-1",
    is_active: true,
    is_featured: false,
    pinterest_inspired: true,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-9",
    name: "Cotton Candy Linen Shorts",
    description: "Relaxed high-waisted shorts in a beautiful pastel rose hue. Features side pockets and a comfy soft gathered elastic waistband.",
    price: 1199,
    original_price: 1699,
    category: "bottoms",
    tags: ["linen", "shorts", "pink", "pastel", "summer"],
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Blush", hex: "#F2A7BB" }
    ],
    images: [
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80"
    ],
    ai_avatar_image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    stock_count: 6,
    vendor_id: "vend-2",
    is_active: true,
    is_featured: false,
    pinterest_inspired: false,
    created_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-10",
    name: "Classic Silk Slip Cami",
    description: "Feminine cowl neck slip cami top in a buttery cream color. Made from lightweight silk with adjustable back crossing straps.",
    price: 899,
    original_price: 1299,
    category: "tops",
    tags: ["cami", "tops", "silk", "cream", "chic"],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Ivory", hex: "#FFFFF0" }
    ],
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=800&auto=format&fit=crop&q=80"
    ],
    ai_avatar_image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
    stock_count: 9,
    vendor_id: "vend-1",
    is_active: true,
    is_featured: false,
    pinterest_inspired: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-11",
    name: "Desert Sands Linen Wide-Leg Pants",
    description: "Elegant, high-waisted linen wide-leg pants with a relaxed silhouette. A standard base layer for clean Pinterest fashion lookbooks.",
    price: 1799,
    original_price: 2499,
    category: "bottoms",
    tags: ["pants", "linen", "wide-leg", "beige", "minimalist"],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Ivory", hex: "#FFFFF0" }
    ],
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80"
    ],
    ai_avatar_image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80",
    stock_count: 3,
    vendor_id: "vend-3",
    is_active: true,
    is_featured: false,
    pinterest_inspired: true,
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-12",
    name: "Gilded Petal Claw Clip",
    description: "Heavy-duty metal hair claw clip in a glossy rose gold flower design. Instantly styles your daily messy-bun in aesthetic perfection.",
    price: 349,
    original_price: 599,
    category: "accessories",
    tags: ["claw", "clip", "hair", "accessories", "rose-gold"],
    sizes: ["One Size"],
    colors: [
      { name: "Blush", hex: "#F2A7BB" }
    ],
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1590548784585-645d8b7f3a2a?w=800&auto=format&fit=crop&q=80"
    ],
    ai_avatar_image: null,
    stock_count: 25,
    vendor_id: "vend-2",
    is_active: true,
    is_featured: true,
    pinterest_inspired: true,
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  }
];
