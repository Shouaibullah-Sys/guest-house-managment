"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Stethoscope, Phone, Mail, Building } from "lucide-react";
import { Doctor, CreateDoctorForm } from "@/types/types";

export default function LaboratoryDoctorsPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [showAddDoctorForm, setShowAddDoctorForm] = useState(false);

  // Check if user has lab access
  if (!user) {
    redirect("/sign-in");
  }

  const userRole = user.publicMetadata?.role as string;
  if (userRole !== "admin" && userRole !== "laboratory") {
    redirect("/");
  }

  // Form state for new doctor
  const [newDoctor, setNewDoctor] = useState<CreateDoctorForm>({
    name: "",
    specialization: "",
    phoneNumber: "",
    email: "",
    clinicName: "",
    licenseNumber: "",
  });

  // Fetch all doctors
  const { data: doctorsData, isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const response = await fetch("/api/laboratory/doctors");
      if (!response.ok) throw new Error("Failed to fetch doctors");
      return response.json();
    },
  });

  // Create doctor mutation
  const createDoctorMutation = useMutation({
    mutationFn: async (doctorData: CreateDoctorForm) => {
      const response = await fetch("/api/laboratory/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doctorData),
      });
      if (!response.ok) throw new Error("Failed to create doctor");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      setShowAddDoctorForm(false);
      setNewDoctor({
        name: "",
        specialization: "",
        phoneNumber: "",
        email: "",
        clinicName: "",
        licenseNumber: "",
      });
    },
  });

  const handleCreateDoctor = () => {
    createDoctorMutation.mutate(newDoctor);
  };

  const doctors = doctorsData?.doctors || [];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Doctors</h1>
          <p className="text-gray-600 mt-2">
            Add and manage referring doctors for laboratory tests
          </p>
        </div>

        {/* Add Doctor Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowAddDoctorForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Doctor
          </Button>
        </div>

        {/* Add Doctor Form */}
        {showAddDoctorForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Add New Doctor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="doctorName">Doctor Name *</Label>
                  <Input
                    id="doctorName"
                    value={newDoctor.name}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, name: e.target.value })
                    }
                    placeholder="Dr. John Smith"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={newDoctor.specialization}
                    onChange={(e) =>
                      setNewDoctor({
                        ...newDoctor,
                        specialization: e.target.value,
                      })
                    }
                    placeholder="e.g., Cardiology, General Medicine"
                  />
                </div>
                <div>
                  <Label htmlFor="doctorPhone">Phone Number</Label>
                  <Input
                    id="doctorPhone"
                    type="tel"
                    value={newDoctor.phoneNumber}
                    onChange={(e) =>
                      setNewDoctor({
                        ...newDoctor,
                        phoneNumber: e.target.value,
                      })
                    }
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="doctorEmail">Email</Label>
                  <Input
                    id="doctorEmail"
                    type="email"
                    value={newDoctor.email}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, email: e.target.value })
                    }
                    placeholder="doctor@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="clinicName">Clinic/Hospital Name</Label>
                  <Input
                    id="clinicName"
                    value={newDoctor.clinicName}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, clinicName: e.target.value })
                    }
                    placeholder="City General Hospital"
                  />
                </div>
                <div>
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    value={newDoctor.licenseNumber}
                    onChange={(e) =>
                      setNewDoctor({
                        ...newDoctor,
                        licenseNumber: e.target.value,
                      })
                    }
                    placeholder="Medical license number"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateDoctor}
                  disabled={createDoctorMutation.isPending}
                >
                  {createDoctorMutation.isPending ? "Adding..." : "Add Doctor"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddDoctorForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Doctors Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Registered Doctors
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-lg">Loading doctors...</div>
              </div>
            ) : doctors.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Clinic</TableHead>
                    <TableHead>License</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor: Doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">
                        {doctor.name}
                      </TableCell>
                      <TableCell>
                        {doctor.specialization ? (
                          <Badge variant="outline">
                            {doctor.specialization}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {doctor.phoneNumber && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {doctor.phoneNumber}
                            </div>
                          )}
                          {doctor.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {doctor.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {doctor.clinicName ? (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {doctor.clinicName}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {doctor.licenseNumber ? (
                          <Badge variant="secondary">
                            {doctor.licenseNumber}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">Not specified</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No doctors registered yet.</p>
                <Button onClick={() => setShowAddDoctorForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Doctor
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
