import nodemailer from "nodemailer";

const {
  RESEND_API_KEY,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  CONTACT_TO_EMAIL,
  CONTACT_FROM_EMAIL,
} = process.env;

const useResend = Boolean(RESEND_API_KEY && CONTACT_TO_EMAIL);

let transporter = null;
if (!useResend && SMTP_HOST && SMTP_USER && SMTP_PASS && CONTACT_TO_EMAIL) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === "true", // true solo si usás el puerto 465
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

if (!useResend && !transporter) {
  console.warn(
    "[mail] No hay RESEND_API_KEY ni variables SMTP_* configuradas en server/.env — los mensajes se guardan en la base, pero no se envía el email de aviso."
  );
}

async function sendWithResend({ name, email, message }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
      to: CONTACT_TO_EMAIL,
      reply_to: email,
      subject: `Nuevo mensaje de contacto de ${name}`,
      html: `<p><strong>De:</strong> ${name} (${email})</p><p>${message.replace(/\n/g, "<br>")}</p>`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend respondió ${res.status}: ${body}`);
  }
}

async function sendWithSmtp({ name, email, message }) {
  await transporter.sendMail({
    from: CONTACT_FROM_EMAIL || SMTP_USER,
    to: CONTACT_TO_EMAIL,
    replyTo: email,
    subject: `Nuevo mensaje de contacto de ${name}`,
    text: `De: ${name} <${email}>\n\n${message}`,
    html: `<p><strong>De:</strong> ${name} (${email})</p><p>${message.replace(/\n/g, "<br>")}</p>`,
  });
}

export async function sendContactNotification({ name, email, message }) {
  if (useResend) {
    await sendWithResend({ name, email, message });
    return { sent: true, via: "resend" };
  }
  if (transporter) {
    await sendWithSmtp({ name, email, message });
    return { sent: true, via: "smtp" };
  }
  return { sent: false, reason: "No hay ningún proveedor de email configurado" };
}
