'use client'

import { useUser } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Patient } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

import { createNewPatient, updatePatient } from '@/actions/patient'
import { GENDER, MARITAL_STATUS, RELATION } from '@/lib'
import { PatientFormSchema } from '@/lib/schema'

import { CustomInput } from './custom-input'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Form } from './ui/form'

interface DataProps {
	data?: Patient
	type: 'create' | 'update'
}
type PatientFormValues = z.infer<typeof PatientFormSchema>

export const NewPatient = ({ data, type }: DataProps) => {
	const { user } = useUser()
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const userId = user?.id ?? ''

	const form = useForm<PatientFormValues>({
		resolver: zodResolver(PatientFormSchema),
		defaultValues: {
			firstName: user?.firstName || '',
			lastName: user?.lastName || '',
			email: user?.emailAddresses[0].emailAddress || '',
			phone: user?.phoneNumbers?.toString() || '',
			address: '',
			dateOfBirth: new Date(),
			gender: 'MALE',
			maritalStatus: 'SINGLE',
			emergencyContactName: '',
			emergencyContactNumber: '',
			relation: 'mother',
			bloodGroup: 'A_NEG',
			allergies: '',
			medicalConditions: '',
			insurance_number: '',
			insurance_provider: '',
			medicalHistory: '',
			privacy_consent: false,
			service_consent: false,
			medical_consent: false,
		},
	})

	const onSubmit: SubmitHandler<PatientFormValues> = async values => {
		setLoading(true)

		const res =
			type === 'create'
				? await createNewPatient(values, userId ?? 'N/A')
				: await updatePatient(values, userId ?? 'N/A')

		setLoading(false)

		if (res?.success) {
			toast.success(res.msg)
			form.reset()
			router.push('/patient')
		} else {
			toast.error('Failed to create patient')
		}
	}

	useEffect(() => {
		if (type === 'update' && data) {
			form.reset({
				...data,
				dateOfBirth: new Date(data.dateOfBirth),
			})
		} else if (type === 'create') {
			form.reset(defaultUserData)
		}
	}, [data, type, form.reset])

	return (
		<Card className="max-w-6xl w-full p-4">
			<CardHeader>
				<CardTitle>Patient Registration</CardTitle>
				<CardDescription>
					Please provide all the information below to help us understand better and provide good and
					quality service to you.
				</CardDescription>
			</CardHeader>

			<CardContent>
				<Form {...form}>
					<form
						className="space-y-8 mt-5"
						onSubmit={form.handleSubmit(onSubmit)}
					>
						<h3 className="text-lg font-semibold">Personal Information</h3>

						<div className="flex flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-x-4">
							<CustomInput
								control={form.control}
								label="First Name"
								name="firstName"
								placeholder="John"
								type="input"
							/>
							<CustomInput
								control={form.control}
								label="Last Name"
								name="lastName"
								placeholder="Doe"
								type="input"
							/>
						</div>

						<CustomInput
							control={form.control}
							label="Email Address"
							name="email"
							placeholder="john@example.com"
							type="input"
						/>

						<div className="flex flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-x-4">
							<CustomInput
								control={form.control}
								label="Gender"
								name="gender"
								placeholder="Select gender"
								selectList={GENDER}
								type="select"
							/>
							<CustomInput
								control={form.control}
								inputType="date"
								label="Date of Birth"
								name="dateOfBirth"
								placeholder="01-05-2000"
								type="input"
							/>
						</div>

						<div className="flex flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-x-4">
							<CustomInput
								control={form.control}
								label="Contact Number"
								name="phone"
								placeholder="9225600735"
								type="input"
							/>
							<CustomInput
								control={form.control}
								label="Marital Status"
								name="maritalStatus"
								placeholder="Select marital status"
								selectList={MARITAL_STATUS}
								type="select"
							/>
						</div>

						<CustomInput
							control={form.control}
							label="Address"
							name="address"
							placeholder="1479 Street, Apt 1839-G, NY"
							type="input"
						/>

						<div className="space-y-8">
							<h3 className="text-lg font-semibold">Family Information</h3>
							<CustomInput
								control={form.control}
								label="Emergency contact name"
								name="emergencyContactName"
								placeholder="Anne Smith"
								type="input"
							/>
							<CustomInput
								control={form.control}
								label="Emergency contact"
								name="emergencyContactNumber"
								placeholder="675444467"
								type="input"
							/>
							<CustomInput
								control={form.control}
								label="Relation"
								name="relation"
								placeholder="Select relation with contact person"
								selectList={RELATION}
								type="select"
							/>
						</div>

						<div className="space-y-8">
							<h3 className="text-lg font-semibold">Medical Information</h3>
							<CustomInput
								control={form.control}
								label="Blood group"
								name="bloodGroup"
								placeholder="A+"
								type="input"
							/>
							<CustomInput
								control={form.control}
								label="Allergies"
								name="allergies"
								placeholder="Milk"
								type="input"
							/>
							<CustomInput
								control={form.control}
								label="Medical conditions"
								name="medicalConditions"
								placeholder="Medical conditions"
								type="input"
							/>
							<CustomInput
								control={form.control}
								label="Medical history"
								name="medicalHistory"
								placeholder="Medical history"
								type="input"
							/>

							<div className="flex flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-x-4">
								<CustomInput
									control={form.control}
									label="Insurance provider"
									name="insurance_provider"
									placeholder="Insurance provider"
									type="input"
								/>
								<CustomInput
									control={form.control}
									label="Insurance number"
									name="insurance_number"
									placeholder="Insurance number"
									type="input"
								/>
							</div>
						</div>

						{type !== 'update' && (
							<div>
								<h3 className="text-lg font-semibold mb-2">Consent</h3>
								<div className="space-y-6">
									<CustomInput
										control={form.control}
										label=" Privacy Policy Agreement"
										name="privacy_consent"
										placeholder="I consent to the collection, storage, and use of my personal and health information as outlined in the Privacy Policy."
										type="checkbox"
									/>
									<CustomInput
										control={form.control}
										label=" Terms of Service Agreement"
										name="service_consent"
										placeholder="I agree to the Terms of Service and understand the conditions."
										type="checkbox"
									/>
									<CustomInput
										control={form.control}
										label="Informed Consent for Medical Treatment"
										name="medical_consent"
										placeholder="I provide informed consent to receive medical treatment and services."
										type="checkbox"
									/>
								</div>
							</div>
						)}

						<Button
							className="w-full md:w-fit px-6"
							disabled={loading}
							type="submit"
						>
							{type === 'create' ? 'Submit' : 'Update'}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	)
}
