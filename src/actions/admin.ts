'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import type z from 'zod'

import db from '@/lib/db'
import { DoctorSchema, ServicesSchema, StaffSchema, WorkingDaysSchema } from '@/lib/schema'
import type { WorkScheduleInput } from '@/types/data-types'
import { generateRandomColor } from '@/utils'
import { checkRole } from '@/utils/roles'

type StaffInput = z.infer<typeof StaffSchema>
type DoctorInput = z.infer<typeof DoctorSchema>
type ServiceInput = z.infer<typeof ServicesSchema>

export async function createNewStaff(data: StaffInput) {
	try {
		const { userId } = await auth()
		if (!userId) return { success: false, msg: 'Unauthorized' }

		const isAdmin = await checkRole('ADMIN')
		if (!isAdmin) return { success: false, msg: 'Unauthorized' }

		const parsed = StaffSchema.safeParse(data)
		if (!parsed.success) {
			return {
				success: false,
				errors: true,
				message: 'Please provide all required info',
			}
		}

		const values = parsed.data
		const [firstName, lastName = ''] = values.name.split(' ')

		const user = await clerkClient().then(client =>
			client.users.createUser({
				emailAddress: [values.email],
				password: values.password,
				firstName,
				lastName,
				publicMetadata: { role: values.role.toLowerCase() },
			}),
		)

		await db.staff.create({
			data: {
				id: user.id,
				name: values.name,
				phone: values.phone,
				email: values.email,
				address: values.address,
				role: values.role,
				license_number: values.license_number,
				department: values.department,
				colorCode: generateRandomColor(),
				status: 'ACTIVE',
			},
		})

		return {
			success: true,
			error: false,
			message: 'Staff member added successfully',
		}
	} catch (error) {
		console.error('[createNewStaff]', error)
		return { success: false, error: true, message: 'Something went wrong' }
	}
}

export async function createNewDoctor(data: DoctorInput & { work_schedule: WorkScheduleInput }) {
	try {
		const doctorResult = DoctorSchema.safeParse(data)
		const workScheduleResult = WorkingDaysSchema.safeParse(data?.work_schedule)

		if (!doctorResult.success || !workScheduleResult.success) {
			return {
				success: false,
				errors: true,
				message: 'Please provide all required info',
			}
		}

		const { name, ...doctorData } = doctorResult.data
		const workSchedule = workScheduleResult.data
		const [firstName, ...restName] = name.trim().split(' ')
		const lastName = restName.join(' ')

		const user = await clerkClient().then(client =>
			client.users.createUser({
				emailAddress: [doctorData.email],
				password: doctorData.password,
				firstName,
				lastName,
				publicMetadata: { role: 'doctor' },
			}),
		)
		const doctor = await db.doctor.create({
			data: {
				...doctorData,
				id: user.id,
				name,
			},
		})

		if (workSchedule) {
			await Promise.all(
				workSchedule.map(el =>
					db.workingDays.create({
						data: { ...el, doctor_id: doctor.id },
					}),
				),
			)
		}

		return { success: true, message: 'Doctor added successfully', error: false }
	} catch (error) {
		console.error(error)
		return { error: true, success: false, message: 'Something went wrong' }
	}
}
export async function addNewService(data: ServiceInput) {
	try {
		const parsed = ServicesSchema.safeParse(data)
		if (!parsed.success) {
			return {
				success: false,
				msg: 'Invalid service data',
			}
		}

		const serviceData = parsed.data

		await db.services.create({
			data: {
				...serviceData,
				price: Number(serviceData.price),
			},
		})

		return {
			success: true,
			error: false,
			msg: 'Service added successfully',
		}
	} catch (error) {
		console.error('[addNewService]', error)
		return { success: false, error: true, msg: 'Internal Server Error' }
	}
}
