import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import type { Order } from "@/lib/store";

export const Route = createFileRoute("/admin/ordenes")({
  component: AdminOrdenes,
});

function AdminOrdenes() {
  const { db, setDB } = useAuth();
  const [editing, setEditing] = useState<Order | null>(null);

  const guardar = () => {
    if (!editing) return;
    setDB((prev) => ({ ...prev, orders: prev.orders.map((o) => o.id === editing.id ? editing : o) }));
    setEditing(null);
    toast.success("Orden actualizada");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Órdenes</h1>
      <div className="space-y-3">
        {db.orders.map((o) => (
          <Card key={o.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="bg-muted size-16 rounded-lg flex items-center justify-center text-3xl">{o.imagen}</div>
            <div className="flex-1">
              <div className="font-semibold">Orden ID: {o.id}</div>
              <div className="text-sm text-muted-foreground">Vendedor: {o.vendedor} · Comprador: {o.comprador}</div>
              <div className="text-sm">{o.productoNombre} · ₡{o.precio.toLocaleString()} · {o.ubicacion}</div>
            </div>
            <Badge variant={o.estado === "Completado" ? "default" : o.estado === "Pendiente" ? "secondary" : "destructive"}>
              {o.estado}
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => setEditing(o)}><Pencil className="size-4" /></Button>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Orden</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3 text-sm">
              <div><b>Producto:</b> {editing.productoNombre}</div>
              <div><b>Vendedor:</b> {editing.vendedor}</div>
              <div><b>Comprador:</b> {editing.comprador}</div>
              <div>
                <label className="text-sm font-medium">Estado</label>
                <Select value={editing.estado} onValueChange={(v) => setEditing({ ...editing, estado: v as Order["estado"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Completado">Completado</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Volver</Button>
            <Button onClick={guardar}>Actualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
