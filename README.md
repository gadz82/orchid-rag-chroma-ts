# @orchid-ai/orchid-rag-chroma

ChromaDB vector backend plugin for the [Orchid AI](https://github.com/gadz82/orchid) framework — TypeScript port of `orchid-rag-chroma`.

## What it provides

- `ChromaRepository` — implements `OrchidVectorStoreRepository` backed by ChromaDB

## Installation

```bash
npm install @orchid-ai/orchid-rag-chroma
```

## Usage

Reference `vector_backend: chroma` in your `agents.yaml`:

```yaml
rag:
  vector_backend: chroma
  chroma_client_type: http
  chroma_host: localhost
  chroma_port: 8000
```

Or build it programmatically:

```ts
import { ChromaRepository } from "@orchid-ai/orchid-rag-chroma";

const repo = new ChromaRepository({
  clientType: "http",
  host: "localhost",
  port: 8000,
});
```

## Auto-registration

The package registers itself via the `orchid` key in `package.json`:

```json
{
  "orchid": {
    "vectorBackends": "./dist/index.js"
  }
}
```

No manual `registerVectorBackend()` calls are needed by integrators.

## Development

```bash
cd orchid-rag-chroma-ts
npm install
npm test
npm run lint
npm run typecheck
```

Tests use in-memory ChromaDB (`EphemeralClient`) — no service container needed.

## License

MIT
