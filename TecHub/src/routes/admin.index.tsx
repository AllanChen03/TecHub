import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/config";

export const Route = createFileRoute("/admin/")({
  component: AdminUsuarios,
});

function AdminUsuarios() {
  // Aquí guardaremos los usuarios reales de tu base de datos
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Ir a buscar los usuarios a Node.js
  const cargarUsuarios = async () => {
    try {
      const token = localStorage.getItem("techub_token");
      
      const res = await fetch(`${API_URL}/admin/usuarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data); // Guardamos la data real
      }
    } catch (error) {
      toast.error("Error al cargar la lista de usuarios");
    } finally {
      setLoading(false);
    }
  };

  // Se ejecuta al abrir la pantalla
  useEffect(() => {
    cargarUsuarios();
  }, []);

  // 2. Eliminar usuario real
  const eliminar = async (id: number) => {
    if (!confirm("¿Seguro que quieres eliminar este usuario de la base de datos?")) return;

    try {
      const token = localStorage.getItem("techub_token");
      const res = await fetch(`${API_URL}/admin/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("Usuario eliminado correctamente");
        cargarUsuarios(); // Recargamos la tabla para que desaparezca visualmente
      } else {
        const data = await res.json();
        toast.error(data.error || "No se pudo eliminar el usuario");
      }
    } catch (error) {
      toast.error("Error de conexión con el servidor");
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando panel de usuarios...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <Button asChild>
          <Link to="/admin/usuarios/nuevo"><Plus className="size-4 mr-2" /> Añadir usuario</Link>
        </Button>
      </div>
      
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Correo</th>
              <th className="text-left p-3">Rol</th>
              <th className="text-center p-3">Estado</th>
              <th className="text-right p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {/* AQUÍ ESTÁ EL CAMBIO CLAVE: Usamos 'usuarios.map' en lugar de 'db.users.map' */}
            {usuarios.map((u: any) => (
              <tr key={u.UsuarioID} className="border-t hover:bg-muted/50 transition-colors">
                <td className="p-3 font-medium">{u.Nombre} {u.Apellidos}</td>
                <td className="p-3 text-muted-foreground">{u.Email}</td>
                <td className="p-3">
                  <Badge variant={u.RolID === 1 ? "default" : "secondary"}>
                    {u.RolID === 1 ? "Administrador" : "Estudiante"}
                  </Badge>
                </td>
                <td className="p-3 text-center">
                  <Badge variant={u.verificado ? "outline" : "destructive"}>
                    {u.verificado ? "Activo" : "Sin verificar"}
                  </Badge>
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to="/admin/usuarios/$id" params={{ id: String(u.UsuarioID) }}>
                      <Eye className="size-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to="/admin/usuarios/editar/$id" params={{ id: String(u.UsuarioID) }}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => eliminar(u.UsuarioID)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {usuarios.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No hay usuarios registrados en el sistema.
          </div>
        )}
      </Card>
    </div>
  );
}