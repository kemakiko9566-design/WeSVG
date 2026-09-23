# Context Compression Rule

## Purpose

Whenever a milestone is completed, generate a compressed milestone summary. Future AI agents MUST read milestone summaries instead of scanning old chat history or the entire repository.

## Rule

```
WHEN a milestone is completed
  → Generate a milestone summary
  → Maximum 500 lines
  → Save to docs/reports/MILESTONE_SUMMARY.md (overwrite with latest)
  → Also save to docs/reports/M{number}_REPORT.md (permanent archive)

WHEN an AI agent starts work
  → STEP 0: Read docs/reports/MILESTONE_SUMMARY.md (if exists)
  → This replaces reading old chat history
  → Only go to older reports if the summary is insufficient
```

## Summary Structure (Max 500 lines)

```
────────────────────────────────────────
  MILESTONE {N} — {Name}
  Date: {range}
  Agent: {name/tool}
────────────────────────────────────────

## Architecture Changes
  • {change} — {reason}
  • {change} — {reason}

## New Modules
  • {module path} — {purpose}

## Removed / Deprecated
  • {module} — {replacement}

## Data Model Changes
  • {change} — {impact}

## API Changes
  • {change} — {migration}

## Known Bugs (Fixed)
  • BUG-{ID}: {title}

## Known Bugs (Remaining)
  • {issue}

## Technical Debt
  • {item} — {impact}

## Configuration / Dependency Changes
  • {change}

## Performance Changes
  • {metric}: {before} → {after}

## Files Created
  (list only new files, max 30)

## Files Modified
  (list only key files, max 30)

## Next Milestone
  • {feature}

## Architecture Diagram (if changed)
  (ASCII diagram, max 30 lines)
────────────────────────────────────────
```

## Automatic Update

After completing any major task within a milestone, update the corresponding section of the current milestone summary. Do NOT wait until the end of the milestone to write the summary — accumulate it incrementally.

## When to Read What

| Scenario                | Read This                                                       |
| ----------------------- | --------------------------------------------------------------- |
| First time on project   | PROJECT_CONTEXT.json → PROJECT_MASTER.md → MILESTONE_SUMMARY.md |
| Resume work after break | MILESTONE_SUMMARY.md (last 2)                                   |
| Debug a known issue     | BUG_LOG.md                                                      |
| Understand a system     | docs/architecture/{system}.md                                   |
| Make a design decision  | docs/decisions/ADR-*.md                                         |
| Everything else         | Source code                                                     |
