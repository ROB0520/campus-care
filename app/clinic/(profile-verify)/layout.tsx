import { auth } from "@/lib/auth"
import { hasCompletedClinicProfile } from "./checkCompleteProfile"
import { Hospital } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"


export default async function Layout({ children }: { children: React.ReactNode }) {
	const session = await auth()
	const completionData = await hasCompletedClinicProfile(session?.user?.id as unknown as number)

	if (!completionData) return (
		<div className="flex items-center justify-center min-h-full">
			<div className="flex flex-col items-center justify-center gap-3 min-w-1/3 bg-secondary p-5 rounded-lg">
				<div className="bg-primary text-primary-foreground flex size-16 items-center justify-center rounded-lg">
					<Hospital className="size-14" strokeWidth={1.25} />
				</div>
				<h1 className="text-2xl font-bold text-center">
					Profile Completion Required
				</h1>
				<p className="text-sm text-center">
					Please set your name before accessing this page.
				</p>
				<div className="flex flex-row items-center justify-center gap-3">
					<Button
						variant="default"
						asChild
					>
						<Link
							href='/clinic/profile'
						>
							Basic Information
						</Link>
					</Button>
				</div>
			</div>
		</div>
	)

	return <>
		{children}
	</>
}