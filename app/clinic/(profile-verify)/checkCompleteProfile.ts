"use server";

import { createConnection } from "@/lib/db";
import mysql from "mysql2/promise";

export async function hasCompletedClinicProfile(userId: number): Promise<boolean> {
	const connection = await createConnection();

	const [rows] = await connection.execute<mysql.RowDataPacket[]>(
		`SELECT 
			COUNT(cp.id) > 0 AS hasClinicProfile
		FROM Users u
		LEFT JOIN ClinicProfile cp ON u.id = cp.userId
		WHERE u.id = ?`,
		[userId]
	);

	await connection.end();

	if (rows.length === 0) {
		return false;
	}

	const result = rows[0] as { hasClinicProfile: number };

	return result.hasClinicProfile > 0;
}
