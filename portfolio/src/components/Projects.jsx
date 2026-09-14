import { useState } from "react";
import { useOnScreen } from "../hooks/useOnScreen";
import DemoModal from "./DemoModal";

export default function Projects({ projects }) {
  const [ref, visible] = useOnScreen();
  const [activeDemo, setActiveDemo] = useState(null); // { url, title } | null

  function openDemo(p) {
    if (p.demo_url) setActiveDemo({ url: p.demo_url, title: p.title });
  }

  function handleCardKeyDown(e, p) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDemo(p);
    }
  }

  return (
    <section id="proyectos" className="section">
      <div className="container">
        <div ref={ref} className={`reveal ${visible ? "is-visible" : ""}`}>
          <p className="section-eyebrow">Proyectos</p>
          <h2 className="section-title">Trabajos realizados</h2>
          <div className="row g-4">
            {projects.map((p) => (
              <div className="col-md-6 col-lg-4" key={p.id}>
                <article
                  className={`project-card surface h-100 ${p.demo_url ? "project-card-clickable" : ""}`}
                  onClick={() => openDemo(p)}
                  role={p.demo_url ? "button" : undefined}
                  tabIndex={p.demo_url ? 0 : undefined}
                  onKeyDown={(e) => handleCardKeyDown(e, p)}
                  aria-label={p.demo_url ? `Ver demo de ${p.title}` : undefined}
                >
                  <div
                    className="project-thumb"
                    style={{ backgroundImage: `url(${p.image_url})` }}
                    role="img"
                    aria-label={p.title}
                  />
                  <div className="p-4">
                    <h3 className="h5 mb-2">{p.title}</h3>
                    <p className="text-muted-custom small mb-3">{p.description}</p>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {(p.tech || []).map((t) => (
                        <span className="tech-tag" key={t}>{t}</span>
                      ))}
                    </div>
                    <div className="d-flex gap-3">
                      {p.repo_url && (
                        <a
                          href={p.repo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="project-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="bi bi-github" /> Código
                        </a>
                      )}
                      {p.demo_url && (
                        <span className="project-link">
                          <i className="bi bi-box-arrow-up-right" /> Ver demo
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeDemo && (
        <DemoModal
          url={activeDemo.url}
          title={activeDemo.title}
          onClose={() => setActiveDemo(null)}
        />
      )}
    </section>
  );
}
