const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Use true for port 465, false for all other ports
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

function sendOtpMail(email, otp) {
  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject: "Verification code from Aura candle studio",
    html:`OTP is ${otp}`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(`Error occurred while sending mail: ${err}`);
    } else {
      console.log("Email sent successfully");
    }
  });
}


module.exports =  sendOtpMail