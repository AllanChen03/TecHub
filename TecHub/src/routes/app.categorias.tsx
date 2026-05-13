import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { API_URL } from "@/lib/config";

export const Route = createFileRoute("/app/categorias")({
  component: CategoriasPage,
});

function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarCategorias = async () => {
      const token = localStorage.getItem('techub_token');
      
      try {
        const respuesta = await fetch(`${API_URL}/categorias`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (respuesta.ok) {
          const data = await respuesta.json();
          setCategorias(data);
        } else {
          toast.error("Error al obtener las categorías");
        }
      } catch (error) {
        console.error("Error de conexión:", error);
        toast.error("No se pudo conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };

    cargarCategorias();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Cargando categorías...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Todas las categorías</h1>
        <p className="text-sm text-muted-foreground">
          Explora los materiales disponibles por área de estudio.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categorias.map((c: any) => (
          <Link
            key={c.CategoriaID}
            to="/app/productos"
            search={{categoriaID: c.CategoriaID }}
          >
            <Card className="p-6 text-center hover:shadow-md hover:border-primary transition cursor-pointer h-full flex flex-col items-center justify-center gap-3">
              <div className="bg-primary/5 p-4 rounded-full">
                {c.ImagenPath ? (
                  <img 
                    src={`${API_URL}${c.ImagenPath}`} 
                    alt={c.NombreCategoria} 
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center text-primary font-bold text-3xl">
                    {c.NombreCategoria?.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <div className="font-bold text-foreground">{c.NombreCategoria}</div>
                {/* Opcional: Si quieres mostrar el conteo de productos, 
                    el backend debería enviarlo o hacer otro fetch */}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {categorias.length === 0 && (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <p className="text-muted-foreground">No se encontraron categorías disponibles.</p>
        </div>
      )}
    </div>
  );
}