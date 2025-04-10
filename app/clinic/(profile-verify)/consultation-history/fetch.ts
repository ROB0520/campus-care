"use server"

import { createConnection } from "@/lib/db"

export type ConsultHistory = {
	id: number
	userId: number
	attendingPersonnel: number
	reason: string
	diagnosis: string
	medication: string
	remarks: string | null
	consultation_timestamp: number
	fullName: string
	student_id: string
	course_year: string | null
	attendingPersonnelName: string
	attendingPersonnelPosition: number | null
}

export async function fetchConsultHistory(searchQuery?: string): Promise<ConsultHistory[]> {
	const connection = await createConnection()
	const [rows] = await connection.execute(
		`SELECT
			ConsultationHistory.id,
			ConsultationHistory.userId,
			ConsultationHistory.attendingPersonnel,
			ConsultationHistory.reason,
			ConsultationHistory.diagnosis,
			ConsultationHistory.medication,
			ConsultationHistory.remarks,
			ConsultationHistory.consultation_timestamp,
			CONCAT_WS('', pi.lastName, ', ', pi.firstName, ' ', pi.middleName) AS fullName,
			pi.student_id,
			pi.course_year,
			CONCAT_WS(' ', ci.firstName, ci.lastName) AS attendingPersonnelName,
			ci.position AS attendingPersonnelPosition
		FROM ConsultationHistory
		LEFT JOIN PersonalInformation pi ON ConsultationHistory.userId = pi.userId
		LEFT JOIN ClinicProfile ci ON ConsultationHistory.attendingPersonnel = ci.userId
		${searchQuery ? `WHERE (pi.lastName LIKE ? OR pi.firstName LIKE ? OR pi.middleName LIKE ? OR pi.student_id LIKE ?)` : ""}
		ORDER BY ConsultationHistory.consultation_timestamp DESC;`,
		searchQuery ? [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`] : []
	)

	await connection.end()

	return rows as ConsultHistory[]
}

export async function fetchStudents(): Promise<{ userId: number; student_id: string; fullName: string }[]> {
	const connection = await createConnection()
	const [rows] = await connection.execute(
		`SELECT userId, student_id, CONCAT_WS('', lastName, ', ', firstName, ' ', middleName) AS fullName FROM PersonalInformation;`
	)

	await connection.end()

	return rows as { userId: number; student_id: string; fullName: string }[]
}

export async function fetchPersonnel(): Promise<{ userId: number; fullName: string; position: string }[]> {
	const connection = await createConnection()
	const [rows] = await connection.execute(
		`SELECT userId, CONCAT_WS(' ', firstName, lastName) AS fullName, position FROM ClinicProfile;`
	)

	await connection.end()

	return rows as { userId: number; fullName: string; position: string }[]
}