# Research: Archon V2 Migration and Experimental Provider Support

## Decision 1: Replace the active root with upstream `v0.3.2` instead of merging trees

- **Decision**: Use upstream Archon `v0.3.2` as the new active repository root and preserve the current local v1 derivative as an archive reference.
- **Rationale**: The planning docs establish that the local repository is a Python plus `archon-ui-main` product line, while upstream v2 is a Bun and TypeScript monorepo under `packages/*`. A mixed-tree merge would preserve incompatible runtime layouts and produce unnecessary conflicts.
- **Alternatives considered**:
  - Direct git merge of unrelated histories: rejected because the overlap is mostly metadata and infrastructure files, not application code.
  - Keeping both v1 and v2 as active roots in the same repository: rejected because it would blur ownership, increase runtime ambiguity, and violate the target architecture decision.

## Decision 2: Treat `packages/*` as the active implementation surface

- **Decision**: Center implementation on the upstream v2 monorepo packages, primarily `packages/core`, `packages/server`, `packages/web`, and `packages/workflows`.
- **Rationale**: The upstream `v0.3.2` checkout at `/tmp/archon-upstream-sMPHdG` verifies the real package layout, Bun workspace scripts, and the current assistant/conversation/configuration codepaths that must be extended.
- **Alternatives considered**:
  - Extending the current `python/` and `archon-ui-main/` roots: rejected because those roots are explicitly out of active scope after the migration.
  - Designing only from prose docs: rejected because the plan needs source-backed package names, scripts, and test surfaces.

## Decision 3: Keep Claude and Codex native, add Ollama, LM Studio, and LiteLLM as experimental direct assistants

- **Decision**: Preserve `claude` and `codex` as the only native workflow-capable assistants, and add `ollama`, `lmstudio`, and `litellm` only for direct assistant and project-scoped conversation usage.
- **Rationale**: Both the feature spec and migration plan require clear separation between workflow-capable native assistants and experimental providers. The upstream code already routes assistant behavior through codebase and conversation assistant types, which can be extended without redefining the workflow engine.
- **Alternatives considered**:
  - Giving experimental providers full workflow support: rejected because it expands scope and weakens runtime guarantees that are currently tied to Claude and Codex.
  - Treating the new providers as temporary aliases of existing assistants: rejected because it would hide meaningful behavioral differences and create invalid resume assumptions.

## Decision 4: Build a shared OpenAI-compatible transport for the three experimental providers

- **Decision**: Implement a shared direct-assistant transport for Ollama, LM Studio, and LiteLLM, with provider-specific configuration and authentication behavior layered on top.
- **Rationale**: The planning docs already identify the three providers as HTTP-accessed direct assistants, and the upstream v2 target keeps assistant clients in `packages/core/src/clients/`. A shared transport avoids duplicating request, streaming, validation, and model-list behavior.
- **Alternatives considered**:
  - Separate fully custom clients for all three providers: rejected because it adds maintenance cost without providing feature value.
  - Forcing the providers through the native Claude or Codex client contracts unchanged: rejected because their session and event behavior differs from the native assistants.

## Decision 5: Use transcript replay for experimental-provider continuity

- **Decision**: Maintain multi-turn continuity for experimental providers by replaying recent persisted `user` and `assistant` messages in chronological order, excluding tool and workflow event records.
- **Rationale**: The upstream v2 plan and codebase show that native continuity currently depends on `assistant_session_id`, while the migration plan explicitly rejects assuming the same capability for Ollama, LM Studio, and LiteLLM. The `remote_agent_messages` storage and conversation/session records already exist and provide the right persistence surface.
- **Alternatives considered**:
  - Relying on provider-native session resume for all assistants: rejected because the new providers do not have verified parity with Claude or Codex.
  - Keeping experimental providers single-turn only: rejected because it would fail the core user scenario for coherent multi-turn chat.

## Decision 6: Extend assistant selection at the codebase level, not per conversation

- **Decision**: Expand `ai_assistant_type` support at the codebase level and keep new conversation creation inheriting the current codebase assistant type or global default.
- **Rationale**: The upstream v2 `codebases.ts` and `conversations.ts` code already model assistant inheritance through codebase records and conversation creation. The approved scope explicitly excludes per-conversation assistant override.
- **Alternatives considered**:
  - Adding per-conversation assistant override during the migration: rejected because it increases design and validation scope with no requirement support.
  - Hard-coding provider selection globally: rejected because project-scoped assistant choice is an explicit requirement.

## Decision 7: Keep LiteLLM secrets out of normal config and resolve them from environment sources

- **Decision**: Store only non-secret LiteLLM settings in normal config and resolve credentials from approved environment variable sources.
- **Rationale**: The planning docs explicitly prohibit storing LiteLLM secrets in the normal Archon YAML config. This also matches the need for browser-safe config responses that never expose those secrets.
- **Alternatives considered**:
  - Adding a plain-text LiteLLM API key to the normal config model: rejected because it violates the secret-handling boundary.
  - Deferring LiteLLM auth support entirely: rejected because authenticated LiteLLM deployments are part of the approved scope.

## Decision 8: Require external provider runtimes by URL

- **Decision**: Require Ollama, LM Studio, and LiteLLM to be externally reachable services configured by URL, with no default bundled runtime services added to repository deployment paths.
- **Rationale**: The merge plan explicitly excludes bundled Ollama and LiteLLM services. This keeps the upgraded repository aligned with the upstream v2 baseline and avoids infrastructure carryover from the old v1 derivative.
- **Alternatives considered**:
  - Carrying over the dedicated Ollama service from the local v1 compose setup: rejected because it is an infrastructure customization, not a required product capability.
  - Adding a bundled LiteLLM proxy to the repository: rejected because it expands deployment scope beyond the approved migration.

## Decision 9: Enforce workflow guardrails at schema and runtime layers

- **Decision**: Keep workflow-facing provider enums limited to `claude | codex`, and add explicit runtime failures for unsupported experimental providers if upstream layers are bypassed.
- **Rationale**: Schema-only protection is insufficient if invalid data reaches runtime execution paths. The planning docs explicitly call for both validation-layer and execution-layer protection.
- **Alternatives considered**:
  - Guarding only in the UI: rejected because API clients and internal callers could still bypass the restriction.
  - Allowing experimental providers but disabling some workflow nodes: rejected because it creates partial support ambiguity instead of a clear boundary.

## Decision 10: Validate the untouched v2 baseline before feature carryover

- **Decision**: Baseline validation is a mandatory phase that happens after active-tree replacement and before provider work starts.
- **Rationale**: The target repository already has Bun workspace commands for type-checking, linting, formatting, and tests. Validating the untouched baseline first isolates upstream breakage from migration-induced regressions.
- **Alternatives considered**:
  - Starting provider work immediately after replacing the tree: rejected because it removes the clean comparison point for debugging failures.
  - Validating only the touched packages: rejected because root scripts and cross-package integration are part of the supported product baseline.
