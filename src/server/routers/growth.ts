// Import Prisma Client directly for model types
import { Prisma } from '@prisma/client' // Prisma client import
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

// Import Z-score utility functions
import { calculateZScore, getAgeInDays } from '@/lib/zscoreCalc'
// No need to import specific models like 'growthMeasurements' or 'patients' directly from a schema file,
// as they are accessed via ctx.db (your Prisma client instance).
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/lib/trpc'

export const growthRouter = createTRPCRouter({
	/**
	 * Creates a new growth measurement for a patient,
	 * calculating and storing Z-scores for weight-for-age,
	 * length/height-for-age, head circumference-for-age, and BMI-for-age.
	 */
	createGrowthMeasurement: protectedProcedure
		.input(
			z.object({
				headCircumferenceCm: z.number().min(0).optional(),
				heightCm: z.number().min(0),
				measurementDate: z.date(),
				notes: z.string().optional(),
				patientId: z.string().min(1),
				weightKg: z.number().min(0),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const { headCircumferenceCm, heightCm, measurementDate, notes, patientId, weightKg } = input

				// Use ctx.db.patient for Prisma Patient model access
				const patient = await ctx.db.patient.findFirst({
					select: {
						// Prisma uses 'select' for specific columns
						dateOfBirth: true,
						gender: true,
					},
					where: { id: patientId }, // Prisma uses object for 'where' clause
				})

				if (!patient) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Patient not found.',
					})
				}

				// Determine gender for Z-score calculation ('boys' or 'girls')
				const patientGender = patient.gender.toLowerCase() === 'male' ? 'boys' : 'girls'
				const ageInDays = getAgeInDays(patient.dateOfBirth, measurementDate)

				// Calculate Z-scores
				const weightZScore = calculateZScore('wfa', patientGender, ageInDays, weightKg)
				const heightZScore = calculateZScore('lhfa', patientGender, ageInDays, heightCm)

				let headCircumferenceZScore: number | null = null
				if (headCircumferenceCm !== undefined && headCircumferenceCm !== null) {
					headCircumferenceZScore = calculateZScore(
						'hcfa',
						patientGender,
						ageInDays,
						headCircumferenceCm,
					)
				}

				// Calculate BMI
				const bmi = weightKg / ((heightCm / 100) * (heightCm / 100)) // heightCm to meters
				const bmiZScore = calculateZScore('bfa', patientGender, ageInDays, bmi)

				// Use ctx.db.growthMeasurement.create for Prisma insert
				const newMeasurement = await ctx.db.growthMeasurement.create({
					data: {
						bmi,
						bmiZScore,
						headCircumferenceCm,
						headCircumferenceZScore,
						heightCm,
						heightZScore,
						measurementDate,
						notes,
						// Prisma uses 'data' object for create/update operations
						patientId,
						weightKg,
						weightZScore,
						// Prisma automatically handles `createdAt` and `updatedAt` if defined with `@@map` in schema.
						// If not, you can manually set them:
						// createdAt: new Date(),
						// updatedAt: new Date(),
					},
				})

				// Prisma's create method directly returns the created object, no need for length check.
				return newMeasurement
			} catch (error) {
				console.error('Error creating growth measurement:', error)
				if (error instanceof TRPCError) {
					throw error
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to create growth measurement.',
				})
			}
		}),

	deleteGrowthMeasurement: protectedProcedure
		.input(z.object({ id: z.number().int() }))
		.mutation(async ({ ctx, input }) => {
			try {
				const { id } = input
				// Use ctx.db.growthMeasurement.delete for Prisma delete
				const deletedMeasurement = await ctx.db.growthMeasurement.delete({
					select: { id: true }, // Select specific fields from the deleted record if needed
					where: { id: id }, // Prisma 'where' for the record to delete
				})

				// Prisma's delete method throws an error if no record is found to delete
				// (if using `delete` and `where` doesn't match).
				// If you want to handle "not found" explicitly, you might first use `findUnique`
				// if not found, throw error; else, delete.
				// Or, rely on the error thrown by `.delete()` if no record matched.

				return { deletedId: deletedMeasurement.id, success: true }
			} catch (error) {
				console.error('Error deleting growth measurement:', error)
				if (error instanceof TRPCError) {
					throw error
				}
				// Prisma will throw a P2025 error if record not found.
				if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Growth measurement not found.',
					})
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to delete growth measurement.',
				})
			}
		}),

	/**
	 * Retrieves a single growth measurement by its ID.
	 */
	getGrowthMeasurementById: publicProcedure
		.input(z.object({ id: z.number().int() }))
		.query(async ({ ctx, input }) => {
			try {
				const { id } = input
				// Prisma findFirst equivalent to Drizzle's findFirst with where
				const measurement = await ctx.db.growthMeasurement.findFirst({
					where: { id: id }, // Prisma uses object for 'where' clause
				})

				if (!measurement) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Growth measurement not found.',
					})
				}
				return measurement
			} catch (error) {
				console.error('Error fetching growth measurement by ID:', error)
				if (error instanceof TRPCError) {
					throw error
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch growth measurement.',
				})
			}
		}),

	/**
	 * Retrieves all growth measurements for a specific patient, ordered by measurement date.
	 */
	getGrowthMeasurementsByPatientId: publicProcedure
		.input(z.object({ patientId: z.string().min(1) }))
		.query(async ({ ctx, input }) => {
			try {
				const { patientId } = input
				// Prisma findMany equivalent to Drizzle's findMany with where and orderBy
				const measurements = await ctx.db.growthMeasurement.findMany({
					orderBy: { measurementDate: 'asc' }, // Prisma uses object for 'orderBy'
					where: { patientId: patientId }, // Prisma uses object for 'where' clause
				})
				return measurements
			} catch (error) {
				console.error('Error fetching growth measurements by patient ID:', error)
				if (error instanceof TRPCError) {
					throw error
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch growth measurements.',
				})
			}
		}),

	/**
	 * Deletes a growth measurement by its ID.
	 */

	/**
	 * Updates an existing growth measurement.
	 * Recalculates Z-scores if weight, height, or head circumference are updated.
	 */
	updateGrowthMeasurement: protectedProcedure
		.input(
			z.object({
				id: z.number().int(),
				headCircumferenceCm: z.number().min(0).optional().nullable(),
				heightCm: z.number().min(0).optional(),
				measurementDate: z.date().optional(),
				notes: z.string().optional().nullable(),
				weightKg: z.number().min(0).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				const { id, ...updateData } = input

				const existingMeasurement = await ctx.db.growthMeasurement.findFirst({
					include: {
						patient: {
							select: {
								dateOfBirth: true,
								gender: true,
							},
						},
					},
					where: { id: id },
				})

				if (!existingMeasurement || !existingMeasurement.patient) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Growth measurement or associated patient not found.',
					})
				}

				// Use existing values if not provided in updateData.
				// Ensure values are numbers by providing a fallback of 0 if they become null.
				const currentWeightKg = updateData.weightKg ?? existingMeasurement.weightKg ?? 0
				const currentHeightCm = updateData.heightCm ?? existingMeasurement.heightCm ?? 0
				const currentMeasurementDate =
					updateData.measurementDate ?? existingMeasurement.measurementDate

				// Special handling for headCircumferenceCm as it can be null
				let currentHeadCircumferenceCm: number | null = null
				if (updateData.headCircumferenceCm === null) {
					currentHeadCircumferenceCm = null // Explicitly set to null if input is null
				} else if (updateData.headCircumferenceCm !== undefined) {
					currentHeadCircumferenceCm = updateData.headCircumferenceCm
				} else {
					currentHeadCircumferenceCm = existingMeasurement.headCircumferenceCm
				}

				// Now, pass *definite numbers* to calculateZScore and BMI formula.
				// If currentHeightCm or currentWeightKg could genuinely be 0 and lead to
				// division by zero or nonsensical Z-scores, your zscoreCalc should handle it,
				// or you should add a check here. Assuming 0 is a valid fallback for calculation.
				const patientGender =
					existingMeasurement.patient.gender.toLowerCase() === 'male' ? 'boys' : 'girls'
				const ageInDays = getAgeInDays(
					existingMeasurement.patient.dateOfBirth,
					currentMeasurementDate,
				)

				const updatedWeightZScore = calculateZScore(
					'wfa',
					patientGender,
					ageInDays,
					currentWeightKg,
				)
				const updatedHeightZScore = calculateZScore(
					'lhfa',
					patientGender,
					ageInDays,
					currentHeightCm,
				)

				let updatedHeadCircumferenceZScore: number | null = null
				if (currentHeadCircumferenceCm !== null) {
					// Check for null explicitly
					updatedHeadCircumferenceZScore = calculateZScore(
						'hcfa',
						patientGender,
						ageInDays,
						currentHeadCircumferenceCm,
					)
				}

				const updatedBmi =
					currentHeightCm > 0
						? currentWeightKg / ((currentHeightCm / 100) * (currentHeightCm / 100))
						: 0 // Prevent division by zero
				const updatedBmiZScore = calculateZScore('bfa', patientGender, ageInDays, updatedBmi)

				const updatedResult = await ctx.db.growthMeasurement.update({
					data: {
						...updateData,
						bmi: updatedBmi,
						bmiZScore: updatedBmiZScore,
						headCircumferenceCm: currentHeadCircumferenceCm, // This can remain null
						headCircumferenceZScore: updatedHeadCircumferenceZScore, // This can remain null
						heightCm: currentHeightCm,
						heightZScore: updatedHeightZScore,
						updatedAt: new Date(),
						weightKg: currentWeightKg,
						weightZScore: updatedWeightZScore,
					},
					where: { id: id },
				})

				return updatedResult
			} catch (error) {
				console.error('Error updating growth measurement:', error)
				if (error instanceof TRPCError) {
					throw error
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to update growth measurement.',
				})
			}
		}),
})
