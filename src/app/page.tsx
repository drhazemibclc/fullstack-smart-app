// app/page.tsx

// Lucide React icons used DIRECTLY in this file's JSX
import {
	ArrowRight, // Used for buttons
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation' // Assuming this resolves in your environment

// Custom Client Components for Animations and ASCII Art (ensure these paths are correct)
import AsciiHeader from '@/components/new/ascii' // Your AsciiHeader component
import { MotionDiv } from '@/components/new/motion-div' // Your MotionDiv component for Framer Motion
// UI Components (shadcn/ui)
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// Mock data for the clinic (ensure this path is correct and content is relevant)
// Authentication and role utilities (Server-side)
import { getSessionServer } from '@/lib/auth/server'
// Framer Motion animation variants (imported from a central file for reusability)
import { fadeInVariant, scaleUp } from '@/lib/variant'

import { clinicServices, featuresWhyChooseUs } from './mock'

// Main Home Page Component (Server Component)
export default async function HomePage() {
	// Fetch session data on the server
	const session = await getSessionServer()
	const userId = session?.user.id ?? null
	const role = session?.user?.role?.toLowerCase() || 'patient' // Default to 'patient' if no role

	// If user is logged in and has a role, redirect to their dashboard
	if (userId && role) {
		redirect(`/${role}`)
	}

	return (
		// Main container with gradient background and subtle effects
		<div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 p-6 dark:from-gray-950 dark:to-blue-950">
			{/* Background radial gradients for subtle visual depth */}
			<div className="absolute inset-0 z-0 opacity-20">
				<div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-blue-300 blur-[150px] dark:bg-indigo-800" />
				<div className="absolute bottom-0 left-1/4 h-[300px] w-[600px] rounded-full bg-purple-300 blur-[120px] dark:bg-purple-900" />
			</div>

			<main className="relative z-10 flex flex-col gap-y-16">
				{/* Hero Section: Welcome and Call to Action */}
				<section className="relative overflow-hidden py-24 md:py-32">
					{/* Subtle grid pattern background */}
					<div className="absolute inset-0 bg-grid-black/[0.02] bg-[length:20px_20px]" />
					<div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
							{/* Hero Text Content: Title, Description, and Auth Buttons */}
							<div className="flex flex-col justify-center space-y-6">
								<MotionDiv
									animate="visible"
									className="space-y-4"
									initial="hidden"
									transition={{ delay: 0.2 }}
									variants={fadeInVariant}
								>
									{/* ASCII Header for unique brand identity */}
									<div className="mb-4 max-w-full overflow-hidden text-center lg:text-left">
										<AsciiHeader />
									</div>

									{/* Main Heading with gradient text */}
									<h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:leading-[1.1] dark:text-white">
										Compassionate Care for{' '}
										<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
											Your Little Ones
										</span>
									</h1>
									{/* Sub-heading/description */}
									<p className="max-w-[700px] text-lg text-gray-700 md:text-xl dark:text-gray-300">
										At Smart Clinic, we combine expert pediatric care with a child-friendly
										environment to ensure the healthy growth and well-being of every child.
									</p>
								</MotionDiv>

								{/* Call to Action Buttons: Conditional based on user session */}
								<MotionDiv
									animate="visible"
									className="flex flex-col gap-3 sm:flex-row"
									initial="hidden"
									transition={{ delay: 0.6 }}
									variants={fadeInVariant}
								>
									{userId ? (
										// If user is logged in, show dashboard button
										<Link
											href={`/${role}`}
											passHref
										>
											<Button
												className="h-12 px-8 text-base"
												size="lg"
											>
												View Dashboard
											</Button>
										</Link>
									) : (
										// If not logged in, show sign-up and login buttons
										<>
											<Link
												href="/sign-up"
												passHref
											>
												<Button
													className="h-12 px-8 text-base"
													size="lg"
												>
													New Patient Sign Up
												</Button>
											</Link>
											<Link
												href="/sign-in"
												passHref
											>
												<Button
													className="h-12 px-8 text-base border-blue-400 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/20"
													size="lg"
													variant="outline"
												>
													Login to Account
												</Button>
											</Link>
										</>
									)}
								</MotionDiv>
							</div>

							{/* Hero Image: Visual representation of the clinic */}
							<MotionDiv
								animate="visible"
								className="relative mx-auto hidden aspect-square w-full max-w-md overflow-hidden rounded-xl border shadow-lg lg:block"
								initial="hidden"
								transition={{ delay: 0.8 }}
								variants={scaleUp}
							>
								{/* Overlay gradient for stylistic effect */}
								<div className="absolute inset-0 z-10 bg-gradient-to-tr from-blue-500/20 via-transparent to-transparent" />
								<Image
									alt="Child friendly clinic environment"
									className="object-cover"
									fill
									priority
									quality={85}
									sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // serve from public/images/
									src="/images/clinic.webp"
								/>
							</MotionDiv>
						</div>
					</div>
					{/* Decorative bottom border for hero section */}
					<div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
				</section>

				{/* Our Services Section: Highlight key medical services */}
				<section className="py-12 md:py-16 bg-white dark:bg-gray-900">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<MotionDiv
							animate="visible"
							className="mb-8 flex flex-col items-center text-center"
							initial="hidden"
							transition={{ delay: 0.2 }}
							variants={fadeInVariant}
						>
							<h2 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl text-gray-900 dark:text-white">
								Our Dedicated Services
							</h2>
							<div className="mt-2 h-1 w-12 rounded-full bg-blue-600" />
							<p className="mt-4 max-w-2xl text-center text-gray-700 dark:text-gray-300">
								Comprehensive care designed for every stage of your child's growth.
							</p>
						</MotionDiv>
						<MotionDiv
							animate="visible"
							className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
							initial="hidden"
							variants={{
								visible: {
									opacity: 1,
									transition: {
										when: 'beforeChildren',
										staggerChildren: 0.15,
									},
								},
								hidden: { opacity: 0 },
							}}
						>
							{clinicServices.map((service, index) => (
								<MotionDiv
									className="group flex flex-col items-center text-center p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all duration-300 dark:bg-gray-800 dark:border-gray-700"
									key={service.title}
									transition={{ delay: 0.1 * index }}
									variants={fadeInVariant}
								>
									<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
										{service.icon}
									</div>
									<h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
										{service.title}
									</h3>
									<p className="text-gray-600 dark:text-gray-400">{service.description}</p>
									<Link
										className="mt-4 flex items-center justify-center gap-1 text-blue-600 hover:underline"
										href={service.link}
										passHref
									>
										Learn More <ArrowRight className="h-4 w-4" />
									</Link>
								</MotionDiv>
							))}
						</MotionDiv>
					</div>
				</section>
				{/* Why Choose Us Section: Features and benefits */}
				<section
					className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 py-12 md:py-16"
					id="features"
				>
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						{/* Section Heading */}
						<MotionDiv
							animate="visible"
							className="mb-8 flex flex-col items-center text-center"
							initial="hidden"
							transition={{ delay: 0.2 }}
							variants={fadeInVariant}
						>
							<h2 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
								Why Parents Choose Smart Clinic
							</h2>
							<div className="mt-2 h-1 w-12 rounded-full bg-purple-600" />
							<p className="mt-4 max-w-2xl text-center text-gray-700 dark:text-gray-300 md:text-lg">
								We are dedicated to providing the highest standard of pediatric care.
							</p>
						</MotionDiv>

						{/* Features Grid with individual item animations */}
						<MotionDiv
							animate="visible"
							className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
							initial="hidden"
							variants={{
								visible: {
									opacity: 1,
									transition: {
										when: 'beforeChildren',
										staggerChildren: 0.1,
									},
								},
								hidden: { opacity: 0 },
							}}
						>
							{featuresWhyChooseUs.map(feature => (
								<MotionDiv
									key={feature.title}
									transition={{ delay: 0.1, duration: 0.8 }}
									variants={fadeInVariant} // Stagger delay based on index
								>
									<Card className="rounded-2xl border bg-background shadow transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
										<CardHeader className="pb-2">
											{/* Feature Icon */}
											<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
												{feature.icon}
											</div>
											{/* Feature Title */}
											<CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
												{feature.title}
											</CardTitle>
										</CardHeader>
										<CardContent>
											{/* Feature Description */}
											<CardDescription className="text-base text-gray-600 dark:text-gray-400">
												{feature.description}
											</CardDescription>
										</CardContent>
									</Card>
								</MotionDiv>
							))}
						</MotionDiv>
					</div>
				</section>

				{/* Call to Action Section: Final push for booking appointment */}
				<section className="py-12 md:py-16">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<MotionDiv
							animate="visible"
							className="relative overflow-hidden rounded-xl bg-blue-600 p-8 shadow-lg md:p-12"
							initial="hidden"
							transition={{ delay: 0.2 }}
							variants={scaleUp}
						>
							{/* Background grid pattern */}
							<div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]" />
							<div className="relative z-10 mx-auto max-w-2xl text-center">
								<h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
									Ready to Prioritize Your Child's Health?
								</h2>
								<p className="mt-4 text-lg text-blue-100 md:text-xl">
									Book an appointment today and experience the Smart Clinic difference. Our team is
									ready to welcome your family with warmth and expertise.
								</p>
								{/* CTA Buttons */}
								<div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
									<Link
										href="/book-appointment"
										passHref
									>
										<Button
											className="h-12 px-8 text-base bg-white text-blue-700 hover:bg-gray-100 dark:bg-gray-100 dark:text-blue-800 dark:hover:bg-gray-200"
											size="lg"
										>
											Book an Appointment <ArrowRight className="ml-2 h-4 w-4" />
										</Button>
									</Link>
									<Link
										href="/contact"
										passHref
									>
										<Button
											className="h-12 px-8 text-base border-white text-white hover:bg-white/10"
											size="lg"
											variant="outline"
										>
											Contact Us
										</Button>
									</Link>
								</div>
							</div>
						</MotionDiv>
					</div>
				</section>
			</main>

			{/* Footer */}
			<footer className="relative z-10 mt-16 pb-4">
				<MotionDiv
					animate={{ opacity: 1 }}
					initial={{ opacity: 0 }}
					transition={{ delay: 1, duration: 0.5 }}
					variants={fadeInVariant}
				>
					<p className="text-center text-sm text-gray-600 dark:text-gray-400">
						&copy; {new Date().getFullYear()} Smart Clinic. All rights reserved.
					</p>
				</MotionDiv>
			</footer>
		</div>
	)
}
