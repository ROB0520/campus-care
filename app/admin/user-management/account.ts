'use server'

import { createConnection } from "@/lib/db"
import { RowDataPacket } from "mysql2"
import { mailTransporter } from "@/lib/mail"
import ResetTokenEmail from "@/mail/reset-token";
import React from "react";
import { render } from "@react-email/components"

export async function toggleLock(userId: string) {
	const connection = await createConnection()

	const [rows] = await connection.query<RowDataPacket[]>(
		"SELECT isLocked FROM Users WHERE id = ?",
		[userId]
	);

	if (rows.length === 0) {
		await connection.end();
		throw new Error("User not found");
	}

	const isLocked = rows[0].isLocked;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [updateResult]: any = await connection.query(
		"UPDATE Users SET isLocked = ? WHERE id = ?",
		[!isLocked, userId]
	)

	if (updateResult.affectedRows === 0) {
		await connection.end()
		throw new Error("Failed to update user lock status")
	}

	await connection.end()
	return true
}

export async function sendResetEmail(email: string) {
	const connection = await createConnection()

	const [userCheck] = await connection.query<RowDataPacket[]>(
		"SELECT * FROM Users WHERE email = ?",
		[email]
	)
	if (userCheck.length === 0) {
		await connection.end()
		throw new Error("User not found")
	}

	const userId = userCheck[0].id
	const resetToken = Math.random().toString(36).substring(2, 15) // Generate a random token
	const resetLink = `${process.env.AUTH_URL}/forgot-password/${resetToken}/${userId}`

	await connection.query(
		"INSERT INTO PasswordReset (userId, reset_token, token_expiry) VALUES (?, ?, ?)",
		[userId, resetToken, new Date(Date.now() + 3600000)] // Token expires in 1 hour
	)
	const emailHtml = await render(React.createElement(ResetTokenEmail, { resetLink }));

	await mailTransporter.sendMail({
		to: email,
		subject: "Password Reset",
		html: emailHtml
	}).catch(async (error) => {
		await connection.end()
		console.error("Error sending email:", error)
		throw new Error("Failed to send email")
	})

	await connection.end()

	return true
}