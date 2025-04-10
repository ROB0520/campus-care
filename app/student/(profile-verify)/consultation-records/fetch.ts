"use server"

import { createConnection } from "@/lib/db"
import mysql from "mysql2/promise"

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

export async function fetchConsultHistory(userId?: number): Promise<ConsultHistory[]> {
	const connection = await createConnection()
	const [rows] = await connection.execute(
		`SELECT
			ConsultationHistory.id,
			ConsultationHistory.attendingPersonnel,
			ConsultationHistory.reason,
			ConsultationHistory.diagnosis,
			ConsultationHistory.medication,
			ConsultationHistory.remarks,
			ConsultationHistory.consultation_timestamp,
			CONCAT_WS(' ', ci.firstName, ci.lastName) AS attendingPersonnelName,
			ci.position AS attendingPersonnelPosition
		FROM ConsultationHistory
		LEFT JOIN PersonalInformation pi ON ConsultationHistory.userId = pi.userId
		LEFT JOIN ClinicProfile ci ON ConsultationHistory.attendingPersonnel = ci.userId
		WHERE pi.userId = ?
		ORDER BY ConsultationHistory.consultation_timestamp DESC;`,
		[userId]
	)

	await connection.end()

	return rows as ConsultHistory[]
}

export async function fetchUser(userId: number): Promise<{ userId: number; student_id: string; fullName: string; course_year: string | null; designation: string | null }> {
	const connection = await createConnection()
	const [rows] = await connection.execute<mysql.RowDataPacket[]>(
		`SELECT
			student_id, 
			CONCAT_WS(' ', firstName, middleName, lastName) AS fullName,
			course_year,
			designation
		FROM PersonalInformation
		WHERE userId = ?;`,
		[userId]
	)

	const data = rows[0] as mysql.RowDataPacket	

	await connection.end()

	return data as { userId: number; student_id: string; fullName: string; course_year: string | null; designation: string | null }
}