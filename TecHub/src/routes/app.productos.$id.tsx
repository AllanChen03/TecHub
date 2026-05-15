import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/config";
import { toast } from "sonner";
import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Tag,
  BadgeCheck,
  User as UserIcon,
  MessageCircle,
  Loader2,
  Star,
} from "lucide-react";

export const Route = createFileRoute("/app/productos/$id")({
  component: ProductoDetalle,
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
  UsuarioID: number;
  VendedorNombre: string;
  VendedorApellidos: string;
  VendedorTelefono: string;
  VendedorValoracion: number | null;
  VendedorTotalResenas: number;
}

function ProductoDetalle() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const token = localStorage.getItem("techub_token");
        const res = await fetch(`${API_URL}/usuarios/productos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          toast.error("No se encontro el producto");
          nav({ to: "/app/productos" });
          return;
        }

        const data = await res.json();
        setProducto(data);
      } catch (error) {
        toast.error("Error al cargar el producto");
        nav({ to: "/app/productos" });
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin size-10 text-primary" />
        <p className="text-muted-foreground animate-pulse">Cargando producto...</p>
      </div>
    );
  }

  if (!producto) return null;

  const esPropio = user?.id === producto.UsuarioID;

  const telefonoLimpio = producto.VendedorTelefono?.replace(/\D/g, "");
  const mensajeWhatsApp = encodeURIComponent(
    `Hola! Vi tu producto "${producto.NombreProducto}" en TecHub y me interesa. Sigue disponible?`
  );
  const linkWhatsApp = `https://wa.me/${telefonoLimpio}?text=${mensajeWhatsApp}`;

  const valoracion = producto.VendedorValoracion;
  const totalResenas = producto.VendedorTotalResenas ?? 0;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* BOTON VOLVER */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground hover:text-primary"
        onClick={() => nav({ to: "/app/productos" })}
      >
        <ArrowLeft className="size-4" /> Volver a productos
      </Button>

      {/* CARD PRINCIPAL */}
      <Card className="overflow-hidden shadow-sm">
        <div className="grid md:grid-cols-2 gap-0">
          {/* IMAGEN */}
          <div className="h-80 md:h-full bg-muted relative overflow-hidden">
            {producto.ImagenPath ? (
              <img
                src={`${API_URL}${producto.ImagenPath}`}
                alt={producto.NombreProducto}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-primary/5">
                <ShoppingBag className="size-16 opacity-20" />
              </div>
            )}
          </div>

          {/* DETALLES */}
          <div className="p-6 flex flex-col gap-4">
            <div>
              <p className="text-xs text-primary font-bold uppercase tracking-widest mb-1">
                {producto.NombreCategoria}
              </p>
              <h1 className="text-2xl font-bold text-gray-800">
                {producto.NombreProducto}
              </h1>
              <p className="text-3xl font-black text-primary mt-2">
                {Number(producto.Precio).toLocaleString("es-CR", {
                  style: "currency",
                  currency: "CRC",
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>

            {/* BADGES */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                <BadgeCheck className="size-3" />
                {producto.EstadoProducto}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                <MapPin className="size-3" />
                {producto.NombreSede}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                <Tag className="size-3" />
                {producto.NombreCategoria}
              </span>
            </div>

            {/* DESCRIPCION */}
            <div className="border-t pt-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Descripcion
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {producto.DescripcionProducto || "El vendedor no agrego una descripcion."}
              </p>
            </div>

            {/* BOTON COMPRA */}
            {!esPropio && (
              <div className="mt-auto pt-4 border-t">
                <a href={linkWhatsApp} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full gap-2 text-base h-12">
                    <MessageCircle className="size-5" />
                    Solicitar compra por WhatsApp
                  </Button>
                </a>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Te conectaremos directamente con el vendedor
                </p>
              </div>
            )}

            {esPropio && (
              <div className="mt-auto pt-4 border-t">
                <p className="text-sm text-center text-muted-foreground bg-muted rounded-lg p-3">
                  Este es tu producto publicado.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* CARD DEL VENDEDOR */}
      <Card className="p-6 shadow-sm">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
          Informacion del vendedor
        </p>
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-lg flex-shrink-0">
            {producto.VendedorNombre?.charAt(0)}
          </div>

          {/* Nombre */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800">
              {producto.VendedorNombre} {producto.VendedorApellidos}
            </p>
            <p className="text-sm text-muted-foreground">Estudiante TEC</p>
          </div>

          {/* VALORACION */}
          <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
            {valoracion !== null ? (
              <>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i <= Math.round(valoracion)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="font-bold text-gray-700">{valoracion.toFixed(1)}</span>
                  {" / 5.0 · "}{totalResenas} {totalResenas === 1 ? "resena" : "resenas"}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="size-4 fill-gray-200 text-gray-200" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Sin resenas aun</p>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}