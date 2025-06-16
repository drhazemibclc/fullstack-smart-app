import { format } from 'date-fns'
import Link from 'next/link'

import type { Appointment } from '@/types/data-types'

import { AppointmentStatusIndicator } from '../appointment-status-indicator'
import { ProfileImage } from '../profile-image'
import { Button } from '../ui/button'
import { ViewAppointment } from '../view-appointment'
import { Table } from './table'

interface DataProps {
	data: Appointment[]
}
const columns = [
	{ header: 'Info', key: 'name' },
	{
		header: 'Date',
		key: 'appointment_date',
		className: 'hidden md:table-cell',
	},
	{
		header: 'Time',
		key: 'time',
		className: 'hidden md:table-cell',
	},
	{
		header: 'Doctor',
		key: 'doctor',
		className: 'hidden md:table-cell',
	},
	{
		header: 'Status',
		key: 'status',
		className: 'hidden xl:table-cell',
	},
	{
		header: 'Actions',
		key: 'action',
	},
]
export const RecentAppointments = ({ data }: DataProps) => {
	const renderRow = (item: Appointment) => {
		const name = `${item?.patient?.first_name} ${item?.patient?.last_name}`
		return (
			<tr
				className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
				key={item?.id}
			>
				<td className="flex items-center gap-2 2xl:gap-4 py-2 xl:py-4">
					<ProfileImage
						bgColor={item?.patient?.colorCode ?? undefined}
						className="bg-violet-600"
						name={name}
						url={item?.patient?.img ?? undefined}
					/>
					<div>
						<h3 className="text-sm md:text-base md:font-medium uppercase">{name}</h3>
						<span className="text-xs capitalize">{item?.patient?.gender?.toLowerCase()}</span>
					</div>
				</td>

				<td className="hidden md:table-cell">{format(item?.appointment_date, 'yyyy-MM-dd')}</td>
				<td className="hidden md:table-cell">{item?.time}</td>
				<td className="hidden md:table-cell items-center py-2">
					<div
						className="flex items-center gap-2 2x:gap-4
          "
					>
						<ProfileImage
							bgColor={item?.doctor?.colorCode ?? undefined}
							className="bg-blue-600"
							name={item?.doctor?.name}
							textClassName="text-black font-medium"
							url={item?.doctor?.img ?? undefined}
						/>
						<div>
							<h3 className="font-medium uppercase">{item?.doctor?.name}</h3>
							<span className="text-xs capitalize">{item?.doctor?.specialization}</span>
						</div>
					</div>
				</td>

				<td className="hidden xl:table-cell">
					<AppointmentStatusIndicator status={item?.status} />
				</td>

				<td>
					<div className="flex items-center gap-x-2">
						<ViewAppointment id={item?.id} />

						<Link href={`/record/appointments/${item?.id}`}>See all</Link>
					</div>
				</td>
			</tr>
		)
	}

	return (
		<div className="bg-white rounded-xl p-2 2xl:p-4">
			<div className="flex justify-between items-center">
				<h1 className="text-lg font-semibold">Recent Appointments</h1>

				<Button
					asChild
					variant={'outline'}
				>
					<Link href="/record/appointments">View All</Link>
				</Button>
			</div>

			<Table
				columns={columns}
				data={data}
				renderRow={renderRow}
			/>
		</div>
	)
}
