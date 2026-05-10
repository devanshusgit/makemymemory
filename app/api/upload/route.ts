import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_session")?.value === process.env.ADMIN_PASSWORD;
}

// Configure Cloudinary
console.log("Cloudinary Config:", {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "SET" : "NOT SET",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "SET" : "NOT SET",
});

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return NextResponse.json({ 
        error: "Upload service not configured. Please set Cloudinary environment variables." 
      }, { status: 500 });
    }

    const uploadedFiles = [];

    for (const file of files) {
      if (!file.name) continue;

      try {
        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "make-my-memory/products",
              resource_type: "auto",
              public_id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(buffer);
        });

        const uploadResult = result as any;
        uploadedFiles.push({
          filename: uploadResult.public_id,
          url: uploadResult.secure_url,
          type: uploadResult.resource_type === 'image' ? 'image' : 'video'
        });
      } catch (fileError) {
        console.error(`Error uploading file ${file.name}:`, fileError);
        // Continue with next file instead of failing completely
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json({ 
        error: "Failed to upload any files" 
      }, { status: 500 });
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