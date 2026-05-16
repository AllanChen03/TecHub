import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, Trash2, Loader2, Star } from "lucide-react";

export const Route = createFileRoute("/admin/comentarios")({
  component: AdminComentarios,
});

interface Comentario {
  ComentarioID: number;
  Comentario: string;
  Valoracion: number;
  Fecha: string;
  NombreProducto: string;
  CompradorNombre: string;
  CompradorApellidos: string;
  VendedorNombre: string;
  VendedorApellidos: string;
}

function AdminComentarios() {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const headers = { Authorization: `Bearer ${localStorage.getItem("techub_token")}` };

  useEffect(() => { cargarComentarios(); }, []);

  const cargarComentarios = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/admin/comentarios`, { headers });
      if (!res.ok) throw new Error("Error al obtener comentarios");
      setComentarios(await res.json());
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Eliminar el texto de esta reseña? La valoración (estrellas) se mantendrá.")) return;
    try {
      const res = await fetch(`${API_URL}/admin/comentarios/${id}`, {
        method: "DELETE", headers,
      });
      if (!res.ok) throw new Error("Error al eliminar");
      toast.success("Comentario eliminado — la valoración se mantiene");
      cargarComentarios();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleString("es-CR", {
      day: "numeric", month: "short", year: "numeric",
    });

  const filtrados = comentarios.filter(c =>
    c.NombreProducto.toLowerCase().includes(busqueda.toLowerCase()) ||
    `${c.CompradorNombre} ${c.CompradorApellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
    `${c.VendedorNombre} ${c.VendedorApellidos}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="size-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Reseñas</h1>
            <p className="text-muted-foreground text-sm">{comentarios.length} reseñas en total</p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="Buscar por producto o usuario..."
            className="pl-9 bg-white"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* CONTENIDO */}
      {cargando ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin size-10 text-primary" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="p-10 text-center text-gray-500 bg-white rounded-lg border border-dashed">
          {busqueda ? `No se encontraron reseñas con "${busqueda}"` : "No hay reseñas registradas."}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtrados.map(c => (
            <Card key={c.ComentarioID} className="p-5 shadow-sm bg-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Cabecera */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                    {/* Estrellas */}
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`size-4 ${i <= c.Valoracion ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatFecha(c.Fecha)}</span>
                  </div>

                  {/* Comentario */}
                  {c.Comentario ? (
                    <p className="text-sm text-gray-700 mb-3">{c.Comentario}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic mb-3">Sin comentario escrito</p>
                  )}

                  {/* Meta info */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span><strong className="text-gray-600">Producto:</strong> {c.NombreProducto}</span>
                    <span><strong className="text-gray-600">Comprador:</strong> {c.CompradorNombre} {c.CompradorApellidos}</span>
                    <span><strong className="text-gray-600">Vendedor:</strong> {c.VendedorNombre} {c.VendedorApellidos}</span>
                  </div>
                </div>

                {/* Eliminar comentario */}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 whitespace-nowrap"
                  onClick={() => handleEliminar(c.ComentarioID)}
                >
                  <Trash2 className="size-4" /> Eliminar comentario
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}