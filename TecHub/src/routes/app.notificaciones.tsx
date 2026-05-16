import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, ShoppingBag, CheckCircle, XCircle, Star, Phone, Trash2, PackageCheck, PackageX, ShoppingCart, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/app/notificaciones")({
  component: NotificacionesPage,
});

interface Notificacion {
  NotificacionID: number;
  Titulo: string;
  Mensaje: string;
  Tipo: "solicitud_compra" | "compra_aceptada" | "compra_completada" | "compra_cancelada";
  ProductoID: number | null;
  OrdenID: number | null;
  NombreProducto: string | null;
  ImagenPath: string | null;
  FechaCreacion: string;
  RemitenteID: number | null;
}

const getImageSrc = (path: string) =>
  path.startsWith("http") ? path : `${API_URL}${path}`;

function NotificacionesPage() {
  const nav = useNavigate();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState<number | null>(null);

  const token = localStorage.getItem("techub_token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const cargarNotificaciones = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/usuarios/notificaciones`, { headers });
      if (res.ok) setNotificaciones(await res.json());
    } catch {
      toast.error("Error al cargar notificaciones");
    } finally {
      setCargando(false);
    }
  };

  // Aceptar solicitud de compra → crea la orden
  const handleAceptar = async (notif: Notificacion) => {
    setProcesando(notif.NotificacionID);
    try {
      const res = await fetch(`${API_URL}/usuarios/ordenes/${notif.NotificacionID}/aceptar`, {
        method: "POST",
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al aceptar");
      toast.success("Solicitud aceptada — se notificó al comprador");
      cargarNotificaciones();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcesando(null);
    }
  };

  // Rechazar solicitud → solo elimina la notificación
  const handleRechazar = async (notif: Notificacion) => {
    if (!confirm(`¿Rechazar la solicitud de "${notif.NombreProducto}"?`)) return;
    setProcesando(notif.NotificacionID);
    try {
      const res = await fetch(`${API_URL}/usuarios/notificaciones/${notif.NotificacionID}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Error al rechazar");
      toast.success("Solicitud rechazada");
      cargarNotificaciones();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcesando(null);
    }
  };

  // Eliminar notificación informativa
  const handleEliminar = async (id: number) => {
    try {
      await fetch(`${API_URL}/usuarios/notificaciones/${id}`, { method: "DELETE", headers });
      setNotificaciones(prev => prev.filter(n => n.NotificacionID !== id));
    } catch {
      toast.error("Error al eliminar");
    }
  };

  // Formatear fecha
  const formatFecha = (fecha: string) => {
    // El backend ya convierte a hora de Costa Rica, solo formateamos
    const d = new Date(fecha);
    return d.toLocaleString("es-CR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Verifica si el mensaje es un valor crudo de enum (bug en datos viejos)
  const esMensajeValido = (msg: string, tipo: string) =>
    msg && msg !== tipo && !msg.includes("_");

  // Config visual por tipo
  const tipoConfig = {
    solicitud_compra: {
      icon: <ShoppingCart className="size-5 text-blue-600" />,
      bg: "bg-blue-50 border-blue-100",
      badge: "bg-blue-100 text-blue-700",
      label: "Solicitud de compra",
    },
    compra_aceptada: {
      icon: <CheckCircle className="size-5 text-green-600" />,
      bg: "bg-green-50 border-green-100",
      badge: "bg-green-100 text-green-700",
      label: "Compra aceptada",
    },
    compra_completada: {
      icon: <PackageCheck className="size-5 text-purple-600" />,
      bg: "bg-purple-50 border-purple-100",
      badge: "bg-purple-100 text-purple-700",
      label: "Compra completada",
    },
    compra_cancelada: {
      icon: <PackageX className="size-5 text-red-500" />,
      bg: "bg-red-50 border-red-100",
      badge: "bg-red-100 text-red-700",
      label: "Compra cancelada",
    },
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* CABECERA */}
      <div className="flex items-center justify-between border-b pb-6">
        <div className="flex items-center gap-3">
          <Bell className="size-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Notificaciones</h1>
            <p className="text-muted-foreground text-sm">
              {notificaciones.length} {notificaciones.length === 1 ? "notificación" : "notificaciones"}
            </p>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      {cargando ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="animate-spin size-10 text-primary" />
          <p className="text-muted-foreground animate-pulse">Cargando notificaciones...</p>
        </div>
      ) : notificaciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white rounded-2xl border-2 border-dashed">
          <Bell className="size-16 text-muted-foreground/20" />
          <div className="text-center">
            <p className="font-semibold text-gray-600">Sin notificaciones</p>
            <p className="text-sm text-muted-foreground mt-1">Cuando alguien quiera comprar tu producto, aparecerá aquí</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {notificaciones.map((notif) => {
            const config = tipoConfig[notif.Tipo];
            const estaProcesando = procesando === notif.NotificacionID;

            return (
              <Card key={notif.NotificacionID} className={`p-5 border ${config.bg} shadow-sm`}>
                <div className="flex gap-4">
                  {/* Imagen del producto */}
                  <div className="size-16 rounded-lg bg-white border overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {notif.ImagenPath ? (
                      <img
                        src={getImageSrc(notif.ImagenPath)}
                        alt={notif.NombreProducto || ""}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <ShoppingBag className="size-7 text-muted-foreground opacity-30" />
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    {/* Badge tipo + fecha */}
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.badge}`}>
                        {config.icon}
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatFecha(notif.FechaCreacion)}
                      </span>
                    </div>

                    {/* Título y mensaje */}
                    <p className="font-bold text-gray-800 text-sm">{notif.Titulo}</p>
                    {esMensajeValido(notif.Mensaje, notif.Tipo) && (
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{notif.Mensaje}</p>
                    )}

                    {/* ACCIONES POR TIPO */}
                    <div className="mt-4 flex flex-wrap gap-2">

                      {/* SOLICITUD DE COMPRA → Aceptar / Rechazar / Ver perfil comprador */}
                      {notif.Tipo === "solicitud_compra" && (
                        <>
                          <Button
                            size="sm"
                            className="gap-1.5 bg-green-600 hover:bg-green-700"
                            disabled={estaProcesando}
                            onClick={() => handleAceptar(notif)}
                          >
                            {estaProcesando
                              ? <Loader2 className="size-4 animate-spin" />
                              : <CheckCircle className="size-4" />}
                            Aceptar solicitud
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            disabled={estaProcesando}
                            onClick={() => handleRechazar(notif)}
                          >
                            <XCircle className="size-4" /> Rechazar
                          </Button>
                          {notif.RemitenteID && (
                            <Link to="/app/usuario/$id" params={{ id: String(notif.RemitenteID) }}>
                              <Button size="sm" variant="outline" className="gap-1.5">
                                <UserIcon className="size-4" /> Ver perfil
                              </Button>
                            </Link>
                          )}
                        </>
                      )}

                      {/* COMPRA ACEPTADA → Mostrar teléfono prominente */}
                      {notif.Tipo === "compra_aceptada" && (
                        <>
                          <div className="w-full flex items-center gap-2 bg-white rounded-lg border border-green-200 px-3 py-2">
                            <Phone className="size-4 text-green-600 flex-shrink-0" />
                            <p className="text-sm font-bold text-green-700">
                              {notif.Mensaje.match(/\+?\d[\d\s-]{6,}/)?.[0] || "Ver mensaje"}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1.5 text-muted-foreground"
                            onClick={() => handleEliminar(notif.NotificacionID)}
                          >
                            <Trash2 className="size-4" /> Descartar
                          </Button>
                        </>
                      )}

                      {/* COMPRA COMPLETADA → Calificar vendedor */}
                      {notif.Tipo === "compra_completada" && (
                        <>
                          <Button
                            size="sm"
                            className="gap-1.5 bg-purple-600 hover:bg-purple-700"
                            onClick={() => nav({ to: "/app/calificar/$ordenID", params: { ordenID: String(notif.OrdenID) } })}
                          >
                            <Star className="size-4" /> Calificar vendedor
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1.5 text-muted-foreground"
                            onClick={() => handleEliminar(notif.NotificacionID)}
                          >
                            <Trash2 className="size-4" /> Descartar
                          </Button>
                        </>
                      )}

                      {/* COMPRA CANCELADA → Solo descartar */}
                      {notif.Tipo === "compra_cancelada" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1.5 text-muted-foreground"
                          onClick={() => handleEliminar(notif.NotificacionID)}
                        >
                          <Trash2 className="size-4" /> Descartar
                        </Button>
                      )}

                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}