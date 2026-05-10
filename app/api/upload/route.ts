import { NextRequest, NextResponse } from "next/server";

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
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return NextResponse.json({ 
        error: "Upload service not configured. Please set Cloudinary environment variables." 
      }, { status: 500 });
    }

    const uploadedFiles = [];
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn("Cloudinary credentials missing");
      return NextResponse.json({ 
        success: true,
        files: [],
        warning: "Upload service not configured"
      });
    }

    for (const file of files) {
      if (!file.name) continue;

      try {
        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create FormData
        const formData = new FormData();
        const blob = new Blob([buffer], { type: file.type });
        formData.append('file', blob, file.name);
        formData.append('upload_preset', 'make_my_memory_unsigned');
        formData.append('folder', 'make-my-memory/products');

        // Upload to Cloudinary
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          console.error(`Upload failed: ${response.statusText}`);
          continue;
        }

        const result = await response.json() as any;
        uploadedFiles.push({
          filename: result.public_id,
          url: result.secure_url,
          type: 'image'
        });
      } catch (fileError) {
        console.error(`Error uploading file ${file.name}:`, fileError);
        continue;
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