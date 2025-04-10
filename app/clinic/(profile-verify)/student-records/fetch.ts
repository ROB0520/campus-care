"use server"

import { createConnection } from "@/lib/db"

export type User = {
	userId: number
	studentId: string
	firstName: string
	middleName: string | null
	lastName: string
}

export async function fetchUsers(searchQuery?: string): Promise<User[]> {
	const connection = await createConnection()
	
	const [rows] = await connection.execute(
		`SELECT userId, studentId, lastName, firstName, middleName FROM PersonalInformation `
		+ (searchQuery ? ` WHERE (lastName LIKE ? OR firstName LIKE ? OR middleName LIKE ? OR studentId LIKE ?) ` : "")
		+ `ORDER BY lastName ASC;`,
		searchQuery ? [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`] : []
	)
	
	await connection.end()

	return rows as User[]
}