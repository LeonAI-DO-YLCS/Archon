import { describe, test, expect } from 'bun:test';
import { getAssistantClient, isWorkflowCapable, isExperimentalProvider } from './factory';
import { ClaudeClient } from './claude';
import { CodexClient } from './codex';
import { OllamaClient } from './ollama';
import { LMStudioClient } from './lmstudio';
import { LiteLLMClient } from './litellm';

describe('factory', () => {
  describe('getAssistantClient', () => {
    test('returns ClaudeClient for claude type', () => {
      const client = getAssistantClient('claude');

      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(ClaudeClient);
      expect(client.getType()).toBe('claude');
      expect(typeof client.sendQuery).toBe('function');
    });

    test('returns CodexClient for codex type', () => {
      const client = getAssistantClient('codex');

      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(CodexClient);
      expect(client.getType()).toBe('codex');
      expect(typeof client.sendQuery).toBe('function');
    });

    test('returns OllamaClient for ollama type', () => {
      const client = getAssistantClient('ollama');

      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(OllamaClient);
      expect(client.getType()).toBe('ollama');
      expect(typeof client.sendQuery).toBe('function');
    });

    test('returns LMStudioClient for lmstudio type', () => {
      const client = getAssistantClient('lmstudio');

      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(LMStudioClient);
      expect(client.getType()).toBe('lmstudio');
      expect(typeof client.sendQuery).toBe('function');
    });

    test('returns LiteLLMClient for litellm type', () => {
      const client = getAssistantClient('litellm');

      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(LiteLLMClient);
      expect(client.getType()).toBe('litellm');
      expect(typeof client.sendQuery).toBe('function');
    });

    test('throws error for unknown type', () => {
      expect(() => getAssistantClient('unknown')).toThrow(
        "Unknown assistant type: unknown. Supported types: 'claude', 'codex', 'ollama', 'lmstudio', 'litellm'"
      );
    });

    test('throws error for empty string', () => {
      expect(() => getAssistantClient('')).toThrow(
        "Unknown assistant type: . Supported types: 'claude', 'codex', 'ollama', 'lmstudio', 'litellm'"
      );
    });

    test('is case sensitive - Claude throws', () => {
      expect(() => getAssistantClient('Claude')).toThrow(
        "Unknown assistant type: Claude. Supported types: 'claude', 'codex', 'ollama', 'lmstudio', 'litellm'"
      );
    });

    test('each call returns new instance', () => {
      const client1 = getAssistantClient('claude');
      const client2 = getAssistantClient('claude');

      // Each call should return a new instance
      expect(client1).not.toBe(client2);
    });
  });

  describe('isWorkflowCapable', () => {
    test('returns true for claude', () => {
      expect(isWorkflowCapable('claude')).toBe(true);
    });

    test('returns true for codex', () => {
      expect(isWorkflowCapable('codex')).toBe(true);
    });

    test('returns false for ollama', () => {
      expect(isWorkflowCapable('ollama')).toBe(false);
    });

    test('returns false for lmstudio', () => {
      expect(isWorkflowCapable('lmstudio')).toBe(false);
    });

    test('returns false for litellm', () => {
      expect(isWorkflowCapable('litellm')).toBe(false);
    });

    test('returns false for unknown type', () => {
      expect(isWorkflowCapable('unknown')).toBe(false);
    });
  });

  describe('isExperimentalProvider', () => {
    test('returns false for claude', () => {
      expect(isExperimentalProvider('claude')).toBe(false);
    });

    test('returns false for codex', () => {
      expect(isExperimentalProvider('codex')).toBe(false);
    });

    test('returns true for ollama', () => {
      expect(isExperimentalProvider('ollama')).toBe(true);
    });

    test('returns true for lmstudio', () => {
      expect(isExperimentalProvider('lmstudio')).toBe(true);
    });

    test('returns true for litellm', () => {
      expect(isExperimentalProvider('litellm')).toBe(true);
    });

    test('returns false for unknown type', () => {
      expect(isExperimentalProvider('unknown')).toBe(false);
    });
  });
});
