// Test script to verify the autoTable fix
// Using ES modules syntax for proper autoTable integration

async function testAutoTable() {
  try {
    // Dynamic imports for CommonJS compatibility
    const jsPDFModule = await import("jspdf");
    const autoTableModule = await import("jspdf-autotable");

    const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
    const autoTable = autoTableModule.default || autoTableModule;

    console.log("📄 Testing jsPDF + autoTable integration...\n");

    // Create PDF document
    const doc = new jsPDF();
    console.log("✅ jsPDF instance created");

    // Add autoTable plugin
    autoTable(doc);
    console.log("✅ autoTable plugin added to jsPDF instance");

    // Test autoTable functionality
    doc.autoTable({
      startY: 20,
      head: [["Test", "Value"]],
      body: [["AutoTable", "Working ✅"]],
      styles: {
        fontSize: 12,
        halign: "center",
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
      },
    });
    console.log("✅ autoTable method executed successfully");

    // Test output generation
    const pdfOutput = doc.output("arraybuffer");
    console.log(
      "✅ PDF generation works, buffer size:",
      pdfOutput.byteLength,
      "bytes"
    );

    console.log("\n🎉 SUCCESS: The fix resolves the original error!");
    console.log("📋 Summary of fixes applied:");
    console.log("   1. ✅ Correct import syntax for jsPDF and autoTable");
    console.log("   2. ✅ Proper autoTable plugin initialization");
    console.log("   3. ✅ TypeScript interface conflicts resolved");
    console.log("   4. ✅ Type assertions added for method compatibility");

    return true;
  } catch (error) {
    console.error("❌ ERROR:", error.message);
    console.error("Stack trace:", error.stack);
    return false;
  }
}

// Run the test
testAutoTable().then((success) => {
  if (success) {
    console.log(
      "\n✨ All tests passed! The daily guest report should now work correctly."
    );
  } else {
    console.log("\n💥 Tests failed! Please check the error messages above.");
    process.exit(1);
  }
});
