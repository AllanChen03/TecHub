import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { uid } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/app/publicaciones/nueva")({
  component: NuevaPublicacion,
});

function NuevaPublicacion() {
  const { db, user, setDB } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({
    nombre: "", precio: "", estado: "Nuevo" as "Nuevo" | "Usado",
    categoria: db.categories[0]?.nombre ?? "", descripcion: "", ubicacion: "Campus Cartago", imagen: "📦",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setDB((prev) => ({
      ...prev,
      products: [...prev.products, {
        id: uid("p"), nombre: f.nombre, precio: Number(f.precio), estado: f.estado,
        categoria: f.categoria, descripcion: f.descripcion, ubicacion: f.ubicacion,
        vendedorId: user.id, vendedorNombre: `${user.nombre} ${user.apellidos}`,
        imagen: f.imagen, comentarios: [],
      }],
    }));
    toast.success("Producto añadido");
    nav({ to: "/app/publicaciones" });
  };

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-primary text-center mb-6">Añadir Producto</h1>
      <form onSubmit={submit} className="space-y-3">
        <div><Label>Nombre</Label><Input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} required /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Precio (₡)</Label><Input type="number" value={f.precio} onChange={(e) => setF({ ...f, precio: e.target.value })} required /></div>
          <div>
            <Label>Estado</Label>
            <Select value={f.estado} onValueChange={(v) => setF({ ...f, estado: v as "Nuevo" | "Usado" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Nuevo">Nuevo</SelectItem>
                <SelectItem value="Usado">Usado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Categoría</Label>
          <Select value={f.categoria} onValueChange={(v) => setF({ ...f, categoria: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {db.categories.map((c) => <SelectItem key={c.id} value={c.nombre}>{c.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div><Label>Descripción</Label><Textarea value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} required /></div>
        <div><Label>Ubicación</Label><Input value={f.ubicacion} onChange={(e) => setF({ ...f, ubicacion: e.target.value })} /></div>
        <div>
          <Label>Imagen del producto</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 2 * 1024 * 1024) {
                toast.error("La imagen debe pesar menos de 2MB");
                return;
              }
              const reader = new FileReader();
              reader.onload = () => setF({ ...f, imagen: String(reader.result) });
              reader.readAsDataURL(file);
            }}
          />
          {f.imagen?.startsWith("data:") ? (
            <img src={f.imagen} alt="Vista previa" className="mt-2 max-h-40 rounded-md border object-contain" />
          ) : (
            <div className="mt-2 text-xs text-muted-foreground">
              Si no subís una imagen, se usará el emoji <span className="text-lg">{f.imagen}</span> como portada.
            </div>
          )}
          <div className="mt-2">
            <Label className="text-xs text-muted-foreground">Emoji alternativo</Label>
            <Input
              value={f.imagen?.startsWith("data:") ? "" : f.imagen}
              placeholder="📦"
              onChange={(e) => setF({ ...f, imagen: e.target.value || "📦" })}
            />
          </div>
        </div>
        <div className="flex gap-2 pt-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => nav({ to: "/app/publicaciones" })}>Volver</Button>
          <Button type="submit" className="flex-1">Añadir producto</Button>
        </div>
      </form>
    </Card>
  );
}
