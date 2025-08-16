// Mock des variables d'environnement avant l'import
process.env.EXPO_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

import { supabase } from "../../services/supabase";

describe("Supabase Client", () => {
  it("should create supabase client with correct configuration", () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(supabase.from).toBeDefined();
    expect(supabase.storage).toBeDefined();
    expect(supabase.rpc).toBeDefined();
  });

  it("should have auth methods", () => {
    expect(typeof supabase.auth.signUp).toBe("function");
    expect(typeof supabase.auth.signInWithPassword).toBe("function");
    expect(typeof supabase.auth.signOut).toBe("function");
    expect(typeof supabase.auth.getUser).toBe("function");
    expect(typeof supabase.auth.onAuthStateChange).toBe("function");
  });

  it("should have database methods", () => {
    expect(typeof supabase.from).toBe("function");
  });

  it("should have storage methods", () => {
    expect(typeof supabase.storage.from).toBe("function");
  });

  it("should have RPC methods", () => {
    expect(typeof supabase.rpc).toBe("function");
  });
});
