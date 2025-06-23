// Import Prisma types
import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { format } from 'date-fns'
import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from '@/server/lib/trpc'

export const medicalRouter = createTRPCRouter({
	getVitalSignData: publicProcedure
		.input(z.object({ id: z.string().min(1, 'Patient ID is required.') }))
		.query(async ({ ctx, input }) => {
			try {
				const { id } = input

				const sevenDaysAgo = new Date()
				sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

				// Prisma equivalent of Drizzle's findMany with where, columns, and orderBy
				const data = await ctx.db.vitalSign.findMany({
					orderBy: {
						createdAt: 'asc', // Prisma's 'orderBy' syntax
					},
					select: {
						// Prisma uses 'select' for specific columns
						createdAt: true,
						diastolic: true,
						heartRate: true,
						systolic: true,
					},
					where: {
						createdAt: {
							gte: sevenDaysAgo, // Prisma's 'gte' for greater than or equal
						},
						patientId: id,
					},
				})

				if (data.length === 0) {
					return {
						average: 'N/A',
						averageHeartRate: 'N/A',
						data: [],
						heartRateData: [],
					}
				}

				// Corrected date formatting for `label` based on common chart library requirements
				// Also, ensure record.systolic and record.diastolic are not null before sending
				const formatVitals = data.map(record => {
					return {
						diastolic: record.diastolic ?? 0, // Default to 0 if null, or handle nulls in UI
						// Use actual record.createdAt for label if it represents different dates
						// If it's just to show month name, consider context.
						// Assuming you want the month name of the record's creation date.
						label: format(record.createdAt, 'MMM'),
						systolic: record.systolic ?? 0, // Default to 0 if null, or handle nulls in UI
					}
				})

				const formattedHeartRateData = data.map(record => {
					// Ensure record.heartRate is a string before splitting
					const heartRateString = record.heartRate?.toString() ?? ''
					const heartRates = heartRateString
						.split('-')
						.map(rate => Number.parseInt(rate.trim(), 10))
						.filter(rate => !Number.isNaN(rate))

					return {
						label: format(record.createdAt, 'MMM d'),
						value1: heartRates[0] ?? 0,
						value2: heartRates[1] ?? 0,
					}
				})

				const totalSystolic = data.reduce((sum, record) => sum + (record.systolic ?? 0), 0)
				const totalDiastolic = data.reduce((sum, record) => sum + (record.diastolic ?? 0), 0)

				const totalValue1 = formattedHeartRateData.reduce((sum, record) => sum + record.value1, 0)
				const totalValue2 = formattedHeartRateData.reduce((sum, record) => sum + record.value2, 0)

				const count = data.length

				const averageSystolic = count > 0 ? totalSystolic / count : 0
				const averageDiastolic = count > 0 ? totalDiastolic / count : 0
				const averageValue1 = count > 0 ? totalValue1 / count : 0
				const averageValue2 = count > 0 ? totalValue2 / count : 0

				const average = `${averageSystolic.toFixed(2)}/${averageDiastolic.toFixed(2)} mg/dL`
				const averageHeartRate = `${averageValue1.toFixed(2)}-${averageValue2.toFixed(2)} bpm`

				return {
					average,
					averageHeartRate,
					data: formatVitals,
					heartRateData: formattedHeartRateData,
				}
			} catch (error) {
				console.error('Error fetching vital sign data:', error)
				if (error instanceof TRPCError) {
					throw error
				}
				// Handle Prisma-specific errors or generic errors
				if (error instanceof Prisma.PrismaClientKnownRequestError) {
					// Example: Handle specific Prisma error codes if needed
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
