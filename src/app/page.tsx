import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { getSessionServer } from '@/lib/auth/server'
import { getRole } from '@/utils/roles'

export default async function Home() {
	const session = await getSessionServer()
	const userId = session?.user.id ?? null
	const role = session?.user?.role?.toLowerCase() || 'patient'

	if (userId && role) {
		redirect(`/${role}`)
	}

	return (
		<div className="flex flex-col items-center justify-center h-screen p-6">
			<div className="flex-1 flex flex-col items-center justify-center">
				<div className="mb-8">
					<h1 className="text-4xl md:text-5xl font-bold text-center">
						Welcome to <br />
						<span className="text-blue-700 text-5xl md:text-6xl">Kinda HMS</span>
					</h1>
				</div>

				<div className="text-center max-w-xl flex flex-col items-center justify-center">
					<p className="mb-8">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse maxime quae numquam
						possimus dolor. Illum, ipsam laudantium. Reprehenderit
					</p>

					<div className="flex gap-4">
						{userId ? (
							<>
								<Link href={`/${role}`}>
									<Button>View Dashboard</Button>
								</Link>
							</>
						) : (
							<>
								<Link href="/sign-up">
									<Button className="md:text-base font-light">New Patient</Button>
								</Link>

								<Link href="/sign-in">
									<Button
										className="md:text-base underline hover:text-nlue-600"
										variant="outline"
									>
										Login to account
									</Button>
								</Link>
							</>
						)}
					</div>
				</div>
			</div>
			<footer className="mt-8">
				<p className="text-center text-sm">
					&copy; 2024 Kinda Hospital Management System. All rights reserved.
				</p>
			</footer>
		</div>
	)
}
