import nodemailer from "nodemailer";

const createTransporter = async () => {
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "lukas70@ethereal.email",
      pass: "ua4Byzu96CpBasaYJR",
    },
  });
};

export default createTransporter;
