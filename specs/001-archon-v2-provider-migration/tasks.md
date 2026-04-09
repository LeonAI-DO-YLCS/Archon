---
description: 'Executable task list for Archon V2 migration and experimental provider support'
---

# Tasks: Archon V2 Migration and Experimental Provider Support

**Input**: Design documents from `/specs/001-archon-v2-provider-migration/`
**Prerequisites**: [plan.md](/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon/specs/001-archon-v2-provider-migration/plan.md), [spec.md](/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon/specs/001-archon-v2-provider-migration/spec.md), [research.md](/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon/specs/001-archon-v2-provider-migration/research.md), [data-model.md](/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon/specs/001-archon-v2-provider-migration/data-model.md), [contracts/provider-admin-api.md](/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon/specs/001-archon-v2-provider-migration/contracts/provider-admin-api.md), [contracts/workflow-provider-boundary.md](/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon/specs/001-archon-v2-provider-migration/contracts/workflow-provider-boundary.md), [quickstart.md](/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon/specs/001-archon-v2-provider-migration/quickstart.md)

**Tests**: Verification tasks are included because baseline proof, regression coverage, and workflow-boundary enforcement are required by the feature documents.

**Organization**: Tasks are grouped by setup, foundations, and user story so each delivery slice remains traceable and reviewable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after stated dependencies are satisfied
- **[Story]**: Maps to the user story in `spec.md`
- Every task includes an exact file path or target location

## Path Conventions

- **Current local repository root**: `/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon`
- **Feature artifacts**: `specs/001-archon-v2-provider-migration/`
- **Planning source docs**: `docs/planning/`
- **Verified upstream v2 reference checkout**: `/tmp/archon-upstream-sMPHdG`
- **Target active codebase after migration**: `packages/core/`, `packages/server/`, `packages/web/`, `packages/workflows/`

## Phase 1: Setup (Shared Planning and Execution Inputs)

**Purpose**: Create the migration execution record and capture the protected assets and upstream references before touching the live root.

- [x] T001 Create the execution ledger in `docs/planning/archon-v2-migration-log.md`
  - **Context:** The feature requires archive proof, baseline verification evidence, and retained-vs-dropped capability documentation. A dedicated log file is needed before any repository mutation begins.
  - **Execution Steps:**
    1. Create `docs/planning/archon-v2-migration-log.md`.
    2. Add top-level sections for `Archive Reference`, `Upstream Base Reference`, `Protected Local Artifacts`, `Baseline Validation Results`, `Provider Integration Results`, and `Open Deviations`.
    3. Insert links to `docs/planning/archon-v1-to-v2-merge-plan.md`, `docs/planning/archon-v1-to-v2-execution-tasks.md`, and `specs/001-archon-v2-provider-migration/plan.md`.
    4. Add placeholders for the exact git refs, command outputs, and validation dates that later tasks must fill.
  - **Handling/Constraints:** Do not overwrite the two existing planning source documents. Keep the ledger additive and use it as the single running record for implementation evidence.
  - **Acceptance Criteria:** `docs/planning/archon-v2-migration-log.md` exists, has all required section headers, and contains links to the source planning documents and feature artifacts.

- [x] T002 [P] Capture protected local artifacts in `docs/planning/archon-v2-migration-log.md`
  - **Context:** The root replacement must preserve local planning and specification artifacts that are not part of upstream `v0.3.2`.
  - **Execution Steps:**
    1. Record `docs/planning/archon-v1-to-v2-merge-plan.md` as a protected artifact.
    2. Record `docs/planning/archon-v1-to-v2-execution-tasks.md` as a protected artifact.
    3. Record `specs/001-archon-v2-provider-migration/` as a protected artifact tree.
    4. Record `.specify/init-options.json` as a protected local Speckit artifact.
    5. Record any newly created migration evidence files under `docs/planning/` as protected artifacts for restoration after root replacement.
  - **Handling/Constraints:** Do not infer additional protected paths without evidence. Only list files or directories that are currently present and required for this feature.
  - **Acceptance Criteria:** The migration log contains a protected-artifacts checklist with exact relative paths for every item that must survive the root replacement.

- [x] T003 [P] Record the upstream v2 target inventory from `/tmp/archon-upstream-sMPHdG` into `docs/planning/archon-v2-migration-log.md`
  - **Context:** The plan depends on the real upstream package layout, not only the prose description in `docs/planning/`.
  - **Execution Steps:**
    1. Read `/tmp/archon-upstream-sMPHdG/package.json` and record the root scripts used for install, lint, type-check, format check, and test.
    2. Record the package roots `packages/core`, `packages/server`, `packages/web`, and `packages/workflows`.
    3. Record the presence of `migrations/`, `deploy/`, `auth-service/`, `docker-compose.yml`, and `.archon/config.yaml`.
    4. Record the source reference path `/tmp/archon-upstream-sMPHdG` in the migration log so later tasks can compare or copy from it deterministically.
  - **Handling/Constraints:** Treat `/tmp/archon-upstream-sMPHdG` as a reference checkout only. Do not mutate it while implementing the feature.
  - **Acceptance Criteria:** The migration log contains a verified upstream inventory section with exact paths and the Bun root command matrix.

