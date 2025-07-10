import React from "react";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "./src/context/UserContext";
import RootNavigator from "./src/navigation/RootNavigator";

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
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </UserProvider>
    </QueryClientProvider>
  );
}
