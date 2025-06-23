-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('ADMIN', 'NURSE', 'DOCTOR', 'PATIENT');

-- CreateEnum
CREATE TYPE "STATUS" AS ENUM ('ACTIVE', 'INACTIVE', 'DORMANT');

-- CreateEnum
CREATE TYPE "JOBTYPE" AS ENUM ('FULL', 'PART');

-- CreateEnum
CREATE TYPE "GENDER" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'SCHEDULED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PAYMENTMETHOD" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'INSURANCE', 'MOBILEPAYMENT');

-- CreateEnum
CREATE TYPE "PAYMENTSTATUS" AS ENUM ('PAID', 'UNPAID', 'PARTIAL', 'REFUNDED');

-- CreateEnum
CREATE TYPE "VACCINESTATUS" AS ENUM ('DUE', 'GIVEN', 'OVERDUE', 'EXPIRED', 'CATCHUP', 'SCHEDULED', 'CONTRAINDICATED');

-- CreateEnum
CREATE TYPE "MILESTONECATEGORY" AS ENUM ('GROSSMOTOR', 'FINEMOTOR', 'LANGUAGE', 'SOCIALEMOTIONAL', 'COGNITIVE');

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('CONSULTATION', 'LABORATORY', 'IMAGING', 'VACCINATION', 'PROCEDURE');

-- CreateEnum
CREATE TYPE "DiagnosisSeverity" AS ENUM ('MILD', 'MODERATE', 'SEVERE', 'CRITICAL');

-- CreateEnum
CREATE TYPE "GrowthMeasurementType" AS ENUM ('STANDARD', 'CORRECTED_AGE', 'PERCENTILE_ADJUSTED');

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT,
    "banned" BOOLEAN,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "firstName" TEXT,
    "lastName" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "activeOrganizationId" TEXT,
    "impersonatedBy" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "metadata" TEXT,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "inviterId" TEXT NOT NULL,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "patient_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "gender" "GENDER" NOT NULL DEFAULT 'MALE',
    "patient_phone" TEXT NOT NULL,
    "patient_email" TEXT,
    "parent_guardian_name" TEXT NOT NULL,
    "parent_guardian_phone" TEXT NOT NULL,
    "parent_guardian_email" TEXT,
    "relation_to_patient" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "blood_group" TEXT,
    "allergies" TEXT,
    "medical_conditions" TEXT,
    "medical_history" TEXT,
    "img" TEXT,
    "color_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("patient_id")
);

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "doctor_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "department" TEXT,
    "img" TEXT,
    "color_code" TEXT,
    "availability_status" TEXT,
    "job_type" "JOBTYPE" NOT NULL DEFAULT 'FULL',
    "role" "ROLE" DEFAULT 'DOCTOR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("doctor_id")
);

-- CreateTable
CREATE TABLE "working_days" (
    "working_day_id" SERIAL NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "close_time" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "working_days_pkey" PRIMARY KEY ("working_day_id")
);

