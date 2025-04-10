'use server'

import { createConnection } from "@/lib/db"
import mysql from "mysql2/promise"

export async function fetchAdminProfile(userId: string) {
	const connection = await createConnection()
	const [rows] = await connection.execute<mysql.RowDataPacket[]>(`
		SELECT * 
		FROM AdminProfile 
		WHERE userId = ?
		`, [userId])
	
	await connection.end()

	if (rows.length === 0) {
		return null
	}

	return rows[0]
}