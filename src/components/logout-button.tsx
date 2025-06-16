'use client'

import { useClerk } from '@clerk/nextjs'
import { LogOut } from 'lucide-react'

import { Button } from './ui/button'

export const LogoutButton = () => {
	const { signOut } = useClerk()
	return (
		<Button
			className="w-fit bottom-0 gap-2 px-0 md:px-4"
			onClick={() => signOut({ redirectUrl: '/sign-in' })}
			variant={'outline-solid'}
		>
			<LogOut />
			<span className="hidden lg:block">Logout</span>
		</Button>
	)
}
