/**
 * Ollama client wrapper.
 *
 * Uses the OpenAI-compatible transport for direct-assistant conversations.
 * Ollama runs locally and does not require authentication.
 */
import { OpenAICompatibleTransport } from './openai-compatible';
import type { AssistantRequestOptions, IAssistantClient } from '../types';

/** Ollama default configuration */
const OLLAMA_DEFAULTS = {
  baseUrl: 'http://localhost:11434',
  defaultModel: 'llama3.2',
};

/**
 * Ollama assistant client for direct chat.
 * Wraps the shared OpenAI-compatible transport with Ollama-specific defaults.
 */
export class OllamaClient implements IAssistantClient {
  private transport: OpenAICompatibleTransport;

  constructor(config?: { baseUrl?: string; defaultModel?: string }) {
    this.transport = new OpenAICompatibleTransport({
      providerId: 'ollama',
      baseUrl: config?.baseUrl || OLLAMA_DEFAULTS.baseUrl,
      defaultModel: config?.defaultModel || OLLAMA_DEFAULTS.defaultModel,
      // Ollama requires no authentication
      bearerToken: undefined,
    });
  }

  getType(): string {
    return 'ollama';
  }

  async *sendQuery(
    prompt: string,
    cwd: string,
    resumeSessionId?: string,
    options?: AssistantRequestOptions
  ): ReturnType<IAssistantClient['sendQuery']> {
    yield* this.transport.sendQuery(prompt, cwd, resumeSessionId, options);
  }

  /** Validate Ollama endpoint */
  async validate(): Promise<ReturnType<OpenAICompatibleTransport['validate']>> {
    return this.transport.validate();
  }

  /** List available models */
  async listModels(): Promise<ReturnType<OpenAICompatibleTransport['listModels']>> {
    return this.transport.listModels();
  }
}
