//app/page.tsx

"use client";

import { useState } from "react";
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
import { Search, Download, Calendar, User, FileText } from "lucide-react";
import {
  PatientWithTests,
  PatientTestReport,
  LaboratoryTestWithDetails,
} from "@/types/types";
import { LabReportPDF } from "@/lib/pdf-generator";

export default function PatientPortal() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [patient, setPatient] = useState<PatientWithTests | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!phoneNumber.trim()) {
      setError("Please enter your phone number");
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      // Simulate API call - replace with your actual API endpoint
      const response = await fetch(
        `/api/patients/search?phone=${encodeURIComponent(phoneNumber)}`
      );

      if (response.status === 404) {
        // Patient not found - this is expected behavior, not an error
        setError(
          "No patient found with this phone number. Please check your number and try again."
        );
        setPatient(null);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const patientData = await response.json();
      setPatient(patientData);
    } catch (err) {
      console.error("Search error:", err);
      setError("An error occurred while searching. Please try again later.");
      setPatient(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownloadReport = (test: PatientTestReport) => {
    if (!patient) return;

    // Enhance test data with patient information for PDF
    const reportData: LaboratoryTestWithDetails = {
      ...test,
      patientId: patient.id,
      paymentStatus: "paid", // Default to paid for downloaded reports
      createdBy: "system",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        phoneNumber: patient.phoneNumber,
        email: "", // Not available in PatientWithTests
        dateOfBirth: patient.dateOfBirth || "",
        gender: patient.gender || "",
        address: "", // Not available in PatientWithTests
        emergencyContact: "", // Not available in PatientWithTests
        medicalHistory: "", // Not available in PatientWithTests
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      laboratoryName: "Medical Laboratory Center",
      laboratoryAddress: "123 Healthcare Drive, Medical City",
      laboratoryContact: "+1 (555) 123-4567",
    };

    LabReportPDF.downloadReport(reportData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 p-4 rounded-full">
                <FileText className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-4 text-gray-900">
              Patient Portal
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Securely access your laboratory test reports and medical history
            </p>
          </div>
        </section>

        {/* Search Section */}
        <Card className="mb-8 shadow-lg border-0">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Search className="h-6 w-6" />
              Find Your Medical Records
            </CardTitle>
            <CardDescription className="text-blue-100">
              Enter your registered phone number to access your test reports and
              medical history
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
              <div className="flex-1">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number (e.g., +1234567890)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="h-12 text-lg"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700"
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search Records
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Information and Test Reports */}
        {patient && (
          <div className="space-y-6">
            {/* Patient Information Card */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-green-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">
                      Full Name
                    </Label>
                    <p className="text-lg font-semibold text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">
                      Phone Number
                    </Label>
                    <p className="text-lg font-semibold text-gray-900">
                      {patient.phoneNumber}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">
                      Date of Birth
                    </Label>
                    <p className="text-lg font-semibold text-gray-900">
                      {patient.dateOfBirth
                        ? formatDate(patient.dateOfBirth)
                        : "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">
                      Gender
                    </Label>
                    <p className="text-lg font-semibold text-gray-900">
                      {patient.gender || "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Reports Card */}
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="h-5 w-5" />
                  Laboratory Test Reports
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Your complete test history. Click the download button to save
                  reports as PDF.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {patient.tests && patient.tests.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold">
                            Test Name
                          </TableHead>
                          <TableHead className="font-semibold">Type</TableHead>
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">
                            Status
                          </TableHead>
                          <TableHead className="font-semibold">
                            Report ID
                          </TableHead>
                          <TableHead className="font-semibold text-right">
                            Download
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patient.tests.map((test) => (
                          <TableRow key={test.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                              {test.testName}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {test.testType}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(test.testDate)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  test.status === "completed"
                                    ? "default"
                                    : test.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                                }
                                className="capitalize"
                              >
                                {test.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500 font-mono">
                              {test.reportId}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadReport(test)}
                                className="hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                PDF
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg text-gray-500 mb-2">
                      No test reports found
                    </p>
                    <p className="text-gray-400">
                      You don't have any laboratory test reports yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-300">
            © 2024 Medical Laboratory System. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Your health information is protected and secure.
          </p>
        </div>
      </footer>
    </div>
  );
}
