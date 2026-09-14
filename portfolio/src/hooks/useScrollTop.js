import { useEffect, useState } from "react";

/**
 * Escucha el evento "scroll" de la ventana y expone si ya se bajó
 * más allá de "threshold" píxeles, más una función para volver al inicio.
 */
export function useScrollTop(threshold = 400) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > threshold);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return { visible, scrollToTop };
}
