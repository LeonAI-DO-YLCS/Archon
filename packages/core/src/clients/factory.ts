/**
 * AI Assistant Client Factory
 *
 * Dynamically instantiates the appropriate AI assistant client based on type string.
 * Supports native workflow assistants (Claude, Codex) and experimental direct assistants (Ollama, LM Studio, LiteLLM).
 */
import type { IAssistantClient } from '../types';
import { ClaudeClient } from './claude';
import { CodexClient } from './codex';
import { OllamaClient } from './ollama';
import { LMStudioClient } from './lmstudio';
import { LiteLLMClient } from './litellm';
import { createLogger } from '@archon/paths';

/** Lazy-initialized logger (deferred so test mocks can intercept createLogger) */
let cachedLog: ReturnType<typeof createLogger> | undefined;
function getLog(): ReturnType<typeof createLogger> {
  if (!cachedLog) cachedLog = createLogger('client.factory');
  return cachedLog;
}

/** Supported assistant types */
export type AssistantType = 'claude' | 'codex' | 'ollama' | 'lmstudio' | 'litellm';

/** Native workflow-capable assistants */
export type NativeAssistantType = 'claude' | 'codex';

/** Experimental direct-assistant providers */
export type ExperimentalAssistantType = 'ollama' | 'lmstudio' | 'litellm';

/**
 * Check if an assistant type is workflow-capable.
 */
export function isWorkflowCapable(type: string): type is NativeAssistantType {
  return type === 'claude' || type === 'codex';
}

/**
 * Check if an assistant type is an experimental direct-assistant provider.
 */
export function isExperimentalProvider(type: string): type is ExperimentalAssistantType {
  return type === 'ollama' || type === 'lmstudio' || type === 'litellm';
}

/**
 * Get the appropriate AI assistant client based on type
 *
 * @param type - Assistant type identifier ('claude', 'codex', 'ollama', 'lmstudio', 'litellm')
 * @returns Instantiated assistant client
 * @throws Error if assistant type is unknown
 */
export function getAssistantClient(type: string): IAssistantClient {
  switch (type) {
    case 'claude':
      getLog().debug({ provider: 'claude' }, 'client_selected');
      return new ClaudeClient();
    case 'codex':
      getLog().debug({ provider: 'codex' }, 'client_selected');
      return new CodexClient();
    case 'ollama':
      getLog().debug({ provider: 'ollama' }, 'client_selected');
      return new OllamaClient();
    case 'lmstudio':
      getLog().debug({ provider: 'lmstudio' }, 'client_selected');
      return new LMStudioClient();
    case 'litellm':
      getLog().debug({ provider: 'litellm' }, 'client_selected');
      return new LiteLLMClient();
    default:
      throw new Error(
        `Unknown assistant type: ${type}. Supported types: 'claude', 'codex', 'ollama', 'lmstudio', 'litellm'`
      );
  }
}
