'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlertIcon, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { GoogleLogo } from '@/components/icons';
import {AlertDismissable} from '@/components/ui/alert-dismissable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {SectionDivider} from '@/components/ui/section-divider'
import {Spinner} from '@/components/ui/spinner' // ✅ your custom loading spinner
import { ADMIN_ROLES } from '@/lib'
import { authClient } from '@/lib/auth/client'

const formSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1, {
		message: 'Password is required',
	}),
})

export default function SignIn() {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const [isPending, startTransition] = useTransition()
	const [showAlert, setShowAlert] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const loginWithGoogle = async () => {
		await authClient.signIn.social({
			provider: 'google',
			callbackURL: `${window.location.origin}/dashboard`,
			errorCallbackURL: '/sign-in?error=1',
		})
	}

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setLoading(true)
		authClient.signIn.email(
			{
				email: values.email,
				password: values.password,
			},
			{
				onSuccess: ({ data }) => {
					const role = data?.user?.role ?? ''
					toast.success('Login successful')

					if (ADMIN_ROLES.has(role)) {
						router.push('/admin')
					} else {
						router.push('/doctor')
					}
					setLoading(false)
				},
				onError: ctx => {
					setErrorMessage(ctx.error.message)
					setShowAlert(true)
					toast.error(ctx.error.message)
					setLoading(false)
				},
			},
		)
	}

	return (
		<div className="space-y-4">
			<Button
				className="relative h-10 w-full"
				disabled={isPending}
				onClick={() => startTransition(loginWithGoogle)}
				variant="outline"
			>
				{isPending ? (
					<Spinner className="mr-2 h-4.5 w-4.5" />
				) : (
					<GoogleLogo className="mr-2 h-4.5 w-4.5" />
				)}
				Continue with Google
			</Button>

			<SectionDivider className="text-muted-foreground">or</SectionDivider>

			<AlertDismissable
				className="mb-6"
				handleShow={setShowAlert}
				show={showAlert}
				variant="error"
			>
				<CircleAlertIcon
					className="h-5 w-5 mr-2"
					size={16}
				/>
				<span>{errorMessage}</span>
			</AlertDismissable>

			<Card className="p-8">
				<CardHeader className="px-0 pt-0">
					<CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
					<CardDescription className="text-xs md:text-sm">
						Enter your email below to log in to your account
					</CardDescription>
				</CardHeader>

				<CardContent className="px-0 pb-0">
					<Form {...form}>
						<form
							className="space-y-4"
							method="POST"
							onSubmit={form.handleSubmit(onSubmit)}
						>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input
												disabled={loading}
												placeholder="m@example.com"
												type="email"
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input
												disabled={loading}
 												placeholder="Password"
												type="password"
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>

							<Button
								className="w-full"
								disabled={loading}
								type="submit"
							>
								{loading ? (
									<>
										<Loader2 className="animate-spin mr-2 h-4 w-4" />
										Logging in
									</>
								) : (
									'Continue'
								)}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}