---

## Phase 2: Foundational (Blocking Safety Rails)

**Purpose**: Put the migration safety rails in place before any story work begins.

**⚠️ CRITICAL**: No user story work may begin until this phase is complete.

- [x] T004 Create the restoration manifest in `.archive/migration-manifests/001-archon-v2-provider-migration.md`
  - **Context:** Story 1 requires live-root replacement. The project instructions require archive hygiene and make destructive recovery actions unacceptable without proof.
  - **Execution Steps:**
    1. Create `.archive/migration-manifests/001-archon-v2-provider-migration.md`.
    2. Copy the protected artifact list from `docs/planning/archon-v2-migration-log.md`.
    3. Add a section naming the upstream source checkout `/tmp/archon-upstream-sMPHdG`.
    4. Add a step-by-step restore checklist covering `docs/planning/`, `specs/001-archon-v2-provider-migration/`, and `.specify/init-options.json`.
  - **Handling/Constraints:** Keep this file operational, not narrative. The manifest must be usable during a failed root replacement without needing to rediscover what to restore.
  - **Acceptance Criteria:** `.archive/migration-manifests/001-archon-v2-provider-migration.md` exists and contains an exact restore checklist for every protected local artifact.

- [x] T005 Verify current and target git references in `docs/planning/archon-v2-migration-log.md`
  - **Context:** The archive ref and upstream base ref are required entities in the data model and are prerequisites for Story 1.
  - **Execution Steps:**
    1. Record the current local branch name and current commit SHA from `/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon`.
    2. Record the upstream base target `coleam00/Archon` tag `v0.3.2` exactly as written in `docs/planning/archon-v1-to-v2-merge-plan.md`.
    3. Record the expected feature branch `001-archon-v2-provider-migration`.
    4. Add a checklist item stating that archive creation must happen before copying the upstream root.
  - **Handling/Constraints:** Do not invent an archive branch or tag name here; that name is established when Story 1 is executed.
  - **Acceptance Criteria:** The migration log includes the current local ref, the required upstream base ref, and the feature branch name with an explicit ordering note.

- [x] T006 Create the validation command matrix in `docs/planning/archon-v2-migration-log.md`
  - **Context:** Story 1 and the final polish phase both depend on a fixed validation matrix. Writing it once prevents drift.
  - **Execution Steps:**
    1. Add a `Baseline Validation Commands` section to `docs/planning/archon-v2-migration-log.md`.
    2. Record `bun install`.
    3. Record `bun run type-check`.
    4. Record `bun run lint --max-warnings 0`.
    5. Record `bun run format:check`.
    6. Record `bun run test`.
    7. Add a second subsection named `Feature Regression Commands` that reuses the same command list for the final validation pass.
  - **Handling/Constraints:** Use the exact command forms verified from `/tmp/archon-upstream-sMPHdG/package.json`.
  - **Acceptance Criteria:** The migration log contains an exact baseline and regression command matrix with no missing command from the approved quickstart.

**Checkpoint**: Safety rails, protected asset manifest, and validation command matrix are ready.

---

## Phase 3: User Story 1 - Safely Replace the Active Product Baseline (Priority: P1) 🎯 MVP

**Goal**: Preserve the current local v1-derived repository state, replace the active root with upstream Archon v2 `v0.3.2`, and prove the untouched baseline before any provider work starts.

**Independent Test**: Verify that the archive ref exists, the repository root matches the v2 package layout, protected planning/spec files were restored, and the untouched-baseline validation results are recorded in `docs/planning/archon-v2-migration-log.md`.

- [x] T007 [US1] Create the archive ref and record it in `docs/planning/archon-v2-migration-log.md` and `docs/planning/archon-v1-to-v2-merge-plan.md`
  - **Context:** The migration cannot proceed until the current v1-derived repository state is preserved in a recoverable ref.
  - **Execution Steps:**
    1. Create an archive branch or tag from the current repository state before changing the active root.
    2. Write the exact archive ref name and commit SHA into `docs/planning/archon-v2-migration-log.md`.
    3. Update the corresponding archive-reference section in `docs/planning/archon-v1-to-v2-merge-plan.md`.
    4. Confirm the archive ref points at the pre-migration tree, not the partially migrated tree.
  - **Handling/Constraints:** The archive ref must be created before any root replacement work. Do not reuse a vague or moving ref such as `latest`.
  - **Acceptance Criteria:** Both planning documents record the same archive ref and SHA, and that ref resolves to the pre-migration repository state.

