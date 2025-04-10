'use server'

import { createConnection } from "@/lib/db"
import mysql from "mysql2/promise"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveAdminProfile(data: any, userId: number) {
	const connection = await createConnection()
	const { firstName, lastName, middleName } = data

	// Check if the user exists in the database
	const [userCheck] = await connection.query<mysql.RowDataPacket[]>(`
		SELECT * FROM AdminProfile WHERE userId = ?
	`, [userId])

	if (userCheck.length === 0) {
		await connection.execute<mysql.RowDataPacket[]>(`
			INSERT INTO AdminProfile (userId, firstName, lastName, middleName)
			VALUES (?, ?, ?, ?)
		`, [userId, firstName, lastName, middleName])
	} else {
		await connection.execute<mysql.RowDataPacket[]>(`
			UPDATE AdminProfile
			SET firstName = ?, lastName = ?, middleName = ?
			WHERE userId = ?
		`, [firstName, lastName, middleName, userId])
	}

	await connection.end()
}