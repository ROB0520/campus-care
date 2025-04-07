"use server"

import { createConnection } from "@/lib/db"

export type Appointment = {
	id: number
	userId: number
	student_id: string
	firstName: string
	middleName: string | null
	lastName: string
	contactNumber: string
	appointment_timestamp: number
	status: 'pending' | 'approved' | 'cancelled' | 'completed'
}

export async function fetchAppointments(searchQuery?: string): Promise<Appointment[]> {
	const connection = await createConnection()
	const [rows] = await connection.execute(
		`SELECT a.*, p.lastName, p.middleName, p.firstName, p.contactNumber, p.student_id 
		 FROM Appointments a
		 JOIN PersonalInformation p ON a.userId = p.userId
		 WHERE a.appointment_timestamp >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 HOUR))
		 ${searchQuery ? `AND (p.lastName LIKE ? OR p.firstName LIKE ? OR p.middleName LIKE ? OR p.student_id LIKE ?)` : ""}
		 ORDER BY a.appointment_timestamp ASC;`,
		searchQuery ? [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`] : []
	)

	await connection.end()

	return rows as Appointment[]
}