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
  middleName?: string;
  phoneNumber: string;
  patientPin?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  lastVisitDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialization?: string;
  phoneNumber?: string;
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
  clinicalHistory?: string;
  symptoms?: string;
  currentMedications?: string;
  fastingRequired?: boolean;
  specialInstructions?: string;
  receivedDate?: string;
  completedDate?: string;
  collectionSite?: string;
  collectedBy?: string;
  discount?: number;
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
  biochemistry?: any;
  hematology?: any;
  microbiology?: any;
  immunology?: any;
}

export interface CreatePatientForm {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  patientPin?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
}

// Test-specific interfaces
export interface UrineTest {
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
}

export interface StoolTest {
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
}

export interface BloodTest {
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
}

export interface BiochemistryTest {
  glucose?: string;
  urea?: string;
  creatinine?: string;
  cholesterol?: string;
  triglycerides?: string;
  sgot?: string;
  sgpt?: string;
  alkalinePhosphatase?: string;
  totalProtein?: string;
  albumin?: string;
  globulin?: string;
  bilirubinTotal?: string;
  bilirubinDirect?: string;
  bilirubinIndirect?: string;
  calcium?: string;
  phosphorus?: string;
  sodium?: string;
  potassium?: string;
  chloride?: string;
}

export interface HematologyTest {
  hb?: string;
  rbc?: string;
  wbc?: string;
  platelets?: string;
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
  reticulocyteCount?: string;
  mpv?: string;
}

export interface MicrobiologyTest {
  specimen?: string;
  organism?: string;
  sensitivity?: string;
  culture?: string;
  gramStain?: string;
  afbStain?: string;
  fungalStain?: string;
  antigenTests?: string;
  pcrResults?: string;
}

export interface ImmunologyTest {
  hbsag?: string;
  hiv?: string;
  hcv?: string;
  crp?: string;
  raTest?: string;
  asot?: string;
  rf?: string;
  ana?: string;
  vdrl?: string;
  pregnancyTest?: string;
  dengueNs1?: string;
  dengueIgm?: string;
  dengueIgg?: string;
  typhoidTest?: string;
  malariaTest?: string;
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

  // Test-specific fields
  urine?: UrineTest;
  stool?: StoolTest;
  blood?: BloodTest;
  biochemistry?: BiochemistryTest;
  hematology?: HematologyTest;
  microbiology?: MicrobiologyTest;
  immunology?: ImmunologyTest;
}

export interface CreateDoctorForm {
  name: string;
  specialization?: string;
  phoneNumber?: string;
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

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SearchPatientsResponse {
  patients: Patient[];
  total: number;
}

export interface LaboratoryTestsResponse {
  tests: LaboratoryTestWithDetails[];
  total: number;
  pending: number;
  completed: number;
}

export interface DoctorsResponse {
  doctors: Doctor[];
  total: number;
}

// PDF Report Interface
export interface LabReportData {
  id: number;
  testName: string;
  testType: string;
  testDate: string;
  results?: string;
  status: string;
  notes?: string;
  technician?: string;
  patient?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth?: string;
    gender?: string;
  };
  doctor?: {
    name: string;
    specialization?: string;
  };
  laboratoryName: string;
  laboratoryAddress: string;
  laboratoryContact: string;
  reportId?: string;
  generatedAt?: string;
}

// Statistics Types
export interface LaboratoryStatistics {
  totalTests: number;
  pendingTests: number;
  completedTests: number;
  totalRevenue: number;
  collectedAmount: number;
  pendingAmount: number;
  todayTests: number;
  monthlyTests: number;
  testTypeDistribution: {
    testType: string;
    count: number;
  }[];
  dailyTests: {
    date: string;
    count: number;
  }[];
}

// Form Validation Types
export interface PatientFormValidation {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface TestFormValidation {
  testType: string;
  testName: string;
  patientId: number;
  status: string;
}
