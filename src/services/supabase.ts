import { createClient } from "@supabase/supabase-js";

// Configuration Supabase
// Remplacez ces valeurs par vos vraies clés Supabase
const supabaseUrl = "https://tdijehdgocbzrmbgbikl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaWplaGRnb2NienJtYmdiaWtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NTk4NDYsImV4cCI6MjA2OTAzNTg0Nn0.NdMnVRafNGfD9z1liixKXrpN7m5V5nvhlnwqtNZnWGs";

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
