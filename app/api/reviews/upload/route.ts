import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { MAX_UPLOAD_BYTES } from "@/lib/utils/apiErrorMessage";
import { rateLimit, getRateLimitKey } from "@/lib/middleware/rateLimit";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Explicit Node.js runtime — the Cloudinary SDK needs Buffer / Node APIs.
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_UPLOAD_MB = (MAX_UPLOAD_BYTES / (1024 * 1024)).toFixed(1);
// Reviewers attach photos of the frame, nothing else. Unlike the admin
// uploader this takes no PDFs.
const MAX_FILES = 4;

/**
 * POST /api/reviews/upload
 *
 * Public, unlike /api/upload — a customer writing a review is not logged in as
 * admin and may not be logged in at all. That makes this an open door to our
 * Cloudinary account, so it is rate limited per IP, capped at a few small
 * files per call, and restricted to images and video.
 */
export async function POST(req: NextRequest) {
  if (!rateLimit(`review-upload:${getRateLimitKey(req)}`, 12, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again later." },
      { status: 429 }
    );
  }

  if (
    !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return NextResponse.json({ error: "Upload service not configured." }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const files = (formData.getAll("files") as File[]).filter((f) => f && f.name);

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Please attach at most ${MAX_FILES} files.` },
        { status: 400 }
      );
    }

    // Reject the whole batch up front, so one bad file cannot leave half of it
    // already sitting in Cloudinary.
    for (const file of files) {
      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { error: `${file.name} is too large. Max ~${MAX_UPLOAD_MB}MB per file.` },
          { status: 413 }
        );
      }
      // An empty file.type is untrustworthy, so it falls through to the 415.
      if (!/^(image|video)\//.test(file.type)) {
        return NextResponse.json(
          { error: `${file.name} is not a supported format. Use a photo or video.` },
          { status: 415 }
        );
      }
    }

    const urls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const mime = file.type || "application/octet-stream";
        const dataURI = `data:${mime};base64,${buffer.toString("base64")}`;

        const baseName = file.name.replace(/\.[^/.]+$/, "") || "file";
        const safeName = baseName.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50) || "file";

        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "make-my-memory/reviews",
          resource_type: "auto",
          public_id: `${Date.now()}-${safeName}`,
        });

        urls.push(result.secure_url);
      } catch (fileError: any) {
        const msg = fileError?.message || String(fileError);
        console.error(`[reviews/upload] ✗ ${file.name} failed:`, msg);
        errors.push(`${file.name}: ${msg}`);
      }
    }

    if (urls.length === 0) {
      return NextResponse.json(
        { error: "Failed to upload files", details: errors },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, urls });
  } catch (error: any) {
    console.error("[reviews/upload] Error:", error?.message || error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
