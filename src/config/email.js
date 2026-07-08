import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log({
	host: process.env.EMAIL_HOST,
	port: process.env.EMAIL_PORT,
	user: process.env.EMAIL_USER,
	pass: process.env.EMAIL_PASS,
});

export const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST,
	port: Number(process.env.EMAIL_PORT),
	secure: false,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

transporter.verify((error, _) => {
	if (error) {
		console.error(error);
	} else {
		console.log('Servidor SMTP listo');
	}
});
