import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  rol: string;
}

interface AuthCtx {
  user: User | null;
  logout: () => void;
  token: string | null;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 1. Cargamos el token real de MySQL al iniciar la app
    const savedToken = localStorage.getItem('techub_token');
    if (savedToken) {
      setToken(savedToken);
      // Creamos un usuario temporal para que los menús no exploten
      // (Luego puedes pedir los datos reales al backend con un fetch)
      setUser({ id: "1", email: "usuario@estudiantec.cr", rol: "user" });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('techub_token');
    setToken(null);
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, logout, token }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(Ctx);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};