import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/publicaciones/")({
  component: PublicacionesPage,
});

function PublicacionesPage() {
  const { db, user, setDB } = useAuth();
  if (!user) return null;
  const mias = db.products.filter((p) => p.vendedorId === user.id);

  const eliminar = (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar esta publicación?")) return;
    setDB((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) }));
    toast.success("Publicación eliminada");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Publicaciones</h1>
        <Button asChild>
          <Link to="/app/publicaciones/nueva"><Plus className="size-4" /> Añadir Publicación</Link>
        </Button>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3">Producto</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-left p-3">Precio</th>
              <th className="text-right p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mias.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.nombre}</td>
                <td className="p-3"><Badge variant="secondary">{p.estado}</Badge></td>
                <td className="p-3">₡{p.precio.toLocaleString()}</td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to="/app/productos/$id" params={{ id: p.id }}><Eye className="size-4" /></Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to="/app/publicaciones/editar/$id" params={{ id: p.id }}><Pencil className="size-4" /></Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => eliminar(p.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {mias.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Aún no tenés publicaciones.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
