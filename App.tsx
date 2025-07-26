import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "./src/context/UserContext";
import RootNavigator from "./src/navigation/RootNavigator";

import { supabase } from "./src/services/supabase";

// Créer une instance de QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function App() {
  // Test de connexion Supabase (temporaire)
  useEffect(() => {
    supabase
      .from("categories")
      .select("count")
      .then(({ data, error }) => {
        console.log(data ? "✅ Supabase connecté!" : "❌ Erreur:", error);
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </UserProvider>
    </QueryClientProvider>
  );
}
