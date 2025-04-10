import { fetchUser } from "./fetch"
import { CircleUserRound } from "lucide-react"
import Link from "next/link";
import React from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import moment from "moment-timezone";

function DataRow({ label, value }: { label: string; value: string | number | boolean | React.ReactNode }) {
	return (
		<div className="grid grid-cols-subgrid col-span-2">
			<p className="font-bold">{label + ':'}</p>
			{
				React.isValidElement(value)
					? value
					: <p>
						{value}
					</p>
			}
		</div>
	)
}

function ListItem({ condition, label }: { condition: boolean; label: string }) {
	return condition ? <li>{label}</li> : null
}

export default async function StudentInfo({
	params,
}: {
	params: Promise<{ user: number }>
}) {
	const { user: userId } = await params
	const user = await fetchUser(userId)
	if (!user) {
		return <div className="p-5">User not found</div>
	}

	return <div className="p-5 flex flex-col gap-3">
		<div className="flex flex-row items-center gap-3">
			<CircleUserRound className="size-15" strokeWidth={1.25} />
			<div className="flex flex-col gap-1 min-w-80">
				<div className="flex flex-row gap-4 items-center">
					<h1 className="text-2xl font-bold">{user.firstName} {user.middleName && user.middleName + ' '}{user.lastName}</h1>
					{
						user.isLocked ? <Badge variant="destructive" className="text-xs">Locked</Badge> : null
					}
				</div>
				<div className="flex flex-row gap-2 justify-between">
					<p className="text-sm text-muted-foreground">{user.studentId}</p>
					<p className="text-sm text-muted-foreground">{user.courseYearSection}</p>
				</div>
				<p className="text-sm text-muted-foreground">{user.designation}</p>
			</div>
		</div>
		<div className="*:flex *:flex-col *:gap-3 flex gap-3 flex-col">
			{user.hasPersonalInfo ? <>
				<div className="p-5 bg-secondary rounded-md shadow">
					<h2 className="text-2xl font-bold text-center">Basic Personal Information</h2>
					<div className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 w-full">
						<DataRow
							label="Date of Birth"
							value={new Date(user.dateOfBirth).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							})}
						/>
						<DataRow
							label="Sex"
							value={user.sex.charAt(0).toUpperCase() + user.sex.slice(1)}
						/>
						<DataRow
							label="Address"
							value={user.address}
						/>
						<DataRow
							label="Contact Number"
							value={user.contactNumber}
						/>
						<DataRow
							label="Email Address"
							value={<Link className="text-primary underline underline-offset-2 w-fit" href={'mailto:' + user.email}>{user.email}</Link>}
						/>
						<DataRow
							label="Height (in cm)"
							value={user.height}
						/>
						<DataRow
							label="Weight (in kg)"
							value={user.weight}
						/>
						<DataRow
							label="Blood Type"
							value={user.bloodType}
						/>
						<DataRow
							label="Is PWD?"
							value={user.isPWD ? 'Yes' : 'No'}
						/>
						{
							user.isPWD ? (
								<>
									<DataRow
										label="PWD Category"
										value={user?.pwdCategory ? user.pwdCategory.charAt(0).toUpperCase() + user.pwdCategory.slice(1) : 'N/A'}
									/>
									<DataRow
										label="PWD ID"
										value={user?.pwdID ? user.pwdID : 'N/A'}
									/>
								</>
							) : null
						}
					</div>
				</div>
				<div className="p-5 bg-secondary rounded-md shadow">
					<h2 className="text-2xl font-bold text-center">Emergency Contact</h2>
					<div className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 w-full">
						<DataRow
							label="First Name"
							value={user.emFirstName}
						/>
						<DataRow
							label="Last Name"
							value={user.emLastName}
						/>
						<DataRow
							label="Address"
							value={user.emAddress}
						/>
						<DataRow
							label="Contact Number"
							value={user.emPhoneNumber}
						/>
						<DataRow
							label="Email Address"
							value={<Link className="text-primary underline underline-offset-2 w-fit" href={'mailto:' + user.emEmail}>{user.emEmail}</Link>}
						/>
					</div>
				</div>
			</> : <div className="p-5 bg-secondary rounded-md shadow">
				<h2 className="text-2xl font-bold text-center">Personal Information</h2>
				<p className="text-center">No personal information found.</p>
			</div>}
			{user.hasMedicalSurvey ? <>
				<div className="p-5 bg-secondary rounded-md shadow">
					<h2 className="text-2xl font-bold text-center">Current Symptoms</h2>
					<ul className="list-disc list-inside grid gap-y-1 gap-x-5 grid-cols-2">
						<ListItem condition={user.hasFeverChills} label="Fever or Chills" />
						<ListItem condition={user.hasFatigue} label="Fatigue" />
						{user.hasCough ? (
							<>
								{user.coughType === 'dry' && <li>Dry Cough</li>}
								{user.coughType === 'phlegm' && <li>Phlegm Cough</li>}
							</>
						) : null}
						<ListItem condition={user.hasSoreThroat} label="Sore Throat" />
						<ListItem condition={user.hasShortnessOfBreath} label="Shortness of Breath" />
						<ListItem condition={user.hasHeadache} label="Headache" />
						<ListItem condition={user.hasNauseaVomiting} label="Nausea or Vomiting" />
						<ListItem condition={user.hasStomachPain} label="Stomach Pain" />
						<ListItem condition={user.hasBodyAches} label="Body Aches" />
						<ListItem condition={user.hasSkinRash} label="Skin Rash" />
						<ListItem condition={user.hasDifficultySleeping} label="Difficulty Sleeping" />
						<ListItem condition={user.hasOtherSymptoms} label={"Other Symptoms (" + user.otherSymptoms + ")"} />
					</ul>
				</div>
				<div className="p-5 bg-secondary rounded-md shadow">
					<h2 className="text-2xl font-bold text-center">Medical History</h2>
					<div className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 w-full">
						<DataRow
							label="Has Chronic Illness?"
							value={user.hasChronicIllness ? 'Yes' : 'No'}
						/>
						{user.hasChronicIllness ? (
							<ul className="list-disc list-inside grid gap-y-1 gap-x-5 grid-cols-2">
								<ListItem condition={user.hasAsthma} label="Asthma" />
								<ListItem condition={user.hasHypertension} label="Hypertension" />
								<ListItem condition={user.hasDiabetes} label={"Diabetes (" + (user.diabetesType === 'type1' ? 'Type 1' : (user.diabetesType === 'type2' ? 'Type 2' : 'N/A')) + ")"} />
								<ListItem condition={user.hasHeartDisease} label="Heart Disease" />
								<ListItem condition={user.hasSeizures} label="Seizures" />
								<ListItem condition={user.hasTuberculosis} label="Tuberculosis" />
								<ListItem condition={user.hasKidneyDisease} label="Kidney Disease" />
								<ListItem condition={user.hasDigestiveIssues} label="Digestive Issues" />
								<ListItem condition={user.hasMigrains} label="Migrains" />
								<ListItem condition={user.hasCancer} label="Cancer" />
								<ListItem condition={user.hasOtherConditions} label={"Other Conditions (" + user.otherConditions + ")"} />
							</ul>
						) : null}
						<DataRow
							label="Was Hospitalized? (in the past 5 years)"
							value={user.wasHospitalized ? 'Yes' : 'No'}
						/>
						{user.wasHospitalized ? (
							<DataRow
								label="Hospitalization Reason"
								value={user.hospitalizedReason}
							/>
						) : null}
						<DataRow
							label="Has Medication?"
							value={user.hasMedication ? 'Yes' : 'No'}
						/>
						<DataRow
							label="Has Allergies?"
							value={user.hasAllergies ? 'Yes' : 'No'}
						/>
						{user.hasAllergies ? (
							<DataRow
								label="Allergies"
								value={user.allergies}
							/>
						) : null}
						<DataRow
							label="Has Hereditary Disease?"
							value={user.hasHereditaryDisease ? 'Yes' : 'No'}
						/>
						{user.hasHereditaryDisease ? (
							<DataRow
								label="Hereditary Disease"
								value={user.hereditaryDisease}
							/>
						) : null}
					</div>
				</div>
				<div className="p-5 bg-secondary rounded-md shadow">
					<h2 className="text-2xl font-bold text-center">Vaccination Records</h2>
					<div className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 w-full">
						<DataRow
							label="Has Childhood Vaccines?"
							value={user.hasChildhoodVaccines === 'yes' ? 'Yes' : (user.hasChildhoodVaccines === 'no' ? 'No' : 'Not Sure')}
						/>
						<DataRow
							label="Has Vaccine Allergies?"
							value={user.hasVaccineAllergies ? 'Yes' : 'No'}
						/>
						<DataRow
							label="With COVID Comorbidity?"
							value={user.withCovidCommurbidity ? 'Yes' : 'No'}
						/>
						<DataRow
							label="COVID Vaccine Status"
							value={user.covidVaccineStatus.charAt(0).toUpperCase() + user.covidVaccineStatus.slice(1).replace(/_/g, ' ')}
						/>
					</div>
				</div>
			</> : <div className="p-5 bg-secondary rounded-md shadow">
				<h2 className="text-2xl font-bold text-center">Medical Survey</h2>
				<p className="text-center">No medical survey found.</p>
			</div>}
			{user.appointments && user.appointments.length > 0 ? <div className="p-5 bg-secondary rounded-md shadow">
				<h2 className="text-2xl font-bold text-center">Appointment History</h2>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="text-left">Date and Time</TableHead>
							<TableHead className="text-left">Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{user.appointments.map((appointment) => (
							<TableRow key={appointment.appointmentId} className="hover:bg-primary/10">
								<TableCell className="text-left">
									{
										moment.unix(appointment.appointmentTimestamp as unknown as number).tz('Asia/Manila').format('MMMM DD, YYYY @ hh:mm A')
									}
								</TableCell>
								<TableCell className="text-left">
									<Badge variant='default' className={cn(
										appointment.status === 'pending' && 'bg-yellow-600 text-yellow-100',
										appointment.status === 'approved' && 'bg-green-700 text-green-100',
										appointment.status === 'cancelled' && 'bg-red-700 text-red-100',
										appointment.status === 'completed' && 'bg-blue-700 text-blue-100'
									)}>
										{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
									</Badge>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div> : <div className="p-5 bg-secondary rounded-md shadow">
				<h2 className="text-2xl font-bold text-center">Appointment History</h2>
				<p className="text-center">No appointment history found.</p>
			</div>}
		</div>
	</div>
}