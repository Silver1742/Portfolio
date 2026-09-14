import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useActiveSection } from "../hooks/useActiveSection";

const LINKS = [
  { id: "inicio", label: "Inicio" },
  { id: "sobre-mi", label: "Sobre mí" },
  { id: "habilidades", label: "Habilidades" },
  { id: "experiencia", label: "Experiencia" },
  { id: "logros", label: "Logros" },
  { id: "proyectos", label: "Proyectos" },
  { id: "contacto", label: "Contacto" },
];

export default function Navbar({ profile }) {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const active = useActiveSection(LINKS.map((l) => l.id));

  function handleNavClick(id) {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <nav className="navbar navbar-expand-lg fixed-top app-navbar">
      <div className="container">
        <a
          className="navbar-brand font-display fw-bold brand-mark"
          href="#inicio"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("inicio");
          }}
        >
          <span className="brand-bracket">/</span>
          {profile.brand_name || profile.name}
          <span className="brand-bracket">/</span>
        </a>

        <button
          className="navbar-toggler"
          type="button"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="toggler-bar" />
          <span className="toggler-bar" />
          <span className="toggler-bar" />
        </button>

        <div className={`collapse navbar-collapse ${open ? "show" : ""}`}>
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            {LINKS.map((link) => (
              <li className="nav-item" key={link.id}>
                <a
                  href={`#${link.id}`}
                  className={`nav-link app-nav-link ${active === link.id ? "active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.id);
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="nav-item ms-lg-3 mt-3 mt-lg-0">
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label="Cambiar entre modo claro y oscuro"
                title="Cambiar tema"
              >
                <i className={`bi ${theme === "dark" ? "bi-sun-fill" : "bi-moon-stars-fill"}`} />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
