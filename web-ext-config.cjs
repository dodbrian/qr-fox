module.exports = {
  sourceDir: "./dist",
  artifactsDir: "./web-ext-artifacts",
  ignoreFiles: ["**/*.map"],
  build: {
    overwriteDest: true,
    filename: "qr-fox-{version}.xpi",
  },
  sign: {
    apiKey: process.env.AMO_JWT_ISSUER || "",
    apiSecret: process.env.AMO_JWT_SECRET || "",
    channel: "listed",
    amoMetadata: "./amo-metadata.json",
  },
};
