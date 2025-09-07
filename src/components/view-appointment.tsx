import { auth } from '@clerk/nextjs/server'
import { format } from 'date-fns'
import { Calendar, Phone } from 'lucide-react'

import { calculateAge, formatDateTime } from '@/utils'
import { checkRole } from '@/utils/roles'
import { getAppointmentById } from '@/utils/services/appointment'

import { AppointmentAction } from './appointment-action'
import { AppointmentStatusIndicator } from './appointment-status-indicator'
import { ProfileImage } from './profile-image'
import { Button } from './ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog'

export const ViewAppointment = async ({ id }: { id: string | undefined }) => {
	const { data } = await getAppointmentById(Number(id))
	const { userId } = await auth()

	if (!data) return null

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					className="flex items-center justify-center rounded-full bg-blue-500/10 hover:underline text-blue-600 px-1.5 py-1 text-xs md:text-sm"
					variant="outline"
				>
					View
				</Button>
			</DialogTrigger>

			<DialogContent className="max-w-[425px] max-h-[95%] md:max-w-2xl 2xl:max-w-3xl p-8 overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Patient Appointment</DialogTitle>
					<DialogDescription>
						This appointment was booked on the {formatDateTime(data?.created_at.toString())}
					</DialogDescription>
				</DialogHeader>

				{data?.status === 'CANCELLED' && (
					<div className="bg-yellow-100 p-4 mt-4 rounded-md">
						<span className="font-semibold text-sm">This appointment has been cancelled</span>
						<p className="text-sm">
							<strong>Reason</strong>: {data?.reason}
						</p>
					</div>
				)}

				<div className="grid gap-4 py-4">
					<p className="w-fit bg-blue-100 text-blue-600 py-1 rounded text-xs md:text-sm">
						Personal Information
					</p>

					<div className="flex flex-col md:flex-row gap-6 mb-16">
						<div className="flex gap-1 w-full md:w-1/2">
							<ProfileImage
								className="size-20 bg-blue-500"
								name={`${data?.patient?.firstName} ${data?.patient?.lastName}`}
								textClassName="text-2xl"
								url={data?.patient?.img ?? undefined}
							/>

							<div className="space-y-0.5">
								<h2 className="text-lg md:text-xl font-semibold uppercase">
									{`${data?.patient?.firstName} ${data?.patient?.lastName}`}
								</h2>

								<p className="flex items-center gap-2 text-gray-600">
									<Calendar
										className="text-gray-500"
										size={20}
									/>
									{calculateAge(data?.patient?.dateOfBirth)}
								</p>

								<span className="flex items-center text-sm gap-2">
									<Phone
										className="text-gray-500"
										size={16}
									/>
									{data?.patient?.phone}
								</span>
							</div>
						</div>

						<div>
							<span className="text-sm text-gray-500">Address</span>
							<p className="text-gray-600 capitalize">{data?.patient?.address}</p>
						</div>
					</div>

					<p className="w-fit bg-blue-100 text-blue-600 py-1 rounded text-xs md:text-sm">
						Appointment Information
					</p>

					<div className="grid grid-cols-3 gap-10">
						<div>
							<span className="text-sm text-gray-500">Date</span>
							<p className="text-sm text-gray-600">
								{format(data?.appointment_date, 'MMM dd, yyyy')}
							</p>
						</div>
						<div>
							<span className="text-sm text-gray-500">Time</span>
							<p>{data?.time}</p>
						</div>
						<div>
							<span className="text-sm text-gray-500">Status</span>
							<AppointmentStatusIndicator status={data?.status} />
						</div>
					</div>

					{data?.note && (
						<div>
							<span className="text-sm text-gray-500">Note from Patient</span>
							<p>{data?.note}</p>
						</div>
					)}

					<p className="w-fit bg-blue-100 text-blue-600 py-1 px-2 rounded text-xs md:text-sm mt-16">
						Physician Information
					</p>
					<div className="w-full flex flex-col md:flex-row gap-8 mb-8">
						<div className="flex gap-3">
							<ProfileImage
								className="xl:size-20 bg-emerald-600"
								name={data?.doctor?.name}
								textClassName="xl:text-2xl"
								url={data?.doctor?.img ?? undefined}
							/>
							<div className="">
								<h2 className="text-lg uppercase font-medium">{data?.doctor?.name}</h2>
								<p className="flex items-center gap-2 text-gray-600 capitalize">
									{data?.doctor?.specialization}
								</p>
							</div>
						</div>
					</div>

					{((await checkRole('ADMIN')) || data?.doctor_id === userId) && (
						<>
							<p className="w-fit bg-blue-100 text-blue-600 py-1 px-2 rounded text-xs md:text-sm mt-4">
								Perform Action
							</p>
							<AppointmentAction
								id={data.id}
								status={data?.status}
							/>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}
