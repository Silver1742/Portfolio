// Panel de administración — página estática separada del sitio público.
// Autenticación: un token compartido (el mismo ADMIN_TOKEN del backend),
// guardado solo en sessionStorage (se borra al cerrar la pestaña).

// Si cambiás la URL de tu API en producción, actualizá esta línea.
const API_URL = window.location.hostname === "localhost"
  ? "http://localhost:4000"
  : "https://portfolio-o3jd.onrender.com";

const TOKEN_KEY = "admin_token";

function esc(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
  if (res.status === 401 || res.status === 503) {
    sessionStorage.removeItem(TOKEN_KEY);
    showLogin("Tu sesión venció o el token ya no es válido. Volvé a ingresar.");
    throw new Error("No autorizado");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function showConfirm(message) {
  return new Promise((resolve) => {
    const backdrop = document.getElementById("confirmModal");
    document.getElementById("confirmMessage").textContent = message;
    backdrop.classList.remove("d-none");

    function cleanup(result) {
      backdrop.classList.add("d-none");
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      backdrop.removeEventListener("click", onBackdrop);
      resolve(result);
    }
    const okBtn = document.getElementById("confirmOk");
    const cancelBtn = document.getElementById("confirmCancel");
    function onOk() { cleanup(true); }
    function onCancel() { cleanup(false); }
    function onBackdrop(e) { if (e.target === backdrop) cleanup(false); }
    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
    backdrop.addEventListener("click", onBackdrop);
  });
}

function showStatus(message, type = "ok") {
  const el = document.getElementById("statusMsg");
  el.textContent = message;
  el.className = `alert-floating ${type}`;
  setTimeout(() => el.classList.add("d-none"), 3000);
}

// ============================================================
// LOGIN
// ============================================================
function showLogin(error) {
  document.getElementById("dashboard").classList.add("d-none");
  document.getElementById("loginScreen").classList.remove("d-none");
  const errEl = document.getElementById("loginError");
  if (error) {
    errEl.textContent = error;
    errEl.classList.remove("d-none");
  } else {
    errEl.classList.add("d-none");
  }
}

async function showDashboard() {
  document.getElementById("loginScreen").classList.add("d-none");
  document.getElementById("dashboard").classList.remove("d-none");
  await loadProfile();
  await renderTable("skills");
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = document.getElementById("tokenInput").value.trim();
  if (!token) return;
  sessionStorage.setItem(TOKEN_KEY, token);
  try {
    await apiFetch("/api/messages"); // valida el token
    showDashboard();
  } catch {
    sessionStorage.removeItem(TOKEN_KEY);
    document.getElementById("loginError").textContent = "Token inválido.";
    document.getElementById("loginError").classList.remove("d-none");
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem(TOKEN_KEY);
  showLogin();
});

// ============================================================
// TABS
// ============================================================
document.querySelectorAll(".admin-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".admin-tab").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".admin-panel").forEach((p) => p.classList.add("d-none"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    document.getElementById(`panel-${tab}`).classList.remove("d-none");
    if (tab === "skills") renderTable("skills");
    else if (tab === "experience") renderTable("experience");
    else if (tab === "achievements") renderTable("achievements");
    else if (tab === "projects") renderTable("projects");
    else if (tab === "messages") renderMessages();
  });
});

// ============================================================
// PERFIL
// ============================================================
const PROFILE_FIELDS = [
  { key: "name", label: "Nombre completo", type: "text" },
  { key: "role", label: "Rol", type: "text" },
  { key: "tagline", label: "Tagline (frase corta)", type: "text" },
  { key: "bio", label: "Bio", type: "textarea" },
  { key: "email", label: "Email de contacto", type: "text" },
  { key: "location", label: "Ubicación", type: "text" },
  { key: "cv_url", label: "URL del CV (vacío = botón oculto)", type: "text" },
  { key: "github_url", label: "GitHub", type: "text" },
  { key: "linkedin_url", label: "LinkedIn", type: "text" },
  { key: "brand_name", label: "Nombre de marca", type: "text" },
  { key: "brand_tagline", label: "Tagline de marca", type: "text" },
];

async function loadProfile() {
  const profile = await apiFetch("/api/profile");
  const form = document.getElementById("profileForm");
  form.innerHTML = PROFILE_FIELDS.map((f) => `
    <div class="col-md-6 ${f.type === "textarea" ? "col-12" : ""}">
      <label class="form-label" for="profile-${f.key}">${esc(f.label)}</label>
      ${f.type === "textarea"
        ? `<textarea class="form-control app-input" id="profile-${f.key}" rows="3">${esc(profile[f.key])}</textarea>`
        : `<input class="form-control app-input" id="profile-${f.key}" value="${esc(profile[f.key])}" />`}
    </div>
  `).join("") + `<div class="col-12"><button type="submit" class="btn-neon">Guardar cambios</button></div>`;
}