- [x] T008 [US1] Create the v2 integration branch and restore protected artifacts in `/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon`
  - **Context:** The active feature branch must become the integration surface built from upstream `v0.3.2`, while local planning/spec artifacts remain present.
  - **Execution Steps:**
    1. Create or reset the feature branch `001-archon-v2-provider-migration` from the upstream `v0.3.2` base.
    2. Restore the protected artifacts listed in `.archive/migration-manifests/001-archon-v2-provider-migration.md`.
    3. Confirm `docs/planning/`, `specs/001-archon-v2-provider-migration/`, and `.specify/init-options.json` are present after the branch/root switch.
    4. Record the upstream base commit SHA and feature branch head SHA in `docs/planning/archon-v2-migration-log.md`.
  - **Handling/Constraints:** Preserve the protected artifacts exactly; do not rewrite them from memory after the branch switch.
  - **Acceptance Criteria:** The feature branch is based on upstream `v0.3.2`, and all protected local artifacts are present in the working tree immediately afterward.

- [x] T009 [US1] Replace the active repository root from `/tmp/archon-upstream-sMPHdG` while retiring `python/`, `archon-ui-main/`, and `migration/` as live roots
  - **Context:** The approved architecture requires upstream v2 to become the active repository root. The legacy v1 runtime directories must no longer remain active first-class product roots.
  - **Execution Steps:**
    1. Copy the upstream root layout from `/tmp/archon-upstream-sMPHdG` into `/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon`.
    2. Reapply the protected artifacts from the restoration manifest after the copy.
    3. Verify that `packages/`, `migrations/`, `deploy/`, `auth-service/`, and the Bun workspace root files now exist in the active repository.
    4. Ensure `python/`, `archon-ui-main/`, and `migration/` are no longer treated as active runtime roots for the upgraded product.
    5. Record the resulting root-layout verification in `docs/planning/archon-v2-migration-log.md`.
  - **Handling/Constraints:** Do not preserve the legacy v1 runtime trees as active side-by-side implementations. If any legacy tree is kept for reference, it must be clearly archived or excluded from the live runtime path.
  - **Acceptance Criteria:** The active root exposes the upstream v2 layout and the migration log confirms that the legacy runtime roots are no longer the live product.

- [X] T010 [US1] Install the untouched v2 baseline from `package.json` and `bun.lock`
  - **Context:** Provider work is forbidden until the untouched v2 baseline can be installed in the migrated root.
  - **Execution Steps:**
    1. Run `bun install` from `/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon`.
    2. Verify that workspace dependencies resolve for `packages/core`, `packages/server`, `packages/web`, and `packages/workflows`.
    3. Record whether `package.json`, `bun.lock`, or other workspace metadata changed during installation.
    4. Append the install result and any blockers to `docs/planning/archon-v2-migration-log.md`.
  - **Handling/Constraints:** Treat install failures as a stop condition for Story 2 and Story 3. Do not begin provider implementation on an uninstalled or partially installed baseline.
  - **Acceptance Criteria:** `bun install` completes or produces a recorded blocker in the migration log, and the working tree contains a consistent workspace dependency state.

- [X] T011 [US1] Run and record the untouched-baseline validation suite in `docs/planning/archon-v2-migration-log.md`
  - **Context:** The feature documents require proof that the untouched upstream baseline was validated before provider changes were introduced.
  - **Execution Steps:**
    1. Run `bun run type-check`.
    2. Run `bun run lint --max-warnings 0`.
    3. Run `bun run format:check`.
    4. Run `bun run test`.
    5. Append pass/fail status, timestamps, and any upstream-only failures to `docs/planning/archon-v2-migration-log.md`.
    6. Mark Story 1 complete only if the baseline is either green or any upstream-only failures are explicitly documented and triaged.
  - **Handling/Constraints:** Do not start Story 2 until this validation evidence exists. If commands fail, capture the exact failing surface and keep provider work blocked until the failure is triaged.
  - **Acceptance Criteria:** The migration log contains a baseline validation matrix with command-by-command results and an explicit go/no-go note for provider work.

**Checkpoint**: The repository is now on the active v2 baseline and is independently verifiable as a safe migration starting point.

---

## Phase 4: User Story 2 - Use Experimental Providers for Direct Assistant Conversations (Priority: P2)

**Goal**: Add Ollama, LM Studio, and LiteLLM as experimental direct-assistant providers with config, validation, model discovery, codebase selection, and multi-turn continuity.

**Independent Test**: Configure each provider through the server/web surfaces, validate the endpoint, assign the provider to a registered codebase, start a new conversation for that codebase, and verify that follow-up messages use carried-forward conversation context without changing workflow behavior.

- [X] T012 [US2] Expand assistant type registration in `packages/core/src/types/index.ts`, `packages/core/src/clients/index.ts`, and `packages/core/src/clients/factory.ts`
  - **Context:** The current v2 baseline only registers `claude` and `codex`. Story 2 starts by making the three experimental assistant types first-class direct-assistant values.
  - **Execution Steps:**
    1. Update the assistant type definitions in `packages/core/src/types/index.ts` to include `ollama`, `lmstudio`, and `litellm`.
    2. Update client exports in `packages/core/src/clients/index.ts` so the new provider clients can be constructed from a central entry point.
    3. Update `packages/core/src/clients/factory.ts` to resolve the three new assistant identifiers.
    4. Preserve the existing `claude` and `codex` codepaths unchanged except where type widening is required.
  - **Handling/Constraints:** Keep workflow-facing types separate from these widened assistant types. This task must not leak new providers into workflow unions.
  - **Acceptance Criteria:** Core assistant type definitions and the client factory accept the three experimental providers without regressing native provider resolution.

