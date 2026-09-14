import { useOnScreen } from "../hooks/useOnScreen";

export default function Achievements({ achievements }) {
  const [ref, visible] = useOnScreen();

  if (!achievements || achievements.length === 0) return null;

  return (
    <section id="logros" className="section">
      <div className="container">
        <div ref={ref} className={`reveal ${visible ? "is-visible" : ""}`}>
          <p className="section-eyebrow">Logros</p>
          <h2 className="section-title">Resultados concretos</h2>
          <div className="row g-4">
            {achievements.map((a) => (
              <div className="col-sm-6 col-lg-4" key={a.id}>
                <div className="achievement-card surface h-100 p-4">
                  <i className={`bi ${a.icon} achievement-icon`} />
                  <h3 className="h6 mt-3 mb-1">{a.title}</h3>
                  <p className="text-muted-custom small mb-2">{a.description}</p>
                  <span className="achievement-year">{a.year}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
