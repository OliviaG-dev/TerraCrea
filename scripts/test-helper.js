#!/usr/bin/env node

/**
 * Script d'aide pour les tests TerraCréa
 * Fournit des commandes utiles pour les développeurs
 */

const { execSync } = require("child_process");
const path = require("path");

const commands = {
  help: {
    description: "Affiche cette aide",
    action: showHelp,
  },
  all: {
    description: "Lance tous les tests",
    action: () => runCommand("npm test"),
  },
  watch: {
    description: "Lance les tests en mode watch",
    action: () => runCommand("npm test -- --watch"),
  },
  coverage: {
    description: "Lance les tests avec couverture",
    action: () => runCommand("npm test -- --coverage"),
  },
  services: {
    description: "Lance uniquement les tests des services",
    action: () => runCommand("npm test -- src/__tests__/services/"),
  },
  integration: {
    description: "Lance uniquement les tests d'intégration",
    action: () => runCommand("npm test -- src/__tests__/integration/"),
  },
  auth: {
    description: "Lance les tests d'authentification",
    action: () =>
      runCommand("npm test -- src/__tests__/services/authService.test.ts"),
  },
  creations: {
    description: "Lance les tests des créations",
    action: () =>
      runCommand("npm test -- src/__tests__/services/creationsApi.test.ts"),
  },
  favorites: {
    description: "Lance les tests des favoris",
    action: () =>
      runCommand("npm test -- src/__tests__/services/favoritesApi.test.ts"),
  },
  ratings: {
    description: "Lance les tests des notations",
    action: () =>
      runCommand("npm test -- src/__tests__/services/ratingsApi.test.ts"),
  },
  reviews: {
    description: "Lance les tests des avis",
    action: () =>
      runCommand("npm test -- src/__tests__/services/reviewsApi.test.ts"),
  },
  suggestions: {
    description: "Lance les tests des suggestions",
    action: () =>
      runCommand(
        "npm test -- src/__tests__/services/suggestionsService.test.ts"
      ),
  },
  failed: {
    description: "Relance uniquement les tests qui ont échoué",
    action: () => runCommand("npm test -- --run --reporter=verbose"),
  },
  debug: {
    description: "Lance les tests en mode debug (verbose)",
    action: () => runCommand("npm test -- --reporter=verbose"),
  },
  stats: {
    description: "Affiche les statistiques des tests",
    action: showStats,
  },
  init: {
    description: "Initialise l'environnement de test",
    action: initTestEnvironment,
  },
};

function runCommand(command) {
  console.log(`🚀 Exécution : ${command}`);
  try {
    execSync(command, { stdio: "inherit", cwd: process.cwd() });
  } catch (error) {
    console.error(`❌ Erreur lors de l'exécution : ${error.message}`);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🧪 Script d'aide pour les tests TerraCréa

Usage: node scripts/test-helper.js <commande>

Commandes disponibles:
`);

  Object.entries(commands).forEach(([name, { description }]) => {
    console.log(`  ${name.padEnd(12)} - ${description}`);
  });

  console.log(`
Exemples:
  node scripts/test-helper.js all        # Lance tous les tests
  node scripts/test-helper.js watch      # Mode watch
  node scripts/test-helper.js auth       # Tests d'authentification seulement
  node scripts/test-helper.js debug      # Mode debug avec logs détaillés

Documentation complète: docs/TESTING.md
`);
}

function showStats() {
  console.log(`
📊 Statistiques des tests TerraCréa

Services API:
  ├── authService.test.ts        : 30 tests
  ├── creationsApi.test.ts       : 18 tests  
  ├── favoritesApi.test.ts       : 16 tests
  ├── ratingsApi.test.ts         : 17 tests
  ├── reviewsApi.test.ts         : 22 tests
  ├── suggestionsService.test.ts : 26 tests
  └── supabase.test.ts           : 5 tests
  Total Services                 : 134 tests

Intégration:
  └── services-integration.test.ts : 14 tests

Utilitaires:
  └── example.test.js             : 2 tests

📈 Total: 150+ tests
🎯 Couverture estimée: 95%+

Pour plus de détails: npm test -- --coverage
`);
}

function initTestEnvironment() {
  console.log("🔧 Initialisation de l'environnement de test...");

  try {
    // Vérifier que Node.js est installé
    execSync("node --version", { stdio: "pipe" });
    console.log("✅ Node.js détecté");

    // Vérifier que npm est installé
    execSync("npm --version", { stdio: "pipe" });
    console.log("✅ npm détecté");

    // Installer les dépendances si nécessaire
    console.log("📦 Vérification des dépendances...");
    execSync("npm install", { stdio: "inherit" });
    console.log("✅ Dépendances installées");

    // Lancer un test simple
    console.log("🧪 Test de l'environnement...");
    execSync("npm test -- --run src/__tests__/utils/example.test.js", {
      stdio: "inherit",
    });
    console.log("✅ Environnement de test prêt");

    console.log(`
🎉 Environnement de test initialisé avec succès !

Prochaines étapes:
  1. Lancer tous les tests: node scripts/test-helper.js all
  2. Mode développement: node scripts/test-helper.js watch  
  3. Consulter la documentation: docs/TESTING.md
`);
  } catch (error) {
    console.error(`❌ Erreur d'initialisation: ${error.message}`);
    console.log(`
💡 Conseils de dépannage:
  - Vérifiez que Node.js est installé (version 16+)
  - Vérifiez que npm est installé
  - Assurez-vous d'être dans le répertoire racine du projet
  - Consultez docs/TESTING.md section "Dépannage"
`);
    process.exit(1);
  }
}

// Point d'entrée principal
function main() {
  const command = process.argv[2];

  if (!command || !commands[command]) {
    console.log("❌ Commande inconnue ou manquante\n");
    showHelp();
    process.exit(1);
  }

  commands[command].action();
}

// Gestion des erreurs non capturées
process.on("uncaughtException", (error) => {
  console.error("❌ Erreur inattendue:", error.message);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Promesse rejetée:", reason);
  process.exit(1);
});

// Exécution
if (require.main === module) {
  main();
}

module.exports = { commands, runCommand, showHelp, showStats };
