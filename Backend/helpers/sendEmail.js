import nodemailer from "nodemailer";

export const sendConfirmationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Puedes usar otro servicio como SendGrid
    host: "smtp.gmail.com",
    port: 465, // Cambia a 465
    secure: true, // Usa SSL
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Evita errores de certificado
    },
  });

  const mailOptions = {
    from: `"Tu Aplicación" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Confirma tu cuenta",
    html: `
    <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
    <h2 style="color: #333; text-align: center;">Confirma tu cuenta</h2>
    <p style="font-size: 16px; color: #555;">¡Gracias por registrarte! Para activar tu cuenta, haz clic en el siguiente botón:</p>
    <div style="text-align: center; font-size: 20px; margin: 20px 0;">
      <a href="http://localhost:5173/confirmar/${token}">Confirmar Cuenta</a>
    </div>
      <p style="font-size: 14px; text-align: center; color: #777;">Si no solicitaste esta cuenta, puedes ignorar este mensaje.</p>
      <p style="text-align: center; font-size: 12px; color: #aaa;">&copy; 2024 Tu Aplicación. Todos los derechos reservados.</p>
    </div>  
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Correo de confirmación enviado");
  } catch (error) {
    console.error("Error enviando correo:", error);
  }
};