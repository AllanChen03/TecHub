import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/ordenes")({
  component: OrdenesPage,
});

function OrdenesPage() {
  const { db, user } = useAuth();
  if (!user) return null;
  const fullName = `${user.nombre} ${user.apellidos}`;
  const mine = db.orders.filter((o) => o.vendedor === fullName || o.comprador === fullName || user.rol !== "admin");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Órdenes</h1>
      <div className="space-y-3">
        {mine.map((o) => (
          <Card key={o.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="bg-muted size-16 rounded-lg flex items-center justify-center text-3xl">{o.imagen}</div>
            <div className="flex-1">
              <div className="font-semibold">Orden ID: {o.id}</div>
              <div className="text-sm text-muted-foreground">Vendedor: {o.vendedor} · Comprador: {o.comprador}</div>
              <div className="text-sm">{o.productoNombre} · ₡{o.precio.toLocaleString()}</div>
            </div>
            <Badge variant={o.estado === "Completado" ? "default" : o.estado === "Pendiente" ? "secondary" : "destructive"}>
              {o.estado}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
