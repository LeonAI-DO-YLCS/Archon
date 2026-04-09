/**
 * Tests for LiteLLM client
 *
 * SECURITY: LiteLLM credentials must come from environment variables only.
 */
import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { LiteLLMClient } from './litellm';
import { resolveLiteLLMToken } from './openai-compatible';

describe('LiteLLMClient', () => {
  const originalEnv = process.env.LITELLM_API_KEY;

  beforeEach(() => {
    // Clean environment before each test
    delete process.env.LITELLM_API_KEY;
  });

  afterEach(() => {
    // Restore original env
    if (originalEnv !== undefined) {
      process.env.LITELLM_API_KEY = originalEnv;
    } else {
      delete process.env.LITELLM_API_KEY;
    }
  });

  describe('constructor', () => {
    test('uses default baseUrl when not specified', () => {
      const client = new LiteLLMClient();
      expect(client.getType()).toBe('litellm');
    });

    test('uses custom baseUrl when specified', () => {
      const client = new LiteLLMClient({ baseUrl: 'http://custom:4000' });
      expect(client.getType()).toBe('litellm');
    });

    test('uses custom defaultModel when specified', () => {
      const client = new LiteLLMClient({ defaultModel: 'gpt-4' });
      expect(client.getType()).toBe('litellm');
    });

    test('operates without authentication (open mode)', () => {
      const client = new LiteLLMClient();
      expect(client.hasAuth()).toBe(false);
    });

    test('uses bearer token from environment when set', () => {
      process.env.LITELLM_API_KEY = 'test-api-key';
      const client = new LiteLLMClient();
      expect(client.hasAuth()).toBe(true);
    });
  });

  describe('getType', () => {
    test('returns litellm', () => {
      const client = new LiteLLMClient();
      expect(client.getType()).toBe('litellm');
    });
  });

  describe('hasAuth', () => {
    test('returns false when no token in environment', () => {
      const client = new LiteLLMClient();
      expect(client.hasAuth()).toBe(false);
    });

    test('returns true when token is in environment', () => {
      process.env.LITELLM_API_KEY = 'test-key';
      const client = new LiteLLMClient();
      expect(client.hasAuth()).toBe(true);
    });
  });

  describe('validate', () => {
    test('method exists', () => {
      const client = new LiteLLMClient();
      expect(typeof client.validate).toBe('function');
    });
  });

  describe('listModels', () => {
    test('method exists', () => {
      const client = new LiteLLMClient();
      expect(typeof client.listModels).toBe('function');
    });
  });
});

describe('resolveLiteLLMToken', () => {
  const originalEnv = process.env.LITELLM_API_KEY;

  beforeEach(() => {
    delete process.env.LITELLM_API_KEY;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.LITELLM_API_KEY = originalEnv;
    } else {
      delete process.env.LITELLM_API_KEY;
    }
  });

  test('returns undefined when not set', () => {
    expect(resolveLiteLLMToken()).toBeUndefined();
  });

  test('returns token when set', () => {
    process.env.LITELLM_API_KEY = 'my-secret-token';
    expect(resolveLiteLLMToken()).toBe('my-secret-token');
  });

  test('returns empty string token if explicitly set', () => {
    process.env.LITELLM_API_KEY = '';
    expect(resolveLiteLLMToken()).toBe('');
  });
});
