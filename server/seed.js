import { db } from "./db.js";

// Datos reales de Uriel Burgos. Volvé a correr "npm run seed" cada vez
// que edites este archivo (borra y vuelve a cargar todo).

db.exec(`
DELETE FROM profile;
DELETE FROM skills;
DELETE FROM experience;
DELETE FROM achievements;
DELETE FROM projects;
`);

db.prepare(`
  INSERT INTO profile (id, name, role, tagline, bio, email, location, cv_url, github_url, linkedin_url, brand_name, brand_tagline)
  VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  "Uriel Burgos",
  "Desarrollador Full Stack — Ciberseguridad & Servidores",
  "Si no es perfecto, no se entrega.",
  "Desarrollador full stack especializado en ciberseguridad y mantenimiento de servidores. Combino el desarrollo de aplicaciones web (React, PHP, SQL) con la reparación y administración de hardware, redes y máquinas virtuales.",
  "urielburgos333@gmail.com",
  "Buenos Aires, Argentina",
  "", // TODO: poner "/cv.pdf" cuando subas tu CV a portfolio/public/
  "https://github.com/Silver1742/",
  "", // sin LinkedIn
  "Burgos",
  "Desarrollo web, ciberseguridad & servidores"
);

const skills = [
  // Frontend
  ["CSS avanzado", "Frontend", 80],
  ["HTML", "Frontend", 90],
  ["JavaScript", "Frontend", 70],
  ["React", "Frontend", 45], // asumido: dijiste "medio/bajo", ajustalo si querés
  ["Tailwind CSS", "Frontend", 55], // asumido: no diste número, ajustalo
  ["Bootstrap", "Frontend", 60],
  // Backend
  ["PHP", "Backend", 50],
  ["SQL", "Backend", 40],
  // Herramientas
  ["Vite", "Herramientas", 25], // asumido, dijiste que no sabías bien qué es
  ["Herramientas de IA", "Herramientas", 70], // asumido "medio/avanzado", ajustalo si querés otro número
  ["Claude (IA)", "Herramientas", 30], // en aprendizaje específicamente en Claude
  // Hardware y Servidores
  ["Hardware (PC / notebook)", "Hardware y Servidores", 60],
  ["Administración de servidores", "Hardware y Servidores", 40],
  ["Máquinas virtuales", "Hardware y Servidores", 60],
];
const insSkill = db.prepare(
  "INSERT INTO skills (name, category, level, sort_order) VALUES (?, ?, ?, ?)"
);
skills.forEach(([name, category, level], i) => insSkill.run(name, category, level, i));

const experience = [
  [
    "Tecnicatura en Informática",
    "Escuela Técnica N°5 - Mar del Plata",
    "Cursando",
    "",
    "Formación en desarrollo de software, bases de datos y sistemas computacionales.",
  ],
  [
    "Pasantía en reparación y mantenimiento de hardware y sistemas",
    "Escuela Técnica N°5 - Mar del Plata", // asumo que es la misma institución, avisame si no
    "Abril 2026",
    "Julio 2026",
    "Pasantía de 3 meses en mantenimiento y reparación de equipos y sistemas computacionales. Se repararon más de 120 equipos, entre ellos computadoras gubernamentales y el equipamiento completo de los salones de informática y electrónica. También se realizó mantenimiento de redes y de los dos servidores principales de la institución.",
  ],
];
const insExp = db.prepare(
  "INSERT INTO experience (role, organization, start_date, end_date, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)"
);
experience.forEach(([role, org, start, end, desc], i) => insExp.run(role, org, start, end, desc, i));

const achievements = [
  [
    "Recuperación de servidores",
    "Recuperé y dejé en funcionamiento los dos servidores principales de la institución.",
    "2026",
    "bi-hdd-network",
  ],
  [
    "Más de 120 equipos reparados",
    "Reparación y mantenimiento de más de 120 computadoras y equipos, incluyendo equipamiento gubernamental.",
    "2026",
    "bi-tools",
  ],
  [
    "3 aulas puestas en funcionamiento",
    "Dejé operativas 3 aulas de informática y electrónica con todo su equipamiento.",
    "2026",
    "bi-building-gear",
  ],
];
const insAch = db.prepare(
  "INSERT INTO achievements (title, description, year, icon, sort_order) VALUES (?, ?, ?, ?, ?)"
);
achievements.forEach(([title, desc, year, icon], i) => insAch.run(title, desc, year, icon, i));

const projects = [
  [
    "Ahorcado",
    "Juego del ahorcado en JavaScript puro: manejo de arrays y Sets, una clase para el estado del juego, y una API pública para traer las palabras. Guarda el puntaje y la tabla de posiciones en el navegador.",
    "/img/thumb-ahorcado.svg",
    "JavaScript,HTML,CSS,API",
    "", // TODO: link al repo
    "/demos/js6/index.html",
    1,
  ],
  [
    "Gestor de Tareas",
    "Aplicación de lista de tareas con React Router: crear tareas, marcarlas como completadas o pendientes, ver el detalle de cada una y eliminarlas con confirmación. Modo claro/oscuro incluido.",
    "/img/thumb-tareas.svg",
    "React,React Router,Bootstrap,Vite",
    "", // TODO: link al repo
    "/demos/r2/index.html",
    1,
  ],
  [
    "Sistema de Usuarios",
    "Sistema de autenticación y gestión de usuarios: registro, login, rutas protegidas y un panel para agregar, editar y eliminar usuarios. Probalo con el usuario de prueba test@test.com / 123456, o registrando uno nuevo.",
    "/img/thumb-usuarios.svg",
    "React,React Router,Bootstrap",
    "", // TODO: link al repo
    "/demos/r3/index.html",
    1,
  ],
];
const insProj = db.prepare(
  "INSERT INTO projects (title, description, image_url, tech, repo_url, demo_url, featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);
projects.forEach(([title, desc, img, tech, repo, demo, featured], i) =>
  insProj.run(title, desc, img, tech, repo, demo, featured, i)
);

console.log("✅ Base de datos cargada con los datos de Uriel Burgos.");
