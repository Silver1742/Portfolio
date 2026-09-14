import { useEffect } from "react";

export default function DemoModal({ url, title, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="demo-modal-backdrop" onClick={onClose}>
      <div
        className="demo-modal-window"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="demo-modal-header">
          <span className="demo-modal-title">{title}</span>
          <button className="demo-modal-close" onClick={onClose} aria-label="Cerrar demo">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <iframe src={url} title={title} className="demo-modal-iframe" />
      </div>
    </div>
  );
}
