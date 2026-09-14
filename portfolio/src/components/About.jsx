import { useOnScreen } from "../hooks/useOnScreen";

export default function About({ profile }) {
  const [ref, visible] = useOnScreen();

  const facts = [
    { label: "Ubicación", value: profile.location, icon: "bi-geo-alt" },
    { label: "Email", value: profile.email, icon: "bi-envelope" },
    { label: "GitHub", value: profile.github_url?.replace("https://", ""), icon: "bi-github", href: profile.github_url },
    { label: "LinkedIn", value: profile.linkedin_url?.replace("https://", ""), icon: "bi-linkedin", href: profile.linkedin_url },
  ].filter((f) => f.value);

  return (
    <section id="sobre-mi" className="section">
      <div className="container">
        <div ref={ref} className={`reveal ${visible ? "is-visible" : ""}`}>
          <p className="section-eyebrow">Sobre mí</p>
          <h2 className="section-title">Quién soy y qué hago</h2>
          <div className="row g-5 align-items-start">
            <div className="col-lg-7">
              <p className="fs-5 text-muted-custom">{profile.bio}</p>
              {profile.cv_url && (
                <a href={profile.cv_url} className="btn-neon-outline mt-2 d-inline-block" download>
                  Descargar CV
                </a>
              )}
            </div>
            <div className="col-lg-5">
              <ul className="fact-list list-unstyled surface p-4 m-0">
                {facts.map((f) => (
                  <li key={f.label} className="fact-item">
                    <i className={`bi ${f.icon}`} />
                    <div>
                      <span className="fact-label">{f.label}</span>
                      {f.href ? (
                        <a href={f.href} target="_blank" rel="noreferrer" className="fact-value">
                          {f.value}
                        </a>
                      ) : (
                        <span className="fact-value">{f.value}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
