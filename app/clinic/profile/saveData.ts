'use server'

import { createConnection } from "@/lib/db"
import mysql from "mysql2/promise"

export async function saveClinicProfile(data: any, userId: number) {
	const connection = await createConnection()
	const { firstName, lastName, middleName } = data
	
	await connection.execute<mysql.RowDataPacket[]>(`
		UPDATE clinicprofile
		SET firstName = ?, lastName = ?, middleName = ?
		WHERE userId = ?
	`, [firstName, lastName, middleName, userId])

	await connection.end()
}