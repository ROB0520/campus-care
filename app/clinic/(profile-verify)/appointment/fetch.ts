"use server"

import { createConnection } from "@/lib/db"

export type Appointment = {
	id: number
	userId: number
	studentId: string
	firstName: string
	middleName: string | null
	lastName: string
	contactNumber: string
	appointmentTimestamp: number
	status: 'pending' | 'approved' | 'cancelled' | 'completed'
}

export async function fetchAppointments(searchQuery?: string): Promise<Appointment[]> {
	const connection = await createConnection()
	const [rows] = await connection.execute(
		`SELECT a.*, p.lastName, p.middleName, p.firstName, p.contactNumber, p.studentId 
		 FROM Appointments a
		 JOIN PersonalInformation p ON a.userId = p.userId
		 WHERE a.appointmentTimestamp >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 HOUR))
		 ${searchQuery ? `AND (p.lastName LIKE ? OR p.firstName LIKE ? OR p.middleName LIKE ? OR p.studentId LIKE ?)` : ""}
		 ORDER BY a.appointmentTimestamp ASC;`,
		searchQuery ? [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`] : []
	)

	await connection.end()

	return rows as Appointment[]
}