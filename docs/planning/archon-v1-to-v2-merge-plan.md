# Archon V1-to-V2 Merge Plan

## Document Status

- Status: Approved planning baseline
- Purpose: This document is the implementation source of truth for upgrading this local Archon repository to upstream Archon v2 while preserving the selected local provider capabilities
- Scope: Repository architecture replacement, provider preservation, conflict resolution, validation, testing, rollout sequencing
- Out of scope: Implementing the merge, migrating v1 RAG data, preserving legacy runtime parity, bundled local-provider deployment infrastructure

## Executive Summary

This repository is not a normal incremental upgrade from upstream Archon. The current local project is a customized derivative of upstream Archon v1, while current upstream Archon is a different v2 product line with a Bun and TypeScript monorepo architecture.

The implementation must therefore use a controlled migration strategy:

1. Archive the current local v1 codebase intact.
2. Adopt `coleam00/Archon` tag `v0.3.2` as the new active base.
3. Reintroduce selected provider capabilities from the local repo into the active v2 product.
4. Keep Claude and Codex as the only workflow executors.
5. Keep v1 embeddings and RAG archived rather than migrating them into v2.

The final active product will be:

- Upstream Archon v2 as the live architecture and root tree
- Local v1 preserved in archive history
- `ollama`, `lmstudio`, and `litellm` supported as experimental direct-assistant providers
- `claude` and `codex` preserved as first-class native assistants and the only valid workflow providers
- No bundled Ollama or LiteLLM runtime service in this repository by default
- No active v1 embeddings, knowledge-base, or task-management RAG subsystem

## Planning Inputs and Decisions

### Repositories Compared

- Local repository: `https://github.com/LeonAI-DO-YLCS/Archon`
- Upstream authoritative repository: `https://github.com/coleam00/Archon`
- Upstream active base selected for merge target: `v0.3.2`
- Upstream historical reference used to compare local customizations: `archive/v1-task-management-rag`

### Confirmed Decisions

- Target shape: migrate to upstream v2, not preserve local v1 as the active base
- Preservation scope: preserve product-relevant local changes only
- Upstream base: `v0.3.2`, not `dev`
- v1 data/runtime continuity: archive only
- LM Studio: preserve as an active provider in v2
- Ollama: preserve as an active provider in v2, but not as a bundled Docker service
- LiteLLM: add to v2 as a direct-assistant gateway provider
- Embeddings and RAG: archive v1 behavior, do not port into active v2
- Workflow execution: remain limited to Claude and Codex

### Why This Is Not a Direct Merge

The local repo and upstream v2 differ at the product and architecture level:

- Local v1 uses Python backend plus `archon-ui-main`
- Upstream v2 uses a Bun and TypeScript monorepo with `packages/*`
- The shared file overlap between local and upstream v2 is mostly root metadata and infra files, not application code
- Upstream v2 does not contain an active equivalent of the v1 embeddings and RAG subsystem

Because of that, a direct git merge or mixed-tree reconciliation would create unnecessary conflicts and a fragile result. The correct strategy is base replacement plus targeted feature carryover.

## Repository Findings

### Local Repository State

- Current local branch during planning: `master`
- Remote configured: `origin https://github.com/LeonAI-DO-YLCS/Archon`
- Existing untracked local file observed during planning: `.specify/init-options.json`

### Upstream v2 Findings

Upstream `v0.3.2` is the selected active base because it is a stable tagged release and represents the current supported product line.

Relevant v2 characteristics:

- Bun and TypeScript monorepo architecture
- Active root uses `packages/*`
- Assistant and config systems currently centered on `claude` and `codex`
- Workflow system is tightly coupled to Claude and Codex execution models
- Current config types, safe-config schemas, and assistant factory logic only permit `claude` and `codex`
- Conversation continuity depends on `assistant_session_id` and assistant-client runtime behavior, not on automatic replay of stored chat history

### Local-v1 Versus Upstream-v1 Findings

The local repository is effectively upstream v1 plus a small set of meaningful customizations. The planning review identified the following functional local deltas as the only product-level items worth carrying forward:

