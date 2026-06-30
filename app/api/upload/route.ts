import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Explicit Node.js runtime — the Cloudinary SDK needs Buffer / Node APIs.
// Bump maxDuration so larger images don't time out on the default 10s.
export const runtime = "nodejs";
export const maxDuration = 60;

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

/**
 * Upload file to Cloudinary using FormData (more efficient for large files)
 */
async function uploadToCloudinary(buffer: Buffer, filename: string, mimeType: string): Promise<any> {
  const formData = new FormData();
  
  // Create a blob from buffer
  const blob = new Blob([buffer], { type: mimeType });
  formData.append("file", blob, filename);
  
  // Sanitize public_id
  const baseName = filename.replace(/\.[^/.]+$/, "") || "file";
  const safeName = baseName.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50) || "file";
  const publicId = `${Date.now()}-${safeName}`;
  
  formData.append("public_id", publicId);
  formData.append("folder", "make-my-memory/products");
  formData.append("resource_type", "auto");
  formData.append("api_key", process.env.CLOUDINARY_API_KEY!);

  console.log(`[upload] Uploading to Cloudinary: ${filename} as ${publicId}`);

  // Use Cloudinary REST API directly instead of SDK for better control
  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // 30s per file
    }
  );

  if (!response.data.secure_url) {
    throw new Error("No URL returned from Cloudinary");
  }

  return {
    filename: response.data.public_id,
    url: response.data.secure_url,
    type: response.data.resource_type === "image" ? "image" : "video",
  };
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

    console.log(`[upload] Starting upload for ${files.length} files`);

    // Check if Cloudinary is configured
    if (
      !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        {
          error:
            "Upload service not configured. Please set Cloudinary environment variables.",
        },
        { status: 500 }
      );
    }

    const uploadedFiles: Array<{ filename: string; url: string; type: string }> =
      [];
    const errors: string[] = [];

    // Upload files sequentially to avoid overwhelming Cloudinary
    // (parallel was causing issues with base64 encoding)
    for (const file of files) {
      if (!file.name) continue;

      // Check file size (max 25MB per file for safety)
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 25) {
        console.error(`[upload] File too large: ${file.name} (${fileSizeMB.toFixed(2)}MB)`);
        errors.push(`${file.name}: File size ${fileSizeMB.toFixed(2)}MB exceeds 25MB limit`);
        continue;
      }

      try {
        console.log(`[upload] Processing file ${file.name} (${fileSizeMB.toFixed(2)}MB)`);
        
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const mimeType = file.type || "application/octet-stream";

        const result = await uploadToCloudinary(buffer, file.name, mimeType);
        uploadedFiles.push(result);

        console.log(`[upload] ✓ File uploaded: ${result.filename}`);
      } catch (fileError: any) {
        const msg = fileError?.message || String(fileError);
        console.error(`[upload] ✗ Error uploading file ${file.name}:`, fileError);
        errors.push(`${file.name}: ${msg}`);
        continue;
      }
    }

    if (uploadedFiles.length === 0) {
      // Surface the underlying Cloudinary error to the (admin-only) caller so
      // future failures are diagnosable from the browser console instead of
      // requiring server log access.
      console.error("[upload] All uploads failed:", errors);
      return NextResponse.json(
        {
          error: "Failed to upload any files",
          details: errors,
        },
        { status: 500 }
      );
    }

    console.log(`[upload] ✓ Upload complete: ${uploadedFiles.length} files uploaded`);
    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error: any) {
    console.error("[upload] Fatal error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload files",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
