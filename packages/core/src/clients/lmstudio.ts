/**
 * LM Studio client wrapper.
 *
 * Uses the OpenAI-compatible transport for direct-assistant conversations.
 * LM Studio runs locally and does not require authentication.
 */
import { OpenAICompatibleTransport } from './openai-compatible';
import type { AssistantRequestOptions, IAssistantClient } from '../types';

/** LM Studio default configuration */
const LMSTUDIO_DEFAULTS = {
  baseUrl: 'http://localhost:1234',
  defaultModel: 'local-model',
};

/**
 * LM Studio assistant client for direct chat.
 * Wraps the shared OpenAI-compatible transport with LM Studio-specific defaults.
 */
export class LMStudioClient implements IAssistantClient {
  private transport: OpenAICompatibleTransport;

  constructor(config?: { baseUrl?: string; defaultModel?: string }) {
    this.transport = new OpenAICompatibleTransport({
      providerId: 'lmstudio',
      baseUrl: config?.baseUrl || LMSTUDIO_DEFAULTS.baseUrl,
      defaultModel: config?.defaultModel || LMSTUDIO_DEFAULTS.defaultModel,
      // LM Studio requires no authentication
      bearerToken: undefined,
    });
  }

  getType(): string {
    return 'lmstudio';
  }

  async *sendQuery(
    prompt: string,
    cwd: string,
    resumeSessionId?: string,
    options?: AssistantRequestOptions
  ): ReturnType<IAssistantClient['sendQuery']> {
    yield* this.transport.sendQuery(prompt, cwd, resumeSessionId, options);
  }

  /** Validate LM Studio endpoint */
  async validate(): Promise<ReturnType<OpenAICompatibleTransport['validate']>> {
    return this.transport.validate();
  }

  /** List available models */
  async listModels(): Promise<ReturnType<OpenAICompatibleTransport['listModels']>> {
    return this.transport.listModels();
  }
}
