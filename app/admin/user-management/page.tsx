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
import { Lock, LockOpen, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"
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
import { toast } from "sonner"
import { sendResetEmail, toggleLock } from "./account"
import { useSession } from "next-auth/react"

export default function StudentRecords() {
	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(true)
	const searchParams = useSearchParams()
	const router = useRouter()
	const session = useSession()

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
			<h1 className="text-2xl font-bold">User Accounts</h1>
			<Input
				type="text"
				placeholder="Search the User ID or Name"
				className="w-1/3"
				defaultValue={searchParams?.get('s') || ''}
				disabled={loading}
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
						router.push(`/admin/user-management?${params.toString()}`)
						setUsers(data)
						setLoading(false)
					}
				}}
			/>
		</div>
		<Separator />
		<div className="max-h-[80dvh] flex flex-col gap-3 bg-secondary">
			<Table className="bg-secondary">
				<TableHeader className="sticky top-0 z-10 bg-secondary shadow">
					<TableRow>
						<TableHead className="w-2/12">User ID</TableHead>
						<TableHead className="w-2/12">Last Name</TableHead>
						<TableHead className="w-3/12">First Name</TableHead>
						<TableHead className="w-2/12">Email Address</TableHead>
						<TableHead className="w-2/12 text-center">Role</TableHead>
						<TableHead className="w-1/12 text-right"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{
						loading ? (
							<TableRow>
								<TableCell colSpan={6} className="text-center">Loading...</TableCell>
							</TableRow>
						) : users.map((user) => (
							<TableRow key={'ur-' + user.userId} className="hover:bg-primary/15">
								<TableCell className="font-medium">{user.userId}</TableCell>
								<TableCell>{user.lastName}</TableCell>
								<TableCell>{user.firstName}</TableCell>
								<TableCell>
									<Link
										href={`mailto:${user.email}`}
										className="text-primary underline underline-offset-2"
									>
										{user.email}
									</Link>
								</TableCell>
								<TableCell className="text-center">
									{
										user.role == 0 &&
										<Badge
											variant={user.isLocked ? 'destructive' : 'default'}
										>
											Student
											{
												user.isLocked ?
													' - Locked' : ''
											}
										</Badge>
									}
									{
										user.role == 1 &&
										<Badge
											variant="default"
											className={cn(
												user.isLocked ? 'bg-destructive' : 'bg-green-600',
											)}
										>
											Clinic -&nbsp;
											{
												Number(user?.position) == 0 ? 'Nurse' :
													Number(user?.position) == 1 ? 'Doctor' :
														'Unknown'
											}
											{
												user.isLocked ?
													' - Locked' : ''
											}
										</Badge>
									}
									{
										user.role == 2 &&
										<Badge
											variant="default"
											className={cn(
												user.isLocked ? 'bg-destructive' : 'bg-amber-600',
											)}
										>
											Admin
											{
												user.isLocked ?
													' - Locked' : ''
											}
										</Badge>
									}
								</TableCell>
								<TableCell className="flex flex-row gap-2 justify-end">
									<HoverCard>
										<HoverCardTrigger>
											<Dialog>
												<DialogTrigger asChild>
													<Button
														variant="default"
														size='icon'
														disabled={user.isLocked}
													>
														<RotateCcw />
													</Button>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Are you absolutely sure?</DialogTitle>
														<DialogDescription>
															Are you sure you want to reset the password for <strong>{user.firstName} {user.lastName}</strong>? This will send a link to their email address to reset their password.
														</DialogDescription>
													</DialogHeader>
													<DialogFooter>
														<DialogClose asChild>
															<Button
																variant="destructive"
																onClick={() => {
																	sendResetEmail(String(user.email)).then(() => {
																		toast.success(`Reset password email sent to ${user.email}`)
																	})
																		.catch((error) => {
																			toast.error(error.message)
																		})
																}}
															>
																Send Reset Password Email
															</Button>
														</DialogClose>
													</DialogFooter>
												</DialogContent>
											</Dialog>
										</HoverCardTrigger>
										<HoverCardContent align='end' className="p-2 w-fit" sideOffset={10}>
											Reset Password
										</HoverCardContent>
									</HoverCard>
									<HoverCard>
										<HoverCardTrigger>
											<Dialog>
												<DialogTrigger asChild>
													<Button
														variant="destructive"
														size='icon'
													>
														{
															!user.isLocked ? <Lock /> : <LockOpen />
														}
													</Button>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Are you absolutely sure?</DialogTitle>
														<DialogDescription>
															Are you sure you want to <strong>{!user.isLocked ? 'lock' : 'unlock'}</strong> the account of <strong>{user.firstName} {user.lastName}</strong>? {!user.isLocked ? 'This will prevent them from logging in.' : 'This will allow them to log in again.'}
														</DialogDescription>
													</DialogHeader>
													<DialogFooter>
														<DialogClose asChild>
															<Button
																variant="destructive"
																onClick={() => {
																	if (String(user.userId) === session.data?.user?.id) {
																		toast.error("You cannot lock your own account.")
																		return
																	}
																	toggleLock(String(user.userId)).then(() => {
																		toast.success(`Account ${user.isLocked ? 'unlocked' : 'locked'} successfully`)
																		fetchUsers(searchParams?.get('s') || '').then((data) => {
																			setUsers(data)
																		})
																	}).catch((error) => {
																		toast.error(error.message)
																	})
																}}
															>
																{
																	user.isLocked ? 'Unlock' : 'Lock'
																}
															</Button>
														</DialogClose>
													</DialogFooter>
												</DialogContent>
											</Dialog>
										</HoverCardTrigger>
										<HoverCardContent align='end' className="p-2 w-fit" sideOffset={10}>
											{
												user.isLocked ? 'Unlock' : 'Lock'
											}
											&nbsp;
											{
												user.role == 0 ? 'Account' :
													user.role == 1 ? 'Clinic Account' :
														'Admin Account'
											}
										</HoverCardContent>
									</HoverCard>
								</TableCell>
							</TableRow>
						))
					}
				</TableBody>
			</Table>
		</div>
	</div >
}