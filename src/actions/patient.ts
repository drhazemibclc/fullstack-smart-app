'use server'

import { clerkClient } from '@clerk/nextjs/server'

import db from '@/lib/db'
import { PatientFormSchema } from '@/lib/schema'

export async function updatePatient(data: typeof PatientFormSchema, pid: string) {
	try {
		const validateData = PatientFormSchema.safeParse(data)

		if (!validateData.success) {
			return {
				success: false,
				error: true,
				msg: 'Provide all required fields',
			}
		}

		const patientData = validateData.data

		const client = await clerkClient()
		await client.users.updateUser(pid, {
			firstName: patientData.first_name,
			lastName: patientData.last_name,
		})

		await db.patient.update({
			data: {
				...patientData,
			},
			where: { id: pid },
		})

		return {
			success: true,
			error: false,
			msg: 'Patient info updated successfully',
		}
	} catch (error: unknown) {
		console.error('Update patient error:', error)
		return {
			success: false,
			error: true,
			msg: error instanceof Error ? error.message : 'Internal server error',
		}
	}
}
export async function createNewPatient(data: typeof PatientFormSchema, pid: string) {
	try {
		const validateData = PatientFormSchema.safeParse(data)

		if (!validateData.success) {
			return {
				success: false,
				error: true,
				msg: 'Provide all required fields',
			}
		}

		const patientData = validateData.data
		let patient_id = pid

		const client = await clerkClient()
		if (pid === 'new-patient') {
			const user = await client.users.createUser({
				emailAddress: [patientData.email],
				password: patientData.phone,
				firstName: patientData.first_name,
				lastName: patientData.last_name,
				publicMetadata: { role: 'patient' },
			})

			patient_id = user?.id
		} else {
			await client.users.updateUser(pid, {
				publicMetadata: { role: 'patient' },
			})
		}

		await db.patient.create({
			data: {
				...patientData,
				id: patient_id,
			},
		})

		return {
			success: true,
			error: false,
			msg: 'Patient created successfully',
		}
	} catch (error: unknown) {
		console.error('Create patient error:', error)
		return {
			success: false,
			error: true,
			msg: error instanceof Error ? error.message : 'Internal server error',
		}
	}
}
