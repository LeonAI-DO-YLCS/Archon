# Restoration Manifest: Archon V2 Provider Migration

**Feature**: 001-archon-v2-provider-migration  
**Created**: 2026-04-09  
**Purpose**: Operational restore checklist for recovering protected local artifacts if root replacement fails.

---

## Upstream Source Reference

- **Upstream Checkout**: `/tmp/archon-upstream-sMPHdG`
- **Upstream Version**: `v0.3.2`
- **Upstream Commit SHA**: `53cabd44fd3683a0b7bcd2f75b1fe78645448058`

---

## Protected Artifacts Restore Checklist

Execute these steps in order if the migration needs to be rolled back:

### Step 1: Verify Archive Ref Exists

```bash
# Confirm the archive ref was created before root replacement
git show-ref --verify refs/heads/archive/pre-v2-migration 2>/dev/null || \
git show-ref --verify refs/tags/archive-pre-v2-migration 2>/dev/null
```

### Step 2: Restore Protected Planning Documents

```bash
# If planning docs are missing after root replacement:
git checkout archive/pre-v2-migration -- docs/planning/archon-v1-to-v2-merge-plan.md
git checkout archive/pre-v2-migration -- docs/planning/archon-v1-to-v2-execution-tasks.md
git checkout archive/pre-v2-migration -- docs/planning/archon-v2-migration-log.md
```

### Step 3: Restore Feature Specifications

```bash
# Restore entire spec tree
git checkout archive/pre-v2-migration -- specs/001-archon-v2-provider-migration/
```

### Step 4: Restore Speckit Configuration

```bash
# Restore Speckit configuration files
git checkout archive/pre-v2-migration -- .specify/init-options.json
git checkout archive/pre-v2-migration -- .specify/integration.json
git checkout archive/pre-v2-migration -- .specify/memory/
git checkout archive/pre-v2-migration -- .specify/integrations/
git checkout archive/pre-v2-migration -- .specify/scripts/
git checkout archive/pre-v2-migration -- .specify/templates/
```

### Step 5: Restore Migration Manifests

```bash
# Restore this manifest file
git checkout archive/pre-v2-migration -- .archive/migration-manifests/
```

---

## Complete Restore Path List

| Path | Type | Required |
|------|------|----------|
| `docs/planning/archon-v1-to-v2-merge-plan.md` | file | ✓ |
| `docs/planning/archon-v1-to-v2-execution-tasks.md` | file | ✓ |
| `docs/planning/archon-v2-migration-log.md` | file | ✓ |
| `specs/001-archon-v2-provider-migration/` | directory | ✓ |
| `.specify/init-options.json` | file | ✓ |
| `.specify/integration.json` | file | ✓ |
| `.specify/memory/` | directory | ✓ |
| `.specify/integrations/` | directory | ✓ |
| `.specify/scripts/` | directory | ✓ |
| `.specify/templates/` | directory | ✓ |
| `.archive/migration-manifests/` | directory | ✓ |

---

## Verification Commands

After restore, verify all artifacts are present:

```bash
# Check planning docs
test -f docs/planning/archon-v1-to-v2-merge-plan.md && echo "✓ merge-plan.md"
test -f docs/planning/archon-v1-to-v2-execution-tasks.md && echo "✓ execution-tasks.md"
test -f docs/planning/archon-v2-migration-log.md && echo "✓ migration-log.md"

# Check specs
test -f specs/001-archon-v2-provider-migration/spec.md && echo "✓ spec.md"
test -f specs/001-archon-v2-provider-migration/tasks.md && echo "✓ tasks.md"

# Check Speckit
test -f .specify/init-options.json && echo "✓ init-options.json"
```

---

## Notes

- This manifest is **operational**, not narrative.
- Use during a failed root replacement without needing to rediscover what to restore.
- Archive ref name is established when US1 T007 is executed.