document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = {};
  PROFILE_FIELDS.forEach((f) => {
    body[f.key] = document.getElementById(`profile-${f.key}`).value;
  });
  try {
    await apiFetch("/api/profile", { method: "PUT", body: JSON.stringify(body) });
    showStatus("Perfil actualizado.");
  } catch (err) {
    showStatus(err.message, "err");
  }
});

// ============================================================
// CRUD GENÉRICO: skills, experience, achievements, projects
// ============================================================
const RESOURCES = {
  skills: {
    endpoint: "/api/skills",
    columns: [
      { key: "name", label: "Nombre" },
      { key: "category", label: "Categoría" },
      { key: "level", label: "Nivel" },
    ],
    fields: [
      { key: "name", label: "Nombre", type: "text", required: true },
      { key: "category", label: "Categoría", type: "text", required: true },
      { key: "level", label: "Nivel (0-100)", type: "number", required: true },
      { key: "sort_order", label: "Orden", type: "number" },
    ],
  },
  experience: {
    endpoint: "/api/experience",
    columns: [
      { key: "role", label: "Rol" },
      { key: "organization", label: "Institución" },
      { key: "start_date", label: "Inicio" },
      { key: "end_date", label: "Fin" },
    ],
    fields: [
      { key: "role", label: "Rol", type: "text", required: true },
      { key: "organization", label: "Institución", type: "text", required: true },
      { key: "start_date", label: "Inicio (ej: Abril 2026, o \"Cursando\")", type: "text", required: true },
      { key: "end_date", label: "Fin (vacío = \"Presente\")", type: "text" },
      { key: "description", label: "Descripción", type: "textarea" },
      { key: "sort_order", label: "Orden", type: "number" },
    ],
  },
  achievements: {
    endpoint: "/api/achievements",
    columns: [
      { key: "title", label: "Título" },
      { key: "year", label: "Año" },
    ],
    fields: [
      { key: "title", label: "Título", type: "text", required: true },
      { key: "description", label: "Descripción", type: "textarea" },
      { key: "year", label: "Año", type: "text" },
      { key: "icon", label: "Ícono (bootstrap-icons, ej: bi-award)", type: "text" },
      { key: "sort_order", label: "Orden", type: "number" },
    ],
  },
  projects: {
    endpoint: "/api/projects",
    columns: [
      { key: "title", label: "Título" },
      { key: "demo_url", label: "Demo" },
    ],
    fields: [
      { key: "title", label: "Título", type: "text", required: true },
      { key: "description", label: "Descripción", type: "textarea" },
      { key: "image_url", label: "Imagen (ruta en /img/...)", type: "text" },
      { key: "tech", label: "Tecnologías (separadas por coma)", type: "text" },
      { key: "repo_url", label: "Link al repo", type: "text" },
      { key: "demo_url", label: "Link a la demo", type: "text" },
      { key: "featured", label: "Destacado", type: "checkbox" },
      { key: "sort_order", label: "Orden", type: "number" },
    ],
  },
};

async function renderTable(key) {
  const cfg = RESOURCES[key];
  const container = document.getElementById(`table-${key}`);
  container.innerHTML = `<p class="empty-hint">Cargando...</p>`;
  let rows;
  try {
    rows = await apiFetch(cfg.endpoint);
  } catch {
    return;
  }
  if (!rows.length) {
    container.innerHTML = `<p class="empty-hint">Todavía no hay nada acá. Usá "Nueva" para agregar.</p>`;
    return;
  }
  const thead = cfg.columns.map((c) => `<th>${esc(c.label)}</th>`).join("") + "<th></th>";
  const tbody = rows.map((row) => {
    const tds = cfg.columns.map((c) => {
      let val = row[c.key];
      if (Array.isArray(val)) val = val.join(", ");
      return `<td>${esc(val)}</td>`;
    }).join("");
    return `
      <tr>
        ${tds}
        <td class="actions">
          <button class="btn-icon" data-edit="${key}" data-id="${row.id}" title="Editar"><i class="bi bi-pencil"></i></button>
          <button class="btn-icon danger" data-del="${key}" data-id="${row.id}" title="Borrar"><i class="bi bi-trash"></i></button>
        </td>
      </tr>`;
  }).join("");
  container.innerHTML = `<table class="admin-table"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>`;

  container.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = rows.find((r) => String(r.id) === btn.dataset.id);
      showForm(key, row);
    });
  });
  container.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!(await showConfirm("¿Borrar este ítem? No se puede deshacer."))) return;
      try {
        await apiFetch(`${cfg.endpoint}/${btn.dataset.id}`, { method: "DELETE" });
        showStatus("Borrado.");
        renderTable(key);
      } catch (err) {
        showStatus(err.message, "err");
      }
    });
  });
}

