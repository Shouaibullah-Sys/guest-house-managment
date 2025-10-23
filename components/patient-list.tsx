// components/patient-list.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  MoreHorizontal,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  TestTube,
  Download,
  X,
  Stethoscope,
  Heart,
  Droplets,
  FlaskConical,
  Activity,
  Microscope,
} from "lucide-react";
import { LabReportPDF } from "@/lib/pdf-generator";

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  createdAt: string;
  lastVisit?: string;
  totalTests?: number;
  status?: "active" | "inactive";
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
}

interface LaboratoryTest {
  id: number;
  testName: string;
  testType: string;
  testDate: string;
  status: string;
  results?: string;
  technician?: string;
  amountCharged?: number;
  amountPaid?: number;
  paymentStatus?: string;
  notes?: string;
}

interface PatientWithTests extends Patient {
  tests?: LaboratoryTest[];
}

interface PatientListProps {
  patients: Patient[];
  onPatientUpdate?: () => void;
}

export function PatientList({ patients, onPatientUpdate }: PatientListProps) {
  const [selectedPatient, setSelectedPatient] =
    useState<PatientWithTests | null>(null);
  const [viewMode, setViewMode] = useState<"profile" | "tests">("profile");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(false);

  const fetchPatientDetails = async (patientId: number) => {
    setLoadingPatient(true);
    try {
      // First try to search by patient ID
      const response = await fetch(`/api/laboratory/patients/${patientId}`);
      if (response.ok) {
        const patientData = await response.json();
        setSelectedPatient(patientData);
        setIsDialogOpen(true);
        return;
      }

      // If that fails, try the search endpoint (you might need to adjust this based on your API)
      console.warn(
        "Direct patient ID fetch failed, trying alternative methods..."
      );

      // You might need to implement a different approach here based on your API
      // For now, we'll set basic patient info
      const patient = patients.find((p) => p.id === patientId);
      if (patient) {
        setSelectedPatient({ ...patient, tests: [] });
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
      // Fallback to basic patient info
      const patient = patients.find((p) => p.id === patientId);
      if (patient) {
        setSelectedPatient({ ...patient, tests: [] });
        setIsDialogOpen(true);
      }
    } finally {
      setLoadingPatient(false);
    }
  };

  const handleViewProfile = (patient: Patient) => {
    setViewMode("profile");
    fetchPatientDetails(patient.id);
  };

  const handleViewTestHistory = (patient: Patient) => {
    setViewMode("tests");
    fetchPatientDetails(patient.id);
  };

  const handleDownloadReport = (test: LaboratoryTest) => {
    if (!selectedPatient) return;

    LabReportPDF.downloadReport({
      ...test,
      id: test.id.toString(),
      patient: {
        id: selectedPatient.id.toString(),
        firstName: selectedPatient.firstName,
        lastName: selectedPatient.lastName,
        phoneNumber: selectedPatient.phone || "",
        dateOfBirth: selectedPatient.dateOfBirth,
        gender: selectedPatient.gender,
      },
      results: test.results ? [test.results] : undefined,
      laboratoryName: "Medical Laboratory Center",
      laboratoryAddress: "123 Medical Drive, Healthcare City",
      laboratoryContact: "+1 (555) 123-4567",
    });
  };

  const getTestTypeIcon = (testType: string) => {
    switch (testType.toLowerCase()) {
      case "blood":
        return <Heart className="h-4 w-4" />;
      case "urine":
        return <Droplets className="h-4 w-4" />;
      case "stool":
        return <FlaskConical className="h-4 w-4" />;
      case "biochemistry":
      case "hematology":
      case "immunology":
        return <Activity className="h-4 w-4" />;
      case "microbiology":
        return <Microscope className="h-4 w-4" />;
      default:
        return <TestTube className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "partial":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "waived":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Mobile-friendly patient card
  const MobilePatientCard = ({ patient }: { patient: Patient }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm">
            {patient.firstName} {patient.lastName}
          </h4>
          <div className="flex items-center mt-1 text-xs text-gray-600">
            <Mail className="h-3 w-3 mr-1" />
            {patient.email || "No email"}
          </div>
          {patient.phone && (
            <div className="flex items-center mt-1 text-xs text-gray-600">
              <Phone className="h-3 w-3 mr-1" />
              {patient.phone}
            </div>
          )}
        </div>
        <Badge
          variant={patient.status === "active" ? "default" : "secondary"}
          className="text-xs"
        >
          {patient.status}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm mt-3">
        <div>
          <span className="text-gray-600">Total Tests:</span>
          <span className="font-semibold ml-1">{patient.totalTests || 0}</span>
        </div>
        <div>
          <span className="text-gray-600">Last Visit:</span>
          <span className="font-semibold ml-1">
            {new Date(
              patient.lastVisit || patient.createdAt
            ).toLocaleDateString()}
          </span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-600">Registered:</span>
          <span className="font-semibold ml-1">
            {new Date(patient.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewProfile(patient)}
          className="flex-1 text-xs"
          disabled={loadingPatient}
        >
          <Eye className="h-3 w-3 mr-1" />
          Profile
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewTestHistory(patient)}
          className="flex-1 text-xs"
          disabled={loadingPatient}
        >
          <TestTube className="h-3 w-3 mr-1" />
          Tests
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Patient Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Total Patients
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {patients.length}
              </p>
            </div>
            <User className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">
                Active Patients
              </p>
              <p className="text-2xl font-bold text-green-900">
                {patients.filter((p) => p.status === "active").length}
              </p>
            </div>
            <User className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">
                Avg Tests per Patient
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {patients.length > 0
                  ? (
                      patients.reduce(
                        (sum, p) => sum + (p.totalTests || 0),
                        0
                      ) / patients.length
                    ).toFixed(1)
                  : "0"}
              </p>
            </div>
            <TestTube className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Total Tests</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">
                  {patient.firstName} {patient.lastName}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {patient.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-2" />
                        {patient.email}
                      </div>
                    )}
                    {patient.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-2" />
                        {patient.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {patient.totalTests || 0} tests
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(
                    patient.lastVisit || patient.createdAt
                  ).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(patient.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      patient.status === "active" ? "default" : "secondary"
                    }
                  >
                    {patient.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleViewProfile(patient)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleViewTestHistory(patient)}
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        Test History
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {patients.map((patient) => (
          <MobilePatientCard key={patient.id} patient={patient} />
        ))}
      </div>

      {patients.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No patients found for the selected date range
        </div>
      )}

      {/* Patient Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-t-lg p-6 -m-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-3 text-xl text-white">
                  <User className="h-6 w-6" />
                  {selectedPatient?.firstName} {selectedPatient?.lastName}
                </DialogTitle>
                <DialogDescription className="text-blue-100">
                  Patient Details & Test History
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {loadingPatient ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Tabs
              value={viewMode}
              onValueChange={(value) =>
                setViewMode(value as "profile" | "tests")
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Patient Profile</TabsTrigger>
                <TabsTrigger value="tests">Test History</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            First Name
                          </label>
                          <p className="text-gray-900">
                            {selectedPatient?.firstName}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Last Name
                          </label>
                          <p className="text-gray-900">
                            {selectedPatient?.lastName}
                          </p>
                        </div>
                      </div>
                      {selectedPatient?.dateOfBirth && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Date of Birth
                            </label>
                            <p className="text-gray-900">
                              {selectedPatient.dateOfBirth}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedPatient?.gender && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Gender
                          </label>
                          <p className="text-gray-900 capitalize">
                            {selectedPatient.gender}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Phone className="h-5 w-5" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedPatient?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Phone
                            </label>
                            <p className="text-gray-900">
                              {selectedPatient.phone}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedPatient?.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Email
                            </label>
                            <p className="text-gray-900">
                              {selectedPatient.email}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedPatient?.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Address
                            </label>
                            <p className="text-gray-900">
                              {selectedPatient.address}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedPatient?.emergencyContact && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Emergency Contact
                            </label>
                            <p className="text-gray-900">
                              {selectedPatient.emergencyContact}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Medical History */}
                  {selectedPatient?.medicalHistory && (
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Stethoscope className="h-5 w-5" />
                          Medical History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {selectedPatient.medicalHistory}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Statistics */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Activity className="h-5 w-5" />
                        Patient Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedPatient?.totalTests || 0}
                          </div>
                          <div className="text-sm text-gray-500">
                            Total Tests
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedPatient?.tests?.filter(
                              (t) => t.status === "completed"
                            ).length || 0}
                          </div>
                          <div className="text-sm text-gray-500">
                            Completed Tests
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {selectedPatient?.tests?.filter(
                              (t) => t.status === "pending"
                            ).length || 0}
                          </div>
                          <div className="text-sm text-gray-500">
                            Pending Tests
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {new Date(
                              selectedPatient?.lastVisit ||
                                selectedPatient?.createdAt ||
                                ""
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Last Visit
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Test History Tab */}
              <TabsContent value="tests" className="space-y-6">
                {selectedPatient?.tests && selectedPatient.tests.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        Test History ({selectedPatient.tests.length} tests)
                      </h3>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Test Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedPatient.tests.map((test) => (
                            <TableRow key={test.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {getTestTypeIcon(test.testType)}
                                  {test.testName}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {test.testType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(test.testDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`border ${getStatusColor(
                                    test.status
                                  )}`}
                                >
                                  {test.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {test.paymentStatus && (
                                  <Badge
                                    className={`border ${getPaymentStatusColor(
                                      test.paymentStatus
                                    )}`}
                                  >
                                    {test.paymentStatus}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {test.amountCharged
                                  ? `AFN ${test.amountCharged}`
                                  : "N/A"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadReport(test)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                      {selectedPatient.tests.map((test) => (
                        <Card key={test.id} className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {getTestTypeIcon(test.testType)}
                              <div>
                                <h4 className="font-semibold text-sm">
                                  {test.testName}
                                </h4>
                                <p className="text-xs text-gray-600 capitalize">
                                  {test.testType}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={`border ${getStatusColor(
                                test.status
                              )}`}
                            >
                              {test.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-600">Date:</span>
                              <p>
                                {new Date(test.testDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Amount:</span>
                              <p>
                                {test.amountCharged
                                  ? `AFN ${test.amountCharged}`
                                  : "N/A"}
                              </p>
                            </div>
                            {test.paymentStatus && (
                              <div className="col-span-2">
                                <span className="text-gray-600">Payment:</span>
                                <Badge
                                  className={`ml-2 border ${getPaymentStatusColor(
                                    test.paymentStatus
                                  )}`}
                                >
                                  {test.paymentStatus}
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadReport(test)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TestTube className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg">
                      No test history found for this patient
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      This patient hasn't undergone any laboratory tests yet.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
