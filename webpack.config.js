const createExpoWebpackConfigAsync = require("@expo/webpack-config");
const webpack = require("webpack");
require("dotenv").config();

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ["@expo/vector-icons"],
      },
    },
    argv
  );

  // Fix pour les chemins sur serveurs Linux - forcer les slashes avant
  if (config.output) {
    config.output.publicPath = "/";
  }

  // Configuration des polyfills pour résoudre les erreurs crypto
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: false,
    stream: false,
    buffer: false,
    util: false,
    assert: false,
    url: false,
    fs: false,
    path: false,
  };

  // Forcer le mode production si non défini
  if (!config.mode) {
    config.mode =
      process.env.NODE_ENV === "development" ? "development" : "production";
  }

  // Optimisations pour la production
  if (config.mode === "production") {
    config.optimization = {
      ...config.optimization,
      minimize: true,
    };
  }

  // Ajout de plugins pour ignorer les modules Node.js sur le web
  config.plugins = config.plugins || [];

  // Injection des variables d'environnement avec debug
  const supabaseUrl =
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    "https://tdijehdgocbzrmbgbikl.supabase.co";
  const supabaseKey =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaWplaGRnb2NienJtYmdiaWtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NTk4NDYsImV4cCI6MjA2OTAzNTg0Nn0.NdMnVRafNGfD9z1liixKXrpN7m5V5nvhlnwqtNZnWGs";

  console.log("Variables d'environnement détectées:");
  console.log("SUPABASE_URL:", supabaseUrl ? "✓ Définie" : "✗ Manquante");
  console.log("SUPABASE_ANON_KEY:", supabaseKey ? "✓ Définie" : "✗ Manquante");

  config.plugins.push(
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "production"
      ),
      "process.env.EXPO_PUBLIC_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY": JSON.stringify(supabaseKey),
    })
  );

  return config;
};
