# Validation record — 2026-11-02

Performed in the clean repository candidate on Windows with Node.js 22.14.0:

- `npm ci`: completed from the pinned lockfile.
- `npm run check`: build, ESM artifact validation, official MCP protocol/content smoke, 19 SQLite-backed editing groups, 6 queue groups, locale assertions and translation cases passed.
- Added and ran a smoke assertion that a fork's `APP_ORIGIN` produces its own canonical MCP URLs.
- `npm audit --omit=dev`: zero reported production vulnerabilities at the time checked.

The full dependency installation reported four moderate findings in development tooling. No forced dependency upgrade was applied; review these separately before treating tooling as production infrastructure. Audit results are time-dependent, not a security guarantee.

The included GitHub Actions workflow has not run remotely. Automated provider responses are fixtures; checks do not spend an API key's credits. The live demo's real translation and earlier browser checks are historical evidence for that deployment, not a new browser run of this exact repository candidate.

Remaining verification: hosted external MCP/OAuth, repeated unattended schedule execution, D1 backup restoration, threshold calibration and independent English editorial review. See ROADMAP.md. The production Site and its database were not changed during repository preparation.
