# Archon V1-to-V2 Execution Tasks

## Purpose

This document turns the approved merge plan into a ground-up execution sequence. It is ordered by dependency and risk, so implementation starts with repository control and upstream baseline validation, then moves through the minimum runtime substrate needed to safely add `ollama`, `lmstudio`, and `litellm` as experimental direct-assistant providers in Archon v2.

Primary source plan:

- [archon-v1-to-v2-merge-plan.md](/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon/docs/planning/archon-v1-to-v2-merge-plan.md)

## Execution Rules

- Do not start provider work until the untouched upstream `v0.3.2` baseline is verified.
- Do not implement embeddings, RAG, or v1 task-management carryover.
- Do not add bundled Ollama or LiteLLM runtime services in repo infra.
- Do not allow `ollama`, `lmstudio`, or `litellm` to execute workflows.
- Do not store LiteLLM secrets in normal Archon YAML config.
- Do not introduce per-conversation assistant override in this implementation.

## Phase Overview

1. Phase 0: Repository Control and Archive Safety
2. Phase 1: Upstream V2 Baseline Adoption
3. Phase 2: Experimental Provider Runtime Foundation
4. Phase 3: Conversation Continuity and Assistant Selection
5. Phase 4: Config, Schema, and Credential Wiring
6. Phase 5: Provider API Surface
7. Phase 6: Web UI and Project Settings
8. Phase 7: Workflow Guardrails and Runtime Separation
9. Phase 8: Verification, Regression, and Documentation

## Phase 0: Repository Control and Archive Safety

Goal: preserve the current local v1 state and create a clean place to build the v2-based merge.

Exit criteria:

- local v1 is archived and recoverable
- integration branch is defined
- implementation is blocked from accidentally mutating the legacy baseline

Tasks:

- [ ] E001 Create an archive branch or tag for the current local v1 repository state and record the ref in [archon-v1-to-v2-merge-plan.md](/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon/docs/planning/archon-v1-to-v2-merge-plan.md)
- [ ] E002 Create the dedicated v2 integration branch from upstream `coleam00/Archon` tag `v0.3.2`
- [ ] E003 Capture the exact upstream tag commit and archive ref in a short migration log under `docs/planning/`
- [ ] E004 Verify the local untracked planning artifacts are preserved and will not be overwritten during branch replacement

## Phase 1: Upstream V2 Baseline Adoption

Goal: establish upstream v2 as the active codebase before any local provider behavior is added.

Exit criteria:

- active tree matches upstream `v0.3.2`
- baseline install, type-check, lint, and tests pass or have documented upstream failures
- no v1 runtime tree remains active

Tasks:

- [ ] E005 Replace the active repository tree with the upstream `v0.3.2` root layout
- [ ] E006 Verify the active root contains the expected v2 monorepo structure under `packages/`
- [ ] E007 Run dependency installation for the upstream v2 baseline from repo root
- [ ] E008 Run baseline type-check for upstream v2 and record the result in `docs/planning/`
- [ ] E009 Run baseline lint for upstream v2 and record the result in `docs/planning/`
- [ ] E010 Run the upstream v2 test suite and record the result in `docs/planning/`
- [ ] E011 Remove any active reliance on legacy runtime roots such as `python/`, `archon-ui-main/`, and `migration/`

## Phase 2: Experimental Provider Runtime Foundation

Goal: create the minimum assistant runtime substrate for `ollama`, `lmstudio`, and `litellm` without disturbing native Claude and Codex behavior.

Exit criteria:

- provider clients exist behind a shared OpenAI-compatible transport
- new providers satisfy only the minimum direct-chat assistant contract
- Claude and Codex remain on native client implementations

Critical paths:

- `packages/core/src/clients/`
- `packages/core/src/types/`
- `packages/core/src/clients/factory.ts`

Tasks:

- [ ] E012 Define the minimum supported runtime contract for experimental providers in `packages/core/src/types/`
- [ ] E013 Implement a shared OpenAI-compatible transport for chat streaming, validation, and model listing in `packages/core/src/clients/`
- [ ] E014 Implement `ollama` assistant client in `packages/core/src/clients/`
- [ ] E015 Implement `lmstudio` assistant client in `packages/core/src/clients/`
- [ ] E016 Implement `litellm` assistant client in `packages/core/src/clients/`
- [ ] E017 Extend [factory.ts](/tmp/archon-upstream-sMPHdG/packages/core/src/clients/factory.ts) equivalent in the active branch to register the three experimental clients
- [ ] E018 Keep Claude and Codex native client codepaths unchanged except where type expansion is strictly required
- [ ] E019 Add unit tests for client factory resolution and unsupported assistant-type failures

