export default function Footer({ profile }) {
  const year = new Date().getFullYear();
  return (
    <footer className="app-footer py-4">
      <div className="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
        <span className="text-muted-custom small">
          © {year} {profile.name}
          {profile.brand_name ? ` · ${profile.brand_name}` : ""}. Todos los derechos reservados.
        </span>
        <span className="text-muted-custom small">
          Hecho con React, Vite &amp; Bootstrap
        </span>
      </div>
    </footer>
  );
}
