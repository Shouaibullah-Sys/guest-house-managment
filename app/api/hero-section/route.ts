// app/api/hero-section/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { HeroSection } from "@/models/HeroSection";
import dbConnect from "@/lib/db";
import { z } from "zod";

// Transform HeroSection document to frontend format
function transformHeroSectionToResponse(heroSection: any) {
  return {
    id: heroSection._id.toString(),
    title: heroSection.title,
    description: heroSection.description,
    location: heroSection.location,
    imageUrl: heroSection.imageUrl,
    imagePath: heroSection.imagePath || null,
    isActive: heroSection.isActive,
    displayOrder: heroSection.displayOrder,
    createdBy: heroSection.createdBy || null,
    updatedBy: heroSection.updatedBy || null,
    createdAt: heroSection.createdAt.toISOString(),
    updatedAt: heroSection.updatedAt.toISOString(),
  };
}

// GET /api/hero-section - List all hero sections
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const isActive = searchParams.get("isActive");

    // Build filter
    const filter: any = {};

    // Apply active filter
    if (isActive !== null && isActive !== "all") {
      filter.isActive = isActive === "true";
    }

    // Get hero sections, sorted by display order
    const heroSections = await HeroSection.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    const transformedHeroSections = heroSections.map(
      transformHeroSectionToResponse
    );

    return NextResponse.json({
      success: true,
      data: transformedHeroSections,
    });
  } catch (error) {
    console.error("Error fetching hero sections:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero sections" },
      { status: 500 }
    );
  }
}

// POST /api/hero-section - Create a new hero section
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();

    // Hero section validation
    const heroSectionSchema = z.object({
      title: z
        .string()
        .min(1, "Title is required")
        .max(100, "Title cannot exceed 100 characters"),
      description: z
        .string()
        .min(1, "Description is required")
        .max(500, "Description cannot exceed 500 characters"),
      location: z
        .string()
        .min(1, "Location is required")
        .max(100, "Location cannot exceed 100 characters"),
      imageUrl: z.string().url("Invalid image URL"),
      imagePath: z.string().optional(),
      isActive: z.boolean().default(true),
      displayOrder: z.number().min(0, "Display order must be 0 or greater"),
    });

    const heroSectionData = heroSectionSchema.parse(body);

    // Check if display order already exists for active items
    const existingHeroSection = await HeroSection.findOne({
      displayOrder: heroSectionData.displayOrder,
      isActive: true,
    });

    if (existingHeroSection) {
      return NextResponse.json(
        { error: "Display order already exists for an active hero section" },
        { status: 400 }
      );
    }

    // Create new hero section
    const newHeroSection = new HeroSection({
      ...heroSectionData,
      createdBy: userId,
      updatedBy: userId,
    });

    await newHeroSection.save();

    const transformedHeroSection =
      transformHeroSectionToResponse(newHeroSection);

    return NextResponse.json(
      {
        success: true,
        data: transformedHeroSection,
        message: "Hero section created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating hero section:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create hero section" },
      { status: 500 }
    );
  }
}
