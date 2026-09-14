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

// Límite para las rutas de administración: ya están protegidas por token,
// pero igual conviene no dejarlas sin tope de requests.
const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// --- Perfil ---
app.get("/api/profile", (req, res) => {
  const profile = db.prepare("SELECT * FROM profile WHERE id = 1").get();
  res.json(profile || null);
});

app.put("/api/profile", requireAdmin, adminLimiter, (req, res) => {
  const allowed = [
    "name", "role", "tagline", "bio", "email", "location",
    "cv_url", "github_url", "linkedin_url", "brand_name", "brand_tagline",
  ];
  const updates = {};
  for (const key of allowed) {
    if (key in req.body) updates[key] = String(req.body[key] ?? "").slice(0, 2000);
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "Nada para actualizar." });
  }
  const setClause = Object.keys(updates).map((k) => `${k} = ?`).join(", ");
  db.prepare(`UPDATE profile SET ${setClause} WHERE id = 1`).run(...Object.values(updates));
  res.json(db.prepare("SELECT * FROM profile WHERE id = 1").get());
});

// --- Habilidades ---
app.get("/api/skills", (req, res) => {
  const skills = db.prepare("SELECT * FROM skills ORDER BY sort_order ASC").all();
  res.json(skills);
});

app.post("/api/skills", requireAdmin, adminLimiter, (req, res) => {
  const { name, category, level, sort_order } = req.body || {};
  if (!name || !category || level === undefined) {
    return res.status(400).json({ error: "Faltan campos: name, category, level." });
  }
  const lvl = Math.max(0, Math.min(100, Number(level) || 0));
  const info = db
    .prepare("INSERT INTO skills (name, category, level, sort_order) VALUES (?, ?, ?, ?)")
    .run(String(name).slice(0, 100), String(category).slice(0, 60), lvl, Number(sort_order) || 0);
  res.status(201).json({ id: info.lastInsertRowid });
});

app.put("/api/skills/:id", requireAdmin, adminLimiter, (req, res) => {
  const { name, category, level, sort_order } = req.body || {};
  if (!name || !category || level === undefined) {
    return res.status(400).json({ error: "Faltan campos: name, category, level." });
  }
  const lvl = Math.max(0, Math.min(100, Number(level) || 0));
  db.prepare("UPDATE skills SET name=?, category=?, level=?, sort_order=? WHERE id=?").run(
    String(name).slice(0, 100), String(category).slice(0, 60), lvl, Number(sort_order) || 0, req.params.id
  );
  res.json({ ok: true });
});