- LM Studio provider support in backend routes and provider handling
- LM Studio settings and model-discovery UI in the frontend
- Dedicated Ollama service wiring in local Docker Compose

The local Ollama change is infrastructure-level, not a unique provider feature, because upstream v1 already had product-level Ollama support. It will not be carried forward as bundled runtime infrastructure.

LiteLLM does not exist in the current local codebase but has been explicitly added to the target scope for the merged v2 product.

### LiteLLM Research Result

LiteLLM should be integrated through its OpenAI-compatible gateway interface, not as a replacement for native Claude or Codex runtime integrations.

Key implications:

- LiteLLM is a direct-assistant provider over HTTP
- It needs configurable base URL support
- It may require bearer-key authentication
- It supports model discovery through its proxy interface
- It should not be treated as a workflow executor in this repository
- It is not session-compatible with the current Claude and Codex runtime model without an explicit conversation replay strategy

Reference sources used during planning:

- `https://docs.litellm.ai/`
- `https://github.com/BerriAI/litellm`

## Target Architecture

### Active Architecture

The active repository after the upgrade must be upstream Archon v2, with its root tree, package layout, build tooling, and application architecture preserved as the authoritative base.

The following v1 runtime paths must not remain active as first-class product roots:

- `python/`
- `archon-ui-main/`
- `migration/`
- other v1-specific runtime layouts that conflict with the v2 monorepo model

These assets may exist only in archive history or explicitly archived documentation.

### Provider Model

The merged active product must expose two assistant classes:

1. Native coding assistants
2. Experimental direct-assistant providers

Native coding assistants:

- `claude`
- `codex`

Experimental direct-assistant providers:

- `ollama`
- `lmstudio`
- `litellm`

The distinction is mandatory:

- Native assistants may remain integrated with workflow execution, agent runtime behavior, and any codebase-aware tooling already supported by v2
- Experimental direct-assistant providers are limited to direct assistant and chat usage only
- Experimental providers must not be represented as full workflow-compatible coding runtimes
- Experimental providers must implement only the minimum assistant contract required for direct chat:
  - text generation
  - terminal result emission
  - optional streaming token output
- Experimental providers are not required to emit Claude or Codex style tool events, reasoning events, command-execution events, or provider-native resumable session IDs

### Conversation State Strategy

Archon v2 currently relies on provider session resumption for multi-turn continuity. That behavior is valid for Claude and Codex, but it cannot be assumed for `ollama`, `lmstudio`, or `litellm`.

The merged implementation must therefore use two continuity models:

- Native assistants:
  - continue using `assistant_session_id`
  - continue using provider-native resume behavior
- Experimental direct-assistant providers:
  - do not rely on `assistant_session_id`
  - use transcript replay from persisted conversation messages for continuity

The transcript replay strategy is mandatory and must be implemented as follows:

1. Extend the assistant request path so experimental providers can receive prior conversation history explicitly.
2. Load prior persisted messages for the current conversation from `remote_agent_messages`.
3. Replay only `user` and `assistant` messages in chronological order.
4. Exclude tool event records and workflow event records from replay.
5. Append the current request as the final user turn.
6. Persist `assistant_session_id` as `null` for experimental providers unless a later provider-specific implementation proves stable resume semantics.

The replay window must be deterministic:

- replay the last 50 persisted user and assistant messages
- if a token or payload guard is added during implementation, truncate oldest messages first

This is the approved continuity strategy for `ollama`, `lmstudio`, and `litellm`. No other continuity behavior should be inferred.

### Assistant Selection Strategy

In current v2, project-scoped conversations inherit `ai_assistant_type` from the codebase record. The merged implementation must preserve that model and extend it explicitly.

The assistant selection rules must be:

1. Global default assistant is used only when a conversation is created without a codebase.
2. Codebase-scoped conversations inherit `ai_assistant_type` from the codebase record.
3. Codebase records must support `claude | codex | ollama | lmstudio | litellm`.
4. Codebase registration may keep auto-detecting only `.claude` and `.codex`.
5. Repositories without `.claude` or `.codex` markers default to the configured global assistant.
6. Users must be able to change a codebase assistant after registration through the API and web settings.

