import mongoose from "mongoose";

/**
 * Convert MongoDB Decimal128, Date, and ObjectId to plain JavaScript types
 */
export function convertMongoData(data: any): any {
  if (!data) return data;

  // Handle Date objects - preserve them or convert to ISO string
  if (data instanceof Date) {
    return data.toISOString();
  }

  // Handle Decimal128
  if (data instanceof mongoose.Types.Decimal128) {
    // Use toString() and parseFloat instead of toNumber()
    const strValue = data.toString();
    const num = parseFloat(strValue);
    return isNaN(num) ? 0 : num;
  }

  // Handle ObjectId
  if (data instanceof mongoose.Types.ObjectId) {
    return data.toString();
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => convertMongoData(item));
  }

  // Handle objects
  if (typeof data === "object" && data !== null) {
    const result: any = {};
    for (const key in data) {
      if (key === "_id" && data[key] instanceof mongoose.Types.ObjectId) {
        result[key] = data[key].toString();
      } else if (data[key] instanceof mongoose.Types.Decimal128) {
        // Handle Decimal128
        const strValue = data[key].toString();
        const num = parseFloat(strValue);
        result[key] = isNaN(num) ? 0 : num;
      } else if (data[key] instanceof mongoose.Types.ObjectId) {
        result[key] = data[key].toString();
      } else if (data[key] instanceof Date) {
        // Handle Date objects in nested objects
        result[key] = data[key].toISOString();
      } else if (typeof data[key] === "object") {
        result[key] = convertMongoData(data[key]);
      } else {
        result[key] = data[key];
      }
    }
    return result;
  }

  return data;
}

/**
 * Check if value is Decimal128
 */
export function isDecimal128(value: any): value is mongoose.Types.Decimal128 {
  return value && value._bsontype === "Decimal128";
}

/**
 * Convert Decimal128 to number
 */
export function decimal128ToNumber(decimal: mongoose.Types.Decimal128): number {
  const strValue = decimal.toString();
  const num = parseFloat(strValue);
  return isNaN(num) ? 0 : num;
}

/**
 * Sanitize expense data before saving
 */
export function sanitizeExpenseData(data: any): any {
  const sanitized = { ...data };

  // Ensure amount is a valid number
  if (sanitized.amount !== undefined) {
    const amount = parseFloat(sanitized.amount);
    sanitized.amount =
      isNaN(amount) || !isFinite(amount) || amount < 0 ? 0 : amount;
  }

  // Ensure valid currency
  if (sanitized.currency && sanitized.currency.length !== 3) {
    sanitized.currency = "USD";
  }

  // Ensure valid date
  if (sanitized.expenseDate) {
    const date = new Date(sanitized.expenseDate);
    sanitized.expenseDate = isNaN(date.getTime()) ? new Date() : date;
  }

  return sanitized;
}
