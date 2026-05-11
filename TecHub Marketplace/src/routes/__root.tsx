import { Outlet, Link, createRootRoute, HeadContent, Scripts, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../lib/auth";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página no encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">La página que buscás no existe.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TecHub — Marketplace estudiantil TEC" },
      { name: "description", content: "TecHub: compra y venta de materiales académicos para la comunidad del TEC." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RouteGuard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    const path = loc.pathname;
    const isPublic = path === "/" || path === "/login" || path === "/register" || path === "/forgot";
    if (!user && !isPublic) {
      nav({ to: "/login" });
    } else if (user) {
      if (path === "/" || path === "/login") {
        nav({ to: user.rol === "admin" ? "/admin" : "/app" });
      }
      if (path.startsWith("/admin") && user.rol !== "admin") nav({ to: "/app" });
      if (path.startsWith("/app") && user.rol === "admin") nav({ to: "/admin" });
    }
  }, [user, loc.pathname, nav]);

  return <Outlet />;
}

function RootComponent() {
  return (
    <AuthProvider>
      <RouteGuard />
      <Toaster />
    </AuthProvider>
  );
}