-- CreateTable
CREATE TABLE "staff" (
    "staff_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "department" TEXT,
    "img" TEXT,
    "license_number" TEXT,
    "color_code" TEXT,
    "role" "ROLE" NOT NULL,
    "status" "STATUS" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("staff_id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "appointment_id" SERIAL NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "appointment_date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "type" TEXT NOT NULL,
    "note" TEXT,
    "reason" TEXT,
    "recurrenceRule" TEXT,
    "exceptionDates" TIMESTAMP(3)[],
    "originalStart" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("appointment_id")
);

-- CreateTable
CREATE TABLE "payments" (
    "payment_id" SERIAL NOT NULL,
    "bill_id" INTEGER,
    "patient_id" TEXT NOT NULL,
    "appointment_id" INTEGER,
    "bill_date" TIMESTAMP(3) NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "amount_paid" DOUBLE PRECISION NOT NULL,
    "payment_method" "PAYMENTMETHOD" NOT NULL DEFAULT 'CASH',
    "status" "PAYMENTSTATUS" NOT NULL DEFAULT 'UNPAID',
    "receipt_number" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "patient_bills" (
    "patient_bill_id" SERIAL NOT NULL,
    "bill_id" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,
    "service_date" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_cost" DOUBLE PRECISION NOT NULL,
    "total_cost" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_bills_pkey" PRIMARY KEY ("patient_bill_id")
);

-- CreateTable
CREATE TABLE "services" (
    "service_id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ServiceCategory" NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3),
    "price" DOUBLE PRECISION NOT NULL,
    "insuranceCodes" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("service_id")
);

-- CreateTable
CREATE TABLE "lab_tests" (
    "lab_test_id" SERIAL NOT NULL,
    "medical_record_id" INTEGER NOT NULL,
    "test_date" TIMESTAMP(3) NOT NULL,
    "result" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "serviceId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_tests_pkey" PRIMARY KEY ("lab_test_id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "medical_record_id" SERIAL NOT NULL,
    "patient_id" TEXT NOT NULL,
    "appointment_id" INTEGER NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "treatment_plan" TEXT,
    "prescriptions" TEXT,
    "lab_request" TEXT,
    "notes" TEXT,
    "chief_complaint" TEXT,
    "hpi" TEXT,
    "ros" TEXT,
    "physical_exam" TEXT,
    "assessment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("medical_record_id")
);

-- CreateTable
CREATE TABLE "vital_signs" (
    "vital_sign_id" SERIAL NOT NULL,
    "patient_id" TEXT NOT NULL,
    "medical_record_id" INTEGER NOT NULL,
    "body_temperature" DOUBLE PRECISION NOT NULL,
    "systolic" INTEGER,
    "diastolic" INTEGER,
    "heart_rate" DOUBLE PRECISION,
    "respiratory_rate" INTEGER,
    "oxygen_saturation" INTEGER,
    "weight" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "head_circumference" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "nutritional_comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vital_signs_pkey" PRIMARY KEY ("vital_sign_id")
);

-- CreateTable
CREATE TABLE "diagnoses" (
    "diagnosis_id" SERIAL NOT NULL,
    "patient_id" TEXT NOT NULL,
    "medical_record_id" INTEGER NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "symptoms" TEXT NOT NULL,
    "diagnosis_name" TEXT NOT NULL,
    "notes" TEXT,
    "prescribed_medications" TEXT,
    "follow_up_plan" TEXT,
    "severity" "DiagnosisSeverity" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("diagnosis_id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "audit_log_id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "model_name" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "correlationId" TEXT,
    "entityBefore" JSONB,
    "entityAfter" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("audit_log_id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "rating_id" SERIAL NOT NULL,
    "staff_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("rating_id")
);

-- CreateTable
CREATE TABLE "growth_measurements" (
    "growth_measurement_id" SERIAL NOT NULL,
    "patientId" TEXT NOT NULL,
    "gender" "GENDER",
    "ageInDays" DOUBLE PRECISION,
    "measurementDate" TIMESTAMP(3) NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "heightCm" DOUBLE PRECISION,
    "headCircumferenceCm" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "weightZScore" DOUBLE PRECISION,
    "heightZScore" DOUBLE PRECISION,
    "headCircumferenceZScore" DOUBLE PRECISION,
    "bmiZScore" DOUBLE PRECISION,
    "measurementType" "GrowthMeasurementType" NOT NULL DEFAULT 'STANDARD',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "growth_measurements_pkey" PRIMARY KEY ("growth_measurement_id")
);

-- CreateTable
CREATE TABLE "immunizations" (
    "immunization_id" SERIAL NOT NULL,
    "patient_id" TEXT NOT NULL,
    "vaccine_name" TEXT NOT NULL,
    "dose_number" INTEGER NOT NULL,
    "administration_date" TIMESTAMP(3) NOT NULL,
    "next_dose_date" TIMESTAMP(3),
    "status" "VACCINESTATUS" NOT NULL,
    "administered_by_doctor_id" TEXT,
    "batch_number" TEXT,
    "lotExpiration" TIMESTAMP(3) NOT NULL,
    "administeringOrganization" TEXT NOT NULL,
    "nextRecommendedDate" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "immunizations_pkey" PRIMARY KEY ("immunization_id")
);

-- CreateTable
CREATE TABLE "developmental_milestones" (
    "developmental_milestone_id" SERIAL NOT NULL,
    "patient_id" TEXT NOT NULL,
    "milestone_category" "MILESTONECATEGORY" NOT NULL,
    "milestone_description" TEXT NOT NULL,
    "achieved_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "assessed_by_doctor_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "developmental_milestones_pkey" PRIMARY KEY ("developmental_milestone_id")
);

-- CreateTable
CREATE TABLE "_DoctorToRating" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DoctorToRating_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RelatedDiagnoses" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RelatedDiagnoses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Post_name_idx" ON "Post"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "patients_patient_phone_key" ON "patients"("patient_phone");

-- CreateIndex
CREATE UNIQUE INDEX "patients_patient_email_key" ON "patients"("patient_email");

-- CreateIndex
CREATE INDEX "patients_first_name_last_name_idx" ON "patients"("first_name", "last_name");

-- CreateIndex
CREATE INDEX "patients_parent_guardian_phone_idx" ON "patients"("parent_guardian_phone");

-- CreateIndex
CREATE INDEX "patients_date_of_birth_idx" ON "patients"("date_of_birth");

-- CreateIndex
CREATE INDEX "patients_created_at_idx" ON "patients"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyContact_patientId_phone_key" ON "EmergencyContact"("patientId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_email_key" ON "doctors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_license_number_key" ON "doctors"("license_number");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_phone_key" ON "doctors"("phone");

-- CreateIndex
CREATE INDEX "doctors_name_idx" ON "doctors"("name");

-- CreateIndex
CREATE INDEX "working_days_day_start_time_idx" ON "working_days"("day", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "working_days_doctor_id_day_key" ON "working_days"("doctor_id", "day");

-- CreateIndex
CREATE UNIQUE INDEX "staff_email_key" ON "staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "staff_phone_key" ON "staff"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "staff_license_number_key" ON "staff"("license_number");

-- CreateIndex
CREATE INDEX "staff_name_idx" ON "staff"("name");

-- CreateIndex
CREATE INDEX "appointments_patient_id_doctor_id_appointment_date_idx" ON "appointments"("patient_id", "doctor_id", "appointment_date");

-- CreateIndex
CREATE INDEX "appointments_appointment_date_status_idx" ON "appointments"("appointment_date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_appointment_id_key" ON "payments"("appointment_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_receipt_number_key" ON "payments"("receipt_number");

-- CreateIndex
CREATE INDEX "payments_patient_id_payment_date_idx" ON "payments"("patient_id", "payment_date");

-- CreateIndex
CREATE INDEX "payments_status_payment_date_idx" ON "payments"("status", "payment_date");

-- CreateIndex
CREATE INDEX "patient_bills_bill_id_service_id_idx" ON "patient_bills"("bill_id", "service_id");

-- CreateIndex
CREATE INDEX "patient_bills_service_id_service_date_idx" ON "patient_bills"("service_id", "service_date");

-- CreateIndex
CREATE UNIQUE INDEX "services_code_key" ON "services"("code");

-- CreateIndex
CREATE UNIQUE INDEX "services_service_name_key" ON "services"("service_name");

-- CreateIndex
CREATE UNIQUE INDEX "lab_tests_serviceId_key" ON "lab_tests"("serviceId");

-- CreateIndex
CREATE INDEX "lab_tests_medical_record_id_test_date_idx" ON "lab_tests"("medical_record_id", "test_date");

-- CreateIndex
CREATE INDEX "lab_tests_test_date_status_idx" ON "lab_tests"("test_date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "medical_records_appointment_id_key" ON "medical_records"("appointment_id");

-- CreateIndex
CREATE INDEX "medical_records_patient_id_created_at_idx" ON "medical_records"("patient_id", "created_at");

-- CreateIndex
CREATE INDEX "medical_records_doctor_id_created_at_idx" ON "medical_records"("doctor_id", "created_at");

-- CreateIndex
CREATE INDEX "vital_signs_medical_record_id_created_at_idx" ON "vital_signs"("medical_record_id", "created_at");

-- CreateIndex
CREATE INDEX "vital_signs_patient_id_created_at_idx" ON "vital_signs"("patient_id", "created_at");

-- CreateIndex
CREATE INDEX "diagnoses_medical_record_id_created_at_idx" ON "diagnoses"("medical_record_id", "created_at");

-- CreateIndex
CREATE INDEX "diagnoses_patient_id_diagnosis_name_created_at_idx" ON "diagnoses"("patient_id", "diagnosis_name", "created_at");

-- CreateIndex
CREATE INDEX "diagnoses_doctor_id_created_at_idx" ON "diagnoses"("doctor_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_action_model_name_created_at_idx" ON "audit_logs"("user_id", "action", "model_name", "created_at");

-- CreateIndex
CREATE INDEX "ratings_staff_id_rating_idx" ON "ratings"("staff_id", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_patient_id_staff_id_key" ON "ratings"("patient_id", "staff_id");

-- CreateIndex
CREATE INDEX "growth_measurements_patientId_measurementDate_gender_idx" ON "growth_measurements"("patientId", "measurementDate", "gender");

-- CreateIndex
CREATE INDEX "immunizations_patient_id_vaccine_name_administration_date_idx" ON "immunizations"("patient_id", "vaccine_name", "administration_date");

-- CreateIndex
CREATE INDEX "immunizations_status_next_dose_date_idx" ON "immunizations"("status", "next_dose_date");

-- CreateIndex
CREATE INDEX "developmental_milestones_patient_id_milestone_category_achi_idx" ON "developmental_milestones"("patient_id", "milestone_category", "achieved_date");

-- CreateIndex
CREATE INDEX "developmental_milestones_milestone_category_achieved_date_idx" ON "developmental_milestones"("milestone_category", "achieved_date");

-- CreateIndex
CREATE INDEX "_DoctorToRating_B_index" ON "_DoctorToRating"("B");

-- CreateIndex
CREATE INDEX "_RelatedDiagnoses_B_index" ON "_RelatedDiagnoses"("B");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("patient_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "working_days" ADD CONSTRAINT "working_days_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("doctor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("doctor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("appointment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_bills" ADD CONSTRAINT "patient_bills_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("service_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_bills" ADD CONSTRAINT "patient_bills_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "payments"("payment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_tests" ADD CONSTRAINT "lab_tests_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("service_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_tests" ADD CONSTRAINT "lab_tests_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("medical_record_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("appointment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("medical_record_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("medical_record_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("doctor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("staff_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "growth_measurements" ADD CONSTRAINT "growth_measurements_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "immunizations" ADD CONSTRAINT "immunizations_administered_by_doctor_id_fkey" FOREIGN KEY ("administered_by_doctor_id") REFERENCES "doctors"("doctor_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "immunizations" ADD CONSTRAINT "immunizations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "developmental_milestones" ADD CONSTRAINT "developmental_milestones_assessed_by_doctor_id_fkey" FOREIGN KEY ("assessed_by_doctor_id") REFERENCES "doctors"("doctor_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "developmental_milestones" ADD CONSTRAINT "developmental_milestones_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DoctorToRating" ADD CONSTRAINT "_DoctorToRating_A_fkey" FOREIGN KEY ("A") REFERENCES "doctors"("doctor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DoctorToRating" ADD CONSTRAINT "_DoctorToRating_B_fkey" FOREIGN KEY ("B") REFERENCES "ratings"("rating_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RelatedDiagnoses" ADD CONSTRAINT "_RelatedDiagnoses_A_fkey" FOREIGN KEY ("A") REFERENCES "diagnoses"("diagnosis_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RelatedDiagnoses" ADD CONSTRAINT "_RelatedDiagnoses_B_fkey" FOREIGN KEY ("B") REFERENCES "diagnoses"("diagnosis_id") ON DELETE CASCADE ON UPDATE CASCADE;
