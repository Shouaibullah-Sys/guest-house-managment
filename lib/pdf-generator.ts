// lib/pdf-generator.ts
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { LaboratoryTestWithDetails } from "@/types/types";

// Declare jsPDF with autoTable plugin
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
    autoTable: (options: any) => void;
  }
}

export class LabReportPDF {
  private static readonly PRIMARY_COLOR = [25, 118, 210];
  private static readonly SUCCESS_COLOR = [56, 142, 60];
  private static readonly WARNING_COLOR = [237, 108, 2];
  private static readonly DANGER_COLOR = [211, 47, 47];
  private static readonly GRAY_COLOR = [97, 97, 97];

  static generateReport(test: LaboratoryTestWithDetails): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Set document properties
    doc.setProperties({
      title: `Lab Report - ${test.patient?.lastName || "Patient"} - ${
        test.testName
      }`,
      subject: `Laboratory Test Report for ${test.testName}`,
      author: test.laboratoryName || "Medical Laboratory System",
      creator: "Medical Laboratory System v1.0",
    });

    // ===== HEADER SECTION =====
    this.addHeader(doc, test, pageWidth, margin);
    yPosition = 45;

    // ===== PATIENT INFORMATION SECTION =====
    yPosition = this.addPatientInformation(doc, test, margin, yPosition);

    // ===== TEST INFORMATION SECTION =====
    yPosition = this.addTestInformation(doc, test, margin, yPosition);

    // ===== SPECIMEN INFORMATION SECTION =====
    yPosition = this.addSpecimenInformation(doc, test, margin, yPosition);

    // ===== RESULTS SECTION =====
    yPosition = this.addResultsSection(doc, test, margin, yPosition, pageWidth);

    // ===== INTERPRETATION SECTION =====
    yPosition = this.addInterpretationSection(
      doc,
      test,
      margin,
      yPosition,
      pageWidth
    );

    // ===== TECHNICAL NOTES SECTION =====
    yPosition = this.addTechnicalNotes(doc, test, margin, yPosition, pageWidth);

    // ===== FINANCIAL INFORMATION SECTION =====
    yPosition = this.addFinancialInformation(doc, test, margin, yPosition);

    // ===== FOOTER SECTION =====
    this.addFooter(doc, test, pageWidth);

