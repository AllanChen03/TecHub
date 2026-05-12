import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const { user, updateUser, deleteUser, logout } = useAuth();
  const nav = useNavigate();
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({
    nombre: user?.nombre ?? "", apellidos: user?.apellidos ?? "", email: user?.email ?? "",
  });

  if (!user) return null;

  const guardar = () => {
    updateUser(user.id, f);
    toast.success("¡Sus datos han sido actualizados exitosamente!");
    setEdit(false);
  };

  const eliminar = () => {
    if (!confirm("¿Seguro que quiere eliminar su cuenta?")) return;
    deleteUser(user.id);
    logout();
    toast.success("Cuenta eliminada");
    nav({ to: "/login" });
  };

  return (
    <Card className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-primary text-center mb-6">{edit ? "Editar Perfil" : "Mi Perfil"}</h1>
      <div className="space-y-3">
        <div><Label>Nombre</Label><Input disabled={!edit} value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></div>
        <div><Label>Apellidos</Label><Input disabled={!edit} value={f.apellidos} onChange={(e) => setF({ ...f, apellidos: e.target.value })} /></div>
        <div><Label>Correo</Label><Input disabled={!edit} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
        <div><Label>Rol</Label><Input disabled value={user.rol} /></div>
      </div>
      <div className="flex flex-wrap gap-2 mt-6">
        {!edit ? (
          <>
            <Button onClick={() => setEdit(true)}>Editar perfil</Button>
            <Button variant="outline">Cambiar contraseña</Button>
            <Button variant="destructive" onClick={eliminar}>Eliminar cuenta</Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => setEdit(false)}>Volver</Button>
            <Button onClick={guardar} className="ml-auto">Guardar cambios</Button>
          </>
        )}
      </div>
    </Card>
  );
}
