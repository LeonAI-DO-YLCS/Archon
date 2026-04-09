# Contract: Provider Administration and Codebase Assistant APIs

## Purpose

Define the externally visible server contract required to configure experimental providers, validate them, list models, and update a registered codebase's assistant selection.

## 1. Update Codebase Assistant Selection

### Route

`PATCH /api/codebases/{id}`

### Request Body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `allowEnvKeys` | boolean | no | Preserves existing behavior |
| `aiAssistantType` | enum | no | One of `claude`, `codex`, `ollama`, `lmstudio`, `litellm` |

### Success Behavior

- Returns the updated codebase representation.
- Applies `aiAssistantType` to future conversations created for that codebase.
- Does not migrate existing conversations to the new assistant type.

### Error Behavior

- `404` when the codebase does not exist
- `400` when `aiAssistantType` is not a supported assistant type

## 2. Validate Experimental Provider Endpoint

### Routes

- `POST /api/providers/ollama/validate`
- `POST /api/providers/lmstudio/validate`
- `POST /api/providers/litellm/validate`

### Request Body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `baseUrl` | string | yes | Endpoint for the external provider service |
| `defaultModel` | string | no | Model to probe when the provider supports it |

### Success Response

| Field | Type | Notes |
|-------|------|-------|
| `provider` | string | Provider identifier |
| `reachable` | boolean | `true` when the endpoint is usable |
| `authenticated` | boolean nullable | Relevant for LiteLLM or other auth-aware probes |
| `message` | string | Human-readable validation result |

### Error Response

| Field | Type | Notes |
|-------|------|-------|
| `provider` | string | Provider identifier |
| `reachable` | boolean | `false` |
| `errorCode` | string | Structured failure category |
| `message` | string | Actionable failure explanation |

### Contract Rules

- Validation must fail fast on unreachable services, incompatible responses, or invalid credentials.
- LiteLLM validation must support both open and bearer-authenticated deployments.
- Validation never returns or echoes secret credential values.

## 3. List Experimental Provider Models

### Routes

- `GET /api/providers/ollama/models`
- `GET /api/providers/lmstudio/models`
- `GET /api/providers/litellm/models`

### Input Behavior

- Uses the currently configured non-secret provider settings.
- May use resolved environment credentials when the provider requires them.

### Success Response

| Field | Type | Notes |
|-------|------|-------|
| `provider` | string | Provider identifier |
| `models` | string[] | Available model identifiers for UI selection |
| `defaultModel` | string nullable | Currently selected default model when present |

### Error Response

| Field | Type | Notes |
|-------|------|-------|
| `provider` | string | Provider identifier |
| `errorCode` | string | Structured failure category |
| `message` | string | Human-readable reason |

## 4. Safe Configuration Surface

### Returned Settings Shape

The browser-visible configuration surface must include:

| Path | Fields |
|------|--------|
| `assistants.ollama` | `enabled`, `baseUrl`, `defaultModel` |
| `assistants.lmstudio` | `enabled`, `baseUrl`, `defaultModel` |
| `assistants.litellm` | `enabled`, `baseUrl`, `defaultModel` |

### Exclusions

- LiteLLM API keys
- Any other provider secrets

## 5. Acceptance Notes

- These routes support direct-assistant administration only.
- Nothing in this contract permits experimental providers to be used as workflow providers.
