// models/Inventory.ts
import mongoose, { Schema } from "mongoose";
import { IInventory } from "./types";

const inventorySchema = new Schema<IInventory>(
  {
    itemName: { type: String, required: true },
    category: { type: String, required: true },
    unit: { type: String, required: true },
    currentStock: { type: Schema.Types.Decimal128, required: true },
    minStock: Schema.Types.Decimal128,
    maxStock: Schema.Types.Decimal128,
    unitCost: Schema.Types.Decimal128,
    supplier: String,
    location: String,
    notes: String,
    isActive: { type: Boolean, default: true },
    lastRestocked: Date,
    createdBy: { type: String, ref: "User" },
    updatedBy: { type: String, ref: "User" },

    transactions: [
      {
        type: {
          type: String,
          enum: ["in", "out", "adjustment"],
          required: true,
        },
        quantity: { type: Schema.Types.Decimal128, required: true },
        unitCost: Schema.Types.Decimal128,
        totalCost: Schema.Types.Decimal128,
        referenceType: String,
        referenceId: Schema.Types.ObjectId,
        notes: String,
        performedBy: { type: String, ref: "User" },
        transactionDate: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

inventorySchema.index({ category: 1 });
inventorySchema.index({ currentStock: 1 });

// Check if model already exists to prevent overwriting during hot reloads
const Inventory =
  mongoose.models.Inventory ||
  mongoose.model<IInventory>("Inventory", inventorySchema);

export { Inventory };
export default Inventory;
