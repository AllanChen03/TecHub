import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import techubHero from "@/assets/techub-hero.png";

// Importamos la URL de tu backend
import { API_URL } from "@/lib/config";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. Petición HTTP a Node.js
      const respuesta = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        // 2. Guardamos el "gafete virtual"
        localStorage.setItem('techub_token', data.token); 
        
        toast.success("¡Inicio de sesión exitoso!");
        
        // 3. USAMOS NAV PARA LA REDIRECCIÓN FLUIDA
        nav({ to: "/app" }); 
        
      } else {
        toast.error(data.error || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error conectando con el servidor:", error);
      toast.error("Error de conexión con el servidor. Verifica que Node.js esté corriendo.");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="flex items-center justify-center p-4 lg:p-8 lg:order-1 order-2">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <img src={techubHero} alt="TecHub" className="lg:hidden w-40 mx-auto mb-4" />
          <div className="flex items-center justify-center gap-2 text-primary font-bold text-2xl mb-6">
            <ShoppingBag className="size-7" />
            <h1>Inicio de sesión</h1>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full">Iniciar sesión</Button>
            <div className="flex justify-between text-sm pt-2">
              <Link to="/forgot" className="text-primary hover:underline">¿Olvidó su contraseña?</Link>
              <Link to="/register" className="text-primary hover:underline">Crear cuenta</Link>
            </div>
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md mt-4">
              <p className="font-semibold mb-1">Cuentas reales requeridas:</p>
              <p>Por favor, utiliza una cuenta que hayas creado en tu base de datos y que ya esté verificada mediante el código de correo.</p>
            </div>
          </form>
        </Card>
      </div>
      <div className="hidden lg:flex bg-background items-center justify-center p-8">
        <div className="text-center max-w-md">
          <img src={techubHero} alt="TecHub - Marketplace estudiantil del TEC" className="w-full h-auto" />
        </div>
      </div>
    </div>
  );
}