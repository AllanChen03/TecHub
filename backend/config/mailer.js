const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('=== MAILER.JS CARGADO ===');
console.log('EMAIL existe:', !!process.env.EMAIL);
console.log('EMAILPASSWORD existe:', !!process.env.EMAILPASSWORD);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAILPASSWORD
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

transporter.verify()
  .then(() => {
    console.log('Listo para enviar correos de verificación');
  })
  .catch((error) => {
    console.error('Error configurando el correo:', error.message);
    console.error('Código:', error.code);
  });

module.exports = transporter;