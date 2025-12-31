// components/home/ContactForm.tsx - Comprehensive Contact Form Component
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  User,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Building,
  Calendar,
  Users,
  Star,
  Heart,
  Sparkles,
  Shield,
  Lock,
  Upload,
  FileText,
  MapPin,
  Globe,
  Briefcase,
  CreditCard,
  Bell,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { type ContactTheme, contactFormFields } from "@/lib/contact-theme";
import { motion, AnimatePresence } from "framer-motion";

interface ContactFormProps {
  theme: ContactTheme;
  variant?: "default" | "minimal" | "modern" | "classic" | "luxury" | "glass";
  onSubmit?: (data: FormData) => Promise<void>;
  isLoading?: boolean;
  showResponseTime?: boolean;
  enableAttachments?: boolean;
  enableNewsletter?: boolean;
  hotelInfo?: {
    name: string;
    location: string;
    phone: string;
    email: string;
    checkIn?: string;
    checkOut?: string;
  };
}

interface FormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  type: string;
  message: string;
  guests?: number;
  checkIn?: string;
  checkOut?: string;
  roomType?: string;
  subscribeNewsletter?: boolean;
  attachments?: File[];
}

interface FormErrors {
  [key: string]: string;
}

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
}

const ROOM_TYPES = [
  "Standard Room",
  "Deluxe Room",
  "Junior Suite",
  "Executive Suite",
  "Presidential Suite",
  "Villa",
  "Penthouse",
];

const INQUIRY_TYPES = [
  { value: "general", label: "General Inquiry", icon: MessageSquare },
  { value: "booking", label: "Booking Request", icon: Calendar },
  { value: "group", label: "Group Booking", icon: Users },
  { value: "event", label: "Event Planning", icon: Building },
  { value: "support", label: "Customer Support", icon: Phone },
  { value: "feedback", label: "Feedback", icon: Star },
  { value: "partnership", label: "Partnership", icon: Briefcase },
];