Per-conversation assistant override is explicitly out of scope for this merge. The first implementation must use global default plus codebase-level selection only.

### Explicit Non-Goals

The merged v2 product will not include:

- Active v1 embeddings subsystem
- Active v1 knowledge-base or semantic-search subsystem
- Active v1 task-management RAG stack
- Bundled Ollama service in `docker-compose.yml`
- Bundled LiteLLM proxy service in `docker-compose.yml`
- Full workflow execution support for Ollama, LM Studio, or LiteLLM
- Tool-execution parity between experimental providers and Claude/Codex
- Provider-native session resume support for experimental providers unless implemented and validated separately

## Conflict Resolution Strategy

### Conflict 1: Unrelated History and Product Divergence

Resolution:

- Do not use `git merge --allow-unrelated-histories`
- Do not attempt a file-by-file mixed-tree merge
- Create an archive branch or tag from the current local repository
- Create the integration branch from upstream `v0.3.2`

### Conflict 2: Root Tree and Architecture Mismatch

Resolution:

- Upstream v2 becomes the entire active root tree
- Local v1 tree is archived, not kept live beside v2
- All root docs, metadata, package management, workspace definitions, and active infra files follow upstream v2 unless explicitly changed later by approved implementation work

### Conflict 3: Claude and Codex Boundaries

Resolution:

- Preserve Claude and Codex as native assistants
- Preserve their existing workflow role without extending workflow support to the new providers
- Any schema or UI path that chooses a workflow provider must reject `ollama`, `lmstudio`, and `litellm`

### Conflict 4: Provider Expansion

Resolution:

- Extend assistant-facing configuration and client layers to include `ollama`, `lmstudio`, and `litellm`
- Use a shared OpenAI-compatible transport abstraction for these three providers
- Keep Claude and Codex on their native client implementations
- Add a transcript replay path for experimental providers instead of assuming native session resume support

### Conflict 4A: Assistant Selection in Project-Scoped Chat

Resolution:

- Extend codebase assistant selection to support the three experimental providers
- Keep codebase-level assistant inheritance as the authoritative project-scoped selection mechanism
- Do not introduce per-conversation assistant override in this merge

### Conflict 5: Local Docker and Infra Changes

Resolution:

- Do not port the local dedicated Ollama Compose service
- Do not add a bundled LiteLLM Compose service
- Provider configuration must target externally running services by URL
- Future repo-local deployment support for LiteLLM or Ollama would require a separate proposal

### Conflict 6: Embeddings and RAG

Resolution:

- Do not port v1 embedding providers, contextual embedding logic, or knowledge APIs into v2
- Do not attempt data or schema continuity for the v1 RAG product line
- Preserve those capabilities only in archive history and migration notes

## Required Public Interface Changes

### Assistant Type Expansion

Where the product currently accepts assistant type selection for direct assistant or chat usage, expand the supported set from:

- `claude | codex`

to:

- `claude | codex | ollama | lmstudio | litellm`

This expansion applies to:

- direct assistant selection surfaces
- codebase `ai_assistant_type`
- conversation creation paths that inherit from codebase or global default

It does not apply to workflow provider fields.

### Codebase Assistant Editing

The implementation must extend codebase update surfaces so a registered project can switch assistants after registration.

Required API change:

- `PATCH /api/codebases/:id`

Required request body support:

- `allowEnvKeys?: boolean`
- `aiAssistantType?: 'claude' | 'codex' | 'ollama' | 'lmstudio' | 'litellm'`

Required behavior:

- existing `allowEnvKeys` behavior remains unchanged
- `aiAssistantType` updates the codebase record
- future conversations created for that codebase inherit the updated assistant type
- existing conversations are not retroactively migrated

### Workflow Provider Restriction

All workflow-definition, workflow-validation, and workflow-execution surfaces must continue to accept only:

- `claude | codex`

If a user or API client attempts to use:

- `ollama`
- `lmstudio`
- `litellm`

in any workflow provider field, the system must fail fast with a clear validation error.

### Assistant Configuration Model

