import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot")({
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Enlace de recuperación enviado a ${email}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-primary text-center mb-6">¿Olvidó su contraseña?</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Correo electrónico</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" asChild>
              <Link to="/login">Volver</Link>
            </Button>
            <Button type="submit" className="flex-1">Enviar correo</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