- [X] T013 [US2] Create the shared transport in `packages/core/src/clients/openai-compatible.ts`
  - **Context:** The research decision explicitly calls for a shared OpenAI-compatible transport to prevent duplicate request/stream/model-list logic across the three experimental providers.
  - **Execution Steps:**
    1. Create `packages/core/src/clients/openai-compatible.ts`.
    2. Implement reusable request helpers for chat invocation, streamed output handling, validation probes, and model listing.
    3. Add hooks for provider-specific headers so LiteLLM can inject bearer authentication without changing Ollama or LM Studio behavior.
    4. Return data in the minimum direct-assistant chunk format expected by the existing orchestrator/client boundary.
  - **Handling/Constraints:** Do not add workflow-specific event translation or provider-native resume semantics here. Keep the transport limited to direct-assistant behavior.
  - **Acceptance Criteria:** A single shared module exists and is capable of serving all three experimental providers without embedding provider-specific business rules in the orchestrator.

- [X] T014 [P] [US2] Implement provider clients in `packages/core/src/clients/ollama.ts`, `packages/core/src/clients/lmstudio.ts`, and `packages/core/src/clients/litellm.ts`
  - **Context:** Each experimental provider needs a thin client wrapper that binds its identifier and auth behavior to the shared transport.
  - **Execution Steps:**
    1. Create `packages/core/src/clients/ollama.ts` using the shared transport with no default auth header.
    2. Create `packages/core/src/clients/lmstudio.ts` using the shared transport with no default auth header.
    3. Create `packages/core/src/clients/litellm.ts` using the shared transport with conditional bearer authentication.
    4. Export each new client from `packages/core/src/clients/index.ts`.
  - **Handling/Constraints:** `litellm.ts` must not fetch secrets from normal config files. All three clients must remain direct-assistant only.
  - **Acceptance Criteria:** Each provider has its own client module, each composes the shared transport, and all three are exported for factory use.

- [X] T015 [US2] Add provider client tests in `packages/core/src/clients/factory.test.ts`, `packages/core/src/clients/ollama.test.ts`, `packages/core/src/clients/lmstudio.test.ts`, and `packages/core/src/clients/litellm.test.ts`
  - **Context:** The new client resolution and provider behavior must be regression-proof before higher-level integration work proceeds.
  - **Execution Steps:**
    1. Extend `packages/core/src/clients/factory.test.ts` to cover successful resolution of the three new assistant types and unsupported-provider failures.
    2. Create `packages/core/src/clients/ollama.test.ts` to cover transport wiring and no-auth defaults.
    3. Create `packages/core/src/clients/lmstudio.test.ts` to cover transport wiring and model-list behavior.
    4. Create `packages/core/src/clients/litellm.test.ts` to cover open access, bearer-auth injection, and invalid-auth error handling.
  - **Handling/Constraints:** Keep test doubles isolated to the client layer. Do not rely on live external provider endpoints in these tests.
  - **Acceptance Criteria:** Client and factory tests prove the three providers resolve correctly and respect their auth expectations.

- [X] T016 [US2] Extend codebase assistant selection in `packages/core/src/db/codebases.ts`, `packages/server/src/routes/schemas/codebase.schemas.ts`, `packages/server/src/routes/api.ts`, `packages/server/src/routes/api.codebases.test.ts`, and `packages/web/src/lib/api.ts`
  - **Context:** Project-scoped assistant inheritance already exists in the v2 baseline and must be extended to the three experimental providers.
  - **Execution Steps:**
    1. Update `packages/core/src/db/codebases.ts` so codebase creation and update paths accept the widened assistant type set.
    2. Update `packages/server/src/routes/schemas/codebase.schemas.ts` so `PATCH /api/codebases/:id` supports `aiAssistantType` alongside `allowEnvKeys`.
    3. Update `packages/server/src/routes/api.ts` to persist `aiAssistantType` changes for future conversations only.
    4. Extend `packages/server/src/routes/api.codebases.test.ts` to cover valid assistant-type updates, invalid values, and non-retroactive behavior.
    5. Update `packages/web/src/lib/api.ts` request and response types so the web client can send and receive the new codebase assistant field.
  - **Handling/Constraints:** Existing conversations must not be reassigned when a codebase assistant changes. Preserve current `allowEnvKeys` behavior unchanged.
  - **Acceptance Criteria:** Codebase update flows accept the widened assistant type set, return it to clients, and preserve existing-conversation behavior.

