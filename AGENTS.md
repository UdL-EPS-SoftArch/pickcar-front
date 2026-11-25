# Agent Guidelines for Next.js Client Template

This repository is a **Next.js (App Router) + Spring Data REST (HAL) + Cucumber/Playwright BDD** frontend template designed for Spec-Driven Development (SDD) with AI agents, acting as the client for the [`spring-template`](https://github.com/UdL-EPS-SoftArch/spring-template) backend.

## Core Architectural Rules
- **HAL Hypermedia Client**: Communicate with the Spring Data REST backend via `src/api/halClient.ts` (`getHal`, `postHal`, `mergeHal`, `mergeHalArray`) using `halfred` (`Accept: application/hal+json`).
- **Typed HAL Entities & Services**: Define domain interfaces in `src/types/<entity>.ts` as `<Entity> = <Entity>Entity & Resource`. Encapsulate backend calls in `src/api/<entity>Api.ts` (`<Entity>Service` injected with `AuthProvider`).
- **Unified Authentication**: Use `serverAuthProvider` in Server Components and `clientAuthProvider()` in Client Components (`"use client"`) to read the `MYAPP_AUTH` Basic Auth cookie; manage client session state with `useAuth()`.
- **App Router & Forms**: Prefer Server Components for read-only pages (resolving Next.js 16 `await props.params`) and Client Components using `react-hook-form` + shadcn/ui (`@/components/ui/*`) for interactive forms and mutations.
- **Playwright + Cucumber E2E**: Drive all UI features from Gherkin specs in `tests/e2e/*.feature` and step definitions in `tests/e2e/steps/*.steps.ts` sharing the Playwright `World` (`tests/e2e/support/playwright_world.ts`).

## SDD Skills Directory
Refer to `skills/` for specific stage playbooks:
- `skills/sdd-feature-designer/SKILL.md`: Draft concise Cucumber E2E `.feature` specs in `tests/e2e/`, keep not too long.
- `skills/sdd-cucumber-steps/SKILL.md`: Implement Cucumber + Playwright step definitions in `tests/e2e/steps/*.steps.ts`.
- `skills/nextjs-hal-api/SKILL.md`: Generate TypeScript HAL entity types (`src/types/`) and Spring Data REST API services (`src/api/`).
- `skills/nextjs-ui-pages/SKILL.md`: Generate Next.js App Router pages and forms (`src/app/`) with `react-hook-form` and shadcn/ui.
- `skills/sdd-bdd-verifier/SKILL.md`: Run `npm run test:e2e:ci` (and `npm run build`) and analyze test failures.

Detailed AI workflows are documented in `AI_DEVELOPMENT_GUIDE.md`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
