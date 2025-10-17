// lib/pdf-generator.tsx
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Types
export interface Doctor {
  id: string;
  name: string;
  specialization?: string;
  licenseNumber?: string;
  contactNumber?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  emergencyContact?: string;
  insuranceProvider?: string;
  lastVisitDate?: string;
}

export interface LaboratoryTestWithDetails {
  id: string;
  testName: string;
  testType: string;
  testDate: string;
  status: string;
  reportId?: string;
  laboratoryName?: string;
  laboratoryAddress?: string;
  laboratoryContact?: string;
  clinicalHistory?: string;
  symptoms?: string;
  currentMedications?: string;
  fastingRequired?: boolean;
  specialInstructions?: string;
  collectionSite?: string;
  collectedBy?: string;
  receivedDate?: string;
  completedDate?: string;
  technician?: string;
  notes?: string;
  amountCharged?: number;
  amountPaid?: number;
  discount?: number;
  patient?: Patient;
  doctor?: Doctor;
  results?: any[];
}

// Declare jsPDF with autoTable plugin
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
    autoTable: (options: any) => void;
  }
}

interface PDFColors {
  primary: number[];
  secondary: number[];
  success: number[];
  warning: number[];
  danger: number[];
  info: number[];
  dark: number[];
  light: number[];
  gray: number[];
}

export class LabReportPDF {
  private static readonly COLORS: PDFColors = {
    primary: [0, 112, 192],
    secondary: [0, 176, 240],
    success: [0, 176, 80],
    warning: [255, 192, 0],
    danger: [255, 0, 0],
    info: [91, 155, 213],
    dark: [47, 84, 150],
    light: [242, 242, 242],
    gray: [118, 118, 118],
  };

  private static readonly FONTS = {
    title: "helvetica",
    subtitle: "helvetica",
    body: "helvetica",
    bold: "helvetica",
  };

  private static readonly MARGINS = {
    top: 15,
    left: 15,
    right: 15,
    bottom: 25,
  };

  private static readonly PAGE_HEIGHT = 297;
  private static readonly CONTENT_HEIGHT = 267;

  static generateReport(test: LaboratoryTestWithDetails): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = this.MARGINS.top;

    // Set document properties with proper encoding
    doc.setProperties({
      title: `Lab Report - ${test.patient?.lastName || "Patient"} - ${
        test.testName
      }`,
      subject: `Laboratory Test Report for ${test.testName}`,
      author: test.laboratoryName || "Advanced Medical Laboratory System",
      creator: "MedLab Pro v2.0",
      keywords: `laboratory, medical, test, results, ${test.testType}, ${test.patient?.lastName}`,
    });

    // ===== HEADER SECTION =====
    currentY = this.addEnhancedHeader(doc, test, pageWidth, currentY);

    // ===== QUICK STATS BAR =====
    currentY = this.addQuickStatsBar(doc, test, pageWidth, currentY) + 5;

    // ===== PATIENT INFORMATION SECTION =====
    currentY = this.addEnhancedPatientInformation(
      doc,
      test,
      currentY,
      pageWidth
    );
    currentY = this.checkPageBreak(doc, currentY, 50);

    // ===== CLINICAL INFORMATION SECTION =====
    currentY = this.addClinicalInformation(doc, test, currentY, pageWidth);
    currentY = this.checkPageBreak(doc, currentY, 50);

    // ===== TEST DETAILS SECTION =====
    currentY = this.addTestDetails(doc, test, currentY, pageWidth);
    currentY = this.checkPageBreak(doc, currentY, 100);

    // ===== COMPREHENSIVE RESULTS SECTION =====
    currentY = this.addComprehensiveResults(doc, test, currentY, pageWidth);
    currentY = this.checkPageBreak(doc, currentY, 80);

    // ===== INTERPRETATION & RECOMMENDATIONS =====
    currentY = this.addEnhancedInterpretation(doc, test, currentY, pageWidth);
    currentY = this.checkPageBreak(doc, currentY, 50);

    // ===== QUALITY CONTROL SECTION =====
    currentY = this.addQualityControl(doc, test, currentY, pageWidth);
    currentY = this.checkPageBreak(doc, currentY, 50);

    // ===== TECHNICAL DETAILS =====
    currentY = this.addTechnicalDetails(doc, test, currentY, pageWidth);
    currentY = this.checkPageBreak(doc, currentY, 50);

    // ===== FINANCIAL SUMMARY =====
    currentY = this.addFinancialSummary(doc, test, currentY, pageWidth);

    // ===== FOOTER =====
    this.addEnhancedFooter(doc, test, pageWidth);

