import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase, supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    let dbClient = supabase;
    try {
      dbClient = getAdminSupabase();
    } catch (err) {
      console.warn("Using standard Supabase client for admin stats...");
    }

    // 1. Fetch statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const { count: activeProducts, error: prodErr } = await dbClient
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    const { data: todayOrders, error: orderErr } = await dbClient
      .from("orders")
      .select("total_amount, status, created_at")
      .gte("created_at", todayISO);

    const { count: pendingOrders, error: pendingErr } = await dbClient
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { count: newUsersToday, error: userErr } = await dbClient
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayISO);

    // Fallback/Mock stats if DB queries fail or are unpopulated
    const hasFailures = prodErr || orderErr || pendingErr || userErr;
    const isMocked = hasFailures || (activeProducts === 0 && todayOrders?.length === 0);

    if (isMocked) {
      console.log("Supabase empty or failed. Providing mockup admin dashboard stats.");
      return NextResponse.json({
        success: true,
        stats: {
          ordersCountToday: 12,
          revenueToday: 23490,
          activeProductsCount: 38,
          pendingOrdersCount: 4,
          newUsersCountToday: 8,
        },
        recentOrders: [
          {
            id: "ord_101",
            full_name: "Aisha Patel",
            total_amount: 1899,
            status: "pending",
            created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          },
          {
            id: "ord_102",
            full_name: "Sneha Patel",
            total_amount: 3499,
            status: "confirmed",
            created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          },
          {
            id: "ord_103",
            full_name: "Riya Sharma",
            total_amount: 999,
            status: "delivered",
            created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
          },
          {
            id: "ord_104",
            full_name: "Divya Rao",
            total_amount: 2899,
            status: "shipped",
            created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
          }
        ],
        is_mocked: true,
      });
    }

    const ordersCountToday = todayOrders?.length || 0;
    const revenueToday = todayOrders?.reduce((sum, ord) => sum + parseFloat(ord.total_amount), 0) || 0;

    // Fetch last 10 orders for dashboard table
    const { data: recentOrders, error: recentErr } = await dbClient
      .from("orders")
      .select(`
        id,
        total_amount,
        status,
        created_at,
        user:users(full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(10);

    const formattedOrders = recentOrders?.map((ord: any) => ({
      id: ord.id,
      full_name: ord.user?.full_name || "Valued Customer",
      total_amount: ord.total_amount,
      status: ord.status,
      created_at: ord.created_at,
    })) || [];

    return NextResponse.json({
      success: true,
      stats: {
        ordersCountToday,
        revenueToday,
        activeProductsCount: activeProducts || 0,
        pendingOrdersCount: pendingOrders || 0,
        newUsersCountToday: newUsersToday || 0,
      },
      recentOrders: formattedOrders,
      is_mocked: false,
    });

  } catch (err: any) {
    console.error("GET /api/admin/stats error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
