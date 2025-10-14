// types/types.ts
export interface Answer {
  id: number | null;
  ans: string;
  approved?: boolean | null;
  contributor: string;
  contributorId: string;
  questionId: number;
  timestamp?: string;
}

export interface Question {
  id: number | null;
  quiz: string;
  approved: boolean | null;
  answers: Answer[];
  contributor: string;
  contributorId: string;
  timestamp?: string;
}

type Roles = "admin" | "laboratory" | "patient";

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
  patient?: Patient;
  doctor?: Doctor;
}

export interface LaboratoryTestWithDetails extends LaboratoryTest {
  patient?: Patient;
  doctor?: Doctor;
  reportId?: string;
  generatedAt?: string;
  laboratoryName?: string;
  laboratoryAddress?: string;
  laboratoryContact?: string;
}

export interface EditTestForm {
  testType: string;
  testName: string;
  status: "pending" | "completed" | "cancelled";
  results?: string;
  notes?: string;
  technician?: string;
  amountCharged?: number;
  amountPaid?: number;
  paymentStatus?: "pending" | "paid" | "partial" | "waived";
  urine?: any;
  stool?: any;
  blood?: any;
}

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

  urine?: {
    color?: string;
    appearance?: string;
    specificGravity?: string;
    ph?: string;
    protein?: string;
    glucose?: string;
    ketone?: string;
    bilirubin?: string;
    urobilinogen?: string;
    nitrite?: string;
    blood?: string;
    pusCells?: string;
    rbcs?: string;
    epithelialCells?: string;
    casts?: string;
    crystals?: string;
    bacteria?: string;
  };

  stool?: {
    color?: string;
    consistency?: string;
    mucus?: string;
    blood?: string;
    undigestedFood?: string;
    parasites?: string;
    rbcs?: string;
    pusCells?: string;
    ovaCyst?: string;
    fatGlobules?: string;
    starchGranules?: string;
    yeastCells?: string;
    occultBlood?: string;
    reducingSubstances?: string;
    ph?: string;
  };

  blood?: {
    hemoglobin?: string;
    rbcCount?: string;
    wbcCount?: string;
    plateletCount?: string;
    pcv?: string;
    mcv?: string;
    mch?: string;
    mchc?: string;
    neutrophils?: string;
    lymphocytes?: string;
    monocytes?: string;
    eosinophils?: string;
    basophils?: string;
    esr?: string;
    bloodGroup?: string;
    bloodSugar?: string;
  };
}

export interface CreateDoctorForm {
  name: string;
  specialization?: string;
  phoneNumber?: string;
  email?: string;
  clinicName?: string;
  licenseNumber?: string;
}

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

export interface PatientSearchResult {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
}

export interface PatientTestReport {
  id: number;
  testName: string;
  testType: string;
  testDate: string;
  status: "pending" | "completed" | "cancelled";
  results?: string;
  reportId: string;
  technician?: string;
  notes?: string;
}

export interface PatientWithTests extends PatientSearchResult {
  tests: PatientTestReport[];
}
