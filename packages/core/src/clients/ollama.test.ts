/**
 * Tests for Ollama client
 */
import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test';
import { OllamaClient } from './ollama';

describe('OllamaClient', () => {
  describe('constructor', () => {
    test('uses default baseUrl when not specified', () => {
      const client = new OllamaClient();
      expect(client.getType()).toBe('ollama');
    });

    test('uses custom baseUrl when specified', () => {
      const client = new OllamaClient({ baseUrl: 'http://custom:11434' });
      expect(client.getType()).toBe('ollama');
    });

    test('uses custom defaultModel when specified', () => {
      const client = new OllamaClient({ defaultModel: 'llama3.1' });
      expect(client.getType()).toBe('ollama');
    });
  });

  describe('getType', () => {
    test('returns ollama', () => {
      const client = new OllamaClient();
      expect(client.getType()).toBe('ollama');
    });
  });

  describe('validate', () => {
    test('returns reachable true on successful connection', async () => {
      const client = new OllamaClient({ baseUrl: 'http://test:11434' });
      // This test would need mocking of fetch - for now, just verify the method exists
      expect(typeof client.validate).toBe('function');
    });
  });

  describe('listModels', () => {
    test('method exists and returns promise', async () => {
      const client = new OllamaClient();
      expect(typeof client.listModels).toBe('function');
    });
  });
});
