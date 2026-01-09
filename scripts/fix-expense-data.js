// scripts/fix-expense-data.js
const mongoose = require("mongoose");
require("dotenv").config();

async function fixExpenseData() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/your-database"
    );

    const Expense = require("./models/Expense").Expense;

    console.log("🔍 Checking for invalid expense data...");

    // Find all expenses with potential issues
    const expenses = await Expense.find({});
    let fixedCount = 0;

    for (const expense of expenses) {
      const updates = {};
      let needsUpdate = false;

      // Fix amount
      if (expense.amount && typeof expense.amount === "string") {
        const amount = parseFloat(expense.amount);
        if (!isNaN(amount) && isFinite(amount)) {
          updates.amount = amount;
          needsUpdate = true;
        }
      }

      // Fix currency
      if (!expense.currency || expense.currency.length !== 3) {
        updates.currency = "USD";
        needsUpdate = true;
      }

      // Fix category to match valid values
      const validCategories = [
        "لوازم اداری",
        "خدمات عمومی",
        "حمل و نقل",
        "بازاریابی",
        "نگهداری",
        "سفر",
        "غذا و سرگرمی",
        "بیمه",
        "کرایه",
        "تجهيزات",
        "نرم افزار",
        "خدمات حرفه‌ای",
        "سایر",
      ];

      if (!validCategories.includes(expense.category)) {
        updates.category = "سایر";
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Expense.updateOne({ _id: expense._id }, { $set: updates });
        fixedCount++;
        console.log(`Fixed expense: ${expense.title}`);
      }
    }

    console.log(`✅ Fixed ${fixedCount} expense records`);
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing expense data:", error);
    mongoose.disconnect();
    process.exit(1);
  }
}

fixExpenseData();
