SHELL := /bin/bash
.DEFAULT_GOAL := help

# DB dùng cho integration test (test XOÁ users/grade_books/attendances -> dùng DB riêng!)
TEST_DATABASE_URL ?= postgres://postgres:postgres@localhost:5432/htqllh
export TEST_DATABASE_URL

.PHONY: help install up down logs db-init seed seed-demo dev start \
	lint lint-fix format format-check test test-unit test-integration \
	coverage coverage-unit coverage-html postman postman-run ci clean

help: ## Liệt kê các lệnh
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

install: ## Cài dependencies
	npm install

up: ## Bật Postgres (docker compose)
	docker compose up -d

down: ## Tắt docker compose
	docker compose down

logs: ## Xem log docker compose
	docker compose logs -f

db-init: ## Áp dụng db/schema.sql
	npm run db:init

seed: ## Seed tài khoản ADMIN
	npm run seed:admin

seed-demo: ## Seed ADMIN + dữ liệu demo (GV, HS, PH)
	npm run seed:demo

dev: ## Chạy server (watch)
	npm run dev

start: ## Chạy server production
	npm start

lint: ## ESLint
	npm run lint

lint-fix: ## ESLint --fix
	npm run lint:fix

format: ## Prettier --write
	npm run format

format-check: ## Prettier --check
	npm run format:check

test: ## Toàn bộ test (cần TEST_DATABASE_URL)
	npm test

test-unit: ## Unit test (không cần DB)
	npm run test:unit

test-integration: ## Integration test (cần DB)
	npm run test:integration

coverage: ## Coverage native Node + báo cáo HTML (coverage/index.html)
	npm run test:coverage

coverage-unit: ## Coverage chỉ unit test (không ngưỡng)
	npm run test:coverage:unit

coverage-html: ## Dựng lại HTML từ coverage/lcov.info
	npm run coverage:html

postman: ## Sinh lại Postman collection
	npm run postman:generate

postman-run: ## Chạy Postman collection bằng newman (server phải đang chạy)
	npm run postman:run

ci: lint format-check coverage ## Lint + format + coverage (như CI)

clean: ## Xoá coverage/
	rm -rf coverage
