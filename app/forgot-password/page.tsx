import { ResetForm } from "./form"
import LoginBg from '@/app/login-bg.jpg'
import Image from "next/image"
import { Suspense } from 'react'
import Logo from "@/components/logo"

import { Metadata } from "next"

export const metadata: Metadata = {
	title: "Forgot Password",
	description: "Send reset password link to your email",
}

export default function LoginPage() {

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
					<div className="w-full max-w-xs">
						<Suspense>
							<ResetForm />
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
