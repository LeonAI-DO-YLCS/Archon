import { z } from '@hono/zod-openapi';

export const providerIdSchema = z.enum(['ollama', 'lmstudio', 'litellm']);

export const validateProviderBodySchema = z
  .object({
    baseUrl: z.string().url(),
    defaultModel: z.string().optional(),
  })
  .openapi('ValidateProviderBody');

export const providerValidationResponseSchema = z
  .object({
    provider: providerIdSchema,
    reachable: z.boolean(),
    authenticated: z.boolean().nullable(),
    models: z.array(z.string()),
    message: z.string(),
    errorCode: z.string().optional(),
  })
  .openapi('ProviderValidationResponse');

export const providerModelsResponseSchema = z
  .object({
    provider: providerIdSchema,
    models: z.array(z.string()),
    defaultModel: z.string().nullable(),
  })
  .openapi('ProviderModelsResponse');
