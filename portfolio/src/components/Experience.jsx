import { useOnScreen } from "../hooks/useOnScreen";

export default function Experience({ experience }) {
  const [ref, visible] = useOnScreen();

  return (
    <section id="experiencia" className="section">
      <div className="container">
        <div ref={ref} className={`reveal ${visible ? "is-visible" : ""}`}>
          <p className="section-eyebrow">Experiencia</p>
          <h2 className="section-title">Recorrido</h2>
          <ol className="timeline list-unstyled">
            {experience.map((item) => (
              <li className="timeline-item" key={item.id}>
                <div className="timeline-marker" />
                <div className="timeline-content surface p-4">
                  <span className="timeline-dates">
                    {item.start_date} — {item.end_date || "Presente"}
                  </span>
                  <h3 className="h5 mt-1 mb-1">{item.role}</h3>
                  <p className="text-accent mb-2">{item.organization}</p>
                  <p className="text-muted-custom mb-0">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
