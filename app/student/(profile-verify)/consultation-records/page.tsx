/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { fetchConsultHistory, fetchUser, type ConsultHistory } from "./fetch"
import { useEffect, useState } from "react"
import moment from "moment-timezone"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { CircleUserRound } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function VisitHistory() {
	const searchParams = useSearchParams()
	const session = useSession()
	const [consultRecords, setConsultRecords] = useState<ConsultHistory[]>([])
	const [loading, setLoading] = useState(true)
	const [user, setUser] = useState<any>()


	useEffect(() => {
		const fetchData = async () => {
			if (session.data?.user?.id) {
				const userId = Number(session.data.user.id);
				if (!isNaN(userId)) {
					const data = await fetchConsultHistory(userId);
					const userData = await fetchUser(userId);

					setConsultRecords(data);
					setUser(userData);
					setLoading(false)
				} else {
					toast.error("Invalid user ID.");
				}
			} else {
				toast.error("Session data is not available.");
			}
		}
		fetchData()
	}, [searchParams, session.data?.user?.id])

	return <div className="flex flex-col gap-3">
		<div className="flex flex-row items-center justify-between">
			<div className="flex flex-row items-center gap-3 h-24">
				<CircleUserRound className="size-15" strokeWidth={1.25} />
				<div className="flex flex-col gap-2 min-w-80 ">
					{
						loading ?
							<Skeleton className="h-6 w-64" /> :
							<h1 className="text-2xl font-bold">
								{user?.fullName}
							</h1>
					}
					<div className="flex flex-row gap-2 justify-between h-3.5">
						{
							loading ? <>
								<Skeleton className="h-3.5 w-32" />
								<Skeleton className="h-3.5 w-24" />
							</>
								: <>
									<p className="text-sm text-muted-foreground">
										{user?.student_id}
									</p>
									<p className="text-sm text-muted-foreground">
										{user?.course_year}
									</p>
								</>

						}
					</div>
					{
						loading ?
							<Skeleton className="h-3.5 w-48" /> :
							<p className="text-sm text-muted-foreground">
								{user?.designation}
							</p>
					}


				</div>
			</div>
		</div>
		<div className="max-h-[80dvh] flex flex-col gap-3 bg-secondary p-5 rounded-lg">
			<h1 className="text-2xl font-bold text-left">Visit History</h1>
			<Separator />
			<Table className="bg-secondary overflow-x-scroll ">
				<TableHeader className="sticky top-0 z-10 bg-secondary">
					<TableRow>
						<TableHead>Date and Time</TableHead>
						<TableHead>Attending Personnel</TableHead>
						<TableHead>Reason for Visit</TableHead>
						<TableHead>Diagnosis / Observations</TableHead>
						<TableHead>Medication Given</TableHead>
						<TableHead className="max-w-2xl">Remarks / Follow-up</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{
						loading ? (
							<TableRow>
								<TableCell colSpan={6} className="text-center">Loading...</TableCell>
							</TableRow>
						) : consultRecords.map((record) => (
							<TableRow key={record.id} className="hover:bg-primary/15">
								<TableCell className="text-left">{moment.unix(record.consultation_timestamp).tz("Asia/Manila").format('MMMM DD, YYYY @ hh:mm A')}</TableCell>
								<TableCell className="text-left">
									{record.attendingPersonnelPosition ? (
										record.attendingPersonnelPosition === 0 ?
											'Dr.' : (
												record.attendingPersonnelPosition === 1 ?
													'Nurse' : null
											)
									) : null}
									&nbsp;
									{record.attendingPersonnelName}
								</TableCell>
								<TableCell className="text-left">
									<p className="whitespace-normal break-words w-max max-w-xl">
										{record.reason}
									</p>
								</TableCell>
								<TableCell className="text-left">
									<p className="whitespace-normal break-words w-max max-w-xl">
										{record.diagnosis}
									</p>
								</TableCell>
								<TableCell className="text-left">
									<p className="whitespace-normal break-words w-max max-w-xl">
										{record.medication}
									</p>
								</TableCell>
								<TableCell className="text-left">
									<p className="whitespace-normal break-words w-max max-w-xl">
										{record.remarks || "-"}
									</p>
								</TableCell>
							</TableRow>
						))
					}
				</TableBody>
			</Table>
		</div>
	</div>
}