"use server";

import { createConnection } from "@/lib/db";
import mysql from "mysql2/promise";

export async function hasCompletedProfile(userId: number): Promise<{ hasBasicInfo: boolean; hasHealthSurvey: boolean }> {
	const connection = await createConnection();

	const [rows] = await connection.execute<mysql.RowDataPacket[]>(
		`SELECT 
			COUNT(pi.id) > 0 AS hasBasicInfo,
			COUNT(hs.id) > 0 AS hasHealthSurvey
		FROM Users u
		LEFT JOIN PersonalInformation pi ON u.id = pi.userId
		LEFT JOIN HealthSurvey hs ON u.id = hs.userId
		WHERE u.id = ?`,
		[userId]
	);

	await connection.end();

	if (rows.length === 0) {
		return { hasBasicInfo: false, hasHealthSurvey: false };
	}

	const result = rows[0] as { hasBasicInfo: number; hasHealthSurvey: number };

	return { 
		hasBasicInfo: result.hasBasicInfo > 0, 
		hasHealthSurvey: result.hasHealthSurvey > 0 
	};
}