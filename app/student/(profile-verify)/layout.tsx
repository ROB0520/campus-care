import { auth } from "@/lib/auth"
import { hasCompletedProfile } from "./checkCompleteProfile"
import { Hospital } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"


export default async function Layout({ children }: { children: React.ReactNode }) {
	const session = await auth()
	const completionData = await hasCompletedProfile(session?.user?.id as unknown as number)

	if (!completionData?.hasBasicInfo || !completionData?.hasHealthSurvey) return (
		<div className="flex items-center justify-center min-h-full">
			<div className="flex flex-col items-center justify-center gap-3 min-w-1/3 bg-secondary p-5 rounded-lg">
				<div className="bg-primary text-primary-foreground flex size-16 items-center justify-center rounded-lg">
					<Hospital className="size-14" strokeWidth={1.25} />
				</div>
				<h1 className="text-2xl font-bold text-center">
					Profile Completion Required
				</h1>
				<p className="text-sm text-center">
					Please complete your
					{
						(!completionData?.hasBasicInfo && !completionData?.hasHealthSurvey) &&
						" basic information and health survey "
					}
					{
						(!completionData?.hasBasicInfo && completionData?.hasHealthSurvey) &&
						" basic information "
					}
					{
						(!completionData?.hasHealthSurvey && completionData?.hasBasicInfo) &&
						" health survey "
					}
					before making an appointment.
				</p>
				<div className="flex flex-row items-center justify-center gap-3">
					{(!completionData?.hasBasicInfo) ?
						<Button
							variant="outline"
							asChild
						>
							<Link
								href='/student/personal-information/basic-information'
							>
								Basic Information
							</Link>
						</Button> : null
					}
					{(!completionData?.hasHealthSurvey) ?
						<Button
							variant="outline"
							asChild
						>
							<Link
								href='/student/health-survey/health-assessment'
							>
								Health Survey
							</Link>
						</Button> : null
					}
				</div>
			</div>
		</div>
	)

	return <>
		{children}
	</>
}