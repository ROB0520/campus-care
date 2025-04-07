'use server'

import { createConnection } from "@/lib/db"
import mysql from "mysql2/promise"

export async function fetchDataFromDB(userId: number) {
	const connection = await createConnection()
	const [rows] = await connection.execute<mysql.RowDataPacket[]>(
		`SELECT 
			*
		FROM HealthSurvey
		WHERE userId = ?`,
		[userId]
	)

	const data = rows[0]

	await connection.end()

	return data
}
