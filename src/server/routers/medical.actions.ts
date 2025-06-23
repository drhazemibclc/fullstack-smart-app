// src/server/trpc/routers/billing.router.ts

import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import {
  DiagnosisSchema,
  PatientBillSchema,
  PaymentSchema,
} from '@/lib/schema';
import { db } from '@/server/db';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';
import { checkRole } from '@/utils/roles';

export const billingRouter = createTRPCRouter({
  // ✅ Add diagnosis
  addDiagnosis: protectedProcedure
    .input(
      z.object({
        appointmentId: z.string(),
        data: DiagnosisSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        const validatedData = DiagnosisSchema.parse(input.data);

        let medicalRecord = null;

        if (!validatedData.medicalRecordId) {
          medicalRecord = await db.medicalRecord.create({
            data: {
              appointmentId: Number(input.appointmentId),
              doctorId: validatedData.doctorId,
              patientId: validatedData.patientId,
            },
          });
        }

        const medId = validatedData.medicalRecordId || medicalRecord?.id;

        await db.diagnosis.create({
          data: {
            ...validatedData,
            medicalRecordId: Number(medId),
          },
        });

        return {
          message: 'Diagnosis added successfully',
          status: 201,
          success: true,
        };
      } catch (error) {
        console.error('addDiagnosis error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add diagnosis',
        });
      }
    }),

  // ✅ Add new bill
  addNewBill: protectedProcedure
    .input(PatientBillSchema)
    .mutation(async ({ input }) => {
      try {
        const isAdmin = await checkRole('ADMIN');
        const isDoctor = await checkRole('DOCTOR');

        if (!isAdmin && !isDoctor) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You are not authorized to add a bill',
          });
        }

        const billData = PatientBillSchema.parse(input);
        let billInfo: { id: number } | null = null;

        const isMissingBillId = billData.billId == null;

        if (isMissingBillId) {
          if (!billData.serviceId) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Appointment ID is required to add a bill',
            });
          }

          const appointment = await db.appointment.findUnique({
            select: {
              id: true,
              patientId: true,
              payments: true,
            },
            where: { id: Number(billData.serviceId) },
          });

          if (!appointment) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Appointment not found',
            });
          }

          if (!appointment.patientId) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Patient ID not found for the given appointment',
            });
          }

          if (!appointment.payments.length) {
            const newPayment = await db.payment.create({
              data: {
                amountPaid: 0.0,
                appointmentId: appointment.id,
                billDate: new Date(),
                discount: 0.0,
                patientId: appointment.patientId,
                paymentDate: new Date(),
                totalAmount: 0.0,
              },
            });

            billInfo = { id: newPayment.id };
          } else {
            billInfo = { id: appointment.payments[0].id };
          }
        } else {
          billInfo = { id: Number(billData.billId) };
        }

        if (!billData.serviceDate) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Service date is required',
          });
        }

        await db.patientBill.create({
          data: {
            billId: billInfo.id,
            quantity: billData.quantity,
            serviceDate: new Date(billData.serviceDate),
            serviceId: billData.serviceId,
            totalCost: billData.totalCost,
            unitCost: billData.unitCost,
          },
        });

        return {
          msg: 'Bill added successfully',
          success: true,
        };
      } catch (error) {
        console.error('addNewBill error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add bill',
        });
      }
    }),

  // ✅ Generate bill
  generateBill: protectedProcedure
    .input(PaymentSchema)
    .mutation(async ({ input }) => {
      try {
        const validated = PaymentSchema.parse(input);

        const discountAmount =
          (Number(validated.discount) / 100) * Number(validated.totalAmount);

        const res = await db.payment.update({
          data: {
            billDate: validated.billDate,
            discount: discountAmount,
            totalAmount: validated.totalAmount ?? 0,
          },
          where: { id: Number(validated.id) },
        });

        await db.appointment.update({
          data: {
            status: 'COMPLETED',
          },
          where: { id: res.appointmentId },
        });

        return {
          msg: 'Bill generated successfully',
          success: true,
        };
      } catch (error) {
        console.error('generateBill error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate bill',
        });
      }
    }),
});
