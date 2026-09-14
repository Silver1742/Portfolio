import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { db } from "./db.js";
import { sendContactNotification } from "./mail.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.disable("x-powered-by");
app.use(helmet());

// En producción, definí CLIENT_URL con la URL real de tu frontend para
// restringir quién puede llamar a esta API. Sin esa variable, queda abierta
// (cómodo en desarrollo local).
const corsOptions = process.env.CLIENT_URL
  ? { origin: process.env.CLIENT_URL }
  : {};
app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb" }));

// Límite de envíos del formulario de contacto: máximo 5 mensajes cada
// 15 minutos por IP, para evitar spam y abuso de tu cuenta de email.
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados mensajes enviados. Probá de nuevo más tarde." },
});

// Protege /api/messages (lectura): requiere el token que vos definas en
// ADMIN_TOKEN. Sin esa variable configurada, el endpoint queda cerrado
// por defecto — nadie más que vos puede ver los mensajes recibidos.
function requireAdmin(req, res, next) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    return res.status(503).json({ error: "Endpoint no disponible: falta configurar ADMIN_TOKEN." });
  }
  const auth = req.headers.authorization || "";
  if (auth !== `Bearer ${token}`) {
    return res.status(401).json({ error: "No autorizado." });
  }
  next();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// --- Perfil ---
app.get("/api/profile", (req, res) => {
  const profile = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  res.json(profile || null);
});

// --- Habilidades ---
app.get("/api/skills", (req, res) => {
  const skills = db.prepare("SELECT * FROM skills ORDER BY sort_order ASC").all();
  res.json(skills);
});

// --- Experiencia ---
app.get("/api/experience", (req, res) => {
  const experience = db
    .prepare("SELECT * FROM experience ORDER BY sort_order ASC")
    .all();
  res.json(experience);
});

// --- Logros ---
app.get("/api/achievements", (req, res) => {
  const achievements = db
    .prepare("SELECT * FROM achievements ORDER BY sort_order ASC")
    .all();
  res.json(achievements);
});

// --- Proyectos ---
app.get("/api/projects", (req, res) => {
  const projects = db
    .prepare("SELECT * FROM projects ORDER BY sort_order ASC")
    .all();
  const parsed = projects.map((p) => ({
    ...p,
    tech: p.tech ? p.tech.split(",").map((t) => t.trim()) : [],
    featured: !!p.featured,
  }));
  res.json(parsed);
});

// --- Mensajes de contacto ---
app.post("/api/messages", contactLimiter, async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Faltan campos: name, email y message son obligatorios." });
  }
  if (
    name.length > 100 ||
    email.length > 150 ||
    message.length > 2000
  ) {
    return res.status(400).json({ error: "Alguno de los campos es demasiado largo." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "El email no es válido." });
  }

  const stmt = db.prepare(
    "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)"
  );
  const info = stmt.run(name.trim(), email.trim(), message.trim());

  let emailResult = { sent: false };
  try {
    emailResult = await sendContactNotification({ name, email, message });
  } catch (err) {
    console.error("[mail] Error enviando la notificación por email:", err.message);
  }

  res.status(201).json({ id: info.lastInsertRowid, ok: true, emailSent: emailResult.sent });
});

// Lectura de mensajes: protegida con ADMIN_TOKEN (ver server/.env.example)
app.get("/api/messages", requireAdmin, (req, res) => {
  const messages = db
    .prepare("SELECT * FROM messages ORDER BY created_at DESC")
    .all();
  res.json(messages);
});

app.get("/", (req, res) => {
  res.send("API del portfolio funcionando. Endpoints en /api/*");
});

app.listen(PORT, () => {
  console.log(`🚀 API escuchando en http://localhost:${PORT}`);
});
