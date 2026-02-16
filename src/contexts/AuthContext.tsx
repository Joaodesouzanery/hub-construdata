import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// ── Types ──
export interface UserProfile {
  id: string;
  email: string;
  nome: string;
  empresa?: string;
  cargo?: string;
  avatar_url?: string;
  filtros_salvos: SavedFilter[];
  alertas_config: AlertConfig;
  created_at: string;
}

export interface SavedFilter {
  id: string;
  nome: string;
  tipo: "licitacoes" | "noticias" | "alertas";
  filtros: Record<string, unknown>;
  created_at: string;
}

export interface AlertConfig {
  email_ativo: boolean;
  palavras_chave: string[];
  estados: string[];
  categorias: string[];
  valor_minimo: number;
  limiar_sinapi: number;
  frequencia: "tempo_real" | "diario" | "semanal";
}

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, senha: string) => Promise<{ error?: string }>;
  register: (email: string, senha: string, nome: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  saveFilter: (filter: Omit<SavedFilter, "id" | "created_at">) => void;
  removeFilter: (id: string) => void;
  updateAlertConfig: (config: Partial<AlertConfig>) => void;
}

const defaultAlertConfig: AlertConfig = {
  email_ativo: false,
  palavras_chave: ["rompimento", "contaminação", "interdição"],
  estados: [],
  categorias: ["Saneamento", "Infraestrutura"],
  valor_minimo: 10_000_000,
  limiar_sinapi: 5,
  frequencia: "diario",
};

// ── Demo user for offline/no-Supabase mode ──
const STORAGE_KEY = "hub_construdata_user";
const FILTERS_KEY = "hub_construdata_filters";
const ALERTS_KEY = "hub_construdata_alerts";

function loadLocalUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalUser(user: UserProfile | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function loadLocalFilters(): SavedFilter[] {
  try {
    const raw = localStorage.getItem(FILTERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadLocalAlertConfig(): AlertConfig {
  try {
    const raw = localStorage.getItem(ALERTS_KEY);
    return raw ? { ...defaultAlertConfig, ...JSON.parse(raw) } : defaultAlertConfig;
  } catch {
    return defaultAlertConfig;
  }
}

// ── Context ──
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  // Initialize — check for existing session
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email ?? "",
            nome: session.user.user_metadata?.nome ?? session.user.email?.split("@")[0] ?? "",
            empresa: session.user.user_metadata?.empresa,
            cargo: session.user.user_metadata?.cargo,
            filtros_salvos: loadLocalFilters(),
            alertas_config: loadLocalAlertConfig(),
            created_at: session.user.created_at,
          };
          setState({ user: profile, loading: false, isAuthenticated: true });
          saveLocalUser(profile);
        } else {
          setState({ user: null, loading: false, isAuthenticated: false });
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email ?? "",
            nome: session.user.user_metadata?.nome ?? session.user.email?.split("@")[0] ?? "",
            empresa: session.user.user_metadata?.empresa,
            cargo: session.user.user_metadata?.cargo,
            filtros_salvos: loadLocalFilters(),
            alertas_config: loadLocalAlertConfig(),
            created_at: session.user.created_at,
          };
          setState({ user: profile, loading: false, isAuthenticated: true });
          saveLocalUser(profile);
        } else {
          setState({ user: null, loading: false, isAuthenticated: false });
          saveLocalUser(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Offline mode: use localStorage
      const localUser = loadLocalUser();
      setState({
        user: localUser,
        loading: false,
        isAuthenticated: !!localUser,
      });
    }
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) return { error: error.message };
      return {};
    }
    // Offline demo mode
    const user: UserProfile = {
      id: crypto.randomUUID(),
      email,
      nome: email.split("@")[0],
      filtros_salvos: loadLocalFilters(),
      alertas_config: loadLocalAlertConfig(),
      created_at: new Date().toISOString(),
    };
    setState({ user, loading: false, isAuthenticated: true });
    saveLocalUser(user);
    return {};
  }, []);

  const register = useCallback(async (email: string, senha: string, nome: string) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome } },
      });
      if (error) return { error: error.message };
      return {};
    }
    // Offline demo mode
    const user: UserProfile = {
      id: crypto.randomUUID(),
      email,
      nome,
      filtros_salvos: [],
      alertas_config: defaultAlertConfig,
      created_at: new Date().toISOString(),
    };
    setState({ user, loading: false, isAuthenticated: true });
    saveLocalUser(user);
    return {};
  }, []);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setState({ user: null, loading: false, isAuthenticated: false });
    saveLocalUser(null);
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    setState((prev) => {
      if (!prev.user) return prev;
      const updated = { ...prev.user, ...data };
      saveLocalUser(updated);
      return { ...prev, user: updated };
    });
  }, []);

  const saveFilter = useCallback((filter: Omit<SavedFilter, "id" | "created_at">) => {
    const newFilter: SavedFilter = {
      ...filter,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    setState((prev) => {
      if (!prev.user) return prev;
      const filtros = [...prev.user.filtros_salvos, newFilter];
      const updated = { ...prev.user, filtros_salvos: filtros };
      localStorage.setItem(FILTERS_KEY, JSON.stringify(filtros));
      saveLocalUser(updated);
      return { ...prev, user: updated };
    });
  }, []);

  const removeFilter = useCallback((id: string) => {
    setState((prev) => {
      if (!prev.user) return prev;
      const filtros = prev.user.filtros_salvos.filter((f) => f.id !== id);
      const updated = { ...prev.user, filtros_salvos: filtros };
      localStorage.setItem(FILTERS_KEY, JSON.stringify(filtros));
      saveLocalUser(updated);
      return { ...prev, user: updated };
    });
  }, []);

  const updateAlertConfig = useCallback((config: Partial<AlertConfig>) => {
    setState((prev) => {
      if (!prev.user) return prev;
      const alertas_config = { ...prev.user.alertas_config, ...config };
      const updated = { ...prev.user, alertas_config };
      localStorage.setItem(ALERTS_KEY, JSON.stringify(alertas_config));
      saveLocalUser(updated);
      return { ...prev, user: updated };
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
        saveFilter,
        removeFilter,
        updateAlertConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
