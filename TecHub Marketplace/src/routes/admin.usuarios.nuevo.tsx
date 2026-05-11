import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import type { Role } from "@/lib/auth";

export const Route = createFileRoute("/admin/usuarios/nuevo")({
  component: NuevoUsuario,
});

function NuevoUsuario() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ nombre: "", apellidos: "", email: "", password: "", rol: "vendedor" as Role });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    register(f);
    toast.success("Usuario registrado");
    nav({ to: "/admin" });
  };

  return (
    <Card className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-primary text-center mb-6">Registrar usuario</h1>
      <form onSubmit={submit} className="space-y-3">
        <div><Label>Nombre</Label><Input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} required /></div>
        <div><Label>Apellidos</Label><Input value={f.apellidos} onChange={(e) => setF({ ...f, apellidos: e.target.value })} required /></div>
        <div><Label>Correo</Label><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></div>
        <div><Label>Contraseña</Label><Input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required /></div>
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
          <Button type="submit" className="ml-auto">Registrar</Button>
        </div>
      </form>
    </Card>
  );
}
