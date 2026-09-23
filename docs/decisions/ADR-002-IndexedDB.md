# ADR-002: IndexedDB for Persistent Storage

## Decision

Use **IndexedDB** as the primary persistence layer, with localStorage for lightweight metadata.

## Reason

- Can store Blob data (images) — localStorage cannot
- Larger storage quota (typically 50%+ of disk)
- Async API doesn't block the main thread
- Structured data support via object stores
- Survives page refresh and browser restart

## Alternatives Considered

| Storage                      | Reason Rejected                               |
| ---------------------------- | --------------------------------------------- |
| **localStorage**             | 5MB limit, no Blob support, sync API          |
| **IndexedDB only**           | Async read for meta list adds latency         |
| **IndexedDB + localStorage** | ✅ Selected — fast meta access + blob storage |
| **Cloud storage**            | Requires backend, adds latency for MVP        |

## Consequences

- Two storage layers to maintain
- IndexedDB API requires Promise wrappers
- Schema versioning needed for upgrades
- User data stays on device (no cloud backup)

## Status

**Accepted** — Implemented in `src/utils/db.ts`
