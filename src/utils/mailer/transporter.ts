import nodemailer from "nodemailer";


const createTransporter = async () => {
	
	return nodemailer.createTransport({
		host: 'smtp.ethereal.email',
		port: 587,
		auth: {
			user: 'abe.lockman34@ethereal.email',
			pass: '5xjFKRUr8HUfdPw7wV'
		}
	})
};


export default createTransporter;
