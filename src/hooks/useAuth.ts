import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { User, createDefaultUser } from "../types/User";
import { AuthService, SignUpData } from "../services/authService";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer la session actuelle
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Créer un objet utilisateur par défaut si nécessaire
        const userData = createDefaultUser(session.user as Partial<User>);
        setUser(userData);
      }
      setLoading(false);
    };

    getSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userData = createDefaultUser(session.user as Partial<User>);
          setUser(userData);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, additionalData?: Partial<SignUpData>) => {
    setLoading(true);
    setError(null);
    
    try {
      const signUpData: SignUpData = {
        email,
        password,
        ...additionalData
      };
      
      const result = await AuthService.signUpWithEmailConfirmation(signUpData);
      
      if (result.error) {
        setError(result.error.message);
        return { 
          success: false, 
          error: result.error.message,
          needsConfirmation: false 
        };
      }
      
      return { 
        success: true, 
        data: result.data,
        needsConfirmation: result.needsConfirmation 
      };
    } catch (error) {
      const errorMessage = 'Erreur lors de l\'inscription';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage,
        needsConfirmation: false 
      };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await AuthService.signInWithEmailPassword(email, password);
      
      if (result.needsConfirmation) {
        return {
          success: false,
          error: 'Veuillez confirmer votre email avant de vous connecter',
          needsConfirmation: true
        };
      }
      
      if (result.error) {
        setError(result.error.message);
        return { 
          success: false, 
          error: result.error.message,
          needsConfirmation: false 
        };
      }
      
      return { 
        success: true, 
        data: result.data,
        needsConfirmation: false 
      };
    } catch (error) {
      const errorMessage = 'Erreur lors de la connexion';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage,
        needsConfirmation: false 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      setUser(null);
      return { success: true };
    } catch (error) {
      const errorMessage = 'Erreur lors de la déconnexion';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const result = await AuthService.resendConfirmation(email);
      return result;
    } catch (error) {
      return { error: 'Erreur lors du renvoi de l\'email' };
    }
  };

  const checkEmailConfirmed = async () => {
    try {
      return await AuthService.checkEmailConfirmed();
    } catch (error) {
      return false;
    }
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resendConfirmation,
    checkEmailConfirmed,
    isAuthenticated: !!user,
  };
};
