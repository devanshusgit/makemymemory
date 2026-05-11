import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

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

    for (const file of files) {
      if (!file.name) continue;

      try {
        // Convert file → Buffer → base64 data URI.
        //
        // Why data URI and not upload_stream?
        // `cloudinary.uploader.upload_stream(...).end(buffer)` is unreliable on
        // Vercel serverless: the stream is a Node Writable that can outlive the
        // function invocation and the response is sometimes never delivered,
        // making the awaited Promise reject with an opaque error. The data-URI
        // form makes a single, fully-awaited HTTPS POST and works on every
        // serverless runtime. (This is also the variant that previously worked
        // in this repo — see commit 0ca7173.)
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const mime = file.type || "application/octet-stream";
        const dataURI = `data:${mime};base64,${buffer.toString("base64")}`;

        // Sanitize public_id. Cloudinary rejects ids that contain spaces or
        // certain punctuation, and `file.name.split('.')[0]` leaves both
        // through.
        const baseName = file.name.replace(/\.[^/.]+$/, "") || "file";
        const safeName =
          baseName.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50) || "file";
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

        console.log(`[upload] File uploaded: ${result.public_id}`);
      } catch (fileError: any) {
        const msg = fileError?.message || String(fileError);
        console.error(`Error uploading file ${file.name}:`, fileError);
        errors.push(`${file.name}: ${msg}`);
        continue;
      }
    }

    if (uploadedFiles.length === 0) {
      // Surface the underlying Cloudinary error to the (admin-only) caller so
      // future failures are diagnosable from the browser console instead of
      // requiring server log access.
      return NextResponse.json(
        {
          error: "Failed to upload any files",
          details: errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload files",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
