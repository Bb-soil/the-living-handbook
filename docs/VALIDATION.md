# Validation record — 2026-11-02

Performed in the clean repository candidate on Windows with Node.js 22.14.0:

- `npm ci`: completed from the pinned lockfile.
- `npm run check`: build, ESM artifact validation, official MCP protocol/content smoke, 19 SQLite-backed editing groups, 6 queue groups, locale assertions and translation cases passed.
- Added and ran a smoke assertion that a fork's `APP_ORIGIN` produces its own canonical MCP URLs.
- `npm audit --omit=dev`: zero reported production vulnerabilities at the time checked.

The full dependency installation reported four moderate findings in development tooling. No forced dependency upgrade was applied; review these separately before treating tooling as production infrastructure. Audit results are time-dependent, not a security guarantee.

[GitHub Actions run #1](https://github.com/Bb-soil/the-living-handbook/actions/runs/41513088580) passed on 2026-11-02 for commit c3cdf8291bfec147b38d949bc050b161ff6cb435, using Ubuntu and Node.js 22. Both npm ci and npm run check succeeded. Automated provider responses are fixtures; checks do not spend an API key's credits. The live demo's real translation and earlier browser checks are historical evidence for that deployment, not a new browser run of this exact repository candidate.

Remaining verification: hosted external MCP/OAuth, repeated unattended schedule execution, D1 backup restoration, threshold calibration and independent English editorial review. See ROADMAP.md. The production Site and its database were not changed during repository preparation.

## 2026-11-03 — public external MCP

The official MCP SDK connected anonymously to https://the-living-handbook.fit-hake-0747.chatgpt.site/public-mcp, listed exactly get_article/get_section and read the testing section: revision 1, content_hash 62ac6dc2da2307898b01efa2ff72e0fa4d44d31e87f2e08ebb517758299b7e02, body 4,342 characters. Data matched /api/article. Unknown tool, missing section, anonymous admin, method and Origin checks passed. Installed OpenCode mcp list reported connected in an isolated project configuration, without changing global roles/models. No model-mediated tool call was performed.

Fresh npm ci and the full npm run check passed, including the new official-client real-SQLite publication/pinned-revision regression. Tests did not invoke paid providers or change production article content.
