# Implementation Plan: Archon V2 Migration and Experimental Provider Support

**Branch**: `001-archon-v2-provider-migration` | **Date**: 2026-04-09 | **Spec**: [/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon/specs/001-archon-v2-provider-migration/spec.md](/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon/specs/001-archon-v2-provider-migration/spec.md)
**Input**: Feature specification from `/specs/001-archon-v2-provider-migration/spec.md`

**Note**: This plan converts the approved migration spec plus `docs/planning/archon-v1-to-v2-merge-plan.md` and `docs/planning/archon-v1-to-v2-execution-tasks.md` into concrete design artifacts for implementation.

## Summary

Replace the active local Archon v1 derivative with the upstream Archon v2 `v0.3.2` baseline, preserve the current v1 repository state as an archive, keep Claude and Codex as the only workflow-capable native assistants, and add Ollama, LM Studio, and LiteLLM as experimental direct-assistant providers. The implementation centers on adopting the Bun and TypeScript monorepo under `packages/*`, extending assistant/config/codebase/conversation flows in `packages/core`, exposing provider administration routes in `packages/server`, surfacing configuration and project-level assistant selection in `packages/web`, and enforcing workflow-provider guardrails in `packages/workflows`.

## Technical Context

**Language/Version**: Bun 1.3 workspace runtime with TypeScript 5.3 across the target v2 monorepo; legacy migration inputs remain Python 3.12 and Vite/React only until the active tree is replaced  
**Primary Dependencies**: Bun workspaces, Hono with OpenAPI schemas, React 19 with Vite, Zod, PostgreSQL/SQLite database adapters, Claude Agent SDK, Codex SDK  
**Storage**: SQLite by default or PostgreSQL when `DATABASE_URL` is set, plus non-secret local config in `.archon/config.yaml` and environment variables for sensitive provider credentials  
**Testing**: `bun run type-check`, `bun run lint`, `bun run format:check`, `bun run test`, plus package-scoped Bun test suites in `packages/core`, `packages/server`, `packages/web`, and `packages/workflows`  
**Target Platform**: Self-hosted Archon server, web UI, and CLI running on local developer environments with externally reachable provider endpoints  
**Project Type**: Bun and TypeScript monorepo with server, web, CLI, core, workflows, adapters, and migration packages  
**Performance Goals**: Preserve baseline v2 responsiveness for Claude and Codex, allow provider validation and model discovery to complete within the operator workflow window defined in the spec, and retain coherent multi-turn direct chat for experimental providers  
**Constraints**: Archive v1 before replacement; adopt upstream `v0.3.2` as the active base; do not port v1 RAG or task-management runtime behavior; do not bundle Ollama or LiteLLM services; keep workflow providers restricted to Claude and Codex; do not store LiteLLM credentials in normal config  
**Scale/Scope**: One repository migration spanning root layout replacement, provider client additions, config/schema/API updates, web settings updates, workflow validation hardening, migration documentation, and regression coverage across four target packages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon/.specify/memory/constitution.md` is still the unfilled template and provides no enforceable project-specific principles. Planning therefore uses the active repository and governance instructions as the applicable gates.

Pre-research gate status: PASS

- Scope gate: PASS. The plan stays within the requested migration feature and does not add unrelated modernization work.
- Source-of-truth gate: PASS. Technical context is verified against the current repository, the planning docs, and the local upstream `v0.3.2` checkout at `/tmp/archon-upstream-sMPHdG`.
- Safety gate: PASS. The design archives v1 before replacement and preserves explicit separation between native workflow assistants and experimental direct assistants.
- Secret-handling gate: PASS. LiteLLM credentials remain environment-sourced only and do not enter normal non-secret config.
- Workflow-boundary gate: PASS. Experimental providers are excluded from workflow schemas and runtime execution paths.

Post-design re-check: PASS

- Research resolves all technical unknowns without introducing new governance conflicts.
- Data model and contracts keep the active/live v2 scope and the archived v1 scope explicitly separated.
- The resulting design artifacts preserve clear validation surfaces for baseline adoption, provider behavior, and workflow restrictions.

## Project Structure

### Documentation (this feature)

```text
specs/001-archon-v2-provider-migration/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── provider-admin-api.md
│   └── workflow-provider-boundary.md
└── tasks.md
```

### Source Code (repository root)

```text
.archive/
docs/planning/
packages/
├── core/
│   └── src/
│       ├── clients/
│       ├── config/
│       ├── db/
│       ├── orchestrator/
│       ├── services/
│       ├── state/
│       └── types/
├── server/
│   └── src/
│       ├── adapters/
│       └── routes/
│           └── schemas/
├── web/
│   └── src/
│       ├── lib/
│       ├── routes/
│       └── stores/
├── workflows/
│   └── src/
│       ├── schemas/
│       ├── validator.ts
│       ├── dag-executor.ts
│       └── executor.ts
├── cli/
├── adapters/
├── git/
├── isolation/
└── paths/
migrations/
deploy/
auth-service/

archon-ui-main/          # legacy v1 input to archive or retire from active runtime
python/                  # legacy v1 input to archive or retire from active runtime
migration/               # legacy v1 input to archive or retire from active runtime
```

**Structure Decision**: The active implementation target is the upstream v2 monorepo rooted in `packages/*`, with migration work concentrated in `packages/core`, `packages/server`, `packages/web`, and `packages/workflows`. The current `python/`, `archon-ui-main/`, and `migration/` trees are treated as legacy migration inputs only and should not remain active runtime roots after Phase 1 baseline adoption.

## Complexity Tracking

No constitution violations require justification at plan time.
