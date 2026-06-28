import { NextRequest, NextResponse } from "next/server";
import { runFashnTryOn } from "@/lib/fashn";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { garment_image_url, person_image_url, category, fallback_image } = body;

    if (!garment_image_url || !person_image_url) {
      return NextResponse.json(
        { error: "garment_image_url and person_image_url are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.FASHN_API_KEY;

    // Check if API key is unconfigured or a placeholder
    if (!apiKey || apiKey.includes("placeholder") || apiKey === "") {
      console.log("Fashn API key not configured. Simulating mock try-on...");
      
      // Simulate network generation delay
      await new Promise((resolve) => setTimeout(resolve, 3500));

      // Return fallback image if provided (e.g. products.ai_avatar_image) or standard model
      const resultImage = fallback_image || person_image_url || garment_image_url;

      return NextResponse.json({
        success: true,
        output_url: resultImage,
        is_mocked: true,
      });
    }

    // Call actual API
    const outputUrl = await runFashnTryOn(garment_image_url, person_image_url, category || "tops");

    return NextResponse.json({
      success: true,
      output_url: outputUrl,
      is_mocked: false,
    });
  } catch (err: any) {
    console.error("Try-on API Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate virtual try-on" },
      { status: 500 }
    );
  }
}
