import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// 👇 IMPORTAMOS EL ÍCONO DE BÚSQUEDA (Search)
import { Users, Shield, ShieldAlert, User, Eye, Pencil, Trash2, X, Search } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

interface Usuario {
  UsuarioID: number;
  Nombre: string;
  Apellidos: string;
  Email: string;
  Telefono: string;
  RolID: number;
  verificado: boolean | number;
}

function AdminDashboard() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  
  // 👇 NUEVO ESTADO PARA LA BARRA DE BÚSQUEDA
  const [busqueda, setBusqueda] = useState("");

  // Estados para el Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoModal, setModoModal] = useState<"ver" | "editar">("ver");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/usuarios`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("techub_token")}` },
      });
      if (!res.ok) throw new Error("No se pudieron cargar los usuarios");
      const data = await res.json();
      setUsuarios(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás súper seguro de eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return;

    try {
      const res = await fetch(`${API_URL}/admin/usuarios/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("techub_token")}` },
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Error al eliminar");
      }

      toast.success("Usuario eliminado correctamente");
      cargarUsuarios();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioSeleccionado) return;

    setProcesando(true);
    try {
      const res = await fetch(`${API_URL}/admin/usuarios/${usuarioSeleccionado.UsuarioID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("techub_token")}`
        },
        body: JSON.stringify({
          nombre: usuarioSeleccionado.Nombre,
          apellidos: usuarioSeleccionado.Apellidos,
          email: usuarioSeleccionado.Email,
          rolID: usuarioSeleccionado.RolID
        })
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Error al actualizar");
      }

      toast.success("Usuario actualizado correctamente");
      setModalAbierto(false);
      cargarUsuarios();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcesando(false);
    }
  };

  const abrirModal = (u: Usuario, modo: "ver" | "editar") => {
    setUsuarioSeleccionado({ ...u });
    setModoModal(modo);
    setModalAbierto(true);
  };

  // 👇 LÓGICA DE FILTRADO EN TIEMPO REAL
  // React ejecutará esto en milisegundos cada vez que escribas una letra
  const usuariosFiltrados = usuarios.filter((u) => {
    const terminoBusqueda = busqueda.toLowerCase();
    const nombreCompleto = `${u.Nombre} ${u.Apellidos}`.toLowerCase();
    const correo = u.Email.toLowerCase();
    
    return nombreCompleto.includes(terminoBusqueda) || correo.includes(terminoBusqueda);
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* CABECERA Y BARRA DE BÚSQUEDA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Users className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
        </div>

        {/* 👇 INPUT DE BÚSQUEDA 👇 */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input 
            placeholder="Buscar por nombre o correo..." 
            className="pl-9 w-full bg-white"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm">
        {cargando ? (
          <div className="p-10 text-center text-gray-500">Cargando usuarios...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-4 font-semibold text-gray-600">ID</th>
                  <th className="p-4 font-semibold text-gray-600">Nombre</th>
                  <th className="p-4 font-semibold text-gray-600">Correo</th>
                  <th className="p-4 font-semibold text-gray-600 text-center">Rol</th>
                  <th className="p-4 font-semibold text-gray-600 text-center">Estado</th>
                  <th className="p-4 font-semibold text-gray-600 text-center">Acciones</th> 
                </tr>
              </thead>
              <tbody className="divide-y">
                {/* 👇 AHORA RECORREMOS 'usuariosFiltrados' EN VEZ DE 'usuarios' */}
                {usuariosFiltrados.map((u) => (
                  <tr key={u.UsuarioID} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-500">#{u.UsuarioID}</td>
                    <td className="p-4 font-medium text-gray-900">{u.Nombre} {u.Apellidos}</td>
                    <td className="p-4 text-gray-600">{u.Email}</td>
                    <td className="p-4 text-center">
                      {u.RolID === 1 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Shield className="size-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <User className="size-3" /> Estudiante
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {u.verificado ? (
                        <span className="text-green-600 font-medium text-sm">Verificado</span>
                      ) : (
                        <span className="text-yellow-600 font-medium text-sm">Pendiente</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => abrirModal(u, "ver")}>
                          <Eye className="size-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => abrirModal(u, "editar")}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleEliminar(u.UsuarioID, u.Nombre)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* MENSAJE SI NO HAY RESULTADOS EN LA BÚSQUEDA */}
                {usuariosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      {busqueda !== "" 
                        ? `No se encontró a nadie con "${busqueda}"` 
                        : "No hay usuarios registrados en el sistema."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* --- MODAL FLOTANTE --- */}
      {modalAbierto && usuarioSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 bg-white shadow-xl relative">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={() => setModalAbierto(false)}>
              <X className="size-5 text-gray-500" />
            </Button>
            
            <h2 className="text-xl font-bold mb-4">
              {modoModal === "ver" ? "Detalles del Usuario" : "Editar Usuario"}
            </h2>

            <form onSubmit={handleGuardarEdicion} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Nombre</Label>
                  <Input 
                    disabled={modoModal === "ver"} 
                    value={usuarioSeleccionado.Nombre} 
                    onChange={e => setUsuarioSeleccionado({...usuarioSeleccionado, Nombre: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <Label>Apellidos</Label>
                  <Input 
                    disabled={modoModal === "ver"} 
                    value={usuarioSeleccionado.Apellidos} 
                    onChange={e => setUsuarioSeleccionado({...usuarioSeleccionado, Apellidos: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Correo Electrónico</Label>
                <Input 
                  disabled={modoModal === "ver"} 
                  type="email" 
                  value={usuarioSeleccionado.Email} 
                  onChange={e => setUsuarioSeleccionado({...usuarioSeleccionado, Email: e.target.value})} 
                />
              </div>

              <div className="space-y-1">
                <Label>Teléfono</Label>
                <Input disabled value={usuarioSeleccionado.Telefono || "No registrado"} />
                {modoModal === "editar" && <p className="text-xs text-gray-400">El teléfono solo lo puede cambiar el dueño de la cuenta.</p>}
              </div>

              <div className="space-y-1">
                <Label>Rol del Sistema</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={modoModal === "ver"}
                  value={usuarioSeleccionado.RolID}
                  onChange={e => setUsuarioSeleccionado({...usuarioSeleccionado, RolID: Number(e.target.value)})}
                >
                  <option value={1}>Administrador</option>
                  <option value={2}>Estudiante</option>
                </select>
              </div>

              {modoModal === "editar" && (
                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                  <Button type="button" variant="ghost" onClick={() => setModalAbierto(false)}>Cancelar</Button>
                  <Button type="submit" disabled={procesando}>
                    {procesando ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              )}
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}