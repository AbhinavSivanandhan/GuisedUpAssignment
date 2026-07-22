# Repository Governance

`Assignment.md` is the frozen original assessment contract and was not modified by this governance batch.

## Authority Hierarchy

Use this authority order:

1. `Assignment.md`
2. Current user-approved implementation prompt, where consistent with `Assignment.md`
3. `docs/TSD.md`
4. `docs/features/*.md`
5. `docs/architecture.md`
6. `docs/workspace.md`
7. Existing tests and code conventions

No document, implementation decision, test, convention, deadline, or convenience may weaken, bypass, reinterpret, or contradict `Assignment.md`.

## Conflict Handling

If requested work conflicts with `Assignment.md`, stop only the conflicting work and do not make the conflicting change. Preserve all user work and report the issue with this exact heading:

`CONTRACT VIOLATION REFUSAL`

The report must identify the relevant `Assignment.md` clause, state whether compliant work can continue, and request either a contract-compliant instruction or an explicit amendment that identifies the exact clause and exact replacement text.

## Roadmap Integrity

The roadmap must remain traceable to `Assignment.md`. It may organize work, but it may not add, remove, or weaken frozen requirements. Roadmap integrity means acceptance criteria preserve the assignment requirements, instant disqualifiers remain visible, the one full day / 8 hours constraint remains visible, the TSD-before-code sequence remains explicit, and US-00 through US-39 remain internally consistent.

Do not rewrite the roadmap for style. Modify it only to correct objective contradictions with `Assignment.md`, add missing traceability metadata, or add status and evidence fields without changing acceptance criteria.

## Evidence Requirements

No story may be marked complete without evidence. Evidence can include changed files, passing command output, rendered or inspected artifacts, API responses, screenshots, test results, or explicit documentation showing the requirement is satisfied. Unrun checks must be reported as unrun, and failing checks must be reported honestly.

## Documentation Synchronization

When implementation changes affect architecture, API contracts, schema, test strategy, AI usage, setup steps, or feature acceptance criteria, update the relevant tracked documentation in the same scoped batch if authorized. Documentation must not claim application code, migrations, tests, services, or deliverables exist before they are created and verified.

## Scope Control

Implementation agents must identify in-scope user stories before editing and implement only explicitly scoped work. Do not create Laravel, Expo, Python, SQL, Docker, dependency, test, CI, or generated assets unless the current prompt authorizes them and the work is consistent with `Assignment.md`.

## Change Reporting

Every completion report must list exact files changed, commands run, verification results, failing checks, conflicts, blockers, and deferred work. Agents must preserve user changes and avoid claiming unexecuted work succeeded.
