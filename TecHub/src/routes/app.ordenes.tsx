import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package, ShoppingBag, Loader2, CheckCircle,
  XCircle, Image as ImageIcon, ShoppingCart, Store, Star,
} from "lucide-react";

export const Route = createFileRoute("/app/ordenes")({
  component: OrdenesPage,
});

interface OrdenCompra {
  OrdenID: number;
  Fecha: string;
  PrecioTotal: number;
  EstadoID: number;
  NombreEstado: string;
  ProductoID: number;
  NombreProducto: string;
  ImagenPath: string | null;
  VendedorNombre: string;
  VendedorApellidos: string;
}

interface OrdenVenta {
  OrdenID: number;
  Fecha: string;
  PrecioTotal: number;
  EstadoID: number;
  NombreEstado: string;
  ProductoID: number;
  NombreProducto: string;
  ImagenPath: string | null;
  CompradorNombre: string;
  CompradorApellidos: string;
  YaCalificadoComprador: number;
  CompradorID: number;
}

const getImageSrc = (path: string) =>
  path.startsWith("http") ? path : `${API_URL}${path}`;

const estadoConfig: Record<number, { label: string; clase: string }> = {
  1: { label: "Pendiente",  clase: "bg-yellow-100 text-yellow-800" },
  2: { label: "Completada", clase: "bg-green-100  text-green-800"  },
  3: { label: "Cancelada",  clase: "bg-red-100    text-red-800"    },
};

