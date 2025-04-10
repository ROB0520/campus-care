'use server'

import { createConnection } from "@/lib/db"
import { RowDataPacket } from "mysql2"
import { hashPassword } from "@/lib/utils"

export async function updatePassword(userId: string, currentPassword: string, newPassword: string) {
	const connection = await createConnection()

	const [userCheck] = await connection.query<RowDataPacket[]>(
		"SELECT * FROM Users WHERE id = ? AND password = ?",
		[userId, hashPassword(currentPassword)]
	)
	if (userCheck.length === 0) {
		await connection.end()
		throw new Error("Current password is incorrect")
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [updateResult]: any = await connection.query(
		"UPDATE Users SET password = ? WHERE id = ?",
		[hashPassword(newPassword), userId]
	)
	if (updateResult.affectedRows === 0) {
		await connection.end()
		throw new Error("Failed to update password")
	}

	await connection.end()
	return true
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateProfile(data: any, userId: number, password: string) {
	const connection = await createConnection()
	const { firstName, lastName, middleName, email } = data
	
	try {
		// Verify the user's password before allowing profile update
		const [userCheck] = await connection.query<RowDataPacket[]>(
			"SELECT * FROM Users WHERE id = ? AND password = ?",
			[userId, hashPassword(password)]
		);

		if (userCheck.length === 0) {
			await connection.end();
			throw new Error("Incorrect password. Profile update failed");
		}

		// Update user profile information
		await connection.query(
			"UPDATE Users SET email = ? WHERE id = ?",
			[email, userId]
		);

		// Check if clinic profile exists
		const [existingProfile] = await connection.query<RowDataPacket[]>(
			"SELECT * FROM AdminProfile WHERE userId = ?",
			[userId]
		);
		
		if (existingProfile.length > 0) {
			// Update existing profile
			const [updateResult] = await connection.query(
				"UPDATE AdminProfile SET firstName = ?, lastName = ?, middleName = ? WHERE userId = ?",
				[firstName, lastName, middleName, userId]
			);
			
			if (!updateResult) {
				throw new Error("Failed to update clinic profile");
			}
			
			await connection.end()
			return { success: true, message: "Profile updated successfully" };
		} else {
			// Create new profile
			const [insertResult] = await connection.query(
				"INSERT INTO AdminProfile (userId, firstName, lastName, middleName) VALUES (?, ?, ?, ?)",
				[userId, firstName, lastName, middleName]
			);
			
			if (!insertResult) {
				throw new Error("Failed to create clinic profile");
			}
			
			await connection.end()
			return { success: true, message: "Profile created successfully" };
		}
	} catch (error) {
		console.error("Error managing clinic profile:", error);
		throw new Error("Failed to save clinic profile");
	}
}