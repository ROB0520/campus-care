"use server"

import { createConnection } from "@/lib/db"
import { mailTransporter } from "@/lib/mail";
import EmergencyEmail from "@/mail/emergency";
import { render } from "@react-email/components";
import { RowDataPacket } from "mysql2";
import React from "react";


export async function sendEmergency(userId: string): Promise<boolean> {
	const connection = await createConnection()
	
	const [rows] = await connection.execute<RowDataPacket[]>(
		`SELECT 
			pi.firstName, 
			pi.lastName, 
			pi.emEmail AS emergencyEmail 
		FROM PersonalInformation pi 
		WHERE pi.userId = ?`,
		[userId]
	);
	
	if (rows.length === 0) {
		await connection.end()
		throw new Error("No personal information found for this user")
	}

	await connection.end()

	const personalInfo = rows[0]

	await mailTransporter.sendMail({
		to: personalInfo.emergencyEmail,
		subject: "Emergency Contact Alert",
		html: await render(React.createElement(EmergencyEmail, { studentName: `${personalInfo.firstName} ${personalInfo.lastName}` })),
	})


	return true
}