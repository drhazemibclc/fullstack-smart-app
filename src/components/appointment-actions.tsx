import { auth } from '@clerk/nextjs/server'
import { EllipsisVertical, User } from 'lucide-react'
import Link from 'next/link'

import { checkRole } from '@/utils/roles'

import { AppointmentActionDialog } from './appointment-action-dialog'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

interface ActionsProps {
	userId: string
	status: string
	patientId: string
	doctorId: string
	appointmentId: number
}

export const AppointmentActionOptions = async ({
	userId,
	patientId,
	doctorId,
	status,
	appointmentId,
}: ActionsProps) => {
	const user = await auth()
	const isAdmin = await checkRole('ADMIN')

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					className="flex items-center justify-center rounded-full p-1"
					variant="outline"
				>
					<EllipsisVertical
						className="text-sm text-gray-500"
						size={16}
					/>
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-56 p-3">
				<div className="space-y-3 flex flex-col items-start">
					<span className="text-gray-400 text-xs">Perform Actions</span>
					<Button
						asChild
						className="w-full justify-start"
						size="sm"
						variant="ghost"
					>
						<Link href={`appointments/${appointmentId}`}>
							<User size={16} /> View Full Details
						</Link>
					</Button>

					{status !== 'SCHEDULED' && (
						<AppointmentActionDialog
							disabled={isAdmin || user.userId === doctorId}
							id={appointmentId}
							type="approve"
						/>
					)}
					<AppointmentActionDialog
						disabled={
							status === 'PENDING' &&
							(isAdmin || user.userId === doctorId || user.userId === patientId)
						}
						id={appointmentId}
						type="cancel"
					/>
				</div>
			</PopoverContent>
		</Popover>
	)
}
