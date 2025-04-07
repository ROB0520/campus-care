"use server"

import { createConnection } from "@/lib/db"
import mysql from "mysql2/promise"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveData(formData: any) {
	const connection = await createConnection()

	const [existingRows] = await connection.execute<mysql.RowDataPacket[]>(
		`SELECT * FROM healthsurvey WHERE userId = ?`,
		[formData.userId]
	)

	if (existingRows.length === 0) {
		await connection.query(
			`INSERT INTO healthsurvey SET ?`,
			formData
		)
	} else {
		await connection.query(
			`UPDATE healthsurvey SET ? WHERE userId = ?`,
			[formData, formData.userId]
		)
	}

	await connection.query(
		`INSERT INTO healthsurvey SET ?`,
		formData
	)
}