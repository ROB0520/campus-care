'use client'

import { Hospital } from "lucide-react"
import { useEffect, useId } from "react";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ClockIcon, CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import moment from "moment"
import { toast } from "sonner"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { saveAppointment } from "./saveData";
import { useSession } from "next-auth/react";
import { hasCompletedProfile } from '../checkCompleteProfile'
import Link from "next/link";


export default function Appointment() {
	const id = useId()
	const session = useSession()
	const userId = session.data?.user?.id
	const [showDialog, setShowDialog] = useState(false)
	const [completionData, setCompletionData] = useState<{ hasBasicInfo: boolean; hasHealthSurvey: boolean } | undefined>()

	const [date, setDate] = useState<Date | undefined>(() => {
		const now = new Date()
		const currentHour = now.getHours()
		const currentMinute = now.getMinutes()
		const currentDay = now.getDay()

		const isWeekend = currentDay === 0 || currentDay === 6 // Sunday or Saturday
		const isAfterHours = currentHour >= 18 || (currentHour === 18 && currentMinute > 0)
		const isBeforeClinicHours = currentHour < 8 || (currentHour === 8 && currentMinute < 0)

		if (isWeekend || isAfterHours) {
			const nextMonday = new Date(now)
			nextMonday.setDate(now.getDate() + ((8 - currentDay) % 7)) // Move to next Monday
			nextMonday.setHours(8, 0, 0, 0) // Set to 8:00 AM
			return nextMonday
		} else if (isBeforeClinicHours) {
			const today = new Date(now)
			today.setHours(8, 0, 0, 0) // Set to 8:00 AM
			return today
		}

		now.setHours(currentHour, currentMinute + 15, 0, 0) // Set to 15 minutes ahead
		return now
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

	useEffect(() => {
		async function checkProfileCompletion() {
			if (!userId) return
			const data = await hasCompletedProfile(Number(userId))
			setCompletionData(data)
		}
		checkProfileCompletion()
	}, [userId])

	return <div className="flex items-center justify-center min-h-full">
		<div className="flex flex-row items-center justify-center gap-16">
			{(completionData?.hasBasicInfo && completionData?.hasHealthSurvey) ? <>
				<div className="flex flex-col items-center justify-center gap-3 w-1/3 bg-secondary p-5 rounded-lg">
					<div className="bg-primary text-primary-foreground flex size-16 items-center justify-center rounded-lg">
						<Hospital className="size-14" strokeWidth={1.25} />
					</div>
					<h1 className="text-2xl font-bold text-center">
						MONDAY TO FRIDAY
						<br />
						08:00AM TO 6:00PM
					</h1>
					<p className="text-sm text-center">
						Our campus clinic is open from 8:00 AM to 6:00 PM, Monday through Friday, providing medical services and healthcare support to students and staff. Whether you need a routine check-up, consultation, or urgent care, our clinic is here to assist you during these hours. Walk-ins and Appointments are welcome.
					</p>
				</div>
				<div className="flex flex-col items-center gap-3 w-1/3 bg-secondary p-5 rounded-lg">
					<h1 className="text-2xl font-bold text-center">
						Make an Appointment
					</h1>
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
										|| date.getDay() === 0 || date.getDay() === 6
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
					<Dialog open={showDialog} onOpenChange={setShowDialog}>
						<DialogTrigger asChild>
							<Button
								className="w-full"
								onClick={(e) => {
									if (!date) {
										e.preventDefault();
										toast.error("Please select a date and time.");
										return;
									}
								}}
							>
								Book Appointment
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Book Appointment</DialogTitle>
							</DialogHeader>
							<p>
								Are you sure you want to book an appointment on {date ? moment(date).format("MMMM Do YYYY, h:mm A") : "this date"}?
							</p>
							<DialogFooter>
								<DialogClose asChild>
									<Button
										variant="outline"
										onClick={() => {
											setDate(undefined);
										}}
									>
										Cancel
									</Button>
								</DialogClose>
								<Button
									className="ms-2"
									onClick={() => {
										if (!date) {
											toast.error("Please select a date and time.");
											return;
										}
										if (date.getDay() === 0 || date.getDay() === 6) {
											toast.error("Appointments cannot be booked on weekends.");
											return;
										}
										if (date.getHours() < 8 || date.getHours() >= 18) {
											toast.error("Appointments can only be booked between 8:00 AM and 6:00 PM.");
											return;
										}
										if (date.getTime() < new Date().getTime()) {
											toast.error("Selected date and time cannot be in the past.");
											return;
										}
										saveAppointment(date.getTime() / 1000, Number(userId)).then(() => {
											toast.success("Appointment booked successfully.")
											setShowDialog(false)
										}).catch((error) => {
											if (error.message === "An appointment already exists on the same day.") {
												toast.error("An appointment already exists on the same day.");
											}
										})
									}}
								>
									Continue
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</> :
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
			}
		</div>
	</div>
}