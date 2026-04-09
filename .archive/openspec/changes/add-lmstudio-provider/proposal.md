# Change: Add LMStudio Provider Integration

## Why

Users currently rely on Ollama for local LLM inference, but many advanced users prefer LMStudio for its superior model management, quantization options, and UI. LMStudio provides an OpenAI-compatible server at `http://localhost:1234/v1` which Archon can leverage to offer a second robust local provider option.

## What Changes

- **Backend API**: Add `lmstudio_api.py` to handle discovery and validation via standard OpenAI endpoints.
- **Service Layer**: Implement `provider_discovery_service.py` support for LMStudio.
- **Frontend Service**: Create `lmstudioService.ts` to manage client-side interactions.
- **Settings UI**: Update `RAGSettings.tsx` to include an "LMStudio" provider option with configuration for base URL (defaulting to `http://host.docker.internal:1234`).
- **Embeddings**: Enable LMStudio as a valid embedding provider in `contextual_embedding_service.py`.

## Impact

- **Affected Specs**: `local-llm-providers`
- **Affected Code**:
  - `python/src/server/api_routes/`
  - `python/src/server/services/`
  - `archon-ui-main/src/services/`
  - `archon-ui-main/src/components/settings/`
- **Breaking Changes**: None. This is an additive change.

## Test Strategy

- **Manual Verification**:
  1. Start LMStudio server.
  2. Configure Archon to point to `http://host.docker.internal:1234/v1`.
  3. Click "Test Connection" and verify success.
  4. Verify model list population.
  5. Execute a chat query.
  6. Execute an embedding generation.
- **Automated Tests**:
  - Add unit tests for `lmstudio_api.py` using mocked responses.
