import nodemailer from "nodemailer";

const emailRegistro = async (datos) => {
  var transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { email, user, token } = datos;

  //Enviando el email
  const info = await transporter.sendMail({
    from: "Tu Futbol Favorito",
    to: email,
    subject: "Verifica tu cuenta de TFF",
    text: "Verifica tu cuenta de TFF",
    html: `<div style="font-family: Arial, sans-serif; background:#f7f7f7; padding:20px;">
    <div style="max-width:600px; margin:auto; background:#fff; padding:20px; border-radius:8px;">
      <h2 style="color:#333; text-align:center;">Hola ${user}!</h2>
      <p style="font-size:16px; color:#555; text-align:center;">
        Para confirmar tu cuenta haz click en este enlace:
      </p>
      <p style="text-align:center; margin:30px 0;">
        <a href="${process.env.FRONTEND_URL}/confirm/${token}" 
           style="background:#F57627; color:#fff; text-decoration:none; 
                  padding:12px 24px; border-radius:4px; display:inline-block;">
          Confirmar Cuenta
        </a>
      </p>
      <p style="font-size:14px; text-align:center; color:#999;">
        Si vos no creaste esta cuenta puedes ignorar este mensaje.
      </p>
    </div>
  </div>
            `,
  });
};

export default emailRegistro;