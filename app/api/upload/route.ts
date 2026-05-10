import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), "public", "uploads");
    
    // Create uploads directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedFiles = [];

    for (const file of files) {
      if (!file.name) continue;

      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const filename = `${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`;
      
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Write file to uploads directory
      const filepath = join(uploadDir, filename);
      await writeFile(filepath, buffer);

      // Return the public URL
      const publicUrl = `/uploads/${filename}`;
      uploadedFiles.push({
        filename,
        url: publicUrl,
        type: file.type.startsWith('image/') ? 'image' : 'video'
      });
    }

    return NextResponse.json({ 
      success: true, 
      files: uploadedFiles 
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      error: "Failed to upload files" 
    }, { status: 500 });
  }
}