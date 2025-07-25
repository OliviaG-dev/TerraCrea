import { useState, useEffect } from "react";
import { authService } from "../services/supabase";
import { User } from "../types/User";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier la session au démarrage
    checkSession();

    // Écouter les changements d'état d'authentification
    const {
      data: { subscription },
    } = authService.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user as User);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const { session } = await authService.getSession();
      if (session?.user) {
        setUser(session.user as User);
      }
    } catch (err) {
      console.error("Erreur lors de la vérification de session:", err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await authService.signIn(email, password);

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user as User);
        return { success: true, user: data.user };
      }
    } catch (err: any) {
      const errorMessage = err.message || "Erreur lors de la connexion";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await authService.signUp(email, password);

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err: any) {
      const errorMessage = err.message || "Erreur lors de l'inscription";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await authService.signOut();

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      setUser(null);
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || "Erreur lors de la déconnexion";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };
};
