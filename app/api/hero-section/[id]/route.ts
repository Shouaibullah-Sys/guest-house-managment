// app/api/hero-section/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { HeroSection } from "@/models/HeroSection";
import dbConnect from "@/lib/db";
import { z } from "zod";
import mongoose from "mongoose";

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

// GET /api/hero-section/[id] - Get a specific hero section
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params before using its properties (Next.js 15 requirement)
    const { id: heroSectionId } = await params;

    if (!mongoose.isValidObjectId(heroSectionId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    await dbConnect();

    const heroSection = await HeroSection.findById(heroSectionId).lean();

    if (!heroSection) {
      return NextResponse.json(
        { error: "Hero section not found" },
        { status: 404 }
      );
    }

    const transformedHeroSection = transformHeroSectionToResponse(heroSection);

    return NextResponse.json({
      success: true,
      data: transformedHeroSection,
    });
  } catch (error) {
    console.error("Error fetching hero section:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero section" },
      { status: 500 }
    );
  }
}

// PUT /api/hero-section/[id] - Update a hero section
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params before using its properties (Next.js 15 requirement)
    const { id: heroSectionId } = await params;

    if (!mongoose.isValidObjectId(heroSectionId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    await dbConnect();

    const body = await request.json();

    // Hero section validation for updates
    const heroSectionSchema = z.object({
      title: z
        .string()
        .min(1, "Title is required")
        .max(100, "Title cannot exceed 100 characters")
        .optional(),
      description: z
        .string()
        .min(1, "Description is required")
        .max(500, "Description cannot exceed 500 characters")
        .optional(),
      location: z
        .string()
        .min(1, "Location is required")
        .max(100, "Location cannot exceed 100 characters")
        .optional(),
      imageUrl: z.string().url("Invalid image URL").optional(),
      imagePath: z.string().optional(),
      isActive: z.boolean().optional(),
      displayOrder: z
        .number()
        .min(0, "Display order must be 0 or greater")
        .optional(),
    });

    const updateData = heroSectionSchema.parse(body);

    // Check if hero section exists
    const existingHeroSection = await HeroSection.findById(heroSectionId);
    if (!existingHeroSection) {
      return NextResponse.json(
        { error: "Hero section not found" },
        { status: 404 }
      );
    }

    // If displayOrder is being updated, check for conflicts
    if (
      updateData.displayOrder !== undefined &&
      updateData.displayOrder !== existingHeroSection.displayOrder
    ) {
      const conflictingHeroSection = await HeroSection.findOne({
        displayOrder: updateData.displayOrder,
        isActive: true,
        _id: { $ne: heroSectionId }, // Exclude the current hero section
      });

      if (conflictingHeroSection) {
        return NextResponse.json(
          { error: "Display order already exists for an active hero section" },
          { status: 400 }
        );
      }
    }

    // Update the hero section
    const updatedHeroSection = await HeroSection.findByIdAndUpdate(
      heroSectionId,
      {
        ...updateData,
        updatedBy: userId,
      },
      { new: true, runValidators: true }
    );

    const transformedHeroSection = transformHeroSectionToResponse(
      updatedHeroSection!
    );

    return NextResponse.json({
      success: true,
      data: transformedHeroSection,
      message: "Hero section updated successfully",
    });
  } catch (error) {
    console.error("Error updating hero section:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update hero section" },
      { status: 500 }
    );
  }
}

// DELETE /api/hero-section/[id] - Delete a hero section
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params before using its properties (Next.js 15 requirement)
    const { id: heroSectionId } = await params;

    if (!mongoose.isValidObjectId(heroSectionId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    await dbConnect();

    // Check if hero section exists
    const existingHeroSection = await HeroSection.findById(heroSectionId);
    if (!existingHeroSection) {
      return NextResponse.json(
        { error: "Hero section not found" },
        { status: 404 }
      );
    }

    // Delete the hero section
    await HeroSection.findByIdAndDelete(heroSectionId);

    return NextResponse.json({
      success: true,
      message: "Hero section deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting hero section:", error);
    return NextResponse.json(
      { error: "Failed to delete hero section" },
      { status: 500 }
    );
  }
}