- [X] T017 [US2] Implement transcript-based continuity in `packages/core/src/db/messages.ts`, `packages/core/src/db/conversations.ts`, `packages/core/src/db/sessions.ts`, and `packages/core/src/orchestrator/orchestrator-agent.ts`
  - **Context:** Experimental providers cannot assume native resume semantics; the design requires carried-forward transcript history instead.
  - **Execution Steps:**
    1. Add the message-loading helper(s) needed to retrieve the last approved user-visible messages from `packages/core/src/db/messages.ts`.
    2. Update `packages/core/src/db/conversations.ts` and `packages/core/src/db/sessions.ts` so experimental sessions can operate with `assistant_session_id = null`.
    3. Update `packages/core/src/orchestrator/orchestrator-agent.ts` so experimental providers receive replayed `user` and `assistant` messages in chronological order before the new user turn.
    4. Exclude tool and workflow event records from the replay payload.
    5. Preserve the current native `assistant_session_id` behavior for Claude and Codex.
  - **Handling/Constraints:** Cap replay scope according to the plan and keep truncation deterministic. Do not degrade native-provider continuity.
  - **Acceptance Criteria:** Experimental-provider requests are built from persisted user-visible transcript history, while native providers continue using existing session continuity.

- [X] T018 [US2] Add continuity and inheritance coverage in `packages/core/src/db/messages.test.ts`, `packages/core/src/db/conversations.test.ts`, `packages/core/src/db/sessions.test.ts`, `packages/core/src/orchestrator/orchestrator-agent.test.ts`, and `packages/server/src/routes/api.messages.test.ts`
  - **Context:** The core multi-turn behavior is a feature acceptance criterion and needs direct regression coverage.
  - **Execution Steps:**
    1. Extend `packages/core/src/db/messages.test.ts` for transcript selection and filtering rules.
    2. Extend `packages/core/src/db/conversations.test.ts` for codebase assistant inheritance on new conversations.
    3. Extend `packages/core/src/db/sessions.test.ts` for `assistant_session_id = null` on experimental providers.
    4. Extend `packages/core/src/orchestrator/orchestrator-agent.test.ts` for transcript replay and native-provider non-regression.
    5. Extend `packages/server/src/routes/api.messages.test.ts` to verify API-visible conversation flows preserve the correct assistant type.
  - **Handling/Constraints:** Keep tests deterministic; use fixture transcripts rather than live provider responses.
  - **Acceptance Criteria:** Automated tests cover inheritance, transcript replay, filtered replay history, and preserved native assistant behavior.

- [X] T019 [US2] Extend provider config and safe-config projection in `packages/core/src/config/config-types.ts`, `packages/core/src/config/config-loader.ts`, `packages/core/src/db/env-vars.ts`, `packages/server/src/routes/schemas/config.schemas.ts`, and `packages/server/src/routes/api.ts`
  - **Context:** Operators need non-secret config for the three experimental providers, and LiteLLM credentials must remain environment-resolved only.
  - **Execution Steps:**
    1. Extend `packages/core/src/config/config-types.ts` to add `assistants.ollama`, `assistants.lmstudio`, and `assistants.litellm` with `enabled`, `baseUrl`, and `defaultModel`.
    2. Update `packages/core/src/config/config-loader.ts` so the new assistant defaults load and merge correctly.
    3. Update `packages/core/src/db/env-vars.ts` or the env-resolution helper layer to resolve `LITELLM_API_KEY` from approved environment sources.
    4. Update `packages/server/src/routes/schemas/config.schemas.ts` so the safe config and update payloads expose only the non-secret provider fields.
    5. Update `packages/server/src/routes/api.ts` so config reads and writes preserve the new safe shape without writing LiteLLM credentials to normal config.
  - **Handling/Constraints:** Never serialize LiteLLM secrets into `.archon/config.yaml`, safe config responses, or web payloads.
  - **Acceptance Criteria:** The config model supports the three providers, safe config exposes only non-secret fields, and LiteLLM auth remains environment-resolved.

- [X] T020 [US2] Add config and secret-boundary tests in `packages/core/src/config/config-loader.test.ts`, `packages/core/src/db/env-vars.test.ts`, and `packages/server/src/routes/api.health.test.ts`
  - **Context:** Secret-handling errors are high risk and must be detected automatically.
  - **Execution Steps:**
    1. Extend `packages/core/src/config/config-loader.test.ts` for new provider config loading and merge behavior.
    2. Extend `packages/core/src/db/env-vars.test.ts` for LiteLLM environment-key resolution order.
    3. Extend `packages/server/src/routes/api.health.test.ts` to ensure safe config responses include non-secret provider fields and exclude any LiteLLM secret.
  - **Handling/Constraints:** Test for absence of secrets explicitly, not only happy-path presence of safe fields.
  - **Acceptance Criteria:** Automated tests fail if LiteLLM secrets leak into browser-visible config or if provider config loading regresses.

