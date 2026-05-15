import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/config";

export const Route = createFileRoute("/app/")({
  component: HomePage,
});

function HomePage() {
  const [categorias, setCategorias] = useState([]);
  const [productosBackend, setProductosBackend] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      const token = localStorage.getItem("techub_token");

      if (!token) {
        toast.error("No tienes sesión iniciada");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        const resCategorias = await fetch(`${API_URL}/usuarios/categorias`, {
          headers,
        });

        if (resCategorias.ok) {
          const dataCat = await resCategorias.json();
          setCategorias(dataCat);
        }

        const resProductos = await fetch(`${API_URL}/usuarios/productos`, {
          headers,
        });

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
  }, []);

  const productosFiltrados = useMemo(
    () =>
      productosBackend.filter((p: any) =>
        p.NombreProducto?.toLowerCase().includes(q.toLowerCase())
      ),
    [productosBackend, q]
  );

  return (
    <main className="space-y-6" aria-labelledby="titulo-principal">
      {/* BANNER */}
      <section
        className="bg-gradient-to-r from-primary to-primary-soft text-primary-foreground rounded-xl p-6 shadow-md"
        aria-labelledby="titulo-principal"
      >
        <h1 id="titulo-principal" className="text-2xl md:text-3xl font-bold mb-1">
          Bienvenido a TecHub
        </h1>

        <p className="opacity-90 text-sm md:text-base">
          Compra y vende materiales académicos dentro de la comunidad TEC.
        </p>

        <div className="relative mt-4 max-w-md">
          <label htmlFor="busqueda-productos" className="sr-only">
            Buscar productos
          </label>

          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            aria-hidden="true"
            focusable="false"
          />

          <Input
            id="busqueda-productos"
            type="search"
            placeholder="Buscar productos..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 bg-background text-foreground focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Buscar productos"
            aria-describedby="descripcion-busqueda"
          />

          <p id="descripcion-busqueda" className="sr-only">
            Escriba el nombre de un producto para filtrar la lista de productos destacados.
          </p>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section aria-labelledby="titulo-categorias">
        <h2 id="titulo-categorias" className="font-semibold text-lg mb-3">
          Categorías
        </h2>

        {categorias.length === 0 ? (
          <p role="status" className="text-sm text-muted-foreground">
            No hay categorías disponibles.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categorias.slice(0, 8).map((c: any) => (
              <Link
                key={c.CategoriaID}
                to="/app/productos"
                search={{ categoriaID: c.CategoriaID }}
                aria-label={`Ver productos de la categoría ${c.NombreCategoria}`}
                className="bg-card border rounded-lg p-4 text-center hover:shadow-md hover:border-primary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="flex justify-center mb-2" aria-hidden="true">
                  {c.ImagenPath ? (
                    <img
                      src={`${API_URL}${c.ImagenPath}`}
                      alt=""
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                      {c.NombreCategoria?.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="text-sm font-medium">{c.NombreCategoria}</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section aria-labelledby="titulo-productos">
        <h2 id="titulo-productos" className="font-semibold text-lg mb-3">
          Productos destacados
        </h2>

        <p role="status" className="sr-only">
          {productosFiltrados.length} productos encontrados.
        </p>

        {productosFiltrados.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No se encontraron productos con esa búsqueda.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productosFiltrados.map((p: any) => (
              <Link
                key={p.ProductoID}
                to="/app/productos/$id"
                params={{ id: String(p.ProductoID) }}
                aria-label={`Ver detalles del producto ${p.NombreProducto}, precio ₡${Number(
                  p.Precio
                ).toLocaleString()}`}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
              >
                <Card className="overflow-hidden hover:shadow-lg transition cursor-pointer h-full">
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    {p.ImagenPath ? (
                      <img
                        src={`${API_URL}${p.ImagenPath}`}
                        alt={`Imagen del producto ${p.NombreProducto}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground">
                        <ShoppingBag
                          className="size-8 opacity-20"
                          aria-hidden="true"
                          focusable="false"
                        />
                        <span className="text-[10px] mt-1">Sin imagen</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-1">
                      {p.NombreProducto}
                    </h3>

                    <p className="text-primary font-bold text-sm mt-1">
                      ₡{Number(p.Precio).toLocaleString()}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}