The active config model must support:

- `assistants.ollama`
- `assistants.lmstudio`
- `assistants.litellm`

Required fields:

- `enabled: boolean`
- `baseUrl: string`
- `defaultModel?: string`

Expected handling:

- `baseUrl` points to an externally running service
- `defaultModel` is optional but should be used when set
- no provider secret may be stored in normal non-secret Archon config YAML

### Provider Credential Resolution

LiteLLM authentication must not be modeled as a normal assistant config field because current Archon config is a non-secret preference store.

The merged implementation must resolve LiteLLM credentials in this order:

1. Codebase environment variable `LITELLM_API_KEY`
2. Process environment variable `LITELLM_API_KEY`
3. No authentication header

Approved implementation rules:

- `assistants.litellm` stores only non-secret fields such as `enabled`, `baseUrl`, and `defaultModel`
- the web settings UI must not expose a global plain-text LiteLLM API key entry backed by YAML config
- if UI support for LiteLLM credentials is later desired, it must use the existing codebase env var path or a new dedicated secret store, not `~/.archon/config.yaml`
- LiteLLM requests should send `Authorization: Bearer <key>` only when a resolved key exists

### Provider Validation and Model Discovery APIs

The server must expose one consistent route family for all experimental providers:

- `POST /api/providers/ollama/validate`
- `GET /api/providers/ollama/models`
- `POST /api/providers/lmstudio/validate`
- `GET /api/providers/lmstudio/models`
- `POST /api/providers/litellm/validate`
- `GET /api/providers/litellm/models`

Expected behavior:

- `validate` confirms service reachability and request compatibility
- `models` returns available model identifiers suitable for UI selection
- LiteLLM validation must support both open and bearer-protected gateway deployments

### Safe Config Response Rules

Browser-safe config responses must:

- include non-secret settings for `ollama`, `lmstudio`, and `litellm`
- exclude any LiteLLM API key entirely
- remain backwards compatible only within the new v2 implementation scope, not with the archived v1 product line

## Implementation Plan

### Phase 1: Archive and Baseline Setup

1. Create an archive branch or tag from the current local repository state.
2. Record the archive reference in migration documentation.
3. Create a new integration branch from upstream `v0.3.2`.
4. Confirm the integration branch contains the untouched upstream v2 tree.

Deliverable:

- a stable archived v1 reference
- a clean upstream-v2-based integration branch

### Phase 2: Upstream Baseline Verification

Before any feature carryover begins, verify the untouched v2 baseline:

- dependency install passes
- type-check passes
- lint passes
- test suite passes

This baseline verification is mandatory. Provider work must not begin on top of an already broken baseline.

Deliverable:

- documented baseline validation result for upstream `v0.3.2`

### Phase 3: Shared OpenAI-Compatible Provider Layer

Implement a shared transport and client abstraction for:

- `ollama`
- `lmstudio`
- `litellm`

The abstraction must support:

- request dispatch to OpenAI-compatible HTTP endpoints
- streaming chat response handling
- model listing
- validation checks
- provider-specific header handling
- conversion into the minimum Archon `IAssistantClient` chunk contract for direct chat

Provider-specific requirements:

- Ollama: external URL only, no auth assumed by default
- LM Studio: external URL only, no auth assumed by default
- LiteLLM: external URL plus optional bearer-key auth

Deliverable:

- reusable provider client layer for the three experimental providers

### Phase 4: Conversation Continuity for Experimental Providers

Implement transcript replay for `ollama`, `lmstudio`, and `litellm`.

Required changes:

- extend the assistant request path so experimental providers can receive prior chat history
- load persisted `user` and `assistant` messages for the current conversation
- replay the last 50 messages in chronological order
- ignore `assistant_session_id` for experimental providers
- keep `assistant_session_id` behavior unchanged for Claude and Codex

Deliverable:

- stable multi-turn continuity for experimental providers without native provider session resume

### Phase 5: Config and Schema Expansion

Extend the v2 configuration system across:

- core config types
- config loaders and mergers
- server-side schemas
- safe config serialization
- update endpoints

Required behavior:

- global and repo-level config can store assistant defaults for the new providers
- safe config responses expose only non-secret fields
- no LiteLLM secret is written to normal config YAML

Deliverable:

- full configuration support for experimental providers

### Phase 6: Assistant Selection and Data Model Updates

Extend the project-assistant model across:

- codebase update API
- codebase persistence layer
- conversation creation inheritance
- web settings for registered projects

Required behavior:

- codebases can store `claude | codex | ollama | lmstudio | litellm`
- newly created conversations inherit the codebase assistant type
- existing codebase registration auto-detection stays limited to `.claude` and `.codex`
- repos without markers fall back to the configured global assistant

Deliverable:

- explicit assistant selection for project-scoped chat

### Phase 7: Server API Integration

Add server routes for:

- provider validation
- provider model discovery

Behavior requirements:

- return clear error messages on unreachable service, invalid endpoint behavior, or invalid credentials
- preserve fail-fast behavior for invalid configuration or unavailable required dependencies
- return model lists in a format the web settings page can consume directly

Deliverable:

- provider admin APIs for Ollama, LM Studio, and LiteLLM

### Phase 8: Web Settings and Direct Assistant Integration

Extend the v2 web UI so users can:

- select `ollama`, `lmstudio`, or `litellm` as the active direct assistant
- set base URL for each provider
- validate provider connectivity
- fetch and select available models
- change the assistant type for a registered codebase

Behavior requirements:

- settings UI must make the native versus experimental distinction clear
- workflow-related UIs must not offer experimental providers where workflow execution is expected
- LiteLLM credentials are not stored in normal assistant settings
- if credential help text is shown, it must direct the user to codebase env vars or process env configuration

Deliverable:

- complete user-facing configuration and selection flow for the three experimental providers

### Phase 9: Workflow Guardrails

Add enforcement at every workflow boundary so that:

- workflow definitions reject `ollama`, `lmstudio`, and `litellm`
- workflow execution cannot start with any of those providers
- UI forms and API schemas fail early with clear, deterministic errors

Deliverable:

- guaranteed separation between native workflow assistants and experimental direct-assistant providers

### Phase 10: Migration Documentation

Add internal migration documentation that records:

- why v1 was archived
- why upstream v2 became the active base
- which local capabilities were retained
- which local capabilities were intentionally dropped
- why embeddings and RAG were not migrated
- why bundled Ollama and LiteLLM deployment was not included

Deliverable:

- maintainable migration context for future engineers

## Testing and Validation Plan

### Baseline Validation

The untouched upstream `v0.3.2` integration branch must pass:

- install
- type-check
- lint
- tests

### Configuration Tests

Verify:

- config types accept `assistants.ollama`, `assistants.lmstudio`, `assistants.litellm`
- safe-config responses expose non-secret fields only
- LiteLLM API keys are never written into normal config YAML
- default assistant selection accepts the three experimental providers only where direct assistant selection is intended

### Assistant Selection Tests

Verify:

- codebase records can store `ollama`, `lmstudio`, and `litellm`
- `PATCH /api/codebases/:id` updates `ai_assistant_type`
- new codebase-scoped conversations inherit the updated assistant type
- registration auto-detection still prefers `.claude` and `.codex`
- repos without assistant marker folders fall back to the configured global default

### Provider API Tests

Verify for each provider:

- successful validation against a reachable compatible endpoint
- clear failure for unreachable host
- clear failure for incompatible response shape
- successful model discovery
- clear failure when model discovery is unavailable

Additional LiteLLM cases:

- open proxy without auth succeeds
- bearer-protected proxy with valid key succeeds
- bearer-protected proxy with invalid key fails clearly

### Conversation Continuity Tests

Verify:

- experimental providers receive replayed prior messages in correct chronological order
- only persisted `user` and `assistant` messages are replayed
- tool events are not replayed as chat history
- experimental providers work across multiple turns without provider-native session resume
- Claude and Codex continue to use `assistant_session_id` unchanged

### Direct Assistant Runtime Tests

Verify:

