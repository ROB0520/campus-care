"use server"

import { createConnection } from "@/lib/db"

import { Appointment } from "./fetch"
import { fetchAppointments } from './fetch'
import { sendAppointmentNotification } from "./notify"
import { RowDataPacket } from "mysql2"

export async function rescheduleAppointment(appointmentId: number, newDate: number) {
	const connection = await createConnection()

	const [rows] = await connection.query<RowDataPacket[]>(
		`SELECT appointmentTimestamp FROM Appointments WHERE id = ?`,
		[appointmentId]
	)

	if (rows.length === 0) {
		throw new Error("Appointment not found")
	}

	await connection.query(
		`UPDATE Appointments SET appointmentTimestamp = ? WHERE id = ?`,
		[newDate, appointmentId]
	)

	const oldTimestamp = rows[0].appointmentTimestamp as number;

	await sendAppointmentNotification(appointmentId, "rescheduled", oldTimestamp)

	// Fetch the updated Appointments list
	const [rows2] = await fetchAppointments()

	await connection.end()

	return rows2 as Appointment
}