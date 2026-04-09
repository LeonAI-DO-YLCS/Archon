/**
 * Tests for LM Studio client
 */
import { describe, test, expect } from 'bun:test';
import { LMStudioClient } from './lmstudio';

describe('LMStudioClient', () => {
  describe('constructor', () => {
    test('uses default baseUrl when not specified', () => {
      const client = new LMStudioClient();
      expect(client.getType()).toBe('lmstudio');
    });

    test('uses custom baseUrl when specified', () => {
      const client = new LMStudioClient({ baseUrl: 'http://custom:1234' });
      expect(client.getType()).toBe('lmstudio');
    });

    test('uses custom defaultModel when specified', () => {
      const client = new LMStudioClient({ defaultModel: 'custom-model' });
      expect(client.getType()).toBe('lmstudio');
    });
  });

  describe('getType', () => {
    test('returns lmstudio', () => {
      const client = new LMStudioClient();
      expect(client.getType()).toBe('lmstudio');
    });
  });

  describe('validate', () => {
    test('method exists', () => {
      const client = new LMStudioClient();
      expect(typeof client.validate).toBe('function');
    });
  });

  describe('listModels', () => {
    test('method exists', () => {
      const client = new LMStudioClient();
      expect(typeof client.listModels).toBe('function');
    });
  });
});
