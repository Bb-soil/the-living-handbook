# MCP connection

Public Streamable HTTP endpoint: https://the-living-handbook.fit-hake-0747.chatgpt.site/public-mcp

No sign-in, API key or provider credits are required. This route exposes exactly two read-only tools. It shares currentSnapshot and the D1 publication with the website; it is not an exported copy or proxy cache. A new publication is visible on the next call. Text already loaded into an agent's context is not automatically refreshed.

- get_article({mode: "outline" | "full", revision_id?: number, language?: "ru" | "en"})
- get_section({section_id: string, revision_id?: number, language?: "ru" | "en"})

Start with outline, then request sections using the returned revision_id to keep a consistent edition. Omit revision_id to read current; provide it for a published historical edition. Large full responses fall back to outline. Missing sections/revisions and unavailable English translations return explicit errors. Drafts, candidates, proposals, keys and private author operations are never tools. No model calls are made by reading.

## OpenCode

Merge this entry into your project's opencode.json without replacing unrelated settings:

```json
{"mcp":{"living-handbook":{"type":"remote","url":"https://the-living-handbook.fit-hake-0747.chatgpt.site/public-mcp","enabled":true,"oauth":false}}}
```

Run opencode mcp list in that project. Then ask the agent to call get_article with mode outline and get_section with section_id testing, using the returned revision_id.

## Other clients and local preview

Use the same URL with your client's remote Streamable HTTP configuration. Local preview: http://127.0.0.1:3891/public-mcp. Client configuration schemas differ; OpenCode uses mcp/type remote, not mcpServers/type http.

The reserved /mcp route remains the separate Sites OAuth/plugin integration. Its 401 must not be solved by sharing author cookies, provider keys or service tokens. The public route does not forward requests to protected APIs and exposes no arbitrary URL fetching.

## Reproduce checks

```sh
npm ci
npm run check
node scripts/public-mcp-test.mjs --url https://the-living-handbook.fit-hake-0747.chatgpt.site/public-mcp
```

On 2026-11-03 the deployed public route passed the official SDK initialize, tools/list and real calls to get_article/get_section. The testing section matched the public article exactly (revision 1, 4,342 characters). Installed OpenCode also reported connected with a dedicated project configuration. No model-mediated OpenCode call or paid provider call was made.

The local real-SQLite regression test additionally creates an unpublished candidate, confirms it is invisible, publishes it, verifies the next MCP call matches the new website snapshot and checks the old pinned revision. Production article content was not changed for this test. Anonymous admin access, unknown write tools and cross-origin requests are rejected.
