"use server"

import { createConnection } from "@/lib/db"
import { mailTransporter } from "@/lib/mail"
import mysql from 'mysql2/promise'
import AppointmentApprovedEmail from "@/mail/appointment-approved"
import AppointmentCancelledEmail from "@/mail/appointment-cancelled"
import AppointmentRescheduledEmail from "@/mail/appointment-rescheduled"
import AppointmentCompletedEmail from "@/mail/appointment-completed"
import AppointmentReminderEmail from "@/mail/appointment-reminder"
import React from "react"
import { render } from "@react-email/components"


export async function sendAppointmentNotification(appointmentId: number, type: string, oldTimestamp?: number) {
	const connection = await createConnection()

	const [rows] = await connection.query<mysql.RowDataPacket[]>(
		`SELECT p.firstName, p.middleName, p.lastName, a.appointmentTimestamp, u.email
		 FROM Appointments a
		 JOIN PersonalInformation p ON a.userId = p.userId
		 JOIN Users u ON a.userId = u.id
		 WHERE a.id = ?`,
		[appointmentId]
	)
	const appointment = rows[0] as { firstName: string; middleName: string | null; lastName: string; appointmentTimestamp: number; email: string }
	if (!appointment) {
		await connection.end()
		throw new Error("Appointment not found")
	}

	const currentTimestamp = Math.floor(Date.now() / 1000);

	switch (type) {
		case "approved":
			await mailTransporter.sendMail({
				to: appointment.email,
				subject: "Appointment Approved",
				html: await render(React.createElement(AppointmentApprovedEmail, { timestamp: appointment.appointmentTimestamp })),
			})

			// Create notification record
			await connection.query(
				`INSERT INTO AppointmentNotifications (userId, type, appointmentId, notificationTimestamp, isRead)
				 SELECT userId, ?, id, ?, FALSE FROM Appointments WHERE id = ?`,
				[type, currentTimestamp, appointmentId]
			)
			break
		case "cancelled":
			await mailTransporter.sendMail({
				to: appointment.email,
				subject: "Appointment Cancelled",
				html: await render(React.createElement(AppointmentCancelledEmail, { timestamp: currentTimestamp })),
			})
			
			// Create notification record
			await connection.query(
				`INSERT INTO AppointmentNotifications (userId, type, appointmentId, notificationTimestamp, isRead)
				 SELECT userId, ?, id, ?, FALSE FROM Appointments WHERE id = ?`,
				[type, currentTimestamp, appointmentId]
			)
			break
		case "rescheduled":
			if (!oldTimestamp) {
				await connection.end()
				throw new Error("Old timestamp is required for rescheduling")
			}

			await mailTransporter.sendMail({
				to: appointment.email,
				subject: "Appointment Rescheduled",
				html: await render(React.createElement(AppointmentRescheduledEmail, { oldTimestamp, newTimestamp: appointment.appointmentTimestamp })),
			})
			
			// Create notification record
			await connection.query(
				`INSERT INTO AppointmentNotifications (userId, type, appointmentId, notificationTimestamp, isRead)
				 SELECT userId, ?, id, ?, FALSE FROM Appointments WHERE id = ?`,
				[type, currentTimestamp, appointmentId]
			)
			break
		case "completed":
			await mailTransporter.sendMail({
				to: appointment.email,
				subject: "Appointment Completed",
				html: await render(React.createElement(AppointmentCompletedEmail, { timestamp: appointment.appointmentTimestamp })),
			})

			await connection.query(
				`INSERT INTO AppointmentNotifications (userId, type, appointmentId, notificationTimestamp, isRead)
				 SELECT userId, ?, id, ?, FALSE FROM Appointments WHERE id = ?`,
				[type, currentTimestamp, appointmentId]
			)
			break
		case "reminder":
			await mailTransporter.sendMail({
				to: appointment.email,
				subject: "Appointment Reminder",
				html: await render(React.createElement(AppointmentReminderEmail, { timestamp: appointment.appointmentTimestamp })),
			})

			await connection.query(
				`INSERT INTO AppointmentNotifications (userId, type, appointmentId, notificationTimestamp, isRead)
				 SELECT userId, ?, id, ?, FALSE FROM Appointments WHERE id = ?`,
				[type, currentTimestamp, appointmentId]
			)
			break
	}

	// Don't forget to close the connection
	await connection.end();

}