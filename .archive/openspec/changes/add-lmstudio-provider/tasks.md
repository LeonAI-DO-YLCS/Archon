# Tasks: LMStudio Integration

## Phase 1: Backend Implementation (Python)

- [ ] 1.1 Create `python/src/server/api_routes/lmstudio_api.py` with `/validate` and `/models` endpoints
  - Implement `validate_instance_endpoint` to check connectivity
  - Implement `discover_models_endpoint` to list models via OpenAI client pattern
- [ ] 1.2 Update `python/src/server/main.py` (or equivalent router config) to include `lmstudio_router`
- [ ] 1.3 Update `python/src/server/services/provider_discovery_service.py`
  - Add `LMStudio` to supported provider enums/lists
  - Implement generic OpenAI-compatible discovery logic if not already present
- [ ] 1.4 Update `python/src/server/services/embeddings/contextual_embedding_service.py`
  - Add `lmstudio` case to `create_embedding_client` factory
  - Ensure embedding dimension validation works for LMStudio response format

## Phase 2: Frontend Implementation (React/TS)

- [ ] 2.1 Create `archon-ui-main/src/services/lmstudioService.ts`
  - Implement `validateInstance(url)`
  - Implement `discoverModels(url)`
  - Implement `checkInstanceHealth(url)`
- [ ] 2.2 Update `archon-ui-main/src/services/credentialsService.ts`
  - Add `LMStudioInstance` interface
  - Add `getLMStudioConfig` and `saveLMStudioConfig` methods
- [ ] 2.3 Add Logo Asset
  - Add `LMStudio.png` to `archon-ui-main/public/img/` (Placeholder or real asset)

## Phase 3: UI Integration (RAGSettings)

- [ ] 3.1 Update `archon-ui-main/src/components/settings/RAGSettings.tsx`
  - Add `'lmstudio'` to `ProviderKey` type definition
  - Add configurations for `lmstudio` in `PROIVDER_MODELS_KEY` defaults
  - Add LMStudio button in the provider selection list
  - Implement `LMStudioConfigurationPanel` (can be inline or separate component)
  - Add logic to show/hide LMStudio config based on selection
- [ ] 3.2 Implement "Test Connection" logic for LMStudio in `RAGSettings.tsx`
  - Wire up to `lmstudioService.validateInstance`

## Phase 4: Verification

- [ ] 4.1 Verify Backend Endpoints
  - Curl request to `http://localhost:8000/api/lmstudio/validate`
- [ ] 4.2 Verify Frontend Integration
  - Check "Test Connection" with valid URL
  - Check "Test Connection" with invalid URL (Error handling)
  - Verify Model Dropdown populates
