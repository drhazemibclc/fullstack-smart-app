// src/server/trpc/routers/admin.actions.ts

import { ROLE as UserRoles } from '@prisma/client' // Assuming UserRoles comes from Prisma's Role enum
import { TRPCError } from '@trpc/server'
import { z } from 'zod' // Import z from zod

// Adjust this import path/name based on your actual enum/type for user roles.

// Adjust this import path/name based on your actual enum/type for user roles.

import { auth } from '@/lib/auth' // your BetterAuth instance
import { db } from '@/lib/db'
// your BetterAuth instance (if getSession is part of auth module)
import {
	DoctorSchema,
	ServiceSchema,
	StaffSchema,
	WorkingDaySchema, // This should be a schema for a single WorkingDay object
} from '@/lib/zod'
import { createTRPCRouter, protectedProcedure } from '@/server/lib/trpc'
import { generateRandomColor } from '@/utils'

// --- Helper for Role Checking ---
// Corrected checkRole function:
// It only needs the target role and the session object (or the user's role from session)
// The 'id' and 'p0' parameters were unused and causing confusion.
export const checkRole = async (
	sessionRole: string | null | undefined,
	requiredRole: UserRoles,
) => {
	return sessionRole?.toLowerCase() === requiredRole.toLowerCase()
}

// ⛔ Only allow users with role = ADMIN
const protectedAdminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
	// Ensure ctx.session.user.role exists due to protectedProcedure
	const isAdmin = await checkRole(ctx.session?.user?.role, UserRoles.ADMIN) // Pass the actual role and required role enum
	if (!isAdmin) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'You are not authorized to perform this action.',
		})
	}
	return next()
})

export const adminRouter = createTRPCRouter({
	// ✅ Add New Service
	addNewService: protectedAdminProcedure.input(ServiceSchema).mutation(async ({ input }) => {
		// Assuming ServiceSchema has 'price' as a string/number and other fields
		// And Prisma's Service model has 'price' as a Number.
		const { price, ...rest } = input // Destructure to ensure price is handled correctly

		try {
			await db.service.create({
				data: {
					...rest,
					price: Number(price), // Ensure price is a number for Prisma
				},
			})
			return { message: 'Service added successfully', success: true }
		} catch (error: unknown) {
			console.error('tRPC - addNewService error:', error)
			throw new TRPCError({
				cause: error,
				code: 'INTERNAL_SERVER_ERROR',
				message: error instanceof Error ? error.message : 'Failed to add new service',
			})
		}
	}),

	// ✅ Add New Doctor with Schedule
	createNewDoctor: protectedAdminProcedure
		.input(
			z.object({
				doctor: DoctorSchema.extend({
					// Extend DoctorSchema to include the password field for user creation
					// DoctorSchema itself should only contain fields relevant to the Doctor model.
					password: z.string().min(6, 'Password must be at least 6 characters long'),
				}),
				// Assuming work_schedule is an ARRAY of WorkingDaySchema objects
				work_schedule: z.array(WorkingDaySchema), // Fix: Use z.array() if it's a list of schedules
			}),
		)
		.mutation(async ({ input }) => {
			const { doctor, work_schedule } = input
			const { name, password, ...doctorData } = doctor
			const [firstName, ...restName] = name.trim().split(' ')
			const lastName = restName.join(' ')

			try {
				// 1. Create User in Auth System
				const user = await auth.api.createUser({
					body: {
						email: doctorData.email,
						name: `${firstName} ${lastName}`,
						password: password, // Use the password from input
						role: 'doctor', // Explicitly set role for the auth system user
					},
				})

				// 2. Create Doctor Record in Database
				// Map fields from Zod (snake_case) to Prisma (camelCase)
				const newDoctor = await db.doctor.create({
					data: {
						id: user.user.id, // Link doctor record to auth user ID
						address: doctorData.address,
						// Handle optional fields that might be undefined or null in Zod but nullable in Prisma
						availabilityStatus: doctorData.availabilityStatus ?? null,
						colorCode: doctorData.colorCode ?? null,
						department: doctorData.department ?? null,
						email: doctorData.email,
						img: doctorData.img ?? null,
						jobType: doctorData.jobType,
						licenseNumber: doctorData.licenseNumber,
						name: user.user.name,
						phone: doctorData.phone,
						specialization: doctorData.specialization,
					},
				})

				// 3. Create Working Schedule
				// Fix: Use map on the array, ensure doctor_id mapping to doctorId (camelCase)
				await Promise.all(
					work_schedule.map(el =>
						db.workingDay.create({
							data: {
								closeTime: el.closeTime, // Map closeTime from Zod to closeTime in Prisma
								day: el.day,
								doctorId: newDoctor.id, // Link to the newly created doctor's ID
								startTime: el.startTime, // Map startTime from Zod to startTime in Prisma
							},
						}),
					),
				)

				return { message: 'Doctor added successfully', success: true }
			} catch (error: unknown) {
				console.error('tRPC - createNewDoctor error:', error)
				throw new TRPCError({
					cause: error,
					code: 'INTERNAL_SERVER_ERROR',
					message: error instanceof Error ? error.message : 'Failed to add new doctor',
				})
			}
		}),

	// ✅ Add New Staff
	createNewStaff: protectedAdminProcedure
		.input(
			StaffSchema.extend({
				// Extend StaffSchema to include the password field for user creation
				password: z.string().min(6, 'Password must be at least 6 characters long'),
			}),
		)
		.mutation(async ({ input }) => {
			const { name, password, ...rest } = input // `rest` now includes everything but name and password
			const [firstName, ...restName] = name.trim().split(' ')
			const lastName = restName.join(' ')

			try {
				// 1. Create User in Auth System
				const user = await auth.api.createUser({
					body: {
						email: rest.email,
						name: `${firstName} ${lastName}`,
						password: password, // Use the password from input
						role: 'nurse', // Assuming 'staff' is a valid role in your auth system
						// Or make it dynamic: input.role if StaffSchema has a role field.
					},
				})

				// 2. Create Staff Record in Database
				// Map fields from Zod (snake_case) to Prisma (camelCase)
				await db.staff.create({
					data: {
						id: user.user.id, // Link staff record to auth user ID
						address: rest.address,
						// Handle optional fields
						colorCode: generateRandomColor(), // As per your original code
						email: rest.email,
						licenseNumber: rest.licenseNumber, // Map license_number to licenseNumber
						name: user.user.name, // Use name from rest (which is input.name)
						phone: rest.phone,
						role: 'NURSE',
						status: 'ACTIVE', // Assuming default status, or get from input if StaffSchema has it
						// Other fields from StaffSchema should be mapped similarly
						// department: rest.department,
						// img: rest.img,
						// bio: rest.bio,
					},
				})

				return { message: 'Staff added successfully', success: true }
			} catch (error: unknown) {
				console.error('tRPC - createNewStaff error:', error)
				throw new TRPCError({
					cause: error,
					code: 'INTERNAL_SERVER_ERROR',
					message: error instanceof Error ? error.message : 'Failed to add new staff',
				})
			}
		}),
})
