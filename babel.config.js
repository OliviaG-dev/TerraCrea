module.exports = function (api) {
  api.cache(true);

  // Configuration différente selon l'environnement
  const isWeb = api.caller && api.caller.name === "babel-loader";

  const presets = ["babel-preset-expo"];

  // Ajouter les presets React et TypeScript pour le web
  if (isWeb) {
    presets.push("@babel/preset-react", "@babel/preset-typescript");
  }

  return {
    presets: presets,
  };
};