    return doc;
  }

  private static addHeader(
    doc: jsPDF,
    test: LaboratoryTestWithDetails,
    pageWidth: number,
    margin: number
  ) {
    // Laboratory Header with Background
    doc.setFillColor(
      this.PRIMARY_COLOR[0],
      this.PRIMARY_COLOR[1],
      this.PRIMARY_COLOR[2]
    );
    doc.rect(0, 0, pageWidth, 35, "F");

    // Laboratory Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(
      test.laboratoryName || "MEDICAL LABORATORY CENTER",
      pageWidth / 2,
      15,
      { align: "center" }
    );

    // Laboratory Tagline
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Certified Diagnostic Laboratory Services", pageWidth / 2, 22, {
      align: "center",
    });

    // Contact Information
    doc.setFontSize(8);
    const contactInfo = [
      test.laboratoryAddress || "123 Healthcare Drive, Medical City",
      test.laboratoryContact || "Phone: +1 (555) 123-4567",
      "Email: info@medlab.com • Website: www.medlab.com",
    ];

    contactInfo.forEach((info, index) => {
      doc.text(info, pageWidth / 2, 28 + index * 4, { align: "center" });
    });

    // Report Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LABORATORY TEST REPORT", pageWidth / 2, 42, { align: "center" });

    // Report ID and Dates
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const reportId = test.reportId || `LAB-${test.id}-${new Date().getTime()}`;
    doc.text(`Report ID: ${reportId}`, margin, 50);
    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      pageWidth - margin,
      50,
      { align: "right" }
    );
  }

  private static addPatientInformation(
    doc: jsPDF,
    test: LaboratoryTestWithDetails,
    margin: number,
    yPosition: number
  ): number {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PATIENT INFORMATION", margin, yPosition);

    const patientInfo = [];

    if (test.patient) {
      patientInfo.push(
        ["Full Name:", `${test.patient.firstName} ${test.patient.lastName}`],
        ["Phone Number:", test.patient.phoneNumber],
        [
          "Date of Birth:",
          test.patient.dateOfBirth
            ? new Date(test.patient.dateOfBirth).toLocaleDateString()
            : "Not provided",
        ],
        ["Gender:", test.patient.gender || "Not provided"],
        ["Patient ID:", `PAT-${test.patient.id}`]
      );

      if (test.patient.email) {
        patientInfo.push(["Email:", test.patient.email]);
      }
    }

    autoTable(doc, {
      startY: yPosition + 5,
      margin: { left: margin, right: margin },
      body: patientInfo,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40 },
        1: { fontStyle: "normal" },
      },
    });

    return doc.lastAutoTable?.finalY || yPosition + 10;
  }

  private static addTestInformation(
    doc: jsPDF,
    test: LaboratoryTestWithDetails,
    margin: number,
    yPosition: number
  ): number {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("TEST INFORMATION", margin, yPosition + 10);

    const testInfo = [
      ["Test Name:", test.testName],
      ["Test Type:", test.testType.toUpperCase()],
      ["Test Date:", new Date(test.testDate).toLocaleDateString()],
      ["Status:", this.getStatusBadge(test.status)],
      ["Payment Status:", this.getPaymentStatusBadge(test.paymentStatus)],
    ];

    if (test.doctor) {
      testInfo.push(["Referred By:", `Dr. ${test.doctor.name}`]);
      if (test.doctor.specialization) {
        testInfo.push(["Specialization:", test.doctor.specialization]);
      }
    }

    if (test.technician) {
      testInfo.push(["Laboratory Technician:", test.technician]);
    }

    autoTable(doc, {
      startY: yPosition + 15,
      margin: { left: margin, right: margin },
      body: testInfo,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50 },
        1: { fontStyle: "normal" },
      },
    });

    return doc.lastAutoTable?.finalY || yPosition + 10;
  }

  private static addSpecimenInformation(
    doc: jsPDF,
    test: LaboratoryTestWithDetails,
    margin: number,
    yPosition: number
  ): number {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("SPECIMEN INFORMATION", margin, yPosition + 10);

    const specimenType = this.getSpecimenType(test.testType);
    const collectionTime = new Date(test.testDate);
    const receivedTime = new Date(collectionTime.getTime() + 30 * 60000); // +30 minutes

    const specimenInfo = [
      ["Specimen Type:", specimenType],
      ["Collection Date/Time:", collectionTime.toLocaleString()],
      ["Received Date/Time:", receivedTime.toLocaleString()],
      ["Specimen Condition:", "Satisfactory"],
      ["Test Methodology:", this.getTestMethodology(test.testType)],
    ];

    autoTable(doc, {
      startY: yPosition + 15,
      margin: { left: margin, right: margin },
      body: specimenInfo,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50 },
        1: { fontStyle: "normal" },
      },
    });

    return doc.lastAutoTable?.finalY || yPosition + 10;
  }

  private static addResultsSection(
    doc: jsPDF,
    test: LaboratoryTestWithDetails,
    margin: number,
    yPosition: number,
    pageWidth: number
  ): number {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("LABORATORY RESULTS", margin, yPosition + 10);

    const resultsData = this.generateTestResults(test);

    autoTable(doc, {
      startY: yPosition + 15,
      margin: { left: margin, right: margin },
      head: [["Test Parameter", "Result", "Units", "Reference Range", "Flags"]],
      body: resultsData,
      theme: "grid",
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 60 },
        1: { fontStyle: "bold", cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 45 },
        4: { cellWidth: 20, halign: "center" },
      },
      didParseCell: (data: any) => {
        if (data.section === "body" && data.row.index % 2 === 0) {
          data.cell.styles.fillColor = [245, 245, 245];
        }

        // Highlight abnormal values
        if (data.column.index === 4 && data.cell.raw) {
          if (data.cell.raw === "HIGH" || data.cell.raw === "LOW") {
            data.cell.styles.textColor = this.DANGER_COLOR;
            data.cell.styles.fontStyle = "bold";
          }
        }

        if (data.column.index === 1 && data.cell.raw) {
          const flag = data.row.cells[4].raw;
          if (flag === "HIGH" || flag === "LOW") {
            data.cell.styles.textColor = this.DANGER_COLOR;
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    return doc.lastAutoTable?.finalY || yPosition + 10;
  }

  private static addInterpretationSection(
    doc: jsPDF,
    test: LaboratoryTestWithDetails,
    margin: number,
    yPosition: number,
    pageWidth: number
  ): number {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("INTERPRETATION & COMMENTS", margin, yPosition + 10);

    const interpretation = this.generateInterpretation(test);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const interpretationLines = doc.splitTextToSize(
      interpretation,
      pageWidth - 2 * margin
    );
    doc.text(interpretationLines, margin, yPosition + 18);

    return yPosition + 18 + interpretationLines.length * 4 + 5;
  }

  private static addTechnicalNotes(
    doc: jsPDF,
    test: LaboratoryTestWithDetails,
    margin: number,
    yPosition: number,
    pageWidth: number
  ): number {
    if (!test.notes) return yPosition;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("TECHNICAL NOTES", margin, yPosition + 10);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const notesLines = doc.splitTextToSize(test.notes, pageWidth - 2 * margin);
    doc.text(notesLines, margin, yPosition + 18);

    return yPosition + 18 + notesLines.length * 4 + 5;
  }

  private static addFinancialInformation(
    doc: jsPDF,
    test: LaboratoryTestWithDetails,
    margin: number,
    yPosition: number
  ): number {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("FINANCIAL INFORMATION", margin, yPosition + 10);

    const balance = (test.amountCharged || 0) - (test.amountPaid || 0);

    const financialInfo = [
      ["Amount Charged:", `$${(test.amountCharged || 0).toFixed(2)}`],
      ["Amount Paid:", `$${(test.amountPaid || 0).toFixed(2)}`],
      ["Balance Due:", `$${balance.toFixed(2)}`],
      ["Payment Status:", this.getPaymentStatusBadge(test.paymentStatus)],
    ];

    autoTable(doc, {
      startY: yPosition + 15,
      margin: { left: margin, right: margin },
      body: financialInfo,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40 },
        1: { fontStyle: "normal", halign: "right" },
      },
      didParseCell: (data: any) => {
        if (data.column.index === 1) {
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    return doc.lastAutoTable?.finalY || yPosition + 10;
  }

  private static addFooter(
    doc: jsPDF,
    test: LaboratoryTestWithDetails,
    pageWidth: number
  ) {
    const footerY = doc.internal.pageSize.getHeight() - 25;

    // Disclaimer
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(
      this.GRAY_COLOR[0],
      this.GRAY_COLOR[1],
      this.GRAY_COLOR[2]
    );

    const disclaimer =
      "This report is intended for use by qualified healthcare professionals only. " +
      "Results should be interpreted in the context of the patient's clinical condition. " +
      "This document is electronically generated and does not require a signature.";

    const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 40);
    doc.text(disclaimerLines, pageWidth / 2, footerY, { align: "center" });

    // Page number
    doc.setFontSize(8);
    doc.text(`Page 1 of 1`, pageWidth / 2, footerY + 15, { align: "center" });

    // Generation timestamp
    doc.text(
      `Generated: ${new Date().toLocaleString()}`,
      pageWidth / 2,
      footerY + 20,
      { align: "center" }
    );
  }

  // ===== HELPER METHODS =====

  private static getStatusBadge(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: "⏳ Pending",
      completed: "✅ Completed",
      cancelled: "❌ Cancelled",
      in_progress: "🔬 In Progress",
    };
    return statusMap[status] || status;
  }

  private static getPaymentStatusBadge(paymentStatus: string): string {
    const statusMap: { [key: string]: string } = {
      pending: "⏳ Pending",
      paid: "✅ Paid",
      partial: "🟡 Partial",
      waived: "🔵 Waived",
    };
    return statusMap[paymentStatus] || paymentStatus;
  }

  private static getSpecimenType(testType: string): string {
    const specimenMap: { [key: string]: string } = {
      blood: "Whole Blood",
      urine: "Urine",
      stool: "Stool",
      biochemistry: "Serum",
      hematology: "Whole Blood",
      microbiology: "Various",
      immunology: "Serum",
      other: "As Specified",
    };
    return specimenMap[testType] || "Not Specified";
  }

  private static getTestMethodology(testType: string): string {
    const methodologyMap: { [key: string]: string } = {
      blood: "Automated Hematology Analyzer",
      urine: "Urinalysis & Microscopy",
      stool: "Macroscopic & Microscopic Examination",
      biochemistry: "Spectrophotometry",
      hematology: "Flow Cytometry",
      microbiology: "Culture & Sensitivity",
      immunology: "ELISA/Immunoassay",
    };
    return methodologyMap[testType] || "Standard Laboratory Method";
  }

  private static generateTestResults(
    test: LaboratoryTestWithDetails
  ): string[][] {
    // This is a comprehensive example - you should replace with actual test data
    const results: string[][] = [];

    // Blood Test Results
    if (test.testType === "blood" || test.testType === "hematology") {
      results.push(
        ["Hemoglobin (Hgb)", "14.2", "g/dL", "13.5-17.5", ""],
        ["White Blood Cells (WBC)", "7.2", "×10³/μL", "4.5-11.0", ""],
        ["Red Blood Cells (RBC)", "4.8", "×10⁶/μL", "4.5-6.0", ""],
        ["Platelets", "250", "×10³/μL", "150-400", ""],
        ["Hematocrit (Hct)", "42.5", "%", "40-52", ""],
        ["MCV", "88.5", "fL", "80-100", ""],
        ["MCH", "29.5", "pg", "27-32", ""],
        ["MCHC", "33.5", "g/dL", "32-36", ""]
      );
    }

    // Biochemistry Results
    if (test.testType === "biochemistry") {
      results.push(
        ["Glucose (Fasting)", "95", "mg/dL", "70-100", ""],
        ["Urea Nitrogen (BUN)", "18", "mg/dL", "7-20", ""],
        ["Creatinine", "0.9", "mg/dL", "0.7-1.3", ""],
        ["Sodium", "140", "mmol/L", "135-145", ""],
        ["Potassium", "4.2", "mmol/L", "3.5-5.1", ""],
        ["Chloride", "102", "mmol/L", "98-107", ""],
        ["Total Protein", "7.2", "g/dL", "6.0-8.3", ""],
        ["Albumin", "4.5", "g/dL", "3.5-5.0", ""]
      );
    }

    // Urine Test Results
    if (test.testType === "urine") {
      results.push(
        ["Color", "Yellow", "", "Yellow", ""],
        ["Appearance", "Clear", "", "Clear", ""],
        ["Specific Gravity", "1.015", "", "1.005-1.030", ""],
        ["pH", "6.0", "", "5.0-8.0", ""],
        ["Protein", "Negative", "", "Negative", ""],
        ["Glucose", "Negative", "", "Negative", ""],
        ["Ketones", "Negative", "", "Negative", ""],
        ["Blood", "Negative", "", "Negative", ""],
        ["Leukocytes", "Negative", "", "Negative", ""]
      );
    }

    // If no specific results, use generic ones
    if (results.length === 0) {
      results.push(
        ["Test Parameter 1", "Normal", "", "Reference Range", ""],
        ["Test Parameter 2", "125", "Units", "100-150", ""],
        ["Test Parameter 3", "45.5", "mg/dL", "40-50", ""]
      );
    }

    // Add actual results from the test object if available
    if (test.results) {
      // Parse and add actual results here
      try {
        const actualResults = JSON.parse(test.results);
        // Merge actual results with template results
      } catch (error) {
        // If results is not JSON, add as a comment
        results.push(["Additional Results", test.results, "", "", "NOTE"]);
      }
    }

    return results;
  }

  private static generateInterpretation(
    test: LaboratoryTestWithDetails
  ): string {
    const baseInterpretation = `The laboratory results have been reviewed and analyzed. `;

    const statusInterpretation =
      test.status === "completed"
        ? `All tested parameters are within established reference ranges unless otherwise specified. `
        : `Results are ${test.status}. `;

    const clinicalContext =
      `These findings should be interpreted in the context of the patient's clinical presentation ` +
      `and medical history. Any significantly abnormal values have been flagged for immediate attention. ` +
      `Correlation with clinical findings is recommended.`;

    return baseInterpretation + statusInterpretation + clinicalContext;
  }

  static downloadReport(test: LaboratoryTestWithDetails): void {
    const doc = this.generateReport(test);
    const patientName = test.patient
      ? `${test.patient.lastName}_${test.patient.firstName}`
      : "patient";
    const fileName = `Lab_Report_${patientName}_${test.testName.replace(
      /\s+/g,
      "_"
    )}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
  }

  static openReportInNewWindow(test: LaboratoryTestWithDetails): void {
    const doc = this.generateReport(test);
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
  }

  static getReportAsBlob(test: LaboratoryTestWithDetails): Blob {
    const doc = this.generateReport(test);
    return doc.output("blob");
  }

  static getReportAsDataURL(test: LaboratoryTestWithDetails): string {
    const doc = this.generateReport(test);
    return doc.output("datauristring");
  }
}
