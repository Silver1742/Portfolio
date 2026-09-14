import { useState } from "react";
import { useOnScreen } from "../hooks/useOnScreen";
import { API_URL } from "../hooks/useApi";

const initialForm = { name: "", email: "", message: "" };

export default function Contact({ profile }) {
  const [ref, visible] = useOnScreen();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("No se pudo enviar");
      setStatus("sent");
      setForm(initialForm);
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contacto" className="section" style={{ borderBottom: "none" }}>
      <div className="container">
        <div ref={ref} className={`reveal ${visible ? "is-visible" : ""}`}>
          <p className="section-eyebrow">Contacto</p>
          <h2 className="section-title">Trabajemos juntos</h2>
          <div className="row g-5">
            <div className="col-lg-5">
              <p className="text-muted-custom fs-5">
                ¿Tenés un proyecto en mente o querés charlar sobre una oportunidad? Escribime.
              </p>
              <p className="mb-1">
                <i className="bi bi-envelope me-2 text-accent" />
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
              </p>
              <div className="d-flex gap-3 mt-4">
                {profile.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noreferrer" className="social-icon">
                    <i className="bi bi-github" />
                  </a>
                )}
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="social-icon">
                    <i className="bi bi-linkedin" />
                  </a>
                )}
              </div>
            </div>
            <div className="col-lg-7">
              <form className="surface p-4" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="name">Nombre</label>
                  <input
                    className="form-control app-input"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input
                    className="form-control app-input"
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" htmlFor="message">Mensaje</label>
                  <textarea
                    className="form-control app-input"
                    id="message"
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="btn-neon" disabled={status === "sending"}>
                  {status === "sending" ? "Enviando..." : "Enviar mensaje"}
                </button>
                {status === "sent" && (
                  <p className="text-success mt-3 mb-0">¡Gracias! Tu mensaje quedó guardado, te voy a responder pronto.</p>
                )}
                {status === "error" && (
                  <p className="text-danger mt-3 mb-0">
                    No se pudo enviar. Verificá que el servidor esté corriendo e intentá de nuevo.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
