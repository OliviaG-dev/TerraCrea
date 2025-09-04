module.exports = function (api) {
  api.cache(true);
  const isProduction = api.env("production");

  return {
    presets: [
      [
        "babel-preset-expo",
        {
          jsxRuntime: "automatic",
          jsxImportSource: "react",
        },
      ],
    ],
    plugins: isProduction ? [] : [],
  };
};
