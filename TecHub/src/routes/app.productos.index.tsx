import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ShoppingBag, FilterX } from "lucide-react";
import { API_URL } from "@/lib/config";

// Definimos que esta ruta acepta "categoriaID" opcional en la URL (?categoriaID=1)
export const Route = createFileRoute("/app/productos/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      categoriaID: search.categoriaID ? Number(search.categoriaID) : undefined,
    };
  },
  component: ProductosCatalogPage,
});

function ProductosCatalogPage() {
  const { categoriaID } = Route.useSearch(); // Leemos el ID de la categoría
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const token = localStorage.getItem('techub_token');
        const res = await fetch(`${API_URL}/productos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProductos(data);
        }
      } catch (error) {
        console.error("Error cargando productos", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  // Lógica de filtrado
  const productosFiltrados = useMemo(() => {
    return productos.filter((p: any) => {
      const cumpleCategoria = categoriaID 
        ? Number(p.CategoriaID) === categoriaID 
        : true;
      const cumpleBusqueda = p.NombreProducto?.toLowerCase().includes(busqueda.toLowerCase());
      return cumpleCategoria && cumpleBusqueda;
    });
  }, [productos, categoriaID, busqueda]);

  if (loading) return <div className="p-10 text-center">Cargando catálogo...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Catálogo de Productos</h1>
          {categoriaID && (
            <p className="text-sm text-primary font-medium flex items-center gap-2">
              Filtrando por categoría activa 
              <Link to="/app/productos" className="text-xs bg-muted px-2 py-0.5 rounded hover:bg-destructive hover:text-white transition-colors">
                Ver todo
              </Link>
            </p>
          )}
        </div>
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar productos..." 
            className="pl-9"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {productosFiltrados.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productosFiltrados.map((p: any) => (
            <Link 
              key={p.ProductoID} 
              to="/app/productos/$id" 
              params={{ id: String(p.ProductoID) }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition h-full">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {p.ImagenPath ? (
                    <img src={`${API_URL}${p.ImagenPath}`} alt={p.NombreProducto} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="size-10 opacity-10" />
                  )}
                </div>
                <div className="p-3 text-center">
                  <h3 className="font-medium text-sm line-clamp-1">{p.NombreProducto}</h3>
                  <p className="text-primary font-bold mt-1">₡{Number(p.Precio).toLocaleString()}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-muted-foreground">
          <FilterX className="size-12 mx-auto mb-4 opacity-20" />
          <p>No hay productos que coincidan con tu búsqueda.</p>
        </div>
      )}
    </div>
  );
}