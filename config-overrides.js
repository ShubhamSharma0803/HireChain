module.exports = function override(config) {
  // Find the postcss-loader in the webpack config and replace its plugins
  // with @tailwindcss/postcss + autoprefixer to support Tailwind CSS v4.
  const oneOfRules = config.module.rules.find((r) => r.oneOf)?.oneOf || [];

  for (const rule of oneOfRules) {
    if (!rule.use) continue;
    for (const loader of rule.use) {
      if (
        typeof loader === 'object' &&
        loader.loader &&
        loader.loader.includes('postcss-loader')
      ) {
        loader.options = {
          ...loader.options,
          postcssOptions: {
            plugins: [
              ['@tailwindcss/postcss', {}],
              ['autoprefixer', {}],
            ],
          },
        };
      }
    }
  }

  return config;
};
