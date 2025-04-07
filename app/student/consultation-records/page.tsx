'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { fetchUser } from "./fetch";
import { useSession } from "next-auth/react";
import { CircleUserRound, FolderClock, Hospital, Paperclip } from "lucide-react";
import Link from "next/link";
import { hasCompletedProfile } from "../checkCompleteProfile";

export default function ConsultationRecords() {
	const { data: session } = useSession()
	const [user, setUser] = useState<any>();
	const [completionData, setCompletionData] = useState<any>(null)

	useEffect(() => {
		const fetchData = async () => {
			if (session?.user?.id) {
				const data = await fetchUser(Number(session?.user?.id))
				setUser(data)
				setCompletionData((await hasCompletedProfile(Number(session?.user?.id))))
			}
		}
		fetchData()
	}, [session?.user?.id])

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
						(!completionData?.hasBasicInfo && !completionData?.hasHealthSurvey) ?
							" basic information and health survey " : (
								(!completionData?.hasBasicInfo) ? " basic information " : " health survey "
							)
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

	return <div className="flex flex-col gap-12">
		<div className="flex flex-row items-center gap-3">
			<CircleUserRound className="size-15" strokeWidth={1.25} />
			<div className="flex flex-col gap-1 min-w-80">
				<h1 className="text-2xl font-bold">{user?.fullName}</h1>
				<div className="flex flex-row gap-2 justify-between">
					<p className="text-sm text-muted-foreground">{user?.student_id}</p>
					<p className="text-sm text-muted-foreground">{user?.course_year}</p>
				</div>
				<p className="text-sm text-muted-foreground">{user?.designation}</p>
			</div>
		</div>
		<div className='grid grid-cols-2 grid-rows-[auto_auto_auto_auto] w-fit gap-x-5 gap-y-3 *:w-full *:bg-secondary *:p-5 *:rounded-lg *:items-center *:grid *:grid-rows-subgrid *:row-span-4 **:mx-auto **:text-center'>
			<div>
				<FolderClock className="size-15" strokeWidth={1.25} />
				<h1 className="text-2xl font-bold text-center">Visit History</h1>
				<p className="text-sm text-muted-foreground">View your consultation records.</p>
				<Button asChild>
					<Link href="/student/consultation-records/visit-history">View</Link>
				</Button>
			</div>
			<div>
				<Paperclip className="size-15" strokeWidth={1.25} />
				<h1 className="text-2xl font-bold text-center">Lab Reports & Attachments</h1>
				<p className="text-sm text-muted-foreground">View your lab reports and attachments.</p>
				<Button asChild disabled className="cursor-not-allowed bg-zinc-700 hover:bg-zinc-700 text-zinc-50">
					<p>
						Coming Soon
					</p>
					{/* <Link href="/student/consultation-records/visit-history">View</Link> */}
				</Button>
			</div>
		</div>
	</div>
}