app.delete("/api/skills/:id", requireAdmin, adminLimiter, (req, res) => {
  db.prepare("DELETE FROM skills WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// --- Experiencia ---
app.get("/api/experience", (req, res) => {
  const experience = db
    .prepare("SELECT * FROM experience ORDER BY sort_order ASC")
    .all();
  res.json(experience);
});

app.post("/api/experience", requireAdmin, adminLimiter, (req, res) => {
  const { role, organization, start_date, end_date, description, sort_order } = req.body || {};
  if (!role || !organization || !start_date) {
    return res.status(400).json({ error: "Faltan campos: role, organization, start_date." });
  }
  const info = db
    .prepare("INSERT INTO experience (role, organization, start_date, end_date, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)")
    .run(
      String(role).slice(0, 150), String(organization).slice(0, 150),
      String(start_date).slice(0, 50), String(end_date || "").slice(0, 50),
      String(description || "").slice(0, 2000), Number(sort_order) || 0
    );
  res.status(201).json({ id: info.lastInsertRowid });
});

app.put("/api/experience/:id", requireAdmin, adminLimiter, (req, res) => {
  const { role, organization, start_date, end_date, description, sort_order } = req.body || {};
  if (!role || !organization || !start_date) {
    return res.status(400).json({ error: "Faltan campos: role, organization, start_date." });
  }
  db.prepare("UPDATE experience SET role=?, organization=?, start_date=?, end_date=?, description=?, sort_order=? WHERE id=?").run(
    String(role).slice(0, 150), String(organization).slice(0, 150),
    String(start_date).slice(0, 50), String(end_date || "").slice(0, 50),
    String(description || "").slice(0, 2000), Number(sort_order) || 0, req.params.id
  );
  res.json({ ok: true });
});

app.delete("/api/experience/:id", requireAdmin, adminLimiter, (req, res) => {
  db.prepare("DELETE FROM experience WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

// --- Logros ---
app.get("/api/achievements", (req, res) => {
  const achievements = db
    .prepare("SELECT * FROM achievements ORDER BY sort_order ASC")
    .all();
  res.json(achievements);
});

app.post("/api/achievements", requireAdmin, adminLimiter, (req, res) => {
  const { title, description, year, icon, sort_order } = req.body || {};
  if (!title) return res.status(400).json({ error: "Falta el campo title." });
  const info = db
    .prepare("INSERT INTO achievements (title, description, year, icon, sort_order) VALUES (?, ?, ?, ?, ?)")
    .run(
      String(title).slice(0, 150), String(description || "").slice(0, 1000),
      String(year || "").slice(0, 20), String(icon || "bi-award").slice(0, 50), Number(sort_order) || 0
    );
  res.status(201).json({ id: info.lastInsertRowid });
});

app.put("/api/achievements/:id", requireAdmin, adminLimiter, (req, res) => {
  const { title, description, year, icon, sort_order } = req.body || {};
  if (!title) return res.status(400).json({ error: "Falta el campo title." });
  db.prepare("UPDATE achievements SET title=?, description=?, year=?, icon=?, sort_order=? WHERE id=?").run(
    String(title).slice(0, 150), String(description || "").slice(0, 1000),
    String(year || "").slice(0, 20), String(icon || "bi-award").slice(0, 50), Number(sort_order) || 0, req.params.id
  );
  res.json({ ok: true });
});

app.delete("/api/achievements/:id", requireAdmin, adminLimiter, (req, res) => {
  db.prepare("DELETE FROM achievements WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
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

app.post("/api/projects", requireAdmin, adminLimiter, (req, res) => {
  const { title, description, image_url, tech, repo_url, demo_url, featured, sort_order } = req.body || {};
  if (!title) return res.status(400).json({ error: "Falta el campo title." });
  const info = db
    .prepare("INSERT INTO projects (title, description, image_url, tech, repo_url, demo_url, featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run(
      String(title).slice(0, 150), String(description || "").slice(0, 1000),
      String(image_url || "").slice(0, 300), String(tech || "").slice(0, 300),
      String(repo_url || "").slice(0, 300), String(demo_url || "").slice(0, 300),
      featured ? 1 : 0, Number(sort_order) || 0
    );
  res.status(201).json({ id: info.lastInsertRowid });
});

app.put("/api/projects/:id", requireAdmin, adminLimiter, (req, res) => {
  const { title, description, image_url, tech, repo_url, demo_url, featured, sort_order } = req.body || {};
  if (!title) return res.status(400).json({ error: "Falta el campo title." });
  db.prepare("UPDATE projects SET title=?, description=?, image_url=?, tech=?, repo_url=?, demo_url=?, featured=?, sort_order=? WHERE id=?").run(
    String(title).slice(0, 150), String(description || "").slice(0, 1000),
    String(image_url || "").slice(0, 300), String(tech || "").slice(0, 300),
    String(repo_url || "").slice(0, 300), String(demo_url || "").slice(0, 300),
    featured ? 1 : 0, Number(sort_order) || 0, req.params.id
  );
  res.json({ ok: true });
});

app.delete("/api/projects/:id", requireAdmin, adminLimiter, (req, res) => {
  db.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
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

app.delete("/api/messages/:id", requireAdmin, adminLimiter, (req, res) => {
  db.prepare("DELETE FROM messages WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

app.get("/", (req, res) => {
  res.send("API del portfolio funcionando. Endpoints en /api/*");
});

app.listen(PORT, () => {
  console.log(`🚀 API escuchando en http://localhost:${PORT}`);
});
