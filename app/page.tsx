// app/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
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
import {
  Search,
  Download,
  Calendar,
  User,
  FileText,
  Shield,
  Stethoscope,
  Heart,
  Activity,
  Microscope,
  Clock,
  Smartphone,
} from "lucide-react";
import { PatientWithTests, PatientTestReport } from "@/types/types";
import { LabReportPDF, LaboratoryTestWithDetails } from "@/lib/pdf-generator";
import { gsap } from "gsap";
import SoftwareAd from "@/components/SoftwareAd";

type VerificationStep = "phone" | "pin" | "verified";

export default function PatientPortal() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [patientPin, setPatientPin] = useState("");
  const [patient, setPatient] = useState<PatientWithTests | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [verificationStep, setVerificationStep] =
    useState<VerificationStep>("phone");
  const [isMobile, setIsMobile] = useState(false);
  const [showAd, setShowAd] = useState(false); // Start with ad hidden

  // Refs for GSAP animations
  const heroRef = useRef(null);
  const cardRef = useRef(null);
  const phoneStepRef = useRef(null);
  const pinStepRef = useRef(null);
  const verifiedStepRef = useRef(null);
  const patientInfoRef = useRef(null);
  const tableRef = useRef(null);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Initialize animations on component mount
  useEffect(() => {
    const tl = gsap.timeline();

    // Hero section animation
    tl.fromTo(
      heroRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );

    // Card animation
    tl.fromTo(
      cardRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" },
      "-=0.5"
    );

    // Floating elements animation
    gsap.to(".floating-element", {
      y: 10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // Pulse animation for security icons
    gsap.to(".pulse-security", {
      scale: 1.1,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  // Animate step transitions
  useEffect(() => {
    if (verificationStep === "phone") {
      gsap.fromTo(
        phoneStepRef.current,
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }
      );
    } else if (verificationStep === "pin") {
      gsap.fromTo(
        pinStepRef.current,
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }
      );
    } else if (verificationStep === "verified" && patient) {
      const tl = gsap.timeline();
      tl.fromTo(
        verifiedStepRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" }
      )
        .fromTo(
          patientInfoRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.3"
        )
        .fromTo(
          tableRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
          "-=0.2"
        );

      // Animate table rows sequentially
      gsap.fromTo(
        ".table-row",
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.5,
        }
      );

      // Show the ad after successful verification
      const adTimer = setTimeout(() => {
        setShowAd(true);
      }, 1000); // Show ad 1 second after verification

      return () => clearTimeout(adTimer);
    }
  }, [verificationStep, patient]);

  const handlePhoneSearch = async () => {
    if (!phoneNumber.trim()) {
      setError("لطفاً شماره تلفن خود را وارد کنید");
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      // Animate button loading state
      gsap.to(".verify-phone-btn", {
        scale: 0.95,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
      });

      const response = await fetch(
        `/api/patients/search?phone=${encodeURIComponent(phoneNumber)}`
      );

      if (response.status === 404) {
        setError(
          "هیچ بیماری با این شماره تلفن یافت نشد. لطفاً شماره خود را بررسی کنید و دوباره امتحان کنید."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Animate transition to next step
      const tl = gsap.timeline();
      tl.to(phoneStepRef.current, {
        opacity: 0,
        x: -50,
        duration: 0.4,
        ease: "power2.in",
      }).call(() => setVerificationStep("pin"));
    } catch (err) {
      console.error("Search error:", err);
      setError("خطایی در جستجو رخ داد. لطفاً بعداً دوباره امتحان کنید.");

      // Error shake animation
      gsap.to(cardRef.current, {
        x: 10,
        duration: 0.1,
        repeat: 5,
        yoyo: true,
        ease: "power1.inOut",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handlePinVerification = async () => {
    if (!patientPin.trim()) {
      setError("لطفاً پین خود را وارد کنید");
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      // Loading animation for PIN verification
      gsap.to(".verify-pin-btn", {
        rotation: 360,
        duration: 1,
        ease: "power2.inOut",
      });

      const response = await fetch("/api/patients/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, patientPin }),
      });

      if (response.status === 401) {
        setError("پین نامعتبر است. لطفاً دوباره امتحان کنید.");
        return;
      }

      if (response.status === 404) {
        setError("بیمار یافت نشد.");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const patientData = await response.json();

      // Success animation sequence
      const tl = gsap.timeline();
      tl.to(pinStepRef.current, {
        opacity: 0,
        x: 50,
        duration: 0.4,
        ease: "power2.in",
      }).call(() => {
        setPatient(patientData);
        setVerificationStep("verified");
        // Don't set showAd here - it's handled in the useEffect above
      });
    } catch (err) {
      console.error("Verification error:", err);
      setError("خطایی در فرآیند تایید رخ داد. لطفاً بعداً دوباره امتحان کنید.");

      // Error animation
      gsap.to(".pin-input", {
        x: 10,
        duration: 0.1,
        repeat: 3,
        yoyo: true,
        ease: "power1.inOut",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    // Reset animation
    const tl = gsap.timeline();
    tl.to([verifiedStepRef.current, patientInfoRef.current, tableRef.current], {
      opacity: 0,
      y: 50,
      duration: 0.4,
      ease: "power2.in",
    })
      .call(() => {
        setVerificationStep("phone");
        setPatientPin("");
        setError("");
        setPatient(null);
        setShowAd(false); // Hide ad when resetting
      })
      .to(phoneStepRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: "power2.out",
      });
  };

  const handleDownloadReport = (test: PatientTestReport) => {
    if (!patient) return;

    // Download button animation
    gsap.to(`.download-btn-${test.id}`, {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
    });

    const reportData = {
      id: test.id.toString(), // Convert number to string to match PDF generator type
      testName: test.testName,
      testType: test.testType,
      testDate: test.testDate,
      status: test.status,
      reportId: test.reportId,
      technician: test.technician,
      notes: test.notes,
      results: test.results,
      paymentStatus: "paid",
      createdBy: "system",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patient: {
        id: patient.id.toString(), // Convert number to string to match PDF generator type
        firstName: patient.firstName,
        lastName: patient.lastName,
        phoneNumber: patient.phoneNumber,
        email: "",
        dateOfBirth: patient.dateOfBirth || "",
        gender: patient.gender || "",
        address: "",
        emergencyContact: "",
        medicalHistory: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      laboratoryName: "مرکز آزمایشگاه پزشکی",
      laboratoryAddress: "خیابان بهداشت ۱۲۳، شهر پزشکی",
      laboratoryContact: "+۹۳ (۵۵۵) ۱۲۳-۴۵۶۷",
    } as LaboratoryTestWithDetails;

    LabReportPDF.downloadReport(reportData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-AF", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Mobile-friendly table row component
  const MobileTableRow = ({ test }: { test: PatientTestReport }) => (
    <div className="table-row bg-white border-2 border-gray-100 rounded-xl p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-gray-500">
            نام آزمایش
          </Label>
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-lg">
              <Activity className="h-3 w-3 text-blue-600" />
            </div>
            <p className="font-semibold text-gray-900 text-sm">
              {test.testName}
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-gray-500">نوع</Label>
          <Badge
            variant="outline"
            className="capitalize text-xs px-2 py-1 border bg-blue-50 text-blue-700 border-blue-200"
          >
            {test.testType}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-gray-500">تاریخ</Label>
          <p className="text-gray-700 font-medium text-sm">
            {formatDate(test.testDate)}
          </p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-gray-500">وضعیت</Label>
          <Badge
            variant={
              test.status === "completed"
                ? "default"
                : test.status === "pending"
                ? "secondary"
                : "destructive"
            }
            className={`capitalize text-xs px-2 py-1 ${
              test.status === "completed"
                ? "bg-green-100 text-green-800 border-green-200"
                : test.status === "pending"
                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                : "bg-red-100 text-red-800 border-red-200"
            }`}
          >
            {test.status}
          </Badge>
        </div>
      </div>

      <div className="space-y-1 mb-3">
        <Label className="text-xs font-semibold text-gray-500">
          شناسه گزارش
        </Label>
        <p className="text-gray-600 font-mono text-xs">{test.reportId}</p>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownloadReport(test)}
          className={`download-btn-${test.id} hover:bg-green-50 hover:text-green-600 hover:border-green-300 border font-semibold rounded-lg px-3 py-2 text-xs`}
        >
          PDF
          <Download className="h-3 w-3 ml-1" />
        </Button>
        <Label className="text-xs font-semibold text-gray-500">
          دانلود گزارش
        </Label>
      </div>
    </div>
  );

  return (
    <div
      className="flex pt-8 min-h-screen flex-col bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50"
      dir="rtl"
    >
      {/* Software Ad Component - Only show after PIN verification */}
      <SoftwareAd show={showAd} onClose={() => setShowAd(false)} />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 floating-element">
          <Heart className="h-8 w-8 text-pink-200 opacity-60" />
        </div>
        <div
          className="absolute top-40 right-20 floating-element"
          style={{ animationDelay: "1s" }}
        >
          <Activity className="h-6 w-6 text-blue-200 opacity-60" />
        </div>
        <div
          className="absolute bottom-40 left-20 floating-element"
          style={{ animationDelay: "2s" }}
        >
          <Microscope className="h-10 w-10 text-teal-200 opacity-60" />
        </div>
        <div
          className="absolute bottom-20 right-10 floating-element"
          style={{ animationDelay: "1.5s" }}
        >
          <Stethoscope className="h-8 w-8 text-green-200 opacity-60" />
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8 pt-24 relative z-10">
        {/* Hero Section */}
        <section className="text-center mb-12" ref={heroRef}>
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-blue-100">
                <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-4 rounded-full pulse-security">
                  <Shield className="h-16 w-16 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-4 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent leading-tight h-auto">
              پورتال امن بیماران
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              نتایج آزمایش‌های پزشکی و سوابق بهداشتی خود را با سیستم تایید دو
              مرحله‌ای رمزگذاری شده ما مشاهده کنید
            </p>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-12">
              <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-blue-50">
                <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">۲۴/۷</div>
                <div className="text-sm text-gray-600">دسترسی</div>
              </div>
              <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-blue-50">
                <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">HIPAA</div>
                <div className="text-sm text-gray-600">سازگار</div>
              </div>
              <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-blue-50">
                <FileText className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-800">امن</div>
                <div className="text-sm text-gray-600">سوابق</div>
              </div>
            </div>
          </div>
        </section>

        {/* Verification Steps */}
        <Card
          className="mb-8 shadow-2xl border-0 bg-white/90 backdrop-blur-sm"
          ref={cardRef}
        >
          <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-t-xl py-6">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="pulse-security">
                <Shield className="h-7 w-7" />
              </div>
              تایید دسترسی امن
            </CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              {verificationStep === "phone" &&
                "شماره تلفن ثبت شده خود را وارد کنید"}
              {verificationStep === "pin" &&
                "پین منحصر به فرد بیمار خود را برای تایید وارد کنید"}
              {verificationStep === "verified" &&
                "دسترسی به سوابق پزشکی شما مجاز شد"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {/* Step 1: Phone Number */}
            {verificationStep === "phone" && (
              <div
                className="flex flex-col sm:flex-row-reverse gap-6 max-w-2xl"
                ref={phoneStepRef}
              >
                <div className="flex items-end lg:mb-7">
                  <Button
                    onClick={handlePhoneSearch}
                    disabled={isSearching}
                    className="verify-phone-btn h-14 px-10 text-lg bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isSearching ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-3"></div>
                        در حال تایید...
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5 ml-3" />
                        تایید تلفن
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"
                  >
                    شماره تلفن
                    <User className="h-4 w-4" />
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="شماره تلفن ثبت شده خود را وارد کنید"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handlePhoneSearch()}
                    className="h-14 text-lg border-2 border-gray-200 focus:border-blue-500 transition-colors rounded-xl"
                  />
                  <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    اطلاعات شما با رمزگذاری سرتاسری محافظت می‌شود
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: PIN Verification */}
            {verificationStep === "pin" && (
              <div className="max-w-2xl" ref={pinStepRef}>
                <div className="mb-6 p-5 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-800 font-semibold mb-1">
                        مرحله امنیتی لازم است
                      </p>
                      <p className="text-yellow-700 text-sm">
                        لطفاً پین ۶ رقمی که در زمان ایجاد پروفایل شما ارائه شده
                        را وارد کنید. این کار اطمینان می‌دهد که فقط شما
                        می‌توانید به سوابق پزشکی خود دسترسی داشته باشید.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row-reverse gap-6">
                  <div className="flex items-end gap-3">
                    <Button
                      onClick={handlePinVerification}
                      disabled={isSearching}
                      className="verify-pin-btn h-14 px-10 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isSearching ? "در حال تایید..." : "تایید پین"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="h-14 px-8 border-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      بازگشت
                    </Button>
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor="pin"
                      className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"
                    >
                      پین بیمار
                      <Shield className="h-4 w-4" />
                    </Label>
                    <Input
                      id="pin"
                      type="password"
                      placeholder="پین ۶ رقمی خود را وارد کنید"
                      value={patientPin}
                      onChange={(e) => setPatientPin(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handlePinVerification()
                      }
                      className="pin-input h-14 text-lg border-2 border-gray-200 focus:border-green-500 transition-colors rounded-xl text-center tracking-widest font-mono"
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-6 p-5 bg-red-50 border-2 border-red-200 rounded-xl animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-full">
                    <Shield className="h-4 w-4 text-red-600" />
                  </div>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {verificationStep === "verified" && (
              <div className="text-center py-6" ref={verifiedStepRef}>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-6 border-4 border-white shadow-lg">
                  <Shield className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-3">
                  هویت با موفقیت تایید شد
                </h3>
                <p className="text-green-600 text-lg max-w-md mx-auto">
                  اکنون شما به سوابق پزشکی و نتایج آزمایش خود دسترسی امن دارید.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient Information and Test Reports */}
        {verificationStep === "verified" && patient && (
          <div className="space-y-8" ref={verifiedStepRef}>
            {/* Patient Information Card */}
            <Card
              className="shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50"
              ref={patientInfoRef}
            >
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-xl py-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <User className="h-7 w-7" />
                  اطلاعات بیمار
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <div className="space-y-2 text-center p-4 md:p-5 bg-white rounded-xl shadow-sm border border-green-100">
                    <Label className="text-xs md:text-sm font-semibold text-gray-500 flex items-center justify-center gap-2">
                      <User className="h-3 w-3 md:h-4 md:w-4" />
                      نام کامل
                    </Label>
                    <p className="text-lg md:text-xl font-bold text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </p>
                  </div>
                  <div className="space-y-2 text-center p-4 md:p-5 bg-white rounded-xl shadow-sm border border-blue-100">
                    <Label className="text-xs md:text-sm font-semibold text-gray-500 flex items-center justify-center gap-2">
                      <Search className="h-3 w-3 md:h-4 md:w-4" />
                      شماره تلفن
                    </Label>
                    <p className="text-lg md:text-xl font-bold text-gray-900">
                      {patient.phoneNumber}
                    </p>
                  </div>
                  <div className="space-y-2 text-center p-4 md:p-5 bg-white rounded-xl shadow-sm border border-purple-100">
                    <Label className="text-xs md:text-sm font-semibold text-gray-500 flex items-center justify-center gap-2">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                      تاریخ تولد
                    </Label>
                    <p className="text-lg md:text-xl font-bold text-gray-900">
                      {patient.dateOfBirth
                        ? formatDate(patient.dateOfBirth)
                        : "ارائه نشده"}
                    </p>
                  </div>
                  <div className="space-y-2 text-center p-4 md:p-5 bg-white rounded-xl shadow-sm border border-pink-100">
                    <Label className="text-xs md:text-sm font-semibold text-gray-500 flex items-center justify-center gap-2">
                      <Activity className="h-3 w-3 md:h-4 md:w-4" />
                      جنسیت
                    </Label>
                    <p className="text-lg md:text-xl font-bold text-gray-900">
                      {patient.gender || "ارائه نشده"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Reports Card */}
            <Card
              className="shadow-2xl border-0 bg-gradient-to-br from-white to-purple-50"
              ref={tableRef}
            >
              <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl py-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <FileText className="h-7 w-7" />
                  گزارش‌های آزمایشگاهی
                </CardTitle>
                <CardDescription className="text-purple-100 text-lg">
                  تاریخچه کامل آزمایش‌های شما. برای ذخیره گزارش‌ها به صورت PDF
                  روی دکمه دانلود کلیک کنید.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-8">
                {patient.tests && patient.tests.length > 0 ? (
                  <div>
                    {/* Mobile View */}
                    <div className="block md:hidden">
                      <div className="space-y-3">
                        {patient.tests.map((test, index) => (
                          <MobileTableRow key={test.id} test={test} />
                        ))}
                      </div>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block rounded-xl border border-gray-200 overflow-hidden shadow-lg">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:bg-gray-100">
                            <TableHead className="font-bold text-gray-900 py-5 text-lg border-b-2 border-gray-200">
                              نام آزمایش
                            </TableHead>
                            <TableHead className="font-bold text-gray-900 py-5 text-lg border-b-2 border-gray-200">
                              نوع
                            </TableHead>
                            <TableHead className="font-bold text-gray-900 py-5 text-lg border-b-2 border-gray-200">
                              تاریخ
                            </TableHead>
                            <TableHead className="font-bold text-gray-900 py-5 text-lg border-b-2 border-gray-200">
                              وضعیت
                            </TableHead>
                            <TableHead className="font-bold text-gray-900 py-5 text-lg border-b-2 border-gray-200">
                              شناسه گزارش
                            </TableHead>
                            <TableHead className="font-bold text-gray-900 py-5 text-lg border-b-2 border-gray-200 text-right">
                              دانلود
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {patient.tests.map((test, index) => (
                            <TableRow
                              key={test.id}
                              className={`table-row hover:bg-blue-50 transition-colors duration-200 ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }`}
                            >
                              <TableCell className="font-semibold text-gray-900 py-4 text-lg border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                  <div className="bg-blue-100 p-2 rounded-lg">
                                    <Activity className="h-4 w-4 text-blue-600" />
                                  </div>
                                  {test.testName}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 border-b border-gray-100">
                                <Badge
                                  variant="outline"
                                  className="capitalize text-sm px-3 py-1.5 border-2 font-semibold bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  {test.testType}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4 text-gray-700 font-medium border-b border-gray-100">
                                {formatDate(test.testDate)}
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
                                  className={`capitalize text-sm px-3 py-1.5 font-semibold ${
                                    test.status === "completed"
                                      ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                                      : test.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
                                      : "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
                                  }`}
                                >
                                  {test.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4 text-gray-600 font-mono text-sm border-b border-gray-100">
                                {test.reportId}
                              </TableCell>
                              <TableCell className="py-4 text-right border-b border-gray-100">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadReport(test)}
                                  className={`download-btn-${test.id} hover:bg-green-50 hover:text-green-600 hover:border-green-300 border-2 font-semibold rounded-lg px-4 py-2 transition-all duration-200`}
                                >
                                  گزارش PDF
                                  <Download className="h-4 w-4 ml-2" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Notice */}
                    <div className="mt-4 md:hidden">
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Smartphone className="h-4 w-4 text-blue-600" />
                        <p className="text-sm text-blue-700">
                          برای دیدن تمام اطلاعات به صورت افقی اسکرول کنید
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FileText className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                    <p className="text-2xl text-gray-500 mb-3 font-semibold">
                      هیچ گزارش آزمایشی یافت نشد
                    </p>
                    <p className="text-gray-400 text-lg">
                      شما هنوز هیچ گزارش آزمایشگاهی ندارید.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full pulse-security">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 font-semibold">
                      <strong>اخطار امنیتی:</strong> برای محافظت از شما، این
                      جلسه به طور خودکار پس از ۱۵ دقیقه منقضی خواهد شد. لطفاً
                      قبل از بستن پنجره، گزارش‌های مهم خود را ذخیره کنید. حفظ
                      حریم خصوصی شما اولویت ماست.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
