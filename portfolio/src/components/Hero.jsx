export default function Hero({ profile }) {
  return (
    <section id="inicio" className="hero d-flex align-items-center">
      <div className="hero-grid" aria-hidden="true" />
      <div className="container position-relative">
        <div className="row">
          <div className="col-lg-8 hero-content">
            {profile.brand_name && <span className="brand-pill mb-3">{profile.brand_name}</span>}
            <p className="section-eyebrow mb-3">{profile.role}</p>
            <h1 className="hero-title">
              {profile.name}
            </h1>
            <p className="hero-tagline">{profile.tagline}</p>
            <div className="d-flex flex-wrap gap-3 mt-4">
              <a
                href="#proyectos"
                className="btn-neon"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("proyectos")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Ver proyectos
              </a>
              <a
                href="#contacto"
                className="btn-neon-outline"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Contactarme
              </a>
            </div>
          </div>
        </div>
      </div>
      <button
        className="scroll-cue"
        aria-label="Bajar a la siguiente sección"
        onClick={() => document.getElementById("sobre-mi")?.scrollIntoView({ behavior: "smooth" })}
      >
        <i className="bi bi-chevron-down" />
      </button>
    </section>
  );
}