- [X] T021 [US2] Add provider administration routes in `packages/server/src/routes/api.ts`, `packages/server/src/routes/schemas/provider.schemas.ts`, and `packages/server/src/routes/api.providers.test.ts`
  - **Context:** The provider contract requires validate and model-list routes for Ollama, LM Studio, and LiteLLM.
  - **Execution Steps:**
    1. Create `packages/server/src/routes/schemas/provider.schemas.ts` for validate request bodies and validate/model-list responses.
    2. Add `POST /api/providers/ollama/validate` and `GET /api/providers/ollama/models` to `packages/server/src/routes/api.ts`.
    3. Add `POST /api/providers/lmstudio/validate` and `GET /api/providers/lmstudio/models` to `packages/server/src/routes/api.ts`.
    4. Add `POST /api/providers/litellm/validate` and `GET /api/providers/litellm/models` to `packages/server/src/routes/api.ts`.
    5. Create `packages/server/src/routes/api.providers.test.ts` covering reachable endpoints, unreachable endpoints, incompatible responses, open LiteLLM, valid bearer auth, and invalid bearer auth.
  - **Handling/Constraints:** Route responses must never echo secrets. Fail fast on invalid configuration or auth rather than silently degrading.
  - **Acceptance Criteria:** The server exposes all six provider administration routes and automated tests cover success and failure cases for each provider type.

- [X] T022 [US2] Extend the web client and settings UI in `packages/web/src/lib/api.ts`, `packages/web/src/lib/api.generated.d.ts`, and `packages/web/src/routes/SettingsPage.tsx`
  - **Context:** Operators need a usable surface to configure provider settings, validate endpoints, list models, and update codebase assistant types.
  - **Execution Steps:**
    1. Update `packages/web/src/lib/api.ts` with client functions and types for provider validation, model discovery, widened codebase updates, and expanded safe config.
    2. Regenerate `packages/web/src/lib/api.generated.d.ts` from the updated server OpenAPI output.
    3. Update `packages/web/src/routes/SettingsPage.tsx` to add non-secret settings controls for `ollama`, `lmstudio`, and `litellm`.
    4. In the same settings surface, add codebase-level assistant selection controls that can send `aiAssistantType` updates through the widened API client.
    5. Add operator-facing help text that marks the three new providers as experimental direct assistants and states that LiteLLM credentials come from environment variables, not normal settings.
  - **Handling/Constraints:** Do not present a plain-text LiteLLM API-key field. Do not imply that the three experimental providers can execute workflows.
  - **Acceptance Criteria:** The settings UI can configure and validate the three providers, update a codebase assistant type, and present the correct experimental-provider messaging without exposing secrets.

**Checkpoint**: Experimental providers can be configured, validated, assigned to codebases, and used for multi-turn direct conversations without changing native workflow behavior.

---

## Phase 5: User Story 3 - Preserve Workflow Guardrails and Security Boundaries (Priority: P3)

**Goal**: Keep workflow surfaces strictly limited to Claude and Codex, preserve secret boundaries, and prevent the experimental providers from being treated as workflow-capable anywhere in the stack.

**Independent Test**: Attempt to use `ollama`, `lmstudio`, and `litellm` in workflow schemas, workflow execution, and workflow-related UI surfaces, and verify that each attempt is rejected with a clear unsupported-provider error while browser-visible config continues to exclude LiteLLM secrets.

- [X] T023 [US3] Enforce unsupported-provider validation in `packages/workflows/src/loader.ts`, `packages/workflows/src/validator.ts`, `packages/workflows/src/executor.ts`, and `packages/workflows/src/dag-executor.ts`
  - **Context:** Schema-level restrictions already exist in parts of the workflow system, but the plan requires explicit validation and runtime guardrails if invalid provider values arrive anyway.
  - **Execution Steps:**
    1. Review the current provider handling in `packages/workflows/src/loader.ts`, `packages/workflows/src/validator.ts`, `packages/workflows/src/executor.ts`, and `packages/workflows/src/dag-executor.ts`.
    2. Add explicit unsupported-provider validation errors for `ollama`, `lmstudio`, and `litellm` anywhere workflow input or resolved provider state is processed.
    3. Preserve the existing native-provider behavior for `claude` and `codex`.
    4. Ensure runtime execution stops before any workflow node starts when an unsupported provider is encountered.
  - **Handling/Constraints:** UI filtering is not enough. The runtime must remain safe even if malformed data bypasses the UI.
  - **Acceptance Criteria:** Workflow loader, validator, and executor paths all reject experimental providers explicitly and early.

- [X] T024 [US3] Preserve workflow provider enums in `packages/workflows/src/schemas/workflow.ts`, `packages/workflows/src/schemas/dag-node.ts`, `packages/workflows/src/deps.ts`, and `packages/server/src/routes/schemas/workflow.schemas.ts`
  - **Context:** Story 2 widens direct-assistant types, but workflow-facing schemas must remain limited to `claude | codex`.
  - **Execution Steps:**
    1. Review `packages/workflows/src/schemas/workflow.ts` and `packages/workflows/src/schemas/dag-node.ts` for provider enums.
    2. Confirm `packages/workflows/src/deps.ts` workflow assistant factory and config types remain native-provider only.
    3. Update `packages/server/src/routes/schemas/workflow.schemas.ts` if it needs clearer validation error messaging for unsupported providers.
    4. Add inline validation comments only where the code would otherwise be ambiguous.
  - **Handling/Constraints:** Do not widen workflow unions to include experimental providers just because the direct-assistant layer was widened.
  - **Acceptance Criteria:** Workflow schemas and workflow dependencies continue to accept only `claude` and `codex`.

