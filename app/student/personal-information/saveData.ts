"use server"

import { createConnection } from "@/lib/db"
import mysql from "mysql2/promise"

export async function saveData(formData: any) {
	const connection = await createConnection()

	// Check if the userId already exists
	const [existingRows] = await connection.execute<mysql.RowDataPacket[]>(
		`SELECT * FROM personalinformation WHERE userId = ?`,
		[formData.userId]
	)
	
	if (existingRows.length === 0) {
		await connection.query(
			`INSERT INTO personalinformation SET ?`,
			formData
		)
	} else {
		await connection.query(
			`UPDATE personalinformation SET ? WHERE userId = ?`,
			[formData, formData.userId]
		)
	}

	await connection.end()
}