## Phase 3: Conversation Continuity and Assistant Selection

Goal: make the new providers usable in real multi-turn chat and project-scoped conversations.

Exit criteria:

- experimental providers retain context through transcript replay
- project-scoped chat selects assistants through codebase `ai_assistant_type`
- no per-conversation override logic is introduced

Critical paths:

- `packages/core/src/orchestrator/`
- `packages/core/src/db/messages.ts`
- `packages/core/src/db/conversations.ts`
- `packages/core/src/db/codebases.ts`

Tasks:

- [ ] E020 Extend the assistant request path so experimental providers can receive prior conversation history
- [ ] E021 Implement transcript replay loading from persisted `user` and `assistant` messages in `packages/core/src/db/messages.ts` consumers
- [ ] E022 Enforce the approved replay window of the last 50 persisted `user` and `assistant` messages
- [ ] E023 Ensure tool-event and workflow-event records are excluded from replayed history
- [ ] E024 Keep `assistant_session_id` continuity logic unchanged for Claude and Codex
- [ ] E025 Force experimental providers to operate without provider-native session resume unless a later implementation explicitly adds and validates it
- [ ] E026 Extend codebase persistence so `ai_assistant_type` supports `claude | codex | ollama | lmstudio | litellm`
- [ ] E027 Preserve existing registration auto-detection behavior for `.claude` and `.codex` marker folders only
- [ ] E028 Make repositories without marker folders default to the configured global assistant
- [ ] E029 Add tests covering transcript replay behavior and codebase-driven assistant inheritance

## Phase 4: Config, Schema, and Credential Wiring

Goal: support the three experimental providers in configuration without violating current v2 secret-handling boundaries.

Exit criteria:

- non-secret provider settings are configurable
- LiteLLM secrets are resolved from env paths, not YAML
- safe config responses remain browser-safe

Critical paths:

- `packages/core/src/config/config-types.ts`
- `packages/core/src/config/config-loader.ts`
- `packages/server/src/routes/schemas/config.schemas.ts`

Tasks:

- [ ] E030 Extend global and repo config types to include `assistants.ollama`, `assistants.lmstudio`, and `assistants.litellm`
- [ ] E031 Add non-secret config fields `enabled`, `baseUrl`, and `defaultModel` for the three experimental providers
- [ ] E032 Update config loading and merge behavior so new assistant defaults are supported consistently
- [ ] E033 Update safe-config projection so the three experimental providers are exposed with non-secret fields only
- [ ] E034 Add LiteLLM credential resolution in this order: codebase env var `LITELLM_API_KEY`, process env `LITELLM_API_KEY`, then no auth header
- [ ] E035 Ensure no LiteLLM API key is written to normal Archon config YAML
- [ ] E036 Extend config API schemas and generated client contracts to match the new safe config shape
- [ ] E037 Add tests proving LiteLLM secrets never appear in safe config responses or generated API payloads

## Phase 5: Provider API Surface

Goal: expose operational APIs for validating endpoints and listing models for all experimental providers.

Exit criteria:

- all three providers have validation and model-discovery routes
- error handling is explicit and fail-fast where appropriate
- LiteLLM auth scenarios are covered

Critical paths:

- `packages/server/src/routes/api.ts`
- `packages/server/src/routes/schemas/`

Tasks:

- [ ] E038 Add `POST /api/providers/ollama/validate` in `packages/server/src/routes/api.ts`
- [ ] E039 Add `GET /api/providers/ollama/models` in `packages/server/src/routes/api.ts`
- [ ] E040 Add `POST /api/providers/lmstudio/validate` in `packages/server/src/routes/api.ts`
- [ ] E041 Add `GET /api/providers/lmstudio/models` in `packages/server/src/routes/api.ts`
- [ ] E042 Add `POST /api/providers/litellm/validate` in `packages/server/src/routes/api.ts`
- [ ] E043 Add `GET /api/providers/litellm/models` in `packages/server/src/routes/api.ts`
- [ ] E044 Add or extend route schemas for provider validation and model-list responses in `packages/server/src/routes/schemas/`
- [ ] E045 Add route tests for reachable endpoint, unreachable endpoint, incompatible response, and model-list success cases
- [ ] E046 Add LiteLLM-specific route tests for open proxy, valid bearer key, and invalid bearer key

