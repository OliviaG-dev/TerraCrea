import { createClient } from "@supabase/supabase-js";

// Configuration Supabase depuis les variables d'environnement
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Vérification des variables d'environnement
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Variables d'environnement Supabase manquantes. Vérifiez votre fichier .env"
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Services d'authentification
export const authService = {
  // Connexion avec email/password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Inscription
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Déconnexion
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Obtenir la session actuelle
  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    return { session, error };
  },

  // Écouter les changements d'authentification
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
