import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  laboratoryTests,
  laboratoryExpenses,
  patients,
  doctors,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Fetch laboratory tests (income transactions)
    const testsQuery = db
      .select({
        id: laboratoryTests.id,
        description: laboratoryTests.testName,
        amount: laboratoryTests.amountCharged,
        date: laboratoryTests.testDate,
        status: laboratoryTests.status,
        paymentStatus: laboratoryTests.paymentStatus,
        patientFirstName: patients.firstName,
        patientLastName: patients.lastName,
        doctorName: doctors.name,
      })
      .from(laboratoryTests)
      .leftJoin(patients, eq(laboratoryTests.patientId, patients.id))
      .leftJoin(doctors, eq(laboratoryTests.doctorId, doctors.id))
      .orderBy(desc(laboratoryTests.testDate))
      .limit(limit)
      .offset(offset);

    // Apply date filter if provided
    let tests = await testsQuery;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      tests = tests.filter((test) => {
        if (!test.date) return false;
        const testDate =
          test.date instanceof Date ? test.date : new Date(test.date as string);
        return testDate >= start && testDate <= end;
      });
    }

    // Fetch laboratory expenses (expense transactions)
    const expensesQuery = db
      .select({
        id: laboratoryExpenses.id,
        description: laboratoryExpenses.description,
        amount: laboratoryExpenses.amount,
        date: laboratoryExpenses.expenseDate,
        status: laboratoryExpenses.status,
        expenseType: laboratoryExpenses.expenseType,
      })
      .from(laboratoryExpenses)
      .orderBy(desc(laboratoryExpenses.expenseDate))
      .limit(limit)
      .offset(offset);

    // Apply date filter if provided
    let expenses = await expensesQuery;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      expenses = expenses.filter((expense) => {
        if (!expense.date) return false;
        const expenseDate =
          expense.date instanceof Date
            ? expense.date
            : new Date(expense.date as string);
        return expenseDate >= start && expenseDate <= end;
      });
    }

    // Combine and format transactions
    const transactions = [
      ...tests.map((test) => ({
        id: test.id,
        type: "income" as const,
        category: "Laboratory Test",
        description: `${test.description} - ${
          `${test.patientFirstName || ""} ${
            test.patientLastName || ""
          }`.trim() || "Unknown Patient"
        }`,
        amount: Number(test.amount) || 0,
        date: test.date
          ? (test.date as Date).toISOString()
          : new Date(0).toISOString(),
        status: test.paymentStatus,
        relatedDoctor: test.doctorName,
      })),
      ...expenses.map((expense) => ({
        id: expense.id,
        type: "expense" as const,
        category: expense.expenseType,
        description: expense.description,
        amount: -(Number(expense.amount) || 0), // Negative for expenses
        date: expense.date
          ? (expense.date as Date).toISOString()
          : new Date(0).toISOString(),
        status: expense.status,
        relatedDoctor: null,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate summary
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const netAmount = totalIncome - totalExpenses;

    return NextResponse.json({
      transactions,
      summary: {
        totalIncome,
        totalExpenses,
        netAmount,
        transactionCount: transactions.length,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
