'use server'

import { createConnection } from "@/lib/db"
import { RowDataPacket } from "mysql2"
import { hashPassword } from "@/lib/utils"

export async function updateProfile(userId: string, currentPassword: string, newPassword: string) {
	const connection = await createConnection()

	const [userCheck] = await connection.query<RowDataPacket[]>(
		"SELECT * FROM users WHERE id = ? AND password = ?",
		[userId, hashPassword(currentPassword)]
	)
	if (userCheck.length === 0) {
		await connection.end()
		throw new Error("Current password is incorrect")
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [updateResult]: any = await connection.query(
		"UPDATE users SET password = ? WHERE id = ?",
		[hashPassword(newPassword), userId]
	)
	if (updateResult.affectedRows === 0) {
		await connection.end()
		throw new Error("Failed to update password")
	}

	await connection.end()
	return true
}