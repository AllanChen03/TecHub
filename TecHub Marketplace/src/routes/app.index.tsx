import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/app/")({
  component: HomePage,
});

function HomePage() {
  const { db } = useAuth();
  const [q, setQ] = useState("");
  const productos = useMemo(
    () => db.products.filter((p) => p.nombre.toLowerCase().includes(q.toLowerCase())),
    [db.products, q]
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary-soft text-primary-foreground rounded-xl p-6 shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Bienvenido a TecHub</h1>
        <p className="opacity-90 text-sm md:text-base">Compra y vende materiales académicos dentro de la comunidad TEC.</p>
        <div className="relative mt-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 bg-background text-foreground"
          />
        </div>
      </div>

      <section>
        <h2 className="font-semibold text-lg mb-3">Categorías</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {db.categories.slice(0, 8).map((c) => (
            <Link
              key={c.id}
              to="/app/productos"
              search={{ cat: c.nombre }}
              className="bg-card border rounded-lg p-4 text-center hover:shadow-md hover:border-primary transition"
            >
              <div className="text-3xl mb-1">{c.icon}</div>
              <div className="text-sm font-medium">{c.nombre}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-lg mb-3">Productos destacados</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productos.map((p) => (
            <Link key={p.id} to="/app/productos/$id" params={{ id: p.id }}>
              <Card className="overflow-hidden hover:shadow-lg transition cursor-pointer h-full">
                <div className="aspect-square bg-muted flex items-center justify-center text-6xl overflow-hidden">
                  {p.imagen?.startsWith("data:") || p.imagen?.startsWith("http") ? (
                    <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                  ) : (p.imagen)}
                </div>
                <div className="p-3">
                  <div className="font-medium text-sm line-clamp-1">{p.nombre}</div>
                  <div className="text-primary font-bold text-sm mt-1">₡{p.precio.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{p.estado}</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
