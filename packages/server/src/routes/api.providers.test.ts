import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { OpenAPIHono } from '@hono/zod-openapi';
import type { ConversationLockManager } from '@archon/core';
import type { WebAdapter } from '../adapters/web';

const mockValidateProvider = mock(async () => ({
  provider: 'ollama',
  reachable: true,
  authenticated: null,
  models: ['llama3.2'],
  message: 'ok',
}));
const mockListProviderModels = mock(async () => [{ id: 'llama3.2' }]);
const mockLoadConfig = mock(async () => ({
  assistants: {
    claude: {},
    codex: {},
    ollama: { enabled: true, baseUrl: 'http://ollama.local', defaultModel: 'llama3.2' },
    lmstudio: { enabled: true, baseUrl: 'http://lmstudio.local', defaultModel: 'qwen' },
    litellm: { enabled: true, baseUrl: 'http://litellm.local', defaultModel: 'gpt-4o-mini' },
  },
}));
const mockResolveLiteLLMApiKey = mock(async () => 'secret-token');

mock.module('@archon/core', () => ({
  handleMessage: mock(async () => {}),
  getDatabaseType: () => 'sqlite',
  loadConfig: mockLoadConfig,
  toSafeConfig: (config: unknown) => config,
  updateGlobalConfig: mock(async () => {}),
  cloneRepository: mock(async () => ({ codebaseId: 'x', alreadyExisted: false })),
  registerRepository: mock(async () => ({ codebaseId: 'x', alreadyExisted: false })),
  ConversationNotFoundError: class ConversationNotFoundError extends Error {},
  generateAndSetTitle: mock(async () => {}),
  EnvLeakError: class EnvLeakError extends Error {},
  scanPathForSensitiveKeys: mock(() => ({ findings: [] })),
  OpenAICompatibleTransport: class OpenAICompatibleTransport {
    constructor(private readonly config: { providerId: string }) {}
    async validate() {
      const result = await mockValidateProvider();
      return { ...result, provider: this.config.providerId };
    }
    async listModels() {
      return mockListProviderModels();
    }
  },
}));

mock.module('@archon/paths', () => ({
  createLogger: () => ({
    fatal: mock(() => undefined),
    error: mock(() => undefined),
    warn: mock(() => undefined),
    info: mock(() => undefined),
    debug: mock(() => undefined),
    trace: mock(() => undefined),
    child: mock(function (this: unknown) {
      return this;
    }),
    bindings: mock(() => ({ module: 'test' })),
    isLevelEnabled: mock(() => true),
    level: 'info',
  }),
  getWorkflowFolderSearchPaths: mock(() => ['.archon/workflows']),
  getCommandFolderSearchPaths: mock(() => ['.archon/commands']),
  getDefaultCommandsPath: mock(() => '/tmp/.archon-test-nonexistent/commands/defaults'),
  getDefaultWorkflowsPath: mock(() => '/tmp/.archon-test-nonexistent/workflows/defaults'),
  getArchonWorkspacesPath: () => '/tmp/.archon/workspaces',
  getRunArtifactsPath: mock(() => '/tmp/.archon/artifacts'),
  getArchonHome: () => '/tmp/.archon',
  isDocker: mock(() => false),
}));

mock.module('@archon/workflows/workflow-discovery', () => ({
  discoverWorkflowsWithConfig: mock(async () => ({ workflows: [], errors: [] })),
}));
mock.module('@archon/workflows/loader', () => ({
  parseWorkflow: mock(() => ({ workflow: null, error: null })),
}));
mock.module('@archon/workflows/router', () => ({ findWorkflow: mock(() => null) }));
mock.module('@archon/workflows/executor', () => ({ executeWorkflow: mock(async () => ({})) }));
mock.module('@archon/workflows/command-validation', () => ({
  isValidCommandName: mock(() => true),
}));
mock.module('@archon/workflows/defaults', () => ({
  BUNDLED_WORKFLOWS: {},
  BUNDLED_COMMANDS: {},
  isBinaryBuild: mock(() => false),
}));
mock.module('@archon/git', () => ({
  removeWorktree: mock(async () => {}),
  toRepoPath: (p: string) => p,
  toWorktreePath: (p: string) => p,
}));

mock.module('@archon/core/db/conversations', () => ({
  findConversationByPlatformId: mock(async () => null),
  listConversations: mock(async () => []),
  getOrCreateConversation: mock(async () => null),
  softDeleteConversation: mock(async () => {}),
  updateConversationTitle: mock(async () => {}),
  getConversationById: mock(async () => null),
}));
mock.module('@archon/core/db/codebases', () => ({
  listCodebases: mock(async () => []),
  getCodebase: mock(async () => null),
  deleteCodebase: mock(async () => {}),
}));
mock.module('@archon/core/db/env-vars', () => ({
  resolveLiteLLMApiKey: mockResolveLiteLLMApiKey,
}));
mock.module('@archon/core/db/isolation-environments', () => ({
  listByCodebaseWithAge: mock(async () => []),
}));
mock.module('@archon/core/db/workflows', () => ({ getRunningWorkflows: mock(async () => []) }));
mock.module('@archon/core/db/workflow-events', () => ({}));
mock.module('@archon/core/db/messages', () => ({}));
mock.module('@archon/core/utils/commands', () => ({
  findMarkdownFilesRecursive: mock(async () => []),
}));

