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
import { Eye } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

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
							<TableCell className="font-medium">{user.student_id}</TableCell>
							<TableCell>{user.lastName}</TableCell>
							<TableCell>{user.firstName}</TableCell>
							<TableCell>{user.middleName}</TableCell>
							<TableCell>
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
}