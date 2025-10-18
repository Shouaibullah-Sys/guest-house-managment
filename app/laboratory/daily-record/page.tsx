"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  UserPlus,
  Calendar,
  Phone,
  Edit,
  Download,
  TestTube,
  Microscope,
  Activity,
  User,
  Stethoscope,
  Smartphone,
  MapPin,
  FlaskConical,
  Heart,
  Droplets,
  X,
  Save,
} from "lucide-react";
import {
  Patient,
  Doctor,
  LaboratoryTestWithDetails,
  CreatePatientForm,
  CreateLaboratoryTestForm,
  EditTestForm,
} from "@/types/types";
import { LabReportPDF } from "@/lib/pdf-generator";

export default function LaboratoryDailyRecord() {
  const { user, isLoaded } = useUser();
  const queryClient = useQueryClient();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [showNewTestForm, setShowNewTestForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingTest, setEditingTest] =
    useState<LaboratoryTestWithDetails | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Form states
  const [editForm, setEditForm] = useState<EditTestForm>({
    testType: "",
    testName: "",
    status: "pending",
    results: "",
    notes: "",
    technician: "",
    amountCharged: 0,
    amountPaid: 0,
    paymentStatus: "pending",
  });

  // Form states
  const [newPatient, setNewPatient] = useState<CreatePatientForm>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    emergencyContact: "",
    medicalHistory: "",
  });

  const [newTest, setNewTest] = useState<CreateLaboratoryTestForm>({
    patientId: 0,
    testType: "",
    testName: "",
    testDate: new Date().toISOString().split("T")[0],
    results: "",
    status: "pending",
    notes: "",
    referredBy: "",
    technician: user?.firstName || "",
    amountCharged: 0,
    amountPaid: 0,
    paymentStatus: "pending",
  });

  // Fetch patients by phone number
  const { data: searchResults, refetch: searchPatients } = useQuery({
    queryKey: ["patients", "search", phoneNumber],
    queryFn: async () => {
      if (!phoneNumber) return { patients: [] };

      const response = await fetch(
        `/api/laboratory/patients/search?phone=${encodeURIComponent(
          phoneNumber
        )}`
      );
      if (!response.ok) throw new Error("Failed to search patients");
      return response.json();
    },
    enabled: false,
  });

  // Fetch all doctors for the dropdown
  const { data: doctorsData } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const response = await fetch("/api/laboratory/doctors");
      if (!response.ok) throw new Error("Failed to fetch doctors");
      return response.json();
    },
  });

  // Fetch today's lab tests
  const { data: todaysTests } = useQuery({
    queryKey: ["lab-tests", "today"],
    queryFn: async () => {
      const response = await fetch("/api/laboratory/tests");
      if (!response.ok) throw new Error("Failed to fetch lab tests");
      return response.json();
    },
  });

  // Mutations
  const createPatientMutation = useMutation({
    mutationFn: async (patientData: CreatePatientForm) => {
      const response = await fetch("/api/laboratory/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
      });
      if (!response.ok) throw new Error("Failed to create patient");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setShowNewPatientForm(false);

      // Show the generated PIN to lab staff
      alert(
        `Patient created successfully! Patient PIN: ${data.generatedPin}\n\nPlease provide this PIN to the patient for future access.`
      );

      setNewPatient({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        emergencyContact: "",
        medicalHistory: "",
      });
    },
  });

  const createTestMutation = useMutation({
    mutationFn: async (testData: CreateLaboratoryTestForm) => {
      const response = await fetch("/api/laboratory/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });
      if (!response.ok) throw new Error("Failed to create lab test");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-tests"] });
      setShowNewTestForm(false);
      setNewTest({
        patientId: 0,
        testType: "",
        testName: "",
        testDate: new Date().toISOString().split("T")[0],
        results: "",
        status: "pending",
        notes: "",
        referredBy: "",
        technician: user?.firstName || "",
        amountCharged: 0,
        amountPaid: 0,
        paymentStatus: "pending",
      });
    },
  });

  const updateTestMutation = useMutation({
    mutationFn: async ({
      testId,
      testData,
    }: {
      testId: number;
      testData: EditTestForm;
    }) => {
      console.log("Updating test:", testId, testData);

      const response = await fetch(`/api/laboratory/tests/${testId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update lab test: ${response.status} ${errorText}`
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-tests"] });
      setEditingTest(null);
      setEditForm({
        testType: "",
        testName: "",
        status: "pending",
        results: "",
        notes: "",
        technician: "",
        amountCharged: 0,
        amountPaid: 0,
        paymentStatus: "pending",
      });
    },
    onError: (error: Error) => {
      console.error("Error updating test:", error);
      alert(`Failed to update test: ${error.message}`);
    },
  });

  // Check authentication
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Laboratory Daily Record...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect("/sign-in");
  }

  const userRole = user.publicMetadata?.role as string;
  if (userRole !== "admin" && userRole !== "laboratory") {
    redirect("/");
  }

  const handleSearch = () => {
    if (phoneNumber.trim()) {
      searchPatients();
    }
  };

  const handleCreatePatient = () => {
    createPatientMutation.mutate(newPatient);
  };

  const handleCreateTest = () => {
    if (selectedPatient) {
      createTestMutation.mutate({
        ...newTest,
        patientId: selectedPatient.id,
      });
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setPhoneNumber(patient.phoneNumber);
    setShowNewTestForm(true);
  };

  const handleEditTest = (test: LaboratoryTestWithDetails) => {
    setEditingTest(test);
    setEditForm({
      testType: test.testType || "",
      testName: test.testName || "",
      status: test.status || "pending",
      results: test.results || "",
      notes: test.notes || "",
      technician: test.technician || "",
      amountCharged: test.amountCharged || 0,
      amountPaid: test.amountPaid || 0,
      paymentStatus: test.paymentStatus || "pending",
    });
  };

  const handleUpdateTest = () => {
    if (editingTest) {
      updateTestMutation.mutate({
        testId: editingTest.id,
        testData: editForm,
      });
    }
  };

  const handleDownloadReport = (test: LaboratoryTestWithDetails) => {
    LabReportPDF.downloadReport({
      ...test,
      id: test.id.toString(),
      patient: test.patient
        ? {
            ...test.patient,
            id: test.patient.id.toString(),
          }
        : undefined,
      doctor: test.doctor
        ? {
            ...test.doctor,
            id: test.doctor.id.toString(),
          }
        : undefined,
      results: test.results ? [test.results] : undefined,
      laboratoryName: "Medical Laboratory Center",
      laboratoryAddress: "123 Medical Drive, Healthcare City",
      laboratoryContact: "+1 (555) 123-4567",
    });
  };

  const doctors = doctorsData?.doctors || [];
  const patients = searchResults?.patients || [];
  const tests = todaysTests?.tests || [];

  // Mobile-friendly test card component
  const MobileTestCard = ({ test }: { test: LaboratoryTestWithDetails }) => (
    <div className="test-row bg-white border-2 border-gray-100 rounded-xl p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <TestTube className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {test.patient
                ? `${test.patient.firstName} ${test.patient.lastName}`
                : "Unknown Patient"}
            </h3>
            <p className="text-sm text-gray-600">{test.testName}</p>
          </div>
        </div>
        <Badge variant="outline" className="capitalize">
          {test.testType}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-gray-500">Status</Label>
          <Badge
            variant={
              test.status === "completed"
                ? "default"
                : test.status === "pending"
                ? "secondary"
                : "destructive"
            }
            className="text-xs"
          >
            {test.status}
          </Badge>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-gray-500">Payment</Label>
          <Badge
            variant={
              test.paymentStatus === "paid"
                ? "default"
                : test.paymentStatus === "pending"
                ? "secondary"
                : "outline"
            }
            className="text-xs"
          >
            {test.paymentStatus}
          </Badge>
        </div>
      </div>

      {test.amountCharged && (
        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
          <div>
            <Label className="text-xs font-semibold text-gray-500">
              Charged
            </Label>
            <p className="text-gray-700">AFN {test.amountCharged}</p>
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-500">Paid</Label>
            <p className="text-gray-700">AFN {test.amountPaid || 0}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          {new Date(test.createdAt).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditTest(test)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadReport(test)}
            className="h-8 w-8 p-0"
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50 pt-24">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 floating-icon">
          <TestTube className="h-8 w-8 text-blue-200 opacity-60" />
        </div>
        <div
          className="absolute top-40 right-20 floating-icon"
          style={{ animationDelay: "1s" }}
        >
          <Microscope className="h-6 w-6 text-teal-200 opacity-60" />
        </div>
        <div
          className="absolute bottom-40 left-20 floating-icon"
          style={{ animationDelay: "2s" }}
        >
          <Activity className="h-10 w-10 text-sky-200 opacity-60" />
        </div>
        <div
          className="absolute bottom-20 right-10 floating-icon"
          style={{ animationDelay: "1.5s" }}
        >
          <Stethoscope className="h-8 w-8 text-green-200 opacity-60" />
        </div>
      </div>
      <main className="flex-grow container mx-auto p-4 md:p-6 relative z-10">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Laboratory Daily Record
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Search patients and manage laboratory tests with our secure
                daily record system.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Badge
                variant={userRole === "admin" ? "destructive" : "default"}
                className="text-sm px-3 py-1"
              >
                {userRole === "admin" ? "Administrator" : "Laboratory Staff"}
              </Badge>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <Card className="mb-6 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-t-xl py-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="bg-white/20 p-2 rounded-lg">
                <Search className="h-5 w-5" />
              </div>
              Search Patient by Phone Number
            </CardTitle>
            <CardDescription className="text-blue-100">
              Enter patient's phone number to search existing records or create
              new patient
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label
                  htmlFor="phone"
                  className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter patient's phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  onClick={handleSearch}
                  disabled={!phoneNumber.trim()}
                  className="h-12 px-8 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Search Results */}
            {patients.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3 text-gray-900">
                  Search Results:
                </h3>
                <div className="space-y-3">
                  {patients.map((patient: Patient) => (
                    <div
                      key={patient.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-blue-200 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3 mb-3 sm:mb-0">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <User className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {patient.phoneNumber}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleSelectPatient(patient)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Test
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {phoneNumber && patients.length === 0 && (
              <div className="mt-6 text-center py-6">
                <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4 text-lg">
                  No patients found with this phone number.
                </p>
                <Button
                  onClick={() => setShowNewPatientForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-xl px-6 py-3"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create New Patient
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* New Patient Form */}
        {showNewPatientForm && (
          <Card className="mb-6 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl py-6">
              <CardTitle className="flex items-center gap-3 text-xl text-white">
                <UserPlus className="h-6 w-6" />
                Create New Patient
              </CardTitle>
              <CardDescription className="text-purple-100">
                Enter patient details to create a new record in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={newPatient.firstName}
                    onChange={(e) =>
                      setNewPatient({
                        ...newPatient,
                        firstName: e.target.value,
                      })
                    }
                    required
                    className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    value={newPatient.lastName}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, lastName: e.target.value })
                    }
                    required
                    className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="patientPhone"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Phone Number *
                  </Label>
                  <Input
                    id="patientPhone"
                    type="tel"
                    value={newPatient.phoneNumber}
                    onChange={(e) =>
                      setNewPatient({
                        ...newPatient,
                        phoneNumber: e.target.value,
                      })
                    }
                    required
                    className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="dateOfBirth"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={newPatient.dateOfBirth}
                    onChange={(e) =>
                      setNewPatient({
                        ...newPatient,
                        dateOfBirth: e.target.value,
                      })
                    }
                    className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="gender"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Gender
                  </Label>
                  <Select
                    value={newPatient.gender}
                    onValueChange={(value) =>
                      setNewPatient({ ...newPatient, gender: value })
                    }
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="address"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <Input
                  id="address"
                  value={newPatient.address}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, address: e.target.value })
                  }
                  className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="emergencyContact"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Emergency Contact
                </Label>
                <Input
                  id="emergencyContact"
                  value={newPatient.emergencyContact}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      emergencyContact: e.target.value,
                    })
                  }
                  className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="medicalHistory"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <Stethoscope className="h-4 w-4" />
                  Medical History
                </Label>
                <Textarea
                  id="medicalHistory"
                  value={newPatient.medicalHistory}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      medicalHistory: e.target.value,
                    })
                  }
                  rows={3}
                  className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button
                  onClick={handleCreatePatient}
                  disabled={createPatientMutation.isPending}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {createPatientMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Patient...
                    </>
                  ) : (
                    "Create Patient"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewPatientForm(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lab Test Creation Form */}
        {showNewTestForm && selectedPatient && (
          <Card className="mb-6 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl py-6">
              <CardTitle className="flex items-center gap-3 text-xl text-white">
                <TestTube className="h-6 w-6" />
                Create Laboratory Test for {selectedPatient.firstName}{" "}
                {selectedPatient.lastName}
              </CardTitle>
              <CardDescription className="text-green-100">
                Complete all required test information and parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Basic Test Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="testType"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Test Type *
                  </Label>
                  <Select
                    value={newTest.testType}
                    onValueChange={(value) => {
                      setNewTest({
                        ...newTest,
                        testType: value,
                      });
                    }}
                  >
                    <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl h-12">
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blood">Blood Test</SelectItem>
                      <SelectItem value="urine">Urine Test</SelectItem>
                      <SelectItem value="stool">Stool Test</SelectItem>
                      <SelectItem value="biochemistry">Biochemistry</SelectItem>
                      <SelectItem value="hematology">Hematology</SelectItem>
                      <SelectItem value="microbiology">Microbiology</SelectItem>
                      <SelectItem value="immunology">Immunology</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="testName"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Test Name *
                  </Label>
                  <Input
                    id="testName"
                    value={newTest.testName}
                    onChange={(e) =>
                      setNewTest({ ...newTest, testName: e.target.value })
                    }
                    placeholder="e.g., Complete Blood Count"
                    required
                    className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="testDate"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Test Date
                  </Label>
                  <Input
                    id="testDate"
                    type="date"
                    value={newTest.testDate}
                    onChange={(e) =>
                      setNewTest({ ...newTest, testDate: e.target.value })
                    }
                    className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="doctor"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Referred By (Doctor)
                  </Label>
                  <Select
                    value={newTest.doctorId?.toString()}
                    onValueChange={(value) =>
                      setNewTest({ ...newTest, doctorId: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl h-12">
                      <SelectValue placeholder="Select referring doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor: Doctor) => (
                        <SelectItem
                          key={doctor.id}
                          value={doctor.id.toString()}
                        >
                          {doctor.name}
                          {doctor.specialization &&
                            ` (${doctor.specialization})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="technician"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Technician
                  </Label>
                  <Input
                    id="technician"
                    value={newTest.technician}
                    onChange={(e) =>
                      setNewTest({ ...newTest, technician: e.target.value })
                    }
                    placeholder="Lab technician name"
                    className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="status"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Status
                  </Label>
                  <Select
                    value={newTest.status}
                    onValueChange={(
                      value: "pending" | "completed" | "cancelled"
                    ) => setNewTest({ ...newTest, status: value })}
                  >
                    <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="amountCharged"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Amount Charged (AFN)
                  </Label>
                  <Input
                    id="amountCharged"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newTest.amountCharged || ""}
                    onChange={(e) =>
                      setNewTest({
                        ...newTest,
                        amountCharged: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                    className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="amountPaid"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Amount Paid (AFN)
                  </Label>
                  <Input
                    id="amountPaid"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newTest.amountPaid || ""}
                    onChange={(e) =>
                      setNewTest({
                        ...newTest,
                        amountPaid: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                    className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="paymentStatus"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Payment Status
                  </Label>
                  <Select
                    value={newTest.paymentStatus}
                    onValueChange={(
                      value: "pending" | "paid" | "partial" | "waived"
                    ) => setNewTest({ ...newTest, paymentStatus: value })}
                  >
                    <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="waived">Waived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dynamic Test Sections */}

              {/* Blood Test Fields */}
              {newTest.testType === "blood" && (
                <div className="border-2 border-red-200 rounded-xl p-6 bg-red-50/50">
                  <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Blood Test Parameters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="hemoglobin">Hemoglobin (g/dL)</Label>
                      <Input
                        id="hemoglobin"
                        value={newTest.blood?.hemoglobin || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            blood: {
                              ...newTest.blood,
                              hemoglobin: e.target.value,
                            },
                          })
                        }
                        placeholder="Hemoglobin"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rbcCount">RBC Count (million/mm³)</Label>
                      <Input
                        id="rbcCount"
                        value={newTest.blood?.rbcCount || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            blood: {
                              ...newTest.blood,
                              rbcCount: e.target.value,
                            },
                          })
                        }
                        placeholder="RBC Count"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wbcCount">WBC Count (/mm³)</Label>
                      <Input
                        id="wbcCount"
                        value={newTest.blood?.wbcCount || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            blood: {
                              ...newTest.blood,
                              wbcCount: e.target.value,
                            },
                          })
                        }
                        placeholder="WBC Count"
                      />
                    </div>
                    <div>
                      <Label htmlFor="plateletCount">
                        Platelet Count (/mm³)
                      </Label>
                      <Input
                        id="plateletCount"
                        value={newTest.blood?.plateletCount || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            blood: {
                              ...newTest.blood,
                              plateletCount: e.target.value,
                            },
                          })
                        }
                        placeholder="Platelet Count"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mcv">MCV (fL)</Label>
                      <Input
                        id="mcv"
                        value={newTest.blood?.mcv || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            blood: {
                              ...newTest.blood,
                              mcv: e.target.value,
                            },
                          })
                        }
                        placeholder="MCV"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mch">MCH (pg)</Label>
                      <Input
                        id="mch"
                        value={newTest.blood?.mch || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            blood: {
                              ...newTest.blood,
                              mch: e.target.value,
                            },
                          })
                        }
                        placeholder="MCH"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Urine Test Fields */}
              {newTest.testType === "urine" && (
                <div className="border-2 border-yellow-200 rounded-xl p-6 bg-yellow-50/50">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                    <Droplets className="h-5 w-5" />
                    Urine Test Parameters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        value={newTest.urine?.color || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            urine: { ...newTest.urine, color: e.target.value },
                          })
                        }
                        placeholder="Color"
                      />
                    </div>
                    <div>
                      <Label htmlFor="appearance">Appearance</Label>
                      <Input
                        id="appearance"
                        value={newTest.urine?.appearance || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            urine: {
                              ...newTest.urine,
                              appearance: e.target.value,
                            },
                          })
                        }
                        placeholder="Appearance"
                      />
                    </div>
                    <div>
                      <Label htmlFor="specificGravity">Specific Gravity</Label>
                      <Input
                        id="specificGravity"
                        value={newTest.urine?.specificGravity || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            urine: {
                              ...newTest.urine,
                              specificGravity: e.target.value,
                            },
                          })
                        }
                        placeholder="Specific Gravity"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ph">pH</Label>
                      <Input
                        id="ph"
                        value={newTest.urine?.ph || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            urine: { ...newTest.urine, ph: e.target.value },
                          })
                        }
                        placeholder="pH"
                      />
                    </div>
                    <div>
                      <Label htmlFor="protein">Protein</Label>
                      <Input
                        id="protein"
                        value={newTest.urine?.protein || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            urine: {
                              ...newTest.urine,
                              protein: e.target.value,
                            },
                          })
                        }
                        placeholder="Protein"
                      />
                    </div>
                    <div>
                      <Label htmlFor="glucose">Glucose</Label>
                      <Input
                        id="glucose"
                        value={newTest.urine?.glucose || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            urine: {
                              ...newTest.urine,
                              glucose: e.target.value,
                            },
                          })
                        }
                        placeholder="Glucose"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Stool Test Fields */}
              {newTest.testType === "stool" && (
                <div className="border-2 border-amber-200 rounded-xl p-6 bg-amber-50/50">
                  <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                    <FlaskConical className="h-5 w-5" />
                    Stool Test Parameters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="stoolColor">Color</Label>
                      <Input
                        id="stoolColor"
                        value={newTest.stool?.color || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            stool: { ...newTest.stool, color: e.target.value },
                          })
                        }
                        placeholder="Color"
                      />
                    </div>
                    <div>
                      <Label htmlFor="consistency">Consistency</Label>
                      <Input
                        id="consistency"
                        value={newTest.stool?.consistency || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            stool: {
                              ...newTest.stool,
                              consistency: e.target.value,
                            },
                          })
                        }
                        placeholder="Consistency"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mucus">Mucus</Label>
                      <Input
                        id="mucus"
                        value={newTest.stool?.mucus || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            stool: { ...newTest.stool, mucus: e.target.value },
                          })
                        }
                        placeholder="Mucus"
                      />
                    </div>
                    <div>
                      <Label htmlFor="occultBlood">Occult Blood</Label>
                      <Input
                        id="occultBlood"
                        value={newTest.stool?.occultBlood || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            stool: {
                              ...newTest.stool,
                              occultBlood: e.target.value,
                            },
                          })
                        }
                        placeholder="Occult Blood"
                      />
                    </div>

                    <div>
                      <Label htmlFor="parasites">Parasites</Label>
                      <Input
                        id="parasites"
                        value={newTest.stool?.parasites || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            stool: {
                              ...newTest.stool,
                              parasites: e.target.value,
                            },
                          })
                        }
                        placeholder="Parasites"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Biochemistry Test Fields */}
              {newTest.testType === "biochemistry" && (
                <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50/50">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Biochemistry Parameters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="glucose">Glucose (mg/dL)</Label>
                      <Input
                        id="glucose"
                        value={newTest.biochemistry?.glucose || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            biochemistry: {
                              ...newTest.biochemistry,
                              glucose: e.target.value,
                            },
                          })
                        }
                        placeholder="Glucose level"
                      />
                    </div>
                    <div>
                      <Label htmlFor="urea">Urea (mg/dL)</Label>
                      <Input
                        id="urea"
                        value={newTest.biochemistry?.urea || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            biochemistry: {
                              ...newTest.biochemistry,
                              urea: e.target.value,
                            },
                          })
                        }
                        placeholder="Urea"
                      />
                    </div>
                    <div>
                      <Label htmlFor="creatinine">Creatinine (mg/dL)</Label>
                      <Input
                        id="creatinine"
                        value={newTest.biochemistry?.creatinine || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            biochemistry: {
                              ...newTest.biochemistry,
                              creatinine: e.target.value,
                            },
                          })
                        }
                        placeholder="Creatinine"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cholesterol">Cholesterol (mg/dL)</Label>
                      <Input
                        id="cholesterol"
                        value={newTest.biochemistry?.cholesterol || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            biochemistry: {
                              ...newTest.biochemistry,
                              cholesterol: e.target.value,
                            },
                          })
                        }
                        placeholder="Cholesterol"
                      />
                    </div>
                    <div>
                      <Label htmlFor="triglycerides">
                        Triglycerides (mg/dL)
                      </Label>
                      <Input
                        id="triglycerides"
                        value={newTest.biochemistry?.triglycerides || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            biochemistry: {
                              ...newTest.biochemistry,
                              triglycerides: e.target.value,
                            },
                          })
                        }
                        placeholder="Triglycerides"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sgot">SGOT / AST (U/L)</Label>
                      <Input
                        id="sgot"
                        value={newTest.biochemistry?.sgot || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            biochemistry: {
                              ...newTest.biochemistry,
                              sgot: e.target.value,
                            },
                          })
                        }
                        placeholder="SGOT / AST"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sgpt">SGPT / ALT (U/L)</Label>
                      <Input
                        id="sgpt"
                        value={newTest.biochemistry?.sgpt || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            biochemistry: {
                              ...newTest.biochemistry,
                              sgpt: e.target.value,
                            },
                          })
                        }
                        placeholder="SGPT / ALT"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Hematology Test Fields */}
              {newTest.testType === "hematology" && (
                <div className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50/50">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Hematology Parameters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="hb">Hemoglobin (g/dL)</Label>
                      <Input
                        id="hb"
                        value={newTest.hematology?.hb || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            hematology: {
                              ...newTest.hematology,
                              hb: e.target.value,
                            },
                          })
                        }
                        placeholder="Hemoglobin"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rbc">RBC Count (million/mm³)</Label>
                      <Input
                        id="rbc"
                        value={newTest.hematology?.rbc || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            hematology: {
                              ...newTest.hematology,
                              rbc: e.target.value,
                            },
                          })
                        }
                        placeholder="RBC Count"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wbc">WBC Count (/mm³)</Label>
                      <Input
                        id="wbc"
                        value={newTest.hematology?.wbc || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            hematology: {
                              ...newTest.hematology,
                              wbc: e.target.value,
                            },
                          })
                        }
                        placeholder="WBC Count"
                      />
                    </div>
                    <div>
                      <Label htmlFor="platelets">Platelet Count (/mm³)</Label>
                      <Input
                        id="platelets"
                        value={newTest.hematology?.platelets || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            hematology: {
                              ...newTest.hematology,
                              platelets: e.target.value,
                            },
                          })
                        }
                        placeholder="Platelet Count"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pcv">Packed Cell Volume (%)</Label>
                      <Input
                        id="pcv"
                        value={newTest.hematology?.pcv || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            hematology: {
                              ...newTest.hematology,
                              pcv: e.target.value,
                            },
                          })
                        }
                        placeholder="PCV"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Microbiology Test Fields */}
              {newTest.testType === "microbiology" && (
                <div className="border-2 border-green-200 rounded-xl p-6 bg-green-50/50">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                    <Microscope className="h-5 w-5" />
                    Microbiology Parameters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="specimen">Specimen Type</Label>
                      <Input
                        id="specimen"
                        value={newTest.microbiology?.specimen || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            microbiology: {
                              ...newTest.microbiology,
                              specimen: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g., Blood, Urine, Sputum"
                      />
                    </div>
                    <div>
                      <Label htmlFor="organism">Organism Isolated</Label>
                      <Input
                        id="organism"
                        value={newTest.microbiology?.organism || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            microbiology: {
                              ...newTest.microbiology,
                              organism: e.target.value,
                            },
                          })
                        }
                        placeholder="Bacteria/Fungus name"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="sensitivity">
                        Antibiotic Sensitivity
                      </Label>
                      <Textarea
                        id="sensitivity"
                        value={newTest.microbiology?.sensitivity || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            microbiology: {
                              ...newTest.microbiology,
                              sensitivity: e.target.value,
                            },
                          })
                        }
                        rows={3}
                        placeholder="Enter antibiotic sensitivity pattern..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Immunology Test Fields */}
              {newTest.testType === "immunology" && (
                <div className="border-2 border-orange-200 rounded-xl p-6 bg-orange-50/50">
                  <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Immunology Parameters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hbsag">HBsAg</Label>
                      <Input
                        id="hbsag"
                        value={newTest.immunology?.hbsag || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            immunology: {
                              ...newTest.immunology,
                              hbsag: e.target.value,
                            },
                          })
                        }
                        placeholder="Reactive / Non-Reactive"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hiv">HIV</Label>
                      <Input
                        id="hiv"
                        value={newTest.immunology?.hiv || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            immunology: {
                              ...newTest.immunology,
                              hiv: e.target.value,
                            },
                          })
                        }
                        placeholder="Reactive / Non-Reactive"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hcv">HCV</Label>
                      <Input
                        id="hcv"
                        value={newTest.immunology?.hcv || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            immunology: {
                              ...newTest.immunology,
                              hcv: e.target.value,
                            },
                          })
                        }
                        placeholder="Reactive / Non-Reactive"
                      />
                    </div>
                    <div>
                      <Label htmlFor="crp">CRP (mg/L)</Label>
                      <Input
                        id="crp"
                        value={newTest.immunology?.crp || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            immunology: {
                              ...newTest.immunology,
                              crp: e.target.value,
                            },
                          })
                        }
                        placeholder="CRP Level"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="raTest">RA Test</Label>
                      <Input
                        id="raTest"
                        value={newTest.immunology?.raTest || ""}
                        onChange={(e) =>
                          setNewTest({
                            ...newTest,
                            immunology: {
                              ...newTest.immunology,
                              raTest: e.target.value,
                            },
                          })
                        }
                        placeholder="Positive / Negative"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Test Results */}
              <div className="space-y-2">
                <Label
                  htmlFor="results"
                  className="text-sm font-semibold text-gray-700"
                >
                  Test Results
                </Label>
                <Textarea
                  id="results"
                  value={newTest.results}
                  onChange={(e) =>
                    setNewTest({ ...newTest, results: e.target.value })
                  }
                  rows={4}
                  placeholder="Enter detailed test results and findings..."
                  className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl"
                />
              </div>

              {/* Notes Section */}
              <div className="space-y-2">
                <Label
                  htmlFor="notes"
                  className="text-sm font-semibold text-gray-700"
                >
                  Clinical Notes & Observations
                </Label>
                <Textarea
                  id="notes"
                  value={newTest.notes}
                  onChange={(e) =>
                    setNewTest({ ...newTest, notes: e.target.value })
                  }
                  rows={3}
                  placeholder="Additional clinical notes, observations, or special instructions..."
                  className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button
                  onClick={handleCreateTest}
                  disabled={createTestMutation.isPending}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {createTestMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Test...
                    </>
                  ) : (
                    "Create Test"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewTestForm(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Test Dialog */}
        <Dialog open={!!editingTest} onOpenChange={() => setEditingTest(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-t-lg p-6 -m-6 mb-6">
              <DialogTitle className="flex items-center gap-3 text-xl text-white">
                <Edit className="h-6 w-6" />
                Edit Laboratory Test
                {editingTest?.patient && (
                  <span>
                    {" "}
                    for {editingTest.patient.firstName}{" "}
                    {editingTest.patient.lastName}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="editTestType"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Test Type
                  </Label>
                  <Select
                    value={editForm.testType}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, testType: value })
                    }
                  >
                    <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl h-12">
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blood">Blood Test</SelectItem>
                      <SelectItem value="urine">Urine Test</SelectItem>
                      <SelectItem value="stool">Stool Test</SelectItem>
                      <SelectItem value="biochemistry">Biochemistry</SelectItem>
                      <SelectItem value="hematology">Hematology</SelectItem>
                      <SelectItem value="microbiology">Microbiology</SelectItem>
                      <SelectItem value="immunology">Immunology</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="editTestName"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Test Name
                  </Label>
                  <Input
                    id="editTestName"
                    value={editForm.testName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, testName: e.target.value })
                    }
                    className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="editStatus"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Status
                  </Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(
                      value: "pending" | "completed" | "cancelled"
                    ) => setEditForm({ ...editForm, status: value })}
                  >
                    <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl h-12">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="editTechnician"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Technician
                  </Label>
                  <Input
                    id="editTechnician"
                    value={editForm.technician}
                    onChange={(e) =>
                      setEditForm({ ...editForm, technician: e.target.value })
                    }
                    className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="editAmountCharged"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Amount Charged (AFN)
                  </Label>
                  <Input
                    id="editAmountCharged"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.amountCharged}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        amountCharged: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="editAmountPaid"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Amount Paid (AFN)
                  </Label>
                  <Input
                    id="editAmountPaid"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.amountPaid}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        amountPaid: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="editPaymentStatus"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Payment Status
                  </Label>
                  <Select
                    value={editForm.paymentStatus}
                    onValueChange={(
                      value: "pending" | "paid" | "partial" | "waived"
                    ) => setEditForm({ ...editForm, paymentStatus: value })}
                  >
                    <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl h-12">
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="waived">Waived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="editResults"
                  className="text-sm font-semibold text-gray-700"
                >
                  Test Results
                </Label>
                <Textarea
                  id="editResults"
                  value={editForm.results}
                  onChange={(e) =>
                    setEditForm({ ...editForm, results: e.target.value })
                  }
                  rows={4}
                  placeholder="Enter detailed test results..."
                  className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="editNotes"
                  className="text-sm font-semibold text-gray-700"
                >
                  Notes
                </Label>
                <Textarea
                  id="editNotes"
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  rows={3}
                  placeholder="Additional notes..."
                  className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingTest(null);
                    setEditForm({
                      testType: "",
                      testName: "",
                      status: "pending",
                      results: "",
                      notes: "",
                      technician: "",
                      amountCharged: 0,
                      amountPaid: 0,
                      paymentStatus: "pending",
                    });
                  }}
                  className="w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateTest}
                  disabled={updateTestMutation.isPending}
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                >
                  {updateTestMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating Test...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Test
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Today's Tests Table */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-purple-50">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl py-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="bg-white/20 p-2 rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
              Today's Laboratory Tests
            </CardTitle>
            <CardDescription className="text-purple-100">
              {tests.length} {tests.length === 1 ? "test" : "tests"} recorded
              today
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {tests.length > 0 ? (
              <div>
                {/* Mobile View */}
                <div className="block md:hidden">
                  <div className="space-y-3">
                    {tests.map((test: LaboratoryTestWithDetails) => (
                      <MobileTestCard key={test.id} test={test} />
                    ))}
                  </div>

                  {/* Mobile Notice */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Smartphone className="h-4 w-4 text-blue-600" />
                      <p className="text-sm text-blue-700">
                        Swipe to view all test information
                      </p>
                    </div>
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block rounded-xl border border-gray-200 overflow-hidden shadow-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:bg-gray-100">
                        <TableHead className="font-bold text-gray-900 py-5 text-lg border-b-2 border-gray-200">
                          Patient
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 py-5 text-lg border-b-2 border-gray-200">
                          Test Type
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 py-5 text-lg border-b-2 border-gray-200">
                          Test Name
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 py-5 text-lg border-b-2 border-gray-200">
                          Status
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 py-5 text-lg border-b-2 border-gray-200">
                          Payment
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 py-5 text-lg border-b-2 border-gray-200">
                          Created
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 py-5 text-lg border-b-2 border-gray-200 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tests.map((test: LaboratoryTestWithDetails) => (
                        <TableRow
                          key={test.id}
                          className="test-row hover:bg-blue-50 transition-colors duration-200"
                        >
                          <TableCell className="font-semibold text-gray-900 py-4 text-lg border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 p-2 rounded-lg">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              {test.patient
                                ? `${test.patient.firstName} ${test.patient.lastName}`
                                : "Unknown Patient"}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 border-b border-gray-100">
                            <Badge
                              variant="outline"
                              className="capitalize bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {test.testType}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 text-gray-700 font-medium border-b border-gray-100">
                            {test.testName}
                          </TableCell>
                          <TableCell className="py-4 border-b border-gray-100">
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
                          <TableCell className="py-4 border-b border-gray-100">
                            {test.amountCharged ? (
                              <div className="text-sm">
                                <div>AFN {test.amountCharged}</div>
                                <Badge
                                  variant={
                                    test.paymentStatus === "paid"
                                      ? "default"
                                      : test.paymentStatus === "pending"
                                      ? "secondary"
                                      : test.paymentStatus === "partial"
                                      ? "outline"
                                      : "destructive"
                                  }
                                  className="mt-1 text-xs"
                                >
                                  {test.paymentStatus}
                                </Badge>
                              </div>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell className="py-4 text-gray-600 border-b border-gray-100">
                            {new Date(test.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="py-4 text-right border-b border-gray-100">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTest(test)}
                                className="hover:bg-blue-50 hover:text-blue-600 border-blue-200"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadReport(test)}
                                className="hover:bg-green-50 hover:text-green-600 border-green-200"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <TestTube className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                <p className="text-2xl text-gray-500 mb-3 font-semibold">
                  No Laboratory Tests Today
                </p>
                <p className="text-gray-400 text-lg">
                  Get started by searching for a patient and creating your first
                  test.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
