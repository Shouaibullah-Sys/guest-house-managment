"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Stethoscope,
  Phone,
  Mail,
  Building,
  UserCog,
  Shield,
  User,
  IdCard,
  Smartphone,
} from "lucide-react";
import { Doctor, CreateDoctorForm } from "@/types/types";
import { gsap } from "gsap";

export default function LaboratoryDoctorsPage() {
  const { user, isLoaded } = useUser();
  const queryClient = useQueryClient();
  const [showAddDoctorForm, setShowAddDoctorForm] = useState(false);

  // Refs for GSAP animations
  const heroRef = useRef(null);
  const formRef = useRef(null);
  const tableRef = useRef(null);

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

  // Initialize animations
  useEffect(() => {
    if (!isLoaded) return;

    const tl = gsap.timeline();

    // Hero section animation
    tl.fromTo(
      heroRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );

    // Form animation when shown
    if (showAddDoctorForm) {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" }
      );
    }

    // Table animation
    gsap.fromTo(
      ".doctor-row",
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.3,
      }
    );

    // Floating animation for icons
    gsap.to(".floating-icon", {
      y: -5,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, [isLoaded, showAddDoctorForm]);

  // Check if user has lab access
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Doctors Management...</p>
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

  const handleCreateDoctor = () => {
    createDoctorMutation.mutate(newDoctor);
  };

  const doctors = doctorsData?.doctors || [];

  // Mobile-friendly doctor card component
  const MobileDoctorCard = ({ doctor }: { doctor: Doctor }) => (
    <div className="doctor-row bg-white border-2 border-gray-100 rounded-xl p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-3 mb-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <UserCog className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{doctor.name}</h3>
          {doctor.specialization && (
            <Badge
              variant="outline"
              className="mt-1 bg-blue-50 text-blue-700 border-blue-200"
            >
              {doctor.specialization}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 mb-3">
        {doctor.phoneNumber && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{doctor.phoneNumber}</span>
          </div>
        )}
        {doctor.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700 truncate">{doctor.email}</span>
          </div>
        )}
        {doctor.clinicName && (
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{doctor.clinicName}</span>
          </div>
        )}
        {doctor.licenseNumber && (
          <div className="flex items-center gap-2 text-sm">
            <IdCard className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700 font-mono text-xs">
              {doctor.licenseNumber}
            </span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Doctor ID</span>
          <span className="text-xs text-gray-600 font-mono">
            {String(doctor.id).slice(0, 8)}...
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 floating-icon">
          <Stethoscope className="h-8 w-8 text-blue-200 opacity-60" />
        </div>
        <div
          className="absolute top-40 right-20 floating-icon"
          style={{ animationDelay: "1s" }}
        >
          <User className="h-6 w-6 text-teal-200 opacity-60" />
        </div>
        <div
          className="absolute bottom-40 left-20 floating-icon"
          style={{ animationDelay: "2s" }}
        >
          <Building className="h-10 w-10 text-sky-200 opacity-60" />
        </div>
        <div
          className="absolute bottom-20 right-10 floating-icon"
          style={{ animationDelay: "1.5s" }}
        >
          <Shield className="h-8 w-8 text-green-200 opacity-60" />
        </div>
      </div>

      <Header />

      <main className="flex-grow container mx-auto p-4 md:p-6 relative z-10">
        {/* Hero Section */}
        <section className="mb-8" ref={heroRef}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Referring Doctors Management
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Manage referring physicians, their contact information, and
                professional details for laboratory test orders.
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

        {/* Add Doctor Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowAddDoctorForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3"
          >
            <Plus className="h-5 w-5" />
            Add New Doctor
          </Button>
        </div>

        {/* Add Doctor Form */}
        {showAddDoctorForm && (
          <Card
            className="mb-6 shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50"
            ref={formRef}
          >
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl py-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-white/20 p-2 rounded-lg">
                  <UserCog className="h-5 w-5" />
                </div>
                Register New Doctor
              </CardTitle>
              <CardDescription className="text-green-100">
                Add a new referring physician to the laboratory system
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="doctorName"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Doctor Name *
                  </Label>
                  <Input
                    id="doctorName"
                    value={newDoctor.name}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, name: e.target.value })
                    }
                    placeholder="Dr. John Smith"
                    required
                    className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="specialization"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Stethoscope className="h-4 w-4" />
                    Specialization
                  </Label>
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
                    className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="doctorPhone"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
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
                    className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="doctorEmail"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="doctorEmail"
                    type="email"
                    value={newDoctor.email}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, email: e.target.value })
                    }
                    placeholder="doctor@example.com"
                    className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="clinicName"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Building className="h-4 w-4" />
                    Clinic/Hospital Name
                  </Label>
                  <Input
                    id="clinicName"
                    value={newDoctor.clinicName}
                    onChange={(e) =>
                      setNewDoctor({ ...newDoctor, clinicName: e.target.value })
                    }
                    placeholder="City General Hospital"
                    className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="licenseNumber"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <IdCard className="h-4 w-4" />
                    License Number
                  </Label>
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
                    className="border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl h-12"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleCreateDoctor}
                  disabled={createDoctorMutation.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {createDoctorMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding Doctor...
                    </>
                  ) : (
                    "Register Doctor"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddDoctorForm(false)}
                  className="border-2 border-gray-300 hover:border-gray-400 px-8 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Doctors Table */}
        <Card
          className="shadow-2xl border-0 bg-gradient-to-br from-white to-purple-50"
          ref={tableRef}
        >
          <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl py-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="bg-white/20 p-2 rounded-lg">
                <Stethoscope className="h-5 w-5" />
              </div>
              Registered Referring Doctors
            </CardTitle>
            <CardDescription className="text-purple-100">
              {doctors.length} {doctors.length === 1 ? "doctor" : "doctors"}{" "}
              registered in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Loading doctors...</p>
              </div>
            ) : doctors.length > 0 ? (
              <div>
                {/* Mobile View */}
                <div className="block md:hidden">
                  <div className="space-y-3">
                    {doctors.map((doctor: Doctor) => (
                      <MobileDoctorCard key={doctor.id} doctor={doctor} />
                    ))}
                  </div>

                  {/* Mobile Notice */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Smartphone className="h-4 w-4 text-blue-600" />
                      <p className="text-sm text-blue-700">
                        Scroll to view all doctor information
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
                          Doctor Name
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 py-5 text-lg border-b-2 border-gray-200">
                          Specialization
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 py-5 text-lg border-b-2 border-gray-200">
                          Contact Information
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 py-5 text-lg border-b-2 border-gray-200">
                          Clinic/Hospital
                        </TableHead>
                        <TableHead className="font-bold text-gray-900 py-5 text-lg border-b-2 border-gray-200">
                          License Number
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {doctors.map((doctor: Doctor) => (
                        <TableRow
                          key={doctor.id}
                          className="doctor-row hover:bg-blue-50 transition-colors duration-200"
                        >
                          <TableCell className="font-semibold text-gray-900 py-4 text-lg border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 p-2 rounded-lg">
                                <UserCog className="h-4 w-4 text-blue-600" />
                              </div>
                              {doctor.name}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 border-b border-gray-100">
                            {doctor.specialization ? (
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200 font-semibold"
                              >
                                {doctor.specialization}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">
                                Not specified
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="py-4 border-b border-gray-100">
                            <div className="space-y-2">
                              {doctor.phoneNumber && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-4 w-4 text-gray-500" />
                                  <span className="text-gray-700">
                                    {doctor.phoneNumber}
                                  </span>
                                </div>
                              )}
                              {doctor.email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-4 w-4 text-gray-500" />
                                  <span className="text-gray-700">
                                    {doctor.email}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 border-b border-gray-100">
                            {doctor.clinicName ? (
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-700">
                                  {doctor.clinicName}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">
                                Not specified
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="py-4 border-b border-gray-100">
                            {doctor.licenseNumber ? (
                              <Badge
                                variant="secondary"
                                className="bg-green-50 text-green-700 border-green-200 font-mono text-sm"
                              >
                                {doctor.licenseNumber}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">
                                Not specified
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Stethoscope className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                <p className="text-2xl text-gray-500 mb-3 font-semibold">
                  No Doctors Registered
                </p>
                <p className="text-gray-400 text-lg mb-6">
                  Get started by adding the first referring doctor to the
                  system.
                </p>
                <Button
                  onClick={() => setShowAddDoctorForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6 py-3"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add First Doctor
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="bg-gradient-to-r from-gray-800 to-blue-900 text-white py-8 mt-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="bg-white/10 p-2 rounded-full">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div className="bg-white/10 p-2 rounded-full">
              <UserCog className="h-5 w-5" />
            </div>
            <div className="bg-white/10 p-2 rounded-full">
              <Shield className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm text-gray-300 mb-2">
            © 2024 Laboratory Management System • Professional Grade Diagnostics
          </p>
          <p className="text-xs text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Certified ISO 15189:2012 • HIPAA Compliant • CLIA Certified
          </p>
        </div>
      </footer>
    </div>
  );
}
