"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
} from "lucide-react";

interface ExpenseSummaryProps {
  data: {
    period: {
      start: string;
      end: string;
    };
    summary: {
      totalAmount: number;
      averageAmount: number;
      count: number;
      minAmount: number;
      maxAmount: number;
    };
    byCategory: Array<{
      category: string;
      total: number;
      count: number;
    }>;
    monthlyTrend: Array<{
      month: string;
      total: number;
    }>;
  };
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#8DD1E1",
  "#A4DE6C",
  "#D0ED57",
  "#FFD700",
  "#FF6B6B",
  "#4ECDC4",
];

export function ExpenseSummary({ data }: ExpenseSummaryProps) {
  const formatCurrency = (
    amount: number | string,
    currency: string = "USD"
  ) => {
    // Handle NaN, undefined, null, or invalid values
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    // More robust check for invalid numbers
    if (
      isNaN(numAmount) ||
      numAmount === null ||
      numAmount === undefined ||
      !isFinite(numAmount)
    ) {
      return `- ${currency}`;
    }

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(numAmount);
    } catch (error) {
      // Fallback for invalid currency codes
      return `${numAmount.toLocaleString()} ${currency}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.summary.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.summary.count} expenses total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Expense
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.summary.averageAmount)}
            </div>
            <p className="text-xs text-muted-foreground">Per expense</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Highest Expense
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.summary.maxAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum single expense
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lowest Expense
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.summary.minAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum single expense
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.byCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) =>
                      `${category}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {data.byCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(value) => value.slice(5)} // Show only month
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      formatCurrency(value).replace(/[^\d.]/g, "")
                    }
                  />
                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      "Amount",
                    ]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar dataKey="total" fill="#8884d8" name="Monthly Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.byCategory.map((category) => (
              <div
                key={category.category}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        COLORS[
                          data.byCategory.indexOf(category) % COLORS.length
                        ],
                    }}
                  />
                  <span>{category.category}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {formatCurrency(category.total)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {category.count} expenses
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
