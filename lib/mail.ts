import nodemailer from 'nodemailer'

export const mailTransporter = nodemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: Number(process.env.MAIL_PORT),
	secure: process.env.MAIL_SECURE === 'true',
}, {
	from: 'system@clinic.edu',
})
