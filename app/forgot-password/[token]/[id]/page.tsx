import { verifyResetToken } from "@/app/forgot-password/reset-password"
import { notFound } from 'next/navigation'
import ResetForm from "./form"
import { Suspense } from "react"
import Logo from "@/components/logo"
import Image from "next/image"
import LoginBg from '@/app/login-bg.jpg'

import { Metadata } from "next"

export const metadata: Metadata = {
	title: "Forgot Password",
	description: "Reset Password to your account",
}


export default async function ResetPasswordPage({
	params,
}: {
	params: Promise<{ token: string, id: string }>
}) {
	const { token, id: userId } = await params

	if (!token || !userId) {
		notFound()
	}

	await verifyResetToken(token, userId)
		.catch(() => {
			notFound()
		})

	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<a href="#" className="flex items-center gap-2 font-medium">
						<div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
							<Logo className="size-4 fill-white" />
						</div>
						Campus Care
					</a>
				</div>
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-xs space-y-6">
						<div className="flex flex-col items-center gap-2 text-center">
							<h1 className="text-2xl font-bold">Reset your Password</h1>
							<p className="text-muted-foreground text-sm text-balance">
								Please enter your new password below.
							</p>
						</div>
						<Suspense>
							<ResetForm token={token} userId={userId} />
						</Suspense>
					</div>
				</div>
			</div>
			<div className="bg-muted relative hidden lg:block">
				<Image
					src={LoginBg}
					alt="Login Background"
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>
		</div>
	)
}