function OrdenesPage() {
  const [compras, setCompras] = useState<OrdenCompra[]>([]);
  const [ventas,  setVentas]  = useState<OrdenVenta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState<"compras" | "ventas">("compras");
  const [procesando, setProcesando] = useState<number | null>(null);

  const token = localStorage.getItem("techub_token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { cargarOrdenes(); }, []);

  const cargarOrdenes = async () => {
    setCargando(true);
    try {
      const [resCompras, resVentas] = await Promise.all([
        fetch(`${API_URL}/usuarios/mis-compras`,  { headers }),
        fetch(`${API_URL}/usuarios/mis-ventas`,   { headers }),
      ]);
      if (resCompras.ok) setCompras(await resCompras.json());
      if (resVentas.ok)  setVentas(await resVentas.json());
    } catch {
      toast.error("Error al cargar órdenes");
    } finally {
      setCargando(false);
    }
  };

  // Completar orden → también envía notificación al comprador
  const handleCompletar = async (ordenID: number) => {
    if (!confirm("¿Marcar esta orden como completada? Se notificará al comprador.")) return;
    setProcesando(ordenID);
    try {
      const res = await fetch(`${API_URL}/usuarios/ordenes/${ordenID}/completar`, {
        method: "PUT", headers,
      });
      if (!res.ok) throw new Error("Error al completar la orden");
      toast.success("Orden completada — se notificó al comprador");
      cargarOrdenes();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setProcesando(null);
    }
  };

  // Cancelar orden → también envía notificación al comprador
  const handleCancelar = async (ordenID: number) => {
    if (!confirm("¿Cancelar esta orden? El producto volverá a estar disponible.")) return;
    setProcesando(ordenID);
    try {
      const res = await fetch(`${API_URL}/usuarios/ordenes/${ordenID}/cancelar`, {
        method: "PUT", headers,
      });
      if (!res.ok) throw new Error("Error al cancelar la orden");
      toast.success("Orden cancelada");
      cargarOrdenes();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setProcesando(null);
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-CR", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  };

  const ImagenProducto = ({ path, nombre }: { path: string | null; nombre: string }) => (
    <div className="size-20 rounded-lg bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center border">
      {path ? (
        <img src={getImageSrc(path)} alt={nombre} className="w-full h-full object-contain p-2" />
      ) : (
        <ImageIcon className="size-8 text-muted-foreground opacity-30" />
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* CABECERA */}
      <div className="flex items-center gap-3 border-b pb-6">
        <Package className="size-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Órdenes</h1>
          <p className="text-muted-foreground text-sm">Historial de compras y ventas</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        {(["compras", "ventas"] as const).map((t) => {
          const count = t === "compras" ? compras.length : ventas.length;
          const activo = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activo
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t === "compras" ? <ShoppingCart className="size-4" /> : <Store className="size-4" />}
              {t === "compras" ? "Mis compras" : "Mis ventas"}
              {count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                  activo ? "bg-white/20" : "bg-primary/10 text-primary"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* CONTENIDO */}
      {cargando ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="animate-spin size-10 text-primary" />
          <p className="text-muted-foreground animate-pulse">Cargando órdenes...</p>
        </div>
      ) : tab === "compras" ? (
        /* ── MIS COMPRAS ── */
        compras.length === 0 ? (
          <EstadoVacio
            mensaje="Aún no has comprado nada"
            sub="Explorá los productos disponibles"
          />
        ) : (
          <div className="flex flex-col gap-4">
            {compras.map((o) => {
              const estado = estadoConfig[o.EstadoID] ?? { label: o.NombreEstado, clase: "bg-gray-100 text-gray-700" };
              return (
                <Card key={o.OrdenID} className="p-5 shadow-sm bg-white">
                  <div className="flex gap-4">
                    <ImagenProducto path={o.ImagenPath} nombre={o.NombreProducto} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-bold text-gray-800 line-clamp-1">{o.NombreProducto}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{formatFecha(o.Fecha)}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${estado.clase}`}>
                          {estado.label}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        <p className="text-primary font-black text-lg">
                          ₡{Number(o.PrecioTotal).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground self-center">
                          Vendedor: {o.VendedorNombre} {o.VendedorApellidos}
                        </p>
                      </div>
                      {/* El comprador NO puede editar la orden */}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        /* ── MIS VENTAS ── */
        ventas.length === 0 ? (
          <EstadoVacio
            mensaje="Aún no tienes ventas"
            sub="Tus ventas aceptadas aparecerán aquí"
          />
        ) : (
          <div className="flex flex-col gap-4">
            {ventas.map((o) => {
              const estado = estadoConfig[o.EstadoID] ?? { label: o.NombreEstado, clase: "bg-gray-100 text-gray-700" };
              const estaProcesando = procesando === o.OrdenID;
              return (
                <Card key={o.OrdenID} className="p-5 shadow-sm bg-white">
                  <div className="flex gap-4">
                    <ImagenProducto path={o.ImagenPath} nombre={o.NombreProducto} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-bold text-gray-800 line-clamp-1">{o.NombreProducto}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{formatFecha(o.Fecha)}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${estado.clase}`}>
                          {estado.label}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        <p className="text-primary font-black text-lg">
                          ₡{Number(o.PrecioTotal).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground self-center">
                          Comprador: {o.CompradorNombre} {o.CompradorApellidos}
                        </p>
                      </div>

                      {/* Pendiente: completar o cancelar */}
                      {o.EstadoID === 1 && (
                        <div className="flex gap-2 mt-3 pt-3 border-t">
                          <Button
                            size="sm"
                            className="gap-1.5 bg-green-600 hover:bg-green-700"
                            disabled={estaProcesando}
                            onClick={() => handleCompletar(o.OrdenID)}
                          >
                            {estaProcesando
                              ? <Loader2 className="size-4 animate-spin" />
                              : <CheckCircle className="size-4" />}
                            Marcar completada
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            disabled={estaProcesando}
                            onClick={() => handleCancelar(o.OrdenID)}
                          >
                            <XCircle className="size-4" /> Cancelar
                          </Button>
                        </div>
                      )}

                      {/* Completada: calificar al comprador */}
                      {o.EstadoID === 2 && o.YaCalificadoComprador === 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <Link to="/app/calificarComprador/$ordenID" params={{ ordenID: String(o.OrdenID) }}>
                            <Button size="sm" className="gap-1.5 bg-purple-600 hover:bg-purple-700 w-full">
                              <Star className="size-4" /> Calificar comprador
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

function EstadoVacio({ mensaje, sub }: { mensaje: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-2xl border-2 border-dashed">
      <ShoppingBag className="size-16 text-muted-foreground/20" />
      <div className="text-center">
        <p className="font-semibold text-gray-600">{mensaje}</p>
        <p className="text-sm text-muted-foreground mt-1">{sub}</p>
      </div>
    </div>
  );
}