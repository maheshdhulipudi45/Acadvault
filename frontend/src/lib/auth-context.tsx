import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../integrations/supabase/client";

export type User = {
  id: string;
  email: string;
  full_name: string;
  college_name: string;
  branch?: string;
  bio?: string;
  profile_image?: string;
  role: "student" | "admin";
};

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (token: string, user: User) => void;
};

const Ctx = createContext<AuthCtx>({ user: null, loading: true, signOut: async () => {}, signIn: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async (token: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem("acadvault_token");
        setUser(null);
      }
    } catch (err) {
      console.error("Auth fetch failed:", err);
      localStorage.removeItem("acadvault_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("acadvault_token");
    if (token) {
      fetchMe(token);
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = (token: string, userData: User) => {
    localStorage.setItem("acadvault_token", token);
    setUser(userData);
  };

  const signOut = async () => {
    localStorage.removeItem("acadvault_token");
    setUser(null);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase Auth logout bypass:", e);
    }
  };

  return (
    <Ctx.Provider value={{
      user,
      loading,
      signOut,
      signIn,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
