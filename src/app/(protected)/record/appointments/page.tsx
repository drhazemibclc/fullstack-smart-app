import { auth } from '@clerk/nextjs/server'
import type { Appointment, Doctor, Patient } from '@prisma/client'
import { format } from 'date-fns'
import { BriefcaseBusiness } from 'lucide-react'

import { AppointmentActionOptions } from '@/components/appointment-actions'
import { AppointmentContainer } from '@/components/appointment-container'
import { AppointmentStatusIndicator } from '@/components/appointment-status-indicator'
import { Pagination } from '@/components/pagination'
import { ProfileImage } from '@/components/profile-image'
import SearchInput from '@/components/search-input'
import { Table } from '@/components/tables/table'
import { ViewAppointment } from '@/components/view-appointment'
import { checkRole, getRole } from '@/utils/roles'
import { DATA_LIMIT } from '@/utils/seetings'
import { getPatientAppointments } from '@/utils/services/appointment'

const columns = [
	{ header: 'Info', key: 'name' },
	{ header: 'Date', key: 'appointment_date', className: 'hidden md:table-cell' },
	{ header: 'Time', key: 'time', className: 'hidden md:table-cell' },
	{ header: 'Doctor', key: 'doctor', className: 'hidden md:table-cell' },
	{ header: 'Status', key: 'status', className: 'hidden xl:table-cell' },
	{ header: 'Actions', key: 'action' },
]

interface DataProps extends Appointment {
	patient: Patient | null
	doctor: Doctor | null
}

const Appointments = async ({
	searchParams,
}: {
	searchParams?: Promise<{ [key: string]: string | undefined }>
}) => {
	const search = await searchParams
	const userRole = await getRole()
	const { userId } = await auth()
	const isPatient = await checkRole('PATIENT')

	const page = search?.p || '1'
	const searchQuery = search?.q || ''
	const id = search?.id

	let queryId: string | undefined

	if (userRole === 'admin' || (['doctor', 'nurse'].includes(userRole) && id)) {
		queryId = id
	} else if (userRole === 'doctor' || userRole === 'patient') {
		queryId = userId ?? undefined
	}

	const response = await getPatientAppointments({
		page,
		search: searchQuery,
		id: queryId,
	})

	if (!response || !response.data) return null

	const { data, totalPages = 0, totalRecord = 0, currentPage = 1 } = response

	const renderItem = (item: DataProps) => {
		const patientName = `${item.patient?.firstName ?? ''} ${item.patient?.lastName ?? ''}`

		return (
			<tr
				className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
				key={item.id}
			>
				<td className="flex items-center gap-2 md:gap-4 py-2 xl:py-4">
					<ProfileImage
						bgColor={item.patient?.colorCode ?? '#ccc'}
						name={patientName}
						url={item.patient?.img ?? ''}
					/>
					<div>
						<h3 className="font-semibold uppercase">{patientName}</h3>
						<span className="text-xs md:text-sm capitalize">
							{item.patient?.gender?.toLowerCase() ?? 'unknown'}
						</span>
					</div>
				</td>

				<td className="hidden md:table-cell">
					{format(new Date(item.appointment_date), 'yyyy-MM-dd')}
				</td>

				<td className="hidden md:table-cell">{item.time}</td>

				<td className="hidden md:table-cell">
					<div className="flex items-center gap-2 md:gap-4">
						<ProfileImage
							bgColor={item.doctor?.colorCode ?? '#ccc'}
							name={item.doctor?.name ?? 'Unknown'}
							textClassName="text-black"
							url={item.doctor?.img ?? ''}
						/>
						<div>
							<h3 className="font-semibold uppercase">{item.doctor?.name ?? 'Unknown'}</h3>
							<span className="text-xs md:text-sm capitalize">
								{item.doctor?.specialization ?? 'N/A'}
							</span>
						</div>
					</div>
				</td>

				<td className="hidden xl:table-cell">
					<AppointmentStatusIndicator status={item.status} />
				</td>

				<td>
					<div className="flex items-center gap-2">
						<ViewAppointment id={item.id.toString()} />
						<AppointmentActionOptions
							appointmentId={item.id}
							doctorId={item.doctor_id}
							patientId={item.patient_id}
							status={item.status}
							userId={userId ?? ''}
						/>
					</div>
				</td>
			</tr>
		)
	}

	return (
		<div className="bg-white rounded-xl p-2 md:p-4 2xl:p-6">
			<div className="flex items-center justify-between">
				<div className="hidden lg:flex items-center gap-1">
					<BriefcaseBusiness
						className="text-gray-500"
						size={20}
					/>
					<p className="text-2xl font-semibold">{totalRecord}</p>
					<span className="text-gray-600 text-sm xl:text-base">total appointments</span>
				</div>

				<div className="w-full lg:w-fit flex items-center justify-between lg:justify-start gap-2">
					<SearchInput />
					{isPatient && userId && <AppointmentContainer id={userId} />}
				</div>
			</div>

			<div className="mt-6">
				<Table
					columns={columns}
					data={data}
					renderRow={renderItem}
				/>

				{data.length > 0 && (
					<Pagination
						currentPage={currentPage}
						limit={DATA_LIMIT}
						totalPages={totalPages}
						totalRecords={totalRecord}
					/>
				)}
			</div>
		</div>
	)
}

export default Appointments
