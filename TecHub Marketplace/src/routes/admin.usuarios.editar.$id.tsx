import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import type { Role } from "@/lib/auth";

export const Route = createFileRoute("/admin/usuarios/editar/$id")({
  component: EditarUsuario,
});

function EditarUsuario() {
  const { id } = useParams({ from: "/admin/usuarios/editar/$id" });
  const { db, updateUser } = useAuth();
  const nav = useNavigate();
  const u = db.users.find((x) => x.id === id);
  const [f, setF] = useState(u ? { nombre: u.nombre, apellidos: u.apellidos, email: u.email, rol: u.rol } : null);
  if (!u || !f) return <div>No encontrado</div>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(id, f);
    toast.success("Cambios guardados");
    nav({ to: "/admin" });
  };

  return (
    <Card className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-primary text-center mb-6">Editar usuario</h1>
      <form onSubmit={submit} className="space-y-3">
        <div><Label>Nombre</Label><Input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></div>
        <div><Label>Apellidos</Label><Input value={f.apellidos} onChange={(e) => setF({ ...f, apellidos: e.target.value })} /></div>
        <div><Label>Correo</Label><Input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        <div>
          <Label>Rol</Label>
          <Select value={f.rol} onValueChange={(v) => setF({ ...f, rol: v as Role })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="vendedor">Comprador/Vendedor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 pt-3">
          <Button type="button" variant="outline" onClick={() => nav({ to: "/admin" })}>Volver</Button>
          <Button type="submit" className="ml-auto">Guardar</Button>
        </div>
      </form>
    </Card>
  );
}
