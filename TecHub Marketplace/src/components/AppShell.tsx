import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Bell, ShoppingBag, User } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  admin?: boolean;
}

export function AppShell({ children, admin = false }: Props) {
  const { user, logout, db } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  // Evita mismatch de hidratación: el conteo depende de localStorage (cliente)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
  ];
  const links = admin ? adminLinks : userLinks;

  const unread = mounted ? db.notifications.filter((n) => n.userId === user?.id && !n.leido).length : 0;

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
            {!admin && (
              <Link
                to="/app/notificaciones"
                className="relative p-2 rounded-md hover:bg-sidebar-accent"
                aria-label={
                  mounted && unread > 0
                    ? `Notificaciones, ${unread} sin leer`
                    : "Notificaciones"
                }
              >
                <Bell className="size-5" aria-hidden="true" />
                {mounted && unread > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] rounded-full size-4 flex items-center justify-center"
                  >
                    {unread}
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
                logout();
                nav({ to: "/login" });
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
