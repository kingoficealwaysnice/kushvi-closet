import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase, supabase } from "@/lib/supabase";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    const { status, tracking_number } = body;

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (!isSupabaseConfigured) {
      console.log("Supabase not configured. Simulating mock order update...");
      return NextResponse.json({ success: true });
    }

    // Load admin service client to bypass RLS and perform status changes
    let dbClient = supabase;
    try {
      dbClient = getAdminSupabase();
    } catch (err) {
      console.warn("Could not load admin service client, checking standard query...");
    }

    const { data: updatedOrder, error } = await dbClient
      .from("orders")
      .update({ status, tracking_number })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, order: updatedOrder });

  } catch (err: any) {
    console.error("PUT /api/admin/orders/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
