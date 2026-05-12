import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";

// Importamos la URL de tu backend
import { API_URL } from "@/lib/config"; 

export const Route = createFileRoute("/app/")({
  component: HomePage,
});

function HomePage() {
  // 1. Creamos "cajas vacías" (estados) para guardar los datos reales de tu base de datos
  const [categorias, setCategorias] = useState([]);
  const [productosBackend, setProductosBackend] = useState([]);
  const [q, setQ] = useState("");

  // 2. Usamos useEffect para ir a buscar los datos a Node.js apenas se abre la pantalla
  useEffect(() => {
    const cargarDatos = async () => {
      // Sacamos tu "gafete virtual" de la memoria
      const token = localStorage.getItem('techub_token');
      
      if (!token) {
        toast.error("No tienes sesión iniciada");
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      try {
        // A. Traer las Categorías
        // Nota: Asegúrate de tener esta ruta GET /categorias en routes/usuario.js
        const resCategorias = await fetch(`${API_URL}/categorias`, { headers });
        if (resCategorias.ok) {
          const dataCat = await resCategorias.json();
          setCategorias(dataCat);
        }

        // B. Traer los Productos
        // Nota: Asegúrate de tener esta ruta GET /productos en routes/usuario.js
        const resProductos = await fetch(`${API_URL}/productos`, { headers });
        if (resProductos.ok) {
          const dataProd = await resProductos.json();
          setProductosBackend(dataProd);
        }
      } catch (error) {
        console.error("Error al conectar con el servidor", error);
        toast.error("Error cargando el catálogo");
      }
    };

    cargarDatos();
  }, []); // Los corchetes vacíos significan: "ejecuta esto solo una vez al abrir la página"

  // 3. El buscador ahora filtra los productos que llegaron de tu backend
  const productosFiltrados = useMemo(
    () => productosBackend.filter((p: any) => 
      // Ajusta 'p.Nombre' si tu columna en MySQL se llama diferente (ej. p.nombreProducto)
      p.Nombre?.toLowerCase().includes(q.toLowerCase())
    ),
    [productosBackend, q]
  );

  return (
    <div className="space-y-6">
      {/* ... BANNER SUPERIOR INTACTO ... */}
      <div className="bg-gradient-to-r from-primary to-primary-soft text-primary-foreground rounded-xl p-6 shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Bienvenido a TecHub</h1>
        <p className="opacity-90 text-sm md:text-base">Compra y vende materiales académicos dentro de la comunidad TEC.</p>
        <div className="relative mt-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 bg-background text-foreground"
          />
        </div>
      </div>

      <section>
        <h2 className="font-semibold text-lg mb-3">Categorías</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categorias.slice(0, 8).map((c: any) => (
            <Link
              key={c.CategoriaID} // Ajusta si tu ID se llama diferente
              to="/app/productos"
              search={{ cat: c.Nombre }} // Ajusta 'c.Nombre' según tu BD
              className="bg-card border rounded-lg p-4 text-center hover:shadow-md hover:border-primary transition"
            >
              {/* Aquí mostramos la imagen real que subiste con multer */}
              <div className="flex justify-center mb-2">
                {c.Imagen ? (
                  <img 
                    src={`${API_URL}${c.Imagen}`} 
                    alt={c.Nombre} 
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 bg-muted rounded-full" /> // Placeholder si no hay imagen
                )}
              </div>
              <div className="text-sm font-medium">{c.Nombre}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-lg mb-3">Productos destacados</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productosFiltrados.map((p: any) => (
            <Link key={p.ProductoID} to="/app/productos/$id" params={{ id: p.ProductoID }}>
              <Card className="overflow-hidden hover:shadow-lg transition cursor-pointer h-full">
                <div className="aspect-square bg-muted flex items-center justify-center text-6xl overflow-hidden">
                  {p.Imagen ? (
                    <img src={`${API_URL}${p.Imagen}`} alt={p.Nombre} className="w-full h-full object-cover" />
                  ) : (
                     <span className="text-sm text-gray-400">Sin imagen</span>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-medium text-sm line-clamp-1">{p.Nombre}</div>
                  <div className="text-primary font-bold text-sm mt-1">₡{p.Precio?.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{p.Condicion}</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}