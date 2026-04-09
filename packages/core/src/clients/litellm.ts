/**
 * LiteLLM client wrapper.
 *
 * Uses the OpenAI-compatible transport for direct-assistant conversations.
 * LiteLLM supports optional bearer authentication from environment variables only.
 *
 * SECURITY: LiteLLM credentials are resolved from LITELLM_API_KEY environment variable.
 * They are NEVER stored in config files or browser-visible settings.
 */
import { OpenAICompatibleTransport, resolveLiteLLMToken } from './openai-compatible';
import type { AssistantRequestOptions, IAssistantClient } from '../types';

/** LiteLLM default configuration */
const LITELLM_DEFAULTS = {
  baseUrl: 'http://localhost:4000',
  defaultModel: 'gpt-3.5-turbo',
};

/**
 * LiteLLM assistant client for direct chat.
 * Wraps the shared OpenAI-compatible transport with LiteLLM-specific auth handling.
 */
export class LiteLLMClient implements IAssistantClient {
  private transport: OpenAICompatibleTransport;

  constructor(config?: { baseUrl?: string; defaultModel?: string }) {
    // SECURITY: Resolve token from environment ONLY, never from config
    const bearerToken = resolveLiteLLMToken();

    this.transport = new OpenAICompatibleTransport({
      providerId: 'litellm',
      baseUrl: config?.baseUrl || LITELLM_DEFAULTS.baseUrl,
      defaultModel: config?.defaultModel || LITELLM_DEFAULTS.defaultModel,
      // Optional bearer token from environment
      bearerToken,
    });
  }

  getType(): string {
    return 'litellm';
  }

  async *sendQuery(
    prompt: string,
    cwd: string,
    resumeSessionId?: string,
    options?: AssistantRequestOptions
  ): ReturnType<IAssistantClient['sendQuery']> {
    yield* this.transport.sendQuery(prompt, cwd, resumeSessionId, options);
  }

  /** Validate LiteLLM endpoint (supports both open and authenticated) */
  async validate(): Promise<ReturnType<OpenAICompatibleTransport['validate']>> {
    return this.transport.validate();
  }

  /** List available models */
  async listModels(): Promise<ReturnType<OpenAICompatibleTransport['listModels']>> {
    return this.transport.listModels();
  }

  /** Check if authentication is configured */
  hasAuth(): boolean {
    return !!resolveLiteLLMToken();
  }
}
