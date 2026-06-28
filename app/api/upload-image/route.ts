import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bucket = (formData.get("bucket") as string) || "user-uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Check if Supabase keys are configured
    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (isSupabaseConfigured) {
      try {
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
        const filePath = `${bucket}/${filename}`;

        // Upload directly to Supabase storage
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        return NextResponse.json({ url: publicUrl, success: true });
      } catch (sbError: any) {
        console.warn("Supabase upload failed, falling back to local storage:", sbError);
      }
    }

    // Local file system fallback (saves to public/uploads)
    console.log("Saving uploaded file to local filesystem fallback...");
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    // Create directory if it doesn't exist
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (dirErr) {
      // Ignore if exists
    }

    const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const destinationPath = path.join(uploadDir, uniqueFilename);
    await fs.writeFile(destinationPath, buffer);

    const publicUrl = `/uploads/${uniqueFilename}`;
    return NextResponse.json({ url: publicUrl, success: true });

  } catch (err: any) {
    console.error("Upload image error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
