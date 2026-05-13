import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ShoppingBag } from "lucide-react";
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
      // Ahora usamos NombreProducto
      p.NombreProducto?.toLowerCase().includes(q.toLowerCase())
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
              key={c.CategoriaID} // Usando CategoriaID de tu MySQL
              to="/app/productos"
              search={{categoriaID: c.CategoriaID }} 
              className="bg-card border rounded-lg p-4 text-center hover:shadow-md hover:border-primary transition"
            >
              {/* Aquí mostramos la imagen real o la inicial del nombre */}
              <div className="flex justify-center mb-2">
                {c.ImagenPath ? ( // Usando ImagenPath
                  <img 
                    src={`${API_URL}${c.ImagenPath}`} 
                    alt={c.NombreCategoria} 
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                    {c.NombreCategoria?.charAt(0)}
                  </div> // Placeholder con la inicial de la categoría
                )}
              </div>
              <div className="text-sm font-medium">{c.NombreCategoria}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-lg mb-3">Productos destacados</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productosFiltrados.map((p: any) => (
            <Link 
              key={p.ProductoID} // Usando ProductoID
              to="/app/productos/$id" 
              params={{ id: p.ProductoID }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition cursor-pointer h-full">
                <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                  {p.ImagenPath ? ( // Usando ImagenPath
                    <img 
                      src={`${API_URL}${p.ImagenPath}`} 
                      alt={p.NombreProducto} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <ShoppingBag className="size-8 opacity-20" />
                      <span className="text-[10px] mt-1">Sin imagen</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-medium text-sm line-clamp-1">
                    {p.NombreProducto} {/* Usando NombreProducto */}
                  </div>
                  <div className="text-primary font-bold text-sm mt-1">
                    ₡{Number(p.Precio).toLocaleString()}
                  </div>
                  {/* Aquí podrías mostrar el CondicionID o hacer un JOIN en el backend para mostrar el texto */}
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                    ID Condición: {p.CondicionID}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}