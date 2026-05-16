const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('=== MAILER.JS CARGADO ===');
console.log('EMAIL existe:', !!process.env.EMAIL);
console.log('EMAILPASSWORD existe:', !!process.env.EMAILPASSWORD);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAILPASSWORD
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

module.exports = transporter;