- direct assistant conversations can run with `ollama`
- direct assistant conversations can run with `lmstudio`
- direct assistant conversations can run with `litellm`
- streaming responses behave correctly for all three through the shared transport layer
- switching among native and experimental assistants does not corrupt conversation state
- experimental providers work as text-first assistants even without tool-call event parity

### Workflow Guardrail Tests

Verify:

- workflow schema rejects `ollama`
- workflow schema rejects `lmstudio`
- workflow schema rejects `litellm`
- execution paths cannot bypass schema validation and start unsupported workflows anyway
- user-facing workflow validation messages are explicit and actionable

### Regression Tests

Verify:

- Claude workflow execution still works
- Codex workflow execution still works
- existing v2 assistant selection behavior for Claude and Codex remains intact
- active v2 packages do not import archived v1 RAG or embeddings code
- no active infra path assumes bundled Ollama or LiteLLM runtime containers

## Acceptance Criteria

The merge is complete only when all of the following are true:

- upstream Archon `v0.3.2` is the active repository base
- current local v1 is preserved in archive history
- Claude and Codex remain the only supported workflow providers
- Ollama, LM Studio, and LiteLLM are selectable as direct assistants
- project-scoped chat can select those assistants through codebase configuration
- all three experimental providers support validation and model discovery
- LiteLLM supports optional API-key authentication via codebase env vars or process env
- experimental providers maintain multi-turn continuity through transcript replay
- workflows reject experimental providers clearly and consistently
- embeddings and RAG are absent from the active v2 runtime
- no bundled Ollama or LiteLLM service exists in the active default repo deployment path
- test coverage confirms no regression in existing Claude and Codex behavior

## Risks and Mitigations

### Risk: Provider Expansion Pollutes Workflow Logic

Mitigation:

- keep assistant selection and workflow provider validation as separate concerns
- enforce restrictions in config schemas, workflow schemas, UI, and runtime

### Risk: Shared Transport Is Too Generic

Mitigation:

- use the shared transport only for `ollama`, `lmstudio`, and `litellm`
- keep Claude and Codex native implementations untouched

### Risk: Experimental Providers Lose Chat Context

Mitigation:

- implement transcript replay explicitly for experimental providers
- keep provider-native session resumption limited to Claude and Codex

### Risk: Assistant Selection Becomes Ambiguous

Mitigation:

- keep codebase `ai_assistant_type` as the authoritative selector for project-scoped chat
- do not add per-conversation assistant override in this merge

### Risk: Secret Leakage Through Safe Config

Mitigation:

- keep LiteLLM API keys out of normal config YAML
- exclude LiteLLM API keys from all safe-config responses and generated client contracts

### Risk: Hidden Dependency on v1 RAG Code

Mitigation:

- keep v1 code archived only
- add regression checks ensuring active v2 packages do not import or rely on v1 subsystems

### Risk: Future Contributors Reintroduce Bundled Provider Infrastructure Implicitly

Mitigation:

- document bundled provider deployment as intentionally excluded from this merge
- require a separate proposal for repo-managed Ollama or LiteLLM deployment support

## Implementation Defaults

Unless a later approved change supersedes this document, the implementation must assume:

- upstream base is `coleam00/Archon` tag `v0.3.2`
- active product architecture is upstream v2
- local v1 is archived, not actively merged
- `ollama`, `lmstudio`, and `litellm` are experimental direct-assistant providers only
- `claude` and `codex` remain the only workflow executors
- project-scoped assistant selection is controlled by codebase `ai_assistant_type`
- experimental-provider continuity is implemented with transcript replay, not provider-native resume
- embeddings and RAG remain archived
- LiteLLM uses an external gateway endpoint with optional bearer-key auth resolved from codebase env vars or process env
- Ollama and LiteLLM are not deployed by default from this repository

## Reference Summary

Planning conclusions were based on:

- local repository inspection
- upstream Archon v2 inspection at `v0.3.2`
- upstream Archon v1 historical comparison at `archive/v1-task-management-rag`
- local-versus-upstream diff review to isolate meaningful customizations
- official LiteLLM documentation and repository review

This document intentionally supersedes the conversational planning thread as the implementation baseline.
