// trpc/routers/appointment.router.ts
// trpc/routers/appointment.router.ts

import { TRPCError } from '@trpc/server'
import z from 'zod'

import { db } from '@/lib/db'
import { AppointmentSchema, VitalSignSchema } from '@/lib/schema'
import { createTRPCRouter, protectedProcedure } from '@/server/lib/trpc'

export const appointmentRouter = createTRPCRouter({
	addVitalSigns: protectedProcedure
		.input(
			z.object({
				appointmentId: z.string(),
				data: VitalSignSchema,
				doctorId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const userId = ctx.session?.user?.id
				if (!userId) {
					throw new TRPCError({
						code: 'UNAUTHORIZED',
						message: 'Unauthorized',
					})
				}

				const { appointmentId, data, doctorId } = input
				const validatedData = VitalSignSchema.parse(data)

				let medId = validatedData.medicalRecordId

				if (!medId) {
					const medicalRecord = await db.medicalRecord.create({
						data: {
							appointmentId: Number(appointmentId),
							doctorId: doctorId,
							patientId: validatedData.patientId,
						},
					})

					medId = medicalRecord.id
				}

				await db.vitalSign.create({
					data: {
						...validatedData,
						medicalRecordId: Number(medId),
					},
				})

				return { msg: 'Vital signs added successfully', success: true }
			} catch (error) {
				console.error('addVitalSigns error:', error)
				throw new TRPCError({
					cause: error,
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to add vital signs',
				})
			}
		}),
	appointmentAction: protectedProcedure
		.input(
			z.object({
				id: z.union([z.string(), z.number()]),
				reason: z.string(),
				status: z.enum(['PENDING', 'SCHEDULED', 'CANCELLED', 'COMPLETED']),
			}),
		)
		.mutation(async ({ input }) => {
			try {
				await db.appointment.update({
					data: {
						reason: input.reason,
						status: input.status,
					},
					where: { id: Number(input.id) },
				})

				return {
					msg: `Appointment ${input.status.toLowerCase()} successfully`,
					success: true,
				}
			} catch (error) {
				console.error('appointmentAction error:', error)
				throw new TRPCError({
					cause: error,
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to update appointment status',
				})
			}
		}),
	createNewAppointment: protectedProcedure.input(AppointmentSchema).mutation(async ({ input }) => {
		try {
			await db.appointment.create({
				data: {
					appointmentDate: new Date(input.appointmentDate),
					doctorId: input.doctorId,
					note: input.note,
					patientId: input.patientId,
					time: input.time,
					type: input.type,
				},
			})

			return {
				message: 'Appointment booked successfully',
				success: true,
			}
		} catch (error) {
			console.error('createNewAppointment error:', error)
			throw new TRPCError({
				cause: error,
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to create appointment',
			})
		}
	}),
})
