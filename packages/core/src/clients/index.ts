/**
 * AI Assistant Clients
 *
 * Prefer importing from '@archon/core' for most use cases:
 * import { ClaudeClient, getAssistantClient } from '@archon/core';
 *
 * Use this submodule path when you only need client-specific code:
 * import { ClaudeClient } from '@archon/core/clients';
 */

// Native workflow-capable clients
export { ClaudeClient } from './claude';
export { CodexClient } from './codex';

// Experimental direct-assistant clients
export { OllamaClient } from './ollama';
export { LMStudioClient } from './lmstudio';
export { LiteLLMClient } from './litellm';

// Shared transport for OpenAI-compatible providers
export { OpenAICompatibleTransport, resolveLiteLLMToken } from './openai-compatible';
export type {
  OpenAICompatibleConfig,
  ProviderModel,
  ProviderValidationResult,
  ChatMessage,
} from './openai-compatible';

// Factory and type guards
export { getAssistantClient, isWorkflowCapable, isExperimentalProvider } from './factory';
export type { AssistantType, NativeAssistantType, ExperimentalAssistantType } from './factory';

// Re-export types for consumers importing from this submodule directly
export type { IAssistantClient, MessageChunk } from '../types';
