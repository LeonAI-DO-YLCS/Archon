# Feature Specification: Archon V2 Migration and Experimental Provider Support

**Feature Branch**: `001-archon-v2-provider-migration`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: User description: "Create a specification from the migration planning documents in `docs/planning/` for replacing the current local Archon v1 derivative with the selected Archon v2 baseline, preserving Claude and Codex as native workflow assistants, and adding Ollama, LM Studio, and LiteLLM as experimental direct-assistant providers."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Safely Replace the Active Product Baseline (Priority: P1)

As a repository maintainer, I need to replace the active local product baseline with the selected Archon v2 baseline while preserving the current v1 state in archive form, so the team can move forward on the supported architecture without losing recovery access to prior work.

**Why this priority**: The migration has no value if the active product remains on the legacy baseline or if the existing local state is lost during the transition.

**Independent Test**: Can be fully tested by verifying that the legacy baseline is recoverable, the active baseline is the selected v2 product, and baseline verification results are documented before any provider extension work begins.

**Acceptance Scenarios**:

1. **Given** the repository is still on the legacy local baseline, **When** maintainers perform the migration, **Then** the legacy baseline is preserved in an archive reference before the new active baseline is adopted.
2. **Given** the new active baseline has been adopted, **When** maintainers inspect the repository and migration records, **Then** they can confirm which baseline is active, which baseline was archived, and that the archived state remains recoverable.
3. **Given** the selected v2 baseline is active, **When** maintainers review the migration evidence, **Then** install, validation, and regression readiness results for the untouched baseline are recorded before provider-specific changes proceed.

---

### User Story 2 - Use Experimental Providers for Direct Assistant Conversations (Priority: P2)

As an operator managing Archon for local development, I want to enable Ollama, LM Studio, and LiteLLM as experimental direct-assistant providers, so teams can use additional chat providers in direct assistant and project conversations without changing the native workflow model.

**Why this priority**: Provider expansion is the primary user-facing capability being preserved and extended during the migration.

**Independent Test**: Can be fully tested by configuring each experimental provider, validating service connectivity, selecting it for a registered project, and completing a multi-turn direct conversation with the expected context retained.

**Acceptance Scenarios**:

1. **Given** an operator has access to an externally running experimental provider service, **When** they configure and validate that provider, **Then** the system confirms reachability and returns available models for selection.
2. **Given** a registered project is assigned an experimental provider, **When** a user starts a new conversation for that project, **Then** the conversation inherits that project assistant selection.
3. **Given** a user continues an experimental-provider conversation, **When** they send a follow-up message, **Then** the provider receives enough prior user and assistant context for the reply to remain coherent with the ongoing conversation.

---

### User Story 3 - Preserve Workflow Guardrails and Security Boundaries (Priority: P3)

As a maintainer responsible for platform safety, I want experimental providers clearly separated from workflow-capable native assistants, so expanded direct chat support does not weaken workflow rules, secret handling, or the boundaries of the upgraded product.

**Why this priority**: The migration must expand direct assistant options without creating ambiguity about what can run workflows or where secrets may be stored.

**Independent Test**: Can be fully tested by attempting to use an experimental provider in a workflow surface, confirming the request is rejected with a clear error, and verifying that non-secret configuration views never expose provider credentials.

**Acceptance Scenarios**:

1. **Given** a user attempts to select an experimental provider in any workflow-facing surface, **When** the request is submitted, **Then** the system rejects it with a clear validation error and does not start workflow execution.
2. **Given** LiteLLM authentication is configured through approved secret sources, **When** operators inspect normal settings and browser-safe configuration responses, **Then** no plain-text LiteLLM credential is exposed there.
3. **Given** the upgraded product is live, **When** maintainers review the documented scope, **Then** they can see that archived v1 RAG and task-management behavior remains inactive in the live product.

### Edge Cases

