API_VERSION := $(shell cat API_VERSION)
# Dependency licenses compatible with MIT (D14): the Go list, plus 0BSD (tslib)
# and the Unlicense (isbot, via @tanstack/react-router).
LICENSES_ALLOWED := MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;0BSD;Unlicense
# OpenAPI document of the api: the pinned api tag, or a local file
# (OPENAPI_FILE=../api/openapi.json make generate).
OPENAPI_FILE ?= https://raw.githubusercontent.com/Sigeth/opslab-api/$(API_VERSION)/openapi.json

.PHONY: all install dev lint test build licenses generate verify-generated

all: lint test build

install:
	npm ci

## dev: Vite dev server on :5173, proxying the api on :8080
dev:
	npm run dev

lint:
	npm run lint
	npm run typecheck

test:
	npm test

build:
	npm run build

## licenses: fail if a dependency shipped in the bundle is not under an MIT-compatible license (CI)
licenses:
	npx license-checker-rseidelsohn --production --excludePrivatePackages --summary --onlyAllow '$(LICENSES_ALLOWED)'

## generate: TypeScript types of the api from its OpenAPI document
generate:
	npx openapi-typescript $(OPENAPI_FILE) -o src/api/schema.d.ts

## verify-generated: fail if the api types are out of date (CI)
verify-generated: generate
	git diff --exit-code -- src/api/schema.d.ts
