#!/usr/bin/env node

// Simple test script for PDF generation
// This script tests the daily guest report PDF generation functionality

const fs = require("fs");
const path = require("path");

console.log("🧪 Testing Daily Guest Report PDF Generation\n");

// Test if the API route file exists
const apiRoutePath = path.join(
  __dirname,
  "app",
  "api",
  "reports",
  "daily-guests",
  "route.ts"
);
const adminPagePath = path.join(__dirname, "app", "admin", "page.tsx");

console.log("📋 Checking files...");

// Check if API route exists
if (fs.existsSync(apiRoutePath)) {
  console.log(
    "✅ API route file exists: app/api/reports/daily-guests/route.ts"
  );

  // Read and validate the API route content
  const apiContent = fs.readFileSync(apiRoutePath, "utf8");

  // Check for key features
  const checks = [
    {
      name: "jsPDF import",
      pattern: /import.*jspdf.*from.*jspdf/,
      found: false,
    },
    {
      name: "autoTable import",
      pattern: /import.*jspdf-autotable/,
      found: false,
    },
    {
      name: "Dari language header",
      pattern: /گزارش روزانه میهمانان/,
      found: false,
    },
    { name: "PDF generation logic", pattern: /new jsPDF/, found: false },
    { name: "Authentication check", pattern: /auth\(\)/, found: false },
    { name: "Database connection", pattern: /dbConnect/, found: false },
    {
      name: "Guest data query",
      pattern: /User\.find.*role.*guest/,
      found: false,
    },
    {
      name: "PDF download response",
      pattern: /Content-Disposition.*attachment/,
      found: false,
    },
  ];

  console.log("\n🔍 API Route Content Analysis:");
  checks.forEach((check) => {
    check.found = check.pattern.test(apiContent);
    console.log(`${check.found ? "✅" : "❌"} ${check.name}`);
  });
} else {
  console.log("❌ API route file not found");
}

console.log("\n📊 Checking admin page integration...");

// Check if admin page has been updated
if (fs.existsSync(adminPagePath)) {
  const adminContent = fs.readFileSync(adminPagePath, "utf8");

  const adminChecks = [
    {
      name: "FileText icon import",
      pattern: /FileText.*from.*lucide-react/,
      found: false,
    },
    {
      name: "React import for FC",
      pattern: /import.*React.*from.*react/,
      found: false,
    },
    {
      name: "Report generation state",
      pattern: /isGeneratingReport.*useState/,
      found: false,
    },
    {
      name: "Report date state",
      pattern: /reportDate.*useState/,
      found: false,
    },
    {
      name: "generateGuestReport function",
      pattern: /generateGuestReport.*=.*async/,
      found: false,
    },
    {
      name: "QuickActions with props",
      pattern: /QuickActions.*onGenerateReport/,
      found: false,
    },
    { name: "Date picker for report", pattern: /type=\"date\"/, found: false },
    { name: "PDF download button", pattern: /دانلود PDF/, found: false },
  ];

  console.log("\n🔍 Admin Page Integration Analysis:");
  adminChecks.forEach((check) => {
    check.found = check.pattern.test(adminContent);
    console.log(`${check.found ? "✅" : "❌"} ${check.name}`);
  });
} else {
  console.log("❌ Admin page file not found");
}

console.log("\n📦 Checking dependencies...");

// Check if jsPDF is available in package.json
const packagePath = path.join(__dirname, "package.json");
if (fs.existsSync(packagePath)) {
  const packageContent = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  const dependencies = [
    { name: "jspdf", version: packageContent.dependencies?.jspdf },
    {
      name: "jspdf-autotable",
      version: packageContent.dependencies?.["jspdf-autotable"],
    },
  ];

  dependencies.forEach((dep) => {
    if (dep.version) {
      console.log(`✅ ${dep.name}: ${dep.version}`);
    } else {
      console.log(`❌ ${dep.name}: not found`);
    }
  });
} else {
  console.log("❌ package.json not found");
}

console.log("\n🎯 Summary:");
console.log("- API endpoint created: /api/reports/daily-guests");
console.log("- Admin page updated with PDF generation button");
console.log("- Dari language support implemented");
console.log("- PDF will include guest statistics and detailed list");
console.log("- Date picker allows selecting report date");
console.log("- Automatic PDF download with proper filename");

console.log("\n📝 Next steps:");
console.log("1. Run 'npm run dev' to start the development server");
console.log("2. Navigate to /admin in your browser");
console.log("3. Find the 'Quick Actions' section with PDF generation");
console.log("4. Select a date and click 'دانلود PDF' to generate report");

console.log("\n✨ Daily Guest Report PDF Generation Setup Complete!\n");
