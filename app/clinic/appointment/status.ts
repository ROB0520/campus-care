"use server"

import { createConnection } from "@/lib/db"


export async function setStatus(appointmentId: number, status: 'approved' | 'completed' | 'cancelled'): Promise<'approved' | 'completed' | 'cancelled'> {
	const connection = await createConnection()

	try {
		// Update the appointment date in the database
		await connection.query(
			`UPDATE Appointments SET status = ? WHERE id = ?`,
			[status, appointmentId]
		)
	} catch (error) {
		console.error('Error updating appointment status:', error)
		throw new Error('Failed to update appointment status')
	} finally {
		// Close the connection
		await connection.end()
	}

	// Return the updated appointment status
	return status
}