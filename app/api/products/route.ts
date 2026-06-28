import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Extract search query and basic filters
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const rating = searchParams.get("rating");
    const sort = searchParams.get("sort") || "newest";

    // Extract array-based filters
    const sizes = searchParams.getAll("sizes");
    const colors = searchParams.getAll("colors"); // Names of colors, e.g. Blush, Olive

    // Pagination
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("is_active", true);

    // Filter by text search
    if (search) {
      // Search in name or description or tags
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search.toLowerCase()}}`);
    }

    // Filter by category
    if (category) {
      const categoryList = category.split(",");
      query = query.in("category", categoryList);
    }

    // Filter by price range
    if (minPrice) {
      query = query.gte("price", parseFloat(minPrice));
    }
    if (maxPrice) {
      query = query.lte("price", parseFloat(maxPrice));
    }

    // Filter by sizes
    if (sizes && sizes.length > 0) {
      query = query.filter("sizes", "ov", `{"${sizes.join('","')}"}`);
    }

    // Sort options
    if (sort === "newest") {
      query = query.order("created_at", { ascending: false });
    } else if (sort === "price-asc") {
      query = query.order("price", { ascending: true });
    } else if (sort === "price-desc") {
      query = query.order("price", { ascending: false });
    } else if (sort === "popular") {
      query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
    }

    // Apply pagination range
    query = query.range(offset, offset + limit - 1);

    let { data, count, error } = await query;

    // Fallback if DB table is unpopulated or has error
    if (error || !data || data.length === 0) {
      console.log("Supabase products table empty or failed. Using mock catalog.");
      data = MOCK_PRODUCTS;
      count = MOCK_PRODUCTS.length;
    }

    let filteredData = data || [];

    // Filter by colors (JSONB array containment helper)
    if (colors && colors.length > 0) {
      filteredData = filteredData.filter((product: any) => {
        if (!product.colors || !Array.isArray(product.colors)) return false;
        return product.colors.some((col: any) => colors.includes(col.name));
      });
    }

    // Filter by average rating (if rating is requested, we join or compute reviews)
    if (rating) {
      const minRating = parseInt(rating);
      
      // For each product, we can fetch reviews count or mock ratings.
      // Since reviews is a separate table, we'll fetch review averages or mock them for active display.
      // To prevent massive queries, let's select reviews for these products.
      const productIds = filteredData.map((p) => p.id);
      
      if (productIds.length > 0) {
        const { data: reviews, error: reviewsErr } = await supabase
          .from("reviews")
          .select("product_id, rating")
          .in("product_id", productIds);

        if (!reviewsErr && reviews) {
          // Group reviews by product
          const productRatings: Record<string, number[]> = {};
          reviews.forEach((r) => {
            if (!productRatings[r.product_id]) productRatings[r.product_id] = [];
            productRatings[r.product_id].push(r.rating);
          });

          filteredData = filteredData.filter((product: any) => {
            const ratings = productRatings[product.id];
            if (!ratings || ratings.length === 0) {
              // Default to 5 star rating if no reviews exist (brand new product vibe)
              return 5 >= minRating;
            }
            const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
            return avg >= minRating;
          });
        }
      }
    }

    return NextResponse.json({
      products: filteredData,
      totalCount: count || filteredData.length,
      offset,
      limit,
    });
  } catch (err: any) {
    console.error("GET /api/products error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (!isSupabaseConfigured) {
      console.log("Supabase not configured. Simulating mock product creation...");
      const mockNewProduct = {
        id: `prod_mock_${Math.random().toString(36).substring(2, 9)}`,
        created_at: new Date().toISOString(),
        ...body
      };
      return NextResponse.json({ success: true, product: mockNewProduct });
    }

    const { data: newProduct, error } = await supabase
      .from("products")
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, product: newProduct });
  } catch (err: any) {
    console.error("POST /api/products error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