export default function ContactForm({
  theme,
  variant = "default",
  onSubmit,
  isLoading: externalLoading = false,
  showResponseTime = true,
  enableAttachments = false,
  enableNewsletter = true,
  hotelInfo,
}: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    type: "general",
    message: "",
    guests: 1,
    checkIn: "",
    checkOut: "",
    roomType: "",
    subscribeNewsletter: true,
    attachments: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [uploadIntervals, setUploadIntervals] = useState<{
    [key: string]: NodeJS.Timeout;
  }>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    setFormData((prev) => ({
      ...prev,
      checkIn: today.toISOString().split("T")[0],
      checkOut: tomorrow.toISOString().split("T")[0],
    }));
  }, []);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(uploadIntervals).forEach((interval) => {
        clearInterval(interval);
      });
    };
  }, [uploadIntervals]);

  const getVariantClasses = () => {
    const baseClasses = {
      form: `${theme.form.background} ${theme.form.border} ${theme.form.borderRadius} ${theme.form.padding} ${theme.form.shadow}`,
      input: `${theme.input.background} ${theme.input.border} ${theme.input.borderRadius} ${theme.input.padding} ${theme.input.color} focus:${theme.input.focusBorder} focus:ring-2 focus:${theme.input.focusRing} transition-all duration-200`,
      button: `${theme.button.background} ${theme.button.backgroundHover} ${theme.button.color} ${theme.button.borderRadius} ${theme.button.padding} ${theme.button.fontWeight} ${theme.button.shadow} ${theme.button.shadowHover} transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`,
      label: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
      error: "text-red-600 dark:text-red-400 text-sm mt-1",
      success: "text-green-600 dark:text-green-400 text-sm mt-1",
    };

    switch (variant) {
      case "minimal":
        return {
          ...baseClasses,
          form: `${baseClasses.form} border-none shadow-none`,
          input: `${baseClasses.input} border-b-2 border-t-0 border-l-0 border-r-0 rounded-none focus:ring-0`,
          button: `${baseClasses.button} rounded-none`,
        };

      case "modern":
        return {
          ...baseClasses,
          form: `${baseClasses.form} backdrop-blur-sm bg-white/80 dark:bg-gray-900/80`,
          input: `${baseClasses.input} backdrop-blur-sm bg-white/50 dark:bg-gray-800/50`,
          button: `${baseClasses.button} backdrop-blur-sm`,
        };

      case "classic":
        return {
          ...baseClasses,
          form: `${baseClasses.form} border-2`,
          input: `${baseClasses.input} border-2`,
          button: `${baseClasses.button} border-2 border-current`,
        };

      case "luxury":
        return {
          ...baseClasses,
          form: `${baseClasses.form} bg-gradient-to-br from-white to-amber-50 dark:from-gray-900 dark:to-amber-950/20 relative overflow-hidden`,
          input: `${baseClasses.input} bg-white/50 dark:bg-gray-800/30 border-amber-200/50 dark:border-amber-800/30`,
          button: `${baseClasses.button} bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:via-amber-700 hover:to-yellow-600`,
          label: `${baseClasses.label} font-semibold`,
        };

      case "glass":
        return {
          ...baseClasses,
          form: `${baseClasses.form} glassmorphism border border-white/20`,
          input: `${baseClasses.input} glassmorphism border border-white/20`,
          button: `${baseClasses.button} glassmorphism hover:bg-white/20`,
        };

      default:
        return baseClasses;
    }
  };

  const classes = getVariantClasses();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{8,}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    // Booking validation if booking type
    if (formData.type === "booking") {
      if (!formData.checkIn) {
        newErrors.checkIn = "Check-in date is required";
      }
      if (!formData.checkOut) {
        newErrors.checkOut = "Check-out date is required";
      }
      if (formData.checkIn && formData.checkOut) {
        const checkIn = new Date(formData.checkIn);
        const checkOut = new Date(formData.checkOut);
        if (checkOut <= checkIn) {
          newErrors.checkOut = "Check-out must be after check-in";
        }
      }
      if (!formData.guests || formData.guests < 1) {
        newErrors.guests = "Number of guests is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Show booking details when booking type is selected
    if (name === "type" && value === "booking") {
      setShowBookingDetails(true);
    } else if (name === "type" && value !== "booking") {
      setShowBookingDetails(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file types and sizes
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];

    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        setErrors({
          file: `File ${file.name} is not a supported format. Please use PDF, JPG, or PNG.`,
        });
        return false;
      }
      if (file.size > maxFileSize) {
        setErrors({
          file: `File ${file.name} is too large. Maximum size is 10MB.`,
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Clear any previous file errors
    if (errors.file) {
      setErrors((prev) => ({ ...prev, file: "" }));
    }

    const newFiles: UploadedFile[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
    }));

    // Simulate upload progress with proper cleanup
    newFiles.forEach((file) => {
      const interval = setInterval(() => {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, progress: Math.min(f.progress + 25, 100) }
              : f
          )
        );
        setUploadIntervals((prev) => {
          const updated = { ...prev };
          if (file.progress >= 100) {
            clearInterval(updated[file.id]);
            delete updated[file.id];
          }
          return updated;
        });
      }, 100);

      setUploadIntervals((prev) => ({ ...prev, [file.id]: interval }));
    });

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    setFormData((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...validFiles],
    }));
  };

  const removeFile = (id: string) => {
    // Clear interval if exists
    if (uploadIntervals[id]) {
      clearInterval(uploadIntervals[id]);
      setUploadIntervals((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }

    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));

    // Properly match and remove from attachments array
    setFormData((prev) => {
      const fileToRemove = uploadedFiles.find((f) => f.id === id);
      if (!fileToRemove) return prev;

      return {
        ...prev,
        attachments:
          prev.attachments?.filter((file, index) => {
            const matchIndex = uploadedFiles.findIndex((f) => f.file === file);
            return (
              matchIndex !== -1 &&
              matchIndex !== uploadedFiles.findIndex((f) => f.id === id)
            );
          }) || [],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      setIsSubmitted(true);

      // Clear all intervals before reset
      Object.values(uploadIntervals).forEach((interval) => {
        clearInterval(interval);
      });
      setUploadIntervals({});

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        type: "general",
        message: "",
        guests: 1,
        checkIn: new Date().toISOString().split("T")[0],
        checkOut: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        roomType: "",
        subscribeNewsletter: true,
        attachments: [],
      });
      setUploadedFiles([]);
      setShowBookingDetails(false);
    } catch (error) {
      console.error("Form submission error:", error);
      setErrors({ submit: "Failed to send message. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add luxury decoration for luxury variant
  if (variant === "luxury") {
    return (
      <div className="relative">
        {/* Luxury background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-50/5 to-transparent" />
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16">
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-500/30 rounded-tl-lg" />
        </div>
        <div className="absolute top-0 right-0 w-16 h-16">
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-500/30 rounded-tr-lg" />
        </div>
        <div className="absolute bottom-0 left-0 w-16 h-16">
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-500/30 rounded-bl-lg" />
        </div>
        <div className="absolute bottom-0 right-0 w-16 h-16">
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-500/30 rounded-br-lg" />
        </div>

        <ContactFormContent
          classes={classes}
          formData={formData}
          errors={errors}
          isSubmitting={isSubmitting}
          externalLoading={externalLoading}
          isSubmitted={isSubmitted}
          uploadedFiles={uploadedFiles}
          showBookingDetails={showBookingDetails}
          showResponseTime={showResponseTime}
          enableAttachments={enableAttachments}
          enableNewsletter={enableNewsletter}
          hotelInfo={hotelInfo}
          variant={variant}
          onInputChange={handleInputChange}
          onFileUpload={handleFileUpload}
          onRemoveFile={removeFile}
          onSubmit={handleSubmit}
          onReset={() => setIsSubmitted(false)}
          fileInputRef={fileInputRef}
        />
      </div>
    );
  }

  return (
    <ContactFormContent
      classes={classes}
      formData={formData}
      errors={errors}
      isSubmitting={isSubmitting}
      externalLoading={externalLoading}
      isSubmitted={isSubmitted}
      uploadedFiles={uploadedFiles}
      showBookingDetails={showBookingDetails}
      showResponseTime={showResponseTime}
      enableAttachments={enableAttachments}
      enableNewsletter={enableNewsletter}
      hotelInfo={hotelInfo}
      variant={variant}
      onInputChange={handleInputChange}
      onFileUpload={handleFileUpload}
      onRemoveFile={removeFile}
      onSubmit={handleSubmit}
      onReset={() => setIsSubmitted(false)}
      fileInputRef={fileInputRef}
    />
  );
}

interface ContactFormContentProps {
  classes: any;
  formData: FormData;
  errors: FormErrors;
  isSubmitting: boolean;
  externalLoading: boolean;
  isSubmitted: boolean;
  uploadedFiles: UploadedFile[];
  showBookingDetails: boolean;
  showResponseTime: boolean;
  enableAttachments: boolean;
  enableNewsletter: boolean;
  hotelInfo?: ContactFormProps["hotelInfo"];
  variant: string;
  onInputChange: (name: string, value: any) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (id: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

function ContactFormContent({
  classes,
  formData,
  errors,
  isSubmitting,
  externalLoading,
  isSubmitted,
  uploadedFiles,
  showBookingDetails,
  showResponseTime,
  enableAttachments,
  enableNewsletter,
  hotelInfo,
  variant,
  onInputChange,
  onFileUpload,
  onRemoveFile,
  onSubmit,
  onReset,
  fileInputRef,
}: ContactFormContentProps) {
  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${classes.form} text-center py-12`}
      >
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Message Sent Successfully!
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md mx-auto">
          Thank you for contacting us. We've received your message and will get
          back to you within 2 hours.
        </p>

        {hotelInfo && (
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-6 max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span className="font-medium text-amber-800 dark:text-amber-200">
                {hotelInfo.name}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              We'll contact you regarding your inquiry about our property in{" "}
              {hotelInfo.location}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onReset}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300"
          >
            Send Another Message
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 border border-amber-300 text-amber-700 dark:text-amber-300 font-semibold rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-300"
          >
            Print Confirmation
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${classes.form} relative`}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          {variant === "luxury" && (
            <Sparkles className="w-6 h-6 text-amber-500" />
          )}
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Send us a Message
          </h3>
          {variant === "luxury" && (
            <Sparkles className="w-6 h-6 text-amber-500" />
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Fill out the form below and we'll get back to you as soon as possible.
        </p>

        {hotelInfo && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-amber-600" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {hotelInfo.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {hotelInfo.location}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Inquiry Type Selection */}
        <div className="space-y-3">
          <label className={classes.label}>
            Inquiry Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {INQUIRY_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => onInputChange("type", type.value)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.type === type.value
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                      : "border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700"
                  }`}
                >
                  <Icon className="w-5 h-5 mb-2" />
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
          {errors.type && <p className={classes.error}>{errors.type}</p>}
        </div>

        {/* Name and Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className={classes.label}>
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => onInputChange("name", e.target.value)}
                placeholder="Enter your full name"
                className={`${classes.input} pl-10`}
                required
              />
            </div>
            {errors.name && <p className={classes.error}>{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className={classes.label}>
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => onInputChange("email", e.target.value)}
                placeholder="Enter your email"
                className={`${classes.input} pl-10`}
                required
              />
            </div>
            {errors.email && <p className={classes.error}>{errors.email}</p>}
          </div>
        </div>

        {/* Phone and Guests Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="phone" className={classes.label}>
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => onInputChange("phone", e.target.value)}
                placeholder="Enter your phone number"
                className={`${classes.input} pl-10`}
              />
            </div>
            {errors.phone && <p className={classes.error}>{errors.phone}</p>}
          </div>

          {formData.type === "booking" && (
            <div className="space-y-2">
              <label htmlFor="guests" className={classes.label}>
                Number of Guests <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  id="guests"
                  min="1"
                  max="20"
                  value={formData.guests}
                  onChange={(e) =>
                    onInputChange("guests", parseInt(e.target.value))
                  }
                  className={`${classes.input} pl-10`}
                  required={formData.type === "booking"}
                />
              </div>
              {errors.guests && (
                <p className={classes.error}>{errors.guests}</p>
              )}
            </div>
          )}
        </div>

        {/* Booking Details - Animated */}
        <AnimatePresence>
          {showBookingDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 overflow-hidden"
            >
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  Booking Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="checkIn" className={classes.label}>
                      Check-in Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="checkIn"
                      value={formData.checkIn}
                      onChange={(e) => onInputChange("checkIn", e.target.value)}
                      className={classes.input}
                      required
                    />
                    {errors.checkIn && (
                      <p className={classes.error}>{errors.checkIn}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="checkOut" className={classes.label}>
                      Check-out Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="checkOut"
                      value={formData.checkOut}
                      onChange={(e) =>
                        onInputChange("checkOut", e.target.value)
                      }
                      className={classes.input}
                      required
                    />
                    {errors.checkOut && (
                      <p className={classes.error}>{errors.checkOut}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <label htmlFor="roomType" className={classes.label}>
                    Preferred Room Type
                  </label>
                  <select
                    id="roomType"
                    value={formData.roomType}
                    onChange={(e) => onInputChange("roomType", e.target.value)}
                    className={classes.input}
                  >
                    <option value="">Select room type</option>
                    {ROOM_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subject */}
        <div className="space-y-2">
          <label htmlFor="subject" className={classes.label}>
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={(e) => onInputChange("subject", e.target.value)}
            placeholder="What is this about?"
            className={classes.input}
            required
          />
          {errors.subject && <p className={classes.error}>{errors.subject}</p>}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label htmlFor="message" className={classes.label}>
            Message <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => onInputChange("message", e.target.value)}
              placeholder="Tell us more about your inquiry..."
              rows={5}
              className={`${classes.input} pl-10`}
              required
            />
          </div>
          {errors.message && <p className={classes.error}>{errors.message}</p>}
        </div>

        {/* File Upload */}
        {enableAttachments && (
          <div className="space-y-3">
            <label className={classes.label}>Attachments (Optional)</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`${classes.input} border-dashed cursor-pointer hover:border-amber-400 transition-colors duration-200 text-center py-8`}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-300">
                Click to upload files or drag and drop
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                PDF, JPG, PNG up to 10MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={onFileUpload}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>

            {/* Uploaded Files List */}
            <AnimatePresence>
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {file.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        {file.progress === 100 ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => onRemoveFile(file.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* File Upload Errors */}
            {errors.file && <p className={classes.error}>{errors.file}</p>}
          </div>
        )}

        {/* Newsletter Subscription */}
        {enableNewsletter && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <input
              type="checkbox"
              id="newsletter"
              checked={formData.subscribeNewsletter}
              onChange={(e) =>
                onInputChange("subscribeNewsletter", e.target.checked)
              }
              className="mt-1 w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
            />
            <label
              htmlFor="newsletter"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Subscribe to our newsletter for exclusive offers, updates, and
              luxury travel insights.
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                You can unsubscribe at any time.
              </span>
            </label>
          </div>
        )}

        {/* Security & Privacy Note */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Secure & Private
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Your information is protected with 256-bit SSL encryption. We
            respect your privacy and will never share your data with third
            parties.
          </p>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className={classes.error}>{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || externalLoading}
          className={`${classes.button} w-full justify-center py-4 text-lg`}
        >
          {isSubmitting || externalLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Message
              {variant === "luxury" && <Sparkles className="w-4 h-4" />}
            </>
          )}
        </button>

        {/* Response Time Info */}
        {showResponseTime && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>
              We typically respond within 2 hours during business hours
            </span>
          </div>
        )}

        {/* Trust Badges for Luxury Variant */}
        {variant === "luxury" && (
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-amber-200/50 dark:border-amber-800/30">
            <div className="text-center">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Secure Booking
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Best Price Guarantee
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <Bell className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                24/7 Support
              </p>
            </div>
          </div>
        )}
      </form>
    </motion.div>
  );
}
