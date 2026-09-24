# WeSVG Studio — AI Agent Workflow Rules

## Mandatory Steps (Every Agent Must Follow)

```
STEP 0: Read CONTEXT_COMPRESSION_RULE.md
  → Understand context compression protocol

STEP 1: Read PROJECT_CONTEXT.json
  → Understand project status, version, current milestone

STEP 2: Read PROJECT_MASTER.md
  → Full project overview, completed modules, known issues

STEP 2.5: Read docs/reports/MILESTONE_SUMMARY.md (if exists)
  → Short-circuit: this replaces reading old chat history

STEP 3: Read current milestone report (docs/reports/M*.md)
  → Understand what was done and what's next

STEP 4: Read BUG_LOG.md
  → Check if your task relates to a known bug

STEP 5: Read relevant architecture documents
  → docs/architecture/*.md — only the system you're working on

STEP 6: Read source code (only if needed)
  → Never start with source code

STEP 7: Update MILESTONE_SUMMARY.md with your changes
  → After completing task, update the summary incrementally

STEP 8: Generate docs/logs/YYYY-MM-DD-task-name.md
  → Document what you did after completing the task
```

## Golden Rules

1. **DO NOT scan the entire repository** — read docs first
2. **DO NOT analyze source code before reading docs**
3. **DO update PROJECT_CONTEXT.json when completing modules**
4. **DO update BUG_LOG.md when fixing bugs**
5. **DO create ADR entries for major architectural decisions**
6. **DO generate development logs for every completed task**
7. **Source code is the LAST verification step, not the first**

## Repository Structure Priority

```
Priority 1: docs/              → Documentation (read first)
Priority 2: src/types/         → Data models
Priority 3: src/stores/        → State management
Priority 4: src/utils/         → Utilities
Priority 5: src/canvas/        → Canvas rendering
Priority 6: src/components/    → Vue components
Priority 7: src/editor/        → Code editor
Priority 8: src/pages/         → Page components
```

## When to Create ADRs

Create an Architecture Decision Record when:

- Adding a major dependency
- Choosing between competing technologies
- Making a design decision with significant impact
- Changing the data model fundamentally
- Adding a new storage layer

## Development Log Template

```markdown
# YYYY-MM-DD — Task Name

## Task

[Description of what was done]

## Files Changed

- path/to/file.ts — what changed
- path/to/file.vue — what changed

## Implementation Details

[Key decisions, trade-offs, approach]

## Potential Risks

[Any risks or edge cases to watch for]

## Next Recommended Step

[What to do next]
```
