// Import Prisma types
import { Prisma, type Staff } from '@prisma/client' // Ensure you import Prisma for types
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure } from '@/server/lib/trpc' // Adjust path as needed

// --- Prisma Type Inferences ---
// Use Prisma's GetPayload to infer the staff record type
type StaffRecord = Staff // Assuming 'Staff' is your model name in Prisma

// --- Utility: Build Where Clause for Staff Search (Prisma-compatible) ---
const buildStaffSearchWhereClause = (search?: string): Prisma.StaffWhereInput | undefined => {
	if (!search?.trim()) {
		return undefined // No search term, so no WHERE clause needed
	}

	// Prisma's 'OR' operator for combining conditions
	// `contains` with `mode: 'insensitive'` is the Prisma equivalent of `ilike`
	return {
		OR: [
			{ name: { contains: search, mode: 'insensitive' } },
			{ phone: { contains: search, mode: 'insensitive' } },
			{ email: { contains: search, mode: 'insensitive' } },
		],
	}
}

export const staffRouter = createTRPCRouter({
	// --- getAllStaff ---
	// This procedure is protected, assuming only authenticated users (e.g., admins)
	// should be able to view all staff records. You can change to `publicProcedure`
	// if this data is publicly accessible.
	getAllStaff: protectedProcedure
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

				// Build the Prisma WHERE clause for searching
				const whereClause = buildStaffSearchWhereClause(search)

				// Perform both queries (fetch data and count) atomically within a Prisma transaction
				const [staffData, totalRecordsCount] = await ctx.db.$transaction(async prisma => {
					// 'prisma' is the transactional client
					// Fetch paginated staff data using Prisma's findMany
					const fetchedStaff = await prisma.staff.findMany({
						skip: skip, // Prisma equivalent of Drizzle's offset
						take: limit, // Prisma equivalent of Drizzle's limit
						// Assuming your Prisma model is named 'Staff'
						where: whereClause,
						// orderBy: { name: 'asc' }, // Optionally add an order by clause, e.g., by name
					})

					// Count total records matching the search criteria using Prisma's count method
					const countResult = await prisma.staff.count({
						// Assuming your Prisma model is named 'Staff'
						where: whereClause,
					})

					return [fetchedStaff, countResult]
				})

				const totalPages = Math.ceil(totalRecordsCount / limit)

				return {
					currentPage: page,
					data: staffData as StaffRecord[], // Cast to the inferred type
					totalPages,
					totalRecords: totalRecordsCount,
				}
			} catch (error) {
				console.error('Error fetching all staff:', error)
				if (error instanceof TRPCError) {
					throw error
				}
				// Catch specific Prisma errors for better debugging/handling
				if (error instanceof Prisma.PrismaClientKnownRequestError) {
					console.error('Prisma Error Code:', error.code)
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: `Database Error: ${error.message}`,
					})
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Internal Server Error: Failed to fetch staff records.',
				})
			}
		}),
})
