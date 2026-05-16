import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/productos")({
  component: AdminProductos,
});

interface Producto {
  ProductoID: number;
  NombreProducto: string;
  Precio: number;
  ImagenPath: string | null;
  NombreCategoria: string;
  NombreSede: string;
  EstadoProducto: string;
  VendedorNombre: string;
  VendedorApellidos: string;
  DisponibilidadID: number;
}

const getImageSrc = (path: string) =>
  path.startsWith("http") ? path : `${API_URL}${path}`;

function AdminProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const headers = { Authorization: `Bearer ${localStorage.getItem("techub_token")}` };

  useEffect(() => { cargarProductos(); }, []);

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/admin/productos`, { headers });
      if (!res.ok) throw new Error("Error al obtener productos");
      setProductos(await res.json());
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/productos/${id}`, {
        method: "DELETE", headers,
      });
      if (!res.ok) throw new Error("Error al eliminar");
      toast.success("Producto eliminado");
      cargarProductos();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filtrados = productos.filter(p =>
    p.NombreProducto.toLowerCase().includes(busqueda.toLowerCase()) ||
    `${p.VendedorNombre} ${p.VendedorApellidos}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const disponibilidadLabel = (id: number) =>
    id === 1 ? { label: "Disponible", clase: "bg-green-100 text-green-700" }
             : { label: "No disponible", clase: "bg-red-100 text-red-700" };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Package className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Productos</h1>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o vendedor..."
            className="pl-9 bg-white"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA */}
      <Card className="p-0 overflow-hidden shadow-sm">
        {cargando ? (
          <div className="flex justify-center p-20">
            <Loader2 className="animate-spin size-10 text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-4 font-semibold text-gray-600">Producto</th>
                  <th className="p-4 font-semibold text-gray-600">Vendedor</th>
                  <th className="p-4 font-semibold text-gray-600">Categoría</th>
                  <th className="p-4 font-semibold text-gray-600">Sede</th>
                  <th className="p-4 font-semibold text-gray-600 text-right">Precio</th>
                  <th className="p-4 font-semibold text-gray-600 text-center">Estado</th>
                  <th className="p-4 font-semibold text-gray-600 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtrados.map(p => {
                  const disp = disponibilidadLabel(p.DisponibilidadID);
                  return (
                    <tr key={p.ProductoID} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center border">
                            {p.ImagenPath ? (
                              <img src={getImageSrc(p.ImagenPath)} alt={p.NombreProducto} className="w-full h-full object-contain p-1" />
                            ) : (
                              <ImageIcon className="size-5 text-muted-foreground opacity-30" />
                            )}
                          </div>
                          <span className="font-medium text-gray-900 line-clamp-1">{p.NombreProducto}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">{p.VendedorNombre} {p.VendedorApellidos}</td>
                      <td className="p-4 text-gray-600">{p.NombreCategoria || "—"}</td>
                      <td className="p-4 text-gray-600">{p.NombreSede || "—"}</td>
                      <td className="p-4 text-right font-bold text-primary">
                        ₡{Number(p.Precio).toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${disp.clase}`}>
                          {disp.label}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleEliminar(p.ProductoID, p.NombreProducto)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      {busqueda ? `No se encontraron productos con "${busqueda}"` : "No hay productos registrados."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}