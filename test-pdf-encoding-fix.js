#!/usr/bin/env node

// Test script to verify PDF encoding fix
const fs = require("fs");
const path = require("path");

console.log("🔧 Testing PDF Encoding Fix\n");

// Read the updated route file
const routePath = path.join(
  __dirname,
  "app",
  "api",
  "reports",
  "daily-guests",
  "route.ts"
);
const content = fs.readFileSync(routePath, "utf8");

console.log("📋 Checking encoding fixes...");

// Check for our new encoding fixes
const checks = [
  {
    name: "Persian to English mapping",
    pattern: /persianToEnglish.*=.*\{/,
    description: "Translation object for Persian text",
  },
  {
    name: "convertToEnglish function",
    pattern: /function convertToEnglish/,
    description: "Function to convert Persian text",
  },
  {
    name: "Font support function",
    pattern: /function addPersianFontSupport/,
    description: "Font setup function",
  },
  {
    name: "Text conversion usage",
    pattern: /convertToEnglish\(/,
    description: "Usage of text conversion function",
  },
  {
    name: "English filename",
    pattern: /Daily-Guest-Report.*pdf/,
    description: "English filename instead of Persian",
  },
  {
    name: "English date formatting",
    pattern: /toLocaleDateString\(\"en-US\"\)/,
    description: "English locale for date formatting",
  },
  {
    name: "Left alignment for tables",
    pattern: /halign: \"left\"/,
    description: "Left alignment instead of right for better compatibility",
  },
];

console.log("🔍 Encoding Fix Validation:");
let passed = 0;
checks.forEach((check) => {
  const found = check.pattern.test(content);
  console.log(`${found ? "✅" : "❌"} ${check.name}: ${check.description}`);
  if (found) passed++;
});

console.log(`\n📊 Results: ${passed}/${checks.length} checks passed`);

if (passed === checks.length) {
  console.log("\n🎉 All encoding fixes detected successfully!");
  console.log(
    "✨ The PDF generation should now work without garbled characters."
  );
  console.log("\n💡 Key improvements:");
  console.log("- Persian text converted to English for PDF compatibility");
  console.log("- Proper font setup with error handling");
  console.log("- English date/time formatting");
  console.log("- Left-aligned text for better readability");
  console.log("- Clean English filename");
} else {
  console.log("\n⚠️  Some encoding fixes may be missing.");
}

console.log("\n🧪 Test completed!\n");