- [X] T025 [US3] Add workflow boundary tests in `packages/workflows/src/validator.test.ts`, `packages/workflows/src/executor.test.ts`, `packages/workflows/src/dag-executor.test.ts`, `packages/server/src/routes/api.workflows.test.ts`, and `packages/server/src/routes/api.workflow-runs.test.ts`
  - **Context:** Story 3 is only complete if the unsupported-provider rejection is covered at both package and route levels.
  - **Execution Steps:**
    1. Extend `packages/workflows/src/validator.test.ts` for unsupported experimental provider validation.
    2. Extend `packages/workflows/src/executor.test.ts` for early execution failure on unsupported providers.
    3. Extend `packages/workflows/src/dag-executor.test.ts` for node-level unsupported-provider protection.
    4. Extend `packages/server/src/routes/api.workflows.test.ts` and `packages/server/src/routes/api.workflow-runs.test.ts` for API-level rejection behavior.
  - **Handling/Constraints:** Tests must assert clear unsupported-provider errors, not just generic failure responses.
  - **Acceptance Criteria:** Automated tests prove that unsupported providers cannot reach workflow execution from package or server entry points.

- [X] T026 [US3] Keep workflow UI provider selectors limited to native assistants in `packages/web/src/components/workflows/BuilderToolbar.tsx`, `packages/web/src/components/workflows/NodeInspector.tsx`, and `packages/web/src/components/workflows/WorkflowBuilder.tsx`
  - **Context:** The web UI already exposes workflow provider selectors in the builder surface. Story 3 requires those controls to remain native-only.
  - **Execution Steps:**
    1. Review provider selector controls in `packages/web/src/components/workflows/BuilderToolbar.tsx`.
    2. Review node-level provider selector controls in `packages/web/src/components/workflows/NodeInspector.tsx`.
    3. Review workflow serialization state in `packages/web/src/components/workflows/WorkflowBuilder.tsx`.
    4. Ensure the available options remain `claude` and `codex` only, even after Story 2 widens the direct-assistant type system.
    5. Add or update helper text if the UI could otherwise imply that experimental providers are available for workflow use.
  - **Handling/Constraints:** Do not expose experimental providers in workflow builder dropdowns, even temporarily.
  - **Acceptance Criteria:** Workflow UI selectors remain native-only and do not present `ollama`, `lmstudio`, or `litellm`.

- [X] T027 [US3] Re-verify browser-visible secret boundaries in `packages/server/src/routes/api.health.test.ts`, `packages/web/src/lib/api.generated.d.ts`, and `docs/planning/archon-v2-migration-log.md`
  - **Context:** Story 3 includes both workflow guardrails and secret-handling boundaries. The final secret review should happen after Story 2 and workflow changes are integrated.
  - **Execution Steps:**
    1. Re-run and, if needed, extend `packages/server/src/routes/api.health.test.ts` assertions for safe config output.
    2. Inspect `packages/web/src/lib/api.generated.d.ts` to confirm no generated types include a LiteLLM API-key field.
    3. Record the completed secret-boundary verification in `docs/planning/archon-v2-migration-log.md`.
  - **Handling/Constraints:** Generated client types are part of the public browser surface. Treat them as a leak vector that must be checked explicitly.
  - **Acceptance Criteria:** No browser-visible API type or safe config response exposes LiteLLM credentials, and the migration log records the completed review.

**Checkpoint**: Workflow paths stay native-only, unsupported providers fail fast, and secret boundaries remain intact after experimental-provider integration.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize documentation, run the full verification matrix, and confirm non-goals remain enforced across the migrated repository.

- [ ] T028 [P] Update migration evidence in `docs/planning/archon-v1-to-v2-merge-plan.md`, `docs/planning/archon-v1-to-v2-execution-tasks.md`, and `docs/planning/archon-v2-migration-log.md`
  - **Context:** The feature requires a final record of retained capabilities, archived capabilities, and implementation deviations.
  - **Execution Steps:**
    1. Add the final archive ref, upstream base ref, and integration branch outcomes to `docs/planning/archon-v2-migration-log.md`.
    2. Update `docs/planning/archon-v1-to-v2-merge-plan.md` where archive refs or validated implementation choices must be recorded.
    3. Update `docs/planning/archon-v1-to-v2-execution-tasks.md` with completion evidence or implementation-status notes for the executed task groups.
  - **Handling/Constraints:** Keep the source planning docs as planning artifacts with status/evidence updates, not as ad hoc design rewrites.
  - **Acceptance Criteria:** All three planning documents reflect the final implementation state and point at the same archive/base evidence.

