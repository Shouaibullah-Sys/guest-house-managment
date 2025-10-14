interface Answer {
  id: number | null;
  ans: string;
  approved?: boolean | null;
  contributor: string;
  contributorId: string;
  questionId: number;
  timestamp?: string; // ISO 8601 string format
}

interface Question {
  id: number | null;
  quiz: string;
  approved: boolean | null;
  answers: Answer[];
  contributor: string;
  contributorId: string;
  timestamp?: string; // ISO 8601 string format
}

type Roles = "admin" | "laboratory" | "patient";

// Patient types
export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  createdAt: string;
  updatedAt: string;
}

// Doctor types
export interface Doctor {
  id: number;
  name: string;
  specialization?: string;
  phoneNumber?: string;
  email?: string;
  clinicName?: string;
  licenseNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// Laboratory test types
export interface LaboratoryTest {
  id: number;
  patientId: number;
  doctorId?: number;
  testType: string;
  testName: string;
  testDate: string;
  results?: string;
  status: "pending" | "completed" | "cancelled";
  notes?: string;
  referredBy?: string;
  technician?: string;
  amountCharged?: number;
  amountPaid?: number;
  paymentStatus: "pending" | "paid" | "partial" | "waived";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  patient?: Patient;
  doctor?: Doctor;
}

// Form types for creating/editing
export interface CreatePatientForm {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
}

export interface CreateLaboratoryTestForm {
  patientId: number;
  doctorId?: number;
  testType: string;
  testName: string;
  testDate?: string;
  results?: string;
  status?: "pending" | "completed" | "cancelled";
  notes?: string;
  referredBy?: string;
  technician?: string;
  amountCharged?: number;
  amountPaid?: number;
  paymentStatus?: "pending" | "paid" | "partial" | "waived";
}

export interface CreateDoctorForm {
  name: string;
  specialization?: string;
  phoneNumber?: string;
  email?: string;
  clinicName?: string;
  licenseNumber?: string;
}

// Expense types
export interface LaboratoryExpense {
  id: number;
  expenseType: "regular_payment" | "doctor_percentage" | "laboratory_salary";
  description: string;
  amount: number;
  expenseDate: string;
  relatedTestId?: number;
  relatedDoctorId?: number;
  percentage?: number;
  isRecurring: boolean;
  recurringFrequency?: string;
  status: "active" | "inactive" | "paid";
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  relatedTest?: LaboratoryTest;
  relatedDoctor?: Doctor;
}

export interface DoctorCommission {
  id: number;
  doctorId: number;
  commissionPercentage: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  doctor?: Doctor;
}

export interface LaboratoryStaff {
  id: number;
  staffName: string;
  position: string;
  salaryPercentage: number;
  baseSalary?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Form types for expenses
export interface CreateExpenseForm {
  expenseType: "regular_payment" | "doctor_percentage" | "laboratory_salary";
  description: string;
  amount: number;
  expenseDate?: string;
  relatedTestId?: number;
  relatedDoctorId?: number;
  percentage?: number;
  isRecurring?: boolean;
  recurringFrequency?: string;
  status?: "active" | "inactive" | "paid";
  notes?: string;
}

export interface CreateDoctorCommissionForm {
  doctorId: number;
  commissionPercentage: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  isActive?: boolean;
}

export interface CreateLaboratoryStaffForm {
  staffName: string;
  position: string;
  salaryPercentage: number;
  baseSalary?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  isActive?: boolean;
}
