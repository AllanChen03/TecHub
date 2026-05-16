import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Bell, ShoppingBag, User } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { API_URL } from "@/lib/config";

interface Props {
  children: ReactNode;
  admin?: boolean;
}

export function AppShell({ children, admin = false }: Props) {
  const nav = useNavigate();
  const loc = useLocation();
  const [mounted, setMounted] = useState(false);
  const [totalNotifs, setTotalNotifs] = useState(0);

  useEffect(() => setMounted(true), []);

  // Cargar conteo de notificaciones cada 30 segundos
  useEffect(() => {
    if (admin) return;

    const fetchConteo = async () => {
      try {
        const token = localStorage.getItem("techub_token");
        if (!token) return;
        const res = await fetch(`${API_URL}/usuarios/notificaciones`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTotalNotifs(data.length);
        }
      } catch {
        // silencioso
      }
    };

    fetchConteo();
    const intervalo = setInterval(fetchConteo, 30000);
    return () => clearInterval(intervalo);
  }, [admin]);

  // Al entrar a notificaciones, limpiar el badge
  useEffect(() => {
    if (loc.pathname === "/app/notificaciones") {
      setTotalNotifs(0);
    }
  }, [loc.pathname]);

  const userLinks = [
    { to: "/app", label: "Inicio" },
    { to: "/app/productos", label: "Productos" },
    { to: "/app/categorias", label: "Categorías" },
    { to: "/app/publicaciones", label: "Publicaciones" },
    { to: "/app/ordenes", label: "Órdenes" },
  ];
  const adminLinks = [
    { to: "/admin", label: "Usuarios" },
    { to: "/admin/productos", label: "Productos" },
    { to: "/admin/categorias", label: "Categorías" },
    { to: "/admin/ordenes", label: "Órdenes" },
    { to: "/admin/comentarios", label: "Reseñas" },
  ];
  const links = admin ? adminLinks : userLinks;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#contenido-principal" className="skip-link">
        Saltar al contenido principal
      </a>
      <header role="banner" className="bg-sidebar text-sidebar-foreground sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link
            to={admin ? "/admin" : "/app"}
            className="flex items-center gap-2 font-bold text-lg"
            aria-label="TecHub, ir al inicio"
          >
            <ShoppingBag className="size-5" aria-hidden="true" />
            <span>TecHub</span>
          </Link>
          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-1 ml-6 flex-1"
          >
            {links.map((l) => {
              const active = loc.pathname === l.to || (l.to !== "/app" && l.to !== "/admin" && loc.pathname.startsWith(l.to));
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  aria-current={active ? "page" : undefined}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            {/* CAMPANA CON PUNTO ROJO */}
            {!admin && (
              <Link
                to="/app/notificaciones"
                className="relative p-2 rounded-md hover:bg-sidebar-accent"
                aria-label={`Notificaciones${totalNotifs > 0 ? `, ${totalNotifs} sin leer` : ""}`}
              >
                <Bell className="size-5" aria-hidden="true" />
                {totalNotifs > 0 && (
                  <span className="absolute top-1 right-1 flex size-2.5">
                    {/* Anillo pulsante para llamar la atención */}
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-2.5 bg-red-500" />
                  </span>
                )}
              </Link>
            )}

            <Link
              to={admin ? "/admin/perfil" : "/app/perfil"}
              className="flex items-center gap-2 bg-sidebar-accent px-3 py-1.5 rounded-md text-sm hover:opacity-90"
              aria-label={admin ? "Perfil de administrador" : "Mi perfil"}
            >
              <User className="size-4" aria-hidden="true" />
              <span>{admin ? "Admin" : "Perfil"}</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("techub_token");
                  localStorage.removeItem("techub_user");
                }
                nav({ to: "/login", replace: true });
              }}
              aria-label="Cerrar sesión"
            >
              Salir
            </Button>
          </div>
        </div>

        <nav
          aria-label="Navegación principal móvil"
          className="md:hidden flex overflow-x-auto px-2 pb-2 gap-1 max-w-7xl mx-auto"
        >
          {links.map((l) => {
            const active = loc.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                aria-current={active ? "page" : undefined}
                className={`px-3 py-1 rounded-md text-xs whitespace-nowrap ${
                  active ? "bg-sidebar-accent" : "bg-sidebar-accent/40"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main
        id="contenido-principal"
        role="main"
        tabIndex={-1}
        className="flex-1 max-w-7xl w-full mx-auto px-4 py-6"
      >
        {children}
      </main>

      <footer
        role="contentinfo"
        className="bg-sidebar text-sidebar-foreground/70 text-xs text-center py-3"
      >
        TecHub © {new Date().getFullYear()} · Tienda en línea para estudiantes TEC
      </footer>
    </div>
  );
}