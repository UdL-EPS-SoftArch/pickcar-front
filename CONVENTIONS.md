# Project Conventions for Aider & AI Coding Assistants

## Technology Stack
- Next.js 16.4.5 (App Router), React 19.3.1, TypeScript 5, Tailwind CSS 4, shadcn/ui, `react-hook-form`.
- Backend Client: `halfred` (HAL+JSON hypermedia client via `src/api/halClient.ts`), `cookies-next` (`MYAPP_AUTH` Basic Auth cookie).
- Testing: Cucumber.js (`@cucumber/cucumber`) + Playwright (`@playwright/test`).

## Architectural Guidelines
1. **HAL Client First**: Do NOT call `fetch` directly in pages or services. Use `getHal`, `postHal`, `patchHal`, `putHal`, `deleteHal`, `postMultipart`, `mergeHal`, and `mergeHalArray` from `src/api/halClient.ts`. Failed calls throw `ApiError` (`status`, `message`, `fieldErrors`); check it with `isApiError()` and show `fieldErrors` next to the form fields.
2. **Entity & Service Pattern**: Define `<Entity> = <Entity>Entity & Resource` in `src/types/<entity>.ts` and `<Entity>Service(authProvider: AuthProvider)` in `src/api/<entity>Api.ts`.
3. **Auth Provider Pattern**: Pass `serverAuthProvider` in Server Components and `clientAuthProvider()` in `"use client"` components (`src/lib/authProvider.ts`). Use `useAuth()` (`src/app/components/authentication.tsx`) for client session state.
4. **App Router & Forms**: Use Server Components for read-only views (awaiting `props.params` in dynamic routes) and `"use client"` components with `useForm` (`react-hook-form`) and `@/components/ui/*` for forms. Always set `<Input id="...">` matching `<Label htmlFor="...">`.
5. **BDD Step Definitions**: Do NOT re-declare Playwright `Before`/`After` browser hooks in step files. Reuse `this.page` from `tests/e2e/support/playwright_world.ts` and existing steps in `tests/e2e/steps/login.steps.ts`.
6. **Directory Structure**: Use `src/types/` for HAL entity types, `src/api/` for HAL services, `src/app/` for App Router pages/components, and `tests/e2e/` for features and step definitions.

## Stage Playbooks (`skills/`)
- `skills/sdd-feature-designer/SKILL.md`
- `skills/sdd-cucumber-steps/SKILL.md`
- `skills/nextjs-hal-api/SKILL.md`
- `skills/nextjs-ui-pages/SKILL.md`
- `skills/sdd-bdd-verifier/SKILL.md`
