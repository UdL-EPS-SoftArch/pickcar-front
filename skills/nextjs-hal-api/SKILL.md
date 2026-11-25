---
name: nextjs-hal-api
description: Create TypeScript HAL entity types (src/types/) and Spring Data REST API service classes (src/api/) using halfred and halClient.
---

# Next.js HAL Types & API Service Skill

Guide AI agents to generate TypeScript entity types (`src/types/<entity>.ts`) and Spring Data REST HAL service classes (`src/api/<entity>Api.ts`) that communicate with [`spring-template`](https://github.com/UdL-EPS-SoftArch/spring-template) via `src/api/halClient.ts` and `halfred`.

## Conventions & Rules

1. **HAL Entity Types (`src/types/<entity>.ts`)**:
   - Define `<Entity>Entity` with `uri: string` (matching backend `UriEntity.getUri()` format `/<entities>/<id>`), domain fields, and optional read-only audit fields (`created?: Date`, `modified?: Date`).
   - For `@ManyToOne` or `@ManyToMany` relationships serialized by Spring Data REST with `@JsonIdentityReference(alwaysAsId = true)`, use URI strings (`string` or `string[]`) when sending payloads, and traverse `_links` for reading related resources.
   - Export `<Entity> = <Entity>Entity & Resource` from `halfred`.

2. **HAL Client (`src/api/halClient.ts`)**:
   - Always use `getHal`, `postHal`, `patchHal`, `putHal`, `deleteHal` or `postMultipart`. Pass extra headers with the last `options` argument (`{ headers: { "X-Current-Password": ... } }`).
   - Errors are thrown as `ApiError` (`status`, `message`, `fieldErrors`, `code`). Never put the request body in error messages or logs.
   - Wrap single resources with `mergeHal<T>(resource)` and `_embedded` arrays with `mergeHalArray<T>(embedded)` so returned objects expose both entity properties and Halfred `Resource` methods (`.link(rel)`, `.embeddedArray(rel)`).

3. **Service Classes (`src/api/<entity>Api.ts`)**:
   - Accept `private authProvider: AuthProvider` in the constructor so the service works in both Server Components (`serverAuthProvider`) and Client Components (`clientAuthProvider()`).

## Entity Type Template (`src/types/<entity>.ts`)

```typescript
import { Resource } from "halfred";

export interface <Entity>Entity {
    uri: string;
    name: string;
    description?: string;
    created?: Date;
    modified?: Date;
}

export type <Entity> = <Entity>Entity & Resource;
```

## API Service Template (`src/api/<entity>Api.ts`)

```typescript
import { getHal, mergeHal, mergeHalArray, postHal } from "./halClient";
import type { AuthProvider } from "@/lib/authProvider";
import { <Entity> } from "@/types/<entity>";
import { User } from "@/types/user";

export class <Entity>Service {
    constructor(private authProvider: AuthProvider) {
    }

    async get<Entities>(): Promise<<Entity>[]> {
        const resource = await getHal('/<entities>', this.authProvider);
        const embedded = resource.embeddedArray('<entities>') || [];
        return mergeHalArray<<Entity>>(embedded);
    }

    async get<Entity>ById(id: string): Promise<<Entity>> {
        const resource = await getHal(`/<entities>/${id}`, this.authProvider);
        return mergeHal<<Entity>>(resource);
    }

    async get<Entities>ByOwnedBy(owner: User): Promise<<Entity>[]> {
        const resource = await getHal(
            `/<entities>/search/findByOwnedBy?user=${owner.uri}`, this.authProvider);
        const embedded = resource.embeddedArray('<entities>') || [];
        return mergeHalArray<<Entity>>(embedded);
    }

    async create<Entity>(entity: <Entity>): Promise<<Entity>> {
        const resource = await postHal('/<entities>', entity, this.authProvider);
        return mergeHal<<Entity>>(resource);
    }

    async get<Entity>Relation<T>(entity: <Entity>, relation: string): Promise<T> {
        const resource = await getHal(entity.link(relation).href, this.authProvider);
        return mergeHal<T>(resource);
    }
}
```
