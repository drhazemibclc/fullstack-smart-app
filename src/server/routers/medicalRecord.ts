// Import Prisma types
import { Prisma } from '@prisma/client' // Ensure you import Prisma for types
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '@/server/lib/trpc' // Adjust path as needed

// --- Prisma Type Inferences ---
// Use Prisma's GetPayload for types based on includes
type MedicalRecordData = Prisma.MedicalRecordGetPayload<{
	include: {
		diagnosis: {
			include: {
				doctor: {
					select: {
						colorCode: true
						img: true
						name: true
						specialization: true
					}
				}
			}
		}
		labTests: true // Assuming 'labTests' is the relation name in Prisma schema
		patient: {
			select: {
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

// --- Utility: Build Where Clause for Medical Records (Prisma-compatible) ---
const buildMedicalRecordsWhereClause = (
	search?: string,
): Prisma.MedicalRecordWhereInput | undefined => {
	if (!search?.trim()) {
		return undefined // No search term, no where clause
	}

	// Prisma's 'OR' operator for combining conditions
	// `contains` with `mode: 'insensitive'` is the Prisma equivalent of `ilike`
	return {
		OR: [
			{ patient: { firstName: { contains: search, mode: 'insensitive' } } },
			{ patient: { lastName: { contains: search, mode: 'insensitive' } } },
			{ patientId: { contains: search, mode: 'insensitive' } }, // Assuming patientId is a string and you want to search by it
		],
	}
}

export const medicalRecordRouter = createTRPCRouter({
	// --- getMedicalRecords ---
	// Protected procedure, assuming access to medical records requires authentication
	getMedicalRecords: protectedProcedure
		.input(
			z.object({
				limit: z.number().int().min(1).default(10),
				page: z.number().int().min(1).default(1),
				search: z.string().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				const { limit, page, search } = input
				const skip = (page - 1) * limit // Prisma uses 'skip' for offset

				// Build the Prisma WHERE clause object
				const whereClause = buildMedicalRecordsWhereClause(search)

				// Use ctx.db.$transaction for atomic queries in Prisma
				const [data, totalRecordsCount] = await ctx.db.$transaction(async prisma => {
					// 'prisma' is the transactional client
					// Fetch medical records with relations
					const recordsResult = await prisma.medicalRecord.findMany({
						include: {
							diagnoses: {
								// Assuming 'diagnosis' is the relation name
								include: {
									doctor: {
										select: {
											colorCode: true,
											img: true,
											name: true,
											specialization: true,
										},
									},
								},
							},
							labTests: true, // Assuming 'labTests' is the relation name in Prisma schema
							// Prisma uses 'include' for relations
							patient: {
								select: {
									colorCode: true,
									dateOfBirth: true,
									// Prisma uses 'select' for specific columns
									firstName: true,
									gender: true,
									img: true,
									lastName: true,
								},
							},
						},
						orderBy: { createdAt: 'desc' }, // Prisma's 'orderBy' syntax
						skip: skip, // Prisma equivalent of Drizzle's offset
						take: limit, // Prisma equivalent of Drizzle's limit
						where: whereClause,
					})

					// Count total records with the same WHERE clause
					const countResult = await prisma.medicalRecord.count({
						where: whereClause,
					})

					return [recordsResult, countResult]
				})

				const totalPages = Math.ceil(totalRecordsCount / limit)

				return {
					currentPage: page,
					data: data as MedicalRecordData[], // Cast to your inferred type
					totalPages,
					totalRecords: totalRecordsCount,
				}
			} catch (error) {
				console.error('Error fetching medical records:', error)
				// Handle Prisma-specific errors or generic errors
				if (error instanceof TRPCError) {
					throw error
				}
				if (error instanceof Prisma.PrismaClientKnownRequestError) {
					// Log Prisma error code for debugging if needed
					console.error('Prisma Error Code:', error.code)
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: `Database Error: ${error.message}`,
					})
				}
				if (error instanceof Error) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: `Internal Server Error: ${error.message}`,
					})
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Internal Server Error: An unknown error occurred.',
				})
			}
		}),
})
