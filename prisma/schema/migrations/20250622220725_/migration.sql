-- CreateEnum
CREATE TYPE "NutritionalStatus" AS ENUM ('NORMAL', 'WASTED', 'STUNTED', 'MALNOURISHED', 'OBESCE');

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "nutritional_status" "NutritionalStatus";

-- CreateTable
CREATE TABLE "Prescription" (
    "id" SERIAL NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "appointment_id" INTEGER,
    "medication_name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "instructions" TEXT,
    "issued_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_appointment_id_key" ON "Prescription"("appointment_id");

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("patient_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("doctor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("appointment_id") ON DELETE SET NULL ON UPDATE CASCADE;
