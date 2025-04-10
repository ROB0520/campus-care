'use server'

import { createConnection } from "@/lib/db"
import { RowDataPacket } from "mysql2"
import { hashPassword } from "@/lib/utils"
import { mailTransporter } from "@/lib/mail"
import ResetTokenEmail from "@/mail/reset-token";
import React from "react";
import { render } from "@react-email/components"

export async function resetPassword(userId: string, newPassword: string, token: string) {
	const connection = await createConnection()

	const [userCheck] = await connection.query<RowDataPacket[]>(
		"SELECT * FROM PasswordReset WHERE userId = ? AND resetToken = ?",
		[userId, token]
	)
	if (userCheck.length === 0) {
		await connection.end()
		throw new Error("Invalid or expired token")
	}

	const tokenExpiry = new Date(userCheck[0].tokenExpiry)
	if (tokenExpiry < new Date()) {
		await connection.end()
		throw new Error("Invalid or expired token")
	}

	// Delete the token after use
	await connection.query("DELETE FROM PasswordReset WHERE userId = ?", [userId])

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

export async function sendResetEmail(email: string) {
	const connection = await createConnection()

	const [userCheck] = await connection.query<RowDataPacket[]>(
		"SELECT * FROM Users WHERE email = ?",
		[email]
	)
	if (userCheck.length === 0) {
		await connection.end()
		return true // Don't reveal if the email exists for security reasons
	}

	const userId = userCheck[0].id
	const resetToken = Math.random().toString(36).substring(2, 15) // Generate a random token
	const resetLink = `${process.env.AUTH_URL}/forgot-password/${resetToken}/${userId}`

	await connection.query(
		"INSERT INTO PasswordReset (userId, resetToken, tokenExpiry) VALUES (?, ?, ?)",
		[userId, resetToken, new Date(Date.now() + 3600000)] // Token expires in 1 hour
	)
	const emailHtml = await render(React.createElement(ResetTokenEmail, { resetLink }));

	await mailTransporter.sendMail({
		to: email,
		subject: "Password Reset",
		html: emailHtml
		// html: `<p>Click the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`,
	}).catch(async (error) => {
		await connection.end()
		console.error("Error sending email:", error)
		throw new Error("Failed to send email")
	})

	await connection.end()

	return true
}

export async function verifyResetToken(token: string, userId: string) {
	const connection = await createConnection()

	const [tokenCheck] = await connection.query<RowDataPacket[]>(
		"SELECT * FROM PasswordReset WHERE resetToken = ? AND userId = ?",
		[token, userId]
	)
	if (tokenCheck.length === 0) {
		await connection.end()		
		throw new Error("Invalid or expired token")
	}

	const tokenExpiry = new Date(tokenCheck[0].tokenExpiry)
	if (tokenExpiry < new Date()) {
		await connection.end()
		console.log('Invalid token check:', tokenCheck);
		
		throw new Error("Token has expired")
	}

	await connection.end()
	return true
}