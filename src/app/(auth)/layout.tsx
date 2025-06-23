import Image from 'next/image'
import { redirect } from 'next/navigation'
import type React from 'react'

import { getSessionServer } from '@/lib/auth/server' // ← Import directly
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic'

interface AuthLayoutProps {
	children: React.ReactNode
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
	const session = await getSessionServer(await headers()) // ✅ DIRECT, bypass tRPC

	if (session) {
		redirect('/doctor')
	}
	return (
		<div className="w-full h-screen flex items-center justify-center">
			<div className="w-1/2 h-full flex items-center justify-center">{children}</div>
			<div className="hidden md:flex w-1/2 h-full relative">
				<Image
					alt="Doctors"
					className="w-full h-full object-cover"
					height={1000}
					src="https://images.pexels.com/photos/6129437/pexels-photo-6129437.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
					width={1000}
				/>
				<div className="absolute top-0 w-full h-full bg-black bg-opacity-40 z-10 flex flex-col items-center justify-center">
					<h1 className="text-3xl 2xl:text-5xl font-bold text-white">Kinda HMS</h1>
					<p className="text-blue-500 text-base">You're welcome</p>
				</div>
			</div>
		</div>
	)
}
