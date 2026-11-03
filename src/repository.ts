// ChromaDB repository
import { ChromaClient } from 'chromadb';
import type { Collection } from 'chromadb';
import type { OrchidDocument, OrchidSearchResult, OrchidMetadataFilters, OrchidRAGScope } from '@orchid-ai/orchid/core';

// ORCHID-MEM: 01a1a0c1-de19-7245-a818-d385e8c0a1a5 — TypeScript ChromaDB adapter
export class ChromaRepository {
  private client: ChromaClient;
  private collections = new Map<string, Collection>();

  constructor(pathOrUrl?: string) {
    this.client = new ChromaClient({ path: pathOrUrl || '~/.orchid/chroma' });
  }

  async ensureCollections(namespaces: string[]): Promise<void> {
    for (const ns of namespaces) {
      await this.getCollection(ns);
    }
  }

  async index(documents: OrchidDocument[], namespace: string): Promise<void> {
    if (documents.length === 0) return;
    const col = await this.getCollection(namespace);
    const ids = documents.map((d) => d.id || `doc_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    const contents = documents.map((d) => d.pageContent);
    const metadatas = documents.map((d) => d.metadata || {});
    const embeddings = documents.map((d) => (d.metadata['_embedding'] as number[]) || []);

    await col.add({
      ids,
      documents: contents,
      metadatas: metadatas as Array<Record<string, string | number | boolean>>,
      embeddings: embeddings.length > 0 && embeddings[0]?.length ? embeddings : undefined,
    });
  }

  async upsert(documents: OrchidDocument[], namespace: string): Promise<void> {
    await this.index(documents, namespace);
  }

  async delete(documentIds: string[], namespace: string): Promise<void> {
    const col = await this.getCollection(namespace);
    await col.delete({ ids: documentIds });
  }

  async retrieve(
    query: string,
    namespace: string,
    k = 4,
    scope?: OrchidRAGScope,
    metadataFilters?: OrchidMetadataFilters,
  ): Promise<OrchidSearchResult[]> {
    const col = await this.getCollection(namespace);
    const where = buildChromaFilter(scope, metadataFilters);

    const results = await col.query({
      queryTexts: [query],
      nResults: k,
      ...(Object.keys(where).length > 0 ? { where } : {}),
    });

    const docs: OrchidSearchResult[] = [];
    if (results.ids[0]) {
      for (let i = 0; i < results.ids[0].length; i++) {
        const meta = (results.metadatas[0]?.[i] as Record<string, unknown>) || {};
        const doc: OrchidDocument = {
          id: results.ids[0][i]!,
          pageContent: results.documents[0]?.[i] || '',
          metadata: meta,
        };
        docs.push({ document: doc, score: results.distances?.[0]?.[i] ? 1 - (results.distances[0][i] ?? 0) : 0 });
      }
    }
    return docs;
  }

  async promoteScope(_opts: {
    namespace: string;
    sourceFilter: Record<string, unknown>;
    newScopeFields: Record<string, string>;
  }): Promise<number> {
    return 0;
  }

  private async getCollection(namespace: string): Promise<Collection> {
    let col = this.collections.get(namespace);
    if (!col) {
      try {
        col = await this.client.getCollection({
          name: namespace,
          embeddingFunction: undefined as unknown as never,
        } as Parameters<typeof this.client.getCollection>[0]);
      } catch {
        col = await this.client.createCollection({ name: namespace });
      }
      this.collections.set(namespace, col);
    }
    return col;
  }
}

function buildChromaFilter(
  scope?: OrchidRAGScope,
  _metadataFilters?: OrchidMetadataFilters,
): Record<string, string | number | boolean> {
  const filter: Record<string, string | number | boolean> = {};
  if (scope?.tenantId) filter['tenant_id'] = scope.tenantId;
  if (scope?.userId) filter['user_id'] = scope.userId;
  if (scope?.chatId) filter['chat_id'] = scope.chatId;
  if (scope?.agentId) filter['agent_id'] = scope.agentId;
  return filter;
}
