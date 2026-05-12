import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const Route = createFileRoute("/app/productos/")({
  validateSearch: (search: Record<string, unknown>) => ({
    cat: typeof search.cat === "string" ? search.cat : undefined,
  }),
  component: ProductosPage,
});

function ProductosPage() {
  const { db } = useAuth();
  const { cat } = Route.useSearch();
  const navigate = useNavigate();

  const productos = cat
    ? db.products.filter((p) => p.categoria === cat)
    : db.products;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">
            {cat ? cat : "Todos los productos"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {productos.length} {productos.length === 1 ? "producto" : "productos"}
          </p>
        </div>
        {cat && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/app/productos", search: {} })}
          >
            <X className="size-4" /> Quitar filtro
          </Button>
        )}
      </div>

      {cat && (
        <div className="mb-4">
          <Badge variant="secondary">Categoría: {cat}</Badge>
        </div>
      )}

      {productos.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No hay productos en esta categoría.
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productos.map((p) => (
            <Link key={p.id} to="/app/productos/$id" params={{ id: p.id }}>
              <Card className="overflow-hidden hover:shadow-lg transition h-full">
                <div className="aspect-square bg-muted flex items-center justify-center text-6xl overflow-hidden">
                  {p.imagen?.startsWith("data:") || p.imagen?.startsWith("http") ? (
                    <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                  ) : (p.imagen)}
                </div>
                <div className="p-3">
                  <div className="font-medium text-sm line-clamp-1">{p.nombre}</div>
                  <div className="text-primary font-bold text-sm mt-1">
                    ₡{p.precio.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">{p.categoria}</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
