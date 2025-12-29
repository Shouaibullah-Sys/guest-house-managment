// app/api/hero-section/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// This route handles hero section image uploads
// It redirects to the main uploadthing router for actual file processing
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // This is a placeholder endpoint
    // The actual file upload is handled by /api/uploadthing
    // Client should use the uploadthing client to upload files

    return NextResponse.json({
      success: true,
      message: "Use /api/uploadthing for file uploads",
      uploadEndpoint: "/api/uploadthing",
      uploader: "heroSectionUploader",
    });
  } catch (error) {
    console.error("Error in hero section upload route:", error);
    return NextResponse.json(
      { error: "Failed to process upload request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: "Hero section upload endpoint",
      uploadEndpoint: "/api/uploadthing",
      uploader: "heroSectionUploader",
      allowedFileTypes: ["image"],
      maxFileSize: "4MB",
      maxFileCount: 1,
    });
  } catch (error) {
    console.error("Error in hero section upload GET route:", error);
    return NextResponse.json(
      { error: "Failed to get upload information" },
      { status: 500 }
    );
  }
}
