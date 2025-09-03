const fs = require("fs");
const path = require("path");

console.log("🔧 Correction des chemins dans index.html...");

const htmlPath = path.join(__dirname, "..", "web-build", "index.html");

if (!fs.existsSync(htmlPath)) {
  console.log("❌ Fichier index.html non trouvé");
  process.exit(1);
}

// Lire le fichier HTML
let htmlContent = fs.readFileSync(htmlPath, "utf8");

// Compter les backslashes avant correction
const backslashCount =
  htmlContent.split('href="\\').length -
  1 +
  (htmlContent.split('src="\\').length - 1);

if (backslashCount === 0) {
  console.log("✅ Aucun backslash à corriger");
  process.exit(0);
}

console.log(`🔍 ${backslashCount} chemins avec backslashes détectés`);

// Corriger les chemins
htmlContent = htmlContent
  .replace(/href="\\([^"]*)"/g, 'href="/$1"')
  .replace(/src="\\([^"]*)"/g, 'src="/$1"')
  .replace(/url\(\\([^)]*)\)/g, "url(/$1)")
  // Corriger les backslashes dans les chemins déjà corrigés
  .replace(/\/([^"]*?)\\([^"]*)/g, "/$1/$2")
  .replace(/\/([^"]*?)\\([^"]*)/g, "/$1/$2") // Répéter pour les multiples backslashes
  .replace(/\/([^"]*?)\\([^"]*)/g, "/$1/$2"); // Une fois de plus pour être sûr

// Écrire le fichier corrigé
fs.writeFileSync(htmlPath, htmlContent, "utf8");

// Vérifier le résultat
const newBackslashCount =
  htmlContent.split('href="\\').length -
  1 +
  (htmlContent.split('src="\\').length - 1);

console.log(
  `✅ Correction terminée: ${
    backslashCount - newBackslashCount
  } chemins corrigés`
);

if (newBackslashCount > 0) {
  console.log(`⚠️  ${newBackslashCount} backslashes restants`);
} else {
  console.log("🎉 Tous les chemins utilisent maintenant des slashes /");
}
