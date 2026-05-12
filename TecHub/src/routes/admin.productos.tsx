import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/productos")({
  component: AdminProductos,
});

function AdminProductos() {
  const { db, setDB } = useAuth();

  const eliminar = (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar esta publicación?")) return;
    setDB((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) }));
    toast.success("Publicación eliminada");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Productos</h1>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3">Vendedor</th>
              <th className="text-left p-3">Producto</th>
              <th className="text-left p-3">Categoría</th>
              <th className="text-left p-3">Ubicación</th>
              <th className="text-right p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {db.products.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.vendedorNombre}</td>
                <td className="p-3">{p.nombre}</td>
                <td className="p-3">{p.categoria}</td>
                <td className="p-3">{p.ubicacion}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to="/app/productos/$id" params={{ id: p.id }}><Eye className="size-4" /></Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => eliminar(p.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
