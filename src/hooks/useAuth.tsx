import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const LOGIN_TIME_KEY = "cortesflix_login_time";
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000; // 24h

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkSessionExpiry = async () => {
    const loginTime = localStorage.getItem(LOGIN_TIME_KEY);
    if (loginTime && Date.now() - parseInt(loginTime) > SESSION_MAX_AGE) {
      await supabase.auth.signOut();
      localStorage.removeItem(LOGIN_TIME_KEY);
      return true;
    }
    return false;
  };

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
  };

  useEffect(() => {
    let mounted = true;

    const handleSession = async (session: any) => {
      if (!mounted) return;
      
      if (session?.user) {
        const loginTime = localStorage.getItem(LOGIN_TIME_KEY);
        if (loginTime && Date.now() - parseInt(loginTime) > SESSION_MAX_AGE) {
          localStorage.removeItem(LOGIN_TIME_KEY);
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          // Sign out without awaiting to avoid re-triggering
          supabase.auth.signOut();
          return;
        }
        setUser(session.user);
        try {
          const { data } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .eq("role", "admin")
            .maybeSingle();
          if (mounted) setIsAdmin(!!data);
        } catch {
          if (mounted) setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      if (mounted) setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleSession(session);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (username: string, password: string) => {
    const email = `${username}@cortesflix.com`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: "Usuário ou senha incorretos" };
    localStorage.setItem(LOGIN_TIME_KEY, Date.now().toString());
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(LOGIN_TIME_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
