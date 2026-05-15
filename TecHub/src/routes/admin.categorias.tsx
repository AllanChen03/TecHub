import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LayoutGrid, Plus, Search, Pencil, Trash2, X, Image as ImageIcon, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/categorias")({
  component: CategoriasPage,
});

interface Categoria {
  CategoriaID: number;
  NombreCategoria: string;
  ImagenPath: string | null;
}

function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modo, setModo] = useState<"crear" | "editar">("crear");
  const [procesando, setProcesando] = useState(false);
  
  const [nombre, setNombre] = useState("");
  const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/categorias`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("techub_token")}` },
      });
      if (!res.ok) throw new Error("Error al obtener categorías");
      const data = await res.json();
      setCategorias(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id: number, nombreCat: string) => {
    if (!confirm(`¿Eliminar la categoría "${nombreCat}"? Los productos asociados podrían quedar sin categoría.`)) return;

    try {
      const res = await fetch(`${API_URL}/admin/categorias/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("techub_token")}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");

      toast.success("Categoría eliminada");
      cargarCategorias();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcesando(true);

    const formData = new FormData();
    formData.append("nombreCategoria", nombre);
    if (archivoImagen) {
      formData.append("imagen", archivoImagen);
    }

    try {
      const url = modo === "crear" 
        ? `${API_URL}/admin/categorias` 
        : `${API_URL}/admin/categorias/${idSeleccionado}`;
      
      const method = modo === "crear" ? "POST" : "PUT";

      const res = await fetch(url, {
        method: method,
        headers: { "Authorization": `Bearer ${localStorage.getItem("techub_token")}` },
        body: formData
      });

      if (!res.ok) throw new Error("Error al guardar la categoría");

      toast.success(modo === "crear" ? "Categoría creada" : "Categoría actualizada");
      cerrarModal();
      cargarCategorias();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcesando(false);
    }
  };

  const abrirModal = (c?: Categoria) => {
    if (c) {
      setModo("editar");
      setNombre(c.NombreCategoria);
      setIdSeleccionado(c.CategoriaID);
    } else {
      setModo("crear");
      setNombre("");
      setIdSeleccionado(null);
    }
    setArchivoImagen(null);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setNombre("");
    setArchivoImagen(null);
  };

  const filtradas = categorias.filter(c => 
    c.NombreCategoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LayoutGrid className="size-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-800">Catálogo de Categorías</h1>
        </div>
        
        <div className="flex gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar categoría..." 
              className="pl-9 bg-white"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <Button onClick={() => abrirModal()} className="gap-2">
            <Plus className="size-4" /> Nueva Categoría
          </Button>
        </div>
      </div>

      {/* CUADRÍCULA */}
      {cargando ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin size-10 text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtradas.map(c => (
            <Card key={c.CategoriaID} className="overflow-hidden flex flex-col shadow-sm border-muted">
              {/* Imagen (No clickable) */}
              <div className="h-40 bg-muted relative overflow-hidden">
                {c.ImagenPath ? (
                  <img 
                    src={`${API_URL}${c.ImagenPath}`} 
                    alt={c.NombreCategoria}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="size-12 opacity-20" />
                  </div>
                )}
              </div>

              {/* Cuerpo de la Card */}
              <div className="p-4 flex items-center justify-between gap-2">
                <h3 className="font-bold text-gray-700 truncate">{c.NombreCategoria}</h3>
                
                {/* BOTONES DE ACCIÓN (Estilo admin.index) */}
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50" 
                    onClick={() => abrirModal(c)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" 
                    onClick={() => handleEliminar(c.CategoriaID, c.NombreCategoria)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {filtradas.length === 0 && (
            <div className="col-span-full p-10 text-center text-gray-500 bg-white rounded-lg border border-dashed">
              No se encontraron categorías registradas.
            </div>
          )}
        </div>
      )}

      {/* MODAL CREAR/EDITAR */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 relative bg-white shadow-2xl">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={cerrarModal}>
              <X className="size-5" />
            </Button>

            <h2 className="text-xl font-bold mb-6 text-primary">
              {modo === "crear" ? "Nueva Categoría" : "Editar Categoría"}
            </h2>

            <form onSubmit={handleGuardar} className="space-y-5">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input 
                  required 
                  placeholder="Ej: Libros, Ropa..." 
                  value={nombre} 
                  onChange={e => setNombre(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Imagen</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="cursor-pointer"
                    onChange={e => setArchivoImagen(e.target.files?.[0] || null)}
                  />
                  <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold tracking-widest">
                    {archivoImagen ? archivoImagen.name : "Formatos: JPG, PNG o WEBP"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button type="button" variant="ghost" className="flex-1" onClick={cerrarModal}>Cancelar</Button>
                <Button type="submit" className="flex-1" disabled={procesando}>
                  {procesando ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}