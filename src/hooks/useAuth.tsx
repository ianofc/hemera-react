import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInMock: () => void;
}

const Ctx = createContext<AuthCtx>({ 
  user: null, 
  session: null, 
  loading: true, 
  signOut: async () => {},
  signInMock: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    
    // Tenta carregar sessão real do Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => { 
    await supabase.auth.signOut(); 
    setUser(null);
    setSession(null);
  };

  const signInMock = () => {
    const mockUser: User = {
      id: "a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5",
      email: "ianworktech@gmail.com",
      aud: "authenticated",
      role: "authenticated",
      user_metadata: {
        first_name: "Ian",
        last_name: "Santos",
        role: "professor"
      },
      app_metadata: {},
      created_at: new Date().toISOString()
    };
    setUser(mockUser);
    setSession({
      access_token: "mock-token",
      token_type: "bearer",
      expires_in: 3600,
      refresh_token: "mock-refresh",
      user: mockUser
    });
  };

  return <Ctx.Provider value={{ user, session, loading, signOut, signInMock }}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(Ctx);
