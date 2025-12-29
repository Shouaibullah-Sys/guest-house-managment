// lib/db/transactions.ts - Transaction support
import mongoose, { ClientSession, ClientSessionOptions } from "mongoose";
import { Booking, Room } from "../../models";

/**
 * Execute operations within a MongoDB transaction
 * @param operations Function containing operations to execute in transaction
 * @param sessionOptions Optional session options
 */
export async function withTransaction<T>(
  operations: (session: ClientSession) => Promise<T>,
  sessionOptions?: ClientSessionOptions
): Promise<T> {
  const session = await mongoose.startSession(sessionOptions);

  try {
    let result: T;

    await session.withTransaction(async () => {
      result = await operations(session);
    });

    return result!;
  } finally {
    await session.endSession();
  }
}

/**
 * Execute operations within a MongoDB transaction with automatic retry
 * @param operations Function containing operations to execute in transaction
 * @param maxRetries Maximum number of retry attempts
 * @param sessionOptions Optional session options
 */
export async function withTransactionRetry<T>(
  operations: (session: ClientSession) => Promise<T>,
  maxRetries: number = 3,
  sessionOptions?: ClientSessionOptions
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withTransaction(operations, sessionOptions);
    } catch (error) {
      lastError = error as Error;

      // Only retry on transient errors (not validation errors)
      if (attempt === maxRetries || !isTransientError(error)) {
        throw error;
      }

      console.log(`Transaction attempt ${attempt} failed, retrying...`);
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 100)
      );
    }
  }

  throw lastError!;
}

/**
 * Check if an error is transient and can be retried
 */
function isTransientError(error: any): boolean {
  const transientErrors = [
    "MongoNetworkError",
    "MongoServerError",
    "MongoWriteConcernError",
    "MongoTimeoutError",
  ];

  return transientErrors.some(
    (errorType) =>
      error.name === errorType ||
      error.message?.includes("writeConcern") ||
      error.message?.includes("network")
  );
}

/**
 * Create a transaction session with specific options
 */
export async function createTransactionSession(
  options?: ClientSessionOptions
): Promise<ClientSession> {
  return mongoose.startSession(options);
}

/**
 * Execute multiple operations in parallel within a single transaction
 * @param operations Array of functions to execute in parallel
 * @param sessionOptions Optional session options
 */
export async function withParallelTransaction<T>(
  operations: Array<(session: ClientSession) => Promise<T>>,
  sessionOptions?: ClientSessionOptions
): Promise<T[]> {
  return withTransaction(async (session) => {
    return Promise.all(operations.map((op) => op(session)));
  }, sessionOptions);
}

// Example usage
export async function createBookingWithServices(
  bookingData: any,
  services: Array<{
    service: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    unitPrice: mongoose.Types.Decimal128;
    totalPrice: mongoose.Types.Decimal128;
    date: Date;
    notes?: string;
    addedBy: string;
  }>
) {
  return withTransaction(async (session) => {
    // Create booking
    const booking = new Booking(bookingData);

    // Add services to the booking's services array
    booking.services = services.map((service) => ({
      ...service,
      createdAt: new Date(),
    }));

    await booking.save({ session });

    // Update room status
    await Room.findByIdAndUpdate(
      bookingData.room,
      { status: "occupied", currentBooking: booking._id },
      { session }
    );

    return booking;
  });
}
