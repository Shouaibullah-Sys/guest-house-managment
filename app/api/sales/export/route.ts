import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Sale } from "@/models/Sale";

// Helper function to convert data to CSV
function convertToCSV(data: any[]) {
  if (data.length === 0) return "";

  // Get headers from the first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(","),
    // Data rows
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma or quote
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/\"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  return csvContent;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    try {
      await requireAuth();
    } catch (authError) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";
    const period = searchParams.get("period") || "today";

    // Build filter query
    const filterQuery: any = {};

    // Add search filter
    if (search) {
      filterQuery.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { normalizedName: { $regex: search, $options: "i" } },
        { partName: { $regex: search, $options: "i" } },
        { partNumber: { $regex: search, $options: "i" } },
      ];
    }

    // Add date filters
    const now = new Date();
    let dateFilter = {};

    switch (period) {
      case "today":
        dateFilter = {
          issueDate: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        };
        break;
      case "week":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        dateFilter = {
          issueDate: { $gte: weekStart },
        };
        break;
      case "month":
        dateFilter = {
          issueDate: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          },
        };
        break;
      case "lifetime":
        dateFilter = {};
        break;
    }

    // Apply custom date range if provided
    if (fromDate && toDate) {
      dateFilter = {
        issueDate: {
          $gte: new Date(fromDate),
          $lte: new Date(toDate + "T23:59:59.999Z"),
        },
      };
    } else if (fromDate) {
      dateFilter = {
        issueDate: { $gte: new Date(fromDate) },
      };
    } else if (toDate) {
      dateFilter = {
        issueDate: { $lte: new Date(toDate + "T23:59:59.999Z") },
      };
    }

    // Combine filters
    const finalFilter = { ...filterQuery, ...dateFilter };

    // Fetch sales data
    const sales = await Sale.find(finalFilter).sort({ issueDate: -1 }).lean();

    // Transform data for CSV export
    const exportData = sales.map((sale: any) => ({
      ID: (sale as any)._id.toString(),
      "Customer Name": sale.customerName,
      "Normalized Name": sale.normalizedName,
      "Part Number": sale.partNumber || "",
      "Part Name": sale.partName || "",
      Quantity: sale.quantity,
      "Issue Date": new Date(sale.issueDate).toLocaleDateString("fa-IR"),
      "Total Amount": sale.totalAmount.toLocaleString(),
      "Paid Amount": sale.paidAmount.toLocaleString(),
      Outstanding: sale.outstandingAmount.toLocaleString(),
      "Is Fully Paid": sale.isFullyPaid ? "Yes" : "No",
      "Issued By": sale.issuedBy || "",
      "Created At": new Date(sale.createdAt).toLocaleDateString("fa-IR"),
      "Updated At": new Date(sale.updatedAt).toLocaleDateString("fa-IR"),
    }));

    // Convert to CSV
    const csvContent = convertToCSV(exportData);

    // Create filename with current date
    const fileName = `sales-export-${
      new Date().toISOString().split("T")[0]
    }.csv`;

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": csvContent.length.toString(),
      },
    });
  } catch (error) {
    console.error("Sales export error:", error);

    // Return detailed error for debugging
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to export sales data",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
