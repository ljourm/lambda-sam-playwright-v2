build-ApiHealthcheckFunction:
	cp dist/functions/api-healthcheck/* $(ARTIFACTS_DIR)/

build-ApiV1SnapshotFunction:
	cp dist/functions/api-v1-snapshot/* $(ARTIFACTS_DIR)/

build-PlaywrightRunnerFunction:
	npm ci --omit=dev -C src/functions/playwright-runner
	cp -r src/functions/playwright-runner/package.json $(ARTIFACTS_DIR)
	cp -r src/functions/playwright-runner/node_modules $(ARTIFACTS_DIR)/node_modules
	cp -r dist/functions/playwright-runner/* $(ARTIFACTS_DIR)/
