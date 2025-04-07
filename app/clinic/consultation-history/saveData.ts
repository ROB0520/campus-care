'use server'

import { createConnection } from "@/lib/db";

export async function saveData(data: object) {
	const connection = await createConnection();

	await connection.query(`INSERT INTO consultationhistory SET ?`, data);
}
