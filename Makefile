API_VERSION := $(shell cat API_VERSION)
# OpenAPI document of the api: the pinned api tag, or a local file
# (OPENAPI_FILE=../api/openapi.json make generate).
OPENAPI_FILE ?= https://raw.githubusercontent.com/Sigeth/opslab-api/$(API_VERSION)/openapi.json

.PHONY: all install dev lint test build generate verify-generated

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

## generate: TypeScript types of the api from its OpenAPI document
generate:
	npx openapi-typescript $(OPENAPI_FILE) -o src/api/schema.d.ts

## verify-generated: fail if the api types are out of date (CI)
verify-generated: generate
	git diff --exit-code -- src/api/schema.d.ts
