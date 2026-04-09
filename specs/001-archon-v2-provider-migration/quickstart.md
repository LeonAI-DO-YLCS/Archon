# Quickstart: Archon V2 Migration and Experimental Provider Support

## Purpose

Provide the smallest safe execution path for implementing and verifying this feature after planning.

## Inputs

- Feature spec: [/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon/specs/001-archon-v2-provider-migration/spec.md](/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon/specs/001-archon-v2-provider-migration/spec.md)
- Implementation plan: [/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon/specs/001-archon-v2-provider-migration/plan.md](/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon/specs/001-archon-v2-provider-migration/plan.md)
- Source planning docs:
  - [/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon/docs/planning/archon-v1-to-v2-merge-plan.md](/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon/docs/planning/archon-v1-to-v2-merge-plan.md)
  - [/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon/docs/planning/archon-v1-to-v2-execution-tasks.md](/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon/docs/planning/archon-v1-to-v2-execution-tasks.md)

## Phase 0: Preserve the Current Local Baseline

1. Create and record an archive ref for the current local v1-derived repository state.
2. Record the archive ref and the selected upstream `v0.3.2` ref in a migration log under `docs/planning/`.
3. Confirm local planning artifacts remain present and will survive the root replacement.

## Phase 1: Adopt and Verify the Upstream V2 Baseline

1. Replace the active repository tree with the upstream `v0.3.2` layout.
2. Confirm the active root now exposes the Bun workspace monorepo under `packages/*`.
3. Run the untouched-baseline validation suite:

```bash
bun install
bun run type-check
bun run lint --max-warnings 0
bun run format:check
bun run test
```

4. Record any upstream baseline failures before making provider changes.

## Phase 2: Implement Experimental Provider Runtime Support

1. Extend `packages/core/src/types/` and `packages/core/src/clients/` for `ollama`, `lmstudio`, and `litellm`.
2. Register the new experimental clients in the assistant client factory.
3. Add transcript-based continuity support in `packages/core/src/orchestrator/` and the relevant DB consumers.
4. Extend codebase assistant selection and conversation inheritance in `packages/core/src/db/`.

## Phase 3: Wire Config, APIs, and Web UI

1. Extend config types, config loading, and safe config projection for the three experimental providers.
2. Add provider validation and model-discovery routes in `packages/server/src/routes/`.
3. Add settings UI and project-level assistant selection UI in `packages/web/src/`.
4. Keep LiteLLM credentials environment-resolved only.

## Phase 4: Lock Down Workflow Boundaries

1. Keep workflow provider schemas limited to `claude` and `codex`.
2. Add explicit validator and runtime failures for `ollama`, `lmstudio`, and `litellm`.
3. Confirm the web app never presents experimental providers as workflow-capable choices.

## Phase 5: Verify the Full Feature

Run:

```bash
bun run type-check
bun run lint --max-warnings 0
bun run format:check
bun run test
```

Then verify:

1. Claude and Codex behavior remains intact for direct chat and workflows.
2. Experimental providers validate successfully when correctly configured.
3. Experimental providers retain multi-turn chat context through carried-forward conversation history.
4. Workflow execution rejects experimental providers before any workflow run begins.
5. Browser-visible config surfaces do not expose LiteLLM credentials.
