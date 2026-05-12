import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/usuarios/$id")({
  component: PerfilUsuarioAdmin,
});

function PerfilUsuarioAdmin() {
  const { id } = useParams({ from: "/admin/usuarios/$id" });
  const { db } = useAuth();
  const nav = useNavigate();
  const u = db.users.find((x) => x.id === id);
  if (!u) return <div>No encontrado</div>;

  return (
    <Card className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-primary text-center mb-6">Perfil de usuario</h1>
      <div className="space-y-3">
        <div><Label>Nombre</Label><Input disabled value={u.nombre} /></div>
        <div><Label>Apellidos</Label><Input disabled value={u.apellidos} /></div>
        <div><Label>Correo</Label><Input disabled value={u.email} /></div>
        <div><Label>Rol</Label><Input disabled value={u.rol} /></div>
      </div>
      <div className="flex gap-2 mt-6">
        <Button variant="outline" onClick={() => nav({ to: "/admin" })}>Volver</Button>
        <Button onClick={() => nav({ to: "/admin/usuarios/editar/$id", params: { id: u.id } })} className="ml-auto">Editar perfil</Button>
      </div>
    </Card>
  );
}
