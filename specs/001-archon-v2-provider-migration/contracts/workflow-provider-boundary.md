# Contract: Workflow Provider Boundary

## Purpose

Define the immutable workflow-facing boundary that protects the workflow engine from experimental direct-assistant providers.

## Workflow Provider Enum

Workflow-facing provider fields accept only:

- `claude`
- `codex`

Workflow-facing provider fields reject:

- `ollama`
- `lmstudio`
- `litellm`

## Validation Contract

### Input

Any workflow definition, workflow invocation request, or workflow execution payload that carries a provider identifier.

### Required Behavior

- Reject unsupported providers before workflow execution starts.
- Return a clear validation error that states the provider is unsupported for workflow execution.
- Preserve current native workflow behavior for `claude` and `codex`.

## Runtime Safety Contract

If an unsupported provider bypasses schema validation and reaches workflow runtime code:

- runtime execution must stop immediately
- the user must receive an explicit unsupported-provider error
- no workflow steps may start under the invalid provider

## Error Shape

| Field | Type | Notes |
|-------|------|-------|
| `errorCode` | string | Stable unsupported-provider code |
| `message` | string | Human-readable explanation |
| `provider` | string | The rejected provider value |
| `allowedProviders` | string[] | Always `claude`, `codex` |

## Acceptance Notes

- UI filtering alone is insufficient.
- Schema validation and runtime validation must both enforce the boundary.
- Experimental providers remain available for direct assistant and project-scoped chat only.
