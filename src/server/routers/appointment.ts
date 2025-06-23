// --- Prisma Client Import ---
// Import the Prisma Client types directly. This is the standard way to get model types.
// --- Prisma Client Import ---
// Import the Prisma Client types directly. This is the standard way to get model types.
import {
	AppointmentStatus,
	type Prisma, // For utility types like Prisma.AppointmentGetPayload
} from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { SuccessOutputSchema } from '@/lib/schema'
import { AppointmentSchema, VitalSignSchema } from '@/lib/zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/lib/trpc' // Adjust path to your trpc context

// --- Prisma Type Inferences ---
// This is how you typically get inferred types from Prisma relations.
// Prisma provides `GetPayload` utilities based on your include/select.

type PatientAppointmentData = Prisma.AppointmentGetPayload<{
	include: {
		doctor: {
			select: {
				id: true
				colorCode: true
				img: true
				name: true
				specialization: true
			}
		}
		patient: {
			select: {
				id: true
				colorCode: true
				dateOfBirth: true
				firstName: true
				gender: true
				img: true
				lastName: true
			}
		}
	}
}>

type FullAppointmentDetails = Prisma.AppointmentGetPayload<{
	include: {
		doctor: true
		medicalRecord: {
			// Assuming 'medicalRecord' is the relation name to a single record
			include: {
				diagnosis: true // Assuming 'diagnosis' is the relation name
				labTests: true // Assuming 'labTests' is the relation name
				vitalSigns: true // Assuming 'vitalSigns' is the relation name
			}
		}
		patient: true
		payments: true // Assuming your Prisma schema calls the relation 'payments'
	}
}>

// --- Utility: Build Query (Prisma compatible) ---
// This function will now return a Prisma-compatible 'where' object.
const buildAppointmentWhereClause = (
	id?: string,
	search?: string,
): Prisma.AppointmentWhereInput | undefined => {
	const conditions: Prisma.AppointmentWhereInput[] = []

	if (search?.trim()) {
		conditions.push({
			OR: [
				{ patient: { firstName: { contains: search, mode: 'insensitive' } } }, // `ilike` in Prisma is `contains` with `mode: 'insensitive'`
				{ patient: { lastName: { contains: search, mode: 'insensitive' } } },
				{ doctor: { name: { contains: search, mode: 'insensitive' } } },
			],
		})
	}

	if (id?.trim()) {
		conditions.push({
			OR: [
				{ patientId: id }, // Assuming patientId and doctorId are strings
				{ doctorId: id },
			],
		})
	}

	// Combine conditions with 'AND' if there are any, otherwise return undefined
	return conditions.length > 0 ? { AND: conditions } : undefined
}