- What happens when an experimental provider is enabled but its external service is unreachable, returns incompatible responses, or requires credentials that are missing or invalid?
- ~~How does the system handle a project assistant change after conversations already exist for that project?~~ **Addressed by FR-010**: Existing conversations retain their stored assistant type and are not retroactively reassigned.
- What happens when a conversation history includes tool or workflow events that should not be replayed to an experimental provider?
- How does the system respond when a provider can be reached but does not return a usable model list? **Addressed by FR-007 and data-model.md**: Validation returns `reachable=true` with empty `models` array and appropriate `message`; system permits continued operation but logs the empty model list for operator awareness.
- What happens if maintainers attempt to preserve archived v1 data as active runtime behavior during the migration?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The migration process MUST preserve the current local v1 repository state in an explicit archive reference before the selected v2 baseline becomes the active product baseline.
- **FR-002**: The active product after migration MUST be the selected Archon v2 baseline, while the archived v1 baseline remains recoverable but inactive.
- **FR-003**: The system MUST record baseline verification results for the untouched v2 baseline before provider-specific feature work proceeds.
- **FR-004**: The upgraded product MUST continue to support `claude` and `codex` as the only native assistants allowed to participate in workflow execution.
- **FR-005**: The upgraded product MUST support `ollama`, `lmstudio`, and `litellm` as experimental providers for direct assistant and project-scoped conversation use.
- **FR-006**: The system MUST allow operators to enable or disable each experimental provider and define its non-secret connection settings and default model selection.
- **FR-007**: The system MUST allow operators to validate reachability and model availability for each experimental provider before use.
- **FR-008**: The system MUST allow each registered project to store and update its assistant selection from the supported assistant types.
- **FR-009**: New conversations created for a registered project MUST inherit that project's current assistant selection.
- **FR-010**: Existing conversations MUST keep their existing continuity behavior when a project's assistant selection changes and MUST NOT be retroactively reassigned.
- **FR-011**: Experimental-provider conversations MUST retain multi-turn context by carrying forward prior user and assistant messages from the same conversation in chronological order.
- **FR-012**: The carried-forward conversation history for experimental providers MUST exclude tool and workflow event records that are not part of the user-visible conversation.
- **FR-013**: Experimental providers MUST maintain continuity without depending on provider-specific resume behavior unless that behavior is separately proven safe.
- **FR-014**: Workflow-definition, workflow-validation, and workflow-execution surfaces MUST reject `ollama`, `lmstudio`, and `litellm` with explicit user-facing errors.
- **FR-015**: End-user-visible settings and all shareable non-secret configuration views MUST exclude LiteLLM credentials.
- **FR-016**: LiteLLM authentication MUST be resolved only from approved secret-bearing environment sources, and the system MUST operate without an authentication header when no key is available.
- **FR-017**: The active product MUST NOT revive archived v1 RAG, embeddings, or task-management runtime behavior as part of this migration.
- **FR-018**: The active product MUST NOT assume bundled local runtime services for Ollama or LiteLLM as part of the default deployment path.
- **FR-019**: Migration documentation MUST record which capabilities were preserved, which were archived, and which were intentionally excluded from the live product.

### Key Entities *(include if feature involves data)*

- **Archived Legacy Baseline**: The preserved reference to the pre-migration local v1 repository state that remains recoverable but inactive.
- **Active Product Baseline**: The selected Archon v2 product state that becomes the live repository and authoritative runtime foundation after migration.
- **Assistant Type**: The allowed assistant choice assigned globally or per registered project, with a mandatory distinction between native workflow assistants and experimental direct-assistant providers.
- **Experimental Provider Configuration**: The non-secret operator-managed settings that determine whether an experimental provider is available, where its external service is reached, and which default model is preferred.
- **Registered Project**: A tracked codebase or project record whose assistant setting determines which assistant type new conversations inherit.
- **Conversation Transcript**: The ordered history of user and assistant messages that provides continuity for experimental providers across multiple turns.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of migration runs preserve a recoverable archive reference to the prior local baseline before the live baseline is replaced.
- **SC-002**: 100% of baseline verification records show that untouched-v2 validation evidence was captured before provider extension work began.
- **SC-003**: Operators can validate and retrieve a model list for each supported experimental provider in under 2 minutes per provider when the external service is correctly configured. This assumes typical LAN/WAN latency (≤500ms round-trip) and a provider returning ≤100 models in its model list response. Validation timeouts should fail gracefully if the provider is unreachable.
- **SC-004**: In scripted validation scenarios, at least 95% of multi-turn conversations using experimental providers return responses that reflect the immediately preceding conversation context without requiring manual context re-entry.
- **SC-005**: 100% of attempts to use an experimental provider in workflow-facing surfaces are rejected before workflow execution begins.
- **SC-006**: 100% of end-user-visible non-secret configuration views exclude LiteLLM credentials and other provider secrets.

## Assumptions

- A single upstream v2 baseline has already been selected by maintainers as the authoritative active product target for this migration.
- The system already has project registration and conversation persistence concepts that can be extended instead of replaced.
- Operators will run Ollama, LM Studio, and LiteLLM as external services and provide reachable service URLs when they want those providers enabled.
- Archived v1 RAG, embeddings, and task-management behavior must remain recoverable for reference purposes but inactive in the live product.
- Per-conversation assistant override is out of scope for this migration; assistant selection is controlled by global defaults and project-level settings only.
