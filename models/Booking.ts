// models/Booking.ts
import mongoose, { Schema } from "mongoose";
import { IBooking, BookingStatus, PaymentStatus, PaymentMethod } from "./types";

const bookingSchema = new Schema<IBooking>(
  {
    bookingNumber: { type: String, required: true, unique: true },
    guest: { type: String, ref: "User", required: true },
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    actualCheckIn: Date,
    actualCheckOut: Date,
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 },
    infants: { type: Number, default: 0 },
    totalNights: { type: Number, required: true },
    roomRate: { type: Schema.Types.Decimal128, required: true },
    extraCharges: { type: Schema.Types.Decimal128, default: 0 },
    discount: { type: Schema.Types.Decimal128, default: 0 },
    taxAmount: { type: Schema.Types.Decimal128, default: 0 },
    totalAmount: { type: Schema.Types.Decimal128, required: true },
    paidAmount: { type: Schema.Types.Decimal128, default: 0 },
    outstandingAmount: { type: Schema.Types.Decimal128, default: 0 },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "checked_in",
        "checked_out",
        "cancelled",
        "no_show",
      ] as BookingStatus[],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid", "failed"] as PaymentStatus[],
      default: "pending",
    },
    source: String,
    specialRequests: String,
    notes: String,
    cancellationReason: String,
    cancelledAt: Date,
    createdBy: { type: String, ref: "User" },
    assignedTo: { type: String, ref: "User" },
    billSentAt: Date,

    services: [
      {
        service: { type: Schema.Types.ObjectId, ref: "Service" },
        name: String,
        quantity: { type: Number, default: 1 },
        unitPrice: Schema.Types.Decimal128,
        totalPrice: Schema.Types.Decimal128,
        date: { type: Date, required: true },
        notes: String,
        addedBy: { type: String, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    payments: [
      {
        amount: { type: Schema.Types.Decimal128, required: true },
        paymentMethod: {
          type: String,
          enum: [
            "cash",
            "credit_card",
            "debit_card",
            "bank_transfer",
            "online",
            "wallet",
          ] as PaymentMethod[],
        },
        transactionId: String,
        referenceNumber: String,
        currency: { type: String, default: "AFN" },
        status: {
          type: String,
          enum: ["pending", "partial", "paid", "failed"] as PaymentStatus[],
          default: "pending",
        },
        paymentDate: { type: Date, default: Date.now },
        notes: String,
        processedBy: { type: String, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ guest: 1 });
bookingSchema.index({ room: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ checkInDate: 1 });
bookingSchema.index({ checkOutDate: 1 });
bookingSchema.index({ paymentStatus: 1 });

// Check if model already exists to prevent overwriting during hot reloads
const Booking =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);

export { Booking };
export default Booking;
