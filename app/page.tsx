import HomeClient from "@/components/HomeClient";
import { supabase } from "@/lib/supabase";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

export const revalidate = 60; // Revalidate every minute for Pinterest freshness

export default async function Home() {
  let products = [];
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      products = MOCK_PRODUCTS;
    } else {
      products = data;
    }
  } catch (err) {
    console.error("Failed to load products server-side. Falling back to mock catalog.", err);
    products = MOCK_PRODUCTS;
  }

  return <HomeClient initialProducts={products} />;
}
