# orchid-rag-chroma-ts — AI Context

## What This Package Is

**`@orchid-ai/orchid-rag-chroma`** is the ChromaDB vector backend plugin for the Orchid multi-agent AI framework — the
TypeScript port of the Python `orchid-rag-chroma` package. It provides `ChromaRepository` implementing
`OrchidVectorStoreRepository` — on-disk, zero-infrastructure RAG. It imports `@orchid-ai/orchid` as a workspace
dependency.

## Package Structure

```
orchid-rag-chroma-ts/
  src/
    index.ts
    repository.ts
  tests/
  package.json
```

## Architecture Rules

1. **This is a plugin package.** It implements ABCs defined in `@orchid-ai/orchid/core`.
2. **Auto-registration via package.json `orchid` key.**
3. **Dependencies:** Only `@orchid-ai/orchid` (workspace) and `chromadb`.
4. **Tests use in-memory ChromaDB** (`EphemeralClient`) — no service container needed.
5. **No vendor-specific code in comments.**

## Python Reference

This is a 1:1 port of `orchid-rag-chroma/`. The authoritative reference is:

- `orchid-workspace/orchid-rag-chroma/` — read source files there

## Key Patterns

### Registration

```ts
// src/index.ts
import { registerVectorBackend } from '@orchid-ai/orchid/rag';
import { ChromaRepository } from './repository.js';

export { ChromaRepository };

export function register() {
  registerVectorBackend('chroma', (settings) => new ChromaRepository(settings));
}
```

```json
// package.json
{
  "orchid": {
    "vectorBackends": "./dist/index.js"
  }
}
```

## ChromaDB-Specific Details

- ChromaDB's JS client uses `AsyncHttpClient` for remote and `PersistentClient`/`EphemeralClient` for local.
- Filter translation mirrors Python's `_sanitize_metadata()` (flatten nested dicts to `key.subkey`).
- The CLI uses this as its default vector backend (no Docker, no infrastructure).

## Testing

```bash
cd orchid-rag-chroma-ts
npm install
npm test
npm run lint
npm run typecheck
```
