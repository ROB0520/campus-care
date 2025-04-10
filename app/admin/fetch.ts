'use server'

import { createConnection } from "@/lib/db"
import mysql from "mysql2/promise"

export async function getFullName(userId: number) {
	const connection = await createConnection()
	const [rows] = await connection.execute<mysql.RowDataPacket[]>(
		`SELECT 
			CONCAT_WS(' ', firstName, lastName) AS fullName
		FROM AdminProfile
		WHERE userId = ?`,
		[userId]
	)

	const data = rows[0] as mysql.RowDataPacket

	await connection.end()

	return data?.fullName as string
}