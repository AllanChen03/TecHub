import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/app/categorias")({
  component: CategoriasPage,
});

function CategoriasPage() {
  const { db } = useAuth();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Todas las categorías</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Selecciona una categoría para ver los productos disponibles.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {db.categories.map((c) => {
          const count = db.products.filter((p) => p.categoria === c.nombre).length;
          return (
            <Link
              key={c.id}
              to="/app/productos"
              search={{ cat: c.nombre }}
            >
              <Card className="p-6 text-center hover:shadow-md hover:border-primary transition cursor-pointer h-full">
                <div className="text-5xl mb-2">{c.icon}</div>
                <div className="font-medium">{c.nombre}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {count} {count === 1 ? "producto" : "productos"}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