import { registerApiRoutes } from './api';

function makeApp(): OpenAPIHono {
  const app = new OpenAPIHono();
  const webAdapter = {
    setConversationDbId: mock(() => {}),
    emitSSE: mock(async () => {}),
    emitLockEvent: mock(async () => {}),
  } as unknown as WebAdapter;
  const lockManager = {
    acquireLock: mock(async (_id: string, fn: () => Promise<void>) => {
      await fn();
      return { status: 'started' };
    }),
    getStats: mock(() => ({
      active: 0,
      queuedTotal: 0,
      queuedByConversation: [],
      maxConcurrent: 10,
      activeConversationIds: [],
    })),
  } as unknown as ConversationLockManager;

  registerApiRoutes(app, webAdapter, lockManager);
  return app;
}

describe('provider administration routes', () => {
  beforeEach(() => {
    mockValidateProvider.mockReset();
    mockListProviderModels.mockReset();
    mockLoadConfig.mockReset();
    mockResolveLiteLLMApiKey.mockReset();

    mockValidateProvider.mockResolvedValue({
      provider: 'ollama',
      reachable: true,
      authenticated: null,
      models: ['llama3.2'],
      message: 'ok',
    });
    mockListProviderModels.mockResolvedValue([{ id: 'llama3.2' }]);
    mockLoadConfig.mockResolvedValue({
      assistants: {
        claude: {},
        codex: {},
        ollama: { enabled: true, baseUrl: 'http://ollama.local', defaultModel: 'llama3.2' },
        lmstudio: { enabled: true, baseUrl: 'http://lmstudio.local', defaultModel: 'qwen' },
        litellm: { enabled: true, baseUrl: 'http://litellm.local', defaultModel: 'gpt-4o-mini' },
      },
    });
    mockResolveLiteLLMApiKey.mockResolvedValue('secret-token');
  });

  test('validates ollama endpoints', async () => {
    const app = makeApp();
    const response = await app.request('/api/providers/ollama/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseUrl: 'http://ollama.local', defaultModel: 'llama3.2' }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      provider: 'ollama',
      reachable: true,
      models: ['llama3.2'],
    });
  });

  test('returns lmstudio validation failures', async () => {
    mockValidateProvider.mockResolvedValueOnce({
      provider: 'lmstudio',
      reachable: false,
      authenticated: null,
      models: [],
      message: 'Failed to connect',
      errorCode: 'UNREACHABLE',
    });

    const app = makeApp();
    const response = await app.request('/api/providers/lmstudio/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseUrl: 'http://lmstudio.local' }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      provider: 'lmstudio',
      reachable: false,
      errorCode: 'UNREACHABLE',
    });
  });

  test('returns litellm auth failures without exposing secrets', async () => {
    mockValidateProvider.mockResolvedValueOnce({
      provider: 'litellm',
      reachable: false,
      authenticated: false,
      models: [],
      message: 'Invalid credentials',
      errorCode: 'AUTH_FAILED',
    });

    const app = makeApp();
    const response = await app.request('/api/providers/litellm/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseUrl: 'http://litellm.local', defaultModel: 'gpt-4o-mini' }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      provider: 'litellm',
      authenticated: false,
      errorCode: 'AUTH_FAILED',
    });
    expect(JSON.stringify(body)).not.toContain('secret-token');
  });

  test('lists ollama models from configured settings', async () => {
    const app = makeApp();
    const response = await app.request('/api/providers/ollama/models');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      provider: 'ollama',
      models: ['llama3.2'],
      defaultModel: 'llama3.2',
    });
  });

  test('lists lmstudio models from configured settings', async () => {
    mockListProviderModels.mockResolvedValueOnce([{ id: 'qwen' }, { id: 'deepseek-r1' }]);

    const app = makeApp();
    const response = await app.request('/api/providers/lmstudio/models');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      provider: 'lmstudio',
      models: ['qwen', 'deepseek-r1'],
      defaultModel: 'qwen',
    });
  });

  test('lists litellm models without exposing credentials', async () => {
    mockListProviderModels.mockResolvedValueOnce([{ id: 'gpt-4o-mini' }]);

    const app = makeApp();
    const response = await app.request('/api/providers/litellm/models');

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      provider: 'litellm',
      models: ['gpt-4o-mini'],
      defaultModel: 'gpt-4o-mini',
    });
    expect(JSON.stringify(body)).not.toContain('secret-token');
  });
});
