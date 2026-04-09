# Design: LMStudio Integration Architecture

## Context

Archon currently supports Ollama via deeply integrated services. LMStudio offers a standardized OpenAI-compatible API but requires specific handling to distinguish it from "Cloud OpenAI" and "Ollama".

## Goals / Non-Goals

- **Goals**:
  - Treat LMStudio as a distinct "Local" provider.
  - Support both Chat and Embedding capabilities.
  - Re-use existing "Ollama-like" UI patterns for configuration (Base URL).
- **Non-Goals**:
  - Automatic model downloading (LMStudio handles this via its own UI).
  - GPU offload configuration (Managed in LMStudio).

## Decisions

- **Decision 1**: Mirror `ollamaService.ts` structure.
  - _Rationale_: Keeps the codebase consistent. We will have `lmstudioService.ts` that proxies to backend routes.
- **Decision 2**: Backend Proxy Routes.
  - _Rationale_: Avoid CORS issues by routing frontend requests through `python/src/server/api_routes/lmstudio_api.py` -> Internal Network -> LMStudio.
- **Decision 3**: Use `host.docker.internal`.
  - _Rationale_: Essential for reaching the host machine from the Archon container on Windows/Mac.

## Risks / Trade-offs

- **Risk**: User network configuration blocks `host.docker.internal`.
  - _Mitigation_: Provide clear error messages about Docker networking.
- **Risk**: API Divergence.
  - _Mitigation_: Stick to strict OpenAI `v1` standard compliance.

## Migration Plan

- N/A - Additive change.
