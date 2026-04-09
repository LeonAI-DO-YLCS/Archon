# Data Model: Archon V2 Migration and Experimental Provider Support

## Overview

This feature changes both repository state and live assistant behavior. The design therefore models:

1. Repository transition state for archiving v1 and activating v2
2. Assistant/provider configuration and selection state
3. Conversation and session continuity for native and experimental assistants

## Entities

### 1. Migration Archive Record

Represents the documentation-level record proving the local v1 baseline was preserved before the active root was replaced.

**Fields**

| Field | Type | Description |
|-------|------|-------------|
| `archiveRef` | string | Branch or tag identifying the preserved local v1 state |
| `upstreamBaseRef` | string | Selected upstream base ref, expected to be `v0.3.2` |
| `integrationBranch` | string | Active migration branch built from the upstream base |
| `recordedAt` | datetime | When the migration record was created |
| `notes` | string | Human-readable summary of preserved and excluded capabilities |

**Validation Rules**

- `archiveRef`, `upstreamBaseRef`, and `integrationBranch` are required before Phase 1 is complete.
- `archiveRef` must point to a recoverable repository state.
- `upstreamBaseRef` must match the approved active baseline.

### 2. Assistant Type

Represents the valid assistant/provider choices used by the upgraded product.

**Values**

| Value | Class | Workflow Eligible | Continuity Mode |
|-------|-------|-------------------|-----------------|
| `claude` | native | yes | provider-native session resume |
| `codex` | native | yes | provider-native session resume |
| `ollama` | experimental | no | transcript replay |
| `lmstudio` | experimental | no | transcript replay |
| `litellm` | experimental | no | transcript replay |

**Validation Rules**

- Workflow definitions accept only `claude` and `codex`.
- Codebase assistant selection accepts all five values.
- Experimental values must never be treated as workflow-compatible.

### 3. Experimental Provider Configuration

Represents the operator-managed non-secret settings for direct-assistant providers.

**Fields**

| Field | Type | Description |
|-------|------|-------------|
| `providerId` | enum | One of `ollama`, `lmstudio`, `litellm` |
| `enabled` | boolean | Whether the provider is available for use |
| `baseUrl` | string | URL of the externally running provider service |
| `defaultModel` | string nullable | Preferred model when one is configured |
| `authMode` | enum | `none` or `environment-resolved` |

**Validation Rules**

- `enabled=true` requires a syntactically valid `baseUrl`.
- `authMode=environment-resolved` is used only for LiteLLM.
- No secret credential values are stored in this entity.

### 4. Codebase

Represents a registered repository or project in Archon.

**Existing Source Evidence**

- Stored in `remote_agent_codebases`
- Already carries `ai_assistant_type`
- Already carries `allow_env_keys`

**Key Fields**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Codebase identifier |
| `name` | string | Display name |
| `repositoryUrl` | string nullable | Linked repository URL |
| `defaultCwd` | string | Default working directory |
| `aiAssistantType` | Assistant Type | Assistant inherited by new conversations |
| `allowEnvKeys` | boolean | Whether env-key usage is permitted for the codebase |
| `commands` | map | Registered command shortcuts |

**Validation Rules**

- `aiAssistantType` must be one of the supported assistant values.
- Updating `aiAssistantType` affects only future conversations.
- `allowEnvKeys` stays independent from assistant type selection.

### 5. Conversation

Represents a persisted chat thread across the supported platforms.

**Existing Source Evidence**

- Stored in `remote_agent_conversations`
- Already persists `ai_assistant_type`, `codebase_id`, and `cwd`

**Key Fields**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary conversation identifier |
| `platformType` | string | Source platform category |
| `platformConversationId` | string | Platform-specific conversation identifier |
| `aiAssistantType` | Assistant Type | Assistant used by this conversation |
| `codebaseId` | UUID nullable | Linked codebase |
| `cwd` | string nullable | Working directory or inherited context |
| `hidden` | boolean | Visibility flag |
| `lastActivityAt` | datetime nullable | Last activity timestamp |

**Validation Rules**

