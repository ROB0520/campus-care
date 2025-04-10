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
import { useEffect, useRef, useState } from "react"
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
import { sendResetEmail, toggleLock, inviteUser } from "./account"
import { useSession } from "next-auth/react"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"


export default function StudentRecords() {
	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(true)
	const searchParams = useSearchParams()
	const router = useRouter()
	const session = useSession()
	const emailRef = useRef<HTMLInputElement>(null)
	const [role, setRole] = useState<string>('')

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
			<div className="flex items-center flex-row gap-2 w-1/2">
				<Dialog>
					<DialogTrigger asChild>
						<Button
							variant="default"
						>
							Invite User
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px]">
						<DialogHeader>
							<DialogTitle>
								Invite User
							</DialogTitle>
							<DialogDescription>
								Invite a new user to the system. This will create a new account and send an email to the user with the credentials to log in.
							</DialogDescription>
						</DialogHeader>
						<div className="flex flex-col gap-2">
							<Label htmlFor="email" className="text-sm font-medium leading-none peer">
								Email Address
							</Label>
							<Input
								type="email"
								id="email"
								placeholder="Email Address"
								className="w-full"
								ref={emailRef}
							/>
							<Label htmlFor="role" className="text-sm font-medium leading-none peer">
								Role
							</Label>
							<Select
								onValueChange={(value) => {
									setRole(value)
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a Role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="0">Student</SelectItem>
									<SelectItem value="1">Clinic Personnel</SelectItem>
									<SelectItem value="2">Admin</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button
									variant="default"
									onClick={() => {
										if (emailRef.current?.value) {
											const email = emailRef.current.value
											const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
											if (emailRegex.test(email)) {
												if (role.length > 0) {
													inviteUser(email, role).then(() => {
														toast.success(`Invitation sent to ${email}`)
														fetchUsers(searchParams?.get('s') || '').then((data) => {
															setUsers(data)
															setRole('')
														})
													}).catch((error) => {
														toast.error(error.message)
														setRole('')
													})
												} else {
													toast.error('Please select a role')
													setRole('')
												}
											} else {
												toast.error('Please enter a valid email address')
												setRole('')
											}
										} else {
											toast.error('Please enter a valid email address')
											setRole('')
										}
									}}
								>
									Send Invitation
								</Button>
							</DialogClose>
						</DialogFooter>
					</DialogContent>
				</Dialog>
				<Input
					type="text"
					placeholder="Search the User ID or Name"
					className="w-full"
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
								<TableCell>{user.lastName || <Badge variant='destructive'>N/A</Badge>}</TableCell>
								<TableCell>{user.firstName || <Badge variant='destructive'>N/A</Badge>}</TableCell>
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