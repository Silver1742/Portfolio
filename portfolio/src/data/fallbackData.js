// Se usan solo si falla el fetch a la API (por ejemplo, mientras desarrollás
// el frontend sin el backend levantado). La fuente real de la verdad es la BBDD.

export const fallbackProfile = {
  name: "Uriel Burgos",
  role: "Desarrollador Full Stack — Ciberseguridad & Servidores",
  tagline: "Si no es perfecto, no se entrega.",
  bio: "Desarrollador full stack especializado en ciberseguridad y mantenimiento de servidores. Combino el desarrollo de aplicaciones web (React, PHP, SQL) con la reparación y administración de hardware, redes y máquinas virtuales.",
  email: "urielburgos333@gmail.com",
  location: "Buenos Aires, Argentina",
  cv_url: "",
  github_url: "https://github.com/Silver1742/",
  linkedin_url: "",
  brand_name: "Burgos",
  brand_tagline: "Desarrollo web, ciberseguridad & servidores",
};

export const fallbackSkills = [
  { id: 1, name: "CSS avanzado", category: "Frontend", level: 80 },
  { id: 2, name: "HTML", category: "Frontend", level: 90 },
  { id: 3, name: "JavaScript", category: "Frontend", level: 70 },
  { id: 4, name: "React", category: "Frontend", level: 45 },
  { id: 5, name: "Bootstrap", category: "Frontend", level: 60 },
  { id: 6, name: "PHP", category: "Backend", level: 50 },
  { id: 7, name: "SQL", category: "Backend", level: 40 },
  { id: 8, name: "Herramientas de IA", category: "Herramientas", level: 70 },
];

export const fallbackExperience = [
  {
    id: 1,
    role: "Tecnicatura en Informática",
    organization: "Escuela Técnica N°5 - Mar del Plata",
    start_date: "Cursando",
    end_date: "",
    description: "Formación en desarrollo de software, bases de datos y sistemas computacionales.",
  },
  {
    id: 2,
    role: "Pasantía en reparación y mantenimiento de hardware y sistemas",
    organization: "Escuela Técnica N°5 - Mar del Plata",
    start_date: "Abril 2026",
    end_date: "Julio 2026",
    description: "Pasantía de 3 meses en mantenimiento y reparación de equipos y sistemas computacionales. Se repararon más de 120 equipos, entre ellos computadoras gubernamentales y el equipamiento completo de los salones de informática y electrónica.",
  },
];

export const fallbackAchievements = [
  {
    id: 1,
    title: "Recuperación de servidores",
    description: "Recuperé y dejé en funcionamiento los dos servidores principales de la institución.",
    year: "2026",
    icon: "bi-hdd-network",
  },
  {
    id: 2,
    title: "Más de 120 equipos reparados",
    description: "Reparación y mantenimiento de más de 120 computadoras y equipos, incluyendo equipamiento gubernamental.",
    year: "2026",
    icon: "bi-tools",
  },
  {
    id: 3,
    title: "3 aulas puestas en funcionamiento",
    description: "Dejé operativas 3 aulas de informática y electrónica con todo su equipamiento.",
    year: "2026",
    icon: "bi-building-gear",
  },
];

export const fallbackProjects = [
  {
    id: 1,
    title: "Ahorcado",
    description: "Juego del ahorcado en JavaScript puro: manejo de arrays y Sets, una clase para el estado del juego, y una API pública para traer las palabras.",
    image_url: "/img/thumb-ahorcado.svg",
    tech: ["JavaScript", "HTML", "CSS", "API"],
    repo_url: "",
    demo_url: "/demos/js6/index.html",
    featured: true,
  },
  {
    id: 2,
    title: "Gestor de Tareas",
    description: "Aplicación de lista de tareas con React Router: crear, completar y eliminar tareas, con vista de detalle y modo claro/oscuro.",
    image_url: "/img/thumb-tareas.svg",
    tech: ["React", "React Router", "Bootstrap", "Vite"],
    repo_url: "",
    demo_url: "/demos/r2/index.html",
    featured: true,
  },
  {
    id: 3,
    title: "Sistema de Usuarios",
    description: "Autenticación y gestión de usuarios: registro, login, rutas protegidas y un panel para agregar, editar y eliminar usuarios.",
    image_url: "/img/thumb-usuarios.svg",
    tech: ["React", "React Router", "Bootstrap"],
    repo_url: "",
    demo_url: "/demos/r3/index.html",
    featured: true,
  },
];