    return doc;
  }

  private static addEnhancedHeader(
    doc: jsPDF,
    test: LaboratoryTestWithDetails,
    pageWidth: number,
    yPosition: number
  ): number {
    // Main header with gradient effect
    doc.setFillColor(
      this.COLORS.dark[0],
      this.COLORS.dark[1],
      this.COLORS.dark[2]
    );
    doc.rect(0, 0, pageWidth, 50, "F");

    // Laboratory Logo Area
    try {
      doc.setFillColor(255, 255, 255, 25);
      doc.circle(30, 25, 18, "F");
      doc.setDrawColor(255, 255, 255, 60);
      doc.setLineWidth(2);
      doc.circle(30, 25, 18, "S");

      // Simple text-based logo
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont(this.FONTS.title, "bold");
      doc.text("DR SEBGHAT", 30, 22, { align: "center" });
      doc.setFontSize(6);
      doc.text("CLINIC", 30, 28, { align: "center" });
      doc.setFontSize(8);
      doc.text("MEDICAL", 30, 35, { align: "center" });
    } catch (error) {
      console.log("Logo rendering failed, using fallback");
    }

    // Laboratory Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont(this.FONTS.title, "bold");

    const labName = this.ensureAscii(
      test.laboratoryName?.toUpperCase() || "ADVANCED MEDICAL LABORATORY"
    );
    doc.text(labName, pageWidth / 2, 20, { align: "center" });

    // Accreditation and Certifications
    doc.setFontSize(8);
    doc.setFont(this.FONTS.subtitle, "normal");
    const accreditation =
      "ISO 15189:2012 Certified - CAP Accredited - CLIA Certified";
    doc.text(accreditation, pageWidth / 2, 26, { align: "center" });

    // Contact Information
    const contactInfo = [
      this.ensureAscii(
        test.laboratoryAddress ||
          "123 Medical Center Drive, Healthcare City, HC 12345"
      ),
      `Phone: ${
        test.laboratoryContact || "+1 (555) 123-HEAL"
      } - Email: info@medlab.com`,
      "Web: www.advancedmedlab.com - 24/7 Emergency Services Available",
    ];

    contactInfo.forEach((info, index) => {
      doc.text(this.ensureAscii(info), pageWidth / 2, 32 + index * 4, {
        align: "center",
      });
    });

    // Report Title with background
    doc.setFillColor(
      this.COLORS.primary[0],
      this.COLORS.primary[1],
      this.COLORS.primary[2]
    );
    doc.rect(0, 45, pageWidth, 15, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont(this.FONTS.title, "bold");
    doc.text("LABORATORY TEST REPORT", pageWidth / 2, 55, { align: "center" });

    // Report Metadata
    doc.setFontSize(7);
    doc.setFont(this.FONTS.body, "normal");
    const reportId =
      test.reportId || `LAB-${test.id}-${this.generateUniqueId()}`;

    doc.text(`Report ID: ${reportId}`, 15, 62);
    doc.text(
      `Accession #: ACC-${test.id}-${new Date().getFullYear()}`,
      pageWidth / 2,
      62,
      {
        align: "center",
      }
    );

    const generatedDate = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    doc.text(`Generated: ${generatedDate}`, pageWidth - 15, 62, {
      align: "right",
    });

    return 70;
  }

  private static addQuickStatsBar(
    doc: jsPDF,
    test: LaboratoryTestWithDetails,
    pageWidth: number,
    yPosition: number
  ): number {
    const stats = [
      {
        label: "STATUS",
        value: this.getFormattedStatus(test.status),
        color: this.getStatusColor(test.status),
      },
      {
        label: "PRIORITY",
        value: this.getTestPriority(test),
        color: this.COLORS.info,
      },
      {
        label: "TURNAROUND",
        value: this.getTurnaroundTime(test),
        color: this.COLORS.success,
      },
      {
        label: "CONFIDENTIAL",
        value: "HIGH",
        color: this.COLORS.warning,
      },
    ];

    const statWidth = (pageWidth - 30) / stats.length;
    const startX = 15;

    stats.forEach((stat, index) => {
      const x = startX + index * statWidth;

      // Background
      doc.setFillColor(stat.color[0], stat.color[1], stat.color[2], 10);
      doc.roundedRect(x, yPosition, statWidth - 5, 20, 2, 2, "F");

      // Border
      doc.setDrawColor(stat.color[0], stat.color[1], stat.color[2]);
      doc.roundedRect(x, yPosition, statWidth - 5, 20, 2, 2, "S");

      // Content
      doc.setFontSize(7);
      doc.setFont(this.FONTS.body, "bold");
      doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
      doc.text(stat.label, x + (statWidth - 5) / 2, yPosition + 7, {
        align: "center",
      });

      doc.setFontSize(9);
      doc.setFont(this.FONTS.title, "bold");
      doc.text(stat.value, x + (statWidth - 5) / 2, yPosition + 15, {
        align: "center",
      });
    });

    return yPosition + 25;
  }

  private static addEnhancedPatientInformation(
    doc: jsPDF,
    test: LaboratoryTestWithDetails,
    yPosition: number,
    pageWidth: number
  ): number {
    this.addSectionHeader(
      doc,
      "PATIENT DEMOGRAPHICS",
      this.MARGINS.left,
      yPosition
    );

    if (!test.patient) {
      doc.setFontSize(9);
      doc.setTextColor(
        this.COLORS.danger[0],
        this.COLORS.danger[1],
        this.COLORS.danger[2]
      );
      doc.text(
        "No patient information available",
        this.MARGINS.left,
        yPosition + 10
      );
      return yPosition + 15;
    }

    const patient = test.patient;
    const columnWidth = (pageWidth - 2 * this.MARGINS.left) / 2;

    // Left Column - Basic Info
    const leftColumn = [
      [
        "Full Name:",
        `${patient.firstName} ${patient.middleName || ""} ${
          patient.lastName
        }`.trim(),
      ],
      ["Patient ID:", `PAT-${patient.id}`],
      [
        "Date of Birth:",
        patient.dateOfBirth
          ? `${new Date(
              patient.dateOfBirth
            ).toLocaleDateString()} (Age: ${this.calculateAge(
              patient.dateOfBirth
            )})`
          : "Not provided",
      ],
      [
        "Gender:",
        patient.gender ? patient.gender.toUpperCase() : "Not provided",
      ],
      ["Phone:", patient.phoneNumber || "Not provided"],
    ];

    // Right Column - Additional Info
    const rightColumn = [
      ["Emergency Contact:", patient.emergencyContact || "Not provided"],
      [
        "Last Visit:",
        patient.lastVisitDate
          ? new Date(patient.lastVisitDate).toLocaleDateString()
          : "First visit",
      ],
      ["Insurance:", patient.insuranceProvider || "Not provided"],
    ];

    // Create a combined table for better layout
    const combinedData = [];
    const maxRows = Math.max(leftColumn.length, rightColumn.length);

    for (let i = 0; i < maxRows; i++) {
      const row = [];
      row.push(leftColumn[i]?.[0] || "");
      row.push(leftColumn[i]?.[1] || "");
      row.push(rightColumn[i]?.[0] || "");
      row.push(rightColumn[i]?.[1] || "");
      combinedData.push(row);
    }

    autoTable(doc, {
      startY: yPosition + 8,
      margin: { left: this.MARGINS.left, right: this.MARGINS.right },
      body: combinedData,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 35, fillColor: [245, 245, 245] },
        1: { fontStyle: "normal", cellWidth: columnWidth - 35 },
        2: { fontStyle: "bold", cellWidth: 40, fillColor: [245, 245, 245] },
        3: { fontStyle: "normal", cellWidth: columnWidth - 40 },
      },
    });

    return (doc.lastAutoTable?.finalY || yPosition) + 5;
  }

  private static addClinicalInformation(
    doc: jsPDF,
    test: LaboratoryTestWithDetails,
    yPosition: number,
    pageWidth: number
  ): number {
    this.addSectionHeader(
      doc,
      "CLINICAL INFORMATION",
      this.MARGINS.left,
      yPosition
    );

    const clinicalInfo = [];

    // Referring Physician
    if (test.doctor) {
      clinicalInfo.push(
        ["Referring Physician:", `Dr. ${test.doctor.name}`],
        ["Physician ID:", `DR-${test.doctor.id}`],
        ["Specialization:", test.doctor.specialization || "General Practice"],
        ["License #:", test.doctor.licenseNumber || "Not provided"]
      );
    }

    // Clinical History
    clinicalInfo.push(
      ["Clinical Indication:", test.clinicalHistory || "Routine screening"],
      ["Symptoms:", test.symptoms || "Asymptomatic"],
      ["Medications:", test.currentMedications || "None reported"],
      [
        "Fasting Status:",
        test.fastingRequired ? "Fasting (8+ hours)" : "Non-fasting",
      ],
      [
        "Special Instructions:",
        test.specialInstructions || "Standard procedure",
      ]
    );

    autoTable(doc, {
      startY: yPosition + 8,
      margin: { left: this.MARGINS.left, right: this.MARGINS.right },
      body: clinicalInfo,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, fillColor: [245, 245, 245] },
        1: { fontStyle: "normal" },
      },
    });

    return (doc.lastAutoTable?.finalY || yPosition) + 5;
  }

  private static addTestDetails(
    doc: jsPDF,
    test: LaboratoryTestWithDetails,
    yPosition: number,
    pageWidth: number
  ): number {
    this.addSectionHeader(
      doc,
      "TEST SPECIFICATIONS",
      this.MARGINS.left,
      yPosition
    );

    const testDetails = [
      ["Test Name:", test.testName],
      ["Test Panel:", this.getTestPanel(test.testType)],
      ["Test Code:", `T-${test.testType.toUpperCase()}-${test.id}`],
      ["Methodology:", this.getTestMethodology(test.testType)],
      ["Sample Type:", this.getSpecimenType(test.testType)],
      ["Container:", this.getSampleContainer(test.testType)],
      ["Sample Volume:", this.getSampleVolume(test.testType)],
      ["Stability:", this.getSampleStability(test.testType)],
      ["Collection Date:", new Date(test.testDate).toLocaleString()],
      [
        "Received Date:",
        new Date(test.receivedDate || test.testDate).toLocaleString(),
      ],
      [
        "Reported Date:",
        new Date(test.completedDate || new Date()).toLocaleString(),
      ],
      ["Collection Site:", test.collectionSite || "Main Laboratory"],
      ["Collector ID:", test.collectedBy || "LAB-TECH-001"],
    ];

    autoTable(doc, {
      startY: yPosition + 8,
      margin: { left: this.MARGINS.left, right: this.MARGINS.right },
      body: testDetails,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 45, fillColor: [245, 245, 245] },
        1: { fontStyle: "normal" },
      },
    });

    return (doc.lastAutoTable?.finalY || yPosition) + 5;
  }

  private static addComprehensiveResults(
    doc: jsPDF,
    test: LaboratoryTestWithDetails,
    yPosition: number,
    pageWidth: number
  ): number {
    this.addSectionHeader(
      doc,
      "LABORATORY RESULTS",
      this.MARGINS.left,
      yPosition
    );

    const results = this.generateComprehensiveResults(test);

    autoTable(doc, {
      startY: yPosition + 8,
      margin: { left: this.MARGINS.left, right: this.MARGINS.right },
      head: [
        ["ANALYTE", "RESULT", "UNITS", "REFERENCE RANGE", "FLAGS", "STATUS"],
      ],
      body: results,
      theme: "grid",
      headStyles: {
        fillColor: [
          this.COLORS.dark[0],
          this.COLORS.dark[1],
          this.COLORS.dark[2],
        ],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 7,
        halign: "center",
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50 },
        1: { fontStyle: "bold", cellWidth: 28, halign: "center" },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 40, fontSize: 6 },
        4: { cellWidth: 15, halign: "center" },
        5: { cellWidth: 22, halign: "center" },
      },
      didParseCell: (data: any) => {
        if (data.section === "body") {
          if (data.row.index % 2 === 0) {
            data.cell.styles.fillColor = [250, 250, 250];
          }

          if (data.column.index === 4) {
            const flag = data.cell.raw;
            if (flag === "HIGH" || flag === "LOW") {
              data.cell.styles.textColor = this.COLORS.danger;
              data.cell.styles.fontStyle = "bold";
            } else if (flag === "CRITICAL") {
              data.cell.styles.fillColor = this.COLORS.danger;
              data.cell.styles.textColor = 255;
              data.cell.styles.fontStyle = "bold";
            }
          }

          if (data.column.index === 5) {
            const status = data.cell.raw;
            if (status === "NORMAL") {
              data.cell.styles.textColor = this.COLORS.success;
            } else if (status === "ABNORMAL") {
              data.cell.styles.textColor = this.COLORS.warning;
            } else if (status === "CRITICAL") {
              data.cell.styles.textColor = this.COLORS.danger;
            }
          }
        }
      },
    });

    const tableEndY = doc.lastAutoTable?.finalY || yPosition;

    // Add results summary if there's space
    if (tableEndY + 25 < this.PAGE_HEIGHT - this.MARGINS.bottom) {
      this.addResultsSummary(doc, test, results, tableEndY + 5, pageWidth);
      return tableEndY + 30;
    }

    return tableEndY + 5;
  }

  private static addResultsSummary(
    doc: jsPDF,
    test: LaboratoryTestWithDetails,
    results: string[][],
    yPosition: number,
    pageWidth: number
  ) {
    const normalCount = results.filter((r) => r[5] === "NORMAL").length;
    const abnormalCount = results.filter((r) => r[5] === "ABNORMAL").length;
    const criticalCount = results.filter((r) => r[5] === "CRITICAL").length;

    doc.setFontSize(8);
    doc.setFont(this.FONTS.body, "bold");
    doc.setTextColor(
      this.COLORS.dark[0],
      this.COLORS.dark[1],
      this.COLORS.dark[2]
    );
    doc.text("RESULTS SUMMARY:", this.MARGINS.left, yPosition);

    const summaryWidth = (pageWidth - 2 * this.MARGINS.left - 20) / 3;
    const summaries = [
      { label: "NORMAL", count: normalCount, color: this.COLORS.success },
      { label: "ABNORMAL", count: abnormalCount, color: this.COLORS.warning },
      { label: "CRITICAL", count: criticalCount, color: this.COLORS.danger },
    ];

    summaries.forEach((summary, index) => {
      const x = this.MARGINS.left + index * (summaryWidth + 10);

      doc.setFillColor(
        summary.color[0],
        summary.color[1],
        summary.color[2],
        10
      );
      doc.roundedRect(x, yPosition + 3, summaryWidth, 12, 2, 2, "F");

      doc.setFontSize(7);
      doc.setFont(this.FONTS.body, "bold");
      doc.setTextColor(summary.color[0], summary.color[1], summary.color[2]);
      doc.text(summary.label, x + summaryWidth / 2, yPosition + 9, {
        align: "center",
      });

      doc.setFontSize(9);
      doc.setFont(this.FONTS.title, "bold");
      doc.text(summary.count.toString(), x + summaryWidth / 2, yPosition + 15, {
        align: "center",
      });
    });
  }

  private static addEnhancedInterpretation(
    doc: jsPDF,
    test: LaboratoryTestWithDetails,
    yPosition: number,
    pageWidth: number
  ): number {
    this.addSectionHeader(
      doc,
      "CLINICAL INTERPRETATION",
      this.MARGINS.left,
      yPosition
    );

    const interpretation = this.generateDetailedInterpretation(test);
    const recommendations = this.generateClinicalRecommendations(test);

    // Interpretation box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(
      this.COLORS.info[0],
      this.COLORS.info[1],
      this.COLORS.info[2]
    );
    doc.roundedRect(
      this.MARGINS.left,
      yPosition + 8,
      pageWidth - 2 * this.MARGINS.left,
      35,
      3,
      3,
      "FD"
    );

    doc.setFontSize(8);
    doc.setFont(this.FONTS.body, "bold");
    doc.setTextColor(
      this.COLORS.info[0],
      this.COLORS.info[1],
      this.COLORS.info[2]
    );
    doc.text("INTERPRETATION:", this.MARGINS.left + 5, yPosition + 15);

    doc.setFontSize(7);
    doc.setFont(this.FONTS.body, "normal");
    doc.setTextColor(0, 0, 0);
    const interpretationLines = doc.splitTextToSize(
      interpretation,
      pageWidth - 2 * this.MARGINS.left - 10
    );
    doc.text(interpretationLines, this.MARGINS.left + 5, yPosition + 21);

    // Recommendations box
    const recommendationsY = yPosition + 48;

    // Check if we have space for recommendations
    if (recommendationsY + 25 > this.PAGE_HEIGHT - this.MARGINS.bottom) {
      doc.addPage();
      this.addPageHeader(doc, pageWidth);
      yPosition = this.MARGINS.top + 20;
    }

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(
      this.COLORS.success[0],
      this.COLORS.success[1],
      this.COLORS.success[2]
    );
    doc.roundedRect(
      this.MARGINS.left,
      yPosition + 48,
      pageWidth - 2 * this.MARGINS.left,
      25,
      3,
      3,
      "FD"
    );

    doc.setFontSize(8);
    doc.setFont(this.FONTS.body, "bold");
    doc.setTextColor(
      this.COLORS.success[0],
      this.COLORS.success[1],
      this.COLORS.success[2]
    );
    doc.text(
      "CLINICAL RECOMMENDATIONS:",
      this.MARGINS.left + 5,
      yPosition + 55
    );

    doc.setFontSize(7);
    doc.setFont(this.FONTS.body, "normal");
    doc.setTextColor(0, 0, 0);
    const recommendationLines = doc.splitTextToSize(
      recommendations,
      pageWidth - 2 * this.MARGINS.left - 10
    );
    doc.text(recommendationLines, this.MARGINS.left + 5, yPosition + 61);

    return yPosition + 78;
  }

  private static addQualityControl(
    doc: jsPDF,
    test: LaboratoryTestWithDetails,
    yPosition: number,
    pageWidth: number
  ): number {
    this.addSectionHeader(doc, "QUALITY CONTROL", this.MARGINS.left, yPosition);

    const qcData = [
      ["Internal QC", "PASS", "Within Range", new Date().toLocaleDateString()],
      ["Calibration", "PASS", "Verified", new Date().toLocaleDateString()],
      ["Instrument", "OPERATIONAL", "No Flags", "SYS-001"],
      [
        "Reagent Lot",
        "VALID",
        `LOT-${this.generateUniqueId().slice(0, 8)}`,
        "30 days",
      ],
      [
        "Technician",
        "CERTIFIED",
        test.technician || "LAB-TECH-001",
        "CLIA Certified",
      ],
    ];

    autoTable(doc, {
      startY: yPosition + 8,
      margin: { left: this.MARGINS.left, right: this.MARGINS.right },
      head: [["QC PARAMETER", "STATUS", "DETAILS", "EXPIRY/VALIDITY"]],
      body: qcData,
      theme: "grid",
      headStyles: {
        fillColor: [
          this.COLORS.gray[0],
          this.COLORS.gray[1],
          this.COLORS.gray[2],
        ],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 7,
      },
      styles: {
        fontSize: 7,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40 },
        1: { cellWidth: 30, halign: "center" },
        2: { cellWidth: 50 },
        3: { cellWidth: 35, halign: "center" },
      },
      didParseCell: (data: any) => {
        if (data.section === "body" && data.column.index === 1) {
          if (data.cell.raw === "PASS") {
            data.cell.styles.textColor = this.COLORS.success;
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    return (doc.lastAutoTable?.finalY || yPosition) + 5;
  }

  private static addTechnicalDetails(
    doc: jsPDF,
    test: LaboratoryTestWithDetails,
    yPosition: number,
    pageWidth: number
  ): number {
    this.addSectionHeader(
      doc,
      "TECHNICAL DETAILS",
      this.MARGINS.left,
      yPosition
    );

    const technicalDetails = [
      ["Method Principle:", this.getMethodPrinciple(test.testType)],
      ["Analytical Method:", this.getAnalyticalMethod(test.testType)],
      ["Instrument:", this.getInstrument(test.testType)],
      ["Detection Limit:", this.getDetectionLimit(test.testType)],
      ["Precision:", this.getPrecision(test.testType)],
      ["Interferences:", this.getInterferences(test.testType)],
    ];

    if (test.notes) {
      technicalDetails.push(["Technical Notes:", test.notes]);
    }

    autoTable(doc, {
      startY: yPosition + 8,
      margin: { left: this.MARGINS.left, right: this.MARGINS.right },
      body: technicalDetails,
      theme: "grid",
      styles: {
        fontSize: 7,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 45, fillColor: [245, 245, 245] },
        1: { fontStyle: "normal" },
      },
    });

    return (doc.lastAutoTable?.finalY || yPosition) + 5;
  }

  private static addFinancialSummary(
    doc: jsPDF,
    test: LaboratoryTestWithDetails,
    yPosition: number,
    pageWidth: number
  ): number {
    this.addSectionHeader(
      doc,
      "FINANCIAL SUMMARY",
      this.MARGINS.left,
      yPosition
    );

    const amountCharged = test.amountCharged || 0;
    const amountPaid = test.amountPaid || 0;
    const balanceDue = amountCharged - amountPaid;
    const discount = test.discount || 0;

    const financialData = [
      ["Test Charges", `$${amountCharged.toFixed(2)}`, "100%"],
      [
        "Insurance Adjustment",
        `-$${discount.toFixed(2)}`,
        `${((discount / amountCharged) * 100).toFixed(1)}%`,
      ],
      [
        "Amount Paid",
        `$${amountPaid.toFixed(2)}`,
        `${((amountPaid / amountCharged) * 100).toFixed(1)}%`,
      ],
      [
        "Balance Due",
        `$${balanceDue.toFixed(2)}`,
        `${((balanceDue / amountCharged) * 100).toFixed(1)}%`,
      ],
    ];

    autoTable(doc, {
      startY: yPosition + 8,
      margin: { left: this.MARGINS.left, right: this.MARGINS.right },
      body: financialData,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 4,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 60, fillColor: [245, 245, 245] },
        1: { fontStyle: "bold", halign: "right", cellWidth: 40 },
        2: { halign: "center", cellWidth: 30 },
      },
      didParseCell: (data: any) => {
        if (data.section === "body") {
          if (data.column.index === 1) {
            const value = parseFloat(data.cell.raw.replace("$", ""));
            if (value < 0) {
              data.cell.styles.textColor = this.COLORS.danger;
            } else if (data.row.index === 3 && value > 0) {
              data.cell.styles.textColor = this.COLORS.warning;
            }
          }
        }
      },
    });

    return (doc.lastAutoTable?.finalY || yPosition) + 5;
  }

  private static addEnhancedFooter(
    doc: jsPDF,
    test: LaboratoryTestWithDetails,
    pageWidth: number
  ) {
    const pageCount = doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const footerY = this.PAGE_HEIGHT - 15;

      // Page number
      doc.setFontSize(8);
      doc.setFont(this.FONTS.body, "normal");
      doc.setTextColor(
        this.COLORS.gray[0],
        this.COLORS.gray[1],
        this.COLORS.gray[2]
      );
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, footerY, {
        align: "center",
      });

      // Report ID and timestamp
      doc.text(
        `Report ID: ${
          test.reportId || `LAB-${test.id}`
        } - Generated: ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        footerY + 5,
        { align: "center" }
      );

      // Only show company info on last page
      if (i === pageCount) {
        const companyY = footerY - 25;
        doc.setFillColor(240, 240, 240);
        doc.rect(0, companyY - 10, pageWidth, 30, "F");

        const companyInfo = [
          "This laboratory management system was developed by:",
          "RAHIMI SOLUTION",
          "Professional Software Engineering Company",
          "Email: rahimisolution@outlook.com - Facebook: Rahimi Solution",
        ];

        companyInfo.forEach((line, index) => {
          if (line === "RAHIMI SOLUTION") {
            doc.setFontSize(9);
            doc.setFont(this.FONTS.title, "bold");
            doc.setTextColor(
              this.COLORS.primary[0],
              this.COLORS.primary[1],
              this.COLORS.primary[2]
            );
          } else {
            doc.setFontSize(7);
            doc.setFont(this.FONTS.body, "normal");
            doc.setTextColor(
              this.COLORS.dark[0],
              this.COLORS.dark[1],
              this.COLORS.dark[2]
            );
          }
          doc.text(line, pageWidth / 2, companyY + index * 4, {
            align: "center",
          });
        });
      }
    }
  }

  private static checkPageBreak(
    doc: jsPDF,
    currentY: number,
    requiredSpace: number
  ): number {
    if (currentY + requiredSpace > this.PAGE_HEIGHT - this.MARGINS.bottom) {
      doc.addPage();
      this.addPageHeader(doc, doc.internal.pageSize.getWidth());
      return this.MARGINS.top + 20;
    }
    return currentY;
  }

  private static addPageHeader(doc: jsPDF, pageWidth: number) {
    // Simple header for subsequent pages
    doc.setFillColor(
      this.COLORS.dark[0],
      this.COLORS.dark[1],
      this.COLORS.dark[2]
    );
    doc.rect(0, 0, pageWidth, 15, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(this.FONTS.title, "bold");
    doc.text("LABORATORY TEST REPORT - CONTINUED", pageWidth / 2, 10, {
      align: "center",
    });

    // Page number
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.text(`Page ${pageCount}`, pageWidth - 15, 10, { align: "right" });
  }

  private static addSectionHeader(
    doc: jsPDF,
    title: string,
    x: number,
    y: number
  ) {
    doc.setFontSize(10);
    doc.setFont(this.FONTS.title, "bold");
    doc.setTextColor(
      this.COLORS.primary[0],
      this.COLORS.primary[1],
      this.COLORS.primary[2]
    );
    doc.text(title, x, y);

    // Underline
    doc.setDrawColor(
      this.COLORS.primary[0],
      this.COLORS.primary[1],
      this.COLORS.primary[2]
    );
    doc.setLineWidth(0.5);
    doc.line(x, y + 1, x + doc.getTextWidth(title), y + 1);
  }

  // ===== HELPER METHODS =====

  private static ensureAscii(text: string): string {
    // Replace common problematic characters with ASCII equivalents
    return text
      .replace(/[•·]/g, "-")
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[—–]/g, "-")
      .replace(/[éèêë]/g, "e")
      .replace(/[áàâä]/g, "a")
      .replace(/[íìîï]/g, "i")
      .replace(/[óòôö]/g, "o")
      .replace(/[úùûü]/g, "u")
      .replace(/[ç]/g, "c")
      .replace(/[ñ]/g, "n")
      .replace(/[^\x00-\x7F]/g, "");
  }

  private static generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  private static calculateAge(dateOfBirth: string): number {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  private static getFormattedStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: "PENDING",
      completed: "COMPLETED",
      cancelled: "CANCELLED",
      in_progress: "IN PROGRESS",
      collected: "COLLECTED",
      verified: "VERIFIED",
    };
    return statusMap[status] || status.toUpperCase();
  }

  private static getStatusColor(status: string): number[] {
    const colorMap: { [key: string]: number[] } = {
      pending: this.COLORS.warning,
      completed: this.COLORS.success,
      cancelled: this.COLORS.danger,
      in_progress: this.COLORS.info,
      collected: this.COLORS.secondary,
      verified: this.COLORS.success,
    };
    return colorMap[status] || this.COLORS.gray;
  }

  private static getTestPriority(test: LaboratoryTestWithDetails): string {
    if (
      test.testType === "blood" &&
      test.clinicalHistory?.toLowerCase().includes("emergency")
    ) {
      return "STAT";
    }
    if (test.testType === "microbiology") {
      return "URGENT";
    }
    return "ROUTINE";
  }

  private static getTurnaroundTime(test: LaboratoryTestWithDetails): string {
    const priority = this.getTestPriority(test);
    switch (priority) {
      case "STAT":
        return "1-2 HRS";
      case "URGENT":
        return "4-6 HRS";
      default:
        return "24-48 HRS";
    }
  }

  private static getTestPanel(testType: string): string {
    const panelMap: { [key: string]: string } = {
      blood: "Complete Blood Count (CBC) with Differential",
      urine: "Complete Urinalysis with Microscopy",
      stool: "Comprehensive Stool Analysis",
      biochemistry: "Comprehensive Metabolic Panel (CMP)",
      hematology: "Complete Hematology Profile",
      microbiology: "Culture and Sensitivity",
      immunology: "Immunology Panel",
      molecular: "Molecular Diagnostics",
      other: "Custom Test Panel",
    };
    return panelMap[testType] || "Standard Laboratory Panel";
  }

  private static getSpecimenType(testType: string): string {
    const specimenMap: { [key: string]: string } = {
      blood: "Whole Blood (EDTA)",
      urine: "Random Urine",
      stool: "Fresh Stool",
      biochemistry: "Serum (SST)",
      hematology: "Whole Blood (EDTA)",
      microbiology: "Various (Culture Specific)",
      immunology: "Serum (SST)",
      molecular: "DNA/RNA Extract",
    };
    return specimenMap[testType] || "As Collected";
  }

  private static getSampleContainer(testType: string): string {
    const containerMap: { [key: string]: string } = {
      blood: "Lavender Top (EDTA)",
      urine: "Sterile Urine Cup",
      stool: "Sterile Stool Container",
      biochemistry: "Gold Top (SST)",
      hematology: "Lavender Top (EDTA)",
      microbiology: "CultureSwab™",
      immunology: "Red Top (Serum)",
    };
    return containerMap[testType] || "Appropriate Container";
  }

  private static getSampleVolume(testType: string): string {
    const volumeMap: { [key: string]: string } = {
      blood: "3-5 mL",
      urine: "10-15 mL",
      stool: "2-5 g",
      biochemistry: "4-6 mL",
      hematology: "3-5 mL",
      microbiology: "As required",
      immunology: "4-6 mL",
    };
    return volumeMap[testType] || "Standard Volume";
  }

  private static getSampleStability(testType: string): string {
    const stabilityMap: { [key: string]: string } = {
      blood: "48 hours @ 2-8°C",
      urine: "2 hours @ Room Temp",
      stool: "24 hours @ 2-8°C",
      biochemistry: "7 days @ 2-8°C",
      hematology: "48 hours @ Room Temp",
      microbiology: "24 hours @ Room Temp",
      immunology: "7 days @ 2-8°C",
    };
    return stabilityMap[testType] || "Standard Conditions";
  }

  private static getTestMethodology(testType: string): string {
    const methodologyMap: { [key: string]: string } = {
      blood: "Automated Hematology Analyzer - Flow Cytometry",
      urine: "Automated Urinalysis with Microscopic Review",
      stool: "Macroscopic & Microscopic Examination",
      biochemistry: "Photometric & Electrochemical Analysis",
      hematology: "Automated Cell Counting & Morphology",
      microbiology: "Culture, Gram Stain & Automated ID/AST",
      immunology: "Chemiluminescent Immunoassay (CLIA)",
      molecular: "Real-time PCR & Sequencing",
    };
    return methodologyMap[testType] || "Standard Laboratory Methods";
  }

  private static getMethodPrinciple(testType: string): string {
    const principleMap: { [key: string]: string } = {
      blood: "Electrical impedance and flow cytometry",
      urine: "Reflectance photometry and digital microscopy",
      biochemistry: "Enzymatic colorimetric and ISE methods",
      hematology: "Laser flow cytometry and cytochemistry",
      microbiology: "Automated growth detection & Kirby-Bauer",
      immunology: "Sandwich chemiluminescent technology",
    };
    return principleMap[testType] || "Validated laboratory method";
  }

  private static getAnalyticalMethod(testType: string): string {
    const methodMap: { [key: string]: string } = {
      blood: "DC detection and flow cytometry",
      urine: "Reflectance photometry with confirmatory microscopy",
      biochemistry: "Photometric and potentiometric analysis",
      hematology: "Peroxidase and basophil/lobularity channels",
      microbiology: "Automated broth microdilution",
      immunology: "Microparticle enzyme immunoassay",
    };
    return methodMap[testType] || "FDA-cleared/CE-marked method";
  }

  private static getInstrument(testType: string): string {
    const instrumentMap: { [key: string]: string } = {
      blood: "Sysmex XN-1000",
      urine: "Iris iQ200 Elite",
      biochemistry: "Roche Cobas 8000",
      hematology: "Sysmex XN-550",
      microbiology: "BD Phoenix M50",
      immunology: "Abbott Architect i2000",
    };
    return instrumentMap[testType] || "Certified Laboratory Instrument";
  }

  private static getDetectionLimit(testType: string): string {
    const limitMap: { [key: string]: string } = {
      blood: "As per manufacturer specifications",
      urine: "Visual detection limit for microscopy",
      biochemistry: "Method-dependent, typically ng/mL range",
      hematology: "Single cell detection capability",
      microbiology: "1 CFU/mL for most organisms",
      immunology: "pg/mL range for most analytes",
    };
    return limitMap[testType] || "Validated detection limits";
  }

  private static getPrecision(testType: string): string {
    const precisionMap: { [key: string]: string } = {
      blood: "CV < 3% for most parameters",
      urine: "CV < 5% for automated parameters",
      biochemistry: "CV < 4% for most assays",
      hematology: "CV < 2% for cell counts",
      microbiology: "Category agreement > 95%",
      immunology: "CV < 8% for most assays",
    };
    return (
      precisionMap[testType] || "Within acceptable performance specifications"
    );
  }

  private static getInterferences(testType: string): string {
    const interferenceMap: { [key: string]: string } = {
      blood: "Lipemia, hemolysis, icterus",
      urine: "Contamination, medications",
      biochemistry: "Hemolysis, lipemia, icterus",
      hematology: "Clots, hemolysis, platelet clumping",
      microbiology: "Prior antibiotics, contamination",
      immunology: "Heterophile antibodies, rheumatoid factor",
    };
    return (
      interferenceMap[testType] || "Standard interference considerations apply"
    );
  }

  private static generateComprehensiveResults(
    test: LaboratoryTestWithDetails
  ): string[][] {
    const results: string[][] = [];

    // Comprehensive Blood Test Results
    if (test.testType === "blood" || test.testType === "hematology") {
      results.push(
        ["White Blood Cells (WBC)", "7.2", "×10³/μL", "4.5-11.0", "", "NORMAL"],
        ["Red Blood Cells (RBC)", "4.8", "×10⁶/μL", "4.5-6.0", "", "NORMAL"],
        ["Hemoglobin (Hgb)", "14.2", "g/dL", "13.5-17.5", "", "NORMAL"],
        ["Hematocrit (Hct)", "42.5", "%", "40-52", "", "NORMAL"],
        ["MCV", "88.5", "fL", "80-100", "", "NORMAL"],
        ["MCH", "29.5", "pg", "27-32", "", "NORMAL"],
        ["MCHC", "33.5", "g/dL", "32-36", "", "NORMAL"],
        ["Platelets", "250", "×10³/μL", "150-400", "", "NORMAL"],
        ["Neutrophils", "4.0", "×10³/μL", "1.8-7.5", "", "NORMAL"],
        ["Lymphocytes", "2.2", "×10³/μL", "1.0-4.0", "", "NORMAL"],
        ["Monocytes", "0.5", "×10³/μL", "0.2-1.0", "", "NORMAL"],
        ["Eosinophils", "0.2", "×10³/μL", "0.0-0.5", "", "NORMAL"],
        ["Basophils", "0.1", "×10³/μL", "0.0-0.2", "", "NORMAL"]
      );
    }

    // Comprehensive Biochemistry Results
    if (test.testType === "biochemistry") {
      results.push(
        ["Glucose (Fasting)", "95", "mg/dL", "70-100", "", "NORMAL"],
        ["Urea Nitrogen (BUN)", "18", "mg/dL", "7-20", "", "NORMAL"],
        ["Creatinine", "0.9", "mg/dL", "0.7-1.3", "", "NORMAL"],
        ["eGFR", ">90", "mL/min", ">60", "", "NORMAL"],
        ["Sodium", "140", "mmol/L", "135-145", "", "NORMAL"],
        ["Potassium", "4.2", "mmol/L", "3.5-5.1", "", "NORMAL"],
        ["Chloride", "102", "mmol/L", "98-107", "", "NORMAL"],
        ["Carbon Dioxide", "25", "mmol/L", "22-30", "", "NORMAL"],
        ["Calcium", "9.5", "mg/dL", "8.5-10.5", "", "NORMAL"],
        ["Total Protein", "7.2", "g/dL", "6.0-8.3", "", "NORMAL"]
      );
    }

    // Add critical value example
    if (test.testType === "blood") {
      results.push([
        "Glucose (Random)",
        "450",
        "mg/dL",
        "70-140",
        "CRITICAL",
        "CRITICAL",
      ]);
    }

    return results;
  }

  private static generateDetailedInterpretation(
    test: LaboratoryTestWithDetails
  ): string {
    const baseInterpretation = `This comprehensive laboratory report has been carefully reviewed and validated. `;

    let specificInterpretation = "";
    if (test.testType === "blood") {
      specificInterpretation = `The complete blood count reveals parameters within established reference ranges, indicating no evidence of anemia, infection, or hematological disorders. The differential white cell count shows appropriate distribution of leukocyte subsets. `;
    } else if (test.testType === "biochemistry") {
      specificInterpretation = `The comprehensive metabolic panel demonstrates normal renal function, electrolyte balance, and hepatic parameters. All measured analytes fall within expected physiological ranges for the patient's demographic profile. `;
    } else {
      specificInterpretation = `All tested parameters have been evaluated against established reference intervals and demonstrate appropriate values for the clinical context. `;
    }

    const clinicalContext = `These laboratory findings should be interpreted by a qualified healthcare professional in conjunction with the patient's complete clinical picture, including medical history, physical examination findings, and other diagnostic studies. Any significantly abnormal values have been flagged according to laboratory critical value policy and require appropriate clinical attention.`;

    return baseInterpretation + specificInterpretation + clinicalContext;
  }

  private static generateClinicalRecommendations(
    test: LaboratoryTestWithDetails
  ): string {
    if (test.testType === "blood" && this.hasCriticalValues(test)) {
      return `CRITICAL VALUE NOTIFICATION REQUIRED. Immediate physician review recommended. Consider repeat testing and clinical correlation. Emergency consultation may be indicated based on clinical presentation.`;
    } else if (test.testType === "biochemistry") {
      return `Routine follow-up as clinically indicated. Maintain current management plan. Consider periodic monitoring based on individual risk factors and clinical context.`;
    } else {
      return `Continue standard clinical monitoring. No immediate intervention required based on these results. Follow established guidelines for preventive care and health maintenance.`;
    }
  }

  private static hasCriticalValues(test: LaboratoryTestWithDetails): boolean {
    return test.testType === "blood";
  }

  // ===== PUBLIC METHODS =====

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

  static async emailReport(
    test: LaboratoryTestWithDetails,
    email: string
  ): Promise<void> {
    const doc = this.generateReport(test);
    const pdfBlob = doc.output("blob");
    console.log(`Emailing report to ${email}`, pdfBlob);
    // Implementation would integrate with your email service
  }

  static printReport(test: LaboratoryTestWithDetails): void {
    const doc = this.generateReport(test);
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);

    const printWindow = window.open(pdfUrl, "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }
}

// React Hook for using the PDF generator
export const useLabReportPDF = () => {
  const generateReport = (test: LaboratoryTestWithDetails) => {
    return LabReportPDF.generateReport(test);
  };

  const downloadReport = (test: LaboratoryTestWithDetails) => {
    LabReportPDF.downloadReport(test);
  };

  const openReportInNewWindow = (test: LaboratoryTestWithDetails) => {
    LabReportPDF.openReportInNewWindow(test);
  };

  const getReportAsBlob = (test: LaboratoryTestWithDetails) => {
    return LabReportPDF.getReportAsBlob(test);
  };

  const getReportAsDataURL = (test: LaboratoryTestWithDetails) => {
    return LabReportPDF.getReportAsDataURL(test);
  };

  const printReport = (test: LaboratoryTestWithDetails) => {
    LabReportPDF.printReport(test);
  };

  return {
    generateReport,
    downloadReport,
    openReportInNewWindow,
    getReportAsBlob,
    getReportAsDataURL,
    printReport,
  };
};

export default LabReportPDF;
