/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createConnection } from "@/lib/db"
import mysql from "mysql2/promise"

export async function getFullName(userId: number) {
	const connection = await createConnection()
	const [rows] = await connection.execute<mysql.RowDataPacket[]>(
		`SELECT 
			CONCAT_WS(' ', firstName, lastName) AS fullName
		FROM PersonalInformation
		WHERE userId = ?`,
		[userId]
	)

	const data = rows[0] as mysql.RowDataPacket

	await connection.end()

	return data?.fullName as string
}

export async function hasUnreadNotifications(userId: number): Promise<boolean> {
	const connection = await createConnection();
	const [rows] = await connection.execute<mysql.RowDataPacket[]>(
		`SELECT COUNT(*) as count
		 FROM AppointmentNotifications
		 WHERE userId = ? AND is_read = FALSE`,
		[userId]
	);
	
	const data = rows[0] as mysql.RowDataPacket;
	await connection.end();
	
	return data.count > 0;
}

export async function getUserNotifications(userId: number): Promise<any[]> {
	const connection = await createConnection();
	
	// First fetch all notifications
	const [rows] = await connection.execute<mysql.RowDataPacket[]>(
		`SELECT an.*, a.appointment_timestamp
		 FROM AppointmentNotifications an
		 LEFT JOIN Appointments a ON an.appointmentId = a.id
		 WHERE an.userId = ?
		 ORDER BY notification_timestamp DESC
		 LIMIT 50`,
		[userId]
	);
	
	// Then mark them as read
	await connection.execute(
		`UPDATE AppointmentNotifications
		 SET is_read = TRUE
		 WHERE userId = ? AND is_read = FALSE`,
		[userId]
	);
	
	await connection.end();
	
	return rows as mysql.RowDataPacket[];
}