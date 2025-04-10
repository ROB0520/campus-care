'use client'

import { Hospital } from "lucide-react"
import { useId } from "react";
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


export default function Appointment() {
	const id = useId()
	const session = useSession()
	const userId = session.data?.user?.id
	const [showDialog, setShowDialog] = useState(false)

	const [date, setDate] = useState<Date | undefined>(() => {
		const now = new Date()
		const currentHour = now.getHours()
		const currentMinute = now.getMinutes()
		const currentDay = now.getDay()

		const isWeekend = currentDay === 0 || currentDay === 6 // Sunday or Saturday
		const isAfterHours = currentHour >= 18 || (currentHour === 18 && currentMinute > 0)
		const isBeforeClinicHours = currentHour < 8 || (currentHour === 8 && currentMinute < 0)

		if (isWeekend) {
			const nextMonday = new Date(now)
			nextMonday.setDate(now.getDate() + ((8 - currentDay) % 7)) // Move to next Monday
			nextMonday.setHours(8, 0, 0, 0) // Set to 8:00 AM
			return nextMonday
		}
		if (isAfterHours || (isBeforeClinicHours && currentMinute >= 45)) {
			const nextDay = new Date(now)
			nextDay.setDate(now.getDate() + 1) // Move to next day
			nextDay.setHours(8, 0, 0, 0) // Set to 8:00 AM
			return nextDay
		}

		if (isBeforeClinicHours) {
			const nextHour = new Date(now)
			nextHour.setHours(8, 0, 0, 0) // Set to 8:00 AM
			return nextHour
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

	return <div className="flex items-center justify-center min-h-full">
		<div className="flex flex-col lg:flex-row items-center justify-center gap-4 md:gap-6 lg:gap-8 xl:gap-16 *:w-full md:w-auto">
			<div className="flex flex-col items-center justify-center gap-3 bg-secondary p-5 rounded-lg lg:w-1/3 md:min-w-sm">
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
			<div className="flex flex-col items-center gap-3 bg-secondary p-5 rounded-lg xl:w-1/3">
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
									const selectedDate = updateDateOrTime(date || new Date(), newDate, undefined);
									setDate(selectedDate);
								}}
								disabled={(date) =>
									date < new Date(new Date().setDate(new Date().getDate() - 1)) || 
									date.getDay() === 0 || 
									date.getDay() === 6
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
											min="08:00"
											max="18:00"
											onChange={(e) => {
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
								onClick={() => {
									if (!date) {
										toast.error("Please select a date and time.");
										setShowDialog(false);
										return;
									}
									if (date.getDay() === 0 || date.getDay() === 6) {
										toast.error("Appointments cannot be booked on weekends.");
										setShowDialog(false);
										return;
									}
									if (date.getHours() < 8 || date.getHours() >= 18) {
										toast.error("Appointments can only be booked between 8:00 AM and 6:00 PM.");
										setShowDialog(false);
										return;
									}
									if (date.getTime() < new Date().getTime()) {
										toast.error("Selected date and time cannot be in the past.");
										setShowDialog(false);
										return;
									}
									saveAppointment(date.getTime(), Number(userId)).then(() => {
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
		</div>
	</div>
}