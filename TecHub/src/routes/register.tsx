import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const { register, db } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    confirm: "",
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error("Las contraseñas no coinciden");
    if (db.users.some((u) => u.email === form.email)) return toast.error("Ese correo ya está registrado");
    register({ nombre: form.nombre, apellidos: form.apellidos, email: form.email, password: form.password, rol: "vendedor" });
    toast.success("Usuario creado con éxito");
    nav({ to: "/app" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-primary text-center mb-6">Crear cuenta</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nombre</Label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div>
              <Label>Apellidos</Label>
              <Input value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} required />
            </div>
          </div>
          <div>
            <Label>Correo electrónico</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <Label>Contraseña</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div>
            <Label>Confirmar contraseña</Label>
            <Input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
          </div>
          <div className="flex gap-3 pt-3">
            <Button type="button" variant="outline" className="flex-1" asChild>
              <Link to="/login">Volver</Link>
            </Button>
            <Button type="submit" className="flex-1">Crear usuario</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
