"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Header from "@/components/Header";
import { Search, Download, Calendar, User } from "lucide-react";

// This would typically come from your API
const mockPatientData = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  phoneNumber: "+1234567890",
  dateOfBirth: "1985-03-15",
  gender: "Male",
};

const mockTestReports = [
  {
    id: 1,
    testName: "Complete Blood Count",
    testType: "blood",
    testDate: "2024-10-01",
    status: "completed",
    results: "All parameters within normal range",
    reportId: "LAB-2024-001",
  },
  {
    id: 2,
    testName: "Urinalysis",
    testType: "urine",
    testDate: "2024-09-15",
    status: "completed",
    results: "Normal findings",
    reportId: "LAB-2024-002",
  },
  {
    id: 3,
    testName: "Thyroid Function Test",
    testType: "blood",
    testDate: "2024-08-20",
    status: "completed",
    results: "TSH levels normal",
    reportId: "LAB-2024-003",
  },
];

export default function PatientPortal() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [patient, setPatient] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter your phone number");
      return;
    }

    setIsSearching(true);
    setError("");

    // Simulate API call to find patient by phone number
    try {
      // In a real application, you would make an API call here
      // const response = await fetch(`/api/patients/search?phone=${encodeURIComponent(phoneNumber)}`);
      // const patientData = await response.json();

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, using mock data - in real app, use actual API response
      if (phoneNumber === mockPatientData.phoneNumber) {
        setPatient(mockPatientData);
      } else {
        setError("No patient found with this phone number");
        setPatient(null);
      }
    } catch (err) {
      setError("Error searching for patient. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownloadReport = (test) => {
    // In a real application, this would generate and download an actual PDF
    const pdfContent = `
      LABORATORY TEST REPORT
      
      Patient: ${patient.firstName} ${patient.lastName}
      Phone: ${patient.phoneNumber}
      Date of Birth: ${patient.dateOfBirth}
      Gender: ${patient.gender}
      
      Test Information:
      - Test Name: ${test.testName}
      - Test Type: ${test.testType}
      - Test Date: ${test.testDate}
      - Report ID: ${test.reportId}
      - Status: ${test.status}
      
      Results:
      ${test.results}
      
      Report generated on: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([pdfContent], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lab-report-${test.reportId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-4">
              Patient Portal
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Access your laboratory test reports and medical information
              securely
            </p>
          </div>
        </section>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Your Medical Records
            </CardTitle>
            <CardDescription>
              Enter your registered phone number to access your test reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
              <div className="flex-1">
                <Label htmlFor="phone" className="sr-only">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="sm:w-auto"
              >
                {isSearching ? "Searching..." : "Search Records"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patient Information and Test Reports */}
        {patient && (
          <div className="space-y-6">
            {/* Patient Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Full Name</Label>
                    <p className="text-lg">
                      {patient.firstName} {patient.lastName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone Number</Label>
                    <p className="text-lg">{patient.phoneNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Date of Birth</Label>
                    <p className="text-lg">{patient.dateOfBirth}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Gender</Label>
                    <p className="text-lg">{patient.gender}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Reports Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Laboratory Test Reports
                </CardTitle>
                <CardDescription>
                  Your complete test history. Download reports as PDF.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mockTestReports.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Test Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Report ID</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTestReports.map((test) => (
                        <TableRow key={test.id}>
                          <TableCell className="font-medium">
                            {test.testName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{test.testType}</Badge>
                          </TableCell>
                          <TableCell>{test.testDate}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                test.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {test.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {test.reportId}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadReport(test)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              PDF
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No test reports found for this patient.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <footer className="flex w-full items-center justify-center bg-gray-100 py-6 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            (c) 2024 Medical Laboratory System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
