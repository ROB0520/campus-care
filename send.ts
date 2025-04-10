import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
	host: 'vps.aleczr.link',
	port: 1025,
	secure: false,
})

transporter.sendMail({
	from: 'hi@clinic.edu',
	to: 'students@school.edu',
	subject: 'Test Email',
	text: 'This is a test email sent from the server.',
}).then((info) => {
	console.log('Email sent: ' + info.response)
})