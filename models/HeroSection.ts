// models/HeroSection.ts
import mongoose, { Schema, models } from "mongoose";
import { IHeroSection } from "./types";

const HeroSectionSchema = new Schema<IHeroSection>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [100, "Location cannot be more than 100 characters"],
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    imagePath: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      required: [true, "Display order is required"],
      min: [0, "Display order must be 0 or greater"],
    },
    createdBy: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
HeroSectionSchema.index({ isActive: 1, displayOrder: 1 });
HeroSectionSchema.index({ displayOrder: 1 });

// Ensure unique display order for active items
HeroSectionSchema.index(
  { displayOrder: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

export const HeroSection =
  models.HeroSection || mongoose.model<IHeroSection>("HeroSection", HeroSectionSchema);