import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Questions table
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  quiz: text("quiz").notNull(),
  approved: boolean("approved"),
  contributor: text("contributor").notNull(),
  contributorId: text("contributor_id").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
});

// Answers table
export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  ans: text("ans").notNull(),
  approved: boolean("approved"),
  contributor: text("contributor").notNull(),
  contributorId: text("contributor_id").notNull(),
  questionId: integer("question_id")
    .notNull()
    .references(() => questions.id),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
});

// Patients table for laboratory management
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number").notNull().unique(),
  patientPin: text("patient_pin"), // Add this line - stores the unique PIN
  email: text("email"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  medicalHistory: text("medical_history"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Doctors table for referrals
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialization: text("specialization"),
  phoneNumber: text("phone_number"),
  email: text("email"),
  clinicName: text("clinic_name"),
  licenseNumber: text("license_number"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Laboratory tests table
export const laboratoryTests = pgTable("laboratory_tests", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id")
    .notNull()
    .references(() => patients.id),
  doctorId: integer("doctor_id").references(() => doctors.id), // Can be null if no referral
  testType: text("test_type").notNull(), // blood test, urine test, etc.
  testName: text("test_name").notNull(),
  testDate: timestamp("test_date", { withTimezone: true }).defaultNow(),
  results: text("results"), // JSON string for complex results
  status: text("status").default("pending"), // pending, completed, cancelled
  notes: text("notes"),
  referredBy: text("referred_by"), // Doctor name if referred
  technician: text("technician"), // Lab technician who performed the test
  amountCharged: integer("amount_charged"), // Amount charged for the test
  amountPaid: integer("amount_paid"), // Amount actually paid
  paymentStatus: text("payment_status").default("pending"), // pending, paid, partial, waived
  createdBy: text("created_by").notNull(), // User ID who created the record
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Laboratory expenses table
export const laboratoryExpenses = pgTable("laboratory_expenses", {
  id: serial("id").primaryKey(),
  expenseType: text("expense_type").notNull(), // regular_payment, doctor_percentage, laboratory_salary
  description: text("description").notNull(),
  amount: integer("amount").notNull(), // Amount in cents
  expenseDate: timestamp("expense_date", { withTimezone: true }).defaultNow(),
  relatedTestId: integer("related_test_id").references(
    () => laboratoryTests.id
  ), // For doctor percentage and lab salary
  relatedDoctorId: integer("related_doctor_id").references(() => doctors.id), // For doctor percentage
  percentage: integer("percentage"), // Percentage for doctor/lab salary calculations
  isRecurring: boolean("is_recurring").default(false),
  recurringFrequency: text("recurring_frequency"), // monthly, weekly, daily
  status: text("status").default("active"), // active, inactive, paid
  notes: text("notes"),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Doctor commission settings
export const doctorCommissions = pgTable("doctor_commissions", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id")
    .notNull()
    .references(() => doctors.id),
  commissionPercentage: integer("commission_percentage").notNull(), // Percentage (e.g., 20 for 20%)
  effectiveFrom: timestamp("effective_from", {
    withTimezone: true,
  }).defaultNow(),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Laboratory staff salary settings
export const laboratoryStaff = pgTable("laboratory_staff", {
  id: serial("id").primaryKey(),
  staffName: text("staff_name").notNull(),
  position: text("position").notNull(), // technician, manager, etc.
  salaryPercentage: integer("salary_percentage").notNull(), // Percentage of total revenue
  baseSalary: integer("base_salary"), // Fixed base salary in cents
  effectiveFrom: timestamp("effective_from", {
    withTimezone: true,
  }).defaultNow(),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Define relationships
export const patientsRelations = relations(patients, ({ many }) => ({
  laboratoryTests: many(laboratoryTests),
}));

export const doctorsRelations = relations(doctors, ({ many }) => ({
  laboratoryTests: many(laboratoryTests),
}));

export const laboratoryTestsRelations = relations(
  laboratoryTests,
  ({ one }) => ({
    patient: one(patients, {
      fields: [laboratoryTests.patientId],
      references: [patients.id],
    }),
    doctor: one(doctors, {
      fields: [laboratoryTests.doctorId],
      references: [doctors.id],
    }),
  })
);

// Define relationships using Drizzle's relations function
export const questionsRelations = relations(questions, ({ many }) => ({
  answers: many(answers),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));
// 279109
