# Portfolio personal — Burgos

Sitio de una sola página (SPA) con backend propio, base de datos SQL y
formulario de contacto que envía un email real.

## Estructura

```
portfolio-proyecto/
├── portfolio/   → Frontend (React + Vite + Bootstrap)
└── server/      → Backend (Node + Express + node:sqlite)
```

## 1. Backend (API + Base de datos + Email)

```bash
cd server
npm install
cp .env.example .env
```

Editá `server/.env` y completá las variables `SMTP_*` y `CONTACT_TO_EMAIL`
(instrucciones para Brevo o Gmail dentro del propio archivo `.env.example`).
Sin esto, el formulario sigue guardando los mensajes en la base de datos,
pero no te va a llegar el email de aviso.

```bash
npm run seed     # crea server/portfolio.sqlite con datos de ejemplo
npm run dev      # levanta la API en http://localhost:4000
```

Editá `server/seed.js` con tus datos reales (nombre, bio, habilidades,
experiencia, logros, proyectos, y los campos `brand_name` / `brand_tagline`
si querés cambiar el nombre de marca) y volvé a correr `npm run seed`
cada vez que lo cambies.

## 2. Frontend

En **otra terminal**, sin cerrar la anterior:

```bash
cd portfolio
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:4000
npm run dev
```

Abrí la URL que te muestre la terminal (por defecto `http://localhost:5173`).

## 3. Personalización

- **Imágenes**: reemplazá los placeholders SVG en `portfolio/public/img/`
  por tus fotos/capturas reales, y actualizá las rutas en `server/seed.js`.
- **CV**: el botón "Descargar CV" está oculto hasta que subas un PDF real.
  Poné el archivo en `portfolio/public/cv.pdf` y cambiá `cv_url` en
  `server/seed.js` a `"/cv.pdf"`.
- **Marca (Burgos)**: el nombre de marca que aparece en el navbar, el
  hero y el footer sale de `brand_name` / `brand_tagline` en la tabla
  `profile` — se edita en `server/seed.js`, no hay nada hardcodeado en el
  código.
- **Proyectos**: agregá cada uno como una fila más en el array `projects`
  de `server/seed.js` (título, descripción, tecnologías, link al repo,
  link a demo, imagen) y corré `npm run seed` de nuevo.

## 4. Antes de desplegar

Corré `npm run build` dentro de `portfolio/` para generar la carpeta
`dist/` — es lo que se sube al hosting del frontend. El `server/` se
despliega aparte, con las mismas variables de entorno configuradas en
el panel del hosting (no subas nunca el archivo `.env`).
