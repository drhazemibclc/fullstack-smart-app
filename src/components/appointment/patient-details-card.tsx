import type { Patient } from '@prisma/client'
import { format } from 'date-fns'
import { Calendar, Home, Info, Mail, Phone } from 'lucide-react'
import Image from 'next/image'

import { calculateAge } from '@/utils'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

export const PatientDetailsCard = ({ data }: { data: Patient }) => {
	return (
		<Card className="shadow-none bg-white">
			<CardHeader>
				<CardTitle>Patient Details</CardTitle>
				<div className="relative size-20 xl:size-24 rounded-full overflow-hidden">
					<Image
						alt={data?.firstName}
						className="rounded-full"
						height={100}
						src={data.img || '/user.jpg'}
						width={100}
					/>
				</div>

				<div>
					<h2 className="text-lg font-semibold">
						{data?.firstName} {data?.lastName}
					</h2>
					<p className="text-sm text-gray-500">
						{data?.email} - {data?.phone}
					</p>
					<p className="text-sm text-gray-500">
						{data?.gender} - {calculateAge(data?.dateOfBirth)}
					</p>
				</div>
			</CardHeader>

			<CardContent className="mt-4 space-y-4">
				<div className="flex items-start gap-3">
					<Calendar
						className="text-0gray-400"
						size={22}
					/>
					<div>
						<p className="text-sm text-gray-500">Date of Birth</p>
						<p className="text-base font-medium text-muted-foreground">
							{format(new Date(data?.dateOfBirth), 'MMM d, yyyy')}
						</p>
					</div>
				</div>
				<div className="flex items-start gap-3">
					<Home
						className="text-0gray-400"
						size={22}
					/>
					<div>
						<p className="text-sm text-gray-500">Address</p>
						<p className="text-base font-medium text-muted-foreground">{data?.address}</p>
					</div>
				</div>
				<div className="flex items-start gap-3">
					<Mail
						className="text-0gray-400"
						size={22}
					/>
					<div>
						<p className="text-sm text-gray-500">Email</p>
						<p className="text-base font-medium text-muted-foreground">{data?.email}</p>
					</div>
				</div>
				<div className="flex items-start gap-3">
					<Phone
						className="text-0gray-400"
						size={22}
					/>
					<div>
						<p className="text-sm text-gray-500">Phone</p>
						<p className="text-base font-medium text-muted-foreground">{data?.phone}</p>
					</div>
				</div>
				<div className="flex items-start gap-3">
					<Info
						className="text-0gray-400"
						size={22}
					/>
					<div>
						<p className="text-sm text-gray-500">Physician</p>
						<p className="text-base font-medium text-muted-foreground">Dr Codewave, MBBS, FCPS</p>
					</div>
				</div>
				<div className="flex items-start gap-3">
					<div>
						<p className="text-sm text-gray-500">Active Conditions</p>
						<p className="text-base font-medium text-muted-foreground">
							{data?.medicalConditions}
						</p>
					</div>
				</div>
				<div className="flex items-start gap-3">
					<div>
						<p className="text-sm text-gray-500">Allergies</p>
						<p className="text-base font-medium text-muted-foreground">{data?.allergies}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
