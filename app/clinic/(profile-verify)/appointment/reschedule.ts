"use server"

import { createConnection } from "@/lib/db"

import { Appointment } from "./fetch"
import { fetchAppointments } from './fetch'
import { sendAppointmentNotification } from "./notify"

export async function rescheduleAppointment(appointmentId: number, oldDate: number, newDate: number) {
	const connection = await createConnection()

	await sendAppointmentNotification(appointmentId, "rescheduled", oldDate)

	// Update the appointment date in the database
	await connection.query(
		`UPDATE Appointments SET appointmentTimestamp = ? WHERE id = ?`,
		[newDate, appointmentId]
	)

	// Fetch the updated Appointments list
	const [rows] = await fetchAppointments()

	await connection.end()

	return rows as Appointment
}