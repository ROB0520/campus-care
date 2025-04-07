"use server"

import { createConnection } from "@/lib/db"

export type User = {
	userId: number
	student_id: string
	firstName: string
	middleName: string | null
	lastName: string
}

export async function fetchUsers(searchQuery?: string): Promise<User[]> {
	const connection = await createConnection()
	
	const [rows] = await connection.execute(
		`SELECT userId, student_id, lastName, firstName, middleName FROM PersonalInformation `
		+ (searchQuery ? ` WHERE (lastName LIKE ? OR firstName LIKE ? OR middleName LIKE ? OR student_id LIKE ?) ` : "")
		+ `ORDER BY lastName ASC;`,
		searchQuery ? [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`] : []
	)
	
	await connection.end()

	return rows as User[]
}