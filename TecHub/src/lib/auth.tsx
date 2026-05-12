import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { loadDB, saveDB, uid, type DB, type User, type Role } from "./store";

interface AuthCtx {
  db: DB;
  user: User | null;
  login: (email: string, password: string) => User | null;
  logout: () => void;
  register: (data: Omit<User, "id">) => User;
  updateUser: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;
  setDB: (updater: (db: DB) => DB) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(() => loadDB());

  useEffect(() => {
    saveDB(db);
  }, [db]);

  const setDB = useCallback((updater: (db: DB) => DB) => {
    setDb((prev) => updater(prev));
  }, []);

  const user = db.users.find((u) => u.id === db.currentUserId) ?? null;

  const login: AuthCtx["login"] = (email, password) => {
    const found = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) return null;
    setDb({ ...db, currentUserId: found.id });
    return found;
  };

  const logout = () => setDb({ ...db, currentUserId: null });

  const register: AuthCtx["register"] = (data) => {
    const newUser: User = { ...data, id: uid("u") };
    setDb({ ...db, users: [...db.users, newUser], currentUserId: newUser.id });
    return newUser;
  };

  const updateUser: AuthCtx["updateUser"] = (id, patch) => {
    setDb((prev) => ({ ...prev, users: prev.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }));
  };

  const deleteUser: AuthCtx["deleteUser"] = (id) => {
    setDb((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== id),
      currentUserId: prev.currentUserId === id ? null : prev.currentUserId,
    }));
  };

  return <Ctx.Provider value={{ db, user, login, logout, register, updateUser, deleteUser, setDB }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export type { Role };
