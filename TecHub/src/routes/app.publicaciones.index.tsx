import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ShoppingBag,
  Loader2,
  Package,
  Image as ImageIcon,
} from "lucide-react";

export const Route = createFileRoute("/app/publicaciones/")({
  component: PublicacionesPage,
});

interface Producto {
  ProductoID: number;
  NombreProducto: string;
  DescripcionProducto: string;
  Precio: number;
  ImagenPath: string | null;
  EstadoProducto: string;
  NombreSede: string;
  NombreCategoria: string;
  CategoriaID: number;
  SedeID: number;
  CondicionID: number;
  DisponibilidadID: number;
}

interface Opcion {
  id: number;
  nombre: string;
}

function PublicacionesPage() {
  const { user } = useAuth();

  // Datos
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Opcion[]>([]);
  const [sedes, setSedes] = useState<Opcion[]>([]);
  const [condiciones, setCondiciones] = useState<Opcion[]>([]);

  // UI
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modo, setModo] = useState<"crear" | "editar">("crear");
  const [procesando, setProcesando] = useState(false);
  const [idSeleccionado, setIdSeleccionado] = useState<number | null>(null);

  // Formulario
  const [form, setForm] = useState({
    NombreProducto: "",
    DescripcionProducto: "",
    Precio: "",
    CategoriaID: "",
    SedeID: "",
    CondicionID: "",
  });
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);

  const token = localStorage.getItem("techub_token");
  const headers = { Authorization: `Bearer ${token}` };

  // ── Carga inicial ──────────────────────────────────────────────
  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    setCargando(true);
    try {
      const [resProd, resCat, resSedes, resCond] = await Promise.all([
        fetch(`${API_URL}/usuarios/mis-productos`, { headers }),
        fetch(`${API_URL}/usuarios/categorias`, { headers }),
        fetch(`${API_URL}/usuarios/sedes`, { headers }),
        fetch(`${API_URL}/usuarios/condiciones`, { headers }),
      ]);

      if (resProd.ok) setProductos(await resProd.json());
      if (resCat.ok) {
        const data = await resCat.json();
        setCategorias(data.map((c: any) => ({ id: c.CategoriaID, nombre: c.NombreCategoria })));
      }
      if (resSedes.ok) {
        const data = await resSedes.json();
        setSedes(data.map((s: any) => ({ id: s.SedeID, nombre: s.NombreSede })));
      }
      if (resCond.ok) {
        const data = await resCond.json();
        setCondiciones(data.map((c: any) => ({ id: c.CondicionID, nombre: c.EstadoProducto })));
      }
    } catch (error) {
      toast.error("Error al cargar los datos");
    } finally {
      setCargando(false);
    }
  };

  // ── Abrir modal ────────────────────────────────────────────────
  const abrirCrear = () => {
    setModo("crear");
    setIdSeleccionado(null);
    setForm({ NombreProducto: "", DescripcionProducto: "", Precio: "", CategoriaID: "", SedeID: "", CondicionID: "" });
    setArchivoImagen(null);
    setModalAbierto(true);
  };

  const abrirEditar = (p: Producto) => {
    setModo("editar");
    setIdSeleccionado(p.ProductoID);
    setForm({
      NombreProducto: p.NombreProducto,
      DescripcionProducto: p.DescripcionProducto || "",
      Precio: String(p.Precio),
      CategoriaID: String(p.CategoriaID),
      SedeID: String(p.SedeID),
      CondicionID: String(p.CondicionID),
    });
    setArchivoImagen(null);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
  };

  // ── Guardar (crear o editar) ───────────────────────────────────
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcesando(true);

    const formData = new FormData();
    formData.append("NombreProducto", form.NombreProducto);
    formData.append("DescripcionProducto", form.DescripcionProducto);
    formData.append("Precio", form.Precio);
    formData.append("CategoriaID", form.CategoriaID);
    formData.append("SedeID", form.SedeID);
    formData.append("CondicionID", form.CondicionID);
    if (archivoImagen) formData.append("imagen", archivoImagen);

    try {
      const url =
        modo === "crear"
          ? `${API_URL}/usuarios/productos`
          : `${API_URL}/usuarios/productos/${idSeleccionado}`;

      const res = await fetch(url, {
        method: modo === "crear" ? "POST" : "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Error al guardar");
      }

      toast.success(modo === "crear" ? "Publicacion creada" : "Publicacion actualizada");
      cerrarModal();
      cargarTodo();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcesando(false);
    }
  };

  // ── Eliminar ───────────────────────────────────────────────────
  const handleEliminar = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"? Esta accion no se puede deshacer.`)) return;

    try {
      const res = await fetch(`${API_URL}/usuarios/productos/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) throw new Error("Error al eliminar");
      toast.success("Publicacion eliminada");
      cargarTodo();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-3">
          <Package className="size-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mis Publicaciones</h1>
            <p className="text-muted-foreground text-sm">
              {productos.length} {productos.length === 1 ? "producto publicado" : "productos publicados"}
            </p>
          </div>
        </div>
        <Button onClick={abrirCrear} className="gap-2">
          <Plus className="size-4" /> Nueva Publicacion
        </Button>
      </div>

      {/* CONTENIDO */}
      {cargando ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="animate-spin size-10 text-primary" />
          <p className="text-muted-foreground animate-pulse">Cargando publicaciones...</p>
        </div>
      ) : productos.length === 0 ? (
        /* ESTADO VACÍO */
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-2xl border-2 border-dashed">
          <ShoppingBag className="size-16 text-muted-foreground/20" />
          <div className="text-center">
            <p className="font-semibold text-gray-600">Todavia no tenes publicaciones</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crea tu primera publicacion y empieza a vender
            </p>
          </div>
          <Button onClick={abrirCrear} className="gap-2 mt-2">
            <Plus className="size-4" /> Crear primera publicacion
          </Button>
        </div>
      ) : (
        /* GRID DE PRODUCTOS */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productos.map((p) => (
            <Card
              key={p.ProductoID}
              className="overflow-hidden flex flex-col shadow-sm border-muted bg-white"
            >
              {/* Imagen */}
              <div className="h-44 bg-muted relative overflow-hidden">
                {p.ImagenPath ? (
                  <img
                    src={p.ImagenPath.startsWith("http") ? p.ImagenPath : `${API_URL}${p.ImagenPath}`}
                    alt={p.NombreProducto}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-primary/5">
                    <ImageIcon className="size-12 opacity-20" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="font-bold text-gray-700 line-clamp-1">{p.NombreProducto}</h3>
                <p className="text-primary font-black text-lg">
                  ₡{Number(p.Precio).toLocaleString()}
                </p>
                <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                  <span><span className="font-semibold text-gray-500">Estado:</span> {p.EstadoProducto || "—"}</span>
                  <span><span className="font-semibold text-gray-500">Sede:</span> {p.NombreSede || "—"}</span>
                  <span><span className="font-semibold text-gray-500">Categoria:</span> {p.NombreCategoria || "—"}</span>
                </div>

                {/* Botones */}
                <div className="flex gap-2 mt-auto pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    onClick={() => abrirEditar(p)}
                  >
                    <Pencil className="size-3.5" /> Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleEliminar(p.ProductoID, p.NombreProducto)}
                  >
                    <Trash2 className="size-3.5" /> Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg p-6 relative bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Cerrar */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={cerrarModal}
            >
              <X className="size-5" />
            </Button>

            <h2 className="text-xl font-bold mb-6 text-primary">
              {modo === "crear" ? "Nueva Publicacion" : "Editar Publicacion"}
            </h2>

            <form onSubmit={handleGuardar} className="space-y-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label>Nombre del producto</Label>
                <Input
                  required
                  placeholder="Ej: Calculadora cientifica TI-84"
                  value={form.NombreProducto}
                  onChange={(e) => setForm({ ...form, NombreProducto: e.target.value })}
                />
              </div>

              {/* Descripcion */}
              <div className="space-y-2">
                <Label>Descripcion</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  placeholder="Describe el estado, incluye, etc."
                  value={form.DescripcionProducto}
                  onChange={(e) => setForm({ ...form, DescripcionProducto: e.target.value })}
                />
              </div>

              {/* Precio */}
              <div className="space-y-2">
                <Label>Precio (₡)</Label>
                <Input
                  required
                  type="number"
                  min="0"
                  placeholder="Ej: 15000"
                  value={form.Precio}
                  onChange={(e) => setForm({ ...form, Precio: e.target.value })}
                />
              </div>

              {/* Selects en grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Categoria */}
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <select
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.CategoriaID}
                    onChange={(e) => setForm({ ...form, CategoriaID: e.target.value })}
                  >
                    <option value="">Seleccionar</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Sede */}
                <div className="space-y-2">
                  <Label>Sede</Label>
                  <select
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.SedeID}
                    onChange={(e) => setForm({ ...form, SedeID: e.target.value })}
                  >
                    <option value="">Seleccionar</option>
                    {sedes.map((s) => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Condicion */}
                <div className="space-y-2">
                  <Label>Condicion</Label>
                  <select
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.CondicionID}
                    onChange={(e) => setForm({ ...form, CondicionID: e.target.value })}
                  >
                    <option value="">Seleccionar</option>
                    {condiciones.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Imagen */}
              <div className="space-y-2">
                <Label>Imagen {modo === "editar" && "(dejar vacio para mantener la actual)"}</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
                  <Input
                    type="file"
                    accept="image/*"
                    className="cursor-pointer"
                    onChange={(e) => setArchivoImagen(e.target.files?.[0] || null)}
                  />
                  <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold tracking-widest">
                    {archivoImagen ? archivoImagen.name : "JPG, PNG o WEBP"}
                  </p>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-3 pt-4 border-t">
                <Button type="button" variant="ghost" className="flex-1" onClick={cerrarModal}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={procesando}>
                  {procesando ? (
                    <><Loader2 className="size-4 animate-spin mr-2" /> Guardando...</>
                  ) : (
                    modo === "crear" ? "Publicar" : "Guardar cambios"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}