- [ ] T029 Run the full regression matrix from `/home/lnx-ubuntu-wsl/LeonAI_DO/dev/Archon` and append results to `docs/planning/archon-v2-migration-log.md`
  - **Context:** The quickstart and plan both require a final end-to-end validation pass after all user stories are complete.
  - **Execution Steps:**
    1. Run `bun run type-check`.
    2. Run `bun run lint --max-warnings 0`.
    3. Run `bun run format:check`.
    4. Run `bun run test`.
    5. Record the final pass/fail results and any residual issues in `docs/planning/archon-v2-migration-log.md`.
    6. Add explicit notes for Claude/Codex non-regression, experimental-provider validation coverage, workflow-boundary coverage, and secret-boundary coverage.
  - **Handling/Constraints:** Do not close the feature without a final recorded regression matrix. If any command fails, capture the exact failing package and test file.
  - **Acceptance Criteria:** The migration log contains a final command matrix with pass/fail results and explicit coverage notes for all three user stories.

- [ ] T030 [P] Verify non-goals and default deployment boundaries in `README.md`, `docker-compose.yml`, and `deploy/docker-compose.yml`
  - **Context:** The upgraded repository must not silently reintroduce bundled Ollama/LiteLLM services or active v1 RAG behavior through root-level documentation or deployment files.
  - **Execution Steps:**
    1. Review `README.md` for references that would incorrectly describe bundled Ollama/LiteLLM deployment or active v1 RAG/task-management behavior.
    2. Review `docker-compose.yml` for bundled Ollama or LiteLLM runtime services that violate the approved non-goals.
    3. Review `deploy/docker-compose.yml` for the same non-goal violations.
    4. Update any incorrect references so the live repository matches the approved migration scope.
  - **Handling/Constraints:** This task is about enforcing documented non-goals, not adding new provider deployment infrastructure.
  - **Acceptance Criteria:** Root docs and default deployment files do not imply bundled Ollama/LiteLLM services or active v1 RAG/task-management runtime behavior.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately and establishes the execution ledger plus protected/upstream inventories.
- **Foundational (Phase 2)**: Depends on Setup and blocks all story implementation.
- **User Story 1 (Phase 3)**: Depends on Foundational and blocks all later stories because the active v2 baseline must exist before provider work.
- **User Story 2 (Phase 4)**: Depends on successful completion of User Story 1.
- **User Story 3 (Phase 5)**: Depends on User Story 2 because it hardens and verifies the boundaries around the newly added provider surfaces.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on later stories; this is the MVP and the gating migration slice.
- **User Story 2 (P2)**: Depends on User Story 1 because the Bun/TypeScript v2 baseline must be active and validated first.
- **User Story 3 (P3)**: Depends on User Story 2 because workflow guardrails and secret-boundary re-verification must be applied to the widened direct-assistant surfaces.

### Within Each User Story

- Story 1: archive ref before branch/root replacement, branch/root replacement before install, install before baseline validation.
- Story 2: type registration before provider clients, provider clients before continuity/config/API/UI integration, integration before regression coverage.
- Story 3: runtime guardrails before boundary tests, boundary tests before final secret-boundary signoff.

### Parallel Opportunities

- `T002` and `T003` can run in parallel after `T001`.
- `T014` can be implemented in parallel internally across `ollama.ts`, `lmstudio.ts`, and `litellm.ts` after `T013`.
- `T020` and `T021` can proceed in parallel after `T019` establishes the config model and route expectations.
- `T028` and `T030` can run in parallel after all story work is complete.

---

## Parallel Example: User Story 2

```bash
# After T013 completes, split the provider wrappers:
Task: "Implement packages/core/src/clients/ollama.ts"
Task: "Implement packages/core/src/clients/lmstudio.ts"
Task: "Implement packages/core/src/clients/litellm.ts"

# After T019 completes, split config verification and provider routes:
Task: "Extend packages/core/src/config/config-loader.test.ts, packages/core/src/db/env-vars.test.ts, and packages/server/src/routes/api.health.test.ts"
Task: "Implement packages/server/src/routes/schemas/provider.schemas.ts, packages/server/src/routes/api.ts provider routes, and packages/server/src/routes/api.providers.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and verify that the archive ref exists, the active tree is v2, and the untouched-baseline validation matrix is recorded

### Incremental Delivery

1. Deliver the safe v2 baseline migration first
2. Add experimental direct-assistant providers next
3. Add workflow boundary hardening and secret-boundary verification last
4. Finish with documentation and the full regression matrix

### Parallel Team Strategy

1. One person owns Story 1 until the active v2 baseline is stable.
2. After Story 1:
   - One person owns Story 2 core/runtime/config work
   - One person owns Story 2 server/web integration work once the config model is settled
3. After Story 2:
   - One person owns workflow boundary hardening
   - One person owns regression/documentation closure

---

## Notes

- Every task references an exact file path or concrete target location.
- Stop Story 2 immediately if Story 1 baseline validation is missing or unresolved.
- Keep archived v1 state recoverable, but do not leave it active in the live runtime path.
- Keep experimental providers direct-assistant only throughout the implementation.
