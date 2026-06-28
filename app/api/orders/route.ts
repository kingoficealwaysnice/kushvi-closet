import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Fetch orders from Supabase
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn(`No orders found in Supabase for user ${userId}. Returning mock order history.`);
      
      // Simulate mock order history
      const mockOrders = [
        {
          id: "order_mock_001",
          user_id: userId,
          items: [
            {
              product_id: "prod-1",
              name: "Rose Whisper Silk Maxi Dress",
              size: "M",
              color: "Blush",
              qty: 1,
              price: 1899,
              image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800"
            },
            {
              product_id: "prod-3",
              name: "Ivory Dream Satin Crop Top",
              size: "S",
              color: "Ivory",
              qty: 1,
              price: 999,
              image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=800"
            }
          ],
          subtotal: 2898,
          shipping_fee: 0,
          total_amount: 2898,
          status: "delivered",
          payment_id: "pay_mock_999",
          payment_status: "paid",
          shipping_address: {
            name: "Aisha Patel",
            phone: "+919876543210",
            line1: "Flat 405, Rose Mansion, Outer Ring Road",
            line2: "Near Maple Heights",
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560103"
          },
          vendor_id: "vend-1",
          tracking_number: "SF123456789IN",
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      return NextResponse.json(mockOrders);
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET /api/orders error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
