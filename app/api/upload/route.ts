import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { isAdminRequest } from "@/lib/auth/admin";
import { MAX_UPLOAD_BYTES } from "@/lib/utils/apiErrorMessage";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Explicit Node.js runtime — the Cloudinary SDK needs Buffer / Node APIs.
export const runtime = "nodejs";
export const maxDuration = 60;

// The size/type checks in components/admin/ProductFileUploader.tsx are browser-side
// only — a direct POST bypasses them entirely, so they have to be repeated here
// before we base64 the file into memory and spend a Cloudinary call on it.
// Same constant the admin uploader enforces in the browser, so the two can
// never drift: Vercel rejects request bodies over 4.5MB before this route
// runs, and files are base64-encoded in transit (~1.33x).
const MAX_UPLOAD_MB = (MAX_UPLOAD_BYTES / (1024 * 1024)).toFixed(1);
const ALLOWED_MIME_PREFIXES = ["image/", "video/"];
const ALLOWED_MIME_TYPES = ["application/pdf"];

function isAllowedMimeType(mime: string) {
  return (
    ALLOWED_MIME_TYPES.includes(mime) ||
    ALLOWED_MIME_PREFIXES.some((prefix) => mime.startsWith(prefix))
  );
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Reject the whole batch up front: a single oversized/disallowed file should not
    // leave half the batch already uploaded to Cloudinary.
    for (const file of files) {
      if (!file.name) continue;

      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { error: `${file.name} is too large. Max ~${MAX_UPLOAD_MB}MB per file — please compress it first.` },
          { status: 413 }
        );
      }

      // An empty file.type is untrustworthy, so it falls through to the 415 as well.
      if (!isAllowedMimeType(file.type)) {
        return NextResponse.json(
          {
            error: `${file.name} is not a supported format. Use images, videos, or PDFs.`,
          },
          { status: 415 }
        );
      }
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
          error: "Upload service not configured.",
        },
        { status: 500 }
      );
    }

    const uploadedFiles: Array<{ filename: string; url: string; type: string }> = [];
    const errors: string[] = [];

    // Upload files one at a time
    for (const file of files) {
      if (!file.name) continue;

      const fileSizeMB = file.size / (1024 * 1024);

      try {
        console.log(`[upload] Uploading: ${file.name} (${fileSizeMB.toFixed(2)}MB)`);
        
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const mime = file.type || "application/octet-stream";
        const dataURI = `data:${mime};base64,${buffer.toString("base64")}`;

        const baseName = file.name.replace(/\.[^/.]+$/, "") || "file";
        const safeName = baseName.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50) || "file";
        const publicId = `${Date.now()}-${safeName}`;

        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "make-my-memory/products",
          resource_type: "auto",
          public_id: publicId,
        });

        uploadedFiles.push({
          filename: result.public_id,
          url: result.secure_url,
          type: result.resource_type === "image" ? "image" : "video",
        });

        console.log(`[upload] ✓ ${file.name} uploaded`);
      } catch (fileError: any) {
        const msg = fileError?.message || String(fileError);
        console.error(`[upload] ✗ ${file.name} failed:`, msg);
        errors.push(`${file.name}: ${msg}`);
      }
    }

    if (uploadedFiles.length === 0) {
      console.error("[upload] All failed:", errors);
      return NextResponse.json(
        { error: "Failed to upload files", details: errors },
        { status: 500 }
      );
    }

    console.log(`[upload] ✓ Complete: ${uploadedFiles.length}/${files.length} uploaded`);
    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error: any) {
    console.error("[upload] Error:", error.message);
    return NextResponse.json(
      { error: "Upload failed", details: error?.message },
      { status: 500 }
    );
  }
}