export const appointmentRouter = createTRPCRouter({
	// --- addVitalSigns Mutation ---
	// Assuming only doctors (or admins) can add vital signs
	addVitalSigns: publicProcedure // Or protectedProcedure if any logged-in user can (less likely for vital signs)
		.input(
			z.object({
				appointmentId: z.union([z.number(), z.string().pipe(z.coerce.number())]), // Ensure numeric
				data: VitalSignSchema, // The actual vital signs data
				doctorId: z.string().uuid(), // Assuming doctorId is a UUID
			}),
		)
		.output(SuccessOutputSchema)
		.mutation(async ({ ctx, input }) => {
			const { appointmentId, data: vitalSignsData, doctorId } = input

			// ctx.session.user.id is guaranteed to exist due to `protectedProcedure`

			try {
				let medicalRecordId: number | undefined

				if (vitalSignsData.medicalRecordId) {
					medicalRecordId = vitalSignsData.medicalRecordId
				} else {
					// Create new medical record if medicalId is not provided
					const medicalRecord = await ctx.db.medicalRecord.create({
						data: {
							appointmentId: appointmentId as number, // Ensure correct type
							doctorId: doctorId,
							patientId: vitalSignsData.patientId, // Assuming patientId exists on VitalSignsData
						},
					})
					medicalRecordId = medicalRecord.id
				}

				if (!medicalRecordId) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Medical record ID could not be determined.',
					})
				}

				await ctx.db.vitalSign.create({
					data: {
						...vitalSignsData,
						medicalRecordId: medicalRecordId, // Map medical_id from Zod to medicalRecordId in Prisma
						// If your VitalSignsSchema contains fields with snake_case, e.g., `blood_pressure_systolic`,
						// you might need to map them to camelCase here if your Prisma model uses camelCase:
						// bloodPressureSystolic: vitalSignsData.blood_pressure_systolic,
						// bloodPressureDiastolic: vitalSignsData.blood_pressure_diastolic,
						// Ensure any Date fields are converted if they are strings in Zod.
					},
				})

				return {
					msg: 'Vital signs added successfully',
					success: true,
				}
			} catch (error: unknown) {
				console.error('tRPC - addVitalSigns error:', error)
				throw new TRPCError({
					cause: error,
					code: 'INTERNAL_SERVER_ERROR',
					message:
						error instanceof Error
							? error.message
							: 'Internal Server Error: Failed to add vital signs',
				})
			}
		}),
	createnewAppointment: publicProcedure
		.input(AppointmentSchema)
		.output(SuccessOutputSchema)
		.mutation(async ({ ctx, input }) => {
			// Input is already validated and typed by AppointmentSchema
			try {
				await ctx.db.appointment.create({
					data: {
						appointmentDate: new Date(input.appointmentDate), // Convert string to Date
						doctorId: input.doctorId, // Assuming these match Prisma model
						note: input.note,
						patientId: input.patientId, // Assuming these match Prisma model
						// Assuming status defaults in Prisma or should be set explicitly, e.g., status: 'PENDING' as AppointmentStatus,
						status: 'PENDING' as AppointmentStatus, // Example: set default status for new appointments
						time: input.time,
						type: input.type,
					},
				})

				return {
					msg: 'Appointment booked successfully',
					success: true,
				}
			} catch (error: unknown) {
				console.error('tRPC - createNewAppointment error:', error)
				throw new TRPCError({
					cause: error,
					code: 'INTERNAL_SERVER_ERROR',
					message:
						error instanceof Error
							? error.message
							: 'Internal Server Error: Failed to book appointment',
				})
			}
		}),

	// --- getAppointments ---
	getAppointments: protectedProcedure // Assuming this data requires authentication
		.input(
			z.object({
				id: z.string().min(1).optional(), // ID could be patientId or doctorId
				limit: z.number().int().min(1).default(10),
				page: z.number().int().min(1).default(1),
				search: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				const { id, limit, page, search } = input
				const skip = (page - 1) * limit // Prisma uses 'skip' for offset

				const whereClause = buildAppointmentWhereClause(id, search)

				// Using ctx.db.$transaction for atomic queries in Prisma
				const [appointmentsResult, countResult] = await ctx.db.$transaction(async prisma => {
					// 'prisma' is the transactional client
					const appointmentsData = await prisma.appointment.findMany({
						include: {
							doctor: {
								select: {
									id: true,
									colorCode: true,
									img: true,
									name: true,
									specialization: true,
								},
							},
							patient: {
								select: {
									id: true,
									colorCode: true,
									dateOfBirth: true,
									firstName: true,
									gender: true,
									img: true,
									lastName: true,
									phone: true,
								},
							},
						},
						orderBy: { appointmentDate: 'desc' }, // Prisma orderBy syntax
						skip: skip, // Prisma equivalent of offset
						take: limit, // Prisma equivalent of limit
						where: whereClause,
					})

					// Prisma's way to count with a where clause
					const totalCount = await prisma.appointment.count({
						where: whereClause,
					})

					return [appointmentsData, totalCount]
				})

				return {
					currentPage: page,
					data: appointmentsResult as PatientAppointmentData[], // Type assertion (ensure your type definition matches Prisma's output)
					totalPages: Math.ceil(countResult / limit),
					totalRecord: countResult,
				}
			} catch (error) {
				console.error('getAppointments error:', error)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Internal Server Error: Failed to fetch appointments.',
				})
			}
		}),
	// --- getAppointmentById ---
	getById: publicProcedure
		.input(z.object({ id: z.number().int().positive() })) // Validate ID as positive integer
		.query(async ({ ctx, input }) => {
			try {
				// Prisma findFirst equivalent to Drizzle's findFirst with where
				const data = await ctx.db.appointment.findFirst({
					include: {
						doctor: {
							select: {
								// Prisma uses 'select' for specific fields
								id: true,
								img: true,
								name: true,
								specialization: true,
							},
						},
						patient: {
							select: {
								// Prisma uses 'select' for specific fields
								id: true,
								address: true,
								dateOfBirth: true,
								firstName: true,
								gender: true,
								img: true,
								lastName: true,
								phone: true,
							},
						},
					},
					where: { id: input.id },
				})

				if (!data) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Appointment not found.',
					})
				}

				return { data }
			} catch (error) {
				console.error('getAppointmentById error:', error)
				if (error instanceof TRPCError) throw error
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Internal Server Error: Failed to fetch appointment.',
				})
			}
		}),
	// --- getAppointmentWithMedicalRecordsById ---
	getWithMedicalRecordsById: publicProcedure
		.input(z.object({ id: z.number().int().positive() }))
		.query(async ({ ctx, input }) => {
			try {
				const data = await ctx.db.appointment.findFirst({
					include: {
						doctor: true, // true includes all fields
						medicalRecords: {
							// Assuming 'medicalRecord' is the relation name in Prisma
							include: {
								diagnoses: true, // Assuming 'diagnosis' is the relation name in Prisma
								labTests: true, // Assuming 'labTests' is the relation name in Prisma
								vitalSigns: true, // Assuming 'vitalSigns' is the relation name in Prisma
							},
						},
						patient: true, // true includes all fields
						// If 'payments' is a relation to a many-to-one or one-to-many, include it:
						// payments: true, // Or { select: ... } if you need specific payment fields
					},
					where: { id: input.id },
				})

				if (!data) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Appointment data not found.',
					})
				}

				return { data: data as unknown as FullAppointmentDetails } // Type assertion (ensure it matches Prisma's output)
			} catch (error) {
				console.error('getAppointmentWithMedicalRecordsById error:', error)
				if (error instanceof TRPCError) throw error
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Internal Server Error: Failed to fetch appointment with medical records.',
				})
			}
		}),

	// --- appointmentAction Mutation (Update Appointment Status) ---

	updateStatus: protectedProcedure // Requires authenticated user
		.input(
			z.object({
				id: z.union([z.number(), z.string().pipe(z.coerce.number())]), // Allow number or string that can be coerced to number
				reason: z.string().optional(), // Reason can be optional for some statuses
				status: z.nativeEnum(AppointmentStatus), // Correctly validate against Prisma's enum
			}),
		)
		.output(SuccessOutputSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.db.appointment.update({
					data: {
						reason: input.reason,
						status: input.status,
					},
					where: { id: input.id as number }, // Ensure id is number for Prisma
				})

				return {
					msg: `Appointment ${input.status.toLowerCase()} successfully`,
					success: true,
				}
			} catch (error: unknown) {
				console.error('tRPC - appointmentAction error:', error)
				throw new TRPCError({
					cause: error,
					code: 'INTERNAL_SERVER_ERROR',
					message:
						error instanceof Error
							? error.message
							: 'Internal Server Error: Failed to update appointment status',
				})
			}
		}),
})
