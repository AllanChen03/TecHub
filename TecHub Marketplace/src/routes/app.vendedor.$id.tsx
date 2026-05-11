import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { uid, type Comment } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/app/vendedor/$id")({
  component: VendedorPerfil,
});

function VendedorPerfil() {
  const { id } = useParams({ from: "/app/vendedor/$id" });
  const { db, setDB, user } = useAuth();
  const nav = useNavigate();
  const vendedor = db.users.find((u) => u.id === id);
  const [comentario, setComentario] = useState("");
  const [rating, setRating] = useState(5);

  if (!vendedor) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <p>Vendedor no encontrado.</p>
        <Button variant="ghost" onClick={() => nav({ to: "/app/productos" })}>Volver</Button>
      </div>
    );
  }

  const comentarios: Comment[] = vendedor.comentarios ?? [];
  const promedio = comentarios.length > 0 ? comentarios.reduce((s, c) => s + c.rating, 0) / comentarios.length : 0;
  const isSelf = user?.id === vendedor.id;
  const productosVendedor = db.products.filter((p) => p.vendedorId === vendedor.id);

  const agregarComentario = () => {
    if (!comentario.trim() || !user) return;
    const nuevo: Comment = { id: uid("cm"), autor: `${user.nombre} ${user.apellidos}`, rating, texto: comentario };
    setDB((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === id ? { ...u, comentarios: [...(u.comentarios ?? []), nuevo] } : u
      ),
    }));
    setComentario("");
    setRating(5);
    toast.success("Comentario publicado");
  };

  const eliminarComentario = (cid: string) => {
    setDB((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === id ? { ...u, comentarios: (u.comentarios ?? []).filter((c) => c.id !== cid) } : u
      ),
    }));
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => nav({ to: "/app/productos" })}>
        <ArrowLeft className="size-4" /> Volver
      </Button>

      <Card className="p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="size-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl" aria-hidden="true">
            {vendedor.nombre.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold">{vendedor.nombre} {vendedor.apellidos}</h1>
            <div className="text-sm text-muted-foreground">{vendedor.rol}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex text-warning" aria-label={`Calificación promedio ${promedio.toFixed(1)} de 5`}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`size-4 ${i <= Math.round(promedio) ? "fill-current" : ""}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{promedio.toFixed(1)} ({comentarios.length})</span>
            </div>
          </div>
        </div>
      </Card>

      {productosVendedor.length > 0 && (
        <Card className="p-6">
          <h2 className="font-semibold mb-3">Publicaciones de {vendedor.nombre}</h2>
          <ul className="space-y-2">
            {productosVendedor.map((p) => (
              <li key={p.id} className="text-sm">
                <button
                  className="underline text-primary hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  onClick={() => nav({ to: "/app/productos/$id", params: { id: p.id } })}
                >
                  {p.nombre} — ₡{p.precio.toLocaleString()}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="font-semibold mb-3">Comentarios sobre el vendedor ({comentarios.length})</h2>
        <div className="space-y-3">
          {comentarios.map((c) => (
            <div key={c.id} className="border-b pb-3 last:border-0">
              <div className="flex justify-between items-start">
                <div className="font-medium text-sm">{c.autor}</div>
                <div className="flex text-warning" aria-label={`${c.rating} de 5 estrellas`}>
                  {Array.from({ length: c.rating }).map((_, i) => <Star key={i} className="size-3 fill-current" />)}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{c.texto}</p>
              {(user?.rol === "admin" || (user && c.autor === `${user.nombre} ${user.apellidos}`)) && (
                <Button variant="ghost" size="sm" className="text-destructive mt-1 h-7" onClick={() => eliminarComentario(c.id)}>
                  Eliminar
                </Button>
              )}
            </div>
          ))}
          {comentarios.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay comentarios para este vendedor.</p>}
        </div>

        {user && !isSelf && (
          <div className="mt-4 space-y-2">
            <div role="radiogroup" aria-label="Calificación con estrellas" className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
                  onClick={() => setRating(n)}
                  className="text-warning focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  <Star className={`size-6 ${n <= rating ? "fill-current" : ""}`} />
                </button>
              ))}
              <span className="sr-only">Calificación seleccionada: {rating} de 5</span>
            </div>
            <Input placeholder="Escribir un comentario sobre el vendedor..." value={comentario} onChange={(e) => setComentario(e.target.value)} aria-label="Comentario sobre el vendedor" />
            <Button onClick={agregarComentario} size="sm">Publicar comentario</Button>
          </div>
        )}
        {isSelf && (
          <p className="text-xs text-muted-foreground mt-4">No podés comentar sobre tu propio perfil.</p>
        )}
      </Card>
    </div>
  );
}
