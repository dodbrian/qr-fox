module.exports = {
  ignoreFiles: [
    "scripts/**",
    "node_modules/**",
    ".*",
    "*.md",
    "__tests__/**",
    "web-ext-artifacts/**",
    "popup/**/*.ts",
    "background/**/*.ts",
  ],
  commands: {
    build: {
      mozilla: {
        pre: ["npm run build"],
      },
    },
    run: {
      mozilla: {
        pre: ["npm run build"],
      },
    },
  },
};
