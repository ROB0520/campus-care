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
import { fetchConsultHistory, fetchStudents, fetchPersonnel, type ConsultHistory } from "./fetch"
import { useEffect, useId, useRef, useState } from "react"
import moment from "moment-timezone"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Check, ChevronsUpDown, ClockIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import { saveData } from "./saveData"
import { useRouter, useSearchParams } from "next/navigation"


export default function ConsultationHistory() {
	const searchParams = useSearchParams()
	const router = useRouter()
	const [consultRecords, setConsultRecords] = useState<ConsultHistory[]>([])
	const [loading, setLoading] = useState(true)
	const [students, setStudents] = useState<{ userId: number; student_id: string; fullName: string }[]>([])
	const [personnels, setPersonnel] = useState<{ userId: number; fullName: string }[]>([])
	const [openStudent, setOpenStudent] = useState(false)
	const [openPersonnel, setOpenPersonnel] = useState(false)
	const id = useId()
	const [studentValue, setStudentValue] = useState("")
	const [personnelValue, setPersonnelValue] = useState("")
	const [dateValue, setDateValue] = useState<Date>(new Date())
	const [reasonValue, setReasonValue] = useState("")
	const [diagnosisValue, setDiagnosisValue] = useState("")
	const [medicationValue, setMedicationValue] = useState("")
	const [remarksValue, setRemarksValue] = useState<string>('')
	const reasonRef = useRef<HTMLInputElement | null>(null)
	const diagnosisRef = useRef<HTMLInputElement | null>(null)
	const medicationRef = useRef<HTMLInputElement | null>(null)
	const remarksRef = useRef<HTMLInputElement | null>(null)


	useEffect(() => {
		const fetchData = async () => {
			const data = await fetchConsultHistory(searchParams?.get('s') || "")
			setConsultRecords(data)
			await fetchStudents().then((data) => {
				setStudents(data)
			})
			await fetchPersonnel().then((data) => {
				setPersonnel(data)
			})
			setLoading(false)
		}
		fetchData()
	}, [searchParams])

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

	function handleAddRecord() {
		if (!studentValue || !dateValue || !personnelValue) {
			toast.error("Please fill up all required fields.")
			return
		}

		const student = students.find((s) => s.fullName === studentValue)
		const personnel = personnels.find((p) => p.fullName === personnelValue)


		if (student && personnel) {
			const data = {
				userId: student.userId,
				attendingPersonnel: personnel.userId,
				reason: reasonValue,
				diagnosis: diagnosisValue,
				medication: medicationValue,
				remarks: remarksValue,
				consultation_timestamp: Math.floor(dateValue.getTime() / 1000),
			}
			toast.success("Consultation record added successfully.")
			setStudentValue("")
			setDateValue(new Date())
			setPersonnelValue("")
			setReasonValue("")
			setDiagnosisValue("")
			setMedicationValue("")
			setRemarksValue('')
			if (reasonRef.current) reasonRef.current.value = ""
			if (diagnosisRef.current) diagnosisRef.current.value = ""
			if (medicationRef.current) medicationRef.current.value = ""
			if (remarksRef.current) remarksRef.current.value = ""

			saveData(data).then(async () => {
				const d = await fetchConsultHistory(searchParams?.get('s') || "")
				setConsultRecords(d)
			})
		} else {
			toast.error("Failed to add consultation record.")
		}
	}

	return <div className="flex flex-col gap-3">
		<div className="flex items-center justify-between">
			<h1 className="text-2xl font-bold">Consultation History</h1>
			<div className="flex items-center gap-2 w-1/2">
				<Dialog>
					<DialogTrigger asChild>
						<Button
							variant='default'
						>
							Add New Record
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add History</DialogTitle>
							<DialogDescription>
								Note: Please fill up this form to add a new consultation record.
							</DialogDescription>
						</DialogHeader>
						<div className="grid grid-cols-[auto_1fr] gap-4">
							<div className="grid grid-cols-subgrid col-span-2">
								<Label htmlFor="student">Patient Name:</Label>
								<Popover open={openStudent} onOpenChange={setOpenStudent}>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											role="combobox"
											aria-expanded={openStudent}
											className="w-full justify-between"
										>
											{studentValue
												? students.find((student) => student.fullName === studentValue)?.fullName
												: "Select student..."}
											<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="min-w-[200px] p-0">
										<Command>
											<CommandInput placeholder="Search student..." />
											<CommandList>
												<CommandEmpty>No student found.</CommandEmpty>
												<CommandGroup>
													{students.map((student, i) => (
														<CommandItem
															key={'stud-' + student.student_id + '-' + i}
															value={student.fullName}
															onSelect={() => {
																setStudentValue(student.fullName === studentValue ? "" : student.fullName)
																setOpenStudent(false)
															}}
														>
															<Check
																className={cn(
																	"mr-2 h-4 w-4",
																	studentValue === student.fullName ? "opacity-100" : "opacity-0"
																)}
															/>
															{student.fullName}
														</CommandItem>
													))}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
							</div>
							<div className="grid grid-cols-subgrid col-span-2">
								<Label htmlFor="student">Date of Visit:</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant={"outline"}
											className={cn(
												"w-full pl-3 text-left font-normal",
												!dateValue && "text-muted-foreground"
											)}
										>
											{dateValue ? (
												format(dateValue, "PPP, p")
											) : (
												<span>Pick a date</span>
											)}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-3" align="end">
										<div>
											<Calendar
												required
												mode="single"
												selected={dateValue}
												onSelect={setDateValue}
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

																if (dateValue?.toDateString() === now.toDateString()) {
																	if (parseInt(hour) < currentHour || (parseInt(hour) === currentHour && parseInt(minute) <= currentMinute)) {
																		const oldValue = dateValue ? moment(dateValue).format("HH:mm") : undefined;
																		e.target.value = oldValue || "";
																		toast.error("Selected time must be at least 15 ahead from now.");
																		return;
																	}
																}

																if (parseInt(hour) < 8 || parseInt(hour) > 18 || (parseInt(hour) === 18 && parseInt(minute) > 0)) {
																	toast.error("Selected time must be between 8:00 AM and 6:00 PM.");
																	const oldValue = dateValue ? moment(dateValue).format("HH:mm") : undefined;
																	e.target.value = oldValue || "";
																	return;
																}

																const selectedDate = updateDateOrTime(dateValue || new Date(), undefined, e.target.value);

																setDateValue(selectedDate);
															}}
															defaultValue={dateValue ? moment(dateValue).format('HH:mm') : undefined}
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
							<div className="grid grid-cols-subgrid col-span-2">
								<Label htmlFor="student">Attending Personnel:</Label>
								<Popover open={openPersonnel} onOpenChange={setOpenPersonnel}>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											role="combobox"
											className="w-full justify-between"
										>
											{personnelValue
												? personnels.find((personnel) => personnel.fullName === personnelValue)?.fullName
												: "Select personnel..."}
											<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="min-w-[200px] p-0">
										<Command>
											<CommandInput placeholder="Search personnel..." />
											<CommandList>
												<CommandEmpty>No personnel found.</CommandEmpty>
												<CommandGroup>
													{personnels.map((p) => (
														<CommandItem
															key={'pers-' + p.userId}
															value={p.fullName}
															onSelect={() => {
																setPersonnelValue(p.fullName === personnelValue ? "" : p.fullName)
																setOpenPersonnel(false)
															}}
														>
															<Check
																className={cn(
																	"mr-2 h-4 w-4",
																	personnelValue === p.fullName ? "opacity-100" : "opacity-0"
																)}
															/>
															{p.fullName}
														</CommandItem>
													))}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
							</div>
							<div className="grid grid-cols-subgrid col-span-2">
								<Label htmlFor="student">Reason for Visit:</Label>
								<Input
									type="text"
									className="w-full"
									onChange={(e) => setReasonValue(e.target.value)}
									ref={reasonRef}
								/>
							</div>
							<div className="grid grid-cols-subgrid col-span-2">
								<Label htmlFor="student">Diagnosis / Observations:</Label>
								<Input
									type="text"
									className="w-full"
									onChange={(e) => setDiagnosisValue(e.target.value)}
									ref={diagnosisRef}
								/>
							</div>
							<div className="grid grid-cols-subgrid col-span-2">
								<Label htmlFor="student">Medication Given:</Label>
								<Input
									type="text"
									className="w-full"
									onChange={(e) => setMedicationValue(e.target.value)}
									ref={medicationRef}
								/>
							</div>
							<div className="grid grid-cols-subgrid col-span-2">
								<Label htmlFor="student">Remarks / Follow-up:</Label>
								<Input
									type="text"
									placeholder="Optional"
									className="w-full"
									onChange={(e) => setRemarksValue(e.target.value)}
									ref={remarksRef}
								/>
							</div>
						</div>
						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="secondary">
									Cancel
								</Button>
							</DialogClose>
							<Button type="button" variant="default" onClick={handleAddRecord}>
								Add
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
				<Input
					type="text"
					placeholder="Search the Student ID or Name"
					className="flex-1"
					defaultValue={searchParams?.get('s') || ''}
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
							router.push(`/clinic/consultation-history?${params.toString()}`)
							const data = await fetchConsultHistory(input)
							setConsultRecords(data)
							setLoading(false)
						}
					}}
				/>
			</div>
		</div>
		<Separator />
		<Table className="bg-secondary overflow-x-scroll">
			<TableHeader className="sticky top-0 z-10 bg-secondary">
				<TableRow>
					<TableHead>Date and Time</TableHead>
					<TableHead>Student ID</TableHead>
					<TableHead>Full Name</TableHead>
					<TableHead>Course and Section</TableHead>
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
							<TableCell colSpan={9} className="text-center">Loading...</TableCell>
						</TableRow>
					) : consultRecords.map((record) => (
						<TableRow key={record.id} className="hover:bg-primary/15">
							<TableCell className="text-left">{moment.unix(record.consultation_timestamp).tz("Asia/Manila").format('MMMM DD, YYYY @ hh:mm A')}</TableCell>
							<TableCell className="text-left">{record.student_id}</TableCell>
							<TableCell className="text-left">{record.fullName}</TableCell>
							<TableCell className="text-left">{record.course_year}</TableCell>
							<TableCell className="text-left">
								{record.attendingPersonnelPosition === 0 ?
									'Dr.' : (
										record.attendingPersonnelPosition === 1 ?
											'Nurse' : null
									)}
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
}