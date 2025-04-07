"use server"

import { createConnection } from "@/lib/db"

import { Appointment } from "@/app/clinic/appointment/fetch"
import { fetchAppointments } from "@/app/clinic/appointment/fetch"

export async function rescheduleAppointment(appointmentId: number, newDate: number) {
	const connection = await createConnection()

	// Update the appointment date in the database
	await connection.query(
		`UPDATE Appointments SET appointment_timestamp = ? WHERE id = ?`,
		[newDate, appointmentId]
	)

	// Fetch the updated appointments list
	const [rows] = await fetchAppointments()

	await connection.end()

	return rows as Appointment
}