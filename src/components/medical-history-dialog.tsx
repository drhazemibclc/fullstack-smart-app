import type React from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

interface DataProps {
	id: string | number
	patientId: string
	medicalId?: string
	doctor_id: string | number
	label: React.ReactNode
}
export const MedicalHistoryDialog = async ({ id, patientId, doctor_id, label }: DataProps) => {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					className="flex items-center justify-center rounded-full bg-blue-600/10 hover:underline text-blue-600 px-1.5 py-1 text-xs md:text-sm"
					variant="outline"
				>
					{label}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90%] max-w-[425px] md:max-w-2xl 2xl:max-w-4xl p-8 overflow-y-auto">
				{/* <DiagnosisContainer
          id={id}
          patientId={patientId!}
          doctor_id={doctor_id!}
        /> */}

				<p>Diagnosis container form</p>
			</DialogContent>
		</Dialog>
	)
}
