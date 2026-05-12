import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  component: AdminUsuarios,
});

function AdminUsuarios() {
  const { db, deleteUser } = useAuth();

  const eliminar = (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este usuario?")) return;
    deleteUser(id);
    toast.success("Usuario eliminado");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Button asChild><Link to="/admin/usuarios/nuevo"><Plus className="size-4" /> Añadir usuario</Link></Button>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Correo</th>
              <th className="text-left p-3">Rol</th>
              <th className="text-right p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {db.users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.nombre} {u.apellidos}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3"><Badge variant={u.rol === "admin" ? "default" : "secondary"}>{u.rol}</Badge></td>
                <td className="p-3 text-right whitespace-nowrap">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to="/admin/usuarios/$id" params={{ id: u.id }}><Eye className="size-4" /></Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to="/admin/usuarios/editar/$id" params={{ id: u.id }}><Pencil className="size-4" /></Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => eliminar(u.id)}>
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
