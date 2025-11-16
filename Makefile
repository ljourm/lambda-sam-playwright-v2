build-ApiHealthcheckFunction:
	pnpm tsx build ./src/functions/api-healthcheck/index.ts ./dist/functions/api-healthcheck/index.mjs
	cp dist/functions/api-healthcheck/* $(ARTIFACTS_DIR)/

build-ApiV1SnapshotFunction:
	pnpm tsx build ./src/functions/api-v1-snapshot/index.ts ./dist/functions/api-v1-snapshot/index.mjs
	cp dist/functions/api-v1-snapshot/* $(ARTIFACTS_DIR)/

build-PlaywrightRunnerFunction:
	pnpm tsx build ./src/functions/playwright-runner/index.ts ./dist/functions/playwright-runner/index.mjs
	cp -r dist/functions/playwright-runner/* $(ARTIFACTS_DIR)/

	npm ci --omit=dev -C src/functions/playwright-runner
	cp -r src/functions/playwright-runner/package.json $(ARTIFACTS_DIR)
	cp -r src/functions/playwright-runner/node_modules $(ARTIFACTS_DIR)/node_modules
