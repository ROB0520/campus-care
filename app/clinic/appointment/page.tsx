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
import { fetchAppointments, type Appointment } from "./fetch"
import { useEffect, useId, useState } from "react"
import moment from "moment-timezone"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card"
import { CalendarCheck2, CalendarSync, CalendarIcon, CalendarX2, CircleCheck, ClockIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Label } from "@/components/ui/label"
import { rescheduleAppointment } from "./reschedule"
import { toast } from "sonner"
import { setStatus } from "./status"
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from "@/components/ui/badge"



export default function AppointmentPage() {
	const [appointments, setAppointments] = useState<Appointment[]>([])
	const [loading, setLoading] = useState(true)
	const searchParams = useSearchParams()
	const router = useRouter()

	useEffect(() => {
		fetchData()
	}, [])

	// eslint-disable-next-line react-hooks/exhaustive-deps
	async function fetchData() {
		setLoading(true)
		const data = await fetchAppointments(searchParams?.get('s') || '')
		setAppointments(data)
		setLoading(false)
	}

	function ApproveButton({ appointmentId }: { appointmentId: number }) {
		const handleAccept = async () => {
			await setStatus(appointmentId, 'approved')
			toast.success("Appointment Approved")
			await fetchData()
		}

		return <HoverCard>
			<HoverCardTrigger>
				<Button
					variant="default"
					size='icon'
					onClick={handleAccept}
				>
					<CalendarCheck2 />
				</Button>
			</HoverCardTrigger>
			<HoverCardContent align='end' className="p-2 w-fit" sideOffset={10}>
				Approve Appointment
			</HoverCardContent>
		</HoverCard>
	}

	function CompleteButton({ appointmentId }: { appointmentId: number }) {
		const handleComplete = async () => {
			await setStatus(appointmentId, 'completed')
			toast.success("Appointment Completed")
			await fetchData()
		}

		return <HoverCard>
			<HoverCardTrigger>
				<Button
					variant="default"
					size='icon'
					className="bg-green-700 text-white hover:bg-green-700/90"
					onClick={handleComplete}
				>
					<CircleCheck />
				</Button>
			</HoverCardTrigger>
			<HoverCardContent align='end' className="p-2 w-fit" sideOffset={10}>
				Complete Appointment
			</HoverCardContent>
		</HoverCard>
	}

	function CancelButton({ appointmentId }: { appointmentId: number }) {
		const handleCancel = async () => {
			await setStatus(appointmentId, 'cancelled')
			toast.success("Appointment Cancelled")
			await fetchData()
		}

		return <HoverCard>
			<HoverCardTrigger>
				<Button
					variant="destructive"
					size='icon'
					onClick={handleCancel}
				>
					<CalendarX2 />
				</Button>
			</HoverCardTrigger>
			<HoverCardContent align='end' className="p-2 w-fit" sideOffset={10}>
				Cancel Appointment
			</HoverCardContent>
		</HoverCard>
	}

	function RescheduleButton({ appointmentId, originalTimestamp }: { appointmentId: number, originalTimestamp: number }) {
		return <Popover modal={true}>
			<HoverCard>
				<HoverCardTrigger>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							size='icon'
						>
							<CalendarSync />
						</Button>
					</PopoverTrigger>
				</HoverCardTrigger>
				<HoverCardContent align='end' className="p-2 w-fit" sideOffset={10}>
					Reschedule Appointment
				</HoverCardContent>
			</HoverCard>
			<PopoverContent collisionPadding={20} className="min-w-96">
				<RescheduleForm appointmentId={appointmentId} originalTimestamp={originalTimestamp} />
			</PopoverContent>
		</Popover>
	}

	function RescheduleForm({ appointmentId, originalTimestamp }: { appointmentId: number, originalTimestamp: number }): React.ReactNode {
		const id = useId()
		const [date, setDate] = useState<Date | undefined>(() => {
			const initialDate = new Date(originalTimestamp * 1000); // Convert to milliseconds 
			if (initialDate.getDay() === 0) {
				// If Sunday, push to Monday
				initialDate.setDate(initialDate.getDate() + 1);
			} else if (initialDate.getDay() === 6) {
				// If Saturday, push to Monday
				initialDate.setDate(initialDate.getDate() + 2);
			}
			
			if (initialDate.toDateString() === new Date().toDateString()) {
				const now = new Date();
				initialDate.setHours(now.getHours());
				initialDate.setMinutes(now.getMinutes() + 15);

				if (initialDate.getHours() < 8) {
					initialDate.setHours(8);
					initialDate.setMinutes(0);
				} else if (initialDate.getHours() >= 18) {
					initialDate.setHours(18);
					initialDate.setMinutes(0);
				}
			}

			return initialDate;
		});

		const updateDateOrTime = (originalDate: Date, newDate?: Date, newTime?: string): Date => {
			const updatedDate = new Date(originalDate);

			if (newDate) {
				updatedDate.setFullYear(newDate.getFullYear());
				updatedDate.setMonth(newDate.getMonth());
				updatedDate.setDate(newDate.getDate());
			}

			if (newTime) {
				const [hours, minutes] = newTime.split(":").map(Number);
				updatedDate.setHours(hours);
				updatedDate.setMinutes(minutes);
			}

			return updatedDate;
		};

		const submitUpdate = async () => {
			if (!date) return;
			const timestamp = Math.floor(date.getTime() / 1000);

			await rescheduleAppointment(appointmentId, timestamp)
			toast.success("Appointment Rescheduled")
			await fetchData()
		}

		return <div>
			<div className="flex flex-col gap-2">
				<h1 className="text-lg font-semibold">Reschedule Appointment</h1>
				<p className="text-sm text-muted-foreground">Select a new date and time for the appointment.</p>

				<div className="flex items-center justify-between">
					<label htmlFor="date" className="text-sm font-medium">Date & Time</label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant={"outline"}
								className={cn(
									"w-64 pl-3 text-left font-normal",
									!date && "text-muted-foreground"
								)}
							>
								{date ? (
									format(date, "PPP, p")
								) : (
									<span>Pick a date</span>
								)}
								<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-3" align="end">
							<div>
								<Calendar
									mode="single"
									selected={date}
									onSelect={(newDate) => {
										const now = new Date();
										const selectedDate = updateDateOrTime(date || new Date(), newDate, undefined);
										if (selectedDate < now) {
											toast.error("Selected date and time cannot be in the past.");
											return;
										}
										setDate(selectedDate);
									}}
									disabled={(date) =>
										date < new Date(new Date().setDate(new Date().getDate() - 1))
										|| date.getDay() === 0
									}
								/>
								<div className="border-t pt-3">
									<div className="flex items-center gap-3">
										<Label htmlFor={id} className="text-xs">
											Enter time
										</Label>
										<div className="relative grow">
											<Input
												id={id}
												type="time"
												step="60"
												onChange={(e) => {
													const [hour, minute] = e.target.value.split(":");
													const now = new Date();
													const currentHour = now.getHours();
													const currentMinute = now.getMinutes();

													if (date?.toDateString() === now.toDateString()) {
														if (parseInt(hour) < currentHour || (parseInt(hour) === currentHour && parseInt(minute) <= currentMinute)) {
															const oldValue = date ? moment(date).format("HH:mm") : undefined;
															e.target.value = oldValue || "";
															toast.error("Selected time must be at least 15 ahead from now.");
															return;
														}
													}

													if (parseInt(hour) < 8 || parseInt(hour) > 18 || (parseInt(hour) === 18 && parseInt(minute) > 0)) {
														toast.error("Selected time must be between 8:00 AM and 6:00 PM.");
														const oldValue = date ? moment(date).format("HH:mm") : undefined;
														e.target.value = oldValue || "";
														return;
													}

													const selectedDate = updateDateOrTime(date || new Date(), undefined, e.target.value);

													setDate(selectedDate);
												}}
												defaultValue={date ? moment(date).format('HH:mm') : undefined}
												className="peer appearance-none ps-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
											/>
											<div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
												<ClockIcon size={16} aria-hidden="true" />
											</div>
										</div>
									</div>
								</div>
							</div>
						</PopoverContent>
					</Popover>
				</div>
			</div>
			<div className="flex items-center justify-end gap-2 mt-4">
				<Button variant="default" size="sm" onClick={submitUpdate}>Reschedule</Button>
			</div>
		</div>
	}

	return <div className="flex flex-col gap-3">
		<div className="flex items-center justify-between">
			<h1 className="text-2xl font-bold">Appointment Schedule</h1>
			<Input
				type="text"
				placeholder="Search the Student ID or Name"
				className="w-1/3"
				defaultValue={searchParams?.get('s') || ''}
				disabled={loading}
				onKeyDown={async (e) => {
					if (e.key === 'Enter') {
						const input = e.currentTarget.value
						setLoading(true)
						const params = new URLSearchParams(searchParams?.toString())
						if (input) {
							params.set('s', input)
						} else {
							params.delete('s')
						}
						router.push(`/clinic/appointment?${params.toString()}`)
						const data = await fetchAppointments(input)
						setAppointments(data)
						setLoading(false)
					}
				}}
			/>
		</div>
		<Separator />
		<Table className="bg-secondary flex-grow">
			<TableHeader className="sticky top-0 z-10 bg-secondary">
				<TableRow>
					<TableHead className="w-2/12">Student ID</TableHead>
					<TableHead className="w-3/12">Name</TableHead>
					<TableHead className="w-1/12">Contact Number</TableHead>
					<TableHead className="w-4/12 text-right">Date & Time</TableHead>
					<TableHead className="w-1/12 text-center">Status</TableHead>
					<TableHead className="w-1/12 text-right"></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{
					loading ? (
						<TableRow>
							<TableCell colSpan={5} className="text-center">Loading...</TableCell>
						</TableRow>
					) : appointments.map((appointment) => (
						<TableRow key={appointment.id} className={
							cn(
								"hover:bg-primary/15",
								appointment.status === 'pending' && 'bg-yellow-50',
								appointment.status === 'approved' && 'bg-green-50',
								appointment.status === 'cancelled' && 'bg-red-50',
								appointment.status === 'completed' && 'bg-blue-50'
							)
						}>
							<TableCell className="font-medium">{appointment.student_id}</TableCell>
							<TableCell>{appointment.lastName}, {appointment.firstName} {appointment.middleName}</TableCell>
							<TableCell>{appointment.contactNumber}</TableCell>
							<TableCell className="text-right">
								{moment.unix(appointment.appointment_timestamp / 1000).local().format('MMMM DD, YYYY @ hh:mm A')}
							</TableCell>
							<TableCell className="text-center">
								<Badge variant='default' className={cn(
									appointment.status === 'pending' && 'bg-yellow-600 text-yellow-100',
									appointment.status === 'approved' && 'bg-green-700 text-green-100',
									appointment.status === 'cancelled' && 'bg-red-700 text-red-100',
									appointment.status === 'completed' && 'bg-blue-700 text-blue-100'
								)}>
									{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
								</Badge>
							</TableCell>
							<TableCell className="flex items-center justify-end gap-2">
								{
									appointment.status === 'pending' ? (
										<>
											<ApproveButton appointmentId={appointment.id} />
											<CancelButton appointmentId={appointment.id} />
											<RescheduleButton appointmentId={appointment.id} originalTimestamp={appointment.appointment_timestamp} />
										</>
									) : (
										appointment.status === 'approved' ? (<>
											<CompleteButton appointmentId={appointment.id} />
											<CancelButton appointmentId={appointment.id} />
											<RescheduleButton appointmentId={appointment.id} originalTimestamp={appointment.appointment_timestamp} />
										</>) : null
									)
								}
							</TableCell>
						</TableRow>
					))
				}
			</TableBody>
		</Table>

	</div>
}