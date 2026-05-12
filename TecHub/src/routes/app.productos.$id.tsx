import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, MapPin, ArrowLeft, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/productos/$id")({
  component: ProductoDetalle,
});

function ProductoDetalle() {
  const { id } = useParams({ from: "/app/productos/$id" });
  const { db, user } = useAuth();
  const nav = useNavigate();
  const producto = db.products.find((p) => p.id === id);
  const [mensaje, setMensaje] = useState("");

  if (!producto) return <div>Producto no encontrado</div>;

  const isOwner = user?.id === producto.vendedorId;
  const vendedor = db.users.find((u) => u.id === producto.vendedorId);
  const comentariosVendedor = vendedor?.comentarios ?? [];
  const promedio =
    comentariosVendedor.length > 0
      ? comentariosVendedor.reduce((s, c) => s + c.rating, 0) / comentariosVendedor.length
      : 0;

  const enviarMensaje = () => {
    if (!mensaje.trim()) return;
    toast.success("Mensaje enviado al vendedor");
    setMensaje("");
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => nav({ to: "/app/productos" })}>
        <ArrowLeft className="size-4" /> Volver
      </Button>
      <Card className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-muted aspect-square rounded-lg flex items-center justify-center text-9xl overflow-hidden">
            {producto.imagen?.startsWith("data:") || producto.imagen?.startsWith("http") ? (
              <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
            ) : (producto.imagen)}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{producto.nombre}</h1>
            <div className="text-2xl text-primary font-bold mt-2">₡{producto.precio.toLocaleString()}</div>
            <div className="flex gap-2 mt-3">
              <Badge variant="secondary">{producto.estado}</Badge>
              <Badge variant="outline">{producto.categoria}</Badge>
            </div>
            <p className="mt-4 text-sm">{producto.descripcion}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-3">
              <MapPin className="size-4" /> {producto.ubicacion}
            </div>
            {!isOwner && (
              <div className="mt-4 space-y-2">
                <Input placeholder="Enviar mensaje al vendedor..." value={mensaje} onChange={(e) => setMensaje(e.target.value)} aria-label="Mensaje al vendedor" />
                <Button onClick={enviarMensaje} className="w-full">Enviar mensaje</Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-3">Información del vendedor</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold" aria-hidden="true">
            {producto.vendedorNombre.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{producto.vendedorNombre}</div>
            <div className="text-xs text-muted-foreground">Miembro desde abril 2026</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex text-warning" aria-label={`Calificación promedio ${promedio.toFixed(1)} de 5`}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`size-4 ${i <= Math.round(promedio) ? "fill-current" : ""}`} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({comentariosVendedor.length})</span>
          </div>
        </div>
        {vendedor && (
          <div className="mt-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/app/vendedor/$id" params={{ id: vendedor.id }}>
                <UserIcon className="size-4" /> Ver perfil del vendedor
              </Link>
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
