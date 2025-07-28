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
