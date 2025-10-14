// app/laboratory/daily-record/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [showNewTestForm, setShowNewTestForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingTest, setEditingTest] =
    useState<LaboratoryTestWithDetails | null>(null);
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
    email: "",
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
    technician: "",
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setShowNewPatientForm(false);
      setNewPatient({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
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
        technician: "",
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
      const response = await fetch(`/api/laboratory/tests/${testId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });
      if (!response.ok) throw new Error("Failed to update lab test");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-tests"] });
      setEditingTest(null);
    },
  });

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
      testType: test.testType,
      testName: test.testName,
      status: test.status,
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
      laboratoryName: "Medical Laboratory Center",
      laboratoryAddress: "123 Medical Drive, Healthcare City",
      laboratoryContact: "+1 (555) 123-4567",
    });
  };

  const doctors = doctorsData?.doctors || [];
  const patients = searchResults?.patients || [];
  const tests = todaysTests?.tests || [];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            Laboratory Daily Record
          </h1>
          <p className="text-muted-foreground mt-2">
            Search patients and create laboratory tests
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Patient by Phone Number
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} disabled={!phoneNumber.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            {/* Search Results */}
            {patients.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Search Results:</h3>
                <div className="space-y-2">
                  {patients.map((patient: Patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          <Phone className="h-3 w-3 inline mr-1" />
                          {patient.phoneNumber}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSelectPatient(patient)}
                      >
                        Select & Create Test
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {phoneNumber && patients.length === 0 && (
              <div className="mt-4 text-center">
                <p className="text-gray-500 mb-4">
                  No patients found with this phone number.
                </p>
                <Button onClick={() => setShowNewPatientForm(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create New Patient
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* New Patient Form */}
        {showNewPatientForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Patient</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
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
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={newPatient.lastName}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, lastName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="patientPhone">Phone Number *</Label>
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
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newPatient.email}
                    onChange={(e) =>
                      setNewPatient({ ...newPatient, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
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
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={newPatient.gender}
                    onValueChange={(value) =>
                      setNewPatient({ ...newPatient, gender: value })
                    }
                  >
                    <SelectTrigger>
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
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newPatient.address}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, address: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={newPatient.emergencyContact}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      emergencyContact: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="medicalHistory">Medical History</Label>
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
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreatePatient}
                  disabled={createPatientMutation.isPending}
                >
                  {createPatientMutation.isPending
                    ? "Creating..."
                    : "Create Patient"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewPatientForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lab Test Creation Form */}
        {showNewTestForm && selectedPatient && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                Create Laboratory Test for {selectedPatient.firstName}{" "}
                {selectedPatient.lastName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Test Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testType">Test Type *</Label>
                  <Select
                    value={newTest.testType}
                    onValueChange={(value) => {
                      setNewTest({
                        ...newTest,
                        testType: value,
                        urine: value !== "urine" ? undefined : newTest.urine,
                        stool: value !== "stool" ? undefined : newTest.stool,
                        blood: value !== "blood" ? undefined : newTest.blood,
                      });
                    }}
                  >
                    <SelectTrigger>
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
                <div>
                  <Label htmlFor="testName">Test Name *</Label>
                  <Input
                    id="testName"
                    value={newTest.testName}
                    onChange={(e) =>
                      setNewTest({ ...newTest, testName: e.target.value })
                    }
                    placeholder="e.g., Complete Blood Count"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="testDate">Test Date</Label>
                  <Input
                    id="testDate"
                    type="date"
                    value={newTest.testDate}
                    onChange={(e) =>
                      setNewTest({ ...newTest, testDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="doctor">Referred By (Doctor)</Label>
                  <Select
                    value={newTest.doctorId?.toString()}
                    onValueChange={(value) =>
                      setNewTest({ ...newTest, doctorId: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
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
                <div>
                  <Label htmlFor="technician">Technician</Label>
                  <Input
                    id="technician"
                    value={newTest.technician}
                    onChange={(e) =>
                      setNewTest({ ...newTest, technician: e.target.value })
                    }
                    placeholder="Lab technician name"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newTest.status}
                    onValueChange={(
                      value: "pending" | "completed" | "cancelled"
                    ) => setNewTest({ ...newTest, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amountCharged">Amount Charged ($)</Label>
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
                  />
                </div>
                <div>
                  <Label htmlFor="amountPaid">Amount Paid ($)</Label>
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
                  />
                </div>
                <div>
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <Select
                    value={newTest.paymentStatus}
                    onValueChange={(
                      value: "pending" | "paid" | "partial" | "waived"
                    ) => setNewTest({ ...newTest, paymentStatus: value })}
                  >
                    <SelectTrigger>
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

              {/* Dynamic Test-Specific Fields */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Test Parameters</h3>

                {/* Urine Test Fields */}
                {newTest.testType === "urine" && (
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
                )}

                {/* Blood Test Fields */}
                {newTest.testType === "blood" && (
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
                  </div>
                )}

                {/* Stool Test Fields */}
                {newTest.testType === "stool" && (
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
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div>
                <Label htmlFor="notes">Clinical Notes & Observations</Label>
                <Textarea
                  id="notes"
                  value={newTest.notes}
                  onChange={(e) =>
                    setNewTest({ ...newTest, notes: e.target.value })
                  }
                  rows={3}
                  placeholder="Additional clinical notes, observations, or special instructions..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateTest}
                  disabled={createTestMutation.isPending}
                >
                  {createTestMutation.isPending ? "Creating..." : "Create Test"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewTestForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Test Modal */}
        <Dialog open={!!editingTest} onOpenChange={() => setEditingTest(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Laboratory Test
                {editingTest?.patient && (
                  <span>
                    for {editingTest.patient.firstName}{" "}
                    {editingTest.patient.lastName}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editTestType">Test Type</Label>
                <Select
                  value={editForm.testType}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, testType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blood">Blood Test</SelectItem>
                    <SelectItem value="urine">Urine Test</SelectItem>
                    <SelectItem value="stool">Stool Test</SelectItem>
                    <SelectItem value="biochemistry">Biochemistry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editTestName">Test Name</Label>
                <Input
                  value={editForm.testName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, testName: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(
                    value: "pending" | "completed" | "cancelled"
                  ) => setEditForm({ ...editForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editTechnician">Technician</Label>
                <Input
                  value={editForm.technician}
                  onChange={(e) =>
                    setEditForm({ ...editForm, technician: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="editAmountCharged">Amount Charged ($)</Label>
                <Input
                  type="number"
                  value={editForm.amountCharged}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      amountCharged: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="editAmountPaid">Amount Paid ($)</Label>
                <Input
                  type="number"
                  value={editForm.amountPaid}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      amountPaid: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="editPaymentStatus">Payment Status</Label>
                <Select
                  value={editForm.paymentStatus}
                  onValueChange={(
                    value: "pending" | "paid" | "partial" | "waived"
                  ) => setEditForm({ ...editForm, paymentStatus: value })}
                >
                  <SelectTrigger>
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

            <div>
              <Label htmlFor="editResults">Test Results</Label>
              <Textarea
                value={editForm.results}
                onChange={(e) =>
                  setEditForm({ ...editForm, results: e.target.value })
                }
                rows={4}
                placeholder="Enter detailed test results..."
              />
            </div>

            <div>
              <Label htmlFor="editNotes">Notes</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm({ ...editForm, notes: e.target.value })
                }
                rows={3}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingTest(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateTest}
                disabled={updateTestMutation.isPending}
              >
                {updateTestMutation.isPending ? "Updating..." : "Update Test"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Today's Tests Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Laboratory Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Test Type</TableHead>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map((test: LaboratoryTestWithDetails) => (
                    <TableRow key={test.id}>
                      <TableCell>
                        {test.patient
                          ? `${test.patient.firstName} ${test.patient.lastName}`
                          : "Unknown Patient"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{test.testType}</Badge>
                      </TableCell>
                      <TableCell>{test.testName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            test.status === "completed"
                              ? "default"
                              : test.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {test.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {test.amountCharged && test.amountPaid ? (
                          <div className="text-sm">
                            <div>Charged: ${test.amountCharged}</div>
                            <div>Paid: ${test.amountPaid}</div>
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
                              className="mt-1"
                            >
                              {test.paymentStatus}
                            </Badge>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(test.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTest(test)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReport(test)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No laboratory tests recorded today.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
