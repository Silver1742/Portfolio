import { useEffect, useRef, useState } from "react";

/**
 * Devuelve un ref para asignar a un elemento y un booleano que pasa a true
 * la primera vez que ese elemento entra en el viewport (usado para las
 * animaciones de "revelado" al scrollear).
 */
export function useOnScreen(options = { threshold: 0.15 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(node); // se anima una sola vez
      }
    }, options);

    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, isVisible];
}
