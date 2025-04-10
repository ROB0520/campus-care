/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { createConnection } from "@/lib/db"

export type User = {
	userId: number
	student_id: string
	firstName: string
	middleName: string | null
	lastName: string
	role: number
	email: string
	position?: string
	isLocked: boolean
}

export async function fetchUsers(searchQuery?: string): Promise<User[]> {
	const connection = await createConnection()

	const [studentRows]: any[] = await connection.query(
		`SELECT userId, lastName, firstName FROM PersonalInformation `
		+ (searchQuery ? ` WHERE (lastName LIKE ? OR firstName LIKE ? OR userId LIKE ?);` : ";"),
		searchQuery ? [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`] : []
	)

	const [clinicRows]: any[] = await connection.query(
		`SELECT userId, lastName, firstName, position FROM ClinicProfile `
		+ (searchQuery ? ` WHERE (lastName LIKE ? OR firstName LIKE ? OR userId LIKE ?);` : ";"),
		searchQuery ? [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`] : []
	)

	const [adminRows]: any[] = await connection.query(
		`SELECT userId, lastName, firstName FROM AdminProfile `
		+ (searchQuery ? ` WHERE (lastName LIKE ? OR firstName LIKE ? OR userId LIKE ?);` : ";"),
		searchQuery ? [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`] : []
	)

	const [emailRows]: any[] = await connection.query(
		`SELECT id, isLocked, email FROM Users `
		+ (searchQuery ? ` WHERE (email LIKE ?);` : ";"),
		searchQuery ? [`%${searchQuery}%`] : []
	)

	const userRows = [
		...studentRows.map((row: any) => ({
			...row,
			role: 0,
			email: emailRows.find((e: any) => e.id === row.userId)?.email,
			isLocked: emailRows.find((e: any) => e.id === row.userId)?.isLocked ?? false,
		})),
		...clinicRows.map((row: any) => ({
			...row,
			role: 1,
			email: emailRows.find((e: any) => e.id === row.userId)?.email,
			isLocked: emailRows.find((e: any) => e.id === row.userId)?.isLocked ?? false,
		})),
		...adminRows.map((row: any) => ({
			...row,
			role: 2,
			email: emailRows.find((e: any) => e.id === row.userId)?.email,
			isLocked: emailRows.find((e: any) => e.id === row.userId)?.isLocked ?? false,
		})),
	]
	.sort((a, b) => {
		const lastNameComparison = a.lastName.toLowerCase().localeCompare(b.lastName.toLowerCase());
		if (lastNameComparison !== 0) {
			return lastNameComparison;
		}
		return a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase());
	});

	await connection.end()

	return userRows as User[]
}