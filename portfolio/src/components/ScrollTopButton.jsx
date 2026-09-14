import { useScrollTop } from "../hooks/useScrollTop";

export default function ScrollTopButton() {
  const { visible, scrollToTop } = useScrollTop(400);

  return (
    <button
      className={`scroll-top-btn ${visible ? "is-visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Volver al inicio de la página"
      title="Volver arriba"
    >
      <i className="bi bi-arrow-up" />
    </button>
  );
}
