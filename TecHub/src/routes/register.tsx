import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GraduationCap, ShieldCheck, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/lib/config";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const nav = useNavigate();
  const [step, setStep] = useState(1); // 1: Datos iniciales, 2: Código de verificación
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "", // 👇 Agregamos el teléfono al estado inicial
    password: "",
    confirmPassword: "",
    rolID: 2 // Estudiante por defecto
  });

  const [codigo, setCodigo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Estado para el temporizador de reenvío
  const [timer, setTimer] = useState(0);

  // Lógica del temporizador (cuenta regresiva)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // PASO 1: Enviar datos de registro
  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // 👇 Validar que el teléfono tenga exactamente 8 dígitos
    if (formData.telefono.length !== 8) {
      return toast.error("El número de teléfono debe tener exactamente 8 dígitos.");
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Las contraseñas no coinciden. Por favor verifica.");
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          email: formData.email,
          // 👇 Adjuntamos el prefijo al enviar los datos al backend
          telefono: `+506${formData.telefono}`, 
          password: formData.password,
          rolID: formData.rolID
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.mensaje || "Código de verificación enviado a tu correo");
        setStep(2);
        setTimer(60); // Inicia el temporizador de 60 seg al pasar al paso 2
      } else {
        toast.error(data.error || "Hubo un error en el registro");
      }
    } catch (error) {
      toast.error("No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  // PASO 2: Verificar el código
  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/verificar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, codigo })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.mensaje);
        nav({ to: "/login" }); // Éxito -> Al login
      } else {
        toast.error(data.error || "Código incorrecto o expirado");
      }
    } catch (error) {
      toast.error("Error al procesar la verificación");
    } finally {
      setIsLoading(false);
    }
  };

  // FUNCIÓN EXTRA: Reenviar código
  const onResend = async () => {
    if (timer > 0) return; // Por si acaso alguien burla el botón deshabilitado

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/reenviar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.mensaje || "Se ha enviado un nuevo código");
        setTimer(60); // Reinicia el contador a 60 segundos
      } else {
        toast.error(data.error || "Error al reenviar el código");
      }
    } catch (error) {
      toast.error("Error al conectar con el servidor para reenviar");
    } finally {
      setIsLoading(false);
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
          /* FORMULARIO DE REGISTRO */
          <form onSubmit={onRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input id="apellidos" required value={formData.apellidos} onChange={e => setFormData({...formData, apellidos: e.target.value})} disabled={isLoading} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Institucional</Label>
              <Input id="email" type="email" placeholder="ejemplo@estudiantec.cr" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={isLoading} />
            </div>

            {/* 👇 NUEVO CAMPO DE TELÉFONO 👇 */}
            <div className="space-y-2">
              <Label htmlFor="telefono">Número de Teléfono (WhatsApp)</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                  +506
                </span>
                <Input
                  id="telefono"
                  type="text" // Usamos text pero controlamos que solo entren números
                  placeholder="00000000"
                  className="rounded-l-none"
                  maxLength={8}
                  value={formData.telefono}
                  disabled={isLoading}
                  required
                  onChange={(e) => {
                    const val = e.target.value;
                    // Regex: Solo permite números enteros sin espacios ni letras
                    if (/^\d*$/.test(val) && val.length <= 8) {
                      setFormData({ ...formData, telefono: val });
                    }
                  }}
                />
              </div>
              <p className="text-[0.75rem] text-muted-foreground leading-tight">
                Se compartirá con el comprador únicamente para coordinar la entrega si vendes un producto.
              </p>
            </div>
            {/* 👆 FIN DEL CAMPO DE TELÉFONO 👆 */}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} disabled={isLoading} className="pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700">
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmar</Label>
                <div className="relative">
                  <Input id="confirm" type={showConfirm ? "text" : "password"} required value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} disabled={isLoading} className="pr-10" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700">
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? "Enviando datos..." : "Registrarse"}
            </Button>
          </form>
        ) : (
          /* FORMULARIO DE VERIFICACIÓN */
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
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-3">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verificando..." : "Validar y Activar Cuenta"}
              </Button>
              
              {/* BOTÓN DE REENVIAR CON CONTADOR */}
              <Button 
                type="button" 
                variant="outline" 
                className="w-full text-xs" 
                onClick={onResend}
                disabled={timer > 0 || isLoading}
              >
                {timer > 0 ? `Reenviar código en ${timer}s` : "¿No recibiste el correo? Reenviar"}
              </Button>

              <Button 
                type="button" 
                variant="ghost" 
                className="w-full text-xs flex items-center justify-center gap-2" 
                onClick={() => setStep(1)}
                disabled={isLoading}
              >
                <ArrowLeft className="size-3" /> Cambiar correo electrónico
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