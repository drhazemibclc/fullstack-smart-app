// src/server/trpc/routers/review.router.ts
// src/server/trpc/routers/review.router.ts

import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { reviewSchema } from '@/components/dialogs/review-form'
import { auth } from '@/lib/auth' // BetterAuth API client
import { db } from '@/lib/db'
import { createTRPCRouter, protectedProcedure } from '@/server/lib/trpc'

export const reviewRouter = createTRPCRouter({
	// ✅ Create a review
	createReview: protectedProcedure.input(reviewSchema).mutation(async ({ input }) => {
		try {
			await db.rating.create({
				data: input,
			})

			return {
				message: 'Review created successfully',
				status: 200,
				success: true,
			}
		} catch (error) {
			console.error('createReview error:', error)
			throw new TRPCError({
				cause: error,
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to create review',
			})
		}
	}),

	// ✅ Delete data by ID and type
	deleteDataById: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				deleteType: z.enum(['bill', 'doctor', 'patient', 'payment', 'staff']),
			}),
		)
		.mutation(async ({ input }) => {
			const { id, deleteType } = input

			try {
				switch (deleteType) {
					case 'bill':
						await db.patientBill.delete({ where: { id: Number(id) } })
						break
					case 'doctor':
						await db.doctor.delete({ where: { id } })
						break
					case 'patient':
						await db.patient.delete({ where: { id } })
						break
					case 'payment':
						await db.payment.delete({ where: { id: Number(id) } })
						break
					case 'staff':
						await db.staff.delete({ where: { id } })
						break
				}

				if (['doctor', 'patient', 'staff'].includes(deleteType)) {
					await auth.api.deleteUser({ body: {}, query: { id } })
				}

				return {
					message: 'Data deleted successfully',
					status: 200,
					success: true,
				}
			} catch (error) {
				console.error('deleteDataById error:', error)
				throw new TRPCError({
					cause: error,
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to delete data',
				})
			}
		}),
})
