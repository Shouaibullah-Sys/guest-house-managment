CREATE TABLE "answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"ans" text NOT NULL,
	"approved" boolean,
	"contributor" text NOT NULL,
	"contributor_id" text NOT NULL,
	"question_id" integer NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "doctor_commissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctor_id" integer NOT NULL,
	"commission_percentage" integer NOT NULL,
	"effective_from" timestamp with time zone DEFAULT now(),
	"effective_to" timestamp with time zone,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"specialization" text,
	"phone_number" text,
	"email" text,
	"clinic_name" text,
	"license_number" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "laboratory_expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"expense_type" text NOT NULL,
	"description" text NOT NULL,
	"amount" integer NOT NULL,
	"expense_date" timestamp with time zone DEFAULT now(),
	"related_test_id" integer,
	"related_doctor_id" integer,
	"percentage" integer,
	"is_recurring" boolean DEFAULT false,
	"recurring_frequency" text,
	"status" text DEFAULT 'active',
	"notes" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "laboratory_staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"staff_name" text NOT NULL,
	"position" text NOT NULL,
	"salary_percentage" integer NOT NULL,
	"base_salary" integer,
	"effective_from" timestamp with time zone DEFAULT now(),
	"effective_to" timestamp with time zone,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "laboratory_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"doctor_id" integer,
	"test_type" text NOT NULL,
	"test_name" text NOT NULL,
	"test_date" timestamp with time zone DEFAULT now(),
	"results" text,
	"status" text DEFAULT 'pending',
	"notes" text,
	"referred_by" text,
	"technician" text,
	"amount_charged" integer,
	"amount_paid" integer,
	"payment_status" text DEFAULT 'pending',
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone_number" text NOT NULL,
	"patient_pin" text,
	"email" text,
	"date_of_birth" text,
	"gender" text,
	"address" text,
	"emergency_contact" text,
	"medical_history" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "patients_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz" text NOT NULL,
	"approved" boolean,
	"contributor" text NOT NULL,
	"contributor_id" text NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_commissions" ADD CONSTRAINT "doctor_commissions_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratory_expenses" ADD CONSTRAINT "laboratory_expenses_related_test_id_laboratory_tests_id_fk" FOREIGN KEY ("related_test_id") REFERENCES "public"."laboratory_tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratory_expenses" ADD CONSTRAINT "laboratory_expenses_related_doctor_id_doctors_id_fk" FOREIGN KEY ("related_doctor_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratory_tests" ADD CONSTRAINT "laboratory_tests_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laboratory_tests" ADD CONSTRAINT "laboratory_tests_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE no action ON UPDATE no action;