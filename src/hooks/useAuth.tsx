import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedMockUser = localStorage.getItem("hemera_mock_user");
    if (savedMockUser) {
      try {
        const parsedUser = JSON.parse(savedMockUser);
        setUser(parsedUser);
        setSession({
          user: parsedUser,
          access_token: "mock-token",
          refresh_token: "mock-token",
          expires_in: 3600,
          token_type: "bearer"
        } as unknown as Session);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem("hemera_mock_user");
      }
    }

    // 1. Escuta mudanças de sessão em tempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (_e === 'SIGNED_OUT') {
        localStorage.removeItem("hemera_mock_user");
        setSession(null);
        setUser(null);
        return;
      }
      if (!localStorage.getItem("hemera_mock_user")) {
        setSession(s);
        setUser(s?.user ?? null);
      }
    });

    // 2. Carrega sessão atual (refresh da página)
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!localStorage.getItem("hemera_mock_user")) {
        setSession(s);
        setUser(s?.user ?? null);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    localStorage.removeItem("hemera_mock_user");
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore signOut errors on mock environment
    }
    setUser(null);
    setSession(null);
  };

  return (
    <Ctx.Provider value={{ user, session, loading, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(Ctx);
