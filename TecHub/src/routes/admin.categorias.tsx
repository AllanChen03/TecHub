import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { uid } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categorias")({
  component: AdminCategorias,
});

function AdminCategorias() {
  const { db, setDB } = useAuth();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [icon, setIcon] = useState("📦");

  const abrirNuevo = () => { setEditId(null); setNombre(""); setIcon("📦"); setOpen(true); };
  const abrirEditar = (id: string) => {
    const c = db.categories.find((x) => x.id === id);
    if (!c) return;
    setEditId(id); setNombre(c.nombre); setIcon(c.icon); setOpen(true);
  };

  const guardar = () => {
    if (!nombre.trim()) return;
    setDB((prev) => editId
      ? { ...prev, categories: prev.categories.map((c) => c.id === editId ? { ...c, nombre, icon } : c) }
      : { ...prev, categories: [...prev.categories, { id: uid("c"), nombre, icon }] }
    );
    setOpen(false);
    toast.success(editId ? "Categoría actualizada" : "Categoría creada");
  };

  const eliminar = (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar esta categoría?")) return;
    setDB((prev) => ({ ...prev, categories: prev.categories.filter((c) => c.id !== id) }));
    toast.success("Categoría eliminada");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Todas las categorías</h1>
        <Button onClick={abrirNuevo}><Plus className="size-4" /> Añadir Categoría</Button>
      </div>
      <Card className="divide-y">
        {db.categories.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-3">
            <div className="text-2xl">{c.icon}</div>
            <div className="flex-1 font-medium">{c.nombre}</div>
            <Button variant="ghost" size="icon" onClick={() => abrirEditar(c.id)}><Pencil className="size-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => eliminar(c.id)}><Trash2 className="size-4 text-destructive" /></Button>
          </div>
        ))}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "Actualizar Categoría" : "Crear Categoría"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm">Nombre</label>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre de la categoría" />
            </div>
            <div>
              <label className="text-sm">Icono (emoji)</label>
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Volver</Button>
            <Button onClick={guardar}>{editId ? "Actualizar" : "Crear"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