- New conversations inherit `aiAssistantType` from the linked codebase when one is supplied.
- Existing conversations keep their stored `aiAssistantType` even if the codebase default changes later.

### 6. Session

Represents assistant runtime continuity state for a conversation.

**Existing Source Evidence**

- Stored in `remote_agent_sessions`
- Already persists `ai_assistant_type` and nullable `assistant_session_id`

**Key Fields**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Session identifier |
| `conversationId` | UUID | Linked conversation |
| `codebaseId` | UUID nullable | Linked codebase |
| `aiAssistantType` | Assistant Type | Assistant used for the session |
| `assistantSessionId` | string nullable | Provider-native resume token when supported |
| `parentSessionId` | UUID nullable | Prior session in the transition chain |
| `transitionReason` | string | Why the session was created or transitioned |

**Validation Rules**

- `assistantSessionId` is expected for native assistants when available.
- `assistantSessionId` remains `null` for experimental providers unless a future provider-specific capability is proven.

### 7. Message

Represents a persisted user-visible message within a conversation.

**Existing Source Evidence**

- Stored in `remote_agent_messages`
- Currently persists `role`, `content`, `metadata`, and `created_at`

**Key Fields**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Message identifier |
| `conversationId` | UUID | Linked conversation |
| `role` | enum | `user` or `assistant` |
| `content` | string | Message body |
| `metadata` | object/string | Additional message details |
| `createdAt` | datetime | Message timestamp |

**Validation Rules**

- Transcript replay for experimental providers only includes `user` and `assistant` messages.
- Tool and workflow event details in metadata are excluded from replay context.
- Replay window is capped by the planning rule set before sending to experimental providers.

### 8. Provider Validation Result

Represents the response returned when an operator validates a provider or requests models.

**Fields**

| Field | Type | Description |
|-------|------|-------------|
| `providerId` | enum | `ollama`, `lmstudio`, or `litellm` |
| `reachable` | boolean | Whether the provider endpoint responded successfully |
| `authenticated` | boolean nullable | Whether the configured or resolved auth succeeded |
| `models` | string array | Available model identifiers |
| `message` | string | Human-readable status |
| `errorCode` | string nullable | Structured failure code when validation fails |

**Validation Rules**

- `models` may be empty only when `reachable=false` or the provider explicitly reports no available models.
- When `reachable=true` but `models` is empty, the validation result includes a message explaining that no models were discovered and the operator should verify the provider configuration.
- `authenticated` is meaningful only for providers that can require credentials.
- Empty model lists do not block provider configuration but are logged for operator awareness and may affect UI model-selection dropdowns.

## Relationships

- A `Codebase` can have many `Conversations`.
- A `Conversation` can have many `Messages`.
- A `Conversation` can have many `Sessions` over time.
- A `Session` belongs to exactly one `Conversation`.
- A `Codebase` selects one `Assistant Type` that new `Conversations` inherit.
- Each `Experimental Provider Configuration` maps to one experimental `Assistant Type`.
- `Migration Archive Record` is a documentation-level root record for the feature, not a runtime entity.

## State Transitions

### Repository Transition

| From | Event | To |
|------|-------|----|
| `legacy-active` | archive ref created | `legacy-archived` |
| `legacy-archived` | upstream `v0.3.2` root adopted | `v2-active-unverified` |
| `v2-active-unverified` | baseline validation complete | `v2-active-verified` |
| `v2-active-verified` | provider integration complete | `v2-active-extended` |

### Experimental Provider Availability

| From | Event | To |
|------|-------|----|
| `disabled` | operator enables provider with base URL | `configured` |
| `configured` | validation succeeds | `validated` |
| `configured` | validation fails | `configuration-error` |
| `validated` | operator assigns provider to codebase | `assignable` |

### Conversation Continuity

| From | Event | To |
|------|-------|----|
| `new-conversation` | created with codebase | `assistant-inherited` |
| `assistant-inherited` | native assistant turn | `session-resumed-or-created` |
| `assistant-inherited` | experimental provider turn | `transcript-replayed` |
| `project-assistant-updated` | future conversation created | `new-assistant-inherited` |
| `project-assistant-updated` | existing conversation continues | `existing-assistant-retained` |
