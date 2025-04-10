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
import { Input } from "@/components/ui/input"
import { fetchUsers, type User } from "./fetch"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { sendEmergency } from "./emergency"
import { toast } from "sonner"


export default function StudentRecords() {
	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(true)
	const searchParams = useSearchParams()
	const router = useRouter()

	useEffect(() => {
		const fetchData = async () => {
			const data = await fetchUsers(searchParams?.get('s') || '')
			setUsers(data)
			setLoading(false)
		}
		fetchData()
	}, [searchParams])

	return <div className="flex flex-col gap-3">
		<div className="flex items-center justify-between">
			<h1 className="text-2xl font-bold">Student Records</h1>
			<Input
				type="text"
				placeholder="Search the Student ID or Name"
				className="w-1/3"
				defaultValue={searchParams?.get('s') || ''}
				onKeyDown={async (e) => {
					if (e.key === 'Enter') {
						const input = e.currentTarget.value
						setLoading(true)
						const data = await fetchUsers(input)
						const params = new URLSearchParams(searchParams?.toString())
						if (input) {
							params.set('s', input)
						} else {
							params.delete('s')
						}
						router.push(`/clinic/student-records?${params.toString()}`)
						setUsers(data)
						setLoading(false)
					}
				}}
			/>
		</div>
		<Separator />
		<div className="max-h-[81dvh] flex flex-col gap-3 bg-secondary">
			<Table className="bg-secondary">
				<TableHeader className="sticky top-0 z-10 bg-secondary shadow">
					<TableRow>
						<TableHead className="w-2/12">Student ID</TableHead>
						<TableHead className="w-2/12">Last Name</TableHead>
						<TableHead className="w-5/12">First Name</TableHead>
						<TableHead className="w-2/12">Middle Name</TableHead>
						<TableHead className="w-1/12 text-right"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{
						loading ? (
							<TableRow>
								<TableCell colSpan={5} className="text-center">Loading...</TableCell>
							</TableRow>
						) : users.map((user) => (
							<TableRow key={'ur-' + user.userId} className="hover:bg-primary/15">
								<TableCell className="font-medium">{user.studentId}</TableCell>
								<TableCell>{user.lastName}</TableCell>
								<TableCell>{user.firstName}</TableCell>
								<TableCell>{user.middleName}</TableCell>
								<TableCell className="space-x-2">
									<Dialog>
										<DialogTrigger asChild>
											<Button
												variant="destructive"
												size="icon"
											>
												<ShieldAlert />
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Are you absolutely sure?</DialogTitle>
												<DialogDescription>
													This will alert the emergency contact of <strong>{user.firstName} {user.lastName}</strong>. This action cannot be undone.
												</DialogDescription>
												<DialogFooter>
													<DialogClose asChild>
														<Button
															variant="destructive"
															onClick={() => {
																sendEmergency(user.userId as unknown as string).then(() => {
																	toast.success("Emergency contact has been alerted")
																}).catch(() => {
																	toast.error("Failed to alert emergency contact")
																})
															}}
														>
															Yes, I&apos;m sure
														</Button>
													</DialogClose>
													<DialogClose asChild>
														<Button variant="outline">Cancel</Button>
													</DialogClose>
												</DialogFooter>
											</DialogHeader>
										</DialogContent>
									</Dialog>
									<Button variant="default" size="icon" asChild>
										<Link href={`/clinic/student-records/${user.userId}`}>
											<Eye />
										</Link>
									</Button>
								</TableCell>
							</TableRow>
						))
					}
				</TableBody>
			</Table>
		</div>
	</div >
}