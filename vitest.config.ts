import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-utils/setup.ts"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test-utils/",
        "src/**/*.d.ts",
        "src/**/*.stories.{ts,tsx}",
        "src/**/__tests__/**",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "react-native": resolve(
        __dirname,
        "./src/test-utils/mocks/reactNativeMock.ts"
      ),
    },
  },
  define: {
    "process.env.NODE_ENV": '"test"',
    "process.env.EXPO_PUBLIC_SUPABASE_URL": '"https://test.supabase.co"',
    "process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY": '"test-anon-key"',
    "process.env.EXPO_PUBLIC_APP_URL": '"http://localhost:8081"',
  },
});
