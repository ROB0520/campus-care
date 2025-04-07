'use server'

import { createConnection } from "@/lib/db"
import mysql from "mysql2/promise"

export async function saveAppointment(date: number, userId: number) {
	const connection = await createConnection()

	// Check if there is already an appointment on the same day based on date
	const [rows] = await connection.query<mysql.RowDataPacket[]>(`
		SELECT COUNT(*) AS count
		FROM appointments
		WHERE DATE(FROM_UNIXTIME(appointment_timestamp)) = DATE(FROM_UNIXTIME(?)) AND
		userId = ?
	`, [date, userId])	

	if (rows[0].count > 0) {
		throw new Error("An appointment already exists on the same day.");
	}

	// Insert the appointment data into the database
	await connection.query(`INSERT INTO appointments (userId, appointment_timestamp) VALUES (?, ?)`, [userId, date])

	// Close the database connection
	await connection.end()
}