## Phase 6: Web UI and Project Settings

Goal: make the new providers usable and understandable from the v2 web application without implying workflow parity.

Exit criteria:

- users can configure experimental providers
- users can switch codebase assistant type
- UI clearly distinguishes native workflow assistants from experimental direct assistants

Critical paths:

- `packages/web/src/routes/SettingsPage.tsx`
- `packages/web/src/lib/api.ts`
- generated API types consumed by web settings

Tasks:

- [ ] E047 Extend settings data loading in `packages/web/src/lib/api.ts` to support the expanded safe config and codebase update payloads
- [ ] E048 Add UI controls for `ollama`, `lmstudio`, and `litellm` non-secret settings in `packages/web/src/routes/SettingsPage.tsx`
- [ ] E049 Add provider validation actions and model-discovery actions in the settings UI
- [ ] E050 Add project-level assistant selection UI for registered codebases
- [ ] E051 Ensure the UI communicates that `ollama`, `lmstudio`, and `litellm` are experimental direct assistants, not workflow executors
- [ ] E052 Ensure the UI does not present a normal YAML-backed LiteLLM API-key field
- [ ] E053 If LiteLLM auth help text is shown, direct users to codebase env vars or process env configuration only
- [ ] E054 Add UI tests covering provider settings, model loading, codebase assistant updates, and error presentation

## Phase 7: Workflow Guardrails and Runtime Separation

Goal: prevent the new providers from leaking into the workflow engine or being mistaken for Claude/Codex equivalents.

Exit criteria:

- workflow schemas and validators reject experimental providers everywhere
- workflow runtime cannot start with those providers even if upstream layers are bypassed
- native assistant behavior is preserved

Critical paths:

- `packages/workflows/src/schemas/`
- `packages/workflows/src/validator.ts`
- `packages/workflows/src/dag-executor.ts`
- `packages/workflows/src/executor.ts`

Tasks:

- [ ] E055 Preserve workflow provider schema restriction to `claude | codex`
- [ ] E056 Add explicit validation errors for `ollama`, `lmstudio`, and `litellm` in workflow-facing validation paths
- [ ] E057 Ensure execution paths fail early if unsupported providers somehow bypass schema validation
- [ ] E058 Ensure any workflow-related UI only surfaces `claude` and `codex` where provider choice is relevant
- [ ] E059 Add workflow validator and executor tests proving unsupported experimental providers cannot run workflows

## Phase 8: Verification, Regression, and Documentation

Goal: prove the merged result meets the plan and document the migration for future work.

Exit criteria:

- all acceptance criteria from the merge plan are satisfied
- regression suite covers native and experimental assistant paths
- migration context is documented

Tasks:

- [ ] E060 Run the full regression suite for Claude and Codex after experimental provider integration
- [ ] E061 Run direct-chat integration checks for `ollama`, `lmstudio`, and `litellm`
- [ ] E062 Verify multi-turn continuity for experimental providers through transcript replay
- [ ] E063 Verify no active package imports or depends on archived v1 embeddings or RAG code
- [ ] E064 Verify no default repo deployment path assumes bundled Ollama or LiteLLM services
- [ ] E065 Update migration documentation to record retained capabilities, dropped capabilities, and rationale
- [ ] E066 Add a concise implementation log under `docs/planning/` summarizing completed phases, test results, and any deviations from plan

## Recommended Implementation Order

This is the critical path and should not be reordered without a clear reason:

1. `E001-E011` to preserve v1 and establish a verified v2 base
2. `E012-E019` to create the runtime substrate for experimental providers
3. `E020-E029` to make those providers usable in multi-turn and project-scoped chat
4. `E030-E046` to wire config, credentials, and operational APIs
5. `E047-E059` to expose settings and lock down workflow boundaries
6. `E060-E066` to verify behavior and finalize migration documentation

## MVP Cut

If work must be split into the smallest safe delivery slices, use this sequence:

1. MVP-A: `E001-E011`
2. MVP-B: `E012-E019` and `E020-E025`
3. MVP-C: `E026-E037`
4. MVP-D: `E038-E054`
5. MVP-E: `E055-E066`

The smallest user-meaningful delivery is not provider UI alone. It begins only once transcript replay, codebase assistant selection, config wiring, and validation APIs are all in place.

## Completion Standard

This task list is complete only when the acceptance criteria in [archon-v1-to-v2-merge-plan.md](/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon/docs/planning/archon-v1-to-v2-merge-plan.md) are met with evidence from implementation and tests.
