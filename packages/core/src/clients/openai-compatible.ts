/**
 * Shared OpenAI-compatible transport for experimental direct-assistant providers.
 *
 * This transport provides reusable request/stream/model-list logic for:
 * - Ollama (http/localhost, no auth)
 * - LM Studio (http/localhost, no auth)
 * - LiteLLM (http, optional bearer auth from environment)
 *
 * All three providers use OpenAI-compatible APIs, so we can share the core logic.
 */
import { createLogger } from '@archon/paths';
import type { MessageChunk, IAssistantClient, AssistantRequestOptions } from '../types';

/** Lazy-initialized logger */
let cachedLog: ReturnType<typeof createLogger> | undefined;
function getLog(): ReturnType<typeof createLogger> {
  if (!cachedLog) cachedLog = createLogger('openai-compatible');
  return cachedLog;
}

/** Configuration for OpenAI-compatible providers */
export interface OpenAICompatibleConfig {
  /** Provider identifier (ollama, lmstudio, litellm) */
  providerId: 'ollama' | 'lmstudio' | 'litellm';
  /** Base URL for the provider API (e.g., http://localhost:11434) */
  baseUrl: string;
  /** Default model to use if not specified */
  defaultModel?: string;
  /** Optional bearer token for authentication (LiteLLM) */
  bearerToken?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/** Model information from provider */
export interface ProviderModel {
  id: string;
  name?: string;
  owned_by?: string;
}

/** Validation result */
export interface ProviderValidationResult {
  provider: string;
  reachable: boolean;
  authenticated: boolean | null;
  models: string[];
  message: string;
  errorCode?: string;
}

type ProviderRequestError = Error & {
  status?: number;
  errorCode?: string;
};

/** Chat message for conversation history */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * OpenAI-compatible transport for experimental providers.
 * Implements IAssistantClient interface for direct-assistant use.
 */
export class OpenAICompatibleTransport implements IAssistantClient {
  private readonly config: OpenAICompatibleConfig;

  constructor(config: OpenAICompatibleConfig) {
    this.config = {
      timeout: 120000, // 2 minute default timeout
      ...config,
    };
  }

  /** Get the assistant type identifier */
  getType(): string {
    return this.config.providerId;
  }

  /** Get default headers for requests */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.bearerToken) {
      headers.Authorization = `Bearer ${this.config.bearerToken}`;
    }

    return headers;
  }

  /** Build the API URL for a given endpoint */
  private getUrl(endpoint: string): string {
    const base = this.config.baseUrl.replace(/\/$/, '');
    return `${base}${endpoint}`;
  }

  /**
   * Validate provider endpoint and retrieve available models.
   */
  async validate(): Promise<ProviderValidationResult> {
    const log = getLog();
    const provider = this.config.providerId;

    try {
      const models = await this.listModels();
      return {
        provider,
        reachable: true,
        authenticated: this.config.bearerToken ? true : null,
        models: models.map(m => m.id),
        message:
          models.length > 0
            ? `Successfully connected to ${provider}. Found ${models.length} model(s).`
            : `Successfully connected to ${provider}, but no models were discovered. Verify the provider configuration.`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const requestError = error as ProviderRequestError;
      const errorCode =
        requestError.errorCode ??
        (requestError.status === 401 || requestError.status === 403
          ? 'AUTH_FAILED'
          : 'UNREACHABLE');
      log.warn({ provider, error: errorMessage }, 'provider_validation_failed');

      return {
        provider,
        reachable: false,
        authenticated: this.config.bearerToken ? false : null,
        models: [],
        message: `Failed to connect to ${provider}: ${errorMessage}`,
        errorCode,
      };
    }
  }

  /**
   * List available models from the provider.
   */
  async listModels(): Promise<ProviderModel[]> {
    const timeout = this.config.timeout ?? 120000;
    const response = await fetch(this.getUrl('/v1/models'), {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      const error = new Error(
        `Failed to list models: ${response.status} ${response.statusText}`
      ) as ProviderRequestError;
      error.status = response.status;
      error.errorCode =
        response.status === 401 || response.status === 403 ? 'AUTH_FAILED' : 'UNREACHABLE';
      throw error;
    }

    const data = (await response.json()) as { data?: ProviderModel[]; models?: ProviderModel[] };
    // OpenAI format: { data: [...] }
    // Ollama format: { models: [...] }
    const models = data.data || data.models || [];
    if (!Array.isArray(models)) {
      const error = new Error(
        'Provider returned an incompatible models response'
      ) as ProviderRequestError;
      error.errorCode = 'INCOMPATIBLE_RESPONSE';
      throw error;
    }
    return models;
  }

  /**
   * Send a chat message and get streaming response.
   * Implements IAssistantClient.sendQuery for direct-assistant use.
   */
  async *sendQuery(
    prompt: string,
    cwd: string,
    resumeSessionId?: string,
    options?: AssistantRequestOptions
  ): AsyncGenerator<MessageChunk> {
    const log = getLog();
    const model = options?.model || this.config.defaultModel;
    const timeout = this.config.timeout ?? 120000;

    if (!model) {
      throw new Error(
        `No model specified for ${this.config.providerId}. Set defaultModel or pass model option.`
      );
    }

    log.debug(
      {
        provider: this.config.providerId,
        model,
        cwd,
        resumeSessionId: resumeSessionId ? 'present' : 'none',
      },
      'sending_query'
    );

    // Build messages array
    // Note: For multi-turn, callers should include prior messages via a wrapper
    const replayMessages =
      options?.transcript?.map(message => ({
        role: message.role,
        content: message.content,
      })) ?? [];
    const messages: ChatMessage[] = [...replayMessages, { role: 'user', content: prompt }];

    // Make streaming request
    const response = await fetch(this.getUrl('/v1/chat/completions'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      const errorText = await response.text();
      log.error(
        {
          provider: this.config.providerId,
          status: response.status,
          error: errorText,
        },
        'chat_request_failed'
      );
      yield {
        type: 'result',
        isError: true,
        errorSubtype: 'provider_error',
        stopReason: 'error',
      };
      return;
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    // Parse SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              yield { type: 'result', stopReason: 'end_turn' };
              return;
            }

            try {
              const parsed = JSON.parse(data) as {
                choices?: {
                  delta?: { content?: string };
                  finish_reason?: string;
                }[];
              };

              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield { type: 'assistant', content };
              }

              const finishReason = parsed.choices?.[0]?.finish_reason;
              if (finishReason) {
                yield { type: 'result', stopReason: finishReason };
                return;
              }
            } catch {
              // Ignore parse errors for incomplete JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Send a non-streaming chat request for multi-turn continuity.
   * Used when replaying conversation history to experimental providers.
   */
  async sendChat(messages: ChatMessage[], model?: string): Promise<string> {
    const useModel = model || this.config.defaultModel;
    const timeout = this.config.timeout ?? 120000;

    if (!useModel) {
      throw new Error(`No model specified for ${this.config.providerId}`);
    }

    const response = await fetch(this.getUrl('/v1/chat/completions'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: useModel,
        messages,
        stream: false,
      }),
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Chat request failed: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    return data.choices?.[0]?.message?.content || '';
  }
}

/**
 * Helper to resolve bearer token for LiteLLM from environment.
 * LiteLLM credentials MUST come from environment, not config files.
 */
export function resolveLiteLLMToken(): string | undefined {
  return process.env.LITELLM_API_KEY;
}
