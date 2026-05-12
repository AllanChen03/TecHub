import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GraduationCap, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/config";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const nav = useNavigate();
  // Manejamos dos pasos: 1 para datos iniciales, 2 para código de correo
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    confirmPassword: "",
    rolID: 2 // Estudiante por defecto
  });

  const [codigo, setCodigo] = useState("");

  // FUNCIÓN 1: Registro Inicial
  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de contraseñas iguales
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Las contraseñas no coinciden. Por favor verifica.");
    }

    try {
      const res = await fetch(`${API_URL}/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          email: formData.email,
          password: formData.password,
          rolID: formData.rolID
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.mensaje || "Código de verificación enviado a tu correo");
        setStep(2); // Pasamos al campo del código
      } else {
        // Aquí capturamos el error de "correo ya registrado" que configuramos en el backend
        toast.error(data.error || "Hubo un error en el registro");
      }
    } catch (error) {
      toast.error("No se pudo conectar con el servidor. Verifica que Node.js esté activo.");
    }
  };

  // FUNCIÓN 2: Verificación del Código
  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/verificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          codigo: codigo 
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.mensaje);
        nav({ to: "/login" }); // Enviamos al login tras verificar con éxito
      } else {
        toast.error(data.error || "Código incorrecto o expirado");
      }
    } catch (error) {
      toast.error("Error al procesar la verificación");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 shadow-lg border-t-4 border-t-primary">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-3 rounded-full mb-3">
            {step === 1 ? (
              <GraduationCap className="size-8 text-primary" />
            ) : (
              <ShieldCheck className="size-8 text-primary" />
            )}
          </div>
          <h1 className="text-2xl font-bold">
            {step === 1 ? "Crear Cuenta" : "Verificar Identidad"}
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-1">
            {step === 1 
              ? "Únete a TecHub con tu correo institucional" 
              : `Ingresa el código enviado a: ${formData.email}`}
          </p>
        </div>

        {step === 1 ? (
          // FORMULARIO DE DATOS
          <form onSubmit={onRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input 
                  id="nombre" 
                  required 
                  value={formData.nombre} 
                  onChange={e => setFormData({...formData, nombre: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input 
                  id="apellidos" 
                  required 
                  value={formData.apellidos} 
                  onChange={e => setFormData({...formData, apellidos: e.target.value})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Institucional (@estudiantec.cr)</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="ejemplo@estudiantec.cr" 
                required 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmar</Label>
                <Input 
                  id="confirm" 
                  type="password" 
                  required 
                  value={formData.confirmPassword} 
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-2">
              Registrarse
            </Button>
          </form>
        ) : (
          // FORMULARIO DE CÓDIGO
          <form onSubmit={onVerify} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-center block">Código de 6 dígitos</Label>
              <Input 
                placeholder="000000" 
                className="text-center text-3xl font-bold tracking-[0.5em] h-14" 
                maxLength={6} 
                required 
                value={codigo} 
                onChange={e => setCodigo(e.target.value)} 
              />
            </div>
            <div className="space-y-3">
              <Button type="submit" className="w-full">
                Validar y Activar Cuenta
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full text-xs flex items-center justify-center gap-2" 
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="size-3" /> Volver al registro
              </Button>
            </div>
          </form>
        )}
        
        <div className="mt-8 text-center text-sm border-t pt-4">
          <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">
            ¿Ya tienes una cuenta? <span className="font-bold text-primary">Inicia sesión</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}