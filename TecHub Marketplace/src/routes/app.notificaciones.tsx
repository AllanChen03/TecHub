import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/notificaciones")({
  component: NotificacionesPage,
});

function NotificacionesPage() {
  const { db, user, setDB } = useAuth();
  if (!user) return null;
  const mias = db.notifications.filter((n) => n.userId === user.id || true);

  const marcarLeida = (id: string) => {
    setDB((prev) => ({ ...prev, notifications: prev.notifications.map((n) => n.id === id ? { ...n, leido: true } : n) }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Notificaciones</h1>
      <div className="space-y-2">
        {mias.map((n) => (
          <Card key={n.id} className="p-4 flex gap-3 cursor-pointer hover:shadow" onClick={() => marcarLeida(n.id)}>
            <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              {n.titulo.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{n.titulo}</div>
              <div className="text-sm text-muted-foreground">{n.mensaje}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">{n.fecha}</div>
              {!n.leido && <Badge className="mt-1">Nuevo</Badge>}
            </div>
          </Card>
        ))}
        {mias.length === 0 && <p className="text-center text-muted-foreground">Sin notificaciones</p>}
      </div>
    </div>
  );
}
