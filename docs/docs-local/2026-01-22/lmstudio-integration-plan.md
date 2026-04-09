# LMStudio Integration Research & Implementation Plan

**Date:** 2026-01-22
**Branch:** `feature/lmstudio-provider-integration`
**Status:** Research Complete, Ready for Implementation

## 1. Executive Summary

We will integrate **LMStudio** as a first-class local LLM provider in Archon, alongside Ollama. This will allow users to utilize LMStudio's local server (OpenAI-compatible) for both **Chat** and **Embeddings**. The integration will mirror the existing Ollama implementation but leverage LMStudio's OpenAI-compatible API structure (`/v1/models`, `/v1/chat/completions`, `/v1/embeddings`).

## 2. Technical Research Findings

### 2.1 Current Ollama Architecture (Reference)

The Ollama integration is deep and distributed across the stack:

- **Backend**: `ollama_api.py` (55KB) handles discovery, health checks, and specific embedding routing.
- **Discovery**: `provider_discovery_service.py` relies on `api/tags` which is specific to Ollama.
- **Frontend**: `ollamaService.ts` communicates with the backend proxy.
- **Settings**: `RAGSettings.tsx` has specialized UI for "Local" providers vs "Cloud" providers.

### 2.2 LMStudio API Specifications

LMStudio runs an OpenAI-compatible server.

- **Base URL**: Typically `http://localhost:1234/v1` (inside Docker: `http://host.docker.internal:1234/v1`).
- **Endpoints**:
  - `GET /v1/models`: Lists loaded/available models.
  - `POST /v1/chat/completions`: Standard OpenAI format.
  - `POST /v1/embeddings`: Standard OpenAI format.
- **Key Difference**: Unlike Ollama's `api/tags`, LMStudio follows the stricter OpenAI standard, meaning we use `client.models.list()` pattern rather than custom scraping.

## 3. Implementation Plan

### Phase 1: Backend Implementation (Python)

#### 1.1 New API Route (`python/src/server/api_routes/lmstudio_api.py`)

Create a dedicated router for LMStudio to handle:

- **Health Checks**: Ping the instance to verify it's online.
- **Model Discovery**: Fetch models via `/v1/models`.
- **Validation**: Verify the instance responds correctly.

#### 1.2 Provider Discovery Update (`python/src/server/services/provider_discovery_service.py`)

Add `lmstudio` to the supported providers:

```python
async def discover_lmstudio_models(self, base_urls: list[str]) -> list[ModelSpec]:
    # Logic to query /v1/models and map to ModelSpec
    # Heuristics for context window and capabilities based on model name
```

#### 1.3 Embedding Service Update (`python/src/server/services/embeddings/`)

- Update `contextual_embedding_service.py` to handle `provider="lmstudio"`.
- Ensure the embedding dimension checks work with LMStudio models.

### Phase 2: Frontend Implementation (React/TypeScript)

#### 2.1 Service Layer (`archon-ui-main/src/services/`)

- **Create `lmstudioService.ts`**:
  - Methods: `discoverModels`, `checkInstanceHealth`, `validateInstance`.
  - This will act as the client-side proxy to the new Python API endpoints.
- **Update `credentialsService.ts`**:
  - Add types for `LMStudioInstance`.
  - Add methods to `get/set` LMStudio instance configurations (persisting URL: `http://host.docker.internal:1234/v1`).

#### 2.2 UI Components (`archon-ui-main/src/components/settings/`)

- **Update `RAGSettings.tsx`**:
  - Add `'lmstudio'` to `ProviderKey` type.
  - Add LMStudio to the provider buttons list (with logo).
  - Add the "Configuration" section (gear icon) for LMStudio, similar to Ollama.
  - Implement the "Test Connection" logic for LMStudio.
- **New Component**: `LMStudioConfigurationPanel.tsx` (simplified version of Ollama's, as LMStudio is usually single-instance).

### Phase 3: Docker & Networking

- **Connectivity**: The user is on Windows with Docker.
  - Requirement: Use `http://host.docker.internal:1234` to reach LMStudio running on the host.
  - Verification: We will add a pre-flight check in the backend to ensure this hostname resolves.

## 4. Verification Strategy

1.  **Unit Tests**: Test the discovery parsing logic.
2.  **Integration Test**:
    - Start LMStudio on host (User action).
    - Configure Archon to point to `http://host.docker.internal:1234/v1`.
    - Verify "Test Connection" returns success (Green).
    - Verify models stored in LMStudio appear in the dropdown.
    - Run a test chat query.
    - Run a test embedding generation.

## 5. Needed Assets

- **Logo**: We need an `LMStudio.png` or `svg` for the UI. (Will use a placeholder or generic chip if unavailable).

---

**Next Steps**: Awaiting user approval to proceed with Phase 1 (Backend).
