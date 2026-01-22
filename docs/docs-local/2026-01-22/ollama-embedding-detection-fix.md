# Ollama Embedding Model Detection Fix

**Date:** 2026-01-22 14:12 EST  
**Branch:** `fix/ollama-embedding-model-detection`  
**Issue:** Ollama embedding models incorrectly classified as chat models

---

## Problem Description

### Symptom

The Ollama embedding model `qwen3-embedding:0.6b` was not appearing in Archon's embedding model dropdown. Instead, it was being classified as a chat model.

### Root Cause

In `python/src/server/api_routes/ollama_api.py`, the function `_determine_model_type()` had a logic prioritization flaw:

1. **Chat patterns** (including `'qwen'`) were checked **first**
2. **Embedding patterns** (including `'embedding'`) were checked **second**

Since `qwen3-embedding:0.6b` contains the substring `'qwen'`, it matched the chat pattern check and returned `'chat'` before ever evaluating the `'embedding'` substring.

### Code Analysis

**Before (Incorrect):**

```python
# First check if it's a known chat model
for pattern in chat_patterns:  # Contains 'qwen'
    if pattern in model_name:
        return 'chat'          # ← Returns here for qwen3-embedding

# Then check for dedicated embedding models
for pattern in embedding_patterns:  # Contains 'embedding'
    if pattern in model_name:
        return 'embedding'     # ← Never reached
```

**After (Fixed):**

```python
# Check for embedding models FIRST
for pattern in embedding_patterns:
    if pattern in model_name:
        return 'embedding'     # ← Returns here for qwen3-embedding

# Then check for chat/LLM models
for pattern in chat_patterns:
    if pattern in model_name:
        return 'chat'
```

---

## Changes Made

### File Modified

- `python/src/server/api_routes/ollama_api.py`

### Specific Changes

1. **Swapped pattern matching order** (lines 719-739)
   - Embedding patterns now checked before chat patterns
   - Added explanatory comments about the importance of order
2. **Logic improvement**
   - Specialized embedding models (e.g., `qwen3-embedding`) are correctly identified
   - Maintains backward compatibility for pure chat models
   - Doesn't affect multimodal or capability-based detection

### Affected Models

This fix ensures the following model naming patterns are correctly detected:

- `qwen*-embedding` → embedding (previously: chat)
- `llama*-embed` → embedding (previously: chat)
- `mistral*-embedding` → embedding (previously: chat)
- Any other `<chat-family>-embedding` variants

---

## Testing & Verification

### Container Rebuild

```bash
docker-compose build archon-server --no-cache
docker-compose up -d archon-server
```

### Expected Behavior

1. **Before fix**: `qwen3-embedding:0.6b` appears in Chat models dropdown
2. **After fix**: `qwen3-embedding:0.6b` appears in Embedding models dropdown

### Verification Steps

1. Navigate to Archon UI Settings
2. Check Ollama instance URL: `http://ollama:11434/v1`
3. Refresh model list
4. Verify `qwen3-embedding:0.6b` appears in embedding models section

---

## Deployment Status

### Services Updated

- ✅ `archon-server` rebuilt and redeployed
- ✅ Fix committed to branch `fix/ollama-embedding-model-detection`
- ✅ All containers healthy

### Branch Information

- **Current branch**: `fix/ollama-embedding-model-detection`
- **Base branch**: `main`
- **Commit**: `0df95fc` - "fix: prioritize embedding model detection"

---

## Related Context

### Ollama Deployment (Completed Earlier)

- Ollama container deployed in `app-network`
- Accessible at `http://ollama:11434` (internal) / `http://localhost:11434` (external)
- Models pulled:
  - ✅ `qwen3-embedding:0.6b` (639 MB, Q8_0 quantization)
  - ⚠️ `kimi-k2-thinking:cloud` (401 auth error - cloud model)

### Discovery Service (Already Correct)

The backend service `model_discovery_service.py` was **already detecting correctly**:

- It prioritizes embedding patterns first
- Sets `capabilities = ["embedding"]` correctly

The bug was **only in the API layer** that prepares data for the frontend, not in the core detection logic.

---

## Impact

### Before Fix

- Embedding models from popular chat families were hidden/misclassified
- Users couldn't select specialized embedding variants
- Confusion about which models support embeddings

### After Fix

- All embedding models correctly identified regardless of base family
- Proper UI categorization in Settings dropdowns
- Clearer separation between chat and embedding capabilities

---

## Next Steps

1. **Test in UI**: Verify the model appears in the correct dropdown
2. **Merge to main**: After user approval
3. **Update guardian-state**: Sync backup branch
4. **Documentation**: Update any user-facing docs about supported models

---

**Status**: ✅ Fix Applied & Deployed  
**Review**: Pending user verification in UI

---

## Technical Notes

### Why This Order Matters

Embedding models are **more specialized** than chat models. A model named `qwen3-embedding` is:

1. Explicitly designed for embeddings (name contains "embedding")
2. Happens to be from the Qwen family (name contains "qwen")

The correct precedence is: **Specific purpose (embedding) > General family (qwen)**

This aligns with the principle: "Check for specific characteristics before general ones."

### Alternative Solutions Considered

1. **Remove family names from chat_patterns**: Would break detection of base models
2. **Use exact matches**: Too rigid, wouldn't catch variants
3. **Check capabilities only**: Ignores useful name-based hints
4. **Current solution (swap order)**: ✅ Minimal change, maximum compatibility
