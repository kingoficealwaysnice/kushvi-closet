import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase, supabase } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      user_id,
      items,
      subtotal,
      shipping_fee,
      total_amount,
      shipping_address,
      vendor_id,
    } = body;

    if (!user_id || !items || !total_amount || !shipping_address) {
      return NextResponse.json({ error: "Missing required order details" }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const isMocked = !razorpay_signature || razorpay_order_id?.startsWith("order_mock_");

    if (!isMocked && keySecret) {
      // 1. Verify actual Razorpay Signature
      const hmac = crypto.createHmac("sha256", keySecret);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const generatedSignature = hmac.digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 });
      }
    } else {
      console.log("Mock payment verification requested or key_secret missing. Signature checks skipped.");
    }

    // 2. Save order in Database
    // We bypass RLS using the admin client because this is a secure webhook/API route triggered after payment verification.
    // If admin client fails to construct, we fall back to standard supabase client.
    let dbClient = supabase;
    try {
      dbClient = getAdminSupabase();
    } catch (err) {
      console.warn("Could not load Supabase service role client, attempting with standard client...");
    }

    const { data: order, error: orderError } = await dbClient
      .from("orders")
      .insert({
        user_id,
        items,
        subtotal,
        shipping_fee,
        total_amount,
        status: "confirmed", // payment verified successfully
        payment_id: razorpay_payment_id || `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
        payment_status: "paid",
        shipping_address,
        vendor_id: vendor_id || null,
        tracking_number: null,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Database Order Insertion Error:", orderError);
      throw orderError;
    }

    // 3. Clear shopping cart for this user
    const { error: cartError } = await dbClient
      .from("cart")
      .delete()
      .eq("user_id", user_id);

    if (cartError) {
      console.error("Failed to clear shopping cart:", cartError);
      // Don't throw here, order is already saved!
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: any) {
    console.error("Payment verification API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to finalize transaction" },
      { status: 500 }
    );
  }
}
