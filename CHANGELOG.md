# Changelog

## [1.1.4](https://github.com/dodbrian/qr-fox/compare/v1.1.3...v1.1.4) (2026-02-10)

### Bug Fixes

* **release:** format files after version bump to fix prettier issues ([1c8d857](https://github.com/dodbrian/qr-fox/commit/1c8d857ff3001e67f9047f226e4c78e03d814169))

## [1.1.3](https://github.com/dodbrian/qr-fox/compare/v1.1.2...v1.1.3) (2026-02-10)

## [1.1.2](https://github.com/dodbrian/qr-fox/compare/v1.1.1...v1.1.2) (2026-02-10)

### Bug Fixes

* **release:** use npm script instead of npx, make .env sourcing optional ([92e4897](https://github.com/dodbrian/qr-fox/commit/92e489782d8d32fcc54610b12fdadc0ef1065797))

## [1.1.1](https://github.com/dodbrian/qr-fox/compare/v1.1.0...v1.1.1) (2026-02-10)

## 1.1.0 (2026-02-10)

### Features

* add 48px and 96px sizes to icon generation ([fbe1374](https://github.com/dodbrian/qr-fox/commit/fbe137436dbc94db8f0189ec611dd80cbe9ff19d))
* add license to manifest and configure web-ext signing ([72c9114](https://github.com/dodbrian/qr-fox/commit/72c911484a6d219dad2a477091bd60fcb0d4328a))
* add sharp and ts-node dependencies and ignore assets ([4e3e7e6](https://github.com/dodbrian/qr-fox/commit/4e3e7e6776b38b30699a6f87add6296234b45be1))
* add svg-to-png script for generating light/dark PNGs ([13d09c4](https://github.com/dodbrian/qr-fox/commit/13d09c435d3c4991577286b008c2a89c2c0002ab))
* add theme icons support and rename icon files ([2098f59](https://github.com/dodbrian/qr-fox/commit/2098f59e0496a8ea5a79b9df1a121f45c967be17))
* add TypeScript support and update dev dependencies ([5099d52](https://github.com/dodbrian/qr-fox/commit/5099d52042622e2ab2a973a6490a1c28611e84c9))
* **assets:** add extension icons ([c520738](https://github.com/dodbrian/qr-fox/commit/c520738f88730a63e1b51ebbf35ef872999b6403))
* auto-select URL text when popup opens ([c459607](https://github.com/dodbrian/qr-fox/commit/c4596077ecbcd938392302d26ebd989055a2b99e))
* **ci:** add GitHub Actions workflow with manual packaging ([6a6f8fc](https://github.com/dodbrian/qr-fox/commit/6a6f8fc016f3f6573d3e1deb8d25dd44c19fd262))
* **core:** add Firefox extension manifest and background script ([b37cec9](https://github.com/dodbrian/qr-fox/commit/b37cec9883cd73b0db0bed9da625eaac46e0ab73))
* **core:** convert background script to TypeScript ([8740615](https://github.com/dodbrian/qr-fox/commit/8740615e41d1a485ba8ede4b9ace7215c2e2d744))
* **core:** convert popup UI to TypeScript ([e394d33](https://github.com/dodbrian/qr-fox/commit/e394d335f25d7c06c9bdc7c1a94daab366da4c9a))
* **core:** convert QR generator to TypeScript ([7a2358e](https://github.com/dodbrian/qr-fox/commit/7a2358e96495955839ee885b0788f22e7fa00755))
* enhance popup UI with larger window and improved layout ([5df6ce1](https://github.com/dodbrian/qr-fox/commit/5df6ce178ad24b217b362eb69a4ab26e8c3005b8))
* exclude source maps from production package ([cba6176](https://github.com/dodbrian/qr-fox/commit/cba617660f333502fcdabd13989b8cee3ed06c53))
* **i18n:** add Firefox i18n framework implementation ([6c48008](https://github.com/dodbrian/qr-fox/commit/6c48008949a343566de3d79ef3e6be022a24f038))
* **i18n:** add German locale support and dynamic lang attribute ([7c2a035](https://github.com/dodbrian/qr-fox/commit/7c2a0359e2d8780f0ac4bad3b76f69751206d35c))
* **i18n:** add Spanish, French, Japanese, Russian, Ukrainian locale files (Phase 3) ([e19121e](https://github.com/dodbrian/qr-fox/commit/e19121ec3000037b62d293d393caf7ec64b31932))
* **i18n:** Phase 4 - Build integration & tooling for i18n ([3ac1408](https://github.com/dodbrian/qr-fox/commit/3ac14082136ed6767f175047d59e9426d015ff0c))
* make QR code background transparent ([b53fd18](https://github.com/dodbrian/qr-fox/commit/b53fd18237972bebbc8c0e72e47904fb5556f881))
* **popup:** replace alert with animated checkmark icon for copy/download feedback ([b4f5bbd](https://github.com/dodbrian/qr-fox/commit/b4f5bbd2cf03cb77e8a6cfa1df8c0d3b9bcaf79e))
* **popup:** update UI text and error messages for clarity ([b79b67f](https://github.com/dodbrian/qr-fox/commit/b79b67f6e92b940092bd0921fb235ca90f9bf1b4))
* **qr-generator:** implement Reed-Solomon error correction and alignment patterns ([ae7be3c](https://github.com/dodbrian/qr-fox/commit/ae7be3ccc5f6f4cda1c4729e4b641ff88fcd83de))
* **qr:** add QR code generation module ([404c87d](https://github.com/dodbrian/qr-fox/commit/404c87dc44b92b6d5324a5c5fde2d2104a3ac4a0))
* remove license field and add amoMetadata config ([4417cb3](https://github.com/dodbrian/qr-fox/commit/4417cb3d27237bbe385e60a8f9ba2c552b0b27b7))
* simplify QR popup by using default browser action ([2007f28](https://github.com/dodbrian/qr-fox/commit/2007f287a7ebef326c3afcab45917aa5900ad979))
* simplify SVG rendering by removing createImageBitmap fallback ([a6dc6a3](https://github.com/dodbrian/qr-fox/commit/a6dc6a3605b706e7bedfa820b7bc40cc58bfaeaa))
* treat TypeScript and ESLint warnings as errors ([ad67dbc](https://github.com/dodbrian/qr-fox/commit/ad67dbc76cba631c45ec85309e5a4000c1376ed2))
* **ts-migration:** convert test files to TypeScript (Phase 5) ([6169832](https://github.com/dodbrian/qr-fox/commit/61698321ab228e9f0d390c69fdc003470a9adddd))
* **ts-migration:** convert utilities and Jest config to TypeScript ([4e20753](https://github.com/dodbrian/qr-fox/commit/4e20753d9557d423c323987d271289f8ff9a16f0))
* **ts:** initial TypeScript setup – install deps, tsconfig, ESLint & Jest config, build scripts ([629cfb2](https://github.com/dodbrian/qr-fox/commit/629cfb247a7db9125701b07736f717032c71df24))
* **ui:** add popup interface with QR display and controls ([6490a6f](https://github.com/dodbrian/qr-fox/commit/6490a6f50703ad7eb5c0848582c555b6fc357267))
* upgrade web-ext to v9.2.0 ([08ee7fd](https://github.com/dodbrian/qr-fox/commit/08ee7fded9a4037a4373fa8ec933ed1c3c686023))
* use single universal icon for all themes ([89c1422](https://github.com/dodbrian/qr-fox/commit/89c1422980fbaf52cc35982fcf2006bcab2dcf99))

### Bug Fixes

* **build:** overwrite destination directory during build ([4fc16b3](https://github.com/dodbrian/qr-fox/commit/4fc16b3827a0a07d6a9da785f886fe9712b2f6b3))
* **ci:** configure Jest to use jsdom environment for browser API tests ([a77db22](https://github.com/dodbrian/qr-fox/commit/a77db22647e8dbdd931af5dd4a3d43fd7c11da01))
* **ci:** update Node.js version to 22 for ESM ts-node compatibility ([62db06c](https://github.com/dodbrian/qr-fox/commit/62db06cf452be7c3f83ca9de21fe0037f661813b))
* **ci:** update package-lock.json with jest-environment-jsdom dependency ([c16d733](https://github.com/dodbrian/qr-fox/commit/c16d73343d6f33e92e9e68ce05663a29404a335c))
* **ci:** use npx to run web-ext build in packaging job ([7d48348](https://github.com/dodbrian/qr-fox/commit/7d48348a330e8b2383ec95eb6fe61839ed033782))
* **i18n:** improve linting, manifest i18n detection, and test robustness ([a51f7fd](https://github.com/dodbrian/qr-fox/commit/a51f7fd588eda2b0ba4ec8d4d8673571e66c002a))
* increase QR code module size to match displayed size ([b7f7795](https://github.com/dodbrian/qr-fox/commit/b7f7795ba7a0403598de82675ad2d6895ee512cb))
* **package:** add keywords and remove unused main ([5792848](https://github.com/dodbrian/qr-fox/commit/5792848a047cc1ba84167eaf587d54256007c57f))
* **popup:** make success icon overlay match popup background color ([c081140](https://github.com/dodbrian/qr-fox/commit/c081140d077ed14cb94d591dd7af954ee52028aa))
* **qr-generator:** correct dark color, character count, and EC per block for version 6; add scanner test ([509ef6c](https://github.com/dodbrian/qr-fox/commit/509ef6c237db4639808224a11f56fe357e159fca))
* remove info button and adjust title hyphen ([9b128b4](https://github.com/dodbrian/qr-fox/commit/9b128b4476c519e95c2ceedcec42ec2c6984d4b1))
* remove unused parameters in test mocks ([973621d](https://github.com/dodbrian/qr-fox/commit/973621dde5f9e9b6a6a2f89826a3e23776c4ad66))
* replace non-breaking hyphens with regular hyphens ([17ebae7](https://github.com/dodbrian/qr-fox/commit/17ebae71220ec21a8ad40134d270edf10c9423d8))
* update script paths in popup.html ([d782911](https://github.com/dodbrian/qr-fox/commit/d7829115d827919983a075b345f0635d496606d2))
* update svg-to-png script loader to use --import flag ([581b5ae](https://github.com/dodbrian/qr-fox/commit/581b5ae24e102a55ce6c217a2493fb1c7a31b8ed))
