import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * Pide datos a un endpoint de la API. Si falla (por ejemplo, el backend
 * todavía no está desplegado), usa "fallback" para que la UI no quede vacía.
 */
export function useApi(endpoint, fallback) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`${API_URL}${endpoint}`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  return { data, loading, error };
}

export { API_URL };
