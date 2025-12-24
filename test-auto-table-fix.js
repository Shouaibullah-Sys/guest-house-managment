const jsPDF = require("jspdf");
const autoTable = require("jspdf-autotable");

try {
  // Test basic jsPDF and autoTable integration
  console.log("Testing jsPDF autotable integration...");

  const doc = new jsPDF();

  // Test data
  const testData = [
    ["Test 1", "Value 1"],
    ["Test 2", "Value 2"],
    ["Test 3", "Value 3"],
  ];

  // Test the fixed autoTable call
  autoTable(doc, {
    head: [["Column 1", "Column 2"]],
    body: testData,
    startY: 20,
    styles: {
      fontSize: 10,
      halign: "center",
    },
  });

  // Verify that the table was created
  if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
    console.log("✅ SUCCESS: autoTable integration working correctly");
    console.log(
      "Table created successfully, final Y position:",
      doc.lastAutoTable.finalY
    );
  } else {
    console.log("❌ FAILED: autoTable did not create table properly");
  }
} catch (error) {
  console.log("❌ ERROR:", error.message);
}
