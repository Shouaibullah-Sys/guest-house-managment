// lib/pdf-generator.ts
import { jsPDF } from "jspdf";
import { LaboratoryTestWithDetails } from "@/types/types";

export class LabReportPDF {
  static generateReport(test: LaboratoryTestWithDetails): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LABORATORY TEST REPORT", pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += 10;

    // Laboratory Information
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Laboratory: ${test.laboratoryName || "Medical Laboratory Center"}`,
      20,
      yPosition
    );
    doc.text(
      `Report ID: ${test.reportId || `LAB-${test.id}-${new Date().getTime()}`}`,
      pageWidth - 20,
      yPosition,
      { align: "right" }
    );
    yPosition += 15;

    // Patient Information Section
    doc.setFont("helvetica", "bold");
    doc.text("PATIENT INFORMATION", 20, yPosition);
    yPosition += 8;

    doc.setFont("helvetica", "normal");
    if (test.patient) {
      doc.text(
        `Name: ${test.patient.firstName} ${test.patient.lastName}`,
        20,
        yPosition
      );
      doc.text(`Phone: ${test.patient.phoneNumber}`, pageWidth / 2, yPosition);
      yPosition += 6;

      if (test.patient.dateOfBirth) {
        doc.text(`Date of Birth: ${test.patient.dateOfBirth}`, 20, yPosition);
        yPosition += 6;
      }
      if (test.patient.gender) {
        doc.text(`Gender: ${test.patient.gender}`, 20, yPosition);
        yPosition += 6;
      }
    }
    yPosition += 5;

    // Test Information Section
    doc.setFont("helvetica", "bold");
    doc.text("TEST INFORMATION", 20, yPosition);
    yPosition += 8;

    doc.setFont("helvetica", "normal");
    doc.text(`Test Name: ${test.testName}`, 20, yPosition);
    doc.text(`Test Type: ${test.testType}`, pageWidth / 2, yPosition);
    yPosition += 6;

    doc.text(
      `Test Date: ${new Date(test.testDate).toLocaleDateString()}`,
      20,
      yPosition
    );
    doc.text(`Status: ${test.status}`, pageWidth / 2, yPosition);
    yPosition += 6;

    if (test.doctor) {
      doc.text(`Referred By: Dr. ${test.doctor.name}`, 20, yPosition);
      if (test.doctor.specialization) {
        doc.text(
          `Specialization: ${test.doctor.specialization}`,
          pageWidth / 2,
          yPosition
        );
      }
      yPosition += 6;
    }

    if (test.technician) {
      doc.text(`Technician: ${test.technician}`, 20, yPosition);
      yPosition += 6;
    }
    yPosition += 5;

    // Results Section
    doc.setFont("helvetica", "bold");
    doc.text("TEST RESULTS", 20, yPosition);
    yPosition += 8;

    doc.setFont("helvetica", "normal");
    if (test.results) {
      const resultsLines = doc.splitTextToSize(test.results, pageWidth - 40);
      doc.text(resultsLines, 20, yPosition);
      yPosition += resultsLines.length * 6;
    } else {
      doc.text("No detailed results available.", 20, yPosition);
      yPosition += 6;
    }
    yPosition += 5;

    // Financial Information
    doc.setFont("helvetica", "bold");
    doc.text("FINANCIAL INFORMATION", 20, yPosition);
    yPosition += 8;

    doc.setFont("helvetica", "normal");
    doc.text(`Amount Charged: $${test.amountCharged || 0}`, 20, yPosition);
    doc.text(`Amount Paid: $${test.amountPaid || 0}`, pageWidth / 2, yPosition);
    yPosition += 6;

    doc.text(`Payment Status: ${test.paymentStatus}`, 20, yPosition);
    doc.text(
      `Balance: $${(test.amountCharged || 0) - (test.amountPaid || 0)}`,
      pageWidth / 2,
      yPosition
    );
    yPosition += 10;

    // Notes Section
    if (test.notes) {
      doc.setFont("helvetica", "bold");
      doc.text("ADDITIONAL NOTES", 20, yPosition);
      yPosition += 8;

      doc.setFont("helvetica", "normal");
      const notesLines = doc.splitTextToSize(test.notes, pageWidth - 40);
      doc.text(notesLines, 20, yPosition);
      yPosition += notesLines.length * 6;
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(8);
    doc.text(
      `Report generated on: ${new Date().toLocaleString()}`,
      pageWidth / 2,
      footerY,
      { align: "center" }
    );

    return doc;
  }

  static downloadReport(test: LaboratoryTestWithDetails): void {
    const doc = this.generateReport(test);
    const fileName = `lab-report-${test.patient?.lastName || "patient"}-${
      test.testName
    }-${new Date().getTime()}.pdf`;
    doc.save(fileName);
  }
}
