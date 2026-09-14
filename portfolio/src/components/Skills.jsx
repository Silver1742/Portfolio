import { useOnScreen } from "../hooks/useOnScreen";

function groupByCategory(skills) {
  return skills.reduce((acc, skill) => {
    acc[skill.category] = acc[skill.category] || [];
    acc[skill.category].push(skill);
    return acc;
  }, {});
}

function SkillBar({ skill, visible, delay }) {
  return (
    <div className="skill-bar">
      <div className="d-flex justify-content-between mb-1">
        <span>{skill.name}</span>
        <span className="text-muted-custom">{skill.level}%</span>
      </div>
      <div className="skill-track">
        <div
          className="skill-fill"
          style={{
            width: visible ? `${skill.level}%` : "0%",
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

export default function Skills({ skills }) {
  const [ref, visible] = useOnScreen();
  const grouped = groupByCategory(skills);

  return (
    <section id="habilidades" className="section">
      <div className="container">
        <div ref={ref} className={`reveal ${visible ? "is-visible" : ""}`}>
          <p className="section-eyebrow">Habilidades</p>
          <h2 className="section-title">Con qué trabajo</h2>
          <div className="row g-5">
            {Object.entries(grouped).map(([category, items]) => (
              <div className="col-md-4" key={category}>
                <h3 className="h5 mb-4">{category}</h3>
                {items.map((skill, i) => (
                  <SkillBar key={skill.id ?? skill.name} skill={skill} visible={visible} delay={i * 100} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