function showForm(key, existing = null) {
  const cfg = RESOURCES[key];
  const box = document.getElementById(`form-${key}`);
  box.classList.remove("d-none");

  const fieldsHtml = cfg.fields.map((f) => {
    const val = existing ? existing[f.key] : "";
    const valStr = Array.isArray(val) ? val.join(", ") : (val ?? "");
    if (f.type === "textarea") {
      return `<div class="col-12">
        <label class="form-label">${esc(f.label)}</label>
        <textarea class="form-control app-input" data-field="${f.key}" rows="3">${esc(valStr)}</textarea>
      </div>`;
    }
    if (f.type === "checkbox") {
      return `<div class="col-md-4 d-flex align-items-end">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" data-field="${f.key}" id="field-${key}-${f.key}" ${val ? "checked" : ""} />
          <label class="form-check-label form-label mb-0" for="field-${key}-${f.key}">${esc(f.label)}</label>
        </div>
      </div>`;
    }
    return `<div class="col-md-6">
      <label class="form-label">${esc(f.label)}${f.required ? " *" : ""}</label>
      <input class="form-control app-input" type="${f.type}" data-field="${f.key}" value="${esc(valStr)}" ${f.required ? "required" : ""} />
    </div>`;
  }).join("");

  box.innerHTML = `
    <form class="row g-3" id="inlineForm-${key}">
      ${fieldsHtml}
      <div class="col-12 d-flex gap-2">
        <button type="submit" class="btn-neon btn-sm">${existing ? "Guardar cambios" : "Crear"}</button>
        <button type="button" class="btn-neon-outline btn-sm" data-cancel="${key}">Cancelar</button>
      </div>
    </form>`;

  box.querySelector(`[data-cancel="${key}"]`).addEventListener("click", () => hideForm(key));

  box.querySelector(`#inlineForm-${key}`).addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = {};
    cfg.fields.forEach((f) => {
      const el = box.querySelector(`[data-field="${f.key}"]`);
      if (f.type === "checkbox") body[f.key] = el.checked;
      else if (f.type === "number") body[f.key] = el.value === "" ? undefined : Number(el.value);
      else body[f.key] = el.value;
    });
    try {
      if (existing) {
        await apiFetch(`${cfg.endpoint}/${existing.id}`, { method: "PUT", body: JSON.stringify(body) });
        showStatus("Actualizado.");
      } else {
        await apiFetch(cfg.endpoint, { method: "POST", body: JSON.stringify(body) });
        showStatus("Creado.");
      }
      hideForm(key);
      renderTable(key);
    } catch (err) {
      showStatus(err.message, "err");
    }
  });
}

function hideForm(key) {
  const box = document.getElementById(`form-${key}`);
  box.classList.add("d-none");
  box.innerHTML = "";
}

document.querySelectorAll("[data-new]").forEach((btn) => {
  btn.addEventListener("click", () => showForm(btn.dataset.new, null));
});

// ============================================================
// MENSAJES (solo lectura + borrar)
// ============================================================
async function renderMessages() {
  const container = document.getElementById("table-messages");
  container.innerHTML = `<p class="empty-hint">Cargando...</p>`;
  let rows;
  try {
    rows = await apiFetch("/api/messages");
  } catch {
    return;
  }
  if (!rows.length) {
    container.innerHTML = `<p class="empty-hint">Todavía no llegó ningún mensaje.</p>`;
    return;
  }
  const tbody = rows.map((m) => `
    <tr>
      <td>${esc(m.name)}</td>
      <td>${esc(m.email)}</td>
      <td style="max-width:420px; white-space:pre-wrap;">${esc(m.message)}</td>
      <td>${esc(new Date(m.created_at).toLocaleString())}</td>
      <td class="actions">
        <button class="btn-icon danger" data-delmsg="${m.id}" title="Borrar"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`).join("");
  container.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>Nombre</th><th>Email</th><th>Mensaje</th><th>Fecha</th><th></th></tr></thead>
      <tbody>${tbody}</tbody>
    </table>`;
  container.querySelectorAll("[data-delmsg]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!(await showConfirm("¿Borrar este mensaje?"))) return;
      try {
        await apiFetch(`/api/messages/${btn.dataset.delmsg}`, { method: "DELETE" });
        renderMessages();
      } catch (err) {
        showStatus(err.message, "err");
      }
    });
  });
}

// ============================================================
// INIT
// ============================================================
if (getToken()) {
  apiFetch("/api/messages").then(showDashboard).catch(() => showLogin());
} else {
  showLogin();
}
