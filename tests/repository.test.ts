import { describe, it, expect } from 'vitest';
import { ChromaRepository } from '../src/repository.js';

describe('ChromaRepository', () => {
  it('can be constructed', () => {
    const repo = new ChromaRepository(':memory:');
    expect(repo).toBeDefined();
  });

  it('can be constructed with path', () => {
    const repo = new ChromaRepository('/tmp/test-chroma');
    expect(repo).toBeDefined();
  });

  it('exports the class', () => {
    expect(ChromaRepository).toBeDefined();